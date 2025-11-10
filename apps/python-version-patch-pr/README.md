# @kitgrid/python-version-patch-pr

Docs host for [python-version-patch-pr](https://github.com/CasperKristiansson/python-version-patch-pr).
The layout, sidebar, and MDX components come from `@kitgrid/docs-ui`; content is pulled
from the upstream repo via the shared fetcher.

## Local development

```bash
# from repo root
pnpm docs:fetch -- --project python-version-patch-pr --ref main
pnpm --filter @kitgrid/python-version-patch-pr dev
```

`docs:fetch` downloads the upstream `docs/` folder into `.kitgrid-cache/docs/*` and
syncs it into `src/content/docs` (the folder stays untracked — only `.gitkeep` lives in
git). Re-run the fetch whenever you switch refs or after pulling the latest upstream.

## Useful scripts

- `pnpm --filter @kitgrid/python-version-patch-pr build` — production build
- `pnpm --filter @kitgrid/python-version-patch-pr lint` — shared lint rules
- `pnpm --filter @kitgrid/python-version-patch-pr search:index` — rebuild Pagefind index
