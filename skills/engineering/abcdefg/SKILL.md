---
name: abcdefg
description: End-to-end feature development workflow. Use whenever building, implementing, or shipping a non-trivial feature, fix, or change from start to finish — e.g. "build this feature", "implement X end to end", "take this from idea to shipped". Runs seven sequential phases in order: Analyze, Blueprint, Construct, Debug, Enhance, Finalize, Go (A–G). This is the entry point; it invokes each phase subskill in turn.
---

# abcdefg

The complete feature-development workflow. When triggered, walk a task through seven
sequential phases **in order**, each a dedicated subskill. Do not start a phase until
the previous one's exit criteria are met. The phases are internal steps of this
workflow — invoke them here rather than expecting them to trigger on their own.

**A**nalyze → **B**lueprint → **C**onstruct → **D**ebug → **E**nhance → **F**inalize → **G**o

## When to use

- Building or shipping a non-trivial feature, fix, or change from request to done.
- You want a repeatable order that prevents skipping design, testing, or cleanup.

## The phases (subskills, run in order)

1. **[a-analyze](./a-analyze/SKILL.md)** — Understand the request and existing code; state the problem precisely.
2. **[b-blueprint](./b-blueprint/SKILL.md)** — Design the approach: structure, interfaces, data flow, files to touch.
3. **[c-construct](./c-construct/SKILL.md)** — Implement the blueprint in vertical slices.
4. **[d-debug](./d-debug/SKILL.md)** — Run, reproduce, fix, and verify with tests.
5. **[e-enhance](./e-enhance/SKILL.md)** — Edge cases, error handling, refactor, performance.
6. **[f-finalize](./f-finalize/SKILL.md)** — Clean up, update docs, tighten the diff, confirm green.
7. **[g-go](./g-go/SKILL.md)** — Commit, push, ship the PR.

## How to run

- Announce the phase you're entering, complete it, then proceed to the next.
- If a later phase reveals a gap, return to the earliest affected phase and continue
  forward again.
