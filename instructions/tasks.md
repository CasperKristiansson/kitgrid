# kitgrid — Tasks

**Finish rule:** Only mark a checkbox when:

1. All acceptance criteria are met,
2. Linting, formatting, and type-checks pass locally and in CI.

**Always run lint/format/typecheck before checking off any task.**

---

## 0) Project bootstrap

- [x] **Create `kitgrid` repo and workspace**

  - Summary: Create a mono-repo with `apps/` and `packages/`.
  - Deliverables: Repo with `apps/hub`, `apps/<project-stubs>`, `packages/…`, `.editorconfig`, `.gitignore`, Node version file, pnpm workspace file.
  - Acceptance: Clean `pnpm i`; empty Astro app scaffolds build locally; CI “setup” job green; TypeScript tooling in place for shared scripts/utilities.
  - Dependencies: None.

---

## 1) Unified linting and formatting (shared for all sites)

- [x] **Publish shareable configs**

  - Summary: Create `@kitgrid/eslint-config`, `@kitgrid/prettier-config`, `@kitgrid/tsconfig`.
  - Deliverables: Three packages under `packages/`; README per package; versioning via Changesets.
  - Acceptance: Local and CI lint/format/typecheck pass when consumed by `apps/hub`.
  - Dependencies: 0.1.

- [x] **Repo-wide enforcement**

  - Summary: Add lint/format/typecheck jobs plus lint-staged automation (no pre-commit hooks).
  - Deliverables: CI jobs for lint, format-check, and typecheck; `lint-staged` on staged files triggered via scripts.
  - Acceptance: A deliberate lint error fails CI; fix turns it green.
  - Dependencies: 1.1.

---

## 2) Infra: DNS, CDN, storage, security (Terraform)

- [x] **S3 + CloudFront + ACM**

  - Summary: Provision one S3 bucket for sites, wildcard cert for `kitgrid.dev` and `*.kitgrid.dev`, CloudFront distribution with OAC.
  - Deliverables: Terraform modules for bucket, cert, distribution, logs bucket.
  - Acceptance: Distribution issues TLS for apex and wildcard; bucket is private; OAC works; static test file served via CDN.
  - Dependencies: 0.1.

- [x] **Cloudflare DNS (one-time)**

  - Summary: Point `kitgrid.dev` and `*.kitgrid.dev` to CloudFront via CNAME (flatten apex).
  - Deliverables: Cloudflare records documented in Terraform (if managed) or manual change record.
  - Acceptance: DNS resolves; TLS valid end-to-end; HSTS honored.
  - Dependencies: 2.1.

- [x] **Viewer-request mapping**

  - Summary: CloudFront Function maps `<project>.kitgrid.dev` → `/sites/<project>/current/…`; `kitgrid.dev` → `/hub/…`.
  - Deliverables: Function attached to distribution; rules documented.
  - Acceptance: Requests route to correct S3 prefixes; clean URLs and default indexes work; custom 404 per project.
  - Dependencies: 2.1.

## 3) Astro skeleton and theming

- [x] **Hub site IA**

  - Summary: Build `apps/hub` with a one-page landing, project catalog grid, and global docs links.
  - Deliverables: High-contrast dark UI, hero, project cards, footer, sitemap, robots, favicons, OG image strategy.
  - Acceptance: Lighthouse ≥95 perf/a11y on desktop; sitemap and robots accessible.
  - Dependencies: 0.1, 1._, 2._.

- [ ] **Docs layout**

  - Summary: Create a reusable `DocsLayout` with left nav, content, right TOC, search slot, “Edit this page”, version switcher placeholder.
  - Deliverables: Layout components, MDX component map (admonitions, tabs, code copy), anchor links.
  - Acceptance: Content renders from sample MD files with headings and TOC; keyboard navigation works.
  - Dependencies: 3.1.

