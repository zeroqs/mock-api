import { eslint } from '@zeroqs/eslint';

export default eslint(
  {
    typescript: true,
    next: true
  },
  {
    files: ['src/**/*.{js,mjs,cjs,ts,mts,jsx,tsx}']
  }
);
