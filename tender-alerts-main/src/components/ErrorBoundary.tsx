import { Component, type ReactNode } from "react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError && this.state.error) {
      return (
        <div
          style={{
            minHeight: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 24,
            fontFamily: "system-ui, sans-serif",
            background: "#f4f4f5",
            color: "#18181b",
          }}
        >
          <div style={{ maxWidth: 480, textAlign: "center" }}>
            <h1 style={{ fontSize: 20, fontWeight: 600, marginBottom: 12 }}>
              Noe gikk galt
            </h1>
            <p style={{ color: "#71717a", marginBottom: 16 }}>
              {this.state.error.message}
            </p>
            <p style={{ fontSize: 14, color: "#71717a", marginBottom: 24 }}>
              Har du laget en <code style={{ background: "#e4e4e7", padding: "2px 6px", borderRadius: 4 }}>.env</code> fil med{" "}
              <code style={{ background: "#e4e4e7", padding: "2px 6px", borderRadius: 4 }}>VITE_SUPABASE_URL</code> og{" "}
              <code style={{ background: "#e4e4e7", padding: "2px 6px", borderRadius: 4 }}>VITE_SUPABASE_ANON_KEY</code>?
              Se SUPABASE-ENKEL-GUIDE.md Steg 3.
            </p>
            <button
              type="button"
              onClick={() => this.setState({ hasError: false, error: null })}
              style={{
                padding: "10px 20px",
                background: "#3b82f6",
                color: "white",
                border: "none",
                borderRadius: 8,
                fontWeight: 500,
                cursor: "pointer",
              }}
            >
              Prøv igjen
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
