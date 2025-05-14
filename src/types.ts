import { Id } from "../convex/_generated/dataModel";

export type GameState = "waiting" | "playing" | "finished";

export type ConvexPlayer = {
  _id: Id<"players">;
  _creationTime: number;
  name: string;
  kind: "human" | "ai";
};

export type ConvexGame = {
  _id: Id<"games">;
  _creationTime: number;
  board: Array<"X" | "O" | null>;
  playerX: Id<"players">;
  playerO?: Id<"players">;
  currentPlayer: Id<"players">;
  winner?: Id<"players">;
  state: GameState;
  createdAt: number;
  playerXData?: ConvexPlayer;
  playerOData?: ConvexPlayer;
};

// Legacy types for compatibility with existing components
export type Player = {
  name: string;
  id: string;
  kind: "human" | "ai";
};

export type Game = {
  id: string;
  board: Array<string | null>;
  players: Player[];
  currentPlayer: string;
  winner: string | null;
  state: GameState;
  createdAt: number;
  playerSymbols: Record<string, "X" | "O">;
};
