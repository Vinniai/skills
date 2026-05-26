# Worked examples

Each runs the [decision flow](./SKILL.md#decision-flow): state the candidate and
its trigger, note which signals fire, pick a destination, give the next step.
Examples use this org's real stack (bun, Biome, Convex, Lefthook) to stay concrete.

---

## → AGENTS.md (inline)

### 1. Package manager and core commands

- **Candidate:** "This repo uses bun; install with `bun install`, typecheck with
  `bun run typecheck`, lint with `biome check`."
- **Trigger:** needed on essentially every task that runs a command.
- **Signals:** facts/commands · relevant on most turns · small · no clear
  single invocation moment.
- **Verdict:** **AGENTS.md inline** — highest-leverage tokens; wrong here = wrong
  on every turn, so keep it correct and up top.
- **Next step:** add to the `## Commands` block of `AGENTS.md`.

### 2. Conventions every change must honor

- **Candidate:** "Biome-enforced style; imports via `@/*`; shared UI lives in
  `@tocld/*` packages — never copy a local variant."
- **Trigger:** applies to most edits.
- **Signals:** conventions · relevant on most turns · small · agent could easily
  forget to look for it.
- **Verdict:** **AGENTS.md inline** — the "agent may forget to look" signal is
  decisive; passive context has no decision point to miss.
- **Next step:** add to `## Conventions` in `AGENTS.md`.

---

## → Docs file, indexed from AGENTS.md

### 3. The full auth & permissions model

- **Candidate:** a 600-line explanation of sessions, JWT rotation, middleware,
  role/permission matrix.
- **Trigger:** only when touching auth — a minority of tasks.
- **Signals:** broad reference · *not* needed every turn · too large to inline.
- **Verdict:** **Docs file indexed from AGENTS.md** — "index, don't inline." Keeps
  it retrievable without taxing every turn.
- **Next step:** put it in `docs/auth.md`; add to the AGENTS.md index:
  `docs/auth.md | sessions, JWT rotation, middleware, roles, permissions`.

### 4. Database schema reference

- **Candidate:** every table, column, and index, with relationships.
- **Trigger:** when writing queries/migrations.
- **Signals:** large · broad · sometimes-relevant · changes over time.
- **Verdict:** **Docs file indexed from AGENTS.md** (same reasoning as #3). A
  generated file is ideal so it stays current.
- **Next step:** `docs/database.md`; index: `docs/database.md | schema, tables,
  migrations, indexes, relations`.

---

## → Skill

### 5. "Upgrade Stripe across the monorepo"

- **Candidate:** bump the SDK, run codemods, fix breaking API changes, re-verify.
- **Trigger:** an explicit "upgrade Stripe" request — a distinct, recognizable
  moment, not most turns.
- **Signals:** multi-step procedure with ordering · narrow/vertical · invoked on
  demand · bundles steps/tools.
- **Verdict:** **Skill** — step 1 of the flow ("is it a procedure?") fires and the
  trigger is unambiguous.
- **Next step:** `skills/<category>/upgrade-stripe/SKILL.md`; in `description`,
  name the trigger ("when upgrading the Stripe SDK / migrating Stripe versions").

### 6. "Scaffold a new Convex module"

- **Candidate:** create the function file + schema + validators + test, then wire
  it into the router — in that order.
- **Trigger:** "add a new module / scaffold X."
- **Signals:** procedure with ordering · action-specific · clear invocation moment.
- **Verdict:** **Skill.**
- **Next step:** `skills/<category>/scaffold-convex-module/SKILL.md`; description
  names the "scaffold/add a new module" trigger.

---

## Reverse audits

### 7. AGENTS.md has a 150-line embedded release runbook → split it out

- **Candidate:** an inline "cutting a release" procedure (tag, changelog, deploy,
  rollback) sitting in `AGENTS.md`.
- **Why it's misplaced:** it's a multi-step procedure needed only at release time,
  yet it dilutes signal on *every* turn.
- **Verdict:** **Extract to a skill.** It's a procedure with a recognizable trigger
  ("cut a release"). Leave at most a one-line pointer in AGENTS.md, or nothing.
- **Next step:** move it to `skills/<category>/release/SKILL.md`; trim the section
  out of `AGENTS.md`.

### 8. A "Convex conventions" skill that never triggers → fold into AGENTS.md

- **Candidate:** a skill that only states facts — use `v` validators, declare
  `args`/`returns`, no `Date.now()` inside queries.
- **Why it's misplaced:** pure conventions, relevant on most Convex edits, with no
  distinct invocation moment — so it rarely fires as a skill.
- **Verdict:** **Fold into AGENTS.md.** Small enough to inline under
  `## Conventions`; the always-on placement is exactly what it needs.
- **Next step:** copy the rules into `AGENTS.md`; delete the skill (or, if the
  rules are large, move them to `docs/convex.md` and add an index pointer).

---

> Pattern to notice: **procedure + clear trigger → skill**; **facts/conventions
> needed broadly → AGENTS.md (inline if small, docs index if large)**. When in
> doubt between a skill and AGENTS.md, the [reliable-recognition
> tie-breaker](./SKILL.md#decision-flow) decides it.
