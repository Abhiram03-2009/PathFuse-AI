import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

// Use environment variables for API keys for security and best practices
const JSEARCH_API_KEY = Deno.env.get('JSEARCH_API_KEY') || '***REMOVED-RAPIDAPI-KEY***';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Resume analysis function remains the same, it's robust.
const analyzeResume = (resumeText: string) => {
  if (!resumeText) return { skills: [], experience: [], seniority: 'entry', companies: [] };
  const text = resumeText.toLowerCase();
  const techSkills = [];
  const skillPatterns = [
    /javascript|js\b/gi, /python/gi, /java\b/gi, /c\+\+/gi, /c#/gi, /react|react\.js/gi, /node\.?js/gi, /angular/gi, /vue/gi,
    /sql/gi, /nosql/gi, /mongodb/gi, /postgresql/gi, /aws/gi, /azure/gi, /gcp/gi, /docker/gi, /kubernetes/gi, /git/gi, /html/gi, /css/gi,
    /typescript/gi, /php/gi, /ruby/gi, /go\b/gi, /rust/gi, /swift/gi, /kotlin/gi, /scala/gi,
    /machine learning|ml\b/gi, /artificial intelligence|ai\b/gi, /data science/gi, /data analysis/gi, /data analytics/gi, /tableau/gi, /powerbi|power bi/gi,
    /salesforce/gi, /excel/gi, /powerpoint/gi, /project management/gi, /agile/gi, /scrum/gi, /jira/gi, /product management/gi,
    /communication/gi, /teamwork/gi, /problem-solving/gi, /leadership/gi
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
    /director/gi, /consultant/gi, /specialist/gi, /coordinator/gi, /lead/gi, /architect/gi, /product manager/gi, /project manager/gi
  ];
  titlePatterns.forEach(pattern => {
    const matches = resumeText.match(pattern);
    if (matches) experience.push(...matches.map(m => m.toLowerCase()));
  });

  const companies = [];
  const companyPatterns = [
    /google/gi, /microsoft/gi, /amazon/gi, /apple/gi, /facebook/gi, /meta/gi,
    /netflix/gi, /uber/gi, /airbnb/gi, /tesla/gi, /spacex/gi, /salesforce/gi, /vercel/gi, /ascensus/gi, /optum/gi,
    /deloitte/gi, /pwc/gi, /kpmg/gi, /ey/gi, /jpmorgan chase/gi, /goldman sachs/gi, /walmart/gi, /target/gi
  ];
  companyPatterns.forEach(pattern => {
    const matches = resumeText.match(pattern);
    if (matches) companies.push(...matches.map(m => m.toLowerCase()));
  });
  
  return {
    skills: [...new Set(techSkills)],
    experience: [...new Set(experience)],
    seniority,
    companies: [...new Set(companies)]
  };
};

