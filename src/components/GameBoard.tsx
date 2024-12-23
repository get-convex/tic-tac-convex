import type { Game, Player } from "../types";

type GameBoardProps = {
  game: Game;
  currentPlayer: Player;
  onMove: (index: number) => void;
  onJoin: () => void;
  onBack: () => void;
};

export function GameBoard({
  game,
  currentPlayer,
  onMove,
  onJoin,
  onBack,
}: GameBoardProps) {
  const isPlayerTurn = game.currentPlayer === currentPlayer.id;
  const isInGame = game.players.some((p) => p.id === currentPlayer.id);
  const canJoin =
    game.state === "waiting" && !isInGame && game.players.length < 2;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-8">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg p-8">
          <div className="flex justify-between items-center mb-8">
            <button
              onClick={onBack}
              className="text-gray-600 hover:text-gray-800 transition-colors flex items-center gap-2"
            >
              <span className="text-lg">←</span> Back to Games
            </button>
            <div className="text-lg font-semibold text-indigo-600">
              Game #{game.id.slice(0, 8)}
            </div>
          </div>

          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">
              Players
            </h2>
            <div className="space-y-3">
              {game.players.map((player) => (
                <div
                  key={player.id}
                  className={`p-3 rounded-lg transition-all duration-300 ${
                    game.currentPlayer === player.id
                      ? "bg-indigo-100 border-l-4 border-indigo-500"
                      : "bg-gray-50"
                  }`}
                >
                  <span className="font-medium text-gray-800">
                    {player.name}
                  </span>
                  {player.id === currentPlayer.id && (
                    <span className="ml-2 text-sm text-indigo-600">(You)</span>
                  )}
                  {game.currentPlayer === player.id && (
                    <span className="ml-2 text-sm text-green-600 animate-bounce-slow">
                      Current Turn
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {canJoin ? (
            <div className="text-center mb-8">
              <button
                onClick={onJoin}
                className="bg-indigo-600 text-white py-2 px-6 rounded-lg hover:bg-indigo-700 transform hover:scale-105 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              >
                Join Game
              </button>
            </div>
          ) : null}

          <div className="grid grid-cols-3 gap-4 mb-8">
            {game.board.map((cell, index) => (
              <button
                key={index}
                onClick={() =>
                  isPlayerTurn &&
                  !cell &&
                  game.state === "playing" &&
                  onMove(index)
                }
                disabled={!isPlayerTurn || !!cell || game.state !== "playing"}
                className={`h-24 text-4xl font-bold rounded-lg transition-all duration-200 ${
                  !cell && game.state === "playing" && isPlayerTurn
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
                    {game.players.find((p) => p.id === game.winner)?.name}
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
