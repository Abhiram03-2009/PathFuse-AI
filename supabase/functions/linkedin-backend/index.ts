// LinkedIn profile analyzer. Firecrawl no longer supports direct LinkedIn
// scraping for many profiles, so this uses Firecrawl search snippets as a
// reliable fallback and structures the real public data with Lovable AI.
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';

const FIRECRAWL_API_KEY = Deno.env.get('FIRECRAWL_API_KEY');
const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

function linkedInHandle(url: string) {
  try {
    const parsed = new URL(url);
    const match = parsed.pathname.match(/\/in\/([^/?#]+)/i);
    return decodeURIComponent(match?.[1] || '').replace(/-/g, ' ').trim();
  } catch {
    return '';
  }
}

function normalizeFirecrawlResults(data: any): any[] {
  const candidates = data?.data?.web || data?.web || data?.data || data?.results || [];
  return Array.isArray(candidates) ? candidates.filter((r) => r?.url || r?.title || r?.description) : [];
}

async function firecrawlSearch(query: string, limit = 8, scrape = false) {
  if (!FIRECRAWL_API_KEY) {
    throw new Error('Firecrawl is not connected. Connect the Firecrawl integration to enable LinkedIn analysis.');
  }
  const body: any = { query, limit };
  if (scrape) body.scrapeOptions = { formats: ['markdown'], onlyMainContent: true };
  const res = await fetch('https://api.firecrawl.dev/v2/search', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${FIRECRAWL_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  const raw = await res.text();
  let data: any = null;
  try { data = JSON.parse(raw); } catch {}
  if (!res.ok) {
    console.error('Firecrawl search failed:', res.status, raw.slice(0, 500));
    if (res.status === 402) throw new Error('Firecrawl credits are exhausted. Please top up the Firecrawl plan.');
    if (res.status === 401 || res.status === 403) throw new Error('Firecrawl credentials need to be reconnected.');
    if (res.status === 429) throw new Error('Firecrawl rate limit reached. Please wait a moment and try again.');
    throw new Error(data?.error || `Firecrawl search failed (${res.status}).`);
  }
  return normalizeFirecrawlResults(data);
}

async function structureProfile(source: string, url: string, sourceType: 'markdown' | 'search') {
  if (!LOVABLE_API_KEY) {
    throw new Error('AI gateway not configured. Cannot structure the LinkedIn profile.');
  }

  const ai = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
    method: 'POST',
    headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'google/gemini-3-flash-preview',
      messages: [
        { role: 'system', content: 'Extract a COMPLETE structured LinkedIn profile from the provided public source text. Return STRICT JSON: {"name":string,"headline":string,"summary":string,"location":string,"experience":[{"title":string,"company":string,"duration":string,"description":string}],"education":[{"school":string,"degree":string,"field":string,"year":string}],"skills":[string]}. CRITICAL: Extract EVERY distinct job/role mentioned across ALL sources — do not deduplicate aggressively, do not stop at 2-3. If multiple sources mention the same person at different companies or roles, include each as a separate experience entry. Aim to capture the full career history visible in the snippets (often 5-15+ roles). Use ONLY information present in the source. If a field is unknown use an empty string or []. Do not invent private details.' },
        { role: 'user', content: `${sourceType === 'search' ? 'Public search snippets' : 'Public page markdown'} for ${url}:\n\n${source.slice(0, 24000)}` },
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
  const content = aiData?.choices?.[0]?.message?.content || '{}';
  const parsed = JSON.parse(content);
  const fallbackName = linkedInHandle(url).replace(/\b\w/g, (m) => m.toUpperCase());
  if (!parsed?.name && !fallbackName) throw new Error('No profile name found');
  return {
    name: parsed.name || fallbackName,
    headline: parsed.headline || (sourceType === 'search' ? 'Public LinkedIn profile' : ''),
    summary: parsed.summary || '',
    location: parsed.location || '',
    experience: Array.isArray(parsed.experience) ? parsed.experience : [],
    education: Array.isArray(parsed.education) ? parsed.education : [],
    skills: Array.isArray(parsed.skills) ? parsed.skills : [],
    profileUrl: url,
    sourceType,
  };
}

async function profileFromSearch(url: string) {
  const handle = linkedInHandle(url);
  const readable = handle || url.replace(/^https?:\/\//, '');
  // Deep search: scrape full markdown from top results so aggregator/mirror
  // pages that list the full work history get captured (Firecrawl can't hit
  // linkedin.com directly but Google often surfaces cached/mirror pages).
  const deepQueries = [
    `"${url}"`,
    `site:linkedin.com/in "${readable}" experience`,
    `"${readable}" linkedin experience positions career history`,
  ];
  const snippetQueries = [
    `"${readable}" linkedin education`,
    `"${readable}" linkedin skills`,
    `"${readable}" resume OR CV`,
  ];
  const [deep, snippets] = await Promise.all([
    Promise.all(deepQueries.map((q) => firecrawlSearch(q, 5, true).catch(() => []))),
    Promise.all(snippetQueries.map((q) => firecrawlSearch(q, 5, false).catch(() => []))),
  ]);
  const results = [...deep.flat(), ...snippets.flat()];
  const unique = Array.from(new Map(results.map((r) => [r.url || `${r.title}-${r.description}`, r])).values()).slice(0, 20);
  if (!unique.length) {
    throw new Error('LinkedIn blocked direct scraping and no public search snippets were found. Try a more public profile URL.');
  }
  const source = unique.map((r, i) => [
    `Result ${i + 1}`,
    `Title: ${r.title || ''}`,
    `URL: ${r.url || ''}`,
    `Description: ${r.description || r.snippet || ''}`,
    r.markdown ? `Content: ${String(r.markdown).slice(0, 4000)}` : '',
  ].filter(Boolean).join('\n')).join('\n\n');
  return structureProfile(source, url, 'search');
}

async function scrapeLinkedIn(url: string) {
  if (!FIRECRAWL_API_KEY) throw new Error('Firecrawl is not connected. Connect the Firecrawl integration to enable LinkedIn analysis.');

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
    const unsupported = res.status === 403 && /do not support this site|unsupported|blocked/i.test(raw);
    if (unsupported) return profileFromSearch(url);
    if (res.status === 402) throw new Error('Firecrawl credits are exhausted. Please top up the Firecrawl plan.');
    if (res.status === 401 || res.status === 403) throw new Error('Firecrawl rejected the request. Reconnect the Firecrawl integration.');
    if (res.status === 429) throw new Error('Firecrawl rate limit reached. Please wait a moment and try again.');
    throw new Error(data?.error || `LinkedIn appears to block scraping for this profile (status ${res.status}). Try a different public profile URL.`);
  }

  const payload = data?.data ?? data;
  const markdown: string = payload?.markdown || payload?.data?.markdown || '';

  if (!markdown || markdown.length < 200) {
    return profileFromSearch(url);
  }

  try {
    return await structureProfile(markdown, url, 'markdown');
  } catch (e) {
    console.error('AI parse failed:', e);
    return profileFromSearch(url);
  }
}

async function generateCareerInsights(profile: any) {
  if (!LOVABLE_API_KEY) return `Career analysis for ${profile.name} is unavailable (AI not configured).`;
  const system = `You are a world-class executive career coach and talent strategist. Produce a deep, specific, evidence-based career analysis grounded ONLY in the provided profile. Use clear markdown with these exact section headings and order:

# Career Snapshot
2-3 sentence positioning statement. Identify current seniority level, domain, and unique angle.

## Career Trajectory & Progression
Walk through each role chronologically. For every experience entry, comment on scope change, promotion velocity, gaps, and pattern (specialist vs generalist, IC vs management, industry switches).

## Core Strengths (Evidence-Based)
Bullet 5-7 strengths. Each bullet: **Strength** — short justification citing a specific role, company, or skill from the profile.

## Growth Areas & Risks
Bullet 4-6 honest gaps (missing skills, short tenures, narrow domain, weak headline, missing summary, etc.) with how to address each.

## Suggested Next Roles (3-5)
Concrete role titles + target company archetype + why it fits + likely salary band (USD, regional if location known) + readiness (Ready now / 6-12 months / 1-2 yrs).

## Best-Fit Industries (Top 3)
Industry — rationale tied to the user's skills/experience — example companies hiring this profile.

## Skill Gap Analysis
Table-style markdown list: skills the next-level role demands that are missing, ranked by impact. Suggest a concrete learning resource type for each.

## Profile Optimization Playbook
Bullet 6+ specific rewrites: improved headline (give 2 options), summary hook, top-3 experience bullet rewrites using metrics, keyword additions for recruiter SEO, recommended skills to add/remove.

## Personal Brand & Networking Moves
3-5 tactical actions for the next 30/60/90 days (content to post, people to follow, communities to join, conferences/certs worth pursuing).

## Long-Term Vision (3-5 yrs)
Map a 3-5 year arc with two scenarios (e.g., management track vs deep IC) and the milestones for each.

Rules: Be specific, never generic. Reference actual companies/titles/skills from the profile. If a field is empty, say so and recommend filling it. Never invent facts.`;
  const res = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
    method: 'POST',
    headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'google/gemini-2.5-flash',
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: `Analyze this LinkedIn profile in depth:\n${JSON.stringify(profile, null, 2)}` },
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
        return jsonResponse({ error: 'Valid LinkedIn URL required' }, 400);
      }
      const profile = await scrapeLinkedIn(linkedInUrl);
      return jsonResponse({ profile });
    }

    if (action === 'generate_resume') {
      if (!profileData) return jsonResponse({ error: 'Profile data required' }, 400);
      const exp = (profileData.experience || []).map((e: any) => `${e.title} at ${e.company} (${e.duration})\n${e.description || ''}`).join('\n\n');
      const edu = (profileData.education || []).map((e: any) => `${e.degree} in ${e.field || ''} - ${e.school} (${e.year || ''})`).join('\n');
      const resumeText = `${profileData.name}\n${profileData.headline}\n\nSUMMARY\n${profileData.summary || ''}\n\nEXPERIENCE\n${exp}\n\nEDUCATION\n${edu}\n\nSKILLS\n${(profileData.skills || []).join(' • ')}`;
      return jsonResponse({ resumeText });
    }

    if (action === 'career_insights') {
      if (!profileData) return jsonResponse({ error: 'Profile data required' }, 400);
      const analysis = await generateCareerInsights(profileData);
      return jsonResponse({ analysis });
    }

    return jsonResponse({ error: 'Invalid action' }, 400);
  } catch (error) {
    console.error('linkedin-backend error:', error);
    // Return 200 with an error field so the client can surface the real message
    // instead of the generic "non-2xx" from supabase.functions.invoke.
    return jsonResponse({ error: (error as Error).message || 'Failed to analyze profile' });
  }
});
