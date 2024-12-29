import { Id } from "../../convex/_generated/dataModel";

export type Player = {
  _id: Id<"players">;
  _creationTime: number;
  name: string;
  kind: "human" | "ai";
};

export type Game = {
  _id: Id<"games">;
  _creationTime: number;
  board: Array<"X" | "O" | null>;
  state: "waiting" | "playing" | "finished";
  currentPlayerId: Id<"players">;
  winnerId?: Id<"players">;
  playerOne: {
    id: Id<"players">;
    symbol: "X";
  };
  playerTwo?: {
    id: Id<"players">;
    symbol: "O";
  };
};