- [ ] **Theme tokens**

  - Summary: Implement global dark tokens for kitgrid and per-project tokens.
  - Deliverables: Token system with `primary`, `secondary`, `bg`, `surface`, `text`, `muted`, `link`, `code_theme`, `motion`.
  - Acceptance: Switching project theme changes colors without layout regressions.
  - Dependencies: 3.1, 3.2.

- [ ] **Fonts**

  - Summary: Set UI font and code font.
  - Deliverables: Locally hosted fonts: Inter or Instrument Sans (UI), JetBrains Mono (code); fallbacks documented.
  - Acceptance: No third-party font requests; CLS stable; readable at 14–16px base.
  - Dependencies: 3.1.

- [ ] **Micro-interactions**

  - Summary: Subtle animations only; 200–250ms; reduced motion honored.
  - Deliverables: Reveal on section enter, link underline animation, CTA shimmer; prefers-reduced-motion support.
  - Acceptance: Animations do not degrade Lighthouse or a11y; motion scales per project `motion` token.
  - Dependencies: 3.1–3.3.

---

## 4) Ingestion pipeline (docs live in project repos)

- [ ] **Docs cache workspace**

  - Summary: Provide a CLI workflow to fetch project docs into `.kitgrid-cache/docs/<project>/<ref>` for local/dev builds without committing upstream content.
  - Deliverables: TypeScript fetch script wired to `pnpm docs:fetch`, cache ignored via `.gitignore`, docs available during build steps.
  - Acceptance: Running `pnpm docs:fetch -- --project foo --source ../foo/docs` hydrates a local cache and leaves `git status` clean.
  - Dependencies: 0.1, 1.1.

- [ ] **Project registry**

  - Summary: Maintain `registry.json` listing projects (`id`, `subdomain`, `repo`, `default_ref`, `status`).
  - Deliverables: File in repo root; governance note for additions.
  - Acceptance: Hub reads registry and renders project cards.
  - Dependencies: 3.1.

- [ ] **Manifest spec and schema**

  - Summary: Define `kitgrid.yaml` spec; provide JSON Schema for validation.
  - Deliverables: Spec doc; schema file; example manifest.
  - Acceptance: Invalid manifests fail the build with actionable errors; valid manifests pass.
  - Dependencies: 4.1.

- [ ] **Fetcher**

  - Summary: Download repo tarball at a specified `ref` and extract `/docs` + manifest; support sparse checkout fallback; enable local path override for dev.
  - Deliverables: Fetch routine with caching; rate-limit handling; retries with backoff.
  - Acceptance: A large docs set downloads within acceptable time; network hiccups recovered.
  - Dependencies: 4.2.

- [ ] **Sanitization**

  - Summary: Treat MDX as untrusted; restrict components; block raw HTML and remote scripts by default.
  - Deliverables: Allowed components list; sanitization step; error messages for disallowed constructs.
  - Acceptance: Malicious MDX is neutralized or build fails clearly; CSP policy documented.
  - Dependencies: 3.2, 4.3.

- [ ] **Sidebar builder**

  - Summary: Build navigation from manifest `nav` or inferred from file tree + frontmatter `order` and `title`.
  - Deliverables: Deterministic nav generation with draft support and redirect map.
  - Acceptance: Sidebar matches manifest when provided; otherwise sorts predictably; broken links reported.
  - Dependencies: 3.2, 4.3.

- [ ] **Versioning support**

  - Summary: Optional per-project versions via `refs` or `/docs/versions/<version>/…`.
  - Deliverables: Version switcher UI; routing to versioned trees; “latest” pointer.
  - Acceptance: Switching versions swaps content and URL paths without cache confusion.
  - Dependencies: 3.2, 4.3, 4.5.

---

## 5) CI/CD flow

- [ ] **GitHub OIDC → AWS**

  - Summary: Configure least-privileged deploy role; no static keys.
  - Deliverables: IAM role with trust for GitHub, policy for S3 put/list, CloudFront invalidation, logs read.
  - Acceptance: CI assumes role and uploads to S3; non-GitHub principals denied.
  - Dependencies: 2.\*.

