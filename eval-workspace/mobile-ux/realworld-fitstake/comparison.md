# Real-world A/B: mobile-ux skills on fitstake

**Setup.** Same app (`/Users/miniai/jv/fitstake`, an Expo/RN fitness-wager app on RevenueCat), same audit
task (auth, paywall, permissions, settings — UX quality + App Store/Play compliance, grounded in real code),
two subagents. One read the six `mobile-ux` skills first; the other used only its own knowledge. No code was
changed. All key differentiators were re-verified against the actual code (no hallucinations — see
`findings.json`).

**Headline — honest:** this is **not** a clean sweep. The skills made the audit **more precise and
guideline-cited**, and caught one real issue the baseline **missed entirely**, but the baseline (also Opus)
was strong and found **more total issues**, including domain and code problems the skills don't cover.

## Counts

| | findings | high-sev | App-Store-risk | guideline citations |
|---|---|---|---|---|
| without skills | **15** | 6 | 7 | occasional |
| with skills | 11 | 6 | 7 | **consistent (4.8, 5.1.1v, §3.8(b))** |

## Both caught the big compliance items (9 overlapping)

Account deletion missing (5.1.1v), no real sign-out, Terms/Privacy absent, Always/background-location with a
"verify you were at the gym" justification, HealthKit requested silently on mount, paywall disclosures/Restore
depending on the RevenueCat dashboard, notifications "mocked"=enabled, auto-anonymous sign-in, and the Apple
sign-in gap. **The four highest App-Store-risk items were found by both** — a strong baseline already knows
the famous rules (mirrors the eval, where famous rules showed no lift).

## What the SKILLS added (with-only)

- **In-app appearance toggle (`ThemeToggle`, profile.tsx:99) — baseline MISSED this entirely.** It maps
  exactly to a foundations non-negotiable ("ship no in-app appearance toggle"). Cleanest win; verified real.
- **System Sign in with Apple button rule** — framed the custom `AntDesign apple` button as a SIWA-button
  violation (auth-flows), a UX-compliance angle distinct from the baseline's "native Apple not configured."
- **Denied-state "Open Settings" deep-link** for location (permissions denied-state) — baseline didn't flag it.
- **Consistent guideline citations** (4.8, 5.1.1(v), Schedule 2 §3.8(b), when-in-use-first) — turns "this
  seems off" into "this violates X," which is what makes a finding actionable in review.

## What the skills COST / blind spots (without-only)

The with-skills run found **fewer** issues — it spent budget reading skills and anchored on skill-covered
areas, missing things the baseline caught:

- **Auth errors silently swallowed** (sign-in.tsx) — ironic, since login-flow *does* cover error states; the
  skill run still missed it.
- **HealthKit reliability bug** — `initHealthKit` success ≠ read permission granted (domain knowledge).
- **Gambling-compliance exposure** — real-money IAP funding a redistributed wager pool (Guideline 5.3);
  outside the skills' scope entirely.
- **Contradictory "no real cash" vs real-priced IAP copy**, **restore-key literal drift**, **dev error copy
  leak** — code/domain issues the skills don't target.

## Takeaways

1. **Skills are a complement, not a replacement.** They reliably enforce the **UX-compliance checklist** with
   citations and caught a pure-UX item (appearance toggle) the baseline missed — but a general review still
   finds more domain/code issues. Best result = run both.
2. **Attention-anchoring is real.** Loading the skills focused the audit on their six areas and **narrowed**
   total coverage. For a broad audit, prompt for skills *plus* "also review general code quality, error
   handling, and domain/legal risks beyond UX."
3. **Actionable improvement to the skills:** the with-run missing the auth error-swallow suggests the
   login-flow "states" guidance isn't prominent enough — promoting "design/verify all error+loading states"
   into the non-negotiables block would likely have caught it. Good candidate for the next skill iteration.

## Verification

Every differentiating claim was checked against the code (`findings.json` → `verified_true_against_code`):
ThemeToggle, the custom Apple button + absent `expo-apple-authentication`, the missing delete mutation, and
the restore-key literal are all real. No fabricated findings were found in the differentiators.
