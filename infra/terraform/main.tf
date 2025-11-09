locals {
  merged_tags = merge({
    Project     = var.project_id,
    Environment = var.environment
  }, var.tags)
}

module "site_storage" {
  source      = "./modules/storage"
  bucket_name = var.site_bucket_name
  tags        = local.merged_tags
}

module "cdn" {
  source                  = "./modules/cdn"
  domain_name             = var.domain_name
  additional_aliases      = var.additional_aliases
  site_bucket_domain_name = module.site_storage.bucket_regional_domain_name
  site_bucket_arn         = module.site_storage.bucket_arn
  site_bucket_id          = module.site_storage.bucket_id
  hub_host                = var.domain_name
  tags                    = local.merged_tags
}

resource "aws_s3_object" "healthcheck" {
  bucket       = module.site_storage.bucket_id
  key          = var.healthcheck_key
  content_type = "text/plain"
  source       = "${path.module}/site_assets/healthcheck.txt"
  etag         = filemd5("${path.module}/site_assets/healthcheck.txt")
}

output "cdn_domain" {
  description = "The CloudFront distribution domain name. Point DNS at this value."
  value       = module.cdn.domain_name
}

output "acm_validation_records" {
  description = "CNAMEs that must be created in Cloudflare to validate the ACM certificate."
  value       = module.cdn.validation_records
}

output "site_bucket" {
  value       = module.site_storage.bucket_name
  description = "Primary S3 bucket where built sites are uploaded."
}
