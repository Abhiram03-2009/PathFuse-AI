"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

type Job = {
  id: number;
  title: string;
  company: string;
  location: string;
  description: string;
  skills_required: string[];
};

export default function JobMatchAnalyzer({
  resumeSkills,
  selectedState,
}: {
  resumeSkills: string[];
  selectedState: string;
}) {
  const [jobMatches, setJobMatches] = useState<
    { job: Job; matchScore: number }[]
  >([]);

  useEffect(() => {
    const fetchJobMatches = async () => {
      const { data, error } = await supabase
        .from("jobs")
        .select("*")
        .ilike("location", `%${selectedState}%`);

      if (error) {
        console.error("Failed to fetch jobs:", error.message);
        return;
      }

      if (!data) return;

      const scoredJobs = data.map((job: Job) => {
        const commonSkills = job.skills_required.filter((skill) =>
          resumeSkills.includes(skill.toLowerCase())
        );

        const matchScore = Math.min(
          100,
          Math.round((commonSkills.length / job.skills_required.length) * 100)
        );

        return {
          job,
          matchScore,
        };
      });

      // Only include strong matches (e.g. ≥ 20%) and sort
      const filteredJobs = scoredJobs
        .filter((match) => match.matchScore > 20)
        .sort((a, b) => b.matchScore - a.matchScore);

      setJobMatches(filteredJobs.slice(0, 5)); // Can return fewer than 5
    };

    if (selectedState && resumeSkills.length > 0) {
      fetchJobMatches();
    }
  }, [selectedState, resumeSkills]);

  return (
    <div className="space-y-4">
      {jobMatches.length === 0 ? (
        <p>No strong matches found for {selectedState}.</p>
      ) : (
        jobMatches.map(({ job, matchScore }) => (
          <Card key={job.id}>
            <CardContent className="p-4">
              <div className="font-bold text-lg">{job.title}</div>
              <div className="text-sm text-muted-foreground">
                {job.company} • {job.location}
              </div>
              <div className="my-2">{job.description}</div>
              <div className="text-sm mt-2">Match Score: {matchScore}%</div>
              <Progress value={matchScore} className="h-2" />
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
}
