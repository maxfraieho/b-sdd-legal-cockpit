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

// Global error UI renderer
function renderFatalError(message: string, stack?: string) {
  const root = document.getElementById("root") || document.body;
  root.innerHTML = `
    <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;height:100vh;background:#070B12;color:#F8FAFC;font-family:system-ui,-apple-system,sans-serif;padding:24px;text-align:center;">
      <div style="max-width:600px;width:100%;background:#0F172A;border:1px solid #E11D48;border-radius:12px;padding:24px;box-shadow:0 20px 40px rgba(0,0,0,0.8);">
        <div style="display:flex;align-items:center;justify-content:center;gap:10px;margin-bottom:12px;">
          <span style="font-size:22px;">⚠️</span>
          <h2 style="color:#F43F5E;font-size:18px;margin:0;font-weight:bold;">Помилка запуску Astryx Legal Cockpit</h2>
        </div>
        <p style="color:#94A3B8;font-size:13px;margin:0 0 16px 0;line-height:1.5;">
          Виникла помилка під час ініціалізації середовища або відтворення інтерфейсу:
        </p>
        <div style="background:#05080E;border:1px solid #1E293B;border-radius:6px;padding:12px;font-family:monospace;font-size:12px;color:#FCA5A5;overflow-x:auto;margin-bottom:16px;text-align:left;white-space:pre-wrap;max-height:180px;">
          ${message}
          ${stack ? `\n\n${stack}` : ""}
        </div>
        <button onclick="try{localStorage.clear();sessionStorage.clear();}catch(e){}location.reload();" style="background:#2563EB;color:#FFF;border:none;padding:10px 20px;border-radius:6px;cursor:pointer;font-size:13px;font-weight:bold;font-family:sans-serif;">
          Очистити кеш та перезавантажити
        </button>
      </div>
    </div>
  `;
}

// Global window error listener for non-React uncaught script errors
window.addEventListener("error", (event) => {
  console.error("Global uncaught error:", event.error || event.message);
  // Only render if root has no valid app rendered
  const root = document.getElementById("root");
  if (!root || !root.querySelector("header")) {
    renderFatalError(event.error?.message || event.message || "Erreur d'initialisation du script", event.error?.stack);
  }
});

window.addEventListener("unhandledrejection", (event) => {
  console.error("Unhandled Promise Rejection:", event.reason);
});

function mountApp() {
  try {
    let rootElement = document.getElementById("root");
    if (!rootElement) {
      rootElement = document.createElement("div");
      rootElement.id = "root";
      rootElement.className = "h-full w-full";
      document.body.appendChild(rootElement);
    }

    // Clean up initial static loader before React creates root
    const loader = document.getElementById("app-initial-loader");
    if (loader && loader.parentNode === rootElement) {
      loader.remove();
    }

    const root = ReactDOM.createRoot(rootElement);
    root.render(
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    );
  } catch (err: any) {
    console.error("Fatal mounting error:", err);
    renderFatalError(err?.message || "Fatal error during ReactDOM mount", err?.stack);
  }
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", mountApp);
} else {
  mountApp();
}
