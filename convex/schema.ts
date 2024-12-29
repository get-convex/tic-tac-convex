import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  players: defineTable({
    name: v.string(),
    kind: v.union(v.literal("human"), v.literal("ai")),
  }),

  games: defineTable({
    board: v.array(v.union(v.literal("X"), v.literal("O"), v.null())),
    state: v.union(
      v.literal("waiting"),
      v.literal("playing"),
      v.literal("finished")
    ),
    currentPlayerId: v.id("players"),
    winnerId: v.optional(v.id("players")),
    playerSymbols: v.object({
      playerOneId: v.id("players"),
      playerTwoId: v.optional(v.id("players")),
      playerOneSymbol: v.literal("X"),
      playerTwoSymbol: v.literal("O"),
    }),
  })
    .index("by_state", ["state"])
    .index("by_player", ["playerSymbols.playerOneId"])
    .index("by_player_two", ["playerSymbols.playerTwoId"]),
});
