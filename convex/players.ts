import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const get = query({
  args: { playerId: v.id("players") },
  handler: async (ctx, { playerId }) => await ctx.db.get(playerId),
});

export const create = mutation({
  args: {
    name: v.string(),
    kind: v.union(v.literal("human"), v.literal("ai")),
  },
  handler: async (ctx, { name, kind }) =>
    await ctx.db.insert("players", { name, kind }),
});
