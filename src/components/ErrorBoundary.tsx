import React, { Component, ReactNode } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
  children?: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Uncaught error caught by ErrorBoundary:", error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center">
          <div className="h-14 w-14 rounded-2xl bg-destructive/10 text-destructive flex items-center justify-center mb-4 border border-destructive/20 shadow-lg">
            <AlertTriangle className="h-7 w-7" />
          </div>
          <h2 className="text-xl font-bold text-foreground mb-2">Something went wrong</h2>
          <p className="text-sm text-muted-foreground max-w-md mb-6 leading-relaxed">
            {this.state.error?.message?.includes("dynamically imported module") ||
            this.state.error?.message?.includes("Importing a module script failed")
              ? "A new version of the app or component was updated. Please refresh to load the latest version."
              : this.state.error?.message || "An unexpected error occurred while loading this page."}
          </p>
          <div className="flex items-center gap-3">
            <Button onClick={this.handleReset} className="bg-gradient-primary btn-glow font-semibold gap-2">
              <RefreshCw className="h-4 w-4" /> Reload Page
            </Button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
