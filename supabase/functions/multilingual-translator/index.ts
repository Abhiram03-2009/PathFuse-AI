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

// --- THE NEW, RELIABLE CORE LOGIC ---
// This function uses the public LibreTranslate API, which does not require a key.
const translateWithLiveAPI = async (text: string, source: string, target: string) => {
  try {
    const url = 'https://libretranslate.de/translate';
    console.log(`Attempting translation with the reliable public API (${url}): ${source} -> ${target}`);

    const options = {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        q: text,
        source: source,
        target: target,
        format: 'text'
      })
    };

    const response = await fetch(url, options);

    if (!response.ok) {
      console.error(`Public API Error from ${url}:`, response.status, await response.text());
      return null; // Fail gracefully to allow for offline fallback.
    }

    const jsonData = await response.json();
    
    if (jsonData && jsonData.translatedText) {
      console.log('Translation successful via public API.');
      return jsonData.translatedText;
    }
    
    console.warn(`API at ${url} responded OK but the result was empty or malformed.`);
    return null;

  } catch (error) {
    console.error(`Network or system error during public API call to ${url}:`, error);
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
Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  try {
    const { text, sourceLanguage, targetLanguage } = await req.json();
    if (!text || !sourceLanguage || !targetLanguage) {
      return new Response(JSON.stringify({ error: 'Missing required parameters.' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    let translatedText: string | null = null;
    let translationMethod = '';
    let confidence = 0.5;

    // Step 1: Attempt live translation with the new, key-less public API.
    translatedText = await translateWithLiveAPI(text, sourceLanguage, targetLanguage);
    if (translatedText) {
      translationMethod = 'live_api_public';
      confidence = 0.92; // High confidence for a reliable live service.
    } else {
      // Step 2: If the live API is down or fails, fall back to the offline dictionary.
      console.log('Live API failed, attempting offline fallback.');
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