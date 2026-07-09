
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Eye, EyeOff, UserPlus, LogIn } from 'lucide-react';
import { Capacitor } from '@capacitor/core';
import { supabase } from '@/integrations/supabase/client';
import { signInWithOAuthNative } from '@/lib/nativeAuth';
import pathFuseLogo from '@/assets/pathfuse-logo.png';

const Auth = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState<string | null>(null);

  const { signIn, signUp, user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  const handleOAuth = async (provider: 'google' | 'apple') => {
    setOauthLoading(provider);
    try {
      const { error } = Capacitor.isNativePlatform()
        ? await signInWithOAuthNative(provider)
        : await supabase.auth.signInWithOAuth({
            provider,
            options: {
              redirectTo: `${window.location.origin}/dashboard`,
            },
          });
      if (error) {
        toast({
          title: 'Sign-in failed',
          description: error.message || `Could not sign in with ${provider}.`,
          variant: 'destructive',
        });
      }
      // On success, Supabase redirects the browser — no further action needed here.
    } catch (err: any) {
      toast({ title: 'Error', description: err?.message || 'Unexpected error', variant: 'destructive' });
    } finally {
      setOauthLoading(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      let result;
      if (isSignUp) {
        if (!fullName.trim()) {
          toast({
            title: "Error",
            description: "Please enter your full name.",
            variant: "destructive",
          });
          return;
        }
        result = await signUp(email, password, fullName);
      } else {
        result = await signIn(email, password);
      }

      if (result.error) {
        toast({
          title: "Error",
          description: result.error.message || "An error occurred during authentication.",
          variant: "destructive",
        });
      } else {
        toast({
          title: 'Success',
          description: isSignUp ? 'Account created! Welcome aboard.' : 'Welcome back!',
        });
        navigate('/dashboard');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const toggleMode = () => {
    setIsSignUp(!isSignUp);
    setEmail('');
    setPassword('');
    setFullName('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-slate-800 relative overflow-hidden flex items-center justify-center p-6">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 right-20 w-64 h-64 bg-cyan-400/10 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-20 left-20 w-96 h-96 bg-purple-400/10 rounded-full blur-3xl animate-float" style={{animationDelay: '2s'}}></div>
        <div className="absolute top-1/2 left-1/2 w-80 h-80 bg-blue-400/8 rounded-full blur-3xl animate-float" style={{animationDelay: '4s'}}></div>
      </div>

      {/* Floating Particles */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(12)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-cyan-400/20 rounded-full animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 10}s`,
              animationDuration: `${15 + Math.random() * 20}s`
            }}
          />
        ))}
      </div>

      <div className="relative z-10 w-full max-w-md">
        <Card className="bg-gray-800/40 border-cyan-400/20 backdrop-blur-xl shadow-2xl shadow-cyan-500/5 transform transition-all duration-500 hover:scale-105 neon-border">
          <CardHeader className="text-center space-y-4">
            <div className="flex items-center justify-center space-x-3">
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-400/20 to-purple-400/20 rounded-xl blur-lg group-hover:from-cyan-400/30 group-hover:to-purple-400/30 transition-all duration-500 animate-pulse-glow"></div>
                <div className="relative w-16 h-16 bg-gray-800/60 backdrop-blur-lg rounded-xl border border-cyan-400/30 neon-border overflow-hidden">
                  <img src={pathFuseLogo} alt="Path Fuse AI Logo" className="w-full h-full object-cover" />
                </div>
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent animate-neon-flicker">
                  Path Fuse AI
                </h1>
                <p className="text-xs text-cyan-300/80 animate-fade-in">Your AI Career Assistant</p>
              </div>
            </div>
            <CardTitle className="text-xl text-cyan-300 flex items-center justify-center space-x-2">
              {isSignUp ? <UserPlus className="w-5 h-5" /> : <LogIn className="w-5 h-5" />}
              <span>{isSignUp ? 'Create Account' : 'Welcome Back'}</span>
            </CardTitle>
            <CardDescription className="text-gray-400">
              {isSignUp 
                ? 'Start your AI-powered career journey today' 
                : 'Sign in to continue your career advancement'
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Social sign-in */}
            <div className="space-y-2 mb-4">
              <Button
                type="button"
                onClick={() => handleOAuth('google')}
                disabled={!!oauthLoading}
                className="w-full bg-white text-gray-800 hover:bg-gray-100 border border-gray-200 flex items-center justify-center gap-2"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                {oauthLoading === 'google' ? 'Redirecting…' : 'Continue with Google'}
              </Button>
              <Button
                type="button"
                onClick={() => handleOAuth('apple')}
                disabled={!!oauthLoading}
                className="w-full bg-black text-white hover:bg-gray-900 border border-gray-700 flex items-center justify-center gap-2"
              >
                {/* Apple logo SVG — square viewBox, full logo visible */}
                <svg className="w-4 h-4" viewBox="0 0 256 256" fill="white" xmlns="http://www.w3.org/2000/svg">
                  <path d="M220.4 168.6c-4.6 10.1-6.8 14.6-12.7 23.5-8.2 12.5-19.8 28.1-34.2 28.2-12.8.1-16.1-8.3-33.5-8.2-17.4.1-21 8.4-33.8 8.3-14.4-.1-25.4-14.3-33.6-26.8-23-35-25.4-76.1-11.2-97.9 10-15.4 25.8-24.4 40.6-24.4 15.1 0 24.6 8.3 37.1 8.3 12.1 0 19.5-8.3 37-8.3 13.2 0 27.2 7.2 37.2 19.6-32.7 17.9-27.4 64.7 6.1 77.7zM165.4 45.2c6.4-8.2 11.3-19.8 9.5-31.6-10.3.7-22.4 7.3-29.5 15.8-6.4 7.7-11.8 19.4-9.7 30.8 11.3.4 23-6.2 29.7-15z"/>
                </svg>
                {oauthLoading === 'apple' ? 'Redirecting…' : 'Continue with Apple'}
              </Button>
            </div>

            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-cyan-400/20" /></div>
              <div className="relative flex justify-center text-xs">
                <span className="px-2 bg-gray-800/40 text-gray-400">or with email</span>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {isSignUp && (
                <div className="space-y-2 animate-fade-in">
                  <Label htmlFor="fullName" className="text-cyan-300">Full Name</Label>
                  <Input
                    id="fullName"
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="bg-gray-800/50 border-cyan-500/30 text-white placeholder-gray-400 focus:border-cyan-400 focus:ring-cyan-400/20"
                    placeholder="Enter your full name"
                    required={isSignUp}
                  />
                </div>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="email" className="text-cyan-300">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-gray-800/50 border-cyan-500/30 text-white placeholder-gray-400 focus:border-cyan-400 focus:ring-cyan-400/20"
                  placeholder="Enter your email"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password" className="text-cyan-300">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="bg-gray-800/50 border-cyan-500/30 text-white placeholder-gray-400 focus:border-cyan-400 focus:ring-cyan-400/20 pr-10"
                    placeholder="Enter your password"
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent text-gray-400 hover:text-cyan-400"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </Button>
                </div>
              </div>
              
              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600 text-white font-medium py-2.5 rounded-md transition-all duration-300 transform hover:scale-105 hover:shadow-lg hover:shadow-cyan-500/25"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                    <span>{isSignUp ? 'Creating Account...' : 'Signing In...'}</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    {isSignUp ? <UserPlus className="w-4 h-4" /> : <LogIn className="w-4 h-4" />}
                    <span>{isSignUp ? 'Create Account' : 'Sign In'}</span>
                  </div>
                )}
              </Button>
            </form>
            
            <div className="mt-6 text-center">
              <Button
                variant="ghost"
                onClick={toggleMode}
                className="text-cyan-400 hover:text-cyan-300 hover:bg-cyan-400/10 transition-all duration-300"
              >
                {isSignUp 
                  ? 'Already have an account? Sign in' 
                  : 'Need an account? Sign up'
                }
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Auth;
