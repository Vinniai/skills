# Convex

Best practices and conventions for building backends on [Convex](https://convex.dev). Add new skills as
their own folder containing a `SKILL.md`.

- **[convex-best-practices](./convex-best-practices/SKILL.md)** — the official 13 best-practice rules
  (index-not-filter, bounded `.collect`, no redundant indexes, argument validators, access control,
  internal-only cron/scheduler targets, helper functions, `runAction` only across runtimes, no sequential
  `ctx.run*` from actions, no `Date.now()` in queries) plus the canonical function/validator/schema/index
  conventions ([`conventions.md`](./convex-best-practices/conventions.md)). Grounded in the monorepo's real
  Convex code (`convex-platform-template`). Use when writing or reviewing anything under a `convex/` dir.
