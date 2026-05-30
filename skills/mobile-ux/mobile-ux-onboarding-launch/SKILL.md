---
name: mobile-ux-onboarding-launch
description: The first run — launch experience and onboarding — grounded in Apple's Human Interface Guidelines (Launching, Onboarding) with Android/Material deltas. Covers the launch screen (mirror the first screen, not a brand splash), getting to value fast, short skippable onboarding (value not feature-tour), deferring sign-up and in-context permission priming, progressive setup, resuming returning users, and avoiding cold-boot dead-ends. Use when designing or reviewing an app's first-launch flow, a welcome/onboarding sequence, a splash/launch screen, a "getting started" wall, or where to place sign-up and permission prompts in the first session; or when onboarding feels long, gated, or boots to a blank/unmatched screen. Pairs with permissions-flow (priming) and auth-flows (deferring login). Not framework code — first-run design rules + HIG references.
tags: [mobile, ux, hig, onboarding, launch, splash, first-run, ios, android]
---

# Mobile UX — onboarding & launch

The first run decides retention. Two parts: the **launch** (the seconds before your UI) and **onboarding**
(the first session). Apple HIG
**[Launching](https://developer.apple.com/design/human-interface-guidelines/launching)** +
**[Onboarding](https://developer.apple.com/design/human-interface-guidelines/onboarding)** are authoritative;
Android/Material deltas flagged. Ties to [permissions-flow](../permissions-flow/SKILL.md) (priming) and
[auth-flows](../auth-flows/SKILL.md) (deferring login).

## ⚡ Non-negotiables (memorize; commonly missed)

| Rule | Why / how |
|---|---|
| **Launch screen mirrors the first screen — NOT a brand splash** | Apple: the launch screen is a *seamless placeholder* of your first UI (so launch feels instant), **not** a logo/marketing moment. No "About"/splash with the company name. Keep it plain and identical-looking to the loaded screen. |
| **Get to value before sign-up** | Let users experience the core thing first; **defer account creation** to when it's needed (save/sync/pay). No forced login wall on launch (ties to [auth-flows](../auth-flows/SKILL.md) "no forced login"). |
| **Onboarding is short, skippable, value-first** | **≤ 3–4 screens**, communicate *value* not a feature tour; **Skip** always available; show **progress** (dots). Don't teach the UI — let the UI teach itself. |
| **Prime permissions in context, not on the welcome screen** | Explain *why* right before the system prompt, at first relevant use — never a wall of permission asks during onboarding ([permissions-flow](../permissions-flow/SKILL.md)). |
| **Progressive setup, not a wall** | Ask for the minimum to start; collect the rest later, in context. Pre-fill and infer where you can. |
| **Don't re-onboard returning users; resume where they left** | Gate onboarding on a persisted "completed" flag; returning/authed users skip straight to the app and land on a real screen. |
| **No cold-boot dead-end** | The root route must resolve to a real screen on a cold launch — an empty index that redirects only via an effect can boot to a blank/"unmatched route". Verify the first frame on a clean install, not just hot reload. |

## Launch (the placeholder seconds)

- **Launch/splash screen** = a static stand-in that looks like your first screen so the app feels like it
  opened instantly. **No spinner, no logo reveal, no version/marketing.** Match light/dark.
- Keep startup work off the launch path; if first data takes time, transition into a **skeleton** of the
  first screen ([states](../mobile-ux-states/SKILL.md)), not a prolonged splash.
- A *branded animated splash* is a deliberate, brief exception at most — never a loading dump, never blocking.

## Onboarding (the first session)

- **Welcome** — one screen, one promise (the value), one primary CTA, a visible **Skip/secondary** path.
- **Value carousel (optional, ≤3)** — each panel = one benefit, with progress dots; swipeable + a Next button
  (don't make swipe the only way — foundations). Skippable from any panel.
- **The minimum setup** — only what's needed to start (e.g. a display name). Everything else later, in
  context. **Permissions are primed here only if the feature is used immediately**, otherwise deferred.
- **First real screen** — land on a populated or clearly-empty-with-an-action screen (see
  [states](../mobile-ux-states/SKILL.md) first-run empty), never a blank.
- **Re-entry** — store completion; returning users skip onboarding. Let them re-find a tour in Settings/Help
  rather than forcing it again.

## iOS ↔ Android deltas

| Concept | iOS (HIG) | Android / Material |
|---|---|---|
| Launch placeholder | **Launch screen** (storyboard) — mirror first screen | **Splash screen API** (Android 12+): icon on `windowBackground`, system-owned; don't fake your own long splash |
| Splash branding | discouraged (seamless placeholder) | the system splash shows your app icon briefly — work *with* it, don't stack a second splash |
| Onboarding back | swipe-back / Back | **predictive back** — onboarding screens must handle the back gesture/preview gracefully |
| Skip affordance | text button | same; Material gives it standard button styling |

Same everywhere: don't gate value behind sign-up, keep onboarding short/skippable/value-first, prime
permissions in context, resume returning users, no cold-boot dead-end.

## How this fits the mobile-ux set

Onboarding is where [permissions-flow](../permissions-flow/SKILL.md) priming and
[auth-flows](../auth-flows/SKILL.md) deferral actually happen, and it hands off to the first
[states](../mobile-ux-states/SKILL.md) (the first-run empty). The
[audit](../mobile-ux-audit/SKILL.md) flags forced-login walls, permission walls, and cold-boot dead-ends;
[screen-review](../mobile-ux-screen-review/SKILL.md) catches a blank first frame at runtime (exactly the
Debrief "Unmatched Route" cold-boot bug found in eval-workspace).

**Canonical HIG/Material URLs:** [reference.md](./reference.md).
