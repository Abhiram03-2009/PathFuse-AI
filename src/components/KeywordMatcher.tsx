
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Search, Target, TrendingUp } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useTheme } from '@/contexts/ThemeContext';

interface KeywordAnalysis {
  overallMatch: number;
  matchedKeywords: string[];
  missingKeywords: string[];
  suggestions: string[];
}

const KeywordMatcher = () => {
  const { toast } = useToast();
  const { isDarkMode } = useTheme();
  const [resumeText, setResumeText] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [analysis, setAnalysis] = useState<KeywordAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

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

  const extractKeywords = (text: string): string[] => {
    const commonWords = new Set([
      'the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'an', 'a',
      'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did',
      'will', 'would', 'could', 'should', 'may', 'might', 'must', 'can', 'this', 'that', 'these', 'those'
    ]);

    return text
      .toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 2 && !commonWords.has(word))
      .filter((word, index, array) => array.indexOf(word) === index);
  };

  const calculateWordSimilarity = (word1: string, word2: string): number => {
    // Exact match
    if (word1.toLowerCase() === word2.toLowerCase()) return 1.0;
    
    // Check if one word contains the other
    const longer = word1.length > word2.length ? word1.toLowerCase() : word2.toLowerCase();
    const shorter = word1.length > word2.length ? word2.toLowerCase() : word1.toLowerCase();
    
    if (longer.includes(shorter)) {
      return shorter.length / longer.length;
    }
    
    // Use Levenshtein distance for character-level similarity
    return calculateSimilarity(word1, word2);
  };

  const findBestMatches = (resumeKeywords: string[], jobKeywords: string[]): { matched: string[], missing: string[], similarities: Map<string, number> } => {
    const matched: string[] = [];
    const missing: string[] = [];
    const similarities = new Map<string, number>();
    const threshold = 0.6; // 60% similarity threshold for more accurate matching

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
      
      const { matched, missing, similarities } = findBestMatches(resumeKeywords, jobKeywords);
      
      // Calculate weighted match percentage based on similarity scores
      let totalWeight = 0;
      let matchedWeight = 0;
      
      similarities.forEach((similarity, keyword) => {
        totalWeight += 1;
        matchedWeight += similarity;
      });
      
      const overallMatch = totalWeight > 0 ? Math.round((matchedWeight / totalWeight) * 100) : 0;
      
      // Generate contextual suggestions based on missing keywords
      const suggestions = [];
      if (missing.length > 0) {
        suggestions.push(`Add these missing keywords: ${missing.slice(0, 5).join(', ')}`);
      }
      if (overallMatch < 70) {
        suggestions.push("Consider restructuring your resume to better align with job requirements");
        suggestions.push("Include more specific technical skills and tools mentioned in the posting");
      }
      if (matched.length > 0) {
        suggestions.push("Emphasize and expand on your existing relevant skills");
      }
      suggestions.push("Use quantifiable achievements to demonstrate your impact");
      suggestions.push("Include relevant certifications or continuing education");

      setAnalysis({
        overallMatch,
        matchedKeywords: matched,
        missingKeywords: missing.slice(0, 20), // Limit to top 20 missing keywords
        suggestions: suggestions.slice(0, 5)
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
      <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700">
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
        <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700">
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

        <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700">
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
        <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700">
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
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default KeywordMatcher;
