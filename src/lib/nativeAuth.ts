import { Browser } from '@capacitor/browser';
import { supabase } from '@/integrations/supabase/client';

// Bundle ID / custom URL scheme registered in ios/App/App/Info.plist
// (CFBundleURLTypes) and must also be added as a redirect URL in the
// Supabase dashboard: Authentication > URL Configuration > Redirect URLs.
const NATIVE_REDIRECT_URL = 'com.pathfuseai.app://auth/callback';

// On native platforms, signInWithOAuth can't redirect the whole app the way
// a browser tab does. Instead we ask Supabase for the provider's auth URL,
// open it in an in-app browser (SFSafariViewController on iOS), and let the
// appUrlOpen listener in AuthContext catch the redirect back into the app.
export async function signInWithOAuthNative(provider: 'google' | 'apple') {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo: NATIVE_REDIRECT_URL,
      skipBrowserRedirect: true,
    },
  });

  if (error) {
    return { error };
  }

  if (data?.url) {
    await Browser.open({ url: data.url });
  }

  return { error: null };
}
