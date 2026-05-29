# permissions-flow — canonical references & deep dives

Supporting material for [SKILL.md](./SKILL.md).

## Canonical references

- [HIG Privacy (permissions, purpose strings, ATT)](https://developer.apple.com/design/human-interface-guidelines/privacy) ·
  [HIG Notifications](https://developer.apple.com/design/human-interface-guidelines/managing-notifications) ·
  [App Store Review Guidelines](https://developer.apple.com/app-store/review/guidelines/) (5.1 Privacy, ATT)
- Android: [Request permissions](https://developer.android.com/training/permissions/requesting) ·
  [Permission best practices](https://developer.android.com/training/permissions/usage-notes) ·
  [Notification permission](https://developer.android.com/develop/ui/views/notifications/notification-permission)

## Purpose strings (detail)

Shown in the system alert; required for every protected resource. Write a brief, complete sentence saying
*how* the app uses the resource. Sentence case, active voice, period.
✅ "The app records at night to detect snoring sounds."
❌ "Microphone access is needed for a better experience." (vague/passive) ❌ "Turn on microphone access." (imperative)

## ATT (detail)

If you track across apps/sites (incl. IDFA), show the system ATT alert before collecting tracking data
(`NSUserTrackingUsageDescription` + `ATTrackingManager`). On the optional priming screen you must NOT:
incentivize/coerce or **withhold functionality/content** until opt-in; imitate the system alert (no "Allow"
label, no alert image, no arrow to Allow); provide an escape hatch that skips the alert. A single
"Continue"/"Next" button is required. Violations are explicit rejection causes.

## Notifications (detail)

Authorization required before sending. **Provisional** authorization (`UNAuthorizationOptions.provisional`)
delivers quietly to Notification Center without an upfront prompt; users promote or turn off later.
Interruption levels: Passive / Active / Time Sensitive / Critical (Critical needs an entitlement). Must
provide in-app management of the choice.

## Android runtime permissions (detail)

Request in context; `shouldShowRequestPermissionRationale()` (true after a prior denial) → show educational
UI with a "no thanks" button before re-requesting. Denying twice → "don't ask again" (permanent). Android
guidance: **don't link to system settings to convince the user to change their decision** — degrade
gracefully. One-time permission (Android 11+) auto-revokes on background. Background location is a separate
later request and "should be critical to the app's core functionality."
