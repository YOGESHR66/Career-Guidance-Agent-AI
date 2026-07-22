import React, { useState, useRef } from "react";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend 
} from "recharts";
import { CareerGuidance, StudentProfile } from "../types";
import { 
  Briefcase, 
  Award, 
  TrendingUp, 
  IndianRupee, 
  CheckCircle2, 
  Compass, 
  AlertTriangle, 
  ChevronRight, 
  Copy, 
  Printer, 
  Sparkles, 
  Star, 
  BookOpen,
  GraduationCap,
  Calendar,
  CheckSquare,
  Square
} from "lucide-react";

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[var(--bg-card)] border border-[var(--color-border)] p-3 shadow-lg font-mono text-xs rounded-none">
        <p className="font-bold text-[var(--text-main)] mb-1.5 uppercase tracking-wide border-b border-[var(--color-border)] pb-1">
          {label}
        </p>
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex justify-between items-center gap-4 mt-1">
            <span style={{ color: entry.color }} className="font-semibold text-[10px]">
              {entry.name.replace(" Path (LPA)", "")}:
            </span>
            <span className="font-extrabold text-[var(--text-main)]">
              ₹{entry.value} LPA
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

interface GuidanceDashboardProps {
  guidance: CareerGuidance;
  profile: StudentProfile;
}

