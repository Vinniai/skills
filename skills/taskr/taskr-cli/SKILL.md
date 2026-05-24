---
name: taskr-cli
displayName: Taskr CLI
description: Drive Taskr from the terminal with the `taskr` CLI — a single compiled binary over the Taskr REST API. Use when scripting or automating Taskr, listing/creating/updating tasks, customers, invoices, quotes, estimates, assets, purchase orders and ~30 other org resources, addressing records by their printed number (T-1, INV-1001) instead of UUIDs, running workflow verbs (assign, schedule, promote, faults, agent runs), generating PDFs, managing webhooks, calling any endpoint via the generic `api` escape hatch, bootstrapping an API key on a self-hosted deployment, wiring Taskr into CI, or running it as an MCP stdio server so an AI agent can drive Taskr. Covers auth/profiles, output formats (table/json/csv), exit codes, self-hosted/TLS quirks, and keeping the client in sync with the backend.
version: 0.2.0
author: Taskr
tags: [taskr, cli, rest, automation, mcp, terminal]
---

# Taskr CLI

`taskr` is a fast TypeScript CLI for Taskr — field-service management from your terminal.
It talks to the Taskr REST API (`/api/v1/org/*`) over HTTPS with an API key; no Convex SDK
required. Shipped as a single compiled Bun binary, so end users need no runtime installed.
It pairs with the **taskr-api** skill: same REST surface, same `sk_live_*` keys — this skill
is the command-line and automation front end.

## Install

```bash
bun install
bun run build        # produces ./dist/taskr (standalone binary)
./dist/taskr --help

# During development, run without compiling:
bun run dev -- tasks list
```

## Authentication

The API key resolves in order: **`TASKR_API_KEY`** env var (wins — ideal for CI), then the
active profile in `~/.config/taskr/config.json` (written `0600` since it holds keys). The org
is always derived server-side from the key.

```bash
taskr login                        # prompts for base URL + API key, validates, saves
taskr login --api-key sk_live_xxx  # non-interactive
taskr whoami                       # key name, role, scopes for the active profile
taskr config show                  # resolved profile (key redacted)
taskr config set baseUrl https://<your-deployment>.convex.site
taskr config list                  # all profiles (active marked *)
taskr config use staging           # switch the default profile
taskr config delete old [--force]
```

The binary ships with the Taskr cloud base URL as its default; override per-invocation with
`--base-url` or `TASKR_BASE_URL`, or persist it in a profile.

## Commands

```bash
# Tasks
taskr tasks list   [--status <s>] [--search <text>] [--limit <n>] [--all] [--cursor <c>]
taskr tasks get    <id>
taskr tasks create --title <t> [--status <s>] [--priority 1-5] [--description <d>]
taskr tasks create --body-file task.json --status open   # flags override file fields
taskr tasks update <id> [--title <t>] [--status <s>] [--priority 1-5]
taskr tasks update --batch tasks.ndjson                  # bulk PATCH; one {"id",…}/line (- = stdin)
taskr tasks start|complete|hold|cancel <id>              # status-transition shortcuts
taskr tasks assign <id> --to <userId> | --unassign      # (re)assign or clear the assignee
taskr tasks note   <id> --text "…"                      # append a note (or --body-file)

# Customers and webhook subscriptions
taskr customers list   [--search <t>] [--limit <n>]
taskr customers get    <id>
taskr customers create --name <n> [--email <e>] [--phone <p>] [--body-file f.json]
taskr customers update <id> [--name <n>] [--email <e>] [--phone <p>] [--body-file f.json]
taskr webhooks list
taskr webhooks create --url <url> [--event <event>]
taskr webhooks delete <id> [--force]

# Resource commands — uniform list|get|create|update over ~30 org resources.
# Each is `taskr <resource> <verb>`; create/update take --body-file (- = stdin).
#   projects milestones maintenance-plans sla-rules assets stock-movements
#   locations variations quotes estimates takeoffs prebuilds tenders
#   tender-clarifications subcontractor-quotes supplier-pricing-requests
#   labour-rates invoices payments progress-claims transactions purchase-orders
#   vendor-bills job-costs timesheet-entries contracts companies contacts
#   employees vendors
taskr invoices list [--search <t>] [--status <s>] [--limit <n>] [--cursor <c>]
taskr invoices get    <id|number>                        # e.g. INV-1001 (see Friendly identifiers)
taskr invoices create --body-file invoice.json
taskr invoices update <id|number> --body-file patch.json
taskr purchase-orders list --status issued
taskr assets get  AS-014                                  # assetNumber resolves to the real id

# Workflow verbs beyond CRUD
taskr subtasks create|update <id> --body-file f.json
taskr faults   create|update <id> --body-file f.json
taskr activity list [--limit <n>]                         # field activity feed
taskr activity log  --body-file entry.json
taskr schedule assign --body-file slot.json
taskr schedule unscheduled | suggestions | capacity       # read-only scheduling views
taskr schedule blocks list|get|create|update|delete <id> [--force]

# Quoting / estimating
taskr estimates promote <id>                              # promote an estimate → quote
taskr estimates boq <id>                                  # bill of quantities
taskr estimates sections list|add <id> [--body-file s.json]
taskr takeoffs  items list|add <id> [--body-file i.json]
taskr prebuilds items list|add <id> [--body-file i.json]
taskr estimate-sections|takeoff-items|prebuild-items update <id> --body-file f.json

# Compliance, reports, AI agent, comms
taskr compliance update <id> [--status <s>] [--body-file f.json]
taskr report invoice|quote|task <id> --out report.pdf     # writes the PDF to a file
taskr agent trigger --body-file goal.json
taskr agent runs list|get <id>
taskr agent blockers|block|resume <id> [--body-file f.json]   # human-in-the-loop
taskr conversations list|create
taskr conversations messages list|send <id> [--text "…"]
taskr platform-threads list|get|update <id>
taskr platform-threads messages send <id> --text "…"
taskr documents list|get|create [--body-file d.json]
taskr documents upload-url --name file.pdf                # signed upload URL
taskr settings claude get|set [--body-file s.json]

# Whole-org surface — every module, not just the typed commands
taskr org overview                  # org identity + per-resource reachability & counts
taskr org modules                   # capability map: module → endpoints, scope, reachable
taskr org list <resource> [--all]   # generic list over any of ~47 collections
taskr org get  <resource> <id>      # generic single-record fetch

# Generic escape hatch — call ANY endpoint, always JSON output
taskr api get   /customers
taskr api post  /tasks --data '{"title":"Fix boiler"}'
taskr api patch /tasks/<id> --data '{"status":"completed"}'
taskr api get   /tasks --query status=in_progress --query limit=10
taskr api post  /tasks --data @body.json                # body from file
echo '{"title":"x"}' | taskr api post /tasks --data -   # body from stdin

# Diagnostics & shell integration
taskr ping                          # reachability + latency + TLS-trust probe
taskr completion bash|zsh|fish      # print a completion script
taskr mcp                           # run as an MCP stdio server (see below)
taskr doctor [--json] [--strict]    # client manifest vs live API registry (drift report)
```

