/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: 'var(--bg)',
        'bg-deep': 'var(--bg-deep)',
        panel: 'var(--panel)',
        ink: 'var(--ink)',
        'text-on-bg': 'var(--text-on-bg)',
        muted: 'var(--muted)',
        accent: 'var(--accent)',
      },
      fontFamily: {
        thai: ['"Noto Sans Thai"', 'Sarabun', 'sans-serif'],
        'thai-serif': ['"Noto Serif Thai"', 'serif'],
        serif: ['"Cormorant Garamond"', 'serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'panel': '6px 6px 0 var(--bg-deep)',
        'panel-sm': '3px 3px 0 var(--bg-deep)',
      }
    },
  },
  plugins: [],
}
