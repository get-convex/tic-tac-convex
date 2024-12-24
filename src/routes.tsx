import {
  createBrowserRouter,
  RouterProvider,
  useNavigate,
} from "react-router-dom";
import { Game } from "./components/Game";
import { GameList } from "./components/GameList";
import { useGame } from "./hooks/useGame";
import { useLocalStorage } from "./hooks/useLocalStorage";
import { Player } from "./types";
import { Id } from "../convex/_generated/dataModel";

function GameListWrapper() {
  const navigate = useNavigate();
  const [player, setPlayer] = useLocalStorage<Player>("player", null);
  const { availableGames, createGame } = useGame(null);

  if (!player) {
    const randomId = Math.random().toString(36).substring(7);
    const newPlayer: Player = {
      id: randomId,
      name: `Player ${randomId.slice(0, 4)}`,
    };
    setPlayer(newPlayer);
    return null;
  }

  const handleCreateGame = async () => {
    const gameId = await createGame(player);
    navigate(`/game/${gameId}`);
  };

  const handleSelectGame = async (game: { id: Id<"games"> }) => {
    navigate(`/game/${game.id}`);
  };

  return (
    <GameList
      games={availableGames}
      currentPlayer={player}
      onCreateGame={handleCreateGame}
      onSelectGame={handleSelectGame}
    />
  );
}

const router = createBrowserRouter([
  {
    path: "/",
    element: <GameListWrapper />,
  },
  {
    path: "/game/:gameId",
    element: <Game />,
  },
]);

export function RouteProvider({ children }: { children?: React.ReactNode }) {
  return <RouterProvider router={router} />;
}
