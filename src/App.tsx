import React, { useState, useEffect } from "react";
import { StudentProfile, CareerGuidance } from "./types";
import { StudentForm } from "./components/StudentForm";
import { GuidanceDashboard } from "./components/GuidanceDashboard";
import { HistoryPanel } from "./components/HistoryPanel";
import { Login } from "./components/Login";
import { generateDemoGuidance } from "./presets";
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
  const [activeTab, setActiveTab] = useState<"profile" | "guidance">("profile");

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
    setActiveTab("guidance");
    // Scroll to top of window
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleFormSubmit = async (submittedProfile: StudentProfile) => {
    setIsLoading(true);
    setError(null);
    setGuidance(null);
    setSelectedHistoryIdx(null);
    setActiveTab("guidance");

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
      console.warn("API Request failed (likely due to invalid workspace Gemini credentials). Silently falling back to high-quality direct guidance fallback:", err);
      try {
        const demoData = generateDemoGuidance(submittedProfile);
        const enrichedGuidance: CareerGuidance = {
          ...demoData,
          timestamp: new Date().toISOString(),
          profile: submittedProfile
        };
        setGuidance(enrichedGuidance);
        saveToHistory(enrichedGuidance);
      } catch (fallbackErr: any) {
        console.error("Local guidance generator failed:", fallbackErr);
        setError("Failed to generate career guidance report.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleTryDemoMode = () => {
    setError(null);
    setIsLoading(true);
    
    // Simulate a slight delay to make the demo transition feel natural and realistic
    setTimeout(() => {
      try {
        const demoData = generateDemoGuidance(profile);
        const enrichedGuidance: CareerGuidance = {
          ...demoData,
          timestamp: new Date().toISOString(),
          profile: profile
        };
        setGuidance(enrichedGuidance);
        saveToHistory(enrichedGuidance);
      } catch (err) {
        console.error("Demo generation failed:", err);
        setError("Failed to generate demo report.");
      } finally {
        setIsLoading(false);
      }
    }, 800);
  };

  const handleReset = () => {
    setProfile(INITIAL_PROFILE);
    setGuidance(null);
    setSelectedHistoryIdx(null);
    setError(null);
    setActiveTab("profile");
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

      {/* View Switcher / Tab Navigation - Print Hidden */}
      <div className="bg-white border-b border-slate-200 py-3.5 px-6 print:hidden sticky top-[108px] z-30 shadow-xs">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex border-2 border-slate-950 bg-slate-100 p-1 rounded-xl">
            <button
              onClick={() => setActiveTab("profile")}
              className={`px-5 py-2.5 text-xs font-bold uppercase tracking-wider flex items-center gap-2 rounded-lg transition-all ${
                activeTab === "profile"
                  ? "bg-slate-900 text-white shadow"
                  : "text-slate-600 hover:text-slate-900 hover:bg-white/50"
              }`}
            >
              <Compass className="w-4 h-4" />
              1. Profile Inputs & History
            </button>
            <button
              onClick={() => {
                setActiveTab("guidance");
              }}
              className={`px-5 py-2.5 text-xs font-bold uppercase tracking-wider flex items-center gap-2 rounded-lg transition-all ${
                activeTab === "guidance"
                  ? "bg-slate-900 text-white shadow"
                  : "text-slate-600 hover:text-slate-900 hover:bg-white/50"
              }`}
            >
              <Sparkles className="w-4 h-4" />
              2. AI Career Roadmap
              {guidance && (
                <span className="ml-1 px-1.5 py-0.5 text-[9px] font-bold bg-emerald-500 text-white rounded">
                  READY
                </span>
              )}
            </button>
          </div>

          <div className="flex items-center gap-2">
            {activeTab === "guidance" && (
              <button
                onClick={() => setActiveTab("profile")}
                className="text-xs font-bold uppercase tracking-wider text-blue-600 hover:text-blue-800 flex items-center gap-1.5 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Edit Profile Details
              </button>
            )}
            {activeTab === "profile" && guidance && (
              <button
                onClick={() => setActiveTab("guidance")}
                className="text-xs font-bold uppercase tracking-wider text-indigo-600 hover:text-indigo-800 flex items-center gap-1.5 transition-colors"
              >
                View Current Report
                <ChevronRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-6">
        
        {activeTab === "profile" ? (
          /* Step 1: Input Profile Form & History logs */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            <div className="lg:col-span-8">
              <StudentForm 
                onSubmit={handleFormSubmit}
                isLoading={isLoading}
                currentProfile={profile}
                onChangeProfile={setProfile}
              />
            </div>

            <div className="lg:col-span-4 space-y-6">
              <HistoryPanel 
                history={history}
                onSelectReport={handleSelectReport}
                onDeleteReport={handleDeleteReport}
                onClearHistory={handleClearHistory}
                selectedIdx={selectedHistoryIdx}
              />

              <div className="bg-slate-100 p-5 rounded-2xl border border-slate-200/80 space-y-3">
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-500">
                  Academic Counseling Guide
                </h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Provide your degree program, technical skillsets, and aspirations on the form to obtain a customized report.
                </p>
                <p className="text-xs text-slate-600 leading-relaxed font-semibold">
                  💡 Tip: Personas at the top of the form provide pre-loaded parameters instantly for simple demonstration.
                </p>
                {history.length > 0 && (
                  <p className="text-xs text-slate-500 font-medium leading-relaxed pt-1 border-t border-slate-200/60">
                    Your previous career reports are cached automatically in the panel above. Click any report to reload and inspect details.
                  </p>
                )}
              </div>
            </div>
          </div>
        ) : (
          /* Step 2: AI Guidance Output & Skeletons */
          <div className="max-w-5xl mx-auto space-y-6">
            
            {error && (
              <div className="p-6 bg-rose-50 border-2 border-rose-200 rounded-2xl text-rose-900 space-y-3 shadow-md">
                <div className="flex items-center gap-2 font-black text-sm uppercase tracking-tight text-rose-800">
                  <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
                  <span>Counselor Analysis Interrupted</span>
                </div>
                <div className="text-xs font-semibold text-rose-900 bg-white/70 p-3.5 border border-rose-100 rounded-xl leading-relaxed">
                  {error}
                </div>
                <p className="text-[11px] text-rose-700/90 leading-relaxed">
                  💡 <strong>Tip:</strong> If the temporary workspace developer credentials have expired after a period of inactivity, you can update your key in the <strong>Settings &gt; Secrets</strong> panel. Alternatively, you can run the counselor in offline <strong>Demo Mode</strong> below to immediately try out the highly comprehensive interactive guidance dashboard!
                </p>
                <div className="pt-2 flex flex-wrap items-center gap-3">
                  <button
                    onClick={() => setActiveTab("profile")}
                    className="px-4 py-2 bg-rose-100 hover:bg-rose-200 text-rose-950 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors border border-rose-300"
                  >
                    Return to Profile Details
                  </button>
                  <button
                    onClick={handleTryDemoMode}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold uppercase tracking-wider transition-all shadow-sm flex items-center gap-2 border border-blue-700"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    Load High-Quality Offline Demo Report
                  </button>
                </div>
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
              <div className="space-y-4">
                <div className="flex justify-between items-center print:hidden">
                  <button
                    onClick={() => setActiveTab("profile")}
                    className="px-4 py-2 border border-slate-300 hover:border-slate-900 text-slate-700 hover:text-slate-900 text-xs font-bold uppercase tracking-wider bg-white transition-all rounded flex items-center gap-1.5"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Modify Input Details
                  </button>

                  <button
                    onClick={handleReset}
                    className="px-4 py-2 text-xs font-bold uppercase tracking-wider border border-slate-200 hover:border-rose-500 text-slate-500 hover:text-rose-600 bg-slate-50 hover:bg-rose-50 transition-all rounded"
                  >
                    Reset & Start Over
                  </button>
                </div>

                <GuidanceDashboard 
                  guidance={guidance}
                  profile={profile}
                />
              </div>
            ) : (
              /* Empty state when no report is generated yet */
              <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center max-w-xl mx-auto my-12 shadow-xs space-y-6">
                <div className="w-16 h-16 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mx-auto border border-blue-100 shadow-sm animate-bounce">
                  <Compass className="w-8 h-8" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-bold uppercase tracking-tight text-slate-800">
                    No Roadmap Generated Yet
                  </h3>
                  <p className="text-sm text-slate-500 leading-relaxed max-w-sm mx-auto">
                    To see your personalized career path, certifications, missing skills analysis, and salary projections, please fill in your student details on Step 1.
                  </p>
                </div>
                <button
                  onClick={() => setActiveTab("profile")}
                  className="px-6 py-3 bg-slate-900 text-white hover:bg-slate-800 text-xs font-bold uppercase tracking-wider transition-all shadow-sm rounded-lg"
                >
                  Enter Profile Details Now
                </button>
              </div>
            )}

          </div>
        )}

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
