
variable "cloudflare_account_id" {
  description = "Cloudflare Account ID"
  type        = string
  sensitive   = true
}

variable "google_idp_client_id" {
  description = "Google IdP Client Id"
  type        = string
  sensitive   = true
}

variable "google_idp_client_secret" {
  description = "Google IdP Client Secret"
  type        = string
  sensitive   = true
}

variable "worker_name" {
  description = "Worker Name"
  type        = string
  default     = "finapp"
}

variable "db_name" {
  description = "D1 Database Name"
  type        = string
  default     = "finapp-db"
}

variable "domain_name" {
  description = "Cloudflare zone apex serving the app"
  type        = string
  default     = "mcdnld.cc"
}

variable "app_subdomain" {
  description = "Subdomain the app is served from"
  type        = string
  default     = "finapp"
}

variable "allowed_emails" {
  description = "Allowed Email Addresses"
  type        = set(string)
}