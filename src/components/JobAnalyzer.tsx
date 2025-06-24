
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Briefcase, Building2, MapPin, DollarSign, Clock, Users, Star, BookmarkPlus, Eye } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface JobMatch {
  id: string;
  title: string;
  company: string;
  location: string;
  salary: string;
  type: string;
  experience: string;
  skills: string[];
  description: string;
  matchPercentage: number;
  postedDays: number;
  applicants: number;
  saved: boolean;
}

const JobAnalyzer = () => {
  const { toast } = useToast();
  const [userSkills, setUserSkills] = useState('');
  const [selectedIndustry, setSelectedIndustry] = useState('');
  const [location, setLocation] = useState('');
  const [jobMatches, setJobMatches] = useState<JobMatch[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [selectedJob, setSelectedJob] = useState<JobMatch | null>(null);
  const [showJobDetails, setShowJobDetails] = useState(false);

  const industries = [
    'Technology',
    'Healthcare',
    'Finance',
    'Education',
    'Marketing',
    'Sales',
    'Human Resources',
    'Engineering',
    'Design',
    'Consulting',
    'Manufacturing',
    'Retail',
    'Real Estate',
    'Legal',
    'Media & Communications',
    'Non-profit',
    'Government',
    'Energy',
    'Transportation',
    'Hospitality'
  ];

  const generateJobMatches = (skills: string, industry: string, location: string): JobMatch[] => {
    const companies = [
      'Google', 'Microsoft', 'Apple', 'Amazon', 'Meta', 'Netflix', 'Tesla', 'Spotify',
      'Airbnb', 'Uber', 'LinkedIn', 'Twitter', 'Adobe', 'Salesforce', 'Oracle',
      'IBM', 'Intel', 'NVIDIA', 'PayPal', 'Square', 'Dropbox', 'Slack'
    ];

    const jobTitles = {
      'Technology': ['Software Engineer', 'Data Scientist', 'Product Manager', 'DevOps Engineer', 'Frontend Developer', 'Backend Developer'],
      'Healthcare': ['Nurse Practitioner', 'Medical Assistant', 'Healthcare Administrator', 'Physical Therapist', 'Medical Technician'],
      'Finance': ['Financial Analyst', 'Investment Banker', 'Accountant', 'Risk Manager', 'Portfolio Manager', 'Credit Analyst'],
      'Marketing': ['Digital Marketing Manager', 'Content Marketing Specialist', 'SEO Specialist', 'Brand Manager', 'Social Media Manager'],
      'Sales': ['Sales Representative', 'Account Executive', 'Business Development Manager', 'Sales Manager', 'Inside Sales Rep'],
      'default': ['Project Manager', 'Operations Manager', 'Business Analyst', 'Consultant', 'Specialist']
    };

    const skillSets = {
      'Technology': ['JavaScript', 'Python', 'React', 'Node.js', 'AWS', 'Docker', 'Kubernetes', 'SQL'],
      'Healthcare': ['Patient Care', 'Medical Records', 'HIPAA Compliance', 'Clinical Skills', 'Medical Terminology'],
      'Finance': ['Financial Analysis', 'Excel', 'Bloomberg', 'Risk Assessment', 'Portfolio Management', 'Accounting'],
      'Marketing': ['Google Analytics', 'SEO', 'Content Creation', 'Social Media', 'Email Marketing', 'PPC'],
      'Sales': ['CRM', 'Lead Generation', 'Negotiation', 'Cold Calling', 'Pipeline Management', 'Customer Relations'],
      'default': ['Communication', 'Leadership', 'Problem Solving', 'Project Management', 'Analysis', 'Strategy']
    };

    const locations = location ? [location] : ['New York, NY', 'San Francisco, CA', 'Seattle, WA', 'Austin, TX', 'Boston, MA', 'Chicago, IL'];
    const selectedTitles = jobTitles[industry as keyof typeof jobTitles] || jobTitles.default;
    const selectedSkills = skillSets[industry as keyof typeof skillSets] || skillSets.default;

    return Array.from({ length: 12 }, (_, index) => {
      const company = companies[Math.floor(Math.random() * companies.length)];
      const title = selectedTitles[Math.floor(Math.random() * selectedTitles.length)];
      const jobLocation = locations[Math.floor(Math.random() * locations.length)];
      const jobSkills = selectedSkills.slice(0, 4 + Math.floor(Math.random() * 3));
      
      // Calculate match percentage based on skill overlap
      const userSkillsArray = skills.toLowerCase().split(',').map(s => s.trim());
      const matchingSkills = jobSkills.filter(skill => 
        userSkillsArray.some(userSkill => 
          skill.toLowerCase().includes(userSkill) || userSkill.includes(skill.toLowerCase())
        )
      );
      const matchPercentage = Math.min(85, Math.max(30, (matchingSkills.length / jobSkills.length) * 100 + Math.random() * 20));

      return {
        id: `job-${index}`,
        title,
        company,
        location: jobLocation,
        salary: `$${60 + Math.floor(Math.random() * 100)}k - $${100 + Math.floor(Math.random() * 150)}k`,
        type: Math.random() > 0.3 ? 'Full-time' : Math.random() > 0.5 ? 'Contract' : 'Part-time',
        experience: `${1 + Math.floor(Math.random() * 8)}+ years`,
        skills: jobSkills,
        description: `We are seeking a talented ${title} to join our ${industry.toLowerCase()} team. The ideal candidate will have experience with ${jobSkills.slice(0, 3).join(', ')} and a passion for innovation. This role offers excellent growth opportunities and the chance to work on cutting-edge projects.`,
        matchPercentage: Math.round(matchPercentage),
        postedDays: Math.floor(Math.random() * 30) + 1,
        applicants: Math.floor(Math.random() * 200) + 50,
        saved: false
      };
    }).sort((a, b) => b.matchPercentage - a.matchPercentage);
  };

  const analyzeJobs = async () => {
    if (!userSkills.trim()) {
      toast({
        title: "Missing Information",
        description: "Please enter your skills to analyze job matches.",
        variant: "destructive"
      });
      return;
    }

    setIsAnalyzing(true);
    
    setTimeout(() => {
      const matches = generateJobMatches(userSkills, selectedIndustry, location);
      setJobMatches(matches);
      setIsAnalyzing(false);
      
      toast({
        title: "Analysis Complete!",
        description: `Found ${matches.length} job matches based on your profile.`,
      });
    }, 2000);
  };

  const saveJob = (jobId: string) => {
    setJobMatches(prev => prev.map(job => 
      job.id === jobId ? { ...job, saved: !job.saved } : job
    ));
    
    const job = jobMatches.find(j => j.id === jobId);
    toast({
      title: job?.saved ? "Job Unsaved" : "Job Saved!",
      description: job?.saved ? "Job removed from saved list" : "Job added to your saved list",
    });
  };

  const viewJobDetails = (job: JobMatch) => {
    setSelectedJob(job);
    setShowJobDetails(true);
  };

  const getMatchColor = (percentage: number) => {
    if (percentage >= 80) return 'text-green-600 bg-green-100';
    if (percentage >= 60) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  return (
    <div className="space-y-6">
      <Card className="bg-white border-gray-200">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-gray-900">
            <Briefcase className="w-5 h-5" />
            <span>Job Match Analyzer</span>
          </CardTitle>
          <CardDescription className="text-gray-600">
            Find jobs that match your skills and get compatibility scores with top companies.
          </CardDescription>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Input Section */}
        <Card className="bg-white border-gray-200">
          <CardHeader>
            <CardTitle className="text-lg text-gray-900">Your Profile</CardTitle>
            <CardDescription className="text-gray-600">
              Tell us about your skills and preferences
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="skills" className="text-gray-900">Your Skills</Label>
              <Input
                id="skills"
                value={userSkills}
                onChange={(e) => setUserSkills(e.target.value)}
                placeholder="e.g., JavaScript, React, Python, Project Management"
                className="text-gray-900"
              />
            </div>
            
            <div>
              <Label htmlFor="industry" className="text-gray-900">Preferred Industry</Label>
              <Select value={selectedIndustry} onValueChange={setSelectedIndustry}>
                <SelectTrigger className="text-gray-900">
                  <SelectValue placeholder="Select an industry" />
                </SelectTrigger>
                <SelectContent>
                  {industries.map((industry) => (
                    <SelectItem key={industry} value={industry}>
                      {industry}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="location" className="text-gray-900">Preferred Location (Optional)</Label>
              <Input
                id="location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g., New York, NY"
                className="text-gray-900"
              />
            </div>
            
            <Button
              onClick={analyzeJobs}
              disabled={isAnalyzing}
              className="w-full bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700"
            >
              {isAnalyzing ? (
                <>
                  <Briefcase className="w-4 h-4 mr-2 animate-spin" />
                  Analyzing Jobs...
                </>
              ) : (
                <>
                  <Briefcase className="w-4 h-4 mr-2" />
                  Find Job Matches
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Results Section */}
        <div className="lg:col-span-2 space-y-4">
          {jobMatches.length > 0 ? (
            <>
              <Card className="bg-white border-gray-200">
                <CardHeader>
                  <CardTitle className="text-lg text-gray-900">Job Matches ({jobMatches.length})</CardTitle>
                  <CardDescription className="text-gray-600">
                    Jobs ranked by compatibility with your profile
                  </CardDescription>
                </CardHeader>
              </Card>
              
              {jobMatches.map((job) => (
                <Card key={job.id} className="bg-white border-gray-200 hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">{job.title}</h3>
                        <div className="flex items-center space-x-4 text-sm text-gray-600 mb-2">
                          <div className="flex items-center space-x-1">
                            <Building2 className="w-4 h-4" />
                            <span>{job.company}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <MapPin className="w-4 h-4" />
                            <span>{job.location}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <DollarSign className="w-4 h-4" />
                            <span>{job.salary}</span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-4 text-sm text-gray-500 mb-3">
                          <div className="flex items-center space-x-1">
                            <Clock className="w-4 h-4" />
                            <span>{job.postedDays} days ago</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Users className="w-4 h-4" />
                            <span>{job.applicants} applicants</span>
                          </div>
                          <Badge variant="outline">{job.type}</Badge>
                          <Badge variant="outline">{job.experience}</Badge>
                        </div>
                        <p className="text-sm text-gray-700 mb-3">{job.description}</p>
                        <div className="flex flex-wrap gap-1 mb-3">
                          {job.skills.map((skill) => (
                            <Badge key={skill} variant="secondary" className="text-xs">
                              {skill}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <div className="ml-4 text-center">
                        <div className={`text-2xl font-bold px-3 py-1 rounded-lg ${getMatchColor(job.matchPercentage)}`}>
                          {job.matchPercentage}%
                        </div>
                        <div className="text-xs text-gray-500 mt-1">Match</div>
                      </div>
                    </div>
                    
                    <Progress value={job.matchPercentage} className="mb-4" />
                    
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => viewJobDetails(job)}
                        className="flex items-center space-x-1"
                      >
                        <Eye className="w-4 h-4" />
                        <span>View Details</span>
                      </Button>
                      <Button
                        variant={job.saved ? "default" : "outline"}
                        size="sm"
                        onClick={() => saveJob(job.id)}
                        className="flex items-center space-x-1"
                      >
                        <BookmarkPlus className="w-4 h-4" />
                        <span>{job.saved ? 'Saved' : 'Save Job'}</span>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </>
          ) : (
            <Card className="bg-white border-gray-200">
              <CardContent className="text-center py-12">
                <Briefcase className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 mb-2">No job matches yet</p>
                <p className="text-sm text-gray-500">Fill in your skills and preferences to find matching jobs</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Job Details Modal */}
      {showJobDetails && selectedJob && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="bg-white max-w-2xl max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl text-gray-900">{selectedJob.title}</CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowJobDetails(false)}
                >
                  ×
                </Button>
              </div>
              <CardDescription>
                {selectedJob.company} • {selectedJob.location}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium text-gray-900">Salary</h4>
                  <p className="text-gray-700">{selectedJob.salary}</p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">Experience</h4>
                  <p className="text-gray-700">{selectedJob.experience}</p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">Job Type</h4>
                  <p className="text-gray-700">{selectedJob.type}</p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">Match Score</h4>
                  <p className={`font-bold ${getMatchColor(selectedJob.matchPercentage).split(' ')[0]}`}>
                    {selectedJob.matchPercentage}%
                  </p>
                </div>
              </div>
              
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Required Skills</h4>
                <div className="flex flex-wrap gap-1">
                  {selectedJob.skills.map((skill) => (
                    <Badge key={skill} variant="secondary">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>
              
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Job Description</h4>
                <p className="text-gray-700">{selectedJob.description}</p>
              </div>
              
              <div className="flex space-x-2 pt-4">
                <Button className="flex-1">Apply Now</Button>
                <Button
                  variant="outline"
                  onClick={() => saveJob(selectedJob.id)}
                >
                  {selectedJob.saved ? 'Saved' : 'Save Job'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default JobAnalyzer;
