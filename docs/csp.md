# Content Security Policy

Both hub and project docs ship with a strict CSP injected via the base layouts:

```
default-src 'self';
script-src 'self';
style-src 'self' 'unsafe-inline';
img-src 'self' data:;
font-src 'self' data:;
connect-src 'self';
object-src 'none';
base-uri 'self';
form-action 'self';
frame-ancestors 'self';
```

Notes:

- Inline scripts were removed from shared components (CodeBlock, Tabs, DocsSearch) and
  replaced with static modules so `script-src 'self'` is viable.
- Inline styles remain only where Tailwind output emits style attributes; hence
  `style-src 'self' 'unsafe-inline'`.
- Pagefind assets load from `/pagefind/**`, which falls under `'self'`.
- When adding new third-party assets, update the CSP string in
  `apps/hub/src/layouts/BaseLayout.astro` and `apps/project-stub/src/layouts/BaseLayout.astro`.

Test: run the deployments locally (`pnpm build:sites && pnpm package:sites`) and load via
`pnpm --filter @kitgrid/hub preview` to confirm no CSP violations in the browser console.
