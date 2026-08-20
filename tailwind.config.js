/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: '#FF4B4B',
          dark: '#E53935',
          hover: '#FF6B6B',
          muted: '#FFF0F0',
        },
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        nav: '0 4px 24px -4px rgba(0, 0, 0, 0.08), 0 12px 48px -12px rgba(229, 57, 53, 0.12)',
        card: '0 16px 48px -12px rgba(0, 0, 0, 0.1)',
        'card-hover': '0 24px 56px -16px rgba(229, 57, 53, 0.18)',
        glow: '0 0 0 1px rgba(255, 75, 75, 0.15), 0 12px 40px -8px rgba(255, 75, 75, 0.35)',
      },
      backgroundImage: {
        'hero-mesh':
          'radial-gradient(ellipse 80% 60% at 50% -30%, rgba(255,75,75,0.35), transparent), radial-gradient(ellipse 60% 50% at 100% 0%, rgba(255,255,255,0.12), transparent)',
        'red-shine': 'linear-gradient(135deg, rgba(255,255,255,0.2) 0%, transparent 45%, transparent 55%, rgba(255,255,255,0.08) 100%)',
        'dots-light':
          'radial-gradient(circle at center, rgba(0,0,0,0.04) 1px, transparent 1px)',
      },
      backgroundSize: {
        dots: '20px 20px',
      },
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in-soft': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'slide-down': {
          '0%': { opacity: '0', transform: 'translateY(-6px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'ken-burns': {
          '0%': { transform: 'scale(1.05) translate(0, 0)' },
          '100%': { transform: 'scale(1.12) translate(-1%, 0.5%)' },
        },
        pulseDot: {
          '0%, 100%': { opacity: '1', transform: 'scale(1)' },
          '50%': { opacity: '0.55', transform: 'scale(0.85)' },
        },
      },
      animation: {
        'fade-in': 'fade-in 0.45s ease-out both',
        'fade-in-soft': 'fade-in-soft 0.35s ease-out both',
        'slide-down': 'slide-down 0.35s ease-out both',
        'ken-burns': 'ken-burns 24s ease-out forwards',
        pulseDot: 'pulseDot 1.8s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}
