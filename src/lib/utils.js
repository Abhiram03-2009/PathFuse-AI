
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs) {
	return twMerge(clsx(inputs));
}

// Function to generate a resume from LinkedIn bio
export function generateResumeFromBio(bio, template = "modern") {
  // This is a mock function that would be replaced with actual AI processing
  if (!bio) return null;
  
  // Extract name (assuming first line or first sentence contains the name)
  const nameMatch = bio.match(/^([A-Za-z\s]+)/);
  const name = nameMatch ? nameMatch[0].trim() : "John Doe";
  
  // Extract skills (look for common skill keywords)
  const skillKeywords = [
    "JavaScript", "React", "Node.js", "Python", "Java", "C++", "C#", 
    "Management", "Leadership", "Communication", "Project Management",
    "Marketing", "Sales", "Design", "UX", "UI", "Product", "Data",
    "Analysis", "Research", "Development", "Engineering"
  ];
  
  const skills = skillKeywords.filter(skill => 
    bio.toLowerCase().includes(skill.toLowerCase())
  );
  
  // Extract possible job titles
  const titleRegex = /(?:^|\s)(developer|engineer|manager|designer|analyst|specialist|consultant|director|vp|chief|ceo|cto|cfo)(?:\s|$)/i;
  const titleMatch = bio.match(titleRegex);
  const title = titleMatch ? 
    titleMatch[0].trim().charAt(0).toUpperCase() + titleMatch[0].trim().slice(1) : 
    "Professional";
  
  // Generate a simple resume structure
  return {
    template,
    personalInfo: {
      name,
      title: `${skills[0] || ""} ${title}`.trim(),
      email: "example@email.com",
      phone: "(555) 123-4567",
      location: "New York, NY",
      linkedin: "linkedin.com/in/username"
    },
    summary: bio.substring(0, 200) + "...",
    skills: skills.length > 0 ? skills : ["Professional Skills", "Communication", "Teamwork"],
    experience: [
      {
        title: `${skills[0] || "Senior"} ${title}`,
        company: "Company Name",
        location: "New York, NY",
        dates: "2020 - Present",
        description: "Professional experience extracted from LinkedIn profile."
      }
    ],
    education: [
      {
        degree: "Bachelor's Degree",
        institution: "University Name",
        location: "City, State",
        dates: "2012 - 2016"
      }
    ]
  };
}

// Function to match resume keywords with job description
export function matchKeywords(resumeText, jobDescription) {
  if (!resumeText || !jobDescription) return { matches: [], missing: [], score: 0 };
  
  // Convert texts to lowercase for case-insensitive matching
  const resumeLower = resumeText.toLowerCase();
  const jobLower = jobDescription.toLowerCase();
  
  // Extract potential keywords from job description (words longer than 4 characters)
  const jobWords = jobLower.match(/\b[a-z]{5,}\b/g) || [];
  
  // Filter to unique words and sort by length (longer words first - likely more important)
  const uniqueJobWords = [...new Set(jobWords)].sort((a, b) => b.length - a.length);
  
  // Take top keywords (most significant)
  const keywords = uniqueJobWords.slice(0, 20);
  
  // Find matches and missing keywords
  const matches = keywords.filter(word => resumeLower.includes(word));
  const missing = keywords.filter(word => !resumeLower.includes(word));
  
  // Calculate match score (percentage)
  const score = Math.round((matches.length / keywords.length) * 100);
  
  return { matches, missing, score };
}

// Function to calculate job match percentage
export function calculateJobMatch(resume, company) {
  if (!resume || !company || !company.keywords) return 0;
  
  const resumeText = JSON.stringify(resume).toLowerCase();
  let matchCount = 0;
  
  company.keywords.forEach(keyword => {
    if (resumeText.includes(keyword.toLowerCase())) {
      matchCount++;
    }
  });
  
  return Math.round((matchCount / company.keywords.length) * 100);
}

// Simple translation function (mock)
export function translateResume(resume, targetLanguage) {
  // This would be replaced with actual translation API
  // For now, we'll just add a language indicator
  if (!resume) return null;
  
  const translated = { ...resume };
  translated.language = targetLanguage;
  translated.isTranslated = true;
  
  return translated;
}

// Function to rate a resume (mock)
export function rateResume(resume) {
  if (!resume) return { score: 0, feedback: [] };
  
  let score = 70; // Base score
  const feedback = [];
  
  // Check for personal info completeness
  if (resume.personalInfo) {
    if (!resume.personalInfo.email) {
      score -= 5;
      feedback.push("Missing email contact information");
    }
    if (!resume.personalInfo.phone) {
      score -= 3;
      feedback.push("Missing phone contact information");
    }
  } else {
    score -= 10;
    feedback.push("Missing personal information section");
  }
  
  // Check for skills
  if (!resume.skills || resume.skills.length < 3) {
    score -= 10;
    feedback.push("Add more relevant skills (aim for at least 5-7)");
  }
  
  // Check for experience
  if (!resume.experience || resume.experience.length === 0) {
    score -= 20;
    feedback.push("Missing work experience section");
  } else if (resume.experience.length < 2) {
    score -= 5;
    feedback.push("Consider adding more work experience if available");
  }
  
  // Check for education
  if (!resume.education || resume.education.length === 0) {
    score -= 10;
    feedback.push("Missing education section");
  }
  
  // Check for summary
  if (!resume.summary || resume.summary.length < 50) {
    score -= 10;
    feedback.push("Add a more detailed professional summary");
  }
  
  // Ensure score is within bounds
  score = Math.max(0, Math.min(100, score));
  
  return { score, feedback };
}

// Save resume to localStorage
export function saveResume(resume) {
  if (!resume) return false;
  
  try {
    const savedResumes = JSON.parse(localStorage.getItem('resumes') || '[]');
    const newResume = {
      id: Date.now().toString(),
      ...resume,
      createdAt: new Date().toISOString()
    };
    
    savedResumes.push(newResume);
    localStorage.setItem('resumes', JSON.stringify(savedResumes));
    return newResume.id;
  } catch (error) {
    console.error("Error saving resume:", error);
    return false;
  }
}

// Get all saved resumes
export function getSavedResumes() {
  try {
    return JSON.parse(localStorage.getItem('resumes') || '[]');
  } catch (error) {
    console.error("Error getting saved resumes:", error);
    return [];
  }
}

// Get a specific resume by ID
export function getResumeById(id) {
  try {
    const resumes = JSON.parse(localStorage.getItem('resumes') || '[]');
    return resumes.find(resume => resume.id === id) || null;
  } catch (error) {
    console.error("Error getting resume by ID:", error);
    return null;
  }
}

// Delete a resume by ID
export function deleteResume(id) {
  try {
    const resumes = JSON.parse(localStorage.getItem('resumes') || '[]');
    const updatedResumes = resumes.filter(resume => resume.id !== id);
    localStorage.setItem('resumes', JSON.stringify(updatedResumes));
    return true;
  } catch (error) {
    console.error("Error deleting resume:", error);
    return false;
  }
}
