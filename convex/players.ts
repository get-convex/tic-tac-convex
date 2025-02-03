import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const createPlayer = mutation({
  args: {
    name: v.string(),
    type: v.union(v.literal("human"), v.literal("ai")),
  },
  returns: v.id("players"),
  handler: async (ctx, { name, type }) => {
    return await ctx.db.insert("players", { name, type });
  },
});

export const getPlayer = query({
  args: { playerId: v.id("players") },
  returns: v.object({
    _id: v.id("players"),
    name: v.string(),
    type: v.union(v.literal("human"), v.literal("ai")),
  }),
  handler: async (ctx, { playerId }) => {
    const player = await ctx.db.get(playerId);
    if (!player) throw new Error("Player not found");
    return player;
  },
});

export const listPlayers = query({
  args: {},
  returns: v.array(
    v.object({
      _id: v.id("players"),
      name: v.string(),
      type: v.union(v.literal("human"), v.literal("ai")),
    })
  ),
  handler: async (ctx) => {
    return await ctx.db.query("players").collect();
  },
});
