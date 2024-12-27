import { Button } from "./common/Button";
import type { Game, Player } from "../hooks/useConvexGame";

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
  const activeGames = games.filter((game) => game.state !== "finished");
  const finishedGames = games.filter((game) => game.state === "finished");

  const GameCard = ({ game }: { game: Game }) => (
    <div
      key={game._id}
      onClick={() => onSelectGame(game)}
      className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-all duration-200 transform hover:-translate-y-1 cursor-pointer"
    >
      <div className="flex justify-between items-center mb-4">
        <span className="text-lg font-semibold text-gray-800">
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
          {game.state}
        </span>
      </div>

      <div className="space-y-3">
        <p className="text-gray-600 font-medium">Players:</p>
        <ul className="space-y-2">
          {game.playerIds.map((playerId) => (
            <li
              key={playerId}
              className="flex items-center text-gray-700 gap-2"
            >
              <span className="w-2 h-2 rounded-full bg-indigo-400"></span>
              <span className="font-medium">
                {playerId === currentPlayer._id && (
                  <span className="ml-2 text-sm text-indigo-600">(You)</span>
                )}
                {game.state === "finished" && game.winnerId === playerId && (
                  <span className="ml-2 text-sm text-green-600">(Winner!)</span>
                )}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">Games</h1>
          <Button variant="primary" onClick={onCreateGame}>
            New Game
          </Button>
        </div>

        {activeGames.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Active Games
            </h2>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {activeGames.map((game) => (
                <GameCard key={game._id} game={game} />
              ))}
            </div>
          </div>
        )}

        {finishedGames.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold text-gray-500/70 mb-6">
              Finished Games
            </h2>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {finishedGames.map((game) => (
                <GameCard key={game._id} game={game} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
