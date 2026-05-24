# External skills

Third-party skills we've found useful and vendored into this repo. **We don't
author or maintain these** — each is a pinned copy of an upstream skill,
grouped by function and kept in its own folder with its upstream `LICENSE` (and
`NOTICE.md` where required). Don't hand-edit them; refresh from upstream with
the listed `skills` CLI command and re-copy.

Our own skills live under [`../skills/`](../skills/).

| Skill | Group | Source | License | Refresh |
|-------|-------|--------|---------|---------|
| **[impeccable](./design/impeccable/SKILL.md)** | design | [pbakaus/impeccable](https://github.com/pbakaus/impeccable) | Apache 2.0 | `npx skills add pbakaus/impeccable` |
| **[handoff](./productivity/handoff/SKILL.md)** | productivity | [mattpocock/skills](https://github.com/mattpocock/skills) | MIT | `npx skills add https://github.com/mattpocock/skills --skill handoff` |
| **[grill-with-docs](./engineering/grill-with-docs/SKILL.md)** | engineering | [mattpocock/skills](https://github.com/mattpocock/skills) | MIT | `npx skills add https://github.com/mattpocock/skills --skill grill-with-docs` |
| **[agent-browser](./agent-browser/SKILL.md)** | tooling | [vercel-labs/agent-browser](https://github.com/vercel-labs/agent-browser) | Apache 2.0 | `npx skills add https://github.com/vercel-labs/agent-browser --skill agent-browser` |
| **[portless](./portless/SKILL.md)** | tooling | [vercel-labs/portless](https://github.com/vercel-labs/portless) | Apache 2.0 | `npx skills add vercel-labs/portless` |

## What each does

- **impeccable** — create distinctive, production-grade frontend interfaces that avoid generic AI aesthetics. `craft` for the full flow, `teach` to set up design context.
- **handoff** — compact the current conversation into a handoff document for another agent to pick up.
- **grill-with-docs** — grilling session that challenges a plan against the existing domain model and captures decisions.
- **agent-browser** — browser automation CLI for AI agents (navigate, fill forms, screenshot, scrape, test, automate Electron apps).
- **portless** — named local dev-server URLs over trusted HTTPS (e.g. `https://myapp.localhost`).
