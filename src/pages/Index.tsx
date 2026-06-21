import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  FileText, MessageSquare, Search, GraduationCap, Globe, PlusCircle, Target,
  BookOpen, BarChart3, Linkedin, Bot, Sparkles, TrendingUp, Activity, Clock, ArrowRight, Newspaper, ExternalLink,
} from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { supabase } from '@/integrations/supabase/client';

import ResumeGenerator from '@/components/ResumeGenerator';
import CoverLetterGenerator from '@/components/CoverLetterGenerator';
import AIChatbot from '@/components/AIChatbot';
import JobAnalyzer from '@/components/JobAnalyzer';
import KeywordMatcher from '@/components/KeywordMatcher';
import UniversityPredictor from '@/components/UniversityPredictor';
import MultilingualTranslator from '@/components/MultilingualTranslator';
import LinkedInIntegration from '@/components/LinkedInIntegration';
import SavedItems from '@/components/SavedItems';

const FEATURES = [
  { id: 'resume', name: 'Resume Builder', short: 'Resume', icon: FileText, gradient: 'from-cyan-500 to-blue-600', component: ResumeGenerator },
  { id: 'cover-letter', name: 'Cover Letter', short: 'Letter', icon: PlusCircle, gradient: 'from-emerald-500 to-teal-600', component: CoverLetterGenerator },
  { id: 'ai-chat', name: 'AI Career Coach', short: 'Coach', icon: Bot, gradient: 'from-purple-500 to-pink-600', component: AIChatbot },
  { id: 'job-analyzer', name: 'Job Match Analyzer', short: 'Jobs', icon: Search, gradient: 'from-orange-500 to-red-600', component: JobAnalyzer },
  { id: 'keyword-matcher', name: 'Keyword Matcher', short: 'ATS', icon: Target, gradient: 'from-rose-500 to-pink-600', component: KeywordMatcher },
  { id: 'university-predictor', name: 'University Predictor', short: 'Uni', icon: GraduationCap, gradient: 'from-indigo-500 to-purple-600', component: UniversityPredictor },
  { id: 'translator', name: 'Multilingual Translator', short: 'Translate', icon: Globe, gradient: 'from-blue-500 to-cyan-600', component: MultilingualTranslator },
  { id: 'linkedin', name: 'LinkedIn Optimizer', short: 'LinkedIn', icon: Linkedin, gradient: 'from-blue-600 to-indigo-600', component: LinkedInIntegration },
  { id: 'saved-items', name: 'Your Library', short: 'Library', icon: BookOpen, gradient: 'from-slate-600 to-gray-700', component: SavedItems },
] as const;

type Activity = {
  type: 'job' | 'college' | 'resume' | 'letter' | 'linkedin' | 'keyword';
  label: string;
  sub?: string;
  meta?: string;
  created_at: string;
  tab: string;
};

const TIPS = [
  'Tailor your resume to every role: mirror 3–5 exact phrases from the job description.',
  'Quantify achievements with %, $ or counts — recruiters skim for numbers first.',
  'Update LinkedIn headline with role + value + niche (e.g. "PM | shipping fintech tools for 1M+ users").',
  'Apply within 48 hours of a job posting going live — response rates drop ~60% after.',
  'A 1-page resume converts better than 2 pages for under 10 years of experience.',
  'Cover letter rule: paragraph 1 = why them, paragraph 2 = why you, paragraph 3 = CTA.',
  'ATS systems strip formatting — stick to standard section headers like "Experience" and "Skills".',
  'Reach out to a current employee before you apply; referrals 4–10× your interview odds.',
];

