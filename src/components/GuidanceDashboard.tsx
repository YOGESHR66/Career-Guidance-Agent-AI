import React, { useState } from "react";
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
  Calendar,
  CheckSquare,
  Square
} from "lucide-react";

interface GuidanceDashboardProps {
  guidance: CareerGuidance;
  profile: StudentProfile;
}

export const GuidanceDashboard: React.FC<GuidanceDashboardProps> = ({ guidance, profile }) => {
  const [copied, setCopied] = useState(false);
  const [learnedSkills, setLearnedSkills] = useState<Record<string, boolean>>({});

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

  const handlePrint = () => {
    window.print();
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

  return (
    <div className="space-y-6 print:p-0">
      
      {/* Header section in Geometric Balance Style */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between border-b-2 border-slate-900 pb-4 gap-4">
        <div className="flex flex-col">
          <span className="text-xs font-bold uppercase tracking-widest text-blue-600 mb-1">
            Student Guidance Output
          </span>
          <h2 className="text-3xl font-black uppercase tracking-tight text-slate-900">
            {profile.name || "Aspiring Engineer"}
          </h2>
          <p className="text-sm text-slate-500 font-medium">
            {profile.degree} · {profile.year} {profile.preferredDomain ? `· ${profile.preferredDomain}` : ""}
          </p>
        </div>
        <div className="text-left sm:text-right shrink-0">
          <div className="bg-slate-900 text-white px-3 py-1 text-xs font-bold uppercase tracking-tighter inline-block mb-1.5">
            Counselor Output #{Math.floor(100 + Math.random() * 900)}
          </div>
          <p className="text-[10px] text-slate-400 font-mono">
            GENERATED: {new Date().toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }).toUpperCase()}
          </p>
        </div>
      </div>

      {/* Main Content Grid strictly following Geometric Balance structure */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-stretch">
        
        {/* Left Column: Primary Recommendation & Future Scope (span 5) */}
        <div className="md:col-span-5 flex flex-col gap-6">
          
          {/* Primary Recommendation Card */}
          <div className="bg-blue-600 p-6 flex-1 flex flex-col justify-between text-white border border-blue-700 min-h-[260px]">
            <div>
              <h3 className="text-xs font-bold text-blue-200 uppercase tracking-widest mb-4">
                Primary Recommendation
              </h3>
              <div className="text-3xl font-black text-white leading-tight uppercase tracking-tight mb-4">
                {guidance.recommendedCareer}
              </div>
              <p className="text-blue-100 text-xs leading-relaxed mb-6">
                {guidance.reason}
              </p>
            </div>
            
            <div className="border-t border-blue-400 pt-4 flex flex-col">
              <span className="text-white font-bold text-lg leading-none">
                {guidance.salaryRangeIndia}
              </span>
              <span className="text-blue-200 text-[10px] mt-1 uppercase tracking-wider font-semibold">
                Estimated Entry Salary (India)
              </span>
            </div>
          </div>

          {/* Future Scope Panel */}
          <div className="bg-white border border-slate-200 p-5 flex flex-col justify-between min-h-[120px]">
            <div>
              <h4 className="text-xs font-bold uppercase text-slate-400 tracking-wider mb-2">
                Future Market Outlook
              </h4>
              <p className="text-xs text-slate-700 font-medium leading-relaxed">
                {guidance.futureScope}
              </p>
            </div>
          </div>

        </div>

        {/* Center Column: Roadmap & Skill Gaps (span 7) */}
        <div className="md:col-span-7 flex flex-col gap-6">
          
          {/* Strategic Learning Roadmap Panel */}
          <div className="bg-white border border-slate-200 p-6 flex-1">
            <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-6 flex justify-between items-center">
              <span>Strategic Learning Roadmap</span>
              <span className="font-mono text-[10px] lowercase text-slate-400">({guidance.learningRoadmap.length} steps)</span>
            </h3>
            
            <div className="space-y-5">
              {guidance.learningRoadmap.map((step, idx) => (
                <div key={idx} className="flex gap-4 items-start">
                  <div className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-sm">
                    {String(idx + 1).padStart(2, '0')}
                  </div>
                  <div>
                    <p className="font-bold text-slate-900 text-sm leading-tight">
                      {step.split(":")[0] || `Phase ${idx + 1}`}
                    </p>
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                      {step.split(":")[1] || step}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Skill Gap Analysis / Interactive Checker */}
          <div className="bg-slate-900 p-6 flex flex-col gap-3 text-white">
            <div className="flex justify-between items-center">
              <h3 className="text-xs font-bold uppercase text-slate-400 tracking-widest">
                Interactive Skill Gap Analysis
              </h3>
              <span className="text-[10px] font-mono text-indigo-300">
                {completedCount}/{guidance.missingSkills.length} acquired ({progressPercent}%)
              </span>
            </div>

            <p className="text-[11px] text-slate-400 leading-snug">
              Click on missing skills to cross them out as you study them:
            </p>

            <div className="flex flex-wrap gap-2 mt-2">
              {guidance.missingSkills.map((skill) => {
                const isAcquired = learnedSkills[skill] || false;
                return (
                  <button
                    key={skill}
                    type="button"
                    onClick={() => toggleLearnedSkill(skill)}
                    className={`px-2.5 py-1 text-[10px] font-bold border transition-all flex items-center gap-1.5 ${
                      isAcquired
                        ? "bg-green-500/20 text-green-400 border-green-500/30 line-through"
                        : "bg-red-500/20 text-red-400 border-red-500/30 hover:bg-red-500/30"
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
                  className="px-2.5 py-1 bg-green-500/10 text-green-400 text-[10px] font-bold border border-green-500/20 uppercase"
                >
                  Acquired: {skill}
                </span>
              ))}
            </div>
          </div>

        </div>

      </div>

      {/* Alternative Paths, Certs and Career Summary Footer block */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Alternative Paths */}
        <div className="bg-white border border-slate-200 p-5 flex flex-col gap-4">
          <h3 className="text-xs font-bold uppercase text-slate-400 tracking-wider">
            Alternative Paths
          </h3>
          <div className="space-y-4">
            {guidance.alternativeCareers.map((career, idx) => (
              <div 
                key={idx} 
                className={`pl-4 border-l-2 ${idx === 0 ? "border-slate-900" : "border-slate-200"}`}
              >
                <p className="font-bold text-sm text-slate-800">{career}</p>
                <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                  Backup trajectory leveraging your existing core interests.
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Recommended Certs */}
        <div className="bg-white border border-slate-200 p-5">
          <h3 className="text-xs font-bold uppercase text-slate-400 tracking-wider mb-4">
            Recommended Credentials
          </h3>
          <ul className="space-y-3">
            {guidance.certifications.map((cert, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-1.5 shrink-0"></div>
                <p className="text-xs font-bold text-slate-800 leading-snug">{cert}</p>
              </li>
            ))}
          </ul>
        </div>

        {/* Golden Career Summary Card */}
        <div className="bg-yellow-100 p-5 border border-yellow-200 flex flex-col justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-yellow-700 mb-2">
              Counselor Summary
            </p>
            <p className="text-xs text-yellow-900 leading-relaxed italic font-serif">
              "{guidance.summary}"
            </p>
          </div>

          <div className="mt-4 pt-3 border-t border-yellow-200/50 flex flex-wrap gap-2 text-[10px] font-bold text-yellow-800 uppercase tracking-tight">
            <span>Target Roles:</span>
            <span>{guidance.jobRoles.slice(0, 2).join(" | ")}</span>
          </div>
        </div>

      </div>

      {/* Interactive Actions - Print Hidden */}
      <div className="flex gap-2 justify-end print:hidden pt-4 border-t border-slate-100">
        <button
          onClick={handleCopyText}
          className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-xs font-bold uppercase tracking-tight transition-colors flex items-center gap-1.5 border border-slate-200"
        >
          <Copy className="w-3.5 h-3.5" />
          {copied ? "Copied!" : "Copy Report Text"}
        </button>
        <button
          onClick={handlePrint}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-bold uppercase tracking-tight transition-colors flex items-center gap-1.5 shadow-sm"
        >
          <Printer className="w-3.5 h-3.5" />
          Print / Save PDF
        </button>
      </div>

    </div>
  );
};
