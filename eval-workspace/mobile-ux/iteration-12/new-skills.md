# Iteration 12 — evals for the four new skills (states, onboarding-launch, cross-platform, detect)

Four skills added to bring the set from 9 → 13: **states**, **onboarding-launch**, **cross-platform** (the
platform-dependence layer), **detect** (the codebase front-door). Evaluated two ways: the factual Q&A eval
(baseline vs skill, 3-judge panel) on the three *content* skills, and a real-world validation of the *detect*
procedure on a live app.

## Factual eval — 11 items, baseline vs skill, 3-judge panel (unanimous)

| Condition | Pass rate |
|---|---|
| baseline (no skill) | **0.818** (9/11) |
| skill (read states + onboarding-launch + cross-platform) | **1.000** (11/11) |

Lift **+0.18**, all three judges unanimous. The two failed-by-baseline items are the discriminators:

- **#2 empty-state** — baseline gave "explain + action, distinct from error" but **did not distinguish the
  three empties** (first-run vs filtered-to-zero vs all-done). The skill does.
- **#7 onboarding** — baseline gave "≤3 screens, value, skippable" but **omitted progress indication**. The
  skill requires it.

Same pattern as every prior iteration: **a frontier baseline is strong on concepts; the skill's lift is the
non-obvious completeness detail.**

### The cross-platform "trap" items passed in BOTH conditions

Items 9–11 were designed to catch a model over-applying iOS rules to Android (no-appearance-toggle, SIWA,
denied-permission model). **Baseline got all three right** — Opus already knows these are iOS-specific. So the
`cross-platform` skill's value is **not** teaching a frontier model the platform split; it's:
1. an **authoritative classification** so an *audit* doesn't mechanically flag an [iOS] rule on Android (the
   over-generalization we found in the question that prompted this work),
2. a **small-model lift** (per iter-5, the facts that frontier models know are exactly where Haiku/Sonnet
   gain), and
3. the **iOS→Android translation table** (generative, not recall — untested here but the practical payload).

This is worth stating plainly: a knowledge skill that a frontier model "already knows" still earns its place
as a scoping guard for the *audit* and as a lift for the *cheap tier* — both proven elsewhere in this arc.

## Real-world validation — `detect` on travel-app

Ran the `mobile-ux-detect` procedure (Sonnet) on `travel-app` cold. It produced an accurate, file-grounded
plan and **surfaced real signals beyond a naive scan**:

- Correct stack/router/targets (Expo SDK 56, expo-router, iOS+Android) and every present surface mapped to
  its owning skill with real files.
- **`react-native-purchases` installed but ZERO usage** → paywall "package present, code absent — scaffolded,
  skip the skill / flag as revenue gap." (A nuance a blind audit would miss.)
- **States gaps** called out precisely: no `ListEmptyComponent`, no error-state rendering, no `NetInfo` —
  i.e. the *absence* is the finding (exactly the skill's "not detected ≠ not needed" rule).
- Missing `signOut`/`deleteAccount`; `expo-local-authentication` installed-but-unused;
  `predictiveBackGestureEnabled: false`; `ThemeToggle` present (→ cross-platform appearance tag).
- Applied the cross-platform tags ([U]/[iOS]/[Android]) and emitted the tiered run recipe.

The detect skill does its job: it turns "audit this app" into a **targeted, file-grounded work-list** with the
right skills, platform scope, and tier recipe — and it self-flags the absent-but-expected surfaces as likely
findings.

## Net

- The set is now **13 skills**: foundations, layout-devices, **cross-platform**, **states**,
  **onboarding-launch**, **detect**, login, auth, paywall, settings, permissions, audit, screen-review.
- The two content skills lift the eval +0.18 on the non-obvious details (3-way empty, onboarding progress),
  consistent with the whole arc.
- The platform-dependence question that started this is now resolved structurally: every non-negotiable is
  classified [U]/[iOS]/[Android], the over-generalized appearance-toggle rule is fixed in foundations + the
  audit scopes rules by platform, and `cross-platform` is the index.
- `detect` makes the pipeline self-targeting: **detect → audit (per present surface) → adjudicate/fix
  (Sonnet, isolated) → Opus on demand.**

## Next (iteration 13, optional)

- Eval the **generative** half of cross-platform (the iOS→Android translation table) — give a model an iOS
  design and grade the Android port — since recall already saturates on a frontier model.
- Add **states** + **onboarding** to a real fitstake/travel-app audit run and confirm the new checklist items
  catch the gaps `detect` predicted (no empty state, cold-boot, brand splash).
