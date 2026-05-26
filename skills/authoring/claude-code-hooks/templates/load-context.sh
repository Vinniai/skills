#!/usr/bin/env bash
# SessionStart hook — inject project state into context at session start.
#
# Prints JSON on stdout with hookSpecificOutput.additionalContext; Claude folds that
# string into the conversation context. Keep it short (output is capped at 10k chars).
#
# settings.json:
#   "SessionStart": [{ "matcher": "startup|resume",
#     "hooks": [{ "type": "command",
#       "command": "${CLAUDE_PROJECT_DIR}/.claude/hooks/load-context.sh" }] }]

set -euo pipefail

branch="$(git branch --show-current 2>/dev/null || echo unknown)"
last_commit="$(git log -1 --format='%h %s' 2>/dev/null || echo none)"
status_count="$(git status --porcelain 2>/dev/null | wc -l | tr -d ' ')"

context="Repo state at session start:
- branch: ${branch}
- last commit: ${last_commit}
- uncommitted changes: ${status_count} file(s)"

# Emit JSON. Prefer jq for safe escaping; fall back to a minimal printf.
if command -v jq >/dev/null 2>&1; then
  jq -n --arg ctx "$context" \
    '{hookSpecificOutput: {hookEventName: "SessionStart", additionalContext: $ctx}}'
else
  esc="$(printf '%s' "$context" | sed ':a;N;$!ba;s/\n/\\n/g; s/"/\\"/g')"
  printf '{"hookSpecificOutput":{"hookEventName":"SessionStart","additionalContext":"%s"}}\n' "$esc"
fi

exit 0