## Friendly identifiers

Anywhere a command takes an `<id>`, you can pass a record's **printed number** instead of its
32-char Convex id — `tasks get T-1`, `invoices update INV-1001`, `assets get AS-014`,
`purchase-orders get PO-77`. The CLI detects a printed number (letter-led with a `-<value>`
group), looks it up via the resource's list endpoint, matches it against the record's
`*Number` / `reference` / `code` field, and substitutes the real id before calling the API.

- The **REST API only addresses records by their 32-char id** — number resolution is a CLI
  convenience, not an API feature (see the **taskr-api** skill).
- A real id (or any value without a hyphen) is passed straight through with **no extra
  request**, so scripts that already use ids are unaffected.
- Resolution costs one extra list call and fails with exit 4 (`No <resource> found with
  identifier "…"`) when nothing matches — so a typo'd number never silently hits the wrong
  record.
- Works for tasks (including `assign`/`note`/status verbs) and every factory resource that
  carries a numbered/reference field (invoices, quotes, purchase orders, assets, …).

```bash
taskr tasks complete T-42            # resolve T-42 → its id, then PATCH status
taskr invoices update INV-1001 --body-file paid.json
taskr tasks get jd7abc123def456…     # already an id → no lookup
```

## Global flags (work in any position)

| Flag | Description |
| --- | --- |
| `--json` | Raw JSON instead of a table (sugar for `-o json`) |
| `-o, --output <fmt>` | `table` (default), `json`, or `csv` |
| `--columns <a,b,…>` | Subset/reorder table or CSV columns (case-insensitive) |
| `--no-header` | Drop the header row (table and CSV) |
| `--profile <name>` | Use a named config profile |
| `--base-url <url>` | Override the API base URL |
| `--timeout <ms>` | Abort after `ms` (default 30000) → exit 5 |
| `--retry <n>` | Retry transient failures (5xx/network/429) `n` times; 429 honors `Retry-After` |
| `--insecure` | Skip TLS cert verification (self-hosted / internal-CA backends) |
| `-v, --version` / `-h, --help` | Version / help for any command |

Env equivalents: `TASKR_API_KEY`, `TASKR_BASE_URL`, `TASKR_PROFILE`, `TASKR_INSECURE`.

## Automation friendliness

- **Never hangs headless.** When stdin is not a TTY (or `TASKR_NO_INPUT=1`), commands that
  would prompt (`login`) fail fast with exit 2 and a clear message. Supply values via
  `--api-key` / `TASKR_API_KEY` / `--base-url`.
