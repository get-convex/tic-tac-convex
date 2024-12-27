import { useState } from "react";
import { Button } from "./common/Button";

type AuthProps = {
  onAuth: (name: string) => void;
};

export function Auth({ onAuth }: AuthProps) {
  const [name, setName] = useState("");

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white p-8 rounded-xl shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">
          Welcome to Tic-Tac-Toe
        </h1>
        <div className="space-y-4">
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-gray-700"
            >
              Your Name
            </label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              placeholder="Enter your name"
            />
          </div>
          <Button
            variant="primary"
            onClick={() => name.trim() && onAuth(name.trim())}
            disabled={!name.trim()}
            className="w-full"
          >
            Start Playing
          </Button>
        </div>
      </div>
    </div>
  );
}
