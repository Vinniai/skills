---
name: convex-best-practices
description: Best practices for writing Convex backend functions, schemas, and queries — the official 13 best-practice rules (await promises, index-not-filter, bounded .collect, no redundant indexes, argument validators, access control, internal functions, helper functions, runAction only across runtimes, no sequential ctx.run* from actions, no Date.now() in queries) plus the canonical function/validator/schema/index conventions. Use when writing or reviewing anything under a convex/ directory — queries, mutations, actions, schema.ts, indexes, validators, crons, components — or when you see .filter on a db query, an unindexed .collect, ctx.runAction, Date.now() in a query, a public cron target, or missing argument validators. Grounded in the monorepo's real Convex code (convex-platform-template).
tags: [convex, backend, database, validators, access-control, indexes, queries, mutations, actions]
---

# Convex best practices

The rules that keep a Convex backend fast, correct, and secure. Source of truth:
[Convex best practices](https://docs.convex.dev/understanding/best-practices/) (the 13 rules below)
and the official [`convex_rules.txt`](https://convex.link/convex_rules.txt) authoring guide
(distilled in [`./conventions.md`](./conventions.md) — function/validator/schema/index syntax).

Grounded in this repo's real Convex code (`convex-platform-template/convex/`, `^1.17.0`): see the
**[Grounded in this repo](#grounded-in-this-repo)** table for which file demonstrates each rule.

## ⚡ Non-negotiables (most commonly missed)

- **Never `.filter()` a database query.** A `.withIndex(...)` condition (or filtering in TS after a
  bounded read) is the answer. `.filter` scans and bills every matched row. The *only* exception is
  `.filter` on a `.paginate()` query — that is **correct**: do not flag it in review and do not "upgrade"
  it to an index for efficiency (the page-fill semantics are the point; recommending a `withIndex` rewrite
  there is a false positive).
- **Never `.collect()` an unbounded query.** Every returned row counts toward bandwidth — *including
  rows a later `.filter` throws away* — and any change to any returned row re-runs the query / conflicts
  the mutation. Use an index, `.paginate()`, or `.take(n)`.
- **Never `Date.now()` (or `Math.random()`) inside a query.** Queries are cached and only re-run when
  their *data* changes, so the clock value goes stale and the cache over-invalidates. Use a scheduled
  function to flip a boolean field (`isReleased`), or pass a rounded client timestamp as an arg.
- **Every public function needs argument validators; the ones that touch protected data need an
  access-control check.** Validate *every* public function's args with `v.*`. For auth: a public **mutation**,
  or a **read of user-scoped / private / PII data**, must authenticate with `ctx.auth.getUserIdentity()`
  (non-spoofable) and authorize off *that* — never off a `userId`/email passed as an argument. A genuinely
  public read (public catalog, a public channel's messages) needs no auth — don't reflexively flag every
  query; ask whether the data is protected first.
- **Never `ctx.runAction` a same-runtime function.** `runAction` is a whole extra function invocation (own
  memory + CPU). Only use it to cross into a `"use node";` action. If the target has no `"use node";`, call
  it as a plain TS function. A *loop* of `ctx.runAction` calls is the worst case — N wasted invocations.
- **Schedule and `ctx.run*` only `internal` functions.** A cron or `ctx.runMutation` pointed at a
  *public* function exposes that path to the world. Reference `internal.*`, not `api.*`.
- **`await` every Promise** — `ctx.db.patch`, `ctx.scheduler.runAfter`, etc. A floating Promise silently
  drops the write/schedule and swallows errors. Turn on the `no-floating-promises` ESLint rule.

## When to use

- Writing or reviewing any `convex/` function: `query`, `mutation`, `action`, `httpAction`, cron.
- Designing or changing `schema.ts` — tables, indexes, validators.
- You spot a red flag in a diff: `.filter(` on a query, a bare `.collect()`, `ctx.runAction` in the same
  runtime, sequential `ctx.runQuery`/`ctx.runMutation` from an action, `Date.now()` in a query, a public
  function used as a cron/scheduler target, or a public function with no validators or auth check.
- Onboarding to this monorepo's Convex backends (`convex-platform-template`, `health-app`, `travel-app`,
  `fitstake`, …) and you want the conventions they already follow.

## Reviewing checklist (don't report what you can't quote)

Before you flag a defect, confirm it against the **actual line** — if you can't point at the offending
token, don't report it. The common false positives:

- **`await` (#1):** only flag a `ctx.db.*` / `ctx.scheduler.*` call with **no `await` in front of it**. A
  call already written `await ctx.db.patch(…)` is correct — do not flag it. Check each call site separately
  (one function can have an awaited patch and another an un-awaited one).
- **validators (#5):** only flag a public function whose `args` is **absent or `any`**. A function that
  already declares `args: { … v.* … }` is fine — do not flag it for "missing validators."
- **the `.paginate()` `.filter` exception (#2)** and **genuinely-public reads (#6)** are correct code — do
  not flag them, and do not "upgrade" the paginated filter to an index.

## The rules

### Database

1. **Await all Promises.** Un-awaited `ctx.db.patch` / `ctx.scheduler.runAfter` may never run and their
   errors go unhandled. Enable `no-floating-promises`.
   ```ts
   await ctx.db.patch(id, { seen: true });          // ✅
   await ctx.scheduler.runAfter(0, internal.x.y, {}); // ✅  (not: ctx.scheduler.runAfter(...) bare)
   ```

2. **Avoid `.filter` on database queries.** A `.withIndex`/`.withSearchIndex` condition is more efficient;
   otherwise filter in TS code. `.filter` is no faster than reading and is never the right default.
   ```ts
   // ❌ scans, bills every row
   ctx.db.query("messages").filter(q => q.eq(q.field("author"), "Tom")).collect();
   // ✅ index
   ctx.db.query("messages").withIndex("by_author", q => q.eq("author", "Tom")).collect();
   // ✅ or filter in code after a bounded read
   (await ctx.db.query("messages").withIndex("by_channel", q => q.eq("channel", c)).take(200))
     .filter(m => m.author === "Tom");
   ```
   **Exception:** `.filter` on a `.paginate()` query is fine — a filtered page still returns the requested
   document count. This is **correct, finished code**: don't flag it, and don't recommend replacing it with
   a `withIndex` "for efficiency" — that's a false positive (a common reviewer reflex).

3. **Only `.collect()` small result sets (< ~1000).** Every collected row costs bandwidth *even if a
   `.filter` later drops it*, and any change to any returned row invalidates the query / conflicts the
   mutation. Prefer `.withIndex` to narrow first, `.paginate()` to browse, or `.take(n)` (+ a denormalized
   count) for totals. **In review, count this separately:** a query that both `.filter`s *and* `.collect`s
   without an index is **two** findings — the `.filter` (rule #2) *and* the unbounded `.collect` (this rule).
   Don't fold them into one; the unbounded `.collect` is its own defect even after you note the `.filter`.

4. **Drop redundant (prefix) indexes.** `by_foo` is subsumed by `by_foo_and_bar` — query the compound
   index and just omit the trailing `.eq`. Fewer indexes = less storage and lower write overhead.
   ```ts
   // keep only by_org_and_status; for an org-only query, omit the status eq:
   ctx.db.query("submissions").withIndex("by_org_and_status", q => q.eq("orgId", orgId));
   ```
   **Exception:** keep both if you need a different sort order (e.g. plain `_creationTime` ordering the
   compound index can't give).

12. **Include the table name in `ctx.db` operations** (newer API — required for future custom IDs).
    ```ts
    await ctx.db.get("movies", movieId);          // ✅ newer form
    await ctx.db.patch("movies", movieId, {...});  // ✅
    ```
    Enable `@convex-dev/explicit-table-ids` (autofix). *Note: this repo is on Convex `^1.17.0` and its
    code still uses the older `ctx.db.get(id)` form; adopt the table-name form on new code / upgrades.*

13. **No `Date.now()` in queries.** The query won't re-run when the clock advances → stale results, and
    the cache invalidates more than necessary. Use a scheduled function to set a boolean and index that,
    or pass a rounded client time as an argument.
    ```ts
    // ❌ ctx.db.query("movies").withIndex("by_released_at", q => q.lte("releasedAt", Date.now()))
    // ✅ schedule a job to set isReleased, then:
    ctx.db.query("movies").withIndex("by_is_released", q => q.eq("isReleased", true));
    ```

### Validation & access control

5. **Argument validators on every public function.** Public functions accept traffic from anyone; `v.*`
   validators reject malformed/malicious input. Enable `@convex-dev/require-argument-validators`.
   ```ts
   export const update = mutation({
     args: { id: v.id("movies"), update: v.object({ title: v.string() }) },
     handler: async (ctx, { id, update }) => { /* ... */ },
   });
   ```

6. **Access control on the functions that touch protected data.** Check `ctx.auth.getUserIdentity()`
   (non-spoofable) — never authorize off a `userId`/email passed as an argument. **Which functions need
   it:** every public **mutation**, and any **read of user-scoped / private / PII data**, must
   authenticate. A genuinely **public read** (a public catalog, a public channel's messages) does **not** —
   don't blanket-flag every query for "missing auth"; first ask *is this data protected?* Split coarse
   functions into granular ones with their own checks (`setTeamOwner` vs `setTeamName`), and factor checks
   into helpers (`isTeamOwner(ctx, …)`). In this repo that helper is `requireMembership(ctx, orgId, minRole)`
   + `canAccessSite(...)` in `convex/lib/auth.ts`.
   ```ts
   // ❌ patches whoever the caller names — spoofable, no identity check
   export const setBio = mutation({
     args: { userId: v.id("users"), bio: v.string() },
     handler: (ctx, a) => ctx.db.patch(a.userId, { bio: a.bio }),
   });
   // ✅ derive the actor from the session, authorize off that
   export const setBio = mutation({
     args: { bio: v.string() },
     handler: async (ctx, { bio }) => {
       const id = await ctx.auth.getUserIdentity();
       if (!id) throw new Error("Not signed in");
       const me = await ctx.db.query("users")
         .withIndex("by_token", q => q.eq("tokenIdentifier", id.tokenIdentifier)).unique();
       await ctx.db.patch(me!._id, { bio });
     },
   });
   ```

### Function organization

7. **Only schedule / `ctx.run*` *internal* functions.** `internal` functions can't be called from the
   internet, so Convex relaxes the public checks. Point crons and schedulers at `internal.*`.
   ```ts
   // ❌ crons.daily("send", schedule, api.messages.sendMessage, {})
   // ✅ crons.daily("send", schedule, internal.messages.sendInternalMessage, {})
   ```

8. **Put shared logic in helper functions** (a `convex/model/` directory). The `query`/`mutation`/`action`
   wrappers should be thin and mostly call into plain TS helpers — easier to reuse and test than function-
   to-function calls.

9. **`runAction` only across runtimes.** `ctx.runAction` is a full extra function invocation (its own memory
   + CPU). If the target runs in the *same* runtime, call it as a plain TS function. Reserve `runAction` for
   crossing into a Node.js (`"use node";`) action. **Detection:** a `ctx.runAction(internal.x.y, …)` where
   `y`'s file has **no `"use node";`** is the violation — extract `y`'s body into a plain helper and call it
   directly. A **loop** of `ctx.runAction` is the loudest tell (N wasted invocations) — and don't misfile it
   as rule #10: a loop of `runAction` is *this* rule (runtime/overhead), whereas sequential `ctx.runQuery`
   from an action is rule #10 (transaction consistency).
   ```ts
   // ❌ same-runtime action invoked per item — N extra invocations
   export const processAll = action({
     args: { channel: v.id("channels") },
     handler: async (ctx, { channel }) => {
       const ids = await getIds(ctx, channel);
       for (const id of ids) await ctx.runAction(internal.x.processOne, { id }); // processOne: no "use node"
     },
   });
   // ✅ processOne's logic is a plain helper — call it directly
   for (const id of ids) await processOne(ctx, id);
   ```

10. **Don't make sequential `ctx.runMutation`/`ctx.runQuery` calls from an action.** Each runs in its *own
    transaction*, so two reads can be mutually inconsistent. Combine them into one query/mutation
    (`getTeamAndOwner`), or batch a loop into a single mutation (`insertUsers(users[])`).
    **Exception:** separate calls are fine when there's a deliberate side effect between them, or batched
    migration processing.

11. **Use `ctx.runQuery`/`ctx.runMutation` sparingly inside queries/mutations.** They run in the same
    transaction but add overhead vs a plain TS helper. Needed only for components, or to intentionally roll
    back an inner error while keeping the outer transaction alive.

## Grounded in this repo

`convex-platform-template/convex/` (the multi-tenant Convex starter) already follows these — read it for
worked examples:

| Rule | Where in the repo |
|------|-------------------|
| #2/#3/#4 index-not-filter, bounded reads, compound indexes | `by_org_and_status` / `by_org_user` indexes + `withIndex` queries in `convex/*.ts`; `searchIndex("search_name", …)` for browse |
| #5 argument validators; reusable validators | exported `question` / `section` / `moduleKey` `v.union`/`v.object` validators in `convex/schema.ts`, reused in function `args` |
| #6 access control | `requireMembership(ctx, orgId, minRole)`, `RANK`, `canAccessSite()` in `convex/lib/auth.ts`; called at the top of every org-scoped mutation |
| #7 internal targets | `internalAction`/`internalMutation` (`reports.generateInternal`, `reportData.markPipelineDone`) driven by workflow/cron, never public |
| #8/#9/#10/#11 helpers, runAction, durable steps | `@convex-dev/workflow` pipeline in `convex/convex.config.ts` + `submissions.complete`; `@convex-dev/action-retrier`; `@convex-dev/aggregate` for O(log n) analytics instead of `collect().reduce()` |
| immutable versioning (reproducibility) | `templateVersions` snapshot rows; `submissions` pin a `templateVersionId` |

## Authoring conventions cheat-sheet

Full reference: [`./conventions.md`](./conventions.md). The essentials:

- **Function shape:** `query/mutation/action({ args: {...}, returns: v.*, handler })`. Internal variants:
  `internalQuery/internalMutation/internalAction`. `"use node";` only in action files that need Node
  built-ins (never in a file exporting a query/mutation).
- **References:** call by `api.file.fn` / `internal.dir.file.fn` (FunctionReference objects), never the
  function value. Annotate the return type for same-file `ctx.run*` to avoid TS circularity.
- **Validators:** `v.id("table")`, `v.null()`, `v.int64()` (BigInt), `v.record(k, v)`, discriminated
  `v.union(v.object({ kind: v.literal("a"), … }), …)`. System fields `_id`, `_creationTime` are automatic.
- **Schema/indexes:** name an index for all its fields in order — `"by_field1_and_field2"` on
  `["field1","field2"]`; query the fields in that order. Don't store unbounded lists as an array field —
  use a child table + foreign key. Separate high-churn fields into their own table.
- **Queries:** no `.filter` (→ `withIndex`); `.unique()` (errors on >1), `.take(n)`, `.order("asc"|"desc")`,
  `.paginate(paginationOptsValidator)`. `for await (const row of query)` instead of `.collect()` for large
  scans. `.replace`/`.patch` error if the doc is missing; batch big mutations with `.take(n)` +
  `ctx.scheduler.runAfter`.
- **Types:** `Doc<"table">`, `Id<"table">` from `_generated/dataModel`; `QueryCtx`/`MutationCtx`/`ActionCtx`
  from `_generated/server`. Never `any` for `ctx`. Prefer `Id<"users">` over `string`.

## Lint rules to enable

- `no-floating-promises` (typescript-eslint) → rule #1.
- `@convex-dev/require-argument-validators` → rule #5.
- `@convex-dev/explicit-table-ids` (autofix) → rule #12.
