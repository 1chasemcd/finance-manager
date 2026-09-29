terraform {
  required_providers {
    cloudflare = {
      source  = "cloudflare/cloudflare"
      version = "~> 5"
    }
  }
}

provider "cloudflare" {
  # API token will be read from CLOUDFLARE_API_TOKEN environment variable
}

variable "account_id" {
  description = "Cloudflare Account ID"
  type        = string
  sensitive   = true
}

variable "google_idp_client_id" {
  description = "Google IdP Client Id"
  type        = string
}

variable "google_idp_client_secret" {
  description = "Google IdP Client Secret"
  type        = string
  sensitive   = true
}

variable "worker_name" {
  description = "Worker Name"
  type        =  string
  default     = "finapp"
}

variable "db_name" {
  description = "D1 Database Name"
  type        =  string
  default     = "finapp-db"
}

variable "allowed_emails" {
  description = "Allowed Email Addresses"
  type        = set(string)
}

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


resource "cloudflare_zero_trust_access_identity_provider" "google" {
  account_id = var.account_id

  name = "Google"
  type = "google"
  config = {
    client_id     = var.google_idp_client_id
    client_secret = var.google_idp_client_secret
  }
}

resource "cloudflare_zero_trust_access_policy" "allowed_emails_policy" {
  name = "Allowed Emails"
  account_id = var.account_id
  decision = "allow"
  include = [
    for email in var.allowed_emails : {
      email = {
        email = email
      }
    }
  ]
}

resource "cloudflare_zero_trust_access_application" "app" {
  account_id = var.account_id

  name   = "finapp"
  type   = "self_hosted"

  allowed_idps = [ cloudflare_zero_trust_access_identity_provider.google.id ]

  auto_redirect_to_identity = true

  destinations = [ {
    type = "worker"
    worker_id = cloudflare_worker.app.id
  } ]

  policies = [
    {
      id = cloudflare_zero_trust_access_policy.allowed_emails_policy.id,
      precedence = 1
    }
  ]
}

resource "cloudflare_d1_database" "db" {
  account_id = var.account_id
  name       = var.db_name

  read_replication = {
    mode = "disabled"
  }
}