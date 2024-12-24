import { Auth } from "./components/Auth";
import { GameList } from "./components/GameList";
import { GameBoard } from "./components/GameBoard";
import { useRoute, routes } from "./routes";
import { useGame } from "./hooks/useGame";
import { Redirect } from "./components/common/Redirect";
import { useState } from "react";
import type { Id } from "../convex/_generated/dataModel";
import type { Player } from "./types";

function App() {
  const [currentPlayer, setCurrentPlayer] = useState<Player | null>(() => {
    const saved = localStorage.getItem("currentPlayer");
    return saved ? JSON.parse(saved) : null;
  });

  const route = useRoute();
  const gameId =
    route.name === "gameBoard" ? (route.params.gameId as Id<"games">) : null;
  const {
    game,
    availableGames,
    createPlayer,
    createGame,
    joinGame,
    makeMove,
    addAI,
  } = useGame(gameId);

  if (!currentPlayer && route.name !== "auth")
    return <Redirect to={routes.auth} />;

  if (currentPlayer && route.name === "auth")
    return <Redirect to={routes.gameList} />;

  return (
    <>
      {route.name === "auth" && (
        <Auth
          onAuth={async (player) => {
            const playerId = await createPlayer(player.name);
            const newPlayer = { ...player, id: playerId };
            setCurrentPlayer(newPlayer);
            localStorage.setItem("currentPlayer", JSON.stringify(newPlayer));
            routes.gameList().push();
          }}
        />
      )}

      {route.name === "gameList" && (
        <GameList
          games={availableGames ?? []}
          currentPlayer={currentPlayer!}
          onCreateGame={async () => {
            if (!currentPlayer) return;
            const gameId = await createGame(currentPlayer.id as Id<"players">);
            routes.gameBoard({ gameId: gameId as string }).push();
          }}
          onSelectGame={(game) => routes.gameBoard({ gameId: game.id }).push()}
        />
      )}

      {route.name === "gameBoard" && gameId && game && (
        <GameBoard
          game={game}
          currentPlayer={currentPlayer!}
          onMove={async (index) => {
            await makeMove(gameId, currentPlayer!.id as Id<"players">, index);
          }}
          onJoin={async () => {
            await joinGame(gameId, currentPlayer!.id as Id<"players">);
          }}
          onAddAI={async () => {
            await addAI(gameId);
          }}
          onBack={() => routes.gameList().push()}
        />
      )}

      {route.name === false && <div>404 - Not Found</div>}
    </>
  );
}

export default App;
