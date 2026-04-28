import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          orange: "#E8891A",
          navy: "#1A202C",
          pink: "#FF6B9D",
          purple: "#7C3AED",
          teal: "#0D9488",
        },
      },
      animation: {
        "float":      "float 5s ease-in-out infinite",
        "float-slow": "float 8s ease-in-out infinite",
        "slide-in":   "slideIn 0.5s cubic-bezier(0.22, 1, 0.36, 1)",
        "fade-in":    "fadeIn 0.6s ease-out",
        "pop":        "pop 0.45s cubic-bezier(0.34, 1.56, 0.64, 1)",
        "shimmer":    "shimmer 3s ease-in-out infinite",
        "breathe":    "breathe 6s ease-in-out infinite",
        "wave":       "wave 4s ease-in-out infinite",
        "glow":       "glow 4s ease-in-out infinite",
        "rise":       "rise 0.6s cubic-bezier(0.22, 1, 0.36, 1) both",
        "spin-slow":  "spin 8s linear infinite",
        "ping-slow":  "ping 3s cubic-bezier(0, 0, 0.2, 1) infinite",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%":      { transform: "translateY(-12px)" },
        },
        slideIn: {
          "0%":   { transform: "translateY(28px)", opacity: "0" },
          "100%": { transform: "translateY(0)",    opacity: "1" },
        },
        fadeIn: {
          "0%":   { opacity: "0", transform: "scale(0.96)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        pop: {
          "0%":   { transform: "scale(0.6)", opacity: "0" },
          "60%":  { transform: "scale(1.1)" },
          "100%": { transform: "scale(1)",   opacity: "1" },
        },
        shimmer: {
          "0%, 100%": { opacity: "0.5" },
          "50%":      { opacity: "1" },
        },
        breathe: {
          "0%, 100%": { transform: "scale(1)" },
          "50%":      { transform: "scale(1.06)" },
        },
        wave: {
          "0%, 100%": { transform: "rotate(-4deg)" },
          "50%":      { transform: "rotate(4deg)" },
        },
        glow: {
          "0%, 100%": { boxShadow: "0 0 16px rgba(232,137,26,0.25)" },
          "50%":      { boxShadow: "0 0 36px rgba(232,137,26,0.55)" },
        },
        rise: {
          "0%":   { transform: "translateY(20px) scale(0.95)", opacity: "0" },
          "100%": { transform: "translateY(0) scale(1)",       opacity: "1" },
        },
      },
      backgroundImage: {
        "gradient-brand":  "linear-gradient(135deg, #1A202C 0%, #2D3748 50%, #E8891A 100%)",
        "gradient-orange": "linear-gradient(135deg, #E8891A, #F6AD55)",
        "gradient-soft":   "linear-gradient(160deg, #FFF8F0 0%, #F7F8FC 50%, #F0F4FF 100%)",
        "gradient-insta":  "linear-gradient(135deg, #F58529, #DD2A7B, #8134AF)",
        "gradient-x":      "linear-gradient(135deg, #000000, #14171A)",
      },
      boxShadow: {
        "warm":    "0 4px 24px rgba(232,137,26,0.15)",
        "warm-lg": "0 8px 40px rgba(232,137,26,0.25)",
        "soft":    "0 2px 16px rgba(0,0,0,0.06)",
        "soft-lg": "0 8px 32px rgba(0,0,0,0.08)",
      },
    },
  },
  plugins: [],
};
export default config;
