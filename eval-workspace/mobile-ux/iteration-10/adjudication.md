# Iteration 10 — the adjudication stage (does the frontier tier earn its place?)

The tiering pipeline so far proved **identification** (cheap finds the violations). The other half —
**adjudication** (prune the cheap tier's wide net, merge dupes, fix severity, hold scope) — was asserted to
need a frontier model. **Tested, and the assertion is wrong: Sonnet+skill adjudicates as well as Opus —
cleaner, here.** Both kept 100% of real findings and lost none; the expensive tier isn't required for the
adjudication call.

## Setup

Built a **wide, noisy candidate pool** of 26 items = the cheap tier's real output (the 11 truth findings +
6 verified extras) **+ planted noise** from the no-skill scope-drift (EAS placeholder URL, missing
buildNumber, expo-dev-client in prod, no-i18n, an over-broad "115+ onPress, 2 labels" a11y sweep) **+ 2
planted duplicates** (a recolored-apple-icon dup of the SIWA-button finding; a second swallowed-auth-error
line). Two adjudicators — **Opus** and **Sonnet** — each read the audit skill's scope rules and classified
every candidate KEEP (with final severity, merging dups) or DROP (with reason), from the candidate text +
scope rules only.

**Ground-truth labels (grader):** 17 must-keep (in-scope real), 5 must-drop (out-of-scope: #19 EAS URL,
#20 buildNumber, #21 dev-client, #22 i18n, #23 over-broad a11y), 2 must-merge (#26→#2, #13→#12), 2
discretionary (#18 gambling age-gate, #25 gesture trap).

## Results

| Metric | Opus | Sonnet |
|---|---|---|
| Real findings kept (of 17) | **17/17** | **17/17** |
| Noise dropped (of 5) | 4/5 | **5/5** |
| Planted dups merged (of 2) | 2/2 | 2/2 |
| Fabricated findings | 0 | 0 |
| Over-merge (lost granularity) | **yes** — #9/#15/#24 (3 distinct mocked-status mechanisms) → 1; #17→#11 | no — kept them separate, explicitly "different mechanism… keep separate" |
| Scope caveat emitted | yes | yes |

**The discriminating candidate was #23** (the over-broad "115+ handlers, 2 labels" a11y sweep):
- **Sonnet dropped it** with the correct reason — *"over-broad sweep without grounding in specific elements;
  the screen-grounded review is the right tool; as a code-audit finding it is noise at this breadth."* That
  is exactly the skill's rule ("a finding without a grounded `file:line` is a hallucination — drop it").
- **Opus kept it** (reclassified MED). Defensible — a11y labels are a real foundations concern — but it
  violates the skill's grounding discipline and is the less-correct call.

Opus also **over-merged**: it folded three genuinely distinct mocked-status findings (notifications-mocked
`#9`, the `EXPO_PUBLIC_FAKE_STEPS` override `#15`, and init-inferred grant `#24`) into one. They share a
*rule* ("real status, not mocked") but live at three code sites with three different fixes — merging them
loses actionability. Sonnet kept them separate.

## What this means

1. **Adjudication does not require the top tier.** Sonnet+skill kept every real finding, dropped every piece
   of noise, merged both duplicates, and held scope better than Opus on this pool. The earlier "frontier for
   adjudication" guidance is **too conservative** — downgrade it.
2. **The whole pipeline can run on Sonnet+skill:** identify (10/11 single-pass, iter-7) **and** adjudicate
   (near-perfect here). Haiku steered fan-out remains the cheap-coverage option for the identify step; **Opus
   is now reserved only for the rare hardest judgment call or final fix authoring — not a required stage.**
3. **Adjudication is safe.** The dangerous failure mode — an adjudicator dropping a real ship-blocker — did
   **not** occur in either model (keep-recall 100% both). So delegating the prune step is low-risk: its job is
   removing noise and dupes, and it didn't touch the real findings.
4. **Cheap-tier scope-drift is fully recoverable downstream.** The no-skill noise (build config, i18n,
   over-broad sweeps) that made the cheap identify pass "messy" was cleanly removed by a one-call adjudicator.
   So you can let the identify tier over-collect (favoring recall) and rely on adjudication for precision —
   the right division of labor.

## The complete tiering picture (iters 5–10)

| Stage | Cheapest that works | Why |
|---|---|---|
| **Identify** | Haiku+skill steered fan-out (→ ceiling) **or** Sonnet+skill ×1 (10/11) | facts/rules lift small models to frontier recall (iter-5/7); steering beats volume for the tail (iter-8); generalizes across apps (iter-9) |
| **Adjudicate** | **Sonnet+skill ×1** | keeps 17/17 real, drops 5/5 noise, merges dupes, holds scope — ≥ Opus here (iter-10) |
| **Hardest call / fix authoring** | Opus+skill, on demand | reserve top-tier spend for the genuinely ambiguous finding or the written fix — not a mandatory pass |

**Net:** a default audit is **Sonnet+skill, one identify pass + one adjudicate pass** (~$0.94 by iter-9's
rough pricing), or **Haiku steered fan-out → Sonnet adjudicate** when you want the cheapest coverage; Opus is
opt-in for the long tail. Cheap identifies, mid adjudicates, frontier is a luxury — not the spine.

## Next (iteration 11, optional)

- Author-the-fix stage: does the tier matter for writing the *patch* (the one place judgment + code
  generation combine)? Test Sonnet vs Opus on producing correct diffs for the kept findings.
- Re-confirm the Sonnet-adjudicates-fine result on the travel-app pool (guard against fitstake-specificity),
  and with an adversarial pool seeded with subtler near-misses (plausible-but-wrong findings) to stress the
  prune step's precision.
