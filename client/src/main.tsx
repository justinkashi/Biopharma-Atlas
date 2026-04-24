import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Apply dark class to HTML element (dark-only app)
document.documentElement.classList.add("dark");

if (!window.location.hash) {
  window.location.hash = "#/";
}

createRoot(document.getElementById("root")!).render(<App />);
