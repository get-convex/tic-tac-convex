import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  players: defineTable({
    name: v.string(),
    kind: v.union(v.literal("human"), v.literal("ai")),
  }).index("by_name", ["name"]),

  games: defineTable({
    board: v.array(v.union(v.literal("X"), v.literal("O"), v.literal(""))),
    playerIds: v.array(v.id("players")),
    currentPlayerId: v.id("players"),
    winnerId: v.optional(v.id("players")),
    state: v.union(
      v.literal("waiting"),
      v.literal("playing"),
      v.literal("finished")
    ),
    createdAt: v.number(),
    // Map of playerId to their symbol (X or O)
    playerSymbols: v.record(
      v.id("players"),
      v.union(v.literal("X"), v.literal("O"))
    ),
  })
    .index("by_state", ["state"])
    .index("by_player", ["playerIds"])
    .index("by_creation", ["createdAt"]),
});
