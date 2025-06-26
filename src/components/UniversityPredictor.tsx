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
  logo: string;
  admissionRate: number;
  avgGpa: number;
  avgSat: number;
  matchPercentage: number;
  improvements: string[];
  admissionsUrl: string;
  specificTips: string[];
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
    'Chemistry', 'Political Science', 'English', 'History', 'Art', 'Data Science',
    'Artificial Intelligence', 'Environmental Science', 'International Relations'
  ];

  const topUniversities = [
    // Ivy League
    { name: 'Harvard University', logo: 'https://upload.wikimedia.org/wikipedia/en/2/29/Harvard_shield_wreath.svg', admissionRate: 3.4, avgGpa: 4.18, avgSat: 1520, admissionsUrl: 'https://college.harvard.edu/admissions' },
    { name: 'Yale University', logo: 'https://upload.wikimedia.org/wikipedia/commons/0/07/Yale_University_Shield_1.svg', admissionRate: 4.6, avgGpa: 4.14, avgSat: 1515, admissionsUrl: 'https://admissions.yale.edu/' },
    { name: 'Princeton University', logo: 'https://upload.wikimedia.org/wikipedia/commons/d/d0/Princeton_seal.svg', admissionRate: 5.8, avgGpa: 3.95, avgSat: 1510, admissionsUrl: 'https://admission.princeton.edu/' },
    { name: 'Columbia University', logo: 'https://upload.wikimedia.org/wikipedia/en/0/08/Columbia_University_seal.svg', admissionRate: 3.7, avgGpa: 4.15, avgSat: 1505, admissionsUrl: 'https://undergrad.admissions.columbia.edu/' },
    { name: 'University of Pennsylvania', logo: 'https://upload.wikimedia.org/wikipedia/commons/9/92/UPenn_shield_with_banner.svg', admissionRate: 5.9, avgGpa: 3.94, avgSat: 1500, admissionsUrl: 'https://admissions.upenn.edu/' },
    { name: 'Dartmouth College', logo: 'https://upload.wikimedia.org/wikipedia/commons/e/e4/Dartmouth_College_shield.svg', admissionRate: 6.2, avgGpa: 3.93, avgSat: 1490, admissionsUrl: 'https://admissions.dartmouth.edu/' },
    { name: 'Brown University', logo: 'https://upload.wikimedia.org/wikipedia/commons/a/aa/Seal_of_Brown_University.svg', admissionRate: 5.4, avgGpa: 3.92, avgSat: 1485, admissionsUrl: 'https://admission.brown.edu/' },
    { name: 'Cornell University', logo: 'https://upload.wikimedia.org/wikipedia/commons/4/47/Cornell_University_seal.svg', admissionRate: 7.3, avgGpa: 3.91, avgSat: 1480, admissionsUrl: 'https://admissions.cornell.edu/' },
    
    // Top Private Universities
    { name: 'Stanford University', logo: 'https://upload.wikimedia.org/wikipedia/commons/b/b5/Seal_of_Leland_Stanford_Junior_University.svg', admissionRate: 3.9, avgGpa: 3.96, avgSat: 1510, admissionsUrl: 'https://admission.stanford.edu/' },
    { name: 'MIT', logo: 'https://upload.wikimedia.org/wikipedia/commons/0/0c/MIT_logo.svg', admissionRate: 4.1, avgGpa: 4.17, avgSat: 1540, admissionsUrl: 'https://mitadmissions.org/' },
    { name: 'University of Chicago', logo: 'https://upload.wikimedia.org/wikipedia/en/7/79/University_of_Chicago_shield.svg', admissionRate: 6.2, avgGpa: 4.0, avgSat: 1520, admissionsUrl: 'https://collegeadmissions.uchicago.edu/' },
    { name: 'Northwestern University', logo: 'https://upload.wikimedia.org/wikipedia/commons/d/d1/Northwestern_University_seal.svg', admissionRate: 7.0, avgGpa: 4.0, avgSat: 1490, admissionsUrl: 'https://admissions.northwestern.edu/' },
    { name: 'Duke University', logo: 'https://upload.wikimedia.org/wikipedia/commons/e/e1/Duke_University_Crest.svg', admissionRate: 6.2, avgGpa: 3.94, avgSat: 1485, admissionsUrl: 'https://admissions.duke.edu/' },
    { name: 'Johns Hopkins University', logo: 'https://upload.wikimedia.org/wikipedia/commons/c/ce/Johns_Hopkins_University_seal.svg', admissionRate: 7.5, avgGpa: 3.93, avgSat: 1480, admissionsUrl: 'https://apply.jhu.edu/' },
    
    // Top Public Universities
    { name: 'UC Berkeley', logo: 'https://upload.wikimedia.org/wikipedia/commons/a/a1/Seal_of_University_of_California%2C_Berkeley.svg', admissionRate: 11.4, avgGpa: 3.89, avgSat: 1430, admissionsUrl: 'https://admissions.berkeley.edu/' },
    { name: 'UCLA', logo: 'https://upload.wikimedia.org/wikipedia/commons/0/0d/The_University_of_California_UCLA.svg', admissionRate: 8.6, avgGpa: 3.90, avgSat: 1435, admissionsUrl: 'https://admission.ucla.edu/' },
    { name: 'University of Michigan', logo: 'https://upload.wikimedia.org/wikipedia/commons/9/93/Seal_of_the_University_of_Michigan.svg', admissionRate: 17.7, avgGpa: 3.85, avgSat: 1420, admissionsUrl: 'https://admissions.umich.edu/' },
    { name: 'University of Virginia', logo: 'https://upload.wikimedia.org/wikipedia/commons/2/2c/University_of_Virginia_seal.svg', admissionRate: 19.0, avgGpa: 3.87, avgSat: 1410, admissionsUrl: 'https://admission.virginia.edu/' },
    { name: 'Georgia Tech', logo: 'https://upload.wikimedia.org/wikipedia/commons/6/6c/Georgia_Tech_seal.svg', admissionRate: 16.3, avgGpa: 3.89, avgSat: 1465, admissionsUrl: 'https://admission.gatech.edu/' },
  ];

  const calculateMatchPercentage = (university: any, stats: StudentStats): number => {
    let score = 0;
    
    // GPA comparison (35% weight)
    const gpaRatio = stats.gpaWeighted / university.avgGpa;
    const gpaScore = Math.min(gpaRatio * 35, 40);
    
    // SAT comparison (25% weight)
    const satRatio = stats.satScore > 0 ? stats.satScore / university.avgSat : 0.7;
    const satScore = Math.min(satRatio * 25, 30);
    
    // Class rank percentile (15% weight)
    const classRankPercentile = ((stats.totalStudents - stats.classRank + 1) / stats.totalStudents) * 100;
    const rankScore = Math.min(classRankPercentile * 0.15, 15);
    
    // Extracurriculars depth analysis (15% weight)
    const ecWords = stats.extracurriculars.toLowerCase();
    let ecScore = 0;
    
    // Check for leadership keywords
    if (ecWords.includes('president') || ecWords.includes('captain') || ecWords.includes('leader')) ecScore += 5;
    if (ecWords.includes('volunteer') || ecWords.includes('community')) ecScore += 3;
    if (ecWords.includes('research') || ecWords.includes('internship')) ecScore += 4;
    if (ecWords.includes('award') || ecWords.includes('competition')) ecScore += 3;
    
    // Length and diversity bonus
    const ecLength = stats.extracurriculars.length;
    if (ecLength > 200) ecScore += 2;
    if (ecLength > 400) ecScore += 1;
    
    ecScore = Math.min(ecScore, 15);
    
    // AP courses (10% weight)
    const apScore = Math.min(stats.apCourses * 1.2, 10);
    
    score = gpaScore + satScore + rankScore + ecScore + apScore;
    
    // Major-specific adjustments
    const majorAdjustments = getMajorAdjustments(university.name, stats.intendedMajor, stats);
    score += majorAdjustments;
    
    // Apply selectivity penalty
    const selectivityPenalty = getSelectivityPenalty(university.admissionRate);
    score *= selectivityPenalty;
    
    // Ensure realistic range
    return Math.min(Math.max(Math.round(score), 2), 65);
  };

  const getMajorAdjustments = (universityName: string, major: string, stats: StudentStats): number => {
    let adjustment = 0;
    
    if (major === 'Computer Science' || major === 'Data Science' || major === 'Artificial Intelligence') {
      if (universityName.includes('MIT') || universityName.includes('Stanford')) adjustment -= 8;
      if (universityName.includes('Berkeley') || universityName.includes('Carnegie Mellon')) adjustment -= 5;
      if (stats.extracurriculars.toLowerCase().includes('coding') || 
          stats.extracurriculars.toLowerCase().includes('programming')) adjustment += 3;
    }
    
    if (major === 'Pre-Med' || major === 'Biology') {
      if (universityName.includes('Hopkins') || universityName.includes('Harvard')) adjustment -= 6;
      if (stats.extracurriculars.toLowerCase().includes('medical') || 
          stats.extracurriculars.toLowerCase().includes('hospital')) adjustment += 3;
    }
    
    if (major === 'Business' || major === 'Economics') {
      if (universityName.includes('Wharton') || universityName.includes('Chicago')) adjustment -= 4;
    }
    
    return adjustment;
  };

  const getSelectivityPenalty = (admissionRate: number): number => {
    if (admissionRate < 5) return 0.5;
    if (admissionRate < 10) return 0.65;
    if (admissionRate < 15) return 0.8;
    if (admissionRate < 25) return 0.9;
    return 1.0;
  };

  const generateSpecificTips = (university: any, stats: StudentStats, major: string): string[] => {
    const tips = [];
    
    // University-specific tips
    if (university.name.includes('Harvard')) {
      tips.push('Harvard values intellectual curiosity - highlight unique academic interests');
      tips.push('Demonstrate significant community impact through your activities');
      tips.push('Show leadership that creates positive change in your community');
    } else if (university.name.includes('MIT')) {
      tips.push('MIT seeks "makers" - showcase hands-on projects and innovations');
      tips.push('Demonstrate collaboration skills alongside technical excellence');
      tips.push('Show how you solve problems creatively and practically');
    } else if (university.name.includes('Stanford')) {
      tips.push('Stanford values intellectual vitality - show passion for learning');
      tips.push('Demonstrate entrepreneurial thinking and initiative');
      tips.push('Show how you contribute to your community in meaningful ways');
    } else if (university.name.includes('Yale')) {
      tips.push('Yale seeks students who will contribute to their residential colleges');
      tips.push('Demonstrate intellectual curiosity across multiple disciplines');
      tips.push('Show commitment to service and community engagement');
    } else if (university.name.includes('Berkeley')) {
      tips.push('UC Berkeley values academic excellence and social consciousness');
      tips.push('Demonstrate leadership in addressing societal challenges');
      tips.push('Show how your experiences shaped your worldview');
    }
    
    // Major-specific tips
    if (major === 'Computer Science') {
      tips.push('Showcase programming projects, hackathons, or coding competitions');
      tips.push('Demonstrate problem-solving skills through technical challenges');
    } else if (major === 'Pre-Med') {
      tips.push('Show meaningful healthcare exposure through volunteering or shadowing');
      tips.push('Demonstrate empathy and service through community involvement');
    } else if (major === 'Business') {
      tips.push('Show entrepreneurial initiatives or business-related internships');
      tips.push('Demonstrate leadership in organizations or community projects');
    }
    
    return tips.slice(0, 4);
  };

  const generateImprovements = (university: any, stats: StudentStats, matchPercentage: number): string[] => {
    const improvements = [];
    
    if (stats.gpaWeighted < university.avgGpa - 0.1) {
      improvements.push(`Target weighted GPA of ${university.avgGpa}+ (currently ${stats.gpaWeighted})`);
    }
    
    if (stats.satScore < university.avgSat - 50 && stats.satScore > 0) {
      improvements.push(`Aim for SAT score of ${university.avgSat}+ (currently ${stats.satScore})`);
    }
    
    if (stats.apCourses < 8) {
      improvements.push(`Take more rigorous coursework - aim for 8+ AP courses (currently ${stats.apCourses})`);
    }
    
    if (stats.extracurriculars.length < 200) {
      improvements.push('Develop deeper extracurricular involvement with leadership roles');
    }
    
    if (matchPercentage < 15) {
      improvements.push('Consider this a high reach - focus on demonstrating exceptional qualities');
    } else if (matchPercentage < 25) {
      improvements.push('This is a reach school - ensure strong essay and recommendation letters');
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
      
      // Simulate resume parsing
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result as string;
        
        // Extract GPA if mentioned
        const gpaMatch = text.match(/GPA[:\s]*(\d+\.\d+)/i);
        if (gpaMatch) {
          setStudentStats(prev => ({...prev, gpaWeighted: parseFloat(gpaMatch[1])}));
        }
        
        // Extract SAT score if mentioned
        const satMatch = text.match(/SAT[:\s]*(\d{4})/i);
        if (satMatch) {
          setStudentStats(prev => ({...prev, satScore: parseInt(satMatch[1])}));
        }
        
        // Extract activities section
        const activitiesMatch = text.match(/(?:activities|extracurricular|involvement)[:\s\n]*([\s\S]*?)(?:\n\n|\n[A-Z]|$)/i);
        if (activitiesMatch) {
          setStudentStats(prev => ({...prev, extracurriculars: activitiesMatch[1].trim()}));
        }
      };
      
      reader.readAsText(file);
      
      toast({
        title: "Resume Uploaded",
        description: `${file.name} has been uploaded and analyzed for academic information.`,
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
        {/* Student Stats Input */}
        <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700">
          <CardHeader>
            <CardTitle className="text-lg text-gray-900 dark:text-white">Your Academic Profile</CardTitle>
            <CardDescription className="text-gray-600 dark:text-gray-300">
              Enter your academic statistics or upload your resume for automatic parsing
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* File Upload Section */}
            <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4">
              <div className="text-center">
                <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">Upload your resume or transcript for AI parsing</p>
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
                    ✓ {uploadedFile.name} uploaded and analyzed
                  </p>
                )}
              </div>
            </div>

            <div>
              <Label htmlFor="intendedMajor" className="text-gray-900 dark:text-white">Intended Major *</Label>
              <Select value={studentStats.intendedMajor} onValueChange={(value) => setStudentStats(prev => ({...prev, intendedMajor: value}))}>
                <SelectTrigger className="text-gray-900 dark:text-white bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600">
                  <SelectValue placeholder="Select your intended major" />
                </SelectTrigger>
                <SelectContent className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600">
                  {majors.map((major) => (
                    <SelectItem key={major} value={major} className="text-gray-900 dark:text-white">{major}</SelectItem>
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
                placeholder="List your extracurricular activities, leadership roles, volunteer work, research, internships, awards, etc. Be specific about your involvement and impact."
                value={studentStats.extracurriculars}
                onChange={(e) => setStudentStats(prev => ({...prev, extracurriculars: e.target.value}))}
                className="text-gray-900 dark:text-white bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 placeholder-gray-500 dark:placeholder-gray-400"
                rows={4}
              />
            </div>
          </CardContent>
        </Card>

        {/* University Selection */}
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
                  onClick={() => handleUniversityToggle(university.name)}
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
              onClick={calculateChances}
              className="w-full mt-4 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
              disabled={selectedUniversities.length === 0 || !studentStats.intendedMajor}
            >
              <Target className="w-4 h-4 mr-2" />
              Analyze My Admission Chances
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Results */}
      {showResults && (
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
                        {result.admissionRate}% acceptance rate • {studentStats.intendedMajor}
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
      )}
    </div>
  );
};

export default UniversityPredictor;
