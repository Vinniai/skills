---
name: abcdefg
description: A structured, end-to-end engineering workflow that moves a task through seven sequential phases — Analyze, Blueprint, Construct, Debug, Enhance, Finalize, Go — each its own subskill. Use when you want to take a feature or change from initial request to shipped in a disciplined order, completing each phase before starting the next.
---

# abcdefg

A sequential engineering workflow. Work through the seven phases **in order**, each a
dedicated subskill. Do not start a phase until the previous one's exit criteria are met.

**A**nalyze → **B**lueprint → **C**onstruct → **D**ebug → **E**nhance → **F**inalize → **G**o

## When to use

- Taking a feature, fix, or change from request to shipped in a disciplined way.
- The work is non-trivial enough to benefit from explicit phases rather than ad-hoc edits.
- You want a repeatable order that prevents skipping design, testing, or cleanup.

## The phases (subskills)

1. **[A — Analyze](./analyze/SKILL.md)** — Understand the request and existing code; state the problem precisely.
2. **[B — Blueprint](./blueprint/SKILL.md)** — Design the approach: structure, interfaces, data flow, files to touch.
3. **[C — Construct](./construct/SKILL.md)** — Implement the blueprint in vertical slices.
4. **[D — Debug](./debug/SKILL.md)** — Run, reproduce, fix, and verify with tests.
5. **[E — Enhance](./enhance/SKILL.md)** — Edge cases, error handling, refactor, performance.
6. **[F — Finalize](./finalize/SKILL.md)** — Clean up, update docs, tighten the diff, confirm green.
7. **[G — Go](./go/SKILL.md)** — Commit, push, ship the PR.

## How to run

- Invoke each subskill in turn; state which phase you're in as you go.
- Complete each phase before moving on. If a later phase reveals a gap, return to the
  earliest affected phase and continue forward again.
