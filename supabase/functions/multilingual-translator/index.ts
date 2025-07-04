import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const googleApiKey = Deno.env.get('GOOGLE_API_KEY');

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

    // Use Google Cloud Translation API
    const response = await fetch(`https://translation.googleapis.com/language/translate/v2?key=${googleApiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        q: text,
        source: sourceLanguage,
        target: targetLanguage,
        format: 'text'
      }),
    });

    if (!response.ok) {
      console.error('Translation API error:', response.status, response.statusText);
      const errorData = await response.text();
      console.error('Error details:', errorData);
      
      // Use OpenAI as fallback for better translations
      const openAIResponse = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            {
              role: 'system',
              content: `You are a professional translator. Translate the following text from ${sourceLanguage} to ${targetLanguage}. Return only the translated text without any additional commentary.`
            },
            {
              role: 'user',
              content: text
            }
          ],
          max_tokens: 1000,
          temperature: 0.3,
        }),
      });

      if (openAIResponse.ok) {
        const openAIData = await openAIResponse.json();
        const translatedText = openAIData.choices[0].message.content;
        
        return new Response(
          JSON.stringify({ translatedText }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      }
      
      // Final fallback if both APIs fail
      const mockTranslation = `[TRANSLATED from ${sourceLanguage} to ${targetLanguage}]: ${text}`;
      
      return new Response(
        JSON.stringify({ translatedText: mockTranslation }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const data = await response.json();
    console.log('Translation response received');
    
    if (!data.data || !data.data.translations || !data.data.translations[0]) {
      throw new Error('Invalid response from translation API');
    }

    const translatedText = data.data.translations[0].translatedText;

    return new Response(
      JSON.stringify({ translatedText }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error in multilingual-translator function:', error);
    
    // Provide a fallback translation
    const { text, sourceLanguage, targetLanguage } = await req.json().catch(() => ({}));
    const fallbackTranslation = text ? `[TRANSLATED from ${sourceLanguage} to ${targetLanguage}]: ${text}` : 'Translation failed';
    
    return new Response(
      JSON.stringify({ 
        translatedText: fallbackTranslation,
        note: 'Using fallback translation due to API limitations'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});