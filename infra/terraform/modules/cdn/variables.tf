variable "domain_name" {
  description = "Primary domain for the CloudFront distribution."
  type        = string
}

variable "additional_aliases" {
  description = "Additional alternate domain names."
  type        = list(string)
  default     = []
}

variable "site_bucket_domain_name" {
  description = "Regional domain name of the S3 origin bucket."
  type        = string
}

variable "site_bucket_arn" {
  description = "ARN of the S3 origin bucket."
  type        = string
}

variable "site_bucket_id" {
  description = "Bucket ID used for policies."
  type        = string
}

variable "logs_bucket_name" {
  description = "Bucket domain name where CloudFront should write logs."
  type        = string
}

variable "tags" {
  description = "Tags applied to CDN resources."
  type        = map(string)
  default     = {}
}

variable "comment" {
  description = "Optional CloudFront distribution comment."
  type        = string
  default     = "kitgrid docs distribution"
}