export const GuidanceDashboard: React.FC<GuidanceDashboardProps> = ({ guidance, profile }) => {
  const [copied, setCopied] = useState(false);
  const [learnedSkills, setLearnedSkills] = useState<Record<string, boolean>>({});
  const [pdfGenerating, setPdfGenerating] = useState(false);
  const reportRef = useRef<HTMLDivElement>(null);

  const handleCopyText = () => {
    const textToCopy = `
=== CAREER GUIDANCE REPORT FOR ${profile.name || "STUDENT"} ===
Degree: ${profile.degree} (${profile.year})
Target Goal: ${profile.careerGoal}

Primary Recommended Career: ${guidance.recommendedCareer}
Alternative Options: ${guidance.alternativeCareers.join(", ")}

Why this is a perfect match:
${guidance.reason}

Required Technical & Soft Skills:
${guidance.requiredSkills.map(s => `- ${s}`).join("\n")}

Skills You Need To Learn (Gap Analysis):
${guidance.missingSkills.map(s => `- ${s}`).join("\n")}

Top Industry Certifications to Pursue:
${guidance.certifications.map(c => `- ${c}`).join("\n")}

Job Roles to Target:
${guidance.jobRoles.map(j => `- ${j}`).join("\n")}

Estimated Entry-Level Salary in India:
${guidance.salaryRangeIndia}

Future Outlook (5-10 Years):
${guidance.futureScope}

Summary:
${guidance.summary}
    `;

    navigator.clipboard.writeText(textToCopy.trim()).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handlePrint = async () => {
    const element = reportRef.current;
    if (!element) return;

    setPdfGenerating(true);
    const originalGetComputedStyle = window.getComputedStyle;
    try {
      // Temporarily override getComputedStyle to avoid html2canvas crashing on oklab/oklch colors in modern browser computed styles
      window.getComputedStyle = function (elt, pseudoElt) {
        const style = originalGetComputedStyle(elt, pseudoElt);
        return new Proxy(style, {
          get(target, prop) {
            if (prop === "getPropertyValue") {
              return (propertyName: string) => {
                const val = target.getPropertyValue(propertyName);
                if (val && (val.includes("oklab") || val.includes("oklch"))) {
                  const lowerName = propertyName.toLowerCase();
                  if (lowerName.includes("image") || lowerName.includes("gradient")) {
                    return "none";
                  }
                  if (lowerName.includes("background") || lowerName.includes("bg")) {
                    return "#ffffff";
                  }
                  if (lowerName.includes("color") || lowerName.includes("text")) {
                    return "#1e293b";
                  }
                  if (lowerName.includes("border")) {
                    return "#e2e8f0";
                  }
                  return "rgba(0,0,0,0)";
                }
                return val;
              };
            }
            
            const val = (target as any)[prop];
            if (typeof val === "function") {
              return val.bind(target);
            }
            if (typeof val === "string" && (val.includes("oklab") || val.includes("oklch"))) {
              if (typeof prop === "string") {
                const lowerProp = prop.toLowerCase();
                if (lowerProp.includes("image") || lowerProp.includes("gradient")) return "none";
                if (lowerProp.includes("background") || lowerProp.includes("bg")) return "#ffffff";
                if (lowerProp.includes("color") || lowerProp.includes("text")) return "#1e293b";
                if (lowerProp.includes("border")) return "#e2e8f0";
              }
              return "rgba(0,0,0,0)";
            }
            return val;
          }
        });
      };

      // Capture the element to canvas
      const canvas = await html2canvas(element, {
        scale: 2, // Retain sharp details and fonts
        useCORS: true,
        logging: false,
        backgroundColor: getComputedStyle(document.documentElement).getPropertyValue('--bg-main').trim() || '#f8fafc',
      });

      const imgData = canvas.toDataURL("image/jpeg", 0.95);
      const pdf = new jsPDF("p", "mm", "a4");

      const imgWidth = 210; // A4 size width in mm
      const pageHeight = 297; // A4 size height in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      let heightLeft = imgHeight;
      let position = 0;

      // First Page
      pdf.addImage(imgData, "JPEG", 0, position, imgWidth, imgHeight, undefined, 'FAST');
      heightLeft -= pageHeight;

      // Generate extra pages if needed
      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, "JPEG", 0, position, imgWidth, imgHeight, undefined, 'FAST');
        heightLeft -= pageHeight;
      }

      const safeName = (profile.name || "Student").trim().replace(/\s+/g, "_");
      pdf.save(`Career_Roadmap_${safeName}.pdf`);
    } catch (error) {
      console.error("PDF generation failed, falling back to standard printing:", error);
      window.print();
    } finally {
      window.getComputedStyle = originalGetComputedStyle;
      setPdfGenerating(false);
    }
  };

  const toggleLearnedSkill = (skill: string) => {
    setLearnedSkills(prev => ({
      ...prev,
      [skill]: !prev[skill]
    }));
  };

  const completedCount = guidance.missingSkills.filter(s => learnedSkills[s]).length;
  const progressPercent = guidance.missingSkills.length > 0 
    ? Math.round((completedCount / guidance.missingSkills.length) * 100) 
    : 100;

  const totalSkillsCount = (guidance.requiredSkills?.length || 0) + (guidance.missingSkills?.length || 0);
  const currentSkillsCount = (guidance.requiredSkills?.length || 0) + completedCount;

  const matchPercentage = totalSkillsCount > 0 
    ? Math.round((currentSkillsCount / totalSkillsCount) * 100) 
    : 100;
  
  const initialMatchPercentage = totalSkillsCount > 0
    ? Math.round(((guidance.requiredSkills?.length || 0) / totalSkillsCount) * 100)
    : 100;

  // Extract minimum and maximum salaries from Indian salary string (e.g. ₹5,00,000 - ₹10,00,000 or ₹6 - ₹12 LPA)
  const parseSalary = (salaryStr: string) => {
    const defaultMin = 6.0;
    const defaultMax = 12.0;
    if (!salaryStr) return { min: defaultMin, max: defaultMax };
    
    // Convert to lowercase and clean up commas
    const cleaned = salaryStr.toLowerCase().replace(/,/g, "");
    // Extract all numbers
    const matches = cleaned.match(/\d+(\.\d+)?/g);
    if (!matches || matches.length === 0) return { min: defaultMin, max: defaultMax };
    
    let val1 = parseFloat(matches[0]);
    let val2 = matches.length > 1 ? parseFloat(matches[1]) : val1 * 1.8;
    
    // If numbers are in absolute format (e.g. 500000 instead of 5), convert to LPA
    if (val1 >= 10000) val1 = val1 / 100000;
    if (val2 >= 10000) val2 = val2 / 100000;
    
    return {
      min: Math.min(val1, val2),
      max: Math.max(val1, val2)
    };
  };

  const { min: entryMin, max: entryMax } = parseSalary(guidance.salaryRangeIndia);
  const baseAvg = (entryMin + entryMax) / 2;

  // Standard career multiplier list over a 10-year horizon (Years 0, 2, 5, 8, 10)
  const standardMultipliers = [1.0, 1.4, 2.1, 3.2, 4.5];
  // Dynamic boosted starting salary multiplier based on matchPercentage (skills + certs completed)
  const matchRatio = matchPercentage / 100;
  const startBoost = 0.85 + (matchRatio * 0.35); // 0.85x to 1.2x of entry base average

  const experienceMilestones = [
    { name: "Entry (0-1 yrs)", key: "0" },
    { name: "Junior (2-3 yrs)", key: "2" },
    { name: "Mid-level (4-6 yrs)", key: "5" },
    { name: "Senior (7-9 yrs)", key: "8" },
    { name: "Lead (10+ yrs)", key: "10" }
  ];

  const chartData = experienceMilestones.map((milestone, idx) => {
    const stdMult = standardMultipliers[idx];
    
    // Dynamic bonus for experience levels scaling up with skill completeness
    const skillBonusFactor = 1.0 + (matchRatio * 0.25 * (idx + 1) / 5);
    const stdVal = parseFloat((baseAvg * stdMult).toFixed(1));
    const boostedVal = parseFloat((baseAvg * stdMult * startBoost * skillBonusFactor).toFixed(1));

    return {
      experience: milestone.name,
      "Standard Path (LPA)": stdVal,
      "Your Growth Path (LPA)": boostedVal,
    };
  });

  return (
    <div className="space-y-4">
      {/* Top A4 Document Indicator Bar */}
      <div className="flex items-center justify-between px-4 py-2 bg-[var(--accent-light)] border-2 border-[var(--accent-light-border)] rounded-xl text-xs font-bold uppercase tracking-wider text-[var(--accent-primary)] print:hidden">
        <span className="flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-[var(--accent-primary)]" />
          Official Student Guidance Output Sheet (A4 Page Format)
        </span>
        <span className="text-[10px] text-[var(--text-muted)] font-mono font-medium hidden sm:inline">
          Ready for Export / Print
        </span>
      </div>

      {/* Main A4 Document Sheet Container */}
      <div 
        ref={reportRef} 
        className="mx-auto max-w-[850px] w-full min-h-[1120px] bg-[var(--bg-card)] border-2 border-[var(--color-border)] shadow-2xl rounded-2xl p-6 sm:p-10 space-y-6 transition-all duration-300 relative flex flex-col justify-between print:border-none print:shadow-none print:p-0 print:m-0 print:max-w-none"
      >
        <div className="space-y-6">
          
          {/* Header section in Official A4 Dossier Style */}
          <div className="border-2 border-[var(--color-border)] p-5 rounded-xl bg-[var(--bg-input)] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="w-12 h-12 rounded-xl bg-[var(--accent-primary)] text-[var(--primary-btn-text)] flex items-center justify-center font-bold shrink-0 shadow-sm border-2 border-[var(--color-border)]">
                <GraduationCap className="w-7 h-7" />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-[var(--accent-primary)]">
                  Student Guidance Output Dossier (A4)
                </span>
                <h2 className="text-xl sm:text-2xl font-black tracking-tight text-[var(--text-main)]">
                  {profile.name || "Aspiring Engineer"}
                </h2>
                <p className="text-xs text-[var(--text-muted)] font-bold mt-0.5">
                  {profile.degree} · {profile.year} {profile.preferredDomain ? `· ${profile.preferredDomain}` : ""}
                </p>
              </div>
            </div>

            <div className="text-left sm:text-right shrink-0 border-t sm:border-t-0 pt-2 sm:pt-0 border-[var(--color-border)]">
              <div className="bg-[var(--accent-secondary)] text-[var(--primary-btn-text)] border-2 border-[var(--color-border)] px-3 py-1 text-[11px] font-extrabold uppercase tracking-wider inline-block mb-1 shadow-xs rounded-lg">
                Report #{Math.floor(1000 + Math.random() * 9000)}
              </div>
              <p className="text-[10px] text-[var(--text-muted)] font-mono font-bold block">
                DATE: {new Date().toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }).toUpperCase()}
              </p>
            </div>
          </div>

          {/* Main Content Grid with 2px Dark Outlines */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-stretch">
            
            {/* Left Column: Primary Recommendation & Skill Match */}
            <div className="md:col-span-5 flex flex-col gap-6">
              
              {/* Primary Recommendation Card */}
              <div className="bg-gradient-to-br from-[var(--accent-primary)] to-[var(--accent-secondary)] p-6 flex-1 flex flex-col justify-between text-[var(--primary-btn-text)] border-2 border-[var(--color-border)] rounded-xl shadow-md min-h-[250px] relative overflow-hidden transition-all duration-300">
                <div>
                  <h3 className="text-xs font-bold text-[var(--primary-btn-text)]/80 uppercase tracking-widest mb-3">
                    Primary Recommended Career
                  </h3>
                  <div className="text-xl sm:text-2xl font-black text-[var(--primary-btn-text)] leading-tight uppercase tracking-tight mb-3">
                    {guidance.recommendedCareer}
                  </div>
                  <p className="text-[var(--primary-btn-text)]/90 text-xs font-medium leading-relaxed mb-4">
                    {guidance.reason}
                  </p>
                </div>
                
                <div className="border-t-2 border-[var(--primary-btn-text)]/30 pt-3 flex flex-col">
                  <span className="text-[var(--primary-btn-text)] font-extrabold text-lg leading-none">
                    {guidance.salaryRangeIndia}
                  </span>
                  <span className="text-[var(--primary-btn-text)]/80 text-[10px] mt-1 uppercase tracking-wider font-bold">
                    Estimated Entry Salary (India)
                  </span>
                </div>
              </div>

              {/* Skill Match Percentage Visualization */}
              <div className="bg-[var(--bg-card)] border-2 border-[var(--color-border)] shadow-[var(--card-shadow)] p-5 rounded-xl transition-all duration-300 flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase text-[var(--text-main)] tracking-wider flex items-center gap-1.5">
                    <Award className="w-4 h-4 text-[var(--accent-primary)]" />
                    Skill Match Analysis
                  </h4>
                  <span className={`px-2 py-0.5 text-[9px] font-extrabold uppercase tracking-wider rounded-lg border-2 ${
                    matchPercentage >= 75 
                      ? "bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/40" 
                      : matchPercentage >= 40 
                      ? "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/40" 
                      : "bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/40"
                  }`}>
                    {matchPercentage >= 75 ? "Excellent Fit" : matchPercentage >= 40 ? "Good Potential" : "Needs Training"}
                  </span>
                </div>
                
                <div className="flex items-baseline justify-between mt-1">
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-3xl font-black tracking-tight text-[var(--text-main)] font-mono">
                      {matchPercentage}%
                    </span>
                    <span className="text-[10px] text-[var(--text-muted)] font-bold font-mono">
                      match rate
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] font-mono font-bold text-[var(--text-main)] block">
                      {currentSkillsCount} / {totalSkillsCount}
                    </span>
                    <span className="text-[9px] text-[var(--text-muted)] uppercase tracking-tight block font-bold">
                      Skills Met
                    </span>
                  </div>
                </div>

                {/* Custom Visual Progress Bar */}
                <div className="relative w-full h-3.5 bg-[var(--bg-input)] border-2 border-[var(--color-border)] rounded-lg overflow-hidden my-1">
                  <div 
                    className="absolute top-0 left-0 h-full bg-[var(--accent-primary)]/20 transition-all duration-500"
                    style={{ width: `${initialMatchPercentage}%` }}
                  />
                  <div 
                    className="absolute top-0 left-0 h-full bg-gradient-to-r from-[var(--accent-primary)] to-[var(--accent-secondary)] transition-all duration-500 ease-out"
                    style={{ width: `${matchPercentage}%` }}
                  />
                </div>

                <div className="text-[10px] text-[var(--text-muted)] leading-relaxed font-medium">
                  {matchPercentage === 100 ? (
                    <p className="text-green-600 dark:text-green-400 font-bold flex items-center gap-1.5 mt-1">
                      <span>★</span> All {totalSkillsCount} required skills have been successfully mastered!
                    </p>
                  ) : (
                    <p className="mt-1">
                      You possess <span className="font-bold text-[var(--text-main)]">{guidance.requiredSkills?.length || 0}</span> required skills for this goal. Gain <span className="font-bold text-[var(--accent-primary)]">{totalSkillsCount - currentSkillsCount} more</span> skills using the checklist to unlock full preparedness.
                    </p>
                  )}
                </div>
              </div>

              {/* Future Scope Panel */}
              <div className="bg-[var(--bg-card)] border-2 border-[var(--color-border)] shadow-[var(--card-shadow)] p-5 flex flex-col justify-between min-h-[110px] rounded-xl transition-all duration-300">
                <div>
                  <h4 className="text-xs font-bold uppercase text-[var(--text-main)] tracking-wider mb-2">
                    Future Market Outlook
                  </h4>
                  <p className="text-xs text-[var(--text-main)] font-medium leading-relaxed">
                    {guidance.futureScope}
                  </p>
                </div>
              </div>

            </div>

            {/* Center Column: Strategic Roadmap & Skill Gaps */}
            <div className="md:col-span-7 flex flex-col gap-6">
              
              {/* Strategic Learning Roadmap Panel */}
              <div className="bg-[var(--bg-card)] border-2 border-[var(--color-border)] shadow-[var(--card-shadow)] p-6 flex-1 rounded-xl transition-all duration-300">
                <h3 className="text-xs font-bold uppercase tracking-widest text-[var(--text-main)] mb-5 flex justify-between items-center">
                  <span>Strategic Learning Roadmap</span>
                  <span className="font-mono text-[10px] lowercase text-[var(--text-muted)] opacity-80 font-bold">({guidance.learningRoadmap.length} steps)</span>
                </h3>
                
                <div className="space-y-4">
                  {guidance.learningRoadmap.map((step, idx) => (
                    <div key={idx} className="flex gap-3.5 items-start">
                      <div className="w-7 h-7 rounded-lg bg-[var(--accent-primary)]/10 text-[var(--accent-primary)] border-2 border-[var(--accent-primary)] flex items-center justify-center font-extrabold text-xs shrink-0 shadow-xs">
                        {String(idx + 1).padStart(2, '0')}
                      </div>
                      <div>
                        <p className="font-bold text-[var(--text-main)] text-xs leading-tight uppercase tracking-wide">
                          {step.split(":")[0] || `Phase ${idx + 1}`}
                        </p>
                        <p className="text-xs text-[var(--text-muted)] mt-1 leading-relaxed font-medium">
                          {step.split(":")[1] || step}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Skill Gap Analysis / Interactive Checker */}
              <div className="bg-[var(--bg-card)] border-2 border-[var(--color-border)] shadow-[var(--card-shadow)] p-6 flex flex-col gap-3 text-[var(--text-main)] rounded-xl transition-all duration-300">
                <div className="flex justify-between items-center">
                  <h3 className="text-xs font-bold uppercase text-[var(--text-main)] tracking-widest">
                    Interactive Skill Gap Analysis
                  </h3>
                  <span className="text-[10px] font-mono text-[var(--accent-secondary)] font-extrabold">
                    {completedCount}/{guidance.missingSkills.length} acquired ({progressPercent}%)
                  </span>
                </div>

                <p className="text-[10px] text-[var(--text-muted)] font-bold leading-snug">
                  Click missing skills to mark acquired as you learn:
                </p>

                <div className="flex flex-wrap gap-2 mt-1">
                  {guidance.missingSkills.map((skill) => {
                    const isAcquired = learnedSkills[skill] || false;
                    return (
                      <button
                        key={skill}
                        type="button"
                        onClick={() => toggleLearnedSkill(skill)}
                        className={`px-2.5 py-1 text-[10px] font-bold border-2 transition-all flex items-center gap-1.5 rounded-lg cursor-pointer ${
                          isAcquired
                            ? "bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/40 line-through"
                            : "bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/40 border-dashed hover:bg-rose-500/20"
                        }`}
                      >
                        <span>{isAcquired ? "✓ ACQUIRED:" : "MISSING:"}</span>
                        <span>{skill.toUpperCase()}</span>
                      </button>
                    );
                  })}

                  {guidance.requiredSkills.map((skill) => (
                    <span
                      key={skill}
                      className="px-2.5 py-1 bg-[var(--accent-light)] text-[var(--accent-primary)] text-[10px] font-bold border-2 border-[var(--accent-light-border)] uppercase rounded-lg"
                    >
                      Acquired: {skill}
                    </span>
                  ))}
                </div>
              </div>

            </div>

            {/* Salary Growth Projection Line Chart */}
            <div className="md:col-span-12 bg-[var(--bg-card)] border-2 border-[var(--color-border)] shadow-[var(--card-shadow)] p-6 rounded-xl transition-all duration-300">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <div>
                  <h3 className="text-xs font-bold uppercase text-[var(--text-main)] tracking-widest flex items-center gap-1.5">
                    <TrendingUp className="w-4 h-4 text-[var(--accent-primary)]" />
                    Salary Growth Projection (10-Year Horizon)
                  </h3>
                  <p className="text-[10px] text-[var(--text-muted)] font-medium leading-relaxed mt-1">
                    Comparing standard industry curve against your dynamic skill-boosted path.
                  </p>
                </div>
                
                <div className="flex flex-wrap gap-3 text-[10px] font-mono">
                  <div className="flex items-center gap-1.5 px-2.5 py-1 bg-[var(--bg-input)] border-2 border-[var(--color-border)] rounded-lg">
                    <span className="w-2.5 h-0.5 bg-slate-400 dark:bg-zinc-500 inline-block" />
                    <span className="text-[var(--text-muted)] font-bold">Standard Avg: ₹{baseAvg.toFixed(1)} LPA</span>
                  </div>
                  <div className="flex items-center gap-1.5 px-2.5 py-1 bg-[var(--accent-light)] border-2 border-[var(--accent-light-border)] rounded-lg">
                    <span className="w-2.5 h-0.5 bg-[var(--accent-primary)] inline-block" />
                    <span className="text-[var(--accent-primary)] font-extrabold">Dynamic Projected: ₹{(baseAvg * startBoost).toFixed(1)} LPA</span>
                  </div>
                </div>
              </div>

              {/* Recharts Container */}
              <div className="w-full h-72 font-mono text-[10px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={chartData}
                    margin={{ top: 10, right: 30, left: 0, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" opacity={0.4} />
                    <XAxis 
                      dataKey="experience" 
                      stroke="var(--text-muted)" 
                      tickLine={false}
                      axisLine={{ stroke: 'var(--color-border)', strokeWidth: 2 }}
                      tick={{ fill: 'var(--text-muted)', fontSize: 9 }}
                    />
                    <YAxis 
                      stroke="var(--text-muted)" 
                      tickLine={false}
                      axisLine={{ stroke: 'var(--color-border)', strokeWidth: 2 }}
                      tickFormatter={(value) => `₹${value}L`}
                      tick={{ fill: 'var(--text-muted)', fontSize: 9 }}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend 
                      verticalAlign="bottom" 
                      height={36} 
                      iconType="plainline"
                      iconSize={14}
                      wrapperStyle={{ fontSize: '9px', fontWeight: 'bold' }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="Standard Path (LPA)" 
                      stroke="var(--text-muted)" 
                      strokeWidth={2} 
                      strokeDasharray="4 4"
                      dot={{ stroke: 'var(--text-muted)', strokeWidth: 2, r: 3, fill: 'var(--bg-card)' }}
                      activeDot={{ r: 5 }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="Your Growth Path (LPA)" 
                      stroke="var(--accent-primary)" 
                      strokeWidth={3} 
                      dot={{ stroke: 'var(--accent-primary)', strokeWidth: 2, r: 4, fill: 'var(--bg-card)' }}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

          </div>

          {/* Alternative Paths, Certs and Summary Footer block */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Alternative Paths */}
            <div className="bg-[var(--bg-card)] border-2 border-[var(--color-border)] shadow-[var(--card-shadow)] p-5 flex flex-col gap-4 rounded-xl transition-all duration-300">
              <h3 className="text-xs font-bold uppercase text-[var(--text-main)] tracking-wider">
                Alternative Paths
              </h3>
              <div className="space-y-4">
                {guidance.alternativeCareers.map((career, idx) => (
                  <div 
                    key={idx} 
                    className={`pl-3 border-l-2 ${idx === 0 ? "border-[var(--accent-primary)]" : "border-[var(--color-border)]"}`}
                  >
                    <p className="font-bold text-sm text-[var(--text-main)]">{career}</p>
                    <p className="text-[11px] text-[var(--text-muted)] mt-0.5 leading-relaxed font-medium">
                      Backup trajectory leveraging core competencies.
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Recommended Certs */}
            <div className="bg-[var(--bg-card)] border-2 border-[var(--color-border)] shadow-[var(--card-shadow)] p-5 rounded-xl transition-all duration-300">
              <h3 className="text-xs font-bold uppercase text-[var(--text-main)] tracking-wider mb-4">
                Recommended Credentials
              </h3>
              
              <div className="space-y-2">
                {guidance.certifications.map((cert, idx) => (
                  <div 
                    key={idx}
                    className="p-3 bg-[var(--bg-input)] border-2 border-[var(--color-border)] flex items-start gap-2.5 rounded-lg"
                  >
                    <div className="mt-0.5 shrink-0">
                      <Award className="w-4 h-4 text-[var(--accent-secondary)]" />
                    </div>
                    <p className="text-xs font-bold text-[var(--text-main)] leading-tight">
                      {cert}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Golden Counselor Summary Card */}
            <div className="bg-[var(--accent-light)] p-5 border-2 border-[var(--accent-light-border)] shadow-[var(--card-shadow)] flex flex-col justify-between rounded-xl transition-all duration-300">
              <div>
                <p className="text-[10px] font-extrabold uppercase tracking-widest text-[var(--accent-primary)] mb-2">
                  Counselor Summary
                </p>
                <p className="text-xs text-[var(--text-main)] leading-relaxed italic font-medium font-serif">
                  "{guidance.summary}"
                </p>
              </div>

              <div className="mt-4 pt-3 border-t-2 border-dashed border-[var(--accent-light-border)] flex flex-wrap gap-2 text-[10px] font-bold text-[var(--text-main)] uppercase tracking-tight">
                <span className="text-[var(--accent-primary)] font-extrabold">Target Roles:</span>
                <span>{guidance.jobRoles.slice(0, 2).join(" | ")}</span>
              </div>
            </div>

          </div>
        </div>

        {/* Formal A4 Page Footer Bar */}
        <div className="pt-6 mt-6 border-t-2 border-[var(--color-border)] border-dashed flex flex-col sm:flex-row items-center justify-between text-[10px] font-mono text-[var(--text-muted)] uppercase tracking-wider font-bold">
          <span>Official A4 Guidance Report • Page 1 of 1</span>
          <span>Verified AI Counselor Output</span>
        </div>
      </div>

      {/* Interactive Action Buttons - Print Hidden */}
      <div data-html2canvas-ignore="true" className="flex gap-3 justify-end max-w-[850px] mx-auto print:hidden pt-2">
        <button
          onClick={handleCopyText}
          className="px-4 py-2.5 bg-[var(--bg-card)] hover:bg-[var(--bg-input)] text-[var(--text-main)] rounded-xl text-xs font-bold uppercase tracking-tight transition-all flex items-center gap-1.5 border-2 border-[var(--color-border)] shadow-xs hover:shadow-sm cursor-pointer"
        >
          <Copy className="w-3.5 h-3.5" />
          {copied ? "Copied!" : "Copy Report Text"}
        </button>
        <button
          onClick={handlePrint}
          disabled={pdfGenerating}
          className={`px-5 py-2.5 bg-[var(--accent-primary)] hover:bg-[var(--accent-primary-hover)] text-[var(--primary-btn-text)] rounded-xl text-xs font-extrabold uppercase tracking-wider transition-all flex items-center gap-2 border-2 border-transparent shadow-sm hover:shadow-md cursor-pointer ${
            pdfGenerating ? "opacity-75 cursor-not-allowed" : ""
          }`}
        >
          {pdfGenerating ? (
            <>
              <div className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
              <span>Generating A4 PDF...</span>
            </>
          ) : (
            <>
              <Printer className="w-4 h-4 text-[var(--primary-btn-text)]" />
              <span>Save / Download A4 PDF</span>
            </>
          )}
        </button>
      </div>

    </div>
  );
};
