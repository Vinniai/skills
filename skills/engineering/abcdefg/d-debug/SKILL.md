---
name: d-debug
description: Make an implementation correct — run it, reproduce failures with the smallest case, fix root causes rather than symptoms, lock in behavior with tests, and capture a "before" baseline for later comparison. Phase D of the abcdefg workflow, also usable on its own. Triggers — "debug this", "find the root cause", "make the tests pass", "why is this failing", "reproduce and fix".
---

# D — Debug

Phase D of [abcdefg](../SKILL.md) — run as part of that workflow or on its own. Goal:
verified-correct behavior plus a recorded **"before" baseline** that Finalize uses to
confirm the work landed.

## Steps

1. Run it. Exercise the happy path and the edge cases from **Analyze**.
2. Reproduce any failure with the smallest possible case before fixing.
3. Fix the root cause, not the symptom.
4. Add or run tests that lock in the corrected behavior; re-run the suite, confirm green.
5. Capture a **"before" baseline** of the working result and save it for comparison in
   **Finalize**:
   - UI / visual change → a screenshot (e.g. headless Chrome:
     `chrome --headless=new --screenshot=before.png --window-size=W,H file://…`).
   - Non-visual change → the recorded output, response, or behavior (note inputs used).

## Exit criteria

Behavior is verified against the acceptance criteria, tests pass, and a "before"
baseline is captured.

→ Prev: [C — Construct](../c-construct/SKILL.md) · Next: [E — Enhance](../e-enhance/SKILL.md)
