![Kitgrid overview](docs/assets/readme-hero.jpg)

# Kitgrid Docs Network

Kitgrid is my private documentation platform. Each product that lives under the
`apps/` folder ships to its own subdomain (`<project>.kitgrid.dev`) while the hub
site lives at `kitgrid.dev`. Everything is built with Astro, shares the
`@kitgrid/docs-ui` component library, and reads content straight from the source
repos via the `pnpm docs:fetch` pipeline.

---

## Repository layout

| Path | Purpose |
| --- | --- |
| `apps/hub` | Marketing/overview site for kitgrid.dev |
| `apps/pydantic-fixturegen` | Docs for pydantic-fixturegen (syncs GitHub /docs) |
| `apps/python-version-patch-pr` | Docs for the CPython Patch PR Action |
| `packages/docs-ui` | Shared layouts, navigation, search UI, MDX helpers |
| `scripts/` | Fetch docs, package builds, sidebar generator, deploy helpers |
| `.kitgrid-cache/` | Local cache for downloaded doc tarballs and staged deploys |

The `registry.json` file tells the build scripts which projects exist, which repo
+ ref they mirror, and whether the docs should be synced into `src/content/docs`.

---

## Essential scripts

```bash
pnpm docs:fetch -- --project <id> [--ref main]
# Pulls the remote /docs folder, updates manifestNav.ts, populates src/content/docs

pnpm build:sites
# Builds hub + every registry project and runs Pagefind search indexing

pnpm package:sites
# Copies each dist/ into .kitgrid-cache/deploy/{hub,sites/<project>/<ref>|current}

pnpm lint && pnpm typecheck
# Repo-wide ESLint/TypeScript checks (hub + shared packages)
```

Each workspace also exposes `pnpm dev`, `pnpm build`, `pnpm search:index`, etc.
Use `pnpm --filter @kitgrid/<workspace> <command>` to target a single site.

---

## Manual deploy workflow

We deploy everything locally with AWS credentials (profile `Personal`). The
sequence is always:

1. `pnpm build:sites`
2. `pnpm package:sites`
3. Sync staged artifacts to S3
4. Invalidate CloudFront (`EKCCE2L84JCR7`)

Example sync commands:

```bash
aws s3 sync .kitgrid-cache/deploy/hub/ s3://kitgrid-sites/hub/ --delete --profile Personal
aws s3 sync .kitgrid-cache/deploy/sites/<project>/current/ s3://kitgrid-sites/sites/<project>/current/ --delete --profile Personal
aws s3 sync .kitgrid-cache/deploy/sites/<project>/<ref>/ s3://kitgrid-sites/sites/<project>/<ref>/ --delete --profile Personal

aws cloudfront create-invalidation \ 
  --distribution-id EKCCE2L84JCR7 \ 
  --paths "/hub/*" "/sites/<project>/*" "/sitemap*.xml" "/robots.txt" "/index.html" \ 
  --profile Personal
```

Staging the `current/` and pinned `<ref>/` directories means each project keeps a
stable permalink for historic docs while `current/` always reflects the newest build.

---

## Fetching docs

`pnpm docs:fetch -- --project <id>` downloads the upstream repository (using the
refs declared in `registry.json`), extracts the `/docs` folder into
`.kitgrid-cache/docs/<id>/<ref>`, mirrors it into the Astro content collection,
and regenerates `manifestNav.ts`. The cached copy is source-of-truth for themes
(e.g. `kitgrid.yaml` under each cache entry).

---

## Development tips

- Use `pnpm --filter @kitgrid/<workspace> dev` to run a single site locally.
- Shared styles/components live in `packages/docs-ui`; update them there and rerun
  `pnpm build:sites` to verify both project docs adopt the change.
- Keep `.kitgrid-cache/` around between sessions—`docs:fetch` will only redownload
  remote tarballs when refs change.
- For Pagefind search tweaks, edit `packages/docs-ui/src/scripts/docs-search.js` and
  run `pnpm search:index` inside the target workspace to refresh `/public/pagefind`.

Happy shipping! :rocket:
