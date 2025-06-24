import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileText, MessageCircle, Search, BarChart3, Globe, Briefcase, Sparkles, Linkedin, GraduationCap } from 'lucide-react';
import ResumeGenerator from '@/components/ResumeGenerator';
import CoverLetterGenerator from '@/components/CoverLetterGenerator';
import AIChatbot from '@/components/AIChatbot';
import KeywordMatcher from '@/components/KeywordMatcher';
import JobAnalyzer from '@/components/JobAnalyzer';
import MultilingualTranslator from '@/components/MultilingualTranslator';
import LinkedInIntegration from '@/components/LinkedInIntegration';
import UniversityPredictor from '@/components/UniversityPredictor';

const Index = () => {
  const [activeTab, setActiveTab] = useState('dashboard');

  const handleLogoClick = () => {
    setActiveTab('dashboard');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-1/2 -left-40 w-80 h-80 bg-purple-500/20 rounded-full blur-3xl animate-pulse delay-700"></div>
        <div className="absolute -bottom-40 left-1/2 w-80 h-80 bg-cyan-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      {/* Floating Particles */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-cyan-400/30 rounded-full animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 10}s`,
              animationDuration: `${10 + Math.random() * 20}s`
            }}
          />
        ))}
      </div>

      {/* Header */}
      <div className="bg-gray-900/80 backdrop-blur-xl border-b border-cyan-500/30 sticky top-0 z-20 shadow-lg shadow-cyan-500/10">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4 cursor-pointer" onClick={handleLogoClick}>
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-400/30 to-purple-400/30 rounded-xl blur-lg group-hover:from-cyan-400/50 group-hover:to-purple-400/50 transition-all duration-500 transform group-hover:scale-110"></div>
                <div className="relative bg-gray-800/50 backdrop-blur-lg rounded-xl p-2 border border-cyan-400/30 group-hover:border-cyan-300/60 transition-all duration-300 transform group-hover:scale-105 group-hover:rotate-2">
                  <img 
                    src="/lovable-uploads/81472227-0dd6-4225-b9a0-2ff50bbe4f1c.png" 
                    alt="Resumate AI Logo" 
                    className="w-12 h-12 object-contain transition-all duration-300 group-hover:brightness-110 group-hover:contrast-110"
                  />
                </div>
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-400/10 to-purple-400/10 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent animate-pulse">
                  Resumate AI
                </h1>
                <p className="text-sm text-cyan-300/80 font-medium">Your AI Career Assistant</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Button 
                variant="outline" 
                size="sm"
                className="border-cyan-400/50 text-cyan-300 hover:bg-cyan-400/10 hover:text-cyan-200 hover:border-cyan-300 transition-all duration-300 hover:shadow-lg hover:shadow-cyan-400/25"
              >
                Sign In
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8 relative z-10">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-9 mb-8 bg-gray-900/60 border border-cyan-500/30 backdrop-blur-lg">
            <TabsTrigger 
              value="dashboard" 
              className="flex items-center space-x-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-cyan-500/20 data-[state=active]:to-purple-500/20 data-[state=active]:text-cyan-300 text-gray-400 hover:text-cyan-400 transition-all duration-300"
            >
              <BarChart3 className="w-4 h-4" />
              <span className="hidden sm:inline">Dashboard</span>
            </TabsTrigger>
            <TabsTrigger 
              value="resume" 
              className="flex items-center space-x-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-cyan-500/20 data-[state=active]:to-purple-500/20 data-[state=active]:text-cyan-300 text-gray-400 hover:text-cyan-400 transition-all duration-300"
            >
              <FileText className="w-4 h-4" />
              <span className="hidden sm:inline">Resume</span>
            </TabsTrigger>
            <TabsTrigger 
              value="cover-letter" 
              className="flex items-center space-x-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-cyan-500/20 data-[state=active]:to-purple-500/20 data-[state=active]:text-cyan-300 text-gray-400 hover:text-cyan-400 transition-all duration-300"
            >
              <FileText className="w-4 h-4" />
              <span className="hidden sm:inline">Cover Letter</span>
            </TabsTrigger>
            <TabsTrigger 
              value="chatbot" 
              className="flex items-center space-x-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-cyan-500/20 data-[state=active]:to-purple-500/20 data-[state=active]:text-cyan-300 text-gray-400 hover:text-cyan-400 transition-all duration-300"
            >
              <MessageCircle className="w-4 h-4" />
              <span className="hidden sm:inline">AI Chat</span>
            </TabsTrigger>
            <TabsTrigger 
              value="university" 
              className="flex items-center space-x-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-cyan-500/20 data-[state=active]:to-purple-500/20 data-[state=active]:text-cyan-300 text-gray-400 hover:text-cyan-400 transition-all duration-300"
            >
              <GraduationCap className="w-4 h-4" />
              <span className="hidden sm:inline">College</span>
            </TabsTrigger>
            <TabsTrigger 
              value="keyword" 
              className="flex items-center space-x-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-cyan-500/20 data-[state=active]:to-purple-500/20 data-[state=active]:text-cyan-300 text-gray-400 hover:text-cyan-400 transition-all duration-300"
            >
              <Search className="w-4 h-4" />
              <span className="hidden sm:inline">Keywords</span>
            </TabsTrigger>
            <TabsTrigger 
              value="analyzer" 
              className="flex items-center space-x-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-cyan-500/20 data-[state=active]:to-purple-500/20 data-[state=active]:text-cyan-300 text-gray-400 hover:text-cyan-400 transition-all duration-300"
            >
              <Briefcase className="w-4 h-4" />
              <span className="hidden sm:inline">Job Match</span>
            </TabsTrigger>
            <TabsTrigger 
              value="translator" 
              className="flex items-center space-x-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-cyan-500/20 data-[state=active]:to-purple-500/20 data-[state=active]:text-cyan-300 text-gray-400 hover:text-cyan-400 transition-all duration-300"
            >
              <Globe className="w-4 h-4" />
              <span className="hidden sm:inline">Translate</span>
            </TabsTrigger>
            <TabsTrigger 
              value="linkedin" 
              className="flex items-center space-x-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-cyan-500/20 data-[state=active]:to-purple-500/20 data-[state=active]:text-cyan-300 text-gray-400 hover:text-cyan-400 transition-all duration-300"
            >
              <Linkedin className="w-4 h-4" />
              <span className="hidden sm:inline">LinkedIn</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-8">
            <div className="text-center py-12 relative">
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 to-purple-500/10 rounded-3xl blur-3xl"></div>
              <div className="relative z-10">
                <h2 className="text-5xl font-bold bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent mb-6 animate-fade-in">
                  Welcome to Resumate AI
                </h2>
                <p className="text-xl text-cyan-200/80 mb-8 max-w-3xl mx-auto leading-relaxed">
                  Your all-in-one AI-powered career toolkit. Generate resumes, cover letters, analyze job matches, and more with cutting-edge AI technology.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card 
                className="bg-gray-900/60 border-cyan-500/30 hover:border-cyan-400/60 backdrop-blur-lg transition-all duration-500 cursor-pointer group hover:scale-105 hover:shadow-xl hover:shadow-cyan-500/25" 
                onClick={() => setActiveTab('resume')}
              >
                <CardHeader>
                  <CardTitle className="flex items-center space-x-3 text-cyan-300 group-hover:text-cyan-200 transition-colors">
                    <div className="p-2 bg-cyan-500/20 rounded-lg group-hover:bg-cyan-500/30 transition-colors">
                      <FileText className="w-5 h-5" />
                    </div>
                    <span>Resume Generator</span>
                  </CardTitle>
                  <CardDescription className="text-gray-400 group-hover:text-gray-300 transition-colors">
                    Create professional resumes with AI assistance
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="bg-gradient-to-r from-cyan-500/10 to-blue-500/10 p-4 rounded-lg border border-cyan-500/20">
                    <p className="text-sm text-cyan-200/80">
                      Generate ATS-friendly resumes tailored to specific job requirements
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card 
                className="bg-gray-900/60 border-purple-500/30 hover:border-purple-400/60 backdrop-blur-lg transition-all duration-500 cursor-pointer group hover:scale-105 hover:shadow-xl hover:shadow-purple-500/25" 
                onClick={() => setActiveTab('cover-letter')}
              >
                <CardHeader>
                  <CardTitle className="flex items-center space-x-3 text-purple-300 group-hover:text-purple-200 transition-colors">
                    <div className="p-2 bg-purple-500/20 rounded-lg group-hover:bg-purple-500/30 transition-colors">
                      <FileText className="w-5 h-5" />
                    </div>
                    <span>Cover Letter Generator</span>
                  </CardTitle>
                  <CardDescription className="text-gray-400 group-hover:text-gray-300 transition-colors">
                    Craft compelling cover letters that get noticed
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 p-4 rounded-lg border border-purple-500/20">
                    <p className="text-sm text-purple-200/80">
                      Personalized cover letters that highlight your strengths
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card 
                className="bg-gray-900/60 border-green-500/30 hover:border-green-400/60 backdrop-blur-lg transition-all duration-500 cursor-pointer group hover:scale-105 hover:shadow-xl hover:shadow-green-500/25" 
                onClick={() => setActiveTab('chatbot')}
              >
                <CardHeader>
                  <CardTitle className="flex items-center space-x-3 text-green-300 group-hover:text-green-200 transition-colors">
                    <div className="p-2 bg-green-500/20 rounded-lg group-hover:bg-green-500/30 transition-colors">
                      <MessageCircle className="w-5 h-5" />
                    </div>
                    <span>AI Career Coach</span>
                  </CardTitle>
                  <CardDescription className="text-gray-400 group-hover:text-gray-300 transition-colors">
                    Get personalized career advice and tips
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 p-4 rounded-lg border border-green-500/20">
                    <p className="text-sm text-green-200/80">
                      24/7 AI assistant for all your career questions
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card 
                className="bg-gray-900/60 border-orange-500/30 hover:border-orange-400/60 backdrop-blur-lg transition-all duration-500 cursor-pointer group hover:scale-105 hover:shadow-xl hover:shadow-orange-500/25" 
                onClick={() => setActiveTab('keyword')}
              >
                <CardHeader>
                  <CardTitle className="flex items-center space-x-3 text-orange-300 group-hover:text-orange-200 transition-colors">
                    <div className="p-2 bg-orange-500/20 rounded-lg group-hover:bg-orange-500/30 transition-colors">
                      <Search className="w-5 h-5" />
                    </div>
                    <span>Keyword Matcher</span>
                  </CardTitle>
                  <CardDescription className="text-gray-400 group-hover:text-gray-300 transition-colors">
                    Optimize your profile for job descriptions
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="bg-gradient-to-r from-orange-500/10 to-yellow-500/10 p-4 rounded-lg border border-orange-500/20">
                    <p className="text-sm text-orange-200/80">
                      Match your skills with job requirements perfectly
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card 
                className="bg-gray-900/60 border-red-500/30 hover:border-red-400/60 backdrop-blur-lg transition-all duration-500 cursor-pointer group hover:scale-105 hover:shadow-xl hover:shadow-red-500/25" 
                onClick={() => setActiveTab('analyzer')}
              >
                <CardHeader>
                  <CardTitle className="flex items-center space-x-3 text-red-300 group-hover:text-red-200 transition-colors">
                    <div className="p-2 bg-red-500/20 rounded-lg group-hover:bg-red-500/30 transition-colors">
                      <Briefcase className="w-5 h-5" />
                    </div>
                    <span>Job Match Analyzer</span>
                  </CardTitle>
                  <CardDescription className="text-gray-400 group-hover:text-gray-300 transition-colors">
                    Analyze your fit for top companies
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="bg-gradient-to-r from-red-500/10 to-rose-500/10 p-4 rounded-lg border border-red-500/20">
                    <p className="text-sm text-red-200/80">
                      Get percentage scores for job compatibility
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card 
                className="bg-gray-900/60 border-indigo-500/30 hover:border-indigo-400/60 backdrop-blur-lg transition-all duration-500 cursor-pointer group hover:scale-105 hover:shadow-xl hover:shadow-indigo-500/25" 
                onClick={() => setActiveTab('translator')}
              >
                <CardHeader>
                  <CardTitle className="flex items-center space-x-3 text-indigo-300 group-hover:text-indigo-200 transition-colors">
                    <div className="p-2 bg-indigo-500/20 rounded-lg group-hover:bg-indigo-500/30 transition-colors">
                      <Globe className="w-5 h-5" />
                    </div>
                    <span>Multilingual Translator</span>
                  </CardTitle>
                  <CardDescription className="text-gray-400 group-hover:text-gray-300 transition-colors">
                    Translate your documents to any language
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="bg-gradient-to-r from-indigo-500/10 to-violet-500/10 p-4 rounded-lg border border-indigo-500/20">
                    <p className="text-sm text-indigo-200/80">
                      Apply globally with translated resumes and cover letters
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card 
                className="bg-gray-900/60 border-blue-500/30 hover:border-blue-400/60 backdrop-blur-lg transition-all duration-500 cursor-pointer group hover:scale-105 hover:shadow-xl hover:shadow-blue-500/25" 
                onClick={() => setActiveTab('linkedin')}
              >
                <CardHeader>
                  <CardTitle className="flex items-center space-x-3 text-blue-300 group-hover:text-blue-200 transition-colors">
                    <div className="p-2 bg-blue-500/20 rounded-lg group-hover:bg-blue-500/30 transition-colors">
                      <Linkedin className="w-5 h-5" />
                    </div>
                    <span>LinkedIn Integration</span>
                  </CardTitle>
                  <CardDescription className="text-gray-400 group-hover:text-gray-300 transition-colors">
                    Analyze and optimize your LinkedIn profile
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="bg-gradient-to-r from-blue-500/10 to-cyan-500/10 p-4 rounded-lg border border-blue-500/20">
                    <p className="text-sm text-blue-200/80">
                      AI-powered LinkedIn profile analysis and resume generation
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card 
                className="bg-gray-900/60 border-yellow-500/30 hover:border-yellow-400/60 backdrop-blur-lg transition-all duration-500 cursor-pointer group hover:scale-105 hover:shadow-xl hover:shadow-yellow-500/25" 
                onClick={() => setActiveTab('university')}
              >
                <CardHeader>
                  <CardTitle className="flex items-center space-x-3 text-yellow-300 group-hover:text-yellow-200 transition-colors">
                    <div className="p-2 bg-yellow-500/20 rounded-lg group-hover:bg-yellow-500/30 transition-colors">
                      <GraduationCap className="w-5 h-5" />
                    </div>
                    <span>College Predictor</span>
                  </CardTitle>
                  <CardDescription className="text-gray-400 group-hover:text-gray-300 transition-colors">
                    For high school students - predict university admission chances
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="bg-gradient-to-r from-yellow-500/10 to-orange-500/10 p-4 rounded-lg border border-yellow-500/20">
                    <p className="text-sm text-yellow-200/80">
                      Get personalized university match percentages and improvement tips
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="resume">
            <ResumeGenerator />
          </TabsContent>

          <TabsContent value="cover-letter">
            <CoverLetterGenerator />
          </TabsContent>

          <TabsContent value="chatbot">
            <AIChatbot />
          </TabsContent>

          <TabsContent value="university">
            <UniversityPredictor />
          </TabsContent>

          <TabsContent value="keyword">
            <KeywordMatcher />
          </TabsContent>

          <TabsContent value="analyzer">
            <JobAnalyzer />
          </TabsContent>

          <TabsContent value="translator">
            <MultilingualTranslator />
          </TabsContent>

          <TabsContent value="linkedin">
            <LinkedInIntegration />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Index;
