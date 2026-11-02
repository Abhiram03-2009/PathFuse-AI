import React, { useState } from "react";
import { motion } from "framer-motion";
import { Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { NeonButton } from "@/components/NeonButton";
import { NeonText } from "@/components/NeonText";
import { GlassCard } from "@/components/GlassCard";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

const CoverLetter = () => {
  const [jobTitle, setJobTitle] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [skills, setSkills] = useState("");
  const [letter, setLetter] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = () => {
    if (!jobTitle || !companyName || !skills) return;
    setIsGenerating(true);

    setTimeout(() => {
      const generated = `
Dear Hiring Manager at ${companyName},

I am writing to express my interest in the ${jobTitle} position at your esteemed organization. With a strong background in ${skills}, I am confident in my ability to contribute meaningfully to your team.

Throughout my career, I have demonstrated initiative, adaptability, and technical expertise. I am particularly drawn to ${companyName}'s commitment to innovation, and I am excited about the opportunity to be a part of it.

Thank you for considering my application. I look forward to the possibility of contributing to your team.

Sincerely,
[Your Name]
      `;
      setLetter(generated.trim());
      setIsGenerating(false);
    }, 1500);
  };

  const exportPDF = async () => {
    const input = document.getElementById("cover-letter-preview");
    if (!input) return;

    const canvas = await html2canvas(input);
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF("p", "mm", "a4");
    const width = pdf.internal.pageSize.getWidth();
    const height = (canvas.height * width) / canvas.width;

    pdf.addImage(imgData, "PNG", 10, 10, width - 20, height);
    pdf.save("cover-letter.pdf");
  };

  return (
    <div className="w-full max-w-3xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <GlassCard className="mb-6">
          <CardHeader>
            <CardTitle>
              <NeonText as="h2" className="text-2xl">
                Cover Letter Generator
              </NeonText>
            </CardTitle>
            <CardDescription>
              Enter your job information to generate a professional cover letter
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="jobTitle">Job Title</Label>
              <Textarea
                id="jobTitle"
                placeholder="e.g., AI/ML Engineer"
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="companyName">Company Name</Label>
              <Textarea
                id="companyName"
                placeholder="e.g., OpenAI, Google"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="skills">Relevant Skills</Label>
              <Textarea
                id="skills"
                placeholder="e.g., Python, NLP, neural networks"
                value={skills}
                onChange={(e) => setSkills(e.target.value)}
              />
            </div>
          </CardContent>

          <CardFooter>
            <NeonButton
              onClick={handleGenerate}
              disabled={isGenerating}
              className="w-full"
              glowColor="rgba(147, 51, 234, 0.5)"
            >
              {isGenerating ? "Generating..." : <>Generate Cover Letter</>}
            </NeonButton>
          </CardFooter>
        </GlassCard>

        {letter && (
          <GlassCard>
            <CardHeader>
              <CardTitle>
                <NeonText as="h2" className="text-xl">
                  Generated Cover Letter
                </NeonText>
              </CardTitle>
              <CardDescription>Edit or export your letter below</CardDescription>
            </CardHeader>

            <CardContent>
              <div
                id="cover-letter-preview"
                className="bg-white text-black p-6 rounded-lg shadow-md whitespace-pre-wrap"
              >
                {letter}
              </div>
            </CardContent>

            <CardFooter className="flex justify-end">
              <Button variant="outline" onClick={exportPDF}>
                <Upload className="mr-2 h-4 w-4" />
                Export PDF
              </Button>
            </CardFooter>
          </GlassCard>
        )}
      </motion.div>
    </div>
  );
};

export default CoverLetter;
