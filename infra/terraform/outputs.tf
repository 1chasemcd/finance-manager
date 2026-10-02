output "worker_name" {
  description = "The Worker name"
  value       = cloudflare_worker.app.name
}

output "db_id" {
  description = "The D1 database ID"
  value       = cloudflare_d1_database.db.id
}

output "db_name" {
  description = "The D1 database name"
  value       = cloudflare_d1_database.db.name
}

output "app_url" {
  description = "The public URL of the app"
  value       = "https://${local.app_hostname}"
}

output "access_app_aud_tag" {
  description = "The audience tag for the cloudflare access application"
  value = cloudflare_zero_trust_access_application.app.aud
}

output "zt_team_domain" {
  description = "The team domain of the cloudflare zero trust organization"
  value = cloudflare_zero_trust_organization.team.auth_domain
}