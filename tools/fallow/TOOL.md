---
name: fallow
description: Codebase intelligence for TypeScript/JavaScript — finds dead/unused code (exports, deps, files, types), duplication, circular dependencies, and complexity hotspots. Use to sweep a repo for dormant code to delete, audit a PR's changed files, or surface architecture/dependency-hygiene issues. Rust-native and fast; deterministic (non-AI) so it's safe in CI.
---

# fallow

[`fallow`](https://github.com/fallow-rs/fallow) is a Rust-native static analysis
engine that treats a TS/JS repo as a system: it connects structure, dependencies,
duplication, complexity, and architecture into one report. It's the tool that
fills our long-standing **dead-code gap** — and goes further than a pure
unused-code finder.

The name fits: a *fallow* field is land left dormant — fallow finds the code
that's lying unused so you can clear it.

## When to use

- **Delete dead code:** find unused exports, dependencies, files, and types.
- **PR gate:** audit just the changed files for new risk (`audit`).
- **De-duplicate:** locate copy-paste / duplicate logic (`dupes`).
- **Health check:** score the repo, list complexity hotspots and refactor targets.
- Spotting circular dependencies and architecture-boundary violations.

It targets TS/JS (104+ framework plugins — Next, Nuxt, Remix, Vue, React,
Angular, NestJS, …) and is deterministic (no LLM), so it's reproducible in CI.

## Quick start

```bash
tools/fallow/run.sh                 # audit changed files (fast PR-style gate)
tools/fallow/run.sh dead-code       # unused exports / deps / files / types
tools/fallow/run.sh dupes           # duplicate / copy-paste logic
tools/fallow/run.sh health --score  # whole-repo health report + score
tools/fallow/run.sh fix --dry-run   # preview automated cleanup (no writes)
```

With no args it runs `fallow audit`. The wrapper resolves the binary in this
order: project-local (`node_modules/.bin/fallow`) → a globally installed
`fallow` (e.g. `cargo install fallow-cli`) → bunx/pnpm/yarn/npx.

## Install

```bash
npm install --save-dev fallow      # or pnpm/yarn/bun add -D fallow
# or, for a global Rust install:
cargo install fallow-cli
```

It's zero-config to start; `npx fallow audit` works without setup.

## Common subcommands

| Command | Does |
|---------|------|
| `fallow audit` | Audit changed files for new risk (PR-oriented) |
| `fallow dead-code` | Cleanup candidates: unused exports/deps/files/types |
| `fallow dupes` | Duplicate / copy-paste detection |
| `fallow health --score --hotspots --targets` | Repo health score + refactor targets |
| `fallow fix --dry-run` | Preview automated cleanup (drop `--dry-run` to apply) |
| `fallow watch` | Re-analyze on file changes |

## Notes

- Always preview cleanup with `fix --dry-run` and eyeball the candidates before
  applying — "unused" exports can still be public API or referenced dynamically.
- Free static layer covers everything above. There's an optional paid runtime
  layer (production hot-/cold-path evidence) — not needed for static sweeps.
- Complements the rest of the gate: [typecheck](../typecheck/TOOL.md) and
  [biome](../biome/TOOL.md) judge code you keep; fallow finds code you can remove.
