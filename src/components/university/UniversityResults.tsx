
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ExternalLink, TrendingUp, Users, GraduationCap } from 'lucide-react';
import { UniversityMatch } from './types';
import SaveCollegeButton from './SaveCollegeButton';

interface UniversityResultsProps {
  results: UniversityMatch[];
  intendedMajor: string;
  isDarkMode: boolean;
}

const UniversityResults: React.FC<UniversityResultsProps> = ({ 
  results, 
  intendedMajor, 
  isDarkMode 
}) => {
  const getMatchColor = (percentage: number) => {
    if (percentage >= 80) return 'bg-green-500';
    if (percentage >= 60) return 'bg-yellow-500';
    if (percentage >= 40) return 'bg-orange-500';
    return 'bg-red-500';
  };

  const getMatchTextColor = (percentage: number) => {
    if (percentage >= 80) return 'text-green-700 dark:text-green-300';
    if (percentage >= 60) return 'text-yellow-700 dark:text-yellow-300';
    if (percentage >= 40) return 'text-orange-700 dark:text-orange-300';
    return 'text-red-700 dark:text-red-300';
  };

  const getMatchLabel = (percentage: number) => {
    if (percentage >= 80) return 'Excellent Match';
    if (percentage >= 60) return 'Good Match';
    if (percentage >= 40) return 'Fair Match';
    return 'Reach School';
  };

  return (
    <Card id="university-results" className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700">
      <CardHeader>
        <CardTitle className="text-xl text-gray-900 dark:text-white flex items-center space-x-2">
          <TrendingUp className="w-5 h-5" />
          <span>Your University Match Results</span>
        </CardTitle>
        <CardDescription className="text-gray-600 dark:text-gray-300">
          Based on your academic profile for {intendedMajor}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {results.map((university, index) => (
            <Card key={index} className="bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-600">
              <CardContent className="p-6">
                <div className="flex items-start space-x-4 mb-4">
                  <img 
                    src={university.logo} 
                    alt={university.name} 
                    className="w-16 h-16 object-contain rounded-lg bg-white p-2"
                  />
                  <div className="flex-1">
                    <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-2">
                      {university.name}
                    </h3>
                    <div className="flex items-center space-x-2 mb-2">
                      <div className={`w-3 h-3 rounded-full ${getMatchColor(university.matchPercentage)}`}></div>
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        {university.matchPercentage}% - {getMatchLabel(university.matchPercentage)}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs text-gray-600 dark:text-gray-400">
                      <div className="flex items-center space-x-1">
                        <Users className="w-3 h-3" />
                        <span>{university.admissionRate}% admit rate</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <GraduationCap className="w-3 h-3" />
                        <span>Avg GPA: {university.avgGpa}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <h4 className="font-semibold text-sm text-gray-900 dark:text-white mb-2">
                      Key Improvements Needed:
                    </h4>
                    <div className="space-y-1">
                      {university.improvements.slice(0, 2).map((improvement, idx) => (
                        <Badge key={idx} variant="outline" className="text-xs">
                          {improvement}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold text-sm text-gray-900 dark:text-white mb-2">
                      {intendedMajor} Program Tips:
                    </h4>
                    <ul className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
                      {university.specificTips.slice(0, 2).map((tip, idx) => (
                        <li key={idx} className="flex items-start space-x-1">
                          <span className="text-blue-500 mt-1">•</span>
                          <span>{tip}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="flex space-x-2 mt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    asChild
                    className="flex-1 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600"
                  >
                    <a href={university.admissionsUrl} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="w-3 h-3 mr-2" />
                      Apply
                    </a>
                  </Button>
                  <SaveCollegeButton
                    collegeName={university.name}
                    matchPercentage={university.matchPercentage}
                    collegeUrl={university.admissionsUrl}
                  />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default UniversityResults;
