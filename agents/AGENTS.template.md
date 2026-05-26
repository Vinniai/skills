# AGENTS.md

<!--
  Copy this to your project ROOT as `AGENTS.md` and fill in the <placeholders>.
  It's injected into the agent's context every turn — so keep it short, keep
  commands correct, and prefer pointers over pasted docs. Delete these comments.
-->

## Overview

<One or two sentences: what this project is, the stack, the package manager.>
Monorepo: <yes/no>. Package manager: <bun | pnpm | yarn | npm>.

## Commands

Run from the repo root unless noted. Always run the relevant gate before
declaring work done.

- install:   `<bun install | pnpm install | …>`
- dev:       `<command>`
- build:     `<command>`
- typecheck: `<npx tsc --noEmit>`        # see tools/typecheck
- lint/fmt:  `<biome check --write>`     # see tools/biome
- test:      `<vitest run [file]>`       # see tools/vitest
- dead-code: `<fallow dead-code>`        # see tools/fallow (periodic sweep)
- hooks:     `<lefthook install>`        # see tools/lefthook

In a monorepo, scope to the package you touched (e.g. `tsc -p packages/<x>`).

## Conventions

- <Code style: e.g. Biome-enforced, 2-space, single quotes.>
- <Imports/aliases: e.g. `@/*` → src.>
- <Patterns to follow / anti-patterns to avoid.>
- <Where new code goes: e.g. shared UI in `packages/ui`, not local copies.>

## Testing

- <How tests are organized, what to run for a change, coverage expectations.>
- Run the narrowest test set that covers your change first, then widen.

## Docs index

Retrieve the specific file you need — don't assume from memory.
Format: `path | topics, keywords`

```
docs/architecture.md   | system overview, services, data flow, boundaries
docs/auth.md           | sessions, JWT, middleware, permissions, roles
docs/database.md       | schema, migrations, query patterns, indexes
docs/api.md            | route handlers, validation, error envelope, pagination
docs/deploy.md         | environments, env vars, release ladder, rollback
docs/adr/              | architecture decision records (numbered)
```

IMPORTANT: Prefer retrieval-led reasoning over pre-training-led reasoning for any
<framework> tasks — read the linked docs above before relying on training data,
especially for APIs newer than your cutoff.
