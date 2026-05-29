---
name: auth-flows
description: Design or review the full mobile authentication system beyond the login screen — account sign-up, Sign in with Apple / social SSO (and the App Store 4.8 requirement), passkeys, passwordless/magic-link, one-time-code (OTP) entry, two-factor/MFA, password reset & account recovery, sign-out, and in-app account deletion (App Store 5.1.1(v) requirement). Grounded in Apple HIG and App Store Review Guidelines with Android/Material deltas. Use when building or critiquing any auth flow other than the bare login screen, adding social/Apple sign-in, designing OTP/2FA/reset, or implementing the mandatory delete-account flow. For the login screen itself see login-flow; for underlying rules see mobile-ux-foundations.
tags: [auth, signup, sign-in-with-apple, passkeys, otp, mfa, account-deletion, hig]
---

# Auth flows

Everything in the auth system **except the bare login screen** (that's [login-flow](../login-flow/SKILL.md)):
sign-up, Sign in with Apple / SSO, passkeys, passwordless/magic-link, OTP, 2FA/MFA, reset & recovery,
sign-out, and **account deletion**. Rules: [mobile-ux-foundations](../mobile-ux-foundations/SKILL.md).
Stack-agnostic. Citations: **[reference.md](./reference.md)**.

## ⚡ Non-negotiables (two are App Store ship-blockers)

- **⚠️ Sign in with Apple is required (Guideline 4.8)** whenever you offer **third-party/social login**
  (Google, Facebook…) for the primary account. The equivalent must limit data to name+email, allow a
  private email, and not track for ads without consent — SIWA satisfies all three.
- **⚠️ In-app account deletion is required (Guideline 5.1.1(v))** if users can create an account. It must
  **delete the record + data, not deactivate**, be **easy to find** (account settings), and be
  **initiated in-app** (a website may only *complete* it, via a direct in-app link). Warn that Apple
  subscriptions must be cancelled separately.
- **Use the system Sign in with Apple button** — pick a system title, match its height/weight to peers
  (~44 pt), set corner radius via the API. **Don't redraw, recolor, or retranslate it.**
- **OTP = one single field** with the **one-time-code** content type (segmented boxes break AutoFill).
- **MFA must have a recovery path** — backup codes saved at enrollment — so a lost factor doesn't lock the account.
- **Prefer passkeys over passwords;** offer passkey creation right after first sign-in.

## When to use

- Designing **sign-up, SSO/Sign in with Apple, passkeys, magic-link, OTP, 2FA/MFA**.
- Designing **password reset, recovery, sign-out**, or **delete account**.
- Reviewing an auth system for App Store compliance + UX.

## Sign-up

Ask for the **minimum** (ideally just the chosen method); collect profile data later, in context. Password →
**new-password** content type (Strong Password). Link **Terms + Privacy** at account creation. Verify
email/phone with an **OTP** rather than an inbox detour where possible.

## Passwordless & OTP

- **Magic link:** single-use, short-expiry; deep-link back into the app (handle same- and cross-device);
  confirm success in-app.
- **OTP UI:** single field + one-time-code content type; numeric keyboard; **auto-submit** when full;
  visible **Resend** with cooldown; show/edit the destination; use **domain-bound SMS codes** (anti-phishing).

## Two-factor / MFA & recovery

Prefer **TOTP/passkey** over SMS; **remember trusted devices**; generate **backup codes at enrollment** and
make the user save them. Recovery: backup codes, recovery email/phone, or a passkey on another synced device.

## Sign-out & ⚠️ delete account

- **Sign-out** lives in [settings](../settings-screens/SKILL.md), not as a prominent action; **confirm** if
  it discards unsynced data; for system/Apple accounts route to **Settings** rather than faking a local sign-out.
- **Delete account** flow: Settings → Account → **Delete account** → explain what's removed + subscription
  warning → explicit destructive confirmation (type-to-confirm or re-auth) → success + timeframe. Deletes the
  **entire** record + user-generated/guest content. (See non-negotiables for the 5.1.1(v) rule.)

## Required-flows checklist

- [ ] Sign in with Apple offered if any social login exists (4.8)
- [ ] In-app account deletion that truly deletes, easy to find (5.1.1v)
- [ ] System SIWA button, unmodified
- [ ] OTP single field + one-time-code AutoFill
- [ ] MFA backup/recovery codes at enrollment
- [ ] Terms + Privacy linked at sign-up
- [ ] Neutral, non-enumerating reset/login errors

## Do / Don't

✅ SIWA alongside any social login · system SIWA button · single-field OTP · MFA backup codes · in-app
deletion that truly deletes · neutral reset/login errors.
❌ Social login without SIWA · redraw/retranslate the SIWA button · segmented OTP boxes · MFA with no
recovery · "deactivate" disguised as delete · reveal whether an email is registered · demand profile data
the app doesn't need yet.

**App Store guideline text, button specs, passkey/AASA detail:** **[reference.md](./reference.md)**.
