
import { University } from './types';

export const majors = [
  'Computer Science', 'Engineering', 'Business', 'Pre-Med', 'Liberal Arts', 
  'Psychology', 'Economics', 'Biology', 'Mathematics', 'Physics', 
  'Chemistry', 'Political Science', 'English', 'History', 'Art', 'Data Science',
  'Artificial Intelligence', 'Environmental Science', 'International Relations'
];

export const topUniversities: University[] = [
  // Ivy League
  { name: 'Harvard University', logo: 'https://upload.wikimedia.org/wikipedia/en/2/29/Harvard_shield_wreath.svg', admissionRate: 3.4, avgGpa: 4.18, avgSat: 1520, admissionsUrl: 'https://college.harvard.edu/admissions' },
  { name: 'Yale University', logo: 'https://upload.wikimedia.org/wikipedia/commons/0/07/Yale_University_Shield_1.svg', admissionRate: 4.6, avgGpa: 4.14, avgSat: 1515, admissionsUrl: 'https://admissions.yale.edu/' },
  { name: 'Princeton University', logo: 'https://upload.wikimedia.org/wikipedia/commons/d/d0/Princeton_seal.svg', admissionRate: 5.8, avgGpa: 3.95, avgSat: 1510, admissionsUrl: 'https://admission.princeton.edu/' },
  { name: 'Columbia University', logo: 'https://upload.wikimedia.org/wikipedia/en/0/08/Columbia_University_seal.svg', admissionRate: 3.7, avgGpa: 4.15, avgSat: 1505, admissionsUrl: 'https://undergrad.admissions.columbia.edu/' },
  { name: 'University of Pennsylvania', logo: 'https://upload.wikimedia.org/wikipedia/commons/9/92/UPenn_shield_with_banner.svg', admissionRate: 5.9, avgGpa: 3.94, avgSat: 1500, admissionsUrl: 'https://admissions.upenn.edu/' },
  { name: 'Dartmouth College', logo: 'https://upload.wikimedia.org/wikipedia/commons/e/e4/Dartmouth_College_shield.svg', admissionRate: 6.2, avgGpa: 3.93, avgSat: 1490, admissionsUrl: 'https://admissions.dartmouth.edu/' },
  { name: 'Brown University', logo: 'https://upload.wikimedia.org/wikipedia/commons/a/aa/Seal_of_Brown_University.svg', admissionRate: 5.4, avgGpa: 3.92, avgSat: 1485, admissionsUrl: 'https://admission.brown.edu/' },
  { name: 'Cornell University', logo: 'https://upload.wikimedia.org/wikipedia/commons/4/47/Cornell_University_seal.svg', admissionRate: 7.3, avgGpa: 3.91, avgSat: 1480, admissionsUrl: 'https://admissions.cornell.edu/' },
  
  // Top Private Universities
  { name: 'Stanford University', logo: 'https://upload.wikimedia.org/wikipedia/commons/b/b5/Seal_of_Leland_Stanford_Junior_University.svg', admissionRate: 3.9, avgGpa: 3.96, avgSat: 1510, admissionsUrl: 'https://admission.stanford.edu/' },
  { name: 'MIT', logo: 'https://upload.wikimedia.org/wikipedia/commons/0/0c/MIT_logo.svg', admissionRate: 4.1, avgGpa: 4.17, avgSat: 1540, admissionsUrl: 'https://mitadmissions.org/' },
  { name: 'University of Chicago', logo: 'https://upload.wikimedia.org/wikipedia/en/7/79/University_of_Chicago_shield.svg', admissionRate: 6.2, avgGpa: 4.0, avgSat: 1520, admissionsUrl: 'https://collegeadmissions.uchicago.edu/' },
  { name: 'Northwestern University', logo: 'https://upload.wikimedia.org/wikipedia/commons/d/d1/Northwestern_University_seal.svg', admissionRate: 7.0, avgGpa: 4.0, avgSat: 1490, admissionsUrl: 'https://admissions.northwestern.edu/' },
  { name: 'Duke University', logo: 'https://upload.wikimedia.org/wikipedia/commons/e/e1/Duke_University_Crest.svg', admissionRate: 6.2, avgGpa: 3.94, avgSat: 1485, admissionsUrl: 'https://admissions.duke.edu/' },
  { name: 'Johns Hopkins University', logo: 'https://upload.wikimedia.org/wikipedia/commons/c/ce/Johns_Hopkins_University_seal.svg', admissionRate: 7.5, avgGpa: 3.93, avgSat: 1480, admissionsUrl: 'https://apply.jhu.edu/' },
  
  // Top Public Universities
  { name: 'UC Berkeley', logo: 'https://upload.wikimedia.org/wikipedia/commons/a/a1/Seal_of_University_of_California%2C_Berkeley.svg', admissionRate: 11.4, avgGpa: 3.89, avgSat: 1430, admissionsUrl: 'https://admissions.berkeley.edu/' },
  { name: 'UCLA', logo: 'https://upload.wikimedia.org/wikipedia/commons/0/0d/The_University_of_California_UCLA.svg', admissionRate: 8.6, avgGpa: 3.90, avgSat: 1435, admissionsUrl: 'https://admission.ucla.edu/' },
  { name: 'University of Michigan', logo: 'https://upload.wikimedia.org/wikipedia/commons/9/93/Seal_of_the_University_of_Michigan.svg', admissionRate: 17.7, avgGpa: 3.85, avgSat: 1420, admissionsUrl: 'https://admissions.umich.edu/' },
  { name: 'University of Virginia', logo: 'https://upload.wikimedia.org/wikipedia/commons/2/2c/University_of_Virginia_seal.svg', admissionRate: 19.0, avgGpa: 3.87, avgSat: 1410, admissionsUrl: 'https://admission.virginia.edu/' },
  { name: 'Georgia Tech', logo: 'https://upload.wikimedia.org/wikipedia/commons/6/6c/Georgia_Tech_seal.svg', admissionRate: 16.3, avgGpa: 3.89, avgSat: 1465, admissionsUrl: 'https://admission.gatech.edu/' },
];
