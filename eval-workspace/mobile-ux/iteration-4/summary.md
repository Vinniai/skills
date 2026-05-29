# mobile-ux — eval iteration 4

**New skill `mobile-ux-layout-devices`, tested on a deliberately harder set. The lift survived de-saturation —
and landed exactly where it should: on the non-obvious device number.**

Iteration 3 saturated the factual set (skill 1.000, and even the ~280-tok block hit 1.000) and flagged the
next step: *harder reasoning/trade-off items, device-specific items, adversarial traps.* This iteration ships
the 9th mobile-ux skill — per-device point sizes, safe-area insets (Dynamic Island / notch / home indicator),
size classes, iPad multitasking, Android edge-to-edge — and grades it against a 10-item set built to that brief.

## Item set (10, deliberately harder)

| kind | items | what it probes |
|---|---|---|
| device-fact | 1, 2 | Island vs SE top inset; smallest device to test |
| device-trap | 3 | landscape side-ear inset (the non-obvious one) |
| adversarial-trap | 4 | "@3x needs its own layout" (pixels ≠ points) |
| trade-off | 5, 6 | transparent large-title overlay; orientation lock |
| judgment | 7, 10 | readable line length; iPad ≠ big iPhone under Split View |
| android-delta | 8 | edge-to-edge default API 35, consume WindowInsets |
| multi-rule-tension | 9 | sticky CTA: home-indicator keep-out AND content occlusion |

## Method

Two blind answer conditions — **baseline** (model answers from general knowledge, reads nothing) and **skill**
(same model after reading `mobile-ux-layout-devices` SKILL.md + reference.md + foundations ⚡). Both answer sets
graded by a **3-judge panel** against `benchmark.json` truth keys; **majority vote** per item.

## Results (majority of 3 judges)

| Condition | Pass rate | Failed items |
|---|---|---|
| baseline (no skill) | **0.90** | item 3 |
| skill (layout-devices) | **1.000** | — |

Per-judge: J1 9/10·10/10, J2 9/10·10/10, J3 10/10·10/10. Item 3 was FAIL,FAIL,PASS for baseline → majority FAIL.
Every other item passed in both conditions, all three judges.

## The one differentiator — item 3 (and why it matters)

> *On a Face ID iPhone in landscape, where does content get clipped, and what inset clears it?*

- **Baseline:** named left/right clipping but framed the inset as one-sided "~44–59 pt on the notch side" and
  bled the 59 pt *top* figure into it — never cleanly landed the **both-sides ~44 pt side-ear inset**.
- **Skill:** "Island/notch moves to a side ear → **44 pt left+right**, top ~0, bottom ~21 pt; read it live."

This is the whole thesis of the skill in one item: **a strong base model already knows the concepts and the
trade-offs — what it misses is the precise, non-obvious device number.** That's identical to the iteration-1/2/3
finding that the lift lives entirely on non-obvious rules, now reproduced on device specs.

## What this tells us

- **The harder set de-saturated the baseline (1.000 → 0.90) but not the skill (still 1.000).** So the set now
  discriminates — but only by one item, because Opus-class general knowledge handles the trade-off/judgment/
  adversarial items unaided.
- **The skill's value is concentrated, not broad:** it doesn't make the model "smarter about layout" — it
  carries the handful of exact figures (44 pt landscape side ear, 59/20 top insets, 34 pt home indicator, SE
  375×667, API-35 edge-to-edge default) that a model approximates or half-recalls. That is exactly what a
  reference skill should do, and it's where audits/screen-reviews catch real bugs.

## Are the evals "opinionated"? (carried question)

Yes — and this set sharpens it. The opinionated calls (no in-app appearance toggle; support both orientations,
lock the *screen* not the app; don't branch on device model; read insets at runtime) are stated as
non-negotiables, and items 4/6/10 reward the opinionated answer over the lazy one. Baseline passed those
because the opinion is defensible from first principles; the skill's edge is the *measured* facts behind them.

## Remaining / next (iteration 5)

- **Item 3 is the only discriminator on this set** — to find the real ceiling, add more device-precision items
  (exact mini 50 pt top inset; iPad multitasking width thresholds; per-orientation landscape numbers) where
  approximation fails, since that's where the skill demonstrably wins.
- **Multi-turn design critique** (carried from iter-3) still untested — a screen-review transcript graded for
  whether the skill changes the *catches*, not just Q&A recall.
- **Real-world validation:** run `mobile-ux-screen-review` + the new layout rules against a live app screen
  (as done for fitstake/Debrief) to confirm the device numbers catch an actual overlap/occlusion bug in situ.
