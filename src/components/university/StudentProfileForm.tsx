
import React, { useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Upload } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { StudentStats } from './types';
import { majors } from './constants';

interface StudentProfileFormProps {
  studentStats: StudentStats;
  setStudentStats: React.Dispatch<React.SetStateAction<StudentStats>>;
  isDarkMode: boolean;
}

const StudentProfileForm: React.FC<StudentProfileFormProps> = ({ 
  studentStats, 
  setStudentStats, 
  isDarkMode 
}) => {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
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

  return (
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
  );
};

export default StudentProfileForm;
