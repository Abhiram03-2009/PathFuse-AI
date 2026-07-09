
const FIRECRAWL_API_KEY = Deno.env.get('FIRECRAWL_API_KEY');
const GROQ_API_KEY = Deno.env.get('GROQ_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

function analyzeResume(text: string) {
  const t = (text || '').toLowerCase();
  const skillSet = [
    'javascript','typescript','python','java','c++','c#','sql','react','node','aws','docker','kubernetes',
    'git','html','css','swift','kotlin','php','ruby','go','rust','project management','agile','scrum',
    'leadership','data analysis','machine learning','ai','devops','marketing','sales','finance','accounting',
    'design','figma','tableau','excel','salesforce','hubspot','linux','azure','gcp',
  ];
  const skills = skillSet.filter((s) => t.includes(s));
  const yrs = t.match(/(\d+)\+?\s*years?\s*(of)?\s*experience/);
  let seniority: 'student'|'entry'|'mid'|'senior' = 'entry';
  if (yrs) { const n = parseInt(yrs[1]); if (n >= 8) seniority = 'senior'; else if (n >= 3) seniority = 'mid'; }
  else if (/intern|student|university|college|high school/.test(t)) seniority = 'student';
  return { skills, seniority };
}

async function firecrawlSearch(query: string, signal: AbortSignal) {
  const res = await fetch('https://api.firecrawl.dev/v2/search', {
    method: 'POST',
    headers: { Authorization: `Bearer ${FIRECRAWL_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ query, limit: 10, tbs: 'qdr:w' }),
    signal,
  });
  if (!res.ok) { console.error('Firecrawl search failed', res.status); return []; }
  const data = await res.json();
  const results: any[] = data?.data?.web || data?.web || data?.data || [];
  return results.filter((r) => r?.url);
}

async function gatherListings(industry: string, location: string, skills: string[]) {
  if (!FIRECRAWL_API_KEY) throw new Error('Firecrawl not configured');
  const top = skills.slice(0, 4);
  const queries = [
    `${industry} jobs in ${location} ${top.slice(0, 2).join(' ')} site:linkedin.com/jobs OR site:indeed.com OR site:wellfound.com`,
    `${top.slice(0, 3).join(' ')} ${industry} hiring ${location}`,
    `${industry} roles ${location} ${top[0] || ''} careers`,
  ];
  const ac = new AbortController();
  const t = setTimeout(() => ac.abort(), 20_000);
  try {
    const sets = await Promise.all(queries.map((q) => firecrawlSearch(q, ac.signal).catch(() => [])));
    const all = sets.flat();
    const seen = new Set<string>();
    return all.filter((r) => { if (!r.url || seen.has(r.url)) return false; seen.add(r.url); return true; });
  } finally { clearTimeout(t); }
}

async function extractJobs(results: any[], industry: string, location: string) {
  if (!GROQ_API_KEY || !results.length) {
    return results.slice(0, 12).map((r) => ({
      title: r.title || 'Job opening',
      company: (() => { try { return new URL(r.url).hostname.replace('www.', '').split('.')[0]; } catch { return 'Company'; } })(),
      location, salary: 'See listing',
      description: (r.description || '').slice(0, 240),
      jobUrl: r.url, postedDate: 'Recent',
    }));
  }
  const condensed = results.slice(0, 18).map((r) => ({ url: r.url, title: r.title, description: (r.description || '').slice(0, 400) }));
  const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${GROQ_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: `Extract real ${industry} job openings in ${location} from these search results. Return JSON {"jobs":[{"title":"","company":"","location":"","salary":"","description":"","jobUrl":"","postedDate":""}]}. Use ONLY information present. Use the URL as jobUrl. If salary not listed use "Not listed". Output up to 12 matches.` },
        { role: 'user', content: JSON.stringify(condensed) },
      ],
      response_format: { type: 'json_object' },
      max_tokens: 2048,
    }),
  });
  if (!res.ok) return [];
  const d = await res.json();
  try {
    const parsed = JSON.parse(d.choices[0].message.content);
    return Array.isArray(parsed.jobs) ? parsed.jobs : [];
  } catch { return []; }
}

function scoreJob(job: any, analysis: { skills: string[]; seniority: string }, requestedIndustry: string, requestedLocation: string) {
  const text = `${job.title} ${job.description}`.toLowerCase();
  const matched = analysis.skills.filter((s) => text.includes(s));
  const skillScore = analysis.skills.length > 0 ? (matched.length / analysis.skills.length) * 55 : 25;
  let levelScore = 20;
  const jobSenior = /senior|sr\.|lead|principal|staff|architect/.test(text);
  const jobMid = /\bmid\b|intermediate|\b3\+|\b4\+|\b5\+ years/.test(text);
  const jobEntry = /entry|junior|graduate/.test(text);
  const jobIntern = /intern|internship/.test(text);
  if (analysis.seniority === 'senior' && jobSenior) levelScore = 30;
  else if (analysis.seniority === 'mid' && (jobMid || jobEntry)) levelScore = 28;
  else if (analysis.seniority === 'entry' && jobEntry) levelScore = 28;
  else if (analysis.seniority === 'student' && jobIntern) levelScore = 30;
  else if (analysis.seniority === 'student' && jobSenior) levelScore = 4;
  const locStr = (job.location || '').toLowerCase();
  const locReq = requestedLocation.toLowerCase();
  const locScore = locStr.includes(locReq) || locReq === 'remote' || /remote/.test(locStr) ? 10 : 0;
  const indScore = text.includes(requestedIndustry.toLowerCase()) ? 5 : 0;
  return Math.max(15, Math.min(98, Math.round(skillScore + levelScore + locScore + indScore + 5)));
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });
  try {
    const { skills, location, industry, resumeText } = await req.json();
    if (!location || !industry) {
      return new Response(JSON.stringify({ error: 'Location and industry are required.' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    const analysis = analyzeResume(resumeText || '');
    const combinedSkills = Array.from(new Set([...(skills || []), ...analysis.skills]));
    const results = await gatherListings(industry, location, combinedSkills);
    if (!results.length) {
      return new Response(JSON.stringify({ jobs: [], insights: { dataSource: 'live', message: 'No fresh listings found. Try broader skills or another location.' } }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    const rawJobs = await extractJobs(results, industry, location);
    const scored = rawJobs.map((j: any) => ({
      title: j.title || 'Position', company: j.company || 'Company', location: j.location || location,
      salary: j.salary || 'Not listed', description: (j.description || '').slice(0, 280),
      jobUrl: j.jobUrl || j.url, postedDate: j.postedDate || 'Recent',
      matchPercentage: scoreJob(j, analysis, industry, location),
      requirements: [], benefits: [],
    })).sort((a: any, b: any) => b.matchPercentage - a.matchPercentage);
    return new Response(JSON.stringify({ jobs: scored, insights: { dataSource: 'live', count: scored.length } }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('job-matcher error:', error);
    return new Response(JSON.stringify({ error: (error as Error).message || 'Failed' }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
