# Iteration 9 — cost-normalized Pareto front + generalization to a second app

Two questions from iter-8: **(A)** what's the recall-per-dollar Pareto front across the tiers, and **(B)**
does the steered-fan-out recipe generalize off fitstake? **Answers:** (A) **Sonnet+skill is the
single-pass value king**; Haiku-steered-fan-out matches recall but only wins cost when you're already
fanning out; Opus is for adjudication, not identification. (B) **Generalizes** — on travel-app (a
structurally different app) the steered Haiku fan-out hit **10/12, 4/4 ship-blockers, 0 hallucinations**,
and the misses were again a *soft* floor.

---

## Part A — cost-normalized Pareto (from iters 6–8 token data)

Token counts are the `subagent_tokens` totals actually observed. Pricing is **approximate public list
price**, blended at ~85% input / 15% output (these agents are file-read-heavy): Haiku ≈ $1.6/MTok,
Sonnet ≈ $4.8/MTok, Opus ≈ $24/MTok. Treat $ as **order-of-magnitude**, not invoice-exact; the *ratios*
are the point.

| Tier (per run) | ~tokens | ~$/run | role |
|---|---|---|---|
| Haiku+skill generic finder | ~110k | **$0.18** | broad coverage |
| Haiku+skill steered finder | ~78k | **$0.12** | tail (mocked/denied/dev-gate) |
| Sonnet+skill | ~97k | **$0.47** | single-pass identify |
| Opus+skill | ~85k | **$2.04** | ceiling / adjudicator |

**Recall-per-recipe (fitstake 11-finding set):**

| Recipe | Recall | ~Cost | Calls / latency |
|---|---|---|---|
| 1× Haiku+skill | ~6/11 | $0.18 | 1, fast |
| **Sonnet+skill ×1** | **10/11** | **$0.47** | **1, low latency** |
| Haiku steered fan-out (1 generic + 3 steered) | 10–11/11 | $0.55 | 4 parallel |
| Opus+skill ×1 | 11/11 | $2.04 | 1 |

**The Pareto front (non-dominated):**
1. **Sonnet+skill, single pass — the value king.** 10/11 for ~$0.47 in ONE call. Once you account for
   needing *several* Haiku finders to match recall, the "cheapest model" stops being the cheapest *path* —
   Sonnet+skill costs about the same as a 4-finder Haiku fan-out, with lower latency and no orchestration.
2. **Haiku steered fan-out** — only wins when you're *already* fanning out (loop-until-dry, or you want the
   steered tail finders) or need the lowest per-finder unit cost on a parallel budget.
3. **Opus+skill** — dominated on $/recall for *identification*; reserve its spend for **adjudication**
   (severity, prune the cheap tier's wide net, write fixes) where judgment — not coverage — is the job.

> Headline: **cheapest-model ≠ cheapest-path-to-a-recall-target.** For "find the violations," Sonnet+skill
> single-pass is the default; drop to Haiku fan-out only when parallel and tail-hunting; spend Opus on the call.

---

## Part B — generalization to travel-app (different app, different profile)

travel-app shares only `lib/theme.ts` with the fitstake family — no RevenueCat/paywall, ThemeToggle not used
in screens, travel domain. So its finding profile *differs*, which makes this a real generalization test.

**Ceiling — Opus+skill = 12 findings (T1–T12):** account-deletion (T1, HIGH), custom Apple button (T2,
HIGH), auto-anon not `__DEV__`-gated (T3, HIGH), missing usage strings + `usesAppleSignIn` (T4, HIGH),
forced-dark `ThemeContext` override + `toggleTheme` (T5, MED), sign-in errors swallowed (T6), auto-sign-in
errors swallowed (T7), no user-facing sign-out (T8), no Terms/Privacy at sign-in (T9), push permission on
mount not in-context (T10), no in-app notification settings despite `setPushPrefs` (T11), denied-notification
silent dead-end (T12, LOW).

**Haiku steered fan-out (4 finders) vs ceiling:**

| Finder | Caught |
|---|---|
| generic | T1,T2,T3,T4,T6,T8,T9,T10 (8) |
| steered: mocked-status | **"none"** — correct; travel-app checks real OS status (no false positive) |
| steered: denied-state | T10, **T12** |
| steered: auth-gating | T1,T2,T3,T6,T7,T8,T9 |
| **UNION** | **T1,T2,T3,T4,T6,T7,T8,T9,T10,T12 = 10/12** |

- **Ship-blockers (T1–T4): 4/4.** · **Hallucinations: 0.** · Missed: **T5** (forced-dark lives in
  `contexts/ThemeContext.tsx` — no finder was pointed at `contexts/`), **T11** (a missing-affordance
  inference).
- Same shape as fitstake: ship-blockers + most MED on the cheap tier, **0 hallucinations**, and the gap is a
  **soft floor** — an appearance/theme-steered finder pointed at `contexts/` would catch T5, exactly the
  iter-8 lesson (attention, not capability).

**Why this is generalization, not repetition:** the *profile* changed — no paywall findings at all, and the
appearance violation manifested differently (a context forcing dark + exposing a toggle, vs fitstake's
in-screen ThemeToggle). The recipe found the *new* app's actual issues, including a sharp one (forced-dark
override) the ceiling model also flagged. The mocked-status finder's honest "none" shows the steering
doesn't manufacture findings to fill its quota.

---

## Conclusions

1. **Default recipe = Sonnet+skill single pass** for identification (best $/recall, low latency). Escalate to
   **Haiku steered fan-out** only when already parallelizing or hunting the subtle tail; reserve **Opus** for
   adjudication.
2. **The steered-fan-out recipe generalizes** across apps and finding profiles: ship-blocker recall is
   complete, precision is 100%, and the residual gap is always a *soft* floor closable with one more steered
   finder (here: a `contexts/`-aware appearance finder).
3. **Add `contexts/` and theme-provider files to the appearance-toggle steering** — T5 shows the in-app
   appearance violation can hide in a provider, not just a settings screen. (Fold into the audit grep map.)

## Next (iteration 10)

Validate the **adjudication half** of the pipeline (so far only *identification* is proven): give a frontier
model the cheap tier's *wide net* (real findings + the no-skill scope-drift noise + borderline items) and
measure whether it correctly **keeps the real findings, drops the noise, and assigns severity** matching the
truth set. That closes the loop: cheap identifies, frontier adjudicates.
