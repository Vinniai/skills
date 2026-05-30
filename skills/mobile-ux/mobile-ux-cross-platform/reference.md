# mobile-ux-cross-platform — canonical references

Supporting material for [SKILL.md](./SKILL.md). The mobile-ux skills are iOS-HIG-first; this is the Android
side of each delta plus the store-policy parity notes.

## Material 3 (Android) canonical
- [Accessibility / touch targets (48dp)](https://m3.material.io/foundations/accessibility/overview)
- [Navigation bar (3–5)](https://m3.material.io/components/navigation-bar/overview) ·
  [Navigation rail](https://m3.material.io/components/navigation-rail/overview) ·
  [Navigation drawer](https://m3.material.io/components/navigation-drawer/overview)
- [Window size classes](https://m3.material.io/foundations/layout/applying-layout/window-size-classes)
- [Dynamic color (Material You)](https://m3.material.io/styles/color/dynamic-color/overview)
- [Bottom sheets](https://m3.material.io/components/bottom-sheets/overview) ·
  [Dialogs](https://m3.material.io/components/dialogs/overview) ·
  [Snackbar](https://m3.material.io/components/snackbar/overview)
- [Edge-to-edge](https://developer.android.com/develop/ui/views/layout/edge-to-edge) +
  [WindowInsets](https://developer.android.com/develop/ui/views/layout/insets)
- [Predictive back](https://developer.android.com/guide/navigation/predictive-back-gesture)
- [Splash screen API](https://developer.android.com/develop/ui/views/launch/splash-screen)
- [Play In-App Review](https://developer.android.com/guide/playcore/in-app-review)

## Store-policy parity (the [U] store rules, both sides)
| Requirement | Apple | Google Play |
|---|---|---|
| Account/data deletion | App Store **5.1.1(v)** | **Account deletion / Data deletion** policy (in-app + web path) |
| Purchase disclosures + restore | Guideline 3.1 / Schedule 2 | Play Billing + **Subscriptions** policy (price/renewal disclosure) |
| Tracking transparency | **ATT** prompt (required) | **Data safety** form; no per-use prompt (Privacy Sandbox) |
| Third-party login parity | **SIWA required (4.8)** | no equivalent requirement |

## Apple HIG (the [iOS] rules' source)
- [Dark Mode](https://developer.apple.com/design/human-interface-guidelines/dark-mode) — the no-in-app-toggle stance
- [Sign in with Apple](https://developer.apple.com/design/human-interface-guidelines/sign-in-with-apple)
- [Privacy / ATT](https://developer.apple.com/design/human-interface-guidelines/privacy)
- [Materials (Liquid Glass)](https://developer.apple.com/design/human-interface-guidelines/materials)

## Quick rule of thumb
- **[U]** (target size, contrast, color-alone, states, account-deletion, in-context perms, no-forced-login,
  restore/disclosure): apply on both; only the *number/mechanism* differs.
- **[iOS]** (appearance toggle ban, SIWA + system button, ATT, Liquid Glass, permanent-deny model): gate to
  iOS; provide the Android translation, don't flag the Android-native behavior as a violation.
- **[Android]** (edge-to-edge insets, dynamic color, predictive back, back button): required on Android,
  N/A on iOS.
