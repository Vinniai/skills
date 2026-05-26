#!/usr/bin/env bash
# PreToolUse hook (matcher: "Bash") — block destructive shell commands.
#
# Reads the hook JSON from stdin, pulls out the Bash command, and denies a small
# blocklist. Exit 2 blocks the call and feeds the stderr message back to Claude.
# Adjust the PATTERNS list to taste.
#
# settings.json:
#   "PreToolUse": [{ "matcher": "Bash",
#     "hooks": [{ "type": "command",
#       "command": "${CLAUDE_PROJECT_DIR}/.claude/hooks/block-dangerous-bash.sh" }] }]

set -euo pipefail

input="$(cat)"

# Extract the command. Prefer jq; fall back to a grep if jq is unavailable.
if command -v jq >/dev/null 2>&1; then
  cmd="$(printf '%s' "$input" | jq -r '.tool_input.command // ""')"
else
  cmd="$(printf '%s' "$input" | grep -o '"command"[[:space:]]*:[[:space:]]*"[^"]*"' | head -1 | sed 's/.*:[[:space:]]*"//; s/"$//')"
fi

# Patterns to refuse (extended regex). Keep this conservative and readable.
PATTERNS=(
  'rm[[:space:]]+(-[a-zA-Z]*[rf][a-zA-Z]*[[:space:]]+)+'   # rm -rf and friends
  'git[[:space:]]+push[[:space:]]+.*--force'                # force push
  '>[[:space:]]*/dev/sd[a-z]'                               # writing to a raw disk
  ':\(\)\s*\{.*\|.*&\s*\}'                                  # fork bomb
  'mkfs\.'                                                  # formatting a filesystem
)

for p in "${PATTERNS[@]}"; do
  if printf '%s' "$cmd" | grep -Eq "$p"; then
    echo "Blocked by block-dangerous-bash.sh: command matches /$p/ — '$cmd'" >&2
    exit 2
  fi
done

exit 0
