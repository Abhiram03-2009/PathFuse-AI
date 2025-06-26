
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FileText, Sparkles, Download, Copy, Eye } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useTheme } from '@/contexts/ThemeContext';
import PDFPreviewModal from './PDFPreviewModal';

const CoverLetterGenerator = () => {
  const { toast } = useToast();
  const { isDarkMode } = useTheme();
  const [formData, setFormData] = useState({
    jobTitle: '',
    company: '',
    hiringManager: '',
    jobDescription: '',
    yourExperience: '',
    tone: 'professional'
  });
  const [generatedLetter, setGeneratedLetter] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const generateCoverLetter = async () => {
    setIsGenerating(true);

    // Simulate AI generation
    setTimeout(() => {
      const mockLetter = `Dear ${formData.hiringManager || 'Hiring Manager'},

I am writing to express my strong interest in the ${formData.jobTitle} position at ${formData.company}. With my extensive background in relevant technologies and proven track record of success, I am confident that I would be a valuable addition to your team.

In my previous roles, I have developed expertise that directly aligns with the requirements outlined in your job description. ${formData.yourExperience ? `Specifically, ${formData.yourExperience.toLowerCase()}` : 'My experience includes working with various technologies and leading successful projects.'}

What particularly excites me about this opportunity at ${formData.company} is the chance to contribute to innovative projects and work with a team that values excellence and growth. I am impressed by your company's commitment to delivering high-quality solutions and would be thrilled to bring my skills and passion to this role.

I am eager to discuss how my background and enthusiasm can contribute to your team's continued success. Thank you for considering my application. I look forward to the opportunity to speak with you further about this exciting position.

Best regards,
[Your Name]`;
      setGeneratedLetter(mockLetter);
      setIsGenerating(false);
      toast({
        title: "Cover Letter Generated!",
        description: "Your personalized cover letter has been created."
      });
    }, 2000);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedLetter);
    toast({
      title: "Copied!",
      description: "Cover letter copied to clipboard."
    });
  };

  return (
    <div className={`space-y-6 ${isDarkMode ? 'dark' : ''}`}>
      <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-gray-900 dark:text-white">
            <FileText className="w-5 h-5" />
            <span>AI Cover Letter Generator</span>
          </CardTitle>
          <CardDescription className="text-gray-600 dark:text-gray-300">
            Create compelling, personalized cover letters that get you noticed by hiring managers.
          </CardDescription>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Form */}
        <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700">
          <CardHeader>
            <CardTitle className="text-lg text-gray-900 dark:text-white">Job Information</CardTitle>
            <CardDescription className="text-gray-600 dark:text-gray-300">
              Provide details about the job and company to personalize your cover letter.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="jobTitle" className="text-gray-700 dark:text-gray-300">Job Title</Label>
                <Input 
                  id="jobTitle" 
                  value={formData.jobTitle} 
                  onChange={e => setFormData({...formData, jobTitle: e.target.value})} 
                  placeholder="Software Engineer" 
                  className="text-gray-900 dark:text-white bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 placeholder-gray-500 dark:placeholder-gray-400"
                />
              </div>
              <div>
                <Label htmlFor="company" className="text-gray-700 dark:text-gray-300">Company Name</Label>
                <Input 
                  id="company" 
                  value={formData.company} 
                  onChange={e => setFormData({...formData, company: e.target.value})} 
                  placeholder="Google" 
                  className="text-gray-900 dark:text-white bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 placeholder-gray-500 dark:placeholder-gray-400"
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="hiringManager" className="text-gray-700 dark:text-gray-300">Hiring Manager (Optional)</Label>
              <Input 
                id="hiringManager" 
                value={formData.hiringManager} 
                onChange={e => setFormData({...formData, hiringManager: e.target.value})} 
                placeholder="Ms. Johnson" 
                className="text-gray-900 dark:text-white bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 placeholder-gray-500 dark:placeholder-gray-400"
              />
            </div>

            <div>
              <Label htmlFor="tone" className="text-gray-700 dark:text-gray-300">Tone</Label>
              <Select value={formData.tone} onValueChange={value => setFormData({...formData, tone: value})}>
                <SelectTrigger className="text-gray-900 dark:text-white bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600">
                  <SelectValue placeholder="Select tone" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="professional">Professional</SelectItem>
                  <SelectItem value="enthusiastic">Enthusiastic</SelectItem>
                  <SelectItem value="confident">Confident</SelectItem>
                  <SelectItem value="friendly">Friendly</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="jobDescription" className="text-gray-700 dark:text-gray-300">Job Description</Label>
              <Textarea 
                id="jobDescription" 
                value={formData.jobDescription} 
                onChange={e => setFormData({...formData, jobDescription: e.target.value})} 
                placeholder="Paste the job description here..." 
                className="min-h-24 text-gray-900 dark:text-white bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 placeholder-gray-500 dark:placeholder-gray-400" 
              />
            </div>

            <div>
              <Label htmlFor="yourExperience" className="text-gray-700 dark:text-gray-300">Your Relevant Experience</Label>
              <Textarea 
                id="yourExperience" 
                value={formData.yourExperience} 
                onChange={e => setFormData({...formData, yourExperience: e.target.value})} 
                placeholder="Describe your relevant experience and achievements..." 
                className="min-h-24 text-gray-900 dark:text-white bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 placeholder-gray-500 dark:placeholder-gray-400" 
              />
            </div>

            <Button 
              onClick={generateCoverLetter} 
              disabled={isGenerating || !formData.jobTitle || !formData.company} 
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
            >
              {isGenerating ? (
                <>
                  <Sparkles className="w-4 h-4 mr-2 animate-spin" />
                  Generating Cover Letter...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Generate Cover Letter
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Generated Cover Letter */}
        <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700">
          <CardHeader>
            <CardTitle className="text-lg text-gray-900 dark:text-white">Generated Cover Letter</CardTitle>
            <CardDescription className="text-gray-600 dark:text-gray-300">
              Your AI-generated, personalized cover letter will appear here.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {generatedLetter ? (
              <div className="space-y-4">
                <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-600 max-h-96 overflow-y-auto">
                  <pre className="whitespace-pre-wrap text-sm text-gray-900 dark:text-white font-sans">
                    {generatedLetter}
                  </pre>
                </div>
                <div className="flex space-x-2">
                  <Button onClick={copyToClipboard} variant="outline" className="flex-1 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700">
                    <Copy className="w-4 h-4 mr-2" />
                    Copy to Clipboard
                  </Button>
                  <Button 
                    onClick={() => setShowPreview(true)}
                    variant="outline" 
                    className="flex-1 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    Preview & Download PDF
                  </Button>
                </div>
              </div>
            ) : (
              <div className="bg-gray-50 dark:bg-gray-800 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center min-h-96 flex items-center justify-center">
                <div>
                  <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 dark:text-gray-300 mb-2">Your cover letter will appear here</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Fill in the job details and click generate</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <PDFPreviewModal
        isOpen={showPreview}
        onClose={() => setShowPreview(false)}
        title="Cover Letter"
        content={generatedLetter}
        type="cover-letter"
      />
    </div>
  );
};

export default CoverLetterGenerator;
