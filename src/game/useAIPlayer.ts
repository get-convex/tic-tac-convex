import { useEffect } from "react";
import type { Game, GameState } from "../types";
import { getAvailableMoves, checkWinner } from "./gameLogic";

export function useAIPlayer(
  games: Game[],
  setGames: React.Dispatch<React.SetStateAction<Game[]>>
) {
  useEffect(() => {
    const currentGame = games.find((game) => {
      const currentPlayer = game.players.find(
        (p) => p.id === game.currentPlayer
      );
      return currentPlayer?.kind === "ai" && game.state === "playing";
    });

    if (!currentGame) return;

    const currentPlayerInGame = currentGame.players.find(
      (p) => p.id === currentGame.currentPlayer
    );
    if (!currentPlayerInGame) return;

    const timeoutId = setTimeout(() => {
      const availableMoves = getAvailableMoves(currentGame.board);
      if (availableMoves.length === 0) return;

      const aiMoveIndex =
        availableMoves[Math.floor(Math.random() * availableMoves.length)];
      const aiBoard = [...currentGame.board];
      const aiSymbol = currentGame.playerSymbols[currentPlayerInGame.id];
      aiBoard[aiMoveIndex] = aiSymbol;

      const aiWinner = checkWinner(aiBoard);
      const aiIsDraw = !aiWinner && aiBoard.every((cell) => cell !== null);

      const afterAiPlayer = currentGame.players.find(
        (p) => p.id !== currentPlayerInGame.id
      );
      if (!afterAiPlayer) return;

      const afterAiGame: Game = {
        ...currentGame,
        board: aiBoard,
        currentPlayer: afterAiPlayer.id,
        winner: aiWinner ? currentPlayerInGame.id : null,
        state: (aiWinner || aiIsDraw ? "finished" : "playing") as GameState,
      };

      setGames((prev) =>
        prev.map((game) => (game.id === currentGame.id ? afterAiGame : game))
      );
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [games, setGames]);
}
