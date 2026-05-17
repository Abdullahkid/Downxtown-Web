import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/hooks/**/*.{js,ts,jsx,tsx,mdx}',
    './src/lib/**/*.{js,ts,jsx,tsx,mdx}',
    './src/landing/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: 'var(--background)',
        'bg-2': 'var(--bg-2)',
        'bg-3': 'var(--bg-3)',
        'bg-4': 'var(--bg-4)',
        surface: 'var(--surface)',
        'surface-2': 'var(--surface-2)',
        
        'text-1': 'var(--text-1)',
        'text-2': 'var(--text-2)',
        'text-3': 'var(--text-3)',

        border: 'var(--border)',
        'border-accent': 'var(--border-accent)',

        'brand':            'var(--brand-color)',
        'brand-light':      'var(--brand-color-light)',
        'brand-dark':       'var(--brand-color-dark)',
        'brand-accent':     'var(--brand-accent)',
        'brand-bg':         'var(--brand-bg)',
        'ink': '#0A0A0A',
        'ink2': '#111111',
        'off': '#E8E4DC',
        blue: {
          DEFAULT: '#0ABAB5',
          light: '#2DD4CF',
          dim: 'rgba(10,186,181,0.12)',
        },
        // Landing page brand palette (mirrors Downxtown-Website)
        'brand-black':      '#000000',
        'brand-dark-navy':  '#0a0e1a',
        'brand-navy':       '#0d1117',
        'brand-midnight':   '#050a12',
        'brand-medium-gray':'#333333',
        'brand-cyan':       '#00FFFF',
        'brand-cyan-light': '#66FFFF',
        'brand-teal':       '#008080',
        'brand-teal-dark':  '#006666',
        'brand-dark-gray':  '#1a1a1a',
        'brand-white':      '#FFFFFF',
        // Semantic trust/urgency colors used by landing sections
        trust: {
          green: '#10B981',
          light: '#34D399',
        },
        urgency: {
          orange: '#F59E0B',
          light:  '#FBBF24',
        },
        
        'success':          'var(--color-success)',
        'warning':          'var(--color-warning)',
        'app-error':        'var(--color-error)',
      },
      borderRadius: {
        'card': '14px',
        'chip': '100px',
        'thumb': '10px',
      },
      fontFamily: {
        sans:    ['var(--font-dm-sans)', 'Arial', 'Helvetica', 'sans-serif'],
        display: ['var(--font-bebas-neue)', 'sans-serif'],
        // 'font-bebas' alias used by landing components
        bebas:   ['var(--font-bebas-neue)', 'sans-serif'],
        serif:   ['var(--font-dm-serif)', 'serif'],
        dmsans:  ['var(--font-dm-sans)', 'Arial', 'Helvetica', 'sans-serif'],
        // Archivo — clean, strong brand font used for the app bar wordmark
        archivo: ['var(--font-archivo)', 'Arial', 'sans-serif'],
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
}

export default config
