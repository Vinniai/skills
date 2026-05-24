---
name: d-debug
description: Phase D of the abcdefg feature workflow. Internal step invoked by abcdefg — not triggered on its own. Make the implementation correct: run the code, reproduce issues, fix root causes, verify with tests, and capture a "before" baseline for later comparison.
---

# D — Debug

Fourth phase of [abcdefg](../SKILL.md). Run as a step of that workflow. Goal:
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

→ Prev: [C — Construct](../c-construct/SKILL.md) · Next: [E — Enhance](../e-enhance/SKILL.md)
