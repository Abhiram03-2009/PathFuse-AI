// Server-side TTS via Lovable AI gateway for languages the browser
// doesn't have a voice for (Hindi, etc.). Returns base64 mp3 audio.
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';

const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });
  try {
    if (!LOVABLE_API_KEY) throw new Error('AI gateway not configured');
    const { text, voice, language, locale } = await req.json();
    if (!text || typeof text !== 'string') {
      return new Response(JSON.stringify({ error: 'text is required' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    const input = text.slice(0, 4000);
    const res = await fetch('https://ai.gateway.lovable.dev/v1/audio/speech', {
      method: 'POST',
      headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'openai/gpt-4o-mini-tts',
        input,
        voice: voice || 'alloy',
        instructions: language === 'hi' || locale === 'hi-IN'
          ? 'Speak clearly in natural Hindi pronunciation, with a warm neutral Indian accent and steady pace.'
          : 'Speak clearly with natural pronunciation and a steady pace.',
        response_format: 'mp3',
      }),
    });
    if (!res.ok) {
      const t = await res.text().catch(() => '');
      console.error('TTS gateway error', res.status, t.slice(0, 200));
      return new Response(JSON.stringify({ error: `TTS failed (${res.status})` }), {
        status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    const buf = new Uint8Array(await res.arrayBuffer());
    // base64 encode (chunked to avoid stack overflow on large arrays)
    let bin = '';
    const CHUNK = 0x8000;
    for (let i = 0; i < buf.length; i += CHUNK) {
      bin += String.fromCharCode.apply(null, Array.from(buf.subarray(i, i + CHUNK)));
    }
    const b64 = btoa(bin);
    return new Response(JSON.stringify({ audio: b64, mime: 'audio/mpeg' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (e) {
    console.error('text-to-speech error', e);
    return new Response(JSON.stringify({ error: (e as Error).message }), {
      status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
