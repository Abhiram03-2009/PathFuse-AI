import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

// This key is for the LinkedIn Scraper API.
// It's crucial to load this from an environment variable for security and flexibility.
const RAPIDAPI_KEY = Deno.env.get('RAPIDAPI_KEY'); // Ensure this environment variable is set

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type'
};

const LINKEDIN_SCRAPER_API_HOST = 'fresh-linkedin-scraper-api.p.rapidapi.com'; // Host for LinkedIn profile scraping

// --- UPDATED LinkedIn Profile Scraper Function ---
const scrapeLinkedInProfile = async (linkedInUrl: string) => {
  console.log("--- Starting LinkedIn Profile Scrape ---");
  console.log(`Attempting to scrape URL: ${linkedInUrl}`);

  if (!RAPIDAPI_KEY || RAPIDAPI_KEY.length < 20) { // Basic check for key existence and minimal length
    console.error("CRITICAL ERROR: RAPIDAPI_KEY is missing or invalid. Please ensure the environment variable is correctly set.");
    throw new Error("API key for LinkedIn profile scraping is not configured or is invalid.");
  }
  console.log(`RAPIDAPI_KEY is set (length: ${RAPIDAPI_KEY.length}).`);

  // --- STEP 1: Resolve the public URL to get the LinkedIn URN ---
  let urn: string;
  try {
    const resolveUrl = `https://${LINKEDIN_SCRAPER_API_HOST}/api/v1/user/resolve?url=${encodeURIComponent(linkedInUrl)}`;
    console.log(`Step 1: Resolving URN for ${linkedInUrl} using URL: ${resolveUrl}`);
    
    const urnResponse = await fetch(resolveUrl, {
      headers: { 
        'x-rapidapi-key': RAPIDAPI_KEY, 
        'x-rapidapi-host': LINKEDIN_SCRAPER_API_HOST 
      }
    });

    console.log(`URN Resolve Response Status: ${urnResponse.status}`);
    if (!urnResponse.ok) {
        const err = await urnResponse.text();
        console.error("URN RESOLVE FAILED. API Response Body:", err);
        throw new Error(`Failed to resolve URN. Status: ${urnResponse.status}. Details: ${err.substring(0, 500)}`); 
    }
    const urnData = await urnResponse.json();
    if (!urnData || !urnData.urn) {
      console.error("URN RESOLVE FAILED: URN not found in response.", urnData);
      throw new Error("Could not find URN in the response. Response data might be malformed or profile inaccessible.");
    }
    urn = urnData.urn;
    console.log(`Step 1 Success: Found URN -> ${urn}`);
  } catch (error) {
    console.error("CRITICAL: Failed during URN resolution. Error details:", error.message);
    throw new Error(`Could not resolve LinkedIn URL to a URN. Please check the URL format and ensure it's a public profile. Error: ${error.message}`);
  }

  // --- STEP 2: Fetch all profile sections in parallel using the URN ---
  try {
    console.log("Step 2: Fetching profile details in parallel.");
    const aboutPromise = fetch(`https://${LINKEDIN_SCRAPER_API_HOST}/api/v1/user/about?urn=${urn}`, { headers: { 'x-rapidapi-key': RAPIDAPI_KEY, 'x-rapidapi-host': LINKEDIN_SCRAPER_API_HOST } });
    const experiencePromise = fetch(`https://${LINKEDIN_SCRAPER_API_HOST}/api/v1/user/experience?urn=${urn}`, { headers: { 'x-rapidapi-key': RAPIDAPI_KEY, 'x-rapidapi-host': LINKEDIN_SCRAPER_API_HOST } });
    const educationPromise = fetch(`https://${LINKEDIN_SCRAPER_API_HOST}/api/v1/user/education?urn=${urn}`, { headers: { 'x-rapidapi-key': RAPIDAPI_KEY, 'x-rapidapi-host': LINKEDIN_SCRAPER_API_HOST } });

    const responses = await Promise.all([aboutPromise, experiencePromise, educationPromise]);

    for (const res of responses) {
      if (!res.ok) {
        const err = await res.text();
        console.error(`One of the detail fetches failed. Status: ${res.status}. Error body: ${err}`);
        throw new Error(`One of the detail fetches failed. Status: ${res.status}. Details: ${err.substring(0, 500)}`);
      }
    }

    const [aboutData, experienceData, educationData] = await Promise.all(responses.map(res => res.json()));
    
    // --- STEP 3: Combine and Normalize the data for the frontend ---
    const profile = {
      name: aboutData.data?.full_name || 'Name Not Found',
      headline: aboutData.data?.headline || 'No headline available',
      summary: aboutData.data?.about || 'No summary available',
      experience: (experienceData.data?.experiences || []).map((exp: any) => ({
        title: exp.position || 'N/A',
        company: exp.company_name || 'N/A',
        duration: exp.duration_in_string || 'N/A',
        description: exp.description || 'N/A'
      })),
      education: (educationData.data?.educations || []).map((edu: any) => ({
        school: edu.school_name || 'N/A',
        degree: edu.degree_name || 'N/A',
        field: edu.field_of_study || 'N/A',
        year: edu.date_range || 'N/A'
      })),
      skills: aboutData.data?.skills || [],
      profileUrl: linkedInUrl 
    };
    
    console.log(`Step 2 Success: Successfully parsed profile for: ${profile.name}`);
    return profile;

  } catch (error) {
    console.error("CRITICAL: Failed during parallel data fetch. Error details:", error.message);
    throw new Error(`Could not fetch profile details using the URN. Error: ${error.message}`);
  }
};

// --- Refined LinkedIn Username Extractor ---
const extractUsernameFromUrl = (url: string): string => {
    // Regex to capture the username from various LinkedIn URL formats
    // Handles:
    // - linkedin.com/in/username/
    // - linkedin.com/in/username
    // - linkedin.com/in/username/?key=value
    // - linkedin.com/mwlite/in/username
    // - linkedin.com/m/in/username
    const match = url.match(/(?:linkedin\.com\/in\/|linkedin\.com\/mwlite\/in\/|linkedin\.com\/m\/in\/)([^\/\?]+)/i);
    return match ? match[1] : '';
};

// --- REMOVED generateEnhancedFallbackProfile function ---
// No fallback, if scraping fails, an error is returned.


// --- The rest of the server remains unchanged, adapted for no fallback ---
const generateCareerInsights = async (profile: any) => ({ aiAnalysis: `AI analysis shows ${profile.name} is well-positioned.` });

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });
  try {
    const { action, linkedInUrl, profileData } = await req.json(); 
    switch (action) {
      case 'analyze_profile': {
        if (!linkedInUrl || !linkedInUrl.includes('linkedin.com')) {
          return new Response(JSON.stringify({ error: 'Valid LinkedIn URL is required' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
        }
        
        let profile;
        try {
          // The username is no longer needed directly here for the scraper,
          // but extract it if you need it for logging or other purposes.
          // const username = extractUsernameFromUrl(linkedInUrl) || 'professional';
          profile = await scrapeLinkedInProfile(linkedInUrl);
          
        } catch (error) {
          console.error("Error during LinkedIn profile analysis:", error.message);
          // If scraping fails, return an error to the client, no fallback.
          return new Response(JSON.stringify({ error: error.message || 'Failed to scrape LinkedIn profile.' }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
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
      // Removed 'search_companies' case as per your instruction to focus on profile scraping
      default:
        return new Response(JSON.stringify({ error: 'Invalid action' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }
  } catch (error) {
    console.error("Unhandled error in server request:", error.message);
    return new Response(JSON.stringify({ error: 'Failed to process request', details: error.message }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});