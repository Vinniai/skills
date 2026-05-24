---
name: abcdefg-finalize
description: Phase F of the abcdefg workflow. Clean up before shipping. Use after Enhance to remove dead code and debug output, update docs and comments, and confirm the diff is tight and tests pass.
---

# F — Finalize

Sixth phase of [abcdefg](../SKILL.md). Goal: a clean, review-ready change.

## When to use

- The work is correct and enhanced; you're preparing to ship.

## Steps

1. Remove dead code, debug logging, and commented-out experiments.
2. Update docs, comments, and any affected READMEs.
3. Review the diff end to end; ensure it's minimal and focused on the task.
4. Confirm the full test suite passes and the build is clean.
5. Self-review as if you were the reviewer — would you approve this?

## Exit criteria

The diff is tight, documented, and green — ready to commit and push.

→ Prev: [E — Enhance](../enhance/SKILL.md) · Next: [G — Go](../go/SKILL.md)
