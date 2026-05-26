---
name: typecheck
description: Full TypeScript type check via `tsc --noEmit`. Use as the first quality gate after editing TS/TSX — it catches type errors the linter never sees. Reports an error count and exits non-zero when the project doesn't type-check.
---

# typecheck (`tsc --noEmit`)

The most-used quality gate in our sessions (3,100+ invocations). `tsc --noEmit`
runs the TypeScript compiler in check-only mode: no JS is emitted, you just learn
whether the project type-checks.

## When to use

- Right after editing any `.ts` / `.tsx` file, before declaring work done.
- As a CI/pre-push gate alongside [biome](../biome/TOOL.md) and [vitest](../vitest/TOOL.md).
- To get a quick error *count* when chipping away at a large migration.

## Quick start

```bash
tools/typecheck/run.sh                 # type-check the project in CWD
tools/typecheck/run.sh -p packages/api # a specific tsconfig/project
tools/typecheck/run.sh --limit 100     # show up to 100 error lines (default 50)
```

The wrapper prints a one-line verdict (`✓ clean` or `✗ N error(s)`), the first
N error lines, and exits non-zero if anything failed. It prefers the project's
local `typescript` (`node_modules/.bin/tsc`) and falls back to bun/pnpm/yarn/npx.

## How we actually run it (from the logs)

```bash
npx tsc --noEmit 2>&1 | grep -c "error TS"   # just the error count
npx tsc --noEmit 2>&1 | head -40             # first errors only
npx tsc --noEmit 2>&1 | tail -20
```

In monorepos, type-check the package you touched (`-p packages/<name>`) rather
than the whole repo — it's far faster and the errors are scoped to your change.

## Notes

- `tsc --noEmit` honours the nearest `tsconfig.json`. If a project uses project
  references, point at the right one with `-p`.
- **Convex:** Convex runs its own type check during `convex dev`/`deploy`. When
  you only want to push code and check types separately, the codebase pattern is
  `convex deploy --typecheck=disable` then a standalone `tsc --noEmit`.
- This is *type* checking only. Lint/format rules live in [biome](../biome/TOOL.md);
  runtime behaviour lives in [vitest](../vitest/TOOL.md).
