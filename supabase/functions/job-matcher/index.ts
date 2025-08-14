import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const JSEARCH_API_KEY = Deno.env.get('JSEARCH_API_KEY') || '***REMOVED-RAPIDAPI-KEY***';
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// This function builds the search query and remains unchanged.
const buildHyperLocalQuery = (tier: 'specific' | 'industry' | 'generic', industry: string, skills: string[], location: string): string => {
  const location_safe = `${location}, US`;
  switch (tier) {
    case 'specific':
      return `${industry} ${skills.slice(0, 2).join(' ')} jobs in ${location_safe}`;
    case 'industry':
      return `${industry} jobs in ${location_safe}`;
    case 'generic':
      return `jobs in ${location_safe}`;
  }
};

/**
 * REVISED: This function is now more robust. It includes a timeout and better error handling
 * to prevent hangs and provide clearer debugging information if the API fails.
 */
const executeJSearchQuery = async (query: string) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 8000); // 8-second timeout

  try {
    const apiUrl = `https://jsearch.p.rapidapi.com/search?query=${encodeURIComponent(query)}&page=1&num_pages=2`;
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: { 'X-RapidAPI-Key': JSEARCH_API_KEY, 'X-RapidAPI-Host': 'jsearch.p.rapidapi.com' },
      signal: controller.signal // This connects the timeout to the fetch request
    });

    clearTimeout(timeoutId); // Clear the timeout if the fetch was successful

    if (!response.ok) {
      // Log the detailed error message from the API
      const errorBody = await response.text();
      console.error(`JSearch API error! Status: ${response.status}. Query: "${query}". Response: ${errorBody}`);
      return []; // Return empty on error
    }
    
    const data = await response.json();
    return data.data || [];

  } catch (error) {
    // This will catch network errors or the timeout error
    if (error.name === 'AbortError') {
      console.error(`Network error: JSearch API call for query "${query}" timed out after 8 seconds.`);
    } else {
      console.error(`Network error during JSearch call for query "${query}":`, error);
    }
    return [];
  }
};


// This function orchestrates the fallback strategy and remains unchanged.
const fetchJobsWithFallbacks = async (industry: string, skills: string[], location: string) => {
  console.log(`Starting tiered search for industry: "${industry}" in location: "${location}"`);
  
  let query = buildHyperLocalQuery('specific', industry, skills, location);
  let jobs = await executeJSearchQuery(query);
  if (jobs.length > 0) {
    console.log(`Success: Tier 1 found ${jobs.length} jobs.`);
    return { jobs, tier: 'specific' };
  }

  console.log(`Tier 1 failed. Falling back to Tier 2 (industry-only).`);
  query = buildHyperLocalQuery('industry', industry, skills, location);
  jobs = await executeJSearchQuery(query);
  if (jobs.length > 0) {
    console.log(`Success: Tier 2 found ${jobs.length} jobs.`);
    return { jobs, tier: 'industry' };
  }

  console.log(`Tier 2 failed. Falling back to Tier 3 (location-only failsafe).`);
  query = buildHyperLocalQuery('generic', industry, skills, location);
  jobs = await executeJSearchQuery(query);
  console.log(`Success: Tier 3 found ${jobs.length} jobs.`);
  return { jobs, tier: 'generic' };
};

// The advanced resume analysis and job matching logic remains unchanged.
const analyzeResume = (resumeText: string) => {
  const text = resumeText.toLowerCase();
  const skillKeywords = ['java', 'python', 'sql', 'javascript', 'js', 'html', 'css', 'react', 'node.js', 'aws', 'docker', 'git', 'c++', 'c#', 'php', 'ruby', 'swift', 'kotlin', 'typescript', 'project management', 'agile', 'scrum', 'leadership', 'communication', 'teamwork', 'data analysis', 'machine learning', 'artificial intelligence', 'devops'];
  const skillPatterns = skillKeywords.map(skill => new RegExp(`\\b${skill.replace('.', '\\.')}\\b`, 'gi'));
  const extractedSkills = new Set<string>();
  skillPatterns.forEach(pattern => {
    const matches = text.match(pattern);
    if (matches) {
      const normalizedSkill = matches[0].toLowerCase() === 'js' ? 'javascript' : matches[0].toLowerCase();
      extractedSkills.add(normalizedSkill);
    }
  });
  const experienceYearsMatch = text.match(/(\d+)\+?\s*years?(\s*of)?\s*experience/);
  const isStudent = /intern|internship|student|high school|university|college|expected graduation/i.test(text);
  let seniority = 'entry';
  if (experienceYearsMatch) {
    const years = parseInt(experienceYearsMatch[1]);
    if (years >= 8) seniority = 'senior';
    else if (years >= 3) seniority = 'mid';
  } else if (isStudent) {
    seniority = 'student';
  }
  const hasDegree = /bachelor|master|phd|b\.s|b\.a/i.test(text);
  const isHighSchool = /high school/i.test(text) && !hasDegree;
  return { skills: [...extractedSkills], seniority: seniority, isHighSchoolStudent: isHighSchool, hasLeadership: /leader|president|captain|director|manager|head|chief/i.test(text) };
};

