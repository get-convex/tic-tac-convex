import { useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { getAvailableMoves } from "../../convex/utils";

export function useAIPlayer() {
  const games = useQuery(api.games.list) ?? [];
  const makeMove = useMutation(api.games.makeMove);

  // Get all current players in one query
  const currentPlayerIds = games.map((game) => game.currentPlayerId);
  const currentPlayers =
    useQuery(api.players.getMany, {
      playerIds: currentPlayerIds,
    }) ?? {};

  useEffect(() => {
    // Find games where it's AI's turn
    const aiGames = games.filter((game) => {
      const currentPlayer = currentPlayers[game.currentPlayerId];
      return currentPlayer?.kind === "ai" && game.state === "playing";
    });

    // Handle each AI game
    const timeouts = aiGames.map((game) => {
      const timeoutId = setTimeout(async () => {
        const availableMoves = getAvailableMoves(game.board);
        if (availableMoves.length === 0) return;

        // Make a random move
        const aiMoveIndex =
          availableMoves[Math.floor(Math.random() * availableMoves.length)];
        try {
          await makeMove({
            gameId: game._id,
            playerId: game.currentPlayerId,
            index: aiMoveIndex,
          });
        } catch (error) {
          console.error("AI move failed:", error);
        }
      }, 500);

      return timeoutId;
    });

    // Cleanup timeouts
    return () => timeouts.forEach(clearTimeout);
  }, [games, makeMove, currentPlayers]);
}
