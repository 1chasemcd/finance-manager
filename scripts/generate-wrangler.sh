#!/usr/bin/env bash

set -euo pipefail

REPO_ROOT="$(git rev-parse --show-toplevel)"

if [[ $# -ne 4 ]]; then
  echo "Usage: $0 <output> <worker_name> <db_name> <db_id>"
  exit 1
fi

template="$REPO_ROOT/scripts/wrangler.template.jsonc"
output="$1"
worker_name="$2"
db_name="$3"
db_id="$4"

if [[ ! -f "$template" ]]; then
  echo "Error: template file '$template' not found"
  exit 1
fi

sed \
  -e "s|\${worker_name}|${worker_name}|g" \
  -e "s|\${db_name}|${db_name}|g" \
  -e "s|\${db_id}|${db_id}|g" \
  "$template" > "$output"