# Taskr

Skills for working with the [Taskr](https://taskr) platform from the outside. Add new
skills as their own folder containing a `SKILL.md`.

- **[taskr-api](./taskr-api/SKILL.md)** — Integrate with the Taskr REST API as an external
  consumer: API-key auth, scopes and module entitlements, cursor pagination, the full route
  reference for every org resource, webhooks, agent triggers with human-in-the-loop blockers,
  the customer-facing Portal API, and the public OpenAPI/discovery endpoints.

> This is the consumer-facing API guide. The internal codebase-extension guide (how to add
> new routes, helper utilities, QA dogfooding) lives in the Taskr repo, not here.
