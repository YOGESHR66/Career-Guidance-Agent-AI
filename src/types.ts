export interface StudentProfile {
  name: string;
  degree: string;
  year: string;
  skills: string;
  interests: string;
  preferredDomain: string;
  careerGoal: string;
}

export interface CareerGuidance {
  recommendedCareer: string;
  alternativeCareers: string[];
  reason: string;
  requiredSkills: string[];
  missingSkills: string[];
  certifications: string[];
  learningRoadmap: string[];
  jobRoles: string[];
  salaryRangeIndia: string;
  futureScope: string;
  summary: string;
  timestamp?: string; // Client-added field for history
  profile?: StudentProfile; // Client-added field to re-load profile
}
