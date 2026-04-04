import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: "#111827",
        paper: "#f8fafc",
        brand: {
          DEFAULT: "#0f766e",
          dark: "#115e59",
          light: "#ccfbf1",
        },
        accent: "#f59e0b",
      },
      boxShadow: {
        panel: "0 20px 45px -25px rgba(15, 23, 42, 0.25)",
      },
      backgroundImage: {
        "grid-fade":
          "linear-gradient(to right, rgba(15, 118, 110, 0.08) 1px, transparent 1px), linear-gradient(to bottom, rgba(15, 118, 110, 0.08) 1px, transparent 1px)",
      },
    },
  },
  plugins: [],
};

export default config;

