import { action } from "./_generated/server";
import { api } from "./_generated/api";
import { v } from "convex/values";

export const aiMove = action({
  args: {
    gameId: v.id("games"),
  },
  handler: async (ctx, args) => {
    // Get the current game state
    const game = await ctx.runQuery(api.queries.getGame, { gameId: args.gameId });
    if (!game || game.state !== "playing") {
      throw new Error("Game not in playing state");
    }

    // Make sure it's AI's turn
    const aiPlayer = [game.playerXData, game.playerOData].find(p => p?.kind === "ai");
    if (!aiPlayer || game.currentPlayer !== aiPlayer._id) {
      throw new Error("Not AI's turn");
    }    // Get available moves
    const availableMoves = game.board.reduce((moves: number[], cell: "X" | "O" | null, index: number) => {
      if (cell === null) moves.push(index);
      return moves;
    }, [] as number[]);

    if (availableMoves.length === 0) return;

    // Make a random move
    const aiMoveIndex = availableMoves[Math.floor(Math.random() * availableMoves.length)];
    
    // Make the move
    await ctx.runMutation(api.mutations.makeMove, {
      gameId: args.gameId,
      playerId: aiPlayer._id,
      position: aiMoveIndex,
    });
  },
});