- **Parseable errors.** With `--json`, errors are a single JSON object on stdout —
  `{ "error", "type", "exitCode", "status?", "code?" }` — so agents parse instead of scraping
  stderr. The exit code is unchanged.
- **Forward-compatible parsing.** Unknown response fields pass through (visible with `--json`);
  a missing expected display field degrades to `—` with a non-fatal `warning:` on stderr rather
  than crashing. Silence with `TASKR_NO_WARN=1` (auto-silenced under `--json`).

### Exit codes

| Code | Meaning |
| --- | --- |
| 0 | Success |
| 1 | General error |
| 2 | Auth (missing key, 401, 403) |
| 3 | Not found (404) |
| 4 | Validation (400, 422) |
| 5 | Network / 5xx |

`DEBUG=1` prints stack traces on error.

## MCP server

`taskr mcp` speaks the Model Context Protocol over stdio so an AI agent can drive Taskr,
exposing `taskr_tasks_list`, `taskr_tasks_get`, `taskr_tasks_create`, `taskr_tasks_update`,
`taskr_whoami`, and `taskr_api` (a generic get/post/patch escape hatch) — all backed by the
same API client and profile resolution as the CLI. Tools carry `readOnlyHint` /
`destructiveHint` annotations and return `structuredContent`; failures come back as `isError`
results (the model sees the message) rather than protocol errors. Point any MCP client at the
binary:

```json
{ "command": "taskr", "args": ["mcp"], "env": { "TASKR_API_KEY": "sk_live_xxx" } }
```

## Self-hosted Taskr / Convex

The CLI talks to any deployment. Point it at a self-hosted backend with `--base-url` /
`TASKR_BASE_URL`, or persist it: `taskr login --base-url https://taskr.internal.example.com`.

- **Use the *site* (HTTP-actions) URL, not the deployment URL.** The REST API is served by
  Convex HTTP actions. A default self-hosted setup runs the deployment on `:3210` and HTTP
  actions on `:3211` — pointing at `:3210` returns `404` for every route. Use `CONVEX_SITE_URL`
  (the `:3211` / reverse-proxy address).
- **Self-signed / internal-CA certs.** Opt in to skipping TLS verification with `--insecure`,
  `TASKR_INSECURE=1`, or `taskr login --insecure` (saves `insecure:true`). It's opt-in only and
  prints `warning: TLS certificate verification disabled` to stderr every run. Plain `http://`
  backends need none of this.

### Bootstrapping the first API key (self-hosted only)

A fresh self-hosted deployment has no API key and no key-creation REST route. `taskr keys
bootstrap` mints one via a Convex function call authenticated with the deployment's **admin
key** (treat it like a root credential):

```bash
taskr keys bootstrap \
  --base-url http://localhost:3210 \      # the Convex *deployment* URL (:3210)
  --admin-key 'anonymous-agent|01…' \     # or CONVEX_SELF_HOSTED_ADMIN_KEY
  --org org_abc123 \                      # organizationId from the dashboard
  --name 'CLI key'

# Truly blank deployment with no org yet — create the fixed "Preview Org":
taskr keys bootstrap --base-url http://localhost:3210 \
  --admin-key 'anonymous-agent|01…' --create-org
```

The raw key + its SHA-256 hash are generated client-side (only the hash is stored; the raw key
is shown once, unrecoverable), then validated through the normal REST surface and saved to the
profile. `--base-url` is the **deployment** URL (`:3210`); the REST **site** URL is derived for
validation, or pass `--site-url`. `--test` mints an `sk_test_` key; `--scopes a,b` restricts
scopes (default `*`, since a no-scope service key fails auth). Cloud/WorkOS installs create keys
from the dashboard instead.

## Staying in sync with the backend

The CLI ships a generated manifest of every backend endpoint (`src/generated/endpoints.ts`),
the source of truth for `taskr doctor`. It is **regenerated, never hand-edited**, from the
backend's `ORG_API_ENDPOINTS` registry:

```bash
bun run gen   # rewrites src/generated/endpoints.ts from the backend registry
```

Set `TASKR_REGISTRY_PATH` to the backend's `api-endpoint-registry.ts` if the backend repo
isn't a sibling. A contract test fails the build if the committed manifest drifts from
`bun run gen` output. `taskr doctor` then diffs that manifest against what the active key can
actually see (`/api-key-info`): **stale client** = server exposes something the manifest lacks
(run `bun run gen`); **missing from server** = manifest entries the key can't reach (removed or
out of scope). Use `--strict` in CI to fail when the client lags the backend.

## Example

```bash
export TASKR_API_KEY=sk_live_xxx
taskr tasks list --status in_progress
taskr tasks list --json | jq '.tasks[].title'
taskr tasks create --title "Annual fire inspection" --priority 2
```
