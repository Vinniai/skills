# Authoring skills in this repo

Conventions for adding and maintaining skills.

## Layout

Skills we author live under `skills/`; third-party skills we've vendored live
under `external/`. Keep that split — it's how we distinguish ours from others.

```
skills/<category>/<skill-name>/SKILL.md   # our skill
skills/<category>/<skill-name>/*.md       # optional supporting reference files
skills/<category>/README.md               # index of skills in the category
external/<group>/<skill-name>/SKILL.md    # vendored third-party skill (+ its LICENSE)
external/README.md                        # index of all external skills
.claude-plugin/plugin.json                # registers each skill path (ours and external)
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

## Vendored skills

The `agent-sim/` and `agent-emulate/` categories are copied from the sibling
repos `../agent-sim/skills/` and `../agent-emulate/skills/`. Don't hand-edit
their `SKILL.md` files — edit the source repo, then re-sync:

```bash
scripts/sync-vendored-skills.sh   # re-copy both trees; flags unregistered skills
```

The category `README.md` files are repo-authored and preserved by the sync.
Override source paths with `AGENT_SIM_SRC` / `AGENT_EMULATE_SRC`.

### External (third-party) skills

Everything under `external/` is vendored from public repos via the `skills` CLI.
Each keeps its own `LICENSE` (and `NOTICE.md` where required) inside the skill
folder — keep those intact. They are *not* handled by `sync-vendored-skills.sh`;
refresh each by re-running its `skills add` command and re-copying the files.
See [`external/README.md`](./external/README.md) for the full table.

| Skill | Path | Source / refresh command | License |
|-------|------|--------------------------|---------|
| `impeccable` | `external/design/impeccable` | `npx skills add pbakaus/impeccable` | Apache 2.0 |
| `handoff` | `external/productivity/handoff` | `npx skills add https://github.com/mattpocock/skills --skill handoff` | MIT |
| `grill-with-docs` | `external/engineering/grill-with-docs` | `npx skills add https://github.com/mattpocock/skills --skill grill-with-docs` | MIT |
| `agent-browser` | `external/agent-browser` | `npx skills add https://github.com/vercel-labs/agent-browser --skill agent-browser` | Apache 2.0 |
| `portless` | `external/portless` | `npx skills add vercel-labs/portless` | Apache 2.0 |

## Lifecycle folders

- `skills/<category>/` — active, maintained skills.
- `skills/in-progress/` — drafts not yet ready for daily use.
- `skills/deprecated/` — kept for reference; not linked by `link-skills.sh`.
