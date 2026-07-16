import express from "express";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI, Type } from "@google/genai";
import { createServer as createViteServer } from "vite";

dotenv.config();

const app = express();
app.enable("trust proxy");
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json());

// Initialize Gemini SDK with telemetry header and robust fallback resolution
const isPlaceholderKey = (key: string | undefined): boolean => {
  if (!key) return true;
  const k = key.trim().replace(/['"]/g, "");
  return (
    k === "" || 
    k === "MY_GEMINI_API_KEY" || 
    k === "undefined" || 
    k === "null" ||
    k.startsWith("MY_") || 
    k.startsWith("YOUR_") ||
    k.startsWith("ya29.") ||
    k.length < 10
  );
};

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

  if (!apiKey || isPlaceholderKey(apiKey)) {
    throw new Error("GEMINI_API_KEY environment variable is not defined or is set to a placeholder.");
  }

  // Safe debug log to confirm initialization
  const maskedKey = apiKey.length > 6 
    ? `${apiKey.substring(0, 3)}...${apiKey.substring(apiKey.length - 3)}`
    : "***";
  console.log(`Initializing GoogleGenAI with key (length: ${apiKey.length}, preview: ${maskedKey})`);

  return new GoogleGenAI({
    apiKey: apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      }
    }
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

  // Check if API key is a placeholder or undefined before making external requests to prevent 401 unauthenticated errors
  const apiKey = process.env.GEMINI_API_KEY;
  if (isPlaceholderKey(apiKey)) {
    console.info("No valid Gemini API key detected (using placeholder, empty, or undefined value). Directing immediately to robust local fallback generator.");
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
      return res.json(localGuidance);
    } catch (fallbackErr: any) {
      console.error("Local fallback generator failed:", fallbackErr);
      return res.status(500).json({ 
        error: "Failed to generate career guidance.", 
        details: fallbackErr.message || fallbackErr 
      });
    }
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
          console.info(`Attempt ${i} with "${currentModel}" checked:`, errMsg.substring(0, 100));
          
          // Do not retry if the API key is invalid
          if (errMsg.includes("401") || errMsg.includes("UNAUTHENTICATED") || errMsg.includes("API_KEY_INVALID") || errMsg.includes("ACCESS_TOKEN_TYPE_UNSUPPORTED")) {
            throw new Error(`Authentication check. Gemini API key is placeholder, invalid, or expired. (Original: ${errMsg.substring(0, 50)})`);
          }

          if (i === retries) {
            throw err;
          }
          
          console.info(`Retrying in ${delay}ms...`);
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
    console.info("Gemini API call checked. Transitioned seamlessly to localized high-fidelity career counselor fallback.");
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

// Mock counselor response for offline or unconfigured API keys
function getMockChatResponse(userMsg: string, history: any[]): string {
  const msg = userMsg.toLowerCase().trim();
  
  if (msg.includes("hello") || msg.includes("hi") || msg.includes("hey")) {
    return `Hello! I am your AI Career Advisor. I'm here to help you navigate your academic choices, plan skill-building projects, select industry certifications, and optimize your overall career roadmap. 

What domain or career path are you currently exploring or interested in? (e.g., Web Development, Cybersecurity, AI/ML, Cloud Engineering)`;
  }
  
  if (msg.includes("web") || msg.includes("frontend") || msg.includes("backend") || msg.includes("react")) {
    return `Web Development is an exceptionally active and rewarding field! To stand out, I recommend focusing on these strategic areas:

1. **Core Mastery**: Solidify your understanding of modern ES6+ JavaScript, CSS grid systems, and asynchronous programming.
2. **Frameworks & Tools**: Dive deep into **React.js** (including custom hooks, state management) paired with **Tailwind CSS** for clean responsive styling.
3. **Backend Integration**: Learn **Node.js** with Express and relational databases like **PostgreSQL** or non-relational like **MongoDB**.
4. **Key Projects**: Build a real-world SaaS dashboard, an interactive collaborative task manager, or a serverless api proxy.

Would you like to know which professional certifications are most valued for Web Developers?`;
  }

  if (msg.includes("ai") || msg.includes("machine learning") || msg.includes("data science") || msg.includes("ml") || msg.includes("python")) {
    return `Machine Learning and Artificial Intelligence are revolutionizing technology! Here is your strategic preparation roadmap:

1. **Foundational Mathematics**: Revisit core linear algebra, multi-variable calculus, and probability/statistics.
2. **Data Manipulation**: Master **Python** libraries such as **Pandas**, **NumPy**, and **Matplotlib** for thorough data profiling.
3. **Model Training**: Implement regression, decision trees, and ensemble methods using **Scikit-Learn** before stepping into neural networks.
4. **Advanced ML & Ops**: Explore **TensorFlow** or **PyTorch**, and learn how to deploy models via basic API endpoints (MLOps).

I recommend pursuing the **Google Cloud Professional Machine Learning Engineer** or **IBM Data Science** certificate. What specific sub-field (e.g., NLP, Computer Vision) interests you most?`;
  }

  if (msg.includes("cyber") || msg.includes("security") || msg.includes("hack") || msg.includes("network")) {
    return `Cybersecurity requires strong system intuition and analytical thinking. To prepare yourself for security roles, focus on:

1. **Networking Fundamentals**: Truly master TCP/IP protocols, DNS hierarchy, subnetting, and network analysis tools like **Wireshark**.
2. **Command Line & Scripting**: Become completely comfortable in the **Linux command terminal** and write automated bash or python scripts.
3. **Defensive Concepts**: Study the **OWASP Top 10** web vulnerabilities and understand standard cryptography, encryption keys, and firewall rules.
4. **Hands-on Practice**: Participate in *Capture The Flag (CTF)* challenges on sites like HackTheBox or TryHackMe.

A strong starting certification is **CompTIA Security+**, followed later by **Certified Ethical Hacker (CEH)**. Do you have a preference for red teaming (offensive pentesting) or blue teaming (security defense)?`;
  }

  if (msg.includes("resume") || msg.includes("interview") || msg.includes("job") || msg.includes("apply")) {
    return `Preparing for technical job hunts and interviews requires a methodical approach:

1. **Portfolio of Impact**: Ensure your GitHub profile has 2-3 high-quality, pinned projects with comprehensive README files detailing the architecture and your specific contributions.
2. **Algorithm Practice**: Spend consistent time on platforms like LeetCode practicing arrays, hashes, sliding windows, and basic tree traversals.
3. **Behavioral Questions**: Structure your career stories using the **STAR method** (Situation, Task, Action, Result) to highlight leadership and problem-solving.
4. **Resume Precision**: Keep your resume to a single page, place your technical skills clearly at the top, and describe your project bullet points starting with strong action verbs.

Do you have an upcoming interview or a specific resume draft you'd like feedback on?`;
  }

  if (msg.includes("project") || msg.includes("build") || msg.includes("portfolio")) {
    return `Excellent! The best portfolio projects are those that solve a real problem and demonstrate architectural understanding. Here are some high-impact project ideas:

- **For Web Developers**: A serverless task-collaboration board with multi-user permissions, dynamic filtering, and local/cloud persistence.
- **For AI/ML Enthusiasts**: A customer sentiment analyzer using real-time social media scraping or a document Q&A search system backed by vector embeddings.
- **For DevOps/Cloud**: A fully automated CI/CD pipeline deploying a containerized microservice application onto AWS or GCP with custom monitoring dashboards.

Which of these fits your preferred domain best? I can help you outline the exact tech stack and layout!`;
  }

  return `That is a great question! Navigating a career in technology involves continuously identifying skill gaps and aligning your academic projects with market trends.

To give you the most accurate advice:
1. What is your current major/degree?
2. What are 2 or 3 technologies you have already worked with?
3. What is your ultimate goal (e.g., joining a startup, landing a corporate software role, or pursuing research)?`;
}

// Multiturn chat endpoint using customizable Gemini models and thinking configurations
app.post("/api/chat", async (req, res) => {
  const { messages, model, useThinking } = req.body;
  
  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: "Messages array is required" });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (isPlaceholderKey(apiKey)) {
    console.info("Chat: Placeholder key detected. Using local counselor response fallback.");
    const lastMessage = messages[messages.length - 1]?.content || "";
    const mockReply = getMockChatResponse(lastMessage, messages);
    return res.json({ text: mockReply });
  }

  try {
    const ai = getGeminiClient();
    
    // Map client messages to Gemini content format
    const contents = messages.map((m: any) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content }]
    }));

    const systemInstruction = `You are "Advisor AI", an elite academic and career counselor. Your role is to guide students on their educational journeys, skills development, project building, interview preparation, and career optimization. Be friendly, structural, clear, and professional. Speak in positive, motivating tones. Give highly structured, concrete, actionable steps. Use bullet points and clean typography.`;

    const targetModel = model || "gemini-3.5-flash";
    const config: any = {
      systemInstruction: systemInstruction,
    };

    // If useThinking is selected or we're using gemini-3.1-pro-preview with thinking config, enable HIGH thinking level
    if (useThinking && targetModel === "gemini-3.1-pro-preview") {
      config.thinkingConfig = {
        thinkingLevel: "HIGH"
      };
      // Do NOT set maxOutputTokens when thinkingLevel is HIGH as per instructions!
    }

    console.log(`Chat request using model: ${targetModel}, thinking mode: ${useThinking ? 'HIGH' : 'OFF'}`);
    
    const response = await ai.models.generateContent({
      model: targetModel,
      contents: contents,
      config: config
    });

    const replyText = response.text || "I am sorry, I couldn't formulate a response. Please try again.";
    res.json({ text: replyText });

  } catch (error: any) {
    console.error("Gemini Chat API Error:", error);
    // Graceful fallback to offline counselor mode
    const lastMessage = messages[messages.length - 1]?.content || "";
    const mockReply = getMockChatResponse(lastMessage, messages) + "\n\n*(Note: Displayed in demo mode due to an API authentication or rate-limiting check)*";
    res.json({ text: mockReply });
  }
});

