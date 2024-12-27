import { v } from "convex/values";
import { action } from "./_generated/server";
import { api } from "./_generated/api";

// Action to make an AI move after a delay
export const makeMove = action({
  args: { gameId: v.id("games") },
  handler: async (ctx, { gameId }) => {
    // Wait a bit to simulate "thinking"
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const game = await ctx.runQuery(api.games.get, { gameId });
    if (!game || game.state !== "playing") return;

    // Verify current player is AI
    const currentPlayer = await ctx.runQuery(api.players.get, {
      playerId: game.currentPlayerId,
    });
    if (!currentPlayer || currentPlayer.kind !== "ai") return;

    // Get available moves
    const availableMoves = game.board
      .map((cell, index) => (cell === "" ? index : -1))
      .filter((index) => index !== -1);

    if (availableMoves.length === 0) return;

    // Pick a random move
    const position =
      availableMoves[Math.floor(Math.random() * availableMoves.length)];

    // Make the move
    await ctx.runMutation(api.games.makeMove, {
      gameId,
      playerId: game.currentPlayerId,
      position,
    });
  },
});
