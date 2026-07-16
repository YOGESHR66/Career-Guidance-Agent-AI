import React, { useState } from "react";
import { Theme, THEMES, playThemeClickSound } from "../theme";
import { motion, AnimatePresence } from "motion/react";
import { Paintbrush, Sparkles, Sliders, Check, HelpCircle, Shuffle, Volume2 } from "lucide-react";

interface ThemeSelectorProps {
  activeTheme: Theme;
  onThemeChange: (theme: Theme) => void;
}

export const ThemeSelector: React.FC<ThemeSelectorProps> = ({ activeTheme, onThemeChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isRolling, setIsRolling] = useState(false);

  const handleSelect = (theme: Theme) => {
    onThemeChange(theme);
    playThemeClickSound();
  };

  const handleRandomize = () => {
    if (isRolling) return;
    setIsRolling(true);
    playThemeClickSound();

    let rollCount = 0;
    const interval = setInterval(() => {
      const randomIndex = Math.floor(Math.random() * THEMES.length);
      onThemeChange(THEMES[randomIndex]);
      playThemeClickSound();
      rollCount++;
      if (rollCount >= 6) {
        clearInterval(interval);
        setIsRolling(false);
      }
    }, 150);
  };

  return (
    <div className="relative z-50 print:hidden">
      {/* Dynamic spinning shiny outline that surrounds the style bar and adapts to current theme */}
      <div className="absolute -inset-[1.5px] rounded-full pointer-events-none overflow-hidden z-0 transition-all duration-500">
        <div 
          className="absolute w-[200%] h-[200%] top-[-50%] left-[-50%] animate-spin"
          style={{
            animationDuration: "4s",
            background: `conic-gradient(from 0deg, transparent 0%, var(--accent-primary) 25%, transparent 50%, var(--accent-secondary) 75%, transparent 100%)`,
          }}
        />
      </div>

      {/* Floating Pill Trigger */}
      <motion.button
        onClick={() => {
          setIsOpen(!isOpen);
          playThemeClickSound();
        }}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="relative z-10 flex items-center gap-2 px-3.5 py-2 bg-[var(--bg-card)] border border-[var(--color-border)] rounded-full text-xs font-semibold uppercase tracking-wider text-[var(--text-main)] shadow-sm cursor-pointer hover:bg-[var(--bg-input)] transition-colors"
      >
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ type: "spring", stiffness: 200, damping: 15 }}
        >
          <Paintbrush className="w-3.5 h-3.5 text-[var(--accent-primary)]" />
        </motion.div>
        <span>Style Lab</span>
        <span className="px-1.5 py-0.5 rounded-full text-[9px] bg-[var(--accent-light)] border border-[var(--accent-light-border)] text-[var(--accent-primary)] font-bold">
          {activeTheme.emoji} {activeTheme.name.split(" ")[0]}
        </span>
      </motion.button>

      {/* Popover Panel */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Click-outside backdrop */}
            <div 
              className="fixed inset-0 z-40 bg-black/5" 
              onClick={() => setIsOpen(false)}
            />

            <motion.div
              initial={{ opacity: 0, y: 15, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 15, scale: 0.95 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className="absolute right-0 mt-3 w-80 bg-[var(--bg-card)] border border-[var(--color-border)] rounded-2xl shadow-lg p-4 z-50 overflow-hidden"
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b border-[var(--color-border)] pb-2.5 mb-3">
                <div className="flex items-center gap-1.5">
                  <Sliders className="w-4 h-4 text-[var(--accent-primary)] animate-pulse" />
                  <span className="text-xs font-bold uppercase tracking-wide text-[var(--text-main)]">
                    Theme Studio
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleRandomize}
                    disabled={isRolling}
                    className="p-1.5 bg-[var(--bg-input)] border border-[var(--color-border)] rounded-lg hover:bg-[var(--accent-light)] text-[var(--text-main)] transition-all cursor-pointer flex items-center gap-1 text-[10px] font-bold uppercase tracking-tighter disabled:opacity-50"
                    title="Gacha Randomizer"
                  >
                    <Shuffle className={`w-3 h-3 ${isRolling ? "animate-spin" : ""}`} />
                    <span>Roll</span>
                  </button>
                  <button 
                    onClick={() => setIsOpen(false)}
                    className="text-xs font-bold text-[var(--text-muted)] hover:text-[var(--text-main)] cursor-pointer px-1.5"
                  >
                    ✕
                  </button>
                </div>
              </div>

              {/* Slider Controller */}
              <div className="bg-[var(--bg-input)] p-2 rounded-xl border border-[var(--color-border)] mb-3">
                <div className="flex justify-between text-[10px] font-bold uppercase text-[var(--text-muted)] tracking-wider mb-1 px-1">
                  <span>Scroll Palette Dial</span>
                  <span>{THEMES.findIndex(t => t.id === activeTheme.id) + 1} / {THEMES.length}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max={THEMES.length - 1}
                  value={THEMES.findIndex(t => t.id === activeTheme.id)}
                  onChange={(e) => handleSelect(THEMES[parseInt(e.target.value)])}
                  className="w-full h-2 bg-slate-300 dark:bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-[var(--accent-primary)] focus:outline-none"
                />
              </div>

              {/* Theme Grid */}
              <div className="space-y-1.5 max-h-60 overflow-y-auto pr-1">
                {THEMES.map((t) => {
                  const isSelected = t.id === activeTheme.id;
                  return (
                    <motion.button
                      key={t.id}
                      onClick={() => handleSelect(t)}
                      whileHover={{ x: 4 }}
                      whileTap={{ scale: 0.98 }}
                      className={`w-full text-left p-2 rounded-xl border flex items-center justify-between transition-all cursor-pointer ${
                        isSelected
                          ? "border-[var(--accent-primary)] bg-[var(--accent-light)] shadow-xs"
                          : "border-[var(--color-border)] hover:border-[var(--text-muted)] bg-[var(--bg-card)]"
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="text-xl shrink-0">{t.emoji}</span>
                        <div className="flex flex-col min-w-0">
                          <span className="text-xs font-semibold text-[var(--text-main)] truncate">
                            {t.name}
                          </span>
                          <span className="text-[10px] text-[var(--text-muted)] truncate max-w-[170px]">
                            {t.description}
                          </span>
                        </div>
                      </div>

                      {/* Micro Palette Dot Indicator */}
                      <div className="flex items-center gap-1.5 shrink-0 pl-1">
                        <div className="flex gap-0.5 border border-[var(--color-border)] rounded-full p-0.5 bg-white shrink-0">
                          <span className="w-2.5 h-2.5 rounded-full block" style={{ backgroundColor: t.colors["--bg-main"] }} />
                          <span className="w-2.5 h-2.5 rounded-full block" style={{ backgroundColor: t.colors["--accent-primary"] }} />
                          <span className="w-2.5 h-2.5 rounded-full block" style={{ backgroundColor: t.colors["--accent-secondary"] }} />
                        </div>
                        {isSelected && (
                          <Check className="w-3.5 h-3.5 text-[var(--accent-primary)] shrink-0" />
                        )}
                      </div>
                    </motion.button>
                  );
                })}
              </div>

              {/* Footer Audio Hint */}
              <div className="mt-3 pt-2 border-t border-[var(--color-border)] flex items-center justify-between text-[9px] text-[var(--text-muted)] font-mono">
                <div className="flex items-center gap-1">
                  <Volume2 className="w-2.5 h-2.5 text-[var(--accent-primary)]" />
                  <span>Synthesized audio click active</span>
                </div>
                <span>2026 Live Lab</span>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};
