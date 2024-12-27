import { Id } from "../convex/_generated/dataModel";

export type Player = {
  _id: Id<"players">;
  name: string;
  kind: "human" | "ai";
};

export type GameState = "waiting" | "playing" | "finished";

export type Game = {
  _id: Id<"games">;
  board: Array<"X" | "O" | null>;
  players: Id<"players">[];
  currentPlayer: Id<"players">;
  winner: Id<"players"> | null;
  state: GameState;
  createdAt: number;
  playerSymbols: Record<string, "X" | "O">;
};
