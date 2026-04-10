import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        surface: {
          DEFAULT: "hsl(var(--surface) / <alpha-value>)",
          muted: "hsl(var(--surface-muted) / <alpha-value>)",
          elevated: "hsl(var(--surface-elevated) / <alpha-value>)",
        },
        ink: {
          DEFAULT: "hsl(var(--ink) / <alpha-value>)",
          muted: "hsl(var(--ink-muted) / <alpha-value>)",
        },
        accent: {
          DEFAULT: "hsl(var(--accent) / <alpha-value>)",
          foreground: "hsl(var(--accent-fg) / <alpha-value>)",
        },
        status: {
          approved: "hsl(var(--status-approved) / <alpha-value>)",
          rejected: "hsl(var(--status-rejected) / <alpha-value>)",
          pending: "hsl(var(--status-pending) / <alpha-value>)",
        },
        border: "hsl(var(--border) / <alpha-value>)",
        hero: "hsl(var(--hero) / <alpha-value>)",
      },
      fontFamily: {
        sans: ["Gilroy", "var(--font-sans)", "system-ui", "sans-serif"],
        display: ["Timepos Headline", "var(--font-display)", "serif"],
        accent: ["var(--font-accent)", "var(--font-display)", "serif"],
      },
      boxShadow: {
        card: "0 1px 0 hsl(var(--border) / 0.9), 0 12px 40px -24px hsl(var(--ink) / 0.25)",
      },
      transitionTimingFunction: {
        enter: "cubic-bezier(0.22, 1, 0.36, 1)",
        move: "cubic-bezier(0.25, 1, 0.5, 1)",
      },
      keyframes: {
        "fade-in": {
          from: { opacity: "0", transform: "translateY(6px) scale(0.98)" },
          to: { opacity: "1", transform: "translateY(0) scale(1)" },
        },
        shimmer: {
          "0%": { transform: "translateX(-60%)" },
          "100%": { transform: "translateX(60%)" },
        },
        "pulse-soft": {
          "0%, 100%": { opacity: "0.55" },
          "50%": { opacity: "0.85" },
        },
        "float-slow": {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-8px)" },
        },
      },
      animation: {
        "fade-in": "fade-in 320ms enter both",
        shimmer: "shimmer 1400ms linear infinite",
        "pulse-soft": "pulse-soft 1600ms ease-in-out infinite",
        "float-slow": "float-slow 9s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
