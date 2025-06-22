
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Globe, ArrowRight, Copy, Download, Sparkles } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Language {
  code: string;
  name: string;
  flag: string;
}

const MultilingualTranslator = () => {
  const { toast } = useToast();
  const [sourceText, setSourceText] = useState('');
  const [translatedText, setTranslatedText] = useState('');
  const [sourceLanguage, setSourceLanguage] = useState('en');
  const [targetLanguage, setTargetLanguage] = useState('es');
  const [isTranslating, setIsTranslating] = useState(false);
  const [documentType, setDocumentType] = useState('resume');

  const languages: Language[] = [
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'es', name: 'Spanish', flag: '🇪🇸' },
    { code: 'fr', name: 'French', flag: '🇫🇷' },
    { code: 'de', name: 'German', flag: '🇩🇪' },
    { code: 'it', name: 'Italian', flag: '🇮🇹' },
    { code: 'pt', name: 'Portuguese', flag: '🇵🇹' },
    { code: 'ru', name: 'Russian', flag: '🇷🇺' },
    { code: 'zh', name: 'Chinese', flag: '🇨🇳' },
    { code: 'ja', name: 'Japanese', flag: '🇯🇵' },
    { code: 'ko', name: 'Korean', flag: '🇰🇷' },
    { code: 'ar', name: 'Arabic', flag: '🇸🇦' },
    { code: 'hi', name: 'Hindi', flag: '🇮🇳' }
  ];

  const sampleTexts = {
    resume: `PROFESSIONAL SUMMARY
Experienced Software Engineer with 5+ years of expertise in full-stack development, specializing in React, Node.js, and cloud technologies. Proven track record of delivering scalable web applications and leading cross-functional teams to achieve project goals.

WORK EXPERIENCE
Senior Software Engineer | Tech Corp | 2020 - Present
• Developed and maintained 15+ web applications serving 100K+ users
• Led a team of 4 developers in implementing new features
• Reduced application load time by 40% through optimization techniques`,
    
    coverLetter: `Dear Hiring Manager,

I am writing to express my strong interest in the Software Engineer position at your company. With my extensive background in software development and passion for creating innovative solutions, I am confident that I would be a valuable addition to your team.

In my current role, I have successfully developed multiple web applications that have significantly improved user experience and business efficiency. My expertise in modern frameworks and commitment to best practices would enable me to contribute effectively to your projects.

I would welcome the opportunity to discuss how my skills and experience align with your team's needs. Thank you for considering my application.

Best regards,
[Your Name]`
  };

  const getTranslation = (text: string, fromLang: string, toLang: string): string => {
    console.log(`Translating from ${fromLang} to ${toLang}:`);
    console.log(text);

    // Enhanced mock translations with more comprehensive coverage
    const translations: Record<string, Record<string, string>> = {
      es: {
        'PROFESSIONAL SUMMARY': 'RESUMEN PROFESIONAL',
        'Experienced Software Engineer': 'Ingeniero de Software Experimentado',
        'WORK EXPERIENCE': 'EXPERIENCIA LABORAL',
        'Senior Software Engineer': 'Ingeniero de Software Senior',
        'Dear Hiring Manager': 'Estimado Gerente de Contratación',
        'Best regards': 'Saludos cordiales'
      },
      fr: {
        'PROFESSIONAL SUMMARY': 'RÉSUMÉ PROFESSIONNEL',
        'Experienced Software Engineer': 'Ingénieur Logiciel Expérimenté',
        'WORK EXPERIENCE': 'EXPÉRIENCE PROFESSIONNELLE',
        'Senior Software Engineer': 'Ingénieur Logiciel Senior',
        'Dear Hiring Manager': 'Cher Responsable de Recrutement',
        'Best regards': 'Cordialement'
      },
      de: {
        'PROFESSIONAL SUMMARY': 'BERUFLICHE ZUSAMMENFASSUNG',
        'Experienced Software Engineer': 'Erfahrener Software-Ingenieur',
        'WORK EXPERIENCE': 'BERUFSERFAHRUNG',
        'Senior Software Engineer': 'Senior Software-Ingenieur',
        'Dear Hiring Manager': 'Sehr geehrte Damen und Herren',
        'Best regards': 'Mit freundlichen Grüßen'
      },
      it: {
        'PROFESSIONAL SUMMARY': 'RIEPILOGO PROFESSIONALE',
        'Experienced Software Engineer': 'Ingegnere del Software Esperto',
        'WORK EXPERIENCE': 'ESPERIENZA LAVORATIVA',
        'Senior Software Engineer': 'Ingegnere del Software Senior',
        'Dear Hiring Manager': 'Gentile Responsabile delle Assunzioni',
        'Best regards': 'Cordiali saluti'
      },
      pt: {
        'PROFESSIONAL SUMMARY': 'RESUMO PROFISSIONAL',
        'Experienced Software Engineer': 'Engenheiro de Software Experiente',
        'WORK EXPERIENCE': 'EXPERIÊNCIA PROFISSIONAL',
        'Senior Software Engineer': 'Engenheiro de Software Sênior',
        'Dear Hiring Manager': 'Caro Gerente de Contratação',
        'Best regards': 'Atenciosamente'
      },
      zh: {
        'PROFESSIONAL SUMMARY': '专业总结',
        'Experienced Software Engineer': '经验丰富的软件工程师',
        'WORK EXPERIENCE': '工作经验',
        'Senior Software Engineer': '高级软件工程师',
        'Dear Hiring Manager': '尊敬的招聘经理',
        'Best regards': '此致敬礼'
      },
      ja: {
        'PROFESSIONAL SUMMARY': 'プロフェッショナル要約',
        'Experienced Software Engineer': '経験豊富なソフトウェアエンジニア',
        'WORK EXPERIENCE': '職歴',
        'Senior Software Engineer': 'シニアソフトウェアエンジニア',
        'Dear Hiring Manager': '採用担当者様',
        'Best regards': '敬具'
      }
    };

    // Simple word-by-word translation for demonstration
    let translatedText = text;
    if (translations[toLang]) {
      Object.entries(translations[toLang]).forEach(([key, value]) => {
        translatedText = translatedText.replace(new RegExp(key, 'gi'), value);
      });
    }

    // If no specific translation found, provide a generic response
    if (translatedText === text && toLang !== fromLang) {
      return `[Translated to ${languages.find(l => l.code === toLang)?.name}]\n\n${text}\n\n[Professional translation service would provide accurate translation here]`;
    }

    return translatedText;
  };

  const translateText = async () => {
    if (!sourceText.trim()) {
      toast({
        title: "No text to translate",
        description: "Please enter some text to translate.",
        variant: "destructive"
      });
      return;
    }

    if (sourceLanguage === targetLanguage) {
      toast({
        title: "Same language selected",
        description: "Please select different source and target languages.",
        variant: "destructive"
      });
      return;
    }

    setIsTranslating(true);
    console.log('Starting translation...');
    
    // Simulate API call with realistic delay
    setTimeout(() => {
      const translation = getTranslation(sourceText, sourceLanguage, targetLanguage);
      setTranslatedText(translation);
      setIsTranslating(false);
      
      toast({
        title: "Translation Complete!",
        description: `Document translated from ${languages.find(l => l.code === sourceLanguage)?.name} to ${languages.find(l => l.code === targetLanguage)?.name}`,
      });

      console.log('Translation completed successfully');
    }, 2000);
  };

  const loadSample = (type: 'resume' | 'coverLetter') => {
    setSourceText(sampleTexts[type]);
    setDocumentType(type);
    console.log(`Loaded ${type} sample`);
  };

  const copyToClipboard = () => {
    if (!translatedText) {
      toast({
        title: "Nothing to copy",
        description: "No translation available to copy.",
        variant: "destructive"
      });
      return;
    }

    navigator.clipboard.writeText(translatedText);
    toast({
      title: "Copied!",
      description: "Translation copied to clipboard.",
    });
  };

  const downloadTranslation = () => {
    if (!translatedText) {
      toast({
        title: "Nothing to download",
        description: "No translation available to download.",
        variant: "destructive"
      });
      return;
    }

    const element = document.createElement('a');
    const file = new Blob([translatedText], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `translated_${documentType}_${targetLanguage}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);

    toast({
      title: "Download started",
      description: "Your translated document is being downloaded.",
    });
  };

  return (
    <div className="space-y-6">
      <Card className="bg-gray-900/60 border-indigo-500/30 backdrop-blur-lg">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-indigo-300">
            <Globe className="w-5 h-5" />
            <span>Multilingual Translator</span>
          </CardTitle>
          <CardDescription className="text-gray-400">
            Translate your resume, cover letter, and other career documents to any language. Perfect for global job applications.
          </CardDescription>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Source Text */}
        <Card className="bg-gray-900/60 border-cyan-500/30 backdrop-blur-lg">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg text-cyan-300">Source Document</CardTitle>
              <div className="flex space-x-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => loadSample('resume')}
                  className="border-cyan-400/50 text-cyan-300 hover:bg-cyan-400/10"
                >
                  Load Resume Sample
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => loadSample('coverLetter')}
                  className="border-cyan-400/50 text-cyan-300 hover:bg-cyan-400/10"
                >
                  Load Cover Letter Sample
                </Button>
              </div>
            </div>
            <CardDescription className="text-gray-400">
              Paste your document or load a sample to get started
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block text-cyan-300">From Language</label>
                <Select value={sourceLanguage} onValueChange={setSourceLanguage}>
                  <SelectTrigger className="bg-gray-800/50 border-cyan-500/30">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-cyan-500/30">
                    {languages.map((lang) => (
                      <SelectItem key={lang.code} value={lang.code}>
                        <span className="flex items-center space-x-2">
                          <span>{lang.flag}</span>
                          <span>{lang.name}</span>
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block text-cyan-300">Document Type</label>
                <Select value={documentType} onValueChange={setDocumentType}>
                  <SelectTrigger className="bg-gray-800/50 border-cyan-500/30">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-cyan-500/30">
                    <SelectItem value="resume">Resume</SelectItem>
                    <SelectItem value="coverLetter">Cover Letter</SelectItem>
                    <SelectItem value="other">Other Document</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <Textarea
              value={sourceText}
              onChange={(e) => setSourceText(e.target.value)}
              placeholder="Paste your resume, cover letter, or other career document here..."
              className="min-h-96 bg-gray-800/50 border-cyan-500/30 text-gray-200 placeholder:text-gray-500"
            />

            <div className="flex items-center space-x-2">
              <Badge variant="outline" className="border-cyan-500/50 text-cyan-300">
                {languages.find(l => l.code === sourceLanguage)?.flag} {languages.find(l => l.code === sourceLanguage)?.name}
              </Badge>
              <ArrowRight className="w-4 h-4 text-gray-400" />
              <Badge variant="outline" className="border-indigo-500/50 text-indigo-300">
                {languages.find(l => l.code === targetLanguage)?.flag} {languages.find(l => l.code === targetLanguage)?.name}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Translation Output */}
        <Card className="bg-gray-900/60 border-indigo-500/30 backdrop-blur-lg">
          <CardHeader>
            <CardTitle className="text-lg text-indigo-300">Translation</CardTitle>
            <CardDescription className="text-gray-400">
              Your professionally translated document will appear here
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block text-indigo-300">To Language</label>
              <Select value={targetLanguage} onValueChange={setTargetLanguage}>
                <SelectTrigger className="bg-gray-800/50 border-indigo-500/30">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-indigo-500/30">
                  {languages.map((lang) => (
                    <SelectItem key={lang.code} value={lang.code}>
                      <span className="flex items-center space-x-2">
                        <span>{lang.flag}</span>
                        <span>{lang.name}</span>
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
                </Select>
            </div>

            {translatedText ? (
              <div className="space-y-4">
                <div className="bg-gray-800/50 p-4 rounded-lg border border-indigo-500/30 max-h-96 overflow-y-auto">
                  <pre className="whitespace-pre-wrap text-sm text-gray-200">
                    {translatedText}
                  </pre>
                </div>
                <div className="flex space-x-2">
                  <Button onClick={copyToClipboard} variant="outline" className="flex-1 border-indigo-500/50 text-indigo-300 hover:bg-indigo-500/10">
                    <Copy className="w-4 h-4 mr-2" />
                    Copy
                  </Button>
                  <Button onClick={downloadTranslation} variant="outline" className="flex-1 border-indigo-500/50 text-indigo-300 hover:bg-indigo-500/10">
                    <Download className="w-4 h-4 mr-2" />
                    Download
                  </Button>
                </div>
              </div>
            ) : (
              <div className="bg-gray-800/30 border-2 border-dashed border-indigo-500/30 rounded-lg p-8 text-center min-h-96 flex items-center justify-center">
                <div>
                  <Globe className="w-16 h-16 text-indigo-400 mx-auto mb-4" />
                  <p className="text-indigo-200 mb-2">Translation will appear here</p>
                  <p className="text-sm text-indigo-400/70">Add source text and click translate</p>
                </div>
              </div>
            )}

            <Button
              onClick={translateText}
              disabled={isTranslating || !sourceText.trim() || sourceLanguage === targetLanguage}
              className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 disabled:from-gray-600 disabled:to-gray-700"
            >
              {isTranslating ? (
                <>
                  <Sparkles className="w-4 h-4 mr-2 animate-spin" />
                  Translating...
                </>
              ) : (
                <>
                  <Globe className="w-4 h-4 mr-2" />
                  Translate Document
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Feature Highlights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gray-900/60 border-blue-500/30 backdrop-blur-lg">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                <Globe className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <h3 className="font-medium text-blue-300">12+ Languages</h3>
                <p className="text-sm text-gray-400">Support for major world languages</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gray-900/60 border-green-500/30 backdrop-blur-lg">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-green-400" />
              </div>
              <div>
                <h3 className="font-medium text-green-300">Professional Quality</h3>
                <p className="text-sm text-gray-400">Optimized for career documents</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gray-900/60 border-purple-500/30 backdrop-blur-lg">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
                <Download className="w-5 h-5 text-purple-400" />
              </div>
              <div>
                <h3 className="font-medium text-purple-300">Multiple Formats</h3>
                <p className="text-sm text-gray-400">Download in various formats</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default MultilingualTranslator;
