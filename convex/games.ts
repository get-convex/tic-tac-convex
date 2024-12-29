import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("games").collect();
  },
});

export const get = query({
  args: { id: v.id("games") },
  handler: async (ctx, { id }) => {
    return await ctx.db.get(id);
  },
});

export const create = mutation({
  args: { playerId: v.id("players") },
  handler: async (ctx, { playerId }) => {
    return await ctx.db.insert("games", {
      board: Array(9).fill(null),
      state: "waiting",
      currentPlayerId: playerId,
      winnerId: undefined,
      playerOne: {
        id: playerId,
        symbol: "X",
      },
    });
  },
});

export const join = mutation({
  args: { gameId: v.id("games"), playerId: v.id("players") },
  handler: async (ctx, { gameId, playerId }) => {
    const game = await ctx.db.get(gameId);
    if (!game) throw new Error("Game not found");
    if (game.state !== "waiting")
      throw new Error("Game is not waiting for players");
    if (game.playerTwo) throw new Error("Game is full");

    return await ctx.db.patch(gameId, {
      state: "playing",
      playerTwo: {
        id: playerId,
        symbol: "O",
      },
    });
  },
});

export const makeMove = mutation({
  args: {
    gameId: v.id("games"),
    playerId: v.id("players"),
    index: v.number(),
  },
  handler: async (ctx, { gameId, playerId, index }) => {
    const game = await ctx.db.get(gameId);
    if (!game) throw new Error("Game not found");
    if (game.state !== "playing")
      throw new Error("Game is not in playing state");
    if (game.currentPlayerId !== playerId) throw new Error("Not your turn");
    if (game.board[index]) throw new Error("Cell already occupied");
    if (!game.playerTwo) throw new Error("Game not ready");

    const newBoard = [...game.board];
    const isPlayerOne = playerId === game.playerOne.id;
    const symbol = isPlayerOne ? "X" : "O";
    newBoard[index] = symbol;

    // Check for winner
    const lines = [
      [0, 1, 2],
      [3, 4, 5],
      [6, 7, 8],
      [0, 3, 6],
      [1, 4, 7],
      [2, 5, 8],
      [0, 4, 8],
      [2, 4, 6],
    ];

    const hasWinner = lines.some(
      ([a, b, c]) =>
        newBoard[a] &&
        newBoard[a] === newBoard[b] &&
        newBoard[a] === newBoard[c]
    );

    const isDraw = !hasWinner && newBoard.every((cell) => cell !== null);
    const nextPlayerId = isPlayerOne ? game.playerTwo.id : game.playerOne.id;

    return await ctx.db.patch(gameId, {
      board: newBoard,
      currentPlayerId: nextPlayerId,
      winnerId: hasWinner ? playerId : undefined,
      state: hasWinner || isDraw ? "finished" : "playing",
    });
  },
});

export const addAI = mutation({
  args: { gameId: v.id("games") },
  handler: async (ctx, { gameId }) => {
    const game = await ctx.db.get(gameId);
    if (!game) throw new Error("Game not found");
    if (game.state !== "waiting")
      throw new Error("Game is not waiting for players");
    if (game.playerTwo) throw new Error("Game is full");

    // Create AI player
    const aiPlayerId = await ctx.db.insert("players", {
      name: "AI Player",
      kind: "ai",
    });

    return await ctx.db.patch(gameId, {
      state: "playing",
      playerTwo: {
        id: aiPlayerId,
        symbol: "O",
      },
    });
  },
});
