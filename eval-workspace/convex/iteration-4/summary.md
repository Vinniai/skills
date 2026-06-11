# convex-best-practices — eval iteration 4 (sharpen the skill, then re-measure)

**Result: two targeted SKILL.md edits fixed the two weaknesses iteration-3 found — `runAction` (P8) recall
4/6 → 6/6 (Haiku 0/2 → 2/2) and public-read auth-noise ~8 → 0 — but the sharpening surfaced a precision
regression (the `.filter`-on-`.paginate()` exception got flagged 5/6), which a third edit then drove to
0/3. The fully-sharpened skill is strictly better than iteration-3 at every tier.**

This iteration edits the skill and re-runs the iteration-3 real-code audit (same seeded fixture) `with_skill`
only — the model baselines don't change. Two rounds: **round_a** (sharpen rules 9 + 6, Haiku/Sonnet/Opus ×
n=2) and **round_b** (add a C2 fix, × n=1 confirmation).

## What changed in SKILL.md

- **Rule 9 (`runAction`)** — promoted to a ⚡ non-negotiable and given a detection cue
  ("a `ctx.runAction(internal.x.y)` where `y` has no `"use node";` is the violation"), a loop example
  matching the fixture, and an explicit "don't misfile a `runAction` loop as rule #10 (that's about
  `runQuery` transaction consistency)."
- **Rule 6 (access control)** — split into **must-auth** (public mutations + reads of user-scoped/private/PII
  data) vs **may-be-public** (genuinely public reads need no auth), with "don't blanket-flag every query for
  missing auth" and a worked spoofable-`userId` fix.
- **Rule 2 exception (round_b)** — made the `.filter`-on-`.paginate()` carve-out explicitly *correct,
  finished code*: "do not flag it, and do not recommend a `withIndex` rewrite for efficiency — that's a
  false positive."

## Did the edits work?

| Metric | iter-3 | round_a (rules 9+6) | round_b (+C2) | verdict |
|--------|:------:|:-------------------:|:-------------:|---------|
| **P8 `runAction` recall** | 4/6 (Haiku 0/2) | **6/6** (Haiku 2/2) | 3/3 | ✅ fixed |
| **Auth-noise on public reads** | ~8 (Sonnet) | **0** | 0 | ✅ fixed (P6 recall held at 6/6) |
| **C2 `.filter`-on-`.paginate()` FP** | 1/6 | **5/6** ⚠️ | **0/3** | ⚠️ regressed → ✅ fixed |
| **Haiku recall (mean /10)** | 0.80 | 0.90 | 0.90 | ✅ up |
| **FP / run (avg, all tiers)** | 0.0–0.5 | 1.0 ⚠️ | **0.0** | ✅ net better |

### The honest part: round_a caused a regression

Sharpening "use `withIndex`, not `.filter`" made agents **over-apply** it: in round_a, **5 of 6 runs flagged
the correct `myMessages` function** (which uses the documented `.filter`-on-`.paginate()` exception),
recommending an index "for efficiency." One even asserted "the paginate exception does not apply" — it does.
A Sonnet run separately hallucinated two "missing argument validators" on functions that have them (the
validators emphasis over-firing). So round_a traded the auth-noise for a different kind of false positive.

### round_b fixed it without losing the gains

Adding the explicit "this is correct, finished code — do not flag it, do not recommend a `withIndex`
rewrite" carve-out drove the C2 false positive to **0/3**, while P8 stayed caught at every tier and recall
held (Haiku 9/10, Sonnet 10/10, Opus 10/10). The round_b confirmation had **0 false positives** across all
three tiers.

## Takeaways

1. **Targeted skill edits move targeted metrics** — the runAction detection cue fixed the exact rule even
   the cheapest model was missing, and the rule-6 split removed the exact noise the strong models were
   adding. Evals localize *which* sentence to change.
2. **Sharpening one rule can blunt another.** Pushing "`.filter` is bad" harder made the model forget the
   one place `.filter` is good. A skill needs its exceptions stated as forcefully as its rules —
   "do **not** flag this" earns its place next to "never do this."
3. **Net:** the fully-sharpened skill dominates the iteration-3 skill on every metric measured.

## Remaining gap / next iteration

- Haiku still sometimes folds **P3 (unbounded `.collect`)** into the **P2 (`.filter`)** finding instead of
  calling it out separately (0.90, not 1.00). Worth splitting the `.collect` red-flag from the `.filter`
  red-flag in the "When to use" cues, then re-checking Haiku.
- Consider widening the fixture with more correct-code bait (a correct internal cron target, a correct
  cross-runtime `runAction` into a `"use node"` action) to keep precision honest as the skill tightens.
