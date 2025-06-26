
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { ExternalLink } from 'lucide-react';
import { UniversityMatch } from './types';

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
  if (results.length === 0) return null;

  return (
    <div className="space-y-4">
      <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700">
        <CardHeader>
          <CardTitle className="text-lg text-gray-900 dark:text-white">Your Personalized University Match Analysis</CardTitle>
          <CardDescription className="text-gray-600 dark:text-gray-300">
            AI-powered analysis based on real admission data, your intended major, and holistic profile review
          </CardDescription>
        </CardHeader>
      </Card>
      
      {results.map((result) => (
        <Card key={result.name} className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <img src={result.logo} alt={result.name} className="w-12 h-12 object-contain" />
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">{result.name}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    {result.admissionRate}% acceptance rate • {intendedMajor}
                  </p>
                  <a 
                    href={result.admissionsUrl}
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-sm text-blue-600 dark:text-blue-400 hover:underline flex items-center mt-1"
                  >
                    View Admissions Requirements <ExternalLink className="w-3 h-3 ml-1" />
                  </a>
                </div>
              </div>
              <div className="text-right">
                <div className={`text-3xl font-bold ${
                  result.matchPercentage >= 40 ? 'text-green-600' :
                  result.matchPercentage >= 20 ? 'text-yellow-600' : 'text-red-600'
                }`}>
                  {result.matchPercentage}%
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-300">
                  {result.matchPercentage >= 40 ? 'Good Match' :
                   result.matchPercentage >= 20 ? 'Reach School' : 'High Reach'}
                </div>
              </div>
            </div>
            
            <Progress value={result.matchPercentage} className="mb-4" />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white mb-2">University-Specific Tips:</h4>
                <ul className="space-y-1">
                  {result.specificTips.map((tip, index) => (
                    <li key={index} className="text-sm text-gray-700 dark:text-gray-300 flex items-start">
                      <span className="text-blue-600 mr-2">•</span>
                      {tip}
                    </li>
                  ))}
                </ul>
              </div>
              
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white mb-2">Improvement Areas:</h4>
                <ul className="space-y-1">
                  {result.improvements.map((improvement, index) => (
                    <li key={index} className="text-sm text-gray-700 dark:text-gray-300 flex items-start">
                      <span className="text-orange-600 mr-2">•</span>
                      {improvement}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default UniversityResults;
