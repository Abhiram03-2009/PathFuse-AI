import React, { useState } from "react";
import { motion } from "framer-motion";
import { FileText, Upload, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { NeonButton } from "@/components/NeonButton";
import { NeonText } from "@/components/NeonText";
import { GlassCard } from "@/components/GlassCard";
import { generateResumeFromBio, saveResume } from "@/lib/utils";
import { resumeTemplates } from "@/lib/resume-data";
import { useToast } from "@/components/ui/use-toast";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

const ResumeBuilder = () => {
  const { toast } = useToast();
  const [linkedInBio, setLinkedInBio] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState("modern");
  const [generatedResume, setGeneratedResume] = useState(null);
  const [activeTab, setActiveTab] = useState("input");
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerateResume = () => {
    if (!linkedInBio.trim()) {
      toast({
        title: "Input Required",
        description: "Please enter your LinkedIn bio or profile information.",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    setTimeout(() => {
      try {
        const resume = generateResumeFromBio(linkedInBio, selectedTemplate);
        setGeneratedResume(resume);
        setActiveTab("preview");
        toast({
          title: "Resume Generated",
          description: "Your resume has been successfully created!",
        });
      } catch (error) {
        toast({
          title: "Generation Failed",
          description: "There was an error generating your resume. Please try again.",
          variant: "destructive",
        });
        console.error("Resume generation error:", error);
      } finally {
        setIsGenerating(false);
      }
    }, 1500);
  };

  const handleSaveResume = () => {
    if (!generatedResume) return;

    const resumeId = saveResume(generatedResume);
    if (resumeId) {
      toast({
        title: "Resume Saved",
        description: "Your resume has been saved successfully!",
      });
    } else {
      toast({
        title: "Save Failed",
        description: "There was an error saving your resume. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleExportPDF = () => {
    const input = document.getElementById("resume-preview");
    if (!input) {
      toast({
        title: "Export Failed",
        description: "Resume content not found. Please try regenerating.",
        variant: "destructive",
      });
      return;
    }

    html2canvas(input, { scale: 2 }).then((canvas) => {
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "pt", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const imgProps = pdf.getImageProperties(imgData);
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save("resume.pdf");
    });
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-8 bg-background/20 backdrop-blur-sm border border-purple-500/20">
          <TabsTrigger value="input" className="data-[state=active]:bg-purple-500/20 data-[state=active]:text-white">
            <FileText className="mr-2 h-4 w-4" />
            Input
          </TabsTrigger>
          <TabsTrigger value="preview" className="data-[state=active]:bg-purple-500/20 data-[state=active]:text-white" disabled={!generatedResume}>
            <FileText className="mr-2 h-4 w-4" />
            Preview
          </TabsTrigger>
        </TabsList>

        {/* INPUT TAB */}
        <TabsContent value="input" className="space-y-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <GlassCard className="mb-6">
              <CardHeader>
                <CardTitle>
                  <NeonText as="h2" className="text-2xl">Resume Generator</NeonText>
                </CardTitle>
                <CardDescription>
                  Enter your LinkedIn bio or paste your profile information to generate a professional resume.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="linkedin-bio">LinkedIn Bio or Profile Information</Label>
                  <Textarea
                    id="linkedin-bio"
                    placeholder="Paste your LinkedIn bio or profile information here..."
                    className="min-h-[200px] bg-background/40 border-purple-500/20"
                    value={linkedInBio}
                    onChange={(e) => setLinkedInBio(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="template">Resume Template</Label>
                  <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
                    <SelectTrigger id="template" className="bg-background/40 border-purple-500/20">
                      <SelectValue placeholder="Select a template" />
                    </SelectTrigger>
                    <SelectContent>
                      {resumeTemplates.map((template) => (
                        <SelectItem key={template.id} value={template.id}>
                          {template.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
              <CardFooter>
                <NeonButton
                  onClick={handleGenerateResume}
                  disabled={isGenerating || !linkedInBio.trim()}
                  className="w-full"
                  glowColor="rgba(147, 51, 234, 0.5)"
                >
                  {isGenerating ? "Generating Resume..." : (
                    <>
                      <FileText className="mr-2 h-4 w-4" />
                      Generate Resume
                    </>
                  )}
                </NeonButton>
              </CardFooter>
            </GlassCard>
          </motion.div>
        </TabsContent>

        {/* PREVIEW TAB */}
        <TabsContent value="preview">
          {generatedResume && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="space-y-6">
              <GlassCard>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>
                      <NeonText as="h2" className="text-2xl">Resume Preview</NeonText>
                    </CardTitle>
                    <CardDescription>
                      Template: {resumeTemplates.find(t => t.id === generatedResume.template)?.name || "Modern Professional"}
                    </CardDescription>
                  </div>
                  <NeonButton onClick={handleSaveResume} glowColor="rgba(56, 189, 248, 0.5)">
                    Save Resume
                  </NeonButton>
                </CardHeader>
                <CardContent>
                  <div id="resume-preview" className="p-6 bg-white text-black rounded-lg shadow-xl">
                    <div className="mb-6 border-b border-gray-200 pb-6">
                      <h1 className="text-3xl font-bold text-gray-800">{generatedResume.personalInfo.name}</h1>
                      <p className="text-xl text-gray-600">{generatedResume.personalInfo.title}</p>
                      <div className="mt-2 flex flex-wrap gap-2 text-sm text-gray-600">
                        <span>{generatedResume.personalInfo.email}</span>
                        <span>•</span>
                        <span>{generatedResume.personalInfo.phone}</span>
                        <span>•</span>
                        <span>{generatedResume.personalInfo.location}</span>
                      </div>
                    </div>

                    <div className="mb-6">
                      <h2 className="text-xl font-semibold text-gray-800 mb-2">Summary</h2>
                      <p className="text-gray-700">{generatedResume.summary}</p>
                    </div>

                    <div className="mb-6">
                      <h2 className="text-xl font-semibold text-gray-800 mb-2">Skills</h2>
                      <div className="flex flex-wrap gap-2">
                        {generatedResume.skills.map((skill, index) => (
                          <span key={index} className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm">
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="mb-6">
                      <h2 className="text-xl font-semibold text-gray-800 mb-2">Experience</h2>
                      {generatedResume.experience.map((exp, index) => (
                        <div key={index} className="mb-4">
                          <div className="flex justify-between">
                            <h3 className="font-medium text-gray-800">{exp.title}</h3>
                            <span className="text-gray-600 text-sm">{exp.dates}</span>
                          </div>
                          <div className="text-gray-700">{exp.company}, {exp.location}</div>
                          <p className="mt-1 text-gray-600">{exp.description}</p>
                        </div>
                      ))}
                    </div>

                    <div>
                      <h2 className="text-xl font-semibold text-gray-800 mb-2">Education</h2>
                      {generatedResume.education.map((edu, index) => (
                        <div key={index} className="mb-2">
                          <div className="flex justify-between">
                            <h3 className="font-medium text-gray-800">{edu.degree}</h3>
                            <span className="text-gray-600 text-sm">{edu.dates}</span>
                          </div>
                          <div className="text-gray-700">{edu.institution}, {edu.location}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button variant="outline" onClick={() => setActiveTab("input")}>
                    Edit Input
                  </Button>
                  <div className="flex space-x-2">
                    <Button variant="outline" onClick={handleExportPDF}>
                      <Upload className="mr-2 h-4 w-4" />
                      Export PDF
                    </Button>
                    <NeonButton onClick={handleSaveResume} glowColor="rgba(56, 189, 248, 0.5)">
                      <Check className="mr-2 h-4 w-4" />
                      Save Resume
                    </NeonButton>
                  </div>
                </CardFooter>
              </GlassCard>
            </motion.div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ResumeBuilder;
