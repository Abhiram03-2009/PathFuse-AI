import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const offlineTranslations: Record<string, Record<string, Record<string, string>>> = {
  'en': { 'es': { 'hello': 'hola', 'thank you': 'gracias' }, 'fr': { 'hello': 'bonjour', 'thank you': 'merci' }, 'de': { 'hello': 'hallo', 'thank you': 'danke' } }
};

// --- Primary Live API (LibreTranslate) ---
const translateWithLibre = async (text: string, source: string, target: string): Promise<string | null> => {
  const url = 'https://libretranslate.de/translate';
  console.log(`Tier 1: Attempting translation with LibreTranslate API`);
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ q: text, source, target, format: 'text' })
    });
    if (!response.ok) {
      console.error(`LibreTranslate API returned non-2xx status: ${response.status}`);
      return null;
    }
    const jsonData = await response.json();
    if (jsonData && jsonData.translatedText) {
      console.log('Tier 1 Success: Translated with LibreTranslate.');
      return jsonData.translatedText;
    }
    return null;
  } catch (error) {
    console.error(`Tier 1 Error: Critical failure calling LibreTranslate API.`, error.message);
    return null;
  }
};

// --- Secondary Live API (MyMemory) ---
// This API is often better at handling untranslatable words like names.
const translateWithMyMemory = async (text: string, source: string, target: string): Promise<string | null> => {
  const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${source}|${target}`;
  console.log(`Tier 2: Attempting translation with MyMemory API`);
  try {
    const response = await fetch(url);
    if (!response.ok) {
      console.error(`MyMemory API returned non-2xx status: ${response.status}`);
      return null;
    }
    const jsonData = await response.json();
    if (jsonData?.responseData?.translatedText) {
      console.log('Tier 2 Success: Translated with MyMemory.');
      return jsonData.responseData.translatedText;
    }
    return null;
  } catch (error) {
    console.error(`Tier 2 Error: Critical failure calling MyMemory API.`, error.message);
    return null;
  }
};

// --- Offline Fallback ---
const translateOffline = (text: string, source: string, target: string): string | null => {
  console.log('Tier 3: Attempting offline dictionary fallback.');
  const lowerText = text.toLowerCase().trim();
  const translation = offlineTranslations[source]?.[target]?.[lowerText];
  if (translation) {
    console.log('Tier 3 Success: Translated with offline dictionary.');
    return translation;
  }
  return null;
};

// --- Main Server Logic with Multi-Tiered Strategy ---
serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  try {
    const body = await req.json();
    const { text, sourceLanguage, targetLanguage } = body;
    if (!text || !sourceLanguage || !targetLanguage) {
      return new Response(JSON.stringify({ error: 'Missing required parameters.' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    let translatedText: string | null = null;
    let translationMethod = '';
    let confidence = 0.5;

    // --- The Waterfall Strategy ---
    
    // 1. Try Primary API
    translatedText = await translateWithLibre(text, sourceLanguage, targetLanguage);
    if (translatedText) {
      translationMethod = 'live_api_primary';
      confidence = 0.92;
    } else {
      // 2. If Primary fails, try Secondary API
      translatedText = await translateWithMyMemory(text, sourceLanguage, targetLanguage);
      if (translatedText) {
        translationMethod = 'live_api_secondary';
        confidence = 0.88;
      } else {
        // 3. If both live APIs fail, try Offline
        translatedText = translateOffline(text, sourceLanguage, targetLanguage);
        if (translatedText) {
          translationMethod = 'offline_dictionary';
          confidence = 0.90;
        } else {
          // 4. If ALL methods fail
          translationMethod = 'unavailable';
          confidence = 0.0;
          translatedText = `[Translation currently unavailable]`;
          console.log('All translation methods failed. Returning fallback message.');
        }
      }
    }

    return new Response(
      JSON.stringify({ translatedText, method: translationMethod, confidence }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Critical error in main server function:', error.message);
    return new Response(
      JSON.stringify({ error: 'Internal Server Error', details: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});