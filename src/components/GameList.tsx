import { Doc } from "../../convex/_generated/dataModel";
import { Button } from "./common/Button";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";

type GameListProps = {
  currentPlayer: Doc<"players">;
  onSelectGame: (game: Doc<"games">) => void;
};

export function GameList({ currentPlayer, onSelectGame }: GameListProps) {
  const games = useQuery(api.games.list) ?? [];
  const createGame = useMutation(api.games.create);

  const sortedGames = [...games].sort(
    (a, b) => b._creationTime - a._creationTime
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-8">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg p-8">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-2xl font-bold text-gray-800">Games</h1>
            <Button onClick={() => createGame({ playerId: currentPlayer._id })}>
              New Game
            </Button>
          </div>

          <div className="space-y-4">
            {sortedGames.map((game) => (
              <button
                key={game._id}
                onClick={() => onSelectGame(game)}
                className="w-full p-4 bg-gray-50 hover:bg-indigo-50 rounded-lg transition-colors duration-200 text-left"
              >
                <div className="flex justify-between items-center">
                  <span className="font-medium text-gray-800">
                    Game #{game._id.slice(0, 8)}
                  </span>
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${
                      game.state === "waiting"
                        ? "bg-yellow-100 text-yellow-700"
                        : game.state === "playing"
                          ? "bg-green-100 text-green-700"
                          : "bg-gray-100 text-gray-700"
                    }`}
                  >
                    {game.state.charAt(0).toUpperCase() + game.state.slice(1)}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
