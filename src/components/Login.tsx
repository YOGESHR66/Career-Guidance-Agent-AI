import React, { useState, useEffect } from "react";
import { 
  Lock, 
  User, 
  ArrowRight, 
  Copy, 
  Check, 
  X, 
  Sparkles, 
  Settings, 
  Eye, 
  EyeOff,
  Compass,
  GraduationCap
} from "lucide-react";

interface LoginProps {
  onLogin: (user?: { name: string; email: string; picture?: string }) => void;
}

export function Login({ onLogin }: LoginProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [loginMethod, setLoginMethod] = useState<"credentials" | "google" | null>(null);
  const [statusMessage, setStatusMessage] = useState("");

  // Real OAuth configuration & instructions modal
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [configModalDetails, setConfigModalDetails] = useState<{ callbackUrl?: string; error?: string } | null>(null);
  const [copiedCallback, setCopiedCallback] = useState(false);

  // Listens to OAuth success postMessage from our backend popup
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      const origin = event.origin;
      if (!origin.endsWith(".run.app") && !origin.includes("localhost") && !origin.includes("127.0.0.1")) {
        return;
      }

      if (event.data?.type === "OAUTH_AUTH_SUCCESS" && event.data?.provider === "google") {
        const { user } = event.data;
        setIsLoggingIn(true);
        setLoginMethod("google");
        setStatusMessage(`Logged in successfully as ${user.name || user.email}!`);

        const timeout = setTimeout(() => {
          setIsLoggingIn(false);
          setLoginMethod(null);
          onLogin(user);
        }, 1200);

        return () => clearTimeout(timeout);
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [onLogin]);

  // Unified Simulated Login flow
  const handleSimulatedLogin = (method: "credentials" | "google") => {
    setIsLoggingIn(true);
    setLoginMethod(method);

    const steps = {
      credentials: [
        "Verifying credentials securely...",
        "Authorizing academic portfolio...",
        "Establishing encrypted counselor session..."
      ],
      google: [
        "Initiating Google Secure login flow...",
        "Receiving authorized profile claims...",
        "Syncing Google account metadata..."
      ]
    }[method];

    const simulatedProfiles = {
      credentials: { name: "Mock Academic Student", email: email || "student@university.edu" },
      google: { name: "Alex Mercer (Google Demo)", email: "alex.mercer.dev@gmail.com" }
    };

    let currentStep = 0;
    setStatusMessage(steps[0]);

    const interval = setInterval(() => {
      currentStep++;
      if (currentStep < steps.length) {
        setStatusMessage(steps[currentStep]);
      } else {
        clearInterval(interval);
        onLogin(simulatedProfiles[method]);
      }
    }, 600);
  };

  // Real OAuth Login handler
  const handleRealLogin = async () => {
    try {
      setIsLoggingIn(true);
      setLoginMethod("google");
      setStatusMessage("Contacting secure Google auth gateway...");

      const response = await fetch("/api/auth/google/url");
      if (!response.ok) {
        throw new Error("Unable to establish auth endpoints with backend.");
      }
      const data = await response.json();

      if (!data.configured) {
        setIsLoggingIn(false);
        setLoginMethod(null);
        setConfigModalDetails(data);
        setShowConfigModal(true);
        return;
      }

      setStatusMessage("OAuth gateway connected. Please complete authorization in the popup window.");
      
      const width = 600;
      const height = 700;
      const left = window.screenX + (window.innerWidth - width) / 2;
      const top = window.screenY + (window.innerHeight - height) / 2;

      const authWindow = window.open(
        data.url,
        "oauth_popup",
        `width=${width},height=${height},left=${left},top=${top},status=no,resizable=yes`
      );

      if (!authWindow) {
        setIsLoggingIn(false);
        setLoginMethod(null);
        alert("The authentication popup was blocked by your browser. Please allow popups for this site.");
      }
    } catch (err: any) {
      console.warn("Real Google login error, falling back to simulated credentials:", err.message || err);
      setIsLoggingIn(false);
      setLoginMethod(null);
      handleSimulatedLogin("google");
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSimulatedLogin("credentials");
  };

  const handleCopyCallback = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCallback(true);
    setTimeout(() => setCopiedCallback(false), 2000);
  };

  const GoogleGLogo = ({ className = "w-5 h-5" }: { className?: string }) => (
    <svg className={`${className} shrink-0`} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.84z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
    </svg>
  );

  return (
    <div className="relative min-h-screen w-full flex flex-col items-center justify-center p-4 sm:p-6 lg:p-12 font-sans bg-[#f4f7f9] select-none text-slate-800 overflow-hidden">
      
      {/* ================= BACKGROUND CAREER PATH DOODLES ================= */}
      <div className="absolute inset-0 w-full h-full pointer-events-none z-0 overflow-hidden">
        
        {/* Full-screen cartoon road network connecting career milestones beneath the login card */}
        <svg className="absolute inset-0 w-full h-full opacity-60 hidden md:block" viewBox="0 0 1440 900" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
          {/* DEFINITIONS FOR GRADIENTS */}
          <defs>
            <linearGradient id="roadGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#cbd5e1" />
              <stop offset="50%" stopColor="#94a3b8" />
              <stop offset="100%" stopColor="#cbd5e1" />
            </linearGradient>
          </defs>

          {/* === CARTOON PATHWAYS (Drawn as standard cartoon roads/metro tracks with thick borders and a dashed centerline) === */}
          
          {/* Left Milestone Path (Vision -> Startup -> Plan) */}
          {/* Outer Border (Darker Slate outline) */}
          <path d="M 180 140 C 130 220 130 260 150 342 C 180 460 140 680 180 810" stroke="#94a3b8" strokeWidth="12" strokeLinecap="round" />
          {/* Inner Road Surface (Clean Solid White/Cream Road) */}
          <path d="M 180 140 C 130 220 130 260 150 342 C 180 460 140 680 180 810" stroke="#ffffff" strokeWidth="8" strokeLinecap="round" />
          {/* Dashed Centerlane Marker */}
          <path d="M 180 140 C 130 220 130 260 150 342 C 180 460 140 680 180 810" stroke="#64748b" strokeWidth="1.5" strokeDasharray="5 5" strokeLinecap="round" />

          {/* Underneath Connection Path (PLAN -> STEPS completely underneath the login card at Y = 810-870) */}
          {/* Outer Border */}
          <path d="M 180 810 C 400 870 1040 870 1260 810" stroke="#94a3b8" strokeWidth="12" strokeLinecap="round" />
          {/* Inner Road Surface */}
          <path d="M 180 810 C 400 870 1040 870 1260 810" stroke="#ffffff" strokeWidth="8" strokeLinecap="round" />
          {/* Dashed Centerlane Marker */}
          <path d="M 180 810 C 400 870 1040 870 1260 810" stroke="#64748b" strokeWidth="1.5" strokeDasharray="5 5" strokeLinecap="round" />

          {/* Right Milestone Path (Goal -> Research -> Steps) */}
          {/* Outer Border */}
          <path d="M 1260 140 C 1310 220 1310 260 1290 342 C 1260 460 1300 680 1260 810" stroke="#94a3b8" strokeWidth="12" strokeLinecap="round" />
          {/* Inner Road Surface */}
          <path d="M 1260 140 C 1310 220 1310 260 1290 342 C 1260 460 1300 680 1260 810" stroke="#ffffff" strokeWidth="8" strokeLinecap="round" />
          {/* Dashed Centerlane Marker */}
          <path d="M 1260 140 C 1310 220 1310 260 1290 342 C 1260 460 1300 680 1260 810" stroke="#64748b" strokeWidth="1.5" strokeDasharray="5 5" strokeLinecap="round" />

          {/* ================= STATION STOPS / CARTOON MILESTONE STATIONS ================= */}
          {/* Left Path Stations */}
          {/* 1. Vision Station */}
          <g>
            <circle cx="180" cy="140" r="10" fill="#ffffff" stroke="#f59e0b" strokeWidth="3" />
            <circle cx="180" cy="140" r="4" fill="#f59e0b" />
          </g>
          {/* 2. Startup Station */}
          <g>
            <circle cx="150" cy="342" r="10" fill="#ffffff" stroke="#10b981" strokeWidth="3" />
            <circle cx="150" cy="342" r="4" fill="#10b981" />
          </g>
          {/* 3. Plan Station */}
          <g>
            <circle cx="180" cy="810" r="10" fill="#ffffff" stroke="#6366f1" strokeWidth="3" />
            <circle cx="180" cy="810" r="4" fill="#6366f1" />
          </g>

          {/* Right Path Stations */}
          {/* 4. Goal Station */}
          <g>
            <circle cx="1260" cy="140" r="10" fill="#ffffff" stroke="#ec4899" strokeWidth="3" />
            <circle cx="1260" cy="140" r="4" fill="#ec4899" />
          </g>
          {/* 5. Research Station */}
          <g>
            <circle cx="1290" cy="342" r="10" fill="#ffffff" stroke="#8b5cf6" strokeWidth="3" />
            <circle cx="1290" cy="342" r="4" fill="#8b5cf6" />
          </g>
          {/* 6. Steps Station */}
          <g>
            <circle cx="1260" cy="810" r="10" fill="#ffffff" stroke="#0ea5e9" strokeWidth="3" />
            <circle cx="1260" cy="810" r="4" fill="#0ea5e9" />
          </g>
        </svg>

        {/* 1. VISION (Top-Left) - High Vibrancy Amber Accent */}
        <div className="absolute top-[8%] left-[5%] lg:left-[10%] xl:left-[12%] flex flex-col items-center opacity-90 hover:opacity-100 hover:scale-105 transition-all duration-300 hidden md:flex bg-amber-50/70 border border-amber-200/80 p-4 rounded-3xl shadow-[0_8px_24px_rgba(245,158,11,0.08)] z-10">
          <svg className="w-16 h-16 text-amber-500" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M 50,18 C 34,18 29,33 29,46 C 29,56 37,63 41,70 L 41,78 L 59,78 L 59,70 C 63,63 71,56 71,46 C 71,33 66,18 50,18 Z" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="#fef3c7" fillOpacity="0.4" />
            <path d="M 41,78 C 41,78 43,83 50,83 C 57,83 59,78 59,78" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
            <path d="M 44,83 C 44,83 46,87 50,87 C 54,87 56,83 56,83" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
            <path d="M 43,53 Q 48,43 47,38 Q 50,33 53,38 Q 52,43 57,53" stroke="#d97706" strokeWidth="2" strokeLinecap="round" />
            <line x1="50" y1="8" x2="50" y2="13" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
            <line x1="18" y1="46" x2="23" y2="46" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
            <line x1="82" y1="46" x2="77" y2="46" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
            <line x1="26" y1="26" x2="31" y2="31" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
            <line x1="74" y1="26" x2="69" y2="31" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
          </svg>
          <span className="text-[10px] font-black text-amber-700 tracking-widest uppercase font-mono mt-2">VISION</span>
        </div>

        {/* 2. STARTUP Puzzle (Middle-Left) - High Vibrancy Indigo/Blue Accent */}
        <div className="absolute top-[38%] left-[4%] lg:left-[8%] xl:left-[10%] flex flex-col items-center opacity-90 hover:opacity-100 hover:scale-105 transition-all duration-300 hidden md:flex bg-indigo-50/70 border border-indigo-200/80 p-4 rounded-3xl shadow-[0_8px_24px_rgba(99,102,241,0.08)] z-10">
          <svg className="w-16 h-16 text-indigo-500" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M 25,25 H 42 C 42,15 58,15 58,25 H 75 V 42 C 85,42 85,58 75,58 V 75 H 58 Q 58,65 50,65 Q 42,65 42,75 H 25 V 58 C 15,58 15,42 25,42 Z" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="#e0e7ff" fillOpacity="0.4" />
          </svg>
          <span className="text-[10px] font-black text-indigo-700 tracking-widest uppercase font-mono mt-2">STARTUP</span>
        </div>

        {/* 3. PLAN Books & Chart (Bottom-Left) - High Vibrancy Emerald/Green Accent */}
        <div className="absolute bottom-[10%] left-[5%] lg:left-[10%] xl:left-[12%] flex flex-col items-center opacity-90 hover:opacity-100 hover:scale-105 transition-all duration-300 hidden md:flex bg-emerald-50/70 border border-emerald-200/80 p-4 rounded-3xl shadow-[0_8px_24px_rgba(16,185,129,0.08)] z-10">
          <svg className="w-16 h-16 text-emerald-500" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="22" y="52" width="12" height="28" rx="1.5" stroke="currentColor" strokeWidth="2.5" fill="#d1fae5" fillOpacity="0.3" />
            <rect x="38" y="38" width="12" height="42" rx="1.5" stroke="currentColor" strokeWidth="2.5" fill="#d1fae5" fillOpacity="0.3" />
            <rect x="54" y="22" width="12" height="58" rx="1.5" stroke="currentColor" strokeWidth="2.5" fill="currentColor" fillOpacity="0.2" />
            <path d="M 15,70 Q 32,32 70,18" stroke="#059669" strokeWidth="2" strokeDasharray="3 3" strokeLinecap="round" />
            <path d="M 62,20 L 70,18 L 68,26" stroke="#059669" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span className="text-[10px] font-black text-emerald-700 tracking-widest uppercase font-mono mt-2">PLAN</span>
        </div>

        {/* 4. GOAL Target (Top-Right) - High Vibrancy Rose/Red Accent */}
        <div className="absolute top-[8%] right-[5%] lg:right-[10%] xl:right-[12%] flex flex-col items-center opacity-90 hover:opacity-100 hover:scale-105 transition-all duration-300 hidden md:flex bg-rose-50/70 border border-rose-200/80 p-4 rounded-3xl shadow-[0_8px_24px_rgba(244,63,94,0.08)] z-10">
          <svg className="w-16 h-16 text-rose-500" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="50" cy="50" r="34" stroke="currentColor" strokeWidth="2.5" strokeDasharray="3 3" fill="#ffe4e6" fillOpacity="0.2" />
            <circle cx="50" cy="50" r="24" stroke="currentColor" strokeWidth="2.5" />
            <circle cx="50" cy="50" r="14" stroke="currentColor" strokeWidth="1.5" strokeDasharray="2 2" />
            <circle cx="50" cy="50" r="6" stroke="currentColor" strokeWidth="2.5" fill="currentColor" fillOpacity="0.3" />
            <path d="M 82,18 L 44,56" stroke="#e11d48" strokeWidth="3" strokeLinecap="round" />
            <path d="M 76,17 L 83,24" stroke="#e11d48" strokeWidth="2" />
            <path d="M 79,14 L 86,21" stroke="#e11d48" strokeWidth="2" />
            <path d="M 41,51 L 44,56 L 49,53" stroke="#e11d48" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span className="text-[10px] font-black text-rose-700 tracking-widest uppercase font-mono mt-2">GOAL</span>
        </div>

        {/* 5. RESEARCH Magnifying Glass (Middle-Right) - High Vibrancy Sky/Blue Accent */}
        <div className="absolute top-[38%] right-[4%] lg:right-[8%] xl:right-[10%] flex flex-col items-center opacity-90 hover:opacity-100 hover:scale-105 transition-all duration-300 hidden md:flex bg-sky-50/70 border border-sky-200/80 p-4 rounded-3xl shadow-[0_8px_24px_rgba(14,165,233,0.08)] z-10">
          <svg className="w-16 h-16 text-sky-500" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="42" cy="42" r="20" stroke="currentColor" strokeWidth="2.5" fill="#e0f2fe" fillOpacity="0.4" />
            <path d="M 31,31 A 14,14 0 0 1 53,31" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.6" />
            <path d="M 56,56 L 80,80" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
            <path d="M 66,66 L 72,72" stroke="currentColor" strokeWidth="1.5" />
            <path d="M 70,70 L 76,76" stroke="currentColor" strokeWidth="1.5" />
          </svg>
          <span className="text-[10px] font-black text-sky-700 tracking-widest uppercase font-mono mt-2">RESEARCH</span>
        </div>

        {/* 6. STEPS Career Stairs (Bottom-Right) - High Vibrancy Violet Accent */}
        <div className="absolute bottom-[10%] right-[5%] lg:right-[10%] xl:right-[12%] flex flex-col items-center opacity-90 hover:opacity-100 hover:scale-105 transition-all duration-300 hidden md:flex bg-violet-50/70 border border-violet-200/80 p-4 rounded-3xl shadow-[0_8px_24px_rgba(139,92,246,0.08)] z-10">
          <svg className="w-16 h-16 text-violet-500" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M 20,80 H 35 V 65 H 50 V 50 H 65 V 35 H 80" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="#ede9fe" fillOpacity="0.4" />
            <path d="M 15,80 H 85" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
            <path d="M 80,35 V 12" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
            <path d="M 80,12 L 64,18 L 80,24 Z" stroke="#7c3aed" strokeWidth="2" fill="#ddd6fe" />
          </svg>
          <span className="text-[10px] font-black text-violet-700 tracking-widest uppercase font-mono mt-2">STEPS</span>
        </div>

        {/* 7. PAPER PLANE (Floating Center-Left) - High Vibrancy Teal Accent */}
        <div className="absolute bottom-[28%] left-[16%] xl:left-[22%] opacity-85 hover:opacity-100 hover:scale-105 transition-all duration-300 hidden xl:flex bg-teal-50/60 border border-teal-100/80 p-3 rounded-2xl shadow-md z-10">
          <svg className="w-10 h-10 text-teal-500" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M 20,40 L 80,20 L 50,75 L 43,53 L 20,40 Z" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="#ccfbf1" fillOpacity="0.3" />
            <path d="M 80,20 L 43,53" stroke="currentColor" strokeWidth="1.5" />
            <path d="M 20,40 L 43,53" stroke="currentColor" strokeWidth="1.5" />
          </svg>
        </div>

        {/* 8. BRIEFCASE (Floating Center-Right) - High Vibrancy Orange Accent */}
        <div className="absolute top-[26%] right-[16%] xl:right-[22%] opacity-85 hover:opacity-100 hover:scale-105 transition-all duration-300 hidden xl:flex bg-orange-50/60 border border-orange-100/80 p-3 rounded-2xl shadow-md z-10">
          <svg className="w-10 h-10 text-orange-500" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="20" y="35" width="60" height="40" rx="3" stroke="currentColor" strokeWidth="2.5" fill="#ffedd5" fillOpacity="0.3" />
            <path d="M 40,35 V 27 C 40,24 60,24 60,27 V 35" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            <rect x="46" y="51" width="8" height="9" rx="1" stroke="currentColor" strokeWidth="2" />
          </svg>
        </div>

        {/* 9. THE LAPTOP USER (Centered watermark behind login, scaled lightly) */}
        <div className="absolute top-[48%] left-1/2 transform -translate-x-1/2 -translate-y-1/2 opacity-[0.06] pointer-events-none hidden lg:block">
          <svg className="w-[500px] h-[500px] text-slate-900" viewBox="0 0 400 400" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Minimalist Sketch of Laptop Girl from the sketch image */}
            <circle cx="200" cy="140" r="30" stroke="currentColor" strokeWidth="4" />
            <path d="M 175,120 Q 190,105 200,110 T 225,120" stroke="currentColor" strokeWidth="3" fill="currentColor" />
            <path d="M 140,260 C 140,210 260,210 260,260 Z" stroke="currentColor" strokeWidth="4" fill="none" />
            <rect x="150" y="250" width="100" height="60" rx="4" stroke="currentColor" strokeWidth="4" fill="none" />
            <circle cx="200" cy="280" r="6" stroke="currentColor" strokeWidth="3" />
            <path d="M 110,310 Q 200,350 290,310" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
          </svg>
        </div>
      </div>
      {/* --- HEADER LOGO & GENERAL INFO --- */}
      <div className="w-full max-w-[460px] text-center mb-6 z-10">
        <div className="flex justify-center mb-5">
          <div className="relative">
            {/* Pulsing glow underlay */}
            <div className="absolute inset-0 bg-amber-500/10 rounded-2xl blur-md scale-110 animate-pulse"></div>
            {/* Outer golden/amber breathing ring */}
            <div className="absolute -inset-0.5 rounded-2xl bg-gradient-to-tr from-amber-400 via-yellow-300 to-amber-500 opacity-75 blur-[1px] animate-pulse"></div>
            
            <div className="relative w-14 h-14 bg-[#0f172a] rounded-2xl flex items-center justify-center shadow-lg shadow-slate-900/10 border border-slate-800">
              {/* Compass icon slowly rotating behind the cap as a navigational background */}
              <Compass className="absolute w-8 h-8 text-amber-400/20 animate-spin" style={{ animationDuration: "20s" }} />
              
              {/* Graduation Cap centered on top */}
              <GraduationCap className="relative w-7 h-7 text-amber-300 z-10 filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.3)] animate-bounce" style={{ animationDuration: "4s" }} />
              
              {/* Blinking shining star accent (Top Right) */}
              <div className="absolute top-1.5 right-1.5 z-20">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-200 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-400 shadow-[0_0_8px_#f59e0b]"></span>
                </span>
              </div>

              {/* Second subtle blinking star (Bottom Left) for extra shine */}
              <div className="absolute bottom-1.5 left-1.5 z-20">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-300 opacity-60"></span>
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-amber-300"></span>
                </span>
              </div>
            </div>
          </div>
        </div>
        <h2 className="text-xl sm:text-2xl font-black tracking-widest text-[#0f172a] uppercase font-display">
          Career Guidance Portal
        </h2>
        <p className="mt-2 text-xs sm:text-sm text-slate-500 font-medium px-4 leading-relaxed max-w-sm mx-auto">
          Sign in to access your personalized career roadmaps and historical guidance logs.
        </p>
      </div>

      {/* --- CENTRAL LOGIN CARD --- */}
      <div className="relative z-10 w-full max-w-[460px] bg-white border border-slate-100 rounded-[24px] p-6 sm:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.02)]">
        
        {isLoggingIn ? (
          <div className="py-12 flex flex-col items-center justify-center space-y-4">
            <div className="w-12 h-12 rounded-full border-4 border-slate-200 border-t-slate-900 animate-spin"></div>
            <div className="text-center space-y-1">
              <p className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Authenticating...
              </p>
              <p className="text-[11px] text-slate-500 font-medium font-mono min-h-[16px]">
                {statusMessage}
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-5">
            
            {/* Unified Credentials Form */}
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2">
                  Email Address
                </label>
                
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <User className="h-4 w-4 text-slate-400" />
                  </div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="block w-full pl-10 pr-3 py-3 bg-[#f8fafc] border border-slate-200/80 rounded-xl text-sm placeholder-slate-400 text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/5 focus:border-slate-400 transition-all font-semibold"
                    placeholder="student@university.edu"
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500">
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-[10px] text-slate-600 font-bold hover:text-slate-900 transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>

                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <Lock className="h-4 w-4 text-slate-400" />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="block w-full pl-10 pr-10 py-3 bg-[#f8fafc] border border-slate-200/80 rounded-xl text-sm placeholder-slate-400 text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/5 focus:border-slate-400 transition-all font-semibold"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    className="h-4 w-4 text-slate-900 focus:ring-slate-900 border-slate-200 bg-[#f8fafc] rounded cursor-pointer accent-slate-900"
                  />
                  <label htmlFor="remember-me" className="ml-2 block text-xs text-slate-600 font-semibold cursor-pointer select-none">
                    Remember me
                  </label>
                </div>

                <div className="text-xs">
                  <a href="#" className="font-bold text-slate-900 hover:underline transition-all">
                    Forgot password?
                  </a>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="group relative w-full flex justify-center items-center py-3 px-4 border border-transparent text-xs font-bold rounded-xl text-white bg-[#0f172a] hover:bg-[#1e293b] active:scale-98 transition-all uppercase tracking-widest cursor-pointer font-display shadow-sm"
                >
                  Sign In
                  <ArrowRight className="ml-2 w-4 h-4 text-white stroke-[2.5]" />
                </button>
              </div>
            </form>

            {/* Horizontal Divider */}
            <div className="relative py-2">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-100"></div>
              </div>
              <div className="relative flex justify-center text-[9px] uppercase tracking-[0.2em]">
                <span className="bg-white px-3 text-slate-400 font-bold">
                  or continue with
                </span>
              </div>
            </div>

            {/* Google/Gmail Sign In Options */}
            <div className="grid grid-cols-1 gap-2">
              <button
                type="button"
                onClick={handleRealLogin}
                className="w-full flex items-center justify-center gap-2.5 px-4 py-2.5 bg-white border border-slate-200 hover:border-slate-350 hover:bg-slate-50 rounded-xl text-xs font-bold text-slate-700 transition-all duration-200 cursor-pointer shadow-xs hover:-translate-y-0.5"
              >
                <GoogleGLogo className="w-4.5 h-4.5" />
                <span>Gmail Login</span>
              </button>

              <button
                type="button"
                onClick={() => handleSimulatedLogin("google")}
                className="w-full flex items-center justify-center gap-1.5 py-2 border border-dashed border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-500 hover:text-slate-700 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all cursor-pointer"
              >
                <Sparkles className="w-3 h-3 text-slate-400" />
                Simulate Google Handshake
              </button>
            </div>

            {/* Sandbox footer note matching screenshot */}
            <div className="text-center pt-2">
              <p className="text-[10px] text-slate-400 font-semibold leading-relaxed max-w-xs mx-auto">
                Note: This is a client-side mocked login UI. Any credentials will work.
              </p>
            </div>

          </div>
        )}
      </div>

      {/* --- OAuth Developer Setup / Consent Help Modal --- */}
      {showConfigModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white border border-slate-200 rounded-[24px] max-w-lg w-full shadow-2xl p-6 sm:p-8 relative">
            <button 
              onClick={() => setShowConfigModal(false)}
              className="absolute top-5 right-5 p-1.5 text-slate-400 hover:text-slate-900 hover:bg-slate-50 rounded-xl transition-colors cursor-pointer"
              title="Close Panel"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="p-2.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-600 shrink-0">
                <Settings className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-bold text-slate-900">
                  OAuth Integration Panel
                </h3>
                <p className="text-xs text-slate-500 font-medium">
                  Complete developer handshake to initialize actual social login.
                </p>
              </div>
            </div>

            <div className="space-y-4 text-xs leading-relaxed text-slate-600">
              <div className="p-3.5 bg-amber-50/80 border border-amber-200/50 rounded-xl">
                <p className="text-[11px] font-semibold text-amber-800">
                  ⚠️ Direct OAuth requires API credentials corresponding to this sandbox hostname. Follow the guide to add them.
                </p>
              </div>

              <div>
                <h4 className="font-bold text-slate-850 mb-1 uppercase tracking-widest text-[10px]">
                  1. Setup Developer Credentials
                </h4>
                <p className="text-[11px] text-slate-500 font-medium">
                  Generate an OAuth 2.0 Web Client ID via your <a href="https://console.cloud.google.com/apis/credentials" target="_blank" rel="noreferrer" className="text-slate-900 underline font-bold">Google Cloud Console</a>.
                </p>
              </div>

              <div>
                <h4 className="font-bold text-slate-850 mb-1 uppercase tracking-widest text-[10px]">
                  2. Register Authorized Redirect URI
                </h4>
                <div className="flex items-center gap-2 p-2 bg-slate-50 border border-slate-250 rounded-xl font-mono text-[10px] text-slate-700 relative overflow-hidden group">
                  <span className="truncate select-all pr-12 w-full font-semibold">
                    {configModalDetails?.callbackUrl || `${window.location.origin}/auth/google/callback`}
                  </span>
                  <button
                    onClick={() => handleCopyCallback(configModalDetails?.callbackUrl || `${window.location.origin}/auth/google/callback`)}
                    className="absolute right-1 top-1 bottom-1 px-3 bg-white border border-slate-200 hover:bg-slate-900 hover:text-white hover:border-transparent rounded-lg transition-all flex items-center justify-center cursor-pointer shadow-xs"
                    title="Copy Link"
                  >
                    {copiedCallback ? (
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              </div>

              <div>
                <h4 className="font-bold text-slate-850 mb-1 uppercase tracking-widest text-[10px]">
                  3. Configure App Secrets inside Studio
                </h4>
                <p className="text-[11px] text-slate-500 font-medium mb-2">
                  Open the <span className="font-bold text-slate-900">Settings ⚙️ → Secrets</span> panel in the Google AI Studio sidebar and define:
                </p>
                <div className="grid grid-cols-1 gap-2 font-mono text-[10px] bg-slate-50 p-3 rounded-xl border border-slate-200 text-slate-700">
                  <div><strong className="text-slate-900">GOOGLE_CLIENT_ID</strong> = <span className="opacity-75">"your-client-id"</span></div>
                  <div><strong className="text-slate-900">GOOGLE_CLIENT_SECRET</strong> = <span className="opacity-75">"your-client-secret"</span></div>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 flex flex-col sm:flex-row gap-2.5 justify-end">
              <button
                onClick={() => {
                  setShowConfigModal(false);
                  handleSimulatedLogin("google");
                }}
                className="flex items-center justify-center gap-2 px-4 py-2 border border-emerald-500/30 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer mr-auto"
              >
                <Sparkles className="w-4 h-4" />
                Try Simulated Social Flow
              </button>
              
              <button
                onClick={() => setShowConfigModal(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer border border-slate-200"
              >
                Close instructions
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
