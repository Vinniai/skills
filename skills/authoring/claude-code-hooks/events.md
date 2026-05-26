# Hook events — what fires each, and when you'd use it

Grouped by cadence. For each: **fires when**, **matcher** (what you can filter on),
**can block?** (does exit code 2 stop the action), and **use it when**.

The events you'll reach for most are starred (★). The long tail below them is real but
niche — skim it once, reach for it when you have the specific need.

---

## On every tool call (the agent loop)

### ★ PreToolUse
- **Fires:** right before a tool call executes.
- **Matcher:** tool name — `Bash`, `Edit|Write`, `Read`, `mcp__memory__.*`, `*`.
- **Can block:** **yes.** Exit 2 (or `permissionDecision: "deny"`) blocks the call and
  feeds the reason back to Claude; `"allow"` skips the permission prompt; `"ask"` forces
  one; `updatedInput` rewrites the arguments before the call runs.
- **Use it when:** you must **gate or sanitize** an action before it happens — block
  `rm -rf` / `git push --force`, deny edits to `.env` or `package-lock.json`, require a
  ticket reference, auto-approve safe read-only tools, or rewrite a command (inject
  `--dry-run`). The classic "pre-hook."

### ★ PostToolUse
- **Fires:** after a tool call **succeeds**.
- **Matcher:** tool name.
- **Can block:** no — but `decision: "block"` + `reason` sends the agent back with
  feedback to try again.
- **Use it when:** you want a **guaranteed reaction** to a change — format/lint the file
  after every `Edit`/`Write`, run `tsc`/tests after code changes, append to an audit log,
  regenerate types, or bounce the agent back if the edit broke the build. The classic
  "post-hook."

### PostToolUseFailure
- **Fires:** after a tool call **fails**. Matcher: tool name. Cannot block.
- **Use it when:** you want to capture or react to failures specifically — log the error,
  surface a hint ("Bash failed — did you forget to `cd`?"), or collect flaky-command stats.

### PostToolBatch
- **Fires:** after a batch of **parallel** tool calls all resolve. No matcher. Cannot block.
- **Use it when:** you need to act once after a fan-out (e.g. re-index after several writes)
  rather than once per call.

### PermissionRequest
- **Fires:** when a permission dialog is about to appear. Matcher: tool name. Can block.
- **Use it when:** you want to **programmatically answer permission prompts** — auto-allow a
  known-safe pattern, deny a class outright, or attach allow/deny rules — instead of a human
  clicking each time.

### PermissionDenied
- **Fires:** when a tool call is denied by the auto-mode classifier. Matcher: tool name.
  Cannot block, but can return `retry: true`.
- **Use it when:** you want to tell the model it may retry a denied call, or log what auto-mode
  is rejecting.

---

## Once per turn

