# Build A/B — building "Debrief" with vs without the mobile-ux skills

**Setup.** A fresh app ("Debrief" — daily debrief & memory capture) built **twice from the same template**
(EvanBacon/chat-template, Expo SDK 56), same MVP spec (`debrief-ab/BUILD-SPEC.md`), two background agents.
One read the six `mobile-ux` skills first; one used only its own expertise. Both ran `bun install` + typecheck.
**Every claim below was read from the generated code**, not the agents' self-reports.

| | src files | typecheck | files created |
|---|---|---|---|
| with skills | 37 (leaner) | **pass — tsc 0, lint 0** | 23 |
| without skills | 62 | pass (left 1 pre-existing template tsc error + 4 template lint errors) | 31 |

## Headline — honest

Both agents built a coherent, compiling MVP, and a **strong baseline got most compliance right on its own**.
The skills produced **three verified, concrete improvements** — the most striking being an anti-pattern the
baseline built and the skills avoided, **reproducing the fitstake `ThemeToggle` finding in a clean build**.

## Verified differentiators (read from code)

1. **In-app appearance toggle — foundations non-negotiable ("ship none").**
   - **without skills:** built the anti-pattern — `(app)/appearance.tsx` ships a System/Light/Dark override
     (`setAppearance`).
   - **with skills:** `settings/appearance.tsx` ships **no toggle** — follows the system, footer points to
     iOS Settings, code comment cites `mobile-ux-foundations`.
   - *This is the exact mistake the fitstake audit caught, now avoided at build time because the skill was loaded.*

2. **Permission denied-state at the point of use — permissions skill.**
   - **without skills:** `components/ui/voice-recorder.tsx:49` → `if (!perm.granted) return;` — tap record,
     deny mic, **nothing happens** (silent dead-end).
   - **with skills:** the voice recorder shows an Alert with **"Open Settings"** (`Linking.openSettings()`)
     on iOS and just "OK" on Android — it even encodes the **iOS-vs-Android denial divergence** the skill teaches.

3. **Paywall price disclosure — "show the real charged total, not only monthly."**
   - **without skills:** shows a single `p.price` per plan.
   - **with skills:** shows the billed-as total **and** a secondary per-month equivalent + plan title.
   - Minor, but exactly the disclosure nuance the paywall skill front-loads.

## Ties — baseline already strong (the credibility check)

Both got these right, so the skills showed no lift here — same pattern as every prior iteration (famous rules
don't move):
- **System Sign in with Apple button** (both used `AppleAuthentication.AppleAuthenticationButton`, not a
  custom one — the fitstake mistake did *not* recur in either fresh build).
- In-app **account deletion** that truly deletes; **visible sign-in errors** (no swallow); **Restore +
  Terms + Privacy** on the paywall; **in-context** permission requests; **guest / no forced login**.

## Reading

- **The skills' value showed up as anti-pattern avoidance + consistency**, not raw feature count. The
  baseline built *more files* (62 vs 37) but also built the appearance-toggle anti-pattern, left a silent
  permission dead-end, and left the template's pre-existing errors in place. The skilled build was leaner,
  cleaner (0/0), and more consistently compliant on the non-obvious points.
- **Where the skills are decisive is exactly where they were designed to be:** the front-loaded
  non-negotiables (no appearance toggle, denied-state handling, paywall real-total) and the divergence tables
  (iOS vs Android denial) — all three differentiators trace to those.
- **A strong model still gets the famous rules right without the skills.** The honest takeaway across the
  whole project holds: the skills reliably enforce the non-obvious UX-compliance layer and prevent specific
  anti-patterns; they're a high-value, low-token complement, not a substitute for a capable model.

## Caveats

- Billing is stubbed in both (no real StoreKit) — the paywall *screen* is what's compared, not live IAP.
- Both are MVPs, not submitted apps; "App Store ready" is assessed at the code/flow level, not via review.
- One run each (no n>1); the differentiators are deterministic code facts, but build-to-build variance on a
  task this large is real — treat the three findings as illustrative, not a precise lift number.
