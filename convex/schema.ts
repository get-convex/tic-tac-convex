import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  players: defineTable({
    name: v.string(),
    kind: v.union(v.literal("human"), v.literal("ai")),
  }),

  games: defineTable({
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
    .index("by_state", ["state"])
    .index("by_player", ["players"]),
});
