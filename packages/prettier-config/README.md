# @kitgrid/prettier-config

Single Prettier preset for kitgrid projects. Bundles the Astro and Tailwind plugins so UI + docs code format identically, while Prettier’s built-in MDX support handles documentation files.

## Install

```
pnpm add -D prettier @kitgrid/prettier-config
```

## Usage

Create `prettier.config.cjs`:

```js
module.exports = require("@kitgrid/prettier-config");
```

Or reference it via the CLI:

```
pnpm prettier --config node_modules/@kitgrid/prettier-config/index.cjs "src/**/*.{ts,astro,mdx}"
```
