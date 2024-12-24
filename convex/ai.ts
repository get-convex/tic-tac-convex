import { v } from "convex/values";
import { action, mutation } from "./_generated/server";
import { api } from "./_generated/api";
import { getAvailableMoves } from "../src/game/gameLogic";

export const makeMove = action({
  args: { gameId: v.id("games") },
  handler: async (ctx, { gameId }) => {
    const game = await ctx.runQuery(api.games.get, { gameId });
    if (!game) throw new Error("Game not found");
    if (game.state !== "playing") return;

    const currentPlayer = await ctx.runQuery(api.players.get, {
      playerId: game.currentPlayer,
    });
    if (!currentPlayer || currentPlayer.kind !== "ai") return;

    const availableMoves = getAvailableMoves(game.board);
    if (availableMoves.length === 0) return;

    // Simple AI: just pick a random available move
    const position =
      availableMoves[Math.floor(Math.random() * availableMoves.length)];

    await ctx.runMutation(api.games.makeMove, {
      gameId,
      playerId: game.currentPlayer,
      position,
    });
  },
});

export const scheduleMove = mutation({
  args: { gameId: v.id("games") },
  handler: async (ctx, { gameId }) => {
    const game = await ctx.db.get(gameId);
    if (!game) return;

    const currentPlayer = await ctx.db.get(game.currentPlayer);
    if (currentPlayer?.kind === "ai") {
      await ctx.scheduler.runAfter(500, api.ai.makeMove, { gameId });
    }
  },
});
