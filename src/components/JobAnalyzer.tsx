// components/JobMatcher.tsx
import { useState } from "react";

type JobMatch = {
  title: string;
  company: string;
  location: string;
  matchScore: number; // 0-100
};

export default function JobMatcher() {
  const [state, setState] = useState("");
  const [resume, setResume] = useState("");
  const [matches, setMatches] = useState<JobMatch[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleMatch() {
    if (!state || !resume) return setError("Please fill all fields.");

    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/match-jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ state, resume }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to fetch matches.");
      setMatches(data.matches);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-3xl mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">Job Matcher Analyzer</h1>

      <div className="mb-4">
        <label className="block text-sm font-medium">Select U.S. State</label>
        <input
          type="text"
          value={state}
          onChange={(e) => setState(e.target.value)}
          placeholder="e.g., Pennsylvania"
          className="mt-1 p-2 border rounded w-full"
        />
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium">Paste Resume</label>
        <textarea
          rows={6}
          value={resume}
          onChange={(e) => setResume(e.target.value)}
          placeholder="Paste your resume here"
          className="mt-1 p-2 border rounded w-full"
        />
      </div>

      <button
        onClick={handleMatch}
        className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
        disabled={loading}
      >
        {loading ? "Analyzing..." : "Find Matches"}
      </button>

      {error && <p className="text-red-600 mt-2">{error}</p>}

      {matches.length > 0 && (
        <div className="mt-6">
          <h2 className="text-xl font-semibold mb-3">Top Matches:</h2>
          <ul className="space-y-3">
            {matches.map((job, idx) => (
              <li
                key={idx}
                className="border p-4 rounded shadow-sm bg-white hover:shadow-md transition"
              >
                <div className="font-bold text-lg">{job.title}</div>
                <div className="text-gray-700">
                  {job.company} – {job.location}
                </div>
                <div className="text-green-600 font-semibold">
                  Match Score: {Math.min(100, Math.round(job.matchScore))}%
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
