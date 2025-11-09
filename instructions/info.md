Use one repo (**kitgrid**) to host all sites. Each project keeps docs in its own repo. Kitgrid ingests those docs at build time and publishes to `<project>.kitgrid.dev`. Below is the detailed plan.

# Objectives

- Single Astro+MDX codebase serving:

  - `kitgrid.dev` landing.
  - Any number of project docs at `<project>.kitgrid.dev`.

- Projects remain source-of-truth for their docs.
- Zero-touch DNS per new project. Deploy via Terraform to AWS.

# High-level architecture

- **Content ownership:** Docs live in each project repo under `/docs`. Kitgrid only reads them. ([GitHub][1])
- **Ingestion:** On build, kitgrid fetches each project’s `/docs` plus a small manifest file that declares metadata and theme.
- **Generation:** Astro renders shared layouts; MDX powers content. Left-nav docs layout like Astro’s own docs. ([Astro Docs][2])
- **Hosting:** One CloudFront distribution with a wildcard certificate for `*.kitgrid.dev`. Requests are rewritten by a CloudFront Function to a per-project prefix in a single S3 bucket.
- **DNS:** Cloudflare keeps `kitgrid.dev` and `*.kitgrid.dev` CNAME to CloudFront. No per-project DNS edits.

# Conventions

- **Project identifier:** lowercase kebab, e.g., `pydantic-fixturegen`.
- **Subdomain:** `<project>.kitgrid.dev`.
- **Docs path in each repo:** `/docs`.
- **Manifest filename:** `kitgrid.yaml` (in `/docs`).
- **Default homepage:** `/docs/index.md` (or `README.md`), overridable in manifest.
- **Versioning:** optional. If present, docs folders under `/docs/versions/<version>/...`.

# Tooling baseline

- **Language:** TypeScript for any custom build/deployment scripts. Ship a root `tsconfig` that extends `@kitgrid/tsconfig/node` so utilities (like docs fetchers) share compiler settings.
- **Transient artifacts:** Keep generated assets in `.kitgrid-cache/**` or `/dist`. Git should only track source, not fetched docs.

# Manifest (project-side)

Store in `/docs/kitgrid.yaml`. Purpose: instruct kitgrid how to fetch, theme, and render.
See `docs/manifest-spec.md` for the formal field reference. The JSON Schema lives at
`schemas/kitgrid-manifest.schema.json`, and you can validate manifests via
`pnpm manifest:check -- --file docs/kitgrid.yaml`.

**Fields**

- `id` — `pydantic-fixturegen`
- `name` — human display
- `repo` — `CasperKristiansson/pydantic-fixturegen`
- `ref_strategy` — `tags|branch|manual`
- `refs` — list of tags or branches to publish; `default_ref`
- `docs_path` — usually `docs/`
- `homepage` — relative path to the intro page
- `nav` — optional explicit sidebar tree; else kitgrid auto-builds from headings and frontmatter `order`
- `theme` — tokens and assets (see Theming)
- `features` — toggles: search, “edit this page” link, last-updated, version switcher
- `redirects` — old → new paths
- `analytics` — optional per-project key

# Content ingestion

**Fetcher**

- Preferred: download a tarball of the repo at a pinned `ref` (tag or branch) and read `/docs` plus `kitgrid.yaml`.
- Alternative: shallow clone with sparse checkout limited to `/docs`.
- Local dev: env var to use a local path for fast iteration.

**Docs cache**

- Never commit another project’s docs into the `kitgrid` repo. Instead, fetch them into `.kitgrid-cache/docs/<project>/<ref>` using a TypeScript CLI (`pnpm docs:fetch -- --project foo --source ../foo/docs`).
- Builds (CI and local) read from the cache path. Wipe it freely; it’s re-generated on demand.

**Local workflow**

1. Clone the upstream repo under `.kitgrid-cache/sources/<project>` for fast iteration. Example:

   ```bash
   git clone https://github.com/CasperKristiansson/pydantic-fixturegen.git \
     .kitgrid-cache/sources/pydantic-fixturegen
   ```

2. Pull docs into the cache without touching git state:

   ```bash
   pnpm docs:fetch -- \
     --project pydantic-fixturegen \
     --ref main
   ```

   By default this downloads the repo tarball defined in `registry.json` (or you can pass
   `--source <local path>` to bypass the network). The cache lives under
   `.kitgrid-cache/docs/<project>/<ref>` and stays ignored by git.

3. Point Astro apps (e.g., the `project-stub`) at the cache path when you need real docs content.

**Upstream requirements (e.g., `pydantic-fixturegen`)**

