# login-flow — canonical references & deep dives

Supporting material for [SKILL.md](./SKILL.md).

## Canonical references

- [Onboarding](https://developer.apple.com/design/human-interface-guidelines/onboarding) ·
  [Managing accounts](https://developer.apple.com/design/human-interface-guidelines/managing-accounts) ·
  [Privacy](https://developer.apple.com/design/human-interface-guidelines/privacy) ·
  [Loading](https://developer.apple.com/design/human-interface-guidelines/loading) ·
  [Feedback](https://developer.apple.com/design/human-interface-guidelines/feedback)
- AutoFill / one-time codes: [Security — one-time codes](https://developer.apple.com/documentation/security/one-time-codes)
- Android: [Credential Manager](https://developer.android.com/identity/sign-in/credential-manager) ·
  [Sign in with Google](https://developer.android.com/identity/sign-in/credential-manager-siwg)

## Fields: keyboard + AutoFill (detail)

- **Email/username** → username content type, email keyboard, autocapitalization off.
- **Password** → password content type; sign-up uses **new-password** to trigger Automatic Strong Password.
- **OTP / verification code** → one-time-code content type (web `autocomplete="one-time-code"`), numeric
  keyboard — the system surfaces the SMS code in the QuickType bar.
- Password AutoFill needs the **Associated Domains** entitlement (`webcredentials:` + a valid
  `apple-app-site-association` file). Android equivalent: **Credential Manager** + Digital Asset Links.

## Biometric re-auth (detail)

Store the session/refresh token in the **Keychain** (Android Keystore) and gate it with the platform
biometric API; set the Face ID usage string on iOS. Biometrics unlock the stored credential — server auth
still happens. Always offer a passcode/password fallback. Prefer **passkeys** where possible (see
[auth-flows](../auth-flows/SKILL.md)) — they fold biometrics into the credential.
