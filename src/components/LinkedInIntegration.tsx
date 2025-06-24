
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Linkedin, Upload, Download, Sparkles, User, Briefcase, GraduationCap } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

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
  const [linkedInUrl, setLinkedInUrl] = useState('');
  const [profileData, setProfileData] = useState<LinkedInProfile | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [resumeText, setResumeText] = useState('');
  const [analysisResult, setAnalysisResult] = useState('');

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

    // Simulate LinkedIn profile analysis
    setTimeout(() => {
      const mockProfile: LinkedInProfile = {
        name: "John Smith",
        headline: "Senior Software Engineer | Full Stack Developer | React & Node.js Expert",
        summary: "Passionate software engineer with 5+ years of experience building scalable web applications. Expertise in React, Node.js, and cloud technologies. Led multiple cross-functional teams to deliver high-impact products.",
        experience: [
          {
            title: "Senior Software Engineer",
            company: "Tech Corp",
            duration: "2022 - Present",
            description: "Led development of microservices architecture, improved system performance by 40%, mentored junior developers"
          },
          {
            title: "Software Engineer",
            company: "StartupXYZ",
            duration: "2020 - 2022",
            description: "Developed full-stack web applications using React and Node.js, implemented CI/CD pipelines"
          }
        ],
        education: [
          {
            school: "University of Technology",
            degree: "Bachelor of Science",
            field: "Computer Science",
            year: "2020"
          }
        ],
        skills: ["JavaScript", "React", "Node.js", "Python", "AWS", "Docker", "MongoDB", "PostgreSQL", "Git", "Agile"]
      };

      setProfileData(mockProfile);
      setIsAnalyzing(false);
      
      toast({
        title: "Profile Analyzed!",
        description: "LinkedIn profile data has been extracted and analyzed"
      });
    }, 3000);
  };

  const generateOptimizedResume = () => {
    if (!profileData) return;

    const optimizedResume = `${profileData.name}
${profileData.headline}

PROFESSIONAL SUMMARY
${profileData.summary}

WORK EXPERIENCE
${profileData.experience.map(exp => 
  `${exp.title} at ${exp.company} (${exp.duration})
${exp.description}`
).join('\n\n')}

EDUCATION
${profileData.education.map(edu => 
  `${edu.degree} in ${edu.field} - ${edu.school} (${edu.year})`
).join('\n')}

TECHNICAL SKILLS
${profileData.skills.join(' • ')}

KEY ACHIEVEMENTS
• Demonstrated leadership in cross-functional team environments
• Proven track record of delivering scalable software solutions
• Strong problem-solving abilities with focus on performance optimization
• Experience with modern development practices and cloud technologies`;

    setResumeText(optimizedResume);
    
    toast({
      title: "Resume Generated!",
      description: "Optimized resume created from your LinkedIn profile"
    });
  };

  const analyzeProfileStrengths = () => {
    if (!profileData) return;

    const analysis = `LINKEDIN PROFILE ANALYSIS

STRENGTHS:
✅ Strong professional headline that includes key technologies
✅ Comprehensive summary highlighting years of experience
✅ Quantified achievements (40% performance improvement)
✅ Diverse skill set covering both frontend and backend technologies
✅ Leadership experience mentioned
✅ Educational background aligns with career path

RECOMMENDATIONS FOR IMPROVEMENT:
🔧 Add more specific metrics and numbers to experience descriptions
🔧 Include certifications or recent courses to show continuous learning
🔧 Add volunteer work or side projects to demonstrate passion
🔧 Request more recommendations from colleagues
🔧 Update skills section with latest technologies
🔧 Add industry keywords for better searchability

KEYWORD OPTIMIZATION:
Your profile includes good technical keywords like React, Node.js, AWS. Consider adding:
- "Microservices Architecture"
- "DevOps"
- "API Development"
- "Database Design"
- "Team Leadership"

ATS COMPATIBILITY SCORE: 85/100
Your profile is well-optimized for Applicant Tracking Systems with good keyword density and clear structure.`;

    setAnalysisResult(analysis);
    
    toast({
      title: "Analysis Complete!",
      description: "Detailed profile analysis generated with improvement suggestions"
    });
  };

  return (
    <div className="space-y-6">
      <Card className="bg-white border-gray-200">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-gray-900">
            <Linkedin className="w-5 h-5 text-blue-600" />
            <span>LinkedIn Profile Analyzer</span>
          </CardTitle>
          <CardDescription className="text-gray-600">
            Analyze your LinkedIn profile and generate optimized resumes with AI-powered insights.
          </CardDescription>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* LinkedIn Input */}
        <Card className="bg-white border-gray-200">
          <CardHeader>
            <CardTitle className="text-lg text-gray-900">Profile Analysis</CardTitle>
            <CardDescription className="text-gray-600">
              Enter your LinkedIn profile URL to get started
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="linkedinUrl" className="text-gray-700">LinkedIn Profile URL</Label>
              <Input
                id="linkedinUrl"
                value={linkedInUrl}
                onChange={(e) => setLinkedInUrl(e.target.value)}
                placeholder="https://www.linkedin.com/in/yourprofile"
                className="text-gray-900 border-gray-300"
              />
            </div>

            <Button 
              onClick={analyzeLinkedInProfile}
              disabled={isAnalyzing || !linkedInUrl}
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              {isAnalyzing ? (
                <>
                  <Sparkles className="w-4 h-4 mr-2 animate-spin" />
                  Analyzing Profile...
                </>
              ) : (
                <>
                  <Linkedin className="w-4 h-4 mr-2" />
                  Analyze LinkedIn Profile
                </>
              )}
            </Button>

            {profileData && (
              <div className="space-y-4 pt-4 border-t">
                <div className="flex items-center space-x-2">
                  <User className="w-4 h-4 text-gray-600" />
                  <span className="font-medium text-gray-900">{profileData.name}</span>
                </div>
                <p className="text-sm text-gray-600">{profileData.headline}</p>
                
                <div className="space-y-2">
                  <h4 className="font-medium text-gray-900 flex items-center">
                    <Briefcase className="w-4 h-4 mr-2" />
                    Experience
                  </h4>
                  {profileData.experience.slice(0, 2).map((exp, index) => (
                    <div key={index} className="text-sm text-gray-600 pl-6">
                      <div className="font-medium">{exp.title}</div>
                      <div>{exp.company} • {exp.duration}</div>
                    </div>
                  ))}
                </div>

                <div className="space-y-2">
                  <h4 className="font-medium text-gray-900 flex items-center">
                    <GraduationCap className="w-4 h-4 mr-2" />
                    Education
                  </h4>
                  {profileData.education.map((edu, index) => (
                    <div key={index} className="text-sm text-gray-600 pl-6">
                      {edu.degree} in {edu.field} - {edu.school}
                    </div>
                  ))}
                </div>

                <div className="space-y-2">
                  <h4 className="font-medium text-gray-900">Top Skills</h4>
                  <div className="flex flex-wrap gap-2">
                    {profileData.skills.slice(0, 6).map((skill, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="flex space-x-2 pt-2">
                  <Button onClick={generateOptimizedResume} size="sm" className="flex-1">
                    <Download className="w-4 h-4 mr-2" />
                    Generate Resume
                  </Button>
                  <Button onClick={analyzeProfileStrengths} size="sm" variant="outline" className="flex-1">
                    <Sparkles className="w-4 h-4 mr-2" />
                    Analyze Profile
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Results */}
        <Card className="bg-white border-gray-200">
          <CardHeader>
            <CardTitle className="text-lg text-gray-900">AI Analysis Results</CardTitle>
            <CardDescription className="text-gray-600">
              Generated content and insights from your LinkedIn profile
            </CardDescription>
          </CardHeader>
          <CardContent>
            {resumeText || analysisResult ? (
              <div className="space-y-4">
                <div className="bg-gray-50 p-4 rounded-lg border max-h-96 overflow-y-auto">
                  <pre className="whitespace-pre-wrap text-sm text-gray-900 font-sans">
                    {resumeText || analysisResult}
                  </pre>
                </div>
                <div className="flex space-x-2">
                  <Button 
                    onClick={() => navigator.clipboard.writeText(resumeText || analysisResult)}
                    variant="outline" 
                    className="flex-1 text-gray-700 border-gray-300"
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Copy to Clipboard
                  </Button>
                  <Button variant="outline" className="flex-1 text-gray-700 border-gray-300">
                    <Download className="w-4 h-4 mr-2" />
                    Export PDF
                  </Button>
                </div>
              </div>
            ) : (
              <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-8 text-center min-h-96 flex items-center justify-center">
                <div>
                  <Linkedin className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 mb-2">Analysis results will appear here</p>
                  <p className="text-sm text-gray-500">Enter your LinkedIn URL and click analyze to get started</p>
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
