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

// NEW: State object to hold all parts of the translation result.
interface TranslationResult {
  text: string;
  transliteration: string | null;
}

const MultilingualTranslator = () => {
  const { toast } = useToast();
  const { isDarkMode } = useTheme();

  const [sourceText, setSourceText] = useState('');
  const [sourceLanguage, setSourceLanguage] = useState('en');
  const [targetLanguage, setTargetLanguage] = useState('es');
  const [isTranslating, setIsTranslating] = useState(false);
  // NEW: State now holds the result object, initialized to null.
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

  // Map our short codes to BCP-47 voice locales so Web Speech can pick the
  // right voice for non-English languages (browsers ignore bare "es", "ja", etc.
  // unless they match an installed locale).
  const SPEECH_LOCALE: Record<string, string> = {
    en: 'en-US', es: 'es-ES', fr: 'fr-FR', de: 'de-DE', it: 'it-IT',
    pt: 'pt-PT', ru: 'ru-RU', ja: 'ja-JP', ko: 'ko-KR',
    zh: 'zh-CN', 'zh-TW': 'zh-TW', ar: 'ar-SA', hi: 'hi-IN',
    tr: 'tr-TR', pl: 'pl-PL', nl: 'nl-NL', sv: 'sv-SE', da: 'da-DK',
    no: 'nb-NO', fi: 'fi-FI', el: 'el-GR', he: 'he-IL', th: 'th-TH',
  };

  const speakText = async (text: string | null, languageCode: string) => {
    if (!text || text.startsWith('[')) return;
    const locale = SPEECH_LOCALE[languageCode] || languageCode;
    const langPrefix = locale.split('-')[0].toLowerCase();

    const playGatewayAudio = async () => {
      toast({ title: 'Loading audio…', description: `Generating ${getLanguageName(languageCode)} audio.` });
      const { data, error } = await supabase.functions.invoke('text-to-speech', {
        body: { text, language: languageCode, locale, voice: 'alloy' },
      });
      if (error) throw new Error(error.message);
      if (data?.error) throw new Error(data.error);
      if (!data?.audio) throw new Error('No audio returned');
      const binary = atob(data.audio);
      const bytes = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
      const blob = new Blob([bytes], { type: data.mime || 'audio/mpeg' });
      const url = URL.createObjectURL(blob);
      const audio = new Audio(url);
      audio.onended = () => URL.revokeObjectURL(url);
      audio.onerror = () => URL.revokeObjectURL(url);
      await audio.play();
    };

    // Hindi browser voices are often missing or silently fail in mobile webviews,
    // so use the backend voice path directly for reliable sound.
    if (languageCode === 'hi') {
      try {
        await playGatewayAudio();
      } catch (e: any) {
        console.error('Hindi TTS failed:', e);
        toast({ title: 'Audio Unavailable', description: e.message || 'Could not play Hindi audio.', variant: 'destructive' });
      }
      return;
    }

    // Try the browser first.
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const ensureVoices = () =>
        new Promise<SpeechSynthesisVoice[]>((resolve) => {
          const v = window.speechSynthesis.getVoices();
          if (v.length) return resolve(v);
          const handler = () => {
            window.speechSynthesis.onvoiceschanged = null;
            resolve(window.speechSynthesis.getVoices());
          };
          window.speechSynthesis.onvoiceschanged = handler;
          // Safety timeout: some browsers never fire the event.
          setTimeout(() => resolve(window.speechSynthesis.getVoices()), 400);
        });
      const voices = await ensureVoices();
      const match =
        voices.find((v) => v.lang === locale) ||
        voices.find((v) => v.lang.toLowerCase().startsWith(langPrefix));
      if (match) {
        const spoke = await new Promise<boolean>((resolve) => {
          const u = new SpeechSynthesisUtterance(text);
          u.lang = locale;
          u.voice = match;
          u.onend = () => resolve(true);
          u.onerror = () => resolve(false);
          window.speechSynthesis.speak(u);
          setTimeout(() => resolve(true), 800);
        });
        if (spoke) return;
      }
    }

    // Fallback: server-side TTS via Lovable AI (handles Hindi etc. when no
    // browser voice is installed for the language).
    try {
      await playGatewayAudio();
    } catch (e: any) {
      console.error('TTS fallback failed:', e);
      toast({ title: 'Audio Unavailable', description: e.message || 'Could not play audio.', variant: 'destructive' });
    }
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
      <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 neon-border animate-fade-in">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-gray-900 dark:text-white">
            <Languages className="w-5 h-5" />
            <span>Multilingual Translator</span>
          </CardTitle>
          <CardDescription className="text-gray-600 dark:text-gray-300">
            Professional translation powered by Google Translate API with high accuracy and context awareness.
          </CardDescription>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 neon-border hover:shadow-lg transition-all duration-300">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg text-gray-900 dark:text-white flex items-center"><span className="text-2xl mr-2">{getLanguageFlag(sourceLanguage)}</span>Source Language</CardTitle>
              <Select value={sourceLanguage} onValueChange={setSourceLanguage}>
                <SelectTrigger className="w-48 text-gray-900 dark:text-white bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600"><SelectValue /></SelectTrigger>
                <SelectContent className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 max-h-60">{languages.map((lang) => (<SelectItem key={lang.code} value={lang.code} className="text-gray-900 dark:text-white"><span className="flex items-center"><span className="mr-2 text-lg">{lang.flag}</span>{lang.name}</span></SelectItem>))}</SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            <Textarea value={sourceText} onChange={(e) => setSourceText(e.target.value)} placeholder="Enter text to translate..." className="min-h-32 text-gray-900 dark:text-white bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 placeholder-gray-500 dark:placeholder-gray-400 animate-pulse-glow" rows={6} />
            <div className="flex justify-between items-center mt-4">
              <div className="flex space-x-2">
                <Button variant="outline" size="sm" onClick={() => speakText(sourceText, sourceLanguage)} disabled={!sourceText.trim()} className="text-gray-800 dark:text-white bg-white dark:bg-gray-800 border-gray-400 dark:border-gray-600 hover:bg-blue-50 dark:hover:bg-gray-700 hover:border-blue-400 dark:hover:border-blue-400 transition-all duration-300"><Volume2 className="w-4 h-4 mr-1" />Listen</Button>
                <Button variant="outline" size="sm" onClick={() => copyToClipboard(sourceText)} disabled={!sourceText.trim()} className="text-gray-800 dark:text-white bg-white dark:bg-gray-800 border-gray-400 dark:border-gray-600 hover:bg-blue-50 dark:hover:bg-gray-700 hover:border-blue-400 dark:hover:border-blue-400 transition-all duration-300"><Copy className="w-4 h-4 mr-1" />Copy</Button>
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">{sourceText.length} characters</div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 neon-border hover:shadow-lg transition-all duration-300">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg text-gray-900 dark:text-white flex items-center"><span className="text-2xl mr-2">{getLanguageFlag(targetLanguage)}</span>Target Language</CardTitle>
              <Select value={targetLanguage} onValueChange={setTargetLanguage}>
                <SelectTrigger className="w-48 text-gray-900 dark:text-white bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600"><SelectValue /></SelectTrigger>
                <SelectContent className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 max-h-60">{languages.map((lang) => (<SelectItem key={lang.code} value={lang.code} className="text-gray-900 dark:text-white"><span className="flex items-center"><span className="mr-2 text-lg">{lang.flag}</span>{lang.name}</span></SelectItem>))}</SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            {/* THIS IS THE ONLY SECTION WITH FUNCTIONAL CHANGES */}
            <div className="min-h-32 p-3 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md animate-pulse-glow">
              {isTranslating ? (
                <div className="flex items-center justify-center h-full min-h-24"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div></div>
              ) : (
                <>
                  <div className="min-h-24 text-gray-900 dark:text-white whitespace-pre-wrap">
                    {/* Use the new state object */}
                    {translationResult?.text || 'Translation will appear here...'}
                  </div>
                  {/* Conditionally render the new context section */}
                  {translationResult && !translationResult.text.startsWith('[') && (
                    <div className="border-t border-gray-200 dark:border-gray-700 mt-2 pt-2 space-y-2">
                      {/* Render transliteration if it exists */}
                      {translationResult.transliteration && (
                        <div>
                          <p className="text-sm text-gray-500 dark:text-gray-400 italic whitespace-pre-wrap">
                            {translationResult.transliteration}
                          </p>
                        </div>
                      )}
                      {/* Render original text */}
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 whitespace-pre-wrap">
                          {sourceText}
                        </p>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
            <div className="flex justify-between items-center mt-4">
              <div className="flex space-x-2">
                <Button variant="outline" size="sm" onClick={() => speakText(translationResult?.text || null, targetLanguage)} disabled={!translationResult?.text} className="text-gray-800 dark:text-white bg-white dark:bg-gray-800 border-gray-400 dark:border-gray-600 hover:bg-blue-50 dark:hover:bg-gray-700 hover:border-blue-400 dark:hover:border-blue-400 transition-all duration-300"><Volume2 className="w-4 h-4 mr-1" />Listen</Button>
                <Button variant="outline" size="sm" onClick={() => copyToClipboard(translationResult?.text || null)} disabled={!translationResult?.text} className="text-gray-800 dark:text-white bg-white dark:bg-gray-800 border-gray-400 dark:border-gray-600 hover:bg-blue-50 dark:hover:bg-gray-700 hover:border-blue-400 dark:hover:border-blue-400 transition-all duration-300"><Copy className="w-4 h-4 mr-1" />Copy</Button>
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">{translationResult?.text?.length || 0} characters</div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-center space-x-4">
        <Button variant="outline" onClick={swapLanguages} className="text-gray-800 dark:text-white bg-white dark:bg-gray-800 border-gray-400 dark:border-gray-600 hover:bg-blue-50 dark:hover:bg-gray-700 hover:border-blue-400 dark:hover:border-blue-400 transition-all duration-300 animate-hover-lift"><ArrowRight className="w-4 h-4 mr-2 transform rotate-90" />Swap Languages</Button>
        <Button onClick={translateText} disabled={isTranslating || !sourceText.trim()} className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 animate-glow">
          {isTranslating ? (<><div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>Translating...</>) : (<><Languages className="w-4 h-4 mr-2" />Translate Text</>)}
        </Button>
      </div>

      <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 neon-border">
        <CardContent className="p-4">
          <div className="text-center text-sm text-gray-600 dark:text-gray-300">
            <p className="mb-2"><span className="font-medium">{languages.length} languages</span> supported • <span className="font-medium">AI-powered</span> translations • <span className="font-medium">Cultural context</span> aware</p>
            <p className="text-xs">Popular languages: {getLanguageFlag('en')} English • {getLanguageFlag('es')} Spanish • {getLanguageFlag('fr')} French • {getLanguageFlag('de')} German • {getLanguageFlag('zh')} Chinese • {getLanguageFlag('ja')} Japanese</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MultilingualTranslator;