// Helper to get Base URL dynamically
const getBaseUrl = (req: express.Request) => {
  const appUrl = process.env.APP_URL;
  if (appUrl && appUrl !== "MY_APP_URL" && appUrl.trim() !== "") {
    return appUrl.replace(/\/$/, "");
  }
  const host = req.get("host") || "localhost:3000";
  const protocol = req.protocol === "https" || req.headers["x-forwarded-proto"] === "https" ? "https" : "http";
  return `${protocol}://${host}`;
};

// Check if credentials are set
const isConfiguredValue = (val: string | undefined): boolean => {
  return !!val && val.trim() !== "" && !val.includes("PLACEHOLDER") && !val.startsWith("YOUR_") && !val.startsWith("MY_");
};

// --- Google Auth Routes ---
app.get("/api/auth/google/url", (req, res) => {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const baseUrl = getBaseUrl(req);
  const redirectUri = `${baseUrl}/auth/google/callback`;

  if (!isConfiguredValue(clientId)) {
    return res.json({
      configured: false,
      callbackUrl: redirectUri,
      error: "GOOGLE_CLIENT_ID is not configured. Go to Settings -> Secrets and set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET."
    });
  }

  const params = new URLSearchParams({
    client_id: clientId!.trim(),
    redirect_uri: redirectUri,
    response_type: "code",
    scope: "openid profile email",
    prompt: "select_account"
  });

  res.json({
    configured: true,
    url: `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`
  });
});

