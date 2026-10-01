locals {
  app_hostname = "${var.app_subdomain}.${var.domain_name}"
}

data "cloudflare_zone" "app" {
  filter = {
    match = "all"
    name  = var.domain_name
    account = {
      id = var.cloudflare_account_id
    }
  }
}

resource "cloudflare_workers_custom_domain" "app" {
  account_id = var.cloudflare_account_id
  zone_id    = data.cloudflare_zone.app.zone_id
  hostname   = local.app_hostname
  service    = cloudflare_worker.app.name
}
