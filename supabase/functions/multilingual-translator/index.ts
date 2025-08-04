import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const RAPIDAPI_KEY = Deno.env.get('RAPIDAPI_KEY') || '***REMOVED-RAPIDAPI-KEY***';
const corsHeaders = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type' };
const offlineTranslations = { 'en': { 'es': { 'hello': 'hola' } } };

// --- API Functions ---
const translateWithLibre = async (text: string, source: string, target: string): Promise<string | null> => {
  const url = 'https://libretranslate.de/translate';
  console.log(`Tier 1: Attempting with LibreTranslate`);
  try {
    const r = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ q: text, source, target, format: 'text' }) });
    if (!r.ok) return null;
    const d = await r.json();
    return d?.translatedText || null;
  } catch (e) { return null; }
};

const translateWithMyMemory = async (text: string, source: string, target: string): Promise<string | null> => {
  const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${source}|${target}`;
  console.log(`Tier 2: Attempting with MyMemory`);
  try {
    const r = await fetch(url);
    if (!r.ok) return null;
    const d = await r.json();
    return d?.responseData?.translatedText || null;
  } catch (e) { return null; }
};

const translateOffline = (text: string, source: string, target: string): string | null => {
  console.log('Tier 3: Attempting offline fallback.');
  return offlineTranslations[source]?.[target]?.[text.toLowerCase().trim()] || null;
};

// --- Dedicated Transliteration Function for non-Latin scripts ---
const transliterateText = async (text: string, lang: string): Promise<string | null> => {
  const nonLatinScripts = ['ar', 'hi', 'ja', 'ko', 'ru', 'zh', 'zh-TW', 'el', 'he', 'th', 'ta', 'te'];
  if (!nonLatinScripts.includes(lang)) return null;
  
  console.log(`Transliteration required for ${lang}. Calling API.`);
  try {
    const url = 'https://google-input-tools.p.rapidapi.com/transliteration';
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'x-rapidapi-key': RAPIDAPI_KEY, 'x-rapidapi-host': 'google-input-tools.p.rapidapi.com', 'content-type': 'application/json' },
      body: JSON.stringify({ lang, text })
    });
    if (!response.ok) return null;
    const data = await response.json();
    if (data && data[0]) {
      console.log('Transliteration successful.');
      return data[0];
    }
    return null;
  } catch (error) {
    console.error('Transliteration API failed:', error.message);
    return null;
  }
};

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });
  try {
    const { text, sourceLanguage, targetLanguage } = await req.json();
    if (!text || !sourceLanguage || !targetLanguage) return new Response(JSON.stringify({ error: 'Missing parameters' }), { status: 400 });

    let translatedText: string | null = null;
    let transliteration: string | null = null;
    let method = 'unavailable';
    const sourceWords = text.trim().split(/\s+/).length;

    translatedText = await translateWithLibre(text, sourceLanguage, targetLanguage);
    if (translatedText) {
      const translatedWords = translatedText.trim().split(/\s+/).length;
      if (sourceWords > translatedWords + 1 && sourceWords > 2) {
        translatedText = null; 
      } else {
        method = 'live_api_primary';
      }
    }

    if (!translatedText) {
      translatedText = await translateWithMyMemory(text, sourceLanguage, targetLanguage);
      if (translatedText) method = 'live_api_secondary';
    }

    if (!translatedText) {
      translatedText = translateOffline(text, sourceLanguage, targetLanguage);
      if (translatedText) method = 'offline_dictionary';
    }
    
    if (translatedText) {
      transliteration = await transliterateText(translatedText, targetLanguage);
    } else {
      translatedText = `[Translation currently unavailable]`;
    }

    return new Response(JSON.stringify({ translatedText, transliteration, method }), { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

  } catch (error) {
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), { status: 500 });
  }
});