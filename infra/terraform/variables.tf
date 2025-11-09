variable "project_id" {
  description = "Short identifier used for tagging and resource names."
  type        = string
  default     = "kitgrid"
}

variable "environment" {
  description = "Deployment environment label."
  type        = string
  default     = "prod"
}

variable "aws_region" {
  description = "Primary AWS region for the stack (must be us-east-1 for CloudFront certs)."
  type        = string
  default     = "us-east-1"
}

variable "domain_name" {
  description = "Primary domain served by CloudFront."
  type        = string
  default     = "kitgrid.dev"
}

variable "additional_aliases" {
  description = "Extra alternate domain names (e.g. wildcard)."
  type        = list(string)
  default     = ["*.kitgrid.dev"]
}

variable "site_bucket_name" {
  description = "Name of the S3 bucket that stores built sites."
  type        = string
  default     = "kitgrid-sites"
}

variable "logs_bucket_name" {
  description = "Name of the S3 bucket that stores CloudFront/S3 access logs."
  type        = string
  default     = "kitgrid-cdn-logs"
}

variable "tags" {
  description = "Additional tags to merge onto every resource."
  type        = map(string)
  default     = {}
}

variable "healthcheck_key" {
  description = "Object key used for the CDN healthcheck file."
  type        = string
  default     = "healthcheck.txt"
}
