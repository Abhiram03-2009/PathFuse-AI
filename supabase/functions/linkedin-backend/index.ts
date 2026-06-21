// LinkedIn profile analyzer - scrapes public LinkedIn profiles via Firecrawl
// and structures them via Lovable AI Gateway. No mock data.
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const FIRECRAWL_API_KEY = Deno.env.get('FIRECRAWL_API_KEY');
const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const PROFILE_SCHEMA = {
  type: 'object',
  properties: {
    name: { type: 'string' },
    headline: { type: 'string' },
    summary: { type: 'string' },
    location: { type: 'string' },
    experience: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          title: { type: 'string' },
          company: { type: 'string' },
          duration: { type: 'string' },
          description: { type: 'string' },
        },
      },
    },
    education: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          school: { type: 'string' },
          degree: { type: 'string' },
          field: { type: 'string' },
          year: { type: 'string' },
        },
      },
    },
    skills: { type: 'array', items: { type: 'string' } },
  },
  required: ['name', 'headline'],
};

async function scrapeLinkedIn(url: string) {
  if (!FIRECRAWL_API_KEY) {
    throw new Error('Firecrawl is not connected. Connect the Firecrawl integration to enable LinkedIn scraping.');
  }

  // Use markdown-only scrape — LinkedIn frequently blocks Firecrawl's
  // structured JSON extraction, while markdown succeeds far more often.
  // We then ask Gemini to convert the markdown into the structured profile.
  const ac = new AbortController();
  const to = setTimeout(() => ac.abort(), 45_000);

  let res: Response;
  try {
    res = await fetch('https://api.firecrawl.dev/v2/scrape', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${FIRECRAWL_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        url,
        onlyMainContent: true,
        formats: ['markdown'],
        waitFor: 3000,
      }),
      signal: ac.signal,
    });
  } catch (e) {
    clearTimeout(to);
    console.error('Firecrawl network/timeout error:', e);
    throw new Error('Firecrawl timed out reading this LinkedIn profile. Try again or use a different public URL.');
  } finally {
    clearTimeout(to);
  }

  const raw = await res.text();
  let data: any = null;
  try { data = JSON.parse(raw); } catch {}

  if (!res.ok) {
    console.error('Firecrawl scrape failed:', res.status, raw.slice(0, 500));
    if (res.status === 402) throw new Error('Firecrawl credits are exhausted. Please top up the Firecrawl plan.');
    if (res.status === 401 || res.status === 403) throw new Error('Firecrawl rejected the request. Reconnect the Firecrawl integration.');
    if (res.status === 429) throw new Error('Firecrawl rate limit reached. Please wait a moment and try again.');
    throw new Error(data?.error || `LinkedIn appears to block scraping for this profile (status ${res.status}). Try a different public profile URL.`);
  }

  const payload = data?.data ?? data;
  const markdown: string = payload?.markdown || payload?.data?.markdown || '';

  if (!markdown || markdown.length < 200) {
    throw new Error('LinkedIn returned an empty/blocked page for this URL. Make sure the profile is public.');
  }

  if (!LOVABLE_API_KEY) {
    throw new Error('AI gateway not configured. Cannot structure the LinkedIn profile.');
  }

  const ai = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
    method: 'POST',
    headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'google/gemini-2.5-flash',
      messages: [
        { role: 'system', content: 'Extract a structured LinkedIn profile from the markdown. Return STRICT JSON: {"name":string,"headline":string,"summary":string,"location":string,"experience":[{"title","company","duration","description"}],"education":[{"school","degree","field","year"}],"skills":[string]}. Use ONLY information present in the source. If a field is unknown use an empty string or [].' },
        { role: 'user', content: markdown.slice(0, 24000) },
      ],
      response_format: { type: 'json_object' },
    }),
  });

  if (!ai.ok) {
    const errTxt = await ai.text().catch(() => '');
    console.error('AI gateway error:', ai.status, errTxt.slice(0, 300));
    if (ai.status === 429) throw new Error('AI rate limit reached. Please try again in a moment.');
    if (ai.status === 402) throw new Error('AI credits exhausted. Please add credits in workspace settings.');
    throw new Error(`AI could not structure the profile (status ${ai.status}).`);
  }

  const aiData = await ai.json();
  try {
    const parsed = JSON.parse(aiData.choices[0].message.content);
    if (!parsed?.name) throw new Error('no name');
    return {
      name: parsed.name,
      headline: parsed.headline || '',
      summary: parsed.summary || '',
      location: parsed.location || '',
      experience: Array.isArray(parsed.experience) ? parsed.experience : [],
      education: Array.isArray(parsed.education) ? parsed.education : [],
      skills: Array.isArray(parsed.skills) ? parsed.skills : [],
      profileUrl: url,
    };
  } catch (e) {
    console.error('AI parse failed:', e);
    throw new Error('Could not extract structured data from this profile. The page may be private or partially blocked.');
  }
}

async function generateCareerInsights(profile: any) {
  if (!LOVABLE_API_KEY) return `Career analysis for ${profile.name} is unavailable (AI not configured).`;
  const res = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
    method: 'POST',
    headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'google/gemini-2.5-flash',
      messages: [
        { role: 'system', content: 'You are an expert career coach. Provide a comprehensive, specific career analysis: strengths, growth areas, suggested next roles, profile improvement tips, and 3 industries that fit best. Use markdown headings.' },
        { role: 'user', content: `Analyze this LinkedIn profile:\n${JSON.stringify(profile, null, 2)}` },
      ],
    }),
  });
  if (!res.ok) return `Analysis unavailable (AI gateway ${res.status}).`;
  const d = await res.json();
  return d?.choices?.[0]?.message?.content ?? 'No analysis generated.';
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });
  try {
    const { action, linkedInUrl, profileData } = await req.json();

    if (action === 'analyze_profile') {
      if (!linkedInUrl || !String(linkedInUrl).includes('linkedin.com')) {
        return new Response(JSON.stringify({ error: 'Valid LinkedIn URL required' }), {
          status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      const profile = await scrapeLinkedIn(linkedInUrl);
      return new Response(JSON.stringify({ profile }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (action === 'generate_resume') {
      if (!profileData) return new Response(JSON.stringify({ error: 'Profile data required' }), { status: 400, headers: corsHeaders });
      const exp = (profileData.experience || []).map((e: any) => `${e.title} at ${e.company} (${e.duration})\n${e.description || ''}`).join('\n\n');
      const edu = (profileData.education || []).map((e: any) => `${e.degree} in ${e.field || ''} - ${e.school} (${e.year || ''})`).join('\n');
      const resumeText = `${profileData.name}\n${profileData.headline}\n\nSUMMARY\n${profileData.summary || ''}\n\nEXPERIENCE\n${exp}\n\nEDUCATION\n${edu}\n\nSKILLS\n${(profileData.skills || []).join(' • ')}`;
      return new Response(JSON.stringify({ resumeText }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    if (action === 'career_insights') {
      if (!profileData) return new Response(JSON.stringify({ error: 'Profile data required' }), { status: 400, headers: corsHeaders });
      const analysis = await generateCareerInsights(profileData);
      return new Response(JSON.stringify({ analysis }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    return new Response(JSON.stringify({ error: 'Invalid action' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  } catch (error) {
    console.error('linkedin-backend error:', error);
    return new Response(JSON.stringify({ error: (error as Error).message || 'Failed' }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
