const hubEslint = 'pnpm --filter @kitgrid/hub exec eslint --max-warnings=0 --fix --';
const rootEslint = 'pnpm exec eslint --max-warnings=0 --fix --';
const prettierCmd = 'pnpm exec prettier --write --';

export default {
  'apps/hub/**/*.{ts,tsx,js,jsx,astro,mdx}': [hubEslint],
  'scripts/**/*.{ts,tsx,js,jsx,mts,cts}': [rootEslint],
  '*.{ts,tsx,js,jsx,astro,md,mdx,json,yml,yaml}': [prettierCmd]
};
