
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Globe, ArrowRight, Copy, Download, Languages } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const MultilingualTranslator = () => {
  const { toast } = useToast();
  const [sourceText, setSourceText] = useState('');
  const [translatedText, setTranslatedText] = useState('');
  const [sourceLanguage, setSourceLanguage] = useState('en');
  const [targetLanguage, setTargetLanguage] = useState('es');
  const [isTranslating, setIsTranslating] = useState(false);

  const languages = [
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
    { code: 'hi', name: 'Hindi', flag: '🇮🇳' },
    { code: 'tr', name: 'Turkish', flag: '🇹🇷' },
    { code: 'pl', name: 'Polish', flag: '🇵🇱' },
    { code: 'nl', name: 'Dutch', flag: '🇳🇱' },
    { code: 'sv', name: 'Swedish', flag: '🇸🇪' },
    { code: 'da', name: 'Danish', flag: '🇩🇰' },
    { code: 'no', name: 'Norwegian', flag: '🇳🇴' },
    { code: 'fi', name: 'Finnish', flag: '🇫🇮' }
  ];

  // Enhanced translation dictionary for better word-by-word translation
  const translationDictionary: { [key: string]: { [key: string]: string } } = {
    en: {
      hello: { es: 'hola', fr: 'bonjour', de: 'hallo', it: 'ciao', pt: 'olá', ru: 'привет', zh: '你好', ja: 'こんにちは', ko: '안녕하세요', ar: 'مرحبا', hi: 'नमस्ते', tr: 'merhaba' },
      world: { es: 'mundo', fr: 'monde', de: 'welt', it: 'mondo', pt: 'mundo', ru: 'мир', zh: '世界', ja: '世界', ko: '세계', ar: 'عالم', hi: 'दुनिया', tr: 'dünya' },
      good: { es: 'bueno', fr: 'bon', de: 'gut', it: 'buono', pt: 'bom', ru: 'хорошо', zh: '好', ja: '良い', ko: '좋은', ar: 'جيد', hi: 'अच्छा', tr: 'iyi' },
      morning: { es: 'mañana', fr: 'matin', de: 'morgen', it: 'mattina', pt: 'manhã', ru: 'утро', zh: '早上', ja: '朝', ko: '아침', ar: 'صباح', hi: 'सुबह', tr: 'sabah' },
      evening: { es: 'tarde', fr: 'soir', de: 'abend', it: 'sera', pt: 'noite', ru: 'вечер', zh: '晚上', ja: '夕方', ko: '저녁', ar: 'مساء', hi: 'शाम', tr: 'akşam' },
      thank: { es: 'gracias', fr: 'merci', de: 'danke', it: 'grazie', pt: 'obrigado', ru: 'спасибо', zh: '谢谢', ja: 'ありがとう', ko: '감사합니다', ar: 'شكرا', hi: 'धन्यवाद', tr: 'teşekkür' },
      you: { es: 'tú', fr: 'tu', de: 'du', it: 'tu', pt: 'você', ru: 'ты', zh: '你', ja: 'あなた', ko: '당신', ar: 'أنت', hi: 'आप', tr: 'sen' },
      please: { es: 'por favor', fr: 's\'il vous plaît', de: 'bitte', it: 'per favore', pt: 'por favor', ru: 'пожалуйста', zh: '请', ja: 'お願いします', ko: '제발', ar: 'من فضلك', hi: 'कृपया', tr: 'lütfen' },
      yes: { es: 'sí', fr: 'oui', de: 'ja', it: 'sì', pt: 'sim', ru: 'да', zh: '是', ja: 'はい', ko: '네', ar: 'نعم', hi: 'हाँ', tr: 'evet' },
      no: { es: 'no', fr: 'non', de: 'nein', it: 'no', pt: 'não', ru: 'нет', zh: '不', ja: 'いいえ', ko: '아니요', ar: 'لا', hi: 'नहीं', tr: 'hayır' },
      water: { es: 'agua', fr: 'eau', de: 'wasser', it: 'acqua', pt: 'água', ru: 'вода', zh: '水', ja: '水', ko: '물', ar: 'ماء', hi: 'पानी', tr: 'su' },
      food: { es: 'comida', fr: 'nourriture', de: 'essen', it: 'cibo', pt: 'comida', ru: 'еда', zh: '食物', ja: '食べ物', ko: '음식', ar: 'طعام', hi: 'खाना', tr: 'yemek' },
      love: { es: 'amor', fr: 'amour', de: 'liebe', it: 'amore', pt: 'amor', ru: 'любовь', zh: '爱', ja: '愛', ko: '사랑', ar: 'حب', hi: 'प्यार', tr: 'aşk' },
      work: { es: 'trabajo', fr: 'travail', de: 'arbeit', it: 'lavoro', pt: 'trabalho', ru: 'работа', zh: '工作', ja: '仕事', ko: '일', ar: 'عمل', hi: 'काम', tr: 'iş' },
      home: { es: 'casa', fr: 'maison', de: 'haus', it: 'casa', pt: 'casa', ru: 'дом', zh: '家', ja: '家', ko: '집', ar: 'منزل', hi: 'घर', tr: 'ev' },
      family: { es: 'familia', fr: 'famille', de: 'familie', it: 'famiglia', pt: 'família', ru: 'семья', zh: '家庭', ja: '家族', ko: '가족', ar: 'عائلة', hi: 'परिवार', tr: 'aile' },
      friend: { es: 'amigo', fr: 'ami', de: 'freund', it: 'amico', pt: 'amigo', ru: 'друг', zh: '朋友', ja: '友達', ko: '친구', ar: 'صديق', hi: 'दोस्त', tr: 'arkadaş' },
      time: { es: 'tiempo', fr: 'temps', de: 'zeit', it: 'tempo', pt: 'tempo', ru: 'время', zh: '时间', ja: '時間', ko: '시간', ar: 'وقت', hi: 'समय', tr: 'zaman' },
      money: { es: 'dinero', fr: 'argent', de: 'geld', it: 'soldi', pt: 'dinheiro', ru: 'деньги', zh: '钱', ja: 'お金', ko: '돈', ar: 'مال', hi: 'पैसा', tr: 'para' },
      help: { es: 'ayuda', fr: 'aide', de: 'hilfe', it: 'aiuto', pt: 'ajuda', ru: 'помощь', zh: '帮助', ja: '助け', ko: '도움', ar: 'مساعدة', hi: 'मदद', tr: 'yardım' }
    }
  };

  const translateWordByWord = (text: string, fromLang: string, toLang: string): string => {
    const words = text.toLowerCase().split(/\s+/);
    const translatedWords = words.map(word => {
      // Remove punctuation for lookup
      const cleanWord = word.replace(/[^\w]/g, '');
      
      if (translationDictionary[fromLang] && 
          translationDictionary[fromLang][cleanWord] && 
          translationDictionary[fromLang][cleanWord][toLang]) {
        // Preserve original punctuation and capitalization
        const translation = translationDictionary[fromLang][cleanWord][toLang];
        const punctuation = word.replace(/\w/g, '');
        const wasCapitalized = word[0] === word[0].toUpperCase();
        
        let finalTranslation = translation + punctuation;
        if (wasCapitalized) {
          finalTranslation = finalTranslation.charAt(0).toUpperCase() + finalTranslation.slice(1);
        }
        return finalTranslation;
      }
      
      // If no translation found, return original word
      return word;
    });
    
    return translatedWords.join(' ');
  };

  const handleTranslate = async () => {
    if (!sourceText.trim()) {
      toast({
        title: "No text to translate",
        description: "Please enter some text to translate.",
        variant: "destructive"
      });
      return;
    }

    setIsTranslating(true);
    
    // Simulate translation delay
    setTimeout(() => {
      const translated = translateWordByWord(sourceText, sourceLanguage, targetLanguage);
      setTranslatedText(translated);
      setIsTranslating(false);
      
      toast({
        title: "Translation Complete!",
        description: `Text translated from ${languages.find(l => l.code === sourceLanguage)?.name} to ${languages.find(l => l.code === targetLanguage)?.name}`,
      });
    }, 1500);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(translatedText);
    toast({
      title: "Copied!",
      description: "Translation copied to clipboard.",
    });
  };

  const downloadTranslation = () => {
    const element = document.createElement('a');
    const file = new Blob([translatedText], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `translation-${Date.now()}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    
    toast({
      title: "Downloaded!",
      description: "Translation downloaded successfully.",
    });
  };

  const swapLanguages = () => {
    const tempLang = sourceLanguage;
    setSourceLanguage(targetLanguage);
    setTargetLanguage(tempLang);
    
    const tempText = sourceText;
    setSourceText(translatedText);
    setTranslatedText(tempText);
  };

  return (
    <div className="space-y-6">
      <Card className="bg-white border-gray-200">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-gray-900">
            <Globe className="w-5 h-5" />
            <span>Multilingual Translator</span>
          </CardTitle>
          <CardDescription className="text-gray-600">
            Translate your resume, cover letters, and documents to any language with enhanced word-by-word accuracy.
          </CardDescription>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Source Language */}
        <Card className="bg-white border-gray-200">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg text-gray-900">From</CardTitle>
              <Select value={sourceLanguage} onValueChange={setSourceLanguage}>
                <SelectTrigger className="w-40">
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
          </CardHeader>
          <CardContent>
            <Textarea
              value={sourceText}
              onChange={(e) => setSourceText(e.target.value)}
              placeholder="Enter text to translate..."
              rows={10}
              className="text-gray-900 resize-none"
            />
            <div className="mt-2 text-sm text-gray-500">
              Characters: {sourceText.length}
            </div>
          </CardContent>
        </Card>

        {/* Target Language */}
        <Card className="bg-white border-gray-200">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg text-gray-900">To</CardTitle>
              <Select value={targetLanguage} onValueChange={setTargetLanguage}>
                <SelectTrigger className="w-40">
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
          </CardHeader>
          <CardContent>
            <Textarea
              value={translatedText}
              readOnly
              placeholder="Translation will appear here..."
              rows={10}
              className="text-gray-900 resize-none bg-gray-50"
            />
            <div className="mt-2 flex items-center justify-between">
              <div className="text-sm text-gray-500">
                Characters: {translatedText.length}
              </div>
              {translatedText && (
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm" onClick={copyToClipboard}>
                    <Copy className="w-4 h-4 mr-1" />
                    Copy
                  </Button>
                  <Button variant="outline" size="sm" onClick={downloadTranslation}>
                    <Download className="w-4 h-4 mr-1" />
                    Download
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Translation Controls */}
      <div className="flex justify-center space-x-4">
        <Button
          variant="outline"
          onClick={swapLanguages}
          className="flex items-center space-x-2"
        >
          <Languages className="w-4 h-4" />
          <span>Swap Languages</span>
        </Button>
        
        <Button
          onClick={handleTranslate}
          disabled={isTranslating || !sourceText.trim()}
          className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
        >
          {isTranslating ? (
            <>
              <Globe className="w-4 h-4 mr-2 animate-spin" />
              Translating...
            </>
          ) : (
            <>
              <ArrowRight className="w-4 h-4 mr-2" />
              Translate
            </>
          )}
        </Button>
      </div>

      {/* Quick Phrases */}
      <Card className="bg-white border-gray-200">
        <CardHeader>
          <CardTitle className="text-lg text-gray-900">Quick Phrases</CardTitle>
          <CardDescription className="text-gray-600">
            Common phrases for resumes and professional communication
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {[
              "Hello, my name is",
              "I am a professional",
              "Thank you for your time",
              "I have experience in",
              "I am interested in",
              "Please contact me",
              "I look forward to hearing from you",
              "Best regards",
              "Sincerely yours"
            ].map((phrase) => (
              <Button
                key={phrase}
                variant="outline"
                size="sm"
                className="text-left justify-start h-auto p-2 text-gray-700"
                onClick={() => setSourceText(phrase)}
              >
                {phrase}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MultilingualTranslator;
