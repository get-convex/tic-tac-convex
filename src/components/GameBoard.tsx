import { useQuery, useMutation } from "convex/react"
import { api } from "../../convex/_generated/api"
import { Id } from "../../convex/_generated/dataModel"
import { Button } from "./common/Button"

type GameBoardProps = {
  gameId: Id<"games">
  currentPlayer: {
    _id: Id<"players">
    name: string
    kind: "human" | "ai"
  }
  onMove: (index: number) => void
  onJoin: () => void
  onBack: () => void
}

export function GameBoard({
  gameId,
  currentPlayer,
  onMove,
  onJoin,
  onBack,
}: GameBoardProps) {
  const game = useQuery(api.games.get, { id: gameId })
  const players = useQuery(api.players.getMultiple, game ? { ids: game.players } : "skip")
  const createAI = useMutation(api.players.create)
  const joinGame = useMutation(api.games.join)

  if (!game || !players) return null

  const isPlayerTurn = game.currentPlayer === currentPlayer._id
  const isInGame = game.players.includes(currentPlayer._id)
  const canJoin = game.state === "waiting" && !isInGame && game.players.length < 2

  const handleAddAI = async () => {
    const aiPlayer = await createAI({
      name: "AI Player",
      kind: "ai"
    })
    await joinGame({
      gameId,
      playerId: aiPlayer
    })
  }

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
              {players.map(player => (
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
                  {player._id === currentPlayer._id && (
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
                    onClick={handleAddAI}
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
                    {players.find(p => p._id === game.winner)?.name}
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
  )
}
