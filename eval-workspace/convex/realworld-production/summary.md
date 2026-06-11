# convex-best-practices — real-world audit (private production project)

**Ran the audit on a real file from a private production Convex project — a module of 7 dashboard query
functions over a `task` table (project and path redacted; no source committed here).
The skill flipped the signature Convex bug from a complete miss to a reliable catch.**

This is the real-code validation the synthetic iterations kept pointing to (cf. mobile-ux's
`realworld-fitstake`). No planted ground truth — findings adjudicated by reading the actual file.

## Headline: `Date.now()` in a cached query (rule 13)

Five of the seven functions compute "overdue / upcoming / wait" buckets from `const now = Date.now()`
**inside the query handler** (`getOverdueFaults`, `getJobsPipeline`, `getOverdueItems`, `getUnassignedJobs`,
`getJobsWaiting`). Convex caches a query and only re-runs it when the underlying data changes — so a task
that becomes overdue purely because time passed **won't move buckets until some task in that org is
mutated**. The dashboard's overdue/wait counts silently go stale. Real, user-visible.

| Condition | caught `Date.now()` (5 functions) | false positives |
|-----------|:---------------------------------:|:---------------:|
| **Sonnet baseline ×2** | **0/5 and 0/5** | — |
| Sonnet + skill ×2 | **5/5 and 5/5** | 0 (1 low-value index-naming nitpick) |
| Haiku + skill ×2 | **5/5 and 5/5** | 1 (one run mis-attributed it to `getActiveFaults`) |

**Both strong-model baseline runs missed it entirely.** They produced long, competent lists of *general*
bugs — an `isBillable !== false` check that counts `undefined` as billable, double-counted priority
buckets, `avgWaitTime` using `createdAt` as a proxy for when a task went on-hold — but neither recognized
the Convex-specific caching footgun. **Every with-skill run, including cheap Haiku, caught all five.** This
is the iter-1→3 "Date.now is a universal blind spot" discriminator showing up in production and the skill
closing it.

## Precision held on the well-written parts

The file is mostly good Convex code, and the skill correctly **did not** flag it:
- access control — every function calls `requireOrgContext(...)` + `orgCtx.require("task","read")`;
- validators — all args validated;
- the `.filter(...)` calls are **JS array filters after a bounded `.take()`** (the prescribed pattern, not
  Convex query `.filter`);
- `organizationId`-as-arg is authorized by `requireOrgContext`, not the spoofable-userId antipattern.

No with-skill run raised a false positive on any of these — the rule-6 split and the "review checklist"
from iterations 4/6 doing their job on real code. The only noise: one Sonnet-skill run added two low-value
"index naming convention" nitpicks, and one Haiku-skill run mis-attributed a `Date.now` finding.

## Honest tradeoff

The skill **narrows** the review to Convex correctness. The unfocused baseline, precisely because it
wasn't anchored to Convex rules, surfaced genuine *general* logic bugs (the `isBillable` bug, the
double-counting, the `createdAt` proxy) that the skill-focused runs skipped as out-of-scope. So the skill
is not a replacement for a general code review — it's the thing that catches the Convex-specific defects a
general review (and a strong model on its own) walks right past. Best paired with both.

## Secondary finding (both conditions touched it)

Aggregates (`totalValue`, `totalRevenue`, counts, `avgResolutionTime`) are computed over `.take(500/1000/300)`
reads, so they **silently undercount** once an org exceeds the cap — a real scale concern (rule 3 spirit).
The baseline emphasized this; the skill flagged the `take(1000)`-then-TS-filter reads in `getUnassignedJobs`
/ `getJobsWaiting`.

## Single-skill pass vs multi-lens workflow

We then ran the same file through a **multi-lens review workflow**
([`../convex-multi-lens-review.workflow.js`](../convex-multi-lens-review.workflow.js)) — four isolated
lenses (convex / correctness / performance / security) fanned out in parallel, deduped across lenses, then
an adversarial verify pass on each unique finding. **24 raw → 22 unique → 20 confirmed, 2 dropped** by the
verifier.

| Coverage | single Convex-skill pass | baseline (no skill) | multi-lens workflow |
|----------|:------------------------:|:-------------------:|:-------------------:|
| `Date.now()` in query (Convex) | **5/5** | 0/5 | **5/5** (convex lens) |
| general logic bugs (`isBillable !== false`, bucket overlap, dup return field, `createdAt` proxy, …) | not in scope | found (unverified) | **8 found, verified** (correctness lens) |
| `.take(n)` aggregate truncation (perf) | partial | found | **7 found** incl. 1 high-sev (performance lens) |
| false positives | low | several unverified | **2 dropped** by the verify stage |
| confirmed total | ~5–7 | ~15 unverified | **20 verified** |

The workflow produces the **union** neither single pass got alone — the Convex caching bugs *and* the
general logic bugs — and the verify stage filters the misreads (it dropped two wrong `getActiveFaults`
avg-resolution claims). Cost: ~26 agents / ~735k tokens / ~95s, ≈18× a single pass. Verdict: use the
single narrow skill for everyday review and the multi-lens workflow for high-value files / CI gates — which
matches the "narrow skills + orchestrated fan-out" recommendation, now with numbers.

## Suggested fix for the project

For the five `Date.now()` widgets: compute the time boundary outside the query (pass a rounded client
timestamp as an arg), or maintain an indexed boolean (e.g. `isOverdue`) updated by a scheduled function,
then query that. Offered as a follow-up — not applied (the project is outside this repo).
