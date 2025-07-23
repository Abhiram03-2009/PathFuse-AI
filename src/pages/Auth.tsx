
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Eye, EyeOff, UserPlus, LogIn } from 'lucide-react';
import pathFuseLogo from '/lovable-uploads/2817281e-9731-4737-81c6-d08df8c7ed17.png';

const Auth = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const { signIn, signUp, user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

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
          title: "Success",
          description: isSignUp 
            ? "Account created successfully! Please check your email to verify your account." 
            : "Welcome back!",
        });
        if (!isSignUp) {
          navigate('/');
        }
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
                <div className="relative bg-gray-800/60 backdrop-blur-lg rounded-xl p-3 border border-cyan-400/30 neon-border">
                  <img src={pathFuseLogo} alt="Path Fuse AI Logo" className="w-10 h-10 object-contain" />
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
