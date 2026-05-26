#!/usr/bin/env bash
# typecheck — full TypeScript type check via `tsc --noEmit`.
# Reports the error count and the first N errors, then exits non-zero if any.
# Run from a directory that has a tsconfig.json (or pass -p <project>).
#
# Usage:
#   run.sh                      # type-check the project in the current dir
#   run.sh -p packages/api      # type-check a specific tsconfig/project
#   run.sh --limit 100          # print up to 100 error lines (default 50)
#   run.sh -- <extra tsc args>  # pass anything else straight to tsc
#
# Env:
#   TYPECHECK_LIMIT   max error lines to print (default 50)
set -o pipefail

limit="${TYPECHECK_LIMIT:-50}"
tsc_args=(--noEmit)

while [ $# -gt 0 ]; do
  case "$1" in
    --limit) limit="$2"; shift 2 ;;
    -h|--help) sed '1d' "$0" | sed -n '/^#/!q; s/^# \{0,1\}//; p'; exit 0 ;;
    --) shift; while [ $# -gt 0 ]; do tsc_args+=("$1"); shift; done ;;
    *) tsc_args+=("$1"); shift ;;
  esac
done

# Invoke a locally-installed CLI, preferring the project's own copy.
pkg_exec() {
  local bin="$1" pkg="$2"; shift 2
  if [ -x "node_modules/.bin/$bin" ]; then "node_modules/.bin/$bin" "$@"
  elif command -v bun >/dev/null 2>&1 && { [ -f bun.lock ] || [ -f bun.lockb ]; }; then bunx "$pkg" "$@"
  elif [ -f pnpm-lock.yaml ] && command -v pnpm >/dev/null 2>&1; then pnpm exec "$bin" "$@"
  elif [ -f yarn.lock ] && command -v yarn >/dev/null 2>&1; then yarn "$bin" "$@"
  else npx --yes "$pkg" "$@"; fi
}

out="$(pkg_exec tsc typescript "${tsc_args[@]}" 2>&1)"
status=$?
count="$(printf '%s\n' "$out" | grep -c 'error TS')"

if [ "$status" -eq 0 ]; then
  echo "✓ typecheck clean (0 errors)"
  exit 0
fi

if [ "$count" -eq 0 ]; then
  # tsc itself failed to run (bad config, not installed, etc.) — surface it raw.
  echo "✗ typecheck failed to run:"
  printf '%s\n' "$out" | head -n "$limit"
  exit "$status"
fi

echo "✗ typecheck: $count error(s)"
echo "----"
printf '%s\n' "$out" | grep 'error TS' | head -n "$limit"
extra=$(( count - limit ))
if [ "$extra" -gt 0 ]; then echo "… +$extra more (raise --limit to see them)"; fi
exit 1
