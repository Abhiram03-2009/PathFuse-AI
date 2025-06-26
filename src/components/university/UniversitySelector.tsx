
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Target } from 'lucide-react';
import { topUniversities } from './constants';

interface UniversitySelectorProps {
  selectedUniversities: string[];
  onUniversityToggle: (universityName: string) => void;
  onCalculateChances: () => void;
  intendedMajor: string;
  isDarkMode: boolean;
}

const UniversitySelector: React.FC<UniversitySelectorProps> = ({
  selectedUniversities,
  onUniversityToggle,
  onCalculateChances,
  intendedMajor,
  isDarkMode
}) => {
  return (
    <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700">
      <CardHeader>
        <CardTitle className="text-lg text-gray-900 dark:text-white">Select Universities ({topUniversities.length} available)</CardTitle>
        <CardDescription className="text-gray-600 dark:text-gray-300">
          Choose universities for personalized admission probability analysis
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 gap-2 max-h-96 overflow-y-auto">
          {topUniversities.map((university) => (
            <Button
              key={university.name}
              variant={selectedUniversities.includes(university.name) ? "default" : "outline"}
              className={`justify-start h-auto p-3 text-left ${
                selectedUniversities.includes(university.name) 
                  ? 'bg-blue-600 text-white hover:bg-blue-700' 
                  : 'text-gray-900 dark:text-white bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
              onClick={() => onUniversityToggle(university.name)}
            >
              <img src={university.logo} alt={university.name} className="w-8 h-8 mr-3 object-contain" />
              <div>
                <div className="font-medium">{university.name}</div>
                <div className="text-xs opacity-70">
                  {university.admissionRate}% acceptance • Avg GPA: {university.avgGpa} • Avg SAT: {university.avgSat}
                </div>
              </div>
            </Button>
          ))}
        </div>
        
        <Button 
          onClick={onCalculateChances}
          className="w-full mt-4 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
          disabled={selectedUniversities.length === 0 || !intendedMajor}
        >
          <Target className="w-4 h-4 mr-2" />
          Analyze My Admission Chances
        </Button>
      </CardContent>
    </Card>
  );
};

export default UniversitySelector;
