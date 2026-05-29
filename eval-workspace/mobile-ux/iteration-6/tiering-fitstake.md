# Iteration 6 — small-model identification tier, validated on real code (fitstake)

**Proposal under test (user):** use a faster/cheaper small model for the initial *identification* pass.
**Result:** validated with an important caveat — Haiku + the audit skill catches **4 of 5 ship-blockers with
ZERO false positives**, but recall on MED/LOW (and one HIGH) is partial. Right pattern = **cheap broad
identify → frontier verify *and* gap-fill**, not cheap-replaces-frontier.

## Setup

- **Target:** `/Users/miniai/jv/fitstake` (same app as the validated baseline in `../realworld-fitstake/`).
- **Reference (truth):** the Opus + skill audit, 11 findings F1–F11 (`realworld-fitstake/findings.json`,
  `with_skills_findings`).
- **Run:** one **Haiku** subagent, read `mobile-ux-audit` + `foundations` + flow ⚡ blocks, then audited the
  auth/paywall/permissions/settings surfaces and returned candidate findings with `file:line`. 30 tool uses,
  ~110k subagent tokens, ~49s — i.e. it did real work, fast and cheap.

## Grading vs the Opus+skill baseline

| Baseline finding | sev | Haiku caught? | note |
|---|---|---|---|
| F1 no account deletion | HIGH | ✅ | correct |
| F2 custom Apple button | HIGH | ✅ | sign-in.tsx:101 exact |
| F3 HealthKit on mount | HIGH | ✅ | useHealthSteps.ts |
| F4 Always/bg location | HIGH | ❌ | **missed a ship-blocker** |
| F5 no user-facing sign-out | MED | ❌ | |
| F6 no Terms/Privacy | HIGH | ✅ | |
| F7 in-app ThemeToggle | MED | ✅ | profile.tsx:99 exact (the subtle baseline-miss) |
| F8 paywall disclosures/restore | MED | ~ | flagged paywall *error-swallow* (profile.tsx:34), not the disclosure gap — partial |
| F9 notifications mocked-on | LOW | ❌ | |
| F10 location-denied dead-end | LOW | ❌ | |
| F11 auto-anon not __DEV__-gated | LOW | ❌ | saw guest login, judged it OK (backwards) |

- **Ship-blocker (HIGH) recall: 4/5** (missed only F4).
- **Overall recall: ~5/11** clean + 1 partial.
- **Precision: 100%** — no invented findings; every cited line is real.
- **Bonus:** independently caught the **auth-error swallow at `sign-in.tsx:25`** — a verified-real finding the
  *original no-skill* eval missed (see `realworld-fitstake/audit-skill-validation.md`).

## Read

- **The skill stops the scary failure mode on a cheap model: hallucinated compliance findings.** Haiku +
  skill produced *zero* false positives and nailed the high-severity, high-confidence violations with exact
  `file:line`. That is exactly what you want from a cheap first pass.
- **But cheap ≠ full recall.** A single Haiku pass missed one HIGH (always-location) and most MED/LOW. So the
  frontier model isn't only a *verifier* of Haiku's shortlist — it still adds **coverage**. Two ways to close
  the gap cheaply: (a) run **several** small-model finders and union them (loop-until-dry), or (b) a single
  frontier gap-fill pass after the cheap sweep.
- This refines iteration 5's conclusion: the skill's lift on a small model is real for **recall of the
  obvious/rule-bound violations** and for **not hallucinating**; the *judgment-heavy, less-templated*
  findings (surveillance-flavored location justification, a mocked-state-shown-as-on, a missing deep-link)
  are where the cheap pass thins out and the strong model earns its cost.

## Recommended pipeline (now in the skill)

`mobile-ux-audit` → **Model tiering** section: **identify cheap (small model + skill) → verify *and*
gap-fill frontier**. For thorough audits, run the cheap identify step as **N finders unioned** before the
frontier pass to recover recall. Screen-review carries the same note for its mechanical measuring pass.

## Next

- Quantify the loop: does **3× Haiku finders unioned** reach Opus's 11/11 recall? If yes, full audits can run
  almost entirely on the cheap tier with a thin frontier verify. That's the iteration-7 experiment.
