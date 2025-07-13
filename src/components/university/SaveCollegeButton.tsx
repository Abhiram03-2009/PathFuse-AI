
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { BookOpen, Check } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface SaveCollegeButtonProps {
  collegeName: string;
  matchPercentage: number;
  collegeUrl?: string;
}

const SaveCollegeButton: React.FC<SaveCollegeButtonProps> = ({
  collegeName,
  matchPercentage,
  collegeUrl
}) => {
  const [isSaved, setIsSaved] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    checkIfSaved();
  }, [collegeName, user]);

  const checkIfSaved = async () => {
    if (!user) return;
    
    try {
      const { data } = await supabase
        .from('saved_colleges')
        .select('id')
        .eq('user_id', user.id)
        .eq('college_name', collegeName)
        .single();
      
      setIsSaved(!!data);
    } catch (error) {
      // Not found is expected for unsaved colleges
      setIsSaved(false);
    }
  };

  const handleSaveCollege = async () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to save colleges.",
        variant: "destructive"
      });
      return;
    }

    if (isSaved) {
      toast({
        title: "Already Saved",
        description: "This college is already in your saved list.",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('saved_colleges')
        .insert({
          user_id: user.id,
          college_name: collegeName,
          match_percentage: matchPercentage,
          college_url: collegeUrl
        });

      if (error) throw error;

      setIsSaved(true);
      toast({
        title: "College Saved!",
        description: `${collegeName} has been saved to your profile.`,
      });
    } catch (error) {
      console.error('Error saving college:', error);
      toast({
        title: "Error",
        description: "Failed to save college. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      onClick={handleSaveCollege}
      disabled={isSaved || isLoading}
      variant={isSaved ? "secondary" : "outline"}
      size="sm"
      className="flex items-center space-x-2"
    >
      {isSaved ? (
        <>
          <Check className="w-4 h-4" />
          <span>Saved</span>
        </>
      ) : (
        <>
          <BookOpen className="w-4 h-4" />
          <span>{isLoading ? 'Saving...' : 'Save College'}</span>
        </>
      )}
    </Button>
  );
};

export default SaveCollegeButton;
