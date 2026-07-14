import { StudentProfile, CareerGuidance } from "./types";

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

export function generateDemoGuidance(profile: StudentProfile): CareerGuidance {
  const domain = (profile.preferredDomain || "").toLowerCase();
  const name = profile.name || "Student";
  const currentSkills = (profile.skills || "").split(",").map(s => s.trim().toLowerCase());

  let recommendedCareer = "Software Engineer & Application Developer";
  let alternativeCareers = ["Full-Stack Web Developer", "Systems Analyst"];
  let reason = `Based on your profile as a ${profile.year} ${profile.degree} student, you have a solid foundation. Your interests in ${profile.interests || "software development"} and your goal to "${profile.careerGoal}" align perfectly with this career path.`;
  let requiredSkills = ["Data Structures & Algorithms", "System Design", "Git & Collaboration", "Software Testing", "Agile Methodologies"];
  let certifications = ["Google Associate Software Engineer", "Microsoft Certified: Azure Developer Associate"];
  let learningRoadmap = [
    "Step 1: Strengthen core programming concepts & object-oriented design principles.",
    "Step 2: Master advanced data structures and algorithm analysis.",
    "Step 3: Gain hands-on experience building projects with databases (SQL & NoSQL).",
    "Step 4: Understand basic cloud deployment, system architectures, and unit testing."
  ];
  let jobRoles = ["Junior Software Engineer", "Associate Software Developer", "Systems Engineer"];
  let salaryRangeIndia = "₹4,50,000 - ₹8,50,000 per annum";
  let futureScope = "Software engineering remains the backbone of the tech industry. With the rise of AI assistants, the role is shifting towards high-level architecture, prompt design, and system integration, ensuring sustained high demand over the next decade.";
  let summary = `Hi ${name}! You are on an amazing track. Leverage your academic position in your ${profile.year} to build a portfolio of personal projects. Focus on mastering core principles before chasing trends!`;

  if (domain.includes("web") || domain.includes("front") || domain.includes("back")) {
    recommendedCareer = "Full-Stack Web Developer";
    alternativeCareers = ["UI/UX Engineer", "Backend API Developer"];
    reason = `As a ${profile.year} student pursuing ${profile.degree}, your background combined with interests in "${profile.interests}" makes you an ideal fit for Full-Stack development. Web apps are the primary touchpoint for modern businesses, creating excellent growth opportunities.`;
    requiredSkills = ["React.js", "Node.js & Express", "MongoDB & PostgreSQL", "REST APIs", "Tailwind CSS & CSS Grid", "Git & GitHub"];
    certifications = ["Meta Front-End Developer Professional Certificate", "MongoDB Certified Developer", "AWS Certified Cloud Practitioner"];
    learningRoadmap = [
      "Step 1: Master modern CSS features (Grid, Flexbox) and modern ES6+ JavaScript syntax.",
      "Step 2: Excel in front-end frameworks like React.js and state management solutions.",
      "Step 3: Learn backend development with Node.js/Express and database integration (SQL and MongoDB).",
      "Step 4: Build, bundle, and deploy full-stack projects to cloud platforms like Vercel or Heroku."
    ];
    jobRoles = ["Graduate Web Developer", "Associate Full-Stack Engineer", "Frontend Developer"];
    salaryRangeIndia = "₹5,00,000 - ₹9,50,000 per annum";
    futureScope = "Full-Stack engineering is highly resilient. Businesses continuously migrate to cloud interfaces, and the demand for lightweight, high-performance web applications is projected to grow exponentially.";
  } else if (domain.includes("ai") || domain.includes("machine") || domain.includes("learning") || domain.includes("data") || domain.includes("ml")) {
    recommendedCareer = "Machine Learning Engineer";
    alternativeCareers = ["Data Analyst", "AI Product Specialist"];
    reason = `Your profile shows a strong interest in predictive systems and data analysis. Pursuing this in your ${profile.year} of ${profile.degree} gives you a critical head-start. Since you already know some statistical concepts, you are ready to transition to mathematical modeling and model optimization.`;
    requiredSkills = ["Python & Libraries (Pandas, NumPy)", "Scikit-Learn & TensorFlow", "SQL & Database Queries", "Probability & Statistics", "Data Wrangling & Visualization"];
    certifications = ["Google Cloud Professional Machine Learning Engineer", "IBM Data Science Professional Certificate", "AWS Certified Machine Learning"];
    learningRoadmap = [
      "Step 1: Solidify statistics, linear algebra, and calculus principles.",
      "Step 2: Master Python data manipulation libraries (NumPy, Pandas, Matplotlib).",
      "Step 3: Implement classic ML models (regression, clustering, trees) using Scikit-Learn.",
      "Step 4: Explore deep learning architectures (CNNs, RNNs, Transformers) and ML operational pipelines."
    ];
    jobRoles = ["Junior Machine Learning Engineer", "Associate Data Scientist", "Data Analyst"];
    salaryRangeIndia = "₹6,00,000 - ₹11,50,000 per annum";
    futureScope = "Artificial Intelligence is rewriting technology. Companies are rapidly adopting model-driven decision-making, ensuring that ML engineers remain some of the highest-paid and most sought-after professionals worldwide.";
  } else if (domain.includes("cyber") || domain.includes("security") || domain.includes("hack") || domain.includes("network")) {
    recommendedCareer = "Cybersecurity Analyst & Ethical Hacker";
    alternativeCareers = ["Information Security Officer", "Network Administrator"];
    reason = `Cybersecurity requires strong system intuition and analytical thinking. Your career goal to "${profile.careerGoal}" fits perfectly with standard security engineering tracks, building on your network interest.`;
    requiredSkills = ["Network Protocols (TCP/IP, DNS)", "Linux Command Line", "OWASP Top 10 Vulnerabilities", "Penetration Testing Tools (Nmap, Wireshark)", "Firewalls & Cryptography"];
    certifications = ["CompTIA Security+", "Certified Ethical Hacker (CEH)", "Certified Information Systems Security Professional (CISSP)"];
    learningRoadmap = [
      "Step 1: Master networking basics, IP addressing subnets, and standard ports.",
      "Step 2: Learn advanced Linux administration and bash/python scripting for automation.",
      "Step 3: Study common web application vulnerabilities (OWASP Top 10) and basic defense systems.",
      "Step 4: Participate in CTFs (Capture The Flag) competitions and gain experience with Kali Linux toolkits."
    ];
    jobRoles = ["Junior Security Analyst", "Associate Ethical Hacker", "Security Operations Center (SOC) Specialist"];
    salaryRangeIndia = "₹5,50,000 - ₹10,00,000 per annum";
    futureScope = "As digitalization deepens, ransomware, security breaches, and data privacy threats have escalated. Ethical hackers and security engineers face unprecedented global demand, with opportunities across government, banking, and commerce.";
  } else if (domain.includes("cloud") || domain.includes("devops") || domain.includes("infrastructure") || domain.includes("ops")) {
    recommendedCareer = "DevOps & Cloud Solutions Engineer";
    alternativeCareers = ["Site Reliability Engineer (SRE)", "Systems Administrator"];
    reason = `DevOps is the bridge between coding and infrastructure. Since you are in your ${profile.year} of ${profile.degree}, learning modern CI/CD patterns and cloud resources will make you highly competitive, matching your interest in deployment automation.`;
    requiredSkills = ["Docker & Containerization", "Kubernetes basics", "CI/CD pipelines (GitHub Actions, Jenkins)", "AWS/GCP Cloud Architecture", "Linux Administration & Bash Scripting"];
    certifications = ["AWS Certified Solutions Architect - Associate", "Associate Cloud Engineer (Google Cloud)", "Certified Kubernetes Administrator (CKA)"];
    learningRoadmap = [
      "Step 1: Become proficient in Linux command-line, script shell automation, and Git branching.",
      "Step 2: Master containerization concepts using Docker (writing Dockerfiles, managing volumes).",
      "Step 3: Understand cloud platforms (GCP or AWS) and build automated CI/CD pipelines.",
      "Step 4: Learn infrastructure as code (Terraform) and container orchestration tools like Kubernetes."
    ];
    jobRoles = ["Junior Cloud Engineer", "Associate DevOps Specialist", "Site Reliability Engineer Trainee"];
    salaryRangeIndia = "₹6,00,000 - ₹12,00,000 per annum";
    futureScope = "Modern enterprises have abandoned physical servers for cloud instances. DevOps practitioners who can coordinate deployments securely, reliably, and efficiently are critical to maintaining 100% uptime, guaranteeing stable high-paying careers.";
  }

  // Smart filtering of missing skills: remove skills the user already entered
  const missingSkills = requiredSkills.filter(
    skill => !currentSkills.some(cs => cs.includes(skill.toLowerCase()) || skill.toLowerCase().includes(cs))
  );

  return {
    recommendedCareer,
    alternativeCareers,
    reason,
    requiredSkills,
    missingSkills: missingSkills.length > 0 ? missingSkills : [requiredSkills[2], requiredSkills[3]],
    certifications,
    learningRoadmap,
    jobRoles,
    salaryRangeIndia,
    futureScope,
    summary
  };
}

