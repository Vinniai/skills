# Authoring

Skills for authoring and organizing agent knowledge itself — where things belong
and how to structure them. Add new skills as their own folder containing a
`SKILL.md`.

- **[skill-or-agents-md](./skill-or-agents-md/SKILL.md)** — decide whether a piece of agent knowledge belongs inline in `AGENTS.md`, in a docs file indexed from it, or in a skill. Works in both directions (and audits existing AGENTS.md/skills).
- **[claude-code-hooks](./claude-code-hooks/SKILL.md)** — design and configure Claude Code lifecycle hooks (PreToolUse, PostToolUse, UserPromptSubmit, SessionStart/End, Stop, …): pick the right event, write the matcher and stdin/stdout contract, and know when each hook fires. Includes a full event catalogue, copy-paste configs, and runnable script templates.

See the repo-root [`agents/`](../../agents/README.md) directory for the reference
guidance this skill draws on (the AGENTS.md eval findings and a template).
