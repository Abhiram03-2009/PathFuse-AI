
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Languages, ArrowRight, Copy, Volume2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useTheme } from '@/contexts/ThemeContext';

interface Language {
  code: string;
  name: string;
  flag: string;
}

const MultilingualTranslator = () => {
  const { toast } = useToast();
  const { isDarkMode } = useTheme();
  const [sourceText, setSourceText] = useState('');
  const [translatedText, setTranslatedText] = useState('');
  const [sourceLanguage, setSourceLanguage] = useState('en');
  const [targetLanguage, setTargetLanguage] = useState('es');
  const [isTranslating, setIsTranslating] = useState(false);

  const languages: Language[] = [
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'es', name: 'Spanish', flag: '🇪🇸' },
    { code: 'fr', name: 'French', flag: '🇫🇷' },
    { code: 'de', name: 'German', flag: '🇩🇪' },
    { code: 'it', name: 'Italian', flag: '🇮🇹' },
    { code: 'pt', name: 'Portuguese', flag: '🇵🇹' },
    { code: 'ru', name: 'Russian', flag: '🇷🇺' },
    { code: 'ja', name: 'Japanese', flag: '🇯🇵' },
    { code: 'ko', name: 'Korean', flag: '🇰🇷' },
    { code: 'zh', name: 'Chinese (Simplified)', flag: '🇨🇳' },
    { code: 'zh-TW', name: 'Chinese (Traditional)', flag: '🇹🇼' },
    { code: 'ar', name: 'Arabic', flag: '🇸🇦' },
    { code: 'hi', name: 'Hindi', flag: '🇮🇳' },
    { code: 'tr', name: 'Turkish', flag: '🇹🇷' },
    { code: 'pl', name: 'Polish', flag: '🇵🇱' },
    { code: 'nl', name: 'Dutch', flag: '🇳🇱' },
    { code: 'sv', name: 'Swedish', flag: '🇸🇪' },
    { code: 'da', name: 'Danish', flag: '🇩🇰' },
    { code: 'no', name: 'Norwegian', flag: '🇳🇴' },
    { code: 'fi', name: 'Finnish', flag: '🇫🇮' },
    { code: 'el', name: 'Greek', flag: '🇬🇷' },
    { code: 'he', name: 'Hebrew', flag: '🇮🇱' },
    { code: 'th', name: 'Thai', flag: '🇹🇭' },
    { code: 'vi', name: 'Vietnamese', flag: '🇻🇳' },
    { code: 'id', name: 'Indonesian', flag: '🇮🇩' },
    { code: 'ms', name: 'Malay', flag: '🇲🇾' },
    { code: 'tl', name: 'Filipino', flag: '🇵🇭' },
    { code: 'uk', name: 'Ukrainian', flag: '🇺🇦' },
    { code: 'cs', name: 'Czech', flag: '🇨🇿' },
    { code: 'sk', name: 'Slovak', flag: '🇸🇰' },
    { code: 'hu', name: 'Hungarian', flag: '🇭🇺' },
    { code: 'ro', name: 'Romanian', flag: '🇷🇴' },
    { code: 'bg', name: 'Bulgarian', flag: '🇧🇬' },
    { code: 'hr', name: 'Croatian', flag: '🇭🇷' },
    { code: 'sr', name: 'Serbian', flag: '🇷🇸' },
    { code: 'sl', name: 'Slovenian', flag: '🇸🇮' },
    { code: 'et', name: 'Estonian', flag: '🇪🇪' },
    { code: 'lv', name: 'Latvian', flag: '🇱🇻' },
    { code: 'lt', name: 'Lithuanian', flag: '🇱🇹' },
    { code: 'mt', name: 'Maltese', flag: '🇲🇹' },
    { code: 'is', name: 'Icelandic', flag: '🇮🇸' },
    { code: 'ga', name: 'Irish', flag: '🇮🇪' },
    { code: 'cy', name: 'Welsh', flag: '🏴󠁧󠁢󠁷󠁬󠁳󠁿' },
    { code: 'eu', name: 'Basque', flag: '🏴󠁥󠁥󠁥󠁲󠁿' },
    { code: 'ca', name: 'Catalan', flag: '🏴󠁥󠁳󠁣󠁴󠁿' },
    { code: 'bn', name: 'Bengali', flag: '🇧🇩' },
    { code: 'ur', name: 'Urdu', flag: '🇵🇰' },
    { code: 'fa', name: 'Persian', flag: '🇮🇷' },
    { code: 'sw', name: 'Swahili', flag: '🇰🇪' },
    { code: 'am', name: 'Amharic', flag: '🇪🇹' },
    { code: 'zu', name: 'Zulu', flag: '🇿🇦' },
    { code: 'af', name: 'Afrikaans', flag: '🇿🇦' }
  ];

  const translateText = async () => {
    if (!sourceText.trim()) {
      toast({
        title: "No Text to Translate",
        description: "Please enter some text to translate.",
        variant: "destructive"
      });
      return;
    }

    setIsTranslating(true);

    try {
      // Simulate translation with a delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Mock translation - in a real app, you'd call a translation API
      const mockTranslations: { [key: string]: { [key: string]: string } } = {
        'en-es': {
          'Hello, how are you?': 'Hola, ¿cómo estás?',
          'Welcome to our platform': 'Bienvenido a nuestra plataforma',
          'Thank you for using our service': 'Gracias por usar nuestro servicio'
        },
        'en-fr': {
          'Hello, how are you?': 'Bonjour, comment allez-vous?',
          'Welcome to our platform': 'Bienvenue sur notre plateforme',
          'Thank you for using our service': 'Merci d\'utiliser notre service'
        },
        'en-de': {
          'Hello, how are you?': 'Hallo, wie geht es dir?',
          'Welcome to our platform': 'Willkommen auf unserer Plattform',
          'Thank you for using our service': 'Vielen Dank für die Nutzung unseres Service'
        }
      };

      const translationKey = `${sourceLanguage}-${targetLanguage}`;
      const translation = mockTranslations[translationKey]?.[sourceText] || 
                         `[Translated from ${getLanguageName(sourceLanguage)} to ${getLanguageName(targetLanguage)}]: ${sourceText}`;
      
      setTranslatedText(translation);
      
      toast({
        title: "Translation Complete",
        description: `Text translated from ${getLanguageName(sourceLanguage)} to ${getLanguageName(targetLanguage)}.`,
      });
      
    } catch (error) {
      console.error('Translation error:', error);
      toast({
        title: "Translation Error",
        description: "Failed to translate text. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsTranslating(false);
    }
  };

  const getLanguageName = (code: string): string => {
    return languages.find(lang => lang.code === code)?.name || code;
  };

  const getLanguageFlag = (code: string): string => {
    return languages.find(lang => lang.code === code)?.flag || '🌐';
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: "Text copied to clipboard.",
    });
  };

  const speakText = (text: string, languageCode: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = languageCode;
      speechSynthesis.speak(utterance);
    } else {
      toast({
        title: "Not Supported",
        description: "Text-to-speech is not supported in your browser.",
        variant: "destructive"
      });
    }
  };

  const swapLanguages = () => {
    const tempLang = sourceLanguage;
    setSourceLanguage(targetLanguage);
    setTargetLanguage(tempLang);
    
    if (translatedText) {
      setSourceText(translatedText);
      setTranslatedText('');
    }
  };

  return (
    <div className={`space-y-6 ${isDarkMode ? 'dark' : ''}`}>
      <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-gray-900 dark:text-white">
            <Languages className="w-5 h-5" />
            <span>Multilingual Translator</span>
          </CardTitle>
          <CardDescription className="text-gray-600 dark:text-gray-300">
            Translate text between 50+ languages with AI-powered accuracy and cultural context.
          </CardDescription>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Source Language */}
        <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg text-gray-900 dark:text-white flex items-center">
                <span className="text-2xl mr-2">{getLanguageFlag(sourceLanguage)}</span>
                Source Language
              </CardTitle>
              <Select value={sourceLanguage} onValueChange={setSourceLanguage}>
                <SelectTrigger className="w-48 text-gray-900 dark:text-white bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 max-h-60">
                  {languages.map((lang) => (
                    <SelectItem key={lang.code} value={lang.code} className="text-gray-900 dark:text-white">
                      <span className="flex items-center">
                        <span className="mr-2">{lang.flag}</span>
                        {lang.name}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            <Textarea
              value={sourceText}
              onChange={(e) => setSourceText(e.target.value)}
              placeholder="Enter text to translate..."
              className="min-h-32 text-gray-900 dark:text-white bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 placeholder-gray-500 dark:placeholder-gray-400"
              rows={6}
            />
            <div className="flex justify-between items-center mt-4">
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => speakText(sourceText, sourceLanguage)}
                  disabled={!sourceText.trim()}
                  className="text-gray-900 dark:text-white border-gray-300 dark:border-gray-600"
                >
                  <Volume2 className="w-4 h-4 mr-1" />
                  Listen
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyToClipboard(sourceText)}
                  disabled={!sourceText.trim()}
                  className="text-gray-900 dark:text-white border-gray-300 dark:border-gray-600"
                >
                  <Copy className="w-4 h-4 mr-1" />
                  Copy
                </Button>
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                {sourceText.length} characters
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Target Language */}
        <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg text-gray-900 dark:text-white flex items-center">
                <span className="text-2xl mr-2">{getLanguageFlag(targetLanguage)}</span>
                Target Language
              </CardTitle>
              <Select value={targetLanguage} onValueChange={setTargetLanguage}>
                <SelectTrigger className="w-48 text-gray-900 dark:text-white bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 max-h-60">
                  {languages.map((lang) => (
                    <SelectItem key={lang.code} value={lang.code} className="text-gray-900 dark:text-white">
                      <span className="flex items-center">
                        <span className="mr-2">{lang.flag}</span>
                        {lang.name}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            <div className="min-h-32 p-3 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md">
              {isTranslating ? (
                <div className="flex items-center justify-center h-32">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  <span className="ml-3 text-gray-600 dark:text-gray-300">Translating...</span>
                </div>
              ) : (
                <div className="min-h-24 text-gray-900 dark:text-white whitespace-pre-wrap">
                  {translatedText || 'Translation will appear here...'}
                </div>
              )}
            </div>
            <div className="flex justify-between items-center mt-4">
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => speakText(translatedText, targetLanguage)}
                  disabled={!translatedText.trim()}
                  className="text-gray-900 dark:text-white border-gray-300 dark:border-gray-600"
                >
                  <Volume2 className="w-4 h-4 mr-1" />
                  Listen
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyToClipboard(translatedText)}
                  disabled={!translatedText.trim()}
                  className="text-gray-900 dark:text-white border-gray-300 dark:border-gray-600"
                >
                  <Copy className="w-4 h-4 mr-1" />
                  Copy
                </Button>
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                {translatedText.length} characters
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Translation Controls */}
      <div className="flex justify-center space-x-4">
        <Button
          variant="outline"
          onClick={swapLanguages}
          className="text-gray-900 dark:text-white border-gray-300 dark:border-gray-600"
        >
          <ArrowRight className="w-4 h-4 mr-2 transform rotate-90" />
          Swap Languages
        </Button>
        <Button
          onClick={translateText}
          disabled={isTranslating || !sourceText.trim()}
          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:opacity-50"
        >
          {isTranslating ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Translating...
            </>
          ) : (
            <>
              <Languages className="w-4 h-4 mr-2" />
              Translate Text
            </>
          )}
        </Button>
      </div>

      {/* Language Stats */}
      <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700">
        <CardContent className="p-4">
          <div className="text-center text-sm text-gray-600 dark:text-gray-300">
            <p className="mb-2">
              <span className="font-medium">{languages.length} languages</span> supported • 
              <span className="font-medium"> AI-powered</span> translations • 
              <span className="font-medium"> Cultural context</span> aware
            </p>
            <p className="text-xs">
              Popular languages: {getLanguageFlag('en')} English • {getLanguageFlag('es')} Spanish • {getLanguageFlag('fr')} French • {getLanguageFlag('de')} German • {getLanguageFlag('zh')} Chinese • {getLanguageFlag('ja')} Japanese
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MultilingualTranslator;
