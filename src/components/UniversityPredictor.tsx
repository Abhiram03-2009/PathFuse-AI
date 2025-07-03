
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { GraduationCap, FileText, Sparkles } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useTheme } from '@/contexts/ThemeContext';

// Component imports
import StudentProfileForm from './university/StudentProfileForm';
import UniversitySelector from './university/UniversitySelector';
import UniversityResults from './university/UniversityResults';

// Type and utility imports
import { StudentStats, UniversityMatch } from './university/types';
import { topUniversities } from './university/constants';
import { calculateMatchPercentage, generateSpecificTips, generateImprovements } from './university/calculations';
import { supabase } from '@/integrations/supabase/client';

const UniversityPredictor = () => {
  const { toast } = useToast();
  const { isDarkMode } = useTheme();
  
  const [studentStats, setStudentStats] = useState<StudentStats>({
    gpaUnweighted: 0,
    gpaWeighted: 0,
    satScore: 0,
    actScore: 0,
    classRank: 1,
    totalStudents: 100,
    extracurriculars: '',
    essays: '',
    apCourses: 0,
    intendedMajor: ''
  });
  
  const [selectedUniversities, setSelectedUniversities] = useState<string[]>([]);
  const [results, setResults] = useState<UniversityMatch[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [resumeText, setResumeText] = useState('');
  const [isAnalyzingResume, setIsAnalyzingResume] = useState(false);

  const handleUniversityToggle = (universityName: string) => {
    setSelectedUniversities(prev => 
      prev.includes(universityName) 
        ? prev.filter(name => name !== universityName)
        : [...prev, universityName]
    );
  };

  const analyzeResumeForUniversity = async () => {
    if (!resumeText.trim()) {
      toast({
        title: "No Resume Text",
        description: "Please paste your resume text for analysis.",
        variant: "destructive"
      });
      return;
    }

    setIsAnalyzingResume(true);

    try {
      console.log('Sending resume for university analysis');
      
      const { data, error } = await supabase.functions.invoke('resume-analyzer', {
        body: { 
          resumeText,
          analysisType: 'university'
        }
      });

      console.log('Resume analysis response received:', { data, error });

      if (error) {
        console.error('Supabase function error:', error);
        throw new Error(error.message || 'Failed to analyze resume');
      }

      if (!data || !data.analysis) {
        throw new Error('No analysis received');
      }

      // Update student stats with extracted data if available
      if (data.extractedData) {
        const extracted = data.extractedData;
        setStudentStats(prev => ({
          ...prev,
          gpaUnweighted: extracted.estimatedGPA || prev.gpaUnweighted,
          satScore: extracted.satScore || prev.satScore,
          actScore: extracted.actScore || prev.actScore,
          extracurriculars: extracted.hasLeadershipExperience ? 
            (prev.extracurriculars + '\n• Leadership experience detected from resume').trim() : prev.extracurriculars
        }));
      }

      toast({
        title: "Resume Analysis Complete",
        description: "Your profile has been analyzed and stats updated automatically.",
      });
    } catch (error) {
      console.error('Resume analysis error:', error);
      toast({
        title: "Analysis Error",
        description: "Failed to analyze resume. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsAnalyzingResume(false);
    }
  };

  const calculateChances = () => {
    if (selectedUniversities.length === 0) {
      toast({
        title: "Select Universities",
        description: "Please select at least one university to analyze.",
        variant: "destructive"
      });
      return;
    }

    const matches = selectedUniversities.map(universityName => {
      const university = topUniversities.find(u => u.name === universityName)!;
      const matchPercentage = calculateMatchPercentage(university, studentStats);
      
      return {
        ...university,
        matchPercentage,
        improvements: generateImprovements(university, studentStats, matchPercentage),
        specificTips: generateSpecificTips(university, studentStats, studentStats.intendedMajor)
      };
    });

    setResults(matches.sort((a, b) => b.matchPercentage - a.matchPercentage));
    setShowResults(true);
  };

  return (
    <div className={`space-y-6 ${isDarkMode ? 'dark' : ''}`}>
      <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-gray-900 dark:text-white">
            <GraduationCap className="w-5 h-5" />
            <span>AI University Admission Predictor</span>
          </CardTitle>
          <CardDescription className="text-gray-600 dark:text-gray-300">
            Advanced analytics using real admission data, major-specific calculations, and personalized improvement strategies.
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Resume Analysis Section */}
      <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-gray-900 dark:text-white">
            <FileText className="w-5 h-5" />
            <span>Resume Analysis for University Prediction</span>
          </CardTitle>
          <CardDescription className="text-gray-600 dark:text-gray-300">
            Paste your resume text to automatically extract academic information and improve prediction accuracy.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="resume-text" className="text-gray-700 dark:text-gray-300">Resume Text</Label>
            <Textarea
              id="resume-text"
              value={resumeText}
              onChange={(e) => setResumeText(e.target.value)}
              placeholder="Paste your resume content here. Include GPA, test scores, extracurriculars, awards, work experience, etc."
              className="min-h-32 text-gray-900 dark:text-white bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600"
              rows={6}
            />
          </div>
          <Button
            onClick={analyzeResumeForUniversity}
            disabled={isAnalyzingResume || !resumeText.trim()}
            className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
          >
            {isAnalyzingResume ? (
              <>
                <Sparkles className="w-4 h-4 mr-2 animate-spin" />
                Analyzing Resume...
              </>
            ) : (
              <>
                <FileText className="w-4 h-4 mr-2" />
                Analyze Resume for University Prediction
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <StudentProfileForm 
          studentStats={studentStats}
          setStudentStats={setStudentStats}
          isDarkMode={isDarkMode}
        />

        <UniversitySelector
          selectedUniversities={selectedUniversities}
          onUniversityToggle={handleUniversityToggle}
          onCalculateChances={calculateChances}
          intendedMajor={studentStats.intendedMajor}
          isDarkMode={isDarkMode}
        />
      </div>

      {showResults && (
        <UniversityResults
          results={results}
          intendedMajor={studentStats.intendedMajor}
          isDarkMode={isDarkMode}
        />
      )}
    </div>
  );
};

export default UniversityPredictor;
