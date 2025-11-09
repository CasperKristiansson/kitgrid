module.exports = {
  printWidth: 90,
  tabWidth: 2,
  singleQuote: true,
  trailingComma: 'es5',
  semi: true,
  bracketSpacing: true,
  arrowParens: 'always',
  proseWrap: 'preserve',
  plugins: ['prettier-plugin-astro', 'prettier-plugin-tailwindcss'],
  overrides: [
    {
      files: '*.md*',
      options: {
        proseWrap: 'always'
      }
    }
  ]
};
