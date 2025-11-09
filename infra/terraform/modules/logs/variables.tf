variable "bucket_name" {
  description = "Name of the log storage bucket."
  type        = string
}

variable "tags" {
  description = "Tags applied to log resources."
  type        = map(string)
  default     = {}
}
