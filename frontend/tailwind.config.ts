import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        'primary-blue': 'rgb(var(--primary-blue) / <alpha-value>)',
        'light-violet': 'rgb(var(--light-violet) / <alpha-value>)',
        'dark-gray': 'rgb(var(--dark-gray) / <alpha-value>)',
        'medium-gray': 'rgb(var(--medium-gray) / <alpha-value>)',
        'light-gray': 'rgb(var(--light-gray) / <alpha-value>)',
        'danger-red': 'rgb(var(--danger-red) / <alpha-value>)',
        background: 'rgb(var(--background) / <alpha-value>)',
        foreground: 'rgb(var(--foreground) / <alpha-value>)',
        card: 'rgb(var(--card) / <alpha-value>)',
        'card-foreground': 'rgb(var(--card-foreground) / <alpha-value>)',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'], 
      },
    },
  },
  plugins: [],
};
export default config;