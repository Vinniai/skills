---
name: compliance-standards
description: Framework for implementing a regulatory or industry standard (fire, electrical, HVAC, food-safety, NFPA/AS/ISO, etc.) as structured, testable data in a codebase — modelling requirements, mapping them to assets or sites, seeding them per tenant, validating with invariant tests, resolving defect SLAs, and extending to additional standards. Use when adding or editing compliance requirements, building a compliance/inspection module, debugging seed or taxonomy failures, or onboarding a new standard. Stack-agnostic; uses AS 1851-2012 (fire) as a worked example.
tags: [compliance, standards, regulatory, inspections, seeding, data-modelling]
---

# Implementing a regulatory standard

A regulatory standard (AS 1851, AS 3000, NFPA 25, AS 1668, ISO 41001, a food-safety
code, …) is ultimately a **structured set of recurring obligations**: "inspect *this kind
of thing* every *N months* and record *these checks*." This skill is the repeatable way to
turn that prose into data your product can schedule, assign, verify, and audit.

It's deliberately stack-agnostic. The data model and invariants below hold whether you
store them in Postgres, Convex, DynamoDB, or flat seed files. A condensed **AS 1851-2012**
implementation appears at the end as a concrete worked example.

## When to use

- Adding, editing, or debugging a compliance requirement (frequency, applicable asset type, code)
- Modelling a brand-new standard for the first time
- Building the asset/site taxonomy a standard maps onto
- Writing the seed scripts that provision a standard per organization/tenant
- Adding the CI invariants that stop the data drifting
- Designing defect/issue SLAs that derive from severity and contractual scope
- Diagnosing "unmapped slug", "unknown code", or seed-validation failures

---

## The core model

Five concepts, in a strict hierarchy. Name them whatever your domain prefers; the shape is what matters.

```
Standard          a body of rules with a version          (AS 1851-2012)
  └─ Section      a chapter / system grouping             (S3 — Fire Pumpsets)
       └─ Requirement   a single recurring obligation      (test diesel pump monthly)
            ├─ applies to → Entity type(s)                 (asset type: diesel-fire-pump)
            └─ produces   → Checklist items / sub-tasks     (start pump, check pressure, …)

Mapping           per-tenant join: which of THIS org's entities are subject to which requirement
```

**The canonical-source rule.** Pick exactly **one** artifact as the source of truth for a
standard's structure (a single reference file, table, or document). Every other artifact —
per-section requirement rows, taxonomy slugs, tests, docs — *derives* from it. When two
disagree, the canonical source wins and you fix the other. Without this rule, a standard's
representation rots the moment two people edit different files.

---

## Modelling a requirement

A requirement is the atomic unit. A portable shape:

```ts
interface Requirement {
  code: string;                 // stable, unique identifier — see "Code identifiers"
  sectionCode: string;          // which section it belongs to
  name: string;                 // human label
  frequencyValue: number;       // e.g. 6
  frequencyUnit: "days" | "weeks" | "months" | "years";
  severity: "critical" | "high" | "medium" | "low";
  appliesToEntityTypes: string[];   // taxonomy slugs (see below); MAY be empty
  appliesToSiteTypes?: string[];    // for site/facility-level obligations; "*" = all sites
  checklistTemplates: ChecklistItem[];  // the sub-tasks an inspector completes
  source?: { document: string; clause: string };  // traceability back to the prose
}
```

Two design rules that pay off later:

- **Every requirement is traceable to the standard's text** (`source`). Auditors and future
  maintainers need to know *why* a check exists. A clause reference is cheap insurance.
- **Frequency is data, not code.** Store the number + unit; never hard-code "every 6 months"
  into scheduling logic. Scheduling, tolerance windows, and reporting all read the same field.

### Code identifiers

Each requirement needs a stable, unique, machine-checkable `code`. Adopt a convention and
enforce it with a regex in CI:

- Encode the hierarchy so the code is self-locating: `<SECTION>-<SUBSYSTEM?>-<FREQUENCY>`
  → `S3-DIESEL-MONTHLY`, not `DIESEL-MONTHLY`.
- Use a fixed frequency vocabulary (`MONTHLY`, `6MONTHLY`, `YEARLY`, `5YEARLY`, …) — don't
  mix `ANNUAL` and `YEARLY`.
- Keep a **rename map** for legacy codes so historical records and external integrations
  don't break when you tidy the vocabulary (`ANNUAL → YEARLY`).
- Example enforced pattern: `/^S\d+-[A-Z0-9]+(-[A-Z0-9]+)*$/`.

Codes are forever. Treat a code change as a migration, not an edit.

---

## Entity taxonomy and mapping

Requirements apply to *kinds of things*. Define a **closed taxonomy** of entity types
(asset categories, equipment types, site types) and let requirements reference only slugs
from it. A closed set is what makes the whole system testable.

