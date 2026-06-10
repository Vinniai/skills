# convex-best-practices — eval iteration 2 (model matrix)

**Result: the skill lifts every tier to 1.000 (24/24). Baseline rises with model size — Haiku 0.667 <
Sonnet 0.792 < Opus 0.875 — so the lift is largest where the model is weakest (Haiku +0.333, Sonnet
+0.208, Opus +0.125). With the skill, Haiku 4.5 matches Opus 4.8.**

| Model | baseline | with_skill | lift |
|-------|:--------:|:----------:|:----:|
| Haiku 4.5  | 0.667 | 1.000 | +0.333 |
| Sonnet 4.6 | 0.792 | 1.000 | +0.208 |
| Opus 4.8   | 0.875 | 1.000 | +0.125 |

n=3 per cell. Full tables in [`benchmark-matrix.md`](./benchmark-matrix.md); raw verdicts in
[`runs.json`](./runs.json); method + uniform rubric in [`spec.json`](./spec.json).

## What we asked

Iteration-1 ran the 8-item set on Opus only and found one real discriminator (item 7). This iteration adds
the **model-tier axis** — {Haiku, Sonnet, Opus} × {baseline, with_skill} — to answer: *does the skill close
the gap between a cheap model and a strong one?* Opus cells are reused from iter-1, re-scored under a single
uniform rubric (see note below); Haiku and Sonnet were run fresh (12 new subagents).

## Findings

1. **Item 7 — the `.filter`-on-`.paginate()` exception — is a universal blind spot.** 0/9 baseline runs
   across all three tiers got it; every one justified "it's fine" by *the index already narrowing the read*
   rather than the actual rule (a filtered paginated page still returns the requested document count). One
   Opus run even asserted the opposite of the real behavior (pages go sparse). with_skill: **9/9**. The
   "never `.filter`" rule is so well-learned that all tiers misremember its one carve-out — precisely what a
   skill should carry.

2. **Smaller model ⇒ bigger lift.** Beyond the universal item-7 gain, the skill back-fills what bigger
   models already knew: Haiku baseline also missed item 2 (`Date.now()` in a query — it blamed client
   reactivity or "queries aren't cached") and item 3 (`runAction` overhead), and both Haiku and Sonnet had a
   run "fix" item 1 with a Convex `.filter` pushdown (the exact misconception). Opus baseline got all of
   those. So the skill's job scales inversely with model strength.

3. **With the skill, tier stops mattering for this task — and the cheap path wins.** Haiku + skill reaches
   8/8 at ~33.6k tokens / ~15s: *fewer tokens than Opus baseline* (33.2k) at a strictly better score
   (1.000 vs 0.875), and less than half Opus's with-skill latency. The practical read: route Convex review
   through **Haiku 4.5 + this skill** for Opus-grade correctness at the lowest cost.

## Controls (both conditions 3/3 at every tier)

Items 4 (transaction isolation), 5 (prefix-index redundancy), 6 (public-vs-internal cron), and 8
(spoofable `userId` auth) are known to every tier. Flat control bands confirm the eval isn't rigged — the
skill earns its lift on the items models actually get wrong, not by inflating easy ones.

## Rubric note (why Opus baseline reads 0.875 here vs 0.833 in iter-1)

Iteration-1 scored item 2 strictly, docking any answer that framed the moving clock as *forcing*
re-execution even when the fix was right. To compare tiers fairly, iteration-2 uses one uniform rule: item 2
is correct if it fingers `Date.now()` inside the query as the cause **and** gives a correct fix (scheduled
`isReleased` boolean, or a rounded client-time arg). Under that rule one Opus baseline run flips to correct,
moving Opus baseline from 0.833 → 0.875. Item 7 scoring is unchanged.

## Next iteration

- **Sharper discriminators.** Six of eight items are controls at the Opus tier. Swap them for
  mechanism-precise items where strong models reliably err: OCC write-conflicts from over-broad `.collect`
  read-sets, `v.int64` vs `v.number`, async iteration vs `.collect`, `"use node"` placement, the table-name
  `ctx.db` API. Target ≥4 discriminators so the tiers separate even with the skill.
- **Real-code condition.** Point each tier at an actual `convex/` file in the monorepo and grade whether it
  flags the real issues without hallucinating — application, not recall (mirrors mobile-ux `realworld-fitstake`).
- **Bump n** to 5 per cell once the discriminator set is sharper, for tighter intervals on the close
  Sonnet/Opus baseline gap.
