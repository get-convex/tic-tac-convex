import { mutation } from "./_generated/server";
import { v } from "convex/values";

export const init = mutation({
  args: {},
  returns: v.null(),
  handler: async (ctx) => {
    // Create an AI player
    const aiPlayer = await ctx.db.insert("players", {
      name: "AI",
      type: "ai",
    });

    // Create a demo game
    const gameId = await ctx.db.insert("games", {
      board: ["", "", "", "", "", "", "", "", ""],
      currentPlayer: "X",
      status: "waiting",
      playerX: undefined,
      playerO: undefined,
    });

    return null;
  },
});
