import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import { ConvexProvider, ConvexReactClient } from "convex/react";
import { RouteProvider } from "./routes";

// Create a Convex client using the environment variable provided by Vite
const convex = new ConvexReactClient(import.meta.env.VITE_CONVEX_URL);

// For debugging
console.log("Convex URL:", import.meta.env.VITE_CONVEX_URL);

const rootElement = document.getElementById("root");
if (!rootElement) throw new Error("Root element not found");

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <ConvexProvider client={convex}>
      <RouteProvider>
        <App />
      </RouteProvider>
    </ConvexProvider>
  </React.StrictMode>
);
