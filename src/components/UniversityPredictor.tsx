
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { GraduationCap } from 'lucide-react';
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

  const handleUniversityToggle = (universityName: string) => {
    setSelectedUniversities(prev => 
      prev.includes(universityName) 
        ? prev.filter(name => name !== universityName)
        : [...prev, universityName]
    );
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
