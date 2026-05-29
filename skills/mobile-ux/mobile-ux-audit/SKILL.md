---
name: mobile-ux-audit
description: Audit an EXISTING mobile app (or a feature/screen) against the mobile-ux non-negotiables and App Store / Play compliance rules, grounded in the real code. Produces a ranked findings report — each finding carries severity, the exact file:line, the violated rule with its HIG/guideline citation, and a concrete fix. Use when asked to audit, review, or "check compliance" of a shipping or in-progress app's auth/login, sign-up, Sign in with Apple, account deletion, paywall/subscriptions, permissions, settings, navigation, dark mode, or accessibility — or to gate a release on UX/store-review risk. The flow skills ([login](../login-flow/SKILL.md), [auth](../auth-flows/SKILL.md), [paywall](../paywall-monetization-flow/SKILL.md), [settings](../settings-screens/SKILL.md), [permissions](../permissions-flow/SKILL.md), [foundations](../mobile-ux-foundations/SKILL.md)) define what's correct; this skill is the procedure for finding where the code violates them. Not for greenfield design (read the flow skill directly) and not a general code review (it targets the UX-compliance layer — say so and pair with a broad review for full coverage).
tags: [mobile, ux, audit, compliance, app-store, hig, ios, android, review]
---

# Mobile UX audit

Find where an existing app violates the `mobile-ux` rules, in its real code, and report it so a fix is
obvious. The flow skills say *what's correct*; this is *how to audit against them*.

## ⚡ Read first (don't skip)

1. **Load the rules.** Read the [foundations](../mobile-ux-foundations/SKILL.md) ⚡ block plus the ⚡
   block of every flow skill relevant to what's being audited. The blocks are where the high-value,
   commonly-missed rules live — that's what audits actually catch.
2. **Ground every finding in code.** A finding without a real `file:line` you have opened and read is
   a hallucination — drop it. Verify the symbol exists before you report it.
3. **State the scope limit.** This audit targets the **UX-compliance layer** (the six flow areas). It
   does **not** cover domain logic, data-layer bugs, security, or legal risk beyond UX. Loading these
   rules *anchors attention* to their areas and will narrow coverage — say so in the report and
   recommend a separate broad review (this is the documented attention-anchoring effect).

## Steps

