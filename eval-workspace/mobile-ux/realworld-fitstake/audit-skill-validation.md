# Validating the `mobile-ux-audit` skill on fitstake

A **blind** subagent run: the agent was given only the `mobile-ux-audit` skill + the six flow skills
and told to audit `/Users/miniai/jv/fitstake`. It was **not** shown `findings.json`. Goal: does the
audit *procedure* reproduce the verified violations a no-skill review misses — without hallucinating?

**Result: 11 findings (4 HIGH, 5 MED, 2 LOW). Spot-checked file:line claims all accurate.**

## Audit run vs the verified baseline (`findings.json` → `with_skills_findings`)

| Baseline (with-skills) finding | Reproduced by the audit skill? |
|---|---|
| F1 No in-app account deletion (5.1.1v) | ✅ HIGH — convex has no delete mutation + no Profile Delete row |
| F2 Custom Apple button vs system SIWA (4.8) | ✅ HIGH — `sign-in.tsx:101` AntDesign apple glyph *(baseline-miss)* |
| F3 HealthKit requested silently on mount | ❌ **MISSED** — `useHealthSteps` mounts at `profile.tsx:26` / home:755; not flagged |
| F4 Always/background location | ✅ (rated LOW) — `lib/locationTracking.ts:164` + app.json |
| F5 No user-facing sign-out | ✅ (folded into LOW guest finding) — signOut only in `__DEV__` dev.tsx |
| F6 Terms/Privacy never linked at sign-in | ✅ MED — `sign-in.tsx` footer is copy only, no links |
| F7 In-app ThemeToggle (foundations) | ✅ MED — `profile.tsx:99` *(baseline-miss; audit also caught the forced `setColorScheme('dark')` the baseline didn't)* |
| F8 Paywall disclosures/Restore on RC dashboard | ✅ (scope caveat) — RC-hosted paywall, flagged unverifiable-from-code |
| F9 Notifications "mocked" shown enabled | ✅ MED — `onboarding/notifications.tsx:45` |
| F10 Location-denied dead-end, no Open Settings | ✅ HIGH — `challenges/[id].tsx:101` etc. *(baseline-miss)* |
| F11 Auto-anonymous not `__DEV__`-gated | ✅ HIGH — `_layout.tsx:142` mounted unconditionally |

## Verdict

- **Reproduced 10 of 11**, including all three baseline-misses (ThemeToggle, location-denied
  dead-end, custom Apple button) — the exact subtle items a no-skill review skips.
- **Beat the original eval run on one point:** it caught the **sign-in auth-error swallow**
  (`sign-in.tsx:25`) that the original with-skills run *missed*. `comparison.md` predicted this:
  *"promoting 'design/verify all error+loading states' into the non-negotiables would likely have
  caught it."* The audit skill's checklist now lists "auth errors surfaced — not swallowed" explicitly,
  and it worked.
- **One genuine miss:** HealthKit requested silently on mount (F3). Candidate to add to the
  permissions checklist as an explicit "no permission request inside a hook that runs on mount" line.
- **No hallucinations** in the spot-checked claims (`_layout.tsx:142`, `profile.tsx:99`,
  `sign-in.tsx:25/101` all verified against source).

The procedure works as a delegated, code-grounded audit. Next tune: add the HealthKit-on-mount pattern
to the permissions checklist so the one miss is covered.
