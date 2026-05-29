# Iteration 7 — model × skill benchmark matrix (fitstake audit identification)

**Question:** does looping cheap finders (3× Haiku+skill unioned) reach Opus's recall? And how do the tiers
compare? **Answer:** the 3× Haiku union catches **5/5 ship-blockers + 3/3 MED (8/11), 0 hallucinations** —
everything that gates a release. The skill, not the model size, is the lever; **Sonnet+skill (10/11) is the
cost/quality sweet spot.**

## Design

- **Task:** identification pass of the mobile-ux audit on `/Users/miniai/jv/fitstake` (auth, paywall,
  permissions, settings). Each run returns `[SEV] area — title | file:line | rule`.
- **Control:** the **same surface list** was given to every condition, so the matrix isolates *rule
  knowledge + judgment*, not file-discovery.
- **Truth set:** the 11 validated findings from the Opus+skill baseline (`realworld-fitstake/findings.json`
  `with_skills_findings`). HIGH/ship-blockers = **F1** account-deletion, **F2** system-SIWA-button, **F3**
  HealthKit-on-mount, **F4** Always-location, **F6** Terms/Privacy. MED = F5 sign-out, F7 in-app
  ThemeToggle, F8 paywall disclosures/restore. LOW = F9 notifications-mocked-on, F10 denied-state deep-link,
  F11 auto-anon-not-`__DEV__`-gated.
- **Metrics:** recall /11, ship-blocker recall /5, hallucinations (cited code that isn't real), and notable
  misses. Opus+skill = 11/11 by construction (it is the truth source) — the reference ceiling.

## The matrix

| Condition | Recall /11 | Ship-blockers /5 | Halluc. | Character |
|---|---|---|---|---|
| **Haiku** (no skill) | **1/11** | 1/5 | 0 | drifts to generic a11y/i18n/buildNumber; misses every rule-bound non-negotiable except account deletion |
| **Haiku + skill** (single run) | ~5–6/11 (runs: 5,6,6) | ~3–4/5 | 0 | reliable on the obvious ship-blockers; which HIGHs it gets varies run-to-run |
| **Haiku + skill** (3× unioned) | **8/11** | **5/5** | 0 | **all ship-blockers + all MED**; misses only the 3 LOWs |
| **Sonnet** (no skill) | **6/11** | 4/5 | 0 | grounded but scope-creeps (EAS URL, build number, dev-client); **misses F2 + F7** — the rule-only findings |
| **Sonnet + skill** | **10/11** | **5/5** | 0 | near-ceiling in one pass; misses only F9 (mocked notifications) |
| **Opus** (no skill) | **6/11** | 4/5 | 0 | misses F2, F7, F8, F10, F11 — the subtle/rule-bound ones; missed F2 even at the top tier |
| **Opus + skill** | **11/11** (ref) | 5/5 | 0 | reference ceiling |

(Haiku+skill single-run = the iter-6 run + two new runs, scores 5/6/6. The 3× union is those three combined.)

## What the union recovered

- Run 1 → F1,F2,F3,F6,F7 · Run 2 → F1,F3,F4,F5,F6,F7 · Run 3 → F1,F3,F5,F6,F7,F8
- **Union → F1,F2,F3,F4,F5,F6,F7,F8 = 8/11.** Ship-blockers **5/5**, MED **3/3**, LOW **0/3**.
- Still missed: **F9** (notifications mocked-shown-as-on), **F10** (denied-state Open-Settings deep-link),
  **F11** (auto-anon not `__DEV__`-gated) — all LOW, all requiring a chain of inference a single cheap finder
  rarely completes. Sonnet+skill got F10+F11; only Opus+skill got all three.
- Plus extra **verified-real** catches across the union not in the 11: the auth-error swallow
  (`sign-in.tsx:25`) and paywall-error swallows — caught by every skilled tier.

## Four conclusions

1. **The 3× cheap union answers the original question: yes for release-gating.** It recovers **every
   ship-blocker and every MED** at a fraction of Opus cost/latency, with **zero hallucinations**. For a
   merge/release gate that's the bar that matters; you'd add one frontier pass only to sweep the LOW tail.
2. **The skill is the lever, not the parameter count.** *Without* the skill, recall is ~6/11 at *every* tier
   (Haiku 1, Sonnet 6, Opus 6) and the no-skill runs systematically miss the **rule-only** findings — the
   system-SIWA-button (F2) and the in-app appearance toggle (F7) — that you only catch if you know the rule.
   *With* the skill: Haiku-union 8, Sonnet 10, Opus 11. The doc supplies what model scale doesn't.
3. **Sonnet+skill (10/11, 5/5, single pass, 0 halluc) is the sweet spot** — near-Opus quality without the
   3× fan-out or the top-tier price. Good default for an interactive audit.
4. **No tier hallucinated.** Grounding-in-code held everywhere; the no-skill failure mode is *scope drift*
   (a11y/i18n/build-config noise) + *missing the rule-bound findings*, never fabrication. So the cheap tier
   is safe to delegate — its risk is omission, fixed by unioning finders, not false alarms.

## Recommended pipeline (matches the skill's Model-tiering section)

- **Release gate / cheap+fast:** 2–3× **Haiku+skill** finders unioned → catches 5/5 ship-blockers, then a
  thin **frontier verify + LOW-tail sweep**. Cheapest path that doesn't miss a blocker.
- **Interactive single-pass:** **Sonnet+skill** (10/11) — one run, near-ceiling.
- **Definitive:** **Opus+skill** (11/11) when you need the full tail incl. the subtle LOWs.

## Next (iteration 8)

- Does **4–5× Haiku+skill** unioned finally reach the LOW tail (F9/F10/F11), or is there a hard floor a cheap
  finder can't cross? If there's a floor, that defines exactly the slice that *requires* a frontier pass.
- Cost-normalize: plot recall per token/$ across the tiers to pick the true Pareto front.
