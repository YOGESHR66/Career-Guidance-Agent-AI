import React, { useState, useEffect } from "react";
import { StudentProfile, CareerGuidance } from "./types";
import { StudentForm } from "./components/StudentForm";
import { GuidanceDashboard } from "./components/GuidanceDashboard";
import { HistoryPanel } from "./components/HistoryPanel";
import { Login } from "./components/Login";
import { 
  Compass, 
  Sparkles, 
  History, 
  GraduationCap, 
  AlertCircle, 
  BookOpen, 
  CheckCircle2, 
  Lightbulb, 
  ChevronRight,
  TrendingUp,
  Award,
  ArrowLeft,
  Briefcase
} from "lucide-react";

const INITIAL_PROFILE: StudentProfile = {
  name: "",
  degree: "",
  year: "",
  skills: "",
  interests: "",
  preferredDomain: "",
  careerGoal: ""
};

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [profile, setProfile] = useState<StudentProfile>(INITIAL_PROFILE);
  const [guidance, setGuidance] = useState<CareerGuidance | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<CareerGuidance[]>([]);
  const [selectedHistoryIdx, setSelectedHistoryIdx] = useState<number | null>(null);

  // Load history on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem("career_guidance_history");
      if (stored) {
        setHistory(JSON.parse(stored));
      }
    } catch (e) {
      console.error("Failed to parse history from localStorage", e);
    }
  }, []);

  // Save history helper
  const saveToHistory = (newGuidance: CareerGuidance) => {
    try {
      const updated = [newGuidance, ...history].slice(0, 20); // Keep last 20
      setHistory(updated);
      localStorage.setItem("career_guidance_history", JSON.stringify(updated));
    } catch (e) {
      console.error("Failed to save to localStorage", e);
    }
  };

  const handleClearHistory = () => {
    if (window.confirm("Are you sure you want to delete all saved consultation logs?")) {
      setHistory([]);
      localStorage.removeItem("career_guidance_history");
      setSelectedHistoryIdx(null);
    }
  };

  const handleDeleteReport = (index: number) => {
    const updated = history.filter((_, i) => i !== index);
    setHistory(updated);
    localStorage.setItem("career_guidance_history", JSON.stringify(updated));
    if (selectedHistoryIdx === index) {
      setSelectedHistoryIdx(null);
    } else if (selectedHistoryIdx !== null && selectedHistoryIdx > index) {
      setSelectedHistoryIdx(selectedHistoryIdx - 1);
    }
  };

  const handleSelectReport = (item: CareerGuidance) => {
    setGuidance(item);
    if (item.profile) {
      setProfile(item.profile);
    }
    const idx = history.findIndex(h => h.timestamp === item.timestamp);
    setSelectedHistoryIdx(idx !== -1 ? idx : null);
    // Scroll to guidance dashboard
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleFormSubmit = async (submittedProfile: StudentProfile) => {
    setIsLoading(true);
    setError(null);
    setGuidance(null);
    setSelectedHistoryIdx(null);

    try {
      const response = await fetch("/api/guidance", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(submittedProfile),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || `Server responded with ${response.status}`);
      }

      const data: CareerGuidance = await response.json();
      
      // Inject profile and timestamp for client tracking
      const enrichedGuidance: CareerGuidance = {
        ...data,
        timestamp: new Date().toISOString(),
        profile: submittedProfile
      };

      setGuidance(enrichedGuidance);
      saveToHistory(enrichedGuidance);
    } catch (err: any) {
      console.error("Request failed:", err);
      setError(err.message || "An unexpected error occurred while consulting the AI counselor.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setProfile(INITIAL_PROFILE);
    setGuidance(null);
    setSelectedHistoryIdx(null);
    setError(null);
  };

  if (!isLoggedIn) {
    return <Login onLogin={() => setIsLoggedIn(true)} />;
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      {/* Dynamic Upper Header following Geometric Balance design */}
      <header className="bg-white border-b-2 border-slate-900 px-6 py-6 sticky top-0 z-40 shadow-sm print:relative print:border-b">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
          <div className="flex flex-col">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[11px] font-black uppercase tracking-widest text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded border border-blue-200">
                AI Career Agent
              </span>
              <span className="text-[11px] font-mono text-slate-400">v2.5 (Geometric Precision)</span>
            </div>
            <h1 className="text-3xl font-black uppercase tracking-tight text-slate-900">
              Career Guidance Agent AI
            </h1>
            <p className="text-xs text-slate-500 font-medium mt-1">
              Analyzes student competencies, courses, and interests to formulate optimal paths, certifications, & wage projections.
            </p>
          </div>

          <div className="text-right shrink-0 flex items-center gap-3 print:hidden">
            {guidance && (
              <button
                onClick={handleReset}
                className="px-4 py-2 text-xs font-bold uppercase tracking-tight border border-slate-300 hover:border-slate-900 text-slate-700 hover:text-slate-900 bg-white transition-all rounded"
              >
                Reset Form
              </button>
            )}
            <button
              onClick={() => setIsLoggedIn(false)}
              className="px-4 py-2 text-xs font-bold uppercase tracking-tight border border-slate-200 hover:border-rose-500 text-slate-500 hover:text-rose-600 bg-slate-50 hover:bg-rose-50 transition-all rounded"
            >
              Sign Out
            </button>
            <div className="hidden md:block">
              <div className="bg-slate-900 text-white px-3 py-1 text-[11px] font-bold uppercase tracking-tighter inline-block">
                SYSTEM: STABLE
              </div>
              <p className="text-[10px] text-slate-400 font-mono mt-1">2026-JUL-04 CLIENT_LIVE</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Hand: Student Form and Consultation History */}
        <div className="lg:col-span-5 space-y-6 print:hidden">
          
          <StudentForm 
            onSubmit={handleFormSubmit}
            isLoading={isLoading}
            currentProfile={profile}
            onChangeProfile={setProfile}
          />

          <HistoryPanel 
            history={history}
            onSelectReport={handleSelectReport}
            onDeleteReport={handleDeleteReport}
            onClearHistory={handleClearHistory}
            selectedIdx={selectedHistoryIdx}
          />

        </div>

        {/* Right Hand: Output Dashboard or Skeletons */}
        <div className="lg:col-span-7 space-y-6">
          
          {error && (
            <div className="p-5 bg-rose-50 border-l-4 border-rose-500 rounded-xl text-rose-800 space-y-2 shadow-sm animate-fade-in">
              <div className="flex items-center gap-2 font-bold text-sm">
                <AlertCircle className="w-5 h-5 text-rose-600" />
                <span>Counselor Analysis Interrupted</span>
              </div>
              <p className="text-xs font-medium">{error}</p>
              <p className="text-[11px] text-rose-500/80">Please check your internet connection or verify your GEMINI_API_KEY in the Secrets panel, then try again.</p>
            </div>
          )}

          {isLoading ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-8 space-y-8 animate-pulse shadow-sm">
              <div className="flex justify-between items-center pb-4 border-b border-slate-100">
                <div className="space-y-2 w-2/3">
                  <div className="h-4 bg-slate-200 rounded w-1/3"></div>
                  <div className="h-8 bg-slate-300 rounded w-4/5"></div>
                  <div className="h-4 bg-slate-200 rounded w-1/2"></div>
                </div>
                <div className="h-10 bg-slate-200 rounded w-24"></div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="col-span-1 h-36 bg-slate-200 rounded"></div>
                <div className="col-span-2 h-36 bg-slate-200 rounded"></div>
              </div>

              <div className="space-y-4">
                <div className="h-4 bg-slate-200 rounded w-1/4"></div>
                <div className="space-y-2">
                  <div className="h-10 bg-slate-100 rounded"></div>
                  <div className="h-10 bg-slate-100 rounded"></div>
                  <div className="h-10 bg-slate-100 rounded"></div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-6 border-t border-slate-100">
                <div className="h-4 bg-slate-200 rounded w-1/5"></div>
                <span className="text-xs font-semibold text-slate-400 animate-bounce">
                  Analyzing parameters with AI model...
                </span>
              </div>
            </div>
          ) : guidance ? (
            <GuidanceDashboard 
              guidance={guidance}
              profile={profile}
            />
          ) : (
            // Empty / Welcome state implementing Geometric Balance structure
            <div className="bg-white rounded-2xl border border-slate-200 p-8 space-y-8 shadow-sm">
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100">
                  <Compass className="w-6 h-6" />
                </div>
                <h2 className="text-2xl font-black uppercase tracking-tight text-slate-800">
                  Personalized Engineering & Tech Pathway Generator
                </h2>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Enter your academic credentials, current languages/frameworks, and core professional interests to formulate a high-fidelity roadmap. This system is tailored for technical students navigating the Indian placement landscape.
                </p>
              </div>

              {/* Bento Grid Features Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-5 bg-slate-50 rounded-xl border border-slate-100 hover:border-slate-200 transition-all">
                  <div className="text-blue-600 font-bold text-xs uppercase tracking-wider mb-2">
                    01 / Dynamic Gap Analysis
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Identifies crucial libraries, frameworks, or theoretical concepts missing from your resume profile based on industry requirements.
                  </p>
                </div>

                <div className="p-5 bg-slate-50 rounded-xl border border-slate-100 hover:border-slate-200 transition-all">
                  <div className="text-blue-600 font-bold text-xs uppercase tracking-wider mb-2">
                    02 / Learning Timeline
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Constructs sequential learning stages to acquire credentials, build projects, and qualify for placement exams.
                  </p>
                </div>

                <div className="p-5 bg-slate-50 rounded-xl border border-slate-100 hover:border-slate-200 transition-all">
                  <div className="text-blue-600 font-bold text-xs uppercase tracking-wider mb-2">
                    03 / India Market Projections
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Provides realistic annual entry-level salary estimations (INR) across Indian tech startups, MNCs, and service providers.
                  </p>
                </div>

                <div className="p-5 bg-slate-50 rounded-xl border border-slate-100 hover:border-slate-200 transition-all">
                  <div className="text-blue-600 font-bold text-xs uppercase tracking-wider mb-2">
                    04 / Industry Credentials
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Recommends globally recognized vendor certifications (AWS, Google, Microsoft) that immediately lift applicant profiles.
                  </p>
                </div>
              </div>

              {/* Informative advice strip */}
              <div className="bg-yellow-100 p-4 rounded-xl border border-yellow-200 text-xs text-yellow-900 leading-relaxed">
                <strong>💡 Tip for Students:</strong> Select one of the quick presets on the left sidebar to immediately see how the AI Counselor analyses profiles, projects roadmaps, and determines missing skills.
              </div>
            </div>
          )}

        </div>

      </main>

      {/* Footer conforming to Geometric Balance */}
      <footer className="bg-white border-t-2 border-slate-900 py-4 px-6 mt-12 print:hidden">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4 text-[11px] font-mono text-slate-400 uppercase tracking-widest">
          <span>AI Career Counselor v2.5 (Beta)</span>
          <div className="flex gap-6">
            <span>Session Status: Authorized</span>
            <span>Accuracy Multiplier: 1.0</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
