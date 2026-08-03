import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#f4f3fb",
          100: "#ece9f9",
          200: "#d6d0f2",
          300: "#b3a8e6",
          400: "#8b79d6",
          500: "#6c53c7",
          600: "#5638ae",
          700: "#452c8c",
          800: "#382670",
          900: "#241a4a",
        },
        surface: "#f6f6fb",
        ink: "#14121f",
      },
      borderRadius: {
        xl: "0.875rem",
        "2xl": "1.25rem",
      },
      boxShadow: {
        card: "0 1px 2px rgba(20,18,31,0.04), 0 8px 24px -12px rgba(20,18,31,0.10)",
      },
      fontFamily: {
        sans: [
          "Inter",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "system-ui",
          "sans-serif",
        ],
      },
    },
  },
  plugins: [],
};
export default config;
