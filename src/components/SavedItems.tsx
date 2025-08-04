import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BookOpen, Briefcase, ExternalLink, Trash2, Calendar } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useTheme } from '@/contexts/ThemeContext';
import { supabase } from '@/integrations/supabase/client';

interface SavedCollege {
  id: string;
  college_name: string;
  college_url?: string;
  match_percentage?: number;
  created_at: string;
}

interface SavedJob {
  id: string;
  job_title: string;
  company_name: string;
  job_url?: string;
  match_percentage?: number;
  created_at: string;
}

const SavedItems = () => {
  const { toast } = useToast();
  const { isDarkMode } = useTheme();
  const [savedColleges, setSavedColleges] = useState<SavedCollege[]>([]);
  const [savedJobs, setSavedJobs] = useState<SavedJob[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSavedItems();
  }, []);

  const fetchSavedItems = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: "Authentication Required",
          description: "Please sign in to view your saved items.",
          variant: "destructive"
        });
        return;
      }

      // Fetch saved colleges
      const { data: colleges, error: collegesError } = await supabase
        .from('saved_colleges')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (collegesError) throw collegesError;

      // Fetch saved jobs
      const { data: jobs, error: jobsError } = await supabase
        .from('saved_jobs')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (jobsError) throw jobsError;

      setSavedColleges(colleges || []);
      setSavedJobs(jobs || []);
    } catch (error) {
      console.error('Error fetching saved items:', error);
      toast({
        title: "Error",
        description: "Failed to load saved items. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const deleteSavedCollege = async (id: string) => {
    try {
      const { error } = await supabase
        .from('saved_colleges')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setSavedColleges(prev => prev.filter(college => college.id !== id));
      toast({
        title: "College Removed",
        description: "College has been removed from your saved list.",
      });
    } catch (error) {
      console.error('Error deleting college:', error);
      toast({
        title: "Error",
        description: "Failed to remove college. Please try again.",
        variant: "destructive"
      });
    }
  };

  const deleteSavedJob = async (id: string) => {
    try {
      const { error } = await supabase
        .from('saved_jobs')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setSavedJobs(prev => prev.filter(job => job.id !== id));
      toast({
        title: "Job Removed",
        description: "Job has been removed from your saved list.",
      });
    } catch (error) {
      console.error('Error deleting job:', error);
      toast({
        title: "Error",
        description: "Failed to remove job. Please try again.",
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return (
      <div className={`space-y-6 ${isDarkMode ? 'dark' : ''}`}>
        <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 neon-border animate-fade-in">
          <CardContent className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-600 dark:text-gray-300 mt-4">Loading your saved items...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${isDarkMode ? 'dark' : ''}`}>
      <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 neon-border animate-fade-in">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-gray-900 dark:text-white animate-neon-flicker">
            <BookOpen className="w-5 h-5" />
            <span>Saved Items</span>
          </CardTitle>
          <CardDescription className="text-gray-600 dark:text-gray-300">
            View and manage your saved colleges and job opportunities.
          </CardDescription>
        </CardHeader>
      </Card>

      <Tabs defaultValue="colleges" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 neon-border">
          <TabsTrigger value="colleges" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white text-gray-900 dark:text-white hover:bg-blue-50 dark:hover:bg-gray-700 transition-all duration-300">
            <BookOpen className="w-4 h-4 mr-2" />
            Colleges ({savedColleges.length})
          </TabsTrigger>
          <TabsTrigger value="jobs" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white text-gray-900 dark:text-white hover:bg-blue-50 dark:hover:bg-gray-700 transition-all duration-300">
            <Briefcase className="w-4 h-4 mr-2" />
            Jobs ({savedJobs.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="colleges" className="space-y-4">
          {savedColleges.length === 0 ? (
            <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 neon-border animate-fade-in">
              <CardContent className="p-8 text-center">
                <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No Saved Colleges</h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Use the University Predictor to analyze and save colleges you're interested in.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {savedColleges.map((college) => (
                <Card key={college.id} className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 neon-border hover:shadow-lg transition-all duration-300 animate-slide-in">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="font-semibold text-gray-900 dark:text-white text-sm">
                        {college.college_name}
                      </h3>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteSavedCollege(college.id)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 p-1 transition-all duration-300"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                    
                    {college.match_percentage && (
                      <div className="mb-3">
                        <Badge variant="secondary" className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                          {college.match_percentage}% Match
                        </Badge>
                      </div>
                    )}
                    
                    <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 mb-3">
                      <Calendar className="w-3 h-3 mr-1" />
                      Saved {new Date(college.created_at).toLocaleDateString()}
                    </div>
                    
                    {college.college_url && (
                      <Button
                        variant="outline"
                        size="sm"
                        asChild
                        className="w-full text-gray-800 dark:text-white bg-white dark:bg-gray-800 border-gray-400 dark:border-gray-600 hover:bg-blue-50 dark:hover:bg-gray-700 hover:border-blue-400 dark:hover:border-blue-400 transition-all duration-300 animate-hover-lift"
                      >
                        <a href={college.college_url} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="w-3 h-3 mr-2" />
                          View Details
                        </a>
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="jobs" className="space-y-4">
          {savedJobs.length === 0 ? (
            <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 neon-border animate-fade-in">
              <CardContent className="p-8 text-center">
                <Briefcase className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No Saved Jobs</h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Use the Job Match Analyzer to find and save job opportunities that match your profile.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {savedJobs.map((job) => (
                <Card key={job.id} className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 neon-border hover:shadow-lg transition-all duration-300 animate-slide-in">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white text-sm mb-1">
                          {job.job_title}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                          {job.company_name}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteSavedJob(job.id)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 p-1 transition-all duration-300"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                    
                    {job.match_percentage && (
                      <div className="mb-3">
                        <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                          {job.match_percentage}% Match
                        </Badge>
                      </div>
                    )}
                    
                    <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 mb-3">
                      <Calendar className="w-3 h-3 mr-1" />
                      Saved {new Date(job.created_at).toLocaleDateString()}
                    </div>
                    
                    {job.job_url && (
                      <Button
                        variant="outline"
                        size="sm"
                        asChild
                        className="w-full text-gray-800 dark:text-white bg-white dark:bg-gray-800 border-gray-400 dark:border-gray-600 hover:bg-blue-50 dark:hover:bg-gray-700 hover:border-blue-400 dark:hover:border-blue-400 transition-all duration-300 animate-hover-lift"
                      >
                        <a href={job.job_url} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="w-3 h-3 mr-2" />
                          Apply Now
                        </a>
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SavedItems;
