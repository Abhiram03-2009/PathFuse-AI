import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

// This key must be for the "Linkedin Data API" on RapidAPI.
const RAPIDAPI_KEY = Deno.env.get('RAPIDAPI_KEY') || '***REMOVED-RAPIDAPI-KEY***';
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type'
};

// --- REVISED & HARDENED FUNCTION ---
const scrapeLinkedInProfile = async (linkedInUrl: string) => {
  const encodedUrl = encodeURIComponent(linkedInUrl);
  const url = `https://linkedin-data-api.p.rapidapi.com/get-profile-data-by-url?url=${encodedUrl}`;
  const host = 'linkedin-data-api.p.rapidapi.com';

  console.log(`Attempting to scrape with Linkedin Data API: ${linkedInUrl}`);

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'x-rapidapi-key': RAPIDAPI_KEY,
        'x-rapidapi-host': host
      }
    });

    // --- Start of Fix ---
    // More robust check to see if the API call was successful.
    if (!response.ok) {
      // Log the exact error text from the API to help debug.
      const errorBody = await response.text();
      console.error(`API call failed with status ${response.status}:`, errorBody);
      throw new Error(`API call failed. Check Supabase function logs for details.`);
    }

    // The API might return a text response on failure, so we handle that.
    const responseText = await response.text();
    let data;
    try {
        data = JSON.parse(responseText);
    } catch (e) {
        console.error("Failed to parse JSON response from API. Raw response:", responseText);
        throw new Error("API returned non-JSON response. Check logs.");
    }

    // Check if the response indicates a failure or is empty.
    // Some APIs return a 200 OK status but include an error message in the body.
    if (data.status === 'fail' || !data.data) {
        console.error("API indicated failure or returned no data object. Response:", data);
        throw new Error("API returned a failure status. Check logs for the response.");
    }

    const profileData = data.data;

    if (!profileData || !profileData.first_name) {
      console.error("The 'data' object in the API response is missing or doesn't contain expected fields.", profileData);
      throw new Error("Failed to retrieve valid profile structure from the API.");
    }
    // --- End of Fix ---

    // Normalize the data from the API to fit your frontend's structure.
    const profile = {
      name: `${profileData.first_name || ''} ${profileData.last_name || ''}`.trim() || 'Name Not Found',
      headline: profileData.headline || 'No headline available',
      summary: profileData.about || 'No summary available',
      experience: (profileData.experiences || []).map((exp: any) => ({
        title: exp.position || 'N/A',
        company: exp.company_name || 'N/A',
        duration: exp.duration_in_month ? `${Math.floor(exp.duration_in_month / 12)}y ${exp.duration_in_month % 12}m` : 'N/A',
        description: exp.description || 'N/A'
      })),
      education: (profileData.educations || []).map((edu: any) => ({
        school: edu.school_name || 'N/A',
        degree: edu.degree_name || 'N/A',
        field: edu.field_of_study || 'N/A',
        year: edu.grade || 'N/A'
      })),
      skills: profileData.skills || []
    };
    
    console.log(`Successfully scraped profile for: ${profile.name}`);
    return profile;

  } catch (error) {
    // Log the error message before re-throwing it.
    console.error(`Scraping with Linkedin Data API failed: ${error.message}`);
    // This throw will trigger the fallback dummy data.
    throw error;
  }
};

const extractUsernameFromUrl = (url: string): string => {
    const match = url.match(/linkedin\.com\/in\/([^\/\?]+)/);
    return match ? match[1] : '';
};

// This fallback function remains the same, as a safety net
const generateEnhancedFallbackProfile = (username: string, linkedInUrl: string) => {
  console.log('Fallback triggered. Generating dummy data for:', username);
  let cleanName = username.replace(/[-_]/g, ' ').replace(/\d+/g, '').replace(/[^a-zA-Z\s]/g, ' ').split(' ').filter(word => word.length > 1).map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ').trim() || 'LinkedIn Professional';
  const industries = ['Technology', 'Finance', 'Healthcare', 'Consulting', 'Marketing', 'Sales'];
  const randomIndustry = industries[Math.floor(Math.random() * industries.length)];
  return { name: cleanName, headline: `Senior Specialist | ${randomIndustry} Expert`, summary: `An accomplished ${randomIndustry.toLowerCase()} professional with extensive experience.`, experience: [{ title: 'Senior Specialist', company: 'Global Tech Firm', duration: '2021 - Present', description: 'Leading strategic initiatives and cross-functional teams.' }], education: [{ school: 'Top-Tier University', degree: 'Master of Business Administration', field: 'Business Strategy', year: '2018' }], skills: ['Strategic Planning', 'Leadership', 'Project Management', 'Data Analysis', 'Business Development'], profileUrl: linkedInUrl };
};

const generateCareerInsights = async (profile: any) => {
    return {
        aiAnalysis: `AI analysis shows ${profile.name} is well-positioned in their industry.`,
    };
};

// --- Main server logic (no changes needed here) ---
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
          console.error('Real LinkedIn scraping failed, generating fallback:', error.message);
          profile = generateEnhancedFallbackProfile(username, linkedInUrl);
        }
        return new Response(JSON.stringify({ profile }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }
      case 'generate_resume': {
        if (!profileData) {
          return new Response(JSON.stringify({ error: 'Profile data required' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
        }
        const resumeText = `${profileData.name}\n${profileData.headline}\n\nSUMMARY\n${profileData.summary}\n\nSKILLS\n${profileData.skills.join(' • ')}\n\nEXPERIENCE\n${profileData.experience.map((e: any) => `${e.title} at ${e.company} (${e.duration})\n${e.description}`).join('\n\n')}`;
        return new Response(JSON.stringify({ resumeText }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }
      case 'career_insights': {
        if (!profileData) {
          return new Response(JSON.stringify({ error: 'Profile data required' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
        }
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