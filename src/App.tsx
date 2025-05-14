import { Auth } from "./components/Auth";
import { GameList } from "./components/GameList";
import { GameBoard } from "./components/GameBoard";
import { useRoute, routes } from "./routes";
import { useConvexGameState } from "./game/useConvexGameState";
import { useAIPlayer } from "./game/useConvexAIPlayer";
import { useAuth } from "./components/AuthProvider";
import { Redirect } from "./components/common/Redirect";
import { Id } from "@convex/_generated/dataModel";

function App() {
  const { currentPlayerId, setCurrentPlayerId } = useAuth();
  const {
    games,
    initializeNewPlayer,
    handleCreateGame,
    handleJoinGame,
    handleAddAI,
    handleMakeMove,
  } = useConvexGameState();

  const route = useRoute();

  // Set up AI player for automated moves
  useAIPlayer();


  if (!currentPlayerId && route.name !== "auth")
    return <Redirect to={routes.auth} />;

  if (currentPlayerId && route.name === "auth")
    return <Redirect to={routes.gameList} />;
  return (
    <>
      {route.name === "auth" && (
        <Auth          onAuth={async (player) => {
            const playerId = await initializeNewPlayer(player);
            setCurrentPlayerId(playerId);
            routes.gameList().push();
            return playerId;
          }}
        />
      )}

      {route.name === "gameList" && currentPlayerId && (
        <GameList
          games={games}
          currentPlayerId={currentPlayerId}
          onCreateGame={async () => {
            await handleCreateGame(currentPlayerId);
          }}
          onSelectGame={(game) => routes.gameBoard({ gameId: game._id }).push()}
        />
      )}

      {route.name === "gameBoard" && route.params.gameId && currentPlayerId && (
        <GameBoard
          gameId={route.params.gameId as Id<"games">}
          currentPlayerId={currentPlayerId}
          onMove={async (index) => {
            await handleMakeMove(route.params.gameId as Id<"games">, currentPlayerId, index);
          }}
          onJoin={async () => {
            await handleJoinGame(route.params.gameId as Id<"games">, currentPlayerId);
          }}
          onAddAI={async () => {
            await handleAddAI(route.params.gameId as Id<"games">);
          }}
          onBack={() => routes.gameList().push()}
          isLoading={false}
        />
      )}

      {route.name === false && <div>404 - Not Found</div>}
    </>
  );
}

export default App;
