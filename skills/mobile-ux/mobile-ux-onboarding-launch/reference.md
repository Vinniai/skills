# mobile-ux-onboarding-launch — canonical references

Supporting material for [SKILL.md](./SKILL.md). Apple HIG authoritative; Material deltas follow.

## Apple HIG
- [Launching](https://developer.apple.com/design/human-interface-guidelines/launching) — launch screen as a
  seamless placeholder of the first screen; fast to interactive; no marketing splash
- [Onboarding](https://developer.apple.com/design/human-interface-guidelines/onboarding) — brief, value-first,
  skippable; teach in context, not a wall
- [Offering help](https://developer.apple.com/design/human-interface-guidelines/offering-help) — where a
  re-findable tour lives
- [Privacy](https://developer.apple.com/design/human-interface-guidelines/privacy) +
  [permissions-flow](../permissions-flow/SKILL.md) — in-context priming

## Android / Material 3
- [Android splash screen API](https://developer.android.com/develop/ui/views/launch/splash-screen) — system
  splash (icon on window background) from Android 12; don't add a second app-drawn splash
- [Predictive back](https://developer.android.com/guide/navigation/predictive-back-gesture) — onboarding must
  handle the back-gesture preview
- [Material onboarding patterns](https://m3.material.io/foundations/content-design/onboarding)

## First-run checklist
- [ ] Launch screen mirrors the first screen (no logo/marketing/spinner); matches light/dark
- [ ] Core value reachable WITHOUT signing up; account creation deferred to save/sync/pay
- [ ] Onboarding ≤ 3–4 screens, value not feature-tour, Skip on every screen, progress shown
- [ ] Permissions primed in context (or deferred), never a wall on the welcome screen
- [ ] Only the minimum setup asked up front; rest collected later in context
- [ ] Onboarding completion persisted; returning/authed users skip it and land on a real screen
- [ ] Cold launch on a CLEAN install resolves to a real first screen (no blank/unmatched route)
- [ ] First screen is populated or a first-run empty state with a primary action ([states](../mobile-ux-states/SKILL.md))

## RN/Expo notes (stack-specific, optional)
- Splash via `expo-splash-screen` (SDK 56: configured through the plugin, not root `expo.splash`). Call
  `SplashScreen.hideAsync()` only after the first screen is ready — but keep total time short.
- expo-router: a bare `app/index.tsx` that redirects only inside a `useEffect` can cold-boot to "Unmatched
  Route" before the effect runs — give the index a real default render or a synchronous `<Redirect>`.
- Persist onboarding completion (e.g. AsyncStorage/secure store) and gate the redirect on it + auth load.
