---
name: c-construct
description: Implement a planned change — write the code in vertical slices, reusing existing patterns and shared packages, matching the surrounding conventions and style. Phase C of the abcdefg workflow, also usable on its own. Triggers — "implement this plan/blueprint", "build it in vertical slices", "write the code for this design", "construct the feature".
---

# C — Construct

Phase C of [abcdefg](../SKILL.md) — run as part of that workflow or on its own. Goal:
working code that realizes the blueprint.

## Steps

1. Build in vertical slices — one working path at a time, end to end.
2. Match the surrounding code's style, naming, and idioms.
3. Implement to the interfaces defined in **Blueprint**; adjust the blueprint if
   reality forces a change, and note it.
4. Keep changes scoped to the files the blueprint listed.
5. Commit logically grouped slices as you go (final shipping happens in **Go**).

## Exit criteria

The feature/change is implemented and runs, even if rough edges remain for later phases.

→ Prev: [B — Blueprint](../b-blueprint/SKILL.md) · Next: [D — Debug](../d-debug/SKILL.md)
