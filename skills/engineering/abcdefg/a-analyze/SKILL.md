---
name: a-analyze
description: Phase A of the abcdefg feature workflow. Internal step invoked by abcdefg — not triggered on its own. Understand the request and existing code, survey the available ~/.claude skills and the tooling the task needs (framework, testing, browser/device testing, LSPs), ask the user when unclear, and state the problem precisely.
---

# A — Analyze

First phase of [abcdefg](../SKILL.md). Run as a step of that workflow. Goal: a precise
problem statement, a map of what's involved, and the set of skills/tooling the task
needs. No design or code yet.

## Steps

1. Restate the request in your own words; confirm the desired outcome.
2. Clarify unknowns and acceptance criteria — ask if a decision changes the work.
3. Locate the relevant files, modules, and existing patterns.
4. **Survey available skills and decide what this task requires.** Check `~/.claude/skills`
   (and any project skills, e.g. via `scripts/list-skills.sh`) for skills relevant to the
   work across these areas:
   - **Framework identification** — what stack/framework the project uses, and any skill
     that targets it.
   - **Testing** — the unit / integration / e2e tooling this codebase expects.
   - **Browser UI testing** — headless browser / screenshot skills, needed for the
     before/after baselines in **Debug** and **Enhance** when the change is visual.
   - **Device testing** — simulator / emulator skills (e.g. for mobile apps).
   - **LSPs** — language servers to load for the languages this task touches (load only
     those the task needs).
   - **Other** — any further skill relevant to the request.

   Note which skills/tooling you'll use. **If it's unclear which apply or what the task
   needs, ask the user before proceeding** — prefer a structured multiple-choice question
   (`AskUserQuestion`) over free-text, with one question per open dimension and concrete
   options, e.g.:
   - *Framework/stack* — the candidate frameworks you detected.
   - *Test type* — unit / integration / e2e / none.
   - *UI verification* — browser (headless screenshots) / on-device (simulator/emulator) / none.
   - *LSPs* — the language servers the task would load.

   Carry the answers into the problem statement so Blueprint and the later phases use the
   confirmed tooling.
5. Surface constraints: dependencies, data shapes, edge cases, non-goals.
6. Write a concise problem statement — including the skills and tooling to use — to carry
   into **Blueprint**.

## Exit criteria

The problem and constraints are stated clearly, and the skills/tooling the task requires
are identified (or confirmed with the user) — enough that someone else could design a
solution from your notes.

→ Next: [B — Blueprint](../b-blueprint/SKILL.md)
