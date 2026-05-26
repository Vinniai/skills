#!/usr/bin/env bash
# lefthook — fast, parallel Git hooks manager (https://lefthook.dev).
# Wires your checks (typecheck, biome, guards…) to run on pre-commit / pre-push,
# defined in lefthook.yml. Wraps the `lefthook` CLI, preferring a local or
# globally-installed binary.
#
# Usage:
#   run.sh install             # wire git hooks into .git/hooks (run once per clone)
#   run.sh                     # run the pre-commit stage now
#   run.sh pre-push            # run the pre-push stage now
#   run.sh -v pre-push         # verbose (sets LEFTHOOK_VERBOSE=1)
#   run.sh uninstall           # remove the git hooks
#   run.sh <subcommand> [args] # any lefthook subcommand passes straight through
#
# A bare stage name (pre-commit, pre-push, commit-msg, …) is run via
# `lefthook run <stage>`. With no arguments it runs the pre-commit stage.
# Escape hatch when a hook blocks you: `git push --no-verify`.
set -o pipefail

KNOWN=" install uninstall run add version validate dump self-update check "
verbose=0
args=()
while [ $# -gt 0 ]; do
  case "$1" in
    -v|--verbose) verbose=1; shift ;;
    -h|--help) sed '1d' "$0" | sed -n '/^#/!q; s/^# \{0,1\}//; p'; exit 0 ;;
    *) args+=("$1"); shift ;;
  esac
done

if [ ${#args[@]} -eq 0 ]; then
  args=(run pre-commit)
else
  case "$KNOWN" in
    *" ${args[0]} "*) : ;;                 # already a lefthook subcommand
    *) args=(run "${args[@]}") ;;          # bare stage name → `run <stage>`
  esac
fi

[ "$verbose" -eq 1 ] && export LEFTHOOK_VERBOSE=1

# Resolve the lefthook binary: project-local, then global (brew / go install),
# then via the project's package manager.
if [ -x "node_modules/.bin/lefthook" ]; then
  exec "node_modules/.bin/lefthook" "${args[@]}"
elif command -v lefthook >/dev/null 2>&1; then
  exec lefthook "${args[@]}"
elif command -v bun >/dev/null 2>&1 && { [ -f bun.lock ] || [ -f bun.lockb ]; }; then
  exec bunx lefthook "${args[@]}"
elif [ -f pnpm-lock.yaml ] && command -v pnpm >/dev/null 2>&1; then
  exec pnpm exec lefthook "${args[@]}"
elif [ -f yarn.lock ] && command -v yarn >/dev/null 2>&1; then
  exec yarn lefthook "${args[@]}"
else
  exec npx --yes lefthook "${args[@]}"
fi
