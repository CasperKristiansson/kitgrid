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
  validation_records_grouped = {
    for option in aws_acm_certificate.this.domain_validation_options : option.resource_record_name => option...
  }

  validation_records_unique = [
    for _, records in local.validation_records_grouped : {
      domain = records[0].domain_name
      name   = records[0].resource_record_name
      type   = records[0].resource_record_type
      value  = records[0].resource_record_value
    }
  ]
}

output "validation_records" {
  description = "DNS records required to validate the ACM certificate."
  value       = local.validation_records_unique
}
