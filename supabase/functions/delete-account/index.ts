import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

// Tables that store user-generated content keyed by user_id but aren't
// covered by an ON DELETE CASCADE foreign key to auth.users - deleting the
// auth user alone would leave these rows orphaned instead of actually
// removing the account's data (required for Apple App Review guideline
// 5.1.1(v): apps offering account creation must offer account deletion).
const USER_DATA_TABLES = [
  'saved_resumes', 'saved_cover_letters', 'saved_linkedin_reports', 'saved_keyword_analyses',
];

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Missing authorization header' }), {
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Identify the caller from their own JWT - never trust a user id passed
    // in the request body, so a user can only ever delete their own account.
    const callerClient = createClient(SUPABASE_URL, Deno.env.get('SUPABASE_ANON_KEY')!, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user }, error: userError } = await callerClient.auth.getUser();
    if (userError || !user) {
      return new Response(JSON.stringify({ error: 'Invalid or expired session' }), {
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const adminClient = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

    for (const table of USER_DATA_TABLES) {
      const { error } = await adminClient.from(table).delete().eq('user_id', user.id);
      if (error) console.error(`Failed to clear ${table} for user ${user.id}:`, error);
    }

    // saved_jobs, saved_colleges, and profiles cascade automatically via
    // their ON DELETE CASCADE foreign key to auth.users.
    const { error: deleteError } = await adminClient.auth.admin.deleteUser(user.id);
    if (deleteError) throw deleteError;

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('delete-account error:', error);
    return new Response(JSON.stringify({ error: (error as Error).message || 'Failed to delete account' }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
