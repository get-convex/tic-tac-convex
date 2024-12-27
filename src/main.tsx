import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import { RouteProvider } from "./routes";
import { App } from "./App";
import { ConvexProvider, ConvexReactClient } from "convex/react";

const convex = new ConvexReactClient(import.meta.env.VITE_CONVEX_URL);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ConvexProvider client={convex}>
      <RouteProvider>
        <App />
      </RouteProvider>
    </ConvexProvider>
  </React.StrictMode>
);
