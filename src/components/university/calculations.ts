
import { StudentStats, University, UniversityMatch } from './types';

export const calculateMatchPercentage = (university: University, stats: StudentStats): number => {
  let score = 0;
  
  // GPA comparison (35% weight)
  const gpaRatio = stats.gpaWeighted / university.avgGpa;
  const gpaScore = Math.min(gpaRatio * 35, 40);
  
  // SAT comparison (25% weight)
  const satRatio = stats.satScore > 0 ? stats.satScore / university.avgSat : 0.7;
  const satScore = Math.min(satRatio * 25, 30);
  
  // Class rank percentile (15% weight)
  const classRankPercentile = ((stats.totalStudents - stats.classRank + 1) / stats.totalStudents) * 100;
  const rankScore = Math.min(classRankPercentile * 0.15, 15);
  
  // Extracurriculars depth analysis (15% weight)
  const ecWords = stats.extracurriculars.toLowerCase();
  let ecScore = 0;
  
  // Check for leadership keywords
  if (ecWords.includes('president') || ecWords.includes('captain') || ecWords.includes('leader')) ecScore += 5;
  if (ecWords.includes('volunteer') || ecWords.includes('community')) ecScore += 3;
  if (ecWords.includes('research') || ecWords.includes('internship')) ecScore += 4;
  if (ecWords.includes('award') || ecWords.includes('competition')) ecScore += 3;
  
  // Length and diversity bonus
  const ecLength = stats.extracurriculars.length;
  if (ecLength > 200) ecScore += 2;
  if (ecLength > 400) ecScore += 1;
  
  ecScore = Math.min(ecScore, 15);
  
  // AP courses (10% weight)
  const apScore = Math.min(stats.apCourses * 1.2, 10);
  
  score = gpaScore + satScore + rankScore + ecScore + apScore;
  
  // Major-specific adjustments
  const majorAdjustments = getMajorAdjustments(university.name, stats.intendedMajor, stats);
  score += majorAdjustments;
  
  // Apply selectivity penalty
  const selectivityPenalty = getSelectivityPenalty(university.admissionRate);
  score *= selectivityPenalty;
  
  // Ensure realistic range
  return Math.min(Math.max(Math.round(score), 2), 65);
};

const getMajorAdjustments = (universityName: string, major: string, stats: StudentStats): number => {
  let adjustment = 0;
  
  if (major === 'Computer Science' || major === 'Data Science' || major === 'Artificial Intelligence') {
    if (universityName.includes('MIT') || universityName.includes('Stanford')) adjustment -= 8;
    if (universityName.includes('Berkeley') || universityName.includes('Carnegie Mellon')) adjustment -= 5;
    if (stats.extracurriculars.toLowerCase().includes('coding') || 
        stats.extracurriculars.toLowerCase().includes('programming')) adjustment += 3;
  }
  
  if (major === 'Pre-Med' || major === 'Biology') {
    if (universityName.includes('Hopkins') || universityName.includes('Harvard')) adjustment -= 6;
    if (stats.extracurriculars.toLowerCase().includes('medical') || 
        stats.extracurriculars.toLowerCase().includes('hospital')) adjustment += 3;
  }
  
  if (major === 'Business' || major === 'Economics') {
    if (universityName.includes('Wharton') || universityName.includes('Chicago')) adjustment -= 4;
  }
  
  return adjustment;
};

const getSelectivityPenalty = (admissionRate: number): number => {
  if (admissionRate < 5) return 0.5;
  if (admissionRate < 10) return 0.65;
  if (admissionRate < 15) return 0.8;
  if (admissionRate < 25) return 0.9;
  return 1.0;
};

export const generateSpecificTips = (university: University, stats: StudentStats, major: string): string[] => {
  const tips = [];
  
  // University-specific tips
  if (university.name.includes('Harvard')) {
    tips.push('Harvard values intellectual curiosity - highlight unique academic interests');
    tips.push('Demonstrate significant community impact through your activities');
    tips.push('Show leadership that creates positive change in your community');
  } else if (university.name.includes('MIT')) {
    tips.push('MIT seeks "makers" - showcase hands-on projects and innovations');
    tips.push('Demonstrate collaboration skills alongside technical excellence');
    tips.push('Show how you solve problems creatively and practically');
  } else if (university.name.includes('Stanford')) {
    tips.push('Stanford values intellectual vitality - show passion for learning');
    tips.push('Demonstrate entrepreneurial thinking and initiative');
    tips.push('Show how you contribute to your community in meaningful ways');
  } else if (university.name.includes('Yale')) {
    tips.push('Yale seeks students who will contribute to their residential colleges');
    tips.push('Demonstrate intellectual curiosity across multiple disciplines');
    tips.push('Show commitment to service and community engagement');
  } else if (university.name.includes('Berkeley')) {
    tips.push('UC Berkeley values academic excellence and social consciousness');
    tips.push('Demonstrate leadership in addressing societal challenges');
    tips.push('Show how your experiences shaped your worldview');
  }
  
  // Major-specific tips
  if (major === 'Computer Science') {
    tips.push('Showcase programming projects, hackathons, or coding competitions');
    tips.push('Demonstrate problem-solving skills through technical challenges');
  } else if (major === 'Pre-Med') {
    tips.push('Show meaningful healthcare exposure through volunteering or shadowing');
    tips.push('Demonstrate empathy and service through community involvement');
  } else if (major === 'Business') {
    tips.push('Show entrepreneurial initiatives or business-related internships');
    tips.push('Demonstrate leadership in organizations or community projects');
  }
  
  return tips.slice(0, 4);
};

export const generateImprovements = (university: University, stats: StudentStats, matchPercentage: number): string[] => {
  const improvements = [];
  
  if (stats.gpaWeighted < university.avgGpa - 0.1) {
    improvements.push(`Target weighted GPA of ${university.avgGpa}+ (currently ${stats.gpaWeighted})`);
  }
  
  if (stats.satScore < university.avgSat - 50 && stats.satScore > 0) {
    improvements.push(`Aim for SAT score of ${university.avgSat}+ (currently ${stats.satScore})`);
  }
  
  if (stats.apCourses < 8) {
    improvements.push(`Take more rigorous coursework - aim for 8+ AP courses (currently ${stats.apCourses})`);
  }
  
  if (stats.extracurriculars.length < 200) {
    improvements.push('Develop deeper extracurricular involvement with leadership roles');
  }
  
  if (matchPercentage < 15) {
    improvements.push('Consider this a high reach - focus on demonstrating exceptional qualities');
  } else if (matchPercentage < 25) {
    improvements.push('This is a reach school - ensure strong essay and recommendation letters');
  }
  
  return improvements.slice(0, 4);
};
