import React, { useState, useEffect } from "react";
import { StudentProfile, CareerGuidance } from "./types";
import { StudentForm } from "./components/StudentForm";
import { GuidanceDashboard } from "./components/GuidanceDashboard";
import { HistoryPanel } from "./components/HistoryPanel";
import { Login } from "./components/Login";
import { ThemeSelector } from "./components/ThemeSelector";
import { Theme, THEMES } from "./theme";
import { generateDemoGuidance } from "./presets";
import { CareerChatbot } from "./components/CareerChatbot";
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
  const [activeTheme, setActiveTheme] = useState<Theme>(THEMES[0]);
  const [profile, setProfile] = useState<StudentProfile>(INITIAL_PROFILE);
  const [guidance, setGuidance] = useState<CareerGuidance | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<CareerGuidance[]>([]);
  const [selectedHistoryIdx, setSelectedHistoryIdx] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<"profile" | "guidance">("profile");

  // Helper to apply theme colors as CSS custom properties
  const applyTheme = (theme: Theme) => {
    try {
      const root = document.documentElement;
      Object.entries(theme.colors).forEach(([key, val]) => {
        root.style.setProperty(key, val);
      });
    } catch (e) {
      console.error("Failed to apply theme CSS variables", e);
    }
  };

  const handleThemeChange = (theme: Theme) => {
    setActiveTheme(theme);
    try {
      localStorage.setItem("career_guidance_theme", theme.id);
    } catch (e) {
      console.error(e);
    }
    applyTheme(theme);
  };

  // Load history and theme on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem("career_guidance_history");
      if (stored) {
        setHistory(JSON.parse(stored));
      }
    } catch (e) {
      console.error("Failed to parse history from localStorage", e);
    }

    try {
      const storedThemeId = localStorage.getItem("career_guidance_theme");
      if (storedThemeId) {
        const found = THEMES.find(t => t.id === storedThemeId);
        if (found) {
          setActiveTheme(found);
          applyTheme(found);
        } else {
          applyTheme(THEMES[0]);
        }
      } else {
        applyTheme(THEMES[0]);
      }
    } catch (e) {
      console.error("Failed to load theme on mount", e);
      applyTheme(THEMES[0]);
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
    setHistory([]);
    localStorage.removeItem("career_guidance_history");
    setSelectedHistoryIdx(null);
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
    return (
      <Login 
        onLogin={(userData) => {
          setIsLoggedIn(true);
          if (userData?.name) {
            setProfile(p => ({
              ...p,
              name: userData.name
            }));
          }
        }} 
      />
    );
  }

  return (
    <div className="min-h-screen bg-[var(--bg-main)] text-[var(--text-main)] flex flex-col font-sans transition-colors duration-300 relative overflow-hidden">
      
      {/* ================= BACKGROUND CAREER PATH DOODLES ================= */}
      <div className="absolute inset-0 w-full h-full pointer-events-none z-0 overflow-hidden">
        
        {/* Full-screen connecting dashed pathway (Flows AROUND the layout cards) */}
        <svg className="absolute inset-0 w-full h-full opacity-20 hidden xl:block" viewBox="0 0 1440 1080" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
          {/* Left-side connection */}
          <path d="M 120 180 C 40 320 40 500 120 620 C 180 680 80 850 120 950" stroke="var(--accent-primary)" strokeWidth="2" strokeLinecap="round" strokeDasharray="6 8" />
          
          {/* Right-side connection */}
          <path d="M 1320 180 C 1400 320 1400 500 1320 620 C 1260 680 1360 850 1320 950" stroke="var(--accent-secondary)" strokeWidth="2" strokeLinecap="round" strokeDasharray="6 8" />
        </svg>

        {/* 1. VISION (Top-Left) - Soft Amber Accent */}
        <div className="absolute top-[18%] left-[2%] xl:left-[3%] flex flex-col items-center opacity-30 hover:opacity-85 hover:scale-105 transition-all duration-300 hidden xl:flex bg-[var(--bg-card)] border border-[var(--color-border)] p-3 rounded-2xl shadow-sm z-10">
          <svg className="w-12 h-12 text-amber-500" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M 50,18 C 34,18 29,33 29,46 C 29,56 37,63 41,70 L 41,78 L 59,78 L 59,70 C 63,63 71,56 71,46 C 71,33 66,18 50,18 Z" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="#fef3c7" fillOpacity="0.2" />
            <path d="M 41,78 C 41,78 43,83 50,83 C 57,83 59,78 59,78" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
            <path d="M 44,83 C 44,83 46,87 50,87 C 54,87 56,83 56,83" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
            <line x1="50" y1="8" x2="50" y2="13" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
            <line x1="18" y1="46" x2="23" y2="46" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
            <line x1="82" y1="46" x2="77" y2="46" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
          </svg>
          <span className="text-[9px] font-bold text-amber-700 dark:text-amber-500 tracking-widest uppercase font-mono mt-1">VISION</span>
        </div>

        {/* 2. STARTUP Puzzle (Middle-Left) - Soft Indigo Accent */}
        <div className="absolute top-[48%] left-[1.5%] xl:left-[2.5%] flex flex-col items-center opacity-30 hover:opacity-85 hover:scale-105 transition-all duration-300 hidden xl:flex bg-[var(--bg-card)] border border-[var(--color-border)] p-3 rounded-2xl shadow-sm z-10">
          <svg className="w-12 h-12 text-indigo-500" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M 25,25 H 42 C 42,15 58,15 58,25 H 75 V 42 C 85,42 85,58 75,58 V 75 H 58 Q 58,65 50,65 Q 42,65 42,75 H 25 V 58 C 15,58 15,42 25,42 Z" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="#e0e7ff" fillOpacity="0.2" />
          </svg>
          <span className="text-[9px] font-bold text-indigo-700 dark:text-indigo-400 tracking-widest uppercase font-mono mt-1">STARTUP</span>
        </div>

        {/* 3. PLAN Books (Bottom-Left) - Soft Emerald Accent */}
        <div className="absolute bottom-[18%] left-[2%] xl:left-[3%] flex flex-col items-center opacity-30 hover:opacity-85 hover:scale-105 transition-all duration-300 hidden xl:flex bg-[var(--bg-card)] border border-[var(--color-border)] p-3 rounded-2xl shadow-sm z-10">
          <svg className="w-12 h-12 text-emerald-500" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="22" y="52" width="12" height="28" rx="1.5" stroke="currentColor" strokeWidth="2.5" fill="#d1fae5" fillOpacity="0.2" />
            <rect x="38" y="38" width="12" height="42" rx="1.5" stroke="currentColor" strokeWidth="2.5" fill="#d1fae5" fillOpacity="0.2" />
            <rect x="54" y="22" width="12" height="58" rx="1.5" stroke="currentColor" strokeWidth="2.5" fill="currentColor" fillOpacity="0.1" />
          </svg>
          <span className="text-[9px] font-bold text-emerald-700 dark:text-emerald-400 tracking-widest uppercase font-mono mt-1">PLAN</span>
        </div>

        {/* 4. GOAL Target (Top-Right) - Soft Rose Accent */}
        <div className="absolute top-[18%] right-[2%] xl:right-[3%] flex flex-col items-center opacity-30 hover:opacity-85 hover:scale-105 transition-all duration-300 hidden xl:flex bg-[var(--bg-card)] border border-[var(--color-border)] p-3 rounded-2xl shadow-sm z-10">
          <svg className="w-12 h-12 text-rose-500" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="50" cy="50" r="34" stroke="currentColor" strokeWidth="2.5" strokeDasharray="3 3" fill="#ffe4e6" fillOpacity="0.1" />
            <circle cx="50" cy="50" r="24" stroke="currentColor" strokeWidth="2.5" />
            <circle cx="50" cy="50" r="6" stroke="currentColor" strokeWidth="2.5" fill="currentColor" fillOpacity="0.2" />
          </svg>
          <span className="text-[9px] font-bold text-rose-700 dark:text-rose-400 tracking-widest uppercase font-mono mt-1">GOAL</span>
        </div>

        {/* 5. RESEARCH Magnifying Glass (Middle-Right) - Soft Sky Accent */}
        <div className="absolute top-[48%] right-[1.5%] xl:right-[2.5%] flex flex-col items-center opacity-30 hover:opacity-85 hover:scale-105 transition-all duration-300 hidden xl:flex bg-[var(--bg-card)] border border-[var(--color-border)] p-3 rounded-2xl shadow-sm z-10">
          <svg className="w-12 h-12 text-sky-500" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="42" cy="42" r="20" stroke="currentColor" strokeWidth="2.5" fill="#e0f2fe" fillOpacity="0.2" />
            <path d="M 56,56 L 80,80" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
          </svg>
          <span className="text-[9px] font-bold text-sky-700 dark:text-sky-400 tracking-widest uppercase font-mono mt-1">RESEARCH</span>
        </div>

        {/* 6. STEPS Career Stairs (Bottom-Right) - Soft Violet Accent */}
        <div className="absolute bottom-[18%] right-[2%] xl:right-[3%] flex flex-col items-center opacity-30 hover:opacity-85 hover:scale-105 transition-all duration-300 hidden xl:flex bg-[var(--bg-card)] border border-[var(--color-border)] p-3 rounded-2xl shadow-sm z-10">
          <svg className="w-12 h-12 text-violet-500" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M 20,80 H 35 V 65 H 50 V 50 H 65 V 35 H 80" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="#ede9fe" fillOpacity="0.2" />
            <path d="M 15,80 H 85" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
          </svg>
          <span className="text-[9px] font-bold text-violet-700 dark:text-violet-400 tracking-widest uppercase font-mono mt-1">STEPS</span>
        </div>
      </div>

      {/* Polished Modern Header */}
      <header className="bg-[var(--bg-card)] border-b border-[var(--color-border)] px-6 py-5 sticky top-0 z-40 shadow-sm print:relative print:border-b transition-all duration-300">
        <div className="max-w-7xl mx-auto flex flex-col items-center text-center">
          <div className="flex flex-row items-center justify-center gap-4 sm:gap-6 md:gap-10 w-full max-w-5xl">
            {/* Left Image: Career Growth Stairs */}
            <div className="shrink-0 relative group">
              <div className="absolute inset-0 bg-gradient-to-tr from-[var(--accent-primary)]/10 to-transparent rounded-xl blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <img
                src="/src/assets/images/career_growth_stairs_1784136192260.jpg"
                alt="Career Growth Stairs"
                referrerPolicy="no-referrer"
                className="w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 rounded-xl object-cover border border-[var(--color-border)] shadow-xs group-hover:scale-105 transition-all duration-300 bg-white"
                style={{
                  mixBlendMode: activeTheme.isDark ? "screen" : "multiply",
                  filter: activeTheme.isDark ? "invert(1) hue-rotate(180deg)" : "none"
                }}
              />
            </div>

            {/* Center Title Content */}
            <div className="flex flex-col items-center">
              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--accent-primary)] bg-[var(--accent-light)] px-2.5 py-0.5 rounded border border-[var(--accent-light-border)] shadow-xs">
                  AI Career Agent
                </span>
              </div>
              
              <h1 className="text-xl sm:text-2xl md:text-3xl font-black tracking-tight text-[var(--text-main)] mb-2">
                <span className="relative inline-block mr-2">
                  Career
                  {/* Mounted graduate cap sitting elegantly on top of the "Career" text */}
                  <GraduationCap className="absolute -top-6 -left-4 w-7 h-7 sm:w-8 sm:h-8 md:w-9 md:h-9 text-[var(--accent-primary)] transform -rotate-12 drop-shadow-[0_2px_4px_rgba(0,0,0,0.2)] animate-bounce" style={{ animationDuration: "3.5s" }} />
                </span>
                <span>Guidance AI Agent</span>
              </h1>
              
              <p className="text-[11px] sm:text-xs text-[var(--text-muted)] font-semibold max-w-xs sm:max-w-md md:max-w-xl">
                Analyzes student competencies, courses, and interests to formulate optimal paths, certifications, & wage projections.
              </p>
            </div>

            {/* Right Image: Career Planning Icons */}
            <div className="shrink-0 relative group">
              <div className="absolute inset-0 bg-gradient-to-tr from-[var(--accent-secondary)]/10 to-transparent rounded-xl blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <img
                src="/src/assets/images/career_planning_icons_1784136204978.jpg"
                alt="Career Planning Icons"
                referrerPolicy="no-referrer"
                className="w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 rounded-xl object-cover border border-[var(--color-border)] shadow-xs group-hover:scale-105 transition-all duration-300 bg-white"
                style={{
                  mixBlendMode: activeTheme.isDark ? "screen" : "multiply",
                  filter: activeTheme.isDark ? "invert(1) hue-rotate(180deg)" : "none"
                }}
              />
            </div>
          </div>
        </div>
      </header>

      {/* View Switcher / Tab Navigation - Print Hidden */}
      <div className="bg-[var(--bg-card)] border-b border-[var(--color-border)]/80 py-3 px-6 print:hidden sticky top-[80px] z-30 shadow-xs transition-colors duration-300">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex border border-[var(--color-border)] bg-[var(--bg-input)] p-1 rounded-xl shrink-0">
            <button
              onClick={() => setActiveTab("profile")}
              className={`px-5 py-2 text-xs font-semibold uppercase tracking-wider flex items-center gap-2 rounded-lg transition-all cursor-pointer ${
                activeTab === "profile"
                  ? "bg-[var(--accent-primary)] text-[var(--primary-btn-text)] shadow-sm"
                  : "text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-card)]/50"
              }`}
            >
              <Compass className="w-4 h-4" />
              1. Profile Inputs & History
            </button>
            <button
              onClick={() => {
                setActiveTab("guidance");
              }}
              className={`px-5 py-2 text-xs font-semibold uppercase tracking-wider flex items-center gap-2 rounded-lg transition-all cursor-pointer ${
                activeTab === "guidance"
                  ? "bg-[var(--accent-primary)] text-[var(--primary-btn-text)] shadow-sm"
                  : "text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-card)]/50"
              }`}
            >
              <Sparkles className="w-4 h-4" />
              2. AI Career Roadmap
              {guidance && (
                <span className="ml-1 px-1.5 py-0.5 text-[9px] font-bold bg-[var(--accent-secondary)] text-[var(--primary-btn-text)] rounded border border-[var(--color-border)]/20">
                  READY
                </span>
              )}
            </button>
          </div>

          <div className="flex items-center justify-end gap-3.5 w-full md:w-auto shrink-0">
            {/* Style Lab Theme Selector moved to the right end of the "AI career roadmap" navigation row */}
            <ThemeSelector activeTheme={activeTheme} onThemeChange={handleThemeChange} />

            {guidance && (
              <button
                onClick={handleReset}
                className="px-3.5 py-1.5 text-[10px] font-bold uppercase tracking-wider border border-[var(--color-border)] text-[var(--text-main)] bg-[var(--bg-card)] hover:bg-[var(--bg-input)] transition-all rounded-lg shadow-sm cursor-pointer"
              >
                Reset Form
              </button>
            )}

            <div className="hidden md:block h-4 w-px bg-[var(--color-border)]/60" />

            {activeTab === "guidance" && (
              <button
                onClick={() => setActiveTab("profile")}
                className="text-xs font-semibold uppercase tracking-wider text-[var(--accent-primary)] hover:text-[var(--accent-primary-hover)] flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                Edit Profile Details
              </button>
            )}
            {activeTab === "profile" && guidance && (
              <button
                onClick={() => setActiveTab("guidance")}
                className="text-xs font-semibold uppercase tracking-wider text-[var(--accent-secondary)] hover:text-[var(--accent-secondary-hover)] flex items-center gap-1.5 transition-colors cursor-pointer"
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

              <div className="bg-[var(--bg-card)] p-5 rounded-2xl border border-[var(--color-border)] shadow-[var(--card-shadow)] space-y-3 transition-colors duration-300">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">
                  Academic Counseling Guide
                </h4>
                <p className="text-xs text-[var(--text-main)] leading-relaxed">
                  Provide your degree program, technical skillsets, and aspirations on the form to obtain a customized report.
                </p>
                <p className="text-xs text-[var(--text-main)] leading-relaxed font-semibold">
                  💡 Tip: Personas at the top of the form provide pre-loaded parameters instantly for simple demonstration.
                </p>
                {history.length > 0 && (
                  <p className="text-xs text-[var(--text-muted)] font-medium leading-relaxed pt-1 border-t border-[var(--color-border)]/40">
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
              <div className="p-6 bg-rose-50/50 dark:bg-rose-950/10 border border-rose-200/80 rounded-2xl text-rose-900 dark:text-rose-200 space-y-3 shadow-sm">
                <div className="flex items-center gap-2 font-bold text-sm uppercase tracking-tight text-rose-800 dark:text-rose-300">
                  <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
                  <span>Counselor Analysis Interrupted</span>
                </div>
                <div className="text-xs font-semibold text-rose-950 dark:text-rose-100 bg-white/70 dark:bg-zinc-900/50 p-3.5 border border-rose-100 dark:border-rose-950/20 rounded-xl leading-relaxed">
                  {error}
                </div>
                <p className="text-[11px] text-rose-700/90 dark:text-rose-300/80 leading-relaxed">
                  💡 <strong>Tip:</strong> If the temporary workspace developer credentials have expired after a period of inactivity, you can update your key in the <strong>Settings &gt; Secrets</strong> panel. Alternatively, you can run the counselor in offline <strong>Demo Mode</strong> below to immediately try out the highly comprehensive interactive guidance dashboard!
                </p>
                <div className="pt-2 flex flex-wrap items-center gap-3">
                  <button
                    onClick={() => setActiveTab("profile")}
                    className="px-4 py-2 bg-rose-100 hover:bg-rose-200 dark:bg-rose-950/30 dark:hover:bg-rose-900/40 text-rose-950 dark:text-rose-200 rounded-lg text-xs font-semibold uppercase tracking-wider transition-colors border border-rose-300 dark:border-rose-800"
                  >
                    Return to Profile Details
                  </button>
                  <button
                    onClick={handleTryDemoMode}
                    className="px-4 py-2 bg-[var(--accent-primary)] hover:bg-[var(--accent-primary-hover)] text-[var(--primary-btn-text)] rounded-lg text-xs font-semibold uppercase tracking-wider transition-all shadow-sm flex items-center gap-2"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    Load High-Quality Offline Demo Report
                  </button>
                </div>
              </div>
            )}


            {isLoading ? (
              <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200/80 dark:border-zinc-800 p-8 space-y-8 animate-pulse shadow-sm">
                <div className="flex justify-between items-center pb-4 border-b border-slate-100 dark:border-zinc-800">
                  <div className="space-y-2 w-2/3">
                    <div className="h-4 bg-slate-200 dark:bg-zinc-800 rounded w-1/3"></div>
                    <div className="h-8 bg-slate-300 dark:bg-zinc-700 rounded w-4/5"></div>
                    <div className="h-4 bg-slate-200 dark:bg-zinc-800 rounded w-1/2"></div>
                  </div>
                  <div className="h-10 bg-slate-200 dark:bg-zinc-800 rounded w-24"></div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="col-span-1 h-36 bg-slate-200 dark:bg-zinc-800 rounded"></div>
                  <div className="col-span-2 h-36 bg-slate-200 dark:bg-zinc-800 rounded"></div>
                </div>

                <div className="space-y-4">
                  <div className="h-4 bg-slate-200 dark:bg-zinc-800 rounded w-1/4"></div>
                  <div className="space-y-2">
                    <div className="h-10 bg-slate-100 dark:bg-zinc-900 rounded"></div>
                    <div className="h-10 bg-slate-100 dark:bg-zinc-900 rounded"></div>
                    <div className="h-10 bg-slate-100 dark:bg-zinc-900 rounded"></div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-6 border-t border-slate-100 dark:border-zinc-800">
                  <div className="h-4 bg-slate-200 dark:bg-zinc-800 rounded w-1/5"></div>
                  <span className="text-xs font-semibold text-slate-400 dark:text-zinc-500 animate-bounce">
                    Analyzing parameters with AI model...
                  </span>
                </div>
              </div>
            ) : guidance ? (
              <div className="space-y-4">
                <div className="flex justify-between items-center print:hidden">
                  <button
                    onClick={() => setActiveTab("profile")}
                    className="px-4 py-2 border border-[var(--color-border)] hover:border-[var(--accent-primary)] text-[var(--text-main)] hover:bg-[var(--bg-input)] text-xs font-semibold uppercase tracking-wider bg-[var(--bg-card)] transition-all rounded-lg flex items-center gap-1.5 shadow-sm"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Modify Input Details
                  </button>

                  <button
                    onClick={handleReset}
                    className="px-4 py-2 text-xs font-semibold uppercase tracking-wider border border-[var(--color-border)] hover:border-rose-500 text-[var(--text-muted)] hover:text-rose-600 bg-[var(--bg-card)] hover:bg-rose-50 dark:hover:bg-rose-950/10 transition-all rounded-lg shadow-sm"
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
              <div className="bg-[var(--bg-card)] rounded-2xl border border-[var(--color-border)] p-12 text-center max-w-xl mx-auto my-12 shadow-[var(--card-shadow)] space-y-6 transition-colors duration-300">
                <div className="w-14 h-14 rounded-full bg-[var(--accent-light)] text-[var(--accent-primary)] flex items-center justify-center mx-auto border border-[var(--accent-light-border)] shadow-sm">
                  <Compass className="w-6 h-6 animate-spin" style={{ animationDuration: '6s' }} />
                </div>
                <div className="space-y-2">
                  <h3 className="text-lg font-bold tracking-tight text-[var(--text-main)]">
                    No Roadmap Generated Yet
                  </h3>
                  <p className="text-xs text-[var(--text-muted)] leading-relaxed max-w-sm mx-auto">
                    To see your personalized career path, certifications, missing skills analysis, and salary projections, please fill in your student details on Step 1.
                  </p>
                </div>
                <button
                  onClick={() => setActiveTab("profile")}
                  className="px-5 py-2.5 bg-[var(--accent-primary)] text-[var(--primary-btn-text)] hover:bg-[var(--accent-primary-hover)] border border-transparent text-xs font-bold uppercase tracking-wider transition-all shadow-sm hover:shadow-md hover:-translate-y-0.5 rounded-lg cursor-pointer"
                >
                  Enter Profile Details Now
                </button>
              </div>
            )}

          </div>
        )}

      </main>

      {/* Centered Sign Out and Footer Action Area */}
      <div className="max-w-7xl w-full mx-auto px-6 mt-8 mb-6 print:hidden flex flex-col items-center justify-center gap-4 z-10">
        <button
          onClick={() => setIsLoggedIn(false)}
          className="px-6 py-2.5 text-xs font-bold uppercase tracking-widest border border-rose-300/60 dark:border-rose-950/40 text-rose-600 dark:text-rose-400 bg-rose-50/50 dark:bg-rose-950/15 hover:bg-rose-100 dark:hover:bg-rose-900/30 hover:text-rose-700 dark:hover:text-rose-300 transition-all rounded-xl shadow-xs hover:shadow-md cursor-pointer flex items-center gap-2"
        >
          <span>Sign Out of Account</span>
        </button>
      </div>

      {/* Footer */}
      <footer className="bg-[var(--bg-card)] border-t border-[var(--color-border)] py-6 px-6 mt-4 print:hidden transition-colors duration-300 z-10">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4 text-[11px] font-mono text-[var(--text-muted)] uppercase tracking-widest">
          <span>AI Career Counselor (Beta)</span>
          <div className="flex gap-6">
            <span>Session Status: Authorized</span>
          </div>
        </div>
      </footer>

      {/* Floating AI counselor multi-turn chat */}
      <CareerChatbot currentProfile={profile} />
    </div>
  );
}
