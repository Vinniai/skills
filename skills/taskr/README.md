# Taskr

Skills for working with the [Taskr](https://taskr) platform from the outside. Add new
skills as their own folder containing a `SKILL.md`.

- **[taskr-api](./taskr-api/SKILL.md)** — Integrate with the Taskr REST API as an external
  consumer: API-key auth, scopes and module entitlements, cursor pagination, the full route
  reference for every org resource, webhooks, agent triggers with human-in-the-loop blockers,
  the customer-facing Portal API, and the public OpenAPI/discovery endpoints.
- **[taskr-cli](./taskr-cli/SKILL.md)** — Drive Taskr from the terminal with the `taskr` CLI
  (a single compiled binary over the REST API): uniform list/get/create/update over ~30 org
  resources (tasks, customers, invoices, quotes, estimates, assets, purchase orders, …),
  workflow verbs (assign, schedule, promote, faults, agent runs), addressing records by their
  printed number (T-1, INV-1001) instead of UUIDs, PDF report generation, webhooks, a generic
  `api` escape hatch, self-hosted key bootstrapping, output formats and exit codes for
  scripting, and an MCP stdio server so AI agents can drive Taskr.

> These are consumer-facing. The internal codebase-extension guide (how to add new routes,
> helper utilities, QA dogfooding) lives in the Taskr repo, not here.
