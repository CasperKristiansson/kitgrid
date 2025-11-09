terraform {
  required_version = ">= 1.6.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.60"
    }
    cloudflare = {
      source  = "cloudflare/cloudflare"
      version = "~> 4.30"
    }
  }

  backend "s3" {
    bucket         = "kitgrid-terraform-state"
    key            = "kitgrid/prod/terraform.tfstate"
    region         = "us-east-1"
    profile        = "Personal"
    dynamodb_table = "kitgrid-terraform-locks"
    encrypt        = true
  }
}
