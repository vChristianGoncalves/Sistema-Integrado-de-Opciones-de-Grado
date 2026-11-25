import defaultTheme from 'tailwindcss/defaultTheme'

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{vue,js}'],
  theme: {
    extend: {
      colors: {
        // Acento institucional (amarillo dorado)
        brand: {
          50: '#FEFCE8',
          100: '#FEF9C3',
          200: '#FEF08A',
          300: '#FDE047',
          400: '#FACC15',
          500: '#EAB308',
          600: '#CA8A04',
          700: '#A16207',
        },
        ink: '#1E293B', // texto principal / texto sobre botones dorados
        muted: '#64748B', // texto secundario (gris pizarra)
        canvas: '#FAF9F6', // lienzo general (crema suave)
      },
      fontFamily: {
        sans: ['Inter', ...defaultTheme.fontFamily.sans],
      },
      boxShadow: {
        drawer: '-12px 0 32px -12px rgb(15 23 42 / 0.18)',
      },
    },
  },
  plugins: [],
}