### ★ UserPromptSubmit
- **Fires:** when the user submits a prompt, **before** Claude processes it. No matcher.
- **Can block:** **yes** (`decision: "block"` + `reason`, or exit 2).
- **Use it when:** you want to **validate or enrich the prompt** — inject current context
  (git branch, open ticket, today's date), block prompts that violate policy, redact
  secrets, or set the session title. `additionalContext` is the cleanest way to add context
  every turn without bloating `CLAUDE.md`.

### UserPromptExpansion
- **Fires:** when a slash command / skill expands into a prompt. Matcher: command name.
  Can block (stops the expansion).
- **Use it when:** you want to gate or augment specific slash commands before they run.

### ★ Stop
- **Fires:** when Claude finishes responding (about to end the turn). No matcher.
- **Can block:** **yes** — exit 2 / `decision: "block"` forces the agent to keep working.
- **Use it when:** you want a **completion gate** — don't let the turn end until tests pass,
  the changelog is updated, or a checklist is done. Powerful, but use sparingly: a too-eager
  Stop hook can trap the agent in a loop.

### StopFailure
- **Fires:** when a turn ends due to an API error (rate limit, auth, billing). Matcher: error
  type. Output ignored. **Use it when:** you want to notify/alert on hard failures.

### SubagentStart / ★ SubagentStop
- **Fire:** when a subagent (Task) is spawned / finishes. Matcher: agent type
  (`general-purpose`, `Explore`, `Plan`, custom). `SubagentStop` can block.
- **Use it when:** you want per-subagent setup/teardown or a completion gate scoped to
  subagents. (A `Stop` hook in agent frontmatter auto-converts to `SubagentStop`.)

---

## Once per session

### ★ SessionStart
- **Fires:** when a session begins or resumes. Matcher: `startup|resume|clear|compact`.
  Cannot block.
- **Use it when:** you want to **prime the session** — load project state, recent issues,
  current sprint, or env vars (via `CLAUDE_ENV_FILE`) into context with `additionalContext`.
  The dependable place to put "things Claude should know on every session."

### SessionEnd
- **Fires:** when a session terminates. Matcher: end reason (`clear|logout|prompt_input_exit|…`).
  Cannot block.
- **Use it when:** you want **cleanup or persistence** — stop a dev server, flush logs, save a
  scratchpad, post a session summary.

### Setup
- **Fires:** with `--init`/`--init-only`/`--maintenance` in `-p` mode. Matcher: `init|maintenance`.
- **Use it when:** scripting first-run project initialization or maintenance in headless mode.

---

## Context / compaction

### PreCompact
- **Fires:** before context compaction. Matcher: `manual|auto`. **Can block.**
- **Use it when:** you want to **preserve state across a compaction** — write key facts to a
  file, or block an auto-compact at a bad moment.

### PostCompact
- **Fires:** after compaction completes. Matcher: `manual|auto`. Cannot block.
- **Use it when:** you want to **re-inject** the state you saved in `PreCompact` so it survives.

---

## Notifications & idle

### Notification
- **Fires:** when Claude Code sends a notification. Matcher: `permission_prompt|idle_prompt|auth_success`.
  Cannot block.
- **Use it when:** you want **custom alerting** — desktop/Slack ping when Claude needs
  permission or has gone idle so you can step away from the terminal.

### TeammateIdle
- **Fires:** when an agent-team teammate is about to go idle. No matcher. Can block.
- **Use it when:** orchestrating agent teams — hand a teammate more work before it idles.

---

## Tasks, files, config, worktrees (niche)

| Event | Fires when | Matcher | Block? | Use it when |
|---|---|---|---|---|
| `TaskCreated` / `TaskCompleted` | a task is created / marked done | none | yes | sync tasks to an external tracker; gate completion |
| `InstructionsLoaded` | `CLAUDE.md` / `.claude/rules/*.md` is loaded | load reason | no | audit / dynamically adjust which instructions apply |
| `ConfigChange` | a config file changes mid-session | config source | yes | react to or veto live settings changes |
| `CwdChanged` | working directory changes | none | no | reload env / re-init tooling for the new dir |
| `FileChanged` | a watched file changes on disk | filenames to watch | no | react to external edits (`.env`, generated files) |
| `WorktreeCreate` / `WorktreeRemove` | a git worktree is created / removed | none | create: yes | provision/clean a worktree; return its path |
| `Elicitation` / `ElicitationResult` | an MCP server requests / receives user input | MCP server name | no | auto-answer or log MCP elicitation prompts |

---

## Quick "I want to… → use" index

| I want to… | Event |
|---|---|
| Block a dangerous command before it runs | `PreToolUse` |
| Auto-format / lint / test after a file change | `PostToolUse` |
| Add live context (branch, ticket, date) to every prompt | `UserPromptSubmit` |
| Load project state when a session starts | `SessionStart` |
| Clean up / persist when a session ends | `SessionEnd` |
| Refuse to let the agent stop until a check passes | `Stop` / `SubagentStop` |
| Auto-answer permission prompts | `PermissionRequest` |
| Get pinged when Claude needs me or goes idle | `Notification` |
| Keep state across compaction | `PreCompact` + `PostCompact` |
| React to failed tool calls only | `PostToolUseFailure` |
