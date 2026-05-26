#!/usr/bin/env bash
# biome — lint + format + structure checks for JS/TS (https://biomejs.dev).
# Wraps `@biomejs/biome check`, preferring the project's local install.
#
# Usage:
#   run.sh                       # check the whole project (report only)
#   run.sh --write               # apply safe fixes (format + lint autofix)
#   run.sh --changed             # only files changed vs base (default origin/main)
#   run.sh --changed --since dev # ...vs an explicit base ref
#   run.sh src/a.ts src/b.ts     # check specific paths
#   run.sh --write src/a.ts      # fix specific paths
#   run.sh --error-only          # only surface error-level diagnostics
#
# Any unrecognised --flag is passed straight through to biome.
#
# Env:
#   BIOME_SINCE   base ref for --changed (default: origin/main)
#   BIOME_MAX     --max-diagnostics value (default: 200)
set -o pipefail

since="${BIOME_SINCE:-origin/main}"
max="${BIOME_MAX:-200}"
changed=0
flags=()
paths=()

while [ $# -gt 0 ]; do
  case "$1" in
    --write) flags+=(--write); shift ;;
    --changed) changed=1; shift ;;
    --since) since="$2"; shift 2 ;;
    --error-only) flags+=(--diagnostic-level=error); shift ;;
    -h|--help) sed '1d' "$0" | sed -n '/^#/!q; s/^# \{0,1\}//; p'; exit 0 ;;
    --*) flags+=("$1"); shift ;;   # passthrough biome flag
    *) paths+=("$1"); shift ;;
  esac
done

flags+=(--max-diagnostics="$max")
if [ "$changed" -eq 1 ]; then
  flags+=(--changed --since="$since")
elif [ ${#paths[@]} -eq 0 ]; then
  paths+=(.)
fi

# Invoke a locally-installed CLI, preferring the project's own copy.
pkg_exec() {
  local bin="$1" pkg="$2"; shift 2
  if [ -x "node_modules/.bin/$bin" ]; then "node_modules/.bin/$bin" "$@"
  elif command -v bun >/dev/null 2>&1 && { [ -f bun.lock ] || [ -f bun.lockb ]; }; then bunx "$pkg" "$@"
  elif [ -f pnpm-lock.yaml ] && command -v pnpm >/dev/null 2>&1; then pnpm exec "$bin" "$@"
  elif [ -f yarn.lock ] && command -v yarn >/dev/null 2>&1; then yarn "$bin" "$@"
  else npx --yes "$pkg" "$@"; fi
}

pkg_exec biome @biomejs/biome check "${flags[@]}" "${paths[@]}"
