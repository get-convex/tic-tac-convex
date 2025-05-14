import { useEffect } from "react";
import { api } from "@convex/_generated/api";
import { useMutation, useQuery } from "convex/react";
import { ConvexGame } from "../convexSchemaTypes";

export function useAIPlayer() {
  const games = useQuery(api.queries.getGames) ?? [];
  const makeAIMove = useMutation(api.mutations.makeAIMove);

  useEffect(() => {
    // Find a game where it's AI's turn
    const gameWithAITurn = games.find((game) => {
      if (game.state !== "playing") return false;
      const currentPlayer = game.players.find(p => p._id === game.currentPlayer);
      return currentPlayer?.kind === "ai";
    });

    if (!gameWithAITurn) return;

    // Add a small delay to make the AI move feel more natural
    const timeoutId = setTimeout(() => {
      makeAIMove({ gameId: gameWithAITurn._id });
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [games, makeAIMove]);
}
