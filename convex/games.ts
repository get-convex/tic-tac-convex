import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// List all games, optionally filtered by state
export const list = query({
  args: {
    state: v.optional(
      v.union(v.literal("waiting"), v.literal("playing"), v.literal("finished"))
    ),
  },
  handler: async (ctx, { state }) => {
    const q = state
      ? ctx.db.query("games").withIndex("by_state", (q) => q.eq("state", state))
      : ctx.db.query("games").withIndex("by_creation");

    return await q.order("desc").collect();
  },
});

// Get a specific game by ID
export const get = query({
  args: { gameId: v.id("games") },
  handler: async (ctx, { gameId }) => {
    return await ctx.db.get(gameId);
  },
});

// Create a new game
export const create = mutation({
  args: { playerId: v.id("players") },
  handler: async (ctx, { playerId }) => {
    // Verify player exists
    const player = await ctx.db.get(playerId);
    if (!player) throw new Error("Player not found");

    return await ctx.db.insert("games", {
      board: Array(9).fill(""),
      playerIds: [playerId],
      currentPlayerId: playerId,
      state: "waiting",
      createdAt: Date.now(),
      playerSymbols: { [playerId]: "X" },
    });
  },
});

// Join an existing game
export const join = mutation({
  args: {
    gameId: v.id("games"),
    playerId: v.id("players"),
  },
  handler: async (ctx, { gameId, playerId }) => {
    const game = await ctx.db.get(gameId);
    if (!game) throw new Error("Game not found");
    if (game.state !== "waiting")
      throw new Error("Game is not in waiting state");
    if (game.playerIds.includes(playerId))
      throw new Error("Player already in game");
    if (game.playerIds.length >= 2) throw new Error("Game is full");

    // Add player and update game state
    return await ctx.db.patch(gameId, {
      playerIds: [...game.playerIds, playerId],
      state: "playing",
      playerSymbols: { ...game.playerSymbols, [playerId]: "O" },
    });
  },
});

// Make a move in the game
export const makeMove = mutation({
  args: {
    gameId: v.id("games"),
    playerId: v.id("players"),
    position: v.number(),
  },
  handler: async (ctx, { gameId, playerId, position }) => {
    const game = await ctx.db.get(gameId);
    if (!game) throw new Error("Game not found");
    if (game.state !== "playing")
      throw new Error("Game is not in playing state");
    if (game.currentPlayerId !== playerId) throw new Error("Not your turn");
    if (position < 0 || position >= 9) throw new Error("Invalid position");
    if (game.board[position] !== "") throw new Error("Position already taken");

    // Make the move
    const newBoard = [...game.board];
    newBoard[position] = game.playerSymbols[playerId];

    // Check for winner
    const winner = checkWinner(newBoard);
    const isDraw = !winner && newBoard.every((cell) => cell !== "");

    // Find next player
    const nextPlayerId = game.playerIds.find((id) => id !== playerId);
    if (!nextPlayerId) throw new Error("No next player found");

    return await ctx.db.patch(gameId, {
      board: newBoard,
      currentPlayerId: nextPlayerId,
      state: winner || isDraw ? "finished" : "playing",
      ...(winner ? { winnerId: playerId } : {}),
    });
  },
});

// Add AI player to a game
export const addAI = mutation({
  args: { gameId: v.id("games") },
  handler: async (ctx, { gameId }) => {
    const game = await ctx.db.get(gameId);
    if (!game) throw new Error("Game not found");
    if (game.state !== "waiting")
      throw new Error("Game is not in waiting state");
    if (game.playerIds.length >= 2) throw new Error("Game is full");

    // Create AI player
    const aiPlayerId = await ctx.db.insert("players", {
      name: "AI Player",
      kind: "ai",
    });

    // Add AI to game
    return await ctx.db.patch(gameId, {
      playerIds: [...game.playerIds, aiPlayerId],
      state: "playing",
      playerSymbols: { ...game.playerSymbols, [aiPlayerId]: "O" },
    });
  },
});

// Helper function to check for a winner
function checkWinner(board: string[]): boolean {
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8], // Rows
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8], // Columns
    [0, 4, 8],
    [2, 4, 6], // Diagonals
  ];

  for (const [a, b, c] of lines) {
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return true;
    }
  }

  return false;
}
