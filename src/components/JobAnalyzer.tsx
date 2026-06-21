import React, { useState } from 'react';
import { useCachedState } from '@/hooks/useCachedState';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Upload, Search, Target, MapPin, Building } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useTheme } from '@/contexts/ThemeContext';
import { supabase } from '@/integrations/supabase/client';

interface JobMatch {
  title: string;
  company: string;
  location: string;
  salary: string;
  matchPercentage: number;
  description: string;
  requirements: string[];
  benefits: string[];
}

const JobAnalyzer = () => {
  const { toast } = useToast();
  const { isDarkMode } = useTheme();
  const [skills, setSkills] = useCachedState<string>('job:skills', '');
  const [industry, setIndustry] = useCachedState<string>('job:industry', '');
  const [location, setLocation] = useCachedState<string>('job:location', '');
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [jobMatches, setJobMatches] = useCachedState<JobMatch[]>('job:matches', []);

  const [savedJobsList, setSavedJobsList] = useState<string[]>([]);

  const fetchSavedJobs = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase
          .from('saved_jobs')
          .select('job_title, company_name')
          .eq('user_id', user.id);
        
        if (data) {
          const savedKeys = data.map(job => `${job.job_title}-${job.company_name}`);
          setSavedJobsList(savedKeys);
        }
      }
    } catch (error) {
      console.error('Error fetching saved jobs:', error);
    }
  };

  React.useEffect(() => {
    fetchSavedJobs();
  }, []);

  const isJobSaved = (job: JobMatch) => {
    return savedJobsList.includes(`${job.title}-${job.company}`);
  };

  const saveJob = async (job: JobMatch) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Authentication Required",
          description: "Please sign in to save jobs.",
          variant: "destructive"
        });
        return;
      }

      if (isJobSaved(job)) {
        toast({
          title: "Already Saved",
          description: "This job is already in your saved list.",
          variant: "destructive"
        });
        return;
      }

      const { error } = await supabase.from('saved_jobs').insert({
        job_title: job.title,
        company_name: job.company,
        match_percentage: job.matchPercentage,
        job_url: (job as any).jobUrl || null,
        user_id: user.id
      });

      if (error) throw error;

      setSavedJobsList(prev => [...prev, `${job.title}-${job.company}`]);

      toast({
        title: "Job Saved!",
        description: `${job.title} at ${job.company} has been saved to your collection.`,
      });
    } catch (error) {
      console.error('Error saving job:', error);
      toast({
        title: "Save Failed",
        description: "Failed to save job. Please try again.",
        variant: "destructive"
      });
    }
  };

  const usStates = [
    'Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 'Colorado', 'Connecticut', 'Delaware',
    'Florida', 'Georgia', 'Hawaii', 'Idaho', 'Illinois', 'Indiana', 'Iowa', 'Kansas', 'Kentucky',
    'Louisiana', 'Maine', 'Maryland', 'Massachusetts', 'Michigan', 'Minnesota', 'Mississippi',
    'Missouri', 'Montana', 'Nebraska', 'Nevada', 'New Hampshire', 'New Jersey', 'New Mexico',
    'New York', 'North Carolina', 'North Dakota', 'Ohio', 'Oklahoma', 'Oregon', 'Pennsylvania',
    'Rhode Island', 'South Carolina', 'South Dakota', 'Tennessee', 'Texas', 'Utah', 'Vermont',
    'Virginia', 'Washington', 'West Virginia', 'Wisconsin', 'Wyoming', 'Remote'
  ];

  const industries = [
    'Technology', 'Healthcare', 'Finance', 'Education', 'Manufacturing', 'Retail',
    'Consulting', 'Marketing', 'Engineering', 'Sales', 'Human Resources', 'Legal',
    'Real Estate', 'Entertainment', 'Non-profit', 'Government', 'Agriculture', 'Other'
  ];

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type === 'application/pdf' || file.type === 'application/msword' || file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
        setResumeFile(file);
        toast({
          title: "Resume Uploaded",
          description: `${file.name} has been uploaded successfully.`,
        });
      } else {
        toast({
          title: "Invalid File Type",
          description: "Please upload a PDF or Word document.",
          variant: "destructive"
        });
      }
    }
  };

  const analyzeJobs = async () => {
    if (!skills.trim()) {
      toast({
        title: "Missing Information",
        description: "Please provide your skills to find job matches.",
        variant: "destructive"
      });
      return;
    }

    if (!industry || !location) {
      toast({
        title: "Missing Information",
        description: "Please select both industry and location preferences.",
        variant: "destructive"
      });
      return;
    }

    setIsAnalyzing(true);

    try {
      console.log('Starting job analysis with:', { skills, industry, location, hasResume: !!resumeFile });
      
      const skillsArray = skills.split(/[\s,]+/).filter(s => s.trim().length > 0);
      
      // Read resume file if uploaded
      let resumeText = '';
      if (resumeFile) {
        try {
          resumeText = await new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target?.result as string);
            reader.onerror = reject;
            reader.readAsText(resumeFile);
          });
          console.log('Resume file read successfully, length:', resumeText.length);
        } catch (error) {
          console.error('Error reading resume file:', error);
          toast({
            title: "File Error",
            description: "Could not read the uploaded resume file.",
            variant: "destructive"
          });
          return;
        }
      }
      
      const { data, error } = await supabase.functions.invoke('job-matcher', {
        body: { 
          skills: skillsArray,
          industry,
          location,
          resumeText
        }
      });

      console.log('Job matcher response:', { data, error });

      if (error) {
        console.error('Supabase function error:', error);
        throw new Error(error.message || 'Failed to get job matches');
      }

      if (!data || !data.jobs) {
        throw new Error('No job data received from API');
      }

      const formattedJobs: JobMatch[] = data.jobs.map((job: any) => ({
        title: job.title,
        company: job.company,
        location: job.location,
        salary: job.salary,
        matchPercentage: Math.min(Math.max(job.matchPercentage, 10), 100),
        description: job.description,
        requirements: job.requirements || [],
        benefits: job.benefits || [],
        jobUrl: job.jobUrl || job.url,
      }) as JobMatch);

      setJobMatches(formattedJobs);
      
      toast({
        title: "Job Analysis Complete",
        description: `Found ${formattedJobs.length} job matches${data.insights?.dataSource === 'live' ? ' with real-time data' : ''}.`,
      });
       
       console.log('Job analysis completed successfully:', {
         jobCount: formattedJobs.length,
         avgMatch: formattedJobs.reduce((sum, job) => sum + job.matchPercentage, 0) / formattedJobs.length
       });
    } catch (error) {
      console.error('Job analysis error:', error);
      
      // Provide more specific error messages
      let errorMessage = "Failed to analyze jobs. Please try again.";
      if (error.message.includes('Skills and location are required')) {
        errorMessage = "Please provide both skills and location preferences.";
      } else if (error.message.includes('No job data received')) {
        errorMessage = "No job matches found. Try different skills or location.";
      }
      
      toast({
        title: "Analysis Error",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className={`space-y-6 ${isDarkMode ? 'dark' : ''}`}>
      <Card className={`${isDarkMode ? 'bg-gray-800/40 border-cyan-400/20' : 'bg-white border-blue-300/40'} backdrop-blur-lg border neon-border animate-fade-in`}>
        <CardHeader>
          <CardTitle className={`flex items-center space-x-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            <Search className="w-5 h-5" />
            <span>AI Job Match Analyzer</span>
          </CardTitle>
          <CardDescription className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            Upload your resume or enter your skills to find personalized job matches with detailed compatibility analysis.
          </CardDescription>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Your Profile Section */}
        <Card className={`${isDarkMode ? 'bg-gray-800/40 border-cyan-400/20' : 'bg-white border-blue-300/40'} backdrop-blur-lg border neon-border`}>
          <CardHeader>
            <CardTitle className="text-lg">Your Profile</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Upload Resume, Skills, Industry, Location */}
            <div>
              {/* Resume Upload */}
              <Label htmlFor="resume-upload" className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Resume Upload (Recommended)</Label>
              <div className={`border-2 border-dashed rounded-lg p-6 text-center ${isDarkMode ? 'border-cyan-400/30 bg-gray-900/20' : 'border-blue-300/50 bg-blue-50/30'}`}>
                <Upload className={`w-8 h-8 mx-auto mb-2 ${isDarkMode ? 'text-cyan-400' : 'text-blue-500'}`} />
                <input id="resume-upload" type="file" accept=".pdf,.doc,.docx" onChange={handleFileUpload} className="hidden" />
                <label htmlFor="resume-upload" className={`cursor-pointer ${isDarkMode ? 'text-cyan-300 hover:text-cyan-200' : 'text-blue-600 hover:text-blue-700'}`}>
                  {resumeFile ? resumeFile.name : 'Click to upload your resume'}
                </label>
                <p className={`text-xs mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>PDF, DOC, or DOCX files accepted</p>
              </div>
            </div>

            <div>
              <Label htmlFor="skills" className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Skills & Experience</Label>
              <Textarea
                id="skills"
                value={skills}
                onChange={(e) => setSkills(e.target.value)}
                placeholder="e.g., JavaScript, React, Node.js, 5 years experience in web development..."
                className={`${isDarkMode ? 'bg-gray-900/50 border-cyan-400/30 text-white placeholder-gray-400' : 'bg-white border-blue-300/50 text-gray-900 placeholder-gray-500'}`}
                rows={4}
              />
            </div>

            {/* Industry and Location */}
            <div>
              <Label htmlFor="industry" className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Industry Preference</Label>
              <Select value={industry} onValueChange={setIndustry}>
                <SelectTrigger className={`${isDarkMode ? 'bg-gray-900/50 border-cyan-400/30 text-white' : 'bg-white border-blue-300/50 text-gray-900'}`}>
                  <SelectValue placeholder="Select industry" />
                </SelectTrigger>
                <SelectContent className={`${isDarkMode ? 'bg-gray-900 border-cyan-400/30' : 'bg-white border-blue-300/50'}`}>
                  {industries.map((ind) => (
                    <SelectItem key={ind} value={ind} className={`${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      {ind}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="location" className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Location Preference</Label>
              <Select value={location} onValueChange={setLocation}>
                <SelectTrigger className={`${isDarkMode ? 'bg-gray-900/50 border-cyan-400/30 text-white' : 'bg-white border-blue-300/50 text-gray-900'}`}>
                  <SelectValue placeholder="Select location" />
                </SelectTrigger>
                <SelectContent className={`${isDarkMode ? 'bg-gray-900 border-cyan-400/30 max-h-60' : 'bg-white border-blue-300/50 max-h-60'}`}>
                  {usStates.map((state) => (
                    <SelectItem key={state} value={state} className={`${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      {state}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button onClick={analyzeJobs} disabled={isAnalyzing} className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
              {isAnalyzing ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Analyzing Jobs...
                </>
              ) : (
                <>
                  <Target className="w-4 h-4 mr-2" />
                  Find Job Matches
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Job Matches */}
        <Card className={`${isDarkMode ? 'bg-gray-800/40 border-cyan-400/20' : 'bg-white border-blue-300/40'} backdrop-blur-lg border neon-border`}>
          <CardHeader>
            <CardTitle className="text-lg">Job Matches</CardTitle>
          </CardHeader>
          <CardContent>
            {jobMatches.length > 0 ? (
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {jobMatches.map((job, index) => (
                  <div key={index} className={`p-4 rounded-lg border ${isDarkMode ? 'bg-gray-900/30 border-cyan-400/20' : 'bg-blue-50/30 border-blue-300/30'}`}>
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-start space-x-3">
                        <img 
                          src={`https://www.google.com/s2/favicons?domain=${job.company.toLowerCase().replace(/[^a-z0-9]/g, '')}.com&sz=64`}
                          alt={job.company}
                          className="w-8 h-8 rounded-lg object-contain bg-white border"
                          onError={(e) => {
                            const img = e.target as HTMLImageElement;
                            img.onerror = null;
                            img.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(job.company)}&size=32&background=2563eb&color=fff&bold=true&format=svg`;
                          }}
                        />
                        <div>
                          <h3 className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{job.title}</h3>
                          <p className={`text-sm flex items-center ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                            <Building className="w-3 h-3 mr-1" />
                            {job.company}
                          </p>
                          <p className={`text-sm flex items-center ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                            <MapPin className="w-3 h-3 mr-1" />
                            {job.location}
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-col items-end space-y-2">
                        <Badge variant="secondary" className={`${job.matchPercentage >= 90 ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : job.matchPercentage >= 80 ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200'}`}>
                          {job.matchPercentage}% Match
                        </Badge>
                        <div className="flex flex-col space-y-1">
                          <Button size="sm" variant="outline" onClick={() => saveJob(job)} disabled={isJobSaved(job)} className={`text-xs ${isJobSaved(job) ? 'opacity-50 cursor-not-allowed' : ''}`}>
                            {isJobSaved(job) ? 'Saved' : 'Save Job'}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              const url = (job as any).jobUrl
                                || `https://www.google.com/search?q=${encodeURIComponent(`${job.title} ${job.company} careers`)}`;
                              window.open(url, '_blank', 'noopener,noreferrer');
                            }}
                            className="text-xs"
                          >
                            {(job as any).jobUrl ? 'View Listing' : 'Find Careers'}
                          </Button>
                        </div>
                      </div>
                    </div>
                    <Progress value={job.matchPercentage} className="mb-2" />
                    <p className={`text-sm mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                      {job.salary}
                    </p>
                    <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      {job.description}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className={`text-center py-8 ${isDarkMode ? 'bg-gray-900/20 border-2 border-dashed border-cyan-400/30' : 'bg-blue-50/30 border-2 border-dashed border-blue-300/50'} rounded-lg`}>
                <Search className={`w-16 h-16 mx-auto mb-4 ${isDarkMode ? 'text-cyan-400' : 'text-blue-500'}`} />
                <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'} mb-2`}>No job matches yet</p>
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Upload your resume and set preferences to find matches</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default JobAnalyzer;
