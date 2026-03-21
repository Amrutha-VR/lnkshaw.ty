/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ink:    '#0a0a0a',
        paper:  '#f5f0e8',
        offwhite: '#faf8f4',
        rule:   '#d4cfc6',
        accent: '#c8102e',
        muted:  '#6b6560',
        lead:   '#1a1a1a',
      },
      fontFamily: {
        headline: ['"Playfair Display"', 'Georgia', 'serif'],
        deck:     ['"Libre Baskerville"', 'Georgia', 'serif'],
        body:     ['"Source Sans 3"', 'system-ui', 'sans-serif'],
        mono:     ['"JetBrains Mono"', 'monospace'],
        label:    ['"Barlow Condensed"', 'sans-serif'],
      },
      fontSize: {
        'display': ['clamp(3rem,8vw,7rem)', { lineHeight: '0.95', letterSpacing: '-0.03em' }],
        'headline': ['clamp(1.5rem,3vw,2.5rem)', { lineHeight: '1.1', letterSpacing: '-0.02em' }],
      },
      borderWidth: { '3': '3px' },
      keyframes: {
        fadeUp: { from: { opacity: 0, transform: 'translateY(16px)' }, to: { opacity: 1, transform: 'translateY(0)' } },
        ticker: { from: { transform: 'translateX(0)' }, to: { transform: 'translateX(-50%)' } },
      },
      animation: {
        fadeUp: 'fadeUp 0.4s ease-out forwards',
        ticker: 'ticker 20s linear infinite',
      },
    },
  },
  plugins: [],
};
