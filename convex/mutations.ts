import { v } from "convex/values";
import { mutation } from "./_generated/server";
import { checkWinner } from "../src/game/gameLogic";

export const createGame = mutation({
  args: {
    playerName: v.string(),
  },
  handler: async (ctx, args) => {
    // Create the player first
    const playerId = await ctx.db.insert("players", {
      name: args.playerName,
      kind: "human",
    });

    // Then create the game
    return await ctx.db.insert("games", {
      board: Array(9).fill(null),
      playerX: playerId,
      state: "waiting",
      currentPlayer: playerId,
      createdAt: Date.now(),
    });
  },
});

export const joinGame = mutation({
  args: {
    gameId: v.id("games"),
    playerName: v.string(),
  },
  handler: async (ctx, args) => {
    const game = await ctx.db.get(args.gameId);
    if (!game || game.state !== "waiting") {
      throw new Error("Game not available to join");
    }

    // Create the second player
    const playerId = await ctx.db.insert("players", {
      name: args.playerName,
      kind: "human",
    });

    // Update the game
    await ctx.db.patch(args.gameId, {
      playerO: playerId,
      state: "playing",
    });

    return playerId;
  },
});

export const addAIPlayer = mutation({
  args: {
    gameId: v.id("games"),
  },
  handler: async (ctx, args) => {
    const game = await ctx.db.get(args.gameId);
    if (!game || game.state !== "waiting") {
      throw new Error("Game not available to join");
    }

    // Create the AI player
    const aiPlayerId = await ctx.db.insert("players", {
      name: "AI Player",
      kind: "ai",
    });

    // Update the game
    await ctx.db.patch(args.gameId, {
      playerO: aiPlayerId,
      state: "playing",
    });

    return aiPlayerId;
  },
});

export const makeMove = mutation({
  args: {
    gameId: v.id("games"),
    playerId: v.id("players"),
    position: v.number(),
  },
  handler: async (ctx, args) => {
    const game = await ctx.db.get(args.gameId);
    if (!game || game.state !== "playing") {
      throw new Error("Invalid game state");
    }

    if (game.currentPlayer !== args.playerId) {
      throw new Error("Not your turn");
    }

    const board = [...game.board];
    const symbol = game.playerX === args.playerId ? "X" : "O";

    if (board[args.position] !== null) {
      throw new Error("Position already taken");
    }

    board[args.position] = symbol;

    const winner = checkWinner(board);
    const isDraw = !winner && board.every((cell) => cell !== null);
    const nextPlayer = args.playerId === game.playerX ? game.playerO : game.playerX;

    await ctx.db.patch(args.gameId, {
      board,
      currentPlayer: nextPlayer,
      state: winner || isDraw ? "finished" : "playing",
      ...(winner ? { winner: args.playerId } : {}),
    });
  },
});