- Keep the taxonomy small and stable. Resist one-off categories; prefer mapping an edge
  case onto the nearest existing slug and recording the compromise in a comment.
- The per-tenant **mapping** is a separate step from the standard's definition: the standard
  says "diesel pumps need this", the mapping says "*this org's* pump #PMP-04 is subject to it".
- Document deliberate compromises explicitly (e.g. "water tanks parked under `hydrant-systems`
  until a dedicated category exists — open TODO"). Undocumented compromises read as bugs.

### Entity-level vs site/facility-level requirements

Not every obligation attaches to an asset. Some apply once **per site** (emergency planning,
evacuation drills, a building-wide audit). Model these explicitly:

```ts
appliesToEntityTypes: [],        // no asset-level mapping
appliesToSiteTypes: ["*"],       // "*" = one mapping per active site; or a specific site type
```

A `"*"` sentinel means "create a mapping for every site in the org." A specific type filters
to sites of that type. Seeding site-level mappings is a **separate pass** from asset-level
mapping (different join entity), and it's a classic source of "why are no compliance items
showing?" — see failure modes.

---

## Frequency and tolerance windows

A requirement is "due" on a cadence, but real-world inspections are never exactly on time.
Define an allowed **tolerance window** per frequency before an item flips to overdue/red:

| Frequency | Typical tolerance |
|-----------|-------------------|
| Monthly   | ±5 days  |
| 6-monthly | ±14 days |
| Yearly    | ±30 days |
| 5-yearly  | ±60 days |

Keep tolerances as data alongside the frequency vocabulary, and compute `nextDue` /
overdue state from them in one place. Don't scatter the "+30 days" magic numbers across UI
and backend.

---

## Seeding per tenant

Provisioning a standard for an organization runs in dependency order — get this wrong and
foreign keys dangle:

```
1. Seed the taxonomy        (categories / entity types)        — referenced by everything
2. Seed the standard        (sections + requirements)          — references taxonomy slugs
3. Map entities → requirements   (asset-level join rows)
4. Map sites → requirements      (site-level join rows; only for site-level requirements)
```

Make every seed **idempotent** (upsert, insert-or-skip by natural key) so re-running is
safe and partial failures are recoverable. Provide a single "provision everything for org X"
entry point that runs all four passes in order, plus targeted patch operations for adding
requirements without a full re-seed.

---

## Invariant tests (the safety net)

These run in CI on every change to the standard's data. Each one stops a specific, real
failure mode. Adapt the names to your stack; the *checks* are what generalize:

**Structure invariants**
1. **Closed taxonomy** — every `appliesToEntityType` slug exists in the taxonomy.
2. **Complete taxonomy** — the taxonomy is exactly the expected set (catches accidental adds/drops).
3. **Code format** — every `code` matches the enforced regex.
4. **Code ↔ section alignment** — `S3-*` codes live in section 3, not section 2.
5. **Code uniqueness** — no duplicate codes across the whole standard.

**Coverage invariants**
6. **Mapping coverage** — every requirement references at least one valid target (entity type or site type).

**Site-level invariants** (if you have them)
7. Site-level requirements declare **no** entity types and **non-empty** site types.
8. At least one requirement exists for each section that's supposed to have them.

A broken invariant should **block the PR**, not produce a runtime surprise in a customer's org.

---

## Defect / issue SLAs

A failed inspection produces a defect, and defects need response/resolution deadlines.
Derive the SLA rather than hand-setting it, using a **scope-precedence chain**:

1. An **explicit** policy at the most specific scope wins outright (a contract clause, a
   customer override).
2. Otherwise **strictest-wins** — the smallest resolve-time across all matching policies.
3. If nothing matches, fall back to a **standard-default matrix** keyed on severity.

Scope specificity ordering, most specific first:
`contract > customer > site > entity-type > standard-default`.

Example default matrix:

| Severity | Respond within | Resolve within |
|----------|---------------:|---------------:|
| critical |             0h |             4h |
| high     |             4h |            24h |
| medium   |            24h |            72h |
| low      |            72h |           168h |

**Snapshot the resolved SLA onto the defect at creation time** (deadline, the winning
policy id, and a human-readable reason). The audit trail must show what the deadline *was*
when the defect was raised, even if policies change later.

---

## Driving it from the Taskr CLI

When the standard is implemented on **Taskr**, the abstract model above maps onto concrete
resources you can inspect and update from the terminal with the [`taskr` CLI](../../taskr/taskr-cli/SKILL.md)
— useful for seeding verification, spot-audits, and resolving defects in scripts or CI. Set
`TASKR_API_KEY` (a key with `compliance:update` plus the relevant read scopes) and:

```bash
# Inspect what the standard produced
taskr contracts list --all                                # contract-scoped SLA overrides
taskr contracts get CT-2024-01                            # printed number resolves to the id
taskr assets list --search "fire-pump"                    # entities a requirement applies to

# Update a compliance requirement (flip status, push a corrected frequency).
# Note: compliance update takes the raw 32-char requirement id, not a printed number.
taskr compliance update <requirementId> --status retired
echo '{"frequencyMonths":6}' | taskr compliance update <requirementId> --body-file -

# A failed inspection becomes a defect/fault carrying its snapshotted SLA
taskr faults create --body-file fault.json                # {"title","severity","assetId",…}
taskr faults update <faultId> --body-file resolve.json    # {"status":"resolved","resolution":…}
taskr tasks list --status overdue --json | jq '.tasks[] | {id,title,dueDate}'
```

Printed-number addressing (`CT-2024-01`, `AS-014`) works for **tasks and the standard CRUD
resources** (contracts, assets, invoices, …); `compliance update` and `faults update` take the
raw record id. Pair the CLI with the **invariant tests** above: the CLI inspects and patches
live tenant data, the invariants are what keep the seeded standard itself from drifting.

---

## Adding a new standard

Follow the same pattern every time so standards stay consistent and comparable:

1. **Canonical reference** — create the single source-of-truth artifact for the new
   standard's sections and codes. Version it (`<STANDARD>_SEED_VERSION`).
2. **Taxonomy** — add the entity types/categories the standard inspects (or reuse existing ones).
3. **Requirement rows** — one file/table per section, all using the portable requirement shape.
4. **Seed functions** — mirror the four-pass provisioning, idempotent.
5. **Invariant tests** — copy the invariant set; adjust the expected taxonomy.
6. **Registry** — register the standard in a central list so the app can enumerate what it supports.

If you find yourself special-casing the new standard in shared code, push the difference
down into *data* (a new field on the requirement) instead of branching the logic.

---

## Common failure modes

| Symptom | Usual cause | Fix |
|---------|-------------|-----|
| "Unknown code `X`" | Legacy code not in the rename map | Add to rename map, or update the seed to the new code |
| Taxonomy slug not found | Requirement references a renamed/removed type | Fix the slug; the rename map records historical names |
| Too many categories show in UI | Stale broad-slug rows from before a taxonomy migration | Re-run recategorize, then re-seed with deactivate-stale |
| Site-level requirements show nothing | Only asset-level mapping ran, or org has no sites | Run the site-mapping pass; confirm the org has active sites |
| CI fails on missing generated stubs | Codegen didn't run before tests | Run the codegen/stub step in the CI job before the test step |
| Requirement seeded but no inspections appear | No entities of the applicable type exist in the org | Expected — mapping needs target entities to attach to |

---

## Worked example: AS 1851-2012 (fire protection)

A concrete instantiation of everything above.

- **Standard / sections:** AS 1851-2012, sections S2–S14 (sprinklers, pumpsets, hydrants,
  water tanks, detection & alarm, special hazards, lay-flat hose, hose reels, extinguishers,
  blankets, passive fire, HVAC smoke, emergency planning).
- **Canonical source:** a single `as1851-reference.ts` listing every section and its tables;
  per-section requirement files and tests all derive from it.
- **Taxonomy:** 11 closed fire-asset categories (`fire-detection-alarm`, `sprinkler-systems`,
  `hydrant-systems`, `hose-reels`, `fire-extinguishers`, `emergency-lighting`,
  `fire-doors-passive`, `special-hazard-suppression`, `ewis`, `fire-pumps`,
  `hvac-smoke-control`). Documented compromises: water tanks (S5) parked under
  `hydrant-systems`; fire blankets (S11) under `fire-extinguishers`.
- **Codes:** `S{section}-{SUBSYSTEM?}-{FREQUENCY}`, e.g. `S3-DIESEL-MONTHLY`,
  `S2-WET-6MONTHLY`, regex `/^S\d+-[A-Z0-9]+(-[A-Z0-9]+)*$/`, with `ANNUAL → YEARLY` in the
  rename map.
- **Site-level requirement:** S14 (Emergency Planning) is facility-level —
  `appliesToEntityTypes: []`, `appliesToSiteTypes: ["*"]` — mapped per location, not per asset.
- **Tolerances:** monthly ±5d, 6-monthly ±14d, yearly ±30d, 5-yearly ±60d.
- **Invariants:** the structure + coverage + site-level set above, locked in CI.
- **Defect SLA:** explicit-override → strictest-wins → AS 1851 default matrix
  (critical 0h/4h, high 4h/24h, medium 24h/72h, low 72h/168h); scope chain
  `contract > customer > location > assetType > standard`.

When adding AS 3000 (electrical) or NFPA 25 (water-based suppression) alongside it, repeat
the **Adding a new standard** steps — new reference file, electrical taxonomy, section
requirement files, seed functions, and a copy of the invariant suite.
