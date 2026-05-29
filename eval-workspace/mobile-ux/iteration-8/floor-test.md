# Iteration 8 — is the LOW tail a hard floor for the cheap tier?

**Question (from iter-7):** does 4–5× Haiku+skill unioned reach the LOW tail (F9 notifications-mocked-on,
F10 denied-state deep-link, F11 auto-anon-not-`__DEV__`-gated), or is there a hard floor a cheap finder
can't cross? **Answer: NO hard floor.** 6× generic union reaches **10/11**; a cheap *targeted* finder catches
**every** tail item individually; **6× union + one targeted denied-finder = 11/11**, zero hallucinations. The
floor is **soft** — attention/sampling, not capability.

## Design

Two hypotheses, separated in one batch of 6 Haiku+skill finders on `/Users/miniai/jv/fitstake`:
- **Volume:** 3 more *generic* finders (runs 4–6) unioned with iter-7's runs 1–3 → 6× generic union. Does
  resampling reach the tail?
- **Capability:** 3 *targeted* finders, each pointed at one tail item + the owning rule. Can a cheap model
  catch it *at all* when focused (soft floor) or does it fail even then (hard floor)?

Truth set = the 11 Opus+skill findings. Tail = F9 (`onboarding/notifications.tsx`), F10
(`onboarding/region.tsx`), F11 (`_layout.tsx`).

## Volume result — 6× generic union = 10/11

| Run | New tail items | Per-run recall |
|---|---|---|
| 1–3 (iter-7) | — | union F1–F8 = 8/11 |
| 4 | none | F1,F2,F3,F6,F7,F8 |
| 5 | none | F1,F2,F3,F6,F7 |
| 6 | **F9 + F11** | F1,F2,F3,F6,F7,**F9**,**F11** = 7/11 |

**6× union → F1,F2,F3,F4,F5,F6,F7,F8,F9,F11 = 10/11.** Only **F10** missing.

Caveat worth recording: run 6's prompt added "pay attention to subtle issues — mocked states, dev-only code
that ships." That mild nudge is what surfaced F9 + F11, so it's *semi*-targeted, not purely generic. The
honest reading: **pure resampling plateaus around 8/11; a single line steering attention toward "subtle /
mocked / dev-only" lifts the same cheap model to 10/11.** Cheap attention-direction, not more passes, is the
lever for the tail.

## Capability result — targeted cheap finders catch ALL three

| Target | Caught? | Evidence | Bonus |
|---|---|---|---|
| F9 mocked-on | ✅ | `notifications.tsx:45` — `status === 'mocked'` rendered as ON badge | also flagged the `EXPO_PUBLIC_FAKE_STEPS` fake-permission override (`useHealthSteps.ts:48-56`) — a real finding **not in the Opus 11** |
| F10 denied deep-link | ✅ | `region.tsx:44-46` — `Alert` then `return`, no `Linking.openSettings`; correctly judged notifications-denial non-blocking | — |
| F11 dev-gating | ✅ | `_layout.tsx:58-69` — `AutoAnonymousSignIn` mounted unconditionally, no `__DEV__` guard | — |

Every tail item is reachable by a cheap finder when its attention is pointed at the right rule. **The hard-floor
hypothesis is rejected.**

## Combined ceiling

**6× generic union (10/11) + the targeted denied-finder (F10) = 11/11** — the full Opus+skill ceiling, on the
cheap tier, with **0 hallucinations** and one *extra* verified-real catch (the fake-steps override) beyond it.

## Conclusion — the tiering picture is now complete

1. **No hard floor.** Haiku+skill reaches 11/11 given enough finders + light attention-direction. Nothing in
   the truth set *requires* a frontier model to be *found*.
2. **The cheap lever is attention, not volume.** Generic resampling plateaus ~8/11; the LOW tail (subtle,
   inference-chain findings) needs a finder *told* to look for mocked states / denied dead-ends / shipped
   dev code. One steering sentence beats three more blind passes.
3. **Precision held at 100% across all 6** — no fabricated code; the only borderline was run 5's
   "missing NSLocationWhenInUse string" (a necessity call, not a hallucination).
4. **So what is the frontier model still for?** Not *finding* (the cheap tier gets there) — but **judgment**:
   severity calibration, deciding real-vs-noise among the cheap tier's wider net (Sonnet/Haiku no-skill
   scope-drift), and writing the fix. Identify on the cheap tier; **adjudicate** on the frontier.

## Recommended cheap-tier recipe (to fold into the skill)

For full-recall on the cheap tier: **a small fan-out of Haiku+skill finders where 1–2 are *steered* at the
subtle classes** — `mocked/faked status`, `denied-state recovery`, `dev-only code that ships` — then union.
That reaches the ceiling without a frontier *identification* pass; reserve the frontier model for
adjudication/severity/fixes.

## Next (iteration 9)

- Cost-normalize the whole arc (iters 6–8): recall per token/$ for {Haiku×N generic, Haiku×N steered,
  Sonnet+skill, Opus+skill} to draw the true Pareto front and pick defaults per use-case.
- Generalize off fitstake: repeat the steered-fan-out recipe on a second app (aurora/health-app) to confirm
  the "steer at subtle classes → ceiling" recipe isn't fitstake-specific.
