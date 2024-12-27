import { useGameState } from "./game/useGameState";
import { useRoute, routes } from "./routes";
import { Auth } from "./components/Auth";
import { GameList } from "./components/GameList";
import { GameBoard } from "./components/GameBoard";
import { Redirect } from "./components/common/Redirect";
import { useQuery, useMutation } from "convex/react";
import { api } from "../convex/_generated/api";
import { Id } from "../convex/_generated/dataModel";

export default function App() {
  const {
    currentPlayer,
    setCurrentPlayer,
    games,
    createGame,
    joinGame,
    makeMove,
  } = useGameState();

  const route = useRoute();
  const addAIMutation = useMutation(api.games.addAI);

  // Always fetch the game if we have an ID, but only use it when needed
  const gameId =
    route.name === "gameBoard" ? (route.params.gameId as Id<"games">) : null;
  const currentGame = useQuery(api.games.get, gameId ? { id: gameId } : "skip");

  if (!currentPlayer && route.name !== "auth")
    return <Redirect to={routes.auth} />;

  if (currentPlayer && route.name === "auth")
    return <Redirect to={routes.gameList} />;

  const handleAddAI = async (gameId: Id<"games">) => {
    await addAIMutation({ gameId });
  };

  return (
    <>
      {route.name === "auth" && <Auth onAuth={setCurrentPlayer} />}

      {route.name === "gameList" && (
        <GameList
          games={games}
          currentPlayer={currentPlayer!}
          onCreateGame={createGame}
          onSelectGame={(gameId) => routes.gameBoard({ gameId }).push()}
        />
      )}

      {route.name === "gameBoard" && currentGame && (
        <GameBoard
          game={currentGame}
          currentPlayer={currentPlayer!}
          onMove={(index) => makeMove(currentGame._id, index)}
          onJoin={() => joinGame(currentGame._id)}
          onAddAI={() => handleAddAI(currentGame._id)}
          onBack={() => routes.gameList().push()}
        />
      )}

      {route.name === false && <div>404 - Not Found</div>}
    </>
  );
}
