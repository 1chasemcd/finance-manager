#!/usr/bin/env bash

set -euo pipefail

TF_STATE_BUCKET="tf-state"

if ! pnpm dlx wrangler@4 r2 bucket info "$TF_STATE_BUCKET" >/dev/null 2>&1; then
  pnpm dlx wrangler@4 r2 bucket create "$TF_STATE_BUCKET" ||
    echo "warning: could not create state bucket '$TF_STATE_BUCKET', terraform init may fail" >&2
fi

terraform -chdir=./infra/terraform init
terraform -chdir=./infra/terraform apply -auto-approve

pnpm ci

pnpm --filter @finapp/api exec wrangler types --env-interface CloudflareBindings

pnpm typecheck
pnpm lint
CLOUDFLARE_VITE_WRANGLER_CONFIG_PATH=../api/wrangler.jsonc pnpm --filter @finapp/web exec vite build

pnpm --filter @finapp/web exec wrangler deploy 
pnpm --filter @finapp/api exec wrangler d1 migrations apply DB --remote