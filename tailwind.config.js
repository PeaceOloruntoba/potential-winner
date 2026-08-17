/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        // Deep navy = trust/authority (this is a payments product); bright
        // blue = the interactive accent used only for actions and focus.
        navy: {
          50: "#EEF1FA",
          100: "#D6DDF2",
          200: "#AEBBE6",
          300: "#8698D8",
          400: "#4C63BE",
          500: "#2A3F8F",
          600: "#1E2F70",
          700: "#14265E", // primary
          800: "#0F1C48",
          900: "#0A1332",
        },
        action: {
          50: "#EAF1FF",
          100: "#D2E1FF",
          400: "#5B8DF6",
          500: "#2F6FED", // accent
          600: "#1E56D6",
          700: "#1642AD",
        },
        surface: {
          DEFAULT: "#FFFFFF",
          soft: "#F7F9FF",
          muted: "#EEF2FB",
        },
        ink: {
          900: "#0B1220",
          700: "#33415C",
          500: "#5B6B8C",
          400: "#8592AD",
        },
        success: { 50: "#EAFBF1", 500: "#16A34A", 600: "#15803D" },
        warning: { 50: "#FFF7ED", 500: "#D97706", 600: "#B45309" },
        danger: { 50: "#FEF2F2", 500: "#DC2626", 600: "#B91C1C" },
      },
      fontFamily: {
        display: ["'Plus Jakarta Sans'", "sans-serif"],
        body: ["'Inter'", "sans-serif"],
      },
      boxShadow: {
        card: "0 1px 2px rgba(10, 19, 50, 0.06), 0 1px 8px rgba(10, 19, 50, 0.04)",
        raised: "0 4px 16px rgba(20, 38, 94, 0.12)",
      },
      borderRadius: {
        xl2: "1.25rem",
      },
    },
  },
  plugins: [],
};
