import { Auth } from "./components/Auth";
import { GameList } from "./components/GameList";
import { GameBoard } from "./components/GameBoard";
import { useRoute, routes } from "./routes";
import { useConvexGame } from "./hooks/useConvexGame";
import { Redirect } from "./components/common/Redirect";
import { Id } from "../convex/_generated/dataModel";

function App() {
  const {
    currentPlayer,
    games,
    createPlayer,
    createGame,
    joinGame,
    addAI,
    makeMove,
  } = useConvexGame();

  const route = useRoute();

  // Add debug logging
  console.log("Current route:", route.name);
  console.log("Current player:", currentPlayer);
  console.log("Games:", games);

  // Show loading state while we're fetching initial data
  if (games === undefined) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl text-gray-600">Loading...</div>
      </div>
    );
  }

  // Handle authentication routing
  if (!currentPlayer && route.name !== "auth")
    return <Redirect to={routes.auth} />;

  if (currentPlayer && route.name === "auth")
    return <Redirect to={routes.gameList} />;

  // Show loading state only if we're waiting for player data and we're not on the auth route
  if (currentPlayer === undefined && route.name !== "auth") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl text-gray-600">Loading player data...</div>
      </div>
    );
  }

  // Convert route param to Convex ID when on the gameBoard route
  const gameId =
    route.name === "gameBoard"
      ? (route.params.gameId as unknown as Id<"games">)
      : undefined;
  const currentGame = gameId ? games.find((g) => g._id === gameId) : undefined;

  return (
    <>
      {route.name === "auth" && (
        <Auth
          onAuth={async (name) => {
            await createPlayer(name);
            routes.gameList().push();
          }}
        />
      )}

      {route.name === "gameList" && (
        <GameList
          games={games}
          currentPlayer={currentPlayer!}
          onCreateGame={createGame}
          onSelectGame={(game) =>
            routes.gameBoard({ gameId: game._id as unknown as string }).push()
          }
        />
      )}

      {route.name === "gameBoard" && gameId && currentGame && (
        <GameBoard
          game={currentGame}
          currentPlayer={currentPlayer!}
          onMove={(index) => makeMove(gameId, index)}
          onJoin={() => joinGame(gameId)}
          onAddAI={() => addAI(gameId)}
          onBack={() => routes.gameList().push()}
        />
      )}

      {route.name === false && <div>404 - Not Found</div>}
    </>
  );
}

export default App;
