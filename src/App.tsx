import { useState } from "react";
import { Auth } from "./components/Auth";
import { GameList } from "./components/GameList";
import { GameBoard } from "./components/GameBoard";
import type { Game, Player, GameState } from "./types";

function checkWinner(board: Array<string | null>): string | null {
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];

  for (const [a, b, c] of lines) {
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return board[a];
    }
  }

  return null;
}

function getAvailableMoves(board: Array<string | null>): number[] {
  return board.reduce<number[]>((moves, cell, index) => {
    if (cell === null) moves.push(index);
    return moves;
  }, []);
}

function App() {
  const [currentPlayer, setCurrentPlayer] = useState<Player | null>(null);
  const [games, setGames] = useState<Game[]>([]);
  const [selectedGame, setSelectedGame] = useState<Game | null>(null);

  const handleAuth = (player: Player) => {
    setCurrentPlayer(player);
  };

  const handleCreateGame = () => {
    if (!currentPlayer) return;

    const newGame: Game = {
      id: crypto.randomUUID(),
      board: Array(9).fill(null),
      players: [currentPlayer],
      currentPlayer: currentPlayer.id,
      winner: null,
      state: "waiting",
      createdAt: Date.now(),
    };

    setGames((prev) => [...prev, newGame]);
  };

  const handleJoinGame = () => {
    if (!currentPlayer || !selectedGame) return;

    const updatedGame = {
      ...selectedGame,
      players: [...selectedGame.players, currentPlayer],
      state: "playing" as const,
    };

    setGames((prev) =>
      prev.map((game) => (game.id === selectedGame.id ? updatedGame : game))
    );
    setSelectedGame(updatedGame);
  };

  const handleAddAI = () => {
    if (!selectedGame) return;

    const aiPlayer: Player = {
      id: crypto.randomUUID(),
      name: "AI Player",
      isAI: true,
    };

    const updatedGame = {
      ...selectedGame,
      players: [...selectedGame.players, aiPlayer],
      state: "playing" as const,
    };

    setGames((prev) =>
      prev.map((game) => (game.id === selectedGame.id ? updatedGame : game))
    );
    setSelectedGame(updatedGame);
  };

  const handleMove = (index: number) => {
    if (!currentPlayer || !selectedGame || selectedGame.board[index]) return;

    const newBoard = [...selectedGame.board];
    const currentPlayerSymbol =
      currentPlayer.id === selectedGame.players[0].id ? "X" : "O";
    newBoard[index] = currentPlayerSymbol;

    const winner = checkWinner(newBoard);
    const isDraw = !winner && newBoard.every((cell) => cell !== null);

    const nextPlayer = selectedGame.players.find(
      (p) => p.id !== currentPlayer.id
    );
    if (!nextPlayer) return;

    const updatedGame = {
      ...selectedGame,
      board: newBoard,
      currentPlayer: nextPlayer.id,
      winner: winner ? currentPlayer.id : null,
      state: (winner || isDraw ? "finished" : "playing") as GameState,
    };

    setGames((prev) =>
      prev.map((game) => (game.id === selectedGame.id ? updatedGame : game))
    );
    setSelectedGame(updatedGame);

    if (!winner && !isDraw && nextPlayer.isAI) {
      setTimeout(() => {
        const availableMoves = getAvailableMoves(newBoard);
        if (availableMoves.length > 0) {
          const aiMoveIndex =
            availableMoves[Math.floor(Math.random() * availableMoves.length)];
          handleMove(aiMoveIndex);
        }
      }, 500);
    }
  };

  if (!currentPlayer) {
    return <Auth onAuth={handleAuth} />;
  }

  if (selectedGame) {
    return (
      <GameBoard
        game={selectedGame}
        currentPlayer={currentPlayer}
        onMove={handleMove}
        onJoin={handleJoinGame}
        onAddAI={handleAddAI}
        onBack={() => setSelectedGame(null)}
      />
    );
  }

  return (
    <GameList
      games={games}
      currentPlayer={currentPlayer}
      onCreateGame={handleCreateGame}
      onSelectGame={setSelectedGame}
    />
  );
}

export default App;
