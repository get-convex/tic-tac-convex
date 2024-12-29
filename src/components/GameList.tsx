import type { Game, Player } from "../convex/types";
import { Button } from "./common/Button";

type GameListProps = {
  games: Game[];
  currentPlayer: Player;
  onCreateGame: () => void;
  onSelectGame: (game: Game) => void;
};

export function GameList({
  games,
  currentPlayer,
  onCreateGame,
  onSelectGame,
}: GameListProps) {
  const sortedGames = [...games].sort(
    (a, b) => b._creationTime - a._creationTime
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Games</h1>
            <p className="text-gray-600">Welcome back, {currentPlayer.name}!</p>
          </div>
          <Button onClick={onCreateGame}>New Game</Button>
        </div>

        <div className="space-y-4">
          {sortedGames.map((game) => {
            const isInGame =
              game.playerOne.id === currentPlayer._id ||
              game.playerTwo?.id === currentPlayer._id;
            const isPlayerTurn = game.currentPlayerId === currentPlayer._id;

            return (
              <div
                key={game._id}
                className="bg-white rounded-xl shadow-lg p-6 transition-all duration-200 hover:shadow-xl"
              >
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-800">
                      Game #{game._id.slice(0, 8)}
                    </h2>
                    <div className="flex items-center gap-2 mt-1">
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
                      {isInGame && (
                        <span className="text-sm text-indigo-600">
                          {isPlayerTurn ? "Your turn!" : "In game"}
                        </span>
                      )}
                    </div>
                  </div>
                  <Button
                    variant="secondary"
                    onClick={() => onSelectGame(game)}
                  >
                    {isInGame ? "Continue" : "View"}
                  </Button>
                </div>
              </div>
            );
          })}

          {sortedGames.length === 0 && (
            <div className="text-center py-12 bg-white rounded-xl">
              <p className="text-gray-500">
                No games yet. Create one to start playing!
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
