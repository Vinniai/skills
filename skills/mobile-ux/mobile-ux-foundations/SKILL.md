---
name: mobile-ux-foundations
description: Stack-agnostic UX foundations for mobile apps, grounded in Apple's Human Interface Guidelines (HIG) with Android/Material 3 deltas. The shared design language the other mobile-ux flow skills build on — navigation (tab bar vs sidebar vs nav bar), modality, layout & safe areas, typography & Dynamic Type, color & dark mode, touch targets, accessibility/contrast, motion, and gestures. Use when designing or reviewing any mobile screen, choosing a navigation structure, picking type/color/spacing, fixing tap targets or contrast, supporting dark mode, or when another flow skill (login, auth, paywall, settings, permissions) needs the underlying design rules. Not framework code — design rules + canonical HIG references.
tags: [mobile, ux, hig, ios, android, accessibility, navigation, design]
---

# Mobile UX foundations

The design rules every mobile screen rests on, and the **entry point** for the `mobile-ux` skills —
the flow skills ([login](../login-flow/SKILL.md), [auth](../auth-flows/SKILL.md),
[paywall](../paywall-monetization-flow/SKILL.md), [settings](../settings-screens/SKILL.md),
[permissions](../permissions-flow/SKILL.md)) assume everything below. Stack-agnostic; Apple HIG is
authoritative, Android/Material deltas are flagged. Full citations: **[reference.md](./reference.md)**.

## ⚡ Non-negotiables (memorize; commonly missed)

| Rule | iOS (HIG) | Android (Material 3) |
|---|---|---|
| **Min touch target** | **44 × 44 pt** (floor 28×28) | **48 × 48 dp** |
| **Text contrast (WCAG AA)** | **4.5:1** body; **3:1** if ≥18 pt or bold | same |
| **Top-level sections** | tab bar, **≤ 5 tabs**, no "More" overflow | nav bar, **3–5** |
| **Dark mode** | **respect the system setting — ship NO in-app appearance toggle** | follow system / dynamic color |
| **Convey meaning** | **never by color alone** — add icon/text | same |
| **Two alerts** | **never show two at once / stack modals** | same |
| **Text scaling** | support Dynamic Type to **≥ 200%** without clipping | same |

**iOS ↔ Android divergences that trip people up:** tap target **44 pt vs 48 dp**; Android's bottom nav
hard range is **3–5** (iOS "≤5"); Android is consolidating drawer→expandable rail. The **no-in-app-appearance-toggle**
rule above is an **iOS-only** stance — Android (Material You) permits a theme setting; default to system on both.
For the full classification of which non-negotiables are universal vs iOS-only vs Android-only, see
**[cross-platform](../mobile-ux-cross-platform/SKILL.md)**. (Permission-denial divergence lives in
[permissions-flow](../permissions-flow/SKILL.md).)

## When to use

- Designing/reviewing **any** mobile screen and you want the rule, not a guess.
- Choosing a **navigation structure**, deciding **modal vs pushed screen**, or picking type/color/spacing.
- Fixing **tap targets, contrast, Dynamic Type**, dark mode, or other accessibility issues.

## Navigation — pick the right structure

- **Tab bar** — switch **top-level sections**, never actions. Stays **visible**; **≤ 5 tabs**, no "More"
  overflow. Don't hide/disable a tab when its content is empty — show an empty state.
- **Navigation bar (top)** — move **through a hierarchy** (push/pop). Concise title (not the app name);
  standard Back/Close symbols; iOS large titles shrink on scroll.
- **Sidebar** — only with ample space (iPad/large). **Avoid on iPhone.** ≤ 2 levels; deeper → split view.
- **Modality** — blocks the parent and demands explicit dismissal. Use for a short, scoped task; always
  give an **obvious dismiss** and **confirm before discarding unsaved data**; full-screen for multistep
  tasks; **never stack** modals or show two alerts at once.

## Layout & safe areas

Respect **safe areas, margins, layout guides**; inset content/controls (on iOS avoid full-bleed buttons).
Most-important content **top + leading** (mind RTL). Backgrounds may extend to edges; keep interactive
content in the safe area. Design **adaptive** layouts and test portrait/landscape, smallest/largest device,
every localization, and the largest Dynamic Type size. For the **concrete numbers** — per-device point
sizes, safe-area insets (Dynamic Island / notch / home indicator), margins, size classes, iPad
multitasking — see **[mobile-ux-layout-devices](../mobile-ux-layout-devices/SKILL.md)**.

## Typography & Dynamic Type

Prefer built-in **text styles** (Body, Headline, Caption…) — they get Dynamic Type for free. iOS body
**17 pt**, min **11 pt**. Use Regular/Medium/Semibold/Bold (avoid Ultralight/Thin/Light). Layouts must
**reflow** at the largest accessibility sizes, not clip.

## Color & dark mode

**Never hard-code system colors** — use **semantic** roles (`label`/`secondaryLabel`, `separator`, `link`,
`systemBackground`). **Don't rely on color alone.** **Dark mode is automatic — supply light/dark variants
and ship NO in-app appearance toggle.** iOS uses base vs **elevated** backgrounds (sheets go brighter).
Custom pairs: 4.5:1 min, aim 7:1 for small text.

## Accessibility & motion (always, not a phase)

Targets **44×44 pt / 48×48 dp**; contrast 4.5:1 / 3:1; **no color-only** state; Dynamic Type to ≥200%;
label every control for VoiceOver/TalkBack; **alternatives to gestures**; respect **Reduce Motion**
(fade, don't fling); never make motion the only signal. Inclusive copy: address people as "you", plain
language, nongendered imagery unless required. Use **standard gestures for standard actions**; don't
override system gestures; never make a gesture the only way to do something.

## How to use this with the flow skills

Flow skills reference these foundations instead of restating them. Read the flow skill for the
screen-by-screen pattern; return here for the underlying rule (target size, contrast, nav choice, modal
rules, tone); go to [layout-devices](../mobile-ux-layout-devices/SKILL.md) for the device measurements.
→ [layout-devices](../mobile-ux-layout-devices/SKILL.md) · [login](../login-flow/SKILL.md) ·
[auth](../auth-flows/SKILL.md) · [paywall](../paywall-monetization-flow/SKILL.md) ·
[settings](../settings-screens/SKILL.md) · [permissions](../permissions-flow/SKILL.md).

**Canonical HIG/Material URLs and detail:** **[reference.md](./reference.md)**.
