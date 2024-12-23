import { useState, useEffect } from "react";
import { Auth } from "./components/Auth";
import { GameList } from "./components/GameList";
import { GameBoard } from "./components/GameBoard";
import type { Game, Player, GameState } from "./types";
import { RouteProvider, useRoute, routes } from "./routes";

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

  const route = useRoute();

  const handleAuth = (player: Player) => {
    setCurrentPlayer(player);
    routes.gameList().push();
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
      playerSymbols: {
        [currentPlayer.id]: "X",
      },
    };

    setGames((prev) => [...prev, newGame]);
  };

  const handleJoinGame = (selectedGame: Game) => {
    if (!currentPlayer) return;

    const updatedGame: Game = {
      ...selectedGame,
      players: [...selectedGame.players, currentPlayer],
      state: "playing" as const,
      playerSymbols: {
        ...selectedGame.playerSymbols,
        [currentPlayer.id]: "O" as const,
      },
    };

    setGames((prev) =>
      prev.map((game) => (game.id === selectedGame.id ? updatedGame : game))
    );
  };

  const handleAddAI = (selectedGame: Game) => {
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

  const handleMove = (selectedGame: Game, index: number) => {
    if (!currentPlayer || selectedGame.board[index]) return;

    const newBoard = [...selectedGame.board];
    const currentPlayerSymbol = selectedGame.playerSymbols[currentPlayer.id];
    newBoard[index] = currentPlayerSymbol;

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

    if (!winner && !isDraw && nextPlayer.kind === "ai") {
      setTimeout(() => {
        const availableMoves = getAvailableMoves(newBoard);
        if (availableMoves.length > 0) {
          const aiMoveIndex =
            availableMoves[Math.floor(Math.random() * availableMoves.length)];
          const aiBoard = [...newBoard];
          const aiSymbol = selectedGame.playerSymbols[nextPlayer.id];
          aiBoard[aiMoveIndex] = aiSymbol;

          const aiWinner = checkWinner(aiBoard);
          const aiIsDraw = !aiWinner && aiBoard.every((cell) => cell !== null);

          const afterAiPlayer = selectedGame.players.find(
            (p) => p.id !== nextPlayer.id
          );
          if (!afterAiPlayer) return;

          const afterAiGame = {
            ...updatedGame,
            board: aiBoard,
            currentPlayer: afterAiPlayer.id,
            winner: aiWinner ? nextPlayer.id : null,
            state: (aiWinner || aiIsDraw ? "finished" : "playing") as GameState,
          };

          setGames((prev) =>
            prev.map((game) =>
              game.id === selectedGame.id ? afterAiGame : game
            )
          );
        }
      }, 500);
    }
  };

  // If not authenticated and not on auth page, redirect to auth
  if (!currentPlayer && route.name !== "auth") {
    routes.auth().push();
    return null;
  }

  // If authenticated and on auth page, redirect to game list
  if (currentPlayer && route.name === "auth") {
    routes.gameList().push();
    return null;
  }

  return (
    <RouteProvider>
      {route.name === "auth" && <Auth onAuth={handleAuth} />}

      {route.name === "gameList" && (
        <GameList
          games={games}
          currentPlayer={currentPlayer!}
          onCreateGame={handleCreateGame}
          onSelectGame={(game) => routes.gameBoard({ gameId: game.id }).push()}
        />
      )}

      {route.name === "gameBoard" && route.params.gameId && (
        <GameBoard
          game={games.find((g) => g.id === route.params.gameId)!}
          currentPlayer={currentPlayer!}
          onMove={(index) => {
            const game = games.find((g) => g.id === route.params.gameId);
            if (game) handleMove(game, index);
          }}
          onJoin={() => {
            const game = games.find((g) => g.id === route.params.gameId);
            if (game) handleJoinGame(game);
          }}
          onAddAI={() => {
            const game = games.find((g) => g.id === route.params.gameId);
            if (game) handleAddAI(game);
          }}
          onBack={() => routes.gameList().push()}
        />
      )}

      {route.name === false && <div>404 - Not Found</div>}
    </RouteProvider>
  );
}

export default App;
