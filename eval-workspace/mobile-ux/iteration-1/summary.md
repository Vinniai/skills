# mobile-ux — eval iteration 1

**Result: with_skill 16/16 (1.000) vs baseline 13/16 (0.8125) → +0.1875 lift (+18.75 pts).**
n=3 per condition, stddev 0.0 on both (answers were deterministic across runs).

## Method

16 held-out scenarios drawn from the six per-skill `evals.json` files (foundations 3,
login 2, auth 3, paywall 3, settings 2, permissions 3). Two conditions, each run by 3
parallel general-purpose subagents answering all 16 items in one pass:

- **baseline** — answer from the model's own knowledge, no file access, no skill.
- **with_skill** — read the six `skills/mobile-ux/*/SKILL.md` files first, then apply.

Strict grading: an item is correct only if it reaches the right **decision** *and* names the
**load-bearing element**. (E.g. "add account deletion" without "in-app, not deactivation" = wrong.)

## Where the skills add value

The lift is concentrated in three **non-obvious compliance/detail** items — exactly where a
reference skill should help. A capable model already knows the famous rules (Sign in with Apple
4.8, in-app deletion 5.1.1(v), 44 pt targets, account enumeration), so those show **no lift** —
which is the right outcome for a credible eval, not a rigged one.

| Item | Baseline failure | What the skill fixed |
|---|---|---|
| **10** Restore Purchases | All 3 listed Terms+Privacy but **omitted Restore Purchases** — a frequent real App Store rejection. | Skill lists Restore as a hard requirement on the paywall. |
| **13** Signed-out settings | All 3 said gating settings/account behind login is "fine". | Skill: settings must be reachable **when signed out**. |
| **15** ATT triple | All 3 named only 1–2 of the 3 ATT priming violations (usually "withholding content"). | Skill names all three: no 'Allow' label/mimic, no skip/escape hatch, no withholding. |

## Cost

with_skill ≈ **2× tokens** (50.9k vs 24.9k avg) and 6 tool uses (reading 6 files) for the +18.75 pts.
Expected — the agent reads all six skills to answer a 16-item cross-cutting quiz. In normal use only
the relevant skill loads, so real-world overhead is far lower.

## Caveats / next iteration

- **Small item set, deterministic answers.** Lift rests on 3 discriminating items; widen the set
  (more paywall-disclosure edge cases, OTP/2FA recovery, modality, more Android deltas) to harden the number.
- **Self-grading.** I (the authoring model) graded against my own rubric — some bias risk. A future
  iteration should use an independent judge subagent and possibly a 3-way "which skill applies" routing
  metric like the `skill-or-agents-md` eval.
- **No adversarial/distractor items.** Add scenarios where the *wrong* skill looks tempting, and
  scenarios with no correct compliance answer (to test over-triggering).
- The two hard-requirement facts the research flagged as **verify-before-shipping** (SIWA button pixel
  specs; Schedule 2 §3.8(b) verbatim) aren't tested here because they're "confirm against live docs",
  not fixed truths.
