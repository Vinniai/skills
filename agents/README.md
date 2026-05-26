# Agents

Guidance for `AGENTS.md` — the project-root file that gives coding agents
persistent context on **every** turn, no decision or invocation required.

Why this gets its own directory: in [Vercel's agent evals][post], an `AGENTS.md`
docs index **outperformed skills**, so it's worth treating as a first-class
practice rather than folklore.

| Configuration | Pass rate |
|---|---|
| Baseline (no docs) | 53% |
| Skill (default) | 53% |
| Skill + explicit instructions | 79% |
| **AGENTS.md docs index** | **100%** |

The short version: passive context that's always in the prompt beats active
retrieval the agent has to choose to load. See the guide for *why* and *how*.

## Contents

- **[writing-agents-md.md](./writing-agents-md.md)** — the findings + concrete, do-this rules for an effective `AGENTS.md`.
- **[AGENTS.template.md](./AGENTS.template.md)** — copy-paste skeleton (compressed, pipe-delimited docs index) to drop into a project root.

## AGENTS.md vs skills (when to use which)

Not either/or — they do different jobs:

- **AGENTS.md** → broad, always-relevant project/framework knowledge: setup
  commands, conventions, where the docs live. Always loaded, zero ordering risk.
- **Skills** (this repo) → vertical, action-specific workflows a user explicitly
  triggers — version upgrades, migrations, multi-step procedures.

Source: [agents.md outperforms skills in our agent evals — Vercel][post].

[post]: https://vercel.com/blog/agents-md-outperforms-skills-in-our-agent-evals
