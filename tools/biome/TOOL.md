---
name: biome
description: Lint, format, and enforce structure rules for JS/TS with Biome (one fast tool replacing ESLint + Prettier). Use to check or auto-fix code style and lint violations, gate only files changed against a base branch, or set project-wide rules via biome.json.
---

# biome

[Biome](https://biomejs.dev) is a single Rust binary that lints, formats, and
applies structure rules to JS/TS/JSON — the role ESLint + Prettier used to split.
It's our standard going forward (1,800+ uses; ESLint is being retired in favour
of it).

## When to use

- Before committing, to catch lint violations and normalise formatting.
- To **auto-fix** style + safe lint issues (`--write`).
- In CI / pre-push, to gate **only changed files** against `origin/main`.
- To define and enforce project-wide rules (see `biome.json` below).

## Quick start

```bash
tools/biome/run.sh                    # check the whole project (report only)
tools/biome/run.sh --write            # apply safe fixes (format + lint autofix)
tools/biome/run.sh --changed          # only files changed vs origin/main
tools/biome/run.sh --changed --since dev   # ...vs a different base ref
tools/biome/run.sh --error-only       # surface error-level diagnostics only
tools/biome/run.sh src/a.ts src/b.ts  # check specific paths
```

Defaults to `--max-diagnostics=200` (override with `BIOME_MAX`). Prefers the
project's local `@biomejs/biome` and falls back to bun/pnpm/yarn/npx.

## How we actually run it (from the logs)

```bash
# CI-style gate: only changed files, errors only, capped output
bunx @biomejs/biome check --changed --since=origin/main \
  --diagnostic-level=error --max-diagnostics=200

# Targeted check + autofix on the files you touched
npx biome check --write apps/dashboard/src/components/foo.tsx bar.tsx
npx biome format --write src/components/foo.tsx
npx biome lint path/to/file.tsx
```

Prefer running on the **files/paths you changed** (or `--changed`) over the whole
repo — it's faster and keeps the diagnostics relevant to your work.

## Subcommands

| Command | Does |
|---------|------|
| `biome check` | Lint **and** format check (what `run.sh` uses) |
| `biome check --write` | Apply safe fixes |
| `biome format --write` | Format only |
| `biome lint` | Lint only |

## Config — `biome.json`

Project rules live in `biome.json` at the repo root. Skeleton:

```json
{
  "$schema": "https://biomejs.dev/schemas/1.9.4/schema.json",
  "formatter": { "enabled": true, "indentStyle": "space", "indentWidth": 2 },
  "linter": {
    "enabled": true,
    "rules": {
      "recommended": true,
      "suspicious": { "noExplicitAny": "warn" }
    }
  },
  "organizeImports": { "enabled": true }
}
```

- Per-file/inline suppression: `// biome-ignore lint/<group>/<rule>: reason`.
- `--diagnostic-level=error` hides warnings — handy when a noisy rule isn't worth
  blocking on yet.

## Notes

- Biome doesn't do type checking — pair it with [typecheck](../typecheck/TOOL.md).
- Pin the `$schema` version to the Biome version the project installs so the
  config and CLI agree on available rules.
