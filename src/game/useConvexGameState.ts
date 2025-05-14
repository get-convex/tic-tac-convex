import { useEffect, useState } from "react";
import { api } from "@convex/_generated/api";
import { useQuery, useMutation } from "convex/react";
import { Id } from "@convex/_generated/dataModel";
import { handleConvexError } from "../utils/errorHandling";
import { ConvexGame } from "../convexSchemaTypes";

export function useConvexGameState() {
  const games = useQuery(api.queries.getGames) ?? [];
  const [isLoading, setIsLoading] = useState(false);
  
  const createPlayer = useMutation(api.mutations.createPlayer);
  const createGame = useMutation(api.mutations.createGame);
  const joinGame = useMutation(api.mutations.joinGame);
  const addAIPlayer = useMutation(api.mutations.addAIPlayer);
  const makeMove = useMutation(api.mutations.makeMove);
  
  const initializeNewPlayer = async (player: { name: string; kind: "human" | "ai" }) => {
    setIsLoading(true);
    try {
      return await createPlayer(player);
    } catch (error) {
      handleConvexError(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateGame = async (playerId: Id<"players">) => {
    setIsLoading(true);
    try {
      return await createGame({ playerId });
    } catch (error) {
      handleConvexError(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const handleJoinGame = async (gameId: Id<"games">, playerId: Id<"players">) => {
    setIsLoading(true);
    try {
      return await joinGame({ gameId, playerId });
    } catch (error) {
      handleConvexError(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddAI = async (gameId: Id<"games">) => {
    setIsLoading(true);
    try {
      return await addAIPlayer({ gameId });
    } catch (error) {
      handleConvexError(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const handleMakeMove = async (
    gameId: Id<"games">,
    playerId: Id<"players">,
    index: number
  ) => {
    setIsLoading(true);
    try {
      return await makeMove({ gameId, playerId, index });
    } catch (error) {
      handleConvexError(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };
  return {
    games,
    isLoading,
    initializeNewPlayer,
    handleCreateGame,
    handleJoinGame,
    handleAddAI,
    handleMakeMove,
  };
}
