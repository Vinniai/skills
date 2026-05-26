---
name: vitest
description: Run the test suite with Vitest — once for CI/verification, or in watch mode while iterating. Use to verify runtime behaviour of a change, run a single test file or name pattern, and gate work alongside typecheck + biome.
---

# vitest

[Vitest](https://vitest.dev) is our test runner (670+ uses). It's Vite-native,
fast, and Jest-compatible in API. Use it to prove a change actually *behaves*
correctly — the part neither the type checker nor the linter can tell you.

## When to use

- After a behavioural change, to confirm existing tests still pass.
- To run just the file(s) related to your change while iterating.
- As the third quality gate: [typecheck](../typecheck/TOOL.md) +
  [biome](../biome/TOOL.md) + vitest.

## Quick start

```bash
tools/vitest/run.sh                          # run all tests once and exit
tools/vitest/run.sh path/to/x.test.ts        # a specific file / pattern
tools/vitest/run.sh -t "handles retry"       # filter by test name
tools/vitest/run.sh --watch                  # watch mode while iterating
```

`run.sh` defaults to `vitest run` (single pass, exits when done — correct for
agents and CI). Prefers the project's local `vitest`; falls back to bun/pnpm/yarn/npx.

## How we actually run it (from the logs)

```bash
npx vitest run __tests__/some-feature.test.ts 2>&1 | tail -40   # one file, scoped output
npx vitest run 2>&1 | tail -15                                  # whole suite
pnpm exec vitest run 2>&1 | tail -40
```

We almost always run a **specific test file** and pipe to `tail` to keep output
focused. Run the narrowest set that covers your change first; widen to the full
suite once it's green.

## Notes

- Use `run` (not bare `vitest`) anywhere non-interactive — bare `vitest` starts
  watch mode and never exits, which hangs agents/CI. The wrapper does this for you.
- `-t <pattern>` filters by test/describe name; pass a file path to scope by file.
- Coverage: `tools/vitest/run.sh --coverage` (passthrough) if the project has
  `@vitest/coverage-*` installed.
