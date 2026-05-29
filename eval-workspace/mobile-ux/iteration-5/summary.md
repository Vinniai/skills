# mobile-ux — eval iteration 5

**The factual lift is real but capability-dependent: ~0 for Opus, +0.333 for Haiku. A frontier model already
holds the exact device specs; a smaller model doesn't — and the skill lifts it to frontier accuracy.**

Iteration 4 hypothesised that the skill's value lives in the *exact non-obvious device number*. Iteration 5
tested that directly with a 12-item set that is **entirely device-precision** — exact point sizes, exact
safe-area insets (incl. the mini 50 pt and landscape 21 pt gotchas), the @3x hairline, the Material dp
breakpoints — and ran it on **two model tiers**, baseline (no skill) vs skill, with **point-size keys
externally verified** (iosref.com/res + web search: 16 Pro 402×874, 16 Pro Max 440×956 confirmed).

## Results

| Model | baseline (no skill) | skill | lift |
|---|---|---|---|
| **Opus** | **1.000** (12/12) | 1.000 (12/12) | **0.000** |
| **Haiku** | **0.667** (8/12) | **1.000** (12/12) | **+0.333** |

Both baseline answerers read **nothing** (`tool_uses: 0`) — pure parametric recall. Grading was direct against
the verified keys (objective numerics; a 3-judge panel on "390×844 vs 402×874" would add cost, not signal —
documented deviation from iter-3/4).

## The two findings

**1. The precision hypothesis is REJECTED for a frontier model.** Opus answered all 12 — including the mini
50 pt inset, landscape 21 pt, iPad mini 744×1133, and the Material breakpoints — from memory, with no skill.
For Opus-class recall the skill adds **zero** factual lift. (Consistent with iter-4, where Opus baseline lost
only *one* item.)

**2. The skill lifts a smaller model to frontier accuracy (+0.333).** Haiku's 4 baseline misses are
diagnostic:

| Item | Haiku said | Truth | Why it failed |
|---|---|---|---|
| 1. iPhone 16 Pro | 390×844 | **402×874** | recent device — sparse/post-cutoff in training |
| 2. iPhone 16 Pro Max | 430×932 | **440×956** | recent device |
| 7. landscape side inset | "0 — notch makes no side inset" | **44 each side** | the genuinely non-obvious one |
| 10. iPad mini 6 | 768×1024 | **744×1133** | confused with the **obsolete 9.7″ iPad** |

The failures cluster exactly where a reference doc earns its keep: **new hardware** (model knowledge goes
stale the moment Apple ships), **a current device mistaken for a discontinued one**, and **the one
counter-intuitive inset** (item 7 — the same landscape side-ear inset that beat *Opus* in iteration 4). That
item is the hardest fact in the whole mobile-ux suite: it tripped both tiers' baselines.

## What this means for the skill (the reframe)

The skill is **not** there to teach Opus facts it already has. Its factual value is:

- **Tier leveling** — it brings a cheap/small model up to frontier accuracy on device specs (+0.333 here).
  Relevant whenever the agent runs on a smaller model, or a subagent/cron does.
- **Staleness insurance** — it carries *externally-verified, dated* values for hardware past any model's
  training cutoff. The 16 Pro/Pro Max misses are precisely the "model shipped after I was trained" failure;
  the doc fixes it for every tier, and `reference.md` names Apple's Specifications page as the live source.
- **The opinionated procedure, not the number** — iter-4 already showed even Opus benefits from the
  *framing* (read at runtime, lock the screen not the app, branch on size class not model) and from
  attention-anchoring in audits (fitstake). That value is model-independent; this set just isolates the
  factual layer and shows the factual layer alone doesn't move a frontier model.

So across iterations 1–5 the lift decomposes cleanly: **non-obvious facts** (big lift on weak models, ~0 on
frontier) + **opinionated procedure / anchoring** (lift even on frontier, shown in iter-4 + the real-world
A/B builds).

## Net across all five iterations

- **Iter 1–3:** factual Q&A, single→3-judge, verbose→lean. Lift +0.187, saturated at 1.000; cost fell ~57×
  via front-loading + single-skill routing.
- **Iter 4:** harder trade-off/judgment/adversarial set de-saturated the baseline (Opus 0.90) — skill won only
  the one precise device-trap (landscape side inset).
- **Iter 5:** pure precision, two tiers. Opus +0.000, Haiku +0.333 — the factual lift is **capability-gated**,
  and concentrated on recent hardware + counter-intuitive insets.

## Remaining / next (iteration 6)

- **Stop chasing factual lift on frontier models — it's saturated and that's now well-evidenced.** Measure the
  two channels that *do* move a frontier model: (a) **applied design-critique / build** (does loading the
  skill change the *catches* and the *built layout*, not Q&A recall — extend the Debrief/fitstake A/B with a
  layout-specific screen), and (b) **attention-anchoring** in a multi-skill audit with distractors.
- **Post-cutoff hardware probe:** keep a rolling item for the *newest* shipped device as a standing staleness
  test — it's the most reliable baseline failure and the clearest justification for the reference doc.
- **Item 7 is the suite's hardest fact** (beat both tiers). Worth a dedicated callout in the skill's ⚡ block
  if it isn't landing — verify the landscape side-inset line is prominent.
