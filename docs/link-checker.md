# Link Checker

`scripts/check-links.ts` scans built HTML (hub + staged project sites) for broken
internal links. Run it after `pnpm build:sites`:

```bash
pnpm build:sites
pnpm lint:links
```

Any missing target prints `Broken link …`; CI fails the build when issues are
found.
