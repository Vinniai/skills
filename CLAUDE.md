# Authoring skills in this repo

Conventions for adding and maintaining skills.

## Layout

```
skills/<category>/<skill-name>/SKILL.md   # the skill itself
skills/<category>/<skill-name>/*.md       # optional supporting reference files
skills/<category>/README.md               # index of skills in the category
.claude-plugin/plugin.json                # registers each skill path
```

## Adding a skill

1. Copy `skills/engineering/example-skill/` to `skills/<category>/<your-skill>/`.
2. Edit the frontmatter `name` and `description`. The `description` is what the
   model matches against — say WHAT it does and WHEN to use it.
3. Add the skill's path to `.claude-plugin/plugin.json`.
4. Add a bullet to the category `README.md`.

## Using these skills locally

```bash
scripts/link-skills.sh   # symlinks every SKILL.md into ~/.claude/skills
scripts/list-skills.sh   # lists all SKILL.md paths in the repo
```

## Lifecycle folders

- `skills/<category>/` — active, maintained skills.
- `skills/in-progress/` — drafts not yet ready for daily use.
- `skills/deprecated/` — kept for reference; not linked by `link-skills.sh`.
