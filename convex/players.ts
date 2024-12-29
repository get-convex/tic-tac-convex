import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const create = mutation({
  args: {
    name: v.string(),
    kind: v.union(v.literal("human"), v.literal("ai")),
  },
  handler: async (ctx, { name, kind }) => {
    return await ctx.db.insert("players", { name, kind });
  },
});

export const get = query({
  args: { id: v.id("players") },
  handler: async (ctx, { id }) => {
    return await ctx.db.get(id);
  },
});
