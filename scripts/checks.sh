#!/usr/bin/env bash
set -euo pipefail

REPO_ROOT="$(git rev-parse --show-toplevel)"

pushd $REPO_ROOT > /dev/null

if [[ -n "$(git status --porcelain)" ]]; then
    echo "Error: cannot run checks when git working directory is not clean."
    exit 1
fi

./scripts/check-scripts.sh
./scripts/check-tf.sh

pnpm ci

./scripts/generate-wrangler.sh "$REPO_ROOT/apps/api/wrangler.jsonc" "ci" "ci-db" "ci"
./scripts/build-app.sh
rm "$REPO_ROOT/apps/api/wrangler.jsonc"

popd > /dev/null