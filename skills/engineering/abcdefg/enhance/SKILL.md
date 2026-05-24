---
name: abcdefg-enhance
description: Phase E of the abcdefg workflow. Improve the solution beyond "works". Use after Debug to harden edge cases, tighten error handling, refactor for clarity, and address performance where it matters.
---

# E — Enhance

Fifth phase of [abcdefg](../SKILL.md). Goal: a solution that's robust and clear, not
just functional.

## When to use

- Behavior is correct and you want to raise quality before shipping.

## Steps

1. Harden edge cases and failure modes uncovered during **Debug**.
2. Tighten error handling and input validation.
3. Refactor for clarity — naming, structure, removing duplication.
4. Address performance where it measurably matters (avoid premature optimization).
5. Re-run tests after each change to confirm nothing regressed.

## Exit criteria

The code handles realistic edge cases, reads clearly, and performs acceptably.

→ Prev: [D — Debug](../debug/SKILL.md) · Next: [F — Finalize](../finalize/SKILL.md)
