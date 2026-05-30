# Mobile UX

Stack-agnostic UX design skills for the flows almost every mobile app needs, grounded in
**Apple's Human Interface Guidelines** (the authoritative reference) with **Android / Material 3**
deltas called out where the platforms differ. These are design rules, screen anatomy, states, copy,
and the App Store requirements that gate review — **not** framework code.

Start with **foundations** for the shared design language; the flow skills reference it rather than
restating the rules.

- **[mobile-ux-foundations](./mobile-ux-foundations/SKILL.md)** — entry point. Navigation (tab bar vs
  sidebar vs nav bar), modality, layout & safe areas, typography & Dynamic Type, color & dark mode,
  touch targets, accessibility/contrast, motion, gestures. The non-negotiables every screen rests on.
- **[mobile-ux-layout-devices](./mobile-ux-layout-devices/SKILL.md)** — the *measurements* foundations
  abstracts: per-device screen point sizes, safe-area insets (Dynamic Island / notch / home indicator),
  layout margins & readable width, size classes/breakpoints, orientation, and iPad multitasking (Split
  View, Slide Over, Stage Manager). Grounded in HIG Layout + Specifications; Android window-size-class
  and edge-to-edge deltas. Read foundations first; come here for the numbers a layout lands on.
- **[mobile-ux-cross-platform](./mobile-ux-cross-platform/SKILL.md)** — the *platform-dependence* layer:
  classifies every non-negotiable as **[U] universal / [iOS] Apple-only / [Android] Material-only**, gives the
  iOS→Android translation table, and lists platform-exclusive features. Read this before applying an iOS rule
  on Android (e.g. the no-in-app-appearance-toggle rule is iOS-only).
- **[mobile-ux-states](./mobile-ux-states/SKILL.md)** — the states a screen has *besides* "loaded fine":
  loading / empty / error / success / offline. Skeletons vs spinners, empty = explain + act, error = cause +
  recovery (never swallow), preserve input, offline degradation, latency thresholds, pull-to-refresh.
- **[mobile-ux-onboarding-launch](./mobile-ux-onboarding-launch/SKILL.md)** — the first run: launch screen
  (mirror the first screen, not a brand splash), get to value before sign-up, short skippable onboarding,
  in-context permission priming, resuming returning users, and no cold-boot dead-end.
- **[mobile-ux-detect](./mobile-ux-detect/SKILL.md)** — the *front door*: scan a codebase, detect the stack +
  platform targets + which surfaces exist, and emit a targeted plan (which skills/audits to run + cross-platform
  tags + tier recipe). Makes the audit self-targeting. Run this first on any existing app.
- **[login-flow](./login-flow/SKILL.md)** — the sign-in screen: method ordering, fields & AutoFill,
  biometric re-auth, "Forgot password?", error/loading states, security copy.
- **[auth-flows](./auth-flows/SKILL.md)** — sign-up, Sign in with Apple / SSO (App Store 4.8), passkeys,
  passwordless/magic-link, OTP, 2FA/MFA, reset & recovery, sign-out, and in-app **account deletion**
  (App Store 5.1.1(v)).
- **[paywall-monetization-flow](./paywall-monetization-flow/SKILL.md)** — paywalls and subscriptions that
  convert *and* pass review: the mandatory pre-purchase disclosures (Guideline 3.1 / Schedule 2), Restore
  Purchases, plan presentation, free trials, StoreKit, Google Play deltas.
- **[settings-screens](./settings-screens/SKILL.md)** — settings architecture (in-app vs system), grouped
  lists and row patterns, the account/profile section, and where sign-out/delete/notifications live.
- **[permissions-flow](./permissions-flow/SKILL.md)** — priming, asking in context, purpose strings,
  denied-state handling, ATT hard rules, and per-permission notes (camera, photos, location, mic,
  notifications, …).
- **[mobile-ux-audit](./mobile-ux-audit/SKILL.md)** — the *procedure* (the others are *knowledge*): audit
  an existing app against all of the above, grounded in real code. Maps the surfaces, walks the
  non-negotiables checklist, and emits ranked findings (severity · `file:line` · violated rule + citation
  · fix). Run inline or delegate per-app to subagents.
- **[mobile-ux-screen-review](./mobile-ux-screen-review/SKILL.md)** — the *visual* half: reviews a **running
  screen** via Argent (`describe` frames + `screenshot`) and **measures** what code can't — tap-target
  size in pt, contrast, color-only state, safe-area/header overlap, nav. Companion to the audit
  (audit the code, screen-review the render).

Add new skills as their own folder containing a `SKILL.md` (see the repo
[`CLAUDE.md`](../CLAUDE.md) authoring conventions), then register the path in
[`.claude-plugin/plugin.json`](../../.claude-plugin/plugin.json) and add the slug to a grouping in
[`skills.sh.json`](../../skills.sh.json).
