# Tools

Curated dev tools we reach for across projects, each with a short reference doc
and a runnable wrapper. These are **not skills** — they aren't registered in
`plugin.json` and the model doesn't auto-load them. They're a shared, grounded
reference (the commands here come from our actual session history) plus
copy-pasteable `run.sh` wrappers that encode our preferred flags.

```
tools/
  <tool>/
    TOOL.md    # what it does, when to use it, real commands, config
    run.sh     # executable wrapper encoding our preferred flags
```

## The tools

- **[typecheck](./typecheck/TOOL.md)** — full TypeScript type check (`tsc --noEmit`). The first quality gate after editing TS/TSX.
- **[biome](./biome/TOOL.md)** — lint + format + structure rules in one fast tool (replaces ESLint + Prettier).
- **[vitest](./vitest/TOOL.md)** — run the test suite once (CI-style) or in watch mode.
- **[fallow](./fallow/TOOL.md)** — codebase intelligence: dead/unused code, duplication, circular deps, complexity hotspots (Rust-native).
- **[lefthook](./lefthook/TOOL.md)** — Git hooks manager: runs the checks below automatically on pre-commit / pre-push.

The first three form the standard quality gate — **typecheck → biome → vitest** —
that judges code you keep. **fallow** is the periodic sweep that finds code you
can delete. **lefthook** is the automation layer that runs these at commit/push
time so failures surface locally, not in CI.

## Running the wrappers

Each `run.sh` is self-contained and resolves how to invoke the underlying CLI in
this order, so it works whether the repo uses bun, pnpm, yarn, or npm:

1. the project's local binary (`node_modules/.bin/<tool>`)
2. `bunx` (if a bun lockfile is present)
3. `pnpm exec` (if `pnpm-lock.yaml`)
4. `yarn` (if `yarn.lock`)
5. `npx --yes` (fallback)

```bash
tools/biome/run.sh --help        # every wrapper documents itself
tools/typecheck/run.sh
tools/vitest/run.sh path/to/x.test.ts
```

Run them from the project root you want to operate on (the wrapper inspects the
current directory for lockfiles and `node_modules`).

## Adding a tool

1. Create `tools/<tool>/` with a `TOOL.md` (frontmatter `name` + `description`,
   then: when to use, quick start, real commands, config, notes) and a `run.sh`.
2. Make the script executable: `chmod +x tools/<tool>/run.sh`.
3. Keep `run.sh` self-contained (embed the `pkg_exec` resolver) so it can be
   lifted into any repo, and add a `-h/--help` header block.
4. Add a bullet to the list above.

## Candidates not yet added

- **knip** — JS-native unused files/exports/types/deps finder (supersedes
  ts-prune + depcheck + unimported). Mostly covered by **fallow** now; add only
  if we want a pure-JS toolchain without the Rust binary.
