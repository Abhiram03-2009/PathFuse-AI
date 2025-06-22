
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Briefcase, Building, MapPin, TrendingUp, Star, DollarSign } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface CompanyMatch {
  name: string;
  logo: string;
  matchScore: number;
  salaryRange: string;
  location: string;
  jobTitle: string;
  requirements: string[];
  benefits: string[];
  matchReasons: string[];
  growthPotential: number;
}

const JobAnalyzer = () => {
  const { toast } = useToast();
  const [userProfile, setUserProfile] = useState('');
  const [preferences, setPreferences] = useState({
    location: '',
    salaryMin: '',
    jobType: '',
    industry: ''
  });
  const [companyMatches, setCompanyMatches] = useState<CompanyMatch[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const analyzeJobs = async () => {
    setIsAnalyzing(true);
    
    // Simulate job analysis
    setTimeout(() => {
      const mockMatches: CompanyMatch[] = [
        {
          name: 'Google',
          logo: '🟦',
          matchScore: 92,
          salaryRange: '$120k - $180k',
          location: 'Mountain View, CA',
          jobTitle: 'Senior Software Engineer',
          requirements: ['JavaScript', 'React', 'Node.js', 'Python'],
          benefits: ['Health Insurance', 'Stock Options', '401k', 'Remote Work'],
          matchReasons: ['Strong React experience', 'Previous startup experience', 'Open source contributions'],
          growthPotential: 95
        },
        {
          name: 'Microsoft',
          logo: '🟨',
          matchScore: 88,
          salaryRange: '$110k - $170k',
          location: 'Seattle, WA',
          jobTitle: 'Full Stack Developer',
          requirements: ['TypeScript', 'Azure', 'C#', 'React'],
          benefits: ['Health Insurance', 'Stock Purchase Plan', 'Learning Budget'],
          matchReasons: ['TypeScript expertise', 'Cloud experience', 'Team leadership skills'],
          growthPotential: 90
        },
        {
          name: 'Meta',
          logo: '🔵',
          matchScore: 85,
          salaryRange: '$125k - $190k',
          location: 'Menlo Park, CA',
          jobTitle: 'Frontend Engineer',
          requirements: ['React', 'GraphQL', 'JavaScript', 'Mobile Development'],
          benefits: ['Health Insurance', 'RSUs', 'Wellness Programs', 'Free Meals'],
          matchReasons: ['React expertise', 'Mobile app development', 'UI/UX skills'],
          growthPotential: 88
        },
        {
          name: 'Apple',
          logo: '🍎',
          matchScore: 82,
          salaryRange: '$115k - $175k',
          location: 'Cupertino, CA',
          jobTitle: 'iOS Developer',
          requirements: ['Swift', 'iOS', 'Objective-C', 'UI/UX'],
          benefits: ['Health Insurance', 'Stock Purchase Plan', 'Employee Discounts'],
          matchReasons: ['Mobile development experience', 'Design skills', 'Attention to detail'],
          growthPotential: 85
        },
        {
          name: 'Amazon',
          logo: '📦',
          matchScore: 78,
          salaryRange: '$105k - $160k',
          location: 'Seattle, WA',
          jobTitle: 'Software Development Engineer',
          requirements: ['Java', 'AWS', 'Python', 'Distributed Systems'],
          benefits: ['Health Insurance', 'Stock Options', '401k'],
          matchReasons: ['Backend development', 'Scalable systems', 'Problem solving'],
          growthPotential: 82
        }
      ];

      setCompanyMatches(mockMatches);
      setIsAnalyzing(false);
      
      toast({
        title: "Analysis Complete!",
        description: `Found ${mockMatches.length} potential job matches at top companies.`,
      });
    }, 2500);
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600 bg-green-50';
    if (score >= 80) return 'text-blue-600 bg-blue-50';
    if (score >= 70) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Briefcase className="w-5 h-5" />
            <span>Job Match Analyzer</span>
          </CardTitle>
          <CardDescription>
            Analyze your profile against top companies and get percentage match scores with detailed insights.
          </CardDescription>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Input Section */}
        <div className="lg:col-span-1 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Your Profile</CardTitle>
              <CardDescription>
                Tell us about your skills and experience
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                value={userProfile}
                onChange={(e) => setUserProfile(e.target.value)}
                placeholder="Describe your skills, experience, and background..."
                className="min-h-32"
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Preferences</CardTitle>
              <CardDescription>
                Help us find the right matches
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Input
                  placeholder="Preferred location"
                  value={preferences.location}
                  onChange={(e) => setPreferences({...preferences, location: e.target.value})}
                />
              </div>
              <div>
                <Input
                  placeholder="Minimum salary"
                  value={preferences.salaryMin}
                  onChange={(e) => setPreferences({...preferences, salaryMin: e.target.value})}
                />
              </div>
              <div>
                <Input
                  placeholder="Job type (e.g., Full-time)"
                  value={preferences.jobType}
                  onChange={(e) => setPreferences({...preferences, jobType: e.target.value})}
                />
              </div>
              <div>
                <Input
                  placeholder="Industry preference"
                  value={preferences.industry}
                  onChange={(e) => setPreferences({...preferences, industry: e.target.value})}
                />
              </div>
            </CardContent>
          </Card>

          <Button
            onClick={analyzeJobs}
            disabled={isAnalyzing || !userProfile.trim()}
            className="w-full bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700"
          >
            {isAnalyzing ? (
              <>
                <TrendingUp className="w-4 h-4 mr-2 animate-spin" />
                Analyzing Jobs...
              </>
            ) : (
              <>
                <TrendingUp className="w-4 h-4 mr-2" />
                Analyze Job Matches
              </>
            )}
          </Button>
        </div>

        {/* Results Section */}
        <div className="lg:col-span-2">
          {companyMatches.length > 0 ? (
            <div className="space-y-4">
              {companyMatches.map((match, index) => (
                <Card key={index} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="text-2xl">{match.logo}</div>
                        <div>
                          <CardTitle className="text-lg">{match.name}</CardTitle>
                          <CardDescription>{match.jobTitle}</CardDescription>
                        </div>
                      </div>
                      <div className={`px-3 py-1 rounded-full font-bold text-lg ${getScoreColor(match.matchScore)}`}>
                        {match.matchScore}%
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="flex items-center space-x-2">
                        <DollarSign className="w-4 h-4 text-green-600" />
                        <span className="text-sm">{match.salaryRange}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <MapPin className="w-4 h-4 text-blue-600" />
                        <span className="text-sm">{match.location}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Star className="w-4 h-4 text-yellow-600" />
                        <span className="text-sm">Growth: {match.growthPotential}%</span>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium mb-2">Match Score Breakdown</h4>
                      <Progress value={match.matchScore} className="mb-2" />
                      <div className="grid grid-cols-2 gap-2">
                        <div className="text-sm">
                          <span className="text-gray-600">Skills Match:</span> {match.matchScore - 5}%
                        </div>
                        <div className="text-sm">
                          <span className="text-gray-600">Experience:</span> {match.matchScore + 3}%
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium mb-2">Why you're a good match:</h4>
                      <div className="space-y-1">
                        {match.matchReasons.map((reason, idx) => (
                          <div key={idx} className="flex items-center space-x-2">
                            <div className="w-2 h-2 bg-green-500 rounded-full" />
                            <span className="text-sm text-gray-700">{reason}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-medium mb-2">Key Requirements:</h4>
                        <div className="flex flex-wrap gap-1">
                          {match.requirements.map((req, idx) => (
                            <Badge key={idx} variant="outline" className="text-xs">
                              {req}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <div>
                        <h4 className="font-medium mb-2">Benefits:</h4>
                        <div className="flex flex-wrap gap-1">
                          {match.benefits.map((benefit, idx) => (
                            <Badge key={idx} variant="secondary" className="text-xs">
                              {benefit}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="flex space-x-2">
                      <Button size="sm" className="flex-1">
                        View Job Details
                      </Button>
                      <Button size="sm" variant="outline" className="flex-1">
                        Save Job
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="text-center py-12">
                <Building className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 mb-2">No job analysis yet</p>
                <p className="text-sm text-gray-500">Add your profile information to see company matches</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default JobAnalyzer;
