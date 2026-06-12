# Static analyzer (`react-convex-doctor`) vs LLM agents

We built [`react-convex-doctor`](https://www.npmjs.com/package/react-convex-doctor) — a **deterministic**
Convex-first code analyzer (an oxlint plugin with 39 `convex-*` rules, scores a project 0–100). Its rule
set maps almost 1:1 onto the issues this skill teaches (`convex-no-date-now-in-query`,
`convex-no-filter-in-query`, `convex-no-unbounded-collect`, `convex-no-sequential-ctx-run`,
`convex-no-unnecessary-run-action`, `convex-avoid-redundant-indexes`, `convex-no-untrusted-user-id`,
`convex-crons-internal-only`, `convex-mutation-floating-promise`, …). So: how does the deterministic tool
compare to the skill-equipped LLM agents on the same work?

## Same file (`functions/widgets/operations.ts`)

Run against the real file the LLM agents reviewed (private production project; metrics only).

| Approach | `Date.now()` (5) | general logic bugs | perf/scale | false positives | $/file | time | deterministic |
|----------|:----------------:|:------------------:|:----------:|:---------------:|:------:|:----:|:-------------:|
| **Static doctor** | **5/5** (L88/236/314/392/445) | 0 — *can't*, structurally | 3 `.filter().map()` double-iteration nits (misses the `.take()`-aggregate trunc) | **0** | **~$0** | **<1s** (amortized) | **yes, exact** |
| Sonnet baseline (no skill) | 0/5 | several (real) | take-trunc | some | $0.14 | ~18s | no |
| Haiku/Sonnet + skill | 5/5 | 0 (skill-scoped) | partial | 0 | $0.06–0.17 | 16–30s | no |
| Multi-lens LLM workflow | 5/5 | **8 (verified)** | **7 incl. take-trunc** | 2 dropped | ~$3.53 | ~95s | no |

The doctor matched the LLM+skill pass on the **signature deterministic bug** (`Date.now()` in a cached
query, exact 5/5, the correct lines, zero false positives) at **zero API cost and full reproducibility** —
and it even added 3 real perf nits (`.filter().map()` double passes) the LLM lenses didn't surface.

What the doctor **structurally cannot** find — and the LLM multi-lens workflow did — are the *semantic*
defects no static rule can express: the `.take(500/1000/300)`-aggregate truncation (counts/sums silently
wrong at scale), the `isBillable !== false` undefined-counts-as-billable bug, the double-counted
priority/severity buckets, the `createdAt`-as-wait-proxy, the duplicate/mislabeled return fields. Those
need reasoning about *intent*, which is exactly what the LLM is for.

## Whole-backend scale — the decisive axis

The LLM agents reviewed **one file**. The doctor scanned the **entire Convex backend in a single pass**:

- **126 seconds**, **$0 API** (local compute, no LLM tokens), **deterministic**.
- **464 files** with findings, **4,622 diagnostics**, project score **52/100 ("OK")**.
- Repo-wide rule counts: **176** `convex-no-date-now-in-query`, **366** `convex-no-filter-in-query`,
  **181** `convex-no-sequential-ctx-run`, **167** `convex-avoid-redundant-indexes`, **135**
  `convex-require-auth-check`, **80** `convex-no-unnecessary-run-action`, **42**
  `convex-no-unbounded-collect`, **29** `convex-no-untrusted-user-id` — the same families the skill
  encodes, surfaced exhaustively across the whole codebase.

To get the same whole-repo coverage with LLM agents (per-file review, ~460 files):

| Reviewer | per file | × ~460 files | wall-clock | determinism |
|----------|:--------:|:------------:|:----------:|:-----------:|
| **Static doctor** | ~$0 | **~$0** (126s total) | **~2 min** | exact |
| Haiku + skill | $0.06 | **~$28** | hours | varies run-to-run |
| Sonnet + skill | $0.17 | **~$79** | hours | varies |
| Opus + skill | $0.35 | **~$162** | hours | varies |
| Multi-lens workflow | $3.53 | **~$1,600** | many hours | varies |

For the issues that *can* be written as a rule, the deterministic tool dominates on every axis the cost
analysis cared about: **complete recall, zero variance, ~$0 marginal cost, whole-repo in ~2 minutes**, and
a CI-gateable score. An LLM fleet re-deriving those same rules per file is **tens to thousands of dollars**
and hours, with run-to-run variance.

## Where each wins

| | Static doctor | LLM + skill | LLM multi-lens workflow |
|---|---|---|---|
| Encodable Convex rules (Date.now, filter, indexes, runAction, ctx.run, auth presence, …) | **★ complete, free, deterministic, whole-repo** | redundant — same answers, per-file, paid, variable | redundant for these |
| Semantic / intent bugs (take-aggregate trunc, undefined-as-billable, bucket double-count, wrong proxy field) | ✗ can't express | ~ partial (correctness lens) | **★ catches them, verified** |
| Cost / scale | **★ ~$0, whole repo, 2 min** | $/file, doesn't scale | $$$ — high-value files only |
| Determinism / CI gate | **★ reproducible score** | no | no |

They're **complementary, not competing**. The doctor's existence actually *re-prices the skill*: most of
what the skill teaches an LLM to find (Date.now, filter, indexes, runAction, …) is better handled by the
free deterministic linter. The LLM's durable edge is the **semantic** layer the linter can't reach.

## Bottom line / recommended stack

1. **`react-convex-doctor` as the always-on gate** — run it in CI on every change. It catches the entire
   encodable-rule surface across the whole repo, deterministically, for ~$0. This is strictly better than
   paying an LLM to re-find those same patterns.
2. **The skill on the coding agent** — so the LLM *writes* Convex code that already passes the doctor (and
   doesn't contradict the rules), and so its reviews don't false-positive on the documented exceptions
   (e.g. `.filter` on `.paginate()`).
3. **The multi-lens LLM workflow on high-value files / PRs** — to catch the *semantic* defects the linter
   structurally can't (truncated aggregates, undefined-handling bugs, wrong-proxy-field logic), gated to
   where the ~$3.53/file is worth it.

The earlier cost analysis showed a cheap model + skill beats an expensive default ~5×. This comparison adds
the next tier: for the rules it can encode, a **deterministic analyzer beats every LLM configuration** — on
cost (~$0), recall (complete), determinism (exact), and scale (whole repo in minutes). Spend LLM tokens
only on the judgment the linter can't do.

---

*Doctor: `react-convex-doctor` (oxlint plugin, 39 convex rules), run on the same private production Convex
backend as the `realworld-production` audit — whole-package scan, `--json`, wall-clock 125.6s, 4,622
diagnostics / 464 files / score 52. operations.ts findings reported by rule+line (no source). LLM
cost/recall figures from `cost-analysis.md` and the iteration evals.*
