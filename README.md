# skills

Reusable Claude Code skills, maintained by Vinniai.

[![View on skills.sh](https://img.shields.io/badge/skills.sh-Vinniai%2Fskills-1f6feb)](https://www.skills.sh/Vinniai/skills)

Browse them on **[skills.sh/Vinniai/skills](https://www.skills.sh/Vinniai/skills)**, or pull them in with the [`skills`](https://www.skills.sh) CLI:

```bash
npx skills add Vinniai/skills            # choose skills from this repo
npx skills add Vinniai/skills --list     # just list what's available
```

> The skills.sh page populates once the repo is first installed from with the `skills` CLI.

## Structure

Each skill is a folder with a `SKILL.md`. Skills we author live under `skills/`;
third-party skills we've vendored live under `external/`. All are registered in
[`.claude-plugin/plugin.json`](./.claude-plugin/plugin.json).

```
skills/        # our own skills, grouped by category
  engineering/
    README.md
    example-skill/
      SKILL.md
external/       # third-party skills, vendored (each keeps its upstream LICENSE)
  README.md
  design/impeccable/
  agent-browser/
tools/          # curated dev tools (not skills): a reference doc + run.sh wrapper each
  README.md
  biome/
    TOOL.md
    run.sh
agents/         # guidance for AGENTS.md (the always-on project context file)
  README.md
  writing-agents-md.md
  AGENTS.template.md
scripts/
  link-skills.sh           # symlink every skill into ~/.claude/skills
  list-skills.sh           # list all SKILL.md paths
  sync-vendored-skills.sh  # re-copy agent-sim / agent-emulate from sibling repos
```

## Quick start

```bash
# Make skills available to your local Claude CLI
scripts/link-skills.sh

# See what's in the repo
scripts/list-skills.sh
```

See [CLAUDE.md](./CLAUDE.md) for authoring conventions.

## Our skills

- **[engineering](./skills/engineering/README.md)** — skills for code work (`abcdefg`, `example-skill`).
- **[authoring](./skills/authoring/README.md)** — organize agent knowledge: decide skill vs `AGENTS.md` vs docs index (`skill-or-agents-md`), and configure Claude Code lifecycle hooks (`claude-code-hooks`).
- **[agent-sim](./skills/agent-sim/README.md)** — drive iOS simulators headlessly via the `agent-sim` CLI.
- **[agent-emulate](./skills/agent-emulate/README.md)** — local drop-in API emulators (`npx agent-emulate`) for Vercel, GitHub, Google, Slack, AWS, Stripe, and more.
- **[taskr](./skills/taskr/README.md)** — integrate with the Taskr platform from the outside via its REST API (`taskr-api`) and the `taskr` CLI/MCP server (`taskr-cli`).
- **[compliance](./skills/compliance/README.md)** — implement a regulatory standard as structured, testable data (`compliance-standards`).

## Tools

Curated dev tools — a reference doc plus a runnable `run.sh` wrapper each. Not
skills (not auto-loaded); see **[tools/README.md](./tools/README.md)**. Together
they form our standard quality gate: **typecheck → biome → vitest**.

- **[typecheck](./tools/typecheck/TOOL.md)** — full TypeScript type check (`tsc --noEmit`).
- **[biome](./tools/biome/TOOL.md)** — lint + format + structure rules (replaces ESLint + Prettier).
- **[vitest](./tools/vitest/TOOL.md)** — run the test suite once or in watch mode.
- **[fallow](./tools/fallow/TOOL.md)** — dead/unused code, duplication, circular deps, complexity (Rust-native).
- **[lefthook](./tools/lefthook/TOOL.md)** — Git hooks manager; runs the checks above on pre-commit / pre-push.

## Agents

Guidance for **`AGENTS.md`** — the project-root file injected into a coding
agent's context every turn. In [Vercel's evals][agents-post] it beat skills
(100% vs 79% vs 53% baseline), so it's a first-class practice here. See
**[agents/README.md](./agents/README.md)** for the findings, a do-this guide, and
a copy-paste template. (Use `AGENTS.md` for broad always-on knowledge; reserve
skills for explicitly-triggered workflows.)

[agents-post]: https://vercel.com/blog/agents-md-outperforms-skills-in-our-agent-evals

## External skills

Third-party skills we've vendored — see **[external/README.md](./external/README.md)** for sources, licenses, and refresh commands.

- **impeccable** (design) — distinctive, production-grade frontend interfaces.
- **handoff** (productivity) — compact a conversation into a handoff doc.
- **grill-with-docs** (engineering) — challenge a plan against the domain model.
- **agent-browser** (tooling) — browser automation CLI for AI agents.
- **portless** (tooling) — named local dev-server URLs over trusted HTTPS.

## Documentation

- **[abcdefg workflow](./docs/abcdefg.html)** — standalone HTML page documenting the seven-phase feature workflow (open in a browser).

---

Structure inspired by [mattpocock/skills](https://github.com/mattpocock/skills) (MIT).
