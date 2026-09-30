/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        obsidian: 'var(--obsidian)',
        charcoal: 'var(--charcoal)',
        gunmetal: 'var(--gunmetal)',
        silver: 'var(--silver)',
        ivory: 'var(--ivory)',
        gold: 'var(--gold)',
        crimson: 'var(--crimson)',
        bg: 'var(--bg)',
        'bg-deep': 'var(--bg-deep)',
        panel: 'var(--panel)',
        ink: 'var(--ink)',
        'text-on-bg': 'var(--text-on-bg)',
        muted: 'var(--muted)',
        accent: 'var(--accent)',
      },
      fontFamily: {
        giant: ['Anton', '"Bebas Neue"', 'Impact', 'sans-serif'],
        display: ['"Playfair Display"', 'serif'],
        slab: ['"Alfa Slab One"', 'serif'],
        condensed: ['Oswald', 'sans-serif'],
        thai: ['"Noto Sans Thai"', 'Sarabun', 'sans-serif'],
        'thai-serif': ['"Noto Serif Thai"', 'serif'],
        serif: ['"Cormorant Garamond"', 'serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'panel': '6px 6px 0 var(--bg-deep)',
        'panel-sm': '3px 3px 0 var(--bg-deep)',
        'atlus-gold': '4px 4px 0 var(--gold)',
        'atlus-crimson': '4px 4px 0 var(--crimson)',
      }
    },
  },
  plugins: [],
}
