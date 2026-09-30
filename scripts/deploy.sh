#!/usr/bin/env bash
set -euo pipefail

REPO_ROOT="$(git rev-parse --show-toplevel)"

pushd $REPO_ROOT > /dev/null

TF_STATE_BUCKET="tf-state"

if ! pnpm dlx wrangler@4 r2 bucket info "$TF_STATE_BUCKET" >/dev/null 2>&1; then
    echo "warning: could not create state bucket '$TF_STATE_BUCKET', terraform init may fail" >&2
fi


terraform -chdir=./infra/terraform init
terraform -chdir=./infra/terraform apply -auto-approve

worker_name="$(terraform -chdir=./infra/terraform output -raw db_name)"
db_name="$(terraform -chdir=./infra/terraform output -raw db_name)"
db_id="$(terraform -chdir=./infra/terraform output -raw db_id)"

pnpm ci

./scripts/generate-wrangler.sh "$REPO_ROOT/apps/api/wrangler.jsonc" "$worker_name" "$db_name" "$db_id"
./scripts/build-app.sh

pnpm --filter @finapp/web exec wrangler deploy 
pnpm --filter @finapp/api exec wrangler d1 migrations apply DB --remote

popd > /dev/null