/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ff: {
          error: 'var(--ff-error)',
          'error-bold': 'var(--ff-error-bold)',
          'error-subtle': 'var(--ff-error-subtle)',
          success: 'var(--ff-success)',
          'success-bold': 'var(--ff-success-bold)',
          'success-subtle': 'var(--ff-success-subtle)',
          info: 'var(--ff-info)',
          primary: 'var(--ff-primary)',
          'primary-hover': 'var(--ff-primary-hover)',
          focus: 'var(--ff-focus)',
          cta: 'var(--ff-cta)',
          'cta-hover': 'var(--ff-cta-hover)',
          'cta-active': 'var(--ff-cta-active)',
          page: {
            bg: 'var(--ff-page-bg)',
            'bg-to': 'var(--ff-page-bg-to)',
          },
          neutral: {
            DEFAULT: 'var(--ff-neutral)',
            subtle: 'var(--ff-neutral-subtle)',
            muted: 'var(--ff-neutral-muted)',
            bold: 'var(--ff-neutral-bold)',
          },
          'border-light': 'var(--ff-border-light)',
          'border-mid': 'var(--ff-border-mid)',
          form: {
            label: 'var(--ff-form-label)',
            text: 'var(--ff-form-text)',
            placeholder: 'var(--ff-form-placeholder)',
            helper: 'var(--ff-form-helper)',
          },
        },
      },
      fontFamily: {
        sans: ['IBM Plex Sans', 'system-ui', 'sans-serif'],
        mono: ['IBM Plex Mono', 'monospace'],
        display: ['Fraunces', 'Georgia', 'serif'],
      },
    },
  },
  plugins: [],
}
