import * as React from "react";
import type { Game, Player } from "../types";
import { Button } from "./common/Button";

interface GameBoardProps {
  game: Game;
  currentPlayer: Player;
  onMove: (index: number) => Promise<void>;
  onJoin: () => Promise<void>;
  onAddAI: () => Promise<void>;
  onBack: () => void;
}

export function GameBoard({
  game,
  currentPlayer,
  onMove,
  onJoin,
  onAddAI,
  onBack,
}: GameBoardProps) {
  const [isLoading, setIsLoading] = React.useState(false);
  const isPlayerTurn = game.currentPlayer === currentPlayer._id;
  const isInGame = game.players.includes(currentPlayer._id);
  const canJoin =
    game.state === "waiting" && !isInGame && game.players.length < 2;

  const handleAction = async (action: () => Promise<void>) => {
    setIsLoading(true);
    try {
      await action();
    } finally {
      setIsLoading(false);
    }
  };

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
              Game #{game._id.toString().slice(0, 8)}
              <span
                className={`px-3 py-1 rounded-full text-sm font-medium ml-2 ${
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
          </div>

          {canJoin && (
            <div className="text-center mb-8">
              <Button onClick={() => handleAction(onJoin)} disabled={isLoading}>
                {isLoading ? "Joining..." : "Join Game"}
              </Button>
            </div>
          )}

          {game.state === "waiting" &&
            game.players[0] === currentPlayer._id && (
              <div className="text-center mb-8">
                <Button
                  onClick={() => handleAction(onAddAI)}
                  disabled={isLoading}
                >
                  {isLoading ? "Adding AI..." : "Add AI Player"}
                </Button>
              </div>
            )}

          <div className="grid grid-cols-3 gap-4 mb-8">
            {game.board.map((cell, index) => (
              <button
                key={index}
                onClick={() =>
                  isPlayerTurn &&
                  !cell &&
                  game.state === "playing" &&
                  handleAction(() => onMove(index))
                }
                disabled={
                  !isPlayerTurn ||
                  !!cell ||
                  game.state !== "playing" ||
                  isLoading
                }
                className={`h-24 text-4xl font-bold rounded-lg transition-all duration-200 ${
                  !cell &&
                  game.state === "playing" &&
                  isPlayerTurn &&
                  !isLoading
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

          {game.state === "finished" && (
            <div className="text-center text-xl font-semibold p-4 bg-indigo-50 rounded-lg">
              {game.winner ? (
                <div className="text-indigo-600">
                  Winner:{" "}
                  <span className="font-bold">
                    {game.winner === currentPlayer._id ? "You" : "Opponent"}
                  </span>
                </div>
              ) : (
                <div className="text-gray-600">It's a draw!</div>
              )}
            </div>
          )}

          {game.state === "playing" && (
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
