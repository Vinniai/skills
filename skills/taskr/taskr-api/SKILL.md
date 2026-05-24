---
name: taskr-api
displayName: Taskr API
description: Integrate with the Taskr REST API as an external consumer. Covers API-key authentication, scopes and module entitlements, cursor pagination, the full route reference for every org resource (tasks, customers, invoices, quotes, assets, faults, projects, scheduling, estimating, PDF generation, and more), webhooks, agent triggers with human-in-the-loop blockers, the customer-facing Portal API, and the public OpenAPI/discovery endpoints. Use when building an integration against Taskr, calling its API from a script or service, configuring API keys and webhooks, or driving Taskr agents over HTTP.
version: 2.1.0
author: Taskr
tags: [taskr, api, rest, http, integration, webhooks]
---

# Taskr Platform API

The Taskr REST API provides programmatic access to org data via API keys. Every route lives under the Convex HTTP endpoint — the same deployment that serves the app.

## Base URL

```
https://<your-deployment>.convex.site
```

All API routes are prefixed `/api/v1/org/`. Your deployment's base URL is shown in your Taskr org's API settings and echoed in the `GET /api/v1/org/api-key-info` response.

---

## Authentication

Every request must carry a valid **org API key** in one of two ways:

```
Authorization: Bearer sk_live_xxxxx
```
or
```
x-api-key: sk_live_xxxxx
```

Keys use a `sk_live_` prefix for production and `sk_test_` for test keys. The raw key is returned **once** on creation — store it in a secret manager immediately.

### How keys are resolved (implementation detail)

1. Raw key is SHA-256 hashed, looked up in the `apiKey` table
2. Status must be `active` and `expiresAt` must be in the future
3. For **user-tied keys**: member's current role is loaded and intersected with the key's declared scopes
4. For **service-account keys** (no userId): only declared scopes apply
5. `organizationId` is **always** derived from the key — never from request body or URL params
6. `lastUsedAt` is updated fire-and-forget after each request

### Testing a key with curl

```bash
export API_KEY="sk_live_your_key_here"
export BASE="https://<your-deployment>.convex.site"

curl -s -H "Authorization: Bearer $API_KEY" "$BASE/api/v1/org/tasks?limit=5" | jq .
```

---

## Scopes

Every key has a list of scopes. An empty scopes array means **full role permissions** (user-tied key) or no access (service-account key).

| Scope | Required for |
|---|---|
| `tasks:read` | GET /tasks, GET /tasks/:id, GET /activity |
| `tasks:create` | POST /tasks, POST /subtasks |
| `tasks:update` | PATCH /tasks/:id, PATCH /subtasks/:id, POST /activity |
| `customers:read` | GET /customers, GET /customers/:id, GET /companies, GET /companies/:id |
| `customers:create` | POST /customers, POST /companies |
| `customers:update` | PATCH /customers/:id, PATCH /companies/:id |
| `contacts:read` | GET /contacts, GET /contacts/:id |
| `contacts:create` | POST /contacts |
| `contacts:update` | PATCH /contacts/:id |
| `invoices:read` | GET /invoices, GET /invoices/:id, POST /pdf/generate/invoice |
| `invoices:create` | POST /invoices |
| `invoices:update` | PATCH /invoices/:id |
| `quotes:read` | GET /quotes, GET /quotes/:id, POST /pdf/generate/quote |
| `quotes:create` | POST /quotes |
| `quotes:update` | PATCH /quotes/:id |
| `vendors:read` | GET /vendors, GET /vendors/:id |
| `vendors:create` | POST /vendors |
| `vendors:update` | PATCH /vendors/:id |
| `vendor-bills:read` | GET /vendor-bills, GET /vendor-bills/:id |
| `vendor-bills:create` | POST /vendor-bills |
| `vendor-bills:update` | PATCH /vendor-bills/:id |
| `stock-movements:read` | GET /stock-movements, GET /stock-movements/:id |
| `stock-movements:create` | POST /stock-movements |
| `employees:read` | GET /employees, GET /employees/:id |
| `employees:create` | POST /employees |
| `employees:update` | PATCH /employees/:id |
| `locations:read` | GET /locations, GET /locations/:id |
| `locations:create` | POST /locations |
| `locations:update` | PATCH /locations/:id |
| `assets:read` | GET /assets, GET /assets/:id |
| `assets:create` | POST /assets |
| `assets:update` | PATCH /assets/:id |
| `faults:create` | POST /faults |
| `faults:update` | PATCH /faults/:id |
| `projects:read` | GET /projects, GET /projects/:id |
| `projects:create` | POST /projects (user-tied key required) |
| `projects:update` | PATCH /projects/:id |
| `milestones:read` | GET /milestones, GET /milestones/:id |
| `milestones:create` | POST /milestones |
| `milestones:update` | PATCH /milestones/:id |
| `variations:read` | GET /variations, GET /variations/:id |
| `variations:create` | POST /variations |
| `variations:update` | PATCH /variations/:id |
| `progress-claims:read` | GET /progress-claims, GET /progress-claims/:id |
| `progress-claims:write` | POST /progress-claims, PATCH /progress-claims/:id |
| `contracts:read` | GET /contracts, GET /contracts/:id |
| `contracts:create` | POST /contracts (user-tied key required) |
| `contracts:update` | PATCH /contracts/:id |
| `purchase_orders:read` | GET /purchase-orders, GET /purchase-orders/:id |
| `purchase_orders:create` | POST /purchase-orders |
| `purchase_orders:update` | PATCH /purchase-orders/:id |
| `transactions:read` | GET /transactions, GET /transactions/:id |
| `transactions:create` | POST /transactions |
| `transactions:update` | PATCH /transactions/:id |
| `payments:read` | GET /payments, GET /payments/:id |
| `payments:create` | POST /payments |
| `payments:update` | PATCH /payments/:id |
| `timesheets:read` | GET /timesheet-entries, GET /timesheet-entries/:id |
| `timesheets:create` | POST /timesheet-entries |
| `timesheets:update` | PATCH /timesheet-entries/:id |
| `documents:read` | GET /documents, GET /documents/:id |
| `tenders:read` | GET /tenders, GET /tenders/:id, GET /tender-clarifications, GET /tender-clarifications/:id |
| `tenders:create` | POST /tenders, POST /tender-clarifications |
| `tenders:update` | PATCH /tenders/:id, PATCH /tender-clarifications/:id |
| `estimates:read` | GET /estimates, GET /estimates/:id, GET /estimates/:id/boq, GET /subcontractor-quotes, GET /subcontractor-quotes/:id |
| `estimates:create` | POST /estimates, POST /subcontractor-quotes |
| `estimates:update` | PATCH /estimates/:id, PATCH /subcontractor-quotes/:id |
| `estimates:approve` | POST /estimates/:id/promote |
| `compliance:update` | PATCH /compliance-requirements/:id |
| `settings:read` | GET /labour-rates, GET /labour-rates/:id |
| `settings:manage` | POST /labour-rates, PATCH /labour-rates/:id |
| `takeoffs:read` | GET /takeoffs, GET /takeoffs/:id |
| `takeoffs:create` | POST /takeoffs |
| `takeoffs:update` | PATCH /takeoffs/:id |
| `prebuilds:read` | GET /prebuilds, GET /prebuilds/:id |
| `prebuilds:create` | POST /prebuilds |
| `prebuilds:update` | PATCH /prebuilds/:id |
| `jobcosting:read` | GET /job-costs, GET /job-costs/:id |
| `jobcosting:create` | POST /job-costs |
| `jobcosting:update` | PATCH /job-costs/:id |
| `scheduling:read` | GET /schedule/blocks, GET /schedule/blocks/:id, GET /schedule/unscheduled, GET /schedule/capacity |
| `scheduling:create` | POST /schedule/blocks |
| `scheduling:update` | PATCH /schedule/blocks/:id |
| `scheduling:delete` | DELETE /schedule/blocks/:id |
| `agents:trigger` | POST /agent/trigger, GET /agent/runs, GET /agent/runs/:id |

**Scope ceiling**: a user-tied key cannot grant more access than the user's role allows. Admin-only actions remain admin-only regardless of declared scopes.

**Note:** `agents:trigger` is a custom scope — it is not mapped to RBAC resources. It only gates agent API endpoints.

