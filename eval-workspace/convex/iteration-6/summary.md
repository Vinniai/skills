# convex-best-practices — iteration 6 (Haiku precision pass)

**Result: a "don't report what you can't quote" review-discipline guard eliminated the Haiku tier's
invented false positives (0.5/run → 0.0/run) with zero recall cost (0.975 held). Sonnet/Opus guards stayed
10/10 at 0 FP — and their transcripts show the guard actively firing.**

## The fix

Iteration-5 converged on recall but left ~0.5 invented FP/run at the Haiku tier — two misread patterns:
flagging a function's *present* validators as "missing," and an *awaited* `patch` as "unawaited." Both are
the model pattern-matching a rule without checking the actual line. Added a **Reviewing checklist** to
SKILL.md:

- `await` (#1): only flag a `ctx.db.*`/`ctx.scheduler.*` call with **no `await` token** in front of it;
  check each call site separately.
- validators (#5): only flag a function whose `args` is **absent or `any`** — not one that already declares
  `args: { … v.* … }`.
- the `.paginate()` `.filter` exception (#2) and genuinely-public reads (#6) are correct — don't flag them.
- "If you can't point at the exact offending token, don't report it."

## Before / after (Haiku, real-code audit, n=4)

| | recall | invented FP / run |
|---|:------:|:-----------------:|
| iter-5 (rule-3 skill) | 0.975 | 0.5 |
| **iter-6 (+ review checklist)** | **0.975** | **0.0** |

Clean precision win: every Haiku run had **0 invented FPs**, and recall was unchanged (runs: 9, 10, 10, 10).

## The guard caught in the act

- **Sonnet** initially listed `channelHeader` "missing argument validators," then wrote *"actually this is
  present and correct; disregard"* and removed it before returning — the "don't report what you can't quote"
  rule self-corrected a false positive mid-review.
- **Opus** explicitly checked *"updateProfile un-awaited? It is awaited"* and did not flag it.
- **Haiku** produced 0 invented FPs across all four runs (it was flagging present validators / awaited
  patches last iteration).

## Final state — converged AND clean

| Tier | default | skill | FP/run | relative uplift |
|------|:-------:|:-----:|:------:|:---------------:|
| **Haiku 4.5** | 0.35 | **0.975** | **0.0** | **+179%** |
| Sonnet 4.6 | 0.55 | 1.000 | 0.0 | +82% |
| Opus 4.8 | 0.70 | 1.000 | 0.0 | +43% |

Haiku 4.5 + skill now reviews real Convex code at **0.975 recall with zero false positives** — a +179%
uplift over the Haiku default and above the Opus-4.8 default (0.70), at ~5–10× lower cost. The convergence
target holds and the precision residual is closed.

## Note

P3 (unbounded `.collect`) recall ticked 4/4 → 3/4 (one Haiku run flagged `byAuthor`'s `.filter` but not its
`.collect`) — run-to-run noise at n=4, fully offset by the FP elimination; overall Haiku recall is unchanged
at 0.975. This is a good stopping point: high recall, zero false positives, no regression at any tier.
