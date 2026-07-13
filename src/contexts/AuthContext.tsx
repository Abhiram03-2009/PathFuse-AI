
import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { Capacitor } from '@capacitor/core';
import { App as CapacitorApp, type URLOpenListenerEvent } from '@capacitor/app';
import { Browser } from '@capacitor/browser';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface Profile {
  id: string;
  full_name: string | null;
  email: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  loading: boolean;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<Profile>) => Promise<{ error: any }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching profile:', error);
        return;
      }
      
      setProfile(data);
    } catch (error) {
      console.error('Error in fetchProfile:', error);
    }
  };

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          setTimeout(() => {
            fetchProfile(session.user.id);
          }, 0);
        } else {
          setProfile(null);
        }
        
        setLoading(false);
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);

      if (session?.user) {
        fetchProfile(session.user.id);
      }

      setLoading(false);
    });

    // On native iOS/Android, OAuth completes in an in-app browser (see
    // signInWithOAuthNative below) and Supabase redirects back to this app
    // via a custom URL scheme instead of a normal web redirect. Catch that
    // redirect here and exchange the PKCE code it carries for a session.
    let urlListenerHandle: { remove: () => void } | undefined;
    // appUrlOpen can fire more than once for a single redirect on iOS. A
    // PKCE code/flow state is single-use server-side, so processing it twice
    // makes the second attempt fail with "invalid flow state" even though
    // the first one succeeded - track the last URL we've handled to guard
    // against that.
    let lastHandledUrl: string | null = null;
    if (Capacitor.isNativePlatform()) {
      CapacitorApp.addListener('appUrlOpen', async ({ url }: URLOpenListenerEvent) => {
        if (!url.includes('auth/callback')) return;
        if (url === lastHandledUrl) return;
        lastHandledUrl = url;

        await Browser.close().catch(() => {});

        // TEMPORARY diagnostic: show exactly what the callback URL looks
        // like, since there's no way to see console output on a TestFlight
        // build without a Mac attached. Remove once the flow-state issue is
        // resolved - this briefly displays a one-time auth code on screen.
        const params = new URL(url).searchParams;
        toast({
          title: 'OAuth callback received',
          description: `has code: ${params.has('code')}, has error: ${params.has('error')}, query: ${new URL(url).search.slice(0, 180)}`,
        });

        // The provider (or Supabase itself) can redirect back with an error
        // instead of a code - e.g. misconfigured OAuth credentials on the
        // Supabase/provider side. Surface it instead of failing silently,
        // since there's no way to see console.error output on a TestFlight
        // build without a Mac attached.
        const callbackError = params.get('error_description') || params.get('error');
        if (callbackError) {
          console.error('OAuth callback returned an error:', callbackError);
          toast({
            title: 'Sign-in failed',
            description: callbackError,
            variant: 'destructive',
          });
          return;
        }

        const { error } = await supabase.auth.exchangeCodeForSession(url);
        if (error) {
          console.error('Error exchanging OAuth code for session:', error);
          toast({
            title: 'Sign-in failed',
            description: error.message,
            variant: 'destructive',
          });
        }
      }).then((handle) => {
        urlListenerHandle = handle;
      });
    }

    return () => {
      subscription.unsubscribe();
      urlListenerHandle?.remove();
    };
  }, []);

  const signUp = async (email: string, password: string, fullName: string) => {
    const redirectUrl = `${window.location.origin}/`;
    
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          full_name: fullName,
        }
      }
    });
    
    return { error };
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    return { error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!user) return { error: new Error('No user logged in') };
    
    const { error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', user.id);
    
    if (!error && profile) {
      setProfile({ ...profile, ...updates });
    }
    
    return { error };
  };

  const value = {
    user,
    session,
    profile,
    loading,
    signUp,
    signIn,
    signOut,
    updateProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
