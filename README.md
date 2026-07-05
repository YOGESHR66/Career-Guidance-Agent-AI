# Career Guidance Agent AI 🚀

A high-fidelity, personalized tech pathway generator tailored specifically for engineering students navigating the tech recruitment and placement landscape. 

This full-stack application utilizes the **Google Gemini API** (via the modern `@google/genai` SDK) to analyze a student's profile, pinpoint knowledge gaps, formulate sequential learning roadmaps, recommend global vendor certifications, and estimate realistic entry-level salary projections in the Indian tech market.

🌐 **Live Demo:** [https://career-guidance-agent-ai-1.onrender.com](https://career-guidance-agent-ai-1.onrender.com)

---

## 🎨 Visual Preview & Features

### 1. 🔍 Dynamic Gap Analysis
Analyzes student resumes or inputted skills against modern industry standards, identifying missing libraries, core theoretical concepts, and frameworks required for placement readiness.

### 2. 📅 Learning Timeline & Roadmap
Generates a structured, sequential time-bounded timeline detailing what to learn month-by-month, which project to build, and when to start practicing placement-specific subjects.

### 3. 💼 Indian Market Salary Projections
Provides entry-level salary estimations (INR) segmented by industry tiers:
*   **Tech Startups** (Product-based)
*   **MNCs / Large Enterprises**
*   **Service Providers**

### 4. 🏅 Industry Credentials
Recommends globally recognized vendor certifications (AWS, Google Cloud, Microsoft Azure, etc.) that directly elevate resume shortlisting success.

### 5. ⚡ Student Presets
Quickly explore tailored roadmaps for popular engineering profiles:
*   **Web Enthusiast** (Frontend & Interactivity focus)
*   **Python Coder seeking AI/ML** (Data & Modeling focus)
*   **Cybersecurity Novice** (Ethical hacking & Networks focus)
*   **DevOps & Cloud Explorer** (Infrastructure & Automation focus)

---

## 🛠️ Tech Stack & Architecture

*   **Frontend:** [React 19](https://react.dev/) + [Vite 6](https://vite.dev/)
*   **Styling & UI:** [Tailwind CSS v4](https://tailwindcss.com/) + [Lucide React Icons](https://lucide.dev/)
*   **Animations:** [Motion (formerly Framer Motion)](https://motion.dev/)
*   **Backend Server:** [Express (Node.js)](https://expressjs.com/) configured with a Vite development middleware for instant reloads.
*   **AI Engine:** [Google Gemini API](https://ai.google.dev/) using the official `@google/genai` SDK.
*   **Bundling & Production builds:** `esbuild` for compiling the backend server into a self-contained ESM/CJS build.

---

## 🚦 Getting Started Locally

Follow these steps to run the project in your local development environment:

### Prerequisites
*   Node.js (v18+)
*   npm or yarn
*   A Gemini API Key (get one free from [Google AI Studio](https://aistudio.google.com/))

### 1. Clone the Repository
```bash
git clone https://github.com/YOGESHR66/Career-Guidance-Agent-AI.git
cd Career-Guidance-Agent-AI
