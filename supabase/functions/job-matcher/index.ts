// Real-time job matcher: scrapes live job listings via Firecrawl + ranks by AI.
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const FIRECRAWL_API_KEY = Deno.env.get('FIRECRAWL_API_KEY');
const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const JOBS_SCHEMA = {
  type: 'object',
  properties: {
    jobs: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          title: { type: 'string' },
          company: { type: 'string' },
          location: { type: 'string' },
          salary: { type: 'string' },
          description: { type: 'string' },
          jobUrl: { type: 'string' },
          postedDate: { type: 'string' },
        },
        required: ['title', 'company'],
      },
    },
  },
  required: ['jobs'],
};

function analyzeResume(text: string) {
  const t = (text || '').toLowerCase();
  const skillSet = ['javascript','typescript','python','java','c++','c#','sql','react','node','aws','docker','kubernetes','git','html','css','swift','kotlin','php','ruby','go','rust','project management','agile','scrum','leadership','data analysis','machine learning','ai','devops','marketing','sales','finance','accounting','design','figma','tableau'];
  const skills = skillSet.filter(s => t.includes(s));
  const yrs = t.match(/(\d+)\+?\s*years?\s*(of)?\s*experience/);
  let seniority: 'student'|'entry'|'mid'|'senior' = 'entry';
  if (yrs) {
    const n = parseInt(yrs[1]);
    if (n >= 8) seniority = 'senior';
    else if (n >= 3) seniority = 'mid';
  } else if (/intern|student|university|college|high school/.test(t)) seniority = 'student';
  return { skills, seniority };
}

async function searchJobs(industry: string, location: string, skills: string[]) {
  if (!FIRECRAWL_API_KEY) throw new Error('Firecrawl not configured');

  const query = `${industry} ${skills.slice(0, 3).join(' ')} jobs in ${location}`;
  const res = await fetch('https://api.firecrawl.dev/v2/search', {
    method: 'POST',
    headers: { Authorization: `Bearer ${FIRECRAWL_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      query,
      limit: 15,
      tbs: 'qdr:w', // past week → fresh real-time listings
      scrapeOptions: {
        formats: ['markdown'],
        onlyMainContent: true,
      },
    }),
  });

  const data = await res.json();
  if (!res.ok) {
    console.error('Firecrawl search failed:', res.status, data);
    throw new Error(data?.error || `Firecrawl ${res.status}`);
  }

  // Normalize Firecrawl v2 response shape
  const results: any[] = data?.data?.web || data?.web || data?.data || [];
  return results.filter((r: any) => r?.url);
}

async function extractJobsFromResults(results: any[], industry: string, location: string) {
  if (!LOVABLE_API_KEY) {
    // Fallback: surface raw results
    return results.slice(0, 12).map((r: any) => ({
      title: r.title || 'Job opening',
      company: (() => { try { return new URL(r.url).hostname.replace('www.', '').split('.')[0]; } catch { return 'Company'; } })(),
      location,
      salary: 'See listing',
      description: (r.description || '').slice(0, 240),
      jobUrl: r.url,
      postedDate: 'Recent',
    }));
  }

  const condensed = results.slice(0, 12).map((r: any) => ({
    url: r.url,
    title: r.title,
    description: r.description,
    snippet: (r.markdown || '').slice(0, 1500),
  }));

  const res = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
    method: 'POST',
    headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'google/gemini-2.5-flash',
      messages: [
        { role: 'system', content: `Extract real job openings from these scraped ${industry} search results in ${location}. Return strict JSON: {"jobs":[{"title","company","location","salary","description","jobUrl","postedDate"}]}. Use ONLY information actually present in the snippets. Use the result URL as jobUrl. If salary is not listed, use "Not listed". Output up to 12 jobs.` },
        { role: 'user', content: JSON.stringify(condensed) },
      ],
      response_format: { type: 'json_object' },
    }),
  });

  if (!res.ok) throw new Error(`AI extraction ${res.status}`);
  const d = await res.json();
  try {
    const parsed = JSON.parse(d.choices[0].message.content);
    return Array.isArray(parsed.jobs) ? parsed.jobs : [];
  } catch {
    return [];
  }
}

function scoreJob(job: any, analysis: { skills: string[]; seniority: string }) {
  const text = `${job.title} ${job.description}`.toLowerCase();
  const matched = analysis.skills.filter(s => text.includes(s));
  const skillScore = analysis.skills.length > 0 ? (matched.length / analysis.skills.length) * 60 : 30;
  let levelScore = 25;
  const jobSenior = /senior|sr\.|lead|principal|staff|architect/.test(text);
  const jobMid = /\bmid\b|intermediate|\b3\+|\b4\+|\b5\+ years/.test(text);
  const jobEntry = /entry|junior|graduate/.test(text);
  const jobIntern = /intern|internship/.test(text);
  if (analysis.seniority === 'senior' && jobSenior) levelScore = 35;
  else if (analysis.seniority === 'mid' && (jobMid || jobEntry)) levelScore = 32;
  else if (analysis.seniority === 'entry' && jobEntry) levelScore = 32;
  else if (analysis.seniority === 'student' && jobIntern) levelScore = 35;
  else if (analysis.seniority === 'student' && jobSenior) levelScore = 5;
  return Math.max(15, Math.min(98, Math.round(skillScore + levelScore + 5)));
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });
  try {
    const { skills, location, industry, resumeText } = await req.json();
    if (!location || !industry) {
      return new Response(JSON.stringify({ error: 'Location and industry are required.' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const analysis = analyzeResume(resumeText || '');
    const combinedSkills = [...new Set([...(skills || []), ...analysis.skills])];

    const results = await searchJobs(industry, location, combinedSkills);
    if (!results.length) {
      return new Response(JSON.stringify({ jobs: [], insights: { dataSource: 'live', message: 'No fresh listings found.' } }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const rawJobs = await extractJobsFromResults(results, industry, location);
    const scored = rawJobs.map((j: any) => ({
      title: j.title || 'Position',
      company: j.company || 'Company',
      location: j.location || location,
      salary: j.salary || 'Not listed',
      description: (j.description || '').slice(0, 280),
      jobUrl: j.jobUrl || j.url,
      postedDate: j.postedDate || 'Recent',
      matchPercentage: scoreJob(j, analysis),
      requirements: [],
      benefits: [],
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
