
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

    const { message, history, mode, role: jobRole, interviewType } = await req.json();
    if (!message || typeof message !== 'string') {
      return new Response(JSON.stringify({ error: 'Message is required' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const systemPrompt = mode === 'interview'
      ? `You are conducting a ${interviewType || 'mixed behavioral and technical'} mock interview for a "${jobRole || 'the role the candidate specified'}" position. Ask exactly ONE interview question at a time - never more than one question per turn. After the candidate answers, briefly critique their answer (2-3 sentences: what was strong, what to improve) then ask the next question. Keep the interviewer persona throughout, be realistic and professionally challenging but supportive. Do not use markdown headers or bullet lists - respond conversationally like a real interviewer speaking out loud.`
      : 'You are a professional AI Career Coach. Provide expert, specific, actionable advice on resumes, cover letters, interviews, salary negotiation, job searching, career transitions, and professional development. Keep responses concise yet comprehensive, and use markdown when helpful.';

    const messages = [
      { role: 'system', content: systemPrompt },
      ...(Array.isArray(history) ? history.slice(-10) : []),
      { role: 'user', content: message },
    ];

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages,
        max_tokens: 1024,
      }),
    });

    if (!response.ok) {
      const text = await response.text();
      console.error('Groq error:', response.status, text);
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: 'Rate limit reached. Please try again in a moment.' }), {
          status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      throw new Error(`Groq error: ${response.status} ${text.slice(0, 200)}`);
    }

    const data = await response.json();
    const reply = data?.choices?.[0]?.message?.content;
    if (!reply) throw new Error('Empty response from AI');

    return new Response(JSON.stringify({ reply }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('chat-gpt error:', error);
    return new Response(JSON.stringify({ error: 'Failed to get AI response', details: (error as Error).message }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
