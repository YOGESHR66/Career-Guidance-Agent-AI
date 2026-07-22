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
    <div className="bg-[var(--bg-card)] rounded-2xl border-2 border-[var(--color-border)] shadow-[var(--card-shadow)] p-6 space-y-6 transition-all duration-300">
      {/* Header */}
      <div>
        <h2 className="text-lg font-bold tracking-tight text-[var(--text-main)] flex items-center gap-2">
          <Compass className="w-5 h-5 text-[var(--accent-primary)]" />
          Student Profile Details
        </h2>
        <p className="text-xs text-[var(--text-muted)] mt-1 font-medium">
          Tell us about yourself to receive highly customized, expert AI career mentoring.
        </p>
      </div>

      {/* Quick Presets */}
      <div>
        <label className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider block mb-2">
          Select an Inspiring Student Persona (Quick Fill)
        </label>
        <div className="grid grid-cols-2 gap-2">
          {PRESET_PERSONAS.map((preset) => (
            <button
              key={preset.id}
              type="button"
              onClick={() => handleSelectPreset(preset.id)}
              className="p-3 text-left border-2 border-[var(--color-border)] hover:border-[var(--accent-primary)] hover:bg-[var(--accent-light)] rounded-xl transition-all duration-200 group cursor-pointer bg-[var(--bg-card)] shadow-xs hover:shadow-sm"
            >
              <div className="font-semibold text-xs text-[var(--text-main)] group-hover:text-[var(--accent-primary)] transition-colors">
                {preset.label}
              </div>
              <div className="text-[10px] text-[var(--text-muted)] truncate mt-0.5 font-medium">
                {preset.description}
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="border-t-2 border-[var(--color-border)] border-dashed my-4 opacity-70"></div>

      {/* Interactive Guide for Manual Form */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3 bg-[var(--bg-input)] border-2 border-[var(--color-border)] rounded-xl transition-all duration-300">
        <div className="text-left">
          <span className="text-xs font-bold text-[var(--text-main)] uppercase tracking-wide block">
            Customize Profile Details
          </span>
          <span className="text-[10px] text-[var(--text-muted)] font-medium block">
            Enter custom skills, interests, work domains, and career goals.
          </span>
        </div>
        <button
          type="button"
          onClick={() => {
            const el = document.getElementsByName("name")[0];
            if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }}
          className="w-full sm:w-auto px-4 py-1.5 rounded-lg text-xs font-extrabold uppercase tracking-widest border-2 border-[var(--accent-primary)] hover:bg-[var(--accent-light)] text-[var(--text-main)] hover:text-[var(--accent-primary)] transition-all cursor-pointer shadow-xs flex items-center justify-center gap-2"
        >
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--accent-primary)] opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-[var(--accent-primary)]"></span>
          </span>
          <span>Fill the below details</span>
        </button>
      </div>

      {/* Main Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-4 pt-2 border-b border-[var(--color-border)] border-dashed pb-5">
          {/* Name */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wide text-[var(--text-main)] mb-1 flex items-center gap-1.5">
                <User className="w-4 h-4 text-[var(--text-muted)]" />
                Full Name
              </label>
              <input
                type="text"
                name="name"
                placeholder="e.g. Rahul Kumar"
                value={currentProfile.name}
                onChange={handleChange}
                className="w-full px-4 py-2.5 bg-[var(--bg-input)] border border-[var(--color-border)] rounded-xl text-[var(--text-main)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]/20 focus:border-[var(--accent-primary)] transition-all font-medium"
              />
            </div>

            {/* Degree & Year */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wide text-[var(--text-main)] mb-1 flex items-center gap-1.5">
                  <GraduationCap className="w-4 h-4 text-[var(--text-muted)]" />
                  Degree / Course of Study
                </label>
                <input
                  type="text"
                  name="degree"
                  placeholder="e.g. B.Tech Computer Science"
                  value={currentProfile.degree}
                  onChange={handleChange}
                  className={`w-full px-4 py-2.5 bg-[var(--bg-input)] border ${
                    errors.degree ? "border-rose-500 focus:ring-rose-500/10 focus:border-rose-500" : "border-[var(--color-border)] focus:ring-[var(--accent-primary)]/10 focus:border-[var(--accent-primary)]"
                  } rounded-xl text-[var(--text-main)] text-sm focus:outline-none transition-all font-medium`}
                />
                {errors.degree && (
                  <p className="text-rose-500 text-xs mt-1 font-semibold">{errors.degree}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wide text-[var(--text-main)] mb-1 flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-[var(--text-muted)]" />
                  Year of Study
                </label>
                <select
                  name="year"
                  value={currentProfile.year}
                  onChange={handleChange}
                  className={`w-full px-4 py-2.5 bg-[var(--bg-input)] border ${
                    errors.year ? "border-rose-500 focus:ring-rose-500/10" : "border-[var(--color-border)] focus:ring-[var(--accent-primary)]/10"
                  } rounded-xl text-[var(--text-main)] text-sm focus:outline-none focus:border-[var(--accent-primary)] transition-all font-medium cursor-pointer`}
                >
                  <option value="" className="text-[var(--text-muted)]">Select current year</option>
                  <option value="1st Year">1st Year</option>
                  <option value="2nd Year">2nd Year</option>
                  <option value="3rd Year">3rd Year</option>
                  <option value="4th Year">4th Year (Final Year)</option>
                  <option value="Graduated">Graduated / Working professional</option>
                </select>
                {errors.year && (
                  <p className="text-rose-500 text-xs mt-1 font-semibold">{errors.year}</p>
                )}
              </div>
            </div>

            {/* Current Skills */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wide text-[var(--text-main)] mb-1 flex items-center gap-1.5">
                <Terminal className="w-4 h-4 text-[var(--text-muted)]" />
                Your Skills <span className="text-[10px] text-[var(--text-muted)] font-normal normal-case">(Comma separated)</span>
              </label>
              <textarea
                name="skills"
                rows={2}
                placeholder="e.g. HTML, CSS, Javascript, Basic Python"
                value={currentProfile.skills}
                onChange={handleChange}
                className="w-full px-4 py-2.5 bg-[var(--bg-input)] border border-[var(--color-border)] rounded-xl text-[var(--text-main)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]/20 focus:border-[var(--accent-primary)] transition-all resize-none font-medium"
              />
              {/* Quick Skill Chips */}
              <div className="mt-1.5">
                <span className="text-[10px] font-semibold text-[var(--text-muted)] uppercase tracking-wider block mb-1">
                  Click to quickly add skills:
                </span>
                <div className="flex flex-wrap gap-1 max-h-20 overflow-y-auto pr-1">
                  {POPULAR_SKILLS.map((skill) => (
                    <button
                      key={skill}
                      type="button"
                      onClick={() => handleAddSkill(skill)}
                      className="px-2 py-0.5 text-[11px] bg-[var(--bg-card)] text-[var(--text-main)] border border-[var(--color-border)] rounded-lg hover:bg-[var(--accent-light)] hover:text-[var(--accent-primary)] hover:border-[var(--accent-primary)] transition-colors flex items-center gap-0.5 cursor-pointer font-medium"
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
              <label className="block text-xs font-semibold uppercase tracking-wide text-[var(--text-main)] mb-1 flex items-center gap-1.5">
                <Heart className="w-4 h-4 text-[var(--text-muted)]" />
                Interests & Hobbies
              </label>
              <input
                type="text"
                name="interests"
                placeholder="e.g. designing user interfaces, creating automation scripts, data science"
                value={currentProfile.interests}
                onChange={handleChange}
                className={`w-full px-4 py-2.5 bg-[var(--bg-input)] border ${
                  errors.interests ? "border-rose-500 focus:ring-rose-500/10 focus:border-rose-500" : "border-[var(--color-border)] focus:ring-[var(--accent-primary)]/10 focus:border-[var(--accent-primary)]"
                } rounded-xl text-[var(--text-main)] text-sm focus:outline-none transition-all font-medium`}
              />
              {errors.interests && (
                <p className="text-rose-500 text-xs mt-1 font-semibold">{errors.interests}</p>
              )}
              {/* Quick Interest Chips */}
              <div className="mt-1.5">
                <span className="text-[10px] font-semibold text-[var(--text-muted)] uppercase tracking-wider block mb-1">
                  Click to quickly add interests:
                </span>
                <div className="flex flex-wrap gap-1 max-h-20 overflow-y-auto pr-1">
                  {POPULAR_INTERESTS.map((interest) => (
                    <button
                      key={interest}
                      type="button"
                      onClick={() => handleAddInterest(interest)}
                      className="px-2 py-0.5 text-[11px] bg-[var(--bg-card)] text-[var(--text-main)] border border-[var(--color-border)] rounded-lg hover:bg-[var(--accent-light)] hover:text-[var(--accent-secondary)] hover:border-[var(--accent-secondary)] transition-colors flex items-center gap-0.5 cursor-pointer font-medium"
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
              <label className="block text-xs font-semibold uppercase tracking-wide text-[var(--text-main)] mb-1 flex items-center gap-1.5">
                <Briefcase className="w-4 h-4 text-[var(--text-muted)]" />
                Preferred Work Domain
              </label>
              <select
                name="preferredDomain"
                value={currentProfile.preferredDomain}
                onChange={handleChange}
                className="w-full px-4 py-2.5 bg-[var(--bg-input)] border border-[var(--color-border)] rounded-xl text-[var(--text-main)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]/10 focus:border-[var(--accent-primary)] transition-all font-medium cursor-pointer"
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
              <label className="block text-xs font-semibold uppercase tracking-wide text-[var(--text-main)] mb-1 flex items-center gap-1.5">
                <Target className="w-4 h-4 text-[var(--text-muted)]" />
                Career Goal & Ambitions
              </label>
              <textarea
                name="careerGoal"
                rows={3}
                placeholder="e.g. I want to build state-of-the-art web products for startups, learn advanced architectures, and land a high-paying junior developer job in India."
                value={currentProfile.careerGoal}
                onChange={handleChange}
                className={`w-full px-4 py-2.5 bg-[var(--bg-input)] border ${
                  errors.careerGoal ? "border-rose-500 focus:ring-rose-500/10 focus:border-rose-500" : "border-[var(--color-border)] focus:ring-[var(--accent-primary)]/10 focus:border-[var(--accent-primary)]"
                } rounded-xl text-[var(--text-main)] text-sm focus:outline-none transition-all resize-none font-medium`}
              />
              {errors.careerGoal && (
                <p className="text-rose-500 text-xs mt-1 font-semibold">{errors.careerGoal}</p>
              )}
            </div>
          </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full mt-4 py-3 bg-[var(--accent-primary)] hover:bg-[var(--accent-primary-hover)] text-[var(--primary-btn-text)] font-semibold uppercase tracking-wider rounded-xl transition-all border border-transparent shadow-sm hover:shadow-md hover:-translate-y-0.5 flex items-center justify-center gap-2 disabled:opacity-75 disabled:cursor-not-allowed cursor-pointer"
        >
          <Sparkles className={`w-5 h-5 ${isLoading ? "animate-spin" : "animate-pulse"}`} />
          {isLoading ? "Consulting AI Career Advisor..." : "Generate Personalized Career Guidance"}
        </button>
      </form>
    </div>
  );
};
