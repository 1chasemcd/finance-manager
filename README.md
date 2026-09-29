Deploy plan

export CLOUDFLARE_VITE_WRANGLER_CONFIG_PATH="wranger.jsonc"

terraform init
terraform apply
wrangler types --env-interface CloudflareBindings
tsc -b && vite build
wrangler deploy --config CLOUDFLARE_VITE_WRANGLER_CONFIG_PATH
wrangler d1 migrations apply DB --config CLOUDFLARE_VITE_WRANGLER_CONFIG_PATH --remote
