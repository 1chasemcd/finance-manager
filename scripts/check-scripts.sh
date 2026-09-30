#!/usr/bin/env bash
set -euo pipefail

REPO_ROOT="$(git rev-parse --show-toplevel)"

pushd $REPO_ROOT > /dev/null

failed=0

while IFS= read -r -d '' file; do
    echo "Checking $file"
    if ! bash -n "$file"; then
        failed=1
    fi
done < <(find $REPO_ROOT/scripts -type f -name '*.sh' -print0)

exit "$failed"

popd > /dev/null