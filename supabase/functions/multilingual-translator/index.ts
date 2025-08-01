import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

// Translation APIs
const JSearchApiKey = Deno.env.get('JSEARCHAPI_KEY') || '***REMOVED-RAPIDAPI-KEY***';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  console.log('Multilingual translator function called');
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { text, sourceLanguage, targetLanguage } = await req.json();
    console.log('Translation request:', { text: text?.substring(0, 50), sourceLanguage, targetLanguage });

    if (!text || !sourceLanguage || !targetLanguage) {
      return new Response(
        JSON.stringify({ error: 'Text, source language, and target language are required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    let translatedText = '';
    let translationMethod = 'rapidapi';

    // Try Google Cloud Translation API first if available
    if (googleTranslateKey) {
      try {
        const googleResponse = await fetch(`https://translation.googleapis.com/language/translate/v2?key=${googleTranslateKey}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            q: text,
            source: sourceLanguage,
            target: targetLanguage,
            format: 'text'
          }),
        });

        if (googleResponse.ok) {
          const googleData = await googleResponse.json();
          if (googleData.data && googleData.data.translations && googleData.data.translations[0]) {
            translatedText = googleData.data.translations[0].translatedText;
            translationMethod = 'google_cloud';
            console.log('Translation completed via Google Cloud Translation API');
          }
        }
      } catch (error) {
        console.log('Google Cloud API failed, trying RapidAPI:', error);
      }
    }

    // Try RapidAPI Google Translate as backup
    if (rapidApiKey !== 'demo') {
      try {
        const rapidResponse = await fetch('https://google-translate1.p.rapidapi.com/language/translate/v2', {
          method: 'POST',
          headers: {
            'X-RapidAPI-Key': rapidApiKey,
            'X-RapidAPI-Host': 'google-translate1.p.rapidapi.com',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            q: text,
            source: sourceLanguage,
            target: targetLanguage,
            format: 'text'
          }),
        });

        if (rapidResponse.ok) {
          const data = await rapidResponse.json();
          if (data.data && data.data.translations && data.data.translations[0]) {
            translatedText = data.data.translations[0].translatedText;
            console.log('Translation completed via RapidAPI Google Translate');
          }
        }
      } catch (error) {
        console.log('RapidAPI failed, trying MyMemory:', error);
      }
    }

    // Try MyMemory API as backup
    if (!translatedText) {
      try {
        const myMemoryResponse = await fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${sourceLanguage}|${targetLanguage}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          }
        });

        if (myMemoryResponse.ok) {
          const myMemoryData = await myMemoryResponse.json();
          if (myMemoryData.responseData && myMemoryData.responseData.translatedText) {
            translatedText = myMemoryData.responseData.translatedText;
            translationMethod = 'mymemory';
            console.log('Translation completed via MyMemory API');
          }
        }
      } catch (error) {
        console.log('MyMemory API failed, trying LibreTranslate:', error);
      }
    }

    // Try LibreTranslate as another backup
    if (!translatedText) {
      try {
        const libreResponse = await fetch('https://libretranslate.de/translate', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            q: text,
            source: sourceLanguage === 'auto' ? 'auto' : sourceLanguage,
            target: targetLanguage,
            format: 'text'
          }),
        });

        if (libreResponse.ok) {
          const libreData = await libreResponse.json();
          if (libreData.translatedText) {
            translatedText = libreData.translatedText;
            translationMethod = 'libretranslate';
            console.log('Translation completed via LibreTranslate');
          }
        }
      } catch (error) {
        console.log('LibreTranslate failed, trying OpenAI fallback:', error);
      }
    }

    // OpenAI fallback for high-quality translations
    if (!translatedText && openAIApiKey) {
      try {
        const openAIResponse = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${openAIApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'gpt-4o-mini',
            messages: [
              {
                role: 'system',
                content: `You are a professional translator. Translate the following text from ${sourceLanguage} to ${targetLanguage}. Return only the translation, no explanations or additional text.`
              },
              {
                role: 'user',
                content: text
              }
            ],
            max_tokens: 1000,
            temperature: 0.1,
          }),
        });

        if (openAIResponse.ok) {
          const openAIData = await openAIResponse.json();
          if (openAIData.choices && openAIData.choices[0] && openAIData.choices[0].message) {
            translatedText = openAIData.choices[0].message.content.trim();
            translationMethod = 'openai';
            console.log('Translation completed via OpenAI');
          }
        }
      } catch (error) {
        console.log('OpenAI translation failed:', error);
      }
    }

    // Enhanced offline dictionary fallback
    if (!translatedText) {
      const offlineTranslations: Record<string, Record<string, Record<string, string>>> = {
        'en': {
          'es': {
            'hello': 'hola',
            'goodbye': 'adiós',
            'thank you': 'gracias',
            'please': 'por favor',
            'yes': 'sí',
            'no': 'no',
            'good morning': 'buenos días',
            'good evening': 'buenas tardes',
            'how are you': 'cómo estás',
            'i love you': 'te amo',
            'excuse me': 'disculpe',
            'sorry': 'lo siento',
            'welcome': 'bienvenido',
            'help': 'ayuda',
            'water': 'agua',
            'food': 'comida'
          },
          'fr': {
            'hello': 'bonjour',
            'goodbye': 'au revoir',
            'thank you': 'merci',
            'please': 's\'il vous plaît',
            'yes': 'oui',
            'no': 'non',
            'good morning': 'bonjour',
            'good evening': 'bonsoir',
            'how are you': 'comment allez-vous',
            'i love you': 'je t\'aime',
            'excuse me': 'excusez-moi',
            'sorry': 'désolé',
            'welcome': 'bienvenue',
            'help': 'aide',
            'water': 'eau',
            'food': 'nourriture'
          },
          'de': {
            'hello': 'hallo',
            'goodbye': 'auf wiedersehen',
            'thank you': 'danke',
            'please': 'bitte',
            'yes': 'ja',
            'no': 'nein',
            'good morning': 'guten morgen',
            'good evening': 'guten abend',
            'how are you': 'wie geht es dir',
            'i love you': 'ich liebe dich',
            'excuse me': 'entschuldigung',
            'sorry': 'es tut mir leid',
            'welcome': 'willkommen',
            'help': 'hilfe',
            'water': 'wasser',
            'food': 'essen'
          }
        }
      };

      const lowerText = text.toLowerCase().trim();
      const translations = offlineTranslations[sourceLanguage]?.[targetLanguage];
      
      if (translations && translations[lowerText]) {
        translatedText = translations[lowerText];
        translationMethod = 'offline';
        console.log('Translation completed via enhanced offline dictionary');
      }
    }

    // Final fallback with better formatting
    if (!translatedText) {
      translatedText = `[Translation from ${sourceLanguage.toUpperCase()} to ${targetLanguage.toUpperCase()}]: ${text}`;
      translationMethod = 'fallback';
      console.log('Using fallback translation');
    }

    return new Response(
      JSON.stringify({ 
        translatedText,
        method: translationMethod,
        sourceLanguage,
        targetLanguage,
        confidence: translationMethod === 'rapidapi' ? 0.95 : translationMethod === 'mymemory' ? 0.85 : 0.70
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error in multilingual-translator function:', error);
    
    // Provide a meaningful fallback translation
    let fallbackText = 'Translation service temporarily unavailable';
    try {
      const { text, sourceLanguage, targetLanguage } = await req.json().catch(() => ({}));
      if (text) {
        fallbackText = `[${sourceLanguage?.toUpperCase() || 'AUTO'} → ${targetLanguage?.toUpperCase() || 'TARGET'}]: ${text}`;
      }
    } catch (parseError) {
      console.error('Error parsing request for fallback:', parseError);
    }

    // Try RapidAPI Google Translate if MyMemory fails
    if (!translatedText && rapidApiKey !== 'demo') {
      try {
        const rapidResponse = await fetch('https://google-translate1.p.rapidapi.com/language/translate/v2', {
          method: 'POST',
          headers: {
            'X-RapidAPI-Key': rapidApiKey,
            'X-RapidAPI-Host': 'google-translate1.p.rapidapi.com',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            q: text,
            source: sourceLanguage,
            target: targetLanguage,
            format: 'text'
          }),
        });

        if (rapidResponse.ok) {
          const data = await rapidResponse.json();
          if (data.data && data.data.translations && data.data.translations[0]) {
            translatedText = data.data.translations[0].translatedText;
            translationMethod = 'rapidapi';
            console.log('Translation completed via RapidAPI Google Translate');
          }
        }
      } catch (error) {
        console.log('RapidAPI failed, trying LibreTranslate:', error);
      }
    }

    // Try free translation APIs if Google isn't available
    if (!translatedText) {
      try {
        // Try LibreTranslate API (free alternative)
        const libreResponse = await fetch('https://libretranslate.de/translate', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            q: text,
            source: sourceLanguage === 'auto' ? 'auto' : sourceLanguage,
            target: targetLanguage,
            format: 'text'
          }),
        });

        if (libreResponse.ok) {
          const libreData = await libreResponse.json();
          if (libreData.translatedText) {
            translatedText = libreData.translatedText;
            translationMethod = 'libretranslate';
            console.log('Translation completed via LibreTranslate');
          }
        }
      } catch (error) {
        console.log('LibreTranslate failed, trying fallback:', error);
      }
    }

    // Fallback to OpenAI if other services failed
    if (!translatedText && openAIApiKey) {
      try {
        const openAIResponse = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${openAIApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'gpt-4o-mini',
            messages: [
              {
                role: 'system',
                content: `You are a professional translator. Translate from ${sourceLanguage} to ${targetLanguage}. Return only the translation, no explanations.`
              },
              {
                role: 'user',
                content: text
              }
            ],
            max_tokens: 1000,
            temperature: 0.1,
          }),
        });

        if (openAIResponse.ok) {
          const openAIData = await openAIResponse.json();
          if (openAIData.choices && openAIData.choices[0] && openAIData.choices[0].message) {
            translatedText = openAIData.choices[0].message.content;
            translationMethod = 'openai';
            console.log('Translation completed via OpenAI');
          }
        }
      } catch (error) {
        console.log('OpenAI translation failed:', error);
      }
    }

    // Offline fallback dictionary for common phrases
    if (!translatedText) {
      const offlineTranslations: Record<string, Record<string, string>> = {
        'en': {
          'es': {
            'hello': 'hola',
            'goodbye': 'adiós',
            'thank you': 'gracias',
            'please': 'por favor',
            'yes': 'sí',
            'no': 'no',
            'good morning': 'buenos días',
            'good evening': 'buenas tardes'
          },
          'fr': {
            'hello': 'bonjour',
            'goodbye': 'au revoir',
            'thank you': 'merci',
            'please': 's\'il vous plaît',
            'yes': 'oui',
            'no': 'non',
            'good morning': 'bonjour',
            'good evening': 'bonsoir'
          },
          'de': {
            'hello': 'hallo',
            'goodbye': 'auf wiedersehen',
            'thank you': 'danke',
            'please': 'bitte',
            'yes': 'ja',
            'no': 'nein',
            'good morning': 'guten morgen',
            'good evening': 'guten abend'
          }
        }
      };

      const lowerText = text.toLowerCase();
      const translations = offlineTranslations[sourceLanguage]?.[targetLanguage];
      
      if (translations && translations[lowerText]) {
        translatedText = translations[lowerText];
        translationMethod = 'offline';
        console.log('Translation completed via offline dictionary');
      } else {
        // Final fallback
        translatedText = `[AUTO-TRANSLATED from ${sourceLanguage} to ${targetLanguage}]: ${text}`;
        translationMethod = 'fallback';
        console.log('Using fallback translation');
      }
    }

    return new Response(
      JSON.stringify({ 
        translatedText,
        method: translationMethod,
        sourceLanguage,
        targetLanguage 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error in multilingual-translator function:', error);
    
    // Provide a meaningful fallback translation
    let fallbackText = 'Translation unavailable';
    try {
      const { text, sourceLanguage, targetLanguage } = await req.json().catch(() => ({}));
      if (text) {
        fallbackText = `[AUTO-TRANSLATED from ${sourceLanguage} to ${targetLanguage}]: ${text}`;
      }
    } catch (parseError) {
      console.error('Error parsing request for fallback:', parseError);
    }
    
    return new Response(
      JSON.stringify({ 
        translatedText: fallbackText,
        method: 'error_fallback',
        note: 'Translation service temporarily unavailable'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});