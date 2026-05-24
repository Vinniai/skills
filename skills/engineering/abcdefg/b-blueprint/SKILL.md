---
name: b-blueprint
description: Phase B of the abcdefg feature workflow. Internal step invoked by abcdefg — not triggered on its own. Design the approach before writing code: decide structure, interfaces, and data flow, note trade-offs, and list the files to touch.
---

# B — Blueprint

Second phase of [abcdefg](../SKILL.md). Run as a step of that workflow. Goal: a design
you can implement directly. Comes after the problem is understood; precedes any code.

## Steps

1. Choose the approach; name the main components and their responsibilities.
2. Define interfaces and data flow — inputs, outputs, and types at the boundaries.
3. List the files to create or change, and in what order.
4. Note trade-offs and rejected alternatives, with the reason.
5. Reuse existing patterns and shared packages before inventing new ones.

## Exit criteria

A short, concrete plan: components, interfaces, files to touch, and the build order.

→ Prev: [A — Analyze](../a-analyze/SKILL.md) · Next: [C — Construct](../c-construct/SKILL.md)
