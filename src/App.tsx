import { Auth } from "./components/Auth";
import { GameList } from "./components/GameList";
import { GameBoard } from "./components/GameBoard";
import { useRoute, routes } from "./routes";
import { useConvexGame } from "./hooks/useConvexGame";
import { Redirect } from "./components/common/Redirect";
import { useEffect, useState } from "react";
import { Id } from "../convex/_generated/dataModel";

type StoredPlayer = {
  _id: Id<"players">;
};

function App() {
  const {
    games,
    createGame,
    joinGame,
    makeMove,
    addAI,
    createPlayer,
    usePlayer,
  } = useConvexGame();

  const [storedPlayer, setStoredPlayer] = useState<StoredPlayer | null>(() => {
    const saved = localStorage.getItem("currentPlayer");
    return saved ? JSON.parse(saved) : null;
  });

  const currentPlayer = usePlayer(storedPlayer?._id);

  useEffect(() => {
    if (storedPlayer)
      localStorage.setItem("currentPlayer", JSON.stringify(storedPlayer));
  }, [storedPlayer]);

  const route = useRoute();

  if (!currentPlayer && route.name !== "auth")
    return <Redirect to={routes.auth} />;

  if (currentPlayer && route.name === "auth")
    return <Redirect to={routes.gameList} />;

  return (
    <>
      {route.name === "auth" && (
        <Auth
          onAuth={async (name) => {
            const playerId = await createPlayer(name);
            setStoredPlayer({ _id: playerId });
            routes.gameList().push();
          }}
        />
      )}

      {route.name === "gameList" && currentPlayer && (
        <GameList
          games={games}
          currentPlayer={currentPlayer}
          onCreateGame={() => createGame(currentPlayer)}
          onSelectGame={(game) => routes.gameBoard({ gameId: game._id }).push()}
        />
      )}

      {route.name === "gameBoard" && route.params.gameId && currentPlayer && (
        <GameBoard
          game={games.find((g) => g._id === route.params.gameId)!}
          currentPlayer={currentPlayer}
          onMove={(index) => {
            const game = games.find((g) => g._id === route.params.gameId);
            if (game) makeMove(game, index, currentPlayer);
          }}
          onJoin={() => {
            const game = games.find((g) => g._id === route.params.gameId);
            if (game) joinGame(game, currentPlayer);
          }}
          onAddAI={() => {
            const game = games.find((g) => g._id === route.params.gameId);
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
