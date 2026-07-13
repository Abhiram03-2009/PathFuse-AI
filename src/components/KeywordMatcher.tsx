
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Search, Target, TrendingUp, Save } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useTheme } from '@/contexts/ThemeContext';
import { useCachedState } from '@/hooks/useCachedState';
import { supabase } from '@/integrations/supabase/client';

interface KeywordAnalysis {
  overallMatch: number;
  matchedKeywords: string[];
  missingKeywords: string[];
  suggestions: string[];
}

const KeywordMatcher = () => {
  const { toast } = useToast();
  const { isDarkMode } = useTheme();
  const [resumeText, setResumeText] = useCachedState<string>('km:resume', '');
  const [jobDescription, setJobDescription] = useCachedState<string>('km:jd', '');
  const [analysis, setAnalysis] = useCachedState<KeywordAnalysis | null>('km:analysis', null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [saving, setSaving] = useState(false);

  const saveAnalysis = async () => {
    if (!analysis) return;
    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({ title: 'Sign in required', variant: 'destructive' });
        return;
      }
      const titleMatch = jobDescription.match(/^(.{3,80})/);
      const { error } = await supabase.from('saved_keyword_analyses').insert({
        user_id: user.id,
        job_title: titleMatch ? titleMatch[1].trim() : 'Job description',
        overall_match: analysis.overallMatch,
        matched_keywords: analysis.matchedKeywords as any,
        missing_keywords: analysis.missingKeywords as any,
        suggestions: analysis.suggestions as any,
      });
      if (error) throw error;
      toast({ title: 'Saved', description: 'Keyword analysis stored in your library.' });
    } catch (e: any) {
      toast({ title: 'Save failed', description: e.message, variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const calculateSimilarity = (str1: string, str2: string): number => {
    const longer = str1.length > str2.length ? str1 : str2;
    const shorter = str1.length > str2.length ? str2 : str1;
    
    if (longer.length === 0) return 1.0;
    
    const editDistance = levenshteinDistance(longer, shorter);
    return (longer.length - editDistance) / longer.length;
  };

  const levenshteinDistance = (str1: string, str2: string): number => {
    const matrix = [];
    
    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i];
    }

    for (let j = 0; j <= str1.length; j++) {
      matrix[0][j] = j;
    }

    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
        }
      }
    }

    return matrix[str2.length][str1.length];
  };

  // Words that should NEVER be flagged as a missing keyword: PII, generic resume
  // boilerplate, months, pronouns, and common filler. Keeps recommendations
  // focused on actual job-relevant skills/terms.
  const NOISE_WORDS = new Set([
    'the','and','or','but','in','on','at','to','for','of','with','by','an','a','as','from','that','this',
    'is','are','was','were','be','been','being','have','has','had','do','does','did','will','would','could',
    'should','may','might','must','can','these','those','it','its','their','them','they','our','your','you',
    'we','i','he','she','his','her','him','my','me','mine','us',
    // resume boilerplate
    'resume','cv','curriculum','vitae','references','available','request','phone','email','address','street',
    'avenue','road','drive','suite','apt','apartment','city','state','zip','country','contact','linkedin',
    'github','portfolio','website','url','http','https','www','com','net','org','io','edu','gov',
    // months / dates
    'january','february','march','april','may','june','july','august','september','october','november','december',
    'jan','feb','mar','apr','jun','jul','aug','sep','sept','oct','nov','dec','present','current',
    // generic verbs / nouns
    'work','works','worked','working','job','jobs','role','roles','position','positions','company','companies',
    'team','teams','project','projects','task','tasks','responsibility','responsibilities','duties','duty',
    'experience','experiences','year','years','month','months','day','days','time','times',
  ]);

  // Strip PII patterns so they never end up as "missing keywords".
  const stripPII = (text: string): string => {
    return text
      .replace(/[\w.+-]+@[\w-]+\.[\w.-]+/g, ' ')                 // emails
      .replace(/\+?\d{1,3}[\s.-]?\(?\d{2,4}\)?[\s.-]?\d{3,4}[\s.-]?\d{3,4}/g, ' ') // phones (intl/US)
      .replace(/\b\d{3}[\s.-]?\d{3}[\s.-]?\d{4}\b/g, ' ')        // US 10-digit
      .replace(/https?:\/\/\S+/g, ' ')                            // URLs
      .replace(/\b\d+\s+[A-Za-z]+\s+(street|st|avenue|ave|road|rd|blvd|drive|dr|lane|ln|court|ct|way)\b\.?/gi, ' ') // street addresses
      .replace(/\b[A-Z]{2}\s+\d{5}(-\d{4})?\b/g, ' ')             // state + zip
      .replace(/\b\d{5}(-\d{4})?\b/g, ' ');                       // bare zips
  };

  const extractKeywords = (text: string): string[] => {
    return stripPII(text)
      .toLowerCase()
      .replace(/[^\w\s+#.]/g, ' ')           // keep + # . for things like C++, C#, Node.js
      .split(/\s+/)
      .map((w) => w.replace(/^\.+|\.+$/g, '')) // trim stray dots
      .filter((word) => word.length > 2 && !NOISE_WORDS.has(word) && !/^\d+$/.test(word))
      .filter((word, index, array) => array.indexOf(word) === index);
  };

  const calculateWordSimilarity = (word1: string, word2: string): number => {
    const w1 = word1.toLowerCase().trim();
    const w2 = word2.toLowerCase().trim();
    
    // Exact match gets full score
    if (w1 === w2) return 1.0;
    
    // Check substring matches (both directions)
    if (w1.includes(w2) || w2.includes(w1)) {
      const longer = w1.length > w2.length ? w1 : w2;
      const shorter = w1.length > w2.length ? w2 : w1;
      return Math.max(0.8, shorter.length / longer.length);
    }
    
    // Special handling for very short words - be more lenient
    if (w1.length <= 2 || w2.length <= 2) {
      // For very short words like "yo", check if they're similar
      if (Math.abs(w1.length - w2.length) <= 1) {
        const similarity = calculateSimilarity(w1, w2);
        return similarity > 0.5 ? similarity : 0.0;
      }
      return w1 === w2 ? 1.0 : 0.0;
    }
    
    // Use Levenshtein distance for longer words
    const similarity = calculateSimilarity(w1, w2);
    return similarity > 0.6 ? similarity : 0.0; // Lowered threshold for better matching
  };

  const findBestMatches = (resumeKeywords: string[], jobKeywords: string[]): { matched: string[], missing: string[], similarities: Map<string, number> } => {
    const matched: string[] = [];
    const missing: string[] = [];
    const similarities = new Map<string, number>();
    const threshold = 0.7; // 70% similarity threshold for better matching

    jobKeywords.forEach(jobKeyword => {
      let bestMatch = '';
      let bestSimilarity = 0;

      resumeKeywords.forEach(resumeKeyword => {
        const similarity = calculateWordSimilarity(jobKeyword, resumeKeyword);
        if (similarity > bestSimilarity) {
          bestSimilarity = similarity;
          bestMatch = resumeKeyword;
        }
      });

      similarities.set(jobKeyword, bestSimilarity);
      
      if (bestSimilarity >= threshold) {
        matched.push(jobKeyword);
      } else {
        missing.push(jobKeyword);
      }
    });

    return { matched, missing, similarities };
  };

  const analyzeKeywords = () => {
    if (!resumeText.trim() || !jobDescription.trim()) {
      toast({
        title: "Missing Content",
        description: "Please provide both resume text and job description.",
        variant: "destructive"
      });
      return;
    }

    setIsAnalyzing(true);

    setTimeout(() => {
      const resumeKeywords = extractKeywords(resumeText);
      const jobKeywords = extractKeywords(jobDescription);
      
      // Bidirectional matching - check both directions
      const resumeToJob = findBestMatches(resumeKeywords, jobKeywords);
      const jobToResume = findBestMatches(jobKeywords, resumeKeywords);
      
      // Combine results for comprehensive analysis
      const allMatched = [...new Set([...resumeToJob.matched, ...jobToResume.matched])];
      const allMissing = [...new Set([...resumeToJob.missing, ...jobToResume.missing])];
      
      // Calculate weighted match percentage from both directions
      let totalWeight = 0;
      let matchedWeight = 0;
      
      // Weight from resume to job
      resumeToJob.similarities.forEach((similarity, keyword) => {
        totalWeight += 1;
        matchedWeight += similarity;
      });
      
      // Weight from job to resume
      jobToResume.similarities.forEach((similarity, keyword) => {
        totalWeight += 1;
        matchedWeight += similarity;
      });
      
      const overallMatch = totalWeight > 0 ? Math.round((matchedWeight / totalWeight) * 100) : 0;
      
      // Generate contextual, specific suggestions
      const top = allMissing.slice(0, 6);
      const suggestions: string[] = [];

      if (top.length) {
        suggestions.push(
          `Weave these job-specific terms into your bullet points naturally: ${top.join(', ')}. Avoid keyword-stuffing — show each in context of a real accomplishment.`
        );
      }
      // Detect categories among missing terms for targeted advice
      const techIndicators = top.filter((w) => /\+|#|js|py|sql|aws|gcp|azure|node|react|kubernetes|docker/i.test(w));
      if (techIndicators.length) {
        suggestions.push(
          `Add a "Technical Skills" line that explicitly lists ${techIndicators.join(', ')} — recruiter ATS scans look for exact tool names.`
        );
      }
      if (overallMatch < 50) {
        suggestions.push(
          'Your match is low — rewrite your most recent role using the verbs and nouns from the job description (e.g., "led", "owned", "shipped") to mirror language.'
        );
      } else if (overallMatch < 75) {
        suggestions.push(
          'You\'re close. Move the 2–3 most relevant matched skills into the top third of your resume so they appear above the fold.'
        );
      } else {
        suggestions.push('Strong alignment. Add one quantified achievement (%, $, count) per bullet to stand out from other matches.');
      }
      suggestions.push('Replace generic phrases like "responsible for" with metrics-driven verbs ("reduced", "increased", "shipped").');

      setAnalysis({
        overallMatch,
        matchedKeywords: allMatched,
        missingKeywords: allMissing.slice(0, 20),
        suggestions: suggestions.slice(0, 5),
      });

      setIsAnalyzing(false);
      
      toast({
        title: "Analysis Complete!",
        description: `Match score: ${overallMatch}% based on keyword similarity analysis.`
      });
    }, 2000);
  };

  return (
    <div className={`space-y-6 ${isDarkMode ? 'dark' : ''}`}>
      <Card className="bg-white/70 dark:bg-gray-800/40 border-blue-300/40 dark:border-cyan-400/20 backdrop-blur-lg neon-border animate-fade-in">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-gray-900 dark:text-white">
            <Search className="w-5 h-5" />
            <span>Advanced Keyword Matcher</span>
          </CardTitle>
          <CardDescription className="text-gray-600 dark:text-gray-300">
            Analyze your resume against job descriptions with intelligent keyword matching and similarity scoring.
          </CardDescription>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-white/70 dark:bg-gray-800/40 border-blue-300/40 dark:border-cyan-400/20 backdrop-blur-lg neon-border">
          <CardHeader>
            <CardTitle className="text-lg text-gray-900 dark:text-white">Your Resume</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              value={resumeText}
              onChange={(e) => setResumeText(e.target.value)}
              placeholder="Paste your resume text here..."
              className="min-h-64 text-gray-900 dark:text-white bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600"
              rows={12}
            />
          </CardContent>
        </Card>

        <Card className="bg-white/70 dark:bg-gray-800/40 border-blue-300/40 dark:border-cyan-400/20 backdrop-blur-lg neon-border">
          <CardHeader>
            <CardTitle className="text-lg text-gray-900 dark:text-white">Job Description</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              placeholder="Paste the job description here..."
              className="min-h-64 text-gray-900 dark:text-white bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600"
              rows={12}
            />
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-center">
        <Button
          onClick={analyzeKeywords}
          disabled={isAnalyzing}
          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
          size="lg"
        >
          {isAnalyzing ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
              Analyzing Keywords...
            </>
          ) : (
            <>
              <Target className="w-5 h-5 mr-2" />
              Analyze Keyword Match
            </>
          )}
        </Button>
      </div>

      {analysis && (
        <Card className="bg-white/70 dark:bg-gray-800/40 border-blue-300/40 dark:border-cyan-400/20 backdrop-blur-lg neon-border">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-gray-900 dark:text-white">
              <TrendingUp className="w-5 h-5" />
              <span>Keyword Analysis Results</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center">
              <div className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
                {analysis.overallMatch}%
              </div>
              <p className="text-gray-600 dark:text-gray-300">Overall Match Score</p>
              <Progress value={analysis.overallMatch} className="mt-4" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
                  Matched Keywords ({analysis.matchedKeywords.length})
                </h3>
                <div className="flex flex-wrap gap-2">
                  {analysis.matchedKeywords.map((keyword, index) => (
                    <Badge key={index} variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                      {keyword}
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
                  Missing Keywords ({analysis.missingKeywords.length})
                </h3>
                <div className="flex flex-wrap gap-2">
                  {analysis.missingKeywords.slice(0, 10).map((keyword, index) => (
                    <Badge key={index} variant="outline" className="border-red-300 text-red-700 dark:border-red-600 dark:text-red-400">
                      {keyword}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Recommendations</h3>
              <ul className="space-y-2">
                {analysis.suggestions.map((suggestion, index) => (
                  <li key={index} className="flex items-start space-x-2 text-gray-600 dark:text-gray-300">
                    <span className="text-blue-500 mt-1">•</span>
                    <span>{suggestion}</span>
                  </li>
                ))}
              </ul>
            </div>

            <Button onClick={saveAnalysis} disabled={saving} variant="outline" className="w-full">
              <Save className="w-4 h-4 mr-2" />{saving ? 'Saving…' : 'Save Analysis to Library'}
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default KeywordMatcher;
