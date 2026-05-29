# paywall-monetization-flow — canonical references & deep dives

Supporting material for [SKILL.md](./SKILL.md). **Re-verify before shipping — these rules change.**

## Canonical references

- [HIG In-app purchase](https://developer.apple.com/design/human-interface-guidelines/in-app-purchase) ·
  [HIG Subscriptions](https://developer.apple.com/design/human-interface-guidelines/subscriptions)
- [App Store Review Guidelines §3.1 Payments](https://developer.apple.com/app-store/review/guidelines/#payments) ·
  [Apple Developer Program License Agreement (Schedule 2)](https://developer.apple.com/support/terms/apple-developer-program-license-agreement/) ·
  [Standard EULA](https://www.apple.com/legal/internet-services/itunes/dev/stdeula/)
- [StoreKit SubscriptionStoreView](https://developer.apple.com/documentation/storekit/subscriptionstoreview) ·
  [Offering/restoring IAP](https://developer.apple.com/documentation/storekit/offering-completing-and-restoring-in-app-purchases)
- Google: [Play Billing](https://developer.android.com/google/play/billing) ·
  [Subscriptions](https://developer.android.com/google/play/billing/subscriptions) ·
  [Subscriptions policy](https://support.google.com/googleplay/android-developer/answer/9900533)

## §3.1 Payments (detail)

- **3.1.1 IAP** — digital unlocks must use IAP; provide **Restore** for restorable products; IAP credits
  can't expire; loot boxes must disclose odds. Non-sub apps may offer a Tier-0 "XX-day Trial" but must first
  state duration, what becomes inaccessible, and downstream charges.
- **3.1.1(a)** — External Purchase Link Entitlement (region-specific); **US storefront** allows external
  purchase CTAs without it.
- **3.1.2 Subscriptions** — ongoing value, ≥ 7 days, all devices; no extra tasks for paid value; no
  stripping paid functionality. **3.1.2(c):** clearly describe what the user gets and meet **Schedule 2**.
- **3.1.3 / reader apps** — External Link Account Entitlement for managing accounts on the web.

## Schedule 2 §3.8(b) — required disclosure (verify against the current signed agreement)

Title; length; price (and price per unit if appropriate); description of content/services; functional links
to Privacy Policy and Terms of Use. Recommended best-practice copy: charged to Apple ID at confirmation;
auto-renews unless turned off ≥ 24 h before period end; renewal charged within 24 h of period end; manage in
Account Settings; unused free-trial portion forfeited on purchase.

## Google Play disclosure (detail)

Show cost, billing frequency, auto-renewal terms, and whether a subscription is required — without extra
taps. Same anti-deception rule on annual-vs-monthly pricing. Provide an easy in-app online cancel path.
