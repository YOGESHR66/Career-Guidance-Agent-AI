import express from "express";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI, Type } from "@google/genai";
import { createServer as createViteServer } from "vite";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

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

// API Endpoint for generating career guidance
app.post("/api/guidance", async (req, res) => {
  try {
    const { name, degree, year, skills, interests, preferredDomain, careerGoal } = req.body;

    if (!degree || !year || !interests || !careerGoal) {
      return res.status(400).json({ error: "Missing required fields in student profile" });
    }

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
    console.error("Error generating guidance:", error);
    
    // Customize user error message for common 503/high load responses
    let friendlyMessage = "Failed to generate career guidance.";
    const errString = JSON.stringify(error) || String(error);
    
    if (errString.includes("503") || errString.includes("high demand") || errString.includes("UNAVAILABLE") || errString.includes("busy")) {
      friendlyMessage = "The AI model is currently experiencing high demand and is temporarily unavailable. Please try submitting again in a few moments.";
    } else if (errString.includes("API key") || errString.includes("KEY")) {
      friendlyMessage = "Gemini API authorization failed. Please check or re-add your GEMINI_API_KEY in the Secrets panel.";
    }

    res.status(500).json({ 
      error: friendlyMessage, 
      details: error.message || error 
    });
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
