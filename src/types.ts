import { Id } from "../convex/_generated/dataModel";

export type Player = {
  id: Id<"players"> | string;
  name: string;
  kind: "human" | "ai";
};

export type GameState = "waiting" | "playing" | "finished";

export type Game = {
  id: Id<"games"> | string;
  board: Array<"" | "X" | "O">;
  players: Player[];
  currentPlayer: Id<"players"> | string;
  winner: Id<"players"> | string | null;
  state: GameState;
  createdAt: number;
  playerSymbols: {
    firstPlayerId: Id<"players"> | string;
    secondPlayerId?: Id<"players"> | string;
  };
};
