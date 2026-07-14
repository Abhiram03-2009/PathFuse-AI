const GROQ_API_KEY = Deno.env.get('GROQ_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  try {
    if (!GROQ_API_KEY) {
      return new Response(JSON.stringify({ error: 'GROQ_API_KEY is not configured' }), {
        status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const incoming = await req.formData();
    const audio = incoming.get('audio');
    if (!audio || !(audio instanceof File)) {
      return new Response(JSON.stringify({ error: 'audio file is required' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const groqForm = new FormData();
    groqForm.append('file', audio, audio.name || 'answer.webm');
    groqForm.append('model', 'whisper-large-v3-turbo');
    groqForm.append('response_format', 'json');

    const response = await fetch('https://api.groq.com/openai/v1/audio/transcriptions', {
      method: 'POST',
      headers: { Authorization: `Bearer ${GROQ_API_KEY}` },
      body: groqForm,
    });

    if (!response.ok) {
      const text = await response.text();
      console.error('Groq transcription error:', response.status, text);
      throw new Error(`Transcription failed: ${response.status}`);
    }

    const data = await response.json();
    return new Response(JSON.stringify({ text: data.text || '' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('speech-to-text error:', error);
    return new Response(JSON.stringify({ error: 'Failed to transcribe audio', details: (error as Error).message }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