// **REFINED**: Fetching hyperlocal jobs from JSearch with a smarter query
const fetchJSearchJobs = async (query: string, location: string) => {
  try {
    console.log('Fetching hyperlocal jobs from JSearch API with query:', { query, location });
    
    // **CRITICAL CHANGE**: Using more robust parameters for a wider, more relevant local search.
    // - `date_posted=month`: Finds jobs in the last month, crucial for smaller markets.
    // - `radius=100`: Searches in a 100km radius to include surrounding areas.
    // - Requesting more results (`num_pages=2`) to build a better pool to rank from.
    const response = await fetch(`https://jsearch.p.rapidapi.com/search?query=${encodeURIComponent(query)}&page=1&num_pages=2&date_posted=month&radius=100&employment_types=FULLTIME`, {
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
    console.log('JSearch API response received:', { status: data.status, count: data.data?.length });
    
    if (data.data && data.data.length > 0) {
      // Map up to 40 real jobs from the API response
      return data.data.slice(0, 40).map((job: any) => ({
        title: job.job_title || 'Professional Role',
        company: job.employer_name || 'Local Business',
        location: job.job_city && job.job_state ? `${job.job_city}, ${job.job_state}` : location,
        salary: job.job_min_salary && job.job_max_salary 
          ? `$${job.job_min_salary.toLocaleString()} - $${job.job_max_salary.toLocaleString()}`
          : 'Salary not listed',
        description: job.job_description ? job.job_description.substring(0, 200) + '...' : 'No description provided. Click to learn more.',
        jobUrl: job.job_apply_link, // Prioritize the direct apply link
        requirements: job.job_required_skills || [],
        benefits: job.job_benefits || [],
        isRemote: job.job_is_remote || false,
        postedDate: job.job_posted_at_datetime_utc || new Date().toISOString(),
        jobId: job.job_id,
        source: 'jsearch'
      }));
    }
    
    return []; // Return an empty array if no jobs are found
  } catch (error) {
    console.error('An error occurred during the JSearch API call:', error);
    return []; // Ensure it always returns an array
  }
};

// Job matching algorithm remains the same.
const calculateJobMatch = (job: any, resumeAnalysis: any, userSkills: string[]) => {
    let matchScore = 0;
    const jobText = (job.description + ' ' + job.title + ' ' + job.company).toLowerCase();
    const allSkills = [...new Set([...resumeAnalysis.skills, ...userSkills.map(s => s.toLowerCase())])];
    let skillMatches = 0;
    allSkills.forEach(skill => {
        if (jobText.includes(skill.toLowerCase())) {
            skillMatches++;
            matchScore += 8;
        }
    });
    const jobRequiresExperience = /senior|lead|principal|manager|director|vp|head of/i.test(jobText);
    const jobIsEntry = /junior|entry|associate|intern|graduate/i.test(jobText);
    if (resumeAnalysis.seniority === 'senior' && jobRequiresExperience) matchScore += 20;
    else if (resumeAnalysis.seniority === 'entry' && jobIsEntry) matchScore += 20;
    else if (resumeAnalysis.seniority === 'mid' && !jobRequiresExperience && !jobIsEntry) matchScore += 20;
    else matchScore += 10;
    resumeAnalysis.companies.forEach(company => {
        if (jobText.includes(company)) matchScore += 10;
    });
    if (job.isRemote) matchScore += 5;
    const baseMatch = Math.max(15, skillMatches * 5);
    return Math.min(100, Math.max(matchScore, baseMatch));
};

// **REFINED**: Main server handler now relies entirely on the live, local API search.
serve(async (req) => {
  console.log('Hyperlocal job matcher function invoked.');
  
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { skills, location, industry, resumeText } = await req.json();
    console.log('Received job matching request:', { skillsCount: skills?.length, location, industry, hasResume: !!resumeText });

    if (!skills || !location) {
      return new Response(JSON.stringify({ error: 'Skills and location are required.' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const resumeAnalysis = resumeText ? analyzeResume(resumeText) : { skills: [], experience: [], seniority: 'entry', companies: [] };
    const combinedSkills = [...new Set([...skills, ...resumeAnalysis.skills])];
    
    // **CRITICAL CHANGE**: Create a highly specific, location-aware search query.
    // This tells the API exactly what and where to search.
    const searchQuery = `${combinedSkills.slice(0, 3).join(' ')} ${industry} jobs in ${location}`;
    
    // Fetch jobs ONLY from the live API. No more mock data.
    const allJobs = await fetchJSearchJobs(searchQuery, location);

    // If the API returns nothing, we will now correctly show nothing.
    if (allJobs.length === 0) {
        console.log('No live jobs found for the specified criteria. Returning empty results.');
    }

    // Score and sort the real jobs found.
    const scoredJobs = allJobs
        .map((job) => ({
            ...job,
            matchPercentage: calculateJobMatch(job, resumeAnalysis, skills),
        }))
        .sort((a, b) => b.matchPercentage - a.matchPercentage)
        .slice(0, 15); // Show the top 15 matched real jobs.

    // Generate insights based on the *actual* local job market data.
    const remoteJobs = scoredJobs.filter(job => job.isRemote).length;
    const topCompanies = [...new Set(scoredJobs.map(job => job.company))].slice(0, 5);
    const avgMatch = scoredJobs.length > 0 ? scoredJobs.reduce((sum, job) => sum + job.matchPercentage, 0) / scoredJobs.length : 0;

    console.log(`Returning ${scoredJobs.length} real, local jobs with avg match ${avgMatch.toFixed(1)}%`);

    return new Response(
      JSON.stringify({
        jobs: scoredJobs,
        insights: {
          totalJobs: scoredJobs.length,
          remoteJobs,
          topCompanies,
          averageMatch: Math.round(avgMatch),
          lastUpdated: new Date().toISOString(),
          // The data source is now always live or empty.
          dataSource: allJobs.length > 0 ? 'live' : 'none'
        },
        resumeAnalysis
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('A critical error occurred in the main job matching handler:', error);
    return new Response(JSON.stringify({ error: 'Internal server error during job matching.', details: error.message }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});