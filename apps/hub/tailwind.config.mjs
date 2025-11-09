import daisyui from 'daisyui';
import defaultTheme from 'tailwindcss/defaultTheme';

/****
 * DaisyUI docs recommend importing the plugin and registering it inside
 * the Tailwind `plugins` array to expose component classnames (`plugins: [require('daisyui')]`).
 * Reference: context7 → /saadeghi/daisyui ("Add daisyUI Plugin to Tailwind CSS Configuration").
 ****/

const config = {
  content: ['./src/**/*.{astro,html,js,jsx,ts,tsx,mdx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Instrument Sans"', ...defaultTheme.fontFamily.sans],
      },
      backgroundImage: {
        'grid-radial':
          'radial-gradient(circle at top, rgba(96,165,250,0.25), transparent 60%)',
      },
    },
  },
  plugins: [daisyui],
  daisyui: {
    themes: [
      {
        kitgrid: {
          primary: '#60A5FA',
          'primary-content': '#030712',
          secondary: '#6EE7F9',
          'secondary-content': '#04121f',
          accent: '#F472B6',
          neutral: '#111827',
          'base-100': '#0B0F16',
          'base-200': '#101627',
          'base-300': '#19223C',
          info: '#3ABFF8',
          success: '#36D399',
          warning: '#FBBF24',
          error: '#F87272',
        },
      },
    ],
    darkTheme: 'kitgrid',
    logs: false,
  },
};

export default config;
