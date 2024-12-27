import { Button } from "./common/Button";
import type { Game, Player } from "../hooks/useConvexGame";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";

type GameBoardProps = {
  game: Game;
  currentPlayer: Player;
  onMove: (index: number) => void;
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
  // Get player details for the game
  const players =
    useQuery(api.players.getMany, {
      playerIds: game.playerIds,
    }) ?? [];

  // Filter out any null players (shouldn't happen, but TypeScript wants us to check)
  const validPlayers = players.filter(
    (p): p is NonNullable<typeof p> => p !== null
  );

  const isPlayerInGame = game.playerIds.includes(currentPlayer._id);
  const isCurrentTurn = game.currentPlayerId === currentPlayer._id;
  const canMove = isPlayerInGame && isCurrentTurn && game.state === "playing";

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto space-y-8">
        <div className="flex justify-between items-center">
          <Button variant="secondary" onClick={onBack}>
            Back to Games
          </Button>
          <div className="text-gray-600">
            {game.state === "waiting" && "Waiting for opponent..."}
            {game.state === "playing" &&
              `Current turn: ${
                game.currentPlayerId === currentPlayer._id ? "You" : "Opponent"
              }`}
            {game.state === "finished" &&
              (game.winnerId
                ? `Winner: ${
                    game.winnerId === currentPlayer._id ? "You" : "Opponent"
                  }`
                : "Draw!")}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 aspect-square">
          {game.board.map((cell, index) => (
            <button
              key={index}
              onClick={() => canMove && onMove(index)}
              disabled={!canMove || cell !== ""}
              className={`bg-white rounded-xl shadow-sm aspect-square text-4xl font-bold flex items-center justify-center
                ${
                  canMove && cell === ""
                    ? "hover:bg-gray-50 cursor-pointer"
                    : "cursor-not-allowed"
                }
              `}
            >
              {cell}
            </button>
          ))}
        </div>

        {game.state === "waiting" && !isPlayerInGame && (
          <div className="flex gap-4 justify-center">
            <Button variant="primary" onClick={onJoin}>
              Join Game
            </Button>
            <Button variant="secondary" onClick={onAddAI}>
              Add AI Player
            </Button>
          </div>
        )}

        <div className="space-y-4">
          <h2 className="text-xl font-bold text-gray-900">Players</h2>
          <div className="space-y-2">
            {validPlayers.map((player) => (
              <div
                key={player._id}
                className={`p-4 rounded-lg ${
                  game.currentPlayerId === player._id
                    ? "bg-indigo-50 border-l-4 border-indigo-500"
                    : "bg-white"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-medium">{player.name}</span>
                    {player._id === currentPlayer._id && (
                      <span className="ml-2 text-sm text-indigo-600">
                        (You)
                      </span>
                    )}
                    {player.kind === "ai" && (
                      <span className="ml-2 text-sm text-purple-600">(AI)</span>
                    )}
                  </div>
                  <div className="text-sm text-gray-500">
                    {game.playerSymbols[player._id]}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
