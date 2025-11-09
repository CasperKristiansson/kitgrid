# MDX Sanitization

Kitgrid treats all inbound MDX as untrusted. Every project shares the same remark
pipeline defined by `@kitgrid/mdx-pipeline`, which enforces:

- **No raw HTML** – `<script>`, `<iframe>`, and any inline HTML are blocked outright.
- **Allowed MDX components only** – authors can only use the whitelisted components
  listed below. Introducing a new component requires updating the package.
- **No remote embeds** – attributes such as `src` or `href` on MDX components may not
  point to external `http(s)` URLs. Assets must be bundled with the docs.

If any of these rules are violated, the Astro build fails with a message similar to:

```
Sanitization failed for docs/quickstart.mdx:
- Component <VideoEmbed> is not in the allowed list.
- Attribute src on <Callout> points to remote URL https://...
```

## Allowed MDX components

Current list (exported from `@kitgrid/mdx-pipeline/allowed-components`):

- `Callout`
- `Tabs`

Markdown syntax (headings, tables, code fences, etc.) continues to work as usual.

## Local usage

Apps wire the guard in their `astro.config.*` files:

```js
import mdx from '@astrojs/mdx';
import { remarkKitgridGuard } from '@kitgrid/mdx-pipeline';

export default defineConfig({
  integrations: [mdx({ remarkPlugins: [remarkKitgridGuard] })],
});
```

Downstream projects automatically inherit the same behavior via the workspace package.
