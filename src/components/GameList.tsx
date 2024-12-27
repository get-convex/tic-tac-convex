import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { Button } from "./common/Button";
import type { Player } from "../hooks/useGameState";

type GameListProps = {
  currentPlayer: Player;
  onCreateGame: () => Promise<void>;
  onSelectGame: (gameId: Id<"games">) => void;
};

export function GameList({
  currentPlayer,
  onCreateGame,
  onSelectGame,
}: GameListProps) {
  const games = useQuery(api.games.list) ?? [];
  const activeGames = games.filter((game) => game.state !== "finished");
  const finishedGames = games.filter((game) => game.state === "finished");

  // Get player names for each game
  const getPlayerName = (playerId: Id<"players">) => {
    const player = useQuery(api.players.get, { playerId });
    return player?.name ?? "Unknown Player";
  };

  const GameCard = ({
    game,
  }: {
    game: {
      _id: Id<"games">;
      state: string;
      playerIds: Id<"players">[];
      winnerId?: Id<"players">;
    };
  }) => (
    <div
      onClick={() => onSelectGame(game._id)}
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
          {game.state.charAt(0).toUpperCase() + game.state.slice(1)}
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
                {getPlayerName(playerId)}
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
