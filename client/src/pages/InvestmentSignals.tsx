import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  ReferenceLine,
} from "recharts";
import { DataBadge } from "@/components/DataBadge";
import {
  companyPipelines,
  catalystCalendar,
  mnaDeals,
  catalystMoves,
  approvalProbability,
  structuralTrends,
  MODALITY_COLORS,
  type Modality,
  type CompanyPipeline,
  type CatalystEvent,
} from "@/data/investmentData";

// ---- Helpers ----

function formatB(val: number): string {
  if (val >= 1000) return `$${(val / 1000).toFixed(1)}T`;
  return `$${val.toFixed(1)}B`;
}

function formatPct(val: number): string {
  return val >= 0 ? `+${val}%` : `${val}%`;
}

function getPipelineScore(c: CompanyPipeline): number {
  const weighted = c.phase3 + 0.5 * c.phase2;
  return parseFloat((weighted / c.marketCapB).toFixed(3));
}

// ---- Modality badge ----
function ModalityBadge({ modality }: { modality: Modality }) {
  const color = MODALITY_COLORS[modality] ?? "#64748b";
  return (
    <span
      className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-mono font-semibold whitespace-nowrap"
      style={{
        color,
        background: `${color}18`,
        border: `1px solid ${color}35`,
      }}
    >
      {modality}
    </span>
  );
}

// ---- Event type badge ----
const EVENT_COLORS: Record<string, string> = {
  PDUFA: "#06b6d4",
  AdCom: "#f59e0b",
  "Phase 3 Readout": "#a855f7",
};

function EventBadge({ type }: { type: string }) {
  const color = EVENT_COLORS[type] ?? "#64748b";
  return (
    <span
      className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-mono font-semibold whitespace-nowrap"
      style={{
        color,
        background: `${color}18`,
        border: `1px solid ${color}35`,
      }}
    >
      {type}
    </span>
  );
}

// ---- Section container ----
function SectionCard({
  title,
  subtitle,
  badge,
  children,
  delay = 0,
}: {
  title: string;
  subtitle?: string;
  badge?: React.ReactNode;
  children: React.ReactNode;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay, ease: [0.22, 1, 0.36, 1] }}
      className="rounded-xl border"
      style={{ background: "#111520", borderColor: "#1e2330" }}
    >
      <div className="px-5 pt-5 pb-4 border-b" style={{ borderColor: "#1e2330" }}>
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-sm font-semibold text-foreground tracking-tight">{title}</h2>
            {subtitle && (
              <p className="text-[11px] text-muted-foreground mt-0.5">{subtitle}</p>
            )}
          </div>
          {badge}
        </div>
      </div>
      <div className="p-5">{children}</div>
    </motion.div>
  );
}

// ---- Section 1: Structural Trends ----
function StructuralTrendsSection() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: 0, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-sm font-semibold text-foreground tracking-tight">
            Structural Trends
          </h2>
          <p className="text-[11px] text-muted-foreground mt-0.5">
            Macro investment themes derived from pipeline, M&A, and catalyst data
          </p>
        </div>
        <DataBadge
          confidence="composite"
          source="M&A comps, LOA data, catalyst moves"
          note="Derived from multiple data sources; see individual data points for citations"
        />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {structuralTrends.map((trend, i) => (
          <motion.div
            key={trend.id}
            data-testid={`trend-card-${trend.id}`}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.08 * i, ease: [0.22, 1, 0.36, 1] }}
            className="rounded-xl border p-5 flex flex-col gap-4"
            style={{
              background: trend.bgColor,
              borderColor: `${trend.accentColor}30`,
            }}
          >
            {/* Header */}
            <div>
              <div
                className="text-xs font-mono font-bold uppercase tracking-widest mb-1"
                style={{ color: trend.accentColor }}
              >
                {trend.title}
              </div>
              <div className="text-[11px] text-muted-foreground">{trend.subtitle}</div>
            </div>

            {/* Description */}
            <p className="text-xs text-foreground/80 leading-relaxed">{trend.description}</p>

            {/* Data points */}
            <div className="flex flex-col gap-1.5">
              {trend.dataPoints.map((dp, j) => (
                <div key={j} className="flex items-start gap-2">
                  <span
                    className="mt-0.5 w-1.5 h-1.5 rounded-full flex-shrink-0"
                    style={{ background: trend.accentColor }}
                  />
                  <span className="text-[11px] text-foreground/70 font-mono">{dp}</span>
                </div>
              ))}
            </div>

            {/* Investment implication */}
            <div
              className="rounded-lg p-3 text-[11px] leading-relaxed"
              style={{
                background: `${trend.accentColor}12`,
                borderLeft: `2px solid ${trend.accentColor}`,
                color: trend.accentColor,
              }}
            >
              <span className="font-semibold">Investment Implication: </span>
              <span className="opacity-90">{trend.investmentImplication}</span>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}

