#!/usr/bin/env bash

set -euo pipefail

terraform -chdir=./infra/terraform init
terraform -chdir=./infra/terraform apply -auto-approve

pnpm ci

pnpm --filter @finapp/api exec wrangler types --env-interface CloudflareBindings

pnpm typecheck
pnpm lint
CLOUDFLARE_VITE_WRANGLER_CONFIG_PATH=../api/wrangler.jsonc pnpm --filter @finapp/web exec vite build

pnpm --filter @finapp/web exec wrangler deploy 
pnpm --filter @finapp/api exec wrangler d1 migrations apply DB --remote --yes