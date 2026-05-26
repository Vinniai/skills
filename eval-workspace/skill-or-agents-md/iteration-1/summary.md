# skill-or-agents-md — iteration 1

## What this eval grades

A routing/classification task: given a piece of agent/project knowledge, choose the
single best home from three destinations — **agents-inline** (in the project-root
AGENTS.md), **docs-index** (a docs/ file AGENTS.md only points to), or **skill** (an
on-demand SKILL.md). 8 held-out scenarios (none appear in the skill's `examples.md`),
including discriminators that probe the non-obvious parts: the *docs-index* third
option (#3, #4) and the two reverse audits (#7 AGENTS.md → skill, #8 skill →
AGENTS.md).

Both conditions get the same three destinations and the same items. The only
difference: the **with_skill** agent reads and applies the linked skill
(`~/.claude/skills/skill-or-agents-md/SKILL.md`); the **without_skill** baseline uses
its own judgment and reads nothing. Grading is exact-match, deterministic (no LLM
grader). Run via parallel `general-purpose` subagents, n=2 per condition.

## Results

| Config | pass_rate | time_s | tokens |
|---|---|---|---|
| with_skill | **1.00** (n=2) | 22.9 | 20,335 |
| without_skill (baseline) | 0.94 (n=2) | 8.6 | 15,988 |
| **delta** | **+0.06** | +14.3s | +4,348 |

Per-item across all 4 runs: items 1–6 and 8 were **4/4** correct in every run. The
only miss was **#7** (the reverse audit: a 200-line migration procedure embedded in
AGENTS.md) — **3/4**.

## Finding

The skill's value landed exactly where it was designed to: the **reverse-audit
discriminator (#7)**. One baseline run misrouted it to `docs-index` (treating it as
"too big for AGENTS.md" reference) instead of recognising it as a *procedure with a
trigger* that should be extracted to a **skill**. Both with_skill runs got it right
and explicitly cited the skill's reverse-audit reasoning ("multi-step procedure …
diluting every turn → extract"). So the skill (a) fixed the miss and (b) removed the
baseline's variance on that item (baseline 1/2 vs with_skill 2/2).

Everything else, the baseline already nailed — including the docs-index items (#3,
#4) and reverse-audit #8. That echoes the abcdefg iteration-3 finding: when the
framing is explicit (here, the three destinations are named in the task), a capable
model reasons well without the skill. The skill's marginal lift is concentrated on
the genuinely counterintuitive case and on **consistency**.

Cost is real: with_skill spent ~2.7× the wall-clock and ~27% more tokens (reading
`SKILL.md` + `examples.md`). For a one-off routing call that's negligible; worth
noting for high-volume use.

## Caveats / threats to validity

- **Tiny n (2/condition)** and a single-turn classification — treat the delta as
  directional, not precise.
- **Baseline was handed the three-destination framing**, which already encodes the
  skill's core reframe (the third "docs-index" option). In the wild, people ask the
  naive *binary* "skill or AGENTS.md?" — against a binary-framed baseline the skill
  should help more (it introduces docs-index and the reverse audits). This eval
  therefore likely **understates** real-world lift.
- Scenarios are clean/archetypal; ambiguous real cases would separate the conditions
  more.

## Next iteration ideas

- Add a **binary-framed baseline** (only "skill vs AGENTS.md") to measure the
  docs-index contribution directly.
- More, harder discriminators (genuinely ambiguous size/frequency tradeoffs;
  split-recommendation cases where the right answer is "pointer in AGENTS.md + depth
  in docs").
- Raise n to ≥5 for a real variance estimate.
