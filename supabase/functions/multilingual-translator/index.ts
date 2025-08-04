import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

// The primary RapidAPI key for the Google Translate service.
const RAPIDAPI_KEY = Deno.env.get('RAPIDAPI_KEY') || '***REMOVED-RAPIDAPI-KEY***';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Offline dictionary for common phrases, used as a fallback.
const offlineTranslations: Record<string, Record<string, Record<string, string>>> = {
  'en': {
    'es': { 'hello': 'hola', 'thank you': 'gracias' /* ... more phrases */ },
    'fr': { 'hello': 'bonjour', 'thank you': 'merci' /* ... more phrases */ },
    'de': { 'hello': 'hallo', 'thank you': 'danke' /* ... more phrases */ }
  }
};

// --- CORE TRANSLATION LOGIC ---
// This function now robustly calls the correct Google Translate API.
const translateOnline = async (text: string, source: string, target: string) => {
  try {
    console.log(`Attempting translation with RapidAPI Google Translate: ${source} -> ${target}`);
    
    // This is the correct endpoint for translation, not the Maps API.
    const response = await fetch('https://google-translate1.p.rapidapi.com/language/translate/v2', {
      method: 'POST',
      headers: {
        'X-RapidAPI-Key': RAPIDAPI_KEY,
        'X-RapidAPI-Host': 'google-translate1.p.rapidapi.com',
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      // The body must be URL-encoded, which is handled by URLSearchParams.
      body: new URLSearchParams({ q: text, target, source })
    });

    if (!response.ok) {
      console.error('RapidAPI Error:', response.status, await response.text());
      return null; // Return null on API error to allow fallback.
    }

    const data = await response.json();
    if (data.data?.translations?.[0]?.translatedText) {
      console.log('Translation successful via RapidAPI.');
      return data.data.translations[0].translatedText;
    }
    
    console.warn('RapidAPI response was OK but contained no translation.');
    return null;

  } catch (error) {
    console.error('Network or system error during RapidAPI call:', error);
    return null; // Return null on network error.
  }
};

// This function provides the offline fallback.
const translateOffline = (text: string, source: string, target: string): string | null => {
  const lowerText = text.toLowerCase().trim();
  const translation = offlineTranslations[source]?.[target]?.[lowerText];
  if (translation) {
    console.log('Translation found in offline dictionary.');
    return translation;
  }
  return null;
};


serve(async (req) => {
  console.log('Multilingual translator function invoked.');
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  try {
    const { text, sourceLanguage, targetLanguage } = await req.json();
    if (!text || !sourceLanguage || !targetLanguage) {
      return new Response(JSON.stringify({ error: 'Text, source, and target language are required.' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    let translatedText: string | null = null;
    let translationMethod = '';
    let confidence = 0.5;

    // Step 1: Attempt live translation via the primary API.
    translatedText = await translateOnline(text, sourceLanguage, targetLanguage);
    if (translatedText) {
      translationMethod = 'live_api_google';
      confidence = 0.95;
    }

    // Step 2: If the live API fails, fall back to the offline dictionary.
    if (!translatedText) {
      translatedText = translateOffline(text, sourceLanguage, targetLanguage);
      if (translatedText) {
        translationMethod = 'offline_dictionary';
        confidence = 0.90;
      }
    }

    // Step 3: If all else fails, provide a clear "no translation" message.
    if (!translatedText) {
      translationMethod = 'unavailable';
      confidence = 0.0;
      translatedText = `[No translation available for this phrase]`;
      console.log('All translation methods failed. Returning fallback message.');
    }

    return new Response(
      JSON.stringify({ 
        translatedText,
        method: translationMethod,
        confidence,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Critical error in translator function:', error);
    return new Response(
      JSON.stringify({ error: 'Internal Server Error', details: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});