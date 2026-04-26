import React from "react";
import { render } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";

// Provide required contexts
import { InfoPanelContext } from "@/App";

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <InfoPanelContext.Provider value={{ openPanel: vi.fn() }}>
    {children}
  </InfoPanelContext.Provider>
);

// Polyfill IntersectionObserver for jsdom
(globalThis as any).IntersectionObserver = class {
  observe() {}
  unobserve() {}
  disconnect() {}
};

// Mock recharts to avoid SVG/canvas issues in jsdom
vi.mock("recharts", () => {
  const Passthrough = ({ children }: any) => <div>{children}</div>;
  const Null = () => null;
  return {
    ResponsiveContainer: Passthrough,
    AreaChart: Passthrough,
    BarChart: Passthrough,
    LineChart: Passthrough,
    ComposedChart: Passthrough,
    PieChart: Passthrough,
    RadarChart: Passthrough,
    ScatterChart: Passthrough,
    FunnelChart: Passthrough,
    Area: Null,
    Bar: Null,
    Line: Null,
    Pie: Null,
    Cell: Null,
    Radar: Null,
    Scatter: Null,
    Funnel: Null,
    LabelList: Null,
    Label: Null,
    XAxis: Null,
    YAxis: Null,
    ZAxis: Null,
    CartesianGrid: Null,
    Tooltip: Null,
    Legend: Null,
    ReferenceLine: Null,
    ReferenceDot: Null,
    PolarGrid: Null,
    PolarAngleAxis: Null,
    PolarRadiusAxis: Null,
    defs: Null,
    linearGradient: Null,
    stop: Null,
  };
});

// Mock framer-motion to avoid animation issues in jsdom
vi.mock("framer-motion", async () => {
  const tags = ["div", "p", "span", "h1", "h2", "h3", "h4", "section", "article", "ul", "li", "tr", "td", "th", "button", "a", "img", "svg", "path"];
  const motion: Record<string, any> = {};
  for (const tag of tags) {
    motion[tag] = ({ children, initial, animate, exit, transition, variants, whileHover, whileTap, layout, layoutId, ...props }: any) =>
      tag === "img" || tag === "path"
        ? React.createElement(tag, props)
        : React.createElement(tag, props, children);
  }
  return {
    motion,
    AnimatePresence: ({ children }: any) => children,
    useInView: () => true,
    useAnimation: () => ({ start: vi.fn() }),
  };
});

describe("Page smoke tests", () => {
  it("Overview renders without throwing", async () => {
    const { default: Page } = await import("@/pages/Overview");
    expect(() => render(<Page />, { wrapper })).not.toThrow();
  });

  it("ModalityTimeline renders without throwing", async () => {
    const { default: Page } = await import("@/pages/ModalityTimeline");
    expect(() => render(<Page />, { wrapper })).not.toThrow();
  });

  it("PipelineFunnel renders without throwing", async () => {
    const { default: Page } = await import("@/pages/PipelineFunnel");
    expect(() => render(<Page />, { wrapper })).not.toThrow();
  });

  it("TargetHeatmap renders without throwing", async () => {
    const { default: Page } = await import("@/pages/TargetHeatmap");
    expect(() => render(<Page />, { wrapper })).not.toThrow();
  });

  it("Sponsors renders without throwing", async () => {
    const { default: Page } = await import("@/pages/Sponsors");
    expect(() => render(<Page />, { wrapper })).not.toThrow();
  });

  it("InvestmentSignals renders without throwing", async () => {
    const { default: Page } = await import("@/pages/InvestmentSignals");
    expect(() => render(<Page />, { wrapper })).not.toThrow();
  });

  it("StockPitch renders without throwing", async () => {
    const { default: Page } = await import("@/pages/StockPitch");
    expect(() => render(<Page />, { wrapper })).not.toThrow();
  });

  it("DealFlow renders without throwing", async () => {
    const { default: Page } = await import("@/pages/DealFlow");
    expect(() => render(<Page />, { wrapper })).not.toThrow();
  });

  it("ScenarioBuilder renders without throwing", async () => {
    const { default: Page } = await import("@/pages/ScenarioBuilder");
    expect(() => render(<Page />, { wrapper })).not.toThrow();
  });

  it("RegulatoryTracker renders without throwing", async () => {
    const { default: Page } = await import("@/pages/RegulatoryTracker");
    expect(() => render(<Page />, { wrapper })).not.toThrow();
  });

  it("PatentCliff renders without throwing", async () => {
    const { default: Page } = await import("@/pages/PatentCliff");
    expect(() => render(<Page />, { wrapper })).not.toThrow();
  });

  it("Encyclopedia renders without throwing", async () => {
    const { default: Page } = await import("@/pages/Encyclopedia");
    expect(() => render(<Page />, { wrapper })).not.toThrow();
  });

  it("NewsFeed renders without throwing", async () => {
    const { default: Page } = await import("@/pages/NewsFeed");
    expect(() => render(<Page />, { wrapper })).not.toThrow();
  });

  it("NotFound renders without throwing", async () => {
    const { default: Page } = await import("@/pages/not-found");
    expect(() => render(<Page />, { wrapper })).not.toThrow();
  });
});
