import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";

// Global spinner animation
const style = document.createElement("style");
style.textContent = `
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { overflow: hidden; }
  @keyframes spin { to { transform: rotate(360deg); } }
  input:focus { border-color: rgba(88,101,242,0.7) !important; box-shadow: 0 0 0 3px rgba(88,101,242,0.15); }
  button:hover { filter: brightness(1.1); }
  button:active { transform: scale(0.97); }
`;
document.head.appendChild(style);

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>
);
