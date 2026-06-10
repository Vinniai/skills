# Convex authoring conventions

Distilled from the official [`convex_rules.txt`](https://convex.link/convex_rules.txt) (get-convex/convex-evals).
This is the "how to write it correctly" reference behind [`SKILL.md`](./SKILL.md)'s best-practice rules.

## Function syntax & registration

Every function: `args` validators + `handler`, and (recommended) a `returns` validator.

```ts
import { query, mutation, action } from "./_generated/server";
import { internalQuery, internalMutation, internalAction } from "./_generated/server";
import { v } from "convex/values";

export const getMessage = query({
  args: { id: v.id("messages") },
  returns: v.union(v.object({ body: v.string() }), v.null()),
  handler: async (ctx, args) => ctx.db.get(args.id),
});
```

- **Public** (`query`/`mutation`/`action`): exposed to clients and the internet — validators + access
  control mandatory.
- **Internal** (`internalQuery`/`internalMutation`/`internalAction`): callable only from other Convex
  functions. Targets of crons, schedulers, and `ctx.run*` should be internal.
- **Always include argument validators** on every function (public or internal).
- `"use node";` at the top of an action file *only* if it uses Node built-ins. Never put `"use node";` in
  a file that exports a query or mutation. `fetch()` is available without it. Actions cannot touch `ctx.db`.

## Calling functions & references

```ts
// public fn f in convex/example.ts        → api.example.f
// internal fn g in convex/example.ts       → internal.example.g
// nested convex/messages/access.ts → h     → api.messages.access.h
await ctx.runQuery(api.example.f, { name: "Bob" });
await ctx.runMutation(internal.example.g, { id });
await ctx.runAction(internal.scrape.fetchPage, { url }); // actions only; only across runtimes
```

- Pass **FunctionReference** objects (`api.*` / `internal.*`), never the function value.
- `runQuery`/`runMutation` callable from queries/mutations/actions; `runAction` from actions only.
- Same-file `ctx.run*` calls: annotate the result type to break TS circularity — `const x: string = await
  ctx.runQuery(api.example.f, …)`.

## Validators

```ts
v.id("table")     v.null()      v.int64()    // BigInt -2^63..2^63-1
v.number()        v.boolean()   v.string()   v.bytes()
v.array(item)     v.object({ field: t })     v.record(keyType, valueType)
v.union(...)      v.literal("value")         v.optional(t)
```

- Discriminated union pattern:
  ```ts
  v.union(
    v.object({ kind: v.literal("error"), errorMessage: v.string() }),
    v.object({ kind: v.literal("success"), value: v.number() }),
  )
  ```
- System fields are automatic on every doc: `_id: v.id(table)`, `_creationTime: v.number()`.
- Limits: strings/bytes < 1MB; arrays ≤ 8,192 items; objects ≤ 1,024 properties; record keys ASCII,
  non-empty, no `$`/`_` prefix. Field names: non-empty, not starting with `$` or `_`.

## Schema & indexes

```ts
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  messages: defineTable({
    channel: v.id("channels"),
    author: v.string(),
    body: v.string(),
  })
    .index("by_channel", ["channel"])
    .index("by_channel_and_author", ["channel", "author"]),
});
```

- **Index naming:** include every field, in order — `by_field1_and_field2` for `["field1","field2"]`.
- **Field order matters:** query the indexed fields in the same order they're defined. Different query
  patterns → different indexes (but watch for prefix-redundancy, SKILL.md rule #4).
- **Don't store unbounded lists** as an array field — use a child table with a foreign key + index.
- **Separate high-churn fields** (e.g. live status) into their own table referenced by id.

## Queries

```ts
// no .filter — use an index
await ctx.db.query("messages")
  .withIndex("by_channel", q => q.eq("channel", channelId))
  .order("desc")
  .take(10);

await ctx.db.query("users").withIndex("by_email", q => q.eq("email", e)).unique(); // errors if >1

import { paginationOptsValidator } from "convex/server";
export const list = query({
  args: { paginationOpts: paginationOptsValidator, channel: v.id("channels") },
  handler: (ctx, a) => ctx.db.query("messages")
    .withIndex("by_channel", q => q.eq("channel", a.channel))
    .paginate(a.paginationOpts), // → { page, isDone, continueCursor }
});
```

- Default order: ascending `_creationTime`. `.order("asc"|"desc")` to flip.
- Prefer `.take(n)` / `.paginate()` / `for await (const row of query)` over `.collect()` on large sets.
- `.unique()` returns one doc and throws if multiple match.

## Mutations

- `ctx.db.replace("table", id, fullDoc)` — full replace, errors if missing.
- `ctx.db.patch("table", id, partial)` — shallow merge, errors if missing.
- Bulk beyond one transaction: process a `.take(n)` batch, then `ctx.scheduler.runAfter(0, internal.…, …)`
  to continue.

## TypeScript & auth

```ts
import { Doc, Id } from "./_generated/dataModel";
import { QueryCtx, MutationCtx, ActionCtx } from "./_generated/server";

const user: Doc<"users"> = ...;
const ids: Id<"users">[] = ...;
const nameById: Record<Id<"users">, string> = {};
```

- Never type `ctx` as `any` — use `QueryCtx`/`MutationCtx`/`ActionCtx`. Prefer `Id<"table">` over `string`.
- Auth: `const id = await ctx.auth.getUserIdentity()` → `null` if signed out, else `UserIdentity`
  (`subject`, `issuer`, `name`, `email`, `tokenIdentifier`). Prefer `tokenIdentifier` for DB lookups.
  **Never accept a `userId`/identifier as a function arg for authorization.**

## HTTP endpoints

```ts
// convex/http.ts
import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";

const http = httpRouter();
http.route({
  path: "/api/endpoint",
  method: "POST",
  handler: httpAction(async (ctx, req) => new Response(await req.bytes(), { status: 200 })),
});
export default http;
```
