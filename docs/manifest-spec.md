# Kitgrid Manifest Spec

Projects expose a `kitgrid.yaml` file inside their `/docs` directory so the hub knows how
to fetch, theme, and publish documentation. This file MUST satisfy the JSON Schema at
`/schemas/kitgrid-manifest.schema.json`.

Run the validator locally:

```bash
pnpm manifest:check -- --file docs/kitgrid.yaml
```

## Top-level fields

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `id` | string (`pydantic-fixturegen`) | ✅ | Kebab-case identifier used for subdomains and cache folders. |
| `name` | string | ✅ | Human readable title. |
| `repo` | `org/name` | ✅ | GitHub repo that owns the docs. |
| `ref_strategy` | `branch | tags | manual` | ✅ | Governs how kitgrid discovers refs during builds. |
| `refs.default` | string | ✅ | Branch or tag served at `/current`. |
| `refs.include` | string[] | optional | Additional refs (tags/releases) to build alongside the default. |
| `docs_path` | string (`docs`) | ✅ | Relative path holding Markdown/MDX sources. |
| `homepage` | string | ✅ | Entry document (relative to repo root). |
| `nav` | array | optional | Explicit sidebar tree. Each entry has `title`, `path`, and optional `children`. |
| `theme` | object | ✅ | Color tokens + motion scale (see below). |
| `features` | object | optional | Toggles for `edit_link`, `search`, `versions`, `last_updated`. |
| `analytics` | object | optional | Provider metadata (e.g., Plausible or Umami IDs). |

### Theme fields

All color fields accept 3- or 6-digit hex values.

| Field | Purpose |
| --- | --- |
| `primary`, `secondary` | Accent colors for CTAs and interactive components. |
| `bg`, `surface` | Page background + cards. |
| `text`, `muted`, `link` | Typography tokens. |
| `code_theme` | Highlight.js/Prism theme slug consumed by the renderer. |
| `motion` | `none`, `subtle`, or `lively` to scale animation easing/duration. |

## Example manifest

See [`examples/pydantic-fixturegen/kitgrid.yaml`](../examples/pydantic-fixturegen/kitgrid.yaml) for a full example that passes the schema and powers the hub cards today.

## Validation behavior

- The schema ships with the repo at `schemas/kitgrid-manifest.schema.json`.
- The CLI (`pnpm manifest:check`) loads YAML, validates it with AJV, and lists every
  failing path with context.
- CI will run the same command so a malformed manifest never reaches `main`.
