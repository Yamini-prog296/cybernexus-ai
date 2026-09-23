/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        soc: {
          dark: '#0a0d14',
          card: '#0f1422',
          panel: '#131b2e',
          border: '#1e293b',
          borderLight: '#334155',
          critical: '#ef4444',
          high: '#f97316',
          medium: '#eab308',
          low: '#10b981',
          info: '#06b6d4',
          accent: '#3b82f6',
        }
      },
      fontFamily: {
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'monospace'],
      }
    },
  },
  plugins: [],
}
