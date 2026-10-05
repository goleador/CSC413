#!/usr/bin/env bash
# Builds a standalone git repository for the live demo: the before/ project as
# commit "step-00", then one commit and one tag per step in steps/*.patch.
#
#   ./build-demo-repo.sh ~/Desktop/refactoring-demo
#
# Open the result in IntelliJ and refactor live. If a step goes wrong,
# `git checkout step-04` (or any step) jumps to the state after that step;
# `git checkout main` returns to the finished code.
set -euo pipefail

here="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
target="${1:-$HOME/csc413-refactoring-demo}"

if [ -e "$target" ]; then
  echo "refusing to overwrite $target" >&2
  exit 1
fi

mkdir -p "$target"
rsync -a --exclude target --exclude .idea "$here/before/" "$target/"
cd "$target"
git init -q -b main
git add -A
git commit -q -m "Step 0: before, with characterization tests"
git tag step-00

n=0
for patch in "$here"/steps/*.patch; do
  n=$((n + 1))
  git am -q "$patch"
  git tag "$(printf 'step-%02d' "$n")"
done

echo "demo repository ready at $target"
git --no-pager log --oneline --decorate
echo
echo "next: open $target in IntelliJ, ./mvnw test, and start from step-00:"
echo "  git checkout step-00    # the smelly version, on a detached HEAD"
echo "  git checkout -b live    # a branch to refactor on"
