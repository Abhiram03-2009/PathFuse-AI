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
  Target,
  Zap,
  Shield,
  Clock
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
      color: 'bg-blue-600',
      component: ResumeGenerator
    },
    {
      id: 'cover-letter',
      name: 'Cover Letter Generator',
      description: 'Generate personalized cover letters for any job',
      icon: PlusCircle,
      color: 'bg-green-600',
      component: CoverLetterGenerator
    },
    {
      id: 'ai-chat',
      name: 'AI Career Coach',
      description: 'Get personalized career advice from GPT-4',
      icon: MessageSquare,
      color: 'bg-purple-600',
      component: AIChatbot
    },
    {
      id: 'job-analyzer',
      name: 'Job Match Analyzer',
      description: 'Find jobs that match your skills and preferences',
      icon: Search,
      color: 'bg-orange-600',
      component: JobAnalyzer
    },
    {
      id: 'keyword-matcher',
      name: 'Keyword Matcher',
      description: 'Optimize your resume for ATS systems',
      icon: Target,
      color: 'bg-red-600',
      component: KeywordMatcher
    },
    {
      id: 'university-predictor',
      name: 'University Predictor',
      description: 'Predict your chances at top universities',
      icon: GraduationCap,
      color: 'bg-indigo-600',
      component: UniversityPredictor
    },
    {
      id: 'translator',
      name: 'Multilingual Translator',
      description: 'Translate documents and content across 50+ languages',
      icon: Globe,
      color: 'bg-teal-600',
      component: MultilingualTranslator
    },
    {
      id: 'linkedin',
      name: 'LinkedIn Optimizer',
      description: 'Analyze and optimize your LinkedIn profile',
      icon: User,
      color: 'bg-blue-700',
      component: LinkedInIntegration
    },
    {
      id: 'saved-items',
      name: 'Saved Items',
      description: 'View and manage your saved colleges and jobs',
      icon: BookOpen,
      color: 'bg-gray-600',
      component: SavedItems
    }
  ];

  const stats = [
    { label: 'AI Tools', value: '9+', icon: Zap },
    { label: 'Universities', value: '50+', icon: GraduationCap },
    { label: 'Languages', value: '50+', icon: Globe },
    { label: 'Job Industries', value: '25+', icon: Briefcase }
  ];

  const benefits = [
    {
      icon: Target,
      title: 'AI-Powered Accuracy',
      description: 'Advanced algorithms analyze your profile and provide personalized recommendations'
    },
    {
      icon: Shield,
      title: 'Privacy First',
      description: 'Your data is encrypted and secure. We never share your personal information'
    },
    {
      icon: Clock,
      title: 'Real-Time Updates',
      description: 'Get the latest job market trends and university admission requirements'
    },
    {
      icon: Zap,
      title: 'Instant Results',
      description: 'Generate professional documents and get insights in seconds, not hours'
    }
  ];

  const ActiveComponent = features.find(f => f.id === activeTab)?.component;

  return (
    <div className={`min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300 ${isDarkMode ? 'dark' : ''}`}>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white mb-4">
            AI Career Platform
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto">
            Empower your career journey with AI-powered tools for resumes, job matching, university predictions, and more.
          </p>
          
          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {stats.map((stat, index) => (
              <Card key={index} className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                <CardContent className="p-4 text-center">
                  <stat.icon className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-300">{stat.label}</div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
          {/* Navigation */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
            <TabsList className="grid grid-cols-3 md:grid-cols-5 lg:grid-cols-9 gap-2 h-auto bg-transparent">
              <TabsTrigger 
                value="overview" 
                className="data-[state=active]:bg-blue-600 data-[state=active]:text-white text-gray-900 dark:text-white p-3 rounded-lg"
              >
                <div className="flex flex-col items-center space-y-1">
                  <Zap className="w-4 h-4" />
                  <span className="text-xs">Overview</span>
                </div>
              </TabsTrigger>
              {features.map((feature) => (
                <TabsTrigger 
                  key={feature.id} 
                  value={feature.id}
                  className="data-[state=active]:bg-blue-600 data-[state=active]:text-white text-gray-900 dark:text-white p-3 rounded-lg"
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
            {/* Features Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {features.map((feature) => (
                <Card 
                  key={feature.id} 
                  className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={() => setActiveTab(feature.id)}
                >
                  <CardHeader>
                    <div className="flex items-center space-x-3">
                      <div className={`${feature.color} p-3 rounded-lg`}>
                        <feature.icon className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <CardTitle className="text-lg text-gray-900 dark:text-white">
                          {feature.name}
                        </CardTitle>
                        <Badge variant="secondary" className="mt-1">
                          AI-Powered
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-gray-600 dark:text-gray-300">
                      {feature.description}
                    </CardDescription>
                    <Button 
                      className="w-full mt-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                      onClick={() => setActiveTab(feature.id)}
                    >
                      Try Now
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Benefits Section */}
            <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
              <CardHeader>
                <CardTitle className="text-2xl text-center text-gray-900 dark:text-white">
                  Why Choose Our AI Platform?
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {benefits.map((benefit, index) => (
                    <div key={index} className="text-center">
                      <div className="bg-blue-100 dark:bg-blue-900 p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                        <benefit.icon className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                      </div>
                      <h3 className="font-semibold text-gray-900 dark:text-white mb-2">{benefit.title}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-300">{benefit.description}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
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
