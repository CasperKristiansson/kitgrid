# kitgrid infrastructure (AWS core)

This Terraform configuration provisions the AWS resources required to serve `kitgrid.dev` and `*.kitgrid.dev` via CloudFront.

## What it creates

- Private S3 bucket (`kitgrid-sites`) that stores the built hub + project sites.
- Log bucket (`kitgrid-cdn-logs`) with lifecycle rules for retention.
- ACM certificate (us-east-1) spanning the apex + wildcard domain.
- CloudFront distribution with an Origin Access Control protecting the site bucket.
- A small healthcheck object uploaded to S3 so the distribution always has content.

## Usage

```bash
cd infra/terraform
terraform init
terraform plan \
  -var="domain_name=kitgrid.dev" \
  -var='additional_aliases=["*.kitgrid.dev"]'
```

Before running `terraform apply`, create the ACM validation CNAMEs listed under the `acm_validation_records` output inside Cloudflare (or let the upcoming Cloudflare module manage them automatically). The CloudFront distribution depends on the certificate being validated, so the apply will pause until those DNS records exist.

After apply completes, point the Cloudflare DNS records for `kitgrid.dev` and `*.kitgrid.dev` to the value of the `cdn_domain` output. Remember to disable the proxy (DNS-only) so AWS terminates TLS using the ACM cert.
