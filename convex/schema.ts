import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  games: defineTable({
    board: v.array(
      v.union(v.literal("X"), v.literal("O"), v.literal(""), v.null())
    ),
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
  }).index("by_status", ["status"]),

  players: defineTable({
    name: v.string(),
    type: v.union(v.literal("human"), v.literal("ai")),
  }),
});
