import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { api } from "./_generated/api";

function checkWinner(board: Array<"X" | "O" | null>): "X" | "O" | null {
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
    if (board[a] && board[a] === board[b] && board[a] === board[c])
      return board[a];
  }

  return null;
}

export const create = mutation({
  args: {
    playerId: v.id("players"),
  },
  returns: v.id("games"),
  handler: async (ctx, { playerId }) => {
    const player = await ctx.db.get(playerId);
    if (!player) throw new Error("Player not found");

    return await ctx.db.insert("games", {
      board: Array(9).fill(null),
      players: [playerId],
      currentPlayer: playerId,
      winner: undefined,
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
  returns: v.null(),
  handler: async (ctx, { gameId, playerId }) => {
    const game = await ctx.db.get(gameId);
    if (!game) throw new Error("Game not found");
    if (game.state !== "waiting")
      throw new Error("Game is not waiting for players");
    if (game.players.length >= 2) throw new Error("Game is full");
    if (game.players.includes(playerId))
      throw new Error("Player already in game");

    await ctx.db.patch(gameId, {
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
    index: v.number(),
  },
  returns: v.null(),
  handler: async (ctx, { gameId, playerId, index }) => {
    const game = await ctx.db.get(gameId);
    if (!game) throw new Error("Game not found");
    if (game.state !== "playing")
      throw new Error("Game is not in playing state");
    if (game.currentPlayer !== playerId) throw new Error("Not your turn");
    if (game.board[index]) throw new Error("Cell already occupied");

    const newBoard = [...game.board];
    const playerSymbol = game.playerSymbols[playerId];
    newBoard[index] = playerSymbol;

    const winningSymbol = checkWinner(newBoard);
    const isDraw = !winningSymbol && newBoard.every((cell) => cell !== null);

    const nextPlayer = game.players.find((p) => p !== playerId);
    if (!nextPlayer) throw new Error("No next player found");

    await ctx.db.patch(gameId, {
      board: newBoard,
      currentPlayer: nextPlayer,
      winner: winningSymbol === playerSymbol ? playerId : undefined,
      state: winningSymbol || isDraw ? "finished" : "playing",
    });

    // If next player is AI, schedule their move
    const nextPlayerDoc = await ctx.db.get(nextPlayer);
    if (nextPlayerDoc?.kind === "ai" && !winningSymbol && !isDraw)
      await ctx.scheduler.runAfter(1000, api.games.aiMove, { gameId });
  },
});

export const aiMove = mutation({
  args: {
    gameId: v.id("games"),
  },
  returns: v.null(),
  handler: async (ctx, { gameId }) => {
    const game = await ctx.db.get(gameId);
    if (!game) throw new Error("Game not found");
    if (game.state !== "playing") return;

    const currentPlayer = await ctx.db.get(game.currentPlayer);
    if (!currentPlayer || currentPlayer.kind !== "ai") return;

    // Get available moves
    const availableMoves = game.board
      .map((cell, index) => (cell === null ? index : -1))
      .filter((index) => index !== -1);

    if (availableMoves.length === 0) return;

    // Pick a random move
    const moveIndex =
      availableMoves[Math.floor(Math.random() * availableMoves.length)];

    // Make the move
    const newBoard = [...game.board];
    const playerSymbol = game.playerSymbols[game.currentPlayer];
    newBoard[moveIndex] = playerSymbol;

    const winningSymbol = checkWinner(newBoard);
    const isDraw = !winningSymbol && newBoard.every((cell) => cell !== null);

    const nextPlayer = game.players.find((p) => p !== game.currentPlayer);
    if (!nextPlayer) throw new Error("No next player found");

    await ctx.db.patch(gameId, {
      board: newBoard,
      currentPlayer: nextPlayer,
      winner: winningSymbol === playerSymbol ? game.currentPlayer : undefined,
      state: winningSymbol || isDraw ? "finished" : "playing",
    });
  },
});

export const list = query({
  args: {
    state: v.optional(
      v.union(v.literal("waiting"), v.literal("playing"), v.literal("finished"))
    ),
  },
  returns: v.array(
    v.object({
      _id: v.id("games"),
      _creationTime: v.number(),
      board: v.array(v.union(v.literal("X"), v.literal("O"), v.null())),
      players: v.array(v.id("players")),
      currentPlayer: v.id("players"),
      winner: v.optional(v.id("players")),
      state: v.union(
        v.literal("waiting"),
        v.literal("playing"),
        v.literal("finished")
      ),
      playerSymbols: v.record(
        v.id("players"),
        v.union(v.literal("X"), v.literal("O"))
      ),
    })
  ),
  handler: async (ctx, { state }) => {
    const query = ctx.db.query("games");
    return await (state
      ? query.withIndex("by_state", (q) => q.eq("state", state)).collect()
      : query.collect());
  },
});

export const get = query({
  args: {
    id: v.id("games"),
  },
  returns: v.object({
    _id: v.id("games"),
    _creationTime: v.number(),
    board: v.array(v.union(v.literal("X"), v.literal("O"), v.null())),
    players: v.array(v.id("players")),
    currentPlayer: v.id("players"),
    winner: v.optional(v.id("players")),
    state: v.union(
      v.literal("waiting"),
      v.literal("playing"),
      v.literal("finished")
    ),
    playerSymbols: v.record(
      v.id("players"),
      v.union(v.literal("X"), v.literal("O"))
    ),
  }),
  handler: async (ctx, { id }) => {
    const game = await ctx.db.get(id);
    if (!game) throw new Error("Game not found");
    return game;
  },
});
