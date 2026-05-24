---
name: abcdefg-analyze
description: Phase A of the abcdefg workflow. Understand the request and the existing code before any design or implementation. Use at the start of a task to clarify requirements, surface constraints, locate relevant files, and state the problem precisely.
---

# A — Analyze

First phase of [abcdefg](../SKILL.md). Goal: a precise problem statement and a map
of what's involved. No design or code yet.

## When to use

- Starting a new feature, fix, or change.
- The request is ambiguous, or you don't yet know which files are involved.

## Steps

1. Restate the request in your own words; confirm the desired outcome.
2. Clarify unknowns and acceptance criteria — ask if a decision changes the work.
3. Locate the relevant files, modules, and existing patterns.
4. Surface constraints: dependencies, data shapes, edge cases, non-goals.
5. Write a concise problem statement to carry into **Blueprint**.

## Exit criteria

The problem and constraints are stated clearly enough that someone else could design
a solution from your notes.

→ Next: [B — Blueprint](../blueprint/SKILL.md)
