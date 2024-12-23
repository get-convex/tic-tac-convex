import { Auth } from "./components/Auth";
import { GameList } from "./components/GameList";
import { GameBoard } from "./components/GameBoard";
import type { Player } from "./types";
import { useRoute, routes } from "./routes";
import { useGameState } from "./game/useGameState";
import { useAIPlayer } from "./game/useAIPlayer";

function App() {
  const {
    currentPlayer,
    setCurrentPlayer,
    games,
    setGames,
    createGame,
    joinGame,
    addAI,
    makeMove,
  } = useGameState();

  const route = useRoute();

  // Set up AI player
  useAIPlayer(games, setGames);

  const handleAuth = (player: Player) => {
    setCurrentPlayer(player);
    routes.gameList().push();
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
    <>
      {route.name === "auth" && <Auth onAuth={handleAuth} />}

      {route.name === "gameList" && (
        <GameList
          games={games}
          currentPlayer={currentPlayer!}
          onCreateGame={() => currentPlayer && createGame(currentPlayer)}
          onSelectGame={(game) => routes.gameBoard({ gameId: game.id }).push()}
        />
      )}

      {route.name === "gameBoard" && route.params.gameId && (
        <GameBoard
          game={games.find((g) => g.id === route.params.gameId)!}
          currentPlayer={currentPlayer!}
          onMove={(index) => {
            const game = games.find((g) => g.id === route.params.gameId);
            if (game) makeMove(game, index, currentPlayer!);
          }}
          onJoin={() => {
            const game = games.find((g) => g.id === route.params.gameId);
            if (game) joinGame(game, currentPlayer!);
          }}
          onAddAI={() => {
            const game = games.find((g) => g.id === route.params.gameId);
            if (game) addAI(game);
          }}
          onBack={() => routes.gameList().push()}
        />
      )}

      {route.name === false && <div>404 - Not Found</div>}
    </>
  );
}

export default App;
