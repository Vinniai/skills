#!/usr/bin/env bash
# PostToolUse hook (matcher: "Edit|Write") — format the file that was just changed.
#
# Reads the hook JSON from stdin, pulls out .tool_input.file_path, and runs the
# project formatter on it. Observe-only: a non-zero exit shows a note but does not
# block. Swap the formatter line for prettier/ruff/gofmt as needed.
#
# settings.json:
#   "PostToolUse": [{ "matcher": "Edit|Write",
#     "hooks": [{ "type": "command",
#       "command": "${CLAUDE_PROJECT_DIR}/.claude/hooks/format-after-edit.sh" }] }]

set -euo pipefail

input="$(cat)"

if command -v jq >/dev/null 2>&1; then
  file="$(printf '%s' "$input" | jq -r '.tool_input.file_path // ""')"
else
  file="$(printf '%s' "$input" | grep -o '"file_path"[[:space:]]*:[[:space:]]*"[^"]*"' | head -1 | sed 's/.*:[[:space:]]*"//; s/"$//')"
fi

[ -z "$file" ] && exit 0
[ -f "$file" ] || exit 0

# Biome (this org's formatter). Resolve from node_modules first, then bunx/npx.
if [ -x "node_modules/.bin/biome" ]; then
  node_modules/.bin/biome format --write "$file" >/dev/null 2>&1 || true
elif command -v bunx >/dev/null 2>&1; then
  bunx @biomejs/biome format --write "$file" >/dev/null 2>&1 || true
elif command -v npx >/dev/null 2>&1; then
  npx --yes @biomejs/biome format --write "$file" >/dev/null 2>&1 || true
fi

exit 0
