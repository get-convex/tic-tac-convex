import { v } from "convex/values";
import { mutation, query, action } from "./_generated/server";
import { api } from "./_generated/api";

export const createPlayer = mutation({
  args: { name: v.string(), isAI: v.boolean() },
  handler: async (ctx, { name, isAI }) => {
    const existingPlayer = await ctx.db
      .query("players")
      .withIndex("by_name", (q) => q.eq("name", name))
      .first();

    if (existingPlayer) return existingPlayer._id;
    return await ctx.db.insert("players", { name, isAI });
  },
});

export const createGame = mutation({
  args: { playerId: v.id("players") },
  handler: async (ctx, { playerId }) => {
    return await ctx.db.insert("games", {
      currentPlayerId: playerId,
      board: Array(9).fill(""),
      playerIds: [playerId],
      status: "waiting",
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
    if (!game || game.status !== "waiting" || game.playerIds.length !== 1) {
      throw new Error("Invalid game");
    }
    if (game.playerIds.includes(playerId)) {
      throw new Error("Already in game");
    }

    return await ctx.db.patch(gameId, {
      playerIds: [...game.playerIds, playerId],
      status: "playing",
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
    if (!game || game.status !== "playing") {
      throw new Error("Invalid game");
    }
    if (game.currentPlayerId !== playerId) {
      throw new Error("Not your turn");
    }
    if (position < 0 || position > 8 || game.board[position] !== "") {
      throw new Error("Invalid move");
    }

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
      currentPlayerId: nextPlayerId,
      ...(winner ? { winnerId: playerId, status: "finished" } : {}),
      ...(isDraw ? { isDraw: true, status: "finished" } : {}),
    });

    const updatedGame = await ctx.db.get(gameId);

    // If next player is AI, make their move after a short delay
    const nextPlayer = await ctx.db.get(nextPlayerId);
    if (nextPlayer?.isAI && updatedGame?.status === "playing") {
      await ctx.scheduler.runAfter(1000, api, { gameId });
    }

    return updatedGame;
  },
});

const internalMakeAIMove = action({
  args: { gameId: v.id("games") },
  handler: async (ctx, { gameId }) => {
    const game = await ctx.runQuery(api.games.getGame, { gameId });
    if (!game || game.status !== "playing") return;

    const currentPlayer = await ctx.runQuery(api.games.getPlayer, {
      playerId: game.currentPlayerId,
    });
    if (!currentPlayer?.isAI) return;

    // Get available moves
    const availableMoves = game.board
      .map((cell: string, index: number) => (cell === "" ? index : -1))
      .filter((index: number) => index !== -1);

    if (availableMoves.length === 0) return;

    // Pick a random move
    const position =
      availableMoves[Math.floor(Math.random() * availableMoves.length)];

    await ctx.runMutation(api.games.makeMove, {
      gameId,
      playerId: game.currentPlayerId,
      position,
    });
  },
});

export const makeAIMove = internalMakeAIMove;

export const getGame = query({
  args: { gameId: v.id("games") },
  handler: async (ctx, { gameId }) => {
    const game = await ctx.db.get(gameId);
    if (!game) return null;

    // Get player details
    const players = await Promise.all(
      game.playerIds.map((id) => ctx.db.get(id))
    );

    return {
      ...game,
      players: players.map((p) => ({
        id: p!._id,
        name: p!.name,
        isAI: p!.isAI,
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
      .withIndex("by_status", (q) => q.eq("status", "waiting"))
      .collect();

    // Get player details for each game
    return await Promise.all(
      games.map(async (game) => {
        const players = await Promise.all(
          game.playerIds.map((id) => ctx.db.get(id))
        );
        return {
          ...game,
          players: players.map((p) => ({
            id: p!._id,
            name: p!.name,
            isAI: p!.isAI,
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

  for (const [a, b, c] of lines) {
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return true;
    }
  }
  return false;
}

export default { createPlayer, joinGame, makeAIMove, getGame, getPlayer };
