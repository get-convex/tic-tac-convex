import { useParams, useNavigate } from "react-router-dom";
import { useGame } from "../hooks/useGame";
import { Button } from "./ui/button";
import { Id } from "../../convex/_generated/dataModel";
import { useLocalStorage } from "../hooks/useLocalStorage";
import { Player } from "../types";

export function Game() {
  const { gameId } = useParams();
  const navigate = useNavigate();
  const [player] = useLocalStorage<Player>("player", null);
  const { game, makeMove } = useGame(gameId as Id<"games">);

  if (!player) {
    navigate("/");
    return null;
  }

  if (!game) return <div>Loading...</div>;

  const handleMove = async (position: number) => {
    if (game.currentPlayer === player.id) {
      await makeMove(game.id, player, position);
    }
  };

  const getGameStatus = () => {
    if (game.winner) return `Winner: ${game.winner}`;
    if (game.state === "finished") return "Game is a draw!";
    if (game.state === "waiting") return "Waiting for player to join...";
    return `Current player: ${game.currentPlayer}`;
  };

  return (
    <div className="max-w-md mx-auto p-4 space-y-4">
      <div className="text-xl font-bold text-center">{getGameStatus()}</div>

      <div className="grid grid-cols-3 gap-2">
        {game.board.map((cell, index) => (
          <Button
            key={index}
            className="h-24 text-4xl"
            variant={cell ? "default" : "outline"}
            disabled={
              !!cell ||
              game.state !== "playing" ||
              game.currentPlayer !== player.id
            }
            onClick={() => handleMove(index)}
          >
            {cell}
          </Button>
        ))}
      </div>

      <div className="text-center space-y-2">
        <div>Players:</div>
        {game.players.map((p, index) => (
          <div
            key={p.id}
            className={game.currentPlayer === p.id ? "font-bold" : ""}
          >
            Player {index + 1}: {p.name}{" "}
            {game.currentPlayer === p.id ? "(Current)" : ""}
            {p.id === player.id ? " (You)" : ""}
          </div>
        ))}
      </div>
    </div>
  );
}
