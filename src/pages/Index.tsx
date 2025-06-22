
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileText, MessageCircle, Search, BarChart3, Globe, Briefcase, Sparkles } from 'lucide-react';
import ResumeGenerator from '@/components/ResumeGenerator';
import CoverLetterGenerator from '@/components/CoverLetterGenerator';
import AIChatbot from '@/components/AIChatbot';
import KeywordMatcher from '@/components/KeywordMatcher';
import JobAnalyzer from '@/components/JobAnalyzer';
import MultilingualTranslator from '@/components/MultilingualTranslator';

const Index = () => {
  const [activeTab, setActiveTab] = useState('dashboard');

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b sticky top-0 z-10">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Resumate AI
                </h1>
                <p className="text-sm text-gray-600">Your AI Career Assistant</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="outline" size="sm">
                Sign In
              </Button>
              <Button size="sm" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                Get Pro
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-7 mb-8">
            <TabsTrigger value="dashboard" className="flex items-center space-x-2">
              <BarChart3 className="w-4 h-4" />
              <span className="hidden sm:inline">Dashboard</span>
            </TabsTrigger>
            <TabsTrigger value="resume" className="flex items-center space-x-2">
              <FileText className="w-4 h-4" />
              <span className="hidden sm:inline">Resume</span>
            </TabsTrigger>
            <TabsTrigger value="cover-letter" className="flex items-center space-x-2">
              <FileText className="w-4 h-4" />
              <span className="hidden sm:inline">Cover Letter</span>
            </TabsTrigger>
            <TabsTrigger value="chatbot" className="flex items-center space-x-2">
              <MessageCircle className="w-4 h-4" />
              <span className="hidden sm:inline">AI Chat</span>
            </TabsTrigger>
            <TabsTrigger value="keyword" className="flex items-center space-x-2">
              <Search className="w-4 h-4" />
              <span className="hidden sm:inline">Keywords</span>
            </TabsTrigger>
            <TabsTrigger value="analyzer" className="flex items-center space-x-2">
              <Briefcase className="w-4 h-4" />
              <span className="hidden sm:inline">Job Match</span>
            </TabsTrigger>
            <TabsTrigger value="translator" className="flex items-center space-x-2">
              <Globe className="w-4 h-4" />
              <span className="hidden sm:inline">Translate</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-6">
            <div className="text-center py-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Welcome to Resumate AI
              </h2>
              <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
                Your all-in-one AI-powered career toolkit. Generate resumes, cover letters, analyze job matches, and more.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => setActiveTab('resume')}>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <FileText className="w-5 h-5 text-blue-600" />
                    <span>Resume Generator</span>
                  </CardTitle>
                  <CardDescription>
                    Create professional resumes with AI assistance
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <p className="text-sm text-blue-700">
                      Generate ATS-friendly resumes tailored to specific job requirements
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => setActiveTab('cover-letter')}>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <FileText className="w-5 h-5 text-purple-600" />
                    <span>Cover Letter Generator</span>
                  </CardTitle>
                  <CardDescription>
                    Craft compelling cover letters that get noticed
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="bg-purple-50 p-4 rounded-lg">
                    <p className="text-sm text-purple-700">
                      Personalized cover letters that highlight your strengths
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => setActiveTab('chatbot')}>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <MessageCircle className="w-5 h-5 text-green-600" />
                    <span>AI Career Coach</span>
                  </CardTitle>
                  <CardDescription>
                    Get personalized career advice and tips
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="bg-green-50 p-4 rounded-lg">
                    <p className="text-sm text-green-700">
                      24/7 AI assistant for all your career questions
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => setActiveTab('keyword')}>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Search className="w-5 h-5 text-orange-600" />
                    <span>Keyword Matcher</span>
                  </CardTitle>
                  <CardDescription>
                    Optimize your profile for job descriptions
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="bg-orange-50 p-4 rounded-lg">
                    <p className="text-sm text-orange-700">
                      Match your skills with job requirements perfectly
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => setActiveTab('analyzer')}>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Briefcase className="w-5 h-5 text-red-600" />
                    <span>Job Match Analyzer</span>
                  </CardTitle>
                  <CardDescription>
                    Analyze your fit for top companies
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="bg-red-50 p-4 rounded-lg">
                    <p className="text-sm text-red-700">
                      Get percentage scores for job compatibility
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => setActiveTab('translator')}>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Globe className="w-5 h-5 text-indigo-600" />
                    <span>Multilingual Translator</span>
                  </CardTitle>
                  <CardDescription>
                    Translate your documents to any language
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="bg-indigo-50 p-4 rounded-lg">
                    <p className="text-sm text-indigo-700">
                      Apply globally with translated resumes and cover letters
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

          <TabsContent value="keyword">
            <KeywordMatcher />
          </TabsContent>

          <TabsContent value="analyzer">
            <JobAnalyzer />
          </TabsContent>

          <TabsContent value="translator">
            <MultilingualTranslator />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Index;
