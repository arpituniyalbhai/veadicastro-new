import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Capture traffic source on first page load
(() => {
  const params = new URLSearchParams(window.location.search);
  const utmSource = params.get("utm_source");
  if (utmSource) {
    localStorage.setItem("traffic_source", utmSource);
  } else if (!localStorage.getItem("traffic_source")) {
    localStorage.setItem("traffic_source", "organic");
  }
})();

// Remove the app shell once React starts mounting.
const shell = document.getElementById("app-shell");
if (shell) {
  shell.style.transition = "opacity 0.2s ease";
  shell.style.opacity = "0";
  setTimeout(() => shell.remove(), 200);
}

createRoot(document.getElementById("root")!).render(<App />);
