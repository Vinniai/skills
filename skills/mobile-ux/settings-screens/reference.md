# settings-screens — canonical references & deep dives

Supporting material for [SKILL.md](./SKILL.md).

## Canonical references

- [HIG Settings](https://developer.apple.com/design/human-interface-guidelines/settings) ·
  [Lists and tables](https://developer.apple.com/design/human-interface-guidelines/lists-and-tables) ·
  [Toggles](https://developer.apple.com/design/human-interface-guidelines/toggles) ·
  [Managing accounts](https://developer.apple.com/design/human-interface-guidelines/managing-accounts)
- Android: [Settings pattern](https://developer.android.com/design/ui/mobile/guides/patterns/settings) ·
  [Settings implementation](https://developer.android.com/develop/ui/views/components/settings)
- Related: [auth-flows](../auth-flows/SKILL.md) (delete account, sign-out) ·
  [permissions-flow](../permissions-flow/SKILL.md) (notification + privacy rows) ·
  [paywall-monetization-flow](../paywall-monetization-flow/SKILL.md) (manage subscription)

## HIG Settings (detail)

"Minimize the number of settings you offer"; "provide default settings that give the best experience to the
largest number of people"; "avoid using settings to ask for setup information you can get in other ways";
"respect people's systemwide settings and avoid including redundant versions"; "prefer letting people modify
task-specific options without going to your settings area" (moving them disconnects them from context).
watchOS apps don't add custom settings to the system Settings app.

## Account / profile section (detail)

Identity (name, avatar, email/handle); **Account & security** (password, 2FA, connected sign-in methods,
passkeys → [auth-flows](../auth-flows/SKILL.md)); **Subscription** (manage/restore →
[paywall-monetization-flow](../paywall-monetization-flow/SKILL.md)). Name the auth method specifically
("Sign in with Face ID", not a generic "Sign In").

## Android settings (detail)

What does NOT belong: frequently-accessed actions, app info (→ About), account management, anything already
in device settings. Place in top-app-bar overflow or nav drawer; keep accessible signed-out. Overview = list
layout; 15+ settings → list-detail subscreens (cap max-width). Group via containment (whitespace/dividers/
cards) + headings. Don't replicate/replace system settings.
