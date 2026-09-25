import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("React ErrorBoundary caught an error:", error, errorInfo);
    this.setState({ error, errorInfo });
  }

  handleClearAndReload = () => {
    try {
      localStorage.clear();
      sessionStorage.clear();
    } catch {}
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: "100vh",
          width: "100vw",
          backgroundColor: "#070B12",
          color: "#F8FAFC",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "24px",
          fontFamily: "system-ui, -apple-system, sans-serif"
        }}>
          <div style={{
            maxWidth: "680px",
            width: "100%",
            backgroundColor: "#0F172A",
            border: "1px solid #E11D48",
            borderRadius: "12px",
            padding: "24px",
            boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.7)"
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "12px" }}>
              <span style={{ fontSize: "20px" }}>⚠️</span>
              <h2 style={{ color: "#F43F5E", fontSize: "17px", fontWeight: "bold", margin: 0 }}>
                Помилка запуску Astryx Legal Cockpit
              </h2>
            </div>
            <p style={{ color: "#94A3B8", fontSize: "13px", margin: "0 0 16px 0", lineHeight: 1.5 }}>
              Під час ініціалізації компонентів виникла помилка. Ви можете очистити локальний кеш та перезавантажити інтерфейс:
            </p>
            <div style={{
              backgroundColor: "#05080E",
              border: "1px solid #1E293B",
              borderRadius: "6px",
              padding: "12px",
              fontFamily: "monospace",
              fontSize: "12px",
              color: "#FCA5A5",
              overflowX: "auto",
              marginBottom: "16px",
              whiteSpace: "pre-wrap",
              maxHeight: "200px"
            }}>
              {this.state.error?.toString()}
              {this.state.errorInfo?.componentStack}
            </div>
            <div style={{ display: "flex", gap: "12px" }}>
              <button
                onClick={this.handleClearAndReload}
                style={{
                  backgroundColor: "#2563EB",
                  color: "#FFFFFF",
                  border: "none",
                  borderRadius: "6px",
                  padding: "8px 16px",
                  fontSize: "13px",
                  fontWeight: "bold",
                  cursor: "pointer"
                }}
              >
                Очистити кеш та перезавантажити
              </button>
              <button
                onClick={() => this.setState({ hasError: false, error: null, errorInfo: null })}
                style={{
                  backgroundColor: "#1E293B",
                  color: "#94A3B8",
                  border: "1px solid #334155",
                  borderRadius: "6px",
                  padding: "8px 16px",
                  fontSize: "13px",
                  cursor: "pointer"
                }}
              >
                Спробувати знову
              </button>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

// Global window error listener for non-React uncaught script errors
window.addEventListener("error", (event) => {
  console.error("Global uncaught error:", event.error);
  const root = document.getElementById("root");
  if (root && root.children.length === 0) {
    root.innerHTML = `
      <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;height:100vh;background:#070B12;color:#F8FAFC;font-family:sans-serif;padding:24px;text-align:center;">
        <h2 style="color:#F43F5E;font-size:18px;margin-bottom:8px;">Erreur de chargement du Cockpit Avocat</h2>
        <p style="color:#94A3B8;font-size:13px;max-width:500px;margin-bottom:16px;">${event.error?.message || "Erreur d'initialisation"}</p>
        <button onclick="localStorage.clear();location.reload();" style="background:#141E34;color:#F59E0B;border:1px solid rgba(245,158,11,0.5);padding:8px 16px;border-radius:4px;cursor:pointer;font-family:monospace;font-weight:bold;">Réinitialiser et recharger</button>
      </div>
    `;
  }
});

function mountApp() {
  let rootElement = document.getElementById("root");
  if (!rootElement) {
    rootElement = document.createElement("div");
    rootElement.id = "root";
    rootElement.className = "h-full w-full";
    document.body.appendChild(rootElement);
  }

  try {
    const root = ReactDOM.createRoot(rootElement);
    root.render(
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    );
  } catch (err: any) {
    console.error("Fatal mounting error:", err);
    if (rootElement) {
      rootElement.innerHTML = `
        <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;height:100vh;background:#070B12;color:#F8FAFC;font-family:sans-serif;padding:24px;text-align:center;">
          <h2 style="color:#F43F5E;font-size:18px;margin-bottom:8px;">Помилка монтування інтерфейсу</h2>
          <p style="color:#94A3B8;font-size:13px;max-width:500px;margin-bottom:16px;">${err?.message || "Fatal error"}</p>
          <button onclick="localStorage.clear();location.reload();" style="background:#2563EB;color:#FFF;border:none;padding:8px 16px;border-radius:4px;cursor:pointer;font-family:sans-serif;font-weight:bold;">Перезавантажити</button>
        </div>
      `;
    }
  }
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", mountApp);
} else {
  mountApp();
}