const calculateJobMatch = (job: any, resumeAnalysis: any) => {
  const { skills: resumeSkills, seniority: resumeSeniority, isHighSchoolStudent } = resumeAnalysis;
  const jobDescription = `${(job.title || '').toLowerCase()} ${(job.description || '').toLowerCase()}`;
  let score = 0;
  const matchedSkills = resumeSkills.filter(skill => jobDescription.includes(skill));
  const skillScore = resumeSkills.length > 0 ? (matchedSkills.length / resumeSkills.length) * 50 : 0;
  score += skillScore;
  let jobSeniority = 'entry';
  if (/\b(senior|sr|lead|principal|manager|director|architect|staff)\b/i.test(jobDescription) || /\b(5|8|10)\+?\s*years\b/i.test(jobDescription)) jobSeniority = 'senior';
  else if (/\b(mid-level|mid|intermediate)\b/i.test(jobDescription) || /\b(2|3|4)\+?\s*years\b/i.test(jobDescription)) jobSeniority = 'mid';
  else if (/\b(intern|internship|co-op|student)\b/i.test(jobDescription)) jobSeniority = 'student';
  const seniorityMap = { student: 0, entry: 1, mid: 2, senior: 3 };
  const resumeLevel = seniorityMap[resumeSeniority];
  const jobLevel = seniorityMap[jobSeniority];
  const experienceGap = Math.abs(resumeLevel - jobLevel);
  let experienceScore = 0;
  if (resumeLevel >= jobLevel) experienceScore = 35 - (experienceGap * 10);
  else experienceScore = 15 - (experienceGap * 25);
  score += experienceScore;
  let bonusScore = 0;
  if (isHighSchoolStudent && /\b(bachelor|master|phd|degree)\b/i.test(jobDescription)) bonusScore -= 15;
  if (resumeAnalysis.hasLeadership && /\b(lead|manage|leadership)\b/i.test(jobDescription)) bonusScore += 10;
  if (resumeSeniority === 'student' && jobSeniority === 'student') bonusScore += 15;
  score += bonusScore;
  return Math.floor(Math.max(5, Math.min(score, 98)));
};

// The main server handler remains unchanged.
serve(async (req) => {
  console.log('Flawless job matcher invoked.');
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });
  try {
    const { skills, location, industry, resumeText } = await req.json();
    if (!location || !industry) return new Response(JSON.stringify({ error: 'Location and industry are required.' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

    const resumeAnalysis = analyzeResume(resumeText);
    const combinedSkills = [...new Set([...(skills || []), ...resumeAnalysis.skills])];
    
    const { jobs: rawJobs, tier } = await fetchJobsWithFallbacks(industry, combinedSkills, location);

    if (!rawJobs || rawJobs.length === 0) {
      console.log('All search tiers failed to find any jobs.');
      return new Response(JSON.stringify({ jobs: [], insights: { tier: 'none' } }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const scoredJobs = rawJobs.map((job: any) => ({
      title: job.job_title || 'Professional Role',
      company: job.employer_name || 'Local Business',
      location: job.job_city && job.job_state ? `${job.job_city}, ${job.job_state}` : job.job_country,
      salary: job.job_min_salary && job.job_max_salary ? `$${job.job_min_salary.toLocaleString()} - $${job.job_max_salary.toLocaleString()}` : 'Salary not listed',
      description: job.job_description ? job.job_description.substring(0, 200) + '...' : 'No description provided.',
      jobUrl: job.job_apply_link,
      isRemote: job.job_is_remote || false,
      matchPercentage: calculateJobMatch(job, resumeAnalysis)
    })).sort((a, b) => b.matchPercentage - a.matchPercentage).slice(0, 25);

    console.log(`Returning ${scoredJobs.length} jobs. Final search tier used: "${tier}".`);

    return new Response(JSON.stringify({ jobs: scoredJobs, insights: { tier } }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

  } catch (error) {
    console.error('A critical error occurred in the main handler:', error);
    return new Response(JSON.stringify({ error: 'Internal server error.' }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});```

### **What to Do Next**

Now when you run the code, check your console logs.
*   If you see an error like `JSearch API error! Status: 403` or `Status: 429`, it means the **API key is the problem**. You will need to go to RapidAPI, check the status of your key, or generate a new one.
*   If you see a `timed out` error, it means the API is not responding, and the code correctly prevented a crash.

This version should restore the original functionality while keeping the much-improved matching algorithm.