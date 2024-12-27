import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { checkWinner } from "./utils";

// List all games, sorted by creation time
export const list = query({
  handler: async (ctx) => {
    return await ctx.db
      .query("games")
      .withIndex("recent_games")
      .order("desc")
      .collect();
  },
});

// Get a specific game by ID
export const get = query({
  args: { gameId: v.id("games") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.gameId);
  },
});

// Create a new game
export const create = mutation({
  args: { playerId: v.id("players") },
  handler: async (ctx, args) => {
    const player = await ctx.db.get(args.playerId);
    if (!player) throw new Error("Player not found");

    const playerSymbols: Record<string, "X" | "O"> = {};
    playerSymbols[args.playerId] = "X";

    return await ctx.db.insert("games", {
      board: Array(9).fill(null),
      playerIds: [args.playerId],
      currentPlayerId: args.playerId,
      winnerId: undefined,
      state: "waiting",
      createdAt: Date.now(),
      playerSymbols,
    });
  },
});

// Join an existing game
export const join = mutation({
  args: {
    gameId: v.id("games"),
    playerId: v.id("players"),
  },
  handler: async (ctx, args) => {
    const game = await ctx.db.get(args.gameId);
    if (!game) throw new Error("Game not found");
    if (game.state !== "waiting")
      throw new Error("Game is not in waiting state");
    if (game.playerIds.length >= 2) throw new Error("Game is full");

    const playerSymbols = { ...game.playerSymbols };
    playerSymbols[args.playerId] = "O";

    return await ctx.db.patch(args.gameId, {
      playerIds: [...game.playerIds, args.playerId],
      state: "playing",
      playerSymbols,
    });
  },
});

// Add an AI player to the game
export const addAI = mutation({
  args: { gameId: v.id("games") },
  handler: async (ctx, args) => {
    const game = await ctx.db.get(args.gameId);
    if (!game) throw new Error("Game not found");
    if (game.state !== "waiting")
      throw new Error("Game is not in waiting state");
    if (game.playerIds.length >= 2) throw new Error("Game is full");

    // Create AI player
    const aiPlayerId = await ctx.db.insert("players", {
      name: "AI Player",
      kind: "ai",
    });

    const playerSymbols = { ...game.playerSymbols };
    playerSymbols[aiPlayerId] = "O";

    return await ctx.db.patch(args.gameId, {
      playerIds: [...game.playerIds, aiPlayerId],
      state: "playing",
      playerSymbols,
    });
  },
});

// Make a move in the game
export const makeMove = mutation({
  args: {
    gameId: v.id("games"),
    playerId: v.id("players"),
    index: v.number(),
  },
  handler: async (ctx, args) => {
    const game = await ctx.db.get(args.gameId);
    if (!game) throw new Error("Game not found");
    if (game.state !== "playing")
      throw new Error("Game is not in playing state");
    if (game.currentPlayerId !== args.playerId)
      throw new Error("Not your turn");
    if (game.board[args.index]) throw new Error("Cell already occupied");

    const newBoard = [...game.board];
    const playerSymbol = game.playerSymbols[args.playerId];
    newBoard[args.index] = playerSymbol;

    const winner = checkWinner(newBoard);
    const isDraw = !winner && newBoard.every((cell) => cell !== null);

    const nextPlayerId = game.playerIds.find((id) => id !== args.playerId);
    if (!nextPlayerId) throw new Error("No next player found");

    return await ctx.db.patch(args.gameId, {
      board: newBoard,
      currentPlayerId: nextPlayerId,
      winnerId: winner ? args.playerId : undefined,
      state: winner || isDraw ? "finished" : "playing",
    });
  },
});
