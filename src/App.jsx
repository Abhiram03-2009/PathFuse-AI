import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { NeonText } from './components/NeonText';
import ResumeBuilder from './components/ResumeBuilder';
import KeywordMatcher from './components/KeywordMatcher';
import JobMatcher from './components/JobMatcher';
import CareerChatbot from './components/CareerChatbot';
import MultilingualSupport from './components/MultilingualSupport';
import CoverLetterBuilder from "./components/CoverLetterBuilder";
import logo from './icons/icon16.png';

const App = () => {
  const [activeSection, setActiveSection] = useState('home');

  const renderSection = () => {
    switch (activeSection) {
      case 'resume':
        return <ResumeBuilder />;
      case 'keywords':
        return <KeywordMatcher />;
      case 'jobs':
        return <JobMatcher />;
      case 'cover letter':
        return <CoverLetterBuilder />;
      case 'chat':
        return <CareerChatbot />;
      case 'translate':
        return <MultilingualSupport />;
      default:
        return (
          <div className="flex flex-col items-center space-y-6 mt-10 w-full">
            {[
              {
                title: 'Resume Builder',
                desc: 'Craft resumes tailored to jobs.',
                icon: '📄',
                section: 'resume',
              },
              {
                title: 'Keyword Matcher',
                desc: 'Match your resume to job listings.',
                icon: '🔍',
                section: 'keywords',
              },
              {
                title: 'Job Matcher',
                desc: 'Discover ideal job fits.',
                icon: '💼',
                section: 'jobs',
              },
              {
                title: 'Cover Letter Generator',
                desc: 'Write job-specific cover letters.',
                icon: '✉️',
                section: 'cover letter',
              },
              {
                title: 'Translator',
                desc: 'Translate your resume.',
                icon: '🌐',
                section: 'translate',
              },
              {
                title: 'Career Chatbot',
                desc: 'Get AI-powered career guidance.',
                icon: '🤖',
                section: 'chat',
              },
            ].map((tool, i) => (
              <motion.button
                key={i}
                onClick={() => setActiveSection(tool.section)}
                whileHover={{ scale: 1.05, boxShadow: '0 0 20px cyan' }}
                className="w-3/4 max-w-md p-6 bg-gray-800 bg-opacity-30 rounded-2xl text-center border border-cyan-400 neon-text transition-all duration-300"
              >
                <div className="text-4xl mb-2">{tool.icon}</div>
                <h2 className="text-xl font-semibold mb-1">{tool.title}</h2>
                <p className="text-sm text-gray-300">{tool.desc}</p>
              </motion.button>
            ))}
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-black via-gray-900 to-gray-800 text-white">
      {/* Sidebar */}
      <div className="w-64 bg-gray-950 p-6 space-y-4 border-r border-gray-800">
        <div className="flex items-center space-x-3">
          <img src={logo} alt="logo" className="w-8 h-8" />
          <h2 className="text-2xl font-bold neon-text">Resumate AI</h2>
        </div>
        <nav className="space-y-2 mt-4">
          <button onClick={() => setActiveSection('home')} className="block w-full text-left hover:text-neon">🏠 Home</button>
          <button onClick={() => setActiveSection('resume')} className="block w-full text-left hover:text-neon">📄 Resume Builder</button>
          <button onClick={() => setActiveSection('keywords')} className="block w-full text-left hover:text-neon">🔍 Keyword Matcher</button>
          <button onClick={() => setActiveSection('jobs')} className="block w-full text-left hover:text-neon">💼 Job Matcher</button>
          <button onClick={() => setActiveSection('cover letter')} className="block w-full text-left hover:text-neon">✉️ Cover Letter Generator</button>
          <button onClick={() => setActiveSection('translate')} className="block w-full text-left hover:text-neon">🌐 Translator</button>
          <button onClick={() => setActiveSection('chat')} className="block w-full text-left hover:text-neon">🤖 Career Chatbot</button>
        </nav>
      </div>

      {/* Main Content */}
      <main className="flex-1 p-8 space-y-6 overflow-y-auto relative">
        {activeSection === 'home' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1 }}
            className="flex justify-center items-center"
          >
            <img src={logo} alt="Resumate AI Logo" className="h-24 w-24 animate-pulse" />
            <h1 className="text-5xl font-extrabold neon-text ml-4">Resumate AI</h1>
          </motion.div>
        )}
        {renderSection()}

        {activeSection === 'home' && (
          <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 via-blue-800/10 to-purple-500/10 pointer-events-none animate-pulse blur-2xl" />
        )}
      </main>
    </div>
  );
};

export default App;
