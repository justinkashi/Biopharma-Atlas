import { Link, useLocation } from "wouter";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const NAV_ITEMS = [
  // Pitch & Investment
  { path: "/pitch", label: "Stock Pitch", icon: "target" },
  { path: "/signals", label: "Investment Signals", icon: "trending-up" },
  { path: "/deals", label: "Deal Flow / M&A", icon: "building" },
  { path: "/scenarios", label: "Scenario Builder", icon: "activity" },
  { path: "/patents", label: "Patent Cliff", icon: "clock" },
  // Pipeline Intelligence
  { path: "/", label: "Overview", icon: "grid" },
  { path: "/timeline", label: "Modality Timeline", icon: "layers" },
  { path: "/funnel", label: "Pipeline Funnel", icon: "filter" },
  { path: "/bodymap", label: "Body Map", icon: "user" },
  { path: "/heatmap", label: "Target Heatmap", icon: "activity" },
  { path: "/sponsors", label: "Sponsors", icon: "building" },
  // Research & Learning
  { path: "/encyclopedia", label: "Drug Encyclopedia", icon: "book-open" },
  { path: "/regulatory", label: "Regulatory Tracker", icon: "clock" },
  { path: "/news", label: "Catalyst Feed", icon: "rss" },
];

const SOURCES = [
  { name: "FDA CDER/CBER", url: "https://www.fda.gov/drugs" },
  { name: "ClinicalTrials.gov", url: "https://clinicaltrials.gov" },
  { name: "ASGCT", url: "https://asgct.org" },
  { name: "BCG Biopharma Report 2024", url: "https://www.bcg.com" },
  { name: "PMC / Nature Reviews Drug Discovery", url: "https://pubmed.ncbi.nlm.nih.gov" },
];

function NavIcon({ type }: { type: string }) {
  const cls = "w-4 h-4";
  switch (type) {
    case "target":
      return <svg className={cls} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="8" cy="8" r="6"/><circle cx="8" cy="8" r="3"/><circle cx="8" cy="8" r="0.8" fill="currentColor" stroke="none"/><line x1="8" y1="1" x2="8" y2="3"/><line x1="8" y1="13" x2="8" y2="15"/><line x1="1" y1="8" x2="3" y2="8"/><line x1="13" y1="8" x2="15" y2="8"/></svg>;
    case "grid":
      return <svg className={cls} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="1" y="1" width="6" height="6" rx="1"/><rect x="9" y="1" width="6" height="6" rx="1"/><rect x="1" y="9" width="6" height="6" rx="1"/><rect x="9" y="9" width="6" height="6" rx="1"/></svg>;
    case "layers":
      return <svg className={cls} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M8 1l7 3.5L8 8 1 4.5z"/><path d="M1 8l7 3.5L15 8"/><path d="M1 11.5l7 3.5 7-3.5"/></svg>;
    case "filter":
      return <svg className={cls} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M2 3h12M4 8h8M6 13h4"/></svg>;
    case "user":
      return <svg className={cls} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="8" cy="5" r="3"/><path d="M2 14c0-3.3 2.7-6 6-6s6 2.7 6 6"/></svg>;
    case "activity":
      return <svg className={cls} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M1 8h2l2-5 3 10 2-7 2 4h3"/></svg>;
    case "building":
      return <svg className={cls} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="2" y="2" width="12" height="13" rx="1"/><path d="M5 6h2M9 6h2M5 10h2M9 10h2M6 15v-4h4v4"/></svg>;
    case "trending-up":
      return <svg className={cls} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="1 12 5.5 6.5 9 9.5 15 2.5"/><polyline points="10.5 2.5 15 2.5 15 7"/></svg>;
    case "rss":
      return <svg className={cls} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="3" cy="13" r="1" fill="currentColor" stroke="none"/><path d="M3 9a4 4 0 0 1 4 4"/><path d="M3 5a8 8 0 0 1 8 8"/></svg>;
    case "clock":
      return <svg className={cls} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="8" cy="8" r="6"/><path d="M8 5v3.5l2.5 1.5"/></svg>;
    case "book-open":
      return <svg className={cls} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3.5A1.5 1.5 0 013.5 2H8v12H3.5A1.5 1.5 0 012 12.5V3.5z"/><path d="M8 2h4.5A1.5 1.5 0 0114 3.5v9a1.5 1.5 0 01-1.5 1.5H8V2z"/></svg>;
    default:
      return null;
  }
}

function DNAIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-label="DNA Helix">
      <path d="M6 2C6 2 10 5 10 10C10 15 14 18 14 18" stroke="#06b6d4" strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M14 2C14 2 10 5 10 10C10 15 6 18 6 18" stroke="#6366f1" strokeWidth="1.5" strokeLinecap="round"/>
      <line x1="7.5" y1="5.5" x2="12.5" y2="6.5" stroke="#06b6d4" strokeWidth="1" strokeLinecap="round" opacity="0.7"/>
      <line x1="6.5" y1="9" x2="13.5" y2="9" stroke="#06b6d4" strokeWidth="1" strokeLinecap="round" opacity="0.7"/>
      <line x1="7.5" y1="12.5" x2="12.5" y2="13.5" stroke="#6366f1" strokeWidth="1" strokeLinecap="round" opacity="0.7"/>
    </svg>
  );
}

export function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  const [location] = useLocation();
  const [showSources, setShowSources] = useState(false);

  return (
    <div className="flex flex-col h-full w-56 bg-sidebar border-r border-sidebar-border flex-shrink-0">
      {/* Logo */}
      <div className="p-4 border-b border-sidebar-border">
        <div className="flex items-center gap-2">
          <DNAIcon />
          <div>
            <div className="text-sm font-semibold text-foreground tracking-tight">BioPharma Atlas</div>
            <div className="text-[10px] text-muted-foreground font-mono">Pipeline Intelligence</div>
          </div>
        </div>
      </div>

      {/* Nav items */}
      <nav className="flex-1 py-2 overflow-y-auto">
        {NAV_ITEMS.map((item) => {
          const isActive = item.path === "/" ? location === "/" : location.startsWith(item.path);
          return (
            <Link key={item.path} href={item.path} onClick={onNavigate}>
              <div
                data-testid={`nav-${item.label.toLowerCase().replace(/\s/g, "-")}`}
                className={`flex items-center gap-3 px-4 py-2.5 mx-2 rounded-md cursor-pointer transition-all duration-150 ${
                  isActive
                    ? "bg-primary/10 text-primary border border-primary/20"
                    : "text-muted-foreground hover:text-foreground hover:bg-sidebar-accent"
                }`}
              >
                <span className={isActive ? "text-primary" : ""}>
                  <NavIcon type={item.icon} />
                </span>
                <span className="text-xs font-medium">{item.label}</span>
                {isActive && (
                  <div className="ml-auto w-1 h-1 rounded-full bg-primary" />
                )}
              </div>
            </Link>
          );
        })}
      </nav>

      {/* Data freshness indicator */}
      <div className="px-4 py-2 border-t border-sidebar-border">
        <div className="flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          <span className="text-[10px] text-muted-foreground font-mono">Data as of Apr 2026</span>
        </div>
      </div>

      {/* Sources popover at bottom */}
      <div className="p-3 border-t border-sidebar-border relative">
        <button
          data-testid="btn-sources"
          onClick={() => setShowSources(!showSources)}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-md text-xs text-muted-foreground hover:text-foreground hover:bg-sidebar-accent transition-colors"
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5">
            <circle cx="6" cy="6" r="5"/>
            <line x1="6" y1="5" x2="6" y2="9"/>
            <circle cx="6" cy="3.5" r="0.5" fill="currentColor"/>
          </svg>
          <span>Data Sources</span>
        </button>

        <AnimatePresence>
          {showSources && (
            <motion.div
              initial={{ opacity: 0, y: 8, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.96 }}
              transition={{ duration: 0.15 }}
              className="absolute bottom-full left-0 right-0 mb-1 mx-3 bg-card border border-border rounded-lg p-3 shadow-xl z-50"
            >
              <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest mb-2">Data Sources</div>
              {SOURCES.map((s) => (
                <a
                  key={s.name}
                  href={s.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block text-xs text-primary hover:text-primary/80 py-1 transition-colors"
                >
                  {s.name}
                </a>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
