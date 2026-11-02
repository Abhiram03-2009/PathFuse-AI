import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Briefcase, Building, BarChart, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { NeonText } from "@/components/NeonText";
import { GlassCard } from "@/components/GlassCard";
import { calculateJobMatch, getSavedResumes, getResumeById } from "@/lib/utils";
import { topCompanies } from "@/lib/resume-data";
import { useToast } from "@/components/ui/use-toast";

const JobMatcher = () => {
  const { toast } = useToast();
  const [savedResumes, setSavedResumes] = useState([]);
  const [selectedResumeId, setSelectedResumeId] = useState("");
  const [selectedResume, setSelectedResume] = useState(null);
  const [matchResults, setMatchResults] = useState([]);
  const [isCalculating, setIsCalculating] = useState(false);

  useEffect(() => {
    // Load saved resumes
    const resumes = getSavedResumes();
    setSavedResumes(resumes);

    if (resumes.length > 0) {
      setSelectedResumeId(resumes[0].id);  // Set the first resume by default
    }
  }, []);

  useEffect(() => {
    if (selectedResumeId) {
      const resume = getResumeById(selectedResumeId);
      setSelectedResume(resume);
    }
  }, [selectedResumeId]);

  const handleCalculateMatches = () => {
    if (!selectedResume) {
      toast({
        title: "Resume Required",
        description: "Please select a resume to calculate job matches.",
        variant: "destructive",
      });
      return;
    }

    setIsCalculating(true);

    // Simulate processing delay
    setTimeout(() => {
      try {
        const results = topCompanies.map(company => ({
          company: company.name,
          industry: company.industry,
          matchPercentage: calculateJobMatch(selectedResume, company)
        }));

        // Sort by match percentage (highest first)
        results.sort((a, b) => b.matchPercentage - a.matchPercentage);

        setMatchResults(results);

        toast({
          title: "Match Calculation Complete",
          description: `Calculated matches with ${results.length} top companies.`,
        });
      } catch (error) {
        toast({
          title: "Calculation Failed",
          description: "There was an error calculating job matches. Please try again.",
          variant: "destructive",
        });
        console.error("Job matching error:", error);
      } finally {
        setIsCalculating(false);
      }
    }, 1500);
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-6"
      >
        <GlassCard className="mb-6">
          <CardHeader>
            <CardTitle>
              <NeonText as="h2" className="text-2xl">Job Match Calculator</NeonText>
            </CardTitle>
            <CardDescription>
              Calculate how well your resume matches with top companies' requirements
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Select Your Resume</label>
              {savedResumes.length > 0 ? (
                <Select value={selectedResumeId} onValueChange={setSelectedResumeId}>
                  <SelectTrigger className="bg-background/40 border-purple-500/20">
                    <SelectValue placeholder="Select a resume" />
                  </SelectTrigger>
                  <SelectContent>
                    {savedResumes.map((resume) => (
                      <SelectItem key={resume.id} value={resume.id}>
                        {resume.personalInfo?.name || "Unnamed Resume"} - {new Date(resume.createdAt).toLocaleDateString()}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <div className="p-4 bg-background/40 border border-purple-500/20 rounded-md text-center">
                  <p className="text-muted-foreground">No saved resumes found. Please create a resume first.</p>
                </div>
              )}
            </div>

            {selectedResume && (
              <div className="p-4 bg-background/40 border border-purple-500/20 rounded-md">
                <h3 className="font-medium mb-2">{selectedResume.personalInfo?.name || "Unnamed Resume"}</h3>
                <p className="text-sm text-muted-foreground mb-2">{selectedResume.personalInfo?.title}</p>
                <div className="flex flex-wrap gap-1">
                  {selectedResume.skills?.slice(0, 5).map((skill, index) => (
                    <span key={index} className="bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded-full text-xs">
                      {skill}
                    </span>
                  ))}
                  {selectedResume.skills?.length > 5 && (
                    <span className="bg-background/60 text-muted-foreground px-2 py-0.5 rounded-full text-xs">
                      +{selectedResume.skills.length - 5} more
                    </span>
                  )}
                </div>
              </div>
            )}
          </CardContent>
          <CardFooter>
            <Button 
              onClick={handleCalculateMatches} 
              disabled={isCalculating || !selectedResume}
              className="w-full bg-gradient-to-r from-purple-600 to-blue-500 hover:from-purple-700 hover:to-blue-600"
            >
              {isCalculating ? (
                <>Calculating Matches...</>
              ) : (
                <>
                  <BarChart className="mr-2 h-4 w-4" />
                  Calculate Job Matches
                </>
              )}
            </Button>
          </CardFooter>
        </GlassCard>

        {matchResults.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <GlassCard>
              <CardHeader>
                <CardTitle>
                  <NeonText as="h2" className="text-xl">Company Match Results</NeonText>
                </CardTitle>
                <CardDescription>
                  Your resume's compatibility with top companies
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {matchResults.map((result, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center">
                          <Building className="h-4 w-4 mr-2 text-muted-foreground" />
                          <div>
                            <h3 className="font-medium">{result.company}</h3>
                            <p className="text-xs text-muted-foreground">{result.industry}</p>
                          </div>
                        </div>
                        <NeonText 
                          color={result.matchPercentage >= 70 ? "cyan" : result.matchPercentage >= 50 ? "blue" : "pink"}
                          className="text-lg"
                        >
                          {result.matchPercentage}%
                        </NeonText>
                      </div>
                      <Progress value={result.matchPercentage} className="h-2" />
                    </div>
                  ))}
                </div>
              </CardContent>
              <CardFooter className="flex flex-col items-start">
                <div className="bg-background/40 p-4 rounded-lg border border-purple-500/20 w-full">
                  <h3 className="text-sm font-medium mb-2">Insights</h3>
                  <ul className="space-y-2 text-sm">
                    {matchResults[0]?.matchPercentage >= 70 ? (
                      <li>• Your resume is highly compatible with {matchResults[0]?.company}! Consider applying.</li>
                    ) : (
                      <li>• Your highest match is {matchResults[0]?.company} at {matchResults[0]?.matchPercentage}%.</li>
                    )}
                    
                    {matchResults.filter(r => r.matchPercentage >= 70).length > 0 ? (
                      <li>• You have strong matches with {matchResults.filter(r => r.matchPercentage >= 70).length} companies.</li>
                    ) : (
                      <li>• Consider enhancing your resume with more industry-specific skills.</li>
                    )}
                    
                    {matchResults.filter(r => r.matchPercentage < 50).length > 0 && (
                      <li>• Your resume needs significant improvements for {matchResults.filter(r => r.matchPercentage < 50).length} companies.</li>
                    )}
                  </ul>
                </div>
              </CardFooter>
            </GlassCard>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};

export default JobMatcher;
