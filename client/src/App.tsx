import { Switch, Route, Router } from "wouter";
import { useHashLocation } from "wouter/use-hash-location";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useState, createContext, useContext, lazy, Suspense } from "react";
import { Sidebar } from "@/components/Sidebar";
import { InfoPanel } from "@/components/InfoPanel";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import NotFound from "@/pages/not-found";

// Eagerly loaded pages (core dashboard)
import Overview from "@/pages/Overview";
import ModalityTimeline from "@/pages/ModalityTimeline";
import PipelineFunnel from "@/pages/PipelineFunnel";
import BodyMap from "@/pages/BodyMap";
import TargetHeatmap from "@/pages/TargetHeatmap";
import Sponsors from "@/pages/Sponsors";
import InvestmentSignals from "@/pages/InvestmentSignals";

// Lazy loaded pages (heavy content, loaded on demand)
const StockPitch = lazy(() => import("@/pages/StockPitch"));
const Encyclopedia = lazy(() => import("@/pages/Encyclopedia"));
const ScenarioBuilder = lazy(() => import("@/pages/ScenarioBuilder"));
const DealFlow = lazy(() => import("@/pages/DealFlow"));
const RegulatoryTracker = lazy(() => import("@/pages/RegulatoryTracker"));
const NewsFeed = lazy(() => import("@/pages/NewsFeed"));
const PatentCliff = lazy(() => import("@/pages/PatentCliff"));

// Global context for InfoPanel
interface InfoPanelContextType {
  openPanel: (modalityKey: string) => void;
}
export const InfoPanelContext = createContext<InfoPanelContextType>({
  openPanel: () => {},
});
export function useInfoPanel() {
  return useContext(InfoPanelContext);
}

function LazyFallback() {
  return (
    <div className="flex items-center justify-center h-[60vh]">
      <div className="text-center space-y-3">
        <div className="w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-sm text-muted-foreground font-mono">Loading...</p>
      </div>
    </div>
  );
}

function LazyRoute({ component: Component }: { component: React.LazyExoticComponent<() => JSX.Element> }) {
  return (
    <Suspense fallback={<LazyFallback />}>
      <Component />
    </Suspense>
  );
}

function AppRouter() {
  return (
    <Switch>
      {/* Core Dashboard */}
      <Route path="/" component={Overview} />
      <Route path="/timeline" component={ModalityTimeline} />
      <Route path="/funnel" component={PipelineFunnel} />
      <Route path="/bodymap" component={BodyMap} />
      <Route path="/heatmap" component={TargetHeatmap} />
      <Route path="/sponsors" component={Sponsors} />
      {/* Investment */}
      <Route path="/signals" component={InvestmentSignals} />
      <Route path="/pitch">{() => <LazyRoute component={StockPitch} />}</Route>
      <Route path="/deals">{() => <LazyRoute component={DealFlow} />}</Route>
      <Route path="/scenarios">{() => <LazyRoute component={ScenarioBuilder} />}</Route>
      <Route path="/regulatory">{() => <LazyRoute component={RegulatoryTracker} />}</Route>
      <Route path="/patents">{() => <LazyRoute component={PatentCliff} />}</Route>
      {/* Learning */}
      <Route path="/encyclopedia">{() => <LazyRoute component={Encyclopedia} />}</Route>
      <Route path="/news">{() => <LazyRoute component={NewsFeed} />}</Route>
      {/* Fallback */}
      <Route component={NotFound} />
    </Switch>
  );
}

function MobileHeader({ onMenuOpen }: { onMenuOpen: () => void }) {
  return (
    <header className="md:hidden flex items-center justify-between px-4 py-3 border-b border-border bg-sidebar flex-shrink-0">
      <div className="flex items-center gap-2">
        <svg width="18" height="18" viewBox="0 0 20 20" fill="none" aria-hidden="true">
          <path d="M6 2C6 2 10 5 10 10C10 15 14 18 14 18" stroke="#06b6d4" strokeWidth="1.5" strokeLinecap="round"/>
          <path d="M14 2C14 2 10 5 10 10C10 15 6 18 6 18" stroke="#6366f1" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
        <span className="text-sm font-semibold text-foreground">BioPharma Atlas</span>
      </div>
      <button
        onClick={onMenuOpen}
        aria-label="Open navigation menu"
        className="p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-sidebar-accent transition-colors"
      >
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
          <line x1="2" y1="4.5" x2="16" y2="4.5"/>
          <line x1="2" y1="9" x2="16" y2="9"/>
          <line x1="2" y1="13.5" x2="16" y2="13.5"/>
        </svg>
      </button>
    </header>
  );
}

function App() {
  const [activePanelKey, setActivePanelKey] = useState<string | null>(null);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <InfoPanelContext.Provider value={{ openPanel: setActivePanelKey }}>
          <Router hook={useHashLocation}>
            <div className="flex flex-col md:flex-row h-screen w-screen overflow-hidden bg-background">
              {/* Mobile overlay backdrop */}
              {mobileSidebarOpen && (
                <div
                  className="md:hidden fixed inset-0 bg-black/60 z-40"
                  onClick={() => setMobileSidebarOpen(false)}
                />
              )}
              {/* Sidebar — always visible on md+, slide-in on mobile */}
              <div className={`
                fixed inset-y-0 left-0 z-50 transition-transform duration-200 md:static md:translate-x-0
                ${mobileSidebarOpen ? "translate-x-0" : "-translate-x-full"}
              `}>
                <Sidebar onNavigate={() => setMobileSidebarOpen(false)} />
              </div>
              {/* Main content */}
              <div className="flex flex-col flex-1 overflow-hidden">
                <MobileHeader onMenuOpen={() => setMobileSidebarOpen(true)} />
                <main className="flex-1 overflow-y-auto overflow-x-hidden">
                  <ErrorBoundary section="App Router">
                    <AppRouter />
                  </ErrorBoundary>
                </main>
              </div>
            </div>
            <InfoPanel
              modalityKey={activePanelKey}
              onClose={() => setActivePanelKey(null)}
            />
          </Router>
        </InfoPanelContext.Provider>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
