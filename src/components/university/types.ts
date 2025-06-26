
export interface StudentStats {
  gpaUnweighted: number;
  gpaWeighted: number;
  satScore: number;
  actScore: number;
  classRank: number;
  totalStudents: number;
  extracurriculars: string;
  essays: string;
  apCourses: number;
  intendedMajor: string;
}

export interface University {
  name: string;
  logo: string;
  admissionRate: number;
  avgGpa: number;
  avgSat: number;
  admissionsUrl: string;
}

export interface UniversityMatch extends University {
  matchPercentage: number;
  improvements: string[];
  specificTips: string[];
}
