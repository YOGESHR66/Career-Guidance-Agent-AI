import express from "express";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI, Type } from "@google/genai";
import { createServer as createViteServer } from "vite";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Initialize Gemini SDK with telemetry header
const getGeminiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY environment variable is not defined in the Secrets panel.");
  }
  return new GoogleGenAI({
    apiKey: apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
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

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
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

    const resultText = response.text;
    if (!resultText) {
      throw new Error("Empty response from Gemini API");
    }

    const guidanceData = JSON.parse(resultText);
    res.json(guidanceData);
  } catch (error: any) {
    console.error("Error generating guidance:", error);
    res.status(500).json({ 
      error: "Failed to generate career guidance.", 
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
