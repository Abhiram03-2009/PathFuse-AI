
const GROQ_API_KEY = Deno.env.get('GROQ_API_KEY');
// Groq retired llama-3.3-70b-versatile on 2026-08-16; override with the GROQ_MODEL secret if this one is retired too.
const GROQ_MODEL = Deno.env.get('GROQ_MODEL') ?? 'openai/gpt-oss-120b';
// gpt-oss models reason before answering; keep that short so max_tokens is left for the answer.
const REASONING = GROQ_MODEL.startsWith('openai/gpt-oss') ? { reasoning_effort: 'low' } : {};

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const parseResumeData = (resumeText: string) => {
  const text = resumeText.toLowerCase();
  const gpaPatterns = [/gpa[:\s]*(\d+\.?\d*)/i, /grade point average[:\s]*(\d+\.?\d*)/i, /cumulative gpa[:\s]*(\d+\.?\d*)/i];
  let estimatedGPA = null;
  for (const pattern of gpaPatterns) {
    const match = resumeText.match(pattern);
    if (match) { estimatedGPA = parseFloat(match[1]); break; }
  }
  const satMatch = resumeText.match(/sat[:\s]*(\d{3,4})/i);
  const actMatch = resumeText.match(/act[:\s]*(\d{1,2})/i);
  const skillPatterns = [/javascript|js\b/gi, /python/gi, /java\b/gi, /react/gi, /node\.?js/gi, /sql/gi, /aws/gi, /docker/gi, /git/gi, /html/gi, /css/gi, /project management/gi, /leadership/gi];
  const extractedSkills: string[] = [];
  skillPatterns.forEach(p => { const m = resumeText.match(p); if (m) extractedSkills.push(...m); });
  const yrs = text.match(/(\d+)\+?\s*years?\s*(of\s*)?(experience|exp)/);
  let experienceLevel = 'entry';
  if (yrs) { const n = parseInt(yrs[1]); if (n >= 7) experienceLevel = 'senior'; else if (n >= 3) experienceLevel = 'mid'; }
  return {
    estimatedGPA, satScore: satMatch ? parseInt(satMatch[1]) : null, actScore: actMatch ? parseInt(actMatch[1]) : null,
    extractedSkills: [...new Set(extractedSkills)], experienceLevel,
    hasLeadershipExperience: /leader|president|captain|director|manager|head|chief/i.test(resumeText),
    hasVolunteerWork: /volunteer|community service|charity|non-profit/i.test(resumeText),
    hasResearchExperience: /research|publication|study|investigation|thesis/i.test(resumeText),
    hasWorkExperience: /intern|job|work|employment|position|company/i.test(resumeText),
    hasAwards: /award|honor|recognition|achievement|scholarship|dean's list/i.test(resumeText),
    hasCertifications: /certified|certification|license|credential/i.test(resumeText),
  };
};

async function analyzeWithGroq(resumeText: string, analysisType: string): Promise<string | null> {
  if (!GROQ_API_KEY) return null;
  const isUniversity = analysisType === 'university';
  const systemPrompt = isUniversity
    ? 'You are an expert college admissions counselor. Analyze this resume/profile for university applications. Cover: academic achievements, extracurricular leadership, unique qualities, improvement areas, and actionable recommendations. Be specific and encouraging.'
    : 'You are an expert career counselor. Analyze this resume comprehensively: strengths, improvement areas, quantified achievement suggestions, keyword gaps, and career recommendations. Be specific and actionable.';
  try {
    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${GROQ_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: GROQ_MODEL,
        ...REASONING,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `Please analyze this resume:\n\n${resumeText.substring(0, 4000)}` },
        ],
        max_tokens: 2500,
      }),
    });
    if (!res.ok) { console.error('Groq resume-analyzer error:', res.status); return null; }
    const data = await res.json();
    return data?.choices?.[0]?.message?.content || null;
  } catch (e) {
    console.error('Groq failed:', e);
    return null;
  }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });
  try {
    const { resumeText, analysisType = 'university' } = await req.json();
    if (!resumeText || resumeText.trim().length < 50) {
      return new Response(JSON.stringify({ error: 'Resume text is required (min 50 characters)' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    const extractedData = parseResumeData(resumeText);
    const aiAnalysis = await analyzeWithGroq(resumeText, analysisType);
    const analysisMethod = aiAnalysis ? 'groq' : 'basic';
    const analysis = aiAnalysis || (analysisType === 'university'
      ? `UNIVERSITY ADMISSIONS PROFILE ANALYSIS\n\nACADEMIC PROFILE:\n${extractedData.estimatedGPA ? `• GPA: ${extractedData.estimatedGPA}/4.0` : '• GPA: Not found'}\n\nSTRENGTHS:\n${extractedData.hasLeadershipExperience ? '✓ Leadership experience' : ''}\n${extractedData.hasVolunteerWork ? '✓ Volunteer work' : ''}\n${extractedData.hasAwards ? '✓ Awards/honors' : ''}\n\nRECOMMENDATIONS:\n1. Strengthen GPA and test scores\n2. Add leadership roles\n3. Develop a compelling personal narrative`
      : `PROFESSIONAL RESUME ANALYSIS\n\nPROFILE:\n• Experience Level: ${extractedData.experienceLevel}\n• Key Skills: ${extractedData.extractedSkills.slice(0, 5).join(', ')}\n\nIMPROVEMENTS:\n1. Quantify achievements with numbers\n2. Add industry keywords\n3. Strengthen professional summary`
    );
    return new Response(JSON.stringify({ analysis, extractedData, analysisType, analysisMethod, timestamp: new Date().toISOString() }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('resume-analyzer error:', error);
    return new Response(JSON.stringify({ error: 'Failed to analyze resume', details: (error as Error).message }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
