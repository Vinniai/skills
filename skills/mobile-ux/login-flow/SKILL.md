---
name: login-flow
description: Design or review the mobile sign-in (login) screen — the screen returning users hit to authenticate. Covers method ordering (Sign in with Apple/passkey first, email/password secondary), field design and keyboard/AutoFill hints, password-AutoFill and one-time-code AutoFill, biometric (Face ID/Touch ID) re-auth for returning users, "Forgot password?" entry, error and loading states, and security copy. Grounded in Apple HIG with Android/Material deltas. Use when building or critiquing a login screen, choosing sign-in methods, fixing login errors/AutoFill/biometrics, or wiring "forgot password". For sign-up, SSO setup, OTP/2FA, reset, and delete-account, see auth-flows; for underlying rules see mobile-ux-foundations.
tags: [login, sign-in, mobile, ux, hig, biometrics, autofill]
---

# Login flow

The **sign-in screen** — where a returning user authenticates. Sign-*up*, SSO setup, passwordless/OTP, 2FA,
reset, and account deletion live in [auth-flows](../auth-flows/SKILL.md); nav/type/contrast/touch rules in
[mobile-ux-foundations](../mobile-ux-foundations/SKILL.md). Stack-agnostic. Citations: **[reference.md](./reference.md)**.

## ⚡ Non-negotiables (commonly missed)

- **Don't force login.** Apple: ask for an account only if core functionality needs it, and *"delay
  sign-in as long as possible."* If login is required, **say why** in one line on the screen.
- **Neutral failure copy — no account enumeration.** Use *"Your email or password is incorrect,"* never
  *"no account with that email."*
- **Surface every state — never swallow a failure.** On error show a **visible** message (Alert/inline),
  not just a logged `console.warn`, so the user can retry; keep the loading indicator moving; design
  **idle / loading / error / success** for every method.
- **Face ID/Touch ID does NOT replace server auth.** It **unlocks a credential** stored in the **Keychain**
  (Android: Keystore); always provide a **passcode/password fallback**. Offer biometric unlock *after* the
  first successful sign-in.
- **Tag fields for AutoFill:** username, password (sign-up → *new-password*), and OTP → **one-time-code**
  content type. Keep the entered email on error; don't block paste.
- **Lead with the lowest-friction method** (Sign in with Apple / passkey / SSO); email+password secondary.
- Targets ≥ 44×44 pt / 48×48 dp; errors **not color-only**; support Dynamic Type reflow.

## When to use

- Building/reviewing a **login screen**, choosing/ordering **sign-in methods**.
- Fixing **AutoFill**, **biometric re-auth**, error/loading states, or the **"Forgot password?"** entry.

## Screen anatomy

```
            [ App logo ]   + one-line reason if login is required
   [ Sign in with Apple ]        ← lowest-friction method first
   [ Continue with Google ]
   ───────────  or  ───────────
   Email     [ you@example.com   ]   ← AutoFill: username
   Password  [ ••••••••     👁 ]      ← AutoFill: password, show/hide
                       Forgot password? ← secondary (reset flow → auth-flows)
   [           Sign in           ]   ← single primary action
   New here?  Create account          ← route to sign-up (auth-flows)
```

One **primary** button; everything else subordinate. One field per row. "Forgot password?" always reachable.

## States — design all of them

- **Idle** — enable the primary button when inputs are minimally valid; don't validate every keystroke.
- **Loading** — progress on the button, **kept moving** (a frozen spinner reads as a hang); block double-submit.
- **Error** — inline, specific, human; distinguish **wrong credentials** from **network/retryable**; keep
  entered values; **no enumeration**. Surface "Forgot password?" / lockout after repeated failures.
- **Success** — go straight to the destination; no "Continue" tap after a successful login.

## Security & session

Neutral messages; never echo/log the password. Make **session expiry** graceful — re-prompt, preserve the
in-progress context, return the user where they were. Don't ask for data you don't need.

## Android / Material delta

**Credential Manager** unifies passwords, passkeys, and federated sign-in (replaces Smart Lock / Google
Sign-In SDK): show a **One-Tap bottom sheet** plus a persistent **"Sign in with Google"** button (Google's
preapproved asset) so users can restart after dismissing the sheet.

## Do / Don't

✅ Lowest-friction method first · keep entered email on error · biometric unlock after first login · neutral
copy · single primary action.
❌ Gate the app behind login when not required · custom dialogs mimicking the system · color-only errors ·
reveal which factor failed · a frozen spinner · forcing "Continue" after success.

**Canonical HIG/Android URLs and AutoFill detail:** **[reference.md](./reference.md)**.
