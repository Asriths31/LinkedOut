/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#6D5EF8",
          dark: "#5A4ED8",
          light: "#EBE9FE",
        },
        secondary: {
          DEFAULT: "#A855F7",
          dark: "#9333EA",
          light: "#F5F3FF",
        },
        accent: {
          DEFAULT: "#F59E0B",
          dark: "#D97706",
          light: "#FEF3C7",
        },
        success: {
          DEFAULT: "#22C55E",
          dark: "#16A34A",
          light: "#DCFCE7",
        },
        danger: {
          DEFAULT: "#EF4444",
          dark: "#DC2626",
          light: "#FEE2E2",
        },
        customBg: "#FAFAFC",
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"],
        display: ["Outfit", "sans-serif"],
      },
      boxShadow: {
        premium: "0 8px 30px rgba(0, 0, 0, 0.04)",
        glass: "0 8px 32px 0 rgba(31, 38, 135, 0.07)",
      },
      backdropBlur: {
        glass: "8px",
      }
    },
  },
  plugins: [],
}
