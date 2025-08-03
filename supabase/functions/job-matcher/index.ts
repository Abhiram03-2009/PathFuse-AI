import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

// Securely use environment variables for your API Key
const JSEARCH_API_KEY = Deno.env.get('JSEARCH_API_KEY') || '***REMOVED-RAPIDAPI-KEY***';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Resume analysis function remains unchanged. It is well-optimized.
const analyzeResume = (resumeText: string) => {
    if (!resumeText) return { skills: [], experience: [], seniority: 'entry', companies: [] };
    const text = resumeText.toLowerCase();
    const techSkills = [];
    const skillPatterns = [
        /javascript|js\b/gi, /python/gi, /java\b/gi, /c\+\+/gi, /c#/gi, /react|react\.js/gi, /node\.?js/gi, /angular/gi, /vue/gi,
        /sql/gi, /nosql/gi, /mongodb/gi, /postgresql/gi, /aws/gi, /azure/gi, /gcp/gi, /docker/gi, /kubernetes/gi, /git/gi, /html/gi, /css/gi,
        /typescript/gi, /php/gi, /ruby/gi, /go\b/gi, /rust/gi, /swift/gi, /kotlin/gi, /scala/gi,
        /machine learning|ml\b/gi, /artificial intelligence|ai\b/gi, /data science/gi, /data analysis/gi, /data analytics/gi, /tableau/gi, /powerbi|power bi/gi,
        /salesforce/gi, /crm/gi, /excel/gi, /powerpoint/gi, /project management/gi, /agile/gi, /scrum/gi, /jira/gi, /product management/gi,
        /communication/gi, /teamwork/gi, /problem-solving/gi, /leadership/gi, /customer service/gi, /sales/gi, /marketing/gi, /healthcare/gi, /nursing/gi
    ];
    skillPatterns.forEach(pattern => {
        const matches = resumeText.match(pattern);
        if (matches) techSkills.push(...matches.map(m => m.toLowerCase()));
    });
    const experienceYears = text.match(/(\d+)\+?\s*years?\s*(of\s*)?(experience|exp)/);
    let seniority = 'entry';
    if (experienceYears) {
        const years = parseInt(experienceYears[1]);
        if (years >= 8) seniority = 'senior';
        else if (years >= 3) seniority = 'mid';
    }
    if (/senior|lead|principal|manager|director|vp|vice president|head of/i.test(resumeText)) seniority = 'senior';
    else if (/mid-level|mid|intermediate|associate/i.test(resumeText)) seniority = 'mid';
    const experience = [];
    const titlePatterns = [
        /software engineer/gi, /developer/gi, /programmer/gi, /data analyst/gi, /business analyst/gi, /financial analyst/gi, /manager/gi,
        /director/gi, /consultant/gi, /specialist/gi, /coordinator/gi, /lead/gi, /architect/gi, /product manager/gi, /project manager/gi, /sales representative/gi, /account executive/gi, /registered nurse/gi
    ];
    titlePatterns.forEach(pattern => {
        const matches = resumeText.match(pattern);
        if (matches) experience.push(...matches.map(m => m.toLowerCase()));
    });
    const companies = [];
    const companyPatterns = [
        /google/gi, /microsoft/gi, /amazon/gi, /apple/gi, /facebook/gi, /meta/gi, /netflix/gi, /uber/gi, /airbnb/gi, /tesla/gi, /spacex/gi, /salesforce/gi,
        /deloitte/gi, /pwc/gi, /kpmg/gi, /ey/gi, /jpmorgan chase/gi, /goldman sachs/gi, /walmart/gi, /target/gi, /cvs health/gi, /unitedhealth/gi
    ];
    companyPatterns.forEach(pattern => {
        const matches = resumeText.match(pattern);
        if (matches) companies.push(...matches.map(m => m.toLowerCase()));
    });
    return { skills: [...new Set(techSkills)], experience: [...new Set(experience)], seniority, companies: [...new Set(companies)] };
};

// **REFINED**: This function now ONLY builds the keyword query.
const buildSearchQuery = (skills: string[], industry: string): string => {
    const queryParts: string[] = [];
    if (industry && industry.toLowerCase() !== 'any') {
        queryParts.push(industry);
    }
    if (skills && skills.length > 0) {
        queryParts.push(...skills.slice(0, 3));
    }
    // If for some reason there are no skills or industry, search for all "jobs"
    if (queryParts.length === 0) {
        return 'jobs';
    }
    return [...new Set(queryParts)].join(' ');
};

