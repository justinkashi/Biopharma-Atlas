import { useEffect, useState, useCallback } from "react";
import { Command } from "cmdk";
import { useLocation } from "wouter";
import {
  modalityKeys, milestoneEvents, sponsorData,
  targetClassData, organSystemData
} from "@/data/pipelineData";

// Build a flat searchable index from all data sources
const NAV_RESULTS = [
  { id: "nav-/", label: "Overview", description: "KPIs, modality trends, trial counts", path: "/" },
  { id: "nav-/timeline", label: "Modality Timeline", description: "FDA approvals by drug class (2000–2025)", path: "/timeline" },
  { id: "nav-/funnel", label: "Pipeline Funnel", description: "Phase attrition and success rates", path: "/funnel" },
  { id: "nav-/bodymap", label: "Body Map", description: "Anatomical organ view with trial data", path: "/bodymap" },
  { id: "nav-/heatmap", label: "Target Heatmap", description: "Drug target activity 2005–2025", path: "/heatmap" },
  { id: "nav-/sponsors", label: "Sponsors", description: "Big Pharma vs. Biotech pipeline breakdown", path: "/sponsors" },
  { id: "nav-/signals", label: "Investment Signals", description: "Pipeline density and catalyst scoring", path: "/signals" },
  { id: "nav-/pitch", label: "Stock Pitch", description: "Investor analysis deck", path: "/pitch" },
  { id: "nav-/deals", label: "Deal Flow / M&A", description: "Acquisition trends and targets", path: "/deals" },
  { id: "nav-/scenarios", label: "Scenario Builder", description: "Pipeline valuation what-if analysis", path: "/scenarios" },
  { id: "nav-/regulatory", label: "Regulatory Tracker", description: "PDUFA dates and AdCom meetings", path: "/regulatory" },
  { id: "nav-/patents", label: "Patent Cliff", description: "Patent expiration roadmap", path: "/patents" },
  { id: "nav-/encyclopedia", label: "Drug Encyclopedia", description: "Detailed drug and modality reference", path: "/encyclopedia" },
  { id: "nav-/news", label: "Catalyst Feed", description: "Industry news and updates", path: "/news" },
];

const MODALITY_RESULTS = modalityKeys.map(mk => ({
  id: `modality-${mk.key}`,
  label: mk.label,
  description: "Drug modality",
  path: "/timeline",
  color: mk.color,
}));

const MILESTONE_RESULTS = milestoneEvents.map((m, i) => ({
  id: `milestone-${i}`,
  label: m.event,
  description: `${m.year} · ${m.category}`,
  path: "/timeline",
  color: undefined,
}));

const SPONSOR_RESULTS = sponsorData.map(s => ({
  id: `sponsor-${s.name}`,
  label: s.name,
  description: `${s.type} · ${s.focus}`,
  path: "/sponsors",
  color: undefined,
}));

const TARGET_RESULTS = targetClassData.map(t => ({
  id: `target-${t.targetClass}`,
  label: t.targetClass,
  description: t.description?.slice(0, 80) ?? "Drug target class",
  path: "/heatmap",
  color: undefined,
}));

const ORGAN_RESULTS = Object.entries(organSystemData).map(([key, data]) => ({
  id: `organ-${key}`,
  label: data.name,
  description: `${data.trials.toLocaleString()} trials`,
  path: "/bodymap",
  color: undefined,
}));

interface Result {
  id: string;
  label: string;
  description: string;
  path: string;
  color?: string;
}

const GROUPS: { label: string; results: Result[] }[] = [
  { label: "Pages", results: NAV_RESULTS },
  { label: "Drug Modalities", results: MODALITY_RESULTS },
  { label: "Milestones", results: MILESTONE_RESULTS },
  { label: "Sponsors", results: SPONSOR_RESULTS },
  { label: "Target Classes", results: TARGET_RESULTS },
  { label: "Organ Systems", results: ORGAN_RESULTS },
];

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [, navigate] = useLocation();

  const handleOpen = useCallback(() => setOpen(true), []);

  // Ctrl/Cmd + K
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen(o => !o);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  const handleSelect = (path: string) => {
    navigate(path);
    setOpen(false);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh]">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={() => setOpen(false)}
      />

      {/* Panel */}
      <div
        className="relative w-full max-w-xl mx-4 rounded-xl border shadow-2xl overflow-hidden"
        style={{ background: "hsl(var(--card))", borderColor: "hsl(var(--border))" }}
      >
        <Command label="Global search" shouldFilter>
          {/* Search input */}
          <div className="flex items-center gap-3 px-4 py-3 border-b" style={{ borderColor: "hsl(var(--border))" }}>
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-muted-foreground flex-shrink-0">
              <circle cx="6.5" cy="6.5" r="4.5"/>
              <line x1="10" y1="10" x2="14" y2="14"/>
            </svg>
            <Command.Input
              autoFocus
              placeholder="Search pages, drugs, modalities, sponsors…"
              className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none"
            />
            <kbd className="text-[10px] text-muted-foreground border border-border rounded px-1.5 py-0.5 font-mono">ESC</kbd>
          </div>

          <Command.List className="max-h-[60vh] overflow-y-auto p-2">
            <Command.Empty className="py-6 text-center text-sm text-muted-foreground">
              No results found.
            </Command.Empty>

            {GROUPS.map(group => (
              <Command.Group key={group.label} heading={group.label}>
                <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest px-2 py-1.5 mt-1">
                  {group.label}
                </div>
                {group.results.map(result => (
                  <Command.Item
                    key={result.id}
                    value={`${result.label} ${result.description}`}
                    onSelect={() => handleSelect(result.path)}
                    className="flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer text-sm transition-colors data-[selected=true]:bg-primary/10 data-[selected=true]:text-primary hover:bg-primary/5 outline-none"
                  >
                    {result.color && (
                      <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: result.color }} />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="text-foreground text-xs font-medium truncate">{result.label}</div>
                      <div className="text-muted-foreground text-[10px] truncate">{result.description}</div>
                    </div>
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-muted-foreground flex-shrink-0 opacity-0 group-data-[selected]:opacity-100">
                      <polyline points="2,6 10,6 7,3"/><polyline points="7,9 10,6"/>
                    </svg>
                  </Command.Item>
                ))}
              </Command.Group>
            ))}
          </Command.List>

          {/* Footer */}
          <div className="px-4 py-2 border-t flex items-center gap-4 text-[10px] text-muted-foreground" style={{ borderColor: "hsl(var(--border))" }}>
            <span><kbd className="border border-border rounded px-1 py-0.5 font-mono mr-1">↑↓</kbd> navigate</span>
            <span><kbd className="border border-border rounded px-1 py-0.5 font-mono mr-1">↵</kbd> go</span>
            <span><kbd className="border border-border rounded px-1 py-0.5 font-mono mr-1">ESC</kbd> close</span>
          </div>
        </Command>
      </div>
    </div>
  );
}
