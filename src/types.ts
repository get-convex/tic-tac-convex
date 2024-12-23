export type Player = {
  name: string;
  id: string;
};

export type GameState = "waiting" | "playing" | "finished";

export type Game = {
  id: string;
  board: Array<string | null>;
  players: Player[];
  currentPlayer: string;
  winner: string | null;
  state: GameState;
  createdAt: number;
};
