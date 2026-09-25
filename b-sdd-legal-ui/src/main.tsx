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
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("ErrorBoundary caught error:", error, errorInfo);
  }

  handleClear = () => {
    try {
      localStorage.clear();
      sessionStorage.clear();
    } catch {}
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen w-screen bg-[#070B12] text-slate-100 flex flex-col items-center justify-center p-6">
          <div className="max-w-lg w-full bg-[#0F172A] border border-rose-600/70 rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center space-x-2 text-rose-400 font-mono text-sm font-bold">
              <span>⚠️</span>
              <h2>Помилка завантаження Astryx Legal Cockpit</h2>
            </div>
            <p className="text-xs text-slate-300">
              {this.state.error?.message || "Виникла помилка під час рендерингу компонентів."}
            </p>
            <div className="pt-2 flex gap-3">
              <button
                onClick={this.handleClear}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold font-mono transition-colors"
              >
                Очистити локальний кеш та перезавантажити
              </button>
              <button
                onClick={() => this.setState({ hasError: false, error: null })}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-mono transition-colors"
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

const rootElement = document.getElementById("root");
if (rootElement) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <React.StrictMode>
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    </React.StrictMode>
  );
}
