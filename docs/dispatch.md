# Repository Dispatch Contract

Downstream projects can trigger a kitgrid deploy by calling GitHub's
`repository_dispatch` endpoint with the event type `build-docs`.

## Payload

```json
{
  "event_type": "build-docs",
  "client_payload": {
    "project": "pydantic-fixturegen",
    "ref": "main"
  }
}
```

- `project` — matches the `id` in `registry.json`.
- `ref` — optional; defaults to `main` if omitted.

Example curl using a PAT with `repo` scope:

```bash
curl -X POST \
  -H "Accept: application/vnd.github+json" \
  -H "Authorization: Bearer $GITHUB_TOKEN" \
  https://api.github.com/repos/CasperKristiansson/kitgrid/dispatches \
  -d '{"event_type":"build-docs","client_payload":{"project":"pydantic-fixturegen","ref":"main"}}'
```

## Receiver behavior

- The `deploy` workflow now listens to `repository_dispatch` events.
- When `client_payload.project` is provided, it pulls that project's docs via
  `pnpm docs:fetch -- --project <id> --ref <ref>` before building/staging.
- After staging, it syncs updated artifacts to S3 and invalidates CloudFront.

If no payload is supplied (push/dispatch without project), the workflow falls back
to building every workspace listed in `registry.json`.
