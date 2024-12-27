import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { useCallback, useEffect } from "react";

// Types from our Convex schema
export type Player = {
  _id: Id<"players">;
  name: string;
  kind: "human" | "ai";
};

export type Game = {
  _id: Id<"games">;
  board: string[];
  playerIds: Id<"players">[];
  currentPlayerId: Id<"players">;
  winnerId?: Id<"players">;
  state: "waiting" | "playing" | "finished";
  createdAt: number;
  playerSymbols: Record<Id<"players">, "X" | "O">;
};

export function useConvexGame() {
  // Keep current player in localStorage
  const storedPlayer = localStorage.getItem("currentPlayer");
  const currentPlayerId = storedPlayer ? JSON.parse(storedPlayer) : null;

  // Debug logging
  useEffect(() => {
    console.log("Current player ID from storage:", currentPlayerId);
  }, [currentPlayerId]);

  // Queries
  const games = useQuery(api.games.list, {});
  const currentPlayer = useQuery(
    api.players.get,
    currentPlayerId ? { playerId: currentPlayerId } : "skip"
  );

  // Debug logging for query results
  useEffect(() => {
    console.log("Games from query:", games);
    console.log("Current player from query:", currentPlayer);
  }, [games, currentPlayer]);

  // Mutations
  const createPlayer = useMutation(api.players.create);
  const createGame = useMutation(api.games.create);
  const joinGame = useMutation(api.games.join);
  const makeMove = useMutation(api.games.makeMove);
  const addAI = useMutation(api.games.addAI);

  // Helper to create a new player and store in localStorage
  const handleCreatePlayer = useCallback(
    async (name: string) => {
      console.log("Creating player:", name);
      const playerId = await createPlayer({
        name,
        kind: "human",
      });
      console.log("Created player with ID:", playerId);
      localStorage.setItem("currentPlayer", JSON.stringify(playerId));
      return playerId;
    },
    [createPlayer]
  );

  // Helper to create a new game
  const handleCreateGame = useCallback(async () => {
    if (!currentPlayerId) return;
    console.log("Creating game for player:", currentPlayerId);
    return await createGame({ playerId: currentPlayerId });
  }, [createGame, currentPlayerId]);

  // Helper to join a game
  const handleJoinGame = useCallback(
    async (gameId: Id<"games">) => {
      if (!currentPlayerId) return;
      console.log("Joining game:", gameId, "with player:", currentPlayerId);
      return await joinGame({ gameId, playerId: currentPlayerId });
    },
    [joinGame, currentPlayerId]
  );

  // Helper to make a move
  const handleMakeMove = useCallback(
    async (gameId: Id<"games">, position: number) => {
      if (!currentPlayerId) return;
      console.log("Making move:", position, "in game:", gameId);
      return await makeMove({
        gameId,
        playerId: currentPlayerId,
        position,
      });
    },
    [makeMove, currentPlayerId]
  );

  // Helper to add AI to a game
  const handleAddAI = useCallback(
    async (gameId: Id<"games">) => {
      console.log("Adding AI to game:", gameId);
      return await addAI({ gameId });
    },
    [addAI]
  );

  return {
    currentPlayer,
    games,
    createPlayer: handleCreatePlayer,
    createGame: handleCreateGame,
    joinGame: handleJoinGame,
    makeMove: handleMakeMove,
    addAI: handleAddAI,
  };
}
