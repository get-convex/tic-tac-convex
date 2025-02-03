import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";
import { Id } from "./_generated/dataModel";

export const createGame = mutation({
  args: {},
  returns: v.id("games"),
  handler: async (ctx) => {
    const gameId = await ctx.db.insert("games", {
      board: ["", "", "", "", "", "", "", "", ""],
      currentPlayer: "X",
      status: "waiting",
      playerX: undefined,
      playerO: undefined,
    });
    return gameId;
  },
});

export const joinGame = mutation({
  args: {
    gameId: v.id("games"),
    playerId: v.id("players"),
    side: v.union(v.literal("X"), v.literal("O")),
  },
  returns: v.null(),
  handler: async (ctx, { gameId, playerId, side }) => {
    const game = await ctx.db.get(gameId);
    if (!game) throw new Error("Game not found");
    if (game.status !== "waiting") throw new Error("Game already started");

    if (side === "X" && game.playerX) throw new Error("Player X already taken");
    if (side === "O" && game.playerO) throw new Error("Player O already taken");

    const updates: {
      playerX?: Id<"players">;
      playerO?: Id<"players">;
      status: "waiting" | "playing";
    } = {
      [side === "X" ? "playerX" : "playerO"]: playerId,
      status: "waiting",
    };

    // If both players are now set, start the game
    if ((side === "X" && game.playerO) || (side === "O" && game.playerX))
      updates.status = "playing";

    await ctx.db.patch(gameId, updates);

    // If the other player is AI, schedule their move
    const otherPlayerId = side === "X" ? game.playerO : game.playerX;
    if (otherPlayerId) {
      const otherPlayer = await ctx.db.get(otherPlayerId);
      if (otherPlayer?.type === "ai")
        await ctx.scheduler.runAfter(1000, internal.ai.makeMove, { gameId });
    }

    return null;
  },
});

export const makeMove = mutation({
  args: {
    gameId: v.id("games"),
    playerId: v.id("players"),
    position: v.number(),
  },
  returns: v.null(),
  handler: async (ctx, { gameId, playerId, position }) => {
    const game = await ctx.db.get(gameId);
    if (!game) throw new Error("Game not found");
    if (game.status !== "playing") throw new Error("Game not in progress");

    const isPlayerX = game.playerX === playerId;
    const isPlayerO = game.playerO === playerId;
    if (!isPlayerX && !isPlayerO) throw new Error("Not a player in this game");

    const playerSymbol = isPlayerX ? "X" : "O";
    if (game.currentPlayer !== playerSymbol) throw new Error("Not your turn");

    if (position < 0 || position > 8) throw new Error("Invalid position");
    if (game.board[position] !== "") throw new Error("Position already taken");

    const newBoard = [...game.board];
    newBoard[position] = playerSymbol;

    const winner = checkWinner(newBoard);
    const isDraw = !winner && newBoard.every((cell) => cell !== "");

    await ctx.db.patch(gameId, {
      board: newBoard,
      currentPlayer: playerSymbol === "X" ? "O" : "X",
      status: winner || isDraw ? "finished" : "playing",
      winner: winner ? playerSymbol : isDraw ? "draw" : undefined,
    });

    // If next player is AI, schedule their move
    const nextPlayerId = playerSymbol === "X" ? game.playerO : game.playerX;
    if (nextPlayerId && !winner && !isDraw) {
      const nextPlayer = await ctx.db.get(nextPlayerId);
      if (nextPlayer?.type === "ai")
        await ctx.scheduler.runAfter(1000, internal.ai.makeMove, { gameId });
    }

    return null;
  },
});

export const getGame = query({
  args: { gameId: v.id("games") },
  returns: v.object({
    _id: v.id("games"),
    board: v.array(v.union(v.literal("X"), v.literal("O"), v.literal(""))),
    currentPlayer: v.union(v.literal("X"), v.literal("O")),
    status: v.union(
      v.literal("waiting"),
      v.literal("playing"),
      v.literal("finished")
    ),
    winner: v.optional(
      v.union(v.literal("X"), v.literal("O"), v.literal("draw"))
    ),
    playerX: v.optional(v.id("players")),
    playerO: v.optional(v.id("players")),
  }),
  handler: async (ctx, { gameId }) => {
    const game = await ctx.db.get(gameId);
    if (!game) throw new Error("Game not found");
    return game;
  },
});

export const listGames = query({
  args: {
    status: v.optional(
      v.union(v.literal("waiting"), v.literal("playing"), v.literal("finished"))
    ),
  },
  returns: v.array(
    v.object({
      _id: v.id("games"),
      board: v.array(v.union(v.literal("X"), v.literal("O"), v.literal(""))),
      currentPlayer: v.union(v.literal("X"), v.literal("O")),
      status: v.union(
        v.literal("waiting"),
        v.literal("playing"),
        v.literal("finished")
      ),
      winner: v.optional(
        v.union(v.literal("X"), v.literal("O"), v.literal("draw"))
      ),
      playerX: v.optional(v.id("players")),
      playerO: v.optional(v.id("players")),
    })
  ),
  handler: async (ctx, { status }) => {
    if (status)
      return await ctx.db
        .query("games")
        .withIndex("by_status", (q) => q.eq("status", status))
        .collect();

    return await ctx.db.query("games").collect();
  },
});

function checkWinner(board: string[]): "X" | "O" | undefined {
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
    if (board[a] && board[a] === board[b] && board[a] === board[c])
      return board[a] as "X" | "O";

  return undefined;
}
