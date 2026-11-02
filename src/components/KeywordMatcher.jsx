
import React, { useState } from "react";
import { motion } from "framer-motion";
import { Search, AlertCircle, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { NeonButton } from "@/components/NeonButton";
import { NeonText } from "@/components/NeonText";
import { GlassCard } from "@/components/GlassCard";
import { matchKeywords } from "@/lib/utils";
import { industryKeywords } from "@/lib/resume-data";
import { useToast } from "@/components/ui/use-toast";

const KeywordMatcher = () => {
  const { toast } = useToast();
  const [resumeText, setResumeText] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [matchResults, setMatchResults] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [selectedIndustry, setSelectedIndustry] = useState("");

  const handleAnalyze = () => {
    if (!resumeText.trim() || !jobDescription.trim()) {
      toast({
        title: "Input Required",
        description: "Please enter both your resume text and the job description.",
        variant: "destructive",
      });
      return;
    }

    setIsAnalyzing(true);
    
    // Simulate processing delay
    setTimeout(() => {
      try {
        const results = matchKeywords(resumeText, jobDescription);
        setMatchResults(results);
        
        if (results.score < 50) {
          toast({
            title: "Low Match Score",
            description: "Your resume matches less than 50% of key job requirements. Consider updating it.",
            variant: "destructive",
          });
        } else {
          toast({
            title: "Analysis Complete",
            description: `Your resume matches ${results.score}% of key job requirements.`,
          });
        }
      } catch (error) {
        toast({
          title: "Analysis Failed",
          description: "There was an error analyzing your resume. Please try again.",
          variant: "destructive",
        });
        console.error("Keyword matching error:", error);
      } finally {
        setIsAnalyzing(false);
      }
    }, 1500);
  };

  const handleIndustrySelect = (industry) => {
    setSelectedIndustry(industry);
    
    // Add industry keywords to job description
    if (industryKeywords[industry]) {
      const keywordsText = industryKeywords[industry].join(", ");
      setJobDescription(prev => 
        prev + (prev ? "\n\nKey skills: " : "Key skills: ") + keywordsText
      );
      
      toast({
        title: "Industry Keywords Added",
        description: `Added ${industry} industry keywords to the job description.`,
      });
    }
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
              <NeonText as="h2" className="text-2xl">Resume Keyword Matcher</NeonText>
            </CardTitle>
            <CardDescription>
              Match your resume against job descriptions to identify missing keywords and improve your application
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="resume-text">Your Resume Text</Label>
              <Textarea
                id="resume-text"
                placeholder="Paste your resume text here..."
                className="min-h-[150px] bg-background/40 border-purple-500/20"
                value={resumeText}
                onChange={(e) => setResumeText(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label htmlFor="job-description">Job Description</Label>
                <div className="text-xs text-muted-foreground">
                  Add industry keywords:
                  <div className="flex flex-wrap gap-1 mt-1">
                    {Object.keys(industryKeywords).map((industry) => (
                      <Button
                        key={industry}
                        variant="outline"
                        size="sm"
                        className="h-6 text-xs bg-background/40 border-purple-500/20"
                        onClick={() => handleIndustrySelect(industry)}
                      >
                        {industry}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
              <Textarea
                id="job-description"
                placeholder="Paste the job description here..."
                className="min-h-[150px] bg-background/40 border-purple-500/20"
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
              />
            </div>
          </CardContent>
          <CardFooter>
            <NeonButton 
              onClick={handleAnalyze} 
              disabled={isAnalyzing || !resumeText.trim() || !jobDescription.trim()}
              className="w-full"
              glowColor="rgba(56, 189, 248, 0.5)"
            >
              {isAnalyzing ? (
                <>Analyzing Keywords...</>
              ) : (
                <>
                  <Search className="mr-2 h-4 w-4" />
                  Analyze Keywords
                </>
              )}
            </NeonButton>
          </CardFooter>
        </GlassCard>
        
        {matchResults && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <GlassCard>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <NeonText as="span" className="text-xl">Match Results</NeonText>
                  <div className="flex items-center">
                    <span className="mr-2">Match Score:</span>
                    <NeonText 
                      color={matchResults.score >= 70 ? "cyan" : matchResults.score >= 50 ? "blue" : "pink"}
                      className="text-xl"
                    >
                      {matchResults.score}%
                    </NeonText>
                  </div>
                </CardTitle>
                <CardDescription>
                  {matchResults.score >= 70 
                    ? "Great match! Your resume aligns well with this job description." 
                    : matchResults.score >= 50 
                      ? "Moderate match. Consider adding some missing keywords." 
                      : "Low match. We recommend updating your resume with the missing keywords."}
                </CardDescription>
                <Progress value={matchResults.score} className="h-2 mt-2" />
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium flex items-center mb-2">
                    <CheckCircle2 className="h-4 w-4 mr-2 text-green-500" />
                    Matching Keywords ({matchResults.matches.length})
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {matchResults.matches.map((keyword, index) => (
                      <span key={index} className="bg-green-500/20 text-green-300 px-3 py-1 rounded-full text-sm">
                        {keyword}
                      </span>
                    ))}
                    {matchResults.matches.length === 0 && (
                      <span className="text-sm text-muted-foreground">No matching keywords found.</span>
                    )}
                  </div>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium flex items-center mb-2">
                    <AlertCircle className="h-4 w-4 mr-2 text-red-500" />
                    Missing Keywords ({matchResults.missing.length})
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {matchResults.missing.map((keyword, index) => (
                      <span key={index} className="bg-red-500/20 text-red-300 px-3 py-1 rounded-full text-sm">
                        {keyword}
                      </span>
                    ))}
                    {matchResults.missing.length === 0 && (
                      <span className="text-sm text-muted-foreground">No missing keywords! Great job!</span>
                    )}
                  </div>
                </div>
                
                <div className="bg-background/40 p-4 rounded-lg border border-purple-500/20 mt-4">
                  <h3 className="text-sm font-medium mb-2">Recommendations</h3>
                  <ul className="space-y-2 text-sm">
                    {matchResults.missing.length > 0 ? (
                      <>
                        <li>• Consider adding the missing keywords to your resume where relevant.</li>
                        <li>• Tailor your experience descriptions to include these terms.</li>
                        <li>• Use the exact terminology from the job description when possible.</li>
                        {matchResults.score < 50 && (
                          <li>• Your match score is low. Significant resume updates are recommended.</li>
                        )}
                      </>
                    ) : (
                      <li>• Your resume already contains all the key terms from this job description!</li>
                    )}
                  </ul>
                </div>
              </CardContent>
            </GlassCard>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};

export default KeywordMatcher;
