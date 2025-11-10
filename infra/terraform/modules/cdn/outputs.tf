output "distribution_id" {
  value = aws_cloudfront_distribution.this.id
}

output "domain_name" {
  value = aws_cloudfront_distribution.this.domain_name
}

output "acm_certificate_arn" {
  value = aws_acm_certificate.this.arn
}

locals {
  validation_domains = distinct(concat([var.domain_name], var.additional_aliases))

  validation_record_groups = {
    for option in aws_acm_certificate.this.domain_validation_options :
    (startswith(option.domain_name, "*.") ? substr(option.domain_name, 2, length(option.domain_name) - 2) : option.domain_name) => option...
  }

  validation_records_by_apex = {
    for apex, records in local.validation_record_groups : apex => {
      domain = records[0].domain_name
      name   = records[0].resource_record_name
      type   = records[0].resource_record_type
      value  = records[0].resource_record_value
    }
  }
}

output "validation_records" {
  description = "DNS records required to validate the ACM certificate."
  value       = values(local.validation_records_by_apex)
}

output "validation_records_by_apex" {
  description = "Map of apex hostnames to their ACM validation DNS record."
  value       = local.validation_records_by_apex
}

output "aliases" {
  description = "All aliases attached to the CloudFront distribution."
  value       = local.aliases
}
