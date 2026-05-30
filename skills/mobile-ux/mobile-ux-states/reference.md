# mobile-ux-states — canonical references

Supporting material for [SKILL.md](./SKILL.md). Apple HIG authoritative; Material deltas follow.

## Apple HIG
- [Loading](https://developer.apple.com/design/human-interface-guidelines/loading) — placeholders, skeleton
  vs spinner, don't block available content
- [Feedback](https://developer.apple.com/design/human-interface-guidelines/feedback) — confirm proportional
  to consequence; don't over/under-confirm
- [Progress indicators](https://developer.apple.com/design/human-interface-guidelines/progress-indicators) —
  determinate vs indeterminate; activity vs progress bar
- [Managing notifications](https://developer.apple.com/design/human-interface-guidelines/managing-notifications)
  · [Alerts](https://developer.apple.com/design/human-interface-guidelines/alerts) ·
  [Action sheets](https://developer.apple.com/design/human-interface-guidelines/action-sheets)
- [Offline](https://developer.apple.com/design/human-interface-guidelines/) — design for intermittent
  connectivity; cache and degrade

## Android / Material 3
- [Progress indicators](https://m3.material.io/components/progress-indicators/overview) — circular / linear
- [Snackbar](https://m3.material.io/components/snackbar/overview) — transient + single optional action (Undo)
- [Loading patterns / placeholder](https://m3.material.io/styles/motion/transitions/transition-patterns)
- [Pull to refresh](https://m3.material.io/components/pull-to-refresh/overview)

## Latency guidance (rule of thumb)
- **< ~0.1s** instant; no indicator.
- **~0.1–1s** perceptible but tolerable; no indicator (one would flicker).
- **~1–10s** show an indeterminate indicator; keep UI responsive.
- **> ~10s** or any known-long op: determinate progress / %, allow cancel, consider background + notify.

## State-coverage checklist (per data-driven screen)
- [ ] **Loading** designed (skeleton matching layout, not a blank or a late spinner)
- [ ] **Empty** designed, and the *right* empty (first-run vs zero-result vs all-done) with a primary action
- [ ] **Error** designed: human cause + Retry / Open-Settings; technical detail logged not shown; not swallowed
- [ ] **Success** proportional to consequence (subtle for routine, explicit for money/destructive)
- [ ] **Offline** detected, cached content shown, writes queued, banner shown, auto-recovers
- [ ] No layout shift loading→loaded; no <1s spinner flash
- [ ] Input preserved on failed submit; optimistic actions roll back visibly
- [ ] Destructive actions: Undo (reversible) or confirm (irreversible); swipe has a non-gesture alternative

## RN/Expo notes (stack-specific, optional)
- Connectivity: `@react-native-community/netinfo`. Refresh: `RefreshControl` on `ScrollView`/`FlatList`.
- `FlatList` has `ListEmptyComponent` — wire the empty state there, and gate it on *not loading* so the empty
  state doesn't flash before data arrives.
- React Query / SWR expose `isLoading / isError / isFetching / data === []` — map those 1:1 to the five states
  and you won't ship a blank screen.
