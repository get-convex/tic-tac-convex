import { Button } from "./common/Button";
import { api } from "@convex/_generated/api";
import { useQuery } from "convex/react";
import { Id } from "@convex/_generated/dataModel";
import { ConvexGame, ConvexPlayer } from "../convexSchemaTypes";
import { useState } from "react";

type GameBoardProps = {
  gameId: Id<"games">;
  currentPlayerId: Id<"players">;
  onMove: (index: number) => Promise<void>;
  onJoin: () => Promise<void>;
  onAddAI: () => Promise<void>;
  onBack: () => void;
  isLoading?: boolean;
};

export function GameBoard({
  gameId,
  currentPlayerId,
  onMove,
  onJoin,
  onAddAI,
  onBack,
  isLoading: externalLoading = false,
}: GameBoardProps) {
  const [localLoading, setLocalLoading] = useState(false);
  const game = useQuery(api.queries.getGame, { gameId });
  const currentPlayer = useQuery(api.queries.getPlayer, { playerId: currentPlayerId });

  const isLoading = externalLoading || localLoading;

  if (!game || !currentPlayer) return null;

  const isPlayerTurn = game.currentPlayer === currentPlayerId;
  const isInGame = game.players.some((p: ConvexPlayer & { symbol: "X" | "O" }) => p._id === currentPlayerId);
  const canJoin =
    game.state === "waiting" && !isInGame && game.players.length < 2;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-8">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg p-8">
          <div className="flex justify-between items-center mb-8">
            <Button
              variant="secondary"
              onClick={onBack}
              className="flex items-center gap-2"
              disabled={isLoading}
            >
              <span className="text-lg">←</span> Back to Games
            </Button>
            <div className="text-lg font-semibold text-indigo-600">
              Game #{game._id.slice(0, 8)}
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

          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">
              Players
            </h2>
            <div className="space-y-3">
              {game.players.map((player: ConvexPlayer & { symbol: "X" | "O" }) => (
                <div
                  key={player._id}
                  className={`p-3 rounded-lg transition-all duration-300 ${
                    game.currentPlayer === player._id
                      ? "bg-indigo-100 border-l-4 border-indigo-500"
                      : "bg-gray-50"
                  }`}
                >
                  <span className="font-medium text-gray-800">
                    {player.name}
                  </span>
                  {player._id === currentPlayerId && (
                    <span className="ml-2 text-sm text-indigo-600">(You)</span>
                  )}
                  {game.currentPlayer === player._id && (
                    <span className="ml-2 text-sm text-green-600 animate-bounce-slow">
                      Current Turn
                    </span>
                  )}
                </div>
              ))}
              {game.state === "waiting" && (
                <div className="p-3 rounded-lg bg-yellow-50 border-l-4 border-yellow-500 flex justify-between items-center">
                  <span className="font-medium text-yellow-700">
                    Waiting for second player...
                  </span>
                  <Button
                    variant="success"
                    onClick={async () => {
                      setLocalLoading(true);
                      try {
                        await onAddAI();
                      } finally {
                        setLocalLoading(false);
                      }
                    }}
                    className="py-1 px-4 text-sm"
                    isLoading={isLoading}
                  >
                    Add AI Player
                  </Button>
                </div>
              )}
            </div>
          </div>

          {canJoin && (
            <div className="text-center mb-8">
              <Button
                onClick={async () => {
                  setLocalLoading(true);
                  try {
                    await onJoin();
                  } finally {
                    setLocalLoading(false);
                  }
                }}
                isLoading={isLoading}
              >
                Join Game
              </Button>
            </div>
          )}

          <div className="grid grid-cols-3 gap-4 mb-8">
            {game.board.map((cell: "X" | "O" | null, index: number) => (
              <button
                key={index}
                onClick={async () => {
                  if (!isPlayerTurn || !!cell || game.state !== "playing" || isLoading) return;
                  setLocalLoading(true);
                  try {
                    await onMove(index);
                  } finally {
                    setLocalLoading(false);
                  }
                }}
                disabled={!isPlayerTurn || !!cell || game.state !== "playing" || isLoading}
                className={`h-24 text-4xl font-bold rounded-lg transition-all duration-200 ${
                  !cell && game.state === "playing" && isPlayerTurn && !isLoading
                    ? "bg-gray-50 hover:bg-indigo-50 hover:shadow-md"
                    : "bg-gray-50"
                } flex items-center justify-center ${
                  cell === "X" ? "text-indigo-600" : "text-pink-500"
                } ${isLoading ? "cursor-wait" : ""}`}
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
                    {game.players.find((p: ConvexPlayer & { symbol: "X" | "O" }) => p._id === game.winner)?.name}
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