---

## Modules

Routes also enforce **org module entitlements**. A 403 is returned if the module isn't enabled:

| Route prefix | Module required |
|---|---|
| /tasks | `tasks` |
| /subtasks | `tasks` |
| /activity | `tasks` |
| /customers | `customers` |
| /companies | `customers` |
| /contacts | `customers` |
| /invoices | `invoicing` |
| /quotes | `quoting` |
| /vendors | `vendors` |
| /employees | `hr` |
| /locations | `locations` |
| /assets | `assets` |
| /faults | `defects` |
| /projects | `tasks` |
| /milestones | `projects` |
| /variations | `projects` |
| /progress-claims | `projects` |
| /contracts | `contracts` |
| /purchase-orders | `purchase_orders` |
| /transactions | `invoicing` |
| /payments | `invoicing` |
| /timesheet-entries | `timesheets` |
| /documents | `documents` |
| /tenders | `tender_pipeline` |
| /tender-clarifications | `tender_pipeline` |
| /estimates | `estimating` |
| /subcontractor-quotes | `estimating` |
| /labour-rates | `estimating` |
| /takeoffs | `takeoffs` |
| /prebuilds | `prebuilds` |
| /job-costs | `job_costing` |
| /schedule/* | `scheduling` |
| /compliance-requirements | `compliance` |
| /agent/* | `ai_assistant` |

---

## Pagination

All list endpoints support cursor-based pagination:

```
GET /api/v1/org/tasks?limit=25&cursor=<nextCursor>
```

**Query params:**
- `limit` — max items to return (default 50, max 100)
- `cursor` — opaque string from the previous response's `nextCursor`
- `status` — filter by status (on tasks, customers, invoices, quotes)
- `search` — full-text search (on customers, invoices, quotes)
- `sort` — `asc` (default) or `desc` (newest first) — currently supported on `/tasks`

**Response shape:**

```json
{
  "tasks": [...],
  "nextCursor": "eyJwYWdlIjoxfQ==",
  "hasMore": true
}
```

When `hasMore` is `false` or `nextCursor` is `null`, you've reached the end.

---

## Record identifiers

Every `:id` path parameter is the record's **32-char Convex document id** (lowercase
alphanumeric, e.g. `jd7abc123def456…`). The API does **not** resolve a record by its printed
number — `taskNumber` (`T-1`), `invoiceNumber` (`INV-1001`), an asset's `assetNumber`, or a
PO number are display fields, not addressable keys. Passing one to `GET /tasks/T-1` returns
`404`/`400`, not the task.

To go from a printed number to an id, list the collection with `search` and match the number
field yourself:

```bash
# Resolve invoice INV-1001 → its id, then fetch it
ID=$(curl -s -H "Authorization: Bearer $API_KEY" \
  "$BASE/api/v1/org/invoices?search=INV-1001&limit=100" \
  | jq -r '.invoices[] | select(.invoiceNumber=="INV-1001") | ._id')
curl -s -H "Authorization: Bearer $API_KEY" "$BASE/api/v1/org/invoices/$ID" | jq .
```

The **taskr-cli** does this resolution automatically — `taskr invoices get INV-1001` — so
prefer the CLI for interactive or scripted number-based lookups.

---

## Routes Reference

### Tasks

#### List tasks

```bash
GET /api/v1/org/tasks
```

Query params: `limit`, `cursor`, `status`, `sort`, `projectId`, `parentTaskId`, `baseType`

- `sort` — `asc` (default, oldest first) or `desc` (newest first)

```bash
# Get 20 most recent tasks (newest first)
curl -H "Authorization: Bearer $API_KEY" \
  "$BASE/api/v1/org/tasks?limit=20&sort=desc"

# Filter by status
curl -H "Authorization: Bearer $API_KEY" \
  "$BASE/api/v1/org/tasks?limit=20&status=scheduled"
```

#### Get a task

```bash
GET /api/v1/org/tasks/:id
```

Returns the full task including `subtasks[]` (subtask table records, sorted by `sortOrder`) and `childTasks[]` (tasks with this task as `parentTaskId`).

```bash
curl -H "Authorization: Bearer $API_KEY" \
  "$BASE/api/v1/org/tasks/jd7abc123def456"
```

#### Create a task

```bash
POST /api/v1/org/tasks
Content-Type: application/json
Scope required: tasks:create
```

**Required fields:**
- `title` (string)

**Optional fields:**

```json
{
  "title": "Annual fire suppression inspection",
  "description": "Full system check per AS1851",
  "taskType": "inspection",
  "baseType": "task",
  "status": "draft",
  "priority": 2,
  "dueDate": 1740000000000,
  "scheduledDate": 1740000000000,
  "assignedTo": "<userId>",
  "customerId": "<customerId>",
  "locationId": "<locationId>",
  "assetId": "<assetId>",
  "parentTaskId": "<taskId>",
  "projectId": "<projectId>",
  "notes": "Customer wants morning slot",
  "internalNotes": "Check panel code in notes",
  "isCallout": false,
  "isBillable": true
}
```

**Response:** `201 Created`

```json
{ "id": "jd7abc123def456" }
```

**Child tasks** are created by passing `parentTaskId`. The child task appears in the parent's `childTasks[]` when fetched via GET /tasks/:id.

#### Update a task

```bash
PATCH /api/v1/org/tasks/:id
Content-Type: application/json
Scope required: tasks:update
```

All fields are optional — only send what you want to change:

```json
{
  "status": "completed",
  "priority": 1,
  "assignedTo": "<userId>",
  "notes": "Completed ahead of schedule"
}
```

Returns 404 if task doesn't exist or belongs to another org (intentional — avoids leaking entity existence).

---

### Customers

#### List customers

```bash
GET /api/v1/org/customers?limit=25&search=Acme&status=active
```

#### Get a customer

```bash
GET /api/v1/org/customers/:id
```

#### Create a customer

```bash
POST /api/v1/org/customers
```

**Required:** `name`

```json
{
  "name": "Acme Corp",
  "status": "active",
  "uniqueRef": "ACME-001",
  "businessCategory": "commercial",
  "contact": "Jane Smith",
  "email": "jane@acme.com",
  "phone": "+61 2 9999 0000",
  "mobile": "+61 400 000 000",
  "abn": "12 345 678 901",
  "addressLine1": "123 Main St",
  "city": "Sydney",
  "state": "NSW",
  "postcode": "2000",
  "country": "AU",
  "notes": "Key account — priority scheduling"
}
```

#### Update a customer

```bash
PATCH /api/v1/org/customers/:id
```

All fields optional.

---

### Invoices

#### List / Get

```bash
GET /api/v1/org/invoices?limit=25&status=draft
GET /api/v1/org/invoices/:id
```

#### Create an invoice

```bash
POST /api/v1/org/invoices
```

**Required:** `customerId`, `issueDate` (ms timestamp), `dueDate` (ms timestamp)

```json
{
  "customerId": "<customerId>",
  "locationId": "<locationId>",
  "title": "Q1 Maintenance Contract",
  "description": "Quarterly fire system servicing",
  "issueDate": 1740000000000,
  "dueDate": 1742592000000,
  "taxRate": 10,
  "notes": "Payment due within 14 days",
  "internalNotes": "Approved by finance"
}
```

#### Update an invoice

```bash
PATCH /api/v1/org/invoices/:id
```

Fields: `title`, `description`, `status`, `dueDate`, `taxRate`, `notes`, `internalNotes`

---

### Quotes

#### List / Get

```bash
GET /api/v1/org/quotes?limit=25
GET /api/v1/org/quotes/:id
```

#### Create a quote

```bash
POST /api/v1/org/quotes
```

**Required:** `customerId`, `title`

```json
{
  "customerId": "<customerId>",
  "locationId": "<locationId>",
  "title": "Fire suppression upgrade proposal",
  "description": "Replacement of aged suppression heads",
  "validFrom": 1740000000000,
  "validUntil": 1745000000000,
  "taxRate": 10,
  "notes": "Price valid for 30 days",
  "internalNotes": "Parts ETA 2 weeks",
  "termsAndConditions": "Standard Taskr T&Cs apply"
}
```

#### Update a quote

```bash
PATCH /api/v1/org/quotes/:id
```

Fields: `title`, `description`, `validFrom`, `validUntil`, `taxRate`, `notes`, `internalNotes`, `termsAndConditions`

---

### Locations

#### List / Get

```bash
GET /api/v1/org/locations?limit=25&search=Sydney&status=active
GET /api/v1/org/locations/:id
```

#### Create a location

```bash
POST /api/v1/org/locations
```

**Required:** `name`

```json
{
  "name": "Acme Corp — North Sydney",
  "customerId": "<customerId>",
  "addressLine1": "100 Miller St",
  "addressLine2": "Level 5",
  "city": "North Sydney",
  "state": "NSW",
  "postcode": "2060",
  "country": "AU",
  "latitude": -33.8398,
  "longitude": 151.2093,
  "locationType": "commercial",
  "status": "active",
  "contactName": "Bob Jones",
  "contactPhone": "+61 2 9999 1111",
  "contactEmail": "bob@acme.com",
  "notes": "Secure access — call ahead"
}
```

#### Update a location

```bash
PATCH /api/v1/org/locations/:id
```

Fields: `name`, `status`, `addressLine1`, `city`, `state`, `postcode`, `country`, `contactName`, `contactPhone`, `contactEmail`, `notes`

---

### Assets

#### List / Get

```bash
GET /api/v1/org/assets?limit=25&search=fire+panel&status=active
GET /api/v1/org/assets/:id
```

#### Create an asset

```bash
POST /api/v1/org/assets
```

**Required:** `name`

```json
{
  "name": "Fire Panel FP-001",
  "customerId": "<customerId>",
  "locationId": "<locationId>",
  "assetNumber": "FP-001",
  "description": "Notifier AFP-200 fire alarm panel",
  "assetType": "fire_panel",
  "serialNumber": "AFP200-SN98765",
  "model": "AFP-200",
  "manufacturer": "Notifier",
  "purchaseDate": 1640000000000,
  "installDate": 1641000000000,
  "warrantyExpiry": 1703000000000,
  "nextServiceDate": 1756000000000,
  "purchaseCost": 4500,
  "notes": "Commissioned Jan 2022",
  "status": "active"
}
```

#### Update an asset

```bash
PATCH /api/v1/org/assets/:id
```

Fields: `name`, `description`, `assetType`, `serialNumber`, `model`, `manufacturer`, `status`, `nextServiceDate`, `warrantyExpiry`, `notes`

---

### Faults

Module required: `defects`

#### Create a fault

```bash
POST /api/v1/org/faults
```

**Required:** `title`

```json
{
  "title": "Sprinkler head leaking — Zone 3",
  "description": "Slow drip from head at grid ref C7",
  "status": "open",
  "priority": "high",
  "severity": "major",
  "category": "mechanical",
  "customerId": "<customerId>",
  "locationId": "<locationId>",
  "assetId": "<assetId>",
  "assignedTo": "<userId>",
  "targetResolutionDate": 1740500000000
}
```

#### Update a fault

```bash
PATCH /api/v1/org/faults/:id
```

Fields: `title`, `description`, `status`, `priority`, `severity`, `assignedTo`, `targetResolutionDate`, `resolution`

---

### Companies

Companies are a customer-level entity variant (share the `customers` module). Used to represent business entities linked to customers.

```bash
GET /api/v1/org/companies?limit=25&search=Acme
GET /api/v1/org/companies/:id
POST /api/v1/org/companies
PATCH /api/v1/org/companies/:id
```

Scopes: `customers:read`, `customers:create`, `customers:update`. Module: `customers`.

---

### Contacts

Individual contact records linked to customers or companies.

```bash
GET /api/v1/org/contacts?limit=25
GET /api/v1/org/contacts/:id
POST /api/v1/org/contacts
PATCH /api/v1/org/contacts/:id
```

Scopes: `contacts:read`, `contacts:create`, `contacts:update`. Module: `customers`.

---

### Vendors

```bash
GET /api/v1/org/vendors?limit=25&search=supplier
GET /api/v1/org/vendors/:id
POST /api/v1/org/vendors
PATCH /api/v1/org/vendors/:id
```

**Required for create:** `name`

Scopes: `vendors:read`, `vendors:create`, `vendors:update`. Module: `vendors`.

---

### Employees

HR records for organization team members.

```bash
GET /api/v1/org/employees?limit=25
GET /api/v1/org/employees/:id
POST /api/v1/org/employees
PATCH /api/v1/org/employees/:id
```

Scopes: `employees:read`, `employees:create`, `employees:update`. Module: `hr`.

---

### Milestones

Project milestones with task linking and invoice association.

```bash
GET /api/v1/org/milestones?limit=25
GET /api/v1/org/milestones/:id
POST /api/v1/org/milestones
PATCH /api/v1/org/milestones/:id
```

Scopes: `milestones:read`, `milestones:create`, `milestones:update`. Module: `projects`.

---

### Variations

Scope changes and cost adjustments on projects.

```bash
GET /api/v1/org/variations?limit=25
GET /api/v1/org/variations/:id
POST /api/v1/org/variations
PATCH /api/v1/org/variations/:id
```

Scopes: `variations:read`, `variations:create`, `variations:update`. Module: `projects`.

---

### Progress Claims

Billing progress claims against project milestones.

```bash
GET /api/v1/org/progress-claims?limit=25
GET /api/v1/org/progress-claims/:id
POST /api/v1/org/progress-claims
PATCH /api/v1/org/progress-claims/:id
```

Scopes: `progress-claims:read`, `progress-claims:write`. Module: `projects`.

---

### Purchase Orders

```bash
GET /api/v1/org/purchase-orders?limit=25&status=issued
GET /api/v1/org/purchase-orders/:id
POST /api/v1/org/purchase-orders
PATCH /api/v1/org/purchase-orders/:id
```

Scopes: `purchase_orders:read`, `purchase_orders:create`, `purchase_orders:update`. Module: `purchase_orders`.

---

### Payments

Payment records linked to invoices.

```bash
GET /api/v1/org/payments?limit=25
GET /api/v1/org/payments/:id
POST /api/v1/org/payments
PATCH /api/v1/org/payments/:id
```

Scopes: `payments:read`, `payments:create`, `payments:update`. Module: `invoicing`.

---

### Tenders

Tender pipeline management for estimating workflows.

```bash
GET /api/v1/org/tenders?limit=25&status=submitted
GET /api/v1/org/tenders/:id
POST /api/v1/org/tenders
PATCH /api/v1/org/tenders/:id
```

**Required for create:** `title`

Scopes: `tenders:read`, `tenders:create`, `tenders:update`. Module: `tender_pipeline`.

---

### Tender Clarifications

Questions and responses during the tender process.

```bash
GET /api/v1/org/tender-clarifications?limit=25
GET /api/v1/org/tender-clarifications/:id
POST /api/v1/org/tender-clarifications
PATCH /api/v1/org/tender-clarifications/:id
```

Scopes: `tenders:read`, `tenders:create`, `tenders:update`. Module: `tender_pipeline`.

---

### Estimates

Cost estimates linked to tenders, with promotion to quotes.

```bash
GET /api/v1/org/estimates?limit=25
GET /api/v1/org/estimates/:id
POST /api/v1/org/estimates
PATCH /api/v1/org/estimates/:id
```

Scopes: `estimates:read`, `estimates:create`, `estimates:update`. Module: `estimating`.

#### Promote an estimate

Elevate an estimate to a quote or project.

```bash
POST /api/v1/org/estimates/:id/promote
```

Scope: `estimates:approve`. Module: `estimating`.

#### Get bill of quantities

```bash
GET /api/v1/org/estimates/:id/boq
```

Scope: `estimates:read`. Module: `estimating`.

---

### Subcontractor Quotes

Quotes received from subcontractors for estimate comparison.

```bash
GET /api/v1/org/subcontractor-quotes?limit=25
GET /api/v1/org/subcontractor-quotes/:id
POST /api/v1/org/subcontractor-quotes
PATCH /api/v1/org/subcontractor-quotes/:id
```

Scopes: `estimates:read`, `estimates:create`, `estimates:update`. Module: `estimating`.

---

### Labour Rates

Estimating labour rate configuration.

```bash
GET /api/v1/org/labour-rates?limit=25
GET /api/v1/org/labour-rates/:id
POST /api/v1/org/labour-rates
PATCH /api/v1/org/labour-rates/:id
```

Scopes: `settings:read` (GET), `settings:manage` (POST/PATCH). Module: `estimating`.

---

### Takeoffs

Quantity takeoffs from drawings and plans.

```bash
GET /api/v1/org/takeoffs?limit=25
GET /api/v1/org/takeoffs/:id
POST /api/v1/org/takeoffs
PATCH /api/v1/org/takeoffs/:id
```

Scopes: `takeoffs:read`, `takeoffs:create`, `takeoffs:update`. Module: `takeoffs`.

---

### Prebuilds

Reusable assembly templates for estimating.

```bash
GET /api/v1/org/prebuilds?limit=25
GET /api/v1/org/prebuilds/:id
POST /api/v1/org/prebuilds
PATCH /api/v1/org/prebuilds/:id
```

Scopes: `prebuilds:read`, `prebuilds:create`, `prebuilds:update`. Module: `prebuilds`.

---

### Job Costs

Job costing records for tracking actual vs estimated costs.

```bash
GET /api/v1/org/job-costs?limit=25
GET /api/v1/org/job-costs/:id
POST /api/v1/org/job-costs
PATCH /api/v1/org/job-costs/:id
```

Scopes: `jobcosting:read`, `jobcosting:create`, `jobcosting:update`. Module: `job_costing`.

---

### Schedule Blocks

Schedule management for technician/resource allocation.

```bash
GET /api/v1/org/schedule/blocks?limit=25
GET /api/v1/org/schedule/blocks/:id
POST /api/v1/org/schedule/blocks
PATCH /api/v1/org/schedule/blocks/:id
DELETE /api/v1/org/schedule/blocks/:id
```

Scopes: `scheduling:read`, `scheduling:create`, `scheduling:update`, `scheduling:delete`. Module: `scheduling`.

#### List unscheduled tasks

```bash
GET /api/v1/org/schedule/unscheduled
```

Scope: `scheduling:read`. Module: `scheduling`.

#### Get scheduling capacity

```bash
GET /api/v1/org/schedule/capacity
```

Scope: `scheduling:read`. Module: `scheduling`.

---

### Compliance Requirements

Update compliance requirement configurations.

```bash
PATCH /api/v1/org/compliance-requirements/:id
```

Scope: `compliance:update`. Module: `compliance`.

---

### Activity Logging

Read and append field activity/event logs.

```bash
GET /api/v1/org/activity?limit=25
POST /api/v1/org/activity
```

Scopes: `tasks:read` (GET), `tasks:update` (POST). Module: `tasks`.

---

### PDF Generation (API Key Authenticated)

Generate PDFs for quotes, invoices, and task reports.

```bash
POST /api/v1/pdf/generate/quote
POST /api/v1/pdf/generate/invoice
POST /api/v1/pdf/generate/task
```

Scopes: `quotes:read`, `invoices:read`, `tasks:read` respectively. No module gate.

Each expects a JSON body with the entity `id`. Returns the generated PDF.

---

### Public PDF Routes (Token-based, No Auth)

Download PDFs via one-time access tokens (generated by the app).

```bash
GET /api/v1/pdf/quote/:token
GET /api/v1/pdf/invoice/:token
GET /api/v1/pdf/task/:token
```

No authentication required — the token itself is the auth.

---

### Webhooks

Webhook management requires **admin or owner** role (service account keys are always permitted).

#### List webhooks

```bash
GET /api/v1/org/webhooks
```

#### Create a webhook

```bash
POST /api/v1/org/webhooks
```

```json
{
  "name": "My ERP sync",
  "url": "https://erp.example.com/taskr/webhook",
  "events": ["task.created", "task.updated", "invoice.created"]
}
```

The response includes a `signingSecret` — this is returned **once only**. Use it to verify `X-Taskr-Signature` headers on incoming webhook deliveries.

#### Delete a webhook

```bash
DELETE /api/v1/org/webhooks/:id
```

#### List delivery history

```bash
GET /api/v1/org/webhooks/:id/deliveries?limit=50
```

---

### Agent Triggers

Programmatically trigger Taskr's AI agent, track execution, and receive enriched webhook events. All agent endpoints require:
- Scope: `agents:trigger`
- Module: `ai_assistant` enabled for the organization
- **User-tied API key only** — service account keys are rejected (RBAC needs a real user)

#### Trigger an agent run

```bash
POST /api/v1/org/agent/trigger
Content-Type: application/json
Scope required: agents:trigger
```

**Required fields:**
- `goal` (string) — what the agent should accomplish

**Optional fields:**

```json
{
  "goal": "Create an inspection task for customer Acme Corp at their North Sydney site",
  "maxSteps": 15,
  "context": "Customer called requesting urgent fire panel inspection after alarm fault",
  "metadata": { "source": "erp", "ticket_id": "TK-4521" }
}
```

- `maxSteps` (integer, 1–50, default 10) — max reasoning steps
- `context` (string) — additional context for the agent
- `metadata` (object) — arbitrary metadata stored with the run

**Response:** `202 Accepted`

```json
{
  "id": "jd7abc123def456",
  "status": "pending",
  "message": "Agent run created and queued for execution"
}
```

The agent executes asynchronously. Use polling or webhooks to track progress.

#### Get an agent run

```bash
GET /api/v1/org/agent/runs/:id
```

```json
{
  "id": "jd7abc123def456",
  "goal": "Create an inspection task...",
  "status": "completed",
  "stepsCompleted": 8,
  "result": "I created task TSK-0042 for...",
  "startedAt": 1740000000000,
  "completedAt": 1740000045000,
  "durationMs": 45000
}
```

#### List agent runs

```bash
GET /api/v1/org/agent/runs?limit=25&status=completed&cursor=<nextCursor>
```

Query params: `limit`, `cursor`, `status` (pending | running | completed | failed | cancelled | blocked)

---

### Human-in-the-Loop (Agent Blockers)

When an agent run hits a blocker — needs clarification, a decision, access, or encounters an error — it can pause itself, ask a human for help, and resume when unblocked.

**State machine:** `running` → `blocked` (via `/block`) → human resolves → new run created (`pending` → `running`)

#### Block an agent run

```bash
POST /api/v1/org/agent/runs/:id/block
Content-Type: application/json
Scope required: agents:trigger
```

Creates a task blocker, puts the task on hold, sets the agent run to `blocked`, creates a conversation thread with the question, and notifies the target user.

**Required fields:**
- `taskId` (string) — the task the agent is working on
- `blockerType` (string) — one of: `clarification`, `decision`, `access`, `error`
- `question` (string) — what the agent needs help with

**Optional fields:**
- `options` (string[]) — multiple choice options
- `targetUserId` (string) — specific user to notify

```json
{
  "taskId": "<taskId>",
  "blockerType": "clarification",
  "question": "Which zone should I inspect? The customer has multiple sites.",
  "options": ["Zone A — North Sydney", "Zone B — CBD", "Zone C — Parramatta"],
  "targetUserId": "<userId>"
}
```

**Response:** `201 Created`

```json
{
  "blockerId": "jd7...",
  "conversationId": "jd7...",
  "commentId": "jd7..."
}
```

**Side effects:**
- Task status → `on_hold` with `onHoldReason` based on blocker type
- Agent run status → `blocked`
- Conversation created with AI-authored question message
- Push notification sent to target user (type: `agent_blocker`)
- `agent.blocked` webhook dispatched

#### Resume an agent run

```bash
POST /api/v1/org/agent/runs/:id/resume
Content-Type: application/json
Scope required: agents:trigger (user-tied key required)
```

Resolves blocker(s), posts resolution to the conversation, and — if all blockers are resolved — creates a **new** agent run with `metadata.resumedFrom` pointing to the original.

**Required fields:**
- `resolution` (string) — the answer/decision

**Optional fields:**
- `blockerId` (string) — resolve a specific blocker (otherwise resolves all open blockers)

```json
{
  "resolution": "Zone A — North Sydney. Customer confirmed on the phone.",
  "blockerId": "jd7..."
}
```

**Response:**

```json
{
  "resolved": true,
  "allResolved": true
}
```

When `allResolved: true`, a new agent run is automatically created and scheduled. The new run has:
- Same `goal`, `maxSteps`, `triggeredBy` as the original
- `contextMessage`: `"RESUMED: Previous run was blocked. Resolution: <resolution>"`
- `metadata.resumedFrom`: original run ID
- `metadata.blockerResolution`: the resolution text

#### List blockers for an agent run

```bash
GET /api/v1/org/agent/runs/:id/blockers
Scope required: agents:trigger
```

```json
{
  "blockers": [
    {
      "_id": "jd7...",
      "taskId": "jd7...",
      "blockerType": "clarification",
      "question": "Which zone?",
      "options": ["Zone A", "Zone B"],
      "status": "open",
      "createdAt": 1740000000000
    }
  ]
}
```

#### Agent block/resume flow (curl)

```bash
# 1. Trigger an agent run
RUN_ID=$(curl -s -X POST -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"goal":"Inspect fire panels at Acme Corp","maxSteps":15}' \
  "$BASE/api/v1/org/agent/trigger" | jq -r .id)

# 2. Agent hits a blocker — block itself
curl -s -X POST -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d "{\"taskId\":\"<taskId>\",\"blockerType\":\"clarification\",\"question\":\"Which zone should I inspect?\",\"options\":[\"Zone A\",\"Zone B\"]}" \
  "$BASE/api/v1/org/agent/runs/$RUN_ID/block"

# 3. Check blockers
curl -s -H "Authorization: Bearer $API_KEY" \
  "$BASE/api/v1/org/agent/runs/$RUN_ID/blockers"

# 4. Human resolves the blocker
curl -s -X POST -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"resolution":"Zone A — customer confirmed"}' \
  "$BASE/api/v1/org/agent/runs/$RUN_ID/resume"
# → New agent run created automatically
```

---

### Conversations

REST endpoints for managing conversations (group chat threads). Used by agents and integrations to communicate with team members.

#### List conversations

```bash
GET /api/v1/org/conversations?limit=25&taskId=<taskId>&cursor=<cursor>
Scope required: conversations:read
```

Filter by `taskId` to find conversations linked to a specific task.

#### Create a conversation

```bash
POST /api/v1/org/conversations
Content-Type: application/json
Scope required: conversations:create (user-tied key required)
```

```json
{
  "name": "Agent Thread: Fire Inspection",
  "participantIds": ["<userId1>", "<userId2>"],
  "taskId": "<taskId>"
}
```

**Response:** `201 Created`

```json
{ "id": "jd7..." }
```

#### Get messages

```bash
GET /api/v1/org/conversations/:id/messages?limit=50&since=<timestamp>&cursor=<cursor>
Scope required: conversations:read
```

The `since` parameter filters messages created after the given timestamp (ms). Useful for polling.

```json
{
  "messages": [
    {
      "id": "jd7...",
      "content": "Which zone should I inspect?",
      "authorId": null,
      "authorType": "ai_assistant",
      "authorName": "Taskr AI Agent",
      "isAgentMessage": true,
      "agentRunId": "jd7...",
      "createdAt": 1740000000000
    }
  ],
  "cursor": null,
  "hasMore": false
}
```

#### Post a message

```bash
POST /api/v1/org/conversations/:id/messages
Content-Type: application/json
Scope required: conversations:create
```

```json
{
  "content": "Zone A — customer confirmed on the phone.",
  "isInternal": false
}
```

**Response:** `201 Created`

```json
{ "id": "jd7..." }
```

---

### Agent Webhook Events

When agent runs execute, webhook events fire with **enriched payloads** containing everything an external agent needs to act immediately — API base URL, auth format, available endpoints, and structured error info.

#### Events

| Event | When | Status |
|---|---|---|
| `agent.started` | Run begins execution | `running` |
| `agent.completed` | Run finishes successfully | `completed` |
| `agent.failed` | Run errors out | `failed` |
| `agent.blocked` | Run is blocked, needs human input | `blocked` |
| `agent.resumed` | Blocker resolved, new run created | `pending` |

#### Common payload structure (all 3 events)

```json
{
  "run": {
    "id": "jd7abc123def456",
    "goal": "Create an inspection task for Acme Corp",
    "max_steps": 15,
    "context_message": "Customer called requesting urgent inspection",
    "metadata": { "source": "erp", "ticket_id": "TK-4521" }
  },
  "organization": {
    "id": "org_abc123",
    "name": "FireTech Solutions"
  },
  "triggered_by": {
    "user_id": "usr_xyz789",
    "name": "Jane Smith",
    "email": "jane@firetech.com",
    "role": "admin",
    "api_key_name": "ERP Integration Key"
  },
  "api": {
    "base_url": "https://<your-deployment>.convex.site",
    "version": "v1",
    "auth": {
      "type": "bearer",
      "header": "Authorization",
      "format": "Bearer <your-api-key>"
    },
    "introspection_endpoint": "GET /api/v1/org/api-key-info"
  }
}
```

#### `agent.started` — additional fields

```json
{
  "status": "running",
  "started_at": 1740000000000,
  "api": {
    "poll_run_endpoint": "GET /api/v1/org/agent/runs/jd7abc123def456"
  }
}
```

#### `agent.completed` — additional fields

```json
{
  "status": "completed",
  "result": "I created task TSK-0042 assigned to...",
  "steps_completed": 8,
  "thread_id": "thread_abc",
  "duration_ms": 45000,
  "completed_at": 1740000045000,
  "api": {
    "key_endpoints": {
      "tasks": "GET /api/v1/org/tasks",
      "customers": "GET /api/v1/org/customers",
      "invoices": "GET /api/v1/org/invoices",
      "quotes": "GET /api/v1/org/quotes",
      "projects": "GET /api/v1/org/projects",
      "tenders": "GET /api/v1/org/tenders",
      "estimates": "GET /api/v1/org/estimates",
      "agent_runs": "GET /api/v1/org/agent/runs"
    }
  }
}
```

#### `agent.failed` — additional fields

```json
{
  "status": "failed",
  "error": {
    "message": "Permission denied: user cannot create tasks",
    "category": "permission",
    "retryable": false
  },
  "duration_ms": 2100,
  "completed_at": 1740000002100,
  "api": {
    "retry_endpoint": "POST /api/v1/org/agent/trigger"
  }
}
```

**Error categories:** `auth`, `permission`, `timeout`, `validation`, `internal`
**Retryable:** `timeout` and `internal` errors are retryable; `auth`, `permission`, and `validation` are not.

#### Configuring webhooks for external agents

1. **Create a webhook subscription** for agent events:

```bash
curl -X POST -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "External Agent Listener",
    "url": "https://my-agent.example.com/taskr/webhook",
    "events": ["agent.started", "agent.completed", "agent.failed"]
  }' \
  "$BASE/api/v1/org/webhooks"
```

Save the `signingSecret` from the response — used to verify `X-Taskr-Signature` on incoming deliveries.

2. **Verify webhook signatures** (HMAC-SHA256):

```typescript
import { createHmac, timingSafeEqual } from "crypto";

function verifySignature(payload: string, signature: string, secret: string): boolean {
  const expected = createHmac("sha256", secret).update(payload).digest("hex");
  return timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
}

// In your webhook handler:
const signature = req.headers["x-taskr-signature"];
const rawBody = await req.text();
if (!verifySignature(rawBody, signature, SIGNING_SECRET)) {
  return new Response("Invalid signature", { status: 401 });
}
```

3. **Act on events** — use the `api.base_url` and auth format from the payload:

```typescript
async function handleAgentCompleted(payload) {
  const { api, run, organization } = payload;

  // Use the base URL from the webhook payload
  const tasksUrl = `${api.base_url}/api/v1/org/tasks?limit=5`;

  const response = await fetch(tasksUrl, {
    headers: { Authorization: `Bearer ${MY_API_KEY}` },
  });

  const { tasks } = await response.json();
  // Process tasks created by the agent...
}
```

4. **Discover all available endpoints** via introspection:

```bash
curl -H "Authorization: Bearer $API_KEY" \
  "$BASE/api/v1/org/api-key-info"
```

Returns the full list of endpoints your key can access, filtered by scopes and modules.

---

### Agent API Examples

#### curl: Trigger, poll, and list

```bash
export API_KEY="sk_live_your_key_here"
export BASE="https://<your-deployment>.convex.site"

# Trigger an agent run
curl -X POST -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "goal": "Create an urgent inspection task for customer Acme Corp at North Sydney, assign to the first available technician",
    "maxSteps": 15,
    "context": "Customer reported fire panel alarm fault at 3am. Needs same-day response.",
    "metadata": { "source": "erp", "ticket_id": "TK-4521" }
  }' \
  "$BASE/api/v1/org/agent/trigger"
# → 202 { "id": "jd7abc123def456", "status": "pending", ... }

# Poll for completion
curl -H "Authorization: Bearer $API_KEY" \
  "$BASE/api/v1/org/agent/runs/jd7abc123def456"

# List completed runs
curl -H "Authorization: Bearer $API_KEY" \
  "$BASE/api/v1/org/agent/runs?status=completed&limit=10"

# List failed runs (for retry logic)
curl -H "Authorization: Bearer $API_KEY" \
  "$BASE/api/v1/org/agent/runs?status=failed&limit=5"
```

#### Node.js: External agent webhook handler

```typescript
import { createHmac, timingSafeEqual } from "crypto";
import express from "express";

const app = express();
const SIGNING_SECRET = process.env.TASKR_WEBHOOK_SECRET!;
const API_KEY = process.env.TASKR_API_KEY!;

app.post("/taskr/webhook", express.text({ type: "*/*" }), async (req, res) => {
  // 1. Verify signature
  const signature = req.headers["x-taskr-signature"] as string;
  const expected = createHmac("sha256", SIGNING_SECRET)
    .update(req.body)
    .digest("hex");

  if (!timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) {
    return res.status(401).send("Invalid signature");
  }

  const payload = JSON.parse(req.body);
  const event = req.headers["x-taskr-event"] as string;

  switch (event) {
    case "agent.started":
      console.log(`Agent run ${payload.run.id} started`);
      break;
    case "agent.completed":
      await handleCompleted(payload);
      break;
    case "agent.failed":
      await handleFailed(payload);
      break;
  }

  res.status(200).send("OK");
});

