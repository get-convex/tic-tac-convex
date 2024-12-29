import {
  DatabaseWriter,
  mutation,
  query,
  internalMutation,
} from "./_generated/server";
import { internal } from "./_generated/api";
import { v } from "convex/values";
import { Doc } from "./_generated/dataModel";

function getAvailableMoves(board: Array<"X" | "O" | null>): number[] {
  return board.reduce<number[]>((moves, cell, index) => {
    if (cell === null) moves.push(index);
    return moves;
  }, []);
}

function checkWinner(board: Array<"X" | "O" | null>): boolean {
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

  return lines.some(
    ([a, b, c]) => board[a] && board[a] === board[b] && board[a] === board[c]
  );
}

async function makeGameMove(
  db: DatabaseWriter,
  game: Doc<"games">,
  moveIndex: number,
  symbol: "X" | "O"
) {
  const newBoard = [...game.board];
  newBoard[moveIndex] = symbol;

  const hasWinner = checkWinner(newBoard);
  const isDraw = !hasWinner && newBoard.every((cell) => cell !== null);
  const isPlayerOne = game.currentPlayerId === game.playerOne.id;
  const nextPlayerId = isPlayerOne ? game.playerTwo!.id : game.playerOne.id;

  await db.patch(game._id, {
    board: newBoard,
    currentPlayerId: nextPlayerId,
    winnerId: hasWinner ? game.currentPlayerId : undefined,
    state: hasWinner || isDraw ? "finished" : "playing",
  });

  return { hasWinner, isDraw };
}

export const scheduleAiMove = internalMutation({
  args: {
    gameId: v.id("games"),
    playerId: v.id("players"),
  },
  handler: async (ctx, { gameId, playerId }) => {
    const game = await ctx.db.get(gameId);
    if (!game || game.state !== "playing") return;

    const availableMoves = getAvailableMoves(game.board);
    if (availableMoves.length === 0) return;

    const aiMoveIndex =
      availableMoves[Math.floor(Math.random() * availableMoves.length)];
    const isPlayerOne = playerId === game.playerOne.id;
    const symbol = isPlayerOne ? "X" : "O";

    await makeGameMove(ctx.db, game, aiMoveIndex, symbol);
  },
});

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

    const isPlayerOne = playerId === game.playerOne.id;
    const symbol = isPlayerOne ? "X" : "O";

    // Make the player's move
    const result = await makeGameMove(ctx.db, game, index, symbol);
    if (result.hasWinner || result.isDraw) return;

    // Check if next player is AI
    const nextPlayer = await ctx.db.get(
      isPlayerOne ? game.playerTwo.id : game.playerOne.id
    );
    if (nextPlayer?.kind !== "ai") return;

    // Schedule the AI move to happen in 2 seconds
    await ctx.scheduler.runAfter(1000, internal.games.scheduleAiMove, {
      gameId,
      playerId: nextPlayer._id,
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
