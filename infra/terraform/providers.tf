provider "aws" {
  region = var.aws_region

  default_tags {
    tags = {
      Project     = var.project_id
      Environment = var.environment
    }
  }
}

provider "cloudflare" {
  api_token = var.cloudflare_api_token
}