async function handleCompleted(payload: any) {
  const { api, run } = payload;

  // Use base_url from webhook — no hardcoding needed
  const tasksRes = await fetch(
    `${api.base_url}/api/v1/org/tasks?limit=5`,
    { headers: { Authorization: `Bearer ${API_KEY}` } },
  );
  const { tasks } = await tasksRes.json();

  console.log(`Result: ${payload.result}`);
  console.log(`Steps: ${payload.steps_completed}, Duration: ${payload.duration_ms}ms`);

  // Chain another agent run based on the result
  if (payload.result?.includes("inspection")) {
    await fetch(`${api.base_url}/api/v1/org/agent/trigger`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        goal: "Generate an invoice for the inspection task just created",
        context: `Previous agent run completed: ${payload.result}`,
        metadata: { chained_from: run.id },
      }),
    });
  }
}

async function handleFailed(payload: any) {
  const { error, run, api } = payload;

  console.error(`Failed: ${error.message} [${error.category}]`);

  // Auto-retry if retryable (timeout, internal)
  if (error.retryable) {
    await fetch(`${api.base_url}${api.retry_endpoint}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        goal: run.goal,
        context: run.context_message,
        metadata: { ...run.metadata, retry_of: run.id },
      }),
    });
  }
}
```

#### Python: External agent webhook handler

```python
import hmac, hashlib, json, os, requests
from flask import Flask, request

app = Flask(__name__)
SIGNING_SECRET = os.environ["TASKR_WEBHOOK_SECRET"]
API_KEY = os.environ["TASKR_API_KEY"]

@app.post("/taskr/webhook")
def webhook():
    raw = request.get_data(as_text=True)
    sig = request.headers.get("X-Taskr-Signature", "")
    expected = hmac.new(
        SIGNING_SECRET.encode(), raw.encode(), hashlib.sha256
    ).hexdigest()

    if not hmac.compare_digest(sig, expected):
        return "Invalid signature", 401

    payload = json.loads(raw)
    event = request.headers.get("X-Taskr-Event")

    if event == "agent.completed":
        base = payload["api"]["base_url"]

        # Discover available endpoints
        info = requests.get(
            f"{base}/api/v1/org/api-key-info",
            headers={"Authorization": f"Bearer {API_KEY}"},
        ).json()
        print(f"Available endpoints: {len(info['endpoints'])}")

        # Fetch customers to cross-reference
        customers = requests.get(
            f"{base}/api/v1/org/customers?limit=100",
            headers={"Authorization": f"Bearer {API_KEY}"},
        ).json()
        print(f"Org has {len(customers['customers'])} customers")

    return "OK", 200
```

#### Register a webhook subscription

```bash
curl -X POST -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "My External Agent",
    "url": "https://my-agent.example.com/taskr/webhook",
    "events": ["agent.started", "agent.completed", "agent.failed"]
  }' \
  "$BASE/api/v1/org/webhooks"
# Save the signingSecret from the response — shown only once
```

#### Key requirements

- API key must have `agents:trigger` scope
- Org must have `ai_assistant` module enabled
- Key must be **user-tied** (service account keys rejected)
- Rate limit: 120 requests/min per org

---

## Tasks: Child Tasks vs Subtasks

Taskr has two distinct concepts for breaking work down:

### Child Tasks (parent–child task hierarchy)

- A full `task` record with `parentTaskId` set
- Created via `POST /api/v1/org/tasks` with `parentTaskId` in the body
- Appears in `GET /api/v1/org/tasks/:id` response under `childTasks[]`
- Has its own status, assignee, scheduling, and billability
- Use for: parallel work items, delegated sub-jobs, multi-day breakdowns

```bash
# Create a child task
curl -X POST -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Replace Zone 3 heads",
    "parentTaskId": "jd7abc123def456",
    "assignedTo": "<technicianUserId>",
    "scheduledDate": 1740000000000
  }' \
  "$BASE/api/v1/org/tasks"
```

### Subtasks (checklist items)

- Lightweight checklist-style items in the `subtask` table
- Created via `POST /api/v1/org/subtasks` with `taskId` in the body (scope: `tasks:create`)
- Appear in `GET /api/v1/org/tasks/:id` under `subtasks[]`, sorted by `sortOrder`
- Each subtask has: `title`, `status`, `result` (`pass` | `fail` | `na`), `notes`
- `subtaskNumber` is auto-generated as `{taskNumber}-ST01`, `ST02`, etc.
- Completing all subtasks can auto-complete the parent task (depends on task type config)
- Use for: compliance checklists, inspection steps, sequential service procedures

#### Create a subtask

```bash
POST /api/v1/org/subtasks
Content-Type: application/json
Scope required: tasks:create
```

**Required fields:** `taskId`, `title`

```json
{
  "taskId": "<taskId>",
  "title": "Inspect all detection devices",
  "description": "Visual check of smoke/heat detectors for damage or contamination",
  "estimatedDuration": 45,
  "assetId": "<assetId>",
  "sortOrder": 0
}
```

```bash
curl -X POST -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "taskId": "xx7e029s9e2x4nv8qbm7gsfrg981p96j",
    "title": "Test all manual call points",
    "description": "Activate each MCP and verify alarm panel response",
    "estimatedDuration": 60
  }' \
  "$BASE/api/v1/org/subtasks"
```

**Response:** `201 Created`

```json
{ "id": "x175h3n1ngz35s4j9kabcq361x81prde" }
```

Note: subtask creation requires a user-tied API key (or a service account key provisioned by a known admin), because `createdBy` is required in the schema.

#### Update a subtask

```bash
PATCH /api/v1/org/subtasks/:id
Content-Type: application/json
Scope required: tasks:update
```

Fields: `title`, `description`, `status`, `result` (`pass` | `fail` | `na` | `deferred` | `conditional`), `notes`, `estimatedDuration`, `sortOrder`

---

## Error Responses

All errors follow this shape:

```json
{ "error": "Unauthorized" }
```

| Status | Meaning |
|---|---|
| `401` | Missing or invalid API key |
| `403` | Valid key but wrong scope or module not enabled |
| `400` | Missing required field or malformed JSON |
| `404` | Entity not found (also returned for org mismatch — avoids leaking existence) |
| `405` | HTTP method not supported on this path |
| `500` | Internal error — check Convex logs |

---

## Quick Reference: Full Route Table

| Method | Path | Scope | Module |
|---|---|---|---|
| **Tasks** | | | |
| GET | /api/v1/org/tasks | tasks:read | tasks |
| GET | /api/v1/org/tasks/:id | tasks:read | tasks |
| POST | /api/v1/org/tasks | tasks:create | tasks |
| PATCH | /api/v1/org/tasks/:id | tasks:update | tasks |
| POST | /api/v1/org/subtasks | tasks:create | tasks |
| PATCH | /api/v1/org/subtasks/:id | tasks:update | tasks |
| **Customers** | | | |
| GET | /api/v1/org/customers | customers:read | customers |
| GET | /api/v1/org/customers/:id | customers:read | customers |
| POST | /api/v1/org/customers | customers:create | customers |
| PATCH | /api/v1/org/customers/:id | customers:update | customers |
| GET | /api/v1/org/companies | customers:read | customers |
| GET | /api/v1/org/companies/:id | customers:read | customers |
| POST | /api/v1/org/companies | customers:create | customers |
| PATCH | /api/v1/org/companies/:id | customers:update | customers |
| GET | /api/v1/org/contacts | contacts:read | customers |
| GET | /api/v1/org/contacts/:id | contacts:read | customers |
| POST | /api/v1/org/contacts | contacts:create | customers |
| PATCH | /api/v1/org/contacts/:id | contacts:update | customers |
| **Billing** | | | |
| GET | /api/v1/org/invoices | invoices:read | invoicing |
| GET | /api/v1/org/invoices/:id | invoices:read | invoicing |
| POST | /api/v1/org/invoices | invoices:create | invoicing |
| PATCH | /api/v1/org/invoices/:id | invoices:update | invoicing |
| GET | /api/v1/org/quotes | quotes:read | quoting |
| GET | /api/v1/org/quotes/:id | quotes:read | quoting |
| POST | /api/v1/org/quotes | quotes:create | quoting |
| PATCH | /api/v1/org/quotes/:id | quotes:update | quoting |
| GET | /api/v1/org/transactions | transactions:read | invoicing |
| GET | /api/v1/org/transactions/:id | transactions:read | invoicing |
| POST | /api/v1/org/transactions | transactions:create | invoicing |
| PATCH | /api/v1/org/transactions/:id | transactions:update | invoicing |
| GET | /api/v1/org/payments | payments:read | invoicing |
| GET | /api/v1/org/payments/:id | payments:read | invoicing |
| POST | /api/v1/org/payments | payments:create | invoicing |
| PATCH | /api/v1/org/payments/:id | payments:update | invoicing |
| **Vendors** | | | |
| GET | /api/v1/org/vendors | vendors:read | vendors |
| GET | /api/v1/org/vendors/:id | vendors:read | vendors |
| POST | /api/v1/org/vendors | vendors:create | vendors |
| PATCH | /api/v1/org/vendors/:id | vendors:update | vendors |
| **Vendor Bills** | | | |
| GET | /api/v1/org/vendor-bills | vendor-bills:read | invoicing |
| GET | /api/v1/org/vendor-bills/:id | vendor-bills:read | invoicing |
| POST | /api/v1/org/vendor-bills | vendor-bills:create | invoicing |
| PATCH | /api/v1/org/vendor-bills/:id | vendor-bills:update | invoicing |
| **Stock Movements** | | | |
| GET | /api/v1/org/stock-movements | stock-movements:read | assets |
| GET | /api/v1/org/stock-movements/:id | stock-movements:read | assets |
| POST | /api/v1/org/stock-movements | stock-movements:create | assets |
| **Employees** | | | |
| GET | /api/v1/org/employees | employees:read | hr |
| GET | /api/v1/org/employees/:id | employees:read | hr |
| POST | /api/v1/org/employees | employees:create | hr |
| PATCH | /api/v1/org/employees/:id | employees:update | hr |
| **Sites** | | | |
| GET | /api/v1/org/locations | locations:read | locations |
| GET | /api/v1/org/locations/:id | locations:read | locations |
| POST | /api/v1/org/locations | locations:create | locations |
| PATCH | /api/v1/org/locations/:id | locations:update | locations |
| GET | /api/v1/org/assets | assets:read | assets |
| GET | /api/v1/org/assets/:id | assets:read | assets |
| POST | /api/v1/org/assets | assets:create | assets |
| PATCH | /api/v1/org/assets/:id | assets:update | assets |
| POST | /api/v1/org/faults | faults:create | defects |
| PATCH | /api/v1/org/faults/:id | faults:update | defects |
| **Projects** | | | |
| GET | /api/v1/org/projects | projects:read | tasks |
| GET | /api/v1/org/projects/:id | projects:read | tasks |
| POST | /api/v1/org/projects | projects:create | tasks |
| PATCH | /api/v1/org/projects/:id | projects:update | tasks |
| GET | /api/v1/org/milestones | milestones:read | projects |
| GET | /api/v1/org/milestones/:id | milestones:read | projects |
| POST | /api/v1/org/milestones | milestones:create | projects |
| PATCH | /api/v1/org/milestones/:id | milestones:update | projects |
| GET | /api/v1/org/variations | variations:read | projects |
| GET | /api/v1/org/variations/:id | variations:read | projects |
| POST | /api/v1/org/variations | variations:create | projects |
| PATCH | /api/v1/org/variations/:id | variations:update | projects |
| GET | /api/v1/org/progress-claims | progress-claims:read | projects |
| GET | /api/v1/org/progress-claims/:id | progress-claims:read | projects |
| POST | /api/v1/org/progress-claims | progress-claims:write | projects |
| PATCH | /api/v1/org/progress-claims/:id | progress-claims:write | projects |
| **Contracts & POs** | | | |
| GET | /api/v1/org/contracts | contracts:read | contracts |
| GET | /api/v1/org/contracts/:id | contracts:read | contracts |
| POST | /api/v1/org/contracts | contracts:create | contracts |
| PATCH | /api/v1/org/contracts/:id | contracts:update | contracts |
| GET | /api/v1/org/purchase-orders | purchase_orders:read | purchase_orders |
| GET | /api/v1/org/purchase-orders/:id | purchase_orders:read | purchase_orders |
| POST | /api/v1/org/purchase-orders | purchase_orders:create | purchase_orders |
| PATCH | /api/v1/org/purchase-orders/:id | purchase_orders:update | purchase_orders |
| **Time** | | | |
| GET | /api/v1/org/timesheet-entries | timesheets:read | timesheets |
| GET | /api/v1/org/timesheet-entries/:id | timesheets:read | timesheets |
| POST | /api/v1/org/timesheet-entries | timesheets:create | timesheets |
| PATCH | /api/v1/org/timesheet-entries/:id | timesheets:update | timesheets |
| **Documents** | | | |
| GET | /api/v1/org/documents | documents:read | documents |
| GET | /api/v1/org/documents/:id | documents:read | documents |
| **Estimating** | | | |
| GET | /api/v1/org/tenders | tenders:read | tender_pipeline |
| GET | /api/v1/org/tenders/:id | tenders:read | tender_pipeline |
| POST | /api/v1/org/tenders | tenders:create | tender_pipeline |
| PATCH | /api/v1/org/tenders/:id | tenders:update | tender_pipeline |
| GET | /api/v1/org/tender-clarifications | tenders:read | tender_pipeline |
| GET | /api/v1/org/tender-clarifications/:id | tenders:read | tender_pipeline |
| POST | /api/v1/org/tender-clarifications | tenders:create | tender_pipeline |
| PATCH | /api/v1/org/tender-clarifications/:id | tenders:update | tender_pipeline |
| GET | /api/v1/org/estimates | estimates:read | estimating |
| GET | /api/v1/org/estimates/:id | estimates:read | estimating |
| POST | /api/v1/org/estimates | estimates:create | estimating |
| PATCH | /api/v1/org/estimates/:id | estimates:update | estimating |
| POST | /api/v1/org/estimates/:id/promote | estimates:approve | estimating |
| GET | /api/v1/org/estimates/:id/boq | estimates:read | estimating |
| GET | /api/v1/org/subcontractor-quotes | estimates:read | estimating |
| GET | /api/v1/org/subcontractor-quotes/:id | estimates:read | estimating |
| POST | /api/v1/org/subcontractor-quotes | estimates:create | estimating |
| PATCH | /api/v1/org/subcontractor-quotes/:id | estimates:update | estimating |
| GET | /api/v1/org/labour-rates | settings:read | estimating |
| GET | /api/v1/org/labour-rates/:id | settings:read | estimating |
| POST | /api/v1/org/labour-rates | settings:manage | estimating |
| PATCH | /api/v1/org/labour-rates/:id | settings:manage | estimating |
| GET | /api/v1/org/takeoffs | takeoffs:read | takeoffs |
| GET | /api/v1/org/takeoffs/:id | takeoffs:read | takeoffs |
| POST | /api/v1/org/takeoffs | takeoffs:create | takeoffs |
| PATCH | /api/v1/org/takeoffs/:id | takeoffs:update | takeoffs |
| GET | /api/v1/org/prebuilds | prebuilds:read | prebuilds |
| GET | /api/v1/org/prebuilds/:id | prebuilds:read | prebuilds |
| POST | /api/v1/org/prebuilds | prebuilds:create | prebuilds |
| PATCH | /api/v1/org/prebuilds/:id | prebuilds:update | prebuilds |
| GET | /api/v1/org/job-costs | jobcosting:read | job_costing |
| GET | /api/v1/org/job-costs/:id | jobcosting:read | job_costing |
| POST | /api/v1/org/job-costs | jobcosting:create | job_costing |
| PATCH | /api/v1/org/job-costs/:id | jobcosting:update | job_costing |
| **Scheduling** | | | |
| GET | /api/v1/org/schedule/blocks | scheduling:read | scheduling |
| GET | /api/v1/org/schedule/blocks/:id | scheduling:read | scheduling |
| POST | /api/v1/org/schedule/blocks | scheduling:create | scheduling |
| PATCH | /api/v1/org/schedule/blocks/:id | scheduling:update | scheduling |
| DELETE | /api/v1/org/schedule/blocks/:id | scheduling:delete | scheduling |
| GET | /api/v1/org/schedule/unscheduled | scheduling:read | scheduling |
| GET | /api/v1/org/schedule/capacity | scheduling:read | scheduling |
| **Compliance** | | | |
| PATCH | /api/v1/org/compliance-requirements/:id | compliance:update | compliance |
| **Activity** | | | |
| GET | /api/v1/org/activity | tasks:read | tasks |
| POST | /api/v1/org/activity | tasks:update | tasks |
| **Webhooks** | | | |
| GET | /api/v1/org/webhooks | — (admin/owner) | — |
| POST | /api/v1/org/webhooks | — (admin/owner) | — |
| DELETE | /api/v1/org/webhooks/:id | — (admin/owner) | — |
| GET | /api/v1/org/webhooks/:id/deliveries | — | — |
| **Agent** | | | |
| POST | /api/v1/org/agent/trigger | agents:trigger | ai_assistant |
| GET | /api/v1/org/agent/runs | agents:trigger | ai_assistant |
| GET | /api/v1/org/agent/runs/:id | agents:trigger | ai_assistant |
| POST | /api/v1/org/agent/runs/:id/block | agents:trigger | ai_assistant |
| POST | /api/v1/org/agent/runs/:id/resume | agents:trigger | ai_assistant |
| GET | /api/v1/org/agent/runs/:id/blockers | agents:trigger | ai_assistant |
| **Conversations** | | | |
| GET | /api/v1/org/conversations | conversations:read | — |
| POST | /api/v1/org/conversations | conversations:create | — |
| GET | /api/v1/org/conversations/:id/messages | conversations:read | — |
| POST | /api/v1/org/conversations/:id/messages | conversations:create | — |
| **PDF Generation** | | | |
| POST | /api/v1/pdf/generate/quote | quotes:read | — |
| POST | /api/v1/pdf/generate/invoice | invoices:read | — |
| POST | /api/v1/pdf/generate/task | tasks:read | — |
| **Public PDFs** | | | |
| GET | /api/v1/pdf/quote/:token | — (token auth) | — |
| GET | /api/v1/pdf/invoice/:token | — (token auth) | — |
| GET | /api/v1/pdf/task/:token | — (token auth) | — |
| **Introspection** | | | |
| GET | /api/v1/org/api-key-info | — | — |
| **Docs** | | | |
| GET | /api/v1/docs/openapi.json | — (public) | — |
| GET | /api/v1/docs/skill | — (public) | — |
| GET | /api/v1/docs/skill/meta | — (public) | — |

---

## Portal API (Customer-Facing)

A separate set of endpoints at `/api/v1/portal/` provides customer-facing access. Portal API keys carry customer context (not org-wide access).

| Method | Path | Notes |
|---|---|---|
| GET | /api/v1/portal/tasks | Customer's tasks |
| GET | /api/v1/portal/tasks/:id | Single task |
| GET | /api/v1/portal/tasks/types | Available task types |
| GET | /api/v1/portal/quotes | Customer's quotes |
| GET | /api/v1/portal/quotes/:id | Single quote |
| GET | /api/v1/portal/invoices | Customer's invoices |
| GET | /api/v1/portal/invoices/:id | Single invoice |
| GET | /api/v1/portal/tenders | Requires `showTenderStatus` flag |
| GET | /api/v1/portal/counts | Entity count summary |
| GET | /api/v1/portal/analytics | Customer analytics |
| GET/POST | /api/v1/portal/webhooks | Portal webhook management |
| DELETE | /api/v1/portal/webhooks/:id | Delete portal webhook |

---

## Webhook Events

| Category | Events |
|---|---|
| Tasks | task.created, task.updated, task.completed, task.assigned, task.status_changed |
| Invoices | invoice.created, invoice.updated, invoice.approved, invoice.paid, invoice.voided |
| Quotes | quote.created, quote.updated, quote.approved, quote.rejected, quote.expired |
| Customers | customer.created, customer.updated |
| Faults | fault.created, fault.updated, fault.resolved |
| Jobs | job.created, job.updated, job.completed |
| Tenders | tender.created, tender.updated, tender.submitted, tender.won, tender.lost, tender.no_bid |
| Estimates | estimate.created, estimate.updated, estimate.approved, estimate.promoted |
| Feedback | feedback.created |
| Agents | agent.started, agent.completed, agent.failed, agent.blocked, agent.resumed |
| Conversations | conversation.message_created |

---

## API Documentation Endpoints (Public)

These endpoints require **no authentication** and are intended for agent/integration discovery.

### OpenAPI Spec

```
GET /api/v1/docs/openapi.json
```

Returns the full OpenAPI 3.1 specification as JSON. Includes:
- All org API endpoints with methods, paths, and parameters
- `x-required-scope` and `x-required-module` extensions per operation
- Security scheme definitions (BearerAuth + ApiKeyHeader)
- `x-skill` extension with skill version, hash, and URL
- Common schemas for pagination, errors, and agent trigger payloads

Supports `ETag` / `If-None-Match` for conditional requests. Cached for 5 minutes.

### Integration Guide (Skill)

```
GET /api/v1/docs/skill
```

Returns this full integration guide as markdown (`text/markdown`). Response headers include:
- `X-Skill-Version` — semantic version of the guide
- `X-Skill-Hash` — SHA-256 hash of the content
- `ETag` — for conditional requests (returns 304 if unchanged)

### Skill Metadata

```
GET /api/v1/docs/skill/meta
```

Returns JSON metadata about the skill without downloading the full content:

```json
{
  "version": "1.1.0",
  "hash": "abc123...",
  "url": "https://your-deployment.convex.site/api/v1/docs/skill",
  "openapi_url": "https://your-deployment.convex.site/api/v1/docs/openapi.json",
  "format": "markdown",
  "lines": 1300
}
```

### Agent Discovery Flow

1. Agent receives webhook → `payload.api.docs.openapi` URL
2. `GET /api/v1/docs/openapi.json` → full API spec with schemas and auth info
3. Check for skill updates: `GET /api/v1/docs/skill/meta` → compare hash
4. Fetch guide if needed: `GET /api/v1/docs/skill` (with `If-None-Match` for caching)
5. Via introspection: `GET /api/v1/org/api-key-info` → `response.docs` block with URLs

