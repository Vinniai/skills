---
name: f-finalize
description: Phase F of the abcdefg feature workflow. Internal step invoked by abcdefg — not triggered on its own. The verification gate: compare the before/after baselines, confirm the original request is fully met, and loop back to an earlier phase if not. Only when it passes, clean up and confirm green.
---

# F — Finalize

Sixth phase of [abcdefg](../SKILL.md). Run as a step of that workflow. This is the
**gate** that decides whether the work is actually done — not just a cleanup step.

## Gate: verify against the original request

1. **Compare baselines.** Put Debug's "before" next to Enhance's "after" (screenshots
   or recorded behavior). Did the enhancements achieve their intent, with no regression?
2. **Re-check the original request.** Walk the acceptance criteria from **Analyze** point
   by point. Is every part of what was actually asked for now fulfilled?
3. **Decide:**
   - **Not fully met / regressed / below bar** → return to the earliest affected phase
     (usually **Debug** or **Enhance**, sometimes **Blueprint**), run forward again, and
     re-capture the "after". Repeat the gate. Do not proceed until it passes.
   - **Fully met** → continue to cleanup below.

## Cleanup (only once the gate passes)

4. Remove dead code, debug logging, and commented-out experiments.
5. Update docs, comments, and any affected READMEs.
6. Review the diff end to end; confirm it's minimal, the full test suite passes, and the
   build is clean.

## Exit criteria

The before/after comparison confirms the enhancements landed, the original request is
verifiably fulfilled, and the diff is tight and green — ready for **Go**.

→ Prev: [E — Enhance](../e-enhance/SKILL.md) · Next: [G — Go](../g-go/SKILL.md)

→ Prev: [E — Enhance](../e-enhance/SKILL.md) · Next: [G — Go](../g-go/SKILL.md)
