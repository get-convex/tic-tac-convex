import * as React from "react";
import type { Game, Player } from "../types";
import { Button } from "./common/Button";
import { Id } from "../../convex/_generated/dataModel";

interface GameListProps {
  games: Game[];
  currentPlayer: Player;
  onCreateGame: () => Promise<void>;
  onSelectGame: (gameId: Id<"games">) => void;
}

export function GameList({
  games,
  currentPlayer,
  onCreateGame,
  onSelectGame,
}: GameListProps) {
  const [isCreating, setIsCreating] = React.useState(false);

  const handleCreateGame = async () => {
    setIsCreating(true);
    try {
      await onCreateGame();
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg p-8">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-2xl font-bold text-indigo-600">Games</h1>
            <div className="flex items-center gap-4">
              <span className="text-gray-600">
                Playing as:{" "}
                <span className="font-medium">{currentPlayer.name}</span>
              </span>
              <Button onClick={handleCreateGame} disabled={isCreating}>
                {isCreating ? "Creating..." : "New Game"}
              </Button>
            </div>
          </div>

          <div className="space-y-4">
            {games.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No games yet. Create one to start playing!
              </div>
            ) : (
              games.map((game) => (
                <div
                  key={game._id}
                  className="border border-gray-200 rounded-lg p-4 hover:border-indigo-200 transition-colors"
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-medium">
                        Game #{game._id.toString().slice(0, 8)}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {new Date(game.createdAt).toLocaleString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-4">
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-medium ${
                          game.state === "waiting"
                            ? "bg-yellow-100 text-yellow-700"
                            : game.state === "playing"
                              ? "bg-green-100 text-green-700"
                              : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {game.state.charAt(0).toUpperCase() +
                          game.state.slice(1)}
                      </span>
                      <Button
                        variant="secondary"
                        onClick={() => onSelectGame(game._id)}
                      >
                        View Game
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
