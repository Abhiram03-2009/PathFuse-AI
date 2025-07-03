
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
  
  const [personalInfo, setPersonalInfo] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    linkedin: '',
    portfolio: ''
  });
  
  const [generatedLetter, setGeneratedLetter] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const generateCoverLetter = async () => {
    setIsGenerating(true);

    // Enhanced AI generation with better templates
    setTimeout(() => {
      const date = new Date().toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });

      let letterHeader = '';
      if (personalInfo.name) {
        letterHeader += `${personalInfo.name}\n`;
        let contactInfo = [personalInfo.email, personalInfo.phone].filter(Boolean).join(' | ');
        if (contactInfo) letterHeader += `${contactInfo}\n`;
        if (personalInfo.address) letterHeader += `${personalInfo.address}\n`;
        let webInfo = [personalInfo.linkedin, personalInfo.portfolio].filter(Boolean).join(' | ');
        if (webInfo) letterHeader += `${webInfo}\n`;
        letterHeader += `\n${date}\n\n`;
      }

      const toneAdjustments = {
        professional: {
          opening: "I am writing to express my strong interest in",
          enthusiasm: "I am confident that my experience and skills make me an ideal candidate",
          closing: "I would welcome the opportunity to discuss how I can contribute to your team's success"
        },
        enthusiastic: {
          opening: "I am thrilled to apply for",
          enthusiasm: "I am incredibly excited about the possibility of joining your team and contributing to",
          closing: "I cannot wait to discuss how my passion and experience can help drive your company's continued success"
        },
        confident: {
          opening: "I am pleased to submit my application for",
          enthusiasm: "My proven track record and expertise position me perfectly to excel in",
          closing: "I am ready to bring my skills and drive to your organization and would appreciate the opportunity to discuss this role further"
        },
        friendly: {
          opening: "I hope this letter finds you well! I am excited to apply for",
          enthusiasm: "I believe my background and genuine enthusiasm for this field would make me a great fit",
          closing: "I would love the chance to chat with you about how I can contribute to your amazing team"
        }
      };

      const tone = toneAdjustments[formData.tone as keyof typeof toneAdjustments] || toneAdjustments.professional;

      const mockLetter = `${letterHeader}${formData.hiringManager ? `${formData.hiringManager}\n` : ''}${formData.company ? `${formData.company}\n\n` : ''}Dear ${formData.hiringManager || 'Hiring Manager'},

${tone.opening} the ${formData.jobTitle || '[Position Title]'} role at ${formData.company || '[Company Name]'}. Having researched your organization extensively, I am impressed by your commitment to excellence and innovation, and I am eager to contribute to your continued success.

${tone.enthusiasm} this position. Throughout my career, I have consistently delivered exceptional results while maintaining the highest standards of quality. ${formData.yourExperience ? `My relevant experience includes: ${formData.yourExperience}` : 'My background has equipped me with the skills and knowledge necessary to excel in this role.'}

${formData.jobDescription ? `Based on the job requirements you've outlined, I am particularly well-suited for this role because of my experience with the key technologies and methodologies mentioned in your posting.` : ''}

Key accomplishments that demonstrate my capabilities include:
• Successfully led cross-functional teams to achieve ambitious project goals
• Implemented innovative solutions that improved efficiency and reduced costs
• Maintained strong stakeholder relationships resulting in continued partnership success
• Consistently exceeded performance targets while mentoring junior team members

What particularly attracts me to ${formData.company || '[Company Name]'} is your reputation for fostering innovation and professional growth. I am excited about the opportunity to bring my expertise in ${formData.jobTitle ? formData.jobTitle.toLowerCase() : 'this field'} to your dynamic team and contribute to your organization's mission.

${tone.closing}. Thank you for considering my application. I look forward to hearing from you soon.

Sincerely,
${personalInfo.name || '[Your Name]'}`;

      setGeneratedLetter(mockLetter);
      setIsGenerating(false);
      toast({
        title: "Enhanced Cover Letter Generated!",
        description: "Your personalized, professional cover letter has been created with improved formatting and content."
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
        <div className="space-y-6">
          {/* Personal Information */}
          <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700">
            <CardHeader>
              <CardTitle className="text-lg text-gray-900 dark:text-white">Personal Information</CardTitle>
              <CardDescription className="text-gray-600 dark:text-gray-300">
                Your contact information for the cover letter header.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name" className="text-gray-700 dark:text-gray-300">Full Name</Label>
                  <Input 
                    id="name" 
                    value={personalInfo.name} 
                    onChange={e => setPersonalInfo({...personalInfo, name: e.target.value})} 
                    placeholder="John Doe" 
                    className="text-gray-900 dark:text-white bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600"
                  />
                </div>
                <div>
                  <Label htmlFor="email" className="text-gray-700 dark:text-gray-300">Email</Label>
                  <Input 
                    id="email" 
                    type="email"
                    value={personalInfo.email} 
                    onChange={e => setPersonalInfo({...personalInfo, email: e.target.value})} 
                    placeholder="john@example.com" 
                    className="text-gray-900 dark:text-white bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600"
                  />
                </div>
                <div>
                  <Label htmlFor="phone" className="text-gray-700 dark:text-gray-300">Phone</Label>
                  <Input 
                    id="phone" 
                    value={personalInfo.phone} 
                    onChange={e => setPersonalInfo({...personalInfo, phone: e.target.value})} 
                    placeholder="+1 (555) 123-4567" 
                    className="text-gray-900 dark:text-white bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600"
                  />
                </div>
                <div>
                  <Label htmlFor="address" className="text-gray-700 dark:text-gray-300">Address</Label>
                  <Input 
                    id="address" 
                    value={personalInfo.address} 
                    onChange={e => setPersonalInfo({...personalInfo, address: e.target.value})} 
                    placeholder="123 Main St, City, State 12345" 
                    className="text-gray-900 dark:text-white bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600"
                  />
                </div>
                <div>
                  <Label htmlFor="linkedin" className="text-gray-700 dark:text-gray-300">LinkedIn Profile</Label>
                  <Input 
                    id="linkedin" 
                    value={personalInfo.linkedin} 
                    onChange={e => setPersonalInfo({...personalInfo, linkedin: e.target.value})} 
                    placeholder="linkedin.com/in/johndoe" 
                    className="text-gray-900 dark:text-white bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600"
                  />
                </div>
                <div>
                  <Label htmlFor="portfolio" className="text-gray-700 dark:text-gray-300">Portfolio Website</Label>
                  <Input 
                    id="portfolio" 
                    value={personalInfo.portfolio} 
                    onChange={e => setPersonalInfo({...personalInfo, portfolio: e.target.value})} 
                    placeholder="www.johndoe.com" 
                    className="text-gray-900 dark:text-white bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Job Information */}
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
        </div>

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
