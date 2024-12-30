import { Auth } from "./components/Auth";
import { GameList } from "./components/GameList";
import { GameBoard } from "./components/GameBoard";
import { useRoute, routes } from "./routes";
import { Redirect } from "./components/common/Redirect";
import { useEffect, useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import { Id } from "../convex/_generated/dataModel";

type StoredPlayer = {
  _id: Id<"players">;
};

function App() {
  const [storedPlayer, setStoredPlayer] = useState<StoredPlayer | null>(() => {
    const saved = localStorage.getItem("currentPlayer");
    return saved ? JSON.parse(saved) : null;
  });

  const currentPlayer = useQuery(
    api.players.get,
    storedPlayer?._id ? { id: storedPlayer._id } : "skip"
  );

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
          onAuth={(playerId) => {
            setStoredPlayer({ _id: playerId });
            routes.gameList().push();
          }}
        />
      )}

      {route.name === "gameList" && currentPlayer && (
        <GameList currentPlayer={currentPlayer} />
      )}

      {route.name === "gameBoard" && route.params.gameId && currentPlayer && (
        <GameBoard gameId={route.params.gameId} currentPlayer={currentPlayer} />
      )}

      {route.name === false && <div>404 - Not Found</div>}
    </>
  );
}

export default App;
