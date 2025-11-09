# kitgrid infrastructure (AWS core)

This Terraform configuration provisions the AWS resources required to serve `kitgrid.dev` and `*.kitgrid.dev` via CloudFront.

## What it creates

- Private S3 bucket (`kitgrid-sites`) that stores the built hub + project sites.
- Log bucket (`kitgrid-cdn-logs`) with lifecycle rules for retention.
- ACM certificate (us-east-1) spanning the apex + wildcard domain.
- CloudFront distribution with an Origin Access Control protecting the site bucket.
- CloudFront Function that rewrites requests:
  - `kitgrid.dev/*` → `/hub/*`
  - `<project>.kitgrid.dev/*` → `/sites/<project>/current/*`
- A small healthcheck object uploaded to S3 so the distribution always has content.

## Usage

```bash
cd infra/terraform
terraform init
terraform plan \
  -var="domain_name=kitgrid.dev" \
  -var='additional_aliases=["*.kitgrid.dev"]' \
  -var="cloudflare_zone_id=<zone-id>"
```

Provide a Cloudflare API token (DNS edit scope) by exporting `TF_VAR_cloudflare_api_token`. Terraform will:

1. Publish the ACM validation CNAMEs so certificate issuance becomes hands-free.
2. Create/update the `kitgrid.dev` (flattened) and `*.kitgrid.dev` CNAMEs, pointing them to the CloudFront distribution.

By default these records are DNS-only so AWS terminates TLS via ACM. If you need Cloudflare’s proxy, set `-var="cloudflare_proxy=true"` and ensure CloudFront only accepts Cloudflare IP ranges.
