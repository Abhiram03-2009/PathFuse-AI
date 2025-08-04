import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const offlineTranslations: Record<string, Record<string, Record<string, string>>> = {
  'en': {
    'es': { 'hello': 'hola', 'thank you': 'gracias' },
    'fr': { 'hello': 'bonjour', 'thank you': 'merci' },
    'de': { 'hello': 'hallo', 'thank you': 'danke' }
  }
};

// --- THE BULLETPROOF API FUNCTION ---
// This function is now hardened to prevent crashes from external API failures.
const translateWithLiveAPI = async (text: string, source: string, target: string): Promise<string | null> => {
  const url = 'https://libretranslate.de/translate';
  console.log(`Attempting robust translation with public API (${url})`);

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        q: text,
        source: source,
        target: target,
        format: 'text'
      })
    });

    // If the API returns an error status (like 500, 429, etc.)
    if (!response.ok) {
      // Log the exact error response from the API and fail gracefully.
      const errorBody = await response.text();
      console.error(`Public API returned non-2xx status: ${response.status}. Body: ${errorBody}`);
      return null;
    }

    // This block now safely handles cases where the API returns a non-JSON response.
    const jsonData = await response.json();
    
    if (jsonData && jsonData.translatedText) {
      console.log('Translation successful via public API.');
      return jsonData.translatedText;
    }
    
    console.warn(`API responded OK but result was malformed: ${JSON.stringify(jsonData)}`);
    return null;

  } catch (error) {
    // This catches network errors (e.g., API is down) AND JSON parsing errors.
    console.error(`Critical error during API call or JSON parsing for ${url}:`, error.message);
    return null; // Ensures the function never crashes.
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

// --- Main Server Logic ---
serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  try {
    const body = await req.json();
    // Added detailed logging to see exactly what the frontend is sending.
    console.log('Received request body:', JSON.stringify(body));

    const { text, sourceLanguage, targetLanguage } = body;

    if (!text || !sourceLanguage || !targetLanguage) {
      console.error('Validation failed: Missing required parameters.');
      return new Response(JSON.stringify({ error: 'Missing required parameters.' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    let translatedText: string | null = null;
    let translationMethod = '';
    let confidence = 0.5;

    // Step 1: Attempt live translation with the hardened function.
    translatedText = await translateWithLiveAPI(text, sourceLanguage, targetLanguage);
    if (translatedText) {
      translationMethod = 'live_api_public';
      confidence = 0.92;
    } else {
      // Step 2: If the robust live API function returns null, we know it failed. Fall back.
      console.log('Live API failed. Attempting offline fallback.');
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

    // This is a success (200) response. The function itself did not crash.
    return new Response(
      JSON.stringify({ translatedText, method: translationMethod, confidence }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    // This outer catch now only catches fundamental errors, like if the request itself is malformed.
    console.error('Critical error in main server function:', error.message);
    return new Response(
      JSON.stringify({ error: 'Internal Server Error', details: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});