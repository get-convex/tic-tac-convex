import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { useLocalStorage } from "./useLocalStorage";

export type Player = {
  _id: Id<"players">;
  name: string;
  kind: "human" | "ai";
};

export function useGameState() {
  // Keep current player in local storage
  const [currentPlayer, setCurrentPlayer] = useLocalStorage<Player | null>(
    "currentPlayer",
    null
  );

  // Get all games from Convex
  const games = useQuery(api.games.list) ?? [];

  // Mutations
  const createGame = useMutation(api.games.create);
  const joinGame = useMutation(api.games.join);
  const addAI = useMutation(api.games.addAI);
  const makeMove = useMutation(api.games.makeMove);
  const createPlayer = useMutation(api.players.create);

  // Helper to create a new player
  const handleCreatePlayer = async (name: string) => {
    const playerId = await createPlayer({ name, kind: "human" });
    const player = { _id: playerId, name, kind: "human" as const };
    setCurrentPlayer(player);
    return player;
  };

  // Helper to create a new game
  const handleCreateGame = async () => {
    if (!currentPlayer) return;
    await createGame({ playerId: currentPlayer._id });
  };

  // Helper to join a game
  const handleJoinGame = async (gameId: Id<"games">) => {
    if (!currentPlayer) return;
    await joinGame({ gameId, playerId: currentPlayer._id });
  };

  // Helper to add AI to a game
  const handleAddAI = async (gameId: Id<"games">) => {
    await addAI({ gameId });
  };

  // Helper to make a move
  const handleMakeMove = async (gameId: Id<"games">, index: number) => {
    if (!currentPlayer) return;
    await makeMove({ gameId, playerId: currentPlayer._id, index });
  };

  return {
    currentPlayer,
    setCurrentPlayer: handleCreatePlayer,
    games,
    createGame: handleCreateGame,
    joinGame: handleJoinGame,
    addAI: handleAddAI,
    makeMove: handleMakeMove,
  };
}
