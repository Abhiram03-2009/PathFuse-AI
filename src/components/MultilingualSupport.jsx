import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Globe, Check, FileText as FileTextIcon, Languages as LanguagesIcon } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { NeonButton } from "@/components/NeonButton";
import { NeonText } from "@/components/NeonText";
import { GlassCard } from "@/components/GlassCard";
import { getSavedResumes, getResumeById, saveResume } from "@/lib/utils";
import { supportedLanguages } from "@/lib/resume-data";
import { useToast } from "@/components/ui/use-toast";
import axios from 'axios';

const MultilingualSupport = () => {
  const { toast } = useToast();
  const [savedResumes, setSavedResumes] = useState([]);
  const [selectedResumeId, setSelectedResumeId] = useState("");
  const [selectedLanguage, setSelectedLanguage] = useState(supportedLanguages[0]?.code || "en");
  const [translatedResume, setTranslatedResume] = useState(null);
  const [isTranslating, setIsTranslating] = useState(false);
  const [originalResume, setOriginalResume] = useState(null);

  useEffect(() => {
    const resumes = getSavedResumes();
    setSavedResumes(resumes);
    if (resumes.length > 0) {
      setSelectedResumeId(resumes[0].id);
      setOriginalResume(getResumeById(resumes[0].id));
    }
  }, []);

  useEffect(() => {
    if (selectedResumeId) {
      setOriginalResume(getResumeById(selectedResumeId));
      setTranslatedResume(null); // Reset translated resume when original changes
    }
  }, [selectedResumeId]);

  const translateResume = async (resume, targetLang) => {
    try {
      const response = await axios.post('https://libretranslate.com/translate', {
        q: resume.summary, // Translate resume summary for now
        source: 'en', // Assuming source language is English
        target: targetLang,
        format: 'text',
      });

      return { ...resume, summary: response.data.translatedText }; // Update with translated summary
    } catch (error) {
      console.error('Translation failed:', error);
      throw new Error('Translation failed');
    }
  };

  const handleTranslate = async () => {
    if (!originalResume) {
      toast({
        title: "Resume Required",
        description: "Please select a resume to translate.",
        variant: "destructive",
      });
      return;
    }

    setIsTranslating(true);
    
    try {
      const translated = await translateResume(originalResume, selectedLanguage);
      setTranslatedResume(translated);
      
      toast({
        title: "Translation Complete",
        description: `Resume translated to ${supportedLanguages.find(l => l.code === selectedLanguage)?.name || selectedLanguage}. Preview below.`,
      });
    } catch (error) {
      toast({
        title: "Translation Failed",
        description: "There was an error translating your resume. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsTranslating(false);
    }
  };

  const handleSaveTranslatedResume = () => {
    if (!translatedResume) return;
    
    const translatedResumeToSave = {
      ...translatedResume,
      personalInfo: {
        ...translatedResume.personalInfo,
        name: `${translatedResume.personalInfo.name} (${supportedLanguages.find(l => l.code === selectedLanguage)?.name || selectedLanguage})`
      },
      isTranslated: true,
      originalLanguage: originalResume?.language || 'en', 
      translatedLanguage: selectedLanguage
    };

    const resumeId = saveResume(translatedResumeToSave);
    if (resumeId) {
      toast({
        title: "Translated Resume Saved",
        description: "Your translated resume has been saved successfully!",
      });
      // Refresh saved resumes list
      setSavedResumes(getSavedResumes());
    } else {
      toast({
        title: "Save Failed",
        description: "There was an error saving your translated resume.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-6"
      >
        <GlassCard className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center">
              <LanguagesIcon className="h-6 w-6 mr-2 text-cyan-400" />
              <NeonText as="h2" className="text-2xl">Multilingual Resume Support</NeonText>
            </CardTitle>
            <CardDescription>
              Translate your resume into multiple languages to apply for international positions.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Select Your Resume</label>
              {savedResumes.length > 0 ? (
                <Select value={selectedResumeId} onValueChange={setSelectedResumeId}>
                  <SelectTrigger className="bg-background/40 border-purple-500/20">
                    <SelectValue placeholder="Select a resume" />
                  </SelectTrigger>
                  <SelectContent>
                    {savedResumes.map((resume) => (
                      <SelectItem key={resume.id} value={resume.id}>
                        {resume.personalInfo?.name || "Unnamed Resume"} - {new Date(resume.createdAt).toLocaleDateString()}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <div className="p-4 bg-background/40 border border-purple-500/20 rounded-md text-center">
                  <p className="text-muted-foreground">No saved resumes found. Please create or import a resume first.</p>
                </div>
              )}
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Target Language</label>
              <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
                <SelectTrigger className="bg-background/40 border-purple-500/20">
                  <SelectValue placeholder="Select language" />
                </SelectTrigger>
                <SelectContent>
                  {supportedLanguages.map((language) => (
                    <SelectItem key={language.code} value={language.code}>
                      {language.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            {originalResume && (
               <div className="p-4 bg-background/40 border border-purple-500/20 rounded-md">
                 <h3 className="font-medium mb-2 flex items-center">
                   <FileTextIcon className="h-4 w-4 mr-2 text-purple-400" />
                   Selected Resume: <span className="ml-1 text-cyan-400">{originalResume.personalInfo?.name || "Unnamed"}</span>
                 </h3>
                 <p className="text-xs text-muted-foreground">
                   Summary: {originalResume.summary?.substring(0,100) || "No summary"}...
                 </p>
               </div>
            )}

          </CardContent>
          <CardFooter>
            <NeonButton 
              onClick={handleTranslate} 
              disabled={isTranslating || !originalResume}
              className="w-full"
              glowColor="rgba(147, 51, 234, 0.5)"
            >
              {isTranslating ? (
                <>Translating...</>
              ) : (
                <>
                  <Globe className="mr-2 h-4 w-4" />
                  Translate Resume
                </>
              )}
            </NeonButton>
          </CardFooter>
        </GlassCard>
        
        {translatedResume && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <GlassCard>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>
                    <NeonText as="h2" color="cyan" className="text-xl">Translated Resume Preview</NeonText>
                  </CardTitle>
                  <CardDescription>
                    Language: {supportedLanguages.find(l => l.code === selectedLanguage)?.name || selectedLanguage}
                  </CardDescription>
                </div>
                <NeonButton onClick={handleSaveTranslatedResume} glowColor="rgba(56, 189, 248, 0.5)">
                  Save Translated Version
                </NeonButton>
              </CardHeader>
              <CardContent>
                <div className="p-6 bg-white text-black rounded-lg shadow-xl max-h-[400px] overflow-y-auto">
                  <h3 className="text-lg font-semibold text-gray-800">
                    {translatedResume.personalInfo.name} (Translated to {supportedLanguages.find(l => l.code === selectedLanguage)?.name})
                  </h3>
                  <p className="text-md text-gray-600">{translatedResume.personalInfo.title}</p>
                  <hr className="my-2"/>
                  <p className="text-sm text-gray-700"><strong>Summary (Translated):</strong> {translatedResume.summary}</p>
                  <p className="text-sm text-gray-700 mt-2">
                    <strong>Skills (Translated):</strong> {translatedResume.skills.join(', ')}
                  </p>
                  <p className="text-xs text-muted-foreground mt-4">
                    (Note: This is a simplified preview of the translated content. Full formatting is applied upon export.)
                  </p>
                </div>
              </CardContent>
            </GlassCard>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};

export default MultilingualSupport;
