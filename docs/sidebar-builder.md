# Sidebar Builder

`buildSidebar` (in `scripts/lib/sidebar-builder.ts`) turns a docs folder + manifest hints into the
`DocsNavItem[]` structure consumed by our layouts.

Usage:

```ts
import { buildSidebar } from '../scripts/lib/sidebar-builder';
import manifest from '../examples/pydantic-fixturegen/kitgrid.yaml';

const { nav, redirects } = buildSidebar({
  docsRoot: '.kitgrid-cache/docs/pydantic-fixturegen/main',
  manifestNav: manifest.nav,
  basePath: '/docs',
});
```

- If `manifest.nav` is provided, those entries win (paths are normalized, `.md` extensions
  stripped).
- Otherwise the builder walks the docs directory, parses frontmatter for `title`, `order`,
  `draft`, and `redirect_from`, and creates a deterministic tree based on folder/file
  structure.
- Draft files (`draft: true`) are skipped; any `redirect_from` values are returned in the
  `redirects` map so we can wire HTTP redirects later.
