import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { ErrorBoundary } from "@/components/ErrorBoundary";

function Bomb() {
  throw new Error("test error");
}

describe("ErrorBoundary", () => {
  it("renders children when there is no error", () => {
    render(
      <ErrorBoundary section="test">
        <div>content</div>
      </ErrorBoundary>
    );
    expect(screen.getByText("content")).toBeInTheDocument();
  });

  it("renders fallback UI when a child throws", () => {
    // Suppress expected console.error from React's error boundary
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    render(
      <ErrorBoundary section="TestSection">
        <Bomb />
      </ErrorBoundary>
    );
    expect(screen.getByText(/TestSection/i)).toBeInTheDocument();
    spy.mockRestore();
  });
});
