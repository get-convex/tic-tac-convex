import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  players: defineTable({
    name: v.string(),
    kind: v.union(v.literal("human"), v.literal("ai")),
  }),

  games: defineTable({
    // 9 cells board represented as array of X, O or null
    board: v.array(v.union(v.literal("X"), v.literal("O"), v.null())),

    // Array of player IDs in the game (references players table)
    playerIds: v.array(v.id("players")),

    // Current player's turn (references players table)
    currentPlayerId: v.id("players"),

    // Winner of the game if any (references players table)
    winnerId: v.optional(v.id("players")),

    // Game state
    state: v.union(
      v.literal("waiting"),
      v.literal("playing"),
      v.literal("finished")
    ),

    // Mapping of player IDs to their symbols
    playerSymbols: v.record(
      v.id("players"),
      v.union(v.literal("X"), v.literal("O"))
    ),

    // Timestamp for when game was created
    createdAt: v.number(),
  })
    .index("by_state", ["state"])
    .index("by_player", ["playerIds"])
    .index("recent_games", ["createdAt"]),
});
