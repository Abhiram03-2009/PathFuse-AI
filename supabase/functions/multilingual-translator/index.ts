import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

// Translation APIs with working keys
const RAPIDAPI_KEY = Deno.env.get('RAPIDAPI_KEY') || '***REMOVED-RAPIDAPI-KEY***';
const GOOGLE_TRANSLATE_KEY = Deno.env.get('GOOGLE_TRANSLATE_KEY') || '';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Enhanced offline dictionary for common phrases
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
      'food': 'comida',
      'work': 'trabajo',
      'family': 'familia',
      'friend': 'amigo',
      'house': 'casa',
      'car': 'coche',
      'money': 'dinero'
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
      'food': 'nourriture',
      'work': 'travail',
      'family': 'famille',
      'friend': 'ami',
      'house': 'maison',
      'car': 'voiture',
      'money': 'argent'
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
      'food': 'essen',
      'work': 'arbeit',
      'family': 'familie',
      'friend': 'freund',
      'house': 'haus',
      'car': 'auto',
      'money': 'geld'
    }
  }
};

serve(async (req) => {
  console.log('Multilingual translator function called');
  
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { text, sourceLanguage, targetLanguage } = await req.json();
    console.log('Translation request:', { 
      textLength: text?.length, 
      sourceLanguage, 
      targetLanguage 
    });

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
    let translationMethod = '';

    // Method 1: Try RapidAPI Google Translate (most reliable)
    try {
      console.log('Trying RapidAPI Google Translate...');
      
      const rapidResponse = await fetch('https://google-translate1.p.rapidapi.com/language/translate/v2', {
        method: 'POST',
        headers: {
          'X-RapidAPI-Key': RAPIDAPI_KEY,
          'X-RapidAPI-Host': 'google-translate1.p.rapidapi.com',
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          'q': text,
          'target': targetLanguage,
          'source': sourceLanguage
        })
      });

      if (rapidResponse.ok) {
        const data = await rapidResponse.json();
        console.log('RapidAPI response:', data);
        
        if (data.data && data.data.translations && data.data.translations[0]) {
          translatedText = data.data.translations[0].translatedText;
          translationMethod = 'rapidapi_google';
          console.log('Translation successful via RapidAPI Google Translate');
        }
      } else {
        console.error('RapidAPI error:', rapidResponse.status, rapidResponse.statusText);
      }
    } catch (error) {
      console.error('RapidAPI Google Translate failed:', error);
    }

    // Method 2: Try MyMemory API (free alternative)
    if (!translatedText) {
      try {
        console.log('Trying MyMemory API...');
        
        const myMemoryResponse = await fetch(
          `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${sourceLanguage}|${targetLanguage}&de=your@email.com`,
          {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            }
          }
        );

        if (myMemoryResponse.ok) {
          const myMemoryData = await myMemoryResponse.json();
          console.log('MyMemory response:', myMemoryData);
          
          if (myMemoryData.responseData && myMemoryData.responseData.translatedText) {
            translatedText = myMemoryData.responseData.translatedText;
            translationMethod = 'mymemory';
            console.log('Translation successful via MyMemory API');
          }
        }
      } catch (error) {
        console.error('MyMemory API failed:', error);
      }
    }

    // Method 3: Try LibreTranslate (open source)
    if (!translatedText) {
      try {
        console.log('Trying LibreTranslate...');
        
        const libreResponse = await fetch('https://libretranslate.de/translate', {
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

        if (libreResponse.ok) {
          const libreData = await libreResponse.json();
          console.log('LibreTranslate response:', libreData);
          
          if (libreData.translatedText) {
            translatedText = libreData.translatedText;
            translationMethod = 'libretranslate';
            console.log('Translation successful via LibreTranslate');
          }
        }
      } catch (error) {
        console.error('LibreTranslate failed:', error);
      }
    }

    // Method 4: Try Microsoft Translator via RapidAPI
    if (!translatedText) {
      try {
        console.log('Trying Microsoft Translator...');
        
        const msResponse = await fetch('https://microsoft-translator-text.p.rapidapi.com/translate', {
          method: 'POST',
          headers: {
            'X-RapidAPI-Key': RAPIDAPI_KEY,
            'X-RapidAPI-Host': 'microsoft-translator-text.p.rapidapi.com',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify([{
            'Text': text
          }]),
        });

        if (msResponse.ok) {
          const msData = await msResponse.json();
          console.log('Microsoft Translator response:', msData);
          
          if (msData && msData[0] && msData[0].translations && msData[0].translations[0]) {
            translatedText = msData[0].translations[0].text;
            translationMethod = 'microsoft';
            console.log('Translation successful via Microsoft Translator');
          }
        }
      } catch (error) {
        console.error('Microsoft Translator failed:', error);
      }
    }

    // Method 5: Enhanced offline dictionary fallback
    if (!translatedText) {
      console.log('Trying offline dictionary...');
      
      const lowerText = text.toLowerCase().trim();
      const translations = offlineTranslations[sourceLanguage]?.[targetLanguage];
      
      if (translations) {
        // Try exact match first
        if (translations[lowerText]) {
          translatedText = translations[lowerText];
          translationMethod = 'offline_exact';
        } else {
          // Try partial matches for longer text
          let partialTranslation = '';
          const words = lowerText.split(/\s+/);
          
          words.forEach(word => {
            if (translations[word]) {
              partialTranslation += translations[word] + ' ';
            } else {
              partialTranslation += word + ' ';
            }
          });
          
          if (partialTranslation.trim() !== lowerText) {
            translatedText = partialTranslation.trim();
            translationMethod = 'offline_partial';
          }
        }
      }
    }

    // Final fallback with language indication
    if (!translatedText) {
      translatedText = `[${sourceLanguage.toUpperCase()} → ${targetLanguage.toUpperCase()}]: ${text}`;
      translationMethod = 'fallback';
      console.log('Using fallback translation');
    }

    // Calculate confidence score
    let confidence = 0.5;
    switch (translationMethod) {
      case 'rapidapi_google':
        confidence = 0.95;
        break;
      case 'microsoft':
        confidence = 0.90;
        break;
      case 'mymemory':
        confidence = 0.85;
        break;
      case 'libretranslate':
        confidence = 0.80;
        break;
      case 'offline_exact':
        confidence = 0.90;
        break;
      case 'offline_partial':
        confidence = 0.70;
        break;
      default:
        confidence = 0.50;
    }

    return new Response(
      JSON.stringify({ 
        translatedText,
        method: translationMethod,
        sourceLanguage,
        targetLanguage,
        confidence,
        timestamp: new Date().toISOString()
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error in multilingual-translator function:', error);
    
    return new Response(
      JSON.stringify({ 
        error: 'Translation service error',
        details: error.message,
        translatedText: `[Translation Error]: ${error.message}`,
        method: 'error'
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});