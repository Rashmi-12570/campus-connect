/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  safelist: [
    'bg-sky-50', 'text-sky-500', 'text-sky-600', 'text-sky-700', 'bg-sky-100', 'bg-sky-500', 'hover:bg-sky-600', 'border-sky-200', 'border-sky-300',
    'bg-emerald-50', 'text-emerald-500', 'text-emerald-600', 'text-emerald-700', 'bg-emerald-100', 'bg-emerald-500', 'hover:bg-emerald-600', 'border-emerald-100', 'border-emerald-300',
    'bg-amber-50', 'text-amber-500', 'text-amber-600', 'text-amber-700', 'text-amber-800', 'bg-amber-100', 'bg-amber-400', 'bg-amber-500', 'border-amber-100', 'border-amber-300',
    'bg-rose-50', 'text-rose-500', 'text-rose-600', 'text-rose-700', 'bg-rose-100', 'bg-rose-500', 'hover:bg-rose-100', 'border-rose-300',
    'bg-violet-50', 'text-violet-500',
    'bg-slate-50', 'bg-slate-100',
    // dark mode dynamic color variants for stat cards, badges, condition buttons
    'dark:bg-sky-500/15', 'dark:text-sky-400',
    'dark:bg-emerald-500/15', 'dark:text-emerald-400', 'dark:bg-emerald-500/10', 'dark:hover:bg-emerald-500/20', 'dark:border-emerald-500/40',
    'dark:bg-amber-500/15', 'dark:text-amber-400', 'dark:text-amber-300', 'dark:bg-amber-500/10', 'dark:border-amber-500/40',
    'dark:bg-rose-500/15', 'dark:text-rose-400', 'dark:bg-rose-500/10', 'dark:border-rose-500/40',
    'dark:bg-violet-500/15', 'dark:text-violet-400',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eff6ff', 100: '#dbeafe', 200: '#bfdbfe', 300: '#93c5fd', 400: '#60a5fa',
          500: '#3b82f6', 600: '#2563eb', 700: '#1d4ed8', 800: '#1e40af', 900: '#1e3a8a',
        },
        accent: {
          50: '#fff7ed', 100: '#ffedd5', 200: '#fed7aa', 300: '#fdba74', 400: '#fb923c',
          500: '#f97316', 600: '#ea580c', 700: '#c2410c',
        },
      },
      fontFamily: {
        display: ['Space Grotesk', 'sans-serif'],
        sans: ['Plus Jakarta Sans', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
