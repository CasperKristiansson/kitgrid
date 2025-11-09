# @kitgrid/eslint-config

Shared ESLint rules for every kitgrid app and docs site.

## Install

```
pnpm add -D eslint @kitgrid/eslint-config \
  @typescript-eslint/parser @typescript-eslint/eslint-plugin \
  eslint-plugin-astro eslint-plugin-mdx eslint-plugin-import \
  eslint-plugin-unicorn eslint-plugin-jsx-a11y eslint-plugin-security \
  eslint-plugin-unused-imports eslint-import-resolver-typescript typescript
```

## Usage

Create an `.eslintrc.cjs` in your project root:

```js
module.exports = {
  extends: ["@kitgrid/eslint-config"],
};
```

Type-aware rules assume your main `tsconfig.json` covers the files being linted. Override the `KITGRID_TSCONFIG` env var if you keep ESLint on a separate project file.

```sh
KITGRID_TSCONFIG=./tsconfig.eslint.json pnpm lint
```
