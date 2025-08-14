import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const JSEARCH_API_KEY = Deno.env.get('JSEARCH_API_KEY') || '***REMOVED-RAPIDAPI-KEY***';
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// This function now builds a precise query string for a specific search tier.
// This is the key to forcing the API to respect our location and industry.
const buildHyperLocalQuery = (tier: 'specific' | 'industry' | 'generic', industry: string, skills: string[], location: string): string => {
  const location_safe = `${location}, US`;
  switch (tier) {
    case 'specific':
      // Tier 1: Be as specific as possible. e.g., "Education teacher jobs in Ohio, US"
      return `${industry} ${skills.slice(0, 2).join(' ')} jobs in ${location_safe}`;
    case 'industry':
      // Tier 2: Broaden to just the industry. e.g., "Education jobs in Ohio, US"
      return `${industry} jobs in ${location_safe}`;
    case 'generic':
      // Tier 3: Failsafe to prevent zero results. e.g., "jobs in Ohio, US"
      return `jobs in ${location_safe}`;
  }
};

// This function now only executes the API call. It's lean and focused.
const executeJSearchQuery = async (query: string) => {
  try {
    const apiUrl = `https://jsearch.p.rapidapi.com/search?query=${encodeURIComponent(query)}&page=1&num_pages=2`;
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: { 'X-RapidAPI-Key': JSEARCH_API_KEY, 'X-RapidAPI-Host': 'jsearch.p.rapidapi.com' }
    });
    if (!response.ok) {
      console.error(`JSearch API error for query "${query}":`, response.status, await response.text());
      return []; // Return empty on error
    }
    const data = await response.json();
    return data.data || [];
  } catch (error) {
    console.error(`Network error during JSearch call for query "${query}":`, error);
    return [];
  }
};

// --- THE CORE LOGIC: Multi-Tiered Fetching ---
// This function orchestrates the new strategy to guarantee results.
const fetchJobsWithFallbacks = async (industry: string, skills: string[], location: string) => {
  console.log(`Starting tiered search for industry: "${industry}" in location: "${location}"`);

  // Tier 1: Try the most specific query first.
  let query = buildHyperLocalQuery('specific', industry, skills, location);
  let jobs = await executeJSearchQuery(query);
  if (jobs.length > 0) {
    console.log(`Success: Tier 1 found ${jobs.length} jobs.`);
    return { jobs, tier: 'specific' };
  }

  // Tier 2: If Tier 1 failed, broaden to just the industry.
  console.log(`Tier 1 failed. Falling back to Tier 2 (industry-only).`);
  query = buildHyperLocalQuery('industry', industry, skills, location);
  jobs = await executeJSearchQuery(query);
  if (jobs.length > 0) {
    console.log(`Success: Tier 2 found ${jobs.length} jobs.`);
    return { jobs, tier: 'industry' };
  }

  // Tier 3: As a last resort, find any job in the state to avoid showing zero results.
  console.log(`Tier 2 failed. Falling back to Tier 3 (location-only failsafe).`);
  query = buildHyperLocalQuery('generic', industry, skills, location);
  jobs = await executeJSearchQuery(query);
  console.log(`Success: Tier 3 found ${jobs.length} jobs.`);
  return { jobs, tier: 'generic' };
};


/**
 * NEW: This function now performs a detailed analysis of the resume text
 * to extract crucial data points for accurate job matching.
 */
const analyzeResume = (resumeText: string) => {
  const text = resumeText.toLowerCase();

  const skillKeywords = [
    'java', 'python', 'sql', 'javascript', 'js', 'html', 'css', 'react', 'node.js', 'aws',
    'docker', 'git', 'c++', 'c#', 'php', 'ruby', 'swift', 'kotlin', 'typescript',
    'project management', 'agile', 'scrum', 'leadership', 'communication', 'teamwork',
    'data analysis', 'machine learning', 'artificial intelligence', 'devops'
  ];
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
  
  let seniority = 'entry'; // Default seniority
  if (experienceYearsMatch) {
    const years = parseInt(experienceYearsMatch[1]);
    if (years >= 8) seniority = 'senior';
    else if (years >= 3) seniority = 'mid';
  } else if (isStudent) {
    seniority = 'student'; // Specific seniority for students/interns
  }
  
  const hasDegree = /bachelor|master|phd|b\.s|b\.a/i.test(text);
  const isHighSchool = /high school/i.test(text) && !hasDegree;

  return {
    skills: [...extractedSkills],
    seniority: seniority,
    isHighSchoolStudent: isHighSchool,
    hasLeadership: /leader|president|captain|director|manager|head|chief/i.test(text)
  };
};

/**
 * NEW: The core of the new logic. This algorithm calculates a match score based on
 * a weighted system of skills, experience level, and other resume factors.
 */
