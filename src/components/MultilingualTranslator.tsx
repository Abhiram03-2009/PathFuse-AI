import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Languages, ArrowRight, Copy, Volume2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useTheme } from '@/contexts/ThemeContext';
import { supabase } from '@/integrations/supabase/client';

// Define the structure for a language object
interface Language {
  code: string;
  name: string;
  flag: string;
}

const MultilingualTranslator = () => {
  // Access toast notifications and theme context
  const { toast } = useToast();
  const { isDarkMode } = useTheme();

  // State variables for source text, translated text, selected languages, and translation status
  const [sourceText, setSourceText] = useState('');
  const [translatedText, setTranslatedText] = useState('');
  const [sourceLanguage, setSourceLanguage] = useState('en');
  const [targetLanguage, setTargetLanguage] = useState('es');
  const [isTranslating, setIsTranslating] = useState(false);

  // Array of supported languages with their codes, names, and flag emojis
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
    { code: 'fi', name: 'Finnish', flag: '🇫🇮' }
  ];

  const translateText = async () => {
    // Prevent translation if source text is empty
    if (!sourceText.trim()) {
      toast({
        title: "No Text to Translate",
        description: "Please enter some text to translate.",
        variant: "destructive"
      });
      return;
    }

    setIsTranslating(true);
    setTranslatedText(''); // Clear previous translation to show loading state

    try {
      console.log('Sending translation request:', { 
        textLength: sourceText.length,
        sourceLanguage, 
        targetLanguage 
      });
      
      const { data, error } = await supabase.functions.invoke('multilingual-translator', {
        body: { 
          text: sourceText,
          sourceLanguage,
          targetLanguage
        }
      });

      console.log('Translation response received:', { data, error });

      if (error) {
        console.error('Supabase function error:', error);
        throw new Error(error.message || 'Failed to get translation');
      }

      if (!data || !data.translatedText) {
        throw new Error('No translation received');
      }

      setTranslatedText(data.translatedText);
      
      const methodInfo = data.method === 'live_api_google' ? '(Live API)' : '(Offline)';
      
      toast({
        title: "Translation Complete",
        description: `Text translated from ${getLanguageName(sourceLanguage)} to ${getLanguageName(targetLanguage)} ${methodInfo}.`,
      });

      console.log('Translation completed successfully:', {
        method: data.method,
        confidence: data.confidence,
        originalLength: sourceText.length,
        translatedLength: data.translatedText.length
      });
    } catch (error) {
      console.error('Translation error:', error);
      
      let errorMessage = "Failed to translate text. Please try again.";
      if (error.message.includes('service error')) {
        errorMessage = "Translation service is temporarily unavailable.";
      } else if (error.message.includes('No translation received')) {
        errorMessage = "Translation service returned an empty result.";
      }
      
      toast({
        title: "Translation Error", 
        description: errorMessage,
        variant: "destructive"
      });
      setTranslatedText('[Translation Failed]'); // Show an error in the output
    } finally {
      setIsTranslating(false);
    }
  };

  const getLanguageName = (code: string): string => languages.find(lang => lang.code === code)?.name || code;
  const getLanguageFlag = (code: string): string => languages.find(lang => lang.code === code)?.flag || '🌐';

  const copyToClipboard = (text: string) => {
    if (!text || text.startsWith('[Translation')) return;
    navigator.clipboard.writeText(text).then(() => {
      toast({ title: "Copied!", description: "Text copied to clipboard." });
    }).catch(err => {
      console.error('Failed to copy text using navigator.clipboard:', err);
      toast({ title: "Copy Failed", description: "Could not copy text to clipboard.", variant: "destructive" });
    });
  };

  const speakText = (text: string, languageCode: string) => {
    if (!text || !('speechSynthesis' in window) || text.startsWith('[Translation')) {
      if (!('speechSynthesis' in window)) {
        toast({ title: "Not Supported", description: "Text-to-speech is not supported in your browser.", variant: "destructive" });
      }
      return;
    }
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = languageCode;
    speechSynthesis.speak(utterance);
  };

  const swapLanguages = () => {
    const tempLang = sourceLanguage;
    setSourceLanguage(targetLanguage);
    setTargetLanguage(tempLang);

    if (translatedText && !translatedText.startsWith('[Translation')) {
      setSourceText(translatedText);
      setTranslatedText('');
    }
  };

  return (
    <div className={`space-y-6 ${isDarkMode ? 'dark' : ''}`}>
      {/* Main Card for Translator Title and Description */}
      <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 neon-border animate-fade-in">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-gray-900 dark:text-white animate-neon-flicker">
            <Languages className="w-5 h-5" />
            <span>Multilingual Translator</span>
          </CardTitle>
          <CardDescription className="text-gray-600 dark:text-gray-300">
            Professional translation powered by Google Translate API with high accuracy and context awareness.
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Grid for Source and Target Language Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Source Language Input Card */}
        <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 neon-border hover:shadow-lg transition-all duration-300">
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
                        <span className="mr-2 text-lg">{lang.flag}</span>
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
              className="min-h-32 text-gray-900 dark:text-white bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 placeholder-gray-500 dark:placeholder-gray-400 animate-pulse-glow"
              rows={6}
            />
            <div className="flex justify-between items-center mt-4">
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => speakText(sourceText, sourceLanguage)}
                  disabled={!sourceText.trim()}
                  className="text-gray-800 dark:text-white bg-white dark:bg-gray-800 border-gray-400 dark:border-gray-600 hover:bg-blue-50 dark:hover:bg-gray-700 hover:border-blue-400 dark:hover:border-blue-400 transition-all duration-300"
                >
                  <Volume2 className="w-4 h-4 mr-1" />
                  Listen
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyToClipboard(sourceText)}
                  disabled={!sourceText.trim()}
                  className="text-gray-800 dark:text-white bg-white dark:bg-gray-800 border-gray-400 dark:border-gray-600 hover:bg-blue-50 dark:hover:bg-gray-700 hover:border-blue-400 dark:hover:border-blue-400 transition-all duration-300"
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

        {/* Target Language Output Card */}
        <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 neon-border hover:shadow-lg transition-all duration-300">
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
                        <span className="mr-2 text-lg">{lang.flag}</span>
                        {lang.name}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            <div className="min-h-32 p-3 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md animate-pulse-glow">
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
                  className="text-gray-800 dark:text-white bg-white dark:bg-gray-800 border-gray-400 dark:border-gray-600 hover:bg-blue-50 dark:hover:bg-gray-700 hover:border-blue-400 dark:hover:border-blue-400 transition-all duration-300"
                >
                  <Volume2 className="w-4 h-4 mr-1" />
                  Listen
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyToClipboard(translatedText)}
                  disabled={!translatedText.trim()}
                  className="text-gray-800 dark:text-white bg-white dark:bg-gray-800 border-gray-400 dark:border-gray-600 hover:bg-blue-50 dark:hover:bg-gray-700 hover:border-blue-400 dark:hover:border-blue-400 transition-all duration-300"
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

      {/* Translation Controls (Swap and Translate Buttons) */}
      <div className="flex justify-center space-x-4">
        <Button
          variant="outline"
          onClick={swapLanguages}
          className="text-gray-800 dark:text-white bg-white dark:bg-gray-800 border-gray-400 dark:border-gray-600 hover:bg-blue-50 dark:hover:bg-gray-700 hover:border-blue-400 dark:hover:border-blue-400 transition-all duration-300 animate-hover-lift"
        >
          <ArrowRight className="w-4 h-4 mr-2 transform rotate-90" />
          Swap Languages
        </Button>
        <Button
          onClick={translateText}
          disabled={isTranslating || !sourceText.trim()}
          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 animate-glow"
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

      {/* Language Statistics and Information Card */}
      <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 neon-border">
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