// **CRITICAL FIX**: This function now takes `query` and `location` as separate arguments
// and uses the API's dedicated `location` parameter for filtering.
const fetchJSearchJobs = async (query: string, location: string) => {
  try {
    console.log('Fetching jobs from JSearch API with query:', { query, location });

    // The API URL now uses both `query` and `location` parameters for a precise search.
    const response = await fetch(`https://jsearch.p.rapidapi.com/search?query=${encodeURIComponent(query)}&location=${encodeURIComponent(location)}&page=1&num_pages=2&date_posted=month&radius=100`, {
      method: 'GET',
      headers: {
        'X-RapidAPI-Key': JSEARCH_API_KEY,
        'X-RapidAPI-Host': 'jsearch.p.rapidapi.com'
      }
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error('JSearch API error:', response.status, response.statusText, errorBody);
      throw new Error(`JSearch API error: ${response.statusText}`);
    }

    const data = await response.json();
    console.log('JSearch API response received:', { status: data.status, resultsFound: data.data?.length });
    
    if (data.data && data.data.length > 0) {
      return data.data.map((job: any) => ({
        title: job.job_title || 'Professional Role',
        company: job.employer_name || 'Local Business',
        location: job.job_city && job.job_state ? `${job.job_city}, ${job.job_state}` : location, // Display city/state
        salary: job.job_min_salary && job.job_max_salary 
          ? `$${job.job_min_salary.toLocaleString()} - $${job.job_max_salary.toLocaleString()}`
          : 'Salary not listed',
        description: job.job_description ? job.job_description.substring(0, 200) + '...' : 'No description provided.',
        jobUrl: job.job_apply_link,
        requirements: job.job_required_skills || [],
        benefits: job.job_benefits || [],
        isRemote: job.job_is_remote || false,
        postedDate: job.job_posted_at_datetime_utc || new Date().toISOString(),
        jobId: job.job_id,
        source: 'jsearch'
      }));
    }
    return [];
  } catch (error) {
    console.error('An error occurred during the JSearch API call:', error);
    return [];
  }
};

// Job matching algorithm remains the same.
const calculateJobMatch = (job: any, resumeAnalysis: any, userSkills: string[]) => {
    let matchScore = 0;
    const jobText = (job.description + ' ' + job.title + ' ' + (job.requirements?.join(' ') || '')).toLowerCase();
    const allSkills = [...new Set([...resumeAnalysis.skills, ...userSkills.map(s => s.toLowerCase())])];
    let skillMatches = 0;
    allSkills.forEach(skill => { if (jobText.includes(skill)) { skillMatches++; matchScore += 8; } });
    const jobRequiresExperience = /senior|lead|principal|manager|director|vp|head of/i.test(jobText);
    const jobIsEntry = /junior|entry|associate|intern|graduate/i.test(jobText);
    if (resumeAnalysis.seniority === 'senior' && jobRequiresExperience) matchScore += 20;
    else if (resumeAnalysis.seniority === 'entry' && jobIsEntry) matchScore += 20;
    else if (resumeAnalysis.seniority === 'mid' && !jobRequiresExperience && !jobIsEntry) matchScore += 20;
    else matchScore += 10;
    resumeAnalysis.companies.forEach(company => { if (job.company?.toLowerCase().includes(company)) matchScore += 10; });
    if (job.isRemote) matchScore += 5;
    const baseMatch = Math.max(15, skillMatches * 5);
    return Math.min(100, Math.max(matchScore, baseMatch));
};

// **REFINED**: Main server handler now uses the corrected, separated query and location logic.
serve(async (req) => {
  console.log('State-specific job matcher function invoked.');
  
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  try {
    const { skills, location, industry, resumeText } = await req.json();
    console.log('Received job matching request:', { skillsCount: skills?.length, location, industry, hasResume: !!resumeText });

    if (!location || !industry) {
      return new Response(JSON.stringify({ error: 'Location and industry are required.' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const resumeAnalysis = analyzeResume(resumeText);
    const combinedSkills = [...new Set([...(skills || []), ...resumeAnalysis.skills])];
    
    // 1. Build the keyword query (e.g., "Sales")
    const searchQuery = buildSearchQuery(combinedSkills, industry);
    
    // 2. Pass the keyword query and the location state separately to the API fetcher.
    const allJobs = await fetchJSearchJobs(searchQuery, `${location}, US`);

    if (allJobs.length === 0) {
        console.log('No live jobs found for the specified criteria. Returning empty results.');
    }

    // Score and sort the jobs that were returned from the correct state.
    const scoredJobs = allJobs
        .map((job) => ({ ...job, matchPercentage: calculateJobMatch(job, resumeAnalysis, skills || []) }))
        .sort((a, b) => b.matchPercentage - a.matchPercentage)
        .slice(0, 20);

    const remoteJobs = scoredJobs.filter(job => job.isRemote).length;
    const topCompanies = [...new Set(scoredJobs.map(job => job.company))].slice(0, 5);
    const avgMatch = scoredJobs.length > 0 ? scoredJobs.reduce((sum, job) => sum + job.matchPercentage, 0) / scoredJobs.length : 0;

    console.log(`Returning ${scoredJobs.length} jobs from ${location} with avg match ${avgMatch.toFixed(1)}%`);

    return new Response(
      JSON.stringify({
        jobs: scoredJobs,
        insights: {
          totalJobs: scoredJobs.length,
          remoteJobs,
          topCompanies,
          averageMatch: Math.round(avgMatch),
          lastUpdated: new Date().toISOString(),
          dataSource: allJobs.length > 0 ? 'live' : 'none'
        },
        resumeAnalysis
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('A critical error occurred in the main job matching handler:', error);
    return new Response(JSON.stringify({ error: 'Internal server error.', details: error.message }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});