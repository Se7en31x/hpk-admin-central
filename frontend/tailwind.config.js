/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        medical: {
          blue: '#1E40AF',
          lightblue: '#3B82F6',
          white: '#FFFFFF',
          slate: '#64748B',
          lightslate: '#F1F5F9',
        },
      },
    },
  },
  plugins: [],
};
