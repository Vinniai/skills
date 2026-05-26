# Example prompts

Prompts you can give the agent that naturally exercise the tools in this directory.
Each shows the **prompt** (what you'd type) and the **wrapper** it should reach for.
The agent reads the tool's `TOOL.md`, then runs the matching `run.sh` (which resolves
bun/pnpm/yarn/npx for you). Copy a prompt, adjust the paths, go.

---

## typecheck — `tools/typecheck/run.sh`

> Type-check the project and fix whatever `tsc` reports.

→ `tools/typecheck/run.sh`, then edits to clear each `error TS…`.

> I just edited `packages/api` — type-check only that package, not the whole monorepo.

→ `tools/typecheck/run.sh -p packages/api`

> How many type errors are left in this migration? Give me a count, not the full dump.

→ `tools/typecheck/run.sh --limit 0` (or the logged `tsc --noEmit | grep -c "error TS"`).

> Before we call this done, run the type check and don't stop until it's clean.

→ `tools/typecheck/run.sh` on a loop until it exits `✓ clean`.

---

## biome — `tools/biome/run.sh`

> Lint and format the files I changed and auto-fix what's safe.

→ `tools/biome/run.sh --changed --write`

> Run Biome on just `src/components/foo.tsx` and `bar.tsx` and apply fixes.

→ `tools/biome/run.sh --write src/components/foo.tsx bar.tsx`

> CI-style gate: only files changed vs `origin/main`, errors only, capped output.

→ `tools/biome/run.sh --changed --error-only`

> Set up a `biome.json` for this repo: 2-space indent, organize imports, warn on `any`.

→ writes the `biome.json` skeleton from `biome/TOOL.md`, then `tools/biome/run.sh` to verify.

---

## vitest — `tools/vitest/run.sh`

> Run the tests for the retry logic I just changed.

→ `tools/vitest/run.sh path/to/retry.test.ts` (or `-t "retry"` to filter by name).

> Run the whole suite once and show me just the failures.

→ `tools/vitest/run.sh` (defaults to `vitest run`; pipe-to-tail keeps output focused).

> Watch the auth tests while I iterate on the fix.

→ `tools/vitest/run.sh --watch path/to/auth.test.ts`

> Add a test for the empty-input case, then run it until it's green.

→ writes the test, then `tools/vitest/run.sh -t "empty input"` on a loop.

---

## fallow — `tools/fallow/run.sh`

> Sweep this repo for dead code I can delete — unused exports, deps, files, types.

→ `tools/fallow/run.sh dead-code`

> Audit just the files this PR changed for new risk.

→ `tools/fallow/run.sh` (bare = `fallow audit`, the PR-style gate).

> Where's the worst duplication in this codebase?

→ `tools/fallow/run.sh dupes`

> Give me a health score and the top refactor targets.

→ `tools/fallow/run.sh health --score --hotspots --targets`

> Preview what an automated cleanup would remove — don't change anything yet.

→ `tools/fallow/run.sh fix --dry-run` (review candidates before dropping `--dry-run`).

---

## lefthook — `tools/lefthook/run.sh`

> I just cloned this repo — wire up the git hooks.

→ `tools/lefthook/run.sh install`

> Run the pre-commit checks now, without actually committing.

→ `tools/lefthook/run.sh` (bare = `run pre-commit`).

> The pre-push hook is failing and I can't tell why — run it verbosely.

→ `tools/lefthook/run.sh -v pre-push`

> Add a `lefthook.yml`: Biome on staged files at pre-commit, typecheck at pre-push.

→ authors `lefthook.yml` from `lefthook/TOOL.md`, then `tools/lefthook/run.sh install`.

---

## Combined workflows

The first three tools are the standard gate; fallow is the periodic sweep; lefthook
automates them at commit/push time.

> Run the full quality gate on my changes: typecheck, then Biome, then the tests.

→ `tools/typecheck/run.sh` → `tools/biome/run.sh --changed --write` →
`tools/vitest/run.sh` (stop and report at the first failure).

> Get this branch ready for a PR.

→ typecheck (clean) → `biome --changed --write` → `vitest run` (green) →
`fallow audit` on the changed files → summarize what's left.

> Quarterly cleanup: find dead code and duplication, then make sure deleting it
> doesn't break types or tests.

→ `tools/fallow/run.sh dead-code` + `dupes` → remove safe candidates →
`tools/typecheck/run.sh` + `tools/vitest/run.sh` to confirm nothing broke.

> Set up this repo's local gates so failures show up before CI.

→ author `lefthook.yml` (Biome + typecheck) → `tools/lefthook/run.sh install` →
`tools/lefthook/run.sh pre-push` to confirm the gate passes.
