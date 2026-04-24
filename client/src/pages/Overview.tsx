import { useState } from "react";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  CartesianGrid, Cell
} from "recharts";
import {
  modalityTimelineData, modalityKeys, clinicalTrialsByCondition, milestoneEvents,
  dataSourceNotes
} from "@/data/pipelineData";
import { useInfoPanel } from "@/App";
import { DataBadge } from "@/components/DataBadge";

// KPI Cards with trend info
const KPI_DATA = [
  {
    label: "Novel Drugs Approved",
    value: "897",
    sub: "2000–2024",
    color: "#06b6d4",
    confidence: "composite" as const,
    trend: "+12%",
    trendDirection: "up" as const,
    trendPeriod: "vs 2015–2019",
  },
  {
    label: "Global Pipeline Trials",
    value: "12,203",
    sub: "ClinicalTrials.gov",
    color: "#6366f1",
    confidence: "verified" as const,
    trend: "+34%",
    trendDirection: "up" as const,
    trendPeriod: "2020–2024 growth",
  },
  {
    label: "ADCs Approved",
    value: "14",
    sub: "Through 2025",
    color: "#f43f5e",
    confidence: "verified" as const,
    trend: "+7 since 2019",
    trendDirection: "up" as const,
    trendPeriod: "doubled in 5 years",
  },
  {
    label: "CAR-T Therapies",
    value: "7",
    sub: "Incl. TIL & TCR-T",
    color: "#a855f7",
    confidence: "verified" as const,
    trend: "+5 since 2017",
    trendDirection: "up" as const,
    trendPeriod: "new modality class",
  },
  {
    label: "mRNA Vaccines",
    value: "4",
    sub: "Approved globally",
    color: "#14b8a6",
    confidence: "verified" as const,
    trend: "from 0 in 2020",
    trendDirection: "up" as const,
    trendPeriod: "pandemic-catalyzed",
  },
];

// Modality hints for condition hover tooltips
const CONDITION_MODALITY_HINTS: Record<string, string> = {
  Oncology: "Dominated by checkpoint inhibitors, ADCs, and CAR-T",
  Cardiovascular: "Led by PCSK9 inhibitors, siRNA, and SGLT2 inhibitors",
  Respiratory: "Driven by IL-5/IL-4Rα mAbs and inhaled small molecules",
  Metabolic: "GLP-1 agonists and SGLT2 inhibitors leading",
  "CNS / Neurology": "Anti-amyloid mAbs, ASOs, and AAV gene therapies",
  Hematology: "CAR-T, bispecific antibodies, and gene therapy dominant",
  Dermatology: "IL-17, IL-23, and JAK inhibitors leading",
  Immunology: "Biologics targeting IL-12/23, IL-17, TNF, and JAK pathways",
  "Rare Disease": "Gene therapy and ASOs making major inroads",
  Hepatology: "GalNAc-siRNA and NASH small molecules advancing",
  Ophthalmology: "Anti-VEGF biologics and AAV gene therapies",
};

// Condition chart data — short display names
const CONDITION_LABELS: Record<string, string> = {
  oncology: "Oncology",
  cardiovascular: "Cardiovascular",
  respiratory: "Respiratory",
  metabolic: "Metabolic",
  cns_neurology: "CNS / Neurology",
  hematology: "Hematology",
  dermatology: "Dermatology",
  immunology: "Immunology",
  rare_disease: "Rare Disease",
  hepatology: "Hepatology",
  ophthalmology: "Ophthalmology",
};

const conditionData = Object.entries(clinicalTrialsByCondition).map(([key, val]) => ({
  name: CONDITION_LABELS[key] || key.replace(/_/g, " "),
  value: val,
})).sort((a, b) => b.value - a.value);

const CONDITION_COLORS = [
  "#f43f5e", "#ef4444", "#06b6d4", "#22c55e", "#6366f1",
  "#a855f7", "#ec4899", "#f97316", "#eab308", "#14b8a6", "#78716c",
];

// Enhanced condition tooltip with modality hints
const CustomConditionTooltip = ({ active, payload }: any) => {
  if (active && payload?.length) {
    const name = payload[0].payload.name;
    const hint = CONDITION_MODALITY_HINTS[name];
    return (
      <div className="bg-card border border-border rounded-lg px-3 py-2 text-xs shadow-lg max-w-[200px]">
        <div className="text-foreground font-medium">{name}</div>
        <div className="text-primary font-mono">{payload[0].value.toLocaleString()} trials</div>
        {hint && (
          <div className="text-muted-foreground mt-1.5 leading-relaxed text-[10px] border-t border-border/40 pt-1.5">
            {hint}
          </div>
        )}
      </div>
    );
  }
  return null;
};

