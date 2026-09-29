resource "local_file" "wrangler_config" {
  filename = "${path.module}/../../apps/api/wrangler.jsonc"

  content = templatefile("${path.module}/wrangler.jsonc.tftpl", {
    worker_name = cloudflare_worker.app.name
    db_name     = cloudflare_d1_database.db.name
    db_id       = cloudflare_d1_database.db.id
  })
}