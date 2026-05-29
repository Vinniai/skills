# Real-world A/B re-run — after the iteration-4 skill fix

**Change made.** Promoted a state-handling rule into the front-loaded non-negotiables of **login-flow** and
**auth-flows**: *"Surface every state — never swallow a failure. On error show a visible message (not just a
logged `console.warn`)… design idle/loading/error/success."* (~2 lines per skill, negligible token cost.)
Motivation: in the first run the with-skills audit **missed** fitstake's swallowed auth error, even though
login-flow's body covered error states — the rule wasn't prominent enough.

**Re-ran the with-skills audit** (identical task, updated skills). Baseline unchanged (15).

## Result: the fix worked, and generalized

| run | findings | caught the swallowed auth error? |
|---|---|---|
| with-skills v1 (before fix) | 11 | ❌ missed |
| baseline (no skills) | 15 | ✅ (F4) |
| **with-skills v2 (after fix)** | **18** | ✅ **(F3)** |

The new non-negotiable didn't just patch the one miss — the "surface every state" rule **generalized** to
catch error-swallowing the with-v1 run (and in places the baseline too) had missed:

- **F3 — sign-in errors swallowed** (`app/(auth)/sign-in.tsx`: `catch { console.warn('[sign-in] failed') }`).
  *The targeted miss, now caught.*
- **F6 — push-notification permission requested at app launch** (`usePushNotifications.ts` `register()` on
  mount → `requestPermissionsAsync()`, mounted root-level in `_layout.tsx`). **Neither prior run found this.**
- **F10 — paywall presentation errors swallowed** (`RevenueCatProvider.tsx`).
- **F11 — wallet IAP purchase failures swallowed + 30s silent credit timeout** (`wallet.tsx`).
  **Neither prior run found this.**
- **F17 — forfeit segmented control conveys selection by color alone** (foundations rule applied to a real
  component) — also a new catch.

All three load-bearing new findings (F3, F6, F11) were **verified against the code** — no hallucinations.

## Net effect

- With-skills now finds **more total issues than the baseline** (18 vs 15), *and* retains the skill-specific
  catches from v1 (system SIWA button, in-app `ThemeToggle`, when-in-use-first location, denied-state Open
  Settings, account deletion, Terms/Privacy) *and* the consistent guideline citations.
- The earlier "attention-anchoring narrowed coverage" weakness is largely reversed for **state handling** —
  one well-placed non-negotiable made the audit systematically check error/loading states across auth,
  paywall, and wallet.
- Still out of scope (correctly): gambling-compliance (Guideline 5.3), the HealthKit `initHealthKit`≠granted
  reliability bug, and the restore-key literal-drift code bug — these need a general review, as before.

## Takeaway

A single front-loaded non-negotiable line, derived from one observed real-world miss, produced a measurable,
verified improvement and generalized beyond the original case — at ~40 tokens. This is the iterate-on-evals
loop working: real-world test → spot the gap → tighten the non-negotiables → re-test → confirm. Lower-cost,
higher-yield, exactly the goal from iteration 3.

**Next candidates** (same method): the with-run still doesn't flag domain/legal risks (gambling) or
non-UX code bugs — those are deliberately out of scope, but a one-line "flag monetization that redistributes
real money to other users → real-money-gaming policy" note in the paywall non-negotiables could extend
coverage cheaply if desired.
