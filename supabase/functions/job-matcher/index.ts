import { serve } from 'std/server'; // Supabase edge function API

// Replace with your Adzuna API key and App ID
const API_KEY = "***REMOVED-ADZUNA-KEY***"; // Your Adzuna API key
const APP_ID = "***REMOVED-ADZUNA-APPID***"; // Your Adzuna App ID

const fetchRealJobs = async (skills: string[], location: string) => {
  const API_URL = `https://api.adzuna.com/v1/api/jobs/us/search/1?app_id=${APP_ID}&app_key=${API_KEY}&results_per_page=20&what=${encodeURIComponent(skills.join(' '))}&where=${encodeURIComponent(location)}`;

  try {
    const response = await fetch(API_URL);
    const data = await response.json();

    if (data.results && data.results.length > 0) {
      return data.results.map((job: any) => ({
        title: job.title,
        company: job.company.display_name,
        location: job.location.display_name,
        salary: job.salary_min && job.salary_max
          ? `$${job.salary_min.toLocaleString()} - $${job.salary_max.toLocaleString()}`
          : 'Competitive salary',
        description: job.description ? job.description.substring(0, 200) + '...' : 'Join our team and make an impact.',
        jobUrl: job.redirect_url,
        isRemote: job.title.toLowerCase().includes('remote'),
      }));
    } else {
      return [];
    }
  } catch (error) {
    console.error('Error fetching job data:', error);
    return [];
  }
};

const calculateJobMatch = (job: any, skills: string[]) => {
  let matchScore = 0;
  const jobText = job.description.toLowerCase();

  // For each skill, check if it appears in the job description
  skills.forEach(skill => {
    if (jobText.includes(skill.toLowerCase())) {
      matchScore += 10; // Add score for each matched skill
    }
  });

  return Math.min(100, matchScore); // Max score is 100
};

const calculateMarketInsights = (jobs: any[]) => {
  const remoteJobs = jobs.filter(job => job.isRemote);
  const totalJobs = jobs.length;

  // Calculate average salary, handling missing or single salary values
  const avgSalary = jobs.reduce((sum, job) => {
    if (job.salary !== 'Competitive salary' && job.salary.includes(' - ')) {
      const salaryParts = job.salary.split(' - ');
      const minSalary = parseInt(salaryParts[0].replace('$', '').replace(',', ''), 10);
      const maxSalary = parseInt(salaryParts[1].replace('$', '').replace(',', ''), 10);
      return sum + (minSalary + maxSalary) / 2;
    } else if (job.salary !== 'Competitive salary') {
      const salary = parseInt(job.salary.replace('$', '').replace(',', ''), 10);
      return sum + salary;
    }
    return sum;
  }, 0) / totalJobs;

  const topCompanies = [...new Set(jobs.map(job => job.company))].slice(0, 5);

  return {
    totalJobs,
    remoteJobs,
    avgSalary,
    topCompanies,
  };
};

// Main function for the Supabase Edge Function
serve(async (req) => {
  const { skills, location } = await req.json();

  // Fetch jobs from the Adzuna API
  const fetchedJobs = await fetchRealJobs(skills, location);

  // If no jobs were found, return a meaningful message
  if (!fetchedJobs.length) {
    return new Response(JSON.stringify({ error: 'No jobs found for your criteria.' }), { status: 404 });
  }

  // Calculate match score for each job
  const scoredJobs = fetchedJobs.map((job) => ({
    ...job,
    matchScore: calculateJobMatch(job, skills),
  }));

  // Calculate market insights
  const marketInsights = calculateMarketInsights(scoredJobs);

  // Return the job matches and market insights in a JSON response
  return new Response(
    JSON.stringify({
      jobs: scoredJobs,
      insights: marketInsights,
    }),
    { headers: { 'Content-Type': 'application/json' } }
  );
});
