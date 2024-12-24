import { Auth } from "./components/Auth";
import { GameList } from "./components/GameList";
import { GameBoard } from "./components/GameBoard";
import { useRoute, routes } from "./routes";
import { useConvexGame, ConvexPlayer, ConvexGame } from "./hooks/useConvexGame";
import { useState, useEffect } from "react";
import { Id } from "../convex/_generated/dataModel";
import type { Game, Player } from "./types";

function App() {
  const [currentPlayer, setCurrentPlayer] = useState<ConvexPlayer | null>(
    () => {
      const saved = localStorage.getItem("currentPlayer");
      return saved ? JSON.parse(saved) : null;
    }
  );

  const route = useRoute();
  const {
    createPlayer,
    game: currentGame,
    availableGames,
    createGame,
    joinGame,
    makeMove,
    addAI,
  } = useConvexGame(
    route.name === "gameBoard" && route.params.gameId
      ? { gameId: route.params.gameId as Id<"games"> }
      : undefined
  );

  useEffect(() => {
    localStorage.setItem("currentPlayer", JSON.stringify(currentPlayer));
  }, [currentPlayer]);

  if (!currentPlayer && route.name !== "auth")
    return <Redirect to={routes.auth()} />;

  if (currentPlayer && route.name === "auth")
    return <Redirect to={routes.gameList()} />;

  // Convert ConvexPlayer to Player for components
  const playerForComponents: Player | null = currentPlayer
    ? {
        id: currentPlayer._id,
        name: currentPlayer.name,
        kind: currentPlayer.kind,
      }
    : null;

  // Convert ConvexGame to Game for components
  const convertGame = (game: ConvexGame | undefined): Game | null => {
    if (!game) return null;
    return {
      id: game._id,
      board: game.board,
      players: game.players.map((playerId) => ({
        id: playerId,
        name: "Player", // We'll need to fetch player names separately
        kind: "human", // We'll need to fetch player kinds separately
      })),
      currentPlayer: game.currentPlayer,
      winner: game.winner,
      state: game.state,
      playerSymbols: game.playerSymbols,
      createdAt: game._creationTime,
    };
  };

  return (
    <>
      {route.name === "auth" && (
        <Auth
          onAuth={async (name: string) => {
            const playerId = await createPlayer({ name, kind: "human" });
            const player: ConvexPlayer = {
              _id: playerId,
              _creationTime: Date.now(),
              name,
              kind: "human",
            };
            setCurrentPlayer(player);
            routes.gameList().push();
          }}
        />
      )}

      {route.name === "gameList" && availableGames && playerForComponents && (
        <GameList
          games={availableGames
            .map((game) => convertGame(game))
            .filter((g): g is Game => g !== null)}
          currentPlayer={playerForComponents}
          onCreateGame={async () => {
            if (!currentPlayer) return;
            const gameId = await createGame(currentPlayer);
            routes.gameBoard({ gameId }).push();
          }}
          onSelectGame={(game: Game) =>
            routes.gameBoard({ gameId: game.id as Id<"games"> }).push()
          }
        />
      )}

      {route.name === "gameBoard" &&
        route.params.gameId &&
        currentGame &&
        playerForComponents && (
          <GameBoard
            game={convertGame(currentGame)!}
            currentPlayer={playerForComponents}
            onMove={async (index) => {
              if (!currentPlayer) return;
              await makeMove(currentGame._id, currentPlayer, index);
            }}
            onJoin={async () => {
              if (!currentPlayer || !currentGame) return;
              await joinGame(currentGame._id, currentPlayer);
            }}
            onAddAI={async () => {
              if (!currentGame) return;
              await addAI(currentGame._id);
            }}
            onBack={() => routes.gameList().push()}
          />
        )}

      {route.name === false && <div>404 - Not Found</div>}
    </>
  );
}

function Redirect({ to }: { to: { push: () => void } }) {
  useEffect(() => {
    to.push();
  }, [to]);
  return null;
}

export default App;
