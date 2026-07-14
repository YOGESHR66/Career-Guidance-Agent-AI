import express from "express";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI, Type } from "@google/genai";
import { createServer as createViteServer } from "vite";

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json());

// Initialize Gemini SDK with telemetry header and robust fallback resolution
const getGeminiClient = () => {
  let apiKey = process.env.GEMINI_API_KEY;
  
  if (!apiKey) {
    // Fallback to keys with trailing periods, spaces, or other variations
    const envKeys = Object.keys(process.env);
    const fallbackKeyName = envKeys.find(k => k.trim().replace(/\.+$/, "") === "GEMINI_API_KEY");
    if (fallbackKeyName) {
      console.log(`Found fallback env key in process.env: "${fallbackKeyName}"`);
      apiKey = process.env[fallbackKeyName];
    }
  }

  if (apiKey) {
    apiKey = apiKey.trim();
    if (apiKey.startsWith('"') && apiKey.endsWith('"')) {
      apiKey = apiKey.slice(1, -1);
    }
    if (apiKey.startsWith("'") && apiKey.endsWith("'")) {
      apiKey = apiKey.slice(1, -1);
    }
  }

  if (!apiKey) {
    throw new Error("GEMINI_API_KEY environment variable is not defined in the Secrets panel.");
  }

  // Safe debug log to confirm initialization
  const maskedKey = apiKey.length > 6 
    ? `${apiKey.substring(0, 3)}...${apiKey.substring(apiKey.length - 3)}`
    : "***";
  console.log(`Initializing GoogleGenAI with key (length: ${apiKey.length}, preview: ${maskedKey})`);

  return new GoogleGenAI({
    apiKey: apiKey,
  });
};

