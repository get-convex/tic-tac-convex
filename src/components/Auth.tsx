import { useState } from "react";
import { Button } from "./common/Button";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";

type AuthProps = {
  onAuth: (playerId: Id<"players">) => void;
};

export function Auth({ onAuth }: AuthProps) {
  const [name, setName] = useState("");
  const createPlayer = useMutation(api.players.create);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      const playerId = await createPlayer({ name: name.trim(), kind: "human" });
      onAuth(playerId);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-md">
        <h1 className="text-2xl font-bold text-gray-800 mb-6 text-center">
          Welcome to Tic-Tac-Toe
        </h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Your Name
            </label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Enter your name"
              required
            />
          </div>
          <Button type="submit" disabled={!name.trim()}>
            Start Playing
          </Button>
        </form>
      </div>
    </div>
  );
}
