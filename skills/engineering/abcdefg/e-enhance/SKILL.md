---
name: e-enhance
description: Take working code beyond "it works" — harden edge cases, tighten error handling, refactor for clarity, address performance, and capture an "after" baseline to compare against Debug's "before". Phase E of the abcdefg workflow, also usable on its own. Triggers — "harden this", "improve error handling", "refactor for clarity", "optimize this path", "make this production-ready".
---

# E — Enhance

Phase E of [abcdefg](../SKILL.md) — run as part of that workflow or on its own. Goal: a
solution that's robust and clear, plus an **"after" baseline** that pairs with Debug's
"before" so Finalize can compare them.

## Steps

1. Harden edge cases and failure modes uncovered during **Debug**.
2. Tighten error handling and input validation.
3. Refactor for clarity — naming, structure, removing duplication.
4. Address performance where it measurably matters (avoid premature optimization).
5. Re-run tests after each change to confirm nothing regressed.
6. Capture an **"after" baseline** the same way the **Debug** "before" was captured —
   same viewport / inputs — so the two are directly comparable in **Finalize**:
   - UI / visual change → an `after.png` screenshot at the same window size.
   - Non-visual change → the new output/behavior for the same inputs.

## Exit criteria

The code handles realistic edge cases, reads clearly, performs acceptably, and an
"after" baseline is captured to match the "before".

→ Prev: [D — Debug](../d-debug/SKILL.md) · Next: [F — Finalize](../f-finalize/SKILL.md)
