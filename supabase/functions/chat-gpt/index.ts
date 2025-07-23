
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

// Using Groq API as a free alternative to OpenAI
const groqApiKey = Deno.env.get('GROQ_API_KEY') || 'gsk_demo_key_for_testing';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  console.log('Chat GPT function called');
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }


  try {
    const { message } = await req.json();
    console.log('Received message:', message);

    if (!message) {
      return new Response(
        JSON.stringify({ error: 'Message is required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Use Groq API (free alternative with Llama models)
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${groqApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.1-8b-instant',
        messages: [
          {
            role: 'system',
            content: 'You are a professional AI Career Coach. Provide expert guidance on resumes, cover letters, interviews, salary negotiation, job searching, career transitions, and professional development. Give specific, actionable advice tailored to each user\'s situation. Keep responses concise yet comprehensive.'
          },
          {
            role: 'user',
            content: message
          }
        ],
        max_tokens: 1000,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      console.error('Groq API error:', response.status, response.statusText);
      const errorData = await response.text();
      console.error('Error details:', errorData);
      throw new Error(`Groq API error: ${response.status}`);
    }

    const data = await response.json();
    console.log('Groq response received');
    
    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      throw new Error('Invalid response from Groq');
    }

    const reply = data.choices[0].message.content;

    return new Response(
      JSON.stringify({ reply }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error in chat-gpt function:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Failed to get AI response',
        details: error.message 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