// ---- Section 2: Pipeline Density Screen ----
type SortKey =
  | "company"
  | "marketCapB"
  | "phase3"
  | "phase2"
  | "approved"
  | "performancePct"
  | "score";
type SortDir = "asc" | "desc";

function PipelineDensitySection() {
  const [sortKey, setSortKey] = useState<SortKey>("score");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [expandedTicker, setExpandedTicker] = useState<string | null>(null);

  function handleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("desc");
    }
  }

  const sorted = useMemo(() => {
    return [...companyPipelines].sort((a, b) => {
      let av: number, bv: number;
      if (sortKey === "company") {
        return sortDir === "asc"
          ? a.company.localeCompare(b.company)
          : b.company.localeCompare(a.company);
      }
      if (sortKey === "score") {
        av = getPipelineScore(a);
        bv = getPipelineScore(b);
      } else {
        av = a[sortKey] as number;
        bv = b[sortKey] as number;
      }
      return sortDir === "asc" ? av - bv : bv - av;
    });
  }, [sortKey, sortDir]);

  function SortIcon({ col }: { col: SortKey }) {
    if (sortKey !== col)
      return (
        <svg width="8" height="8" viewBox="0 0 8 8" fill="currentColor" className="opacity-30">
          <path d="M4 1l3 3H1l3-3zm0 6L1 4h6L4 7z" />
        </svg>
      );
    return (
      <svg
        width="8"
        height="8"
        viewBox="0 0 8 8"
        fill="currentColor"
        className="text-primary opacity-80"
      >
        {sortDir === "asc" ? (
          <path d="M4 1l3 3H1l3-3z" />
        ) : (
          <path d="M4 7L1 4h6L4 7z" />
        )}
      </svg>
    );
  }

  function Th({
    col,
    label,
    className = "",
  }: {
    col: SortKey;
    label: string;
    className?: string;
  }) {
    return (
      <th
        className={`text-left px-3 py-2.5 text-[10px] font-mono font-semibold uppercase tracking-widest text-muted-foreground cursor-pointer select-none hover:text-foreground transition-colors ${className}`}
        onClick={() => handleSort(col)}
      >
        <span className="flex items-center gap-1">
          {label}
          <SortIcon col={col} />
        </span>
      </th>
    );
  }

  return (
    <SectionCard
      title="Pipeline Density Screen"
      subtitle="20 public biopharma companies — sortable by any metric"
      badge={
        <DataBadge
          confidence="composite"
          source="Ozmosi Q4 2025, Pharmaceutical Technology Q3 2025, Pharm Exec 2026"
          note="Pipeline counts approximate; from public filings and analyst reports as of Q4 2025"
        />
      }
      delay={0.1}
    >
      <div className="overflow-x-auto -mx-1">
        <table
          className="w-full text-xs"
          data-testid="pipeline-density-table"
          style={{ minWidth: 820 }}
        >
          <thead>
            <tr style={{ borderBottom: "1px solid #1e2330" }}>
              <Th col="company" label="Company" />
              <th className="px-3 py-2.5 text-left text-[10px] font-mono font-semibold uppercase tracking-widest text-muted-foreground">
                Modality
              </th>
              <Th col="marketCapB" label="Mkt Cap" />
              <th className="px-3 py-2.5 text-left text-[10px] font-mono font-semibold uppercase tracking-widest text-muted-foreground">
                Ph1 / Ph2 / Ph3 / Appr
              </th>
              <th className="px-3 py-2.5 text-left text-[10px] font-mono font-semibold uppercase tracking-widest text-muted-foreground">
                Areas
              </th>
              <Th col="performancePct" label="Perf %" />
              <Th col="score" label="Pipeline Score" className="text-right" />
            </tr>
          </thead>
          <tbody>
            {sorted.map((c, i) => {
              const score = getPipelineScore(c);
              const isExpanded = expandedTicker === c.ticker;
              return (
                <>
                  <tr
                    key={c.ticker}
                    data-testid={`pipeline-row-${c.ticker}`}
                    onClick={() => setExpandedTicker(isExpanded ? null : c.ticker)}
                    className="cursor-pointer transition-colors hover:bg-white/[0.03]"
                    style={{
                      borderBottom: "1px solid #1a1f2e",
                      background: i % 2 === 0 ? "transparent" : "rgba(255,255,255,0.01)",
                    }}
                  >
                    {/* Company */}
                    <td className="px-3 py-2.5">
                      <div className="font-semibold text-foreground text-xs">{c.company}</div>
                      <div className="text-[10px] text-muted-foreground font-mono">{c.ticker}</div>
                    </td>
                    {/* Modality */}
                    <td className="px-3 py-2.5">
                      <ModalityBadge modality={c.primaryModality} />
                    </td>
                    {/* Market cap */}
                    <td className="px-3 py-2.5 font-mono text-foreground/80 whitespace-nowrap">
                      {formatB(c.marketCapB)}
                    </td>
                    {/* Pipeline bars */}
                    <td className="px-3 py-2.5">
                      <div className="flex items-center gap-1 font-mono text-[11px]">
                        <span className="text-foreground/50">{c.phase1}</span>
                        <span className="text-foreground/20">/</span>
                        <span className="text-foreground/70">{c.phase2}</span>
                        <span className="text-foreground/20">/</span>
                        <span
                          className="font-bold"
                          style={{ color: MODALITY_COLORS[c.primaryModality] }}
                        >
                          {c.phase3}
                        </span>
                        <span className="text-foreground/20">/</span>
                        <span className="text-green-400">{c.approved}</span>
                      </div>
                      {/* Mini stacked bar */}
                      <div className="mt-1 flex gap-0.5 h-1.5 rounded-full overflow-hidden w-24">
                        {[
                          { count: c.phase1, color: "#4b5563" },
                          { count: c.phase2, color: "#6b7280" },
                          {
                            count: c.phase3,
                            color: MODALITY_COLORS[c.primaryModality],
                          },
                          { count: c.approved, color: "#22c55e" },
                        ].map((seg, si) => {
                          const total = c.phase1 + c.phase2 + c.phase3 + c.approved;
                          const pct = total > 0 ? (seg.count / total) * 100 : 0;
                          return (
                            <div
                              key={si}
                              style={{ width: `${pct}%`, background: seg.color }}
                            />
                          );
                        })}
                      </div>
                    </td>
                    {/* Areas */}
                    <td className="px-3 py-2.5">
                      <div className="flex flex-wrap gap-1">
                        {c.areas.slice(0, 2).map((a) => (
                          <span
                            key={a}
                            className="text-[9px] px-1.5 py-0.5 rounded font-mono"
                            style={{
                              background: "#1e2330",
                              color: "#94a3b8",
                              border: "1px solid #2a3045",
                            }}
                          >
                            {a}
                          </span>
                        ))}
                        {c.areas.length > 2 && (
                          <span
                            className="text-[9px] px-1.5 py-0.5 rounded font-mono"
                            style={{
                              background: "#1e2330",
                              color: "#64748b",
                              border: "1px solid #2a3045",
                            }}
                          >
                            +{c.areas.length - 2}
                          </span>
                        )}
                      </div>
                    </td>
                    {/* Performance */}
                    <td
                      className="px-3 py-2.5 font-mono font-semibold whitespace-nowrap"
                      style={{ color: c.performancePct >= 0 ? "#22c55e" : "#ef4444" }}
                    >
                      {formatPct(c.performancePct)}
                    </td>
                    {/* Pipeline score */}
                    <td className="px-3 py-2.5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <div
                          className="h-1.5 rounded-full"
                          style={{
                            width: `${Math.min(score * 800, 60)}px`,
                            background: MODALITY_COLORS[c.primaryModality],
                            opacity: 0.6,
                          }}
                        />
                        <span
                          className="font-mono font-bold text-[11px] w-12 text-right"
                          style={{ color: MODALITY_COLORS[c.primaryModality] }}
                        >
                          {score.toFixed(3)}
                        </span>
                      </div>
                    </td>
                  </tr>
                  {/* Expanded row */}
                  {isExpanded && (
                    <tr
                      key={`${c.ticker}-expanded`}
                      style={{ background: "#0d111a" }}
                    >
                      <td
                        colSpan={7}
                        className="px-4 py-3"
                        style={{ borderBottom: "1px solid #1a1f2e" }}
                      >
                        <div className="flex flex-wrap gap-6 text-[11px]">
                          <div>
                            <span className="text-muted-foreground font-mono">All Areas: </span>
                            <span className="text-foreground/80">{c.areas.join(", ")}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground font-mono">Tier: </span>
                            <span className="text-foreground/80">Tier {c.tier}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground font-mono">Note: </span>
                            <span className="text-foreground/80">{c.performanceNote}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground font-mono">Pipeline Score: </span>
                            <span className="text-foreground/80">
                              (Ph3 + 0.5×Ph2) / MCap = ({c.phase3} + {(0.5 * c.phase2).toFixed(1)}) /{" "}
                              {c.marketCapB}B = {score.toFixed(3)}
                            </span>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              );
            })}
          </tbody>
        </table>
      </div>
      <div className="mt-3 text-[10px] text-muted-foreground font-mono">
        Pipeline Score = (Phase 3 programs + 0.5 × Phase 2 programs) ÷ Market Cap ($B). Higher =
        more late-stage pipeline per dollar of market cap. Click any row to expand.
      </div>
    </SectionCard>
  );
}

// ---- Section 3: Catalyst Calendar ----
function CatalystCalendarSection() {
  const [filterType, setFilterType] = useState<string>("All");

  const sorted = useMemo(() => {
    return [...catalystCalendar]
      .filter((e) => filterType === "All" || e.eventType === filterType)
      .sort((a, b) => a.sortDate.localeCompare(b.sortDate));
  }, [filterType]);

  // Group by month
  const grouped = useMemo(() => {
    const map = new Map<string, CatalystEvent[]>();
    for (const e of sorted) {
      const key = e.month;
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(e);
    }
    return map;
  }, [sorted]);

  const filterTypes = ["All", "PDUFA", "AdCom", "Phase 3 Readout"];

  return (
    <SectionCard
      title="Catalyst Calendar"
      subtitle="PDUFA dates, Advisory Committee meetings, and Phase 3 readouts for 2026"
      badge={
        <DataBadge
          confidence="composite"
          source="FDA Advisory Committee Calendar, CheckRare PDUFA tracker, BioPharma Dive 2026"
          note="Dates subject to change; PDUFA dates from public FDA filings and company disclosures"
        />
      }
      delay={0.2}
    >
      {/* Filter tabs */}
      <div className="flex gap-2 mb-5">
        {filterTypes.map((t) => (
          <button
            key={t}
            data-testid={`catalyst-filter-${t.replace(/\s/g, "-")}`}
            onClick={() => setFilterType(t)}
            className={`px-3 py-1.5 rounded-md text-[11px] font-mono font-semibold transition-colors ${
              filterType === t
                ? "bg-primary/10 text-primary border border-primary/20"
                : "text-muted-foreground hover:text-foreground border border-transparent hover:border-border"
            }`}
          >
            {t}
            {t !== "All" && (
              <span
                className="ml-1.5 text-[9px] opacity-60"
                style={{ color: EVENT_COLORS[t] ?? "#64748b" }}
              >
                {catalystCalendar.filter((e) => e.eventType === t).length}
              </span>
            )}
          </button>
        ))}
      </div>

      <div className="space-y-6 max-h-[520px] overflow-y-auto pr-1">
        {Array.from(grouped.entries()).map(([month, events]) => (
          <div key={month}>
            <div
              className="text-[10px] font-mono font-bold uppercase tracking-widest mb-2 px-1"
              style={{ color: "#64748b" }}
            >
              {month}
            </div>
            <div className="space-y-2">
              {events.map((e, i) => (
                <motion.div
                  key={`${e.ticker}-${e.drug}-${i}`}
                  data-testid={`catalyst-event-${e.ticker}`}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.25, delay: i * 0.03 }}
                  className="flex items-start gap-3 rounded-lg p-3 border transition-colors hover:bg-white/[0.02]"
                  style={{ background: "#0d111a", borderColor: "#1a1f2e" }}
                >
                  {/* Date */}
                  <div className="w-20 flex-shrink-0">
                    <div className="text-[10px] font-mono text-muted-foreground">{e.date}</div>
                  </div>
                  {/* Event type */}
                  <div className="w-28 flex-shrink-0">
                    <EventBadge type={e.eventType} />
                  </div>
                  {/* Company + drug */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-semibold text-foreground">{e.company}</span>
                      <span className="text-[10px] text-muted-foreground font-mono">
                        ({e.ticker})
                      </span>
                      <span className="text-[10px] text-primary font-mono">{e.drug}</span>
                    </div>
                    <div className="text-[11px] text-foreground/60 mt-0.5">{e.indication}</div>
                    {e.designations && (
                      <div className="text-[10px] text-muted-foreground mt-0.5 font-mono">
                        {e.designations}
                      </div>
                    )}
                  </div>
                  {/* Modality */}
                  <div className="flex-shrink-0">
                    <ModalityBadge modality={e.modality} />
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </SectionCard>
  );
}

// ---- Section 4: M&A Comps ----
function MnACompsSection() {
  const [sortDir, setSortDir] = useState<SortDir>("desc");

  const totalValue = mnaDeals.reduce((sum, d) => sum + d.valueB, 0);
  const validPremiums = mnaDeals.filter((d) => d.premiumPct !== null);
  const avgPremium =
    validPremiums.reduce((sum, d) => sum + (d.premiumPct ?? 0), 0) / validPremiums.length;

  const modalityCounts: Record<string, number> = {};
  for (const d of mnaDeals) {
    modalityCounts[d.modalityLabel] = (modalityCounts[d.modalityLabel] ?? 0) + 1;
  }
  const topModality = Object.entries(modalityCounts).sort((a, b) => b[1] - a[1])[0];

  const sorted = useMemo(() => {
    return [...mnaDeals].sort((a, b) =>
      sortDir === "desc" ? b.valueB - a.valueB : a.valueB - b.valueB
    );
  }, [sortDir]);

  return (
    <SectionCard
      title="M&A Comps"
      subtitle="23 biopharma acquisitions — 2023 to 2026"
      badge={
        <DataBadge
          confidence="composite"
          source="Fierce Pharma, BioSpace, DealForma, Bain M&A Report 2026"
          note="Deal values from public filings and press releases; premiums at announcement date"
        />
      }
      delay={0.3}
    >
      {/* Summary bar */}
      <div
        className="rounded-lg p-3 mb-5 flex flex-wrap gap-4 text-[11px] font-mono"
        style={{ background: "#0d111a", border: "1px solid #1a1f2e" }}
      >
        <div>
          <span className="text-muted-foreground">Total Value (2023–2026): </span>
          <span className="text-foreground font-bold">{formatB(totalValue)}</span>
          <span className="text-muted-foreground"> across {mnaDeals.length} deals</span>
        </div>
        <div>
          <span className="text-muted-foreground">Avg Premium: </span>
          <span className="text-green-400 font-bold">+{avgPremium.toFixed(0)}%</span>
        </div>
        <div>
          <span className="text-muted-foreground">Most Acquired Modality: </span>
          <span className="text-primary font-bold">{topModality[0].split(" ")[0]}</span>
          <span className="text-muted-foreground"> ({topModality[1]} deals)</span>
        </div>
      </div>

      <div className="overflow-x-auto -mx-1">
        <table
          className="w-full text-xs"
          data-testid="mna-comps-table"
          style={{ minWidth: 760 }}
        >
          <thead>
            <tr style={{ borderBottom: "1px solid #1e2330" }}>
              <th className="px-3 py-2.5 text-left text-[10px] font-mono font-semibold uppercase tracking-widest text-muted-foreground">
                Year
              </th>
              <th className="px-3 py-2.5 text-left text-[10px] font-mono font-semibold uppercase tracking-widest text-muted-foreground">
                Acquirer → Target
              </th>
              <th
                className="px-3 py-2.5 text-left text-[10px] font-mono font-semibold uppercase tracking-widest text-muted-foreground cursor-pointer hover:text-foreground transition-colors"
                onClick={() => setSortDir((d) => (d === "asc" ? "desc" : "asc"))}
              >
                <span className="flex items-center gap-1">
                  Deal Value
                  <svg width="8" height="8" viewBox="0 0 8 8" fill="currentColor" className="text-primary opacity-80">
                    {sortDir === "asc" ? (
                      <path d="M4 1l3 3H1l3-3z" />
                    ) : (
                      <path d="M4 7L1 4h6L4 7z" />
                    )}
                  </svg>
                </span>
              </th>
              <th className="px-3 py-2.5 text-left text-[10px] font-mono font-semibold uppercase tracking-widest text-muted-foreground">
                Modality
              </th>
              <th className="px-3 py-2.5 text-left text-[10px] font-mono font-semibold uppercase tracking-widest text-muted-foreground">
                Premium
              </th>
              <th className="px-3 py-2.5 text-left text-[10px] font-mono font-semibold uppercase tracking-widest text-muted-foreground">
                Key Asset
              </th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((d, i) => (
              <tr
                key={`${d.acquirer}-${d.target}`}
                data-testid={`mna-row-${d.target.replace(/\s/g, "-")}`}
                style={{
                  borderBottom: "1px solid #1a1f2e",
                  background: i % 2 === 0 ? "transparent" : "rgba(255,255,255,0.01)",
                }}
              >
                <td className="px-3 py-2.5 font-mono text-muted-foreground">{d.year}</td>
                <td className="px-3 py-2.5">
                  <div className="flex items-center gap-1 flex-wrap">
                    <span className="text-foreground/70 text-[11px]">{d.acquirer}</span>
                    <span className="text-muted-foreground">→</span>
                    <span className="text-foreground font-semibold text-[11px]">{d.target}</span>
                  </div>
                </td>
                <td className="px-3 py-2.5">
                  <span className="font-mono font-bold text-foreground">{formatB(d.valueB)}</span>
                </td>
                <td className="px-3 py-2.5">
                  <ModalityBadge modality={d.modality} />
                </td>
                <td className="px-3 py-2.5 font-mono">
                  {d.premiumPct !== null ? (
                    <span className="text-green-400 font-semibold">+{d.premiumPct}%</span>
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )}
                </td>
                <td className="px-3 py-2.5 text-[11px] text-foreground/60 max-w-xs">
                  {d.keyAsset}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </SectionCard>
  );
}

// ---- Section 5: Catalyst Price Impact ----

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{ payload: (typeof catalystMoves)[0] }>;
}

function CatalystTooltip({ active, payload }: CustomTooltipProps) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div
      className="rounded-lg border p-3 text-[11px] leading-relaxed max-w-xs shadow-xl"
      style={{ background: "#141720", borderColor: "#1e2330" }}
    >
      <div className="font-bold text-foreground mb-1">
        {d.company} ({d.ticker})
      </div>
      <div>
        <span className="text-muted-foreground">Move: </span>
        <span
          className="font-mono font-bold"
          style={{ color: d.direction === "positive" ? "#22c55e" : "#ef4444" }}
        >
          {formatPct(d.movePct)}
        </span>
      </div>
      <div>
        <span className="text-muted-foreground">Date: </span>
        <span className="text-foreground/80">{d.date}</span>
      </div>
      <div>
        <span className="text-muted-foreground">Drug: </span>
        <span className="text-foreground/80">{d.drug}</span>
      </div>
      <div>
        <span className="text-muted-foreground">Indication: </span>
        <span className="text-foreground/80">{d.indication}</span>
      </div>
      <div className="mt-1.5 pt-1.5 border-t" style={{ borderColor: "#1e2330" }}>
        <span className="text-foreground/70">{d.catalyst}</span>
      </div>
    </div>
  );
}

function CatalystPriceImpactSection() {
  const chartData = useMemo(() => {
    return [...catalystMoves].sort((a, b) => a.movePct - b.movePct);
  }, []);

  return (
    <SectionCard
      title="Catalyst Price Impact"
      subtitle="20 notable stock moves on binary catalysts — asymmetric outcomes visualized"
      badge={
        <DataBadge
          confidence="composite"
          source="Clinical Trials Arena, Yahoo Finance, BioPharma Dive, BioSpace"
          note="Move percentages from market close on catalyst date or period; sources cited in data"
        />
      }
      delay={0.4}
    >
      <div className="h-[440px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            layout="vertical"
            data={chartData}
            margin={{ top: 4, right: 80, left: 140, bottom: 4 }}
          >
            <XAxis
              type="number"
              domain={[-100, 620]}
              tick={{ fill: "#64748b", fontSize: 10, fontFamily: "JetBrains Mono, monospace" }}
              tickFormatter={(v) => `${v}%`}
              axisLine={{ stroke: "#1e2330" }}
              tickLine={false}
            />
            <YAxis
              type="category"
              dataKey="ticker"
              tick={{ fill: "#94a3b8", fontSize: 10, fontFamily: "JetBrains Mono, monospace" }}
              axisLine={false}
              tickLine={false}
              width={130}
              tickFormatter={(val, index) => {
                const item = chartData[index];
                return item ? `${item.ticker} ${formatPct(item.movePct)}` : val;
              }}
            />
            <Tooltip
              content={<CatalystTooltip />}
              cursor={{ fill: "rgba(255,255,255,0.03)" }}
            />
            <ReferenceLine x={0} stroke="#1e2330" strokeWidth={1} />
            <Bar dataKey="movePct" radius={[0, 3, 3, 0]} maxBarSize={18}>
              {chartData.map((entry) => (
                <Cell
                  key={`cell-${entry.id}`}
                  fill={entry.direction === "positive" ? "#22c55e" : "#ef4444"}
                  opacity={0.85}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-3 text-[10px] text-muted-foreground font-mono">
        Hover over bars for full catalyst details. Positive = clinical success / FDA approval.
        Negative = trial failure / FDA rejection / safety signal.
      </div>
    </SectionCard>
  );
}

// ---- Section 6: Approval Probability Matrix ----

const TRANSITIONS = [
  { key: "phase1to2" as const, label: "Ph I→II" },
  { key: "phase2to3" as const, label: "Ph II→III" },
  { key: "phase3toNDA" as const, label: "Ph III→NDA" },
  { key: "NDAtoApproval" as const, label: "NDA→Approval" },
  { key: "loa" as const, label: "Overall LOA" },
];

function getHeatmapColor(val: number, isLOA: boolean): string {
  // LOA scale: 0–20%, transitions 0–100%
  const norm = isLOA ? val / 20 : val / 100;
  const clamped = Math.min(1, Math.max(0, norm));
  // Blue-teal-green gradient
  const r = Math.round(6 + (34 - 6) * clamped);
  const g = Math.round(78 + (197 - 78) * clamped);
  const b = Math.round(120 + (94 - 120) * clamped);
  return `rgb(${r},${g},${b})`;
}

function ApprovalProbabilitySection() {
  const [hoveredCell, setHoveredCell] = useState<{ mod: string; trans: string } | null>(null);

  return (
    <SectionCard
      title="Approval Probability Matrix"
      subtitle="Phase transition success rates and overall LOA (likelihood of approval) by modality"
      badge={
        <DataBadge
          confidence="composite"
          source="BIO/QLS Advisors 2011–2020, NEWDIGS/Nature Reviews Drug Discovery 2025"
          note="Based on 4,000+ development programs; bispecific/CRISPR/mRNA rates estimated from available data"
        />
      }
      delay={0.5}
    >
      <div className="overflow-x-auto -mx-1">
        <table
          className="text-xs border-collapse"
          data-testid="approval-probability-matrix"
          style={{ minWidth: 680 }}
        >
          <thead>
            <tr>
              <th
                className="px-3 py-2 text-left text-[10px] font-mono uppercase tracking-widest text-muted-foreground"
                style={{ width: 140 }}
              >
                Modality
              </th>
              {TRANSITIONS.map((t) => (
                <th
                  key={t.key}
                  className="px-3 py-2 text-center text-[10px] font-mono uppercase tracking-widest text-muted-foreground"
                >
                  {t.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {approvalProbability.map((row) => (
              <tr key={row.modality}>
                <td className="px-3 py-2">
                  <ModalityBadge modality={row.modalityKey} />
                </td>
                {TRANSITIONS.map((t) => {
                  const val = row[t.key];
                  const isLOA = t.key === "loa";
                  const bg = getHeatmapColor(val, isLOA);
                  const isHovered =
                    hoveredCell?.mod === row.modality && hoveredCell?.trans === t.key;
                  return (
                    <td
                      key={t.key}
                      data-testid={`heatmap-${row.modality}-${t.key}`}
                      className="px-3 py-2 text-center cursor-default transition-all"
                      onMouseEnter={() =>
                        setHoveredCell({ mod: row.modality, trans: t.key })
                      }
                      onMouseLeave={() => setHoveredCell(null)}
                      style={{ background: "transparent" }}
                    >
                      <div
                        className="inline-flex items-center justify-center rounded font-mono font-bold text-[11px] transition-all"
                        style={{
                          width: 58,
                          height: 28,
                          background: bg,
                          opacity: isHovered ? 1 : 0.8,
                          color: "#ffffff",
                          border: isHovered ? "1.5px solid rgba(255,255,255,0.4)" : "1.5px solid transparent",
                          transform: isHovered ? "scale(1.08)" : "scale(1)",
                        }}
                      >
                        {isLOA ? `${val}%` : `${val}%`}
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Legend */}
      <div className="mt-4 flex items-center gap-3">
        <span className="text-[10px] text-muted-foreground font-mono">Low</span>
        <div
          className="h-2 rounded-full flex-1 max-w-32"
          style={{
            background:
              "linear-gradient(to right, rgb(6,78,120), rgb(14,159,107), rgb(34,197,94))",
          }}
        />
        <span className="text-[10px] text-muted-foreground font-mono">High</span>
        <span className="text-[10px] text-muted-foreground font-mono ml-4">
          LOA scale: 0–20% | Transitions: 0–100%
        </span>
      </div>
    </SectionCard>
  );
}

// ---- Page ----
export default function InvestmentSignals() {
  return (
    <div className="min-h-full" style={{ background: "#0f1117" }}>
      {/* Page header */}
      <div
        className="sticky top-0 z-10 border-b px-6 py-4"
        style={{ background: "#0f1117", borderColor: "#1e2330" }}
      >
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2.5">
              <TrendingUpIcon />
              <h1 className="text-base font-semibold text-foreground tracking-tight">
                Investment Signals
              </h1>
            </div>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              Analyst-grade pipeline intelligence — structural trends, catalyst calendar, M&A comps,
              and approval probability
            </p>
          </div>
          <DataBadge
            confidence="composite"
            source="FDA, Ozmosi, DealForma, BIO/QLS Advisors"
            note="All data compiled from public sources as of April 2026. Not financial advice."
          />
        </div>
      </div>

      {/* Content */}
      <div className="px-6 py-6 space-y-8 max-w-7xl mx-auto">
        {/* Section 1: Structural Trends */}
        <StructuralTrendsSection />

        {/* Section 2: Pipeline Density Screen */}
        <PipelineDensitySection />

        {/* Two-column layout for catalyst calendar + M&A */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {/* Section 3: Catalyst Calendar */}
          <CatalystCalendarSection />

          {/* Section 4: M&A Comps */}
          <MnACompsSection />
        </div>

        {/* Section 5: Catalyst Price Impact */}
        <CatalystPriceImpactSection />

        {/* Section 6: Approval Probability Matrix */}
        <ApprovalProbabilitySection />

        {/* Footer note */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.8 }}
          className="text-[10px] text-muted-foreground font-mono pb-6"
        >
          Data sources: FDA Advisory Committee Calendar · CheckRare PDUFA Tracker · Fierce Pharma
          M&A Reports · BioSpace · DealForma · Bain M&A Report 2026 · BIO/QLS Advisors Clinical
          Development Success Rates 2011–2020 · NEWDIGS/Nature Reviews Drug Discovery 2025 ·
          Ozmosi Q4 2025 · Pharmaceutical Technology Q3 2025 · Pharm Exec 2026 Pipeline Report.
          This dashboard is for informational purposes only and does not constitute investment
          advice.
        </motion.div>
      </div>
    </div>
  );
}

// ---- Inline SVG icons ----
function TrendingUpIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 18 18"
      fill="none"
      stroke="#06b6d4"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="1 13 6 7 10 10 17 3" />
      <polyline points="12 3 17 3 17 8" />
    </svg>
  );
}
