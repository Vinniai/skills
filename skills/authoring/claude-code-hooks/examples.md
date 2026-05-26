# Hook examples (copy-paste)

Each shows the `settings.json` snippet and what it does. Scripts referenced as
`${CLAUDE_PROJECT_DIR}/.claude/hooks/*.sh` have runnable starting points in
[`templates/`](./templates). All snippets go under the top-level `"hooks"` key.

---

## 1. Block dangerous Bash before it runs — `PreToolUse`

The classic "pre-hook." Fires only on `Bash`, only when the command matches `rm *`;
the script exits 2 to block, or prints a `deny` decision.

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Bash",
        "hooks": [
          {
            "type": "command",
            "command": "${CLAUDE_PROJECT_DIR}/.claude/hooks/block-dangerous-bash.sh",
            "timeout": 10,
            "statusMessage": "Checking command safety…"
          }
        ]
      }
    ]
  }
}
```

Inline alternative (no script) using the `if` permission rule + a JSON deny:

```json
{
  "matcher": "Bash",
  "hooks": [
    {
      "type": "command",
      "if": "Bash(rm -rf *)",
      "command": "echo '{\"hookSpecificOutput\":{\"hookEventName\":\"PreToolUse\",\"permissionDecision\":\"deny\",\"permissionDecisionReason\":\"rm -rf is blocked by policy\"}}'"
    }
  ]
}
```

---

## 2. Lint / format after every edit — `PostToolUse`

The classic "post-hook." Runs Biome on whatever file `Edit`/`Write` just touched.
Observe-only, so it never blocks; if you want it to *force* a fix, emit
`{"decision":"block","reason":"…"}`.

```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Edit|Write",
        "hooks": [
          {
            "type": "command",
            "command": "${CLAUDE_PROJECT_DIR}/.claude/hooks/format-after-edit.sh",
            "timeout": 30,
            "statusMessage": "Formatting…"
          }
        ]
      }
    ]
  }
}
```

---

## 3. Inject live context on every prompt — `UserPromptSubmit`

Adds the current git branch and date to context without touching `CLAUDE.md`.

```json
{
  "hooks": {
    "UserPromptSubmit": [
      {
        "hooks": [
          {
            "type": "command",
            "command": "printf '{\"hookSpecificOutput\":{\"hookEventName\":\"UserPromptSubmit\",\"additionalContext\":\"branch=%s date=%s\"}}' \"$(git branch --show-current 2>/dev/null)\" \"$(date +%F)\""
          }
        ]
      }
    ]
  }
}
```

---

## 4. Load project state when a session starts — `SessionStart`

```json
{
  "hooks": {
    "SessionStart": [
      {
        "matcher": "startup|resume",
        "hooks": [
          {
            "type": "command",
            "command": "${CLAUDE_PROJECT_DIR}/.claude/hooks/load-context.sh",
            "timeout": 30
          }
        ]
      }
    ]
  }
}
```

The script prints JSON with `hookSpecificOutput.additionalContext` (see
[`templates/load-context.sh`](./templates/load-context.sh)).

---

## 5. Don't let the agent stop until tests pass — `Stop`

Use sparingly — an over-eager Stop hook can loop. Exit 2 with a reason on stderr
forces the agent to keep going.

```json
{
  "hooks": {
    "Stop": [
      {
        "hooks": [
          {
            "type": "command",
            "command": "${CLAUDE_PROJECT_DIR}/.claude/hooks/require-green-tests.sh",
            "timeout": 300,
            "statusMessage": "Verifying tests before finishing…"
          }
        ]
      }
    ]
  }
}
```

```sh
#!/usr/bin/env bash
# require-green-tests.sh — block Stop until the suite is green.
if ! npm test --silent >/tmp/claude-stop-tests.log 2>&1; then
  echo "Tests are failing — fix them before finishing. See /tmp/claude-stop-tests.log" >&2
  exit 2
fi
exit 0
```

---

## 6. Get pinged when Claude needs you — `Notification`

```json
{
  "hooks": {
    "Notification": [
      {
        "matcher": "permission_prompt|idle_prompt",
        "hooks": [
          {
            "type": "command",
            "command": "osascript -e 'display notification \"Claude needs you\" with title \"Claude Code\"'"
          }
        ]
      }
    ]
  }
}
```

(macOS shown; on Linux use `notify-send`, or POST to a Slack webhook.)

---

## 7. Auto-approve safe read-only tools — `PreToolUse`

Skip the permission prompt for tools that can't mutate anything.

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Read|Glob|Grep",
        "hooks": [
          {
            "type": "command",
            "command": "echo '{\"hookSpecificOutput\":{\"hookEventName\":\"PreToolUse\",\"permissionDecision\":\"allow\"}}'"
          }
        ]
      }
    ]
  }
}
```

---

## Notes

- Make scripts executable: `chmod +x .claude/hooks/*.sh`.
- Keep hooks **fast** — they're on the critical path of the agent loop.
- Test with `/hooks` (lists what's active) and by triggering the real action.
- Share team hooks via `.claude/settings.json` (committed); keep machine-specific ones
  in `.claude/settings.local.json` (gitignored).
