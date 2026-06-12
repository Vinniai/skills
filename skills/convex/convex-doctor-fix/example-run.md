# Worked example — detect → fix → verify on the Convex Next.js template

A concrete run of the [`SKILL.md`](./SKILL.md) loop against the official Convex Next.js starter
(`react-convex-doctor`'s bundled `examples/convex-nextjs`). Demonstrates the deterministic oracle moving the
score, and the AUTO-vs-PROPOSE policy in action.

## 1. Detect (deterministic, ~1.7s, $0)

```bash
npx react-convex-doctor@latest examples/convex-nextjs --json
```

**Score 94/100 ("Good")** — 5 Convex findings in `convex/myFunctions.ts`:

| line | rule | best-practices rule | class |
|------|------|---------------------|-------|
| 32 | `convex-require-auth-check` | #6 access control | AUTO* |
| 53 | `convex-require-auth-check` | #6 access control | AUTO* |
| 68 | `convex-no-api-self-call` | #7 / conventions (self-ref via public `api`) | AUTO |
| 74 | `convex-no-api-self-call` | #7 / conventions | AUTO |
| 74 | `convex-no-sequential-ctx-run` | #10 | **PROPOSE** |

\* auth on a starter is technically a judgment call; here we treat "public mutation/action writes with no
identity check" as a clear fix and add `ctx.auth.getUserIdentity()` + `ConvexError`.

## 2. Fix (LLM + [[convex-best-practices]])

- **`require-auth-check` (×2):** add `const id = await ctx.auth.getUserIdentity(); if (!id) throw new
  ConvexError("Not signed in");` to `addNumber` and `myAction`.
- **`no-api-self-call` (×2):** the action referenced its own module through the **public** `api` object.
  Add `internalQuery` / `internalMutation` siblings (`listNumbersInternal`, `addNumberInternal`) and call
  them via `internal.myFunctions.*`. (An action can't use `ctx.db` directly, so the fix is internal
  function refs — not a plain helper.)
- **`no-sequential-ctx-run`:** **left as-is, flagged for review.** The action's read (`listNumbers`) and
  write (`addNumber`) are *independent* demo operations; merging them into one transaction would be
  artificial and change the example's intent. The loop proposes, it does not force.

## 3. Verify (deterministic oracle)

```bash
npx react-convex-doctor@latest examples/convex-nextjs --json   # re-run
```

| | before | after |
|---|:---:|:---:|
| **Score** | 94 | **98** |
| Convex findings (`myFunctions.ts`) | 5 | **1** |
| `convex-require-auth-check` | 2 | **0** |
| `convex-no-api-self-call` | 2 | **0** |
| `convex-no-sequential-ctx-run` | 1 | 1 *(intentional / proposed)* |

**+4 score, 4 of 5 findings cleared, and zero new findings introduced** — the re-run is the pass/fail gate
on the edit. Had the internal wrappers tripped another rule (e.g. a missing `returns` validator), the
oracle would have surfaced it; it didn't, so the fix is clean.

## Takeaways

- The loop turns "the model says it fixed it" into "the analyzer confirms 5 → 1 and 94 → 98" — a
  deterministic gate the LLM can't fake.
- **AUTO** fixes (auth check, public→internal refs) applied directly and verified; the **PROPOSE** finding
  (sequential `ctx.run`) was correctly left flagged rather than force-merged — judgment stays with a human.
- Detection cost $0 and 1.7s; the LLM only edited the located sites. No clean file was reviewed, nothing
  hallucinated. (The example was restored after the run — this is a demonstration, not a committed change
  to the template.)
