# auth-flows — canonical references & deep dives

Supporting material for [SKILL.md](./SKILL.md).

## Canonical references

- [Sign in with Apple](https://developer.apple.com/design/human-interface-guidelines/sign-in-with-apple) ·
  [Managing accounts](https://developer.apple.com/design/human-interface-guidelines/managing-accounts) ·
  [Onboarding](https://developer.apple.com/design/human-interface-guidelines/onboarding) ·
  [Privacy](https://developer.apple.com/design/human-interface-guidelines/privacy)
- [App Store Review Guidelines](https://developer.apple.com/app-store/review/guidelines/) — 4.8 Login
  Services, 5.1.1(v) Account Sign-In & Deletion ·
  [Offering account deletion](https://developer.apple.com/support/offering-account-deletion-in-your-app/)
- [Passkeys](https://developer.apple.com/passkeys/) ·
  [Supporting passkeys](https://developer.apple.com/documentation/authenticationservices/supporting-passkeys) ·
  [One-time codes](https://developer.apple.com/documentation/security/one-time-codes)
- Android: [Credential Manager](https://developer.android.com/identity/sign-in/credential-manager) ·
  [Sign in with Google](https://developer.android.com/identity/sign-in/credential-manager-siwg)

## Guideline 4.8 — Login Services (detail)

If an app uses third-party/social login to set up or authenticate the primary account, it must also offer an
equivalent that (a) limits data to name + email, (b) lets users keep the email private, (c) doesn't collect
in-app interactions for ads without consent. SIWA satisfies all three. *Not required* if you only use your
own account system, an alternative-marketplace login, an education/enterprise org account, a government ID
system, or you're a client where users sign into a specific third-party service directly.

## Guideline 5.1.1(v) — Account deletion (detail)

In force since June 30, 2022. Must **delete the entire account record + associated personal data** (not
deactivate); easy to find; **initiated in-app** (a website may only complete it, via a direct in-app link —
true even if sign-up linked out). Includes user-generated and guest/auto-generated accounts. For
auto-renewable subscriptions, tell users billing continues via Apple and to cancel separately
(`showManageSubscriptions()` or `https://apps.apple.com/account/subscriptions`).

## Sign in with Apple button (detail)

System titles: "Sign in with Apple" / "Continue with Apple" / "Sign up with Apple" — pick one, stay
consistent, don't translate yourself. Styles: Black / White / White-outline. Default height ~44 pt; match
peer buttons; corner radius adjustable via the API. Keep ~1/10-height clear space. Don't recreate the logo
or alter colors/proportions. **Hide My Email** yields a relay `…@privaterelay.appleid.com` — capture the
email on first authorization (absent later); never use it as a stable display name.

## Passkeys (detail)

FIDO/WebAuthn key pairs synced via iCloud Keychain; phishing-resistant. Require **Associated Domains**
(`webcredentials:`) + an `apple-app-site-association` file over HTTPS; Android uses **Digital Asset Links**
(`assetlinks.json`). Create with `ASAuthorizationPlatformPublicKeyCredentialProvider`. Offer passkey
creation after first successful sign-in; keep an alternate recovery factor.
