import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";
import type { Game, Player } from "../types";

export function useGame(gameId: Id<"games"> | null) {
  const game = useQuery(api.games.getGame, gameId ? { gameId } : "skip");
  const availableGames = useQuery(api.games.getAvailableGames);

  const createPlayerMutation = useMutation(api.games.createPlayer);
  const createGameMutation = useMutation(api.games.createGame);
  const joinGameMutation = useMutation(api.games.joinGame);
  const makeMoveMutation = useMutation(api.games.makeMove);

  const handleCreatePlayer = async (
    name: string,
    kind: "human" | "ai" = "human"
  ) => {
    return await createPlayerMutation({ name, kind });
  };

  const handleCreateGame = async (playerId: Id<"players">) => {
    return await createGameMutation({ playerId });
  };

  const handleJoinGame = async (
    gameId: Id<"games">,
    playerId: Id<"players">
  ) => {
    return await joinGameMutation({ gameId, playerId });
  };

  const handleMakeMove = async (
    gameId: Id<"games">,
    playerId: Id<"players">,
    position: number
  ) => {
    return await makeMoveMutation({ gameId, playerId, position });
  };

  const handleAddAI = async (gameId: Id<"games">) => {
    const aiPlayerId = await handleCreatePlayer("AI Player", "ai");
    return await handleJoinGame(gameId, aiPlayerId);
  };

  return {
    game,
    availableGames,
    createPlayer: handleCreatePlayer,
    createGame: handleCreateGame,
    joinGame: handleJoinGame,
    makeMove: handleMakeMove,
    addAI: handleAddAI,
  };
}
