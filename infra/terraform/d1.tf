resource "cloudflare_d1_database" "db" {
  account_id = var.cloudflare_account_id
  name       = var.db_name

  read_replication = {
    mode = "disabled"
  }
}
