import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "-apple-system", "sans-serif"],
      },
      colors: {
        ink: "#191c1e",
        paper: "#f7f9fb",
        brand: {
          DEFAULT: "#0d9488",
          dark: "#0f766e",
          light: "#ccfbf1",
          muted: "#99f6e4",
        },
        accent: "#06b6d4",
        surface: {
          DEFAULT: "#ffffff",
          elevated: "#f1f5f9",
          muted: "#f8fafc",
        },
      },
      boxShadow: {
        panel: "0 20px 50px -25px rgba(25, 28, 30, 0.18)",
        "panel-lg": "0 32px 64px -28px rgba(25, 28, 30, 0.25)",
        glow: "0 0 60px -12px rgba(13, 148, 136, 0.35)",
        "glow-lg": "0 0 80px -8px rgba(13, 148, 136, 0.4)",
        card: "0 1px 2px rgba(25, 28, 30, 0.03), 0 4px 16px -4px rgba(25, 28, 30, 0.06)",
        "card-hover":
          "0 2px 8px rgba(25, 28, 30, 0.05), 0 12px 32px -8px rgba(13, 148, 136, 0.12)",
        ambient: "0 1px 2px rgba(25, 28, 30, 0.03), 0 4px 16px -4px rgba(25, 28, 30, 0.06)",
        "ambient-lg": "0 2px 4px rgba(25, 28, 30, 0.04), 0 8px 24px -8px rgba(25, 28, 30, 0.08)",
      },
      backgroundImage: {
        "grid-fade":
          "linear-gradient(to right, rgba(15, 118, 110, 0.06) 1px, transparent 1px), linear-gradient(to bottom, rgba(15, 118, 110, 0.06) 1px, transparent 1px)",
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-brand": "linear-gradient(135deg, #0d9488 0%, #0891b2 100%)",
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-8px)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        "pulse-soft": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.7" },
        },
        "slide-in-right": {
          "0%": { opacity: "0", transform: "translateX(24px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        "scale-in": {
          "0%": { opacity: "0", transform: "scale(0.95)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.7s ease-out both",
        "fade-up-delay-1": "fade-up 0.7s ease-out 0.1s both",
        "fade-up-delay-2": "fade-up 0.7s ease-out 0.2s both",
        "fade-up-delay-3": "fade-up 0.7s ease-out 0.3s both",
        "fade-up-delay-4": "fade-up 0.7s ease-out 0.4s both",
        "fade-in": "fade-in 0.5s ease-out both",
        float: "float 6s ease-in-out infinite",
        shimmer: "shimmer 2.5s linear infinite",
        "pulse-soft": "pulse-soft 3s ease-in-out infinite",
        "slide-in-right": "slide-in-right 0.5s ease-out both",
        "scale-in": "scale-in 0.4s ease-out both",
      },
    },
  },
  plugins: [],
};

export default config;