1. **Map the surfaces.** Locate the screens/modules for each area (grep, don't guess):
   - **auth/login** — sign-in, sign-up, SIWA/SSO, passkeys/OTP, the auth provider, `app.json`
     `usesAppleSignIn`, sign-out, account deletion.
     `rg -n "sign[- ]?in|signIn|AppleAuthentication|apple|signOut|deleteAccount|delete.*account"`
   - **paywall/monetization** — paywall screen, RevenueCat/StoreKit/Play billing, restore, plan list.
     `rg -n "paywall|RevenueCat|Purchases|Offering|restore|StoreKit|entitlement|subscrib"`
   - **permissions** — every request site + `app.json` usage strings/`permissions`.
     `rg -n "requestPermission|getPermission|Permission|usesPermission|NS\w+UsageDescription|HealthKit|Linking.openSettings"`
   - **settings** — settings/profile screens, appearance/theme, notifications.
     `rg -n "settings|profile|appearance|theme|ThemeToggle|colorScheme|setAppearance|reminder"`
   - **foundations** — tab/nav structure, dark-mode handling, tap targets, color-only state.
     `rg -n "Tabs|TabBar|Drawer|createBottomTab|hitSlop|backgroundColor.*red|borderColor.*red"`
   - **layout/devices** — hardcoded insets, missing safe-area handling, content under headers.
     `rg -n "paddingTop:\s*\d|marginTop:\s*\d|StatusBar.currentHeight|insets|SafeArea|edges=|headerTransparent"`
2. **Walk each area's checklist** (below). For every rule, open the owning file, decide pass/fail
   **from the code**, and record failures.
3. **Write each finding** in the [output format](#finding-format): `severity · area · title · file:line ·
   rule+citation · fix`. Rank by severity (ship-blockers first).
4. **Summarize**: counts by severity, the ship-blockers, and the explicit scope caveat from ⚡ #3.

## The non-negotiables checklist (what to look for)

**auth / [auth-flows](../auth-flows/SKILL.md) + [login-flow](../login-flow/SKILL.md)**
- [ ] **In-app account deletion exists** and truly deletes (App Store **5.1.1(v)**) — *ship-blocker if missing.*
- [ ] **Sign in with Apple offered** wherever third-party/social login is, using the **system** button — not a custom-drawn Apple button (**Guideline 4.8** + SIWA button rules).
- [ ] **User-facing sign-out** (not only a hidden/dev screen).
- [ ] **Terms + Privacy linked** at sign-in/sign-up (and on the paywall).
- [ ] **Auth errors surfaced** to the user — not swallowed in a `console.warn`/empty catch.
- [ ] **No forced login** — guest/skip is available; anonymous auto-sign-in is `__DEV__`-gated, not shipped.

**paywall / [paywall-monetization-flow](../paywall-monetization-flow/SKILL.md)**
- [ ] **Restore Purchases** present on an app-owned surface (not only the SDK/dashboard default).
- [ ] **Pre-purchase disclosures on-screen**: price, **real charged total** (not only per-month), billing period, free-trial terms, auto-renew (**Guideline 3.1 / Schedule 2 §3.8(b)**).
- [ ] **Terms + Privacy** reachable from the paywall.
- [ ] **Purchase/restore errors surfaced**, not swallowed.

**permissions / [permissions-flow](../permissions-flow/SKILL.md)**
- [ ] **Asked in context**, at first use — **not** silently on mount/launch.
- [ ] **Usage strings** present and honest in `app.json`/Info.plist for every permission used.
- [ ] **Denied state handled** — calm explanation + **iOS "Open Settings"** deep-link (Android degrades).
- [ ] **No over-broad scopes** (e.g. Always/background location where when-in-use fits; justification not surveillance-flavored).
- [ ] **Real status, not mocked** — a "granted/enabled" UI must reflect the actual OS state.

**settings + foundations / [settings-screens](../settings-screens/SKILL.md) + [foundations](../mobile-ux-foundations/SKILL.md)**
- [ ] **No in-app appearance/dark-mode toggle** — respect the system setting (foundations non-negotiable). A `ThemeToggle`/`setAppearance`/Light-Dark-System picker is a violation. **Check theme providers/contexts too** (`contexts/ThemeContext`, a provider that force-sets a mode on mount or exposes `toggleTheme`) — not only settings screens; the violation often lives in the provider.
- [ ] **Tab bar ≤ 5**, no "More" overflow; top-level = sections not actions.
- [ ] **Sign-out / delete** live in settings, separated, confirmed.
- [ ] **Meaning never by color alone**; tap targets **≥ 44pt / 48dp**; semantic colors (dark-mode safe).
- [ ] **Safe areas read at runtime, not hardcoded** — no literal `paddingTop: 44` / `34`; content stays
  clear of the Dynamic Island/notch/home indicator and doesn't render under a transparent/large-title
  header ([layout-devices](../mobile-ux-layout-devices/SKILL.md)). Hardcoded insets = `baseline-miss`.

## Finding format

```
[SEV] area — short title
  file: path/to/file.tsx:NN
  rule: <the non-negotiable> (<citation, e.g. 5.1.1(v) / 4.8 / Schedule 2 §3.8(b) / foundations: no in-app toggle>)
  why: one line on the user/review impact
  fix: the concrete change
```
Severities: **HIGH** = App-Store/Play ship-blocker or broken core flow · **MED** = real UX/compliance
gap, not a hard reject · **LOW** = polish/consistency. Mark `baseline-miss` on the subtle ones a
generic review tends to skip (in-app appearance toggle, denied-state deep-link, real-charged-total).

## Two grounding modes — use both for full coverage

- **Code-grounded (this skill):** read the source, cite `file:line`. Catches structural/compliance
  rules — account deletion, SIWA button, restore, in-context perms, in-app appearance toggle.
- **Screen-grounded → [mobile-ux-screen-review](../mobile-ux-screen-review/SKILL.md):** review the
  **rendered** screen via Argent (`describe` frames + `screenshot`) to **measure** what code can't —
  tap-target size in pt, contrast, color-only state, safe-area/header overlap. Some violations only
  exist at runtime (e.g. content rendering under a transparent header) and *only* the screen review
  finds them. For a complete audit of a flow, run the code audit **and** screen-review the screens.

## Delivery modes

- **Inline** (Skill tool, main thread): audit one app with the user watching.
- **Delegated** (Agent/subagent): tell the agent to read this skill + the relevant flow skills, then
  audit a target dir and return the report. Fan out one agent per app for a multi-app sweep.
- Append: *"Also review general code quality, data/domain logic, security, and legal risk beyond UX"* —
  this counters the anchoring narrowing (⚡ #3).

### Model tiering — identify cheap, verify frontier

The skill levels a **small/fast model up to frontier accuracy** on this work, so don't pay for a big model
on the whole sweep. Validated split (see `eval-workspace/mobile-ux/`):

- **Identify (cheap + fast):** delegate the broad pass to a small model (e.g. Haiku) **reading this skill**
  — map surfaces, walk the checklist, list candidate findings with `file:line`. This is the expensive-by-
  volume step and the skill carries the rules it would otherwise lack.
- **Adjudicate (mid-tier — Sonnet, *not* necessarily frontier):** feed the cheap tier's wide net to **one
  Sonnet+skill pass** to prune out-of-scope noise, merge duplicates, set final severity, and hold scope.
  Validated to keep 17/17 real findings, drop 5/5 noise, and merge dupes — **as well as or better than Opus**
  (iter-10). Let the identify tier over-collect for recall; adjudication recovers precision cheaply and
  **does not drop real findings**. Reserve **Opus** for the rare genuinely-ambiguous call or writing the
  patch — it is a luxury, not a required stage.

Why split there: the evals show the skill's *factual/rule* lift is large on small models and ~0 on frontier
ones (they already know the facts), while *judgment* (is this a real violation? how bad?) still favors the
stronger model. So spend the small model on coverage, the big model on the call.

**Reaching full recall on the cheap tier (validated):** a single small-model pass catches the obvious
ship-blockers but plateaus (~8/11 on the fitstake set) — the **subtle tail** (mocked status shown as
enabled, a denied-permission dead-end with no Open-Settings deep-link, dev-only code that ships) needs
**directed attention, not more blind passes**. Recipe: fan out a few Haiku+skill finders and **steer 1–2 of
them** at the subtle classes — *"look specifically for: mocked/faked status rendered as granted; denied-state
recovery (Open Settings deep-link); `__DEV__`-only code shipping to production"* — then union. That reached
**11/11 with zero hallucinations** on the cheap tier, so no frontier model is needed to *find* anything;
reserve the frontier model for adjudication, severity, and the fix. (See `eval-workspace/mobile-ux/`
iters 6–8.)

## Notes

- Greenfield design → read the flow skill directly, not this. General bug hunt → use a normal code
  review; this only covers the UX-compliance layer.
- Validated on `fitstake`: a skilled audit reproduces the real violations (in-app `ThemeToggle`,
  missing account-deletion, custom Apple button, silent HealthKit-on-mount, location denied dead-end)
  that a no-skill review misses — see `eval-workspace/mobile-ux/realworld-fitstake/`.
