import { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  zoneName: string;
  children: ReactNode;
  fallbackMessage?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * AstryxZoneBoundary: Fault-isolation boundary for workbench zones (INV-FE3).
 * Prevents errors in visual canvas or sidebars from crashing the entire workbench.
 */
export class AstryxZoneBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error(`[AstryxZoneBoundary: ${this.props.zoneName}] error caught:`, error, errorInfo);
  }

  private handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="h-full w-full flex flex-col items-center justify-center p-6 bg-[#070B12] border border-rose-500/20 text-center rounded-lg">
          <div className="p-3 bg-rose-500/10 rounded-full text-rose-400 mb-3">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-semibold text-white font-mono mb-1">
            Erreur de zone : {this.props.zoneName}
          </h3>
          <p className="text-xs text-slate-400 max-w-sm mb-4">
            {this.props.fallbackMessage || this.state.error?.message || 'Une erreur inattendue est survenue dans cette zone.'}
          </p>
          <button
            onClick={this.handleRetry}
            className="flex items-center gap-2 px-3 py-1.5 bg-[#141E34] hover:bg-[#1C2B49] text-xs font-mono text-slate-200 border border-[#1E2D4A] rounded transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Réinitialiser la zone</span>
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