- [ ] **Build and deploy**

  - Summary: On dispatch or schedule: fetch project docs, build Astro for project and hub, upload to S3 prefixes, update `/sites/<project>/current/`, invalidate CDN.
  - Deliverables: CI workflow with cache; per-project prefix invalidations; artifact retention.
  - Acceptance: New content visible at `<project>.kitgrid.dev` within minutes; invalidations scoped to project.
  - Dependencies: 4.\*, 5.1.

- [ ] **Project → kitgrid dispatch**

  - Summary: Define `repository_dispatch` contract `{ project, ref }`; document how projects trigger builds on release/docs change.
  - Deliverables: Contract doc; example call; minimal project-side workflow snippet in docs (no code in this file).
  - Acceptance: Manual dispatch builds the targeted ref; missing fields produce clear errors.
  - Dependencies: 4.\*, 5.2.

---

## 6) Search and analytics

- [ ] **Per-subdomain search**

  - Summary: Generate a static search index for each project site.
  - Deliverables: Build step producing a JSON index per subdomain; search UI wired in `DocsLayout`.
  - Acceptance: Querying finds headings and paragraphs; index ≤ a reasonable size for fast load.
  - Dependencies: 3.2, 4.3, 5.2.

- [ ] **Hub federated search**

  - Summary: Optional aggregation endpoint that queries each subdomain’s index.
  - Deliverables: Lightweight aggregator with rate-limit handling and timeouts.
  - Acceptance: Cross-project queries return results with source labels; timeouts degrade gracefully.
  - Dependencies: 6.1.

- [ ] **Analytics**

  - Summary: Integrate privacy-friendly analytics per subdomain, key configurable in manifest.
  - Deliverables: Analytics provider abstraction; opt-out respected; DNT respected.
  - Acceptance: Events arrive for both hub and a project; no PII logged.
  - Dependencies: 3.\*, 4.2.

---

## 7) Security, QA, and governance

- [ ] **Content Security Policy**

  - Summary: Strict CSP suitable for static docs; disallow inline scripts/styles except hashed where needed.
  - Deliverables: Documented CSP and test cases.
  - Acceptance: CSP enabled; site functional; violations observable in reports.
  - Dependencies: 3.\*, 4.4.

- [ ] **Link checker and broken anchors**

  - Summary: Build step that fails on broken internal links and anchors.
  - Deliverables: Reporter integrated in CI; ignore-list for intentional external timeouts.
  - Acceptance: Intentional broken link causes CI failure; fixes pass.
  - Dependencies: 5.2.

- [ ] **Lighthouse budgets**

  - Summary: Define budgets for performance, a11y, JS/CSS weight; enforce in CI for hub and one project.
  - Deliverables: Budget file; CI job.
  - Acceptance: Over-budget build fails; regressions prevented.
  - Dependencies: 3.\*, 5.2.

- [ ] **Docs: contribution and exception policy**

  - Summary: Author “Add your project,” “Code style,” and “Exception policy” pages on hub.
  - Deliverables: Three pages with steps and screenshots where relevant.
  - Acceptance: A new maintainer can onboard a project without external help.
  - Dependencies: 3.1, 4.1–4.2.

---

## 8) Onboard first external project: `pydantic-fixturegen`

- [ ] **Define project theme**

  - Summary: Set tokens for `pydantic-fixturegen`:

    - primary `#14B8A6`, secondary `#67E8F9`, bg `#0A0F14`, surface `#0F1722`, text `#E5F4F1`, muted `#9AC7C0`, link `#2DD4BF`, code theme dark; motion `subtle`.

  - Deliverables: Theme entry under project config; logo/OG assets prepared.
  - Acceptance: Subdomain renders with project colors; contrast AA met.
  - Dependencies: 3.3.

