import { v } from "convex/values";
import { defineTable, defineSchema } from "convex/server";

// Player table stores information about each player
export default defineSchema({
  players: defineTable({
    name: v.string(),
    kind: v.union(v.literal("human"), v.literal("ai")),
  }),

  games: defineTable({
    // The board is a 9-element array representing the 3x3 grid
    board: v.array(v.union(v.literal("X"), v.literal("O"), v.null())),
    
    // Players in the game (references to players table)
    playerX: v.id("players"),
    playerO: v.id("players"), // Optional for games waiting for second player
    
    // Current state of the game
    state: v.union(
      v.literal("waiting"),
      v.literal("playing"),
      v.literal("finished")
    ),
    
    // Whose turn is it? References players table
    currentPlayer: v.id("players"),
    
    // Winner of the game, if any. References players table
    winner: v.optional(v.id("players")),
    
    // When the game was created
    createdAt: v.number(),
  }).index("by_state", ["state"])
    .index("by_player", ["playerX"])
    .index("by_player_and_state", ["playerX", "state"])
});