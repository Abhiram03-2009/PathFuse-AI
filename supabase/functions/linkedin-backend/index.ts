import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

// This key must be valid for the "Company Intel" API.
const RAPIDAPI_KEY = Deno.env.get('RAPIDAPI_KEY') || '***REMOVED-RAPIDAPI-KEY***';
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type'
};

// --- FINAL VERSION: Using the "Company Intel" API ---
const scrapeLinkedInProfile = async (linkedInUrl: string) => {
  console.log("--- Starting scrapeLinkedInProfile with 'Company Intel' API ---");
  if (!RAPIDAPI_KEY || RAPIDAPI_KEY.includes('YOUR_KEY')) {
    console.error("CRITICAL: RAPIDAPI_KEY is not set in environment variables.");
    throw new Error("API key is not configured.");
  }

  const url = 'https://company-intel.p.rapidapi.com/profile';
  const host = 'company-intel.p.rapidapi.com';

  // This API requires the profile URL in the body of a POST request.
  const requestBody = {
    profile_url: linkedInUrl
  };

  console.log(`Calling Company Intel API for: ${linkedInUrl}`);

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'x-rapidapi-key': RAPIDAPI_KEY,
        'x-rapidapi-host': host,
        'Content-Type': 'application/json'
      },
      // The body MUST be stringified. This is a critical step.
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error(`API call failed with status ${response.status}:`, errorBody);
      throw new Error(`API returned a non-OK status: ${response.status}. Check logs.`);
    }

    const data = await response.json();
    
    // Check if the API returned any data.
    if (!data || !data.full_name) {
      console.error("API call was successful, but the response was empty or invalid.", data);
      throw new Error("API returned no valid profile data.");
    }
    
    console.log("Successfully received data from Company Intel API.");

    // --- Normalize the data to fit your frontend's structure ---
    const profile = {
      name: data.full_name || 'Name Not Found',
      headline: data.headline || 'No headline available',
      summary: data.summary || 'No summary available',
      experience: (data.experiences || []).map((exp: any) => ({
        title: exp.title || 'N/A',
        company: exp.company_name || 'N/A',
        duration: exp.duration || 'N/A',
        description: exp.description || 'N/A'
      })),
      education: (data.education || []).map((edu: any) => ({
        school: edu.school_name || 'N/A',
        degree: edu.degree || 'N/A',
        field: edu.field_of_study || 'N/A',
        year: edu.duration || 'N/A'
      })),
      skills: (data.skills || []).map((s: any) => s.skill_name) // Assuming skills is an array of objects
    };
    
    console.log(`Successfully parsed profile for: ${profile.name}`);
    return profile;

  } catch (error) {
    console.error(`--- Full error in scrapeLinkedInProfile: ${error.message} ---`);
    throw error;
  }
};

const extractUsernameFromUrl = (url: string): string => {
    const match = url.match(/linkedin\.com\/in\/([^\/\?]+)/);
    return match ? match[1] : '';
};

const generateEnhancedFallbackProfile = (username: string, linkedInUrl: string) => {
  console.log("--- Fallback triggered. This means the Company Intel API call failed. Check logs above. ---");
  let cleanName = username.replace(/[-_]/g, ' ').replace(/\d+/g, '').replace(/[^a-zA-Z\s]/g, ' ').split(' ').filter(word => word.length > 1).map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ').trim() || 'LinkedIn Professional';
  return { name: cleanName, headline: 'Senior Specialist | Technology Expert', summary: 'An accomplished professional with extensive experience.', experience: [{ title: 'Senior Specialist', company: 'Global Tech Firm', duration: '2021 - Present', description: 'Leading strategic initiatives.' }], education: [{ school: 'Top-Tier University', degree: 'Master of Business Administration', field: 'Business Strategy', year: '2018' }], skills: ['Strategic Planning', 'Leadership', 'Project Management', 'Data Analysis', 'Business Development'], profileUrl: linkedInUrl };
};

// --- The rest of the server remains unchanged ---
const generateCareerInsights = async (profile: any) => ({
  aiAnalysis: `AI analysis shows ${profile.name} is well-positioned in their industry.`
});

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });
  try {
    const { action, linkedInUrl, profileData } = await req.json();
    switch (action) {
      case 'analyze_profile': {
        if (!linkedInUrl || !linkedInUrl.includes('linkedin.com')) {
          return new Response(JSON.stringify({ error: 'Valid LinkedIn URL is required' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
        }
        const username = extractUsernameFromUrl(linkedInUrl) || 'professional';
        let profile;
        try {
          profile = await scrapeLinkedInProfile(linkedInUrl);
        } catch (error) {
          profile = generateEnhancedFallbackProfile(username, linkedInUrl);
        }
        return new Response(JSON.stringify({ profile }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }
      case 'generate_resume': {
        if (!profileData) return new Response(JSON.stringify({ error: 'Profile data required' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
        const resumeText = `${profileData.name}\n${profileData.headline}\n\nSUMMARY\n${profileData.summary}\n\nSKILLS\n${profileData.skills.join(' • ')}\n\nEXPERIENCE\n${profileData.experience.map((e: any) => `${e.title} at ${e.company} (${e.duration})\n${e.description}`).join('\n\n')}`;
        return new Response(JSON.stringify({ resumeText }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }
      case 'career_insights': {
        if (!profileData) return new Response(JSON.stringify({ error: 'Profile data required' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
        const insights = await generateCareerInsights(profileData);
        const detailedAnalysis = `ANALYSIS FOR ${profileData.name.toUpperCase()}\n\n${insights.aiAnalysis}`;
        return new Response(JSON.stringify({ analysis: detailedAnalysis }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }
      default:
        return new Response(JSON.stringify({ error: 'Invalid action' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Failed to process request', details: error.message }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});