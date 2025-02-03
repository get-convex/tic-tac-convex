import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import { RouteProvider } from "./routes";
import { ConvexProvider, ConvexReactClient } from "convex/react";

const convex = new ConvexReactClient(import.meta.env.VITE_CONVEX_URL);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <RouteProvider>
      <ConvexProvider client={convex}>
        <App />
      </ConvexProvider>
    </RouteProvider>
  </React.StrictMode>
);
