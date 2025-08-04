import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Languages, ArrowRight, Copy, Volume2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useTheme } from '@/contexts/ThemeContext';
import { supabase } from '@/integrations/supabase/client';

interface Language {
  code: string;
  name: string;
  flag: string;
}

// --- NEW: Updated state to hold a richer result object ---
interface TranslationResult {
  text: string;
  transliteration: string | null;
}

const MultilingualTranslator = () => {
  const { toast } = useToast();
  const { isDarkMode } = useTheme();

  const [sourceText, setSourceText] = useState('');
  const [targetLanguage, setTargetLanguage] = useState('es');
  const [sourceLanguage, setSourceLanguage] = useState('en');
  const [isTranslating, setIsTranslating] = useState(false);
  // --- NEW: Use the new state structure, initialized to null ---
  const [translationResult, setTranslationResult] = useState<TranslationResult | null>(null);

  const languages: Language[] = [ { code: 'en', name: 'English', flag: '🇺🇸' }, { code: 'es', name: 'Spanish', flag: '🇪🇸' }, { code: 'fr', name: 'French', flag: '🇫🇷' }, { code: 'de', name: 'German', flag: '🇩🇪' }, { code: 'it', name: 'Italian', flag: '🇮🇹' }, { code: 'pt', name: 'Portuguese', flag: '🇵🇹' }, { code: 'ru', name: 'Russian', flag: '🇷🇺' }, { code: 'ja', name: 'Japanese', flag: '🇯🇵' }, { code: 'ko', name: 'Korean', flag: '🇰🇷' }, { code: 'zh', name: 'Chinese (Simplified)', flag: '🇨🇳' }, { code: 'zh-TW', name: 'Chinese (Traditional)', flag: '🇹🇼' }, { code: 'ar', name: 'Arabic', flag: '🇸🇦' }, { code: 'hi', name: 'Hindi', flag: '🇮🇳' }, { code: 'tr', name: 'Turkish', flag: '🇹🇷' }, { code: 'pl', name: 'Polish', flag: '🇵🇱' }, { code: 'nl', name: 'Dutch', flag: '🇳🇱' }, { code: 'sv', name: 'Swedish', flag: '🇸🇪' }, { code: 'da', name: 'Danish', flag: '🇩🇰' }, { code: 'no', name: 'Norwegian', flag: '🇳🇴' }, { code: 'fi', name: 'Finnish', flag: '🇫🇮' }, { code: 'el', name: 'Greek', flag: '🇬🇷' }, { code: 'he', name: 'Hebrew', flag: '🇮🇱' }, { code: 'th', name: 'Thai', flag: '🇹🇭' } ];

  const translateText = async () => {
    if (!sourceText.trim()) { toast({ title: "No Text to Translate", description: "Please enter some text.", variant: "destructive" }); return; }
    setIsTranslating(true);
    setTranslationResult(null); // Clear previous result
    try {
      const { data, error } = await supabase.functions.invoke('multilingual-translator', { body: { text: sourceText, sourceLanguage, targetLanguage } });
      if (error) throw new Error(error.message);
      if (!data || !data.translatedText) throw new Error('No translation received');
      
      // --- NEW: Set the entire result object ---
      setTranslationResult({
        text: data.translatedText,
        transliteration: data.transliteration,
      });

      toast({ title: "Translation Complete", description: `Translated from ${getLanguageName(sourceLanguage)} to ${getLanguageName(targetLanguage)}.` });
    } catch (error) {
      console.error('Translation error:', error);
      toast({ title: "Translation Error", description: "The service could not process this request.", variant: "destructive" });
      setTranslationResult({ text: '[Translation Failed]', transliteration: null });
    } finally {
      setIsTranslating(false);
    }
  };

  const getLanguageName = (code: string): string => languages.find(lang => lang.code === code)?.name || code;
  const getLanguageFlag = (code: string): string => languages.find(lang => lang.code === code)?.flag || '🌐';

  const copyToClipboard = (text: string | null) => {
    if (!text || text.startsWith('[')) return;
    navigator.clipboard.writeText(text).then(() => { toast({ title: "Copied!", description: "Text copied to clipboard." }); }).catch(() => { toast({ title: "Copy Failed", variant: "destructive" }); });
  };

  const speakText = (text: string | null, languageCode: string) => {
    if (!text || !('speechSynthesis' in window) || text.startsWith('[')) return;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = languageCode;
    speechSynthesis.speak(utterance);
  };

  const swapLanguages = () => {
    setSourceLanguage(targetLanguage);
    setTargetLanguage(sourceLanguage);
    if (translationResult && translationResult.text && !translationResult.text.startsWith('[')) {
      setSourceText(translationResult.text);
      setTranslationResult(null);
    }
  };

  return (
    <div className={`space-y-6 ${isDarkMode ? 'dark' : ''}`}>
      <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-gray-900 dark:text-white">
            <Languages className="w-5 h-5" /><span>Multilingual Translator</span>
          </CardTitle>
          <CardDescription className="text-gray-600 dark:text-gray-300">
            Professional translation with phonetic support for non-Latin languages.
          </CardDescription>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700">
          <CardHeader><div className="flex items-center justify-between"><CardTitle className="text-lg text-gray-900 dark:text-white flex items-center"><span className="text-2xl mr-2">{getLanguageFlag(sourceLanguage)}</span>Source</CardTitle><Select value={sourceLanguage} onValueChange={setSourceLanguage}><SelectTrigger className="w-48"><SelectValue /></SelectTrigger><SelectContent>{languages.map((lang) => (<SelectItem key={lang.code} value={lang.code}><span>{lang.flag} {lang.name}</span></SelectItem>))}</SelectContent></Select></div></CardHeader>
          <CardContent>
            <Textarea value={sourceText} onChange={(e) => setSourceText(e.target.value)} placeholder="Enter text..." className="min-h-32" rows={6} />
            <div className="flex justify-between items-center mt-4">
              <div className="flex space-x-2">
                <Button variant="outline" size="sm" onClick={() => speakText(sourceText, sourceLanguage)} disabled={!sourceText.trim()}><Volume2 className="w-4 h-4 mr-1" />Listen</Button>
                <Button variant="outline" size="sm" onClick={() => copyToClipboard(sourceText)} disabled={!sourceText.trim()}><Copy className="w-4 h-4 mr-1" />Copy</Button>
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">{sourceText.length}</div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700">
          <CardHeader><div className="flex items-center justify-between"><CardTitle className="text-lg text-gray-900 dark:text-white flex items-center"><span className="text-2xl mr-2">{getLanguageFlag(targetLanguage)}</span>Target</CardTitle><Select value={targetLanguage} onValueChange={setTargetLanguage}><SelectTrigger className="w-48"><SelectValue /></SelectTrigger><SelectContent className="max-h-60">{languages.map((lang) => (<SelectItem key={lang.code} value={lang.code}><span>{lang.flag} {lang.name}</span></SelectItem>))}</SelectContent></Select></div></CardHeader>
          <CardContent>
            <div className="min-h-32 p-3 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md">
              {isTranslating ? (
                <div className="flex items-center justify-center h-full min-h-24"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div></div>
              ) : (
                <>
                  <div className="min-h-24 text-gray-900 dark:text-white whitespace-pre-wrap">
                    {translationResult?.text || 'Translation will appear here...'}
                  </div>
                  {/* --- NEW FEATURE: Conditionally render the transliteration --- */}
                  {translationResult?.transliteration && (
                    <div className="border-t border-gray-200 dark:border-gray-700 mt-2 pt-2">
                      <p className="text-sm text-gray-500 dark:text-gray-400 italic whitespace-pre-wrap">
                        {translationResult.transliteration}
                      </p>
                    </div>
                  )}
                </>
              )}
            </div>
            <div className="flex justify-between items-center mt-4">
              <div className="flex space-x-2">
                <Button variant="outline" size="sm" onClick={() => speakText(translationResult?.text || null, targetLanguage)} disabled={!translationResult?.text}><Volume2 className="w-4 h-4 mr-1" />Listen</Button>
                <Button variant="outline" size="sm" onClick={() => copyToClipboard(translationResult?.text || null)} disabled={!translationResult?.text}><Copy className="w-4 h-4 mr-1" />Copy</Button>
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">{translationResult?.text?.length || 0}</div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-center space-x-4">
        <Button variant="outline" onClick={swapLanguages}><ArrowRight className="w-4 h-4 mr-2 transform rotate-90 lg:rotate-0" />Swap</Button>
        <Button onClick={translateText} disabled={isTranslating || !sourceText.trim()} className="bg-blue-600 text-white hover:bg-blue-700">
          {isTranslating ? (<><div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>Translating...</>) : (<><Languages className="w-4 h-4 mr-2" />Translate</>)}
        </Button>
      </div>
    </div>
  );
};

export default MultilingualTranslator;