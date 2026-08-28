import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        background: "#0B0F19",
        foreground: "#F8FAFC",
        primary: {
          50: "#eef2ff",
          100: "#e0e7ff",
          500: "#6366f1",
          600: "#4f46e5",
          700: "#4338ca",
          900: "#312e81",
        },
        brand: {
          orange: "#F97316",
          gold: "#F59E0B",
          emerald: "#10B981",
          dark: "#0B0F19",
          card: "#131B2E",
          cardLight: "#FFFFFF",
          border: "#1E293B",
        }
      },
    },
  },
  plugins: [],
};
export default config;
