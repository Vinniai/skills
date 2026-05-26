# skill-or-agents-md — iteration 2

## What changed from iteration 1

Iteration 1 had two weaknesses it flagged itself: a tiny n (2/condition), and a
baseline that was *handed* the three-destination framing — which already encodes
the skill's core reframe (the "docs-index" third option). So it likely understated
real-world lift. Iteration 2 fixes both:

- **n = 5 per condition** for a real variance read.
- **Three conditions** that decompose the lift instead of one baseline:
  1. **baseline_binary** — the naive real-world framing: only *two* destinations,
     "skill or AGENTS.md", no skill, no file access. This is what people actually
     ask.
  2. **baseline_3way** — three destinations named (`agents-inline | docs-index |
     skill`), no skill. Isolates the value of merely *naming* the docs-index option.
  3. **with_skill** — three destinations + reads and applies the linked skill.

Same 8 held-out scenarios as iteration 1. Run via parallel `general-purpose`
subagents. Grading is exact-match, deterministic. The binary condition is capped at
6/8 = 0.75 by construction (it cannot emit "docs-index"); see `spec.json`.

## Results

| Config | pass_rate (n=5) | stddev | avg tokens | avg time |
|---|---|---|---|---|
| **with_skill** | **1.000** | 0.0 | 20,298 | 19.5s |
| baseline_3way | 0.875 | 0.0 | 16,026 | 7.0s |
| baseline_binary | 0.750 | 0.0 | 15,998 | 7.0s |

| Delta | value |
|---|---|
| with_skill **vs binary baseline** (the real-world number) | **+0.250** |
| with_skill vs 3way baseline | +0.125 |
| 3way baseline vs binary baseline | +0.125 |

**Zero within-condition variance at n=5** — every run inside a condition produced
*identical* labels. The misroutes are systematic, not noisy.

## Where the lift comes from (clean decomposition)

The +0.25 splits exactly in half, each half a different mechanism:

- **Naming the docs-index option (binary → 3way, +0.125)** recovers **#3 and #4**,
  the two large references (event-sourcing model, 120-flag catalogue). With only
  "skill or AGENTS.md" on the table, all five binary runs sent both to **skill** —
  the anti-pattern (a big passive reference is not a workflow). The moment
  "docs-index" exists as a named option, all five 3way runs route them correctly.
- **The decision procedure + reverse-audit reasoning (3way → with_skill, +0.125)**
  recovers **#7**, the reverse audit: a 200-line migration procedure embedded in
  AGENTS.md. All five 3way runs called it `docs-index` ("too long to inline →
  retrieve on demand"). All five with_skill runs called it `skill` and cited the
  reverse-audit rule ("procedure with a recognizable trigger → extract"). The skill
  is what supplies "is it a *procedure*?" as the first question.

## The binary framing actively harms, it doesn't just lack vocabulary

The binary condition's secondary metric — **binary-axis accuracy** (collapse truth
`docs-index → agents`, since a non-procedure belongs in the AGENTS.md namespace
whether inline or indexed) — is *also* **0.75**, not higher. Faced with "this
reference is too big for always-on AGENTS.md" and only "skill" as an escape hatch,
the model picks **skill**, not "agents". So the binary framing doesn't merely lack a
word for docs-index; it pushes large references into the wrong coarse bucket. That's
a concrete failure, which is exactly why the skill's first move — reframe from two
destinations to three — matters in the wild.

## Comparison to iteration 1

Iteration 1 (3way baseline only, n=2) measured +0.06 and found the skill's value
concentrated on #7. Iteration 2 confirms that finding at n=5 with zero variance
(3way baseline misses #7 every time, skill fixes it every time) **and** surfaces the
larger, previously-hidden half of the value: against the binary framing people
actually use, the skill is worth **+0.25**, half of it from introducing docs-index
at all.

## Cost

with_skill spends ~1.27x the tokens and ~2.8x the wall-clock of a baseline (two file
reads: `SKILL.md` + `examples.md`). Negligible for a one-off routing decision; worth
noting only for high-volume automated use.

## Caveats / threats to validity

- 8 clean, archetypal scenarios. Genuinely ambiguous size/frequency tradeoffs (e.g.
  "pointer in AGENTS.md + depth in docs" split recommendations) would separate the
  conditions less cleanly and are the natural iteration-3 target.
- Single-turn classification by capable subagents; an agent mid-task with a full
  context window may behave differently.
- The truth labels are the skill author's own rubric — the eval measures
  *consistency with the skill's framework*, which is the intended contract, not an
  independent ground truth.
