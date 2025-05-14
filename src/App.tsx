import { Auth } from "./components/Auth";
import { GameList } from "./components/GameList";
import { GameBoard } from "./components/GameBoard";
import { useRoute, routes } from "./routes";
import { useConvexGame } from "./game/useConvexGame";
import { Redirect } from "./components/common/Redirect";
import { Id } from "../convex/_generated/dataModel";

function App() {  const {
    currentPlayer,
    setCurrentPlayer,
    games,
    createGame,
    joinGame,
    addAI,
    makeMove,
  } = useConvexGame();

  const route = useRoute();

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
      )}      {route.name === "gameBoard" && route.params.gameId && (
        <GameBoard
          game={games.find((g) => g.id === route.params.gameId)!}
          currentPlayer={currentPlayer!}
          onMove={(index) => {
            makeMove(route.params.gameId as Id<"games">, currentPlayer!.id as Id<"players">, index);
          }}
          onJoin={() => {
            joinGame(route.params.gameId as Id<"games">, currentPlayer!);
          }}
          onAddAI={() => {
            addAI(route.params.gameId as Id<"games">);
          }}
          onBack={() => routes.gameList().push()}
        />
      )}

      {route.name === false && <div>404 - Not Found</div>}
    </>
  );
}

export default App;
