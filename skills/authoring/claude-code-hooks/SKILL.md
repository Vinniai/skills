---
name: claude-code-hooks
description: Design and configure Claude Code lifecycle hooks — PreToolUse, PostToolUse, UserPromptSubmit, SessionStart/SessionEnd, Stop/SubagentStop, PreCompact, Notification, and the rest. Use when you want to gate or validate tool calls, auto-format/lint after edits, inject context at session start or on prompt submit, block dangerous commands, run a check before the agent stops, or otherwise hook into the agent loop — and you need to know which event fires when, how to match it, and the stdin/stdout contract. Trigger phrases "add a hook", "pre/post tool hook", "block a command with a hook", "run X after every edit", "which hook should I use", "claude code hooks".
---

# Claude Code hooks

Hooks are shell commands (or HTTP / MCP-tool / prompt / agent handlers) that Claude
Code runs **deterministically** at fixed points in its lifecycle. Unlike asking the
model nicely in `CLAUDE.md`, a hook *always* fires — so it's the right tool when you
need a guarantee: this command is always blocked, this file is always formatted after
an edit, this context is always loaded at session start.

> ⚠️ **Hooks execute arbitrary commands with your full user permissions, automatically.**
> You are responsible for what you configure. Review every hook before adding it, never
> paste a hook you don't understand, and avoid hooks that touch credentials or run
> untrusted input. See [Security](#security).

This is about **Claude Code lifecycle hooks**, not git hooks — for `pre-commit` /
`pre-push` git hooks use [`tools/lefthook`](../../../tools/lefthook/TOOL.md) instead.

## When to use this skill

- You're about to add or edit a hook and need to pick the right **event**.
- You want a guaranteed action (lint, block, audit, inject context) instead of a
  model instruction that might be skipped.
- A hook isn't firing and you need to check matcher syntax or the I/O contract.
- You're deciding between a hook and a `CLAUDE.md`/AGENTS.md instruction (see the
  tie-breaker below).

## Pick the event in three questions

1. **What moment do you want to act on?** A tool call? a user prompt? session
   start/end? the agent trying to stop? → that's your **event**. The full catalogue
   with "use when" for each is in [`events.md`](./events.md). The five you'll reach
   for 90% of the time:

   | Goal | Event |
   |---|---|
   | Block / validate / rewrite a tool call **before** it runs | `PreToolUse` |
   | React **after** a tool succeeds (lint, format, test, log) | `PostToolUse` |
   | Validate or enrich the user's prompt before Claude sees it | `UserPromptSubmit` |
   | Load project context / state when a session begins | `SessionStart` |
   | Force a check before the agent is allowed to finish | `Stop` (`SubagentStop` for subagents) |

2. **Do you need to block, or just observe?** Only some events can *block* on exit
   code 2 — `PreToolUse`, `UserPromptSubmit`, `Stop`, `SubagentStop`, `PreCompact`,
   `PermissionRequest`, and a few more. `PostToolUse`, `Notification`, `SessionStart`,
   `SessionEnd` etc. are observe-only (their stderr is shown but the action proceeds).
   See the exit-code table below.

3. **What should it filter on?** A `matcher` narrows when a hook fires. For
   `PreToolUse`/`PostToolUse` it matches the **tool name** (`Bash`, `Edit|Write`,
   `mcp__memory__.*`). Other events match their own dimension (`SessionStart` →
   `startup|resume|clear|compact`; `Notification` → `permission_prompt|idle_prompt`;
   …). Some events take no matcher (`UserPromptSubmit`, `Stop`, …) and always fire.

### Hook vs. CLAUDE.md / AGENTS.md

Use a **hook** when you need a *deterministic guarantee* or a *side effect* (run a
command, block an action, inject computed context). Use **AGENTS.md/CLAUDE.md** for
knowledge and conventions the model should follow but that don't need enforcement.
Rule of thumb: "must always happen / must never happen" → hook; "should generally do"
→ instruction. (This complements [`skill-or-agents-md`](../skill-or-agents-md/SKILL.md).)

## Configuration

Hooks live in settings JSON, by precedence:

| File | Scope |
|---|---|
| `~/.claude/settings.json` | User-wide, all projects (local only) |
| `.claude/settings.json` | Project-wide, **commit to share with the team** |
| `.claude/settings.local.json` | Project, local only (gitignore it) |
| managed policy settings | Org-wide, admin-controlled |
| plugin `hooks/hooks.json`, skill/agent frontmatter | While that component is active |

