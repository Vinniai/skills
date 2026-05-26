---
name: g-go
description: Ship a finished change: commit with a clear message, push to the right branch (branching first if on the default), open a PR or merge per the agreed flow, confirm CI is green, and report what shipped. Phase G of the abcdefg workflow, also usable on its own. Triggers: "ship it", "commit and open a PR", "push and merge this", "land this change".
---

# G — Go

Phase G of [abcdefg](../SKILL.md) — run as part of that workflow or on its own. Goal:
the change is shipped.

## Steps

1. Commit with a clear message describing what changed and why.
2. Push to the correct remote/branch (branch first if on the default branch).
3. Open a PR with a concise description, or merge if that's the agreed flow.
4. Confirm CI passes; address any failures.
5. Report what shipped — link the commit/PR.

## Exit criteria

The change is committed, pushed, and on its way to (or already in) the target branch.

→ Prev: [F — Finalize](../f-finalize/SKILL.md) · Back to [abcdefg](../SKILL.md)
