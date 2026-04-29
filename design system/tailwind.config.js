/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // --- PRIMARY (Neon Green) ---
        primary: {
          50:  "#F1FFF7",
          100: "#D5FFE6",
          200: "#C0FFDA",
          300: "#A3FFC9",
          400: "#91FFBE",
          500: "#76FFAE",
          600: "#6BE89E",
          700: "#54B57C",
        },

        // --- SECONDARY (Near-black / App Background) ---
        secondary: {
          50:  "#E9F1F5",
          100: "#C1CFD6",
          200: "#93ACB8",
          300: "#465C66",
          400: "#232E33",
          500: "#161D20",
          600: "#141A1D",
          700: "#101517",
          800: "#0D1112",
          900: "#0A0D0E",
        },

        // --- NEUTRAL (Grays) ---
        neutral: {
          50:  "#F5F5F5",
          100: "#E0DFE0",
          200: "#D1D0D1",
          300: "#BBBBBB",
          400: "#AEADAE",
          500: "#9A999A",
          600: "#8C8B8C",
          700: "#555455",
          800: "#3F3E3F",
          900: "#2A292A",
        },

        // --- INFO (Blue) ---
        info: {
          50:  "#F8FCFF",
          100: "#F1F8FF",
          200: "#E4F2FF",
          300: "#BDDDFF",
          400: "#93C8FF",
          500: "#4BA1FF",
          600: "#3B82F6",
          700: "#3A70E2",
          800: "#2D57B0",
          900: "#203D7D",
        },

        // --- SUCCESS (Green) ---
        success: {
          50:  "#FBFEFC",
          100: "#F2FAF6",
          200: "#E5F5EC",
          300: "#C0E5D1",
          400: "#97D4B4",
          500: "#6BC497",
          600: "#47B881",
          700: "#0C9D61",
          800: "#097A4B",
          900: "#065736",
        },

        // --- WARNING (Amber/Orange) ---
        warning: {
          50:  "#FFFDFA",
          100: "#FFF9EE",
          200: "#FFF7E1",
          300: "#FFEAB3",
          400: "#FFDD82",
          500: "#FFC62B",
          600: "#FFAD0D",
          700: "#FE9B0E",
          800: "#C7770B",
          900: "#915608",
        },

        // --- DANGER (Red) ---
        danger: {
          50:  "#FFFBFB",
          100: "#FEF2F2",
          200: "#FFEBEE",
          300: "#FFCCD2",
          400: "#F49898",
          500: "#EB6F70",
          600: "#F64C4C",
          700: "#EC2D30",
          800: "#B72224",
          900: "#821819",
        },

        // --- PURPLE (accent, limited use) ---
        purple: {
          50:  "#CEB0FA",
          100: "#B78AF7",
          200: "#9654F4",
          300: "#8133F1",
          400: "#6200EE",
          500: "#5900D9",
          600: "#4600A9",
          700: "#360083",
        },

        // --- MATERIAL BASE ---
        white: "#FFFFFF",
        black: "#000000",
      },

      // --- TYPOGRAPHY ---
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
      },

      fontSize: {
        // Headlines
        "headline-1": ["3rem",     { lineHeight: "3.5rem",  fontWeight: "600" }],  // 48/56
        "headline-2": ["2.5rem",   { lineHeight: "3.125rem",fontWeight: "600" }],  // 40/50
        "headline-3": ["2.25rem",  { lineHeight: "3rem",    fontWeight: "600" }],  // 36/48
        "headline-4": ["1.5rem",   { lineHeight: "2.25rem", fontWeight: "600" }],  // 24/36
        "headline-5": ["1rem",     { lineHeight: "1.5rem",  fontWeight: "600" }],  // 16/24

        // Body
        "body-large":  ["1.5rem",  { lineHeight: "2.25rem", fontWeight: "400" }],  // 24/36
        "body-medium": ["1rem",    { lineHeight: "1.5rem",  fontWeight: "400" }],  // 16/24
        "body-small":  ["0.875rem",{ lineHeight: "1.25rem", fontWeight: "400" }],  // 14/20

        // Caption Medium weight
        "caption-large-md":  ["1rem",     { lineHeight: "1.25rem", fontWeight: "500" }],  // 16/20
        "caption-medium-md": ["0.875rem", { lineHeight: "1rem",    fontWeight: "500" }],  // 14/16
        "caption-small-md":  ["0.75rem",  { lineHeight: "0.875rem",fontWeight: "500" }],  // 12/14

        // Caption Regular weight
        "caption-large-rg":  ["1rem",     { lineHeight: "1.25rem", fontWeight: "400" }],  // 16/20
        "caption-medium-rg": ["0.875rem", { lineHeight: "1rem",    fontWeight: "400" }],  // 14/16
        "caption-small-rg":  ["0.75rem",  { lineHeight: "0.875rem",fontWeight: "400" }],  // 12/14

        // Buttons
        "button-large":  ["1.125rem", { lineHeight: "1.75rem", fontWeight: "600" }],  // 18/28
        "button-medium": ["1rem",     { lineHeight: "1.5rem",  fontWeight: "600" }],  // 16/24
        "button-small":  ["0.875rem", { lineHeight: "1.25rem", fontWeight: "600" }],  // 14/20
      },

      fontWeight: {
        regular:   "400",
        medium:    "500",
        semibold:  "600",
      },
    },
  },
  plugins: [],
}
