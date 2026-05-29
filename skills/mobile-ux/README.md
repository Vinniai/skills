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

Add new skills as their own folder containing a `SKILL.md` (see the repo
[`CLAUDE.md`](../CLAUDE.md) authoring conventions), then register the path in
[`.claude-plugin/plugin.json`](../../.claude-plugin/plugin.json) and add the slug to a grouping in
[`skills.sh.json`](../../skills.sh.json).
