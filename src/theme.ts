export interface Theme {
  id: string;
  name: string;
  emoji: string;
  description: string;
  isDark: boolean;
  colors: {
    "--bg-main": string;
    "--bg-card": string;
    "--bg-input": string;
    "--text-main": string;
    "--text-muted": string;
    "--text-inverse": string;
    "--color-border": string;
    "--accent-primary": string;
    "--accent-primary-hover": string;
    "--accent-secondary": string;
    "--accent-secondary-hover": string;
    "--accent-glow": string;
    "--accent-light": string;
    "--accent-light-border": string;
    "--card-shadow": string;
    "--primary-btn-text": string;
  };
}

export const THEMES: Theme[] = [
  {
    id: "oceanic-navy",
    name: "Oceanic Navy & Forest White",
    emoji: "🌊",
    description: "Elegant professional layout utilizing clean navy blue and light blue accents over a fresh forest white canvas.",
    isDark: false,
    colors: {
      "--bg-main": "#f4f7f5", // Forest white (extremely clean, elegant warm sage/woodland white)
      "--bg-card": "#ffffff", // Crisp white card base
      "--bg-input": "#f0f4f8", // Soft light-blue tinted input base
      "--text-main": "#0f172a", // Deep slate text
      "--text-muted": "#475569", // Muted slate blue
      "--text-inverse": "#ffffff",
      "--color-border": "#e2e8f0", // Clean soft slate border
      "--accent-primary": "#1e40af", // Elegant Navy/Royal Blue
      "--accent-primary-hover": "#1d4ed8", // Vibrant blue hover state
      "--accent-secondary": "#0284c7", // Sky blue accent
      "--accent-secondary-hover": "#0369a1",
      "--accent-glow": "rgba(30, 64, 175, 0.08)",
      "--accent-light": "#f0f7ff", // Soft modern light blue highlight box
      "--accent-light-border": "#e0f2fe",
      "--card-shadow": "0 10px 25px -5px rgba(15, 23, 42, 0.05), 0 8px 10px -6px rgba(15, 23, 42, 0.05)", // Soft modern professional shadow
      "--primary-btn-text": "#ffffff",
    }
  },
  {
    id: "midnight-cyber",
    name: "Midnight Cyberpunk",
    emoji: "⚡",
    description: "Immersive dark hacker mode with glowing neon and futuristic cyber accents.",
    isDark: true,
    colors: {
      "--bg-main": "#09090b",
      "--bg-card": "#18181b",
      "--bg-input": "#27272a",
      "--text-main": "#f4f4f5",
      "--text-muted": "#a1a1aa",
      "--text-inverse": "#09090b",
      "--color-border": "#27272a",
      "--accent-primary": "#22c55e", // Neon Green
      "--accent-primary-hover": "#15803d",
      "--accent-secondary": "#a855f7", // Neon Purple
      "--accent-secondary-hover": "#7e22ce",
      "--accent-glow": "rgba(34, 197, 94, 0.15)",
      "--accent-light": "#14532d",
      "--accent-light-border": "#16a34a",
      "--card-shadow": "0 10px 30px -10px rgba(0, 0, 0, 0.5), 0 0 15px rgba(34, 197, 94, 0.05)",
      "--primary-btn-text": "#09090b",
    }
  },
  {
    id: "sakura-dream",
    name: "Sakura Dream",
    emoji: "🌸",
    description: "Soft, cozy pastel light theme styled with sweet cherry blossom and gold accents.",
    isDark: false,
    colors: {
      "--bg-main": "#fffafb",
      "--bg-card": "#ffffff",
      "--bg-input": "#fff1f3",
      "--text-main": "#4c1d24",
      "--text-muted": "#9f5f6b",
      "--text-inverse": "#ffffff",
      "--color-border": "#ffe4e6",
      "--accent-primary": "#ec4899", // Blossom Pink
      "--accent-primary-hover": "#db2777",
      "--accent-secondary": "#d97706", // Amber Gold
      "--accent-secondary-hover": "#b45309",
      "--accent-glow": "rgba(236, 72, 153, 0.08)",
      "--accent-light": "#fff1f2",
      "--accent-light-border": "#ffe4e6",
      "--card-shadow": "0 10px 25px -5px rgba(236, 72, 153, 0.05)",
      "--primary-btn-text": "#ffffff",
    }
  },
  {
    id: "emerald-forest",
    name: "Emerald Forest",
    emoji: "🌿",
    description: "Calm, organic academic theme featuring warm sage greens and deep forest tones.",
    isDark: false,
    colors: {
      "--bg-main": "#f4f7f5",
      "--bg-card": "#ffffff",
      "--bg-input": "#eaf0ec",
      "--text-main": "#0f2d1d",
      "--text-muted": "#386b52",
      "--text-inverse": "#ffffff",
      "--color-border": "#e2ece6",
      "--accent-primary": "#059669", // Emerald Green
      "--accent-primary-hover": "#047857",
      "--accent-secondary": "#d97706", // Ochre Gold
      "--accent-secondary-hover": "#b45309",
      "--accent-glow": "rgba(5, 150, 105, 0.08)",
      "--accent-light": "#ecfdf5",
      "--accent-light-border": "#d1fae5",
      "--card-shadow": "0 10px 25px -5px rgba(5, 150, 105, 0.05)",
      "--primary-btn-text": "#ffffff",
    }
  },
  {
    id: "cosmic-hologram",
    name: "Cosmic Nebula",
    emoji: "🌌",
    description: "Deep galactic dark mode with deep purples and iridescent stellar vibes.",
    isDark: true,
    colors: {
      "--bg-main": "#0b0813",
      "--bg-card": "#15102a",
      "--bg-input": "#221a40",
      "--text-main": "#f1eefc",
      "--text-muted": "#9f93cd",
      "--text-inverse": "#0b0813",
      "--color-border": "#211942",
      "--accent-primary": "#06b6d4", // Holographic Cyan
      "--accent-primary-hover": "#0891b2",
      "--accent-secondary": "#ec4899", // Galaxy Pink
      "--accent-secondary-hover": "#db2777",
      "--accent-glow": "rgba(6, 182, 212, 0.15)",
      "--accent-light": "#161033",
      "--accent-light-border": "#311c63",
      "--card-shadow": "0 10px 30px -10px rgba(0, 0, 0, 0.7), 0 0 20px rgba(162, 28, 175, 0.05)",
      "--primary-btn-text": "#0b0813",
    }
  },
  {
    id: "vintage-ochre",
    name: "Vintage Library",
    emoji: "📜",
    description: "High-contrast academic paper theme with sepia text, brick red and aged amber accents.",
    isDark: false,
    colors: {
      "--bg-main": "#fbf6ed",
      "--bg-card": "#fdfbfa",
      "--bg-input": "#f4ebd9",
      "--text-main": "#2c1c0a",
      "--text-muted": "#6f4e27",
      "--text-inverse": "#ffffff",
      "--color-border": "#f1e4cb",
      "--accent-primary": "#991b1b", // Brick Red
      "--accent-primary-hover": "#7f1d1d",
      "--accent-secondary": "#c2410c", // Deep Ochre
      "--accent-secondary-hover": "#9a3412",
      "--accent-glow": "rgba(153, 27, 27, 0.08)",
      "--accent-light": "#fdf4e3",
      "--accent-light-border": "#fed7aa",
      "--card-shadow": "0 10px 25px -5px rgba(44, 28, 10, 0.04)",
      "--primary-btn-text": "#ffffff",
    }
  }
];

// Plays a beautifully polished synthesized sound on theme changes
export function playThemeClickSound() {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    
    const ctx = new AudioContextClass();
    
    // Play a delightful double micro-bloop
    const now = ctx.currentTime;
    
    // First Note
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    
    osc1.type = "sine";
    osc1.frequency.setValueAtTime(523.25, now); // C5
    osc1.frequency.exponentialRampToValueAtTime(783.99, now + 0.08); // G5
    
    gain1.gain.setValueAtTime(0.08, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
    
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.12);
    
    // Second Note slightly staggered
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    
    osc2.type = "triangle";
    osc2.frequency.setValueAtTime(783.99, now + 0.06); // G5
    osc2.frequency.exponentialRampToValueAtTime(1046.50, now + 0.15); // C6
    
    gain2.gain.setValueAtTime(0.05, now + 0.06);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
    
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(now + 0.06);
    osc2.stop(now + 0.2);
    
  } catch (err) {
    console.warn("Could not play synthesized web audio sound:", err);
  }
}
