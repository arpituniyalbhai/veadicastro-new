import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Remove the app shell once React starts mounting.
const shell = document.getElementById("app-shell");
if (shell) {
  shell.style.transition = "opacity 0.2s ease";
  shell.style.opacity = "0";
  setTimeout(() => shell.remove(), 200);
}

createRoot(document.getElementById("root")!).render(<App />);
