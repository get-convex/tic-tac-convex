import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import type { Player } from "../types";

export function useGame(gameId: Id<"games"> | null) {
  const game = useQuery(api.games.getGame, gameId ? { gameId } : "skip");
  const availableGames = useQuery(api.games.getAvailableGames);

  const createPlayer = useMutation(api.games.createPlayer);
  const createGame = useMutation(api.games.createGame);
  const joinGame = useMutation(api.games.joinGame);
  const makeMove = useMutation(api.games.makeMove);
  const makeAIMove = useMutation(api.games.makeAIMove);

  const handleCreatePlayer = async (name: string) => {
    return await createPlayer({ name, isAI: false });
  };

  const handleCreateAIPlayer = async (name: string) => {
    return await createPlayer({ name, isAI: true });
  };

  const handleCreateGame = async (player: Player) => {
    return await createGame({ playerId: player.id });
  };

  const handleJoinGame = async (gameId: Id<"games">, player: Player) => {
    return await joinGame({ gameId, playerId: player.id });
  };

  const handleMakeMove = async (
    gameId: Id<"games">,
    player: Player,
    position: number
  ) => {
    return await makeMove({ gameId, playerId: player.id, position });
  };

  const handleAddAI = async (gameId: Id<"games">) => {
    const aiPlayer = await handleCreateAIPlayer(
      `AI Player ${Math.floor(Math.random() * 1000)}`
    );
    await handleJoinGame(gameId, {
      id: aiPlayer,
      name: `AI Player`,
      isAI: true,
    });
    await makeAIMove({ gameId });
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
