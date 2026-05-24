---
name: abcdefg-debug
description: Phase D of the abcdefg workflow. Make the implementation correct. Use after Construct to run the code, reproduce issues, fix failures, and verify behavior with tests.
---

# D — Debug

Fourth phase of [abcdefg](../SKILL.md). Goal: verified-correct behavior.

## When to use

- The code is written and you need to confirm it actually works.

## Steps

1. Run it. Exercise the happy path and the edge cases from **Analyze**.
2. Reproduce any failure with the smallest possible case before fixing.
3. Fix the root cause, not the symptom.
4. Add or run tests that lock in the corrected behavior.
5. Re-run the full relevant test suite; confirm green.

## Exit criteria

Behavior is verified against the acceptance criteria, and tests pass.

→ Prev: [C — Construct](../construct/SKILL.md) · Next: [E — Enhance](../enhance/SKILL.md)
