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
        formats: [
          'markdown',
          {
            type: 'json',
            schema: PROFILE_SCHEMA,
            prompt: "Extract the LinkedIn profile information including the person's real name, current headline, about/summary, location, all work experience entries (title, company, duration, description), all education entries (school, degree, field, dates), and a list of skills. Use only data actually present on the page.",
          },
        ],
        waitFor: 2500,
      }),
    });
  } catch (e) {
    console.error('Firecrawl network error:', e);
    throw new Error('Network error contacting Firecrawl. Please try again.');
  }

  const raw = await res.text();
  let data: any = null;
  try { data = JSON.parse(raw); } catch {}

  if (!res.ok) {
    console.error('Firecrawl scrape failed:', res.status, raw.slice(0, 500));
    if (res.status === 402) throw new Error('Firecrawl credits are exhausted. Please top up the Firecrawl plan.');
    if (res.status === 401 || res.status === 403) throw new Error('Firecrawl rejected the request (auth/scope). Reconnect the Firecrawl integration.');
    if (res.status === 429) throw new Error('Firecrawl rate limit reached. Please wait a moment and try again.');
    throw new Error(data?.error || `LinkedIn appears to block scraping for this profile (status ${res.status}). Try a different public profile URL.`);
  }

  const payload = data?.data ?? data;
  const json = payload?.json || payload?.data?.json;
  const markdown = payload?.markdown || payload?.data?.markdown;

  if (json && json.name) {
    return {
      name: json.name || 'Profile',
      headline: json.headline || '',
      summary: json.summary || '',
      location: json.location || '',
      experience: Array.isArray(json.experience) ? json.experience : [],
      education: Array.isArray(json.education) ? json.education : [],
      skills: Array.isArray(json.skills) ? json.skills : [],
      profileUrl: url,
    };
  }

  // Fallback: ask Gemini to structure the markdown
  if (markdown && LOVABLE_API_KEY) {
    const ai = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: 'Extract a structured LinkedIn profile from the markdown. Return strict JSON matching: {name, headline, summary, location, experience:[{title,company,duration,description}], education:[{school,degree,field,year}], skills:[string]}. Use only what is in the source.' },
          { role: 'user', content: markdown.slice(0, 20000) },
        ],
        response_format: { type: 'json_object' },
      }),
    });
    if (ai.ok) {
      const aiData = await ai.json();
      try {
        const parsed = JSON.parse(aiData.choices[0].message.content);
        if (parsed?.name) return { ...parsed, profileUrl: url };
      } catch (e) {
        console.error('AI fallback parse failed:', e);
      }
    } else {
      console.error('AI fallback gateway error:', ai.status, await ai.text());
    }
  }

  throw new Error('Could not extract profile data. The profile may be private, deleted, or LinkedIn is blocking automated reads of it.');
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
