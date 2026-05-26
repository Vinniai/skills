#!/usr/bin/env bash
# vitest — run the test suite once (CI-style), or in watch mode.
# Wraps `vitest`, preferring the project's local install.
#
# Usage:
#   run.sh                       # run all tests once and exit
#   run.sh path/to/x.test.ts     # run specific files / name patterns
#   run.sh -t "handles retry"    # filter by test name
#   run.sh --watch [args]        # watch mode (re-runs on change)
#   run.sh -- <extra vitest args>
set -o pipefail

watch=0
vargs=()
while [ $# -gt 0 ]; do
  case "$1" in
    --watch) watch=1; shift ;;
    -h|--help) sed '1d' "$0" | sed -n '/^#/!q; s/^# \{0,1\}//; p'; exit 0 ;;
    --) shift; while [ $# -gt 0 ]; do vargs+=("$1"); shift; done ;;
    *) vargs+=("$1"); shift ;;
  esac
done

mode=()
[ "$watch" -eq 0 ] && mode=(run)

# Invoke a locally-installed CLI, preferring the project's own copy.
pkg_exec() {
  local bin="$1" pkg="$2"; shift 2
  if [ -x "node_modules/.bin/$bin" ]; then "node_modules/.bin/$bin" "$@"
  elif command -v bun >/dev/null 2>&1 && { [ -f bun.lock ] || [ -f bun.lockb ]; }; then bunx "$pkg" "$@"
  elif [ -f pnpm-lock.yaml ] && command -v pnpm >/dev/null 2>&1; then pnpm exec "$bin" "$@"
  elif [ -f yarn.lock ] && command -v yarn >/dev/null 2>&1; then yarn "$bin" "$@"
  else npx --yes "$pkg" "$@"; fi
}

pkg_exec vitest vitest "${mode[@]}" "${vargs[@]}"
