---
name: convex-doctor-fix
description: Detect → fix → verify loop for Convex code that combines the deterministic react-convex-doctor analyzer (finds + localizes issues, 0 cost, whole-repo, reproducible) with the convex-best-practices skill (the semantic fix for each rule) and the analyzer's own re-run as a pass/fail oracle. Use when cleaning up / fixing Convex diagnostics, after a doctor scan, when the user says "fix what the doctor found", "clean up convex issues", "raise the doctor score", or after editing convex/ functions or schema and the score regressed. The analyzer detects; this skill fixes using the right remedy and proves the fix with a re-scan.
tags: [convex, react-convex-doctor, lint, autofix, codemod, ci, backend]
---

# Convex doctor — detect → fix → verify

The deterministic analyzer [`react-convex-doctor`](https://www.npmjs.com/package/react-convex-doctor)
**finds and localizes** every encodable Convex issue across the whole repo for ~$0, reproducibly — but it
ships **no fixer** for the `convex-*` rules, because their fixes are *semantic refactors*, not token swaps.
This skill is the missing half: it fixes each finding with the remedy from [[convex-best-practices]], then
**re-runs the analyzer as a deterministic pass/fail** that the fix actually worked.

```
react-convex-doctor --json   ──▶  group by file/rule  ──▶  fix via [[convex-best-practices]]  ──▶  re-run doctor
   (detect + localize)            (triage)                  (auto-apply | propose)                (verify: count↓, score↑)
        deterministic                                            LLM + skill                          deterministic oracle
```

Why this beats either tool alone: the analyzer gives **complete recall + exact `file:line:rule`** (no
hallucinated locations, no per-file LLM cost to *find* anything); the skill gives the **correct fix**; the
re-run gives a **deterministic oracle** on the edit — "the model says it's fixed" becomes "the analyzer
confirms the count dropped." The LLM only ever edits the located sites, never reviews clean files.

## When to use

- The user asks to fix / clean up / triage Convex diagnostics, "raise the doctor score", or types
  `/convex-doctor` and wants the findings *fixed*, not just listed.
- After editing `convex/` functions or `schema.ts` and the doctor score regressed.
- As the repair stage of a CI gate: doctor blocks the build → this loop clears the blockers.
- Pair with the [`react-convex-doctor`](https://www.npmjs.com/package/react-convex-doctor) skill (scan/score
  mechanics) and [[convex-best-practices]] (the rule remedies). This skill is the bridge between them.

## The loop

1. **Scan (deterministic).** `npx react-convex-doctor@latest --json > /tmp/doctor.json`
   (or `--verbose` for inline). Capture the **score** and the findings. Use `--scope changed` for a fast
   pass on just the diff; full path for a whole-repo sweep.
2. **Triage.** Group findings by **rule**, then by **file**. Each finding carries `filePath`, `line`,
   `rule`, `message`, and a `help` doc link. **Read the flagged code before deciding** — confidence needs
   context. Mark true-positive / false-positive / needs-review. The documented exceptions are real false
   positives — e.g. `convex-no-filter-in-query` on a `.paginate()` query is **correct code** (see
   [[convex-best-practices]] rule 2); do not "fix" it.
3. **Fix** using the remedy table below. Apply the **safe/local** fixes directly; **propose a diff** for the
   **structural** ones (anything that edits `schema.ts`, adds a cron, or merges functions). Fix the
   underlying code — never suppress a rule without evidence from the file.
4. **Verify (deterministic).** Re-run `npx react-convex-doctor@latest --json --scope changed` **plus the
   project's tests**. Confirm the targeted findings are gone, the **score rose**, and **no new findings
   appeared**. This re-run is the gate — loop back to step 3 on any regression.
5. Edit the working tree only; don't commit or open PRs unless asked. List anything left unfixed with
   `rule`, `file:line`, confidence, and the proposed fix.

## Rule → remedy → apply policy

The analyzer's `convex-*` rule IDs map ~1:1 onto [[convex-best-practices]]. **Apply policy:** `AUTO` =
local, mechanically-determined, low-risk → apply directly. `PROPOSE` = non-local or needs a design decision
(touches schema / crons / cross-function) → emit a diff for approval.

| Doctor rule | best-practices rule | Fix | Apply |
|---|---|---|---|
| `convex-mutation-floating-promise`, `convex-no-floating-db-write`, `convex-no-floating-scheduler` | #1 await | add `await` | **AUTO** |
| `convex-no-filter-in-query` | #2 | `.withIndex(...)` (if an index exists) or filter in TS after a bounded `.take(n)` | AUTO if TS-filter / **PROPOSE** if a new schema index is needed |
| `convex-no-unbounded-collect` | #3 | `.withIndex` + `.paginate()`/`.take(n)`; denormalize counts | PROPOSE (often needs an index) |
| `convex-prefer-take-over-collect-length` | #3 | `.take(n)` for counts / denormalized counter | **AUTO** |
| `convex-avoid-redundant-indexes` | #4 | drop the prefix index; query the compound index, omit the trailing `.eq` | **AUTO** (low-risk schema edit) |
| `convex-no-unvalidated-args`, `convex-no-old-function-syntax` | #5 | add `args: { … v.* }` (+ `returns`) validators | AUTO once the arg shape is clear |
| `convex-require-auth-check`, `convex-no-untrusted-user-id` | #6 | derive the actor from `ctx.auth.getUserIdentity()` / the repo's `requireMembership`/`requireOrgContext`; never authorize off an id arg | **PROPOSE** (which helper / what scope is a decision) |
| `convex-crons-internal-only`, `convex-scheduler-internal-only` | #7 | convert target to `internalMutation`/`internalAction`, reference `internal.*` | PROPOSE (rename ripples to callers) |
| `convex-no-unnecessary-run-action`, `convex-no-run-action-from-mutation` | #9 | extract the body to a plain TS helper, call it directly | **AUTO** (local refactor) |
| `convex-no-sequential-ctx-run`, `convex-prefer-helpers-over-ctx-run` | #10 / #11 | merge the reads into one query (`getTeamAndOwner`) / use a plain helper | PROPOSE (cross-function) |
| `convex-no-date-now-in-query`, `convex-no-timers-in-query` | #13 | scheduled function flips an indexed `isReleased`-style boolean, **or** pass a rounded client timestamp as an arg | **PROPOSE** (schema field + cron, or a signature change) |
| `convex-no-string-function-refs`, `convex-prefer-v-id`, `convex-prefer-id-type`, `convex-prefer-convex-error`, `convex-require-returns-validator` | conventions | `api.*`/`internal.*` refs · `v.id("t")` · `Id<"t">` · `throw new ConvexError` · add `returns` validator | **AUTO** |

When a fix's worked example is non-obvious, read the matching rule in [[convex-best-practices]] (it carries
the ❌/✅ code pair and the *why*); the analyzer finding also links the canonical `docs.convex.dev` page.

