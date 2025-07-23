import { useState } from "react";

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

export default function JobMatcher() {
  const [state, setState] = useState("");
  const [skills, setSkills] = useState<string[]>([]);
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [insights, setInsights] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchJobs = async () => {
    setLoading(true);
    setJobs([]);
    setInsights(null);
    setError(null);

    try {
      const fetchedJobs = await fetchRealJobs(skills, state);

      if (!fetchedJobs.length) {
        setError('No jobs found for your criteria.');
      }

      // Calculate match score
      const scoredJobs = fetchedJobs.map((job) => ({
        ...job,
        matchScore: calculateJobMatch(job, skills),
      }));

      // Set the job list
      setJobs(scoredJobs);

      // Calculate market insights
      const marketInsights = calculateMarketInsights(scoredJobs);
      setInsights(marketInsights);
    } catch (error) {
      console.error('Error fetching jobs:', error);
      setError('There was an issue fetching job data.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-xl mx-auto space-y-4">
      <h2 className="text-xl font-bold">Job Match Analyzer</h2>

      <input
        type="text"
        value={state}
        onChange={(e) => setState(e.target.value)}
        placeholder="Enter a U.S. state (e.g., Pennsylvania)"
        className="border px-3 py-2 rounded w-full"
      />

      <input
        type="text"
        value={skills.join(", ")}
        onChange={(e) => setSkills(e.target.value.split(",").map(skill => skill.trim()))}
        placeholder="Enter skills (e.g., JavaScript, Python)"
        className="border px-3 py-2 rounded w-full mt-2"
      />

      <button
        onClick={fetchJobs}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 mt-2"
      >
        Analyze Matches
      </button>

      {loading && <p>Loading jobs...</p>}

      {error && <p className="text-red-600">{error}</p>}

      {jobs.length > 0 && (
        <div className="mt-4 space-y-3">
          {jobs.map((job) => (
            <div key={job.title} className="border p-3 rounded shadow-sm">
              <h3 className="font-semibold text-lg">{job.title}</h3>
              <p>{job.company} - {job.location}</p>
              <p className="text-sm text-gray-600">Skills: {job.skills.join(", ")}</p>
              <p className="text-green-700 font-medium">Match Score: {job.matchScore}%</p>
              <a href={job.jobUrl} className="text-blue-600">Apply Now</a>
            </div>
          ))}
        </div>
      )}

      {insights && (
        <div className="mt-4 space-y-2">
          <p><strong>Total Jobs Found:</strong> {insights.totalJobs}</p>
          <p><strong>Remote Jobs:</strong> {insights.remoteJobs.length} found</p>
          <p><strong>Average Salary:</strong> ${insights.avgSalary.toLocaleString()}</p>
          <p><strong>Top Companies:</strong> {insights.topCompanies.join(", ")}</p>
        </div>
      )}

      {jobs.length === 0 && !loading && !error && (
        <p className="text-gray-500">No matches found yet.</p>
      )}
    </div>
  );
}