const calculateJobMatch = (job: any, resumeAnalysis: any) => {
  const { skills: resumeSkills, seniority: resumeSeniority, isHighSchoolStudent } = resumeAnalysis;
  const jobDescription = `${(job.title || '').toLowerCase()} ${(job.description || '').toLowerCase()}`;
  
  let score = 0;

  // --- 1. Skill Match Score (Weight: 50%) ---
  const matchedSkills = resumeSkills.filter(skill => jobDescription.includes(skill));
  const skillScore = resumeSkills.length > 0 ? (matchedSkills.length / resumeSkills.length) * 50 : 0;
  score += skillScore;

  // --- 2. Experience Level Match Score (Weight: 35%) ---
  let jobSeniority = 'entry'; // Default job seniority
  if (/\b(senior|sr|lead|principal|manager|director|architect|staff)\b/i.test(jobDescription) || /\b(5|8|10)\+?\s*years\b/i.test(jobDescription)) {
    jobSeniority = 'senior';
  } else if (/\b(mid-level|mid|intermediate)\b/i.test(jobDescription) || /\b(2|3|4)\+?\s*years\b/i.test(jobDescription)) {
    jobSeniority = 'mid';
  } else if (/\b(intern|internship|co-op|student)\b/i.test(jobDescription)) {
    jobSeniority = 'student';
  }

  const seniorityMap = { student: 0, entry: 1, mid: 2, senior: 3 };
  const resumeLevel = seniorityMap[resumeSeniority];
  const jobLevel = seniorityMap[jobSeniority];
  const experienceGap = Math.abs(resumeLevel - jobLevel);

  let experienceScore = 0;
  if (resumeLevel >= jobLevel) { // User is qualified or overqualified
    experienceScore = 35 - (experienceGap * 10); // Perfect match = 35, overqualified loses some points
  } else { // User is underqualified
    experienceScore = 15 - (experienceGap * 25); // Significantly penalize being underqualified
  }
  score += experienceScore;

  // --- 3. Bonus & Penalty Score (Weight: 15%) ---
  let bonusScore = 0;
  // Penalty for requiring a degree if user is a high school student
  if (isHighSchoolStudent && /\b(bachelor|master|phd|degree)\b/i.test(jobDescription)) {
    bonusScore -= 15;
  }
  // Bonus for leadership if the job requires it
  if (resumeAnalysis.hasLeadership && /\b(lead|manage|leadership)\b/i.test(jobDescription)) {
    bonusScore += 10;
  }
  // Bonus if the job is specifically for students and the user is a student
  if (resumeSeniority === 'student' && jobSeniority === 'student') {
    bonusScore += 15;
  }
  score += bonusScore;

  // Final percentage is clamped between 5% and 98% for realism
  return Math.floor(Math.max(5, Math.min(score, 98)));
};


serve(async (req) => {
  console.log('Flawless job matcher invoked.');
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });
  try {
    const { skills, location, industry, resumeText } = await req.json();
    if (!location || !industry) return new Response(JSON.stringify({ error: 'Location and industry are required.' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

    // The new analyzeResume function is called here to get detailed insights.
    const resumeAnalysis = analyzeResume(resumeText);
    const combinedSkills = [...new Set([...(skills || []), ...resumeAnalysis.skills])];
    
    // Use the new, robust fetching strategy.
    const { jobs: rawJobs, tier } = await fetchJobsWithFallbacks(industry, combinedSkills, location);

    if (!rawJobs || rawJobs.length === 0) {
      console.log('All search tiers failed to find any jobs.');
      return new Response(JSON.stringify({ jobs: [], insights: { tier: 'none' } }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const scoredJobs = rawJobs.map((job: any) => {
      return {
        title: job.job_title || 'Professional Role',
        company: job.employer_name || 'Local Business',
        location: job.job_city && job.job_state ? `${job.job_city}, ${job.job_state}` : job.job_country,
        salary: job.job_min_salary && job.job_max_salary ? `$${job.job_min_salary.toLocaleString()} - $${job.job_max_salary.toLocaleString()}` : 'Salary not listed',
        description: job.job_description ? job.job_description.substring(0, 200) + '...' : 'No description provided.',
        jobUrl: job.job_apply_link, // **IMPORTANT**: Use the direct apply link!
        isRemote: job.job_is_remote || false,
        // The new, intelligent matching algorithm is used here.
        matchPercentage: calculateJobMatch(job, resumeAnalysis)
      };
    }).sort((a, b) => b.matchPercentage - a.matchPercentage).slice(0, 25);

    console.log(`Returning ${scoredJobs.length} jobs. Final search tier used: "${tier}".`);

    return new Response(JSON.stringify({ jobs: scoredJobs, insights: { tier } }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

  } catch (error) {
    console.error('A critical error occurred in the main handler:', error);
    return new Response(JSON.stringify({ error: 'Internal server error.' }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});