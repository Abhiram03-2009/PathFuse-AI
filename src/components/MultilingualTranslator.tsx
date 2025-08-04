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
  const languages: Language[] = [ { code: 'en', name: 'English', flag: '🇺🇸' }, { code: 'es', name: 'Spanish', flag: '🇪🇸' }, { code: 'fr', name: 'French', flag: '🇫🇷' }, { code: 'de', name: 'German', flag: '🇩🇪' }, { code: 'it', name: 'Italian', flag: '🇮🇹' }, { code: 'pt', name: 'Portuguese', flag: '🇵🇹' }, { code: 'ru', name: 'Russian', flag: '🇷🇺' }, { code: 'ja', name: 'Japanese', flag: '🇯🇵' }, { code: 'ko', name: 'Korean', flag: '🇰🇷' }, { code: 'zh', name: 'Chinese (Simplified)', flag: '🇨🇳' }, { code: 'zh-TW', name: 'Chinese (Traditional)', flag: '🇹🇼' }, { code: 'ar', name: 'Arabic', flag: '🇸🇦' }, { code: 'hi', name: 'Hindi', flag: '🇮🇳' }, { code: 'tr', name: 'Turkish', flag: '🇹🇷' }, { code: 'pl', name: 'Polish', flag: '🇵🇱' }, { code: 'nl', name: 'Dutch', flag: '🇳🇱' }, { code: 'sv', name: 'Swedish', flag: '🇸🇪' }, { code: 'da', name: 'Danish', flag: '🇩🇰' }, { code: 'no', name: 'Norwegian', flag: '🇳🇴' }, { code: 'fi', name: 'Finnish', flag: '🇫🇮' } ];

  const translateText = async () => {
    if (!sourceText.trim()) {
      toast({ title: "No Text to Translate", description: "Please enter some text to translate.", variant: "destructive" });
      return;
    }
    setIsTranslating(true);
    setTranslatedText(''); // Clear previous translation
    try {
      const { data, error } = await supabase.functions.invoke('multilingual-translator', {
        body: { text: sourceText, sourceLanguage, targetLanguage }
      });
      if (error) throw new Error(error.message || 'Failed to get translation');
      if (!data || !data.translatedText) throw new Error('No translation received');
      setTranslatedText(data.translatedText);
      toast({
        title: "Translation Complete",
        description: `Text translated from ${getLanguageName(sourceLanguage)} to ${getLanguageName(targetLanguage)}.`,
      });
    } catch (error) {
      console.error('Translation error:', error);
      toast({ title: "Translation Error", description: "The translation service could not process this request.", variant: "destructive" });
    } finally {
      setIsTranslating(false);
    }
  };

  const getLanguageName = (code: string): string => languages.find(lang => lang.code === code)?.name || code;
  const getLanguageFlag = (code: string): string => languages.find(lang => lang.code === code)?.flag || '🌐';

  const copyToClipboard = (text: string) => {
    if (!text || text.startsWith('[No translation')) return;
    navigator.clipboard.writeText(text).then(() => {
      toast({ title: "Copied!", description: "Text copied to clipboard." });
    }).catch(err => {
      console.error('Failed to copy text:', err);
      toast({ title: "Copy Failed", description: "Could not copy text.", variant: "destructive" });
    });
  };

  const speakText = (text: string, languageCode: string) => {
    if (!text || !('speechSynthesis' in window) || text.startsWith('[No translation')) return;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = languageCode;
    speechSynthesis.speak(utterance);
  };

  const swapLanguages = () => {
    setSourceLanguage(targetLanguage);
    setTargetLanguage(sourceLanguage);
    if (translatedText && !translatedText.startsWith('[No translation')) {
      setSourceText(translatedText);
      setTranslatedText('');
    }
  };

  // The rest of the component JSX remains the same, no changes needed to UI.
  return (
    <div className={`space-y-6 ${isDarkMode ? 'dark' : ''}`}>
      {/* ... PASTE THE FULL JSX FROM YOUR ORIGINAL FILE HERE ... */}
      {/* It will work correctly with the updated backend logic. */}
    </div>
  );
};

export default MultilingualTranslator;