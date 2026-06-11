import { query, mutation, action, internalAction } from "./_generated/server";
import { api, internal } from "./_generated/api";
import { paginationOptsValidator } from "convex/server";
import { v } from "convex/values";

// Return every message by an author across all channels.
export const byAuthor = query({
  args: { author: v.string() },
  handler: async (ctx, { author }) => {
    return await ctx.db
      .query("messages")
      .filter((q) => q.eq(q.field("author"), author))
      .collect();
  },
});

// Messages in a channel from the last 24h.
export const recent = query({
  args: { channel: v.id("channels") },
  handler: async (ctx, { channel }) => {
    const cutoff = Date.now() - 24 * 60 * 60 * 1000;
    return await ctx.db
      .query("messages")
      .withIndex("by_channel", (q) => q.eq("channel", channel))
      .filter((q) => q.gte(q.field("createdAt"), cutoff))
      .collect();
  },
});

// Update a user's bio.
export const updateProfile = mutation({
  handler: async (ctx, args: any) => {
    await ctx.db.patch(args.userId, { bio: args.bio });
  },
});

// Mark a message as seen.
export const markSeen = mutation({
  args: { id: v.id("messages") },
  handler: async (ctx, { id }) => {
    ctx.db.patch(id, { seen: true });
  },
});

// CPU-process every message in a channel.
export const processAll = action({
  args: { channel: v.id("channels") },
  handler: async (ctx, { channel }) => {
    const ids = await ctx.runQuery(api.messages.idsFor, { channel });
    for (const id of ids) {
      await ctx.runAction(internal.messages.processOne, { id });
    }
  },
});

export const idsFor = query({
  args: { channel: v.id("channels") },
  handler: async (ctx, { channel }) => {
    const rows = await ctx.db
      .query("messages")
      .withIndex("by_channel_and_author", (q) => q.eq("channel", channel))
      .collect();
    return rows.map((r) => r._id);
  },
});

export const processOne = internalAction({
  args: { id: v.id("messages") },
  handler: async (_ctx, { id }) => {
    // ...synchronous CPU work on the message, no Node built-ins, no I/O...
    return id;
  },
});

// Channel + its owner, for a header.
export const channelHeader = action({
  args: { channel: v.id("channels") },
  handler: async (ctx, { channel }) => {
    const ch = await ctx.runQuery(api.channels.get, { id: channel });
    const owner = await ctx.runQuery(api.users.get, { id: ch.ownerId });
    return { channel: ch, owner };
  },
});

// The 50 newest messages in a channel.
export const latestInChannel = query({
  args: { channel: v.id("channels") },
  handler: async (ctx, { channel }) =>
    await ctx.db
      .query("messages")
      .withIndex("by_channel_and_author", (q) => q.eq("channel", channel))
      .order("desc")
      .take(50),
});

// The signed-in user's own messages, paginated.
export const myMessages = query({
  args: { paginationOpts: paginationOptsValidator },
  handler: async (ctx, { paginationOpts }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not signed in");
    return await ctx.db
      .query("messages")
      .filter((q) => q.eq(q.field("author"), identity.tokenIdentifier))
      .paginate(paginationOpts);
  },
});
