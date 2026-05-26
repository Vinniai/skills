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
tools/<tool>/TOOL.md                      # curated dev tool reference (NOT a skill)
tools/<tool>/run.sh                       # runnable wrapper for that tool
.claude-plugin/plugin.json                # registers each skill path (ours and external)
```

`tools/` is a separate, curated catalogue of dev tools (typecheck, biome, vitest,
…) — a reference doc plus a copy-pasteable `run.sh` per tool. These are **not**
skills: they aren't registered in `plugin.json` and aren't auto-loaded. See
[`tools/README.md`](./tools/README.md) for the layout and how to add one.

`agents/` holds guidance for `AGENTS.md` (the always-on project-context file) — a
do-this guide plus a copy-paste template. Also not skills; see
[`agents/README.md`](./agents/README.md). Rule of thumb: broad, always-relevant
project knowledge → `AGENTS.md`; explicitly-triggered vertical workflows → a skill.

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

## skills.sh listing

[`skills.sh.json`](./skills.sh.json) at the repo root controls how skills are
grouped on the repo's [skills.sh](https://www.skills.sh/docs/customize) page.
When you add or rename a skill, add its `name` slug to the right `groupings`
entry there too (every skill should appear in exactly one group). The repo shows
up on skills.sh once someone installs from it with the `skills` CLI.

Its `$schema` points at the in-repo [`skills.sh.schema.json`](./skills.sh.schema.json)
for editor validation — skills.sh doesn't publish a referenceable schema, so we
ship a local one mirroring the documented fields. Update that schema if the
skills.sh config format changes.

## Lifecycle folders

- `skills/<category>/` — active, maintained skills.
- `skills/in-progress/` — drafts not yet ready for daily use.
- `skills/deprecated/` — kept for reference; not linked by `link-skills.sh`.
