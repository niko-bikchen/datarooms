import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import { registerSeed } from "@/lib/seed";

import App from "./App.tsx";

import "./index.css";

registerSeed();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
