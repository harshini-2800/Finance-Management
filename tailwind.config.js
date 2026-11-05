/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx}",
    "./components/**/*.{js,jsx}",
    "./lib/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#07070D",
        surface: "#0D0E17",
        "surface-card": "rgba(18, 20, 32, 0.7)",
        "surface-hover": "rgba(28, 31, 50, 0.7)",
        primary: {
          DEFAULT: "#7C5CFF",
          glow: "#9373FF",
        },
        cyan: {
          accent: "#22D3EE",
        },
        emerald: {
          accent: "#34D399",
        },
        gold: {
          DEFAULT: "#F5C26B",
          glow: "#FDE68A",
        },
        danger: {
          DEFAULT: "#FB7185",
          glow: "#FDA4AF",
        },
      },
      fontFamily: {
        sans: ["var(--font-plus-jakarta)", "sans-serif"],
        numbers: ["var(--font-space-grotesk)", "monospace"],
      },
      boxShadow: {
        glass: "0 8px 32px 0 rgba(0, 0, 0, 0.37)",
        "glass-glow": "0 0 25px -5px rgba(124, 92, 255, 0.3)",
        "gold-glow": "0 0 25px -5px rgba(245, 194, 107, 0.35)",
        "cyan-glow": "0 0 25px -5px rgba(34, 211, 238, 0.3)",
        "emerald-glow": "0 0 25px -5px rgba(52, 211, 153, 0.3)",
      },
      animation: {
        "blob-pulse": "blob 10s infinite",
        "shimmer": "shimmer 2s linear infinite",
      },
      keyframes: {
        blob: {
          "0%, 100%": { transform: "translate(0px, 0px) scale(1)" },
          "33%": { transform: "translate(30px, -40px) scale(1.1)" },
          "66%": { transform: "translate(-20px, 20px) scale(0.95)" },
        },
        shimmer: {
          from: { backgroundPosition: "0 0" },
          to: { backgroundPosition: "-200% 0" },
        },
      },
    },
  },
  plugins: [],
};

