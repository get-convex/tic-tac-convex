import { useEffect, useState } from "react";
import { useQuery, useMutation, useAction } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { Game, Player } from "../types";

export function useConvexGame() {
  const [currentPlayer, setCurrentPlayer] = useState<Player | null>(() => {
    const saved = localStorage.getItem("currentPlayer");
    return saved ? JSON.parse(saved) : null;
  });

  useEffect(() => {
    if (currentPlayer) {
      localStorage.setItem("currentPlayer", JSON.stringify(currentPlayer));
    }
  }, [currentPlayer]);

  // Mutations
  const createGameMutation = useMutation(api.mutations.createGame);
  const joinGameMutation = useMutation(api.mutations.joinGame);
  const addAIMutation = useMutation(api.mutations.addAIPlayer);
  const makeMoveMutation = useMutation(api.mutations.makeMove);
  const aiMoveAction = useAction(api.aiActions.aiMove);

  // Queries
  const convexGames = useQuery(api.queries.listGames, {}) ?? [];
  // Convert Convex games to legacy format
  const games: Game[] = convexGames.map(g => ({
    id: g._id,
    board: g.board,
    players: [
      g.playerXData && {
        id: g.playerX.toString(),
        name: g.playerXData.name,
        kind: g.playerXData.kind,
      },
      g.playerOData && g.playerO && {
        id: g.playerO.toString(),
        name: g.playerOData.name,
        kind: g.playerOData.kind,
      },
    ].filter((p): p is Player => p !== null),
    currentPlayer: g.currentPlayer.toString(),
    winner: g.winner?.toString() ?? null,
    state: g.state,
    createdAt: g.createdAt,
    playerSymbols: {
      [g.playerX.toString()]: "X" as const,
      ...(g.playerO ? { [g.playerO.toString()]: "O" as const } : {}),
    },
  }));

  // Actions
  const createGame = async (player: Player) => {
    if (!player) return;
    await createGameMutation({ playerName: player.name });
  };

  const joinGame = async (gameId: Id<"games">, joiningPlayer: Player) => {
    if (!joiningPlayer) return;
    await joinGameMutation({ gameId, playerName: joiningPlayer.name });
  };

  const addAI = async (gameId: Id<"games">) => {
    await addAIMutation({ gameId });
  };

  const makeMove = async (
    gameId: Id<"games">,
    playerId: Id<"players">,
    position: number
  ) => {
    await makeMoveMutation({
      gameId,
      playerId,
      position,
    });

    // If it's AI's turn after this move, trigger AI move
    const game = convexGames.find(g => g._id === gameId);
    if (game?.playerOData?.kind === "ai" && game.currentPlayer === game.playerO) {
      await aiMoveAction({ gameId });
    }
  };

  return {
    currentPlayer,
    setCurrentPlayer,
    games,
    createGame,
    joinGame,
    addAI,
    makeMove,
  };
}