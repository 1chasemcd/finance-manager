#!/usr/bin/env bash
set -euo pipefail

REPO_ROOT="$(git rev-parse --show-toplevel)"

pushd $REPO_ROOT > /dev/null

pnpm --dir ./apps/api exec wrangler types --env-interface CloudflareBindings
pnpm typecheck
pnpm lint
CLOUDFLARE_VITE_WRANGLER_CONFIG_PATH=$REPO_ROOT/apps/api/wrangler.jsonc pnpm --dir ./apps/web exec vite build

popd > /dev/null