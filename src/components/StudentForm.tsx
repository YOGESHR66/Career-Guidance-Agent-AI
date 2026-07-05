import React, { useState } from "react";
import { StudentProfile } from "../types";
import { PRESET_PERSONAS } from "../presets";
import { 
  User, 
  GraduationCap, 
  Calendar, 
  Terminal, 
  Heart, 
  Target, 
  Briefcase, 
  Sparkles, 
  Compass,
  Plus
} from "lucide-react";

interface StudentFormProps {
  onSubmit: (profile: StudentProfile) => void;
  isLoading: boolean;
  currentProfile: StudentProfile;
  onChangeProfile: (profile: StudentProfile) => void;
}

const POPULAR_SKILLS = [
  "Python", "JavaScript", "TypeScript", "React", "Node.js", "Java", "C++", 
  "HTML & CSS", "SQL", "MongoDB", "Docker", "AWS Basics", "Git & GitHub", 
  "UI/UX Design", "Machine Learning", "Data Structures", "Linux Basics", "REST APIs"
];

const POPULAR_INTERESTS = [
  "Web Applications", "AI/ML Models", "Cloud Deployments", "Ethical Hacking", 
  "App Development", "Data Analytics", "Game Development", "UI Animation", 
  "Problem Solving", "System Design", "Automation", "Open Source"
];

