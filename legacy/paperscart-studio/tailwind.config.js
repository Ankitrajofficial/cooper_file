/** @type {import('tailwindcss').Config} */

// Brand green scale centered on #29b765 (brand base = emerald-600, used by buttons).
// We override Tailwind's `emerald` palette so every existing `emerald-*` class
// across the app instantly becomes the brand green. All values are hex (rgb) so
// html2canvas can rasterise them into the PDF previews (no oklch).
const brandGreen = {
  50: '#ebfaf2',
  100: '#cdf3df',
  200: '#a3e8c4',
  300: '#6ed9a2',
  400: '#41c884',
  500: '#34c06f',
  600: '#29b765', // brand base
  700: '#1f9b54', // hover / darker accent
  800: '#1a7c45',
  900: '#15663a',
  950: '#073420',
  DEFAULT: '#29b765',
};

export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: brandGreen,
        emerald: brandGreen,
      },
    },
  },
  plugins: [],
};
