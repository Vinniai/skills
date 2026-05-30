---
name: mobile-ux-cross-platform
description: The platform-dependence layer for the mobile-ux skills — which rules are universal, which are iOS-only Apple-HIG opinions, and which are Android/Material-only, plus how to translate an iOS rule to its Android equivalent and which features are exclusive to each OS. The mobile-ux skills are written iOS-HIG-first with Android deltas flagged; this skill consolidates those deltas and CLASSIFIES every non-negotiable so you don't apply an iOS opinion to Android (or miss an Android requirement). Use when building or auditing a cross-platform app (Expo/React Native/Flutter), when a "non-negotiable" might be iOS-specific (e.g. the no-in-app-appearance-toggle rule), when porting an iOS design to Android or vice versa, or when deciding whether a rule applies on the platform you're shipping. Not framework code — a platform-mapping reference over the other mobile-ux skills.
tags: [mobile, ux, cross-platform, ios, android, material, hig, platform-deltas]
---

# Mobile UX — cross-platform (the platform-dependence layer)

The mobile-ux skills are **iOS-HIG-first with Android/Material deltas flagged**. That's deliberate (Apple's
HIG is the more prescriptive source), but it means some "non-negotiables" are **Apple opinions, not laws of
mobile** — applying them blindly to Android is a mistake. This skill **classifies every rule** and gives the
iOS→Android translation. Read the owning skill for the rule; read here for *whether it applies on your
platform*.

## ⚡ Read first

1. **"Non-negotiable" ≠ "universal".** Each rule below is tagged **[U] universal**, **[iOS] Apple-only**, or
   **[Android] Material-only**. On a cross-platform app, apply [U] everywhere, gate [iOS]/[Android] by target.
2. **The most-confused one:** *"ship NO in-app appearance toggle"* is **[iOS]** — an Apple HIG stance. **Android
   is more permissive** (Material You makes theming first-class; a Light/Dark/System setting is common and
   acceptable). Still default to *system* on both; just don't flag an Android theme setting as a violation.
3. **Default to system on both platforms** even where a rule is platform-specific — system-following is the
   shared baseline; the divergence is in how much *override* each platform tolerates.

## Classification of the mobile-ux non-negotiables

| Rule | Tag | Note |
|---|---|---|
| Min touch target | **[U]** | **44 pt iOS / 48 dp Android** — same intent, different number |
| Contrast 4.5:1 body / 3:1 large (WCAG AA) | **[U]** | identical |
| Never convey meaning by color alone | **[U]** | identical |
| Support text scaling ≥ 200% (Dynamic Type / font scale) | **[U]** | identical intent |
| Top-level nav = sections not actions | **[U]** | **≤5 tabs iOS / 3–5 Android** |
| Don't stack modals / show two alerts at once | **[U]** | identical |
| Read safe-area insets at runtime | **[U]** | both have insets; **Android edge-to-edge by default (API 35) makes it mandatory** |
| Design to size/window classes, not device model | **[U]** | size classes ↔ window size classes |
| In-app **account deletion** | **[U]** | App Store **5.1.1(v)** *and* Google Play **Data deletion** policy — both require it |
| Surface errors, never swallow | **[U]** | identical |
| Ask permissions **in context**, not on launch | **[U]** | identical |
| Restore Purchases + pre-purchase disclosures | **[U]** | App Store 3.1 *and* Play Billing both require disclosure/restore-equivalent |
| Don't gate value behind sign-up / no forced login | **[U]** | UX-universal; "no forced login" wording is Apple's but the principle holds |
| Loading/empty/error/offline states designed | **[U]** | identical |
| **No in-app appearance/dark-mode toggle** | **[iOS]** | **Apple-only opinion.** Android (Material You) permits a theme setting — don't flag it there. Default to system on both. |
| **Sign in with Apple** offered + **system SIWA button** | **[iOS]** | Guideline **4.8**, iOS-only. No Apple-sign-in requirement on Android. (On Android: offer Google / Credential Manager.) |
| Denied-permission **"Open Settings" deep-link** | **[iOS]**-leaning | iOS denial is **permanent after first deny** → the deep-link is essential. **Android can re-prompt** until "Don't ask again", then deep-link. Different denial model. |
| **ATT (App Tracking Transparency)** prompt before tracking | **[iOS]** | iOS-only. Android uses the Play **Data safety** form + Privacy Sandbox, no ATT prompt. |
| Liquid Glass / materials usage | **[iOS]** | iOS-only material system |
| Edge-to-edge: must consume `WindowInsets` | **[Android]** | default from **API 35**; skip it and content draws under the system bars |
| Use **dynamic color** (Material You) | **[Android]** | Android-only theming affordance |
| Handle **predictive back** gesture | **[Android]** | Android 13+; iOS uses the swipe-back edge instead |
| Honor the **back button** (gesture/hardware) | **[Android]** | no iOS equivalent |

## iOS rule → Android equivalent (translation table)

| iOS pattern | Android / Material equivalent |
|---|---|
| 44 pt touch target | **48 dp** |
| Tab bar (≤5) | **Navigation bar** (3–5) |
| Sidebar (iPad) | **Navigation rail** (mid) / **drawer** (large) |
| Action sheet | **Material bottom sheet** |
| Alert | **Material dialog** |
| Large title (collapses on scroll) | **Large top app bar** (collapsing) |
| Swipe-back edge gesture | **Predictive back** |
| "Open Settings" (`Linking.openSettings`) | same call; but Android re-prompts until "Don't ask again" |
| Sign in with Apple (4.8) | **no requirement**; offer Google / Credential Manager |
| ATT prompt | **no ATT**; Play Data safety + Privacy Sandbox |
| No in-app appearance toggle | **theme setting acceptable** (Material You); still default to system |
| Launch screen (storyboard placeholder) | **Splash screen API** (system icon splash, API 31+) |

## Platform-exclusive features (don't assume parity)

- **iOS-only:** Sign in with Apple, **Live Activities / Dynamic Island**, the **Action button**, Apple
  Pay / Wallet, **SKStoreReview** (rating prompt), the **share sheet**, Activity Rings, Handoff, WidgetKit
  widgets, App Clips, Focus filters.
- **Android-only:** **Material You** dynamic color, App **Widgets (Glance)**, **Quick Settings tiles**,
  **predictive back**, **per-app language**, Direct Share, long-press **App Shortcuts**, foreground-service
  notifications.

A feature in one column has **no automatic equivalent** in the other — design the fallback explicitly (e.g.
Live Activity → an Android ongoing notification; SKStoreReview → Play In-App Review API).

## How this fits the mobile-ux set

Every other skill states rules iOS-first; this is the index of *which apply where*. When the
[audit](../mobile-ux-audit/SKILL.md) or [foundations](../mobile-ux-foundations/SKILL.md) cites a
non-negotiable, check the tag here before flagging it on Android — especially the **appearance-toggle**,
**SIWA**, **ATT**, and **denied-state** rules, which are the ones most often mis-applied across platforms.

**Canonical Material/HIG URLs:** [reference.md](./reference.md).
