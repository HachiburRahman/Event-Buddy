import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        'primary-blue': '#4F46E5',   // Main button and link color
        'light-violet': '#F5F3FF', // Page background color
        'dark-gray': '#374151',      // For main headings
        'medium-gray': '#6B7280',   // For subheadings and body text
        'light-gray': '#E5E7EB',     // For borders and dividers
        'danger-red': '#EF4444',       // For delete/cancel buttons
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'], 
      },
    },
  },
  plugins: [],
};
export default config;