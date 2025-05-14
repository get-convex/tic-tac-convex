import { createContext, useContext, ReactNode, useState, useEffect } from "react";
import { Id } from "@convex/_generated/dataModel";

type AuthContextType = {
  currentPlayerId: Id<"players"> | null;
  setCurrentPlayerId: (id: Id<"players"> | null) => void;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [currentPlayerId, setCurrentPlayerId] = useState<Id<"players"> | null>(() => {
    const saved = localStorage.getItem("currentPlayerId");
    return saved ? JSON.parse(saved) : null;
  });

  useEffect(() => {
    if (currentPlayerId) {
      localStorage.setItem("currentPlayerId", JSON.stringify(currentPlayerId));
    } else {
      localStorage.removeItem("currentPlayerId");
    }
  }, [currentPlayerId]);

  return (
    <AuthContext.Provider value={{ currentPlayerId, setCurrentPlayerId }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