- Add `/docs/kitgrid.yaml` so the fetcher can read metadata without heuristics. Example scaffold:

  ```yaml
  id: pydantic-fixturegen
  name: Pydantic Fixturegen
  repo: CasperKristiansson/pydantic-fixturegen
  default_ref: main
  docs_path: docs
  homepage: docs/index.md
  theme:
    primary: '#14B8A6'
    secondary: '#67E8F9'
    bg: '#0A0F14'
    surface: '#0F1722'
    text: '#E5F4F1'
    muted: '#9AC7C0'
    link: '#2DD4BF'
    code_theme: 'ayu-dark'
    motion: subtle
  features:
    edit_link: true
    search: true
    versions: false
  ```

- Keep docs under `/docs` so the cache CLI (`--source …/docs`) picks them up.
- Future additions: surface navigation hints (`nav:`) and redirects once the manifest schema lands.

**Safety**

- Treat MDX as untrusted. Sanitize HTML, restrict allowed components, no remote scripts.
- Validate manifest against a JSON Schema before build.

**Versioning**

- If `ref_strategy: tags`, publish only matched tags (e.g., `v0.*`). Default route points to the latest stable tag; fall back to `main`.

# Site generation (Astro+MDX)

**Layouts**

- `DocsLayout`: left sidebar, main content, right TOC, persistent search, “Edit this page,” version switcher. Style similar to Astro docs’ IA. ([Astro Docs][2])
- `ProjectHome`: hero strip + key links; uses project theme tokens.
- `HubHome` (kitgrid.dev): marketing one-pager plus catalog of projects.

**MDX enhancements**

- Admonitions, tabs, code-block copy, callouts, “since vX.Y”.
- Auto-generated anchors and deep-linkable headings.
- Link checker and broken-ref reporter at build.

**Search**

- Static indexer (Pagefind) for each subdomain. Global search on `kitgrid.dev` can federate by calling each project’s JSON index.

**Perf**

- Partial hydration only where needed. Strict image optimization. (Astro aligns with this model.) ([andrewevans.dev][3])

# Theming system

**Global tokens (kitgrid)**

- Base: dark.
- Neutrals: `#0B0F16` bg, `#0F1420` surface, `#AAB2C0` text-secondary, `#E6EBF2` text.
- Accent: `#6EE7F9` (cyan) and `#60A5FA` (blue) gradient for CTAs.
- Code block theme: “Night Owl”-like dark.

**Per-project theme tokens**

- `primary`, `secondary`, `bg`, `surface`, `text`, `muted`, `link`, `code_theme`.
- `logo_light`, `logo_dark`, `favicon`, `og_image`.
- `motion` scale for animations: `none|subtle|lively` (default `subtle`).

**Animations**

- Subtle: fade+translate on section reveal, gradient shimmer on CTA borders, underline-from-center on nav hover. 200–250ms, no parallax.

# AWS + Terraform

**Cloudflare**

- Keep the domain hosted in Cloudflare but delegate traffic to AWS:
  - Terraform creates a CNAME-flattened record for `kitgrid.dev` and a wildcard CNAME for `*.kitgrid.dev`, both pointing at the CloudFront distribution domain.
  - ACM validation CNAMEs are also provisioned automatically so certificates renew without manual work.
- Leave these records in “DNS only” mode so TLS terminates on the AWS ACM certificate. If you need Cloudflare proxying, add the Cloudflare IP ranges to CloudFront as allowed origins and set `cloudflare_proxy=true` in Terraform.

**ACM**

- Request a certificate in `us-east-1` that covers both `kitgrid.dev` and `*.kitgrid.dev`.
- Use DNS validation (records created in Cloudflare) so the cert auto-renews without manual intervention.

**S3**

- Single bucket `kitgrid-sites`.
- Folder per project: `/sites/<project>/<ref>/...`. A `current` symlink folder (object copy) for default ref.

**Optional Route 53 takeover**

- If Cloudflare services are no longer required, create a public Route 53 hosted zone for `kitgrid.dev`, update the registrar/Cloudflare NS records to point at Route 53, and replace the Cloudflare DNS CNAMEs with Route 53 alias records to CloudFront.

**CloudFront**

- One distribution with alt names `kitgrid.dev` and `*.kitgrid.dev`.
- Origin Access Control to S3.
- Function at viewer-request:

  - Map `kitgrid.dev/*` to `/hub/*` and `<project>.kitgrid.dev/*` to `/sites/<project>/current/*` before hitting S3.
  - Clean URLs, default `index.html`, 404 → project homepage.
- To control costs, skip WAF, CloudWatch alarms, and access logging in the initial build. Add them later if needed.

- Separate path `/hub/` for `kitgrid.dev` root.

**Terraform modules**

