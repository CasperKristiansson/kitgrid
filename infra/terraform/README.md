# kitgrid infrastructure (AWS core)

This Terraform configuration provisions the AWS resources required to serve `kitgrid.dev` and `*.kitgrid.dev` via CloudFront.

## What it creates

- Private S3 bucket (`kitgrid-sites`) that stores the built hub + project sites.
- ACM certificate (us-east-1) spanning the apex + wildcard domain.
- CloudFront distribution with an Origin Access Control protecting the site bucket.
- CloudFront Function that rewrites requests:
  - `kitgrid.dev/*` → `/hub/*`
  - `<project>.kitgrid.dev/*` → `/sites/<project>/current/*`
- A small healthcheck object uploaded to S3 so the distribution always has content.

## Usage

```bash
cd infra/terraform
terraform init   # Requires Terraform >= 1.13.5
terraform plan \
  -var="domain_name=kitgrid.dev" \
  -var='additional_aliases=["*.kitgrid.dev"]' \
  -var="cloudflare_zone_id=<zone-id>"
```

Provide a Cloudflare API token (DNS edit scope) by exporting `TF_VAR_cloudflare_api_token`. Terraform will:

1. Publish the ACM validation CNAMEs so certificate issuance becomes hands-free.
2. Create/update the `kitgrid.dev` (flattened) and `*.kitgrid.dev` CNAMEs, pointing them to the CloudFront distribution.

By default these records are DNS-only so AWS terminates TLS via ACM. If you need Cloudflare’s proxy, set `-var="cloudflare_proxy=true"` and ensure CloudFront only accepts Cloudflare IP ranges.

## State & credentials

- Terraform uses an S3 backend (`kitgrid-terraform-state`, key `kitgrid/prod/terraform.tfstate`) with a DynamoDB lock table `kitgrid-terraform-locks`. Create them once before running `terraform init`.
- The AWS provider defaults to the `Personal` local profile. Override via `-var="aws_profile=<name>"` or by exporting `AWS_PROFILE`.
- Store `TF_VAR_cloudflare_api_token`, `TF_VAR_cloudflare_zone_id`, and any AWS secrets in your `.env` (already gitignored) or shell environment.

## Manual deploys

The Terraform state now manages only the shared infrastructure (S3, CloudFront, DNS).
Deploys to `kitgrid-sites` happen manually with local AWS credentials:

1. Build sites locally and stage them in `.kitgrid-cache/deploy`.
2. Copy the staged folders to `s3://kitgrid-sites`.
3. Run a CloudFront invalidation for `EKCCE2L84JCR7`.

Because there is no CI role, keep your local AWS profile configured with the minimum
permissions required to sync the bucket and invalidate CloudFront.

## Cost profile

- Access logs, WAF, and CloudWatch alarms are intentionally omitted so the baseline infra stays inexpensive. Layer them on later if budgets allow.
