import { mutation, query, action } from "./_generated/server";
import { v } from "convex/values";
import { getBestMove } from "./aiLogic";
import { api } from "./_generated/api";

// Query to get games where it's AI's turn
export const getAIGames = query({
  args: {},
  handler: async (ctx) => {
    const games = await ctx.db
      .query("games")
      .filter((q) => q.eq(q.field("state"), "playing"))
      .collect();

    const gamesWithAITurn = [];
    for (const game of games) {
      const currentPlayer = await ctx.db.get(game.currentPlayer);
      if (currentPlayer?.kind === "ai") {
        gamesWithAITurn.push(game);
      }
    }

    return gamesWithAITurn;
  },
});

// Make a move for the AI
export const makeAIMove = mutation({
  args: { gameId: v.id("games") },
  handler: async (ctx, { gameId }) => {
    const game = await ctx.db.get(gameId);
    if (!game || game.state !== "playing") return;

    const currentPlayer = await ctx.db.get(game.currentPlayer);
    if (!currentPlayer || currentPlayer.kind !== "ai") return;

    const aiSymbol = game.playerSymbols[currentPlayer._id.toString()];
    const bestMove = getBestMove(game.board, aiSymbol);

    const newBoard = [...game.board];
    newBoard[bestMove] = aiSymbol;

    // Check for winner using the same logic as in games.ts
    const winner = checkWinner(newBoard);
    const isDraw = !winner && newBoard.every((cell) => cell !== null);
    const nextPlayer = game.players.find((p) => p !== currentPlayer._id);

    if (!nextPlayer) return;

    await ctx.db.patch(gameId, {
      board: newBoard,
      currentPlayer: nextPlayer,
      winner: winner ? currentPlayer._id : null,
      state: winner || isDraw ? "finished" : "playing",
    });
  },
});

// Scheduled action to process AI moves
export const processAIMoves = action({
  args: {},
  handler: async (ctx) => {
    // Get all games with AI turns
    const games = await ctx.runQuery(api.aiMoves.getAIGames);

    // Process each game
    for (const game of games) {
      await ctx.runMutation(api.aiMoves.makeAIMove, { gameId: game._id });
      // Add a small delay to make the game feel more natural
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  },
});

function checkWinner(board: (string | null)[]) {
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8], // rows
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8], // columns
    [0, 4, 8],
    [2, 4, 6], // diagonals
  ];

  for (const [a, b, c] of lines) {
    if (board[a] && board[a] === board[b] && board[a] === board[c]) return true;
  }

  return false;
}
