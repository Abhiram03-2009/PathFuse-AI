
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Search, Target, TrendingUp, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface KeywordAnalysis {
  keyword: string;
  inProfile: boolean;
  frequency: number;
  importance: 'high' | 'medium' | 'low';
}

const KeywordMatcher = () => {
  const { toast } = useToast();
  const [profile, setProfile] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [analysis, setAnalysis] = useState<KeywordAnalysis[]>([]);
  const [matchScore, setMatchScore] = useState(0);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const analyzeKeywords = async () => {
    setIsAnalyzing(true);
    
    // Simulate keyword analysis
    setTimeout(() => {
      const mockAnalysis: KeywordAnalysis[] = [
        { keyword: 'JavaScript', inProfile: true, frequency: 5, importance: 'high' },
        { keyword: 'React', inProfile: true, frequency: 3, importance: 'high' },
        { keyword: 'Node.js', inProfile: false, frequency: 4, importance: 'high' },
        { keyword: 'Python', inProfile: true, frequency: 2, importance: 'medium' },
        { keyword: 'Machine Learning', inProfile: false, frequency: 3, importance: 'high' },
        { keyword: 'API Development', inProfile: true, frequency: 2, importance: 'medium' },
        { keyword: 'Database Design', inProfile: false, frequency: 2, importance: 'medium' },
        { keyword: 'Agile', inProfile: true, frequency: 1, importance: 'low' },
        { keyword: 'Team Leadership', inProfile: false, frequency: 2, importance: 'medium' },
        { keyword: 'Problem Solving', inProfile: true, frequency: 1, importance: 'low' }
      ];

      const matchedKeywords = mockAnalysis.filter(k => k.inProfile).length;
      const totalKeywords = mockAnalysis.length;
      const score = Math.round((matchedKeywords / totalKeywords) * 100);

      setAnalysis(mockAnalysis);
      setMatchScore(score);
      setIsAnalyzing(false);
      
      toast({
        title: "Analysis Complete!",
        description: `Found ${matchedKeywords} matching keywords out of ${totalKeywords} total.`,
      });
    }, 2000);
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getImportanceColor = (importance: string) => {
    switch (importance) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Search className="w-5 h-5" />
            <span>Keyword Matcher</span>
          </CardTitle>
          <CardDescription>
            Analyze how well your profile matches job requirements. Get insights on missing keywords and optimization suggestions.
          </CardDescription>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Section */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Your Profile</CardTitle>
              <CardDescription>
                Paste your resume content or profile summary
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                value={profile}
                onChange={(e) => setProfile(e.target.value)}
                placeholder="Paste your resume content, LinkedIn summary, or professional profile here..."
                className="min-h-40"
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Job Description</CardTitle>
              <CardDescription>
                Paste the job description you want to match against
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                placeholder="Paste the job description here..."
                className="min-h-40"
              />
            </CardContent>
          </Card>

          <Button
            onClick={analyzeKeywords}
            disabled={isAnalyzing || !profile.trim() || !jobDescription.trim()}
            className="w-full bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700"
          >
            {isAnalyzing ? (
              <>
                <Target className="w-4 h-4 mr-2 animate-spin" />
                Analyzing Keywords...
              </>
            ) : (
              <>
                <Target className="w-4 h-4 mr-2" />
                Analyze Keywords
              </>
            )}
          </Button>
        </div>

        {/* Results Section */}
        <div className="space-y-6">
          {analysis.length > 0 && (
            <>
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center justify-between">
                    <span>Match Score</span>
                    <span className={`text-2xl font-bold ${getScoreColor(matchScore)}`}>
                      {matchScore}%
                    </span>
                  </CardTitle>
                  <CardDescription>
                    How well your profile matches the job requirements
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Progress value={matchScore} className="mb-4" />
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <div className="text-2xl font-bold text-green-600">
                        {analysis.filter(k => k.inProfile).length}
                      </div>
                      <div className="text-sm text-gray-600">Matched</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-red-600">
                        {analysis.filter(k => !k.inProfile).length}
                      </div>
                      <div className="text-sm text-gray-600">Missing</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-blue-600">
                        {analysis.length}
                      </div>
                      <div className="text-sm text-gray-600">Total</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Keyword Analysis</CardTitle>
                  <CardDescription>
                    Detailed breakdown of keywords found in the job description
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {analysis.map((item, index) => (
                      <div
                        key={index}
                        className={`flex items-center justify-between p-3 rounded-lg border ${
                          item.inProfile ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <div className={`w-3 h-3 rounded-full ${
                            item.inProfile ? 'bg-green-500' : 'bg-red-500'
                          }`} />
                          <span className="font-medium">{item.keyword}</span>
                          <Badge variant="outline" className={getImportanceColor(item.importance)}>
                            {item.importance}
                          </Badge>
                        </div>
                        <div className="text-sm text-gray-600">
                          {item.frequency} times
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center space-x-2">
                    <TrendingUp className="w-5 h-5" />
                    <span>Recommendations</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {analysis.filter(k => !k.inProfile && k.importance === 'high').length > 0 && (
                      <div className="flex items-start space-x-3 p-3 bg-red-50 rounded-lg border border-red-200">
                        <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
                        <div>
                          <h4 className="font-medium text-red-800">High Priority Missing Keywords</h4>
                          <p className="text-sm text-red-700 mt-1">
                            Consider adding these important keywords to your profile: {' '}
                            {analysis
                              .filter(k => !k.inProfile && k.importance === 'high')
                              .map(k => k.keyword)
                              .join(', ')}
                          </p>
                        </div>
                      </div>
                    )}
                    
                    <div className="space-y-2 text-sm">
                      <p>• Add missing high-priority keywords to your resume</p>
                      <p>• Include relevant experience that demonstrates these skills</p>
                      <p>• Consider taking courses to gain missing competencies</p>
                      <p>• Update your LinkedIn profile with matched keywords</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          )}

          {analysis.length === 0 && (
            <Card>
              <CardContent className="text-center py-12">
                <Search className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 mb-2">No analysis yet</p>
                <p className="text-sm text-gray-500">Add your profile and job description to see keyword analysis</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default KeywordMatcher;
