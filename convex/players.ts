import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const create = mutation({
  args: {
    name: v.string(),
    kind: v.union(v.literal("human"), v.literal("ai")),
  },
  handler: async (ctx, { name, kind }) => {
    // Check if player with same name exists
    const existing = await ctx.db
      .query("players")
      .withIndex("by_name", (q) => q.eq("name", name))
      .first();

    if (existing) return existing._id;

    // Create new player
    return await ctx.db.insert("players", { name, kind });
  },
});

export const get = query({
  args: { playerId: v.id("players") },
  handler: async (ctx, { playerId }) => {
    return await ctx.db.get(playerId);
  },
});

export const getMany = query({
  args: { playerIds: v.array(v.id("players")) },
  handler: async (ctx, { playerIds }) => {
    return await Promise.all(playerIds.map((id) => ctx.db.get(id)));
  },
});
