---
name: permissions-flow
description: Design or review how a mobile app requests system permissions — the priming/pre-permission screen, when to ask (in context, not at launch), writing required purpose strings, handling the denied/blocked state (deep-link to Settings on iOS), and per-permission notes for camera, photos, location (when-in-use vs always), microphone, contacts, notifications, Bluetooth, and App Tracking Transparency (ATT). Grounded in Apple HIG (Privacy, Notifications) and ATT rules, with Android runtime-permission deltas (rationale dialog, one-time permission, don't-nudge-after-denial). Use when building or critiquing a permission request, writing usage-description copy, designing an ATT prompt, fixing a denied-permission dead end, or deciding when to ask. For underlying rules see mobile-ux-foundations; for notification settings rows see settings-screens.
tags: [permissions, privacy, att, notifications, location, camera, hig]
---

# Permissions flow

The system permission alert appears **once**; how you set it up decides grant-vs-deny, and a denial is hard
to reverse. This is the request **flow and copy**. Rules: [mobile-ux-foundations](../mobile-ux-foundations/SKILL.md);
notification **settings rows**: [settings-screens](../settings-screens/SKILL.md). Stack-agnostic.
Citations: **[reference.md](./reference.md)**.

## ⚡ Non-negotiables (commonly missed)

- **Ask in context, when the feature is used — not at launch.** Optionally show a **priming** screen first.
- **Purpose strings are required** (`NSCameraUsageDescription`, etc.) — a brief, active-voice sentence
  saying *how* the resource is used. Missing the key crashes / fails review.
- **⚠️ ATT priming has three hard rules — all three are rejection causes:** (1) don't label a button
  **"Allow"** or mimic the system alert (use **"Continue"/"Next"**); (2) **no skip/escape hatch** that
  bypasses the system alert; (3) **don't withhold functionality/content** until users opt in (no bribing).
- **iOS ↔ Android divergence on denial (gets people):** **iOS → deep-link to Settings** after denial;
  **Android → do NOT nudge to Settings to reverse a denial — degrade gracefully.**
- **Location:** request **when-in-use first**; escalate to **Always** only if background access is core.
- **Photos:** prefer the system **picker** (no prompt at all) over full-library access.
- **Notifications:** get permission **before** sending any; provide an **in-app** screen to change it.

## When to use

- Building/reviewing **any system permission request** (camera, photos, location, mic, contacts,
  notifications, Bluetooth, tracking).
- Writing **purpose strings**, designing an **ATT** prompt, fixing a **denied dead-end**, or deciding **when** to ask.

## Priming (pre-permission) pattern

The system alert is one-shot and unstyled, so **earn the yes first**, then trigger it:

```
   [ illustration ]
   Find friends nearby
   We use your location to show events around you.
   You can turn this off anytime in Settings.
   [            Continue            ]   ← leads to the SYSTEM alert (never mislabel 'Allow')
   Not now                              ← OK for non-ATT permissions; NOT allowed for ATT
            ↓ Continue
   [ system permission alert ]
```

Your priming screen lets you re-ask later; you generally **cannot** re-trigger the system alert after a
denial. For **ATT**, the three hard rules above apply (no skip, no 'Allow', no withholding).

## Handling denied / blocked state

The OS shows each alert once. When a gated feature is tapped but denied, show a calm explanation —
**iOS: an "Open Settings" button** (`UIApplication.openSettingsURLString`); **Android: degrade gracefully,
don't nudge to Settings.** Keep the rest of the app usable.

## Per-permission notes (iOS)

- **Camera / Microphone** — usage strings; prompt when invoked.
- **Photos** — prefer the picker (no prompt); request full access only when truly needed.
- **Location** — when-in-use first; Always only when core (system re-confirms); Location Button for one-shot.
- **Contacts / Bluetooth / Local network** — usage strings; ask in context.
- **Tracking (ATT)** — `NSUserTrackingUsageDescription` + the three hard rules.

## Notifications

Get permission **before** sending; ask in context after showing value; consider **provisional**
authorization (quiet delivery, no upfront prompt). **Marketing requires explicit opt-in;** never use
Time-Sensitive for marketing. Provide an **in-app settings screen** to change choices. Android 13+:
`POST_NOTIFICATIONS` is a runtime permission — request before posting.

## iOS ↔ Android divergence

| | iOS | Android |
|---|---|---|
| After denial | **deep-link to Settings** (openSettingsURLString) | **don't nudge to Settings; degrade** |
| Re-ask | system shows alert once | `shouldShowRequestPermissionRationale()` → educational UI before re-request |
| Temporary grant | Location Button | **one-time permission** ("Only this time", Android 11+) |
| Notifications | always required | runtime permission **Android 13+** only |

## Do / Don't

✅ Ask in context · specific active-voice purpose strings · prime before the alert · "Open Settings" on iOS
when blocked · when-in-use first · photo picker · provisional notifications · in-app notification settings.
❌ Request at launch · vague/passive/imperative strings · bribe or withhold for ATT · mimic the alert /
label a priming button "Allow" · dead-end on denial · nudge to Settings on Android · ask "Always"/full photos
by default · notify without permission.

**HIG/Android URLs, ATT detail, purpose-string examples:** **[reference.md](./reference.md)**.
