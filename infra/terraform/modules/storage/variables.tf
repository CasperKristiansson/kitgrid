variable "bucket_name" {
  description = "Name of the S3 bucket to create."
  type        = string
}

variable "tags" {
  description = "Tags applied to every resource in this module."
  type        = map(string)
  default     = {}
}
