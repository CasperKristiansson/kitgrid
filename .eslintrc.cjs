module.exports = {
  root: true,
  ignorePatterns: ['.kitgrid-cache', 'dist', 'node_modules'],
  overrides: [
    {
      files: ['scripts/**/*.{ts,tsx,js,jsx,cjs,mjs,cts,mts}'],
      extends: ['@kitgrid/eslint-config'],
      parserOptions: {
        project: ['./tsconfig.json']
      }
    }
  ]
};
