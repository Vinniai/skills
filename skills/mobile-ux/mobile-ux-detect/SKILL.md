---
name: mobile-ux-detect
description: The front door for the mobile-ux skills — scan a real codebase, detect the stack and platform targets, find which mobile-ux surfaces/flows actually exist (auth, paywall, permissions, settings, onboarding/launch, states, navigation), map their files, and emit a PLAN of which skills + audits to run, with the cross-platform tags and the model-tiering recipe. Turns "audit this app" into a targeted work-list instead of a blind sweep. Use at the START of any mobile-ux task on an existing app — before auditing, reviewing, or designing — to know what applies; when onboarding to an unfamiliar mobile codebase; or to drive the audit's surface-mapping step automatically. Stack-agnostic detection (Expo/React Native/Flutter/native), though signatures are richest for Expo/RN. Not framework code — a detection + routing procedure over the other mobile-ux skills.
tags: [mobile, ux, detect, scan, routing, audit, ios, android, expo, react-native]
---

# Mobile UX — detect & route

Point this at a codebase; get back **what mobile-ux work applies here** — the stack, the platform targets,
which surfaces exist and where, and the skills/audits + tier recipe to run. It makes
[mobile-ux-audit](../mobile-ux-audit/SKILL.md) *self-targeting* instead of a blind walk.

## ⚡ Read first

1. **Detect the stack first.** Expo, bare React Native, Flutter, and native iOS/Android have different file
   conventions; the signatures below assume Expo/RN (richest). Adapt the greps for others.
2. **Output is a PLAN, not findings.** This says *"these concerns exist here, run these skills"* — it does
   **not** judge correctness. Presence ≠ compliance; the flow/audit skill makes the call.
3. **Detect the platform targets** (iOS, Android, or both) so you know which
   [cross-platform](../mobile-ux-cross-platform/SKILL.md) tags ([U]/[iOS]/[Android]) to apply — don't flag an
   iOS-only rule on an Android-only app.

## Steps

1. **Stack & platform.** Read `package.json` (`expo`, `react-native`, `expo-router`, `@react-navigation/*`),
   `app.json`/`app.config.*` (`ios`, `android`, `plugins`), `Podfile`/`build.gradle`/`pubspec.yaml`, and
   whether `ios/`/`android/` are present/tracked (CNG vs bare). Record: framework, router, **platform
   targets**, SDK.
2. **Surface detection.** Run the signature greps (below). For each hit, record the **owning skill** and the
   **file(s)**. A surface with zero hits = either absent or named unusually — note it as "not detected".
3. **Cross-platform scope.** From the targets in step 1, pull the applicable tags from
   [cross-platform](../mobile-ux-cross-platform/SKILL.md): which non-negotiables are in scope, which to skip.
4. **Emit the plan** (format below): present surfaces → skills to run; absent surfaces; the tier recipe; the
   cross-platform caveats. Hand this to [mobile-ux-audit](../mobile-ux-audit/SKILL.md) as its surface map.

## Detection signatures (signal → owning skill)

| Surface | ripgrep signal | Owning skill |
|---|---|---|
| **auth / login** | `rg -n "signIn\|useAuthActions\|AppleAuthentication\|@convex-dev/auth\|deleteAccount\|signOut\|anonymous"` | [auth-flows](../auth-flows/SKILL.md), [login-flow](../login-flow/SKILL.md) |
| **paywall / IAP** | `rg -n "RevenueCat\|Purchases\|react-native-iap\|StoreKit\|Offering\|restorePurchases\|entitlement"` | [paywall](../paywall-monetization-flow/SKILL.md) |
| **permissions** | `rg -n "requestPermission\|getPermissions\|expo-location\|expo-notifications\|HealthKit\|Camera\|Linking.openSettings\|UsageDescription"` | [permissions-flow](../permissions-flow/SKILL.md) |
| **settings / profile** | `rg -n "settings\|profile\|ThemeToggle\|colorScheme\|setAppearance\|pushPrefs\|notify"` | [settings](../settings-screens/SKILL.md), [cross-platform](../mobile-ux-cross-platform/SKILL.md) (appearance) |
| **onboarding / launch** | `rg -n "onboarding\|welcome\|SplashScreen\|expo-splash-screen\|hasOnboarded\|getStarted\|AutoAnonymous"` | [onboarding-launch](../mobile-ux-onboarding-launch/SKILL.md) |
| **states** | `rg -n "ActivityIndicator\|Skeleton\|RefreshControl\|ListEmptyComponent\|isLoading\|isError\|NetInfo\|catch\s*\("` | [states](../mobile-ux-states/SKILL.md) |
| **navigation / layout** | `rg -n "Tabs\|createBottomTab\|Drawer\|Stack\|headerTransparent\|useSafeAreaInsets\|paddingTop:\s*\d"` | [foundations](../mobile-ux-foundations/SKILL.md), [layout-devices](../mobile-ux-layout-devices/SKILL.md) |

## Plan output format

```
# Mobile-UX plan: <app>
Stack: <Expo SDK / RN / Flutter> · Router: <expo-router/react-navigation> · Targets: <iOS+Android/iOS/Android>

Surfaces present (→ run):
- auth/login      → auth-flows, login-flow      | app/(auth)/sign-in.tsx, convex/auth.ts
- permissions     → permissions-flow            | app/hooks/useHealthSteps.ts, app.json
- onboarding      → onboarding-launch           | app/onboarding/*, app/_layout.tsx
- states          → states                      | (RefreshControl in feed.tsx; no ListEmptyComponent → gap likely)
- ...
Not detected: paywall (no RevenueCat/StoreKit) — skip paywall skill.

Cross-platform scope (targets = iOS+Android):
- Apply [U] rules everywhere. iOS-only in scope: appearance-toggle, SIWA, ATT. Android-only: edge-to-edge insets, predictive back.

Recommended run (model-tiering, see audit):
1. Identify: Haiku+skill steered fan-out over the present surfaces.
2. Adjudicate + fix: Sonnet+skill (fix-authors in a worktree).
3. Opus: on demand for the ambiguous call.
```

## How this fits the mobile-ux set

This is step 0. It feeds [mobile-ux-audit](../mobile-ux-audit/SKILL.md) (which then walks each present
surface's checklist), scopes rules via [cross-platform](../mobile-ux-cross-platform/SKILL.md), and points
[screen-review](../mobile-ux-screen-review/SKILL.md) at the screens worth reviewing live. For greenfield work
there's nothing to detect — read the relevant flow skill directly.

## Notes

- **"Not detected" ≠ "not needed".** A missing `states` signal often means the gap *is* the finding (no empty
  state wired). Flag absent-but-expected surfaces, don't silently drop them.
- Keep the plan terse and file-grounded — it's a work-list, not prose.
