# Kitgrid

Personal docs network for my own projects. Everything runs through pnpm workspaces; no public onboarding or long explanations needed.

## Daily commands

```bash
pnpm install            # install deps
pnpm docs:fetch -- --project <id> [--ref main]
pnpm build:sites        # build hub + all projects
pnpm package:sites      # stage artifacts in .kitgrid-cache
pnpm lint && pnpm typecheck
```

## Deploy cheat sheet

1. `pnpm build:sites`
2. `pnpm package:sites`
3. Sync `.kitgrid-cache/deploy/{hub,sites}` to `kitgrid-sites` S3
4. CloudFront invalidation for `EKCCE2L84JCR7`

AWS profile: `Personal`. Cached tarballs live in `.kitgrid-cache/`—leave it alone between runs.

## Repo map

| Path | Notes |
| --- | --- |
| `apps/hub` | Landing site + cards |
| `apps/*` | Individual product docs, all share `@kitgrid/docs-ui` |
| `packages/` | Shared UI, lint, prettier, tsconfig |
| `scripts/` | Fetch docs and package builds |
| `.kitgrid-cache/` | Downloaded docs + staged deploys |

That is all I need.
