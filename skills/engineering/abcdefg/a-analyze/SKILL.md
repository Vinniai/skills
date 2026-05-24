---
name: a-analyze
description: Phase A of the abcdefg feature workflow. Internal step invoked by abcdefg — not triggered on its own. Understand the request and existing code: clarify requirements, surface constraints, locate relevant files, and state the problem precisely.
---

# A — Analyze

First phase of [abcdefg](../SKILL.md). Run as a step of that workflow. Goal: a precise
problem statement and a map of what's involved. No design or code yet.

## Steps

1. Restate the request in your own words; confirm the desired outcome.
2. Clarify unknowns and acceptance criteria — ask if a decision changes the work.
3. Locate the relevant files, modules, and existing patterns.
4. Surface constraints: dependencies, data shapes, edge cases, non-goals.
5. Write a concise problem statement to carry into **Blueprint**.

## Exit criteria

The problem and constraints are stated clearly enough that someone else could design
a solution from your notes.

→ Next: [B — Blueprint](../b-blueprint/SKILL.md)
