import { Auth } from "./components/Auth";
import { GameList } from "./components/GameList";
import { GameBoard } from "./components/GameBoard";
import { useRoute, routes } from "./routes";
import { Redirect } from "./components/common/Redirect";
import { useQuery, useMutation } from "convex/react";
import { api } from "../convex/_generated/api";
import { Id } from "../convex/_generated/dataModel";

export type Player = {
  _id: Id<"players">;
  _creationTime: number;
  name: string;
  type: "human" | "ai";
};

export type Game = {
  _id: Id<"games">;
  _creationTime: number;
  board: Array<"X" | "O" | "">;
  currentPlayer: "X" | "O";
  status: "waiting" | "playing" | "finished";
  winner?: "X" | "O" | "draw";
  playerX?: Id<"players">;
  playerO?: Id<"players">;
};

function App() {
  const route = useRoute();
  const players = useQuery(api.players.listPlayers);
  const games = useQuery(api.games.listGames, { status: undefined });
  const createPlayer = useMutation(api.players.createPlayer);
  const createGame = useMutation(api.games.createGame);
  const joinGame = useMutation(api.games.joinGame);
  const makeMove = useMutation(api.games.makeMove);

  const currentPlayer = players?.find(p => p.type === "human");

  if (!players || !games) return <div>Loading...</div>;

  if (!currentPlayer && route.name !== "auth")
    return <Redirect to={routes.auth} />;

  if (currentPlayer && route.name === "auth")
    return <Redirect to={routes.gameList} />;

  return (
    <>
      {route.name === "auth" && (
        <Auth
          onAuth={async name => {
            await createPlayer({ name, type: "human" });
            routes.gameList().push();
          }}
        />
      )}

      {route.name === "gameList" && currentPlayer && (
        <GameList
          games={games}
          currentPlayer={currentPlayer}
          onCreateGame={async () => {
            const gameId = await createGame();
            routes.gameBoard({ gameId }).push();
          }}
          onSelectGame={game => routes.gameBoard({ gameId: game._id }).push()}
        />
      )}

      {route.name === "gameBoard" && route.params.gameId && currentPlayer && (
        <GameBoard
          game={games.find(g => g._id === route.params.gameId)!}
          currentPlayer={currentPlayer}
          onMove={async position => {
            await makeMove({
              gameId: route.params.gameId,
              playerId: currentPlayer._id,
              position
            });
          }}
          onJoin={async () => {
            await joinGame({
              gameId: route.params.gameId,
              playerId: currentPlayer._id,
              side: "O"
            });
          }}
          onAddAI={async () => {
            const aiPlayer = await createPlayer({ name: "AI", type: "ai" });
            await joinGame({
              gameId: route.params.gameId,
              playerId: aiPlayer,
              side: "O"
            });
          }}
          onBack={() => routes.gameList().push()}
        />
      )}

      {route.name === false && <div>404 - Not Found</div>}
    </>
  );
}

export default App;
