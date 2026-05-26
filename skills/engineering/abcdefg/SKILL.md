---
name: abcdefg
description: End-to-end feature development workflow. Use whenever building, implementing, or shipping a non-trivial feature, fix, or change from start to finish — e.g. "build this feature", "implement X end to end", "take this from idea to shipped". Runs seven sequential phases in order: Analyze, Blueprint, Construct, Debug, Enhance, Finalize, Go (A–G). This is the entry point that runs the full sequence; each phase is also its own skill (a-analyze … g-go) you can trigger independently when you only need that one step.
---

# abcdefg

The complete feature-development workflow. When triggered, walk a task through seven
sequential phases **in order**, each a dedicated subskill. Do not start a phase until
the previous one's exit criteria are met. Each phase is also a standalone skill: this
entry point runs the whole sequence, but you can invoke any single phase (`a-analyze`
… `g-go`) directly when a task only needs that one step.

**A**nalyze → **B**lueprint → **C**onstruct → **D**ebug → **E**nhance → **F**inalize → **G**o

## When to use

- Building or shipping a non-trivial feature, fix, or change from request to done.
- You want a repeatable order that prevents skipping design, testing, or cleanup.

## The phases (subskills, run in order)

1. **[a-analyze](./a-analyze/SKILL.md)** — Understand the request and existing code; survey available `~/.claude` skills and the tooling the task needs (framework, testing, browser/device testing, LSPs), asking the user if unclear; state the problem precisely.
2. **[b-blueprint](./b-blueprint/SKILL.md)** — Design the approach: structure, interfaces, data flow, files to touch.
3. **[c-construct](./c-construct/SKILL.md)** — Implement the blueprint in vertical slices.
4. **[d-debug](./d-debug/SKILL.md)** — Run, reproduce, fix, verify with tests; capture a **"before"** baseline (screenshot for UI work).
5. **[e-enhance](./e-enhance/SKILL.md)** — Edge cases, error handling, refactor, performance; capture an **"after"** baseline to match the "before".
6. **[f-finalize](./f-finalize/SKILL.md)** — **Gate:** compare before/after against the original request; loop back if gaps remain, else clean up and confirm green.
7. **[g-go](./g-go/SKILL.md)** — Commit, push, ship the PR.

## How to run

- Announce the phase you're entering, complete it, then proceed to the next.
- **Finalize is a gate, not a formality.** It compares the "before" (Debug) and "after"
  (Enhance) baselines and re-checks every part of the original request. If the request
  isn't fully met, loop back to the earliest affected phase (often Debug or Enhance),
  run forward again, and re-gate. Only pass to **Go** once Finalize confirms the original
  request is satisfied.

## Media delivery

- Always deliver visual artifacts — screenshots, images, rendered diagrams, PDFs, video — using the `SendUserFile` delivery tool, not by saving to disk or printing a file path. Saving a path never surfaces media to the user; only the delivery tool renders it on their client.
- Do this proactively and automatically: any time you capture or generate a screenshot/video, send it. Don't wait to be asked. This applies most in **Debug** (the "before" baseline), **Enhance** (the "after" baseline), and **Finalize** (the before/after comparison) — deliver each baseline as you capture it.
- Use status `proactive` when the user didn't explicitly request the file (so it pings their device); `normal` when it's a direct reply.
