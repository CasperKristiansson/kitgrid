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
}

resource "cloudflare_record" "apex" {
  zone_id = var.cloudflare_zone_id
  name    = local.apex_record.name
  type    = local.apex_record.type
  value   = local.apex_record.value
  ttl     = 1
  proxied = var.cloudflare_proxy
}

resource "cloudflare_record" "wildcard" {
  zone_id = var.cloudflare_zone_id
  name    = local.wildcard_record.name
  type    = local.wildcard_record.type
  value   = local.wildcard_record.value
  ttl     = 1
  proxied = var.cloudflare_proxy
}

resource "cloudflare_record" "acm_validation" {
  for_each = { for record in module.cdn.validation_records : record.name => record }

  zone_id = var.cloudflare_zone_id
  name    = regexreplace(each.value.name, "\\.$", "")
  type    = each.value.type
  value   = regexreplace(each.value.value, "\\.$", "")
  ttl     = 3600
  proxied = false
}