const CustomAreaTooltip = ({ active, payload, label }: any) => {
  if (active && payload?.length) {
    return (
      <div className="bg-card border border-border rounded-lg px-3 py-2 text-xs shadow-lg">
        <div className="text-muted-foreground font-mono mb-1">{label}</div>
        {payload.map((p: any) => (
          <div key={p.dataKey} className="flex gap-2 items-center">
            <div className="w-2 h-2 rounded-full" style={{ background: p.color }} />
            <span className="text-foreground/70">{p.name}:</span>
            <span className="font-mono text-foreground">{p.value}</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

// Navigation items for the hero guide
const NAV_ITEMS = [
  { path: "#/", icon: "◉", label: "Overview", desc: "KPIs, modality trends, trial counts, key milestones" },
  { path: "#/timeline", icon: "◈", label: "Modality Timeline", desc: "25-year FDA approval evolution by drug class" },
  { path: "#/funnel", icon: "▼", label: "Pipeline Funnel", desc: "Phase attrition & success rates by modality" },
  { path: "#/bodymap", icon: "◎", label: "Body Map", desc: "Anatomical organ view with trial data" },
  { path: "#/heatmap", icon: "▦", label: "Target Heatmap", desc: "Drug target class activity 2005 → 2025" },
  { path: "#/sponsors", icon: "◆", label: "Sponsors", desc: "Big Pharma vs Biotech pipeline breakdown" },
];

function HeroBanner({ onDismiss }: { onDismiss: () => void }) {
  return (
    <div
      className="relative rounded-xl border overflow-hidden mb-5"
      style={{
        background: "linear-gradient(135deg, #141720 0%, #0f1117 40%, #0e1520 100%)",
        borderColor: "#1e2230",
      }}
      data-testid="hero-banner"
    >
      {/* Subtle grid pattern overlay */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: "linear-gradient(#06b6d4 1px, transparent 1px), linear-gradient(90deg, #06b6d4 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />
      {/* Glow accent */}
      <div
        className="absolute top-0 right-0 w-64 h-64 rounded-full opacity-[0.06]"
        style={{ background: "radial-gradient(circle, #06b6d4, transparent 70%)" }}
      />

      <div className="relative p-6">
        {/* Header row */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            {/* DNA icon */}
            <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: "#06b6d415", border: "1px solid #06b6d430" }}>
              <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="#06b6d4" strokeWidth="1.5">
                <path d="M12 2c0 0-4 3-4 7s4 5 4 5" strokeLinecap="round" />
                <path d="M12 2c0 0 4 3 4 7s-4 5-4 5" strokeLinecap="round" />
                <path d="M12 14c0 0-4 2-4 5s4 3 4 3" strokeLinecap="round" />
                <path d="M12 14c0 0 4 2 4 5s-4 3-4 3" strokeLinecap="round" />
                <path d="M8 5h8M8 9h8M8 17h8M8 21h8" strokeWidth="1" strokeDasharray="2 2" opacity="0.6" />
              </svg>
            </div>
            <div>
              <h1 className="text-lg font-bold text-foreground tracking-tight">BioPharma Atlas</h1>
              <p className="text-[10px] text-muted-foreground font-mono">v2.0 — April 2026</p>
            </div>
          </div>
          <button
            data-testid="hero-dismiss"
            onClick={onDismiss}
            className="text-[10px] px-2.5 py-1 rounded border transition-colors hover:opacity-80 flex-shrink-0"
            style={{ color: "#8892a8", borderColor: "#1e2230", background: "#0f1117" }}
          >
            Start Exploring ↓
          </button>
        </div>

        {/* Description */}
        <p className="text-sm text-foreground/75 leading-relaxed mb-4 max-w-2xl">
          BioPharma Atlas maps the global drug development landscape across 6 interactive views — tracking 
          25 years of FDA approvals, 500k+ clinical trials, and the rise of novel modalities from 
          monoclonal antibodies to CRISPR gene editing. Built for bioengineers, scientists, and analysts 
          who want real data, not marketing slides.
        </p>

        {/* Data sources row */}
        <div className="flex flex-wrap items-center gap-3 mb-5 text-[10px]">
          <span className="text-muted-foreground font-semibold uppercase tracking-widest">Data sources:</span>
          {[
            { label: "ClinicalTrials.gov API v2", badge: "✓ verified", color: "#22c55e" },
            { label: "FDA CDER/CBER Annual Reports", badge: "~ composite", color: "#06b6d4" },
            { label: "BIO Industry Analysis 2021", badge: "* estimated", color: "#f59e0b" },
            { label: "Nature Reviews Drug Discovery", badge: "* estimated", color: "#f59e0b" },
          ].map((src) => (
            <span key={src.label} className="flex items-center gap-1.5">
              <span className="font-mono text-[9px] px-1 py-0.5 rounded"
                style={{ color: src.color, background: `${src.color}12`, border: `1px solid ${src.color}30` }}>
                {src.badge}
              </span>
              <span className="text-foreground/60">{src.label}</span>
            </span>
          ))}
        </div>

        {/* 6 views grid */}
        <div>
          <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest mb-2">
            6 views to explore
          </div>
          <div className="grid grid-cols-3 gap-2">
            {NAV_ITEMS.map((item) => (
              <a
                key={item.path}
                href={item.path}
                className="flex items-start gap-2 p-2.5 rounded-lg border transition-colors hover:border-primary/30 hover:bg-primary/5 group"
                style={{ borderColor: "#1e2230", background: "#0f1117" }}
              >
                <span className="text-base leading-none mt-0.5 group-hover:text-primary transition-colors" style={{ color: "#8892a8" }}>
                  {item.icon}
                </span>
                <div>
                  <div className="text-[11px] font-semibold text-foreground group-hover:text-primary transition-colors">{item.label}</div>
                  <div className="text-[9px] text-muted-foreground mt-0.5 leading-relaxed">{item.desc}</div>
                </div>
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Overview() {
  const { openPanel } = useInfoPanel();
  const [heroDismissed, setHeroDismissed] = useState(false);

  const conditionNote = dataSourceNotes["clinicalTrialsByCondition"];
  const timelineNote = dataSourceNotes["modalityTimelineData"];
  const milestoneNote = dataSourceNotes["milestoneEvents"];

  const handleDismissHero = () => {
    setHeroDismissed(true);
    setTimeout(() => {
      document.getElementById("kpi-section")?.scrollIntoView({ behavior: "smooth" });
    }, 50);
  };

  return (
    <div className="p-6 space-y-5 min-h-full">
      {/* Hero Banner */}
      {!heroDismissed && <HeroBanner onDismiss={handleDismissHero} />}

      {/* Page header */}
      <div id="kpi-section">
        <h1 className="text-lg font-semibold text-foreground tracking-tight">Pipeline Overview</h1>
        <p className="text-xs text-muted-foreground mt-0.5">25 years of biopharma innovation at a glance</p>
      </div>

      {/* KPI Cards with trend indicators */}
      <div className="grid grid-cols-5 gap-3">
        {KPI_DATA.map((kpi) => (
          <div
            key={kpi.label}
            data-testid={`kpi-${kpi.label.toLowerCase().replace(/\s/g, "-")}`}
            className="bg-card border border-card-border rounded-xl p-4 relative overflow-hidden"
          >
            <div
              className="absolute inset-0 opacity-5"
              style={{ background: `radial-gradient(circle at top right, ${kpi.color}, transparent 70%)` }}
            />
            <div className="relative">
              <div className="text-xl font-mono font-bold" style={{ color: kpi.color }}>{kpi.value}</div>
              <div className="text-xs font-medium text-foreground mt-0.5">{kpi.label}</div>
              <div className="text-[10px] text-muted-foreground mt-0.5 font-mono">{kpi.sub}</div>
              {/* Trend indicator */}
              <div className="flex items-center gap-1 mt-1.5">
                <span
                  className="text-[10px] font-semibold font-mono"
                  style={{ color: kpi.trendDirection === "up" ? "#22c55e" : "#f43f5e" }}
                >
                  {kpi.trendDirection === "up" ? "↑" : "↓"} {kpi.trend}
                </span>
              </div>
              <div className="text-[9px] text-muted-foreground mt-0.5 leading-tight">{kpi.trendPeriod}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Modality evolution mini chart */}
      <div className="bg-card border border-card-border rounded-xl p-4">
        <div className="flex items-center justify-between mb-3">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xs font-semibold text-foreground">Modality Evolution (2000–2025)</h2>
              {timelineNote && (
                <DataBadge
                  confidence={timelineNote.confidence}
                  source={timelineNote.source}
                  note={timelineNote.note}
                />
              )}
            </div>
            <p className="text-[10px] text-muted-foreground mt-0.5">FDA approvals by drug class</p>
          </div>
          <div className="flex flex-wrap gap-x-3 gap-y-1">
            {modalityKeys.slice(0, 5).map(mk => (
              <button
                key={mk.key}
                data-testid={`modality-legend-${mk.key}`}
                onClick={() => openPanel(mk.key)}
                className="flex items-center gap-1.5 text-[10px] text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                title={`Click to learn more about ${mk.label}`}
              >
                <div className="w-2 h-2 rounded-full" style={{ background: mk.color }} />
                {mk.label}
              </button>
            ))}
          </div>
        </div>
        <ResponsiveContainer width="100%" height={180}>
          <AreaChart data={modalityTimelineData} margin={{ right: 16 }}>
            <defs>
              {modalityKeys.map(mk => (
                <linearGradient key={mk.key} id={`grad-mini-${mk.key}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={mk.color} stopOpacity={0.5} />
                  <stop offset="95%" stopColor={mk.color} stopOpacity={0.02} />
                </linearGradient>
              ))}
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis dataKey="year" tick={{ fill: "#8892a8", fontSize: 10, fontFamily: "JetBrains Mono" }} tickLine={false} axisLine={false} interval={4} />
            <YAxis tick={{ fill: "#8892a8", fontSize: 10, fontFamily: "JetBrains Mono" }} tickLine={false} axisLine={false} />
            <Tooltip content={<CustomAreaTooltip />} />
            {modalityKeys.map(mk => (
              <Area
                key={mk.key}
                type="monotone"
                dataKey={mk.key}
                name={mk.label}
                stackId="1"
                stroke={mk.color}
                strokeWidth={0.5}
                fill={`url(#grad-mini-${mk.key})`}
              />
            ))}
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Two-column layout: condition bar + milestone strip */}
      <div className="grid grid-cols-2 gap-4">
        {/* Condition bar chart */}
        <div className="bg-card border border-card-border rounded-xl p-4">
          <div className="flex items-center gap-2 mb-1">
            <h2 className="text-xs font-semibold text-foreground">Trials by Condition Area</h2>
            {conditionNote && (
              <DataBadge
                confidence={conditionNote.confidence}
                source={conditionNote.source}
                note={conditionNote.note}
              />
            )}
          </div>
          <p className="text-[10px] text-muted-foreground mb-3">Hover a bar to see dominant modalities</p>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={conditionData} layout="vertical" margin={{ left: 8, right: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={false} />
              <XAxis
                type="number"
                tick={{ fill: "#8892a8", fontSize: 9, fontFamily: "JetBrains Mono" }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(v) => v >= 1000 ? `${(v / 1000).toFixed(0)}k` : String(v)}
              />
              <YAxis
                type="category"
                dataKey="name"
                tick={{ fill: "#8892a8", fontSize: 10 }}
                tickLine={false}
                axisLine={false}
                width={110}
              />
              <Tooltip content={<CustomConditionTooltip />} />
              <Bar dataKey="value" radius={[0, 3, 3, 0]}>
                {conditionData.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={CONDITION_COLORS[index % CONDITION_COLORS.length]} fillOpacity={0.8} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Milestone timeline */}
        <div className="bg-card border border-card-border rounded-xl p-4">
          <div className="flex items-center gap-2 mb-1">
            <h2 className="text-xs font-semibold text-foreground">Key Milestones</h2>
            {milestoneNote && (
              <DataBadge
                confidence={milestoneNote.confidence}
                source={milestoneNote.source}
                note={milestoneNote.note}
              />
            )}
          </div>
          <p className="text-[10px] text-muted-foreground mb-3">Breakthrough approvals & paradigm shifts</p>
          <div className="space-y-2 max-h-[280px] overflow-y-auto pr-1">
            {milestoneEvents.map((m, i) => (
              <div key={i} className="flex gap-3 group">
                <div className="font-mono text-[10px] text-primary w-8 flex-shrink-0 pt-0.5 text-right">{m.year}</div>
                <div className="flex-1 pb-2 border-b border-border/40 last:border-0">
                  <div className="text-xs font-medium text-foreground group-hover:text-primary transition-colors">{m.event}</div>
                  <div className="text-[10px] text-muted-foreground mt-0.5 leading-relaxed line-clamp-2">{m.description}</div>
                  <div className="mt-1">
                    <span className="text-[9px] px-1.5 py-0.5 rounded-full border border-border text-muted-foreground font-mono">{m.category}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
