import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";

// Supabase connection
const supabase = createClient(
  "https://xyzcompany.supabase.co", // replace with yours
  "your-publishable-api-key"       // securely load in production
);

interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  state: string;
  skills: string[];
  match_score: number;
}

export default function JobMatcher() {
  const [state, setState] = useState("");
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchJobs = async () => {
    setLoading(true);
    setJobs([]);

    const { data, error } = await supabase
      .from("jobs")
      .select("*")
      .ilike("state", `%${state}%`)
      .limit(20); // limit for performance

    if (error) {
      console.error("Error fetching jobs:", error.message);
      setLoading(false);
      return;
    }

    // Simulate match scoring based on availability
    const scored = data.map((job: any) => ({
      ...job,
      match_score: Math.min(100, Math.floor(Math.random() * 90 + 10)), // random until backend is done
    }));

    setJobs(scored);
    setLoading(false);
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

      <button
        onClick={fetchJobs}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
      >
        Analyze Matches
      </button>

      {loading && <p>Loading jobs...</p>}

      {jobs.length > 0 && (
        <div className="mt-4 space-y-3">
          {jobs.map((job) => (
            <div key={job.id} className="border p-3 rounded shadow-sm">
              <h3 className="font-semibold text-lg">{job.title}</h3>
              <p>{job.company} - {job.location}, {job.state}</p>
              <p className="text-sm text-gray-600">Skills: {job.skills.join(", ")}</p>
              <p className="text-green-700 font-medium">Match Score: {job.match_score}%</p>
            </div>
          ))}
        </div>
      )}

      {jobs.length === 0 && !loading && (
        <p className="text-gray-500">No matches found yet.</p>
      )}
    </div>
  );
}
