import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";

export type ConvexPlayer = {
  _id: Id<"players">;
  _creationTime: number;
  name: string;
  kind: "human" | "ai";
};

export type ConvexGame = {
  _id: Id<"games">;
  _creationTime: number;
  board: Array<string | null>;
  players: Id<"players">[];
  currentPlayer: Id<"players">;
  winner: Id<"players"> | null;
  state: "waiting" | "playing" | "finished";
  playerSymbols: Record<string, "X" | "O">;
};

export function useConvexGame(args?: {
  gameId?: Id<"games">;
  playerId?: Id<"players">;
}) {
  // Player mutations
  const createPlayer = useMutation(api.players.create);
  const player = useQuery(
    api.players.get,
    args?.playerId ? { playerId: args.playerId } : "skip"
  );

  // Game queries and mutations
  const createGame = useMutation(api.games.create);
  const joinGame = useMutation(api.games.join);
  const makeMove = useMutation(api.games.makeMove);
  const game = useQuery(
    api.games.get,
    args?.gameId ? { gameId: args.gameId } : "skip"
  );
  const availableGames = useQuery(api.games.getAvailableGames, {});

  // AI handling
  const scheduleAIMove = useMutation(api.ai.scheduleMove);

  const handleCreateGame = async (player: ConvexPlayer) => {
    const gameId = await createGame({ playerId: player._id });
    return gameId;
  };

  const handleJoinGame = async (gameId: Id<"games">, player: ConvexPlayer) => {
    await joinGame({ gameId, playerId: player._id });
    // Schedule AI move in case the joining player is AI
    await scheduleAIMove({ gameId });
  };

  const handleMakeMove = async (
    gameId: Id<"games">,
    player: ConvexPlayer,
    position: number
  ) => {
    await makeMove({ gameId, playerId: player._id, position });
    // Schedule potential AI move after this move
    await scheduleAIMove({ gameId });
  };

  const handleAddAI = async (gameId: Id<"games">) => {
    const aiPlayer = await createPlayer({ name: "AI Player", kind: "ai" });
    await handleJoinGame(gameId, {
      _id: aiPlayer,
      _creationTime: Date.now(),
      name: "AI Player",
      kind: "ai",
    });
  };

  return {
    // Player operations
    createPlayer,
    player,

    // Game operations
    game,
    availableGames,
    createGame: handleCreateGame,
    joinGame: handleJoinGame,
    makeMove: handleMakeMove,
    addAI: handleAddAI,
  };
}
