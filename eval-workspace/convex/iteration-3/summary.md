# convex-best-practices — eval iteration 3 (real-code audit)

**Result: on a seeded Convex module (10 planted violations + 2 correct functions as false-positive bait),
the skill raises issue recall at every tier and drives false positives toward zero. Baseline recall climbs
with model size (Haiku 0.35 < Sonnet 0.55 < Opus 0.70); with the skill Haiku jumps to 0.80 and both Sonnet
and Opus reach a perfect 10/10.**

| Model | recall baseline | recall +skill | lift | FP/run baseline | FP/run +skill |
|-------|:---------------:|:-------------:|:----:|:---------------:|:-------------:|
| Haiku 4.5  | 0.35 | 0.80 | +0.45 | 0.5 | 0.0 |
| Sonnet 4.6 | 0.55 | 1.00 | +0.45 | 1.0 | 0.0 |
| Opus 4.8   | 0.70 | 1.00 | +0.30 | 1.0 | 0.5 |

n=2 per cell. Fixture in [`fixtures/`](./fixtures), ground truth in [`truth.json`](./truth.json), raw
gradings in [`runs.json`](./runs.json), full tables in [`benchmark.json`](./benchmark.json).

## Why this iteration

Iterations 1–2 tested *recall on a quiz*. This one tests *application on code*: each agent audits a
realistic `messages.ts` / `schema.ts` / `crons.ts` module that we seeded with 10 known violations
(rules 1,2,3,4,5,6,7,9,10,13) and 2 deliberately-correct functions — `latestInChannel` (properly indexed +
bounded) and `myMessages` (has auth + uses the `.filter`-on-`.paginate()` exception) — as false-positive
bait. We score recall of the planted issues AND penalise flagging the correct code.

## Findings

1. **Recall scales with model size at baseline, and the skill flattens it.** 0.35 → 0.55 → 0.70 without the
   skill; with it, Sonnet and Opus hit 10/10 and Haiku reaches 8/10. Same shape as iteration-2's quiz, but
   the baseline floor is much lower — auditing real code is harder than answering a pointed question.

2. **The `.paginate()` `.filter` exception is the dominant false positive — on real code now.** All four
   Sonnet/Opus baseline runs flagged the *correct* `myMessages` as a `.filter` violation. That's the same
   item-7 blind spot from iterations 1–2, except here it produces a **wrong review comment telling someone
   to "fix" correct code**. With the skill, Haiku and Sonnet stopped doing it entirely (they explicitly
   named the exception); Opus had one hedged residual.

3. **Real code is harder than the quiz — even for Opus.** Both Opus baseline runs **missed `Date.now()` in
   a query** (P4): they noticed the adjacent `createdAt` `.filter` and flagged that instead, overlooking
   that `cutoff = Date.now()` was the planted bug. In iteration-1's quiz Opus got `Date.now()` 3/3. The
   skill restored it to 6/6 — a concrete case of the skill catching what raw capability skips under
   distraction.

4. **Where the skill adds the most** (baseline → with_skill recall across all 6 runs per condition):
   - **P3 unbounded `.collect`** — 0/6 → 5/6 (no baseline flagged it as a distinct issue).
   - **P4 `Date.now()`** — 1/6 → 6/6.
   - **P9 sequential-`runQuery` inconsistency** — 1/6 → 5/6 (baselines flagged latency or a null-deref, not
     the inconsistent-snapshot point).
   - **P2 `.filter`** — 3/6 → 6/6; **P10 cron-internal** — 3/6 → 6/6 (baselines call it an "undefined
     function" and miss the public-vs-internal security point).
   - **P8 `runAction` same-runtime** — 2/6 → 4/6: the one rule even **skilled Haiku still misses** in both
     runs. Candidate for a sharper SKILL.md example.

5. **Controls** (P1 redundant index, P5 missing validators, P7 floating promise) are 6/6 in both
   conditions — every tier spots them, so the lift is concentrated on the genuinely-subtle rules.

## Precision watch-item (not scored as a false positive)

The rule-6 non-negotiable ("every public function needs access control") makes skilled agents flag *every*
public read query (`byAuthor`, `idsFor`, `latestInChannel`, …) for "missing auth." On a real codebase with
legitimately-public reads that is noise. We scored these neutral, but it's a real precision cost — a future
SKILL.md revision should distinguish **mutations / PII reads (must authenticate)** from **public reads
(auth optional)** so the skill tightens reviews instead of spamming them.

## Net

Across three iterations the skill now has: a quiz lift (iter-1), a model-tier story showing it lifts cheap
models to Opus-grade (iter-2), and — here — evidence it improves **real-code review**: more true issues
found, fewer wrong comments on correct code, at every tier. The headline weakness to fix next is P8
(`runAction`) recall at the Haiku tier and the residual auth-flag noise.

## Next iteration

- **Sharpen the `runAction` (rule 9) guidance** in SKILL.md (a worked same-runtime example) and re-run the
  audit to see if skilled Haiku gets P8.
- **Split rule 6** into must-auth vs may-be-public to cut the access-control false-flag noise; measure
  precision before/after.
- **Bigger fixture / n=3** with more correct-code bait (a correct internal cron target, a correct
  `runAction` across a `"use node"` boundary) to stress precision harder.
