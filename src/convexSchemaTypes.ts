import { Doc, Id } from "@convex/_generated/dataModel";

export type ConvexPlayer = {
  _id: Id<"players">;
  name: string;
  kind: "human" | "ai";
};

export type ConvexGame = {
  _id: Id<"games">;
  board: Array<"X" | "O" | null>;
  players: Array<ConvexPlayer & { symbol: "X" | "O" }>;
  currentPlayer: Id<"players">;
  winner?: Id<"players">;
  state: "waiting" | "playing" | "finished";
  createdAt: number;
};
