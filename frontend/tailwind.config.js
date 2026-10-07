/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        canvas: "#F4F1EA",
        sidebar: "#ECE7DE",
        surface: "#FAF8F5",
        "surface-raised": "#FFFFFF",
        "surface-inset": "#EDE7DD",
        navy: "#1E293B",
        "navy-dark": "#0F172A",
        coral: "#FF6B6B",
        "coral-hover": "#EE5A5A",
        "coral-soft": "#FFE5E5",
      },
      fontFamily: {
        sans: ["'Plus Jakarta Sans'", "'Outfit'", "Inter", "sans-serif"],
      },
      boxShadow: {
        clay: "8px 8px 18px rgba(180, 168, 153, 0.35), -8px -8px 18px rgba(255, 255, 255, 0.95)",
        "clay-sm": "4px 4px 10px rgba(180, 168, 153, 0.25), -4px -4px 10px rgba(255, 255, 255, 0.9)",
        "clay-inset": "inset 3px 3px 6px rgba(180, 168, 153, 0.25), inset -3px -3px 6px rgba(255, 255, 255, 0.9)",
        "clay-coral": "6px 6px 14px rgba(255, 107, 107, 0.35), -4px -4px 12px rgba(255, 255, 255, 0.8)",
      },
      borderRadius: {
        "clay-sm": "14px",
        "clay": "20px",
        "clay-lg": "28px",
      }
    },
  },
  plugins: [],
}
