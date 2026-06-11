import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

// Fixture for the convex-best-practices real-code audit (iteration 3).
// Contains seeded best-practice violations AND some deliberately-correct code.
export default defineSchema({
  messages: defineTable({
    channel: v.id("channels"),
    author: v.string(),
    body: v.string(),
    createdAt: v.number(),
    seen: v.optional(v.boolean()),
  })
    // Both indexes defined: by_channel is a redundant prefix of by_channel_and_author.
    .index("by_channel", ["channel"])
    .index("by_channel_and_author", ["channel", "author"]),

  channels: defineTable({
    name: v.string(),
    ownerId: v.id("users"),
  }).index("by_owner", ["ownerId"]),

  users: defineTable({
    tokenIdentifier: v.string(),
    bio: v.optional(v.string()),
  }).index("by_token", ["tokenIdentifier"]),
});
