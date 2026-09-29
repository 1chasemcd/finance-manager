terraform {
  backend "s3" {
    bucket = "tf-state"
    key    = "finapp/terraform.tfstate"
    region = "auto"
    endpoints = {
      s3 = "https://ff5dfeb3a30f63fdfd7981683612eff6.r2.cloudflarestorage.com"
    }
    use_path_style              = true
    skip_credentials_validation = true
    skip_requesting_account_id  = true
    skip_region_validation      = true
    skip_metadata_api_check     = true
  }

  required_providers {
    cloudflare = {
      source  = "cloudflare/cloudflare"
      version = "~> 5"
    }
    local = {
      source  = "hashicorp/local"
      version = "~> 2.5"
    }
  }
}

provider "cloudflare" {
  # API token will be read from CLOUDFLARE_API_TOKEN environment variable
}