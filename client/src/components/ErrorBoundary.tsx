import { Component, ReactNode, ErrorInfo } from "react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  section?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error(`[ErrorBoundary] ${this.props.section ?? "Section"} threw:`, error, info.componentStack);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;

      return (
        <div
          className="rounded-xl border p-6 flex flex-col items-start gap-3"
          style={{ background: "#141720", borderColor: "#f43f5e30" }}
          data-testid="error-boundary-fallback"
        >
          <div className="flex items-center gap-2">
            <div
              className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
              style={{ background: "#f43f5e20", color: "#f43f5e", border: "1px solid #f43f5e40" }}
            >
              !
            </div>
            <span className="text-sm font-semibold" style={{ color: "#f43f5e" }}>
              {this.props.section ? `${this.props.section} failed to render` : "Section render error"}
            </span>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            An unexpected error occurred in this section. The rest of the app is unaffected.
            {this.state.error && (
              <span className="block mt-1 font-mono text-[10px] opacity-60 break-all">
                {this.state.error.message}
              </span>
            )}
          </p>
          <button
            onClick={this.handleReset}
            data-testid="error-boundary-retry"
            className="text-[10px] px-2.5 py-1 rounded border transition-colors hover:opacity-80"
            style={{ color: "#06b6d4", borderColor: "#06b6d430", background: "#06b6d410" }}
          >
            Retry
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
