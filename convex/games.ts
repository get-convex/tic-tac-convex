import { v } from "convex/values";
import { mutation, query, action } from "./_generated/server";
import { api } from "./_generated/api";
import { Id } from "./_generated/dataModel";

export const createPlayer = mutation({
  args: {
    name: v.string(),
    kind: v.union(v.literal("human"), v.literal("ai")),
  },
  handler: async (ctx, { name, kind }) => {
    const existingPlayer = await ctx.db
      .query("players")
      .withIndex("by_name", (q) => q.eq("name", name))
      .first();

    if (existingPlayer) return existingPlayer._id;
    return await ctx.db.insert("players", { name, kind });
  },
});

export const createGame = mutation({
  args: { playerId: v.id("players") },
  handler: async (ctx, { playerId }) => {
    return await ctx.db.insert("games", {
      board: Array(9).fill(""),
      players: [playerId],
      currentPlayer: playerId,
      state: "waiting",
      createdAt: Date.now(),
      playerSymbols: {
        firstPlayerId: playerId,
      },
    });
  },
});

export const joinGame = mutation({
  args: { gameId: v.id("games"), playerId: v.id("players") },
  handler: async (ctx, { gameId, playerId }) => {
    const game = await ctx.db.get(gameId);
    if (!game || game.state !== "waiting" || game.players.length !== 1)
      throw new Error("Invalid game");

    if (game.players.includes(playerId)) throw new Error("Already in game");

    return await ctx.db.patch(gameId, {
      players: [...game.players, playerId],
      state: "playing",
      playerSymbols: {
        ...game.playerSymbols,
        secondPlayerId: playerId,
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
    if (!game || game.state !== "playing") throw new Error("Invalid game");

    if (game.currentPlayer !== playerId) throw new Error("Not your turn");

    if (position < 0 || position > 8 || game.board[position] !== "")
      throw new Error("Invalid move");

    const isFirstPlayer = playerId === game.playerSymbols.firstPlayerId;
    const newBoard = [...game.board];
    newBoard[position] = isFirstPlayer ? "X" : "O";

    const winner = checkWinner(newBoard);
    const isDraw = !winner && newBoard.every((cell) => cell !== "");
    const nextPlayerId = isFirstPlayer
      ? game.playerSymbols.secondPlayerId!
      : game.playerSymbols.firstPlayerId;

    await ctx.db.patch(gameId, {
      board: newBoard,
      currentPlayer: nextPlayerId,
      ...(winner ? { winner: playerId, state: "finished" } : {}),
      ...(isDraw ? { state: "finished" } : {}),
    });

    const updatedGame = await ctx.db.get(gameId);

    // If next player is AI, schedule their move
    const nextPlayer = await ctx.db.get(nextPlayerId);
    if (nextPlayer?.kind === "ai" && updatedGame?.state === "playing") {
      await ctx.scheduler.runAfter(1000, api.games.makeAIMove, { gameId });
    }

    return updatedGame;
  },
});

export const makeAIMove = action({
  args: { gameId: v.id("games") },
  handler: async (ctx, { gameId }) => {
    const game = await ctx.runQuery(api.games.getGame, { gameId });
    if (!game || game.state !== "playing") return;

    const currentPlayer = await ctx.runQuery(api.games.getPlayer, {
      playerId: game.currentPlayer,
    });
    if (!currentPlayer?.kind === "ai") return;

    // Get available moves
    const availableMoves = game.board
      .map((cell, index) => (cell === "" ? index : -1))
      .filter((index) => index !== -1);

    if (availableMoves.length === 0) return;

    // Pick a random move
    const position =
      availableMoves[Math.floor(Math.random() * availableMoves.length)];

    await ctx.runMutation(api.games.makeMove, {
      gameId,
      playerId: game.currentPlayer,
      position,
    });
  },
});

export const getGame = query({
  args: { gameId: v.id("games") },
  handler: async (ctx, { gameId }) => {
    const game = await ctx.db.get(gameId);
    if (!game) return null;

    // Get player details
    const players = await Promise.all(game.players.map((id) => ctx.db.get(id)));

    return {
      ...game,
      players: players.map((p) => ({
        id: p!._id,
        name: p!.name,
        kind: p!.kind,
      })),
    };
  },
});

export const getPlayer = query({
  args: { playerId: v.id("players") },
  handler: async (ctx, { playerId }) => {
    return await ctx.db.get(playerId);
  },
});

export const getAvailableGames = query({
  handler: async (ctx) => {
    const games = await ctx.db
      .query("games")
      .withIndex("by_state", (q) => q.eq("state", "waiting"))
      .collect();

    // Get player details for each game
    return await Promise.all(
      games.map(async (game) => {
        const players = await Promise.all(
          game.players.map((id) => ctx.db.get(id))
        );
        return {
          ...game,
          players: players.map((p) => ({
            id: p!._id,
            name: p!.name,
            kind: p!.kind,
          })),
        };
      })
    );
  },
});

function checkWinner(board: string[]): boolean {
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

  for (const [a, b, c] of lines)
    if (board[a] && board[a] === board[b] && board[a] === board[c]) return true;

  return false;
}
