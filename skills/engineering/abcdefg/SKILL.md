---
name: abcdefg
description: A structured, end-to-end engineering workflow that moves a task through seven sequential phases — Analyze, Blueprint, Construct, Debug, Enhance, Finalize, Go. Use when you want to take a feature or change from initial request to shipped in a disciplined order, completing each phase before starting the next.
---

# abcdefg

A sequential engineering workflow. Work through the seven phases **in order** — do
not start a phase until the previous one is complete. The name maps to the phases:
**A**nalyze → **B**lueprint → **C**onstruct → **D**ebug → **E**nhance → **F**inalize → **G**o.

## When to use

- Taking a feature, fix, or change from request to shipped in a disciplined way.
- The work is non-trivial enough to benefit from explicit phases rather than ad-hoc edits.
- You want a repeatable order that prevents skipping design, testing, or cleanup.

## Phases (run in sequence)

1. **Analyze** — Understand the request and the existing code. Clarify requirements,
   identify constraints, locate the relevant files, and state the problem precisely.
2. **Blueprint** — Design the approach before writing code. Decide the structure,
   interfaces, and data flow. Note trade-offs and the files you'll touch.
3. **Construct** — Implement the blueprint. Write the code in vertical slices,
   matching the surrounding conventions.
4. **Debug** — Make it correct. Run it, reproduce issues, fix failures, and add or
   run tests until behavior is verified.
5. **Enhance** — Improve beyond "works": handle edge cases, tighten error handling,
   refactor for clarity, and address performance where it matters.
6. **Finalize** — Clean up. Remove dead code and debug output, update docs/comments,
   and confirm tests pass and the diff is tight.
7. **Go** — Ship. Commit with a clear message, push, and open/merge the PR as
   appropriate.

## Notes

- Complete each phase before moving on; if a later phase reveals a gap, return to the
  earliest affected phase and continue forward again.
- State which phase you're in as you work, so progress is visible.
