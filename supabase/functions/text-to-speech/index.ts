
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Languages where browser TTS is unreliable — use Google Translate TTS instead.
const USE_GTTS = new Set(['hi', 'ar', 'ja', 'ko', 'zh', 'zh-TW', 'el', 'he', 'th', 'ta', 'te', 'bn', 'vi']);

// BCP-47 locale codes for Google Translate TTS
const GTTS_LOCALE: Record<string, string> = {
  hi: 'hi', ar: 'ar', ja: 'ja', ko: 'ko', zh: 'zh-CN', 'zh-TW': 'zh-TW',
  el: 'el', he: 'iw', th: 'th', ta: 'ta', te: 'te', bn: 'bn', vi: 'vi',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  try {
    const { text, language } = await req.json();

    if (!text || typeof text !== 'string') {
      return new Response(JSON.stringify({ error: 'text is required' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // For languages with poor browser TTS support, fetch from Google Translate TTS
    if (USE_GTTS.has(language)) {
      const locale = GTTS_LOCALE[language] || language;
      const chunk = text.slice(0, 200); // Google TTS max ~200 chars per request
      const url = `https://translate.google.com/translate_tts?ie=UTF-8&tl=${encodeURIComponent(locale)}&q=${encodeURIComponent(chunk)}&client=tw-ob`;

      const res = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'Referer': 'https://translate.google.com/',
        },
      });

      if (res.ok) {
        const buf = new Uint8Array(await res.arrayBuffer());
        let bin = '';
        const CHUNK = 0x8000;
        for (let i = 0; i < buf.length; i += CHUNK) {
          bin += String.fromCharCode.apply(null, Array.from(buf.subarray(i, i + CHUNK)));
        }
        const b64 = btoa(bin);
        return new Response(JSON.stringify({ audio: b64, mime: 'audio/mpeg' }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // Google TTS failed — fall through to browser TTS
      console.warn('Google TTS failed:', res.status);
    }

    // For all other languages, tell the client to use the browser's speechSynthesis
    return new Response(JSON.stringify({ useBrowserTTS: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (e) {
    console.error('text-to-speech error:', e);
    // On any error fall back to browser TTS gracefully
    return new Response(JSON.stringify({ useBrowserTTS: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
