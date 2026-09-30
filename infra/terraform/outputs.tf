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