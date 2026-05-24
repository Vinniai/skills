# skills

Reusable Claude Code skills, maintained by Vinniai.

## Structure

Each skill is a folder with a `SKILL.md`, grouped by category under `skills/`.
Skills are registered in [`.claude-plugin/plugin.json`](./.claude-plugin/plugin.json).

```
skills/
  engineering/
    README.md
    example-skill/
      SKILL.md
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

## Categories

- **[engineering](./skills/engineering/README.md)** — skills for code work.
- **[agent-sim](./skills/agent-sim/README.md)** — drive iOS simulators headlessly via the `agent-sim` CLI.
- **[agent-emulate](./skills/agent-emulate/README.md)** — local drop-in API emulators (`npx agent-emulate`) for Vercel, GitHub, Google, Slack, AWS, Stripe, and more.

## Documentation

- **[abcdefg workflow](./docs/abcdefg.html)** — standalone HTML page documenting the seven-phase feature workflow (open in a browser).

---

Structure inspired by [mattpocock/skills](https://github.com/mattpocock/skills) (MIT).
