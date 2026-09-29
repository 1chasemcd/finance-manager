resource "cloudflare_zero_trust_access_identity_provider" "google" {
  account_id = var.cloudflare_account_id

  name = "Google"
  type = "google"
  config = {
    client_id     = var.google_idp_client_id
    client_secret = var.google_idp_client_secret
  }
}

resource "cloudflare_zero_trust_access_policy" "allowed_emails_policy" {
  name = "Allowed Emails"
  account_id = var.cloudflare_account_id
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
  account_id = var.cloudflare_account_id

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