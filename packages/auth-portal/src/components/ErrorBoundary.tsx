import React from "react";

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error("[fairflow] Uncaught error:", error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-[var(--ff-bg)]">
          <div className="text-center max-w-md px-6">
            <h1 className="text-2xl font-semibold text-[var(--ff-ink)] mb-3">
              Something went wrong
            </h1>
            <p className="text-[var(--ff-ink-muted)] mb-6 text-sm">
              {this.state.error?.message || "An unexpected error occurred."}
            </p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => this.setState({ hasError: false, error: null })}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-sm transition"
              >
                Try again
              </button>
              <button
                onClick={() => (window.location.href = "/")}
                className="px-4 py-2 bg-[var(--ff-surface)] hover:brightness-95 text-[var(--ff-ink)] rounded-lg text-sm transition border border-[var(--ff-border)]"
              >
                Go home
              </button>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