## Non-local fixes — propose, don't blind-apply

Two of the highest-value rules require touching more than the flagged line — handle them as **proposals**:

- **`convex-no-date-now-in-query` (#13).** The flagged query is the *symptom*; the fix adds a boolean field
  to `schema.ts`, an index on it, and a scheduled function (cron) to flip it — *or* changes the query's
  signature to take a client timestamp. Which one, and what flips the flag, is a design decision. Emit the
  full multi-file diff (query + `schema.ts` + cron) and let a human approve; the doctor re-run still
  verifies whichever lands.
- **`convex-no-filter-in-query` / `convex-no-unbounded-collect` (#2/#3)** when no suitable index exists: the
  fix adds an index to `schema.ts`. Propose the index + the rewritten query together.

Everything in the **AUTO** bucket is safe to apply directly because it's local and mechanically determined,
and the re-run + tests catch any miss.

## Repo-scale (optional)

For a whole-backend cleanup, the deterministic detection feeds a parallel LLM repair fleet: one scan
locates every site; fan out **one fixer per file** (each gets only that file's findings + this skill);
re-run the doctor once at the end and report the **score delta** (e.g. 52 → N). This is the multi-agent
workflow variant — only worth the LLM cost on a real backlog; for a single diff, the inline loop above is
enough. (See the repo's `convex-multi-lens-review` workflow for the fan-out pattern.)

## What this loop does *not* fix

The analyzer only flags **encodable** rules. The *semantic* defects it can't express — aggregates computed
over a `.take(n)`-truncated read, `x !== false` counting `undefined`, double-counted buckets, a wrong proxy
field — won't appear in `doctor.json`, so this loop won't surface them. Those need an LLM **review** pass
([[convex-best-practices]] applied directly, or the multi-lens workflow), not a fix-the-findings loop. Use
both: this loop to clear everything the analyzer can prove, an LLM review for the judgment it can't.
