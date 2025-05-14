import { query } from "./_generated/server";
import { v } from "convex/values";

export const getGames = query({
  handler: async (ctx) => {
    return await ctx.db.query("games").collect();
  },
});

export const getGame = query({
  args: { gameId: v.id("games") },
  handler: async (ctx, { gameId }) => {
    return await ctx.db.get(gameId);
  },
});

export const getPlayer = query({
  args: { playerId: v.id("players") },
  handler: async (ctx, { playerId }) => {
    return await ctx.db.get(playerId);
  },
});