Shape — events map to arrays of `{ matcher, hooks[] }` groups:

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Bash",
        "hooks": [
          {
            "type": "command",
            "if": "Bash(rm *)",
            "command": "${CLAUDE_PROJECT_DIR}/.claude/hooks/block-rm.sh",
            "timeout": 10,
            "statusMessage": "Checking command safety…"
          }
        ]
      }
    ]
  },
  "disableAllHooks": false
}
```

- **Always reference scripts with `${CLAUDE_PROJECT_DIR}`** (or `${CLAUDE_PLUGIN_ROOT}`
  in a plugin) so they resolve regardless of cwd.
- **`if`** filters by a permission rule (`"Bash(git *)"`, `"Edit(*.ts)"`) — finer than
  `matcher`.
- **Handler types:** `command` (default), `http`, `mcp_tool`, `prompt`, `agent`.
  `args` switches a command to exec form (no shell). `async: true` runs in background.
- **Matcher syntax:** `*`/`""`/omitted = all; only letters/digits/`_`/`|` = exact or
  pipe list (`Edit|Write`); anything else = **regex** (`mcp__memory__.*`).

## The I/O contract (command hooks)

**stdin** — every hook receives JSON: `session_id`, `transcript_path`, `cwd`,
`permission_mode`, `hook_event_name`, plus event-specific fields (`tool_name`,
`tool_input`, `tool_response`, `prompt`, `source`, …). Parse it; don't assume argv.

**stdout + exit code** decide the outcome:

| Exit | Meaning | Effect |
|---|---|---|
| `0` | success | If stdout is valid JSON, it's parsed for control fields (below). Otherwise stdout is shown. |
| `2` | **blocking error** | stderr is fed back to Claude; the action is blocked **for events that can block** (else stderr is just shown). |
| other | non-blocking error | First line of stderr shown in transcript; execution continues. |

**JSON stdout control fields** (exit 0): universal — `continue` (false = stop the whole
turn), `stopReason`, `suppressOutput`, `systemMessage`. Event-specific live under
`hookSpecificOutput.hookEventName`:

- `PreToolUse`: `permissionDecision` = `allow|deny|ask|defer`, `permissionDecisionReason`,
  `updatedInput` (rewrite the tool input), `additionalContext`.
- `UserPromptSubmit` / `SessionStart`: `additionalContext` (injected into context);
  `UserPromptSubmit` also supports top-level `decision: "block"` + `reason`.
- `PostToolUse` / `Stop` / `SubagentStop` / `PreCompact`: `decision: "block"` + `reason`
  to send the agent back with feedback.

Full per-event input/output field lists: [`events.md`](./events.md).

## Steps to add a hook

1. **Name the trigger** in one sentence ("after every `Edit`/`Write`, run Biome").
2. **Pick the event** via the three questions above (or [`events.md`](./events.md)).
3. **Decide block vs. observe**, and the **matcher**.
4. **Write the handler.** Keep it fast (it's on the critical path), read stdin JSON,
   exit `0` to allow / `2` to block, print JSON only if you need control fields. Start
   from [`templates/`](./templates) and see [`examples.md`](./examples.md).
5. **Place the config** at the right scope (team-shared → `.claude/settings.json`).
6. **Verify** with `/hooks` (read-only menu of what's active) and a real trigger.

## Security

- Hooks run **automatically, with your credentials.** Treat adding one like running a
  script as yourself.
- Prefer `.claude/settings.json` (reviewable in PRs) over machine-local config for
  anything the team relies on; gitignore `settings.local.json`.
- Quote shell variables (`"$VAR"`), validate/escape paths from `tool_input`, and never
  `eval` untrusted input. Use exec form (`args`) to avoid shell parsing entirely.
- `disableAllHooks: true` kills all hooks fast (managed/policy hooks excepted).
- Hook output is capped at 10,000 chars; keep it terse.

## References

- [`events.md`](./events.md) — every hook event, what fires it, its matcher, whether
  it can block, and **when you'd actually use it**.
- [`examples.md`](./examples.md) — copy-paste configs for the common jobs (block
  dangerous Bash, lint after edit, load context at start, gate the Stop, audit prompts).
- [`templates/`](./templates) — runnable hook scripts to adapt.
- Official docs: https://code.claude.com/docs/en/hooks
