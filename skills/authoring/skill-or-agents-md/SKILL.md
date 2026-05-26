---
name: skill-or-agents-md
description: Decide where a piece of agent knowledge belongs — inline in AGENTS.md (always-on context), a docs file indexed from AGENTS.md (retrieved on demand), or a skill (explicitly-triggered workflow). Works both directions. Use when you're about to write a skill or add to AGENTS.md and aren't sure which; when auditing a bloated AGENTS.md to see what should become a skill or a doc; or when a skill never triggers and might belong in AGENTS.md. Trigger phrases: "should this be a skill or AGENTS.md", "should this go in AGENTS.md", "is this skill in the right place".
---

# Skill or AGENTS.md?

Route a piece of agent knowledge to where it actually performs. The choice isn't
binary — there are **three destinations**:

1. **AGENTS.md (inline)** — small, high-leverage, relevant on most turns. Always
   in context, no decision point, no ordering risk.
2. **Docs file indexed from AGENTS.md** — broad reference that's too big to keep
   in context every turn. AGENTS.md lists a one-line pointer; the agent retrieves
   the file when the topic comes up. ("Index, don't inline.")
3. **Skill** — a vertical, multi-step *workflow* the agent invokes on demand
   (upgrade, migration, scaffolding, a specific tool sequence).

Why this matters: in [Vercel's evals](../../../agents/writing-agents-md.md),
always-on AGENTS.md context scored 100% vs 79% for an explicitly-instructed skill
and 53% baseline — because passive context has no decision point, is available
every turn, and avoids skill-ordering fragility. So the bar to choose a *skill*
over AGENTS.md is: it must be a discrete workflow the agent can reliably
recognize when to trigger.

## When to use

- About to write a skill or edit AGENTS.md and unsure which.
- Auditing an AGENTS.md that's grown long and is diluting signal.
- A skill that "never seems to fire" — maybe it should be passive context.
- Reviewing whether agent knowledge is in the right place generally.

## Decision flow

Ask, in order:

1. **Is it a procedure?** A multi-step workflow with ordering and/or tool calls
   that runs only when a specific task shows up (upgrade Stripe, migrate a DB,
   scaffold a module)? → **Skill.**
2. **Otherwise it's knowledge.** Is it relevant on *most* turns *and* small
   (commands, conventions, structure)? → **AGENTS.md inline.**
3. **Broad but large, or only sometimes relevant?** (auth model, full schema,
   ADRs) → **Docs file, indexed from AGENTS.md.**

Tie-breaker — **reliable recognition:** if the agent can't dependably tell when
to invoke a skill, and the info is important, prefer AGENTS.md (no decision point
to get wrong). A skill only wins when its trigger is unambiguous.

## Signals

| Lean **AGENTS.md / docs index** | Lean **skill** |
|---|---|
| Facts, conventions, commands, layout | A procedure with steps and order |
| Relevant on most/many turns | Relevant only for a specific occasional task |
| Broad "how this project works" | Narrow, vertical, action-specific |
| Agent may forget to look for it | Agent (or user) clearly knows to trigger it |
| Cheap to keep around (small) | Expensive to always load; bundles tools/refs |
| No clear invocation moment | Distinct, recognizable invocation moment |

## Reverse audits (both directions)

**"This AGENTS.md content — should it be a skill?"**
Extract into a skill only the parts that are (a) a multi-step procedure and (b)
needed only for a specific, recognizable task. Pure facts/commands/conventions
stay inline; large-but-broad references move to a docs file indexed from
AGENTS.md. If AGENTS.md is long, that length is diluting *every* turn — prune to
the always-relevant essentials and push the rest down to docs.

**"This skill — should it be AGENTS.md?"**
If a skill mostly states facts/conventions, is relevant on most turns, or rarely
triggers because there's no clear invocation moment, fold it into AGENTS.md
(inline if small, a docs-index pointer if large). Keep it a skill only if it's a
genuine on-demand workflow.

## Steps

1. State the candidate knowledge in one sentence and its trigger ("when is this
   needed?").
2. Run the decision flow above; note which signals fire.
3. Pick a destination — AGENTS.md inline, docs file + index pointer, or skill.
   It's fine to split: keep a short pointer in AGENTS.md and the depth elsewhere.
4. Give the recommendation with the one or two signals that decided it, plus the
   concrete next step (which file to create/edit, and a one-line index entry or
   skill `description` if applicable).

## Output

A short verdict, e.g.:

> **Skill.** It's a multi-step upgrade procedure triggered by an explicit "upgrade
> X" request — unambiguous invocation moment. Create
> `skills/<category>/upgrade-x/SKILL.md`; in `description`, name the trigger.

> **AGENTS.md (docs index).** Broad reference (full auth model), not needed every
> turn and too big to inline. Put it in `docs/auth.md` and add to the AGENTS.md
> index: `docs/auth.md | sessions, JWT, middleware, roles`.

## References

- [`examples.md`](./examples.md) — worked examples for each destination (AGENTS.md
  inline, docs index, skill) plus both reverse audits.
- [`agents/writing-agents-md.md`](../../../agents/writing-agents-md.md) — the eval
  findings and the rules for an effective AGENTS.md (index-don't-inline, compress,
  retrieval nudge).
- [`agents/AGENTS.template.md`](../../../agents/AGENTS.template.md) — skeleton to
  copy when the answer is "AGENTS.md".
- [repo `CLAUDE.md`](../../../CLAUDE.md) — how to add a skill when the answer is
  "skill".
