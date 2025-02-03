import { action } from "./_generated/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";

export const makeMove = action({
  args: { gameId: v.id("games") },
  handler: async (ctx, { gameId }) => {
    const game = await ctx.runQuery(internal.games.getGame, { gameId });
    if (game.status !== "playing") return;

    const currentPlayerId =
      game.currentPlayer === "X" ? game.playerX : game.playerO;
    if (!currentPlayerId) return;

    const currentPlayer = await ctx.runQuery(internal.players.getPlayer, {
      playerId: currentPlayerId,
    });
    if (currentPlayer.type !== "ai") return;

    // Get available moves
    const availableMoves = game.board
      .map((cell, index) => (cell === "" ? index : -1))
      .filter((index) => index !== -1);

    if (availableMoves.length === 0) return;

    // Pick a random move for now
    // TODO: Implement minimax algorithm for smarter moves
    const moveIndex =
      availableMoves[Math.floor(Math.random() * availableMoves.length)];

    await ctx.runMutation(internal.games.makeMove, {
      gameId,
      playerId: currentPlayerId,
      position: moveIndex,
    });
  },
});
