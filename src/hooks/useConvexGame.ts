import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { Game, Player } from "../convex/types";

export function useConvexGame() {
  const games = useQuery(api.games.list) ?? [];
  const createGame = useMutation(api.games.create);
  const joinGame = useMutation(api.games.join);
  const makeMove = useMutation(api.games.makeMove);
  const addAI = useMutation(api.games.addAI);
  const createPlayer = useMutation(api.players.create);

  const handleCreateGame = async (player: Player) => {
    await createGame({ playerId: player._id });
  };

  const handleJoinGame = async (game: Game, player: Player) => {
    await joinGame({ gameId: game._id, playerId: player._id });
  };

  const handleMakeMove = async (game: Game, index: number, player: Player) => {
    await makeMove({ gameId: game._id, playerId: player._id, index });
  };

  const handleAddAI = async (game: Game) => {
    await addAI({ gameId: game._id });
  };

  const handleCreatePlayer = async (
    name: string,
    kind: "human" | "ai" = "human"
  ) => {
    return await createPlayer({ name, kind });
  };

  const usePlayer = (id: Id<"players"> | undefined) => {
    return useQuery(api.players.get, id ? { id } : "skip");
  };

  return {
    games,
    createGame: handleCreateGame,
    joinGame: handleJoinGame,
    makeMove: handleMakeMove,
    addAI: handleAddAI,
    createPlayer: handleCreatePlayer,
    usePlayer,
  };
}
