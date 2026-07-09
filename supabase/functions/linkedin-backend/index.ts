
const FIRECRAWL_API_KEY = Deno.env.get('FIRECRAWL_API_KEY');
const GROQ_API_KEY = Deno.env.get('GROQ_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
}

function linkedInHandle(url: string) {
  try {
    const parsed = new URL(url);
    const match = parsed.pathname.match(/\/in\/([^/?#]+)/i);
    return decodeURIComponent(match?.[1] || '').replace(/-/g, ' ').trim();
  } catch { return ''; }
}

function normalizeFirecrawlResults(data: any): any[] {
  const candidates = data?.data?.web || data?.web || data?.data || data?.results || [];
  return Array.isArray(candidates) ? candidates.filter((r) => r?.url || r?.title || r?.description) : [];
}

async function firecrawlSearch(query: string, limit = 8, scrape = false) {
  if (!FIRECRAWL_API_KEY) throw new Error('Firecrawl is not connected. Add FIRECRAWL_API_KEY to enable LinkedIn analysis.');
  const body: any = { query, limit };
  if (scrape) body.scrapeOptions = { formats: ['markdown'], onlyMainContent: true };
  const res = await fetch('https://api.firecrawl.dev/v2/search', {
    method: 'POST',
    headers: { Authorization: `Bearer ${FIRECRAWL_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const raw = await res.text();
  let data: any = null;
  try { data = JSON.parse(raw); } catch {}
  if (!res.ok) {
    if (res.status === 402) throw new Error('Firecrawl credits exhausted.');
    if (res.status === 401 || res.status === 403) throw new Error('Firecrawl credentials invalid.');
    if (res.status === 429) throw new Error('Firecrawl rate limit. Please wait and try again.');
    throw new Error(data?.error || `Firecrawl failed (${res.status}).`);
  }
  return normalizeFirecrawlResults(data);
}

async function callGroq(messages: any[], jsonMode = false): Promise<string> {
  if (!GROQ_API_KEY) throw new Error('GROQ_API_KEY not configured.');
  const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${GROQ_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'llama-3.3-70b-versatile',
      messages,
      max_tokens: 4096,
      ...(jsonMode ? { response_format: { type: 'json_object' } } : {}),
    }),
  });
  if (!res.ok) {
    const t = await res.text().catch(() => '');
    if (res.status === 429) throw new Error('Rate limit reached. Please try again in a moment.');
    throw new Error(`Groq error (${res.status}): ${t.slice(0, 200)}`);
  }
  const d = await res.json();
  return d?.choices?.[0]?.message?.content || '';
}

async function structureProfile(source: string, url: string, sourceType: 'markdown' | 'search') {
  const raw = await callGroq([
    { role: 'system', content: 'Extract a COMPLETE structured LinkedIn profile from the provided public source text. Return STRICT JSON: {"name":string,"headline":string,"summary":string,"location":string,"experience":[{"title":string,"company":string,"duration":string,"description":string}],"education":[{"school":string,"degree":string,"field":string,"year":string}],"skills":[string]}. Extract EVERY distinct job/role mentioned. Use ONLY information present. If a field is unknown use empty string or [].' },
    { role: 'user', content: `${sourceType === 'search' ? 'Public search snippets' : 'Public page markdown'} for ${url}:\n\n${source.slice(0, 12000)}` },
  ], true);
  const parsed = JSON.parse(raw || '{}');
  const fallbackName = linkedInHandle(url).replace(/\b\w/g, (m) => m.toUpperCase());
  if (!parsed?.name && !fallbackName) throw new Error('No profile name found');
  return {
    name: parsed.name || fallbackName,
    headline: parsed.headline || '',
    summary: parsed.summary || '',
    location: parsed.location || '',
    experience: Array.isArray(parsed.experience) ? parsed.experience : [],
    education: Array.isArray(parsed.education) ? parsed.education : [],
    skills: Array.isArray(parsed.skills) ? parsed.skills : [],
    profileUrl: url, sourceType,
  };
}

async function profileFromSearch(url: string) {
  const handle = linkedInHandle(url);
  const readable = handle || url.replace(/^https?:\/\//, '');
  const queries = [
    `"${url}"`,
    `site:linkedin.com/in "${readable}" experience`,
    `"${readable}" linkedin experience positions career history`,
    `"${readable}" linkedin education`,
    `"${readable}" resume OR CV`,
  ];
  const results = (await Promise.all(queries.map((q) => firecrawlSearch(q, 5, true).catch(() => [])))).flat();
  const unique = Array.from(new Map(results.map((r) => [r.url || `${r.title}-${r.description}`, r])).values()).slice(0, 15);
  if (!unique.length) throw new Error('No public data found for this LinkedIn profile. Try a more public profile URL.');
  const source = unique.map((r, i) => [
    `Result ${i + 1}`, `Title: ${r.title || ''}`, `URL: ${r.url || ''}`,
    `Description: ${r.description || r.snippet || ''}`,
    r.markdown ? `Content: ${String(r.markdown).slice(0, 2000)}` : '',
  ].filter(Boolean).join('\n')).join('\n\n');
  return structureProfile(source, url, 'search');
}

async function scrapeLinkedIn(url: string) {
  if (!FIRECRAWL_API_KEY) throw new Error('Add FIRECRAWL_API_KEY to enable LinkedIn analysis.');
  const ac = new AbortController();
  const to = setTimeout(() => ac.abort(), 45_000);
  let res: Response;
  try {
    res = await fetch('https://api.firecrawl.dev/v2/scrape', {
      method: 'POST',
      headers: { Authorization: `Bearer ${FIRECRAWL_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ url, onlyMainContent: true, formats: ['markdown'], waitFor: 3000 }),
      signal: ac.signal,
    });
  } catch (e) {
    clearTimeout(to);
    throw new Error('Firecrawl timed out. Try again or use a different public profile URL.');
  } finally { clearTimeout(to); }

  const raw = await res.text();
  let data: any = null;
  try { data = JSON.parse(raw); } catch {}
  if (!res.ok) {
    const unsupported = res.status === 403 && /do not support this site|unsupported|blocked/i.test(raw);
    if (unsupported) return profileFromSearch(url);
    if (res.status === 402) throw new Error('Firecrawl credits exhausted.');
    if (res.status === 429) throw new Error('Firecrawl rate limit. Please wait and try again.');
    throw new Error(data?.error || `LinkedIn blocked scraping (${res.status}). Try a different public profile URL.`);
  }
  const payload = data?.data ?? data;
  const markdown: string = payload?.markdown || payload?.data?.markdown || '';
  if (!markdown || markdown.length < 200) return profileFromSearch(url);
  try { return await structureProfile(markdown, url, 'markdown'); }
  catch (e) { console.error('AI parse failed:', e); return profileFromSearch(url); }
}

async function generateCareerInsights(profile: any) {
  if (!GROQ_API_KEY) return `Career analysis for ${profile.name} is unavailable (GROQ_API_KEY not configured).`;
  try {
    return await callGroq([
      { role: 'system', content: 'You are a world-class executive career coach. Produce a deep, specific, evidence-based career analysis. Use clear markdown with sections: # Career Snapshot, ## Career Trajectory, ## Core Strengths, ## Growth Areas, ## Suggested Next Roles (3-5), ## Best-Fit Industries, ## Skill Gap Analysis, ## Profile Optimization, ## Networking Moves, ## Long-Term Vision. Be specific, reference actual details from the profile.' },
      { role: 'user', content: `Analyze this LinkedIn profile:\n${JSON.stringify(profile, null, 2)}` },
    ]);
  } catch (e) {
    return `Analysis unavailable: ${(e as Error).message}`;
  }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });
  try {
    const { action, linkedInUrl, profileData } = await req.json();
    if (action === 'analyze_profile') {
      if (!linkedInUrl || !String(linkedInUrl).includes('linkedin.com')) return jsonResponse({ error: 'Valid LinkedIn URL required' }, 400);
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
    return jsonResponse({ error: (error as Error).message || 'Failed to analyze profile' });
  }
});
