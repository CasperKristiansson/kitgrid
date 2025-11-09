# @kitgrid/pydantic-fixturegen

Docs host for [pydantic-fixturegen](https://github.com/CasperKristiansson/pydantic-fixturegen).
The layout, sidebar, and MDX components come from `@kitgrid/docs-ui`; content is pulled
from the upstream repo via the shared fetcher.

## Local development

```bash
# from repo root
pnpm docs:fetch -- --project pydantic-fixturegen --ref main
pnpm --filter @kitgrid/pydantic-fixturegen dev
```

`docs:fetch` downloads the upstream `docs/` folder into `.kitgrid-cache/docs/*` and
syncs it into `src/content/docs` (the folder stays untracked — only `.gitkeep` lives in
git). Re-run the fetch whenever you switch refs or after pulling the latest upstream.

## Useful scripts

- `pnpm --filter @kitgrid/pydantic-fixturegen build` — production build
- `pnpm --filter @kitgrid/pydantic-fixturegen lint` — shared lint rules
- `pnpm --filter @kitgrid/pydantic-fixturegen search:index` — rebuild Pagefind index
