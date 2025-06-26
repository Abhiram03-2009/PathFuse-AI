import React, { useState, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { University, GraduationCap, Trophy, BookOpen, Target, Upload, ExternalLink } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useTheme } from '@/contexts/ThemeContext';

interface StudentStats {
  gpaUnweighted: number;
  gpaWeighted: number;
  satScore: number;
  actScore: number;
  classRank: number;
  totalStudents: number;
  extracurriculars: string;
  essays: string;
  apCourses: number;
  intendedMajor: string;
}

interface UniversityMatch {
  name: string;
  icon: string;
  admissionRate: number;
  avgGpa: number;
  avgSat: number;
  matchPercentage: number;
  improvements: string[];
  admissionsUrl: string;
}

const UniversityPredictor = () => {
  const { toast } = useToast();
  const { isDarkMode } = useTheme();
  const fileInputRef = useRef<HTMLInputElement>(null);
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
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);

  const majors = [
    'Computer Science', 'Engineering', 'Business', 'Pre-Med', 'Liberal Arts', 
    'Psychology', 'Economics', 'Biology', 'Mathematics', 'Physics', 
    'Chemistry', 'Political Science', 'English', 'History', 'Art'
  ];

  const topUniversities = [
    // Ivy League
    { name: 'Harvard University', icon: '🏛️', admissionRate: 3, avgGpa: 4.0, avgSat: 1520, admissionsUrl: 'https://college.harvard.edu/admissions' },
    { name: 'Yale University', icon: '🎓', admissionRate: 6, avgGpa: 4.0, avgSat: 1515, admissionsUrl: 'https://admissions.yale.edu/' },
    { name: 'Princeton University', icon: '🐅', admissionRate: 6, avgGpa: 3.95, avgSat: 1510, admissionsUrl: 'https://admission.princeton.edu/' },
    { name: 'Columbia University', icon: '🗽', admissionRate: 6, avgGpa: 4.0, avgSat: 1505, admissionsUrl: 'https://undergrad.admissions.columbia.edu/' },
    { name: 'University of Pennsylvania', icon: '🔔', admissionRate: 8, avgGpa: 3.94, avgSat: 1500, admissionsUrl: 'https://admissions.upenn.edu/' },
    { name: 'Dartmouth College', icon: '🌲', admissionRate: 9, avgGpa: 3.93, avgSat: 1490, admissionsUrl: 'https://admissions.dartmouth.edu/' },
    { name: 'Brown University', icon: '🐻', admissionRate: 9, avgGpa: 3.92, avgSat: 1485, admissionsUrl: 'https://admission.brown.edu/' },
    { name: 'Cornell University', icon: '🌽', admissionRate: 11, avgGpa: 3.91, avgSat: 1480, admissionsUrl: 'https://admissions.cornell.edu/' },
    
    // Top Private Universities
    { name: 'Stanford University', icon: '🌲', admissionRate: 4, avgGpa: 3.96, avgSat: 1510, admissionsUrl: 'https://admission.stanford.edu/' },
    { name: 'MIT', icon: '🔬', admissionRate: 7, avgGpa: 4.0, avgSat: 1540, admissionsUrl: 'https://mitadmissions.org/' },
    { name: 'University of Chicago', icon: '🏛️', admissionRate: 7, avgGpa: 4.0, avgSat: 1520, admissionsUrl: 'https://collegeadmissions.uchicago.edu/' },
    { name: 'Northwestern University', icon: '💜', admissionRate: 9, avgGpa: 4.0, avgSat: 1490, admissionsUrl: 'https://admissions.northwestern.edu/' },
    { name: 'Duke University', icon: '👑', admissionRate: 10, avgGpa: 3.94, avgSat: 1485, admissionsUrl: 'https://admissions.duke.edu/' },
    { name: 'Johns Hopkins University', icon: '🏥', admissionRate: 12, avgGpa: 3.93, avgSat: 1480, admissionsUrl: 'https://apply.jhu.edu/' },
    { name: 'Vanderbilt University', icon: '⭐', admissionRate: 12, avgGpa: 3.89, avgSat: 1470, admissionsUrl: 'https://admissions.vanderbilt.edu/' },
    { name: 'Rice University', icon: '🌾', admissionRate: 11, avgGpa: 3.96, avgSat: 1500, admissionsUrl: 'https://futureowls.rice.edu/' },
    { name: 'Washington University in St. Louis', icon: '🦅', admissionRate: 16, avgGpa: 3.92, avgSat: 1480, admissionsUrl: 'https://admissions.wustl.edu/' },
    { name: 'Emory University', icon: '🏛️', admissionRate: 19, avgGpa: 3.78, avgSat: 1450, admissionsUrl: 'https://apply.emory.edu/' },
    { name: 'Carnegie Mellon University', icon: '🤖', admissionRate: 17, avgGpa: 3.88, avgSat: 1470, admissionsUrl: 'https://www.cmu.edu/admission/' },
    { name: 'Notre Dame', icon: '⛪', admissionRate: 19, avgGpa: 3.90, avgSat: 1465, admissionsUrl: 'https://admissions.nd.edu/' },
    
    // Top Public Universities
    { name: 'UC Berkeley', icon: '🐻', admissionRate: 17, avgGpa: 3.89, avgSat: 1430, admissionsUrl: 'https://admissions.berkeley.edu/' },
    { name: 'UCLA', icon: '🌴', admissionRate: 14, avgGpa: 3.90, avgSat: 1435, admissionsUrl: 'https://admission.ucla.edu/' },
    { name: 'University of Michigan', icon: '〽️', admissionRate: 23, avgGpa: 3.85, avgSat: 1420, admissionsUrl: 'https://admissions.umich.edu/' },
    { name: 'University of Virginia', icon: '🏛️', admissionRate: 30, avgGpa: 3.87, avgSat: 1410, admissionsUrl: 'https://admission.virginia.edu/' },
    { name: 'University of North Carolina', icon: '🌟', admissionRate: 25, avgGpa: 3.85, avgSat: 1400, admissionsUrl: 'https://admissions.unc.edu/' },
    { name: 'UC San Diego', icon: '🌊', admissionRate: 38, avgGpa: 3.85, avgSat: 1370, admissionsUrl: 'https://admissions.ucsd.edu/' },
    { name: 'University of Florida', icon: '🐊', admissionRate: 37, avgGpa: 3.85, avgSat: 1360, admissionsUrl: 'https://admissions.ufl.edu/' },
    { name: 'Georgia Tech', icon: '🐝', admissionRate: 23, avgGpa: 3.89, avgSat: 1465, admissionsUrl: 'https://admission.gatech.edu/' },
    { name: 'University of Texas at Austin', icon: '🤘', admissionRate: 32, avgGpa: 3.83, avgSat: 1350, admissionsUrl: 'https://admissions.utexas.edu/' },
    { name: 'University of Wisconsin', icon: '🧀', admissionRate: 60, avgGpa: 3.75, avgSat: 1320, admissionsUrl: 'https://www.wisc.edu/admissions/' },
    
    // Liberal Arts Colleges
    { name: 'Williams College', icon: '🏔️', admissionRate: 15, avgGpa: 3.95, avgSat: 1470, admissionsUrl: 'https://admission.williams.edu/' },
    { name: 'Amherst College', icon: '📚', admissionRate: 13, avgGpa: 3.94, avgSat: 1465, admissionsUrl: 'https://www.amherst.edu/admission' },
    { name: 'Swarthmore College', icon: '🌹', admissionRate: 9, avgGpa: 3.92, avgSat: 1460, admissionsUrl: 'https://www.swarthmore.edu/admissions-aid' },
    { name: 'Pomona College', icon: '🍊', admissionRate: 10, avgGpa: 3.95, avgSat: 1470, admissionsUrl: 'https://www.pomona.edu/admissions' },
    { name: 'Bowdoin College', icon: '🦌', admissionRate: 10, avgGpa: 3.90, avgSat: 1450, admissionsUrl: 'https://www.bowdoin.edu/admissions/' },
    
    // Other Notable Universities
    { name: 'NYU', icon: '🏙️', admissionRate: 21, avgGpa: 3.69, avgSat: 1350, admissionsUrl: 'https://www.nyu.edu/admissions.html' },
    { name: 'Boston University', icon: '🦎', admissionRate: 22, avgGpa: 3.71, avgSat: 1340, admissionsUrl: 'https://www.bu.edu/admissions/' },
    { name: 'Northeastern University', icon: '🐺', admissionRate: 20, avgGpa: 3.91, avgSat: 1440, admissionsUrl: 'https://www.northeastern.edu/admissions/' },
    { name: 'Tulane University', icon: '🌊', admissionRate: 17, avgGpa: 3.56, avgSat: 1380, admissionsUrl: 'https://admission.tulane.edu/' },
    { name: 'University of Southern California', icon: '✌️', admissionRate: 16, avgGpa: 3.79, avgSat: 1430, admissionsUrl: 'https://admission.usc.edu/' }
  ];

  const calculateMatchPercentage = (university: any, stats: StudentStats): number => {
    let score = 0;
    
    // More realistic calculation based on actual admission standards
    const gpaScore = Math.min((stats.gpaWeighted / university.avgGpa) * 35, 35);
    const satScore = stats.satScore > 0 ? Math.min((stats.satScore / university.avgSat) * 25, 25) : 15;
    const classRankPercentile = ((stats.totalStudents - stats.classRank) / stats.totalStudents) * 100;
    const rankScore = Math.min(classRankPercentile * 0.15, 15);
    const extraScore = Math.min(stats.extracurriculars.length / 100 * 15, 15);
    const apScore = Math.min(stats.apCourses * 2, 10);
    
    score = gpaScore + satScore + rankScore + extraScore + apScore;
    
    // Major-specific adjustments
    if (stats.intendedMajor === 'Computer Science' && university.name.includes('MIT')) {
      score -= 10; // More competitive for CS at MIT
    }
    if (stats.intendedMajor === 'Pre-Med' && university.name.includes('Hopkins')) {
      score -= 5; // Competitive for pre-med
    }
    
    // Apply admission rate penalty for highly selective schools
    if (university.admissionRate < 10) {
      score *= 0.7; // Reduce chances for very selective schools
    } else if (university.admissionRate < 20) {
      score *= 0.85;
    }
    
    return Math.min(Math.max(Math.round(score), 5), 75); // Cap between 5-75%
  };

  const generateImprovements = (university: any, stats: StudentStats, matchPercentage: number): string[] => {
    const improvements = [];
    
    if (stats.gpaWeighted < university.avgGpa) {
      improvements.push(`Target weighted GPA of ${university.avgGpa} (currently ${stats.gpaWeighted})`);
    }
    
    if (stats.satScore < university.avgSat && stats.satScore > 0) {
      improvements.push(`Aim for SAT score of ${university.avgSat}+ (currently ${stats.satScore})`);
    }
    
    if (stats.apCourses < 8) {
      improvements.push(`Take more rigorous coursework - aim for 8+ AP courses`);
    }
    
    // University-specific tips
    if (university.name.includes('Harvard')) {
      improvements.push('Focus on leadership roles and community service impact');
    } else if (university.name.includes('MIT')) {
      improvements.push('Demonstrate strong STEM research experience and innovation');
    } else if (university.name.includes('Stanford')) {
      improvements.push('Show entrepreneurial spirit and interdisciplinary interests');
    }
    
    if (matchPercentage < 20) {
      improvements.push('Consider this a reach school - build a balanced list with matches and safeties');
    }
    
    return improvements.slice(0, 4);
  };

  const handleUniversityToggle = (universityName: string) => {
    setSelectedUniversities(prev => 
      prev.includes(universityName) 
        ? prev.filter(name => name !== universityName)
        : [...prev, universityName]
    );
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setUploadedFile(file);
      toast({
        title: "File Uploaded",
        description: `${file.name} has been uploaded successfully.`,
      });
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
        improvements: generateImprovements(university, studentStats, matchPercentage)
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
            <span>University Admission Predictor</span>
          </CardTitle>
          <CardDescription className="text-gray-600 dark:text-gray-300">
            For high school students - predict your chances at top universities and get personalized improvement tips.
          </CardDescription>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Student Stats Input */}
        <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700">
          <CardHeader>
            <CardTitle className="text-lg text-gray-900 dark:text-white">Your Academic Profile</CardTitle>
            <CardDescription className="text-gray-600 dark:text-gray-300">
              Enter your current academic statistics or upload your resume
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* File Upload Section */}
            <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4">
              <div className="text-center">
                <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">Upload your resume or transcript (optional)</p>
                <Button
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  size="sm"
                  className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
                >
                  Choose File
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.doc,.docx,.txt"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                {uploadedFile && (
                  <p className="text-sm text-green-600 mt-2">
                    ✓ {uploadedFile.name} uploaded
                  </p>
                )}
              </div>
            </div>

            <div>
              <Label htmlFor="intendedMajor" className="text-gray-900 dark:text-white">Intended Major</Label>
              <Select value={studentStats.intendedMajor} onValueChange={(value) => setStudentStats(prev => ({...prev, intendedMajor: value}))}>
                <SelectTrigger className="text-gray-900 dark:text-white bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600">
                  <SelectValue placeholder="Select your intended major" />
                </SelectTrigger>
                <SelectContent>
                  {majors.map((major) => (
                    <SelectItem key={major} value={major}>{major}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="gpaUnweighted" className="text-gray-900 dark:text-white">Unweighted GPA</Label>
                <Input
                  id="gpaUnweighted"
                  type="number"
                  step="0.01"
                  max="4.0"
                  value={studentStats.gpaUnweighted || ''}
                  onChange={(e) => setStudentStats(prev => ({...prev, gpaUnweighted: parseFloat(e.target.value) || 0}))}
                  className="text-gray-900 dark:text-white bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 placeholder-gray-500 dark:placeholder-gray-400"
                />
              </div>
              <div>
                <Label htmlFor="gpaWeighted" className="text-gray-900 dark:text-white">Weighted GPA</Label>
                <Input
                  id="gpaWeighted"
                  type="number"
                  step="0.01"
                  value={studentStats.gpaWeighted || ''}
                  onChange={(e) => setStudentStats(prev => ({...prev, gpaWeighted: parseFloat(e.target.value) || 0}))}
                  className="text-gray-900 dark:text-white bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 placeholder-gray-500 dark:placeholder-gray-400"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="satScore" className="text-gray-900 dark:text-white">SAT Score</Label>
                <Input
                  id="satScore"
                  type="number"
                  max="1600"
                  value={studentStats.satScore || ''}
                  onChange={(e) => setStudentStats(prev => ({...prev, satScore: parseInt(e.target.value) || 0}))}
                  className="text-gray-900 dark:text-white bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 placeholder-gray-500 dark:placeholder-gray-400"
                />
              </div>
              <div>
                <Label htmlFor="actScore" className="text-gray-900 dark:text-white">ACT Score</Label>
                <Input
                  id="actScore"
                  type="number"
                  max="36"
                  value={studentStats.actScore || ''}
                  onChange={(e) => setStudentStats(prev => ({...prev, actScore: parseInt(e.target.value) || 0}))}
                  className="text-gray-900 dark:text-white bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 placeholder-gray-500 dark:placeholder-gray-400"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="classRank" className="text-gray-900 dark:text-white">Class Rank</Label>
                <Input
                  id="classRank"
                  type="number"
                  value={studentStats.classRank || ''}
                  onChange={(e) => setStudentStats(prev => ({...prev, classRank: parseInt(e.target.value) || 1}))}
                  className="text-gray-900 dark:text-white bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 placeholder-gray-500 dark:placeholder-gray-400"
                />
              </div>
              <div>
                <Label htmlFor="totalStudents" className="text-gray-900 dark:text-white">Total Students in Class</Label>
                <Input
                  id="totalStudents"
                  type="number"
                  value={studentStats.totalStudents || ''}
                  onChange={(e) => setStudentStats(prev => ({...prev, totalStudents: parseInt(e.target.value) || 100}))}
                  className="text-gray-900 dark:text-white bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 placeholder-gray-500 dark:placeholder-gray-400"
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="apCourses" className="text-gray-900 dark:text-white">Number of AP Courses</Label>
              <Input
                id="apCourses"
                type="number"
                value={studentStats.apCourses || ''}
                onChange={(e) => setStudentStats(prev => ({...prev, apCourses: parseInt(e.target.value) || 0}))}
                className="text-gray-900 dark:text-white bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 placeholder-gray-500 dark:placeholder-gray-400"
              />
            </div>
            
            <div>
              <Label htmlFor="extracurriculars" className="text-gray-900 dark:text-white">Extracurricular Activities</Label>
              <Textarea
                id="extracurriculars"
                placeholder="List your extracurricular activities, leadership roles, volunteer work, etc."
                value={studentStats.extracurriculars}
                onChange={(e) => setStudentStats(prev => ({...prev, extracurriculars: e.target.value}))}
                className="text-gray-900 dark:text-white bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 placeholder-gray-500 dark:placeholder-gray-400"
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        {/* University Selection */}
        <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700">
          <CardHeader>
            <CardTitle className="text-lg text-gray-900 dark:text-white">Select Universities ({topUniversities.length} available)</CardTitle>
            <CardDescription className="text-gray-600 dark:text-gray-300">
              Choose universities you want to analyze your chances for
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
                  onClick={() => handleUniversityToggle(university.name)}
                >
                  <span className="text-lg mr-2">{university.icon}</span>
                  <div>
                    <div className="font-medium">{university.name}</div>
                    <div className="text-xs opacity-70">
                      {university.admissionRate}% acceptance rate • Avg GPA: {university.avgGpa}
                    </div>
                  </div>
                </Button>
              ))}
            </div>
            
            <Button 
              onClick={calculateChances}
              className="w-full mt-4 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
              disabled={selectedUniversities.length === 0}
            >
              <Target className="w-4 h-4 mr-2" />
              Predict My Chances
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Results */}
      {showResults && (
        <div className="space-y-4">
          <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700">
            <CardHeader>
              <CardTitle className="text-lg text-gray-900 dark:text-white">Your University Match Results</CardTitle>
              <CardDescription className="text-gray-600 dark:text-gray-300">
                Based on your academic profile, here are your estimated chances
              </CardDescription>
            </CardHeader>
          </Card>
          
          {results.map((result) => (
            <Card key={result.name} className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">{result.icon}</span>
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white">{result.name}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        {result.admissionRate}% acceptance rate
                      </p>
                      <a 
                        href={result.admissionsUrl}
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600 dark:text-blue-400 hover:underline flex items-center mt-1"
                      >
                        View Admissions Info <ExternalLink className="w-3 h-3 ml-1" />
                      </a>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-blue-600">
                      {result.matchPercentage}%
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-300">Match</div>
                  </div>
                </div>
                
                <Progress value={result.matchPercentage} className="mb-4" />
                
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white mb-2">Improvement Recommendations:</h4>
                  <ul className="space-y-1">
                    {result.improvements.map((improvement, index) => (
                      <li key={index} className="text-sm text-gray-700 dark:text-gray-300 flex items-start">
                        <span className="text-blue-600 mr-2">•</span>
                        {improvement}
                      </li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default UniversityPredictor;
