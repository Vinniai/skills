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
  link-skills.sh   # symlink every skill into ~/.claude/skills
  list-skills.sh   # list all SKILL.md paths
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

---

Structure inspired by [mattpocock/skills](https://github.com/mattpocock/skills) (MIT).
