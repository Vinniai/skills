---
name: g-go
description: Phase G of the abcdefg feature workflow. Internal step invoked by abcdefg — not triggered on its own. Ship the change: commit with a clear message, push, and open or merge the PR as appropriate.
---

# G — Go

Final phase of [abcdefg](../SKILL.md). Run as a step of that workflow. Goal: the change
is shipped.

## Steps

1. Commit with a clear message describing what changed and why.
2. Push to the correct remote/branch (branch first if on the default branch).
3. Open a PR with a concise description, or merge if that's the agreed flow.
4. Confirm CI passes; address any failures.
5. Report what shipped — link the commit/PR.

## Exit criteria

The change is committed, pushed, and on its way to (or already in) the target branch.

→ Prev: [F — Finalize](../f-finalize/SKILL.md) · Back to [abcdefg](../SKILL.md)
