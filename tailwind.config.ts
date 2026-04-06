import type { Config } from 'tailwindcss';
import defaultConfig from 'tailwindcss/defaultConfig';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        slate: defaultConfig.theme?.colors?.slate,
        cyan: defaultConfig.theme?.colors?.cyan,
      },
    },
  },
  plugins: [],
};

export default config;
