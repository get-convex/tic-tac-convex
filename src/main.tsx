import React from "react";
import ReactDOM from "react-dom/client";
import { ConvexProvider, ConvexReactClient } from "convex/react";
import App from "./App";
import "./index.css";
import { RouteProvider } from "./routes";
import { AuthProvider } from "./components/AuthProvider";
import { Toaster } from "react-hot-toast";

const convex = new ConvexReactClient(import.meta.env.VITE_CONVEX_URL);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ConvexProvider client={convex}>
      <AuthProvider>
        <RouteProvider>
          <App />
          <Toaster position="bottom-right" />
        </RouteProvider>
      </AuthProvider>
    </ConvexProvider>
  </React.StrictMode>
);
