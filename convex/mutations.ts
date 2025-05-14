import { mutation } from "./_generated/server";
import { v } from "convex/values";
import { GameState } from "../src/types";
import { checkWinner } from "../src/game/gameLogic";

export const createPlayer = mutation({
  args: {
    name: v.string(),
    kind: v.union(v.literal("human"), v.literal("ai")),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("players", {
      name: args.name,
      kind: args.kind,
    });
  },
});

export const createGame = mutation({
  args: {
    playerId: v.id("players"),
  },
  handler: async (ctx, { playerId }) => {
    const player = await ctx.db.get(playerId);
    if (!player) throw new Error("Player not found");    return await ctx.db.insert("games", {
      board: Array(9).fill(null),
      players: [{
        _id: playerId,
        name: player.name,
        kind: player.kind,
        symbol: "X"
      }],
      currentPlayer: playerId,
      state: "waiting",
      createdAt: Date.now(),
    });
  },
});

export const joinGame = mutation({
  args: {
    gameId: v.id("games"),
    playerId: v.id("players"),
  },
  handler: async (ctx, { gameId, playerId }) => {
    const [game, player] = await Promise.all([
      ctx.db.get(gameId),
      ctx.db.get(playerId),
    ]);

    if (!game || !player) throw new Error("Game or player not found");
    if (game.state !== "waiting") throw new Error("Game is not in waiting state");
    if (game.players.length >= 2) throw new Error("Game is full");    return await ctx.db.patch(gameId, {
      players: [...game.players, {
        _id: playerId,
        name: player.name,
        kind: player.kind,
        symbol: "O"
      }],
      state: "playing",
    });
  },
});

export const addAIPlayer = mutation({
  args: {
    gameId: v.id("games"),
  },
  handler: async (ctx, { gameId }) => {
    const game = await ctx.db.get(gameId);
    if (!game) throw new Error("Game not found");
    if (game.state !== "waiting") throw new Error("Game is not in waiting state");
    if (game.players.length >= 2) throw new Error("Game is full");

    const aiPlayer = await ctx.db.insert("players", {
      name: "AI Player",
      kind: "ai",
    });

    return await ctx.db.patch(gameId, {
      players: [...game.players, {
        _id: aiPlayer,
        name: "AI Player",
        kind: "ai",
        symbol: "O"
      }],
      state: "playing",
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
    if (game.state !== "playing") throw new Error("Game is not in playing state");
    if (game.currentPlayer !== playerId) throw new Error("Not your turn");
    if (game.board[index]) throw new Error("Cell already occupied");

    const currentPlayer = game.players.find(p => p._id === playerId);
    if (!currentPlayer) throw new Error("Player not in game");

    const newBoard = [...game.board];
    newBoard[index] = currentPlayer.symbol;

    const winner = checkWinner(newBoard);
    const isDraw = !winner && newBoard.every((cell) => cell !== null);

    const nextPlayer = game.players.find(p => p._id !== playerId);
    if (!nextPlayer) throw new Error("Next player not found");

    return await ctx.db.patch(gameId, {
      board: newBoard,
      currentPlayer: nextPlayer._id,
      winner: winner ? playerId : undefined,
      state: (winner || isDraw ? "finished" : "playing") as GameState,
    });
  },
});

export const makeAIMove = mutation({
  args: {
    gameId: v.id("games"),
  },
  handler: async (ctx, { gameId }) => {
    const game = await ctx.db.get(gameId);
    if (!game) throw new Error("Game not found");
    if (game.state !== "playing") throw new Error("Game is not in playing state");

    const currentPlayer = game.players.find(p => p._id === game.currentPlayer);
    if (!currentPlayer || currentPlayer.kind !== "ai") 
      throw new Error("Not AI's turn");

    // Get available moves
    const availableMoves = game.board
      .map((cell, index) => cell === null ? index : null)
      .filter((index): index is number => index !== null);

    if (availableMoves.length === 0) throw new Error("No moves available");

    // Make random move
    const moveIndex = availableMoves[Math.floor(Math.random() * availableMoves.length)];
    const newBoard = [...game.board];
    newBoard[moveIndex] = currentPlayer.symbol;

    const winner = checkWinner(newBoard);
    const isDraw = !winner && newBoard.every((cell) => cell !== null);

    const nextPlayer = game.players.find(p => p._id !== game.currentPlayer);
    if (!nextPlayer) throw new Error("Next player not found");

    return await ctx.db.patch(gameId, {
      board: newBoard,
      currentPlayer: nextPlayer._id,
      winner: winner ? game.currentPlayer : undefined,
      state: (winner || isDraw ? "finished" : "playing") as GameState,
    });
  },
});
