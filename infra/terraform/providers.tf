provider "aws" {
  region = var.aws_region

  default_tags {
    tags = {
      Project     = var.project_id
      Environment = var.environment
    }
  }
}
