import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

// The primary RapidAPI key. This will be used for the new API endpoint.
const RAPIDAPI_KEY = Deno.env.get('RAPIDAPI_KEY') || '***REMOVED-RAPIDAPI-KEY***';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Offline dictionary remains as a high-speed fallback for common phrases.
const offlineTranslations: Record<string, Record<string, Record<string, string>>> = {
  'en': {
    'es': { 'hello': 'hola', 'thank you': 'gracias' /* ... more phrases */ },
    'fr': { 'hello': 'bonjour', 'thank you': 'merci' /* ... more phrases */ },
    'de': { 'hello': 'hallo', 'thank you': 'danke' /* ... more phrases */ }
  }
};

// --- THE CORRECTED CORE LOGIC ---
// This function is now updated to call the exact API from your new documentation.
const translateOnline = async (text: string, source: string, target: string) => {
  try {
    const url = 'https://translateai.p.rapidapi.com/google/translate/text';
    const host = 'translateai.p.rapidapi.com';

    console.log(`Attempting translation with the correct API (${host}): ${source} -> ${target}`);

    // The options object now precisely matches your documentation.
    const options = {
      method: 'POST',
      headers: {
        'x-rapidapi-key': RAPIDAPI_KEY,
        'x-rapidapi-host': host,
        'Content-Type': 'application/json' // Using JSON as specified
      },
      // The body is now a JSON object, stringified for the request.
      body: JSON.stringify({
        text: text,
        to: target,
        from_lang: source
      })
    };

    const response = await fetch(url, options);

    if (!response.ok) {
      console.error(`API Error from ${host}:`, response.status, await response.text());
      return null; // Fail gracefully to allow for offline fallback.
    }

    // Per your documentation, the result is expected as text.
    const resultText = await response.text();

    // Some APIs return a JSON object as a string, e.g. `{"translated":"Bonjour"}`.
    // Others might return a raw string like `"Bonjour"`. This handles both cases.
    try {
      const jsonData = JSON.parse(resultText);
      const translated = jsonData.translated || jsonData.text || jsonData.result;
      if (translated) {
        console.log('Translation successful (parsed JSON response).');
        return translated;
      }
    } catch (e) {
      // It's not a JSON object, so it's likely the raw translated text.
      if (resultText) {
        console.log('Translation successful (raw text response).');
        // This removes any leading/trailing quotes if the API returns `"Bonjour"`.
        return resultText.replace(/^"|"$/g, '');
      }
    }
    
    console.warn(`API at ${host} responded OK but the result was empty.`);
    return null;

  } catch (error) {
    console.error(`Network or system error during API call to ${host}:`, error);
    return null;
  }
};

const translateOffline = (text: string, source: string, target: string): string | null => {
  const lowerText = text.toLowerCase().trim();
  const translation = offlineTranslations[source]?.[target]?.[lowerText];
  if (translation) {
    console.log('Translation found in offline dictionary.');
    return translation;
  }
  return null;
};

// Main server logic
serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  try {
    const { text, sourceLanguage, targetLanguage } = await req.json();
    if (!text || !sourceLanguage || !targetLanguage) {
      return new Response(JSON.stringify({ error: 'Missing required parameters.' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    let translatedText: string | null = null;
    let translationMethod = '';
    let confidence = 0.5;

    // Step 1: Attempt live translation with the newly configured API.
    translatedText = await translateOnline(text, sourceLanguage, targetLanguage);
    if (translatedText) {
      translationMethod = 'live_api_google';
      confidence = 0.95;
    } else {
      // Step 2: If live API fails, fall back to the offline dictionary.
      translatedText = translateOffline(text, sourceLanguage, targetLanguage);
      if (translatedText) {
        translationMethod = 'offline_dictionary';
        confidence = 0.90;
      } else {
        // Step 3: If all else fails, provide a clear failure message.
        translationMethod = 'unavailable';
        confidence = 0.0;
        translatedText = `[Translation currently unavailable]`;
        console.log('All translation methods failed. Returning fallback message.');
      }
    }

    return new Response(
      JSON.stringify({ translatedText, method: translationMethod, confidence }),
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