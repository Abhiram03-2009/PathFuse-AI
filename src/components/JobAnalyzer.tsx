
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Upload, Search, Target, MapPin, Building, FileText } from 'lucide-react';
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
  const [skills, setSkills] = useState('');
  const [industry, setIndustry] = useState('');
  const [location, setLocation] = useState('');
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [jobMatches, setJobMatches] = useState<JobMatch[]>([]);

  const saveJob = async (job: JobMatch) => {
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: "Authentication Required",
          description: "Please sign in to save jobs.",
          variant: "destructive"
        });
        return;
      }

      // Save job to database
      const { error } = await supabase.from('saved_jobs').insert({
        job_title: job.title,
        company_name: job.company,
        match_percentage: job.matchPercentage,
        job_url: null, // Could be added later if you have URLs
        user_id: user.id
      });

      if (error) throw error;

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
    if (!skills.trim() && !resumeFile) {
      toast({
        title: "Missing Information",
        description: "Please provide your skills or upload a resume.",
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
      console.log('Sending job match request:', { skills, industry, location });
      
      const skillsArray = skills.split(/[\s,]+/).filter(s => s.trim().length > 0);
      
      const { data, error } = await supabase.functions.invoke('job-matcher', {
        body: { 
          skills: skillsArray,
          industry,
          location,
          resumeText: resumeFile ? `Resume file: ${resumeFile.name}` : null
        }
      });

      console.log('Job match response received:', { data, error });

      if (error) {
        console.error('Supabase function error:', error);
        throw new Error(error.message || 'Failed to get job matches');
      }

      if (!data || !data.jobs) {
        throw new Error('No job matches received');
      }

      const formattedJobs: JobMatch[] = data.jobs.map((job: any) => ({
        title: job.title,
        company: job.company,
        location: job.location,
        salary: job.salary,
        matchPercentage: job.matchPercentage,
        description: job.description,
        requirements: job.requirements || [],
        benefits: job.benefits || []
      }));

      setJobMatches(formattedJobs);
      
      toast({
        title: "Real-time Analysis Complete",
        description: `Found ${formattedJobs.length} current job matches with live market data.`,
      });
    } catch (error) {
      console.error('Job analysis error:', error);
      toast({
        title: "Analysis Error",
        description: "Failed to analyze jobs. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className={`space-y-6 ${isDarkMode ? 'dark' : ''}`}>
      <Card className={`${isDarkMode ? 'bg-gray-800/40 border-cyan-400/20' : 'bg-white border-blue-300/40'} backdrop-blur-lg border neon-border`}>
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
        <Card className={`${isDarkMode ? 'bg-gray-800/40 border-cyan-400/20' : 'bg-white border-blue-300/40'} backdrop-blur-lg border neon-border`}>
          <CardHeader>
            <CardTitle className={`text-lg ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Your Profile</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="resume-upload" className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Resume Upload (Recommended)</Label>
              <div className={`border-2 border-dashed rounded-lg p-6 text-center ${
                isDarkMode 
                  ? 'border-cyan-400/30 bg-gray-900/20' 
                  : 'border-blue-300/50 bg-blue-50/30'
              }`}>
                <Upload className={`w-8 h-8 mx-auto mb-2 ${isDarkMode ? 'text-cyan-400' : 'text-blue-500'}`} />
                <input
                  id="resume-upload"
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <label
                  htmlFor="resume-upload"
                  className={`cursor-pointer ${isDarkMode ? 'text-cyan-300 hover:text-cyan-200' : 'text-blue-600 hover:text-blue-700'}`}
                >
                  {resumeFile ? resumeFile.name : 'Click to upload your resume'}
                </label>
                <p className={`text-xs mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  PDF, DOC, or DOCX files accepted
                </p>
              </div>
            </div>

            <div>
              <Label htmlFor="skills" className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Skills & Experience</Label>
              <Textarea
                id="skills"
                value={skills}
                onChange={(e) => setSkills(e.target.value)}
                placeholder="e.g., JavaScript, React, Node.js, 5 years experience in web development..."
                className={`${
                  isDarkMode 
                    ? 'bg-gray-900/50 border-cyan-400/30 text-white placeholder-gray-400' 
                    : 'bg-white border-blue-300/50 text-gray-900 placeholder-gray-500'
                }`}
                rows={4}
              />
            </div>

            <div>
              <Label htmlFor="industry" className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Industry Preference</Label>
              <Select value={industry} onValueChange={setIndustry}>
                <SelectTrigger className={`${
                  isDarkMode 
                    ? 'bg-gray-900/50 border-cyan-400/30 text-white' 
                    : 'bg-white border-blue-300/50 text-gray-900'
                }`}>
                  <SelectValue placeholder="Select industry" />
                </SelectTrigger>
                <SelectContent className={`${
                  isDarkMode 
                    ? 'bg-gray-900 border-cyan-400/30' 
                    : 'bg-white border-blue-300/50'
                }`}>
                  {industries.map((ind) => (
                    <SelectItem key={ind} value={ind} className={`${
                      isDarkMode ? 'text-white focus:bg-cyan-400/20' : 'text-gray-900 focus:bg-blue-400/20'
                    }`}>
                      {ind}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="location" className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Location Preference</Label>
              <Select value={location} onValueChange={setLocation}>
                <SelectTrigger className={`${
                  isDarkMode 
                    ? 'bg-gray-900/50 border-cyan-400/30 text-white' 
                    : 'bg-white border-blue-300/50 text-gray-900'
                }`}>
                  <SelectValue placeholder="Select location" />
                </SelectTrigger>
                <SelectContent className={`${
                  isDarkMode 
                    ? 'bg-gray-900 border-cyan-400/30 max-h-60' 
                    : 'bg-white border-blue-300/50 max-h-60'
                }`}>
                  {usStates.map((state) => (
                    <SelectItem key={state} value={state} className={`${
                      isDarkMode ? 'text-white focus:bg-cyan-400/20' : 'text-gray-900 focus:bg-blue-400/20'
                    }`}>
                      {state}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button
              onClick={analyzeJobs}
              disabled={isAnalyzing}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
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

        <Card className={`${isDarkMode ? 'bg-gray-800/40 border-cyan-400/20' : 'bg-white border-blue-300/40'} backdrop-blur-lg border neon-border`}>
          <CardHeader>
            <CardTitle className={`text-lg ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Job Matches</CardTitle>
          </CardHeader>
          <CardContent>
            {jobMatches.length > 0 ? (
                 <div className="space-y-4 max-h-96 overflow-y-auto">
                {jobMatches.map((job, index) => (
                  <div key={index} className={`p-4 rounded-lg border ${
                    isDarkMode 
                      ? 'bg-gray-900/30 border-cyan-400/20' 
                      : 'bg-blue-50/30 border-blue-300/30'
                  }`}>
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-start space-x-3">
                        <img 
                          src={`https://logo.clearbit.com/${job.company.toLowerCase().replace(/\s+/g, '')}.com`}
                          alt={job.company}
                          className="w-8 h-8 rounded-lg object-contain bg-white border"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${job.company}&size=32&background=random`;
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
                        <Badge variant="secondary" className={`${
                          job.matchPercentage >= 90 
                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                            : job.matchPercentage >= 80 
                            ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                            : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200'
                        }`}>
                          {job.matchPercentage}% Match
                        </Badge>
                        <div className="flex flex-col space-y-1">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => saveJob(job)}
                            className="text-xs"
                          >
                            Save Job
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => window.open(`https://${job.company.toLowerCase().replace(/\s+/g, '')}.com/careers`, '_blank')}
                            className="text-xs"
                          >
                            Careers Page
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
              <div className={`text-center py-8 ${
                isDarkMode 
                  ? 'bg-gray-900/20 border-2 border-dashed border-cyan-400/30' 
                  : 'bg-blue-50/30 border-2 border-dashed border-blue-300/50'
              } rounded-lg`}>
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
