import { Id } from "../convex/_generated/dataModel";

export type Player = {
  id: Id<"players">;
  name: string;
  isAI: boolean;
};

export type GameState = "waiting" | "playing" | "finished";

export type Game = {
  id: Id<"games">;
  state: GameState;
  players: Player[];
  currentPlayerId: Id<"players">;
  winnerId?: Id<"players">;
  board: string[];
  isDraw?: boolean;
  playerSymbols: {
    firstPlayerId: Id<"players">;
    secondPlayerId?: Id<"players">;
  };
};
