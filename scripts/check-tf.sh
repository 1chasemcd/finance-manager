#!/usr/bin/env bash
set -euo pipefail

REPO_ROOT="$(git rev-parse --show-toplevel)"

pushd $REPO_ROOT/infra/terraform > /dev/null

terraform init -backend=false
terraform validate
terraform fmt -check -recursive

popd > /dev/null