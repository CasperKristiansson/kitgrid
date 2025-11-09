locals {
  apex_record = {
    name  = var.domain_name
    type  = "CNAME"
    value = module.cdn.domain_name
  }

  wildcard_record = {
    name  = "*"
    type  = "CNAME"
    value = module.cdn.domain_name
  }

  validation_records = {
    for record in module.cdn.validation_records : record.domain => record
  }
}

resource "cloudflare_record" "apex" {
  zone_id         = var.cloudflare_zone_id
  name            = local.apex_record.name
  type            = local.apex_record.type
  content         = local.apex_record.value
  ttl             = 1
  proxied         = var.cloudflare_proxy
  allow_overwrite = true
}

resource "cloudflare_record" "wildcard" {
  zone_id         = var.cloudflare_zone_id
  name            = local.wildcard_record.name
  type            = local.wildcard_record.type
  content         = local.wildcard_record.value
  ttl             = 1
  proxied         = var.cloudflare_proxy
  allow_overwrite = true
}

resource "cloudflare_record" "acm_validation" {
  for_each = local.validation_records

  zone_id         = var.cloudflare_zone_id
  name            = trimsuffix(each.value.name, ".")
  type            = each.value.type
  content         = trimsuffix(each.value.value, ".")
  ttl             = 3600
  proxied         = false
  allow_overwrite = true
}
