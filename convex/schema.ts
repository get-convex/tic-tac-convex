import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  players: defineTable({
    name: v.string(),
    kind: v.union(v.literal("human"), v.literal("ai")),
  }).index("by_kind", ["kind"]),

  games: defineTable({
    board: v.array(v.union(v.string(), v.null())),
    players: v.array(v.id("players")),
    currentPlayer: v.id("players"),
    winner: v.union(v.id("players"), v.null()),
    state: v.union(
      v.literal("waiting"),
      v.literal("playing"),
      v.literal("finished")
    ),
    playerSymbols: v.record(
      v.string(),
      v.union(v.literal("X"), v.literal("O"))
    ),
  }).index("by_state", ["state"]),
});
