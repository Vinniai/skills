import { v, ConvexError } from "convex/values";
import {
  query,
  mutation,
  action,
  internalQuery,
  internalMutation,
} from "./_generated/server";
import { internal } from "./_generated/api";

// Golden "fixed" version of the Convex Next.js starter's myFunctions.ts, produced
// by the convex-doctor-fix loop's AUTO fixes. Used by gate.sh as a deterministic
// regression check: applying this must raise the doctor score with zero new
// finding rule-classes. (The PROPOSE-class no-sequential-ctx-run finding is
// intentionally NOT force-fixed.)

export const listNumbers = query({
  args: { count: v.number() },
  handler: async (ctx, args) => {
    const numbers = await ctx.db
      .query("numbers")
      .order("desc")
      .take(args.count);
    return {
      viewer: (await ctx.auth.getUserIdentity())?.name ?? null,
      numbers: numbers.reverse().map((number) => number.value),
    };
  },
});

// Internal read, callable from actions via internal.* (not the public `api`).
export const listNumbersInternal = internalQuery({
  args: { count: v.number() },
  handler: async (ctx, args) => {
    const numbers = await ctx.db
      .query("numbers")
      .order("desc")
      .take(args.count);
    return numbers.reverse().map((number) => number.value);
  },
});

export const addNumber = mutation({
  args: { value: v.number() },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new ConvexError("Not signed in");

    const id = await ctx.db.insert("numbers", { value: args.value });
    console.log("Added new document with id:", id);
  },
});

// Internal write, callable from actions via internal.*.
export const addNumberInternal = internalMutation({
  args: { value: v.number() },
  handler: async (ctx, args) => {
    await ctx.db.insert("numbers", { value: args.value });
  },
});

export const myAction = action({
  args: { first: v.number(), second: v.string() },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new ConvexError("Not signed in");

    const data = await ctx.runQuery(internal.myFunctions.listNumbersInternal, {
      count: 10,
    });
    console.log(data);

    await ctx.runMutation(internal.myFunctions.addNumberInternal, {
      value: args.first,
    });
  },
});
