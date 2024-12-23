import { useState, useEffect } from "react";
import type { Game, Player, GameState } from "../types";
import { checkWinner } from "./gameLogic";

export function useGameState() {
  const [currentPlayer, setCurrentPlayer] = useState<Player | null>(() => {
    const saved = localStorage.getItem("currentPlayer");
    return saved ? JSON.parse(saved) : null;
  });

  const [games, setGames] = useState<Game[]>(() => {
    const saved = localStorage.getItem("games");
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem("currentPlayer", JSON.stringify(currentPlayer));
  }, [currentPlayer]);

  useEffect(() => {
    localStorage.setItem("games", JSON.stringify(games));
  }, [games]);

  const createGame = (player: Player) => {
    const newGame: Game = {
      id: crypto.randomUUID(),
      board: Array(9).fill(null),
      players: [player],
      currentPlayer: player.id,
      winner: null,
      state: "waiting",
      createdAt: Date.now(),
      playerSymbols: {
        [player.id]: "X",
      },
    };

    setGames((prev) => [...prev, newGame]);
  };

  const joinGame = (selectedGame: Game, joiningPlayer: Player) => {
    const updatedGame: Game = {
      ...selectedGame,
      players: [...selectedGame.players, joiningPlayer],
      state: "playing" as const,
      playerSymbols: {
        ...selectedGame.playerSymbols,
        [joiningPlayer.id]: "O" as const,
      },
    };

    setGames((prev) =>
      prev.map((game) => (game.id === selectedGame.id ? updatedGame : game))
    );
  };

  const addAI = (selectedGame: Game) => {
    const aiPlayer: Player = {
      id: crypto.randomUUID(),
      name: "AI Player",
      kind: "ai",
    };

    const updatedGame: Game = {
      ...selectedGame,
      players: [...selectedGame.players, aiPlayer],
      state: "playing" as const,
      playerSymbols: {
        ...selectedGame.playerSymbols,
        [aiPlayer.id]: "O" as const,
      },
    };

    setGames((prev) =>
      prev.map((game) => (game.id === selectedGame.id ? updatedGame : game))
    );
  };

  const makeMove = (
    selectedGame: Game,
    index: number,
    movingPlayer: Player
  ) => {
    if (selectedGame.board[index]) return;

    const newBoard = [...selectedGame.board];
    const playerSymbol = selectedGame.playerSymbols[movingPlayer.id];
    newBoard[index] = playerSymbol;

    const winner = checkWinner(newBoard);
    const isDraw = !winner && newBoard.every((cell) => cell !== null);

    const nextPlayer = selectedGame.players.find(
      (p) => p.id !== selectedGame.currentPlayer
    );
    if (!nextPlayer) return;

    const updatedGame = {
      ...selectedGame,
      board: newBoard,
      currentPlayer: nextPlayer.id,
      winner: winner ? selectedGame.currentPlayer : null,
      state: (winner || isDraw ? "finished" : "playing") as GameState,
    };

    setGames((prev) =>
      prev.map((game) => (game.id === selectedGame.id ? updatedGame : game))
    );
  };

  return {
    currentPlayer,
    setCurrentPlayer,
    games,
    setGames,
    createGame,
    joinGame,
    addAI,
    makeMove,
  };
}
