---
name: paywall-monetization-flow
description: Design or review a mobile paywall / subscription / in-app-purchase flow that both converts and passes App Store review. Covers hard vs soft paywalls and when to show them, plan presentation (monthly/annual toggle with savings, "most popular", free-trial framing), the MANDATORY pre-purchase disclosures Apple enforces (title, length, price & price-per-unit, what you get, auto-renew terms, Terms/Privacy links) and the required Restore Purchases affordance, StoreKit SubscriptionStoreView, plus Google Play billing deltas. Grounded in Apple HIG + App Store Review Guideline 3.1 and Schedule 2. Use when building or critiquing a paywall, pricing screen, subscription/IAP UI, free trial, or fixing a payments-related App Store rejection. For underlying rules see mobile-ux-foundations.
tags: [paywall, subscriptions, iap, monetization, app-store-review, storekit, hig]
---

# Paywall & monetization flow

A paywall serves **two masters**: conversion and App Store review. Most rejections here are **disclosure**
failures, not taste — so the hard requirements come first. Rules: [mobile-ux-foundations](../mobile-ux-foundations/SKILL.md).
Stack-agnostic. The amounts/rules below are **time- and region-sensitive — re-verify against
[reference.md](./reference.md) before shipping.**

## ⚡ Non-negotiables (the rejection-prone parts)

- **No monetization → no paywall.** A free app with nothing to sell must **not** gate content. Don't
  over-monetize.
- **Required ON the paywall, before purchase — Required-elements checklist:**
  - [ ] **Title** of the subscription
  - [ ] **Length** (billing period)
  - [ ] **Price**, and the **actual charged total** (an annual plan **must** show e.g. *$59.99/yr*, **not
    only** *"$4.99/mo"* — showing only the monthly-equivalent is a documented rejection)
  - [ ] **What the user gets** (content/services)
  - [ ] **Functional Terms of Use (EULA) + Privacy Policy links**
  - [ ] **Restore Purchases** affordance ← *most commonly forgotten; missing it is a frequent rejection*
- **Use IAP for digital goods** (3.1.1). External checkout for digital unlocks is allowed only in the **US
  storefront** or via the **External Purchase Link Entitlement** in some regions — otherwise prohibited.
- **Free trial:** before it starts, state **duration**, **what becomes inaccessible after**, and the
  **price/auto-renew terms after** (3.1.1).
- Subscriptions must give ongoing value, **last ≥ 7 days**, and work on all the user's devices (3.1.2).

## When to use

- Building/reviewing a **paywall, pricing screen, subscription/IAP UI, or free trial**.
- Deciding **when** to show it and **hard vs soft**.
- Fixing a **payments-related App Store rejection** (3.1.x).

## Use the platform paywall view

`SubscriptionStoreView` (SwiftUI) renders a single-group paywall and handles much of the compliance burden:
plan picker, adaptive CTA, **per-plan disclosure text**, trial-eligibility, and modifiers for **Restore**,
**Redeem Code**, **Privacy/Terms**. You still own receipt validation, entitlements, and any custom
multi-page paywall. (RevenueCat etc. manage offerings — the disclosure + restore rules still apply.)

## Conversion patterns

**When to show it** — *onboarding paywall* (after a short value demo; pair with a clear dismiss unless hard)
+ *contextual gate* (at a premium action; highest intent). Soft onboarding + contextual gates + re-prompts wins.

**Hard vs soft** — hard blocks all use until subscribe/restore (must still offer Restore); soft lets users
explore with limits, dismissible, re-presented at high-intent moments.

**Plan presentation**

```
   [ Monthly $9.99/mo ]   [ Annual ⭐ Best value ]   ← default-select the plan you push
                          [ $59.99/yr ($5.00/mo) ]   ← REAL total + monthly-equivalent
                          [ Save 50% ]
   ✓ benefit-led bullets    ★★★★★ social proof near CTA
   [        Start 7-day free trial        ]          ← single primary CTA, label adapts
   Restore Purchases     Terms · Privacy             ← required, subordinate
   then $59.99/year. Cancel anytime in Settings.     ← disclosure, on-screen
```

Default-select annual + badge "Best value"; 1 plan avoids paralysis, 2–3 anchor (avoid >3); trial timeline
("Day 5 reminder → Day 7 billed") + pre-charge reminder cut churn/refunds; benefit-led copy; one primary CTA.

**Lifecycle** — manage links (iOS `apps.apple.com/account/subscriptions` / `showManageSubscriptions`;
Android `play.google.com/store/account/subscriptions`); easy cancel; **win-back** offers at cancel-time;
billing grace/retry + dunning before treating a user as churned.

## iOS ↔ Android divergence

| | Apple | Google Play |
|---|---|---|
| Engine | IAP / StoreKit | Play Billing |
| External payments | US storefront / entitlement only | more permissive (alternative/external billing, region-dependent) |
| Model | products + subscription offers | base plans + offers; also prepaid & installments |
| Disclosure | Schedule 2 §3.8(b) | anti-deception policy (same annual-vs-monthly rule) |

## Do / Don't

✅ All disclosures on the paywall · real charged total · visible Restore · single primary CTA ·
default-select annual · trial timeline + reminder · IAP for digital · re-verify §3.1 + Schedule 2.
❌ Hide disclosures behind a link · show only the monthly-equivalent · omit Restore · custom
purchase-confirmation dialog (StoreKit provides one) · external checkout for digital outside permitted
storefronts · color-only plan selection · a trial that doesn't state what's charged after.

**Guideline §3.1 text, Schedule 2 detail, StoreKit & Play URLs:** **[reference.md](./reference.md)**.
