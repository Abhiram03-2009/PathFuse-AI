import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

// API keys for resume analysis
const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY') || '';
const RAPIDAPI_KEY = Deno.env.get('RAPIDAPI_KEY') || '***REMOVED-RAPIDAPI-KEY***';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Enhanced resume parsing function
const parseResumeData = (resumeText: string, analysisType: string) => {
  const text = resumeText.toLowerCase();
  
  // Extract GPA with multiple patterns
  const gpaPatterns = [
    /gpa[:\s]*(\d+\.?\d*)/i,
    /grade point average[:\s]*(\d+\.?\d*)/i,
    /cumulative gpa[:\s]*(\d+\.?\d*)/i,
    /overall gpa[:\s]*(\d+\.?\d*)/i
  ];
  
  let estimatedGPA = null;
  for (const pattern of gpaPatterns) {
    const match = resumeText.match(pattern);
    if (match) {
      estimatedGPA = parseFloat(match[1]);
      break;
    }
  }
  
  // Extract test scores
  const satMatch = resumeText.match(/sat[:\s]*(\d{3,4})/i);
  const actMatch = resumeText.match(/act[:\s]*(\d{1,2})/i);
  const greMatch = resumeText.match(/gre[:\s]*(\d{3,4})/i);
  const gmatMatch = resumeText.match(/gmat[:\s]*(\d{3,4})/i);
  
  // Extract skills
  const skillPatterns = [
    /javascript|js\b/gi, /python/gi, /java\b/gi, /react/gi, /node\.?js/gi,
    /sql/gi, /aws/gi, /docker/gi, /git/gi, /html/gi, /css/gi,
    /project management/gi, /leadership/gi, /communication/gi, /teamwork/gi
  ];
  
  const extractedSkills = [];
  skillPatterns.forEach(pattern => {
    const matches = resumeText.match(pattern);
    if (matches) {
      extractedSkills.push(...matches);
    }
  });
  
  // Analyze experience level
  const experienceYears = text.match(/(\d+)\+?\s*years?\s*(of\s*)?(experience|exp)/);
  let experienceLevel = 'entry';
  if (experienceYears) {
    const years = parseInt(experienceYears[1]);
    if (years >= 7) experienceLevel = 'senior';
    else if (years >= 3) experienceLevel = 'mid';
  }
  
  return {
    estimatedGPA,
    satScore: satMatch ? parseInt(satMatch[1]) : null,
    actScore: actMatch ? parseInt(actMatch[1]) : null,
    greScore: greMatch ? parseInt(greMatch[1]) : null,
    gmatScore: gmatMatch ? parseInt(gmatMatch[1]) : null,
    extractedSkills: [...new Set(extractedSkills)],
    experienceLevel,
    hasLeadershipExperience: /leader|president|captain|director|manager|head|chief/i.test(resumeText),
    hasVolunteerWork: /volunteer|community service|charity|non-profit/i.test(resumeText),
    hasResearchExperience: /research|publication|study|investigation|thesis/i.test(resumeText),
    hasWorkExperience: /intern|job|work|employment|position|company/i.test(resumeText),
    hasSportsExperience: /sport|athletic|team|varsity|competition|captain/i.test(resumeText),
    hasAwards: /award|honor|recognition|achievement|scholarship|dean's list/i.test(resumeText),
    hasInternships: /intern|internship|co-op|work study/i.test(resumeText),
    hasCertifications: /certified|certification|license|credential/i.test(resumeText)
  };
};

