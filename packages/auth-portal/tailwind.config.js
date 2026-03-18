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
          success: 'var(--ff-success)',
          'success-subtle': 'var(--ff-success-subtle)',
          info: 'var(--ff-info)',
          primary: 'var(--ff-primary)',
          'primary-hover': 'var(--ff-primary-hover)',
          focus: 'var(--ff-focus)',
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
