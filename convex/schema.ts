import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  players: defineTable({
    name: v.string(),
    kind: v.union(v.literal("human"), v.literal("ai")),
  }),

  games: defineTable({
    board: v.array(v.union(v.literal("X"), v.literal("O"), v.null())),
    players: v.array(
      v.object({
        _id: v.id("players"),
        name: v.string(),
        kind: v.union(v.literal("human"), v.literal("ai")),
        symbol: v.union(v.literal("X"), v.literal("O")),
      })
    ),
    currentPlayer: v.id("players"),
    winner: v.optional(v.id("players")),
    state: v.union(
      v.literal("waiting"),
      v.literal("playing"),
      v.literal("finished")
    ),
    createdAt: v.number(),
  }),
});
