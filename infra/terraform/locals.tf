locals {
  registry_file_path = "${path.root}/../../registry.json"

  registry_entries = fileexists(local.registry_file_path) ? jsondecode(file(local.registry_file_path)) : []

  registry_docs_hosts = distinct(compact([
    for entry in local.registry_entries : try(regex("https?://([^/]+).*", entry.docs_url)[0], null)
  ]))

  managed_docs_hosts = distinct(concat(
    [var.domain_name],
    [
      for host in local.registry_docs_hosts : host
      if host == var.domain_name || endswith(host, ".${var.domain_name}")
    ]
  ))

  www_redirect_hosts = distinct([
    for host in local.managed_docs_hosts : startswith(host, "www.") ? host : "www.${host}"
  ])

  cdn_aliases = distinct(concat(var.additional_aliases, local.www_redirect_hosts))

  www_dns_records = {
    for host in local.www_redirect_hosts :
    host => trimsuffix(host, ".${var.domain_name}")
  }
}
