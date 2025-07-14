import { University } from './types';

export const majors = [
  'Computer Science', 'Engineering', 'Business', 'Pre-Med', 'Liberal Arts', 
  'Psychology', 'Economics', 'Biology', 'Mathematics', 'Physics', 
  'Chemistry', 'Political Science', 'English', 'History', 'Art', 'Data Science',
  'Artificial Intelligence', 'Environmental Science', 'International Relations'
];

export const topUniversities: University[] = [
  // Ivy League - Using actual university logos
  { name: 'Harvard University', logo: 'https://logos-world.net/wp-content/uploads/2021/09/Harvard-University-Logo.png', admissionRate: 3.4, avgGpa: 4.18, avgSat: 1520, admissionsUrl: 'https://college.harvard.edu/admissions' },
  { name: 'Yale University', logo: 'https://logos-world.net/wp-content/uploads/2021/09/Yale-University-Logo.png', admissionRate: 4.6, avgGpa: 4.14, avgSat: 1515, admissionsUrl: 'https://admissions.yale.edu/' },
  { name: 'Princeton University', logo: 'https://logos-world.net/wp-content/uploads/2021/09/Princeton-University-Logo.png', admissionRate: 5.8, avgGpa: 3.95, avgSat: 1510, admissionsUrl: 'https://admission.princeton.edu/' },
  { name: 'Columbia University', logo: 'https://logos-world.net/wp-content/uploads/2021/09/Columbia-University-Logo.png', admissionRate: 3.7, avgGpa: 4.15, avgSat: 1505, admissionsUrl: 'https://undergrad.admissions.columbia.edu/' },
  { name: 'University of Pennsylvania', logo: 'https://logos-world.net/wp-content/uploads/2021/09/University-of-Pennsylvania-Logo.png', admissionRate: 5.9, avgGpa: 3.94, avgSat: 1500, admissionsUrl: 'https://admissions.upenn.edu/' },
  { name: 'Dartmouth College', logo: 'https://logos-world.net/wp-content/uploads/2021/09/Dartmouth-College-Logo.png', admissionRate: 6.2, avgGpa: 3.93, avgSat: 1490, admissionsUrl: 'https://admissions.dartmouth.edu/' },
  { name: 'Brown University', logo: 'https://logos-world.net/wp-content/uploads/2021/09/Brown-University-Logo.png', admissionRate: 5.4, avgGpa: 3.92, avgSat: 1485, admissionsUrl: 'https://admission.brown.edu/' },
  { name: 'Cornell University', logo: 'https://logos-world.net/wp-content/uploads/2021/09/Cornell-University-Logo.png', admissionRate: 7.3, avgGpa: 3.91, avgSat: 1480, admissionsUrl: 'https://admissions.cornell.edu/' },
  
  // Top Private Universities
  { name: 'Stanford University', logo: 'https://logos-world.net/wp-content/uploads/2021/09/Stanford-University-Logo.png', admissionRate: 3.9, avgGpa: 3.96, avgSat: 1510, admissionsUrl: 'https://admission.stanford.edu/' },
  { name: 'MIT', logo: 'https://logos-world.net/wp-content/uploads/2021/09/MIT-Logo.png', admissionRate: 4.1, avgGpa: 4.17, avgSat: 1540, admissionsUrl: 'https://mitadmissions.org/' },
  { name: 'University of Chicago', logo: 'https://logos-world.net/wp-content/uploads/2021/09/University-of-Chicago-Logo.png', admissionRate: 6.2, avgGpa: 4.0, avgSat: 1520, admissionsUrl: 'https://collegeadmissions.uchicago.edu/' },
  { name: 'Northwestern University', logo: 'https://logos-world.net/wp-content/uploads/2021/09/Northwestern-University-Logo.png', admissionRate: 7.0, avgGpa: 4.0, avgSat: 1490, admissionsUrl: 'https://admissions.northwestern.edu/' },
  { name: 'Duke University', logo: 'https://logos-world.net/wp-content/uploads/2021/09/Duke-University-Logo.png', admissionRate: 6.2, avgGpa: 3.94, avgSat: 1485, admissionsUrl: 'https://admissions.duke.edu/' },
  { name: 'Johns Hopkins University', logo: 'https://logos-world.net/wp-content/uploads/2021/09/Johns-Hopkins-University-Logo.png', admissionRate: 7.5, avgGpa: 3.93, avgSat: 1480, admissionsUrl: 'https://apply.jhu.edu/' },
  
  // Top Public Universities
  { name: 'UC Berkeley', logo: 'https://logos-world.net/wp-content/uploads/2021/09/UC-Berkeley-Logo.png', admissionRate: 11.4, avgGpa: 3.89, avgSat: 1430, admissionsUrl: 'https://admissions.berkeley.edu/' },
  { name: 'UCLA', logo: 'https://logos-world.net/wp-content/uploads/2021/09/UCLA-Logo.png', admissionRate: 8.6, avgGpa: 3.90, avgSat: 1435, admissionsUrl: 'https://admission.ucla.edu/' },
  { name: 'University of Michigan', logo: 'https://logos-world.net/wp-content/uploads/2021/09/University-of-Michigan-Logo.png', admissionRate: 17.7, avgGpa: 3.85, avgSat: 1420, admissionsUrl: 'https://admissions.umich.edu/' },
  { name: 'University of Virginia', logo: 'https://logos-world.net/wp-content/uploads/2021/09/University-of-Virginia-Logo.png', admissionRate: 19.0, avgGpa: 3.87, avgSat: 1410, admissionsUrl: 'https://admission.virginia.edu/' },
  { name: 'Georgia Tech', logo: 'https://logos-world.net/wp-content/uploads/2021/09/Georgia-Institute-of-Technology-Logo.png', admissionRate: 16.3, avgGpa: 3.89, avgSat: 1465, admissionsUrl: 'https://admission.gatech.edu/' },
];