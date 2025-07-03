import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  console.log('Resume analyzer function called');
  
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  if (!openAIApiKey) {
    console.error('OpenAI API key not found');
    return new Response(
      JSON.stringify({ error: 'OpenAI API key not configured' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }

  try {
    const { resumeText, analysisType = 'university' } = await req.json();
    console.log('Resume analysis request:', { analysisType, textLength: resumeText?.length });

    if (!resumeText) {
      return new Response(
        JSON.stringify({ error: 'Resume text is required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    let systemPrompt = '';
    if (analysisType === 'university') {
      systemPrompt = `You are an expert college admissions counselor. Analyze the provided resume/profile and extract relevant academic and extracurricular information that would be useful for university admissions predictions. Focus on:

1. Academic achievements and GPA indicators
2. Standardized test scores if mentioned
3. Extracurricular activities and leadership roles
4. Volunteer work and community service
5. Special talents, awards, or recognitions
6. Work experience and internships
7. Research projects or publications
8. Athletic achievements
9. Technical skills and certifications

Provide a structured analysis with recommendations for university applications.`;
    } else {
      systemPrompt = `You are an expert career counselor and resume analyst. Analyze the provided resume and provide detailed insights about the candidate's professional profile, including strengths, areas for improvement, and career recommendations.`;
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
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
            content: systemPrompt
          },
          {
            role: 'user',
            content: `Please analyze this resume/profile:\n\n${resumeText}`
          }
        ],
        max_tokens: 1500,
        temperature: 0.3,
      }),
    });

    if (!response.ok) {
      console.error('OpenAI API error:', response.status, response.statusText);
      const errorData = await response.text();
      console.error('Error details:', errorData);
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    console.log('OpenAI analysis response received');
    
    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      throw new Error('Invalid response from OpenAI');
    }

    const analysis = data.choices[0].message.content;

    // Extract key metrics for university prediction if applicable
    let extractedData = null;
    if (analysisType === 'university') {
      // Try to extract numerical data from the resume
      const gpaMatch = resumeText.match(/gpa[:\s]*(\d+\.?\d*)/i);
      const satMatch = resumeText.match(/sat[:\s]*(\d{3,4})/i);
      const actMatch = resumeText.match(/act[:\s]*(\d{1,2})/i);
      
      extractedData = {
        estimatedGPA: gpaMatch ? parseFloat(gpaMatch[1]) : null,
        satScore: satMatch ? parseInt(satMatch[1]) : null,
        actScore: actMatch ? parseInt(actMatch[1]) : null,
        hasLeadershipExperience: /leader|president|captain|director|manager/i.test(resumeText),
        hasVolunteerWork: /volunteer|community service|charity/i.test(resumeText),
        hasResearchExperience: /research|publication|study|investigation/i.test(resumeText),
        hasWorkExperience: /intern|job|work|employment|position/i.test(resumeText),
        hasSportsExperience: /sport|athletic|team|varsity|competition/i.test(resumeText),
        hasAwards: /award|honor|recognition|achievement|scholarship/i.test(resumeText)
      };
    }

    return new Response(
      JSON.stringify({ 
        analysis,
        extractedData,
        analysisType,
        timestamp: new Date().toISOString()
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error in resume-analyzer function:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Failed to analyze resume',
        details: error.message 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});