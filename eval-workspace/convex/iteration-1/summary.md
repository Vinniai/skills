# convex-best-practices — eval iteration 1

**Result: with_skill 8/8 (1.000) vs baseline 6.7/8 (0.833) → +0.167 lift (+16.7 pts).**
n=3 per condition. with_skill stddev 0.0 (3×8/8); baseline stddev ~0.06 (one 6/8, two 7/8).
Strict rubric — correct decision **and** the load-bearing mechanism.

## Method

8 held-out scenarios from `skills/convex/convex-best-practices/evals/evals.json`, each a realistic
"is this Convex code wrong, and why?" question. Two conditions, n=3 parallel general-purpose subagents
each answering all 8 in one pass: **baseline** answers from its own Convex knowledge (no tools/web/files);
**with_skill** reads `SKILL.md` + `conventions.md` first, then answers. This isolates the lift the skill
adds over a strong model's priors. Source material: the official
[best-practices page](https://docs.convex.dev/understanding/best-practices/) (13 rules) and
[`convex_rules.txt`](https://convex.link/convex_rules.txt).

## Where the skill adds value

The lift is concentrated in the two items whose *mechanism* is non-obvious — the baseline reaches a
plausible verdict but misstates *why*:

- **item 7 (`.filter` on a paginated query) — baseline 0/3, with_skill 3/3.** All three baseline runs
  correctly said "it's fine," but for the **wrong reason**: they justified it by "the `by_channel` index
  already narrows the read," and one explicitly claimed filtered rows make pages *sparse/uneven* — the
  **opposite** of how `.paginate()` behaves (it keeps reading to fill the requested page count, which is
  exactly why the exception exists). with_skill cited the actual rule: *a filtered page still returns the
  requested document count*. This is the cleanest discriminator — a right answer with a wrong model.

- **item 2 (`Date.now()` in a query) — baseline 2/3, with_skill 3/3.** The miss inverted the caching
  model: it claimed the moving clock value *forces constant re-execution*. The real (load-bearing)
  mechanism is the reverse — a query only re-runs when its **data** changes, so the `Date.now()` bound
  goes **stale**, and the changing arg over-invalidates the cache. with_skill stated it correctly and gave
  the canonical fix (scheduled job flips an `isReleased` boolean to index, or pass a rounded client time).

## Controls (both conditions 3/3 — confirms the eval isn't rigged)

Six items are things a strong model already knows, and the skill neither helps nor hurts:
collect-then-filter bandwidth cost (1), `runAction` same-runtime overhead (3), per-`runQuery` transaction
isolation (4), redundant prefix indexes (5), public-vs-internal cron targets (6), and spoofable `userId`
auth args (8). The skill's job on these is to make a *capable* model reliable, not to teach it — so a flat
control band is the expected, honest outcome.

## Cost

with_skill spends more tokens (~41k vs ~33k avg) — it reads two skill files first — but ran *faster*
wall-clock (~23s vs ~27s) and used ~2 tool calls (the file reads). For a correctness/security skill the
token premium is worth the eliminated wrong-mechanism answers.

## Caveats & next iteration

- Six of eight items are controls, so the headline +0.167 understates the skill's value on the items that
  matter and overstates how "easy" the set is. A tighter iteration-2 should **swap out the controls** for
  more mechanism-precise discriminators where strong models reliably err, e.g.: the `.collect()` reactive
  read-set causing mutation **conflicts** (OCC), `v.int64()` vs `v.number()`, async iteration vs
  `.collect()`, the table-name-in-`ctx.db` newer API, `"use node"` placement rules, and helper-function
  organization (`convex/model`). Target ≥4 discriminators.
- Consider a **real-code** condition (like mobile-ux's `realworld-fitstake`): point the skill at an actual
  `convex/` file in the monorepo and grade whether it flags the real issues without hallucinating.
- Add a **model-tier** axis (Haiku/Sonnet/Opus × ±skill) once the discriminator set is sharper — the
  current set is too easy to separate tiers.
