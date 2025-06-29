
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  FileText, 
  MessageSquare, 
  Search, 
  GraduationCap, 
  Globe, 
  User,
  PlusCircle,
  Target,
  BookOpen,
  BarChart3,
  Linkedin
} from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';

// Component imports
import ResumeGenerator from '@/components/ResumeGenerator';
import CoverLetterGenerator from '@/components/CoverLetterGenerator';
import AIChatbot from '@/components/AIChatbot';
import JobAnalyzer from '@/components/JobAnalyzer';
import KeywordMatcher from '@/components/KeywordMatcher';
import UniversityPredictor from '@/components/UniversityPredictor';
import MultilingualTranslator from '@/components/MultilingualTranslator';
import LinkedInIntegration from '@/components/LinkedInIntegration';
import SavedItems from '@/components/SavedItems';

const Index = () => {
  const { isDarkMode } = useTheme();
  const [activeTab, setActiveTab] = useState('dashboard');

  const features = [
    {
      id: 'resume',
      name: 'Resume Builder',
      description: 'Create professional resumes with AI-powered suggestions',
      icon: FileText,
      gradient: 'from-cyan-500 to-blue-600',
      hoverColor: 'hover:bg-cyan-500/20',
      component: ResumeGenerator
    },
    {
      id: 'cover-letter',
      name: 'Cover Letter Generator',
      description: 'Generate personalized cover letters for any job',
      icon: PlusCircle,
      gradient: 'from-emerald-500 to-teal-600',
      hoverColor: 'hover:bg-emerald-500/20',
      component: CoverLetterGenerator
    },
    {
      id: 'ai-chat',
      name: 'AI Career Coach',
      description: 'Get personalized career advice from GPT-4',
      icon: MessageSquare,
      gradient: 'from-purple-500 to-pink-600',
      hoverColor: 'hover:bg-purple-500/20',
      component: AIChatbot
    },
    {
      id: 'job-analyzer',
      name: 'Job Match Analyzer',
      description: 'Find jobs that match your skills and preferences',
      icon: Search,
      gradient: 'from-orange-500 to-red-600',
      hoverColor: 'hover:bg-orange-500/20',
      component: JobAnalyzer
    },
    {
      id: 'keyword-matcher',
      name: 'Keyword Matcher',
      description: 'Optimize your resume for ATS systems',
      icon: Target,
      gradient: 'from-rose-500 to-pink-600',
      hoverColor: 'hover:bg-rose-500/20',
      component: KeywordMatcher
    },
    {
      id: 'university-predictor',
      name: 'University Predictor',
      description: 'Predict your chances at top universities',
      icon: GraduationCap,
      gradient: 'from-indigo-500 to-purple-600',
      hoverColor: 'hover:bg-indigo-500/20',
      component: UniversityPredictor
    },
    {
      id: 'translator',
      name: 'Multilingual Translator',
      description: 'Translate documents and content across 50+ languages',
      icon: Globe,
      gradient: 'from-blue-500 to-cyan-600',
      hoverColor: 'hover:bg-blue-500/20',
      component: MultilingualTranslator
    },
    {
      id: 'linkedin',
      name: 'LinkedIn Optimizer',
      description: 'Analyze and optimize your LinkedIn profile',
      icon: Linkedin,
      gradient: 'from-blue-600 to-indigo-600',
      hoverColor: 'hover:bg-blue-600/20',
      component: LinkedInIntegration
    },
    {
      id: 'saved-items',
      name: 'Saved Items',
      description: 'View and manage your saved colleges and jobs',
      icon: BookOpen,
      gradient: 'from-slate-600 to-gray-700',
      hoverColor: 'hover:bg-slate-600/20',
      component: SavedItems
    }
  ];

  const ActiveComponent = features.find(f => f.id === activeTab)?.component;

  return (
    <div className={`min-h-screen transition-all duration-500 ${
      isDarkMode 
        ? 'bg-gradient-to-br from-slate-900 via-gray-900 to-slate-800' 
        : 'bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50'
    } relative overflow-hidden`}>
      {/* Enhanced animated background elements with neon floating bubbles */}
      <div className="absolute inset-0 overflow-hidden">
        <div className={`absolute top-20 right-20 w-64 h-64 ${
          isDarkMode ? 'bg-cyan-400/8' : 'bg-cyan-400/12'
        } rounded-full blur-3xl animate-float`}></div>
        <div className={`absolute bottom-20 left-20 w-96 h-96 ${
          isDarkMode ? 'bg-purple-400/8' : 'bg-purple-400/12'
        } rounded-full blur-3xl animate-float`} style={{animationDelay: '2s'}}></div>
        <div className={`absolute top-1/2 left-1/2 w-80 h-80 ${
          isDarkMode ? 'bg-blue-400/6' : 'bg-blue-400/10'
        } rounded-full blur-3xl animate-float`} style={{animationDelay: '4s'}}></div>
        
        {/* Enhanced floating neon bubbles */}
        {Array.from({ length: 20 }).map((_, i) => (
          <div
            key={i}
            className={`floating-bubble bubble-neon animate-bubble-${(i % 3) + 1}`}
            style={{
              width: `${Math.floor(Math.random() * 8) + 4}px`,
              height: `${Math.floor(Math.random() * 8) + 4}px`,
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 25}s`,
              animationDuration: `${20 + Math.random() * 20}s`
            }}
          />
        ))}
      </div>

      <div className="container mx-auto px-4 py-8 relative z-10">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent animate-neon-flicker mb-4">
            Resumate AI
          </h1>
          <p className={`text-xl mb-8 animate-fade-in ${
            isDarkMode ? 'text-cyan-300' : 'text-blue-600'
          }`}>
            Your AI Career Assistant - Powered by Advanced Intelligence
          </p>
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
          {/* Tab Navigation */}
          <div className={`${
            isDarkMode 
              ? 'bg-gray-800/30 border-cyan-400/30' 
              : 'bg-white/50 border-blue-300/50'
          } backdrop-blur-lg rounded-2xl p-6 border neon-border transition-all duration-300`}>
            <TabsList className="grid grid-cols-5 lg:grid-cols-10 gap-2 h-auto bg-transparent">
              <TabsTrigger 
                value="dashboard" 
                className={`${
                  isDarkMode
                    ? 'data-[state=active]:bg-gradient-to-r data-[state=active]:from-cyan-500 data-[state=active]:to-purple-500 data-[state=active]:text-white text-cyan-300 border-cyan-400/20 hover:border-cyan-400/50'
                    : 'data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-500 data-[state=active]:text-white text-blue-600 border-blue-300/30 hover:border-blue-400/60'
                } p-3 rounded-lg border transition-all duration-300`}
              >
                <div className="flex flex-col items-center space-y-1">
                  <BarChart3 className="w-4 h-4" />
                  <span className="text-xs">Dashboard</span>
                </div>
              </TabsTrigger>
              {features.map((feature) => (
                <TabsTrigger 
                  key={feature.id} 
                  value={feature.id}
                  className={`${
                    isDarkMode
                      ? 'data-[state=active]:bg-gradient-to-r data-[state=active]:from-cyan-500 data-[state=active]:to-purple-500 data-[state=active]:text-white text-cyan-300 border-cyan-400/20 hover:border-cyan-400/50'
                      : 'data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-500 data-[state=active]:text-white text-blue-600 border-blue-300/30 hover:border-blue-400/60'
                  } p-3 rounded-lg border transition-all duration-300`}
                >
                  <div className="flex flex-col items-center space-y-1">
                    <feature.icon className="w-4 h-4" />
                    <span className="text-xs">{feature.name.split(' ')[0]}</span>
                  </div>
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard" className="space-y-8">
            {/* 3x3 Features Grid with proper theming */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {features.map((feature) => (
                <Card 
                  key={feature.id} 
                  className={`${
                    isDarkMode 
                      ? 'bg-gray-800/40 border-cyan-400/20 hover:border-cyan-400/50' 
                      : 'bg-white border-blue-300/40 hover:border-blue-400/70'
                  } backdrop-blur-lg border transition-all duration-300 cursor-pointer group neon-border ${feature.hoverColor}`}
                  onClick={() => setActiveTab(feature.id)}
                >
                  <CardHeader>
                    <div className="flex items-center space-x-4">
                      <div className={`p-3 rounded-lg bg-gradient-to-r ${feature.gradient} shadow-lg`}>
                        <feature.icon className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <CardTitle className={`text-lg group-hover:text-white transition-colors ${
                          isDarkMode ? 'text-cyan-100' : 'text-gray-800'
                        }`}>
                          {feature.name}
                        </CardTitle>
                        <Badge variant="secondary" className={`mt-1 border ${
                          isDarkMode 
                            ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400/30' 
                            : 'bg-blue-500/20 text-blue-600 border-blue-400/40'
                        }`}>
                          AI-Powered
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className={`group-hover:text-gray-200 transition-colors mb-4 ${
                      isDarkMode ? 'text-gray-300' : 'text-gray-600'
                    }`}>
                      {feature.description}
                    </CardDescription>
                    <Button 
                      className={`w-full bg-gradient-to-r ${feature.gradient} hover:opacity-90 text-white border-0 shadow-lg transition-all duration-300`}
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveTab(feature.id);
                      }}
                    >
                      Launch Tool
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Feature Tabs */}
          {features.map((feature) => (
            <TabsContent key={feature.id} value={feature.id}>
              {ActiveComponent && <ActiveComponent />}
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </div>
  );
};

export default Index;
