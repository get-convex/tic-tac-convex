import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { checkWinner } from "./gameLogic";

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
      winnerId: null,
      playerSymbols: {
        playerOneId: playerId,
        playerTwoId: null,
        playerOneSymbol: "X",
        playerTwoSymbol: "O",
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
    if (game.playerSymbols.playerTwoId) throw new Error("Game is full");

    return await ctx.db.patch(gameId, {
      state: "playing",
      playerSymbols: {
        ...game.playerSymbols,
        playerTwoId: playerId,
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

    const newBoard = [...game.board];
    const isPlayerOne = playerId === game.playerSymbols.playerOneId;
    const symbol = isPlayerOne ? "X" : "O";
    newBoard[index] = symbol;

    const winner = checkWinner(newBoard);
    const isDraw = !winner && newBoard.every((cell) => cell !== null);
    const nextPlayerId = isPlayerOne
      ? game.playerSymbols.playerTwoId
      : game.playerSymbols.playerOneId;

    if (!nextPlayerId) throw new Error("Next player not found");

    return await ctx.db.patch(gameId, {
      board: newBoard,
      currentPlayerId: nextPlayerId,
      winnerId: winner ? playerId : null,
      state: winner || isDraw ? "finished" : "playing",
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
    if (game.playerSymbols.playerTwoId) throw new Error("Game is full");

    // Create AI player
    const aiPlayerId = await ctx.db.insert("players", {
      name: "AI Player",
      kind: "ai",
    });

    return await ctx.db.patch(gameId, {
      state: "playing",
      playerSymbols: {
        ...game.playerSymbols,
        playerTwoId: aiPlayerId,
      },
    });
  },
});
