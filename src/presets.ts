import { StudentProfile } from "./types";

export interface PresetPersona {
  id: string;
  label: string;
  description: string;
  profile: StudentProfile;
}

export const PRESET_PERSONAS: PresetPersona[] = [
  {
    id: "web-dev",
    label: "Web Enthusiast (Sophomore)",
    description: "Interested in front-end design & dynamic web applications",
    profile: {
      name: "Aarav Sharma",
      degree: "B.Tech Computer Science & Engineering",
      year: "2nd Year",
      skills: "HTML, CSS, JavaScript, Basic React, Git",
      interests: "UI Design, responsive layouts, web application flow",
      preferredDomain: "Web Development",
      careerGoal: "Become a Full-Stack developer at an innovative tech startup."
    }
  },
  {
    id: "ai-ml",
    label: "Python coder seeking AI/ML",
    description: "Good at math & statistics, loves data science",
    profile: {
      name: "Priyanka Patel",
      degree: "B.Sc Statistics & Data Analytics",
      year: "3rd Year",
      skills: "Python, NumPy, Pandas, SQL, Linear Algebra",
      interests: "Predictive modeling, data visualizations, natural language processing",
      preferredDomain: "Artificial Intelligence & Machine Learning",
      careerGoal: "Work as an AI Research scientist or Machine Learning Engineer at an enterprise."
    }
  },
  {
    id: "cyber-sec",
    label: "Cybersecurity Novice",
    description: "Fascinated by ethical hacking & systems",
    profile: {
      name: "Karan Johar",
      degree: "BCA (Bachelor of Computer Applications)",
      year: "1st Year",
      skills: "Basic Linux commands, C++, Networking fundamentals",
      interests: "Security protocols, firewalls, penetration testing",
      preferredDomain: "Cybersecurity",
      careerGoal: "Become an Ethical Hacker or Information Security Analyst."
    }
  },
  {
    id: "cloud-ops",
    label: "DevOps & Cloud Explorer",
    description: "Loves automation and deployment architectures",
    profile: {
      name: "Neha Reddy",
      degree: "B.Tech Information Technology",
      year: "4th Year (Final Year)",
      skills: "Java, Linux, Scripting, Docker basics, Git, Database basics",
      interests: "Infrastructure automation, server scaling, container orchestration",
      preferredDomain: "Cloud Computing & DevOps",
      careerGoal: "Build scalable cloud architectures as a DevOps or Cloud Engineer."
    }
  }
];