serve(async (req) => {
  console.log('Resume analyzer function called');
  
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { resumeText, analysisType = 'university' } = await req.json();
    console.log('Resume analysis request:', { 
      analysisType, 
      textLength: resumeText?.length 
    });

    if (!resumeText || resumeText.trim().length < 50) {
      return new Response(
        JSON.stringify({ error: 'Resume text is required and must be at least 50 characters' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Parse resume data first
    const extractedData = parseResumeData(resumeText, analysisType);
    console.log('Extracted data:', extractedData);

    let analysis = '';
    let analysisMethod = 'basic';

    // Try OpenAI for enhanced analysis
    if (OPENAI_API_KEY) {
      try {
        let systemPrompt = '';
        if (analysisType === 'university') {
          systemPrompt = `You are an expert college admissions counselor. Analyze this resume/profile and provide detailed insights for university applications. Focus on:

1. Academic achievements and potential
2. Extracurricular leadership and impact
3. Unique qualities and experiences
4. Areas for improvement before applications
5. Recommendations for strengthening the profile

Provide specific, actionable advice for university admissions success.`;
        } else {
          systemPrompt = `You are an expert career counselor. Analyze this resume and provide comprehensive professional insights including strengths, improvement areas, and career recommendations.`;
        }

        const response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${OPENAI_API_KEY}`,
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
                content: `Please analyze this resume:\n\n${resumeText.substring(0, 3000)}`
              }
            ],
            max_tokens: 1500,
            temperature: 0.3,
          }),
        });

        if (response.ok) {
          const data = await response.json();
          if (data.choices && data.choices[0] && data.choices[0].message) {
            analysis = data.choices[0].message.content;
            analysisMethod = 'openai';
            console.log('OpenAI analysis completed successfully');
          }
        }
      } catch (error) {
        console.error('OpenAI analysis failed:', error);
      }
    }

    // Fallback analysis if OpenAI is not available
    if (!analysis) {
      if (analysisType === 'university') {
        analysis = `UNIVERSITY ADMISSIONS PROFILE ANALYSIS

ACADEMIC PROFILE SUMMARY:
${extractedData.estimatedGPA ? `• Estimated GPA: ${extractedData.estimatedGPA}/4.0` : '• GPA: Not specified in resume'}
${extractedData.satScore ? `• SAT Score: ${extractedData.satScore}` : ''}
${extractedData.actScore ? `• ACT Score: ${extractedData.actScore}` : ''}

EXTRACURRICULAR STRENGTHS:
${extractedData.hasLeadershipExperience ? '✓ Leadership experience demonstrated' : '• Consider adding leadership roles'}
${extractedData.hasVolunteerWork ? '✓ Community service involvement' : '• Add volunteer work to strengthen application'}
${extractedData.hasSportsExperience ? '✓ Athletic participation' : ''}
${extractedData.hasResearchExperience ? '✓ Research experience' : ''}
${extractedData.hasAwards ? '✓ Academic/personal achievements' : ''}

RECOMMENDATIONS FOR UNIVERSITY APPLICATIONS:
1. ${extractedData.estimatedGPA && extractedData.estimatedGPA >= 3.7 ? 'Strong GPA - highlight academic excellence' : 'Focus on improving GPA and highlighting upward trend'}
2. ${extractedData.hasLeadershipExperience ? 'Emphasize leadership impact in essays' : 'Seek leadership opportunities in remaining time'}
3. ${extractedData.hasVolunteerWork ? 'Showcase community service commitment' : 'Add meaningful volunteer work to demonstrate service'}
4. Develop compelling personal narrative connecting experiences to intended major
5. Request strong recommendation letters from teachers who know you well

UNIVERSITY MATCH RECOMMENDATIONS:
• Reach Schools: Top 20 universities (if GPA 3.8+ and strong test scores)
• Target Schools: Top 50 universities (good fit for your profile)
• Safety Schools: Regional universities with strong programs in your field`;
      } else {
        analysis = `PROFESSIONAL RESUME ANALYSIS

CAREER PROFILE SUMMARY:
• Experience Level: ${extractedData.experienceLevel.charAt(0).toUpperCase() + extractedData.experienceLevel.slice(1)}
• Key Skills: ${extractedData.extractedSkills.slice(0, 5).join(', ')}
• Professional Strengths: ${extractedData.hasLeadershipExperience ? 'Leadership, ' : ''}${extractedData.hasWorkExperience ? 'Work Experience, ' : ''}${extractedData.hasCertifications ? 'Certifications' : 'Technical Skills'}

RESUME STRENGTHS:
${extractedData.hasWorkExperience ? '✓ Relevant work experience' : ''}
${extractedData.hasLeadershipExperience ? '✓ Leadership capabilities' : ''}
${extractedData.hasCertifications ? '✓ Professional certifications' : ''}
${extractedData.extractedSkills.length > 5 ? '✓ Diverse skill set' : ''}

IMPROVEMENT RECOMMENDATIONS:
1. Add quantified achievements (e.g., "increased sales by 25%")
2. Include relevant keywords for your target industry
3. Strengthen professional summary with value proposition
4. Add technical skills relevant to your field
5. Include professional development and continuous learning`;
      }
      
      analysisMethod = 'basic';
    }

    return new Response(
      JSON.stringify({ 
        analysis,
        extractedData,
        analysisType,
        analysisMethod,
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
        details: error.message,
        timestamp: new Date().toISOString()
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});