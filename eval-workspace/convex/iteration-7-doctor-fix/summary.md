# convex-doctor-fix — iteration 7 (functional regression eval)

**Result: the detect→fix→verify loop works end-to-end, proven two ways. (A) A deterministic gate applying
the golden fix takes the Convex Next.js starter 94→98 with zero new finding rule-classes — PASS, $0, ~3s.
(B) Three Sonnet 4.6 fixer agents, each given only the skills, independently reproduced it: 3/3 PASS, all
94→98, all 5→1 convex findings, 0 new rule classes — verified by re-scanning their output, not trusting
self-report.**

This is a different kind of eval from iterations 1–6 (which measured whether the skill helps an LLM *find*
issues). This one is a **functional gate** on the `convex-doctor-fix` *loop*: applying the fixes must
strictly raise the analyzer's score and introduce no regressions — with the analyzer's own re-run as the
oracle.

## Target

`react-convex-doctor`'s bundled `examples/convex-nextjs` (the official Convex Next.js starter), copied
portably. Baseline **94/100**, 5 convex findings in `convex/myFunctions.ts`: 2× `convex-require-auth-check`,
2× `convex-no-api-self-call`, 1× `convex-no-sequential-ctx-run`.

## Part A — deterministic gate (`gate.sh`)

Applies `golden/myFunctions.fixed.ts` (the loop's AUTO fixes) to a temp copy and asserts the score strictly
rises with zero new rule-classes:

```
score:           94 -> 98   (+4)
convex findings: 5 -> 1
new rule classes introduced: none
GATE: PASS
```

Reproducible, **$0**, ~3s, exit 0/1 — drop it in CI. It fails loudly if a doctor version bump, an example
change, or a bad golden fix breaks the score↔remedy relationship. Run with `bash gate.sh` (override
`DOCTOR=`/`EXAMPLE=` to point at your checkout).

## Part B — LLM-loop validation (n=3, Sonnet 4.6)

Each agent read the `convex-doctor-fix` + `convex-best-practices` skills, then ran the loop itself on its
own isolated copy: detect → apply AUTO fixes (auth checks + public→`internal` refs) → verify. The harness
then **independently re-scanned** each output (self-report not trusted):

| run | score | convex findings | new rule classes | PROPOSE left | result |
|-----|:-----:|:---------------:|:----------------:|:------------:|:------:|
| run1 | 94 → 98 | 5 → 1 | none | sequential-ctx-run | **PASS** |
| run2 | 94 → 98 | 5 → 1 | none | sequential-ctx-run | **PASS** |
| run3 | 94 → 98 | 5 → 1 | none | sequential-ctx-run | **PASS** |

**3/3 PASS.** Every agent applied the AUTO fixes correctly *and* left the PROPOSE-class
`convex-no-sequential-ctx-run` alone — the independent demo read+write is not force-merged. No agent
introduced a new finding. Cost ~$0.20/run (~42k Sonnet tokens, 67–100s); the deterministic gate is the
free, fast everyday check, the LLM loop is what produces the fix.

## Why this matters

- The skill now ships with a **functional proof and a reusable CI gate**, not just guidance: applying its
  fixes verifiably raises a real project's score with no regressions.
- It validates the **AUTO-vs-PROPOSE policy** behaviourally — agents fix the clear issues and correctly
  decline to force the structural/judgment one, 3/3 times.
- It demonstrates the **verify oracle**: "the model says it fixed it" is replaced by an independent
  deterministic re-scan that the count dropped and nothing regressed.

## Notes / next

- Only one Convex example ships in the tool today, so the gate covers one project. As more examples land,
  add them to `gate.sh` (loop over `examples/*`) and assert per-project. The synthetic fixtures
  (`iteration-3/fixtures`) could be promoted to a tiny convex project (add a `package.json` with a `convex`
  dep) to widen coverage with a planted-issue set whose post-fix score is known.
- All temp copies were scratch (`/tmp`); the live example was restored — this iteration adds the gate +
  golden fixture to the skills repo, nothing to the tool repo.
