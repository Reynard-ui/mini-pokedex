import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { initSfx } from "./sfx.js";

// Retro chiptune blips on button clicks / hovers (Web Audio, no files).
initSfx();

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>
);