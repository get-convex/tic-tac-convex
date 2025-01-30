import { Auth } from "./components/Auth";
import { GameList } from "./components/GameList";
import { GameBoard } from "./components/GameBoard";
import { useRoute, routes } from "./routes";
import { useQuery, useMutation } from "convex/react";
import { api } from "../convex/_generated/api";
import { Id } from "../convex/_generated/dataModel";
import { useState } from "react";
import { Redirect } from "./components/common/Redirect";

function App() {
  const [currentPlayerId, setCurrentPlayerId] = useState<Id<"players"> | null>(() => {
    const saved = localStorage.getItem("currentPlayerId");
    return saved ? saved as Id<"players"> : null;
  });

  const currentPlayer = useQuery(api.players.get, currentPlayerId ? { id: currentPlayerId } : "skip");
  const games = useQuery(api.games.list, {});
  const createGame = useMutation(api.games.create);
  const joinGame = useMutation(api.games.join);
  const makeMove = useMutation(api.games.makeMove);

  const route = useRoute();

  if (!currentPlayerId && route.name !== "auth")
    return <Redirect to={routes.auth} />;

  if (currentPlayerId && route.name === "auth")
    return <Redirect to={routes.gameList} />;

  return (
    <>
      {route.name === "auth" && (
        <Auth
          onAuth={playerId => {
            setCurrentPlayerId(playerId);
            localStorage.setItem("currentPlayerId", playerId);
            routes.gameList().push();
          }}
        />
      )}

      {route.name === "gameList" && currentPlayer && games && (
        <GameList
          games={games as any}
          currentPlayer={currentPlayer}
          onCreateGame={async () => {
            if (!currentPlayerId) return;
            const gameId = await createGame({ playerId: currentPlayerId });
            routes.gameBoard({ gameId }).push();
          }}
          onSelectGame={game => routes.gameBoard({ gameId: game._id }).push()}
        />
      )}

      {route.name === "gameBoard" && route.params.gameId && currentPlayer && (
        <GameBoard
          gameId={route.params.gameId as Id<"games">}
          currentPlayer={currentPlayer}
          onMove={async index => {
            if (!currentPlayerId) return;
            await makeMove({
              gameId: route.params.gameId as Id<"games">,
              playerId: currentPlayerId,
              index
            });
          }}
          onJoin={async () => {
            if (!currentPlayerId) return;
            await joinGame({
              gameId: route.params.gameId as Id<"games">,
              playerId: currentPlayerId
            });
          }}         
          onBack={() => routes.gameList().push()}
        />
      )}

      {route.name === false && <div>404 - Not Found</div>}
    </>
  );
}

export default App;
