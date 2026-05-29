---
name: settings-screens
description: Design or review a mobile app's settings and account screens — the architecture (what belongs in-app vs the system Settings app), grouped-list structure and row patterns (navigation rows, toggles, value rows), the account/profile section, and the entry points for notifications, appearance, privacy, about, sign-out and delete-account. Grounded in Apple HIG (Settings, Lists and tables, Toggles, Managing accounts) with Android/Material deltas. Use when building or critiquing a settings screen, profile/account screen, deciding where an option should live, organizing too many settings, or placing sign-out/delete-account. For the delete-account flow itself see auth-flows; for permission toggles see permissions-flow; for underlying rules see mobile-ux-foundations.
tags: [settings, profile, account, preferences, lists, toggles, hig]
---

# Settings screens

Where users tune the app and manage their account. The recurring failure is the **dumping ground**; Apple's
first rule is the opposite — **minimize settings**. Rules: [mobile-ux-foundations](../mobile-ux-foundations/SKILL.md).
The **delete-account flow** is in [auth-flows](../auth-flows/SKILL.md); **permission rows** in
[permissions-flow](../permissions-flow/SKILL.md). Stack-agnostic. Citations: **[reference.md](./reference.md)**.

## ⚡ Non-negotiables (commonly missed)

- **Settings must be reachable when SIGNED OUT** (to sign in, get help, read legal) — don't gate it behind login.
- **Task-specific options (sort, filter, show/hide, reorder) belong IN CONTEXT** in the relevant view,
  **not** in Settings. Settings is for global, persistent preferences.
- **Minimize settings;** ship good defaults so most users never open it.
- **Don't duplicate system settings** — no in-app dark-mode toggle, no re-implemented accessibility/language.
- **Delete account** must be easy to find here (it's an App Store requirement — flow in
  [auth-flows](../auth-flows/SKILL.md)); **notifications** need an in-app settings screen if you send any.
- Rows ≥ 44×44 pt / 48×48 dp; state **not by color alone**; Dynamic Type must let rows grow/wrap.

## When to use

- Building/reviewing a **settings** or **profile/account** screen.
- Deciding **where an option lives** (in-app vs system; in-context vs settings).
- Taming **too many settings**; placing **account, notifications, appearance, privacy, about, sign-out, delete**.

## Architecture decisions (first)

1. **Minimize** + good defaults.
2. **In-app vs system Settings (iOS):** general/infrequent options in-app; only the **rarest** in the system
   Settings app; offer a button that deep-links to system Settings when needed.
3. **In-context over settings** for task options.
4. **Don't duplicate system settings.**

## Structure: grouped list

Grouped style with section headers/footers. Row types:

- **Navigation row** — pushes a subscreen; **chevron** disclosure (not an info "ⓘ" button — that's for info,
  not navigation).
- **Toggle row** — a switch **only inside a list row**; the row label gives context; **don't convey state by
  color alone**; use only for two opposing states (else a value row/picker).
- **Value row** — shows the current selection trailing ("Appearance  System ›"); **show state**, don't
  just describe.
- **Action row** — Sign out / Delete account, styled distinctly. Use footers for one-line explanations.

## Conventional layout

> Exact rows are platform **convention**, not codified HIG — but this matches expectations:

```
[ avatar ] Name / handle                 ›   ← profile/account edit
ACCOUNT       Account & security          ›   ← password, 2FA, logins (auth-flows)
              Subscription / Manage plan  ›   ← manage (paywall-monetization-flow)
PREFERENCES   Notifications               ›   ← in-app settings (required if you send)
              Appearance        System    ›
              Privacy & permissions       ›   ← data controls + system Settings (permissions-flow)
SUPPORT       Help & feedback             ›
              About / Version 2.4.0       ›
              Sign out                        ← confirm if it discards local data
              Delete account                  ← destructive; flow in auth-flows
```

Profile/account first. Sign-out/delete at the bottom, separated. For large surfaces, split into
**subscreens** rather than one endless list; add search only when genuinely large.

## Android / Material deltas

Settings is **not a top-level destination** — top-app-bar overflow or nav drawer, after other items,
before Help & Feedback; reachable **signed-out**. Android convention puts **account management** and
**app version → "About"** in dedicated areas (inverse of iOS). Group by containment; dependent setting
directly below its controller. Labels: most-important word first, neutral ("Block" not "Don't"),
impersonal, no generic verbs, don't repeat the section title, show state.

## Do / Don't

✅ Minimize · good defaults · grouped list with footers · profile/account first · in-app notification
controls · reachable when signed out · in-context controls for task options.
❌ Dumping ground · in-app dark-mode toggle · duplicate system settings · info button for navigation ·
toggle state by color alone · bury notifications/delete · task options in settings.

**HIG/Android URLs and detail:** **[reference.md](./reference.md)**.
