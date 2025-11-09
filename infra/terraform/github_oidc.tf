data "aws_caller_identity" "current" {}

data "aws_partition" "current" {}

resource "aws_iam_openid_connect_provider" "github" {
  url = "https://token.actions.githubusercontent.com"

  client_id_list  = var.github_oidc_audiences
  thumbprint_list = var.github_oidc_thumbprints
}

data "aws_iam_policy_document" "github_assume_role" {
  statement {
    actions = ["sts:AssumeRoleWithWebIdentity"]
    effect  = "Allow"

    principals {
      type        = "Federated"
      identifiers = [aws_iam_openid_connect_provider.github.arn]
    }

    condition {
      test     = "StringEquals"
      variable = "token.actions.githubusercontent.com:aud"
      values   = var.github_oidc_audiences
    }

    condition {
      test     = "StringLike"
      variable = "token.actions.githubusercontent.com:sub"
      values   = var.github_trusted_subjects
    }
  }
}

resource "aws_iam_role" "github_ci" {
  name               = var.deploy_role_name
  assume_role_policy = data.aws_iam_policy_document.github_assume_role.json

  tags = {
    Project     = var.project_id
    Environment = var.environment
  }
}

data "aws_iam_policy_document" "deploy" {
  statement {
    sid     = "BucketList"
    effect  = "Allow"
    actions = ["s3:ListBucket"]
    resources = [
      module.site_storage.bucket_arn,
    ]
  }

  statement {
    sid    = "BucketObjects"
    effect = "Allow"
    actions = [
      "s3:GetObject",
      "s3:PutObject",
      "s3:PutObjectAcl",
      "s3:DeleteObject",
      "s3:AbortMultipartUpload",
      "s3:ListMultipartUploadParts"
    ]
    resources = [
      "${module.site_storage.bucket_arn}/*",
    ]
  }

  statement {
    sid     = "InvalidateCdn"
    effect  = "Allow"
    actions = ["cloudfront:CreateInvalidation"]
    resources = [
      "arn:${data.aws_partition.current.partition}:cloudfront::${data.aws_caller_identity.current.account_id}:distribution/${module.cdn.distribution_id}"
    ]
  }
}

resource "aws_iam_policy" "deploy" {
  name   = "${var.project_id}-deploy"
  policy = data.aws_iam_policy_document.deploy.json
}

resource "aws_iam_role_policy_attachment" "deploy" {
  role       = aws_iam_role.github_ci.name
  policy_arn = aws_iam_policy.deploy.arn
}

output "deploy_role_arn" {
  description = "IAM role assumed by GitHub Actions via OIDC."
  value       = aws_iam_role.github_ci.arn
}
