import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  players: defineTable({
    name: v.string(),
    isAI: v.boolean(),
  }).index("by_name", ["name"]),

  games: defineTable({
    currentPlayerId: v.id("players"),
    board: v.array(v.string()),
    playerIds: v.array(v.id("players")),
    winnerId: v.optional(v.id("players")),
    isDraw: v.optional(v.boolean()),
    status: v.union(
      v.literal("waiting"),
      v.literal("playing"),
      v.literal("finished")
    ),
    playerSymbols: v.object({
      firstPlayerId: v.id("players"),
      secondPlayerId: v.optional(v.id("players")),
    }),
  })
    .index("by_status", ["status"])
    .index("by_players", ["playerIds"]),
});
