import { useState, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import type { Player } from "../types";

export function useGameState() {
  // Keep current player in local storage only
  const [currentPlayer, setCurrentPlayer] = useState<Player | null>(() => {
    const saved = localStorage.getItem("currentPlayer");
    return saved ? JSON.parse(saved) : null;
  });

  useEffect(() => {
    localStorage.setItem("currentPlayer", JSON.stringify(currentPlayer));
  }, [currentPlayer]);

  // Get all games from Convex
  const games = useQuery(api.games.list) ?? [];

  // Mutations
  const createGameMutation = useMutation(api.games.create);
  const joinGameMutation = useMutation(api.games.join);
  const makeMoveMutation = useMutation(api.games.makeMove);
  const createPlayerMutation = useMutation(api.players.create);

  const handleCreatePlayer = async (name: string) => {
    const playerId = await createPlayerMutation({ name, kind: "human" });
    const player = { _id: playerId, name, kind: "human" as const };
    setCurrentPlayer(player);
    return player;
  };

  const createGame = async () => {
    if (!currentPlayer) return;
    await createGameMutation({ playerId: currentPlayer._id });
  };

  const joinGame = async (gameId: Id<"games">) => {
    if (!currentPlayer) return;
    await joinGameMutation({ gameId, playerId: currentPlayer._id });
  };

  const makeMove = async (gameId: Id<"games">, index: number) => {
    if (!currentPlayer) return;
    await makeMoveMutation({
      gameId,
      playerId: currentPlayer._id,
      index,
    });
  };

  return {
    currentPlayer,
    setCurrentPlayer: handleCreatePlayer,
    games,
    createGame,
    joinGame,
    makeMove,
  };
}