- `kitgrid_dns` (Cloudflare)
- `kitgrid_cdn` (ACM, CloudFront, logs, WAF optional)
- `kitgrid_bucket` (S3, lifecycle, block public access)
- `kitgrid_project` (writes project registry JSON used by the site)
- Outputs: distribution ID, bucket, logging bucket, CNAME targets.

# CI/CD

**Project repo (e.g., pydantic-fixturegen)**

- On release or docs change:

  - Validate `kitgrid.yaml`.
  - Publish a `repository_dispatch` to kitgrid with `{project, ref}`.
  - Optional: attach a docs tarball artifact.

**Kitgrid repo**

- On dispatch or schedule:

  - Fetch each project’s manifest and docs at the requested `ref`.
  - Build Astro for the project and for `hub`.
  - Upload to S3 under `/sites/<project>/<ref>/`.
  - Atomically update `/sites/<project>/current/`.
  - Invalidate CloudFront for that prefix.

**Security**

- GitHub OIDC to AWS with least-priv role for deploy.
- No permanent AWS keys in CI.

# Information architecture

**Hub (kitgrid.dev)**

- Hero: what kitgrid is.
- Project grid: cards link to `<project>.kitgrid.dev`.
- Global search across projects.
- “Add your project” guide.

**Per-project**

- Left sidebar navigation.
- Content mirrors project `/docs` tree.
- “Edit this page” links to `repo/blob/<ref>/docs/...`.
- Version switcher if versions exist.

# Navigation rules

- If manifest `nav` provided, use it.
- Else auto-nav:

  - Read frontmatter `title`, optional `order`.
  - Section weight by directory; files prefixed `01-...` sort first.
  - Hide files with `draft: true`.

# pydantic-fixturegen specific design

**Context**

- Python library for deterministic Pydantic v2 test data and fixtures. README and `/docs` already exist; sections include Quickstart, CLI, Configuration, Providers, Security, Architecture, etc. ([GitHub][1])

**Theme**

- Accent: teal-cyan to reflect “deterministic, modern testing.”

  - `primary` `#14B8A6` (teal 500)
  - `secondary` `#67E8F9`
  - `bg` `#0A0F14`
  - `surface` `#0F1722`
  - `text` `#E5F4F1`
  - `muted` `#9AC7C0`
  - Links `#2DD4BF`
  - Code theme: dark “Night Owl” family

- Icon: simple seed crystal or grid node motif.

**Layout**

- Home at `/docs/index.md` with left nav visible by default, like Astro’s “Getting started” experience. ([Astro Docs][2])
- First screen: H1, short value prop, install snippet, 3 primary CTAs: Quickstart, CLI, Configuration.
- Secondary sections: Providers, Seeds & Determinism, Security model, Troubleshooting, Alternatives. These reflect README anchors and docs files. ([GitHub][1])

**Fonts (project-wide)**

- UI: **Inter** or **Instrument Sans**.
- Code: **JetBrains Mono**.
- Math/diagrams optional: **IBM Plex Sans Condensed** for captions.

**Micro-interactions**

- Copy buttons on code blocks.
- “Since vX.Y” badges in headings.
- Sidebar section expand/collapse with smooth height.

# Project registry (kitgrid-side)

Maintain a small `registry.json` checked into kitgrid that lists known projects:

- `id`, `subdomain`, `repo`, `default_ref`, `last_built_ref`, `status`.
  Used by CI to decide what to build and by the hub to render cards.

# Onboarding a new project

1. Add `/docs` and `kitgrid.yaml` to the project repo.
2. Add entry to kitgrid `registry.json`.
3. Push. CI builds and deploys. Subdomain works immediately.

# Accessibility and QA

- Color contrast AA minimum.
- Keyboard-navigable sidebar and search.
- Prefetch next/prev doc links.
- Link checker; fail build on broken internal links.

# Metrics

- Per-subdomain analytics key.
- Lighthouse budgets: ≥95 perf, ≥95 a11y, <100KB critical CSS/JS.

# Risks

- GitHub API rate limits → use tarball downloads and caching.
- MDX execution risks → whitelist components and sanitize.
- Single CDN for all projects → prefix-scoped invalidations; if contention becomes an issue, move heavy projects to a second distribution.

# Milestones

- **M0:** Terraform core (S3, ACM, CloudFront), Cloudflare records, OIDC role.
- **M1:** Astro skeleton: HubHome, DocsLayout, theme tokens, Pagefind.
- **M2:** Ingestion lib (tarball fetch, manifest parse, sidebar builder).
- **M3:** First project live: `pydantic-fixturegen.kitgrid.dev` with theme and homepage.
- **M4:** Versioning support and global search federation.
- **M5:** Project registry UI on hub and “add your project” guide.
