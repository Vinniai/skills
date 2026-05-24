---
name: d-debug
description: Phase D of the abcdefg feature workflow. Internal step invoked by abcdefg — not triggered on its own. Make the implementation correct: run the code, reproduce issues, fix root causes, and verify behavior with tests.
---

# D — Debug

Fourth phase of [abcdefg](../SKILL.md). Run as a step of that workflow. Goal:
verified-correct behavior.

## Steps

1. Run it. Exercise the happy path and the edge cases from **Analyze**.
2. Reproduce any failure with the smallest possible case before fixing.
3. Fix the root cause, not the symptom.
4. Add or run tests that lock in the corrected behavior.
5. Re-run the full relevant test suite; confirm green.

## Exit criteria

Behavior is verified against the acceptance criteria, and tests pass.

→ Prev: [C — Construct](../c-construct/SKILL.md) · Next: [E — Enhance](../e-enhance/SKILL.md)
