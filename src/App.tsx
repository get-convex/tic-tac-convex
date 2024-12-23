import { Auth } from "./components/Auth";
import { GameList } from "./components/GameList";
import { GameBoard } from "./components/GameBoard";
import { useRoute, routes } from "./routes";
import { useGameState } from "./game/useGameState";
import { useAIPlayer } from "./game/useAIPlayer";
import { Redirect } from "./components/common/Redirect";

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

  useAIPlayer(games, setGames);

  if (!currentPlayer && route.name !== "auth")
    return <Redirect to={routes.auth} />;

  if (currentPlayer && route.name === "auth")
    return <Redirect to={routes.gameList} />;

  return (
    <>
      {route.name === "auth" && (
        <Auth
          onAuth={(player) => {
            setCurrentPlayer(player);
            routes.gameList().push();
          }}
        />
      )}

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