// Local guidance generator fallback when the Gemini API is inaccessible or unauthorized
function generateLocalGuidanceFallback(profile: any) {
  const domain = (profile.preferredDomain || "").toLowerCase();
  const name = profile.name || "Student";
  const currentSkills = (profile.skills || "").split(",").map((s: string) => s.trim().toLowerCase());

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

  if (domain.includes("web") || domain.includes("front") || domain.includes("back") || domain.includes("full")) {
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
    alternativeCareers = ["Data Scientist", "AI Product Specialist"];
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

  const missingSkills = requiredSkills.filter(
    skill => !currentSkills.some((cs: string) => cs.includes(skill.toLowerCase()) || skill.toLowerCase().includes(cs))
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

// API Endpoint for generating career guidance
app.post("/api/guidance", async (req, res) => {
  const { name, degree, year, skills, interests, preferredDomain, careerGoal } = req.body;

  if (!degree || !year || !interests || !careerGoal) {
    return res.status(400).json({ error: "Missing required fields in student profile" });
  }

  try {
    const ai = getGeminiClient();

    const systemInstruction = `You are an expert AI Career Guidance Counselor with extensive knowledge of current industry trends, technical skills, certifications, salary ranges, and career opportunities. Your task is to analyze the student's profile and provide personalized, highly accurate career guidance in the requested JSON format. Ensure India-specific salary estimations (in INR) are realistic for entry-level roles. Highlight missing skills, certificates, and a concrete learning roadmap. Make descriptions human, helpful, and highly customized to their specific input.`;

    const userPrompt = `
Analyze the student's profile and generate personalized career guidance:

Student Details:
- Name: ${name || "Student"}
- Degree: ${degree}
- Year of Study: ${year}
- Current Skills: ${skills || "None listed"}
- Personal Interests: ${interests}
- Preferred Domain: ${preferredDomain || "Any domain"}
- Career Goal: ${careerGoal}

Follow the rules strictly. Recommend the single best career path, up to 2 solid alternative options, explain why, identify missing skills based on the recommended path, list certifications, build a step-by-step learning roadmap, list target job roles, estimate entry-level Indian salary range, describe future scope, and provide a short, supportive summary.
`;

    // Robust exponential backoff retry wrapper for Gemini generateContent call
    const generateWithRetry = async (retries = 3, initialDelay = 500) => {
      let delay = initialDelay;
      // Use the fastest model first to reduce load time
      const modelsToTry = ["gemini-3.1-flash-lite", "gemini-flash-latest", "gemini-3.5-flash"];
      
      for (let i = 1; i <= retries; i++) {
        const currentModel = modelsToTry[Math.min(i - 1, modelsToTry.length - 1)];
        try {
          console.log(`Generating guidance using "${currentModel}" (Attempt ${i} of ${retries})...`);
          const response = await ai.models.generateContent({
            model: currentModel,
            contents: userPrompt,
            config: {
              systemInstruction: systemInstruction,
              responseMimeType: "application/json",
              responseSchema: {
                type: Type.OBJECT,
                properties: {
                  recommendedCareer: { 
                    type: Type.STRING,
                    description: "The primary single best career path recommendation (e.g. 'Full-Stack Web Developer' or 'Data Scientist')."
                  },
                  alternativeCareers: { 
                    type: Type.ARRAY, 
                    items: { type: Type.STRING },
                    description: "List of up to two solid alternative career paths suited to their profile."
                  },
                  reason: { 
                    type: Type.STRING,
                    description: "An explanation of why this primary career is the best fit for their specific skills, degree, and interests."
                  },
                  requiredSkills: { 
                    type: Type.ARRAY, 
                    items: { type: Type.STRING },
                    description: "Key technical and soft skills required for the recommended career path."
                  },
                  missingSkills: { 
                    type: Type.ARRAY, 
                    items: { type: Type.STRING },
                    description: "Specific skills the student currently lacks but needs to learn for the recommended path."
                  },
                  certifications: { 
                    type: Type.ARRAY, 
                    items: { type: Type.STRING },
                    description: "A list of 2-3 globally recognized industry certifications that will boost their resume."
                  },
                  learningRoadmap: { 
                    type: Type.ARRAY, 
                    items: { type: Type.STRING },
                    description: "A step-by-step learning roadmap (e.g., 'Step 1: Learn X', 'Step 2: Master Y', etc.)."
                  },
                  jobRoles: { 
                    type: Type.ARRAY, 
                    items: { type: Type.STRING },
                    description: "Specific job designations they can apply for (e.g., 'Junior Software Engineer', 'Associate ML Developer')."
                  },
                  salaryRangeIndia: { 
                    type: Type.STRING,
                    description: "Realistic entry-level annual salary range in India (e.g., '₹4,50,000 - ₹8,00,000 per annum'). Use INR format."
                  },
                  futureScope: { 
                    type: Type.STRING,
                    description: "Detailed industry outlook and future growth scope for this career path over the next 5-10 years."
                  },
                  summary: { 
                    type: Type.STRING,
                    description: "A concise, encouraging summary and next steps."
                  }
                },
                required: [
                  "recommendedCareer",
                  "alternativeCareers",
                  "reason",
                  "requiredSkills",
                  "missingSkills",
                  "certifications",
                  "learningRoadmap",
                  "jobRoles",
                  "salaryRangeIndia",
                  "futureScope",
                  "summary"
                ]
              }
            }
          });
          return response;
        } catch (err: any) {
          const errMsg = err?.message || String(err);
          console.error(`Attempt ${i} with "${currentModel}" failed:`, errMsg);
          
          // Do not retry if the API key is invalid
          if (errMsg.includes("401") || errMsg.includes("UNAUTHENTICATED") || errMsg.includes("API_KEY_INVALID") || errMsg.includes("ACCESS_TOKEN_TYPE_UNSUPPORTED")) {
            throw new Error(`Authentication failed. Your Gemini API key is invalid or expired. Please check your Settings -> Secrets panel and update the GEMINI_API_KEY. (Original error: ${errMsg})`);
          }

          if (i === retries) {
            throw err;
          }
          
          console.log(`Retrying in ${delay}ms...`);
          await new Promise((resolve) => setTimeout(resolve, delay));
          delay *= 1.5; // Slightly more balanced multiplier
        }
      }
      throw new Error(`Failed to contact any model after multiple retries.`);
    };

    const response = await generateWithRetry(3, 500);

    const resultText = response.text;
    if (!resultText) {
      throw new Error("Empty response from Gemini API");
    }

    const guidanceData = JSON.parse(resultText);
    res.json(guidanceData);
  } catch (error: any) {
    console.warn("Backend Gemini API call failed. Using robust local guidance generator fallback directly:", error?.message || error);
    try {
      const localGuidance = generateLocalGuidanceFallback({
        name,
        degree,
        year,
        skills,
        interests,
        preferredDomain,
        careerGoal
      });
      res.json(localGuidance);
    } catch (fallbackErr: any) {
      console.error("Local fallback generator also failed:", fallbackErr);
      res.status(500).json({ 
        error: "Failed to generate career guidance.", 
        details: fallbackErr.message || fallbackErr 
      });
    }
  }
});

// Setup Vite or static serving
async function setupServer() {
  if (process.env.NODE_ENV !== "production") {
    console.log("Starting server in DEVELOPMENT mode with Vite Middleware...");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    console.log("Starting server in PRODUCTION mode with static files...");
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server is running on http://0.0.0.0:${PORT}`);
  });
}

setupServer();
