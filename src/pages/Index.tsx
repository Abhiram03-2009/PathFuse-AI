
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
  Briefcase,
  BookOpen,
  User,
  PlusCircle,
  Target
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
  const [activeTab, setActiveTab] = useState('overview');

  const features = [
    {
      id: 'resume',
      name: 'Resume Builder',
      description: 'Create professional resumes with AI-powered suggestions',
      icon: FileText,
      gradient: 'from-cyan-400 via-blue-500 to-purple-600',
      component: ResumeGenerator
    },
    {
      id: 'cover-letter',
      name: 'Cover Letter Generator',
      description: 'Generate personalized cover letters for any job',
      icon: PlusCircle,
      gradient: 'from-green-400 via-emerald-500 to-teal-600',
      component: CoverLetterGenerator
    },
    {
      id: 'ai-chat',
      name: 'AI Career Coach',
      description: 'Get personalized career advice from GPT-4',
      icon: MessageSquare,
      gradient: 'from-purple-400 via-pink-500 to-red-500',
      component: AIChatbot
    },
    {
      id: 'job-analyzer',
      name: 'Job Match Analyzer',
      description: 'Find jobs that match your skills and preferences',
      icon: Search,
      gradient: 'from-orange-400 via-red-500 to-pink-600',
      component: JobAnalyzer
    },
    {
      id: 'keyword-matcher',
      name: 'Keyword Matcher',
      description: 'Optimize your resume for ATS systems',
      icon: Target,
      gradient: 'from-red-400 via-rose-500 to-pink-600',
      component: KeywordMatcher
    },
    {
      id: 'university-predictor',
      name: 'University Predictor',
      description: 'Predict your chances at top universities',
      icon: GraduationCap,
      gradient: 'from-indigo-400 via-purple-500 to-blue-600',
      component: UniversityPredictor
    },
    {
      id: 'translator',
      name: 'Multilingual Translator',
      description: 'Translate documents and content across 50+ languages',
      icon: Globe,
      gradient: 'from-teal-400 via-cyan-500 to-blue-600',
      component: MultilingualTranslator
    },
    {
      id: 'linkedin',
      name: 'LinkedIn Optimizer',
      description: 'Analyze and optimize your LinkedIn profile',
      icon: User,
      gradient: 'from-blue-400 via-indigo-500 to-purple-600',
      component: LinkedInIntegration
    },
    {
      id: 'saved-items',
      name: 'Saved Items',
      description: 'View and manage your saved colleges and jobs',
      icon: BookOpen,
      gradient: 'from-gray-600 via-slate-700 to-gray-800',
      component: SavedItems
    }
  ];

  const ActiveComponent = features.find(f => f.id === activeTab)?.component;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-4 -left-4 w-72 h-72 bg-cyan-400/20 rounded-full animate-float"></div>
        <div className="absolute -bottom-8 -right-8 w-96 h-96 bg-purple-400/20 rounded-full animate-float" style={{animationDelay: '2s'}}></div>
        <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-blue-400/20 rounded-full animate-float" style={{animationDelay: '4s'}}></div>
      </div>

      <div className="container mx-auto px-4 py-8 relative z-10">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent animate-neon-flicker mb-4">
            Resumate AI
          </h1>
          <p className="text-xl text-cyan-300 mb-8 animate-fade-in">
            Your AI Career Assistant - Powered by Advanced Intelligence
          </p>
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
          {/* Tab Navigation */}
          <div className="bg-gray-800/30 backdrop-blur-lg rounded-2xl p-6 border border-cyan-400/30 neon-border">
            <TabsList className="grid grid-cols-5 lg:grid-cols-10 gap-2 h-auto bg-transparent">
              <TabsTrigger 
                value="overview" 
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-cyan-500 data-[state=active]:to-purple-500 data-[state=active]:text-white text-cyan-300 p-3 rounded-lg border border-cyan-400/20 hover:border-cyan-400/50 transition-all duration-300"
              >
                <div className="flex flex-col items-center space-y-1">
                  <span className="text-lg">⚡</span>
                  <span className="text-xs">Overview</span>
                </div>
              </TabsTrigger>
              {features.map((feature) => (
                <TabsTrigger 
                  key={feature.id} 
                  value={feature.id}
                  className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-cyan-500 data-[state=active]:to-purple-500 data-[state=active]:text-white text-cyan-300 p-3 rounded-lg border border-cyan-400/20 hover:border-cyan-400/50 transition-all duration-300"
                >
                  <div className="flex flex-col items-center space-y-1">
                    <feature.icon className="w-4 h-4" />
                    <span className="text-xs">{feature.name.split(' ')[0]}</span>
                  </div>
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-8">
            {/* 3x3 Features Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {features.map((feature) => (
                <Card 
                  key={feature.id} 
                  className="bg-gray-800/50 backdrop-blur-lg border border-cyan-400/30 hover:border-cyan-400/60 transition-all duration-300 cursor-pointer group neon-border"
                  onClick={() => setActiveTab(feature.id)}
                >
                  <CardHeader>
                    <div className="flex items-center space-x-4">
                      <div className={`p-3 rounded-lg bg-gradient-to-r ${feature.gradient} shadow-lg`}>
                        <feature.icon className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <CardTitle className="text-lg text-cyan-100 group-hover:text-white transition-colors">
                          {feature.name}
                        </CardTitle>
                        <Badge variant="secondary" className="mt-1 bg-cyan-500/20 text-cyan-300 border-cyan-400/30">
                          AI-Powered
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-gray-300 group-hover:text-gray-200 transition-colors mb-4">
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