- [ ] **Create `kitgrid.yaml` in the project repo**

  - Summary: Add manifest fields: `id`, `name`, `repo`, `ref_strategy`, `refs/default_ref`, `docs_path`, `homepage`, `nav` (optional), `features`, `analytics`.
  - Deliverables: Validated manifest committed in project repo.
  - Acceptance: Schema validation passes; CI in kitgrid recognizes and builds.
  - Dependencies: 4.2, 5.3.

- [ ] **Landing experience**

  - Summary: Use docs’ main page as the project home, with left navigation visible (Astro-docs style).
  - Deliverables: Project home using `DocsLayout`; first-screen value prop, install snippet, three CTAs (Quickstart, CLI, Configuration).
  - Acceptance: Page loads < 2s on typical broadband; nav reflects docs structure.
  - Dependencies: 3.2, 4.5.

- [ ] **Dispatch and deploy**

  - Summary: Trigger a build for a tagged release or main.
  - Deliverables: Live site at `pydantic-fixturegen.kitgrid.dev`.
  - Acceptance: Content matches project `/docs`; “Edit this page” links point to the exact ref; search works.
  - Dependencies: 5.2–5.3, 6.1.

---

## 9) Versioning and redirects

- [ ] **Publish versioned docs**

  - Summary: Enable versions via tags or `/docs/versions/**`.
  - Deliverables: Version switcher; “latest” pointer; older version retained.
  - Acceptance: URLs stable; old deep links continue to work or 301 to the right version.
  - Dependencies: 4.6, 8.4.

- [ ] **Redirects**

  - Summary: Support per-project redirect map from manifest.
  - Deliverables: Redirects applied at build; index generated.
  - Acceptance: Old paths resolve correctly; no redirect loops; 404s clear.
  - Dependencies: 4.5.

---

## 10) Global search (optional stretch)

- [ ] **Federated search UI on hub**

  - Summary: Single search box that returns results from all projects.
  - Deliverables: Result list with project labels and links.
  - Acceptance: Queries return within a sensible time; network timeouts degrade gracefully.
  - Dependencies: 6.2.

---

## 11) Operations

- [ ] **Runbooks**

  - Summary: Create short runbooks for common actions: add project, rotate keys, roll back deploy, purge cache, add redirect.
  - Deliverables: Markdown docs in repo.
  - Acceptance: A new operator can execute each task without help.
  - Dependencies: All previous.

- [ ] **Error handling drills**

  - Summary: Simulate failed fetch, schema error, and CDN origin error.
  - Deliverables: Documented outcomes and fixes.
  - Acceptance: Alarms trigger; CI and build logs are actionable; rollbacks succeed.
  - Dependencies: 4._, 5._, 2.4.

---

## 12) Acceptance gates for the whole program

- [ ] **End-to-end “green path”**

  - Summary: New project from zero to live subdomain using docs, without maintainers intervening.
  - Deliverables: Timeboxed dry-run.
  - Acceptance: All checks green on first pass; no manual DNS edits; CDN invalidations scoped.
  - Dependencies: All earlier tasks.

- [ ] **Quality bar**

  - Summary: Lighthouse ≥95 perf/a11y; search operational; CSP enforced; link checker clean; budgets met.
  - Deliverables: CI report attached to release.
  - Acceptance: Meets or exceeds thresholds; variances documented and approved.
  - Dependencies: 6._, 7._, 3.\*.

---

## Order of execution (milestones)

1. **M0** Foundations: 0._, 1._
2. **M1** Infra: 2.\*
3. **M2** Astro + Theme: 3.\*
4. **M3** Ingestion: 4.\*
5. **M4** CI/CD: 5.\*
6. **M5** Search + Analytics: 6.\*
7. **M6** Security/QA/Governance: 7.\*
8. **M7** Onboard `pydantic-fixturegen`: 8.\*
9. **M8** Versioning + Redirects: 9.\*
10. **M9** Federated search (optional): 10.\*
11. **M10** Ops and E2E acceptance: 11._, 12._

---

**Reminder:** Do not check any box until linting, formatting, and type-checks pass locally and in CI for the change being claimed as done.
