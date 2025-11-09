# @kitgrid/tsconfig

Base TypeScript settings shared by every kitgrid workspace.

## Available configs

- `@kitgrid/tsconfig/base` – strict defaults for libraries and shared packages.
- `@kitgrid/tsconfig/astro` – adds Astro JSX runtime + client types.
- `@kitgrid/tsconfig/node` – targets NodeNext for scripts and tooling.
- `@kitgrid/tsconfig/react-mdx` – enables the React JSX transform for MDX islands.

## Usage

```jsonc
// tsconfig.json
{
  "extends": "@kitgrid/tsconfig/astro",
  "compilerOptions": {
    "paths": {
      "~/*": ["src/*"]
    }
  }
}
```
