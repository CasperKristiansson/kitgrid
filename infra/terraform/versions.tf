terraform {
  required_version = ">= 1.13.5"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 6.20"
    }
    cloudflare = {
      source  = "cloudflare/cloudflare"
      version = "~> 5.12"
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
