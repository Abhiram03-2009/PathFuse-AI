import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

// Real-time job APIs
const RAPIDAPI_KEY = Deno.env.get('RAPIDAPI_KEY') || '***REMOVED-RAPIDAPI-KEY***';
const ADZUNA_API_KEY = Deno.env.get('ADZUNA_API_KEY') || "***REMOVED-ADZUNA-KEY***";
const ADZUNA_APP_ID = Deno.env.get('ADZUNA_APP_ID') || "***REMOVED-ADZUNA-APPID***";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Analyze resume to extract skills and experience
const analyzeResume = (resumeText: string) => {
  if (!resumeText) return { skills: [], experience: [], seniority: 'entry' };
  
  const text = resumeText.toLowerCase();
  
  // Extract technical skills
  const techSkills = [];
  const skillPatterns = [
    /javascript|js\b/g, /python/g, /java\b/g, /react/g, /node\.?js/g, /angular/g, /vue/g,
    /sql/g, /mongodb/g, /aws/g, /docker/g, /kubernetes/g, /git/g, /html/g, /css/g,
    /typescript/g, /php/g, /ruby/g, /go\b/g, /rust/g, /swift/g, /kotlin/g, /scala/g,
    /machine learning/g, /ai\b/g, /data science/g, /analytics/g, /tableau/g, /powerbi/g
  ];
  
  skillPatterns.forEach(pattern => {
    const matches = text.match(pattern);
    if (matches) {
      techSkills.push(...matches);
    }
  });
  
  // Extract experience level
  const experienceYears = text.match(/(\d+)\+?\s*years?\s*(of\s*)?(experience|exp)/);
  let seniority = 'entry';
  if (experienceYears) {
    const years = parseInt(experienceYears[1]);
    if (years >= 7) seniority = 'senior';
    else if (years >= 3) seniority = 'mid';
  }
  
  // Extract job titles/roles
  const experience = [];
  const titlePatterns = [
    /software engineer/g, /developer/g, /programmer/g, /analyst/g, /manager/g,
    /director/g, /consultant/g, /specialist/g, /coordinator/g, /lead/g
  ];
  
  titlePatterns.forEach(pattern => {
    const matches = text.match(pattern);
    if (matches) {
      experience.push(...matches);
    }
  });
  
  return {
    skills: [...new Set(techSkills)],
    experience: [...new Set(experience)],
    seniority
  };
};

// Fetch real-time jobs from JSearch API (RapidAPI)
const fetchJSearchJobs = async (query: string, location: string) => {
  try {
    const response = await fetch(`https://jsearch.p.rapidapi.com/search?query=${encodeURIComponent(query)}&page=1&num_pages=2&date_posted=week&employment_types=FULLTIME%2CPARTTIME&remote_jobs_only=false`, {
      method: 'GET',
      headers: {
        'X-RapidAPI-Key': RAPIDAPI_KEY,
        'X-RapidAPI-Host': 'jsearch.p.rapidapi.com'
      }
    });

    if (!response.ok) {
      throw new Error(`JSearch API error: ${response.statusText}`);
    }

    const data = await response.json();
    
    if (data.data && data.data.length > 0) {
      return data.data.map((job: any) => ({
        title: job.job_title,
        company: job.employer_name,
        location: job.job_city ? `${job.job_city}, ${job.job_state}` : location,
        salary: job.job_min_salary && job.job_max_salary 
          ? `$${job.job_min_salary.toLocaleString()} - $${job.job_max_salary.toLocaleString()}`
          : job.job_salary || 'Competitive salary',
        description: job.job_description ? job.job_description.substring(0, 300) + '...' : 'Join our team and make an impact.',
        jobUrl: job.job_apply_link || `https://${job.employer_name.toLowerCase().replace(/\s+/g, '')}.com/careers`,
        requirements: job.job_required_skills || [],
        benefits: job.job_benefits || [],
        isRemote: job.job_is_remote || false,
        postedDate: job.job_posted_at_datetime_utc,
        jobId: job.job_id,
        source: 'jsearch'
      }));
    }
    
    return [];
  } catch (error) {
    console.error('JSearch API error:', error);
    return [];
  }
};

