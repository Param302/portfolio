const plugin = require("tailwindcss/plugin");

/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        "ink-black": "#0B0F19",
        "bright-snow": "#F8FAFC",
        "sky-surge": "#1BB6E0",
        "papaya-whip": "#FFEDD4",
        "prussian-blue": "#1A2235",
        "alice-blue": "#E2E8F0",
        primary: "var(--color-primary)",
        secondary: "var(--color-secondary)",
        surface: "var(--color-surface)",
        border: "var(--color-border)",
        accent: "var(--color-accent)",
        background: "var(--color-background)",
        foreground: "var(--color-foreground)",
      },
      fontFamily: {
        heading: ["var(--font-geist)", "sans-serif"],
        description: ["var(--font-inter)", "sans-serif"],
        accent: ["var(--font-instrument)", "serif"],
      },
      backdropBlur: {
        glass: "12px",
      },
      boxShadow: {
        soft: "0 18px 60px rgba(11, 15, 25, 0.12)",
        "cta-glow": "0 0 24px rgba(27, 182, 224, 0.35)",
      },
    },
  },
  plugins: [
    plugin(({ addUtilities, theme }) => {
      const blur = theme("backdropBlur.glass");

      addUtilities({
        ".glass": {
          backgroundColor: "rgb(255 255 255 / 0.1)",
          backdropFilter: `blur(${blur})`,
          WebkitBackdropFilter: `blur(${blur})`,
        },
        ".dark .glass": {
          backgroundColor: "rgb(11 15 25 / 0.1)",
        },
      });
    }),
  ],
};
