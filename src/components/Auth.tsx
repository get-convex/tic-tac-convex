import * as React from "react";
import { Button } from "./common/Button";
import type { Player } from "../types";

interface AuthProps {
  onAuth: (name: string) => Promise<Player>;
}

export function Auth({ onAuth }: AuthProps) {
  const [name, setName] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsLoading(true);
    try {
      await onAuth(name.trim());
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-md">
        <h1 className="text-2xl font-bold text-center mb-6 text-indigo-600">
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
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Enter your name"
              disabled={isLoading}
            />
          </div>
          <Button
            type="submit"
            disabled={!name.trim() || isLoading}
            className="w-full"
          >
            {isLoading ? "Creating Player..." : "Start Playing"}
          </Button>
        </form>
      </div>
    </div>
  );
}