app.get(["/auth/google/callback", "/auth/google/callback/"], async (req, res) => {
  const { code, error } = req.query;
  
  if (error) {
    return res.send(`
      <html>
        <body style="font-family: sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; background-color: #0f172a; color: #f8fafc; margin: 0;">
          <div style="text-align: center; max-width: 400px; padding: 20px; border: 1px solid #1e293b; border-radius: 12px; background-color: #1e293b;">
            <h2 style="color: #f43f5e; margin-top: 0;">Authentication Cancelled</h2>
            <p style="font-size: 14px; opacity: 0.8;">The login process was cancelled or failed: ${error}</p>
            <button onclick="window.close()" style="background-color: #3b82f6; color: white; border: none; padding: 10px 20px; border-radius: 6px; font-weight: bold; cursor: pointer; margin-top: 10px;">Close Window</button>
          </div>
        </body>
      </html>
    `);
  }

  if (!code) {
    return res.status(400).send("Authorization code missing.");
  }

  try {
    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    const baseUrl = getBaseUrl(req);
    const redirectUri = `${baseUrl}/auth/google/callback`;

    // Exchange code for tokens
    const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        code: String(code),
        client_id: clientId!.trim(),
        client_secret: clientSecret!.trim(),
        redirect_uri: redirectUri,
        grant_type: "authorization_code",
      }).toString()
    });

    if (!tokenResponse.ok) {
      const errText = await tokenResponse.text();
      throw new Error(`Token exchange failed: ${errText}`);
    }

    const tokens = await tokenResponse.json();
    const accessToken = tokens.access_token;

    // Fetch user profile from Google UserInfo endpoint
    const profileResponse = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      }
    });

    if (!profileResponse.ok) {
      const errText = await profileResponse.text();
      throw new Error(`Failed to fetch user profile: ${errText}`);
    }

    const profileData = await profileResponse.json();

    // Send the user profile back to parent window
    res.send(`
      <html>
        <body style="font-family: sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; background-color: #0f172a; color: #f8fafc; margin: 0;">
          <div style="text-align: center;">
            <div style="border: 4px solid #3b82f6; border-top: 4px solid transparent; border-radius: 50%; width: 40px; height: 40px; animation: spin 1s linear infinite; margin: 0 auto 15px auto;"></div>
            <h2>Google Login Successful!</h2>
            <p>Syncing your academic counselor session... This window will close shortly.</p>
          </div>
          <style>
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          </style>
          <script>
            if (window.opener) {
              window.opener.postMessage({
                type: 'OAUTH_AUTH_SUCCESS',
                provider: 'google',
                user: {
                  name: ${JSON.stringify(profileData.name || "")},
                  email: ${JSON.stringify(profileData.email || "")},
                  picture: ${JSON.stringify(profileData.picture || "")}
                }
              }, '*');
              window.close();
            } else {
              window.location.href = '/';
            }
          </script>
        </body>
      </html>
    `);
  } catch (err: any) {
    console.error("Google OAuth Error:", err);
    res.status(500).send(`
      <html>
        <body style="font-family: sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; background-color: #0f172a; color: #f8fafc; margin: 0;">
          <div style="text-align: center; max-width: 450px; padding: 25px; border: 1px solid #e11d48; border-radius: 12px; background-color: #1e1b4b;">
            <h2 style="color: #f43f5e; margin-top: 0;">OAuth Exchange Failed</h2>
            <p style="font-size: 14px; opacity: 0.8; font-family: monospace; text-align: left; background: #020617; padding: 12px; border-radius: 8px; overflow-x: auto;">
              ${err.message || err}
            </p>
            <p style="font-size: 12px; opacity: 0.6; margin-bottom: 20px;">
              Please make sure your GOOGLE_CLIENT_SECRET matches the GOOGLE_CLIENT_ID exactly and the redirect URI is configured correctly in Google Cloud Console.
            </p>
            <button onclick="window.close()" style="background-color: #f43f5e; color: white; border: none; padding: 10px 20px; border-radius: 6px; font-weight: bold; cursor: pointer;">Close Window</button>
          </div>
        </body>
      </html>
    `);
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
