---
name: lefthook
description: Manage Git hooks with Lefthook — run checks (typecheck, biome, custom guards) automatically on pre-commit and pre-push, scoped to changed files and run in parallel. Use to set up or run local quality gates from lefthook.yml, debug a failing hook, or understand a repo's commit/push gating. This is the category called a "git hooks manager" / "pre-commit hooks".
---

# lefthook

[Lefthook](https://lefthook.dev) is a fast, parallel **Git hooks manager** (the
category people mean by "pre-commit hooks" / "pre-run checks"). It's the layer
that runs the *other* tools — [typecheck](../typecheck/TOOL.md),
[biome](../biome/TOOL.md), [vitest](../vitest/TOOL.md), custom guards — at commit
and push time, so failures surface locally in seconds instead of in CI.

It's the hooks manager we actually use (72 invocations; `lefthook.yml` lives in
nearly every repo). It's a single Go binary — faster and lighter than Husky, and
runs commands in parallel.

## When to use

- **Set up hooks** after cloning a repo (`install`).
- **Run a gate manually** without committing/pushing (`pre-commit`, `pre-push`).
- **Debug a failing hook** (`-v` for verbose output).
- Understand or edit what a repo gates on — read/author `lefthook.yml`.

## Quick start

```bash
tools/lefthook/run.sh install      # wire hooks into .git/hooks (once per clone)
tools/lefthook/run.sh              # run the pre-commit stage now
tools/lefthook/run.sh pre-push     # run the pre-push stage now
tools/lefthook/run.sh -v pre-push  # verbose (LEFTHOOK_VERBOSE=1)
```

A bare stage name becomes `lefthook run <stage>`; real subcommands (`install`,
`uninstall`, `run`, `validate`, `version`…) pass through unchanged. The wrapper
prefers a project-local `lefthook`, then a global one (brew / `go install`), then
bunx/pnpm/yarn/npx.

## How we actually use it (from the logs)

```bash
LEFTHOOK_VERBOSE=1 bunx lefthook run pre-push   # run + debug the push gate
cat lefthook.yml | grep -A20 "biome"            # inspect a hook definition
git push --no-verify                            # emergency bypass
```

Our pattern: a **minimal `pre-commit`** (cheap guards only) and a **heavier but
still fast (~5–20s) `pre-push`** that mirrors the cheap CI checks, scoped to
`{push_files}` so it stays in budget.

## Install

```bash
npm install --save-dev lefthook   # or pnpm/yarn/bun add -D lefthook
# or a global install:
brew install lefthook             # / go install github.com/evilmartians/lefthook@latest
```

Then `lefthook install` to write the hooks (commonly run from a `postinstall`
script so every clone is wired automatically).

## Config — `lefthook.yml`

```yaml
pre-commit:
  parallel: true
  commands:
    biome:
      glob: "*.{ts,tsx,js,jsx,json}"
      run: bunx @biomejs/biome check --diagnostic-level=error {staged_files}

pre-push:
  parallel: true
  commands:
    biome:
      glob: "*.{ts,tsx,js,jsx,json}"
      # warn-only example: show output but don't block
      run: bunx @biomejs/biome check --diagnostic-level=error {push_files} || true
    typecheck:
      # opt-in / heavier step gated behind an env flag to keep pushes fast
      run: npx tsc --noEmit
```

Key idioms from our real configs:

- **File templating:** `{staged_files}` (pre-commit), `{push_files}` (pre-push) —
  scope each command to just the relevant changed files.
- **`glob:`** filters which files a command applies to.
- **`parallel: true`** runs the commands in a stage concurrently.
- **Warn-only gate:** append `|| true` to show output without blocking (used for
  noisy pre-existing-debt checks).
- **Opt-in heavy steps:** guard with an env var (e.g. only run the typecheck when
  `LEFTHOOK_TYPECHECK=1`) so the default push stays in budget.
- **Pin the binary:** prefer `./node_modules/.bin/<tool>` in `run:` so local and
  CI resolve the same version (`bunx <tool>` can silently grab a different one).

## Notes

- Lefthook orchestrates; the actual checks are the other tools in `tools/`. Keep
  the heavy gate on `pre-push`, not `pre-commit`, so commits stay snappy.
- Escape hatch: `git commit --no-verify` / `git push --no-verify` skips hooks —
  for emergencies only.
- Alternatives in this category: **Husky** + **lint-staged** (JS-native, the
  older default) and **pre-commit** (Python framework). We standardise on Lefthook.
