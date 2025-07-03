
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Linkedin, Upload, Download, Sparkles, User, Briefcase, GraduationCap, ExternalLink } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useTheme } from '@/contexts/ThemeContext';
import { supabase } from '@/integrations/supabase/client';

interface LinkedInProfile {
  name: string;
  headline: string;
  summary: string;
  experience: Array<{
    title: string;
    company: string;
    duration: string;
    description: string;
  }>;
  education: Array<{
    school: string;
    degree: string;
    field: string;
    year: string;
  }>;
  skills: string[];
}

const LinkedInIntegration = () => {
  const { toast } = useToast();
  const { isDarkMode } = useTheme();
  const [linkedInUrl, setLinkedInUrl] = useState('');
  const [profileData, setProfileData] = useState<LinkedInProfile | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [resumeText, setResumeText] = useState('');
  const [analysisResult, setAnalysisResult] = useState('');

  const extractUsernameFromUrl = (url: string): string => {
    const match = url.match(/linkedin\.com\/in\/([^\/\?]+)/);
    return match ? match[1] : '';
  };

  const analyzeLinkedInProfile = async () => {
    if (!linkedInUrl.includes('linkedin.com')) {
      toast({
        title: "Invalid URL",
        description: "Please enter a valid LinkedIn profile URL",
        variant: "destructive"
      });
      return;
    }

    setIsAnalyzing(true);

    try {
      console.log('Sending LinkedIn analysis request');
      
      const { data, error } = await supabase.functions.invoke('linkedin-backend', {
        body: { 
          action: 'analyze_profile',
          linkedInUrl
        }
      });

      console.log('LinkedIn analysis response received:', { data, error });

      if (error) {
        console.error('Supabase function error:', error);
        throw new Error(error.message || 'Failed to analyze LinkedIn profile');
      }

      if (!data || !data.profile) {
        throw new Error('No profile data received');
      }

      setProfileData(data.profile);
      
      toast({
        title: "Profile Analyzed!",
        description: "LinkedIn profile data has been extracted and analyzed with AI-powered insights"
      });
    } catch (error) {
      console.error('LinkedIn analysis error:', error);
      toast({
        title: "Analysis Error",
        description: "Failed to analyze LinkedIn profile. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const openLinkedInProfile = () => {
    if (linkedInUrl) {
      window.open(linkedInUrl, '_blank', 'noopener,noreferrer');
    }
  };

  const generateOptimizedResume = async () => {
    if (!profileData) return;

    try {
      console.log('Generating optimized resume');
      
      const { data, error } = await supabase.functions.invoke('linkedin-backend', {
        body: { 
          action: 'generate_resume',
          profileData
        }
      });

      console.log('Resume generation response received:', { data, error });

      if (error) {
        console.error('Supabase function error:', error);
        throw new Error(error.message || 'Failed to generate resume');
      }

      if (!data || !data.resumeText) {
        throw new Error('No resume text received');
      }

      setResumeText(data.resumeText);
      
      toast({
        title: "Resume Generated!",
        description: "AI-optimized resume created from LinkedIn profile with enhanced formatting"
      });
    } catch (error) {
      console.error('Resume generation error:', error);
      toast({
        title: "Generation Error",
        description: "Failed to generate resume. Please try again.",
        variant: "destructive"
      });
    }
  };

  const analyzeProfileStrengths = async () => {
    if (!profileData) return;

    try {
      console.log('Generating career insights');
      
      const { data, error } = await supabase.functions.invoke('linkedin-backend', {
        body: { 
          action: 'career_insights',
          profileData
        }
      });

      console.log('Career insights response received:', { data, error });

      if (error) {
        console.error('Supabase function error:', error);
        throw new Error(error.message || 'Failed to generate career insights');
      }

      if (!data || !data.analysis) {
        throw new Error('No analysis received');
      }

      setAnalysisResult(data.analysis);
      
      toast({
        title: "Analysis Complete!",
        description: "AI-powered career insights generated with market data and recommendations"
      });
    } catch (error) {
      console.error('Career insights error:', error);
      toast({
        title: "Analysis Error",
        description: "Failed to generate career insights. Please try again.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className={`space-y-6 ${isDarkMode ? 'dark' : ''}`}>
      <Card className={`${isDarkMode ? 'bg-gray-800/40 border-cyan-400/20' : 'bg-white border-blue-300/40'} backdrop-blur-lg border neon-border`}>
        <CardHeader>
          <CardTitle className={`flex items-center space-x-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            <Linkedin className="w-5 h-5 text-blue-600" />
            <span>LinkedIn Profile Analyzer</span>
          </CardTitle>
          <CardDescription className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            Analyze LinkedIn profiles and generate optimized resumes with comprehensive AI-powered insights and recommendations.
          </CardDescription>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* LinkedIn Input */}
        <Card className={`${isDarkMode ? 'bg-gray-800/40 border-cyan-400/20' : 'bg-white border-blue-300/40'} backdrop-blur-lg border neon-border`}>
          <CardHeader>
            <CardTitle className={`text-lg ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Profile Analysis</CardTitle>
            <CardDescription className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              Enter a LinkedIn profile URL to analyze and extract insights
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="linkedinUrl" className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>LinkedIn Profile URL</Label>
              <Input
                id="linkedinUrl"
                value={linkedInUrl}
                onChange={(e) => setLinkedInUrl(e.target.value)}
                placeholder="https://www.linkedin.com/in/username"
                className={`${
                  isDarkMode 
                    ? 'bg-gray-900/50 border-cyan-400/30 text-white placeholder-gray-400' 
                    : 'bg-white border-blue-300/50 text-gray-900 placeholder-gray-500'
                }`}
              />
            </div>

            <div className="flex space-x-2">
              <Button 
                onClick={analyzeLinkedInProfile}
                disabled={isAnalyzing || !linkedInUrl}
                className="flex-1 bg-blue-600 hover:bg-blue-700"
              >
                {isAnalyzing ? (
                  <>
                    <Sparkles className="w-4 h-4 mr-2 animate-spin" />
                    Analyzing Profile...
                  </>
                ) : (
                  <>
                    <Linkedin className="w-4 h-4 mr-2" />
                    Analyze Profile
                  </>
                )}
              </Button>
              {linkedInUrl && (
                <Button 
                  onClick={openLinkedInProfile}
                  variant="outline"
                  className={`${
                    isDarkMode 
                      ? 'border-cyan-400/30 text-cyan-300 hover:bg-cyan-400/10' 
                      : 'border-blue-300/50 text-blue-600 hover:bg-blue-400/10'
                  }`}
                >
                  <ExternalLink className="w-4 h-4" />
                </Button>
              )}
            </div>

            {profileData && (
              <div className="space-y-4 pt-4 border-t border-cyan-400/20">
                <div className="flex items-center space-x-2">
                  <User className={`w-4 h-4 ${isDarkMode ? 'text-cyan-400' : 'text-blue-600'}`} />
                  <span className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{profileData.name}</span>
                </div>
                <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>{profileData.headline}</p>
                
                <div className="space-y-2">
                  <h4 className={`font-medium flex items-center ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    <Briefcase className="w-4 h-4 mr-2" />
                    Experience
                  </h4>
                  {profileData.experience.slice(0, 2).map((exp, index) => (
                    <div key={index} className={`text-sm pl-6 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                      <div className="font-medium">{exp.title}</div>
                      <div>{exp.company} • {exp.duration}</div>
                    </div>
                  ))}
                </div>

                <div className="space-y-2">
                  <h4 className={`font-medium flex items-center ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    <GraduationCap className="w-4 h-4 mr-2" />
                    Education
                  </h4>
                  {profileData.education.map((edu, index) => (
                    <div key={index} className={`text-sm pl-6 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                      {edu.degree} in {edu.field} - {edu.school}
                    </div>
                  ))}
                </div>

                <div className="space-y-2">
                  <h4 className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Top Skills</h4>
                  <div className="flex flex-wrap gap-2">
                    {profileData.skills.slice(0, 8).map((skill, index) => (
                      <Badge key={index} variant="secondary" className={`text-xs ${
                        isDarkMode 
                          ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400/30' 
                          : 'bg-blue-500/20 text-blue-600 border-blue-400/40'
                      }`}>
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="flex space-x-2 pt-2">
                  <Button onClick={generateOptimizedResume} size="sm" className="flex-1 bg-green-600 hover:bg-green-700">
                    <Download className="w-4 h-4 mr-2" />
                    Generate Resume
                  </Button>
                  <Button onClick={analyzeProfileStrengths} size="sm" variant="outline" className={`flex-1 ${
                    isDarkMode 
                      ? 'border-cyan-400/30 text-cyan-300 hover:bg-cyan-400/10' 
                      : 'border-blue-300/50 text-blue-600 hover:bg-blue-400/10'
                  }`}>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Analyze Profile
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Results */}
        <Card className={`${isDarkMode ? 'bg-gray-800/40 border-cyan-400/20' : 'bg-white border-blue-300/40'} backdrop-blur-lg border neon-border`}>
          <CardHeader>
            <CardTitle className={`text-lg ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>AI Analysis Results</CardTitle>
            <CardDescription className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              Generated content and insights from LinkedIn profile analysis
            </CardDescription>
          </CardHeader>
          <CardContent>
            {resumeText || analysisResult ? (
              <div className="space-y-4">
                <div className={`${
                  isDarkMode ? 'bg-gray-900/50' : 'bg-gray-50'
                } p-4 rounded-lg border max-h-96 overflow-y-auto`}>
                  <pre className={`whitespace-pre-wrap text-sm font-sans ${
                    isDarkMode ? 'text-gray-200' : 'text-gray-900'
                  }`}>
                    {resumeText || analysisResult}
                  </pre>
                </div>
                <div className="flex space-x-2">
                  <Button 
                    onClick={() => navigator.clipboard.writeText(resumeText || analysisResult)}
                    variant="outline" 
                    className={`flex-1 ${
                      isDarkMode 
                        ? 'border-cyan-400/30 text-cyan-300 hover:bg-cyan-400/10' 
                        : 'border-blue-300/50 text-blue-600 hover:bg-blue-400/10'
                    }`}
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Copy to Clipboard
                  </Button>
                  <Button variant="outline" className={`flex-1 ${
                    isDarkMode 
                      ? 'border-cyan-400/30 text-cyan-300 hover:bg-cyan-400/10' 
                      : 'border-blue-300/50 text-blue-600 hover:bg-blue-400/10'
                  }`}>
                    <Download className="w-4 h-4 mr-2" />
                    Export PDF
                  </Button>
                </div>
              </div>
            ) : (
              <div className={`${
                isDarkMode 
                  ? 'bg-gray-900/20 border-2 border-dashed border-cyan-400/30' 
                  : 'bg-blue-50/30 border-2 border-dashed border-blue-300/50'
              } rounded-lg p-8 text-center min-h-96 flex items-center justify-center`}>
                <div>
                  <Linkedin className={`w-16 h-16 mx-auto mb-4 ${isDarkMode ? 'text-cyan-400' : 'text-blue-500'}`} />
                  <p className={`mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Analysis results will appear here</p>
                  <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Enter a LinkedIn URL and click analyze to get started</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default LinkedInIntegration;
