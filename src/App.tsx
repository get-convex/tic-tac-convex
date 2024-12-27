import { Auth } from "./components/Auth";
import { GameList } from "./components/GameList";
import { GameBoard } from "./components/GameBoard";
import { useRoute, routes } from "./routes";
import { useGameState } from "./hooks/useGameState";
import { useAIPlayer } from "./hooks/useAIPlayer";
import { Redirect } from "./components/common/Redirect";
import { Id } from "../convex/_generated/dataModel";

export function App() {
  const {
    currentPlayer,
    setCurrentPlayer,
    createGame,
    joinGame,
    addAI,
    makeMove,
  } = useGameState();

  const route = useRoute();

  // Handle AI moves
  useAIPlayer();

  if (!currentPlayer && route.name !== "auth")
    return <Redirect to={routes.auth} />;

  if (currentPlayer && route.name === "auth")
    return <Redirect to={routes.gameList} />;

  return (
    <>
      {route.name === "auth" && (
        <Auth
          onAuth={async (name) => {
            const player = await setCurrentPlayer(name);
            routes.gameList().push();
            return player;
          }}
        />
      )}

      {route.name === "gameList" && (
        <GameList
          currentPlayer={currentPlayer!}
          onCreateGame={createGame}
          onSelectGame={(gameId) =>
            routes.gameBoard({ gameId: gameId.toString() }).push()
          }
        />
      )}

      {route.name === "gameBoard" && route.params.gameId && (
        <GameBoard
          gameId={route.params.gameId as Id<"games">}
          currentPlayer={currentPlayer!}
          onMove={(index) =>
            makeMove(route.params.gameId as Id<"games">, index)
          }
          onJoin={() => joinGame(route.params.gameId as Id<"games">)}
          onAddAI={() => addAI(route.params.gameId as Id<"games">)}
          onBack={() => routes.gameList().push()}
        />
      )}

      {route.name === false && <div>404 - Not Found</div>}
    </>
  );
}
