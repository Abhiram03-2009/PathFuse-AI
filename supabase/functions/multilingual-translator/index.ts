import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const googleApiKey = Deno.env.get('GOOGLE_API_KEY');
const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  console.log('Multilingual translator function called');
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { text, sourceLanguage, targetLanguage } = await req.json();
    console.log('Translation request:', { text: text?.substring(0, 50), sourceLanguage, targetLanguage });

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
    let translationMethod = 'google';

    // Try Google Translate API first if available
    if (googleApiKey) {
      try {
        const response = await fetch(`https://translation.googleapis.com/language/translate/v2?key=${googleApiKey}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            q: text,
            source: sourceLanguage === 'auto' ? undefined : sourceLanguage,
            target: targetLanguage,
            format: 'text'
          }),
        });

        if (response.ok) {
          const data = await response.json();
          if (data.data && data.data.translations && data.data.translations[0]) {
            translatedText = data.data.translations[0].translatedText;
            console.log('Translation completed via Google Translate');
          }
        }
      } catch (error) {
        console.log('Google Translate failed, trying OpenAI:', error);
        translationMethod = 'openai';
      }
    }

    // Fallback to OpenAI if Google Translate failed or isn't available
    if (!translatedText && openAIApiKey) {
      try {
        const openAIResponse = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${openAIApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'gpt-4o-mini',
            messages: [
              {
                role: 'system',
                content: `You are a professional translator with expertise in ${sourceLanguage} and ${targetLanguage}. Translate the following text accurately, preserving meaning, tone, and cultural context. Return only the translated text without any additional commentary.`
              },
              {
                role: 'user',
                content: text
              }
            ],
            max_tokens: 2000,
            temperature: 0.1,
          }),
        });

        if (openAIResponse.ok) {
          const openAIData = await openAIResponse.json();
          translatedText = openAIData.choices[0].message.content;
          translationMethod = 'openai';
          console.log('Translation completed via OpenAI');
        }
      } catch (error) {
        console.log('OpenAI translation failed:', error);
        translationMethod = 'offline';
      }
    }

    // Offline fallback dictionary for common phrases
    if (!translatedText) {
      const offlineTranslations: Record<string, Record<string, string>> = {
        'en': {
          'es': {
            'hello': 'hola',
            'goodbye': 'adiós',
            'thank you': 'gracias',
            'please': 'por favor',
            'yes': 'sí',
            'no': 'no',
            'good morning': 'buenos días',
            'good evening': 'buenas tardes'
          },
          'fr': {
            'hello': 'bonjour',
            'goodbye': 'au revoir',
            'thank you': 'merci',
            'please': 's\'il vous plaît',
            'yes': 'oui',
            'no': 'non',
            'good morning': 'bonjour',
            'good evening': 'bonsoir'
          },
          'de': {
            'hello': 'hallo',
            'goodbye': 'auf wiedersehen',
            'thank you': 'danke',
            'please': 'bitte',
            'yes': 'ja',
            'no': 'nein',
            'good morning': 'guten morgen',
            'good evening': 'guten abend'
          }
        }
      };

      const lowerText = text.toLowerCase();
      const translations = offlineTranslations[sourceLanguage]?.[targetLanguage];
      
      if (translations && translations[lowerText]) {
        translatedText = translations[lowerText];
        translationMethod = 'offline';
        console.log('Translation completed via offline dictionary');
      } else {
        // Final fallback
        translatedText = `[AUTO-TRANSLATED from ${sourceLanguage} to ${targetLanguage}]: ${text}`;
        translationMethod = 'fallback';
        console.log('Using fallback translation');
      }
    }

    return new Response(
      JSON.stringify({ 
        translatedText,
        method: translationMethod,
        sourceLanguage,
        targetLanguage 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error in multilingual-translator function:', error);
    
    // Provide a meaningful fallback translation
    let fallbackText = 'Translation unavailable';
    try {
      const { text, sourceLanguage, targetLanguage } = await req.json().catch(() => ({}));
      if (text) {
        fallbackText = `[AUTO-TRANSLATED from ${sourceLanguage} to ${targetLanguage}]: ${text}`;
      }
    } catch (parseError) {
      console.error('Error parsing request for fallback:', parseError);
    }
    
    return new Response(
      JSON.stringify({ 
        translatedText: fallbackText,
        method: 'error_fallback',
        note: 'Translation service temporarily unavailable'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});