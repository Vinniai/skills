# mobile-ux — eval iteration 3

**The restructure paid off on both axes: same score, far fewer tokens.**

- **Points held at 1.000** after a **−49% trim** of every SKILL.md (no regression).
- **The non-negotiables block alone (~280 tok) scores 1.000** — identical to reading the full skill, and to
  reading all six.
- **Routing 12/12**, so in practice only the one relevant skill loads.
- **3-judge panel, unanimous** — the single-judge bias caveat is closed.

## What we changed (improvements #2–#5)

Each SKILL.md now opens with a **⚡ Non-negotiables (commonly missed)** block carrying the five iteration-2
lift facts (Restore Purchases, signed-out settings, the full ATT triple, the iOS↔Android denial divergence,
no in-app appearance toggle), plus **iOS-vs-Android divergence tables** and **checklists** (paywall required
elements, auth required flows). The long HIG URL lists and Android deep-dives moved to a sibling
**`reference.md`** (loaded on demand).

| | before (v2) | after (v3) |
|---|---|---|
| SKILL.md avg | ~2,654 tok | **~1,344 tok** (−49%) |
| moved to reference.md | — | ~671 tok/skill (on demand) |
| non-negotiables block | n/a | **~280 tok** |

## Results (24 items, 3-judge panel)

| Condition | Pass rate | Skill tokens to get there |
|---|---|---|
| baseline (carried) | 0.813 | 0 |
| skill_all_v3 (read all 6 leaner files) | **1.000** | ~8,065 |
| skill_lite (non-negotiables block only) | **1.000** | **~280** |

Lift is +0.187 in every skill condition — same as iterations 1 & 2. The restructure **moved the cost, not the
value.**

## Token-efficiency ladder (tokens to reach 1.000)

```
all six, full, v2          15,924   ← iteration 1/2 "load everything" upper bound
all six, full, v3           8,065   ← after trim + reference split
one relevant skill, v3      1,344   ← real-world single-skill load
one relevant non-neg block    280   ← front-loaded essentials only
```

**~57× cheaper** than the iteration-1 approach, **~9.5× cheaper** than iteration-2's targeted full skill —
for an **identical** score. The lever was front-loading + single-skill routing, exactly as hypothesised.

## Routing (validates single-skill loading)

A router agent picked the correct owning skill as the **top match for all 12** realistic tasks. Genuinely
cross-cutting tasks surfaced a sensible runner-up (delete-account → auth/settings; Face ID → login/auth;
dark-mode toggle → settings/foundations). So the "one relevant skill, ~1,344 tok" — or even "~280 tok block"
— is what actually loads in practice; the 8k/16k "read everything" figures never occur in real use.

## Net effect across all three iterations

- **Points:** baseline 0.813 → skill 1.000 (+0.187), stable across 16→24 items, self-grade → independent →
  3-judge panel, and across verbose → lean skills.
- **Tokens:** the cost of that lift fell from ~15.9k (load all six, verbose) to **~280** (front-loaded block of
  the one routed skill) — a ~57× reduction with no points lost.

## Remaining / next

- **skill_lite is a measurement, not a shipped artifact.** The shipped SKILL.md keeps the full body (the
  block + the decision rules) because real tasks need more than the block (e.g. screen anatomy, states). The
  finding that the block alone suffices for *factual* items means: keep the block first and tight so the
  high-value facts survive truncation and load cheaply.
- **Saturation.** Both skill conditions are at 1.000 on this set — it no longer discriminates. Iteration 4
  should add **harder reasoning/trade-off items** (two rules in tension, design-judgment calls) and
  **multi-turn design-critique** tasks to find the next ceiling, plus a few more adversarial traps.
- **Routing at scale.** Test routing when the category sits alongside many unrelated skills (distractors),
  and measure mis-route rate, since the token savings depend on it.
