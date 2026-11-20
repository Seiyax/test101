import { Component, type ReactNode } from "react";
import { createFileRoute } from "@tanstack/react-router";
import App from "@/spotifyman/App";

class AppBoundary extends Component<{ children: ReactNode }, { error: Error | null }> {
  state = { error: null as Error | null };

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  render() {
    if (this.state.error) {
      return (
        <main className="flex min-h-screen flex-col items-center justify-center gap-3 bg-[#121212] px-6 text-center text-white">
          <p className="text-sm text-[#b3b3b3]">{this.state.error.message}</p>
          <button
            type="button"
            className="rounded-full bg-[#1db954] px-4 py-2 text-sm font-bold text-black"
            onClick={() => this.setState({ error: null })}
          >
            Try again
          </button>
        </main>
      );
    }
    return this.props.children;
  }
}

export const Route = createFileRoute("/")({
  component: function Home() {
    return (
      <AppBoundary>
        <App />
      </AppBoundary>
    );
  },
});
