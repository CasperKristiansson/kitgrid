# @kitgrid/docs-ui

Reusable docs layout components shared across kitgrid projects. The package exposes the
three-column `DocsLayout`, sticky navigation, table-of-contents, and MDX helpers such as
callouts, tabbed blocks, and a copy-to-clipboard code block.

## Usage

```bash
pnpm add @kitgrid/docs-ui
```

```astro
---
import { DocsLayout, mdxComponents } from '@kitgrid/docs-ui';
import { docsNav } from '../data/docsNav';
---

<DocsLayout title="Docs" navItems={docsNav} headings={headings}>
  <Content components={mdxComponents} />
</DocsLayout>
```

The components expect Tailwind CSS v4 plus daisyUI tokens to be available globally. Each
project can swap tokens or fonts, while keeping the shared layout consistent.
