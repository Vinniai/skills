# Writing an effective AGENTS.md

Distilled from [Vercel's agent evals][post]. `AGENTS.md` is a markdown file in
your project root that's injected into the agent's context on **every turn** —
no decision, no async load, no ordering. That property is why it won their evals.

## The result

| Configuration | Pass rate | vs baseline |
|---|---|---|
| Baseline (no docs) | 53% | — |
| Skill (default) | 53% | +0pp |
| Skill + explicit instructions | 79% | +26pp |
| **AGENTS.md docs index** | **100%** | **+47pp** |

AGENTS.md scored 100% on Build, Lint, and Test; the no-docs baseline managed
84% / 95% / 63%.

## Why it beats skills

1. **No decision point.** The information is already there — the agent never has
   to recognize it needs help and choose to load something.
2. **Consistent availability.** It stays in the system prompt every turn; skills
   load asynchronously only when invoked.
3. **No ordering issues.** Skills force sequencing choices (explore first vs.
   invoke first) that made results fragile and wording-dependent.

## Do this

- **Index, don't inline.** Don't paste full documentation into `AGENTS.md`. List
  pointers to doc files the agent can retrieve on demand. Structure it so the
  agent fetches the *specific* file it needs, not everything upfront.
- **Compress aggressively.** Vercel cut their index from **40KB → 8KB (80%)**
  with no loss in pass rate. Every token competes with the user's task.
- **Use a pipe-delimited index.** Pack each doc entry onto one line:
  `path | what's in it, keywords, keywords`. Dense and scannable beats prose.
- **Add the retrieval nudge.** Include, verbatim and adapted to your stack:
  > IMPORTANT: Prefer retrieval-led reasoning over pre-training-led reasoning for any &lt;framework&gt; tasks.

  This steers the model to read your (current) docs instead of leaning on
  possibly-stale training data — especially for APIs newer than its cutoff.
- **Put the boring essentials up top.** Setup/build/test/lint commands, the
  package manager, the conventions. These are the highest-leverage tokens.
- **Keep it current.** It's loaded every turn, so a wrong command here misleads
  on every task. Treat it like code: update it when commands/conventions change.

## Don't

- **Don't embed full docs** — indexed pointers only.
- **Don't reach for a skill** for broad framework knowledge that's relevant on
  most turns. Passive always-on context currently outperforms active retrieval.
- **Don't let it sprawl.** Length dilutes signal; if a section isn't earning its
  tokens, move it to a doc file and link it from the index.

## Reserve skills for…

Vertical, **action-specific workflows the user explicitly triggers** — version
upgrades, migrations, multi-step procedures. That's where skills (this repo) pull
ahead; broad "how this project works" knowledge belongs in `AGENTS.md`.

## How to validate (their eval method)

- Target **APIs absent from the model's training data** (so docs, not memory,
  decide the outcome).
- Write **behavior-based assertions**, not implementation-detail checks.
- Remove **test leakage** and resolve **contradictions** in your docs before
  trusting the numbers.

---

See [`AGENTS.template.md`](./AGENTS.template.md) for a ready-to-copy skeleton.

[post]: https://vercel.com/blog/agents-md-outperforms-skills-in-our-agent-evals
