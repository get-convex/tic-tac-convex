import { v } from "convex/values";
import { query } from "./_generated/server";

export const listGames = query({
  args: {
    playerId: v.optional(v.id("players")),
    state: v.optional(v.union(
      v.literal("waiting"),
      v.literal("playing"),
      v.literal("finished")
    )),
  },
  handler: async (ctx, args) => {
    let q = ctx.db.query("games");

    if (args.playerId) {
      q = q.filter(q => q.eq(q.field("playerX"), args.playerId));
    }

    if (args.state) {
      q = q.filter(q => q.eq(q.field("state"), args.state));
    }

    const games = await q.collect();

    // For each game, fetch its players
    const gamesWithPlayers = await Promise.all(
      games.map(async (game) => {
        const playerX = await ctx.db.get(game.playerX);
        const playerO = game.playerO ? await ctx.db.get(game.playerO) : null;

        return {
          ...game,
          playerXData: playerX,
          playerOData: playerO,
        };
      })
    );

    return gamesWithPlayers;
  },
});

export const getGame = query({
  args: { gameId: v.id("games") },
  handler: async (ctx, args) => {
    const game = await ctx.db.get(args.gameId);
    if (!game) return null;

    const [playerX, playerO] = await Promise.all([
      ctx.db.get(game.playerX),
      game.playerO ? ctx.db.get(game.playerO) : null,
    ]);

    return {
      ...game,
      playerXData: playerX,
      playerOData: playerO,
    };
  },
});
