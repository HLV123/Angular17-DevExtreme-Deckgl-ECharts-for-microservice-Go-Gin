/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{html,ts}"],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        'urban': {
          50: '#f0f9ff', 100: '#e0f2fe', 200: '#bae6fd', 300: '#7dd3fc',
          400: '#38bdf8', 500: '#0ea5e9', 600: '#0284c7', 700: '#0369a1',
          800: '#075985', 900: '#0c4a6e', 950: '#082f49',
        },
        'aqi': {
          good: '#22c55e', moderate: '#eab308', unhealthy_sg: '#f97316',
          unhealthy: '#ef4444', very_unhealthy: '#8b5cf6', hazardous: '#991b1b',
        },
        'dark': { bg: '#0f172a', card: '#1e293b', border: '#334155', surface: '#1a2332' }
      },
      fontFamily: {
        'display': ['Outfit', 'sans-serif'],
        'body': ['DM Sans', 'sans-serif'],
        'mono': ['JetBrains Mono', 'monospace'],
      },
    },
  },
  plugins: [],
}