// Fetch jobs from Adzuna API as backup
const fetchAdzunaJobs = async (skills: string[], location: string) => {
  try {
    const query = skills.join(' ');
    const API_URL = `https://api.adzuna.com/v1/api/jobs/us/search/1?app_id=${ADZUNA_APP_ID}&app_key=${ADZUNA_API_KEY}&results_per_page=20&what=${encodeURIComponent(query)}&where=${encodeURIComponent(location)}`;
    
    const response = await fetch(API_URL);

    if (!response.ok) {
      throw new Error(`Adzuna API error: ${response.statusText}`);
    }

    const data = await response.json();
    
    if (data.results && data.results.length > 0) {
      return data.results.map((job: any) => ({
        title: job.title,
        company: job.company.display_name,
        location: job.location.display_name,
        salary: job.salary_min && job.salary_max
          ? `$${job.salary_min.toLocaleString()} - $${job.salary_max.toLocaleString()}`
          : 'Competitive salary',
        description: job.description ? job.description.substring(0, 300) + '...' : 'Join our team and make an impact.',
        jobUrl: job.redirect_url,
        requirements: [],
        benefits: [],
        isRemote: job.title.toLowerCase().includes('remote'),
        postedDate: job.created,
        source: 'adzuna'
      }));
    }
    
    return [];
  } catch (error) {
    console.error('Adzuna API error:', error);
    return [];
  }
};

// Enhanced job matching algorithm
const calculateJobMatch = (job: any, resumeAnalysis: any, userSkills: string[]) => {
  let matchScore = 0;
  const jobText = (job.description + ' ' + job.title).toLowerCase();
  const allSkills = [...resumeAnalysis.skills, ...userSkills];

  // Skill matching (60% weight)
  allSkills.forEach(skill => {
    if (jobText.includes(skill.toLowerCase())) {
      matchScore += 15;
    }
  });
  
  // Experience level matching (25% weight)
  const jobRequiresExperience = /senior|lead|principal|manager|director/.test(jobText);
  const jobIsEntry = /junior|entry|associate|intern/.test(jobText);
  
  if (resumeAnalysis.seniority === 'senior' && jobRequiresExperience) {
    matchScore += 20;
  } else if (resumeAnalysis.seniority === 'entry' && jobIsEntry) {
    matchScore += 20;
  } else if (resumeAnalysis.seniority === 'mid' && !jobRequiresExperience && !jobIsEntry) {
    matchScore += 20;
  }
  
  // Location preference (15% weight)
  if (job.isRemote) {
    matchScore += 10;
  }

  return Math.min(100, Math.max(matchScore, 10));
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { skills, location, industry, resumeText } = await req.json();
    console.log('Job matching request:', { skills: skills?.length, location, industry });

    if (!skills || !location) {
      return new Response(
        JSON.stringify({ error: 'Skills and location are required.' }), 
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Analyze resume if provided
    const resumeAnalysis = resumeText ? analyzeResume(resumeText) : { skills: [], experience: [], seniority: 'entry' };
    
    // Create search query based on skills and industry
    const searchQuery = industry ? `${skills.join(' ')} ${industry}` : skills.join(' ');
    
    // Fetch jobs from multiple sources
    let allJobs = [];
    
    // Try JSearch first (more current data)
    const jSearchJobs = await fetchJSearchJobs(searchQuery, location);
    allJobs.push(...jSearchJobs);
    
    // Add Adzuna jobs as backup
    if (allJobs.length < 10) {
      const adzunaJobs = await fetchAdzunaJobs(skills, location);
      allJobs.push(...adzunaJobs);
    }

    // Remove duplicates based on title and company
    const uniqueJobs = allJobs.filter((job, index, self) => 
      index === self.findIndex(j => j.title === job.title && j.company === job.company)
    );

    if (uniqueJobs.length === 0) {
      return new Response(
        JSON.stringify({ error: 'No current job openings found for your criteria.' }), 
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Calculate match scores
    const scoredJobs = uniqueJobs.map((job) => ({
      ...job,
      matchPercentage: calculateJobMatch(job, resumeAnalysis, skills),
    })).sort((a, b) => b.matchPercentage - a.matchPercentage);

    // Market insights
    const remoteJobs = scoredJobs.filter(job => job.isRemote).length;
    const topCompanies = [...new Set(scoredJobs.map(job => job.company))].slice(0, 5);

    return new Response(
      JSON.stringify({
        jobs: scoredJobs,
        insights: {
          totalJobs: scoredJobs.length,
          remoteJobs,
          topCompanies,
          lastUpdated: new Date().toISOString()
        },
        resumeAnalysis
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Job matching error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error.', details: error.message }), 
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});