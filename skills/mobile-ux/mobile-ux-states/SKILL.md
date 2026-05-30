---
name: mobile-ux-states
description: Design the non-happy-path screen states almost every data-driven view needs — loading, empty, error, success, and offline — grounded in Apple's Human Interface Guidelines (Loading, Feedback, Progress indicators) with Android/Material deltas. The states a screen has *besides* "content loaded fine": skeletons vs spinners, empty-state copy + action, error cause + recovery, optimistic UI / input preservation, offline degradation, pull-to-refresh and swipe actions, and latency thresholds. Use when building or reviewing any screen that loads data, a list/feed, a form submit, a network call, or anything that can be slow/empty/fail/offline; when a screen shows a blank flash, a bare spinner, "No items", or a raw error; or when wiring loading/error UI. Complements the flow skills (they own their screens; this owns the states each screen passes through). Not framework code — state design rules + HIG references.
tags: [mobile, ux, hig, states, loading, empty, error, offline, feedback, ios, android]
---

# Mobile UX — screen states

The states a screen has *besides* "loaded fine." Every data-driven view passes through **loading → (empty |
error | content)**, and may go **offline** or show **success** — design all of them, not just the happy path.
Apple HIG **[Loading](https://developer.apple.com/design/human-interface-guidelines/loading)** +
**[Feedback](https://developer.apple.com/design/human-interface-guidelines/feedback)** +
**[Progress indicators](https://developer.apple.com/design/human-interface-guidelines/progress-indicators)**
are authoritative; Android/Material deltas flagged. The flow skills own *which* screens exist; this owns the
states each one passes through.

## ⚡ Non-negotiables (memorize; commonly missed)

| Rule | Why / how |
|---|---|
| **Design all four states, not just content** | Every data view needs **loading / empty / error / loaded** designed up front (+ offline where relevant). A screen that renders blank while loading or on failure is a bug, not a "fast path". |
| **Skeletons > spinners for known layouts** | If you know the result's shape, show a **skeleton** that matches it (no layout shift). A bare full-screen spinner is for short *indeterminate* waits only. Never spinner→content **jump**: reserve the space. |
| **Empty state = explain + act** | Not "No items." Say **why** it's empty and give a **primary action** ("Add your first trip"). First-run empty ≠ filtered-to-zero empty ≠ error — distinguish them. |
| **Error state = cause + recovery, never a dead-end** | Human-readable cause + a **Retry** (or **Open Settings** for permissions). Never a raw code/stack, never a swallowed `console.warn` (ties to every flow's "surface every state"). |
| **Preserve user input on failure** | A failed submit must **keep the form filled**. Optimistic UI: reflect the action immediately where safe, roll back visibly on error. |
| **Offline is a state, not a crash** | Detect connectivity, **degrade gracefully** (show cached + an "offline" banner), queue/retry writes. Don't fail silently or spin forever. |
| **Latency thresholds** | **< ~1s**: no indicator (it flickers). **~1–10s**: show an indicator. **> ~10s** or known long: show **determinate progress / %** and keep the UI responsive. |

## The five states (anatomy)

- **Loading** — skeleton matching the final layout (lists, cards) or a centered indicator for indeterminate
  waits. Don't block content that's already available (load incrementally). Avoid spinners that appear for
  <1s (they read as a flash). For long/known operations use a **determinate** bar with progress.
- **Empty** — an icon/illustration + a one-line reason + a **primary CTA**. Three distinct empties:
  **first-run** (no data yet → onboarding-flavored), **cleared/zero-result** (filter/search returned nothing
  → offer to clear), **all-done** (completed everything → celebratory). Don't show the same "Nothing here"
  for all three.
- **Error** — say what happened in plain language, offer **Retry**; for a permission/connectivity cause give
  the matching recovery (**Open Settings** / "you're offline"). Inline errors stay next to the field/section;
  full-screen errors are for total load failure. Log the technical detail; **show the human one**.
- **Success** — confirm completion *proportionally*: a subtle inline check/haptic for routine actions, a
  clear confirmation for consequential ones (purchase, delete, send). Don't fire a blocking modal for a
  trivial save; don't *under*-confirm a destructive or money action.
- **Offline** — a persistent, unobtrusive indicator (banner/Snackbar); show cached data; disable or queue
  actions that need the network and tell the user they're queued. Recover automatically on reconnect.

## Standard gestures for state

- **Pull-to-refresh** for user-initiated reload of a scrollable list (with the platform's refresh control and
  its spinner). Don't make it the *only* way to refresh.
- **Swipe actions** on rows (delete/archive) need a **non-gesture alternative** (a menu/edit mode) — never the
  only path (foundations). Destructive swipe = confirm or undo.
- **Undo over confirm** for reversible destructive actions (a Snackbar/"Undo" beats an alert); confirm only
  the irreversible.

## iOS ↔ Android deltas

| Concept | iOS (HIG) | Android / Material |
|---|---|---|
| Indeterminate spinner | `UIActivityIndicatorView` / RN `ActivityIndicator` | **CircularProgressIndicator** |
| Determinate progress | `UIProgressView` | **LinearProgressIndicator** |
| Pull-to-refresh | `UIRefreshControl` | **SwipeRefreshLayout / Material pull-to-refresh** |
| Transient message | banner / inline | **Snackbar** (bottom, optional action) |
| Reversible action | Undo (shake / Undo button) | **Snackbar with Undo** (the canonical pattern) |
| Empty/error art | restrained, SF Symbol-led | Material illustration norms; a bit more expressive |

Same everywhere: design all states, skeletons over spinners for known layouts, never a dead-end error, never
lose input, offline is a designed state.

## How this fits the mobile-ux set

The flow skills ([login](../login-flow/SKILL.md), [auth](../auth-flows/SKILL.md),
[paywall](../paywall-monetization-flow/SKILL.md), [settings](../settings-screens/SKILL.md),
[permissions](../permissions-flow/SKILL.md)) each have loading/error states inside them — *this* is the
reusable spec they share. Their "surface every state / never swallow an error" non-negotiable **is** the
error-state rule here. The [audit](../mobile-ux-audit/SKILL.md) checks for swallowed errors and missing
states; [screen-review](../mobile-ux-screen-review/SKILL.md) catches a blank/janky loading state at runtime.

**Canonical HIG/Material URLs:** [reference.md](./reference.md).
