import type { Game, Player } from "../App";
import { Button } from "./common/Button";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";

type GameBoardProps = {
  game: Game;
  currentPlayer: Player;
  onMove: (position: number) => void;
  onJoin: () => void;
  onAddAI: () => void;
  onBack: () => void;
};

export function GameBoard({
  game,
  currentPlayer,
  onMove,
  onJoin,
  onAddAI,
  onBack,
}: GameBoardProps) {
  const players = useQuery(api.players.listPlayers) ?? [];
  const playerX = game.playerX ? players.find((p: Player) => p._id === game.playerX) : undefined;
  const playerO = game.playerO ? players.find((p: Player) => p._id === game.playerO) : undefined;
  const gamePlayers = [playerX, playerO].filter((p): p is Player => !!p);

  const isPlayerTurn = 
    (game.currentPlayer === "X" && game.playerX === currentPlayer._id) ||
    (game.currentPlayer === "O" && game.playerO === currentPlayer._id);
  const isInGame = game.playerX === currentPlayer._id || game.playerO === currentPlayer._id;
  const canJoin = game.status === "waiting" && !isInGame && (!game.playerX || !game.playerO);

  if (!players) return <div>Loading...</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-8">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg p-8">
          <div className="flex justify-between items-center mb-8">
            <Button
              variant="secondary"
              onClick={onBack}
              className="flex items-center gap-2"
            >
              <span className="text-lg">←</span> Back to Games
            </Button>
            <div className="text-lg font-semibold text-indigo-600">
              Game #{game._id.slice(0, 8)}
              <span
                className={`px-3 py-1 rounded-full text-sm font-medium ml-2 ${
                  game.status === "waiting"
                    ? "bg-yellow-100 text-yellow-700"
                    : game.status === "playing"
                    ? "bg-green-100 text-green-700"
                    : "bg-gray-100 text-gray-700"
                }`}
              >
                {game.status.charAt(0).toUpperCase() + game.status.slice(1)}
              </span>
            </div>
          </div>

          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">
              Players
            </h2>
            <div className="space-y-3">
              {gamePlayers.map(player => (
                <div
                  key={player._id}
                  className={`p-3 rounded-lg transition-all duration-300 ${
                    (game.currentPlayer === "X" && game.playerX === player._id) ||
                    (game.currentPlayer === "O" && game.playerO === player._id)
                      ? "bg-indigo-100 border-l-4 border-indigo-500"
                      : "bg-gray-50"
                  }`}
                >
                  <span className="font-medium text-gray-800">
                    {player.name}
                  </span>
                  {player._id === currentPlayer._id && (
                    <span className="ml-2 text-sm text-indigo-600">(You)</span>
                  )}
                  {(game.currentPlayer === "X" && game.playerX === player._id) ||
                   (game.currentPlayer === "O" && game.playerO === player._id) && (
                    <span className="ml-2 text-sm text-green-600 animate-bounce-slow">
                      Current Turn
                    </span>
                  )}
                </div>
              ))}
              {game.status === "waiting" && (
                <div className="p-3 rounded-lg bg-yellow-50 border-l-4 border-yellow-500 flex justify-between items-center">
                  <span className="font-medium text-yellow-700">
                    Waiting for second player...
                  </span>
                  <Button
                    variant="success"
                    onClick={onAddAI}
                    className="py-1 px-4 text-sm"
                  >
                    Add AI Player
                  </Button>
                </div>
              )}
            </div>
          </div>

          {canJoin && (
            <div className="text-center mb-8">
              <Button onClick={onJoin}>Join Game</Button>
            </div>
          )}

          <div className="grid grid-cols-3 gap-4 mb-8">
            {game.board.map((cell, index) => (
              <button
                key={index}
                onClick={() =>
                  isPlayerTurn &&
                  cell === "" &&
                  game.status === "playing" &&
                  onMove(index)
                }
                disabled={!isPlayerTurn || cell !== "" || game.status !== "playing"}
                className={`h-24 text-4xl font-bold rounded-lg transition-all duration-200 ${
                  cell === "" && game.status === "playing" && isPlayerTurn
                    ? "bg-gray-50 hover:bg-indigo-50 hover:shadow-md"
                    : "bg-gray-50"
                } flex items-center justify-center ${
                  cell === "X" ? "text-indigo-600" : "text-pink-500"
                }`}
              >
                {cell}
              </button>
            ))}
          </div>

          {game.status === "finished" && (
            <div className="text-center text-xl font-semibold p-4 bg-indigo-50 rounded-lg">
              {game.winner ? (
                <div className="text-indigo-600">
                  Winner:{" "}
                  <span className="font-bold">
                    {game.winner === "X" 
                      ? playerX?.name 
                      : game.winner === "O" 
                      ? playerO?.name 
                      : "Draw"}
                  </span>
                </div>
              ) : (
                <div className="text-gray-600">It's a draw!</div>
              )}
            </div>
          )}

          {game.status === "playing" && (
            <div className="text-center text-gray-600 p-4 bg-gray-50 rounded-lg">
              {isPlayerTurn ? (
                <span className="text-green-600 font-medium">
                  It's your turn!
                </span>
              ) : (
                "Waiting for opponent..."
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
