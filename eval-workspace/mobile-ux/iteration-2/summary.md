# mobile-ux — eval iteration 2

**Result (independently judged): skill 24/24 (1.000) vs baseline 0.813 → +0.187 lift.**
And: **loading the ONE relevant skill (~2.65k tok) scores identically to loading all six (~15.9k tok)** — same points, ~6× cheaper.

## What changed from iteration 1 (all three caveats addressed)

1. **Bigger, harder set** — 24 items (was 16). Added 8: a trial-disclosure detail (18), 2FA recovery (19),
   modality/alert-stacking (20), an **iOS-vs-Android divergence** (21), nav tab-count (22), a magic-link
   item (24), plus two **traps**: over-trigger (17 — "should a free app show a paywall?") and a
   no-fixed-answer honesty test (23 — "exact pixel width of the Sign in with Apple button?").
2. **Independent judge** — a separate subagent graded every answer against the key (iteration 1 was
   self-graded). Removes most author bias.
3. **Third condition (`skill_targeted`)** — each item answered after reading **only its one owning skill**,
   to measure the token/points tradeoff directly.

## Numbers

| Condition | Pass rate | Skill-content tokens loaded |
|---|---|---|
| baseline (no skill) | 0.813 (39/48, runs 0.833 / 0.792) | 0 |
| skill_all (read all 6) | **1.000** (48/48) | ~15,924 |
| skill_targeted (read 1) | **1.000** (24/24) | ~2,654 avg |

Lift is +0.187 either way. **The extra five skills add no points for a given question** — only the
relevant one matters. (Per-file sizes: foundations 2.9k, auth 2.8k, paywall 2.8k, permissions 2.7k,
settings 2.4k, login 2.3k.)

## Where the skills earned their keep (5 lift items)

| Item | Baseline failure | Why it's the kind of thing a skill should catch |
|---|---|---|
| **10** Restore Purchases | both runs listed Terms+Privacy but **omitted Restore Purchases** | hard App Store requirement, frequently forgotten |
| **13** signed-out settings | both said gating settings behind login is "fine" | non-obvious convention |
| **15** ATT triple | both named only **2 of 3** violations (missed the skip/escape-hatch rule) | completeness on a multi-part rule |
| **21** Android divergence | both applied the **iOS** deep-link-to-Settings pattern to Android | models default to the iOS mental model |
| **2** appearance toggle | one run called an in-app toggle "fine" | easy to wave through |

The two traps (17 over-trigger, 23 honesty) and the famous rules (44 pt, Sign in with Apple 4.8,
in-app deletion 5.1.1(v), enumeration, IAP 3.1.1) showed **no lift** — baseline already nails them.
That's the credibility check: the skill only gains on genuinely non-obvious or completeness-sensitive points.

## The token finding, stated plainly

`skill_all` reads everything and so doubles subagent tokens — but that's an **artifact of the eval**, not
how skills load. In Claude Code the router loads **one** skill by description match. The lift comes
entirely from that one skill (~2.65k tokens). So the real-world cost of the +18.7 pts is ≈2.65k tokens,
not 15.9k. This is the lever the improvement plan below pulls on.

## Remaining caveats

- **Single independent judge** (not a panel) — residual grading bias possible; next iteration should use
  2–3 judges and take consensus.
- **No routing metric yet** — the "one relevant skill" assumption rests on the frontmatter `description`
  actually causing single-skill loading. Iteration 3 should add a routing eval: given a task, does exactly
  the right skill load?
- **Deterministic answers** (stddev ~0) → the set is still mostly "knowledge recall"; add more
  reasoning/trade-off items where two rules conflict.

## Iterative improvements — reduce tokens AND raise points

See the parent reply for the full plan; in priority order:
1. **Lean on single-skill loading** (sharp descriptions) — already ~6× cheaper than bundling; protect it
   with a routing eval (iter 3). *(tokens ↓↓)*
2. **Progressive disclosure** — move the canonical-URL reference blocks and Android deep-dives into sibling
   `reference.md` files loaded on demand; keep SKILL.md to decision rules. Trims always-loaded size ~2.65k → ~1.5k. *(tokens ↓)*
3. **Front-load a "non-negotiables / commonly-missed" table** carrying the 5 lift facts (Restore, signed-out
   settings, ATT triple, Android divergences, no-toggle) in the first ~300 tokens. *(points ↑, survives truncation)*
4. **Explicit checklists** for "list all required elements" items (paywall disclosure) so none drop. *(points ↑)*
5. **An iOS-vs-Android divergence table** per skill — divergences are where baseline defaults to iOS. *(points ↑)*

Items 2–3 are the same restructure: shrinking the file while front-loading the high-value facts cuts tokens
and raises points at once. Test it in iteration 3 as a `skill_lite` condition (front-matter table only,
~1.3k tok) — hypothesis: retains 1.000 at half the tokens of `skill_targeted`.
