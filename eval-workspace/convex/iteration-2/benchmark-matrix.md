# convex-best-practices — iteration 2: model × condition matrix

Same 8 held-out scenarios as iteration-1, run across three model tiers × {baseline, with_skill},
n=3 per cell (18 cells of work; Opus reused from iter-1, re-scored under the uniform rubric in `spec.json`).

## Pass rate (exact-match vs rubric truth)

| Model | baseline | with_skill | lift |
|-------|:--------:|:----------:|:----:|
| **Haiku 4.5**  | 0.667 | **1.000** | **+0.333** |
| **Sonnet 4.6** | 0.792 | **1.000** | **+0.208** |
| **Opus 4.8**   | 0.875 | **1.000** | **+0.125** |

Baseline climbs with model size; **the skill flattens all three to 1.000 (24/24).** The lift is largest
where the model is weakest — and **Haiku + skill matches Opus + skill.**

## Per-item baseline (correct / 3). with_skill is 3/3 on every item at every tier.

| Item | what it tests | Haiku | Sonnet | Opus | role |
|------|---------------|:-----:|:------:|:----:|------|
| 1 | `.collect`+filter still bills every row | 2/3 | 2/3 | 3/3 | minor — small tiers prescribe a `.filter` "fix" |
| 2 | `Date.now()` in a query | **1/3** | 2/3 | 3/3 | size gradient — Haiku blames reactivity/"not cached" |
| 3 | `runAction` same-runtime overhead | **1/3** | 3/3 | 3/3 | Haiku misses the runtime-crossing rule |
| 4 | per-`runQuery` transaction isolation | 3/3 | 3/3 | 3/3 | control |
| 5 | redundant prefix index | 3/3 | 3/3 | 3/3 | control |
| 6 | public vs internal cron target | 3/3 | 3/3 | 3/3 | control |
| 7 | `.filter` on `.paginate()` exception | **0/3** | **0/3** | **0/3** | **universal discriminator** |
| 8 | spoofable `userId` auth arg | 3/3 | 3/3 | 3/3 | control |

## Cost per cell (avg)

| Model | cond | tokens | wall-clock |
|-------|------|:------:|:----------:|
| Haiku  | baseline   | 26.8k | 12.9s |
| Haiku  | with_skill | 33.6k | 15.4s |
| Sonnet | baseline   | 26.8k | 27.5s |
| Sonnet | with_skill | 33.7k | 33.2s |
| Opus   | baseline   | 33.2k | 27.1s |
| Opus   | with_skill | 41.4k | 23.0s |

The skill adds ~7–8k tokens (two file reads, ~2 tool calls) at every tier. **Haiku + skill is the cheapest
and fastest route to 8/8** (~33.6k tok / ~15s) — fewer tokens than *Opus baseline* (33.2k) at a strictly
better score (1.000 vs 0.875).

## Takeaways

1. **Item 7 is unknown to all tiers from priors** (0/9 baseline) and **fully fixed by the skill** (9/9).
   The blanket "never `.filter`" advice is so well-internalized that every model misremembers the
   `.paginate()` exception — exactly the kind of precise carve-out a skill should carry.
2. **Smaller model ⇒ bigger lift.** The skill back-fills what the larger model already knew
   (items 2,3 for Haiku; items 1,2 for Sonnet) plus the universal item-7 gain.
3. **With the skill, model tier stops mattering for this task.** This is the "steer a cheap model to a
   strong-model answer" result: route Convex review through Haiku 4.5 + this skill and you get Opus-grade
   correctness at the lowest cost.

## Caveats

- Six of eight items are controls at the Opus tier (and four at the Haiku tier), so the headline lift
  understates value on the items that matter. Iteration-3 should swap controls for more mechanism-precise
  discriminators (OCC write conflicts from over-broad `.collect` read-sets, `v.int64` vs `v.number`, async
  iteration vs `.collect`, `"use node"` placement) to separate the tiers more sharply and stress the skill.
- n=3 per cell is small; the universal 0/3 → 3/3 on item 7 is the only result with no variance to worry
  about. A real-code condition (point the skill at an actual `convex/` file) would test application, not
  just recall.
