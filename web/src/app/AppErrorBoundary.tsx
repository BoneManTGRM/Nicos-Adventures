import { Component, type ErrorInfo, type ReactNode } from "react";

type Props = { children: ReactNode };
type State = { error: Error | null; errorId: string | null };

function makeErrorId(): string {
  return `nico-error-${Date.now().toString(36)}`;
}

export class AppErrorBoundary extends Component<Props, State> {
  state: State = { error: null, errorId: null };

  static getDerivedStateFromError(error: Error): State {
    return { error, errorId: makeErrorId() };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("Nico's World recovered from an application error", error, info);
  }

  private downloadDiagnostics = () => {
    const payload = {
      format: "nicos-world-local-diagnostics-v1",
      createdAt: new Date().toISOString(),
      errorId: this.state.errorId,
      message: this.state.error?.message ?? "Unknown application error",
      stack: this.state.error?.stack ?? null,
      userAgent: navigator.userAgent,
      language: navigator.language,
      location: window.location.href,
      online: navigator.onLine,
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `${this.state.errorId ?? "nicos-world-error"}.json`;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
  };

  private reset = () => {
    this.setState({ error: null, errorId: null });
  };

  render() {
    if (!this.state.error) return this.props.children;

    return (
      <main className="app-recovery" role="alert" aria-labelledby="app-recovery-title">
        <div className="app-recovery__card">
          <span className="app-recovery__icon" aria-hidden="true">🛠️</span>
          <h1 id="app-recovery-title">Nico is repairing this page</h1>
          <p>Your saved adventures should still be in this browser. Try reopening the world. A grown-up can also download a small diagnostic file that contains no profile or creation content.</p>
          <div className="app-recovery__actions">
            <button type="button" onClick={this.reset}>Try again</button>
            <button type="button" onClick={() => window.location.reload()}>Reload the app</button>
            <button type="button" onClick={this.downloadDiagnostics}>Download diagnostics</button>
          </div>
          <small>Error reference: {this.state.errorId}</small>
        </div>
      </main>
    );
  }
}
