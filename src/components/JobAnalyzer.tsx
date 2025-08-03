import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Upload, Search, Target, MapPin, Building, ExternalLink } from 'lucide-react';
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
  jobUrl: string | null; // Added for direct application link
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
  const [savedJobsList, setSavedJobsList] = useState<string[]>([]);

  // This hook correctly clears stale results when dropdowns change.
  useEffect(() => {
    if (jobMatches.length > 0) {
      setJobMatches([]);
    }
  }, [industry, location]);
  
  // No changes needed for these functions
  const fetchSavedJobs = async () => {/* ... */};
  useEffect(() => { fetchSavedJobs(); }, []);
  const isJobSaved = (job: JobMatch) => {/* ... */};
  const saveJob = async (job: JobMatch) => {/* ... */};

  const usStates = [ 'Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 'Colorado', 'Connecticut', 'Delaware', 'Florida', 'Georgia', 'Hawaii', 'Idaho', 'Illinois', 'Indiana', 'Iowa', 'Kansas', 'Kentucky', 'Louisiana', 'Maine', 'Maryland', 'Massachusetts', 'Michigan', 'Minnesota', 'Mississippi', 'Missouri', 'Montana', 'Nebraska', 'Nevada', 'New Hampshire', 'New Jersey', 'New Mexico', 'New York', 'North Carolina', 'North Dakota', 'Ohio', 'Oklahoma', 'Oregon', 'Pennsylvania', 'Rhode Island', 'South Carolina', 'South Dakota', 'Tennessee', 'Texas', 'Utah', 'Vermont', 'Virginia', 'Washington', 'West Virginia', 'Wisconsin', 'Wyoming', 'Remote' ];
  const industries = [ 'Technology', 'Healthcare', 'Finance', 'Education', 'Manufacturing', 'Retail', 'Consulting', 'Marketing', 'Engineering', 'Sales', 'Human Resources', 'Legal', 'Real Estate', 'Entertainment', 'Non-profit', 'Government', 'Agriculture', 'Other' ];

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type === 'application/pdf' || file.type === 'application/msword' || file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
        setResumeFile(file);
        toast({ title: "Resume Uploaded", description: `${file.name} is ready.` });
      } else {
        toast({ title: "Invalid File Type", description: "Please upload a PDF or Word document.", variant: "destructive" });
      }
    }
  };

  const analyzeJobs = async () => {
    if (!skills.trim() && !resumeFile) { toast({ title: "Missing Information", description: "Please provide skills or a resume.", variant: "destructive" }); return; }
    if (!industry || !location) { toast({ title: "Missing Information", description: "Please select an industry and location.", variant: "destructive" }); return; }
    setIsAnalyzing(true);
    setJobMatches([]); // Clear previous results immediately
    try {
      const skillsArray = skills.split(/[\s,]+/).filter(s => s.trim().length > 0);
      let resumeText = '';
      if (resumeFile) {
        resumeText = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = (e) => resolve(e.target?.result as string);
          reader.onerror = reject;
          reader.readAsText(resumeFile);
        });
      }
      const { data, error } = await supabase.functions.invoke('job-matcher', { body: { skills: skillsArray, industry, location, resumeText } });
      if (error) throw new Error(error.message || 'Failed to get job matches');
      if (!data || !data.jobs) throw new Error('No job data received from API');
      
      const formattedJobs: JobMatch[] = data.jobs.map((job: any) => ({ ...job, matchPercentage: Math.min(Math.max(job.matchPercentage, 10), 100) }));
      setJobMatches(formattedJobs);

      let toastMessage = `Found ${formattedJobs.length} job matches for you in ${location}.`;
      if (data.insights?.tier === 'industry') {
        toastMessage = `Found ${formattedJobs.length} jobs. Broadened search to all ${industry} roles in ${location}.`;
      } else if (data.insights?.tier === 'generic') {
        toastMessage = `No ${industry} jobs found. Showing other opportunities in ${location}.`;
      }
      toast({ title: "Analysis Complete", description: toastMessage });

    } catch (error) {
      console.error('Job analysis error:', error);
      toast({ title: "Analysis Error", description: "No job matches found. Please try different keywords or a broader location/industry.", variant: "destructive" });
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className={`space-y-6 ${isDarkMode ? 'dark' : ''}`}>
      {/* Search Card and Profile Card (No changes needed) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* ... Paste the Your Profile Card JSX here, no changes needed ... */}
        
        {/* Job Matches Card (Updated with better "Apply" button) */}
        <Card className={`${isDarkMode ? 'bg-gray-800/40 border-cyan-400/20' : 'bg-white border-blue-300/40'} backdrop-blur-lg border neon-border`}>
          <CardHeader><CardTitle className="text-lg">Job Matches</CardTitle></CardHeader>
          <CardContent>
            {jobMatches.length > 0 ? (
              <div className="space-y-4 max-h-[450px] overflow-y-auto pr-2">
                {jobMatches.map((job, index) => (
                  <div key={index} className={`p-4 rounded-lg border ${isDarkMode ? 'bg-gray-900/30 border-cyan-400/20' : 'bg-blue-50/30 border-blue-300/30'}`}>
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-start space-x-3">
                        <img src={`https://logo.clearbit.com/${job.company.toLowerCase().replace(/[^a-z0-9]/g, '')}.com`} alt={job.company} className="w-10 h-10 rounded-lg object-contain bg-white border" onError={(e) => { (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(job.company)}&size=40&background=random&color=fff`; }} />
                        <div>
                          <h3 className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{job.title}</h3>
                          <p className={`text-sm flex items-center ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}><Building className="w-3 h-3 mr-1.5" />{job.company}</p>
                          <p className={`text-sm flex items-center ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}><MapPin className="w-3 h-3 mr-1.5" />{job.location}</p>
                        </div>
                      </div>
                      <div className="flex flex-col items-end space-y-2">
                        <Badge variant="secondary" className={`${job.matchPercentage >= 90 ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : job.matchPercentage >= 80 ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200'}`}>{job.matchPercentage}% Match</Badge>
                        <div className="flex flex-col space-y-1">
                          <Button size="sm" variant="outline" onClick={() => saveJob(job)} disabled={isJobSaved(job)} className={`text-xs ${isJobSaved(job) ? 'opacity-50 cursor-not-allowed' : ''}`}>{isJobSaved(job) ? 'Saved' : 'Save'}</Button>
                          {/* **IMPROVED BUTTON**: Uses direct link and is disabled if no link exists */}
                          <Button size="sm" variant="outline" onClick={() => window.open(job.jobUrl, '_blank')} disabled={!job.jobUrl} className="text-xs flex items-center">
                            <ExternalLink className="w-3 h-3 mr-1" />
                            Apply
                          </Button>
                        </div>
                      </div>
                    </div>
                    <Progress value={job.matchPercentage} className="mt-3 mb-2" />
                    <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>{job.description}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className={`text-center py-8 ${isDarkMode ? 'bg-gray-900/20 border-2 border-dashed border-cyan-400/30' : 'bg-blue-50/30 border-2 border-dashed border-blue-300/50'} rounded-lg`}>
                <Search className={`w-16 h-16 mx-auto mb-4 ${isDarkMode ? 'text-cyan-400/80' : 'text-blue-500/80'}`} />
                <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'} font-medium`}>
                  {isAnalyzing ? 'Searching for jobs...' : 'Your job matches will appear here.'}
                </p>
                <p className={`text-sm mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  {isAnalyzing ? 'Please wait a moment...' : 'Select your preferences and click "Find Job Matches" to begin.'}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default JobAnalyzer;