const Index = () => {
  const { isDarkMode } = useTheme();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [activity, setActivity] = useState<Activity[]>([]);
  const [stats, setStats] = useState({ jobs: 0, colleges: 0, resumes: 0, letters: 0, linkedin: 0, keywords: 0 });
  const [loadingStats, setLoadingStats] = useState(true);
  const tip = TIPS[new Date().getDate() % TIPS.length];

  useEffect(() => { if (activeTab === 'dashboard') loadActivity(); }, [activeTab]);

  const loadActivity = async () => {
    setLoadingStats(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setLoadingStats(false); return; }
    const [j, c, r, l, li, k] = await Promise.all([
      supabase.from('saved_jobs').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(10),
      supabase.from('saved_colleges').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(10),
      supabase.from('saved_resumes').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(10),
      supabase.from('saved_cover_letters').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(10),
      supabase.from('saved_linkedin_reports').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(10),
      supabase.from('saved_keyword_analyses').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(10),
    ]);
    setStats({
      jobs: j.data?.length || 0, colleges: c.data?.length || 0, resumes: r.data?.length || 0,
      letters: l.data?.length || 0, linkedin: li.data?.length || 0, keywords: k.data?.length || 0,
    });
    const merged: Activity[] = [
      ...(j.data || []).map((x: any) => ({ type: 'job' as const, label: x.job_title, sub: x.company_name, meta: x.match_percentage ? `${x.match_percentage}%` : '', created_at: x.created_at, tab: 'job-analyzer' })),
      ...(c.data || []).map((x: any) => ({ type: 'college' as const, label: x.college_name, sub: 'University', meta: x.match_percentage ? `${x.match_percentage}%` : '', created_at: x.created_at, tab: 'university-predictor' })),
      ...(r.data || []).map((x: any) => ({ type: 'resume' as const, label: x.title || 'Resume', sub: x.template, created_at: x.created_at, tab: 'resume' })),
      ...(l.data || []).map((x: any) => ({ type: 'letter' as const, label: x.job_title || 'Cover Letter', sub: x.company, created_at: x.created_at, tab: 'cover-letter' })),
      ...(li.data || []).map((x: any) => ({ type: 'linkedin' as const, label: x.profile_name || 'LinkedIn Report', sub: x.report_type, created_at: x.created_at, tab: 'linkedin' })),
      ...(k.data || []).map((x: any) => ({ type: 'keyword' as const, label: x.job_title || 'Keyword Analysis', sub: 'ATS scan', meta: x.overall_match ? `${Math.round(x.overall_match)}%` : '', created_at: x.created_at, tab: 'keyword-matcher' })),
    ].sort((a, b) => +new Date(b.created_at) - +new Date(a.created_at)).slice(0, 8);
    setActivity(merged);
    setLoadingStats(false);
  };

  const ActiveComponent = FEATURES.find((f) => f.id === activeTab)?.component;

  const iconFor = (t: Activity['type']) => {
    const map: Record<Activity['type'], any> = {
      job: Search, college: GraduationCap, resume: FileText, letter: PlusCircle, linkedin: Linkedin, keyword: Target,
    };
    const Icon = map[t];
    return <Icon className="w-4 h-4" />;
  };

  return (
    <div className={`min-h-screen transition-all duration-500 ${isDarkMode ? 'bg-gradient-to-br from-slate-900 via-gray-900 to-slate-800' : 'bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50'} relative overflow-hidden`}>
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className={`absolute top-20 right-20 w-64 h-64 ${isDarkMode ? 'bg-cyan-400/8' : 'bg-cyan-400/12'} rounded-full blur-3xl animate-float`} />
        <div className={`absolute bottom-20 left-20 w-96 h-96 ${isDarkMode ? 'bg-purple-400/8' : 'bg-purple-400/12'} rounded-full blur-3xl animate-float`} style={{ animationDelay: '2s' }} />
      </div>

      <div className="container mx-auto px-4 py-8 relative z-10">
        <div className="text-center mb-10">
          <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent animate-neon-flicker mb-3">PathFuse AI</h1>
          <p className={`text-lg ${isDarkMode ? 'text-cyan-300' : 'text-blue-600'}`}>Your AI Career Assistant</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
          <div className={`${isDarkMode ? 'bg-gray-800/30 border-cyan-400/30' : 'bg-white/50 border-blue-300/50'} backdrop-blur-lg rounded-2xl p-4 border`}>
            <TabsList className="grid grid-cols-5 lg:grid-cols-10 gap-2 h-auto bg-transparent">
              <TabsTrigger value="dashboard" className={`${isDarkMode ? 'data-[state=active]:bg-gradient-to-r data-[state=active]:from-cyan-500 data-[state=active]:to-purple-500 data-[state=active]:text-white text-cyan-300' : 'data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-500 data-[state=active]:text-white text-blue-600'} p-2 rounded-lg border border-transparent transition-all`}>
                <div className="flex flex-col items-center space-y-1"><BarChart3 className="w-4 h-4" /><span className="text-xs">Home</span></div>
              </TabsTrigger>
              {FEATURES.map((f) => (
                <TabsTrigger key={f.id} value={f.id} className={`${isDarkMode ? 'data-[state=active]:bg-gradient-to-r data-[state=active]:from-cyan-500 data-[state=active]:to-purple-500 data-[state=active]:text-white text-cyan-300' : 'data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-500 data-[state=active]:text-white text-blue-600'} p-2 rounded-lg border border-transparent transition-all`}>
                  <div className="flex flex-col items-center space-y-1"><f.icon className="w-4 h-4" /><span className="text-xs">{f.short}</span></div>
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          {/* Dashboard: stats + recent activity + AI tip + quick launch */}
          <TabsContent value="dashboard" className="space-y-6">
            {/* Stats row */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
              {[
                { label: 'Jobs', value: stats.jobs, icon: Search, color: 'from-orange-500 to-red-600' },
                { label: 'Colleges', value: stats.colleges, icon: GraduationCap, color: 'from-indigo-500 to-purple-600' },
                { label: 'Resumes', value: stats.resumes, icon: FileText, color: 'from-cyan-500 to-blue-600' },
                { label: 'Letters', value: stats.letters, icon: PlusCircle, color: 'from-emerald-500 to-teal-600' },
                { label: 'LinkedIn', value: stats.linkedin, icon: Linkedin, color: 'from-blue-600 to-indigo-600' },
                { label: 'ATS scans', value: stats.keywords, icon: Target, color: 'from-rose-500 to-pink-600' },
              ].map((s) => (
                <Card key={s.label} className={`${isDarkMode ? 'bg-gray-800/40 border-cyan-400/20' : 'bg-white border-blue-300/40'} backdrop-blur-lg border transition-all hover:scale-[1.02] cursor-default`}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>{s.label}</p>
                        <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{loadingStats ? '—' : s.value}</p>
                      </div>
                      <div className={`p-2 rounded-lg bg-gradient-to-br ${s.color}`}><s.icon className="w-4 h-4 text-white" /></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Recent Activity — spans 2 cols */}
              <Card className={`lg:col-span-2 ${isDarkMode ? 'bg-gray-800/40 border-cyan-400/20' : 'bg-white border-blue-300/40'} backdrop-blur-lg border`}>
                <CardHeader>
                  <CardTitle className={`flex items-center space-x-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    <Activity className="w-5 h-5" /><span>Recent Activity</span>
                  </CardTitle>
                  <CardDescription className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>
                    Everything you've saved across PathFuse, newest first.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {loadingStats ? (
                    <p className={isDarkMode ? 'text-gray-400' : 'text-gray-500'}>Loading…</p>
                  ) : activity.length === 0 ? (
                    <div className="text-center py-8">
                      <Sparkles className={`w-12 h-12 mx-auto mb-3 ${isDarkMode ? 'text-cyan-400' : 'text-blue-500'}`} />
                      <p className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>Nothing saved yet. Launch a tool below to get started.</p>
                    </div>
                  ) : (
                    <ul className="space-y-2">
                      {activity.map((a, i) => (
                        <li key={i}>
                          <button onClick={() => setActiveTab(a.tab)} className={`w-full text-left flex items-center justify-between p-3 rounded-lg border transition-all ${isDarkMode ? 'border-cyan-400/20 hover:bg-gray-900/40' : 'border-blue-200/60 hover:bg-blue-50/60'}`}>
                            <div className="flex items-center gap-3 min-w-0">
                              <span className={`p-2 rounded-md ${isDarkMode ? 'bg-cyan-500/15 text-cyan-300' : 'bg-blue-500/15 text-blue-600'}`}>{iconFor(a.type)}</span>
                              <div className="min-w-0">
                                <p className={`font-medium text-sm truncate ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{a.label}</p>
                                <p className={`text-xs truncate ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>{a.sub}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                              {a.meta && <Badge variant="secondary" className="text-xs">{a.meta}</Badge>}
                              <span className={`text-xs flex items-center gap-1 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                                <Clock className="w-3 h-3" />{new Date(a.created_at).toLocaleDateString()}
                              </span>
                              <ArrowRight className={`w-4 h-4 ${isDarkMode ? 'text-cyan-400' : 'text-blue-500'}`} />
                            </div>
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </CardContent>
              </Card>

              {/* AI Tip + Quick Launch */}
              <div className="space-y-6">
                <Card className={`${isDarkMode ? 'bg-gradient-to-br from-purple-900/40 to-pink-900/30 border-purple-400/30' : 'bg-gradient-to-br from-purple-50 to-pink-50 border-purple-300/50'} border`}>
                  <CardHeader>
                    <CardTitle className={`flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      <Sparkles className="w-5 h-5" />Career Tip of the Day
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className={`text-sm leading-relaxed ${isDarkMode ? 'text-purple-100' : 'text-gray-700'}`}>{tip}</p>
                  </CardContent>
                </Card>

                <Card className={`${isDarkMode ? 'bg-gray-800/40 border-cyan-400/20' : 'bg-white border-blue-300/40'} backdrop-blur-lg border`}>
                  <CardHeader>
                    <CardTitle className={`flex items-center gap-2 text-base ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      <TrendingUp className="w-4 h-4" />Quick Launch
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-2">
                      {FEATURES.slice(0, 6).map((f) => (
                        <Button key={f.id} variant="outline" onClick={() => setActiveTab(f.id)} className="justify-start text-xs h-auto py-2">
                          <f.icon className="w-3.5 h-3.5 mr-2" />{f.short}
                        </Button>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {FEATURES.map((feature) => (
            <TabsContent key={feature.id} value={feature.id}>
              {ActiveComponent && activeTab === feature.id && <ActiveComponent />}
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </div>
  );
};

export default Index;
