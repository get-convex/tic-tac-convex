import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { Doc } from "./_generated/dataModel";

export const create = mutation({
  args: {
    name: v.string(),
    kind: v.union(v.literal("human"), v.literal("ai")),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("players", {
      name: args.name,
      kind: args.kind,
    });
  },
});

export const get = query({
  args: { playerId: v.optional(v.id("players")) },
  handler: async (ctx, args) => {
    if (!args.playerId) return null;
    return await ctx.db.get(args.playerId);
  },
});

// Get multiple players by their IDs
export const getMany = query({
  args: { playerIds: v.array(v.id("players")) },
  handler: async (ctx, args) => {
    const players = await Promise.all(
      args.playerIds.map((id) => ctx.db.get(id))
    );
    // Create a record of id -> player for easier lookup
    const playerMap: Record<string, Doc<"players"> | null> = {};
    players.forEach((player) => {
      if (player) playerMap[player._id] = player;
    });
    return playerMap;
  },
});
