import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ShieldCheck, LogOut } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

// Required by Apple App Review guideline 5.1.1(i)/5.1.2(i): apps that send
// personal data to a third-party AI service must disclose what's sent, name
// who it's sent to, and get explicit permission first - a privacy policy
// mention alone isn't sufficient. Shown once, before any AI-powered feature
// (chat, resume/keyword analysis, LinkedIn lookup, mock interview) can run.
const AIConsentGate = ({ children }: { children: React.ReactNode }) => {
  const { profile, updateProfile, signOut } = useAuth();
  const { isDarkMode } = useTheme();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);

  if (profile?.ai_consent_at) return <>{children}</>;

  const agree = async () => {
    setSaving(true);
    const { error } = await updateProfile({ ai_consent_at: new Date().toISOString() });
    setSaving(false);
    if (error) {
      toast({ title: 'Something went wrong', description: error.message, variant: 'destructive' });
    }
  };

  const decline = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-gray-900 dark:to-slate-800 flex items-center justify-center p-6">
      <Card className="max-w-lg w-full bg-white/70 dark:bg-gray-800/40 border-blue-300/40 dark:border-cyan-400/20 backdrop-blur-lg neon-border">
        <CardHeader>
          <CardTitle className={`flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            <ShieldCheck className="w-5 h-5 text-cyan-400" />How your data is used
          </CardTitle>
          <CardDescription className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>
            PathFuse AI's features are powered by third-party services. Before you continue, here's exactly what that means.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <ul className={`text-sm space-y-3 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            <li>
              <strong>Groq</strong> processes text you submit to the AI Career Coach, Resume Analyzer, Keyword Matcher,
              Mock Interview, and Translator — including your resume text, chat messages, job descriptions, and
              spoken answers during mock interviews (converted to text, not stored as audio afterward).
            </li>
            <li>
              <strong>Firecrawl</strong> retrieves publicly available LinkedIn profile data when you enter a
              LinkedIn URL in the LinkedIn Optimizer.
            </li>
          </ul>
          <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            This only happens when you actively use those features. Full details are in our{' '}
            <a href="https://abhiram03-2009.github.io/PathFuse-AI/privacy-policy.html" target="_blank" rel="noopener noreferrer" className="underline text-cyan-400">
              Privacy Policy
            </a>.
          </p>
          <div className="flex flex-col sm:flex-row gap-2 pt-2">
            <Button variant="outline" onClick={decline} className="flex-1 text-sm px-3 whitespace-normal h-auto min-h-10">
              <LogOut className="w-4 h-4 mr-2 shrink-0" />Decline & Sign Out
            </Button>
            <Button onClick={agree} disabled={saving} className="flex-1 text-sm px-3 whitespace-normal h-auto min-h-10 bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600">
              {saving ? 'Saving…' : 'I Agree & Continue'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AIConsentGate;
