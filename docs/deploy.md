# Build & Deploy Workflow

CI runs `build:sites` → `package:sites` to prepare artifacts, then syncs them to the
`kitgrid-sites` S3 bucket and invalidates CloudFront.

## Commands

```bash
pnpm build:sites       # Builds hub + any registry workspaces
pnpm package:sites     # Copies dist outputs into .kitgrid-cache/deploy
pnpm deploy:paths      # Prints invalidation paths for CloudFront
pnpm lint:links        # Fails if any internal links break

Each workspace exposes `pnpm search:index` (Pagefind) which `build:sites` runs
automatically so the static search index (`/pagefind/**`) ships alongside the build.
```

## GitHub Actions

Secrets required:

- `KITGRID_DEPLOY_ROLE_ARN` — IAM role created via Terraform (`deploy_role_arn`).
- `KITGRID_CLOUDFRONT_DISTRIBUTION_ID` — distribution ID from Terraform outputs.
- Optional: `KITGRID_SITE_BUCKET` if different from `kitgrid-sites`.
