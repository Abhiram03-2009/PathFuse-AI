// Multilingual translator powered by Lovable AI Gateway (Gemini)
// Replaces flaky LibreTranslate/MyMemory/RapidAPI dependencies with a single
// high-quality model call that handles ALL languages and full sentences.
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const LANG_NAMES: Record<string, string> = {
  en: 'English', es: 'Spanish', fr: 'French', de: 'German', it: 'Italian',
  pt: 'Portuguese', ru: 'Russian', ja: 'Japanese', ko: 'Korean',
  zh: 'Simplified Chinese', 'zh-TW': 'Traditional Chinese', ar: 'Arabic',
  hi: 'Hindi', tr: 'Turkish', pl: 'Polish', nl: 'Dutch', sv: 'Swedish',
  da: 'Danish', no: 'Norwegian', fi: 'Finnish', el: 'Greek', he: 'Hebrew',
  th: 'Thai', vi: 'Vietnamese', ta: 'Tamil', te: 'Telugu', bn: 'Bengali',
};

const NON_LATIN = new Set(['ar','hi','ja','ko','ru','zh','zh-TW','el','he','th','ta','te','bn']);

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  try {
    if (!LOVABLE_API_KEY) {
      return new Response(JSON.stringify({ error: 'LOVABLE_API_KEY is not configured' }), {
        status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { text, sourceLanguage, targetLanguage } = await req.json();
    if (!text || !sourceLanguage || !targetLanguage) {
      return new Response(JSON.stringify({ error: 'Missing parameters' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const sourceName = LANG_NAMES[sourceLanguage] || sourceLanguage;
    const targetName = LANG_NAMES[targetLanguage] || targetLanguage;
    const needsTranslit = NON_LATIN.has(targetLanguage);

    const system = `You are a professional translator. Translate the user's text from ${sourceName} to ${targetName}. Preserve meaning, tone, and formatting. Return ONLY a strict JSON object with these keys: {"translatedText": string${needsTranslit ? ', "transliteration": string (romanized phonetic transliteration of the translation)' : ''}}. No markdown, no commentary.`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: system },
          { role: 'user', content: text },
        ],
        response_format: { type: 'json_object' },
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error('Translation gateway error:', response.status, errText);
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: 'Rate limit reached, please try again.' }), {
          status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: 'AI credits exhausted.' }), {
          status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      throw new Error(`Gateway ${response.status}`);
    }

    const data = await response.json();
    const raw = data?.choices?.[0]?.message?.content ?? '{}';
    let parsed: { translatedText?: string; transliteration?: string } = {};
    try { parsed = JSON.parse(raw); } catch {
      // Try to extract JSON if model wrapped it
      const m = raw.match(/\{[\s\S]*\}/);
      if (m) { try { parsed = JSON.parse(m[0]); } catch {} }
    }

    const translatedText = parsed.translatedText?.trim() || '[Translation failed]';
    const transliteration = parsed.transliteration?.trim() || null;

    return new Response(JSON.stringify({
      translatedText,
      transliteration,
      method: 'lovable_ai',
    }), { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

  } catch (error) {
    console.error('translator error:', error);
    return new Response(JSON.stringify({ error: 'Translation failed', details: (error as Error).message }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
