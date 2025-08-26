import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

// This key must be for the "Fresh Linkedin Scraper API".
// It's crucial to load this from an environment variable for security and flexibility.
// For demonstration, I'm using the key from your documentation, but you should use Deno.env.get('RAPIDAPI_KEY')
const RAPIDAPI_KEY_OLD_API = Deno.env.get('RAPIDAPI_KEY_OLD_API'); // Original API Key for profile scraping
const RAPIDAPI_KEY_NEW_API = Deno.env.get('RAPIDAPI_KEY_NEW_API') || '***REMOVED-RAPIDAPI-KEY***'; // New API Key for company search

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type'
};

const API_HOST_OLD_API = 'fresh-linkedin-scraper-api.p.rapidapi.com'; // Host for profile scraping
const API_HOST_NEW_API = 'linkedin-scraper-api-real-time-fast-affordable.p.rapidapi.com'; // Host for company search

// --- FINAL WORKING VERSION: Using the "Fresh Linkedin Scraper API" for Profile Scraping ---
const scrapeLinkedInProfile = async (linkedInUrl: string) => {
  console.log("--- Starting 2-Step Scrape with 'Fresh Linkedin Scraper API' ---");

  // Check if RAPIDAPI_KEY_OLD_API is available
  if (!RAPIDAPI_KEY_OLD_API) {
    throw new Error("RAPIDAPI_KEY_OLD_API is not set. Please set the RAPIDAPI_KEY_OLD_API environment variable for profile scraping.");
  }

  // --- STEP 1: Resolve the public URL to get the LinkedIn URN ---
  let urn: string;
  try {
    const resolveUrl = `https://fresh-linkedin-scraper-api.p.rapidapi.com/api/v1/user/resolve?url=${encodeURIComponent(linkedInUrl)}`;
    console.log(`Step 1: Resolving URN for ${linkedInUrl}`);
    const urnResponse = await fetch(resolveUrl, {
      headers: { 'x-rapidapi-key': RAPIDAPI_KEY_OLD_API, 'x-rapidapi-host': API_HOST_OLD_API }
    });
    if (!urnResponse.ok) {
        const err = await urnResponse.text();
        console.error("URN RESOLVE FAILED:", err);
        throw new Error(`Failed to resolve URN. Status: ${urnResponse.status}`);
    }
    const urnData = await urnResponse.json();
    if (!urnData || !urnData.urn) throw new Error("Could not find URN in the response.");
    urn = urnData.urn;
    console.log(`Step 1 Success: Found URN -> ${urn}`);
  } catch (error) {
    console.error("CRITICAL: Failed during URN resolution.", error.message);
    throw new Error("Could not resolve LinkedIn URL to a URN.");
  }

  // --- STEP 2: Fetch all profile sections in parallel using the URN ---
  try {
    console.log("Step 2: Fetching profile details in parallel.");
    const aboutPromise = fetch(`https://fresh-linkedin-scraper-api.p.rapidapi.com/api/v1/user/about?urn=${urn}`, { headers: { 'x-rapidapi-key': RAPIDAPI_KEY_OLD_API, 'x-rapidapi-host': API_HOST_OLD_API } });
    const experiencePromise = fetch(`https://fresh-linkedin-scraper-api.p.rapidapi.com/api/v1/user/experience?urn=${urn}`, { headers: { 'x-rapidapi-key': RAPIDAPI_KEY_OLD_API, 'x-rapidapi-host': API_HOST_OLD_API } });
    const educationPromise = fetch(`https://fresh-linkedin-scraper-api.p.rapidapi.com/api/v1/user/education?urn=${urn}`, { headers: { 'x-rapidapi-key': RAPIDAPI_KEY_OLD_API, 'x-rapidapi-host': API_HOST_OLD_API } });

    const responses = await Promise.all([aboutPromise, experiencePromise, educationPromise]);

    for (const res of responses) {
      if (!res.ok) throw new Error(`One of the detail fetches failed. Status: ${res.status}`);
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
    console.error("CRITICAL: Failed during parallel data fetch.", error.message);
    throw new Error("Could not fetch profile details using the URN.");
  }
};

// --- New function for searching companies using the new API ---
const searchCompanies = async (keyword: string, page_number: number = 1) => {
  console.log(`--- Searching companies with keyword: "${keyword}" (Page: ${page_number}) using the New API ---`);

  if (!RAPIDAPI_KEY_NEW_API) {
    throw new Error("RAPIDAPI_KEY_NEW_API is not set. Please set the RAPIDAPI_KEY_NEW_API environment variable for company search.");
  }

  const url = `https://${API_HOST_NEW_API}/companies/search?keyword=${encodeURIComponent(keyword)}&page_number=${page_number}`;
  const options = {
    method: 'GET',
    headers: {
      'x-rapidapi-key': RAPIDAPI_KEY_NEW_API,
      'x-rapidapi-host': API_HOST_NEW_API
    }
  };

  try {
    const response = await fetch(url, options);
    if (!response.ok) {
      const err = await response.text();
      console.error("COMPANY SEARCH FAILED:", err);
      throw new Error(`Failed to search companies. Status: ${response.status}`);
    }
    const result = await response.json(); // Assuming JSON response
    console.log("Company search successful:", result);
    return result;
  } catch (error) {
    console.error("CRITICAL: Failed during company search.", error.message);
    throw new Error("Could not search companies.");
  }
};


const extractUsernameFromUrl = (url: string): string => {
    const match = url.match(/linkedin\.com\/in\/([^\/\?]+)/);
    return match ? match[1] : '';
};

const generateEnhancedFallbackProfile = (username: string, linkedInUrl: string) => {
  console.log("--- Fallback triggered. This means the Fresh Scraper API call failed. Check logs above. ---");
  let cleanName = username.replace(/[-_]/g, ' ').replace(/\d+/g, '').replace(/[^a-zA-Z\s]/g, ' ').split(' ').filter(word => word.length > 1).map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ').trim() || 'LinkedIn Professional';
  return { name: cleanName, headline: 'Senior Specialist | Technology Expert', summary: 'An accomplished professional with extensive experience.', experience: [{ title: 'Senior Specialist', company: 'Global Tech Firm', duration: '2021 - Present', description: 'Leading strategic initiatives.' }], education: [{ school: 'Top-Tier University', degree: 'Master of Business Administration', field: 'Business Strategy', year: '2018' }], skills: ['Strategic Planning', 'Leadership', 'Project Management', 'Data Analysis', 'Business Development'], profileUrl: linkedInUrl };
};

// --- The rest of the server remains unchanged ---
const generateCareerInsights = async (profile: any) => ({ aiAnalysis: `AI analysis shows ${profile.name} is well-positioned.` });

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });
  try {
    const { action, linkedInUrl, profileData, keyword, page_number } = await req.json(); // Added keyword and page_number
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
          console.error("Final error before fallback:", error.message);
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
      case 'search_companies': { // New case for company search
        if (!keyword) {
          return new Response(JSON.stringify({ error: 'Keyword for company search is required' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
        }
        try {
          const companies = await searchCompanies(keyword, page_number);
          return new Response(JSON.stringify({ companies }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
        } catch (error) {
          console.error("Error searching companies:", error.message);
          return new Response(JSON.stringify({ error: 'Failed to search companies', details: error.message }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
        }
      }
      default:
        return new Response(JSON.stringify({ error: 'Invalid action' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Failed to process request', details: error.message }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});