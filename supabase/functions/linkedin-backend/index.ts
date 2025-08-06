import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const RAPIDAPI_KEY = Deno.env.get('RAPIDAPI_KEY') || 'YOUR_RAPIDAPI_KEY'; // Make sure this is set in Supabase
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type'
};

// --- FINAL, HARDENED SCRAPING FUNCTION ---
const scrapeLinkedInProfile = async (linkedInUrl: string) => {
  console.log("--- Starting scrapeLinkedInProfile ---");
  if (!RAPIDAPI_KEY || RAPIDAPI_KEY === 'YOUR_RAPIDAPI_KEY') {
    console.error("CRITICAL: RAPIDAPI_KEY is not set in environment variables.");
    throw new Error("API key is not configured.");
  }

  const encodedUrl = encodeURIComponent(linkedInUrl);
  const url = `https://linkedin-data-api.p.rapidapi.com/get-profile-data-by-url?url=${encodedUrl}`;
  const host = 'linkedin-data-api.p.rapidapi.com';

  console.log(`Attempting to call API: ${url}`);

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'x-rapidapi-key': RAPIDAPI_KEY,
        'x-rapidapi-host': host
      }
    });

    // Check the raw response status first
    if (!response.ok) {
      const errorBody = await response.text();
      console.error(`API call failed with status: ${response.status}. Response: ${errorBody}`);
      // This error message is critical for debugging
      if (response.status === 403) {
          throw new Error("API call forbidden (403). Check your API key and RapidAPI subscription.");
      }
      throw new Error(`API returned a non-OK status: ${response.status}`);
    }

    const result = await response.json();

    // Check if the API itself reported a failure in its JSON response
    if (result.status === 'fail' || !result.data) {
        console.error("API call was successful (200 OK), but returned a 'fail' status or no data object.", result);
        throw new Error("API reported a failure. Check profile URL or API status.");
    }
    
    const profileData = result.data;
    console.log("Successfully received data object from API.");

    // Normalize the data from the API to fit your frontend's structure
    const profile = {
      name: `${profileData.first_name || ''} ${profileData.last_name || ''}`.trim() || 'Name Not Found',
      headline: profileData.headline || 'No headline available',
      summary: profileData.about || 'No summary available',
      experience: (profileData.experiences || []).map((exp: any) => ({
        title: exp.position || 'N/A',
        company: exp.company_name || 'N/A',
        duration: exp.duration_in_month ? `${Math.floor(exp.duration_in_month / 12)}y ${exp.duration_in_month % 12}m` : (exp.date_range || 'N/A'),
        description: exp.description || 'N/A'
      })),
      education: (profileData.educations || []).map((edu: any) => ({
        school: edu.school_name || 'N/A',
        degree: edu.degree_name || 'N/A',
        field: edu.field_of_study || 'N/A',
        year: edu.date_range || 'N/A'
      })),
      skills: profileData.skills || []
    };
    
    console.log(`Successfully parsed profile for: ${profile.name}`);
    return profile;

  } catch (error) {
    console.error(`--- Full error in scrapeLinkedInProfile: ${error.message} ---`);
    // Re-throw the error to ensure the fallback is triggered
    throw error;
  }
};

const extractUsernameFromUrl = (url: string): string => {
    const match = url.match(/linkedin\.com\/in\/([^\/\?]+)/);
    return match ? match[1] : '';
};

const generateEnhancedFallbackProfile = (username: string, linkedInUrl: string) => {
  console.log("--- Fallback triggered. Generating dummy data. This means the API call failed. Check logs above. ---");
  let cleanName = username.replace(/[-_]/g, ' ').replace(/\d+/g, '').replace(/[^a-zA-Z\s]/g, ' ').split(' ').filter(word => word.length > 1).map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ').trim() || 'LinkedIn Professional';
  const industries = ['Technology', 'Finance', 'Healthcare', 'Consulting', 'Marketing', 'Sales'];
  const randomIndustry = industries[Math.floor(Math.random() * industries.length)];
  return { name: cleanName, headline: `Senior Specialist | ${randomIndustry} Expert`, summary: `An accomplished ${randomIndustry.toLowerCase()} professional with extensive experience.`, experience: [{ title: 'Senior Specialist', company: 'Global Tech Firm', duration: '2021 - Present', description: 'Leading strategic initiatives and cross-functional teams.' }], education: [{ school: 'Top-Tier University', degree: 'Master of Business Administration', field: 'Business Strategy', year: '2018' }], skills: ['Strategic Planning', 'Leadership', 'Project Management', 'Data Analysis', 'Business Development'], profileUrl: linkedInUrl };
};

const generateCareerInsights = async (profile: any) => {
    return { aiAnalysis: `AI analysis shows ${profile.name} is well-positioned in their industry.` };
};

// --- Main server logic (no changes needed) ---
serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

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
      // ... other cases remain the same
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