import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("games").order("desc").collect();
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
    const player = await ctx.db.get(playerId);
    if (!player) throw new Error("Player not found");

    return await ctx.db.insert("games", {
      board: Array(9).fill(null),
      players: [playerId],
      currentPlayer: playerId,
      winner: null,
      state: "waiting",
      createdAt: Date.now(),
      playerSymbols: { [playerId.toString()]: "X" },
    });
  },
});

export const join = mutation({
  args: { gameId: v.id("games"), playerId: v.id("players") },
  handler: async (ctx, { gameId, playerId }) => {
    const [game, player] = await Promise.all([
      ctx.db.get(gameId),
      ctx.db.get(playerId),
    ]);

    if (!game) throw new Error("Game not found");
    if (!player) throw new Error("Player not found");
    if (game.state !== "waiting")
      throw new Error("Game is not waiting for players");
    if (game.players.length >= 2) throw new Error("Game is full");
    if (game.players.includes(playerId))
      throw new Error("Player already in game");

    return await ctx.db.patch(gameId, {
      players: [...game.players, playerId],
      state: "playing",
      playerSymbols: { ...game.playerSymbols, [playerId.toString()]: "O" },
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
    if (game.players.length >= 2) throw new Error("Game is full");

    // Create AI player
    const aiPlayer = await ctx.db.insert("players", {
      name: "AI Player",
      kind: "ai",
    });

    return await ctx.db.patch(gameId, {
      players: [...game.players, aiPlayer],
      state: "playing",
      playerSymbols: { ...game.playerSymbols, [aiPlayer.toString()]: "O" },
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
    if (game.currentPlayer !== playerId) throw new Error("Not your turn");
    if (game.board[index]) throw new Error("Cell already occupied");
    if (index < 0 || index >= 9) throw new Error("Invalid move");

    const newBoard = [...game.board];
    const playerSymbol = game.playerSymbols[playerId.toString()];
    newBoard[index] = playerSymbol;

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

function checkWinner(board: (string | null)[]) {
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8], // rows
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8], // columns
    [0, 4, 8],
    [2, 4, 6], // diagonals
  ];

  for (const [a, b, c] of lines) {
    if (board[a] && board[a] === board[b] && board[a] === board[c]) return true;
  }

  return false;
}
