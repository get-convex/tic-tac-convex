import { useState } from "react";
import type { Player } from "../types";
import { Button } from "./common/Button";

type AuthProps = {
  onAuth: (player: Player) => void;
};

export function Auth({ onAuth }: AuthProps) {
  const [name, setName] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const player: Player = {
      name: name.trim(),
      id: crypto.randomUUID(),
      kind: "human",
    };
    onAuth(player);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50">
      <div className="bg-white p-8 rounded-xl shadow-lg w-96 transform transition-all duration-300 hover:shadow-xl">
        <h1 className="text-3xl font-bold mb-6 text-center bg-gradient-to-r from-indigo-600 to-blue-500 bg-clip-text text-transparent">
          Welcome to Tic-Tac-Convex
        </h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Enter your name
            </label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
              placeholder="Your name"
              required
            />
          </div>
          <Button type="submit" className="w-full">
            Start Playing
          </Button>
        </form>
      </div>
    </div>
  );
}
