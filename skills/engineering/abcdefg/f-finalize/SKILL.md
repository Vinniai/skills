---
name: f-finalize
description: Phase F of the abcdefg feature workflow. Internal step invoked by abcdefg — not triggered on its own. Clean up before shipping: remove dead code and debug output, update docs, and confirm the diff is tight and tests pass.
---

# F — Finalize

Sixth phase of [abcdefg](../SKILL.md). Run as a step of that workflow. Goal: a clean,
review-ready change.

## Steps

1. Remove dead code, debug logging, and commented-out experiments.
2. Update docs, comments, and any affected READMEs.
3. Review the diff end to end; ensure it's minimal and focused on the task.
4. Confirm the full test suite passes and the build is clean.
5. Self-review as if you were the reviewer — would you approve this?

## Exit criteria

The diff is tight, documented, and green — ready to commit and push.

→ Prev: [E — Enhance](../e-enhance/SKILL.md) · Next: [G — Go](../g-go/SKILL.md)
