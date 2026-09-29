resource "cloudflare_worker" "app" {
  account_id = var.account_id
  name       = var.worker_name

  observability = {
    enabled = false
    logs = {
      enabled = false
    }
    traces = {
      enabled = false
    }
  }

  subdomain = {
    enabled          = true
    previews_enabled = false
  }
}

resource "cloudflare_worker_version" "bootstrap" {
  account_id         = var.account_id
  worker_id          = cloudflare_worker.app.id
  main_module        = "index.js"
  compatibility_date = "2026-09-25"

  modules = [{
    name         = "index.js"
    content_type = "application/javascript+module"
    content_base64 = base64encode(<<-JS
      export default {
        async fetch() {
          return new Response("Bootstrapping", { status: 503 });
        },
      };
    JS
    )
  }]

  lifecycle {
    ignore_changes = all
  }
}

resource "cloudflare_workers_deployment" "bootstrap" {
  account_id  = var.account_id
  script_name = cloudflare_worker.app.name
  strategy    = "percentage"

  versions = [{
    version_id = cloudflare_worker_version.bootstrap.id
    percentage = 100
  }]

  lifecycle {
    ignore_changes = all
  }
}