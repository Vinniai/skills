#!/usr/bin/env bash
# fallow — codebase intelligence for TS/JS (https://github.com/fallow-rs/fallow).
# Rust-native static analysis: unused code (exports/deps/files/types),
# duplication, circular deps, complexity hotspots, architecture boundaries.
# Wraps the `fallow` CLI, preferring a local or globally-installed binary.
#
# Usage:
#   run.sh                       # audit changed files (fast PR-style gate)
#   run.sh dead-code             # unused exports / deps / files / types
#   run.sh dupes                 # duplicate / copy-paste logic
#   run.sh health --score        # whole-repo health report + score
#   run.sh fix --dry-run         # preview automated cleanup (no writes)
#   run.sh watch                 # re-analyze on file changes
#   run.sh <subcommand> [args]   # any fallow subcommand / flags pass through
#
# With no arguments it runs `fallow audit`.
set -o pipefail

args=("$@")
if [ ${#args[@]} -eq 0 ]; then
  args=(audit)
fi
case "${1:-}" in
  -h|--help) sed '1d' "$0" | sed -n '/^#/!q; s/^# \{0,1\}//; p'; exit 0 ;;
esac

# Resolve the fallow binary: project-local, then global (cargo install
# fallow-cli), then via the project's package manager.
if [ -x "node_modules/.bin/fallow" ]; then
  exec "node_modules/.bin/fallow" "${args[@]}"
elif command -v fallow >/dev/null 2>&1; then
  exec fallow "${args[@]}"
elif command -v bun >/dev/null 2>&1 && { [ -f bun.lock ] || [ -f bun.lockb ]; }; then
  exec bunx fallow "${args[@]}"
elif [ -f pnpm-lock.yaml ] && command -v pnpm >/dev/null 2>&1; then
  exec pnpm exec fallow "${args[@]}"
elif [ -f yarn.lock ] && command -v yarn >/dev/null 2>&1; then
  exec yarn fallow "${args[@]}"
else
  exec npx --yes fallow "${args[@]}"
fi
