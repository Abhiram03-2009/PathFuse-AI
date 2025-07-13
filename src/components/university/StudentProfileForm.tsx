
import React, { useRef, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Upload, FileText, Eye, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
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
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResults, setAnalysisResults] = useState<string>('');
  const [showPreview, setShowPreview] = useState(false);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type === 'application/pdf' || file.type === 'application/msword' || file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || file.type === 'text/plain') {
        setUploadedFile(file);
        setIsAnalyzing(true);
        
        try {
          const reader = new FileReader();
          reader.onload = async (e) => {
            const text = e.target?.result as string;
            
            // Use the resume analyzer edge function
            const { data, error } = await supabase.functions.invoke('resume-analyzer', {
              body: { 
                resumeText: text,
                analysisType: 'university'
              }
            });

            if (error) {
              console.error('Resume analysis error:', error);
              // Fallback to manual parsing
              const gpaMatch = text.match(/GPA[:\s]*(\d+\.\d+)/i);
              if (gpaMatch) {
                setStudentStats(prev => ({...prev, gpaWeighted: parseFloat(gpaMatch[1])}));
              }
              
              const satMatch = text.match(/SAT[:\s]*(\d{4})/i);
              if (satMatch) {
                setStudentStats(prev => ({...prev, satScore: parseInt(satMatch[1])}));
              }
              
              const activitiesMatch = text.match(/(?:activities|extracurricular|involvement)[:\s\n]*([\s\S]*?)(?:\n\n|\n[A-Z]|$)/i);
              if (activitiesMatch) {
                setStudentStats(prev => ({...prev, extracurriculars: activitiesMatch[1].trim()}));
              }
              
              setAnalysisResults('File uploaded successfully. Basic parsing completed.');
            } else if (data?.analysis) {
              setAnalysisResults(data.analysis);
              
              // Update stats if extracted data is available
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
            }
          };
          
          reader.readAsText(file);
          
          toast({
            title: "Resume Analyzed",
            description: `${file.name} has been uploaded and analyzed for academic information.`,
          });
        } catch (error) {
          console.error('Error analyzing resume:', error);
          toast({
            title: "Analysis Error",
            description: "Failed to analyze resume. Please try again.",
            variant: "destructive"
          });
        } finally {
          setIsAnalyzing(false);
        }
      } else {
        toast({
          title: "Invalid File Type",
          description: "Please upload a PDF, Word document, or text file.",
          variant: "destructive"
        });
      }
    }
  };

  const removeFile = () => {
    setUploadedFile(null);
    setAnalysisResults('');
    setShowPreview(false);
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
          {!uploadedFile ? (
            <div className="text-center">
              <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">Upload your resume or transcript for AI analysis</p>
              <Button
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                size="sm"
                className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
                disabled={isAnalyzing}
              >
                {isAnalyzing ? 'Analyzing...' : 'Choose File'}
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.doc,.docx,.txt"
                onChange={handleFileUpload}
                className="hidden"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                PDF, DOC, DOCX, or TXT files accepted
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <FileText className="w-6 h-6 text-blue-600" />
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">{uploadedFile.name}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {(uploadedFile.size / 1024).toFixed(1)} KB
                    </p>
                  </div>
                </div>
                <div className="flex space-x-2">
                  {analysisResults && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowPreview(!showPreview)}
                      className="text-gray-700 dark:text-gray-300"
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      {showPreview ? 'Hide' : 'Show'} Analysis
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={removeFile}
                    className="text-red-600 hover:text-red-700"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              
              {showPreview && analysisResults && (
                <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg border">
                  <h4 className="font-medium text-gray-900 dark:text-white mb-2">Analysis Results:</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-300 whitespace-pre-wrap">
                    {analysisResults}
                  </p>
                </div>
              )}
            </div>
          )}
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
