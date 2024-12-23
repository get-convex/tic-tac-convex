import type { Game, Player } from "../types";
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
  const activeGames = games.filter((game) => game.state !== "finished");
  const finishedGames = games.filter((game) => game.state === "finished");

  const GameCard = ({ game }: { game: Game }) => (
    <div
      key={game.id}
      onClick={() => onSelectGame(game)}
      className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-all duration-200 transform hover:-translate-y-1 cursor-pointer"
    >
      <div className="flex justify-between items-center mb-4">
        <span className="text-lg font-semibold text-gray-800">
          Game #{game.id.slice(0, 8)}
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
          {game.players.map((player) => (
            <li
              key={player.id}
              className="flex items-center text-gray-700 gap-2"
            >
              <span className="w-2 h-2 rounded-full bg-indigo-400"></span>
              <span className="font-medium">
                {player.name}
                {player.id === currentPlayer.id && (
                  <span className="ml-2 text-sm text-indigo-600">(You)</span>
                )}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">
            Welcome,{" "}
            <span className="text-indigo-600">{currentPlayer.name}</span>!
          </h1>
          <Button onClick={onCreateGame}>Create New Game</Button>
        </div>

        {activeGames.length === 0 && finishedGames.length === 0 && (
          <div className="text-center bg-white rounded-xl shadow-md p-8 mt-8">
            <p className="text-gray-600 text-lg mb-4">
              No games available. Create a new one to start playing!
            </p>
            <Button onClick={onCreateGame}>Create New Game</Button>
          </div>
        )}

        {activeGames.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-gray-500/70 mb-6">
              Active Games
            </h2>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {activeGames.map((game) => (
                <GameCard key={game.id} game={game} />
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
                <GameCard key={game.id} game={game} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
