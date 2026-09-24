import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";

// Global error handler to prevent silent dark screen
window.addEventListener("error", (event) => {
  console.error("Global uncaught error:", event.error);
  const root = document.getElementById("root");
  if (root && root.children.length === 0) {
    root.innerHTML = `
      <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;height:100vh;background:#070B12;color:#F8FAFC;font-family:sans-serif;padding:24px;text-align:center;">
        <h2 style="color:#F43F5E;font-size:18px;margin-bottom:8px;">Erreur de chargement du Cockpit Avocat</h2>
        <p style="color:#94A3B8;font-size:13px;max-width:500px;margin-bottom:16px;">${event.error?.message || "Erreur d'initialisation"}</p>
        <button onclick="location.reload()" style="background:#141E34;color:#F59E0B;border:1px solid rgba(245,158,11,0.5);padding:8px 16px;border-radius:4px;cursor:pointer;font-family:monospace;font-weight:bold;">Recharger l'application</button>
      </div>
    `;
  }
});

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