export const StudentForm: React.FC<StudentFormProps> = ({
  onSubmit,
  isLoading,
  currentProfile,
  onChangeProfile,
}) => {
  const [errors, setErrors] = useState<Partial<Record<keyof StudentProfile, string>>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    onChangeProfile({
      ...currentProfile,
      [name]: value
    });
    if (errors[name as keyof StudentProfile]) {
      setErrors({
        ...errors,
        [name]: ""
      });
    }
  };

  const handleAddSkill = (skill: string) => {
    const trimmed = currentProfile.skills.trim();
    if (trimmed.toLowerCase().includes(skill.toLowerCase())) return;
    
    const newValue = trimmed === "" ? skill : `${trimmed}, ${skill}`;
    onChangeProfile({
      ...currentProfile,
      skills: newValue
    });
  };

  const handleAddInterest = (interest: string) => {
    const trimmed = currentProfile.interests.trim();
    if (trimmed.toLowerCase().includes(interest.toLowerCase())) return;
    
    const newValue = trimmed === "" ? interest : `${trimmed}, ${interest}`;
    onChangeProfile({
      ...currentProfile,
      interests: newValue
    });
  };

  const handleSelectPreset = (id: string) => {
    const preset = PRESET_PERSONAS.find(p => p.id === id);
    if (preset) {
      onChangeProfile({ ...preset.profile });
      setErrors({});
    }
  };

  const validate = () => {
    const newErrors: Partial<Record<keyof StudentProfile, string>> = {};
    if (!currentProfile.degree.trim()) newErrors.degree = "Degree/Course is required";
    if (!currentProfile.year) newErrors.year = "Year of study is required";
    if (!currentProfile.interests.trim()) newErrors.interests = "At least one interest is required";
    if (!currentProfile.careerGoal.trim()) newErrors.careerGoal = "Please express your career goal";
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      onSubmit(currentProfile);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
          <Compass className="w-5 h-5 text-indigo-600" />
          Student Profile Details
        </h2>
        <p className="text-sm text-slate-500 mt-1">
          Tell us about yourself to receive highly customized, expert AI career mentoring.
        </p>
      </div>

      {/* Quick Presets */}
      <div>
        <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-2">
          Select an Inspiring Student Persona (Quick Fill)
        </label>
        <div className="grid grid-cols-2 gap-2">
          {PRESET_PERSONAS.map((preset) => (
            <button
              key={preset.id}
              type="button"
              onClick={() => handleSelectPreset(preset.id)}
              className="p-3 text-left border border-slate-100 hover:border-indigo-200 hover:bg-indigo-50/30 rounded-xl transition-all duration-200 group"
            >
              <div className="font-medium text-xs text-slate-700 group-hover:text-indigo-700 transition-colors">
                {preset.label}
              </div>
              <div className="text-[10px] text-slate-400 truncate mt-0.5">
                {preset.description}
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="border-t border-slate-100 my-4"></div>

      {/* Main Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Name (Optional) */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1 flex items-center gap-1.5">
            <User className="w-4 h-4 text-slate-400" />
            Full Name <span className="text-xs text-slate-400 font-normal">(Optional)</span>
          </label>
          <input
            type="text"
            name="name"
            placeholder="e.g. Rahul Kumar"
            value={currentProfile.name}
            onChange={handleChange}
            className="w-full px-4 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all"
          />
        </div>

        {/* Degree & Year */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1 flex items-center gap-1.5">
              <GraduationCap className="w-4 h-4 text-slate-400" />
              Degree / Course of Study
            </label>
            <input
              type="text"
              name="degree"
              placeholder="e.g. B.Tech Computer Science"
              value={currentProfile.degree}
              onChange={handleChange}
              className={`w-full px-4 py-2.5 bg-slate-50/50 border ${
                errors.degree ? "border-rose-400 focus:ring-rose-500/10 focus:border-rose-500" : "border-slate-200 focus:ring-indigo-500/10 focus:border-indigo-500"
              } rounded-xl text-slate-800 text-sm focus:outline-none transition-all`}
            />
            {errors.degree && (
              <p className="text-rose-500 text-xs mt-1 font-medium">{errors.degree}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1 flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-slate-400" />
              Year of Study
            </label>
            <select
              name="year"
              value={currentProfile.year}
              onChange={handleChange}
              className={`w-full px-4 py-2.5 bg-slate-50/50 border ${
                errors.year ? "border-rose-400 focus:ring-rose-500/10" : "border-slate-200 focus:ring-indigo-500/10"
              } rounded-xl text-slate-800 text-sm focus:outline-none focus:border-indigo-500 transition-all`}
            >
              <option value="">Select current year</option>
              <option value="1st Year">1st Year</option>
              <option value="2nd Year">2nd Year</option>
              <option value="3rd Year">3rd Year</option>
              <option value="4th Year">4th Year (Final Year)</option>
              <option value="Graduated">Graduated / Working professional</option>
            </select>
            {errors.year && (
              <p className="text-rose-500 text-xs mt-1 font-medium">{errors.year}</p>
            )}
          </div>
        </div>

        {/* Current Skills */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1 flex items-center gap-1.5">
            <Terminal className="w-4 h-4 text-slate-400" />
            Your Skills <span className="text-xs text-slate-400 font-normal">(Comma separated)</span>
          </label>
          <textarea
            name="skills"
            rows={2}
            placeholder="e.g. HTML, CSS, Javascript, Basic Python"
            value={currentProfile.skills}
            onChange={handleChange}
            className="w-full px-4 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all resize-none"
          />
          {/* Quick Skill Chips */}
          <div className="mt-1.5">
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
              Click to quickly add skills:
            </span>
            <div className="flex flex-wrap gap-1 max-h-20 overflow-y-auto pr-1">
              {POPULAR_SKILLS.map((skill) => (
                <button
                  key={skill}
                  type="button"
                  onClick={() => handleAddSkill(skill)}
                  className="px-2 py-0.5 text-[11px] bg-slate-50 text-slate-600 border border-slate-200/60 rounded-md hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-200 transition-colors flex items-center gap-0.5"
                >
                  <Plus className="w-2.5 h-2.5" />
                  {skill}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Interests */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1 flex items-center gap-1.5">
            <Heart className="w-4 h-4 text-slate-400" />
            Interests & Hobbies
          </label>
          <input
            type="text"
            name="interests"
            placeholder="e.g. designing user interfaces, creating automation scripts, data science"
            value={currentProfile.interests}
            onChange={handleChange}
            className={`w-full px-4 py-2.5 bg-slate-50/50 border ${
              errors.interests ? "border-rose-400 focus:ring-rose-500/10 focus:border-rose-500" : "border-slate-200 focus:ring-indigo-500/10 focus:border-indigo-500"
            } rounded-xl text-slate-800 text-sm focus:outline-none transition-all`}
          />
          {errors.interests && (
            <p className="text-rose-500 text-xs mt-1 font-medium">{errors.interests}</p>
          )}
          {/* Quick Interest Chips */}
          <div className="mt-1.5">
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
              Click to quickly add interests:
            </span>
            <div className="flex flex-wrap gap-1 max-h-20 overflow-y-auto pr-1">
              {POPULAR_INTERESTS.map((interest) => (
                <button
                  key={interest}
                  type="button"
                  onClick={() => handleAddInterest(interest)}
                  className="px-2 py-0.5 text-[11px] bg-slate-50 text-slate-600 border border-slate-200/60 rounded-md hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-200 transition-colors flex items-center gap-0.5"
                >
                  <Plus className="w-2.5 h-2.5" />
                  {interest}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Preferred Domain */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1 flex items-center gap-1.5">
            <Briefcase className="w-4 h-4 text-slate-400" />
            Preferred Work Domain
          </label>
          <select
            name="preferredDomain"
            value={currentProfile.preferredDomain}
            onChange={handleChange}
            className="w-full px-4 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all"
          >
            <option value="">No Strict Preference (Let AI choose the best fit)</option>
            <option value="Web Development">Web Development (Frontend/Backend/Full-Stack)</option>
            <option value="Artificial Intelligence & Machine Learning">Artificial Intelligence & ML</option>
            <option value="Data Science & Engineering">Data Science & Data Engineering</option>
            <option value="Cybersecurity">Cybersecurity & Ethical Hacking</option>
            <option value="Cloud Computing & DevOps">Cloud Computing & DevOps</option>
            <option value="Mobile App Development">Mobile App Development</option>
            <option value="UI/UX Product Design">UI/UX Product Design</option>
            <option value="Software Testing & QA">Software Testing & Quality Assurance</option>
          </select>
        </div>

        {/* Career Goal */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1 flex items-center gap-1.5">
            <Target className="w-4 h-4 text-slate-400" />
            Career Goal & Ambitions
          </label>
          <textarea
            name="careerGoal"
            rows={3}
            placeholder="e.g. I want to build state-of-the-art web products for startups, learn advanced architectures, and land a high-paying junior developer job in India."
            value={currentProfile.careerGoal}
            onChange={handleChange}
            className={`w-full px-4 py-2.5 bg-slate-50/50 border ${
              errors.careerGoal ? "border-rose-400 focus:ring-rose-500/10 focus:border-rose-500" : "border-slate-200 focus:ring-indigo-500/10 focus:border-indigo-500"
            } rounded-xl text-slate-800 text-sm focus:outline-none transition-all resize-none`}
          />
          {errors.careerGoal && (
            <p className="text-rose-500 text-xs mt-1 font-medium">{errors.careerGoal}</p>
          )}
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full mt-4 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl transition-all shadow-md hover:shadow-indigo-500/10 flex items-center justify-center gap-2 disabled:opacity-75 disabled:cursor-not-allowed"
        >
          <Sparkles className={`w-5 h-5 ${isLoading ? "animate-spin" : "animate-pulse"}`} />
          {isLoading ? "Consulting AI Career Advisor..." : "Generate Personalized Career Guidance"}
        </button>
      </form>
    </div>
  );
};
