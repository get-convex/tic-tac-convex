import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import { RouteProvider } from "./routes";
import { ConvexClientProvider } from "./convex/ConvexClientProvider";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ConvexClientProvider>
      <RouteProvider>
        <App />
      </RouteProvider>
    </ConvexClientProvider>
  </React.StrictMode>
);
