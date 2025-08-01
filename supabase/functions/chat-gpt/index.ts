import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

// Using Hugging Face API (free alternative to OpenAI)
const huggingFaceApiKey = Deno.env.get('HUGGINGFACE_API_KEY') || 'hf_demo_key';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*', // Allows all origins, you might want to restrict this for production
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

    // Use Hugging Face Inference API (free alternative)
    const response = await fetch('https://api-inference.huggingface.co/models/microsoft/DialoGPT-large', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${huggingFaceApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        inputs: `Career Coach: ${message}`,
        parameters: {
          max_length: 500,
          temperature: 0.7,
          do_sample: true
        }
      }),
    });

    // Check for errors from Hugging Face API
    if (!response.ok) {
      console.error('Hugging Face API error:', response.status, response.statusText);
      const errorData = await response.text();
      console.error('Error details:', errorData);
      throw new Error(`Hugging Face API error: ${response.status}`);
    }

    const data = await response.json();
    console.log('Hugging Face response received');
    
    // Handle Hugging Face response format
    let reply = '';
    if (Array.isArray(data) && data[0] && data[0].generated_text) {
      reply = data[0].generated_text;
    } else if (data.generated_text) {
      reply = data.generated_text;
    } else {
      throw new Error('Invalid response from Hugging Face');
    }

    // Clean up the response
    reply = reply.replace(`Career Coach: ${message}`, '').trim();
    if (!reply) {
      reply = "I'm here to help with your career questions. Could you please provide more specific details about what you'd like assistance with?";
    }

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
