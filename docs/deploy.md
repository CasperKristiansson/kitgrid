# Build & Deploy Workflow

All deploys happen manually from a trusted workstation. The process is always:

1. Build every site.
2. Stage the artifacts under `.kitgrid-cache/deploy`.
3. Sync the staged folders to `s3://kitgrid-sites`.
4. Invalidate the shared CloudFront distribution.

## Commands

```bash
pnpm build:sites       # Builds hub + every registry workspace + Pagefind indexes
pnpm package:sites     # Copies dist outputs into .kitgrid-cache/deploy
```

After packaging, push the staged files with AWS credentials (or a named profile):

```bash
# Hub marketing site
aws s3 sync .kitgrid-cache/deploy/hub/ s3://kitgrid-sites/hub/ --delete --profile Personal

# Project docs (sync both current + pinned ref folders)
aws s3 sync .kitgrid-cache/deploy/sites/<project>/current/ s3://kitgrid-sites/sites/<project>/current/ --delete --profile Personal
aws s3 sync .kitgrid-cache/deploy/sites/<project>/<ref>/ s3://kitgrid-sites/sites/<project>/<ref>/ --delete --profile Personal

# CloudFront (same distribution serves hub + projects)
aws cloudfront create-invalidation \
  --distribution-id EKCCE2L84JCR7 \
  --paths "/hub/*" "/sites/<project>/*" "/sitemap*.xml" "/robots.txt" "/index.html" \
  --profile Personal
```

Projects that set `"sync_docs": true` in `registry.json` have their cached docs
(`.kitgrid-cache/docs/<id>/<ref>`) mirrored into `apps/<name>/src/content/docs` whenever
`pnpm docs:fetch -- --project <id>` runs. The mirrored files stay untracked in git —
only the `.gitkeep` placeholder lives in the repo.
