
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

  const translateText = async () => {
    setIsTranslating(true);
    
    // Simulate translation
    setTimeout(() => {
      const mockTranslations: Record<string, Record<string, string>> = {
        es: {
          resume: `RESUMEN PROFESIONAL
Ingeniero de Software experimentado con más de 5 años de experiencia en desarrollo full-stack, especializado en React, Node.js y tecnologías en la nube. Historial comprobado de entrega de aplicaciones web escalables y liderazgo de equipos multifuncionales para lograr objetivos de proyecto.

EXPERIENCIA LABORAL
Ingeniero de Software Senior | Tech Corp | 2020 - Presente
• Desarrollé y mantuve más de 15 aplicaciones web que sirven a más de 100K usuarios
• Lideré un equipo de 4 desarrolladores en la implementación de nuevas características
• Reduje el tiempo de carga de la aplicación en un 40% mediante técnicas de optimización`,
          
          coverLetter: `Estimado Gerente de Contratación,

Le escribo para expresar mi gran interés en el puesto de Ingeniero de Software en su empresa. Con mi amplia experiencia en desarrollo de software y pasión por crear soluciones innovadoras, estoy seguro de que sería una valiosa adición a su equipo.

En mi rol actual, he desarrollado exitosamente múltiples aplicaciones web que han mejorado significativamente la experiencia del usuario y la eficiencia empresarial. Mi experiencia en frameworks modernos y compromiso con las mejores prácticas me permitirían contribuir efectivamente a sus proyectos.

Me encantaría la oportunidad de discutir cómo mis habilidades y experiencia se alinean con las necesidades de su equipo. Gracias por considerar mi solicitud.

Saludos cordiales,
[Su Nombre]`
        },
        fr: {
          resume: `RÉSUMÉ PROFESSIONNEL
Ingénieur logiciel expérimenté avec plus de 5 ans d'expertise en développement full-stack, spécialisé en React, Node.js et technologies cloud. Historique prouvé de livraison d'applications web évolutives et de direction d'équipes transfonctionnelles pour atteindre les objectifs de projet.

EXPÉRIENCE PROFESSIONNELLE
Ingénieur Logiciel Senior | Tech Corp | 2020 - Présent
• Développé et maintenu plus de 15 applications web servant plus de 100K utilisateurs
• Dirigé une équipe de 4 développeurs dans l'implémentation de nouvelles fonctionnalités
• Réduit le temps de chargement de l'application de 40% grâce aux techniques d'optimisation`,
          
          coverLetter: `Cher Responsable de Recrutement,

Je vous écris pour exprimer mon vif intérêt pour le poste d'Ingénieur Logiciel dans votre entreprise. Avec ma vaste expérience en développement logiciel et ma passion pour créer des solutions innovantes, je suis confiant que je serais un ajout précieux à votre équipe.

Dans mon rôle actuel, j'ai développé avec succès plusieurs applications web qui ont considérablement amélioré l'expérience utilisateur et l'efficacité commerciale. Mon expertise des frameworks modernes et mon engagement envers les meilleures pratiques me permettraient de contribuer efficacement à vos projets.

Je serais ravi de l'opportunité de discuter de la façon dont mes compétences et mon expérience s'alignent avec les besoins de votre équipe. Merci de considérer ma candidature.

Cordialement,
[Votre Nom]`
        }
      };

      const translation = mockTranslations[targetLanguage]?.[documentType] || 
        'Translation completed! Professional translation services ensure accuracy for career documents.';
      
      setTranslatedText(translation);
      setIsTranslating(false);
      
      toast({
        title: "Translation Complete!",
        description: `Document translated from ${languages.find(l => l.code === sourceLanguage)?.name} to ${languages.find(l => l.code === targetLanguage)?.name}`,
      });
    }, 2000);
  };

  const loadSample = (type: 'resume' | 'coverLetter') => {
    setSourceText(sampleTexts[type]);
    setDocumentType(type);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(translatedText);
    toast({
      title: "Copied!",
      description: "Translation copied to clipboard.",
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Globe className="w-5 h-5" />
            <span>Multilingual Translator</span>
          </CardTitle>
          <CardDescription>
            Translate your resume, cover letter, and other career documents to any language. Perfect for global job applications.
          </CardDescription>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Source Text */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Source Document</CardTitle>
              <div className="flex space-x-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => loadSample('resume')}
                >
                  Load Resume Sample
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => loadSample('coverLetter')}
                >
                  Load Cover Letter Sample
                </Button>
              </div>
            </div>
            <CardDescription>
              Paste your document or load a sample to get started
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">From Language</label>
                <Select value={sourceLanguage} onValueChange={setSourceLanguage}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
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
                <label className="text-sm font-medium mb-2 block">Document Type</label>
                <Select value={documentType} onValueChange={setDocumentType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
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
              className="min-h-96"
            />

            <div className="flex items-center space-x-2">
              <Badge variant="outline">
                {languages.find(l => l.code === sourceLanguage)?.flag} {languages.find(l => l.code === sourceLanguage)?.name}
              </Badge>
              <ArrowRight className="w-4 h-4 text-gray-400" />
              <Badge variant="outline">
                {languages.find(l => l.code === targetLanguage)?.flag} {languages.find(l => l.code === targetLanguage)?.name}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Translation Output */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Translation</CardTitle>
            <CardDescription>
              Your professionally translated document will appear here
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">To Language</label>
              <Select value={targetLanguage} onValueChange={setTargetLanguage}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
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
                <div className="bg-gray-50 p-4 rounded-lg border max-h-96 overflow-y-auto">
                  <pre className="whitespace-pre-wrap text-sm">
                    {translatedText}
                  </pre>
                </div>
                <div className="flex space-x-2">
                  <Button onClick={copyToClipboard} variant="outline" className="flex-1">
                    <Copy className="w-4 h-4 mr-2" />
                    Copy
                  </Button>
                  <Button variant="outline" className="flex-1">
                    <Download className="w-4 h-4 mr-2" />
                    Download
                  </Button>
                </div>
              </div>
            ) : (
              <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-8 text-center min-h-96 flex items-center justify-center">
                <div>
                  <Globe className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 mb-2">Translation will appear here</p>
                  <p className="text-sm text-gray-500">Add source text and click translate</p>
                </div>
              </div>
            )}

            <Button
              onClick={translateText}
              disabled={isTranslating || !sourceText.trim() || sourceLanguage === targetLanguage}
              className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
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
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Globe className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h3 className="font-medium">12+ Languages</h3>
                <p className="text-sm text-gray-600">Support for major world languages</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <h3 className="font-medium">Professional Quality</h3>
                <p className="text-sm text-gray-600">Optimized for career documents</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <Download className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <h3 className="font-medium">Multiple Formats</h3>
                <p className="text-sm text-gray-600">Download in various formats</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default MultilingualTranslator;
