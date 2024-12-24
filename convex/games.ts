import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { checkWinner } from "../src/game/gameLogic";

export const get = query({
  args: { gameId: v.id("games") },
  handler: async (ctx, { gameId }) => await ctx.db.get(gameId),
});

export const getAvailableGames = query({
  args: {},
  handler: async (ctx) => {
    const games = await ctx.db.query("games").order("desc").collect();
    return games;
  },
});

export const create = mutation({
  args: { playerId: v.id("players") },
  handler: async (ctx, { playerId }) => {
    const player = await ctx.db.get(playerId);
    if (!player) throw new Error("Player not found");

    return await ctx.db.insert("games", {
      board: Array(9).fill(null),
      players: [playerId],
      currentPlayer: playerId,
      winner: null,
      state: "waiting",
      playerSymbols: {
        [playerId]: "X",
      },
    });
  },
});

export const join = mutation({
  args: {
    gameId: v.id("games"),
    playerId: v.id("players"),
  },
  handler: async (ctx, { gameId, playerId }) => {
    const game = await ctx.db.get(gameId);
    if (!game) throw new Error("Game not found");
    if (game.state !== "waiting")
      throw new Error("Game is not waiting for players");
    if (game.players.length >= 2) throw new Error("Game is full");

    const player = await ctx.db.get(playerId);
    if (!player) throw new Error("Player not found");

    return await ctx.db.patch(gameId, {
      players: [...game.players, playerId],
      state: "playing",
      playerSymbols: {
        ...game.playerSymbols,
        [playerId]: "O",
      },
    });
  },
});

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
    if (game.currentPlayer !== playerId) throw new Error("Not your turn");
    if (position < 0 || position >= 9) throw new Error("Invalid position");
    if (game.board[position]) throw new Error("Position already taken");

    const newBoard = [...game.board];
    const playerSymbol = game.playerSymbols[playerId];
    newBoard[position] = playerSymbol;

    const winner = checkWinner(newBoard);
    const isDraw = !winner && newBoard.every((cell) => cell !== null);

    const nextPlayer = game.players.find((p) => p !== playerId);
    if (!nextPlayer) throw new Error("No next player found");

    return await ctx.db.patch(gameId, {
      board: newBoard,
      currentPlayer: nextPlayer,
      winner: winner ? playerId : null,
      state: winner || isDraw ? "finished" : "playing",
    });
  },
});
