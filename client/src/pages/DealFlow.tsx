import { useState, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  Legend,
} from "recharts";
import {
  mnaDeals,
  companyPipelines,
  MODALITY_COLORS,
  type Modality,
  type MnaDeal,
  type CompanyPipeline,
} from "@/data/investmentData";

// ─── Helpers ────────────────────────────────────────────────────────────────

function fmtB(v: number) {
  return `$${v.toFixed(1)}B`;
}

function fmtPct(v: number | null) {
  if (v === null) return "N/D";
  return `+${v}%`;
}

// ─── Shared badge component ──────────────────────────────────────────────────

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

// ─── KPI Card ────────────────────────────────────────────────────────────────

function KpiCard({
  label,
  value,
  sub,
  accent,
}: {
  label: string;
  value: string;
  sub?: string;
  accent?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl border border-white/8 bg-white/3 px-5 py-4 flex flex-col gap-1"
    >
      <div className="text-[10px] font-mono uppercase tracking-widest text-slate-400">
        {label}
      </div>
      <div
        className="text-2xl font-bold font-mono leading-none"
        style={{ color: accent ?? "#f1f5f9" }}
      >
        {value}
      </div>
      {sub && <div className="text-[11px] text-slate-500 font-mono">{sub}</div>}
    </motion.div>
  );
}

// ─── Section Header ──────────────────────────────────────────────────────────

function SectionHeader({
  title,
  subtitle,
}: {
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="mb-4">
      <h2 className="text-sm font-semibold text-slate-200 tracking-tight">
        {title}
      </h2>
      {subtitle && (
        <p className="text-[11px] text-slate-500 mt-0.5 font-mono">{subtitle}</p>
      )}
    </div>
  );
}

// ─── Filter bar helpers ──────────────────────────────────────────────────────

const YEARS = ["All", "2023", "2024", "2025", "2026"] as const;
const SIZE_FILTERS = [
  { label: "All sizes", minB: 0 },
  { label: ">$5B", minB: 5 },
  { label: ">$10B", minB: 10 },
  { label: ">$20B", minB: 20 },
];

function FilterPill({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`px-2.5 py-1 rounded-md text-[11px] font-mono transition-all duration-150 border ${
        active
          ? "bg-cyan-500/15 text-cyan-300 border-cyan-500/40"
          : "bg-white/4 text-slate-400 border-white/8 hover:text-slate-200 hover:bg-white/8"
      }`}
    >
      {children}
    </button>
  );
}

// ─── Deal Timeline SVG ───────────────────────────────────────────────────────

interface TooltipState {
  deal: MnaDeal;
  x: number;
  y: number;
}

function DealTimeline({
  deals,
}: {
  deals: MnaDeal[];
}) {
  const [tooltip, setTooltip] = useState<TooltipState | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  const YEAR_MIN = 2023;
  const YEAR_MAX = 2026;
  const PAD_LEFT = 48;
  const PAD_RIGHT = 32;
  const PAD_TOP = 40;
  const PAD_BOT = 32;
  const SVG_W = 880;
  const SVG_H = 200;
  const PLOT_W = SVG_W - PAD_LEFT - PAD_RIGHT;

  // Year range: Jan 2023 → Dec 2026 = 4 years
  const TOTAL_MONTHS = 48; // 4 years * 12
  const START_MS = new Date(2023, 0, 1).getTime();
  const END_MS = new Date(2027, 0, 1).getTime();
  const RANGE_MS = END_MS - START_MS;

  function xForDeal(deal: MnaDeal) {
    // Use year + rough mid-year position. 
    // Map: 2023 → 0, 2024 → 1, 2025 → 2, 2026 → 3
    // Scatter vertically to avoid overlap using deal index
    const yearFrac = (deal.year - YEAR_MIN) / (YEAR_MAX - YEAR_MIN + 1);
    return PAD_LEFT + yearFrac * PLOT_W + (PLOT_W / (YEAR_MAX - YEAR_MIN + 1)) * 0.5;
  }

  // Sort deals by year + value to get y-scatter
  const sortedDeals = useMemo(() => {
    return [...deals].sort((a, b) => a.year - b.year || b.valueB - a.valueB);
  }, [deals]);

  // Compute non-overlapping x positions with jitter within each year band
  const dealPositions = useMemo(() => {
    const bandW = PLOT_W / 4;
    // Group by year
    const byYear: Record<number, MnaDeal[]> = {};
    for (const d of sortedDeals) {
      if (!byYear[d.year]) byYear[d.year] = [];
      byYear[d.year].push(d);
    }
    const positions: Record<string, { x: number; y: number; r: number }> = {};
    for (const [yr, yrDeals] of Object.entries(byYear)) {
      const yearNum = parseInt(yr);
      const bandStart = PAD_LEFT + (yearNum - YEAR_MIN) * bandW;
      const n = yrDeals.length;
      yrDeals.forEach((d, i) => {
        // Spread within band
        const slot = (i + 0.5) / n;
        const x = bandStart + slot * bandW;
        // Y based on value (bigger = higher up)
        const maxV = 43;
        const minR = 7;
        const maxR = 28;
        const r = minR + ((d.valueB / maxV) * (maxR - minR));
        const y = PAD_TOP + (SVG_H - PAD_TOP - PAD_BOT) * 0.5;
        const key = `${d.acquirer}-${d.target}`;
        positions[key] = { x, y, r };
      });
    }
    return positions;
  }, [sortedDeals]);

  // X axis ticks for years
  const yearTicks = [2023, 2024, 2025, 2026];

  function handleMouseEnter(
    e: React.MouseEvent<SVGCircleElement>,
    deal: MnaDeal
  ) {
    const rect = svgRef.current?.getBoundingClientRect();
    if (!rect) return;
    setTooltip({
      deal,
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  }

  return (
    <div className="relative">
      <svg
        ref={svgRef}
        viewBox={`0 0 ${SVG_W} ${SVG_H}`}
        className="w-full"
        style={{ height: 200 }}
        onMouseLeave={() => setTooltip(null)}
      >
        {/* Axis line */}
        <line
          x1={PAD_LEFT}
          y1={SVG_H - PAD_BOT}
          x2={SVG_W - PAD_RIGHT}
          y2={SVG_H - PAD_BOT}
          stroke="#334155"
          strokeWidth={1}
        />

        {/* Year ticks and labels */}
        {yearTicks.map((yr) => {
          const bandW = PLOT_W / 4;
          const bandStart = PAD_LEFT + (yr - YEAR_MIN) * bandW;
          const midX = bandStart + bandW / 2;
          return (
            <g key={yr}>
              {/* Band background */}
              <rect
                x={bandStart + 2}
                y={PAD_TOP - 16}
                width={bandW - 4}
                height={SVG_H - PAD_TOP - PAD_BOT + 16}
                fill={yr % 2 === 0 ? "rgba(255,255,255,0.015)" : "rgba(0,0,0,0)"}
                rx={4}
              />
              <text
                x={midX}
                y={SVG_H - 8}
                textAnchor="middle"
                fill="#64748b"
                fontSize={11}
                fontFamily="'JetBrains Mono', monospace"
              >
                {yr}
              </text>
              {/* Vertical grid line */}
              <line
                x1={bandStart}
                y1={PAD_TOP - 10}
                x2={bandStart}
                y2={SVG_H - PAD_BOT}
                stroke="#1e293b"
                strokeWidth={1}
                strokeDasharray="3,3"
              />
            </g>
          );
        })}

        {/* Deal bubbles */}
        {sortedDeals.map((deal) => {
          const key = `${deal.acquirer}-${deal.target}`;
          const pos = dealPositions[key];
          if (!pos) return null;
          const color = MODALITY_COLORS[deal.modality] ?? "#64748b";
          const isHovered =
            tooltip?.deal.acquirer === deal.acquirer &&
            tooltip?.deal.target === deal.target;

          return (
            <g key={key}>
              <circle
                cx={pos.x}
                cy={pos.y}
                r={pos.r}
                fill={`${color}22`}
                stroke={color}
                strokeWidth={isHovered ? 2 : 1.5}
                style={{ cursor: "pointer", transition: "all 0.15s" }}
                onMouseEnter={(e) => handleMouseEnter(e, deal)}
                opacity={isHovered ? 1 : 0.85}
              />
              {/* Value label inside bubble if big enough */}
              {pos.r > 14 && (
                <text
                  x={pos.x}
                  y={pos.y + 1}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fill={color}
                  fontSize={Math.min(9, pos.r * 0.55)}
                  fontFamily="'JetBrains Mono', monospace"
                  fontWeight="600"
                  style={{ pointerEvents: "none" }}
                >
                  {fmtB(deal.valueB)}
                </text>
              )}
            </g>
          );
        })}

        {/* Axis label */}
        <text
          x={PAD_LEFT - 4}
          y={SVG_H - PAD_BOT + 1}
          textAnchor="end"
          fill="#475569"
          fontSize={9}
          fontFamily="'JetBrains Mono', monospace"
        >
          ←year
        </text>
      </svg>

      {/* Tooltip */}
      {tooltip && (
        <div
          className="absolute z-50 pointer-events-none"
          style={{
            left: tooltip.x + 12,
            top: tooltip.y - 10,
          }}
        >
          <div className="bg-[#0f1117] border border-white/15 rounded-lg p-3 shadow-2xl min-w-[220px] max-w-[280px]">
            <div className="text-[11px] font-mono text-slate-400 mb-1">
              {tooltip.deal.acquirer}
            </div>
            <div className="text-sm font-semibold text-white mb-2">
              → {tooltip.deal.target}
            </div>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-[11px] font-mono">
              <span className="text-slate-400">Value</span>
              <span className="text-cyan-300 font-semibold">
                {fmtB(tooltip.deal.valueB)}
              </span>
              <span className="text-slate-400">Premium</span>
              <span className="text-emerald-400">
                {fmtPct(tooltip.deal.premiumPct)}
              </span>
              <span className="text-slate-400">Modality</span>
              <span style={{ color: MODALITY_COLORS[tooltip.deal.modality] }}>
                {tooltip.deal.modalityLabel}
              </span>
            </div>
            <div className="mt-2 pt-2 border-t border-white/8 text-[10px] text-slate-400 font-mono">
              {tooltip.deal.keyAsset}
            </div>
            <div className="mt-1 text-[10px] text-slate-500 font-mono">
              {tooltip.deal.closeNote}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Deal Analytics ──────────────────────────────────────────────────────────

function DealAnalytics({ deals }: { deals: MnaDeal[] }) {
  // KPIs
  const totalValue = useMemo(
    () => deals.reduce((s, d) => s + d.valueB, 0),
    [deals]
  );
  const validPremiums = deals.filter((d) => d.premiumPct !== null);
  const avgPremium = useMemo(
    () =>
      validPremiums.length
        ? validPremiums.reduce((s, d) => s + (d.premiumPct ?? 0), 0) /
          validPremiums.length
        : 0,
    [validPremiums]
  );

  // Most acquired modality
  const modalityCounts = useMemo(() => {
    const map: Record<string, number> = {};
    for (const d of deals) map[d.modality] = (map[d.modality] ?? 0) + 1;
    return map;
  }, [deals]);
  const topModality = Object.entries(modalityCounts).sort(
    ([, a], [, b]) => b - a
  )[0];

  const largestDeal = useMemo(
    () => [...deals].sort((a, b) => b.valueB - a.valueB)[0],
    [deals]
  );

  // Bar chart: deal value by modality stacked by year
  const modalityYearData = useMemo(() => {
    const map: Record<string, Record<number, number>> = {};
    for (const d of deals) {
      if (!map[d.modality]) map[d.modality] = {};
      map[d.modality][d.year] = (map[d.modality][d.year] ?? 0) + d.valueB;
    }
    // Flatten to recharts format: [{modality, 2023, 2024, 2025, 2026}]
    return Object.entries(map)
      .map(([mod, years]) => ({
        modality: mod,
        ...years,
      }))
      .sort((a, b) => {
        const numVals = (obj: Record<string, unknown>) =>
          Object.values(obj).reduce((s: number, v) => s + (typeof v === "number" ? v : 0), 0);
        return numVals(b) - numVals(a);
      });
  }, [deals]);

  // Premium by modality
  const premiumByModality = useMemo(() => {
    const map: Record<string, { sum: number; count: number }> = {};
    for (const d of deals) {
      if (d.premiumPct !== null) {
        if (!map[d.modality]) map[d.modality] = { sum: 0, count: 0 };
        map[d.modality].sum += d.premiumPct;
        map[d.modality].count += 1;
      }
    }
    return Object.entries(map)
      .map(([mod, { sum, count }]) => ({
        modality: mod,
        avg: Math.round(sum / count),
      }))
      .sort((a, b) => b.avg - a.avg);
  }, [deals]);

  const YEARS_STACKED = [2023, 2024, 2025, 2026];
  const YEAR_COLORS = ["#6366f1", "#06b6d4", "#f59e0b", "#f43f5e"];

  function CustomTooltipValue({ active, payload, label }: any) {
    if (!active || !payload?.length) return null;
    const total = payload.reduce(
      (s: number, p: any) => s + (p.value ?? 0),
      0
    );
    return (
      <div className="bg-[#0f1117] border border-white/12 rounded-lg p-2.5 text-[11px] font-mono shadow-xl">
        <div className="text-slate-300 mb-1.5 font-semibold">{label}</div>
        {payload.map((p: any) => (
          <div key={p.dataKey} className="flex items-center gap-2 mb-0.5">
            <span
              className="w-2 h-2 rounded-full inline-block"
              style={{ background: p.fill }}
            />
            <span className="text-slate-400">{p.dataKey}</span>
            <span className="ml-auto text-white">{fmtB(p.value)}</span>
          </div>
        ))}
        <div className="border-t border-white/10 mt-1.5 pt-1 flex justify-between">
          <span className="text-slate-400">Total</span>
          <span className="text-cyan-300 font-semibold">{fmtB(total)}</span>
        </div>
      </div>
    );
  }

  function CustomTooltipPremium({ active, payload, label }: any) {
    if (!active || !payload?.length) return null;
    return (
      <div className="bg-[#0f1117] border border-white/12 rounded-lg p-2.5 text-[11px] font-mono shadow-xl">
        <div className="text-slate-300 font-semibold">{label}</div>
        <div className="mt-1 text-emerald-400 font-semibold">
          Avg premium: +{payload[0].value}%
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* KPI row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <KpiCard
          label="Total Deal Value"
          value={fmtB(totalValue)}
          sub={`${deals.length} deals`}
          accent="#06b6d4"
        />
        <KpiCard
          label="Avg Premium Paid"
          value={`+${avgPremium.toFixed(0)}%`}
          sub={`${validPremiums.length} deals disclosed`}
          accent="#22c55e"
        />
        <KpiCard
          label="Top Modality"
          value={topModality?.[0] ?? "—"}
          sub={`${topModality?.[1] ?? 0} acquisitions`}
          accent={MODALITY_COLORS[topModality?.[0] as Modality] ?? "#f1f5f9"}
        />
        <KpiCard
          label="Largest Deal"
          value={fmtB(largestDeal?.valueB ?? 0)}
          sub={`${largestDeal?.acquirer} / ${largestDeal?.target}`}
          accent="#f43f5e"
        />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Deal value by modality */}
        <div className="rounded-xl border border-white/8 bg-white/2 p-4">
          <div className="text-[10px] font-mono uppercase tracking-widest text-slate-400 mb-3">
            Deal Value by Modality (stacked by year)
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart
              data={modalityYearData}
              margin={{ top: 4, right: 8, bottom: 60, left: 8 }}
            >
              <XAxis
                dataKey="modality"
                tick={{ fill: "#64748b", fontSize: 9, fontFamily: "JetBrains Mono, monospace" }}
                angle={-35}
                textAnchor="end"
                interval={0}
              />
              <YAxis
                tick={{ fill: "#475569", fontSize: 9, fontFamily: "JetBrains Mono, monospace" }}
                tickFormatter={(v) => `$${v}B`}
              />
              <Tooltip content={<CustomTooltipValue />} />
              {YEARS_STACKED.map((yr, i) => (
                <Bar
                  key={yr}
                  dataKey={yr}
                  stackId="a"
                  fill={YEAR_COLORS[i]}
                  radius={i === YEARS_STACKED.length - 1 ? [3, 3, 0, 0] : [0, 0, 0, 0]}
                />
              ))}
              <Legend
                wrapperStyle={{
                  fontSize: 9,
                  fontFamily: "JetBrains Mono, monospace",
                  color: "#64748b",
                  paddingTop: 8,
                }}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Avg premium by modality */}
        <div className="rounded-xl border border-white/8 bg-white/2 p-4">
          <div className="text-[10px] font-mono uppercase tracking-widest text-slate-400 mb-3">
            Average Acquisition Premium by Modality
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart
              data={premiumByModality}
              layout="vertical"
              margin={{ top: 4, right: 40, bottom: 4, left: 4 }}
            >
              <XAxis
                type="number"
                tick={{ fill: "#475569", fontSize: 9, fontFamily: "JetBrains Mono, monospace" }}
                tickFormatter={(v) => `${v}%`}
              />
              <YAxis
                dataKey="modality"
                type="category"
                tick={{ fill: "#64748b", fontSize: 9, fontFamily: "JetBrains Mono, monospace" }}
                width={90}
              />
              <Tooltip content={<CustomTooltipPremium />} />
              <Bar dataKey="avg" radius={[0, 3, 3, 0]}>
                {premiumByModality.map((entry) => (
                  <Cell
                    key={entry.modality}
                    fill={MODALITY_COLORS[entry.modality as Modality] ?? "#64748b"}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

// ─── Target Score Logic ──────────────────────────────────────────────────────

/** Hot modalities that acquirers are paying up for */
const HOT_MODALITIES: Modality[] = ["ADC", "Bispecific", "RNAi", "CAR-T", "Radiopharmaceutical"];

/** Acquirer affinity: which big pharma needs which modality */
const ACQUIRER_MAP: Record<string, { acquirer: string; rationale: string }[]> = {
  ADC: [
    { acquirer: "Pfizer", rationale: "Seagen integration — ADC capacity hungry" },
    { acquirer: "AbbVie", rationale: "ADC primary modality, Elahere follow-on" },
  ],
  Bispecific: [
    { acquirer: "J&J", rationale: "biTE expansion post-Rybrevant success" },
    { acquirer: "Amgen", rationale: "BiTE platform — acquiring data" },
    { acquirer: "Genmab", rationale: "Active acquirer (Merus $8B 2025)" },
  ],
  RNAi: [
    { acquirer: "Novartis", rationale: "Avidity $12B — wants more RNA assets" },
    { acquirer: "AbbVie", rationale: "Capstan deal — in vivo RNA platform" },
  ],
  "CAR-T": [
    { acquirer: "Gilead", rationale: "Arcellx — BCMA franchise build-out" },
    { acquirer: "Roche", rationale: "Poseida allogeneic CAR-T 2025" },
  ],
  Radiopharmaceutical: [
    { acquirer: "BMS", rationale: "RayzeBio $4.1B — alpha-emitter build" },
    { acquirer: "AstraZeneca", rationale: "Fusion Pharma $2.4B — alpha RPT" },
  ],
  "Gene Therapy": [
    { acquirer: "Sanofi", rationale: "Rare disease pipeline gaps" },
    { acquirer: "Novartis", rationale: "Zolgensma platform adjacency" },
  ],
  mAb: [
    { acquirer: "Merck", rationale: "Keytruda LOE 2028 — next immunotherapy" },
    { acquirer: "Roche", rationale: "mAb platform leader" },
  ],
  "Small Molecule": [
    { acquirer: "J&J", rationale: "CNS small molecule (Intra-Cellular play)" },
    { acquirer: "Merck", rationale: "Verona Pharma COPD model" },
    { acquirer: "Pfizer", rationale: "Metsera GLP-1 small molecule access" },
  ],
  mRNA: [
    { acquirer: "Pfizer", rationale: "mRNA vaccine/oncology adjacency" },
    { acquirer: "Merck", rationale: "mRNA-4157 partnership — pipeline expansion" },
  ],
  CRISPR: [
    { acquirer: "Vertex", rationale: "Casgevy partner, next gene-editing play" },
    { acquirer: "Novartis", rationale: "Cell/gene therapy platform" },
  ],
  ASO: [
    { acquirer: "Biogen", rationale: "ASO CNS heritage" },
    { acquirer: "Roche", rationale: "Antisense CNS pipeline" },
  ],
  Other: [
    { acquirer: "Novo Nordisk", rationale: "GLP-1/metabolic adjacent assets" },
  ],
};

interface TargetScore {
  company: CompanyPipeline;
  score: number;
  breakdown: string;
  likelyAcquirer: string;
  acquirerRationale: string;
}

function computeTargetScore(c: CompanyPipeline): TargetScore {
  let score = 0;
  const reasons: string[] = [];

  // Market cap: <$5B = 30pts, $5-10B = 20, $10-20B = 10, >$20B = 0
  if (c.marketCapB < 5) { score += 30; reasons.push("micro-cap (<$5B)"); }
  else if (c.marketCapB < 10) { score += 20; reasons.push("small-cap (<$10B)"); }
  else if (c.marketCapB < 20) { score += 10; reasons.push("mid-cap (<$20B)"); }

  // Hot modality
  if (HOT_MODALITIES.includes(c.primaryModality)) {
    score += 25;
    reasons.push(`hot modality (${c.primaryModality})`);
  }

  // Phase 3 programs (each is +8 pts, max 24)
  const p3pts = Math.min(c.phase3 * 8, 24);
  if (c.phase3 > 0) { score += p3pts; reasons.push(`${c.phase3} Phase 3 programs`); }

  // Has approved products (reduces urgency but shows derisked platform)
  if (c.approved > 0 && c.approved <= 3) { score += 10; reasons.push("derisked platform"); }
  else if (c.approved > 3) { score += 5; }

  // Performance signal
  if (c.performancePct > 50) { score += 5; reasons.push("hot stock signal"); }

  // Normalize to 100
  const normalizedScore = Math.min(Math.round((score / 94) * 100), 99);

  const acquirerList = ACQUIRER_MAP[c.primaryModality] ?? [];
  const best = acquirerList[0] ?? { acquirer: "Strategic buyer", rationale: "Asset-specific interest" };

  return {
    company: c,
    score: normalizedScore,
    breakdown: reasons.slice(0, 3).join(", "),
    likelyAcquirer: best.acquirer,
    acquirerRationale: best.rationale,
  };
}

// ─── Who's Next Table ────────────────────────────────────────────────────────

type SortKey = "score" | "marketCapB" | "phase3";
type SortDir = "asc" | "desc";

function WhosNextTable() {
  const [sortKey, setSortKey] = useState<SortKey>("score");
  const [sortDir, setSortDir] = useState<SortDir>("desc");

  const scoredCompanies = useMemo(
    () => companyPipelines.map(computeTargetScore),
    []
  );

  const sorted = useMemo(() => {
    return [...scoredCompanies].sort((a, b) => {
      let av: number, bv: number;
      if (sortKey === "score") { av = a.score; bv = b.score; }
      else if (sortKey === "marketCapB") { av = a.company.marketCapB; bv = b.company.marketCapB; }
      else { av = a.company.phase3; bv = b.company.phase3; }
      return sortDir === "desc" ? bv - av : av - bv;
    });
  }, [scoredCompanies, sortKey, sortDir]);

  function toggleSort(key: SortKey) {
    if (sortKey === key) setSortDir((d) => (d === "desc" ? "asc" : "desc"));
    else { setSortKey(key); setSortDir("desc"); }
  }

  function SortIndicator({ col }: { col: SortKey }) {
    if (sortKey !== col) return <span className="text-slate-600 ml-1">↕</span>;
    return (
      <span className="text-cyan-400 ml-1">
        {sortDir === "desc" ? "↓" : "↑"}
      </span>
    );
  }

  function ScoreBar({ score }: { score: number }) {
    const color =
      score >= 70 ? "#f43f5e" : score >= 50 ? "#f59e0b" : "#06b6d4";
    return (
      <div className="flex items-center gap-2">
        <div className="h-1.5 w-20 bg-white/8 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{ width: `${score}%`, background: color }}
          />
        </div>
        <span
          className="text-[11px] font-mono font-semibold"
          style={{ color }}
        >
          {score}
        </span>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-white/8 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-[11px] font-mono">
          <thead>
            <tr className="border-b border-white/8 bg-white/3">
              <th className="text-left px-3 py-2.5 text-slate-400 font-semibold uppercase tracking-wider">
                Company
              </th>
              <th className="text-left px-3 py-2.5 text-slate-400 font-semibold uppercase tracking-wider">
                Ticker
              </th>
              <th
                className="text-left px-3 py-2.5 text-slate-400 font-semibold uppercase tracking-wider cursor-pointer hover:text-slate-200 select-none"
                onClick={() => toggleSort("marketCapB")}
              >
                Mkt Cap <SortIndicator col="marketCapB" />
              </th>
              <th className="text-left px-3 py-2.5 text-slate-400 font-semibold uppercase tracking-wider">
                Modality
              </th>
              <th
                className="text-left px-3 py-2.5 text-slate-400 font-semibold uppercase tracking-wider cursor-pointer hover:text-slate-200 select-none"
                onClick={() => toggleSort("phase3")}
              >
                Ph3 <SortIndicator col="phase3" />
              </th>
              <th
                className="text-left px-3 py-2.5 text-slate-400 font-semibold uppercase tracking-wider cursor-pointer hover:text-slate-200 select-none whitespace-nowrap"
                onClick={() => toggleSort("score")}
              >
                Target Score <SortIndicator col="score" />
              </th>
              <th className="text-left px-3 py-2.5 text-slate-400 font-semibold uppercase tracking-wider">
                Likely Acquirer
              </th>
              <th className="text-left px-3 py-2.5 text-slate-400 font-semibold uppercase tracking-wider hidden xl:table-cell">
                Rationale
              </th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((item, i) => (
              <motion.tr
                key={item.company.ticker}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.02 }}
                className="border-b border-white/4 hover:bg-white/3 transition-colors duration-100"
              >
                <td className="px-3 py-2.5 text-slate-200 font-semibold whitespace-nowrap">
                  {item.company.company}
                </td>
                <td className="px-3 py-2.5 text-slate-400">
                  {item.company.ticker}
                </td>
                <td className="px-3 py-2.5 text-slate-300">
                  {fmtB(item.company.marketCapB)}
                </td>
                <td className="px-3 py-2.5">
                  <ModalityBadge modality={item.company.primaryModality} />
                </td>
                <td className="px-3 py-2.5 text-slate-300">
                  {item.company.phase3}
                </td>
                <td className="px-3 py-2.5">
                  <ScoreBar score={item.score} />
                </td>
                <td className="px-3 py-2.5 text-slate-300 whitespace-nowrap">
                  {item.likelyAcquirer}
                </td>
                <td className="px-3 py-2.5 text-slate-500 max-w-[220px] hidden xl:table-cell">
                  <span className="line-clamp-1">{item.acquirerRationale}</span>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── Main Page ───────────────────────────────────────────────────────────────

export default function DealFlow() {
  // Filter state
  const [yearFilter, setYearFilter] = useState<string>("All");
  const [modalityFilter, setModalityFilter] = useState<string>("All");
  const [sizeFilter, setSizeFilter] = useState<number>(0);

  // Get unique modalities in the deal set
  const allModalities = useMemo(() => {
    const s = new Set(mnaDeals.map((d) => d.modality));
    return ["All", ...Array.from(s)];
  }, []);

  const filteredDeals = useMemo(() => {
    return mnaDeals.filter((d) => {
      if (yearFilter !== "All" && d.year !== parseInt(yearFilter)) return false;
      if (modalityFilter !== "All" && d.modality !== modalityFilter) return false;
      if (d.valueB < sizeFilter) return false;
      return true;
    });
  }, [yearFilter, modalityFilter, sizeFilter]);

  return (
    <div
      className="min-h-screen p-6 space-y-8"
      style={{ background: "#0f1117", fontFamily: "Inter, sans-serif" }}
    >
      {/* Page header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="border-b border-white/8 pb-5"
      >
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <svg
                width="18"
                height="18"
                viewBox="0 0 18 18"
                fill="none"
                className="text-cyan-400"
              >
                <rect
                  x="2"
                  y="10"
                  width="3"
                  height="6"
                  rx="1"
                  fill="currentColor"
                  opacity="0.4"
                />
                <rect
                  x="7"
                  y="6"
                  width="3"
                  height="10"
                  rx="1"
                  fill="currentColor"
                  opacity="0.7"
                />
                <rect
                  x="12"
                  y="2"
                  width="3"
                  height="14"
                  rx="1"
                  fill="currentColor"
                />
              </svg>
              <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">
                Deal Flow
              </span>
            </div>
            <h1 className="text-xl font-bold text-slate-100 tracking-tight">
              M&A Tracker
            </h1>
            <p className="text-[12px] text-slate-500 mt-1 font-mono">
              23 deals · 2023–2026 · $
              {mnaDeals.reduce((s, d) => s + d.valueB, 0).toFixed(0)}B total deal value
            </p>
          </div>

          {/* Legend */}
          <div className="flex flex-wrap gap-2 items-center">
            {(["ADC", "Bispecific", "Small Molecule", "mAb", "CAR-T", "RNAi"] as Modality[]).map(
              (m) => (
                <div key={m} className="flex items-center gap-1.5">
                  <div
                    className="w-2 h-2 rounded-full"
                    style={{ background: MODALITY_COLORS[m] }}
                  />
                  <span className="text-[10px] font-mono text-slate-500">{m}</span>
                </div>
              )
            )}
          </div>
        </div>
      </motion.div>

      {/* ── Section 1: Deal Timeline ─────────────────────────────────────────── */}
      <motion.section
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="rounded-xl border border-white/8 bg-white/2 p-5"
      >
        <div className="flex flex-wrap items-start justify-between gap-4 mb-5">
          <SectionHeader
            title="Deal Timeline"
            subtitle="Bubbles sized by deal value — hover for details"
          />

          {/* Filters */}
          <div className="flex flex-wrap gap-2">
            {/* Year */}
            <div className="flex gap-1 items-center">
              <span className="text-[10px] font-mono text-slate-500 mr-1">Year:</span>
              {YEARS.map((y) => (
                <FilterPill
                  key={y}
                  active={yearFilter === y}
                  onClick={() => setYearFilter(y)}
                >
                  {y}
                </FilterPill>
              ))}
            </div>

            {/* Size */}
            <div className="flex gap-1 items-center">
              <span className="text-[10px] font-mono text-slate-500 mr-1">Size:</span>
              {SIZE_FILTERS.map((f) => (
                <FilterPill
                  key={f.label}
                  active={sizeFilter === f.minB}
                  onClick={() => setSizeFilter(f.minB)}
                >
                  {f.label}
                </FilterPill>
              ))}
            </div>

            {/* Modality */}
            <div className="flex gap-1 items-center flex-wrap">
              <span className="text-[10px] font-mono text-slate-500 mr-1">
                Modality:
              </span>
              {allModalities.map((m) => (
                <FilterPill
                  key={m}
                  active={modalityFilter === m}
                  onClick={() => setModalityFilter(m)}
                >
                  {m}
                </FilterPill>
              ))}
            </div>
          </div>
        </div>

        {filteredDeals.length === 0 ? (
          <div className="flex items-center justify-center h-40 text-slate-500 text-sm font-mono">
            No deals match the current filters
          </div>
        ) : (
          <DealTimeline deals={filteredDeals} />
        )}

        {/* Deal count indicator */}
        <div className="mt-3 flex items-center gap-2">
          <span className="text-[11px] font-mono text-slate-500">
            Showing{" "}
            <span className="text-cyan-400 font-semibold">
              {filteredDeals.length}
            </span>{" "}
            of {mnaDeals.length} deals
          </span>
          <span className="text-slate-700">·</span>
          <span className="text-[11px] font-mono text-slate-500">
            Total:{" "}
            <span className="text-emerald-400 font-semibold">
              {fmtB(filteredDeals.reduce((s, d) => s + d.valueB, 0))}
            </span>
          </span>
        </div>
      </motion.section>

      {/* ── Section 2: Analytics ─────────────────────────────────────────────── */}
      <motion.section
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <SectionHeader
          title="Deal Analytics"
          subtitle="KPIs and modality breakdown across all 23 transactions"
        />
        <DealAnalytics deals={mnaDeals} />
      </motion.section>

      {/* ── Section 3: Who's Next ─────────────────────────────────────────────── */}
      <motion.section
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
      >
        <SectionHeader
          title={`"Who's Next?" Acquisition Target Screener`}
          subtitle="Companies scored by acquisition desirability — market cap, hot modality, Phase 3 pipeline, and strategic fit with likely acquirers"
        />

        {/* Score legend */}
        <div className="flex gap-4 mb-4">
          {[
            { label: "High (70+)", color: "#f43f5e" },
            { label: "Medium (50–69)", color: "#f59e0b" },
            { label: "Emerging (<50)", color: "#06b6d4" },
          ].map(({ label, color }) => (
            <div key={label} className="flex items-center gap-1.5">
              <div
                className="w-2 h-2 rounded-full"
                style={{ background: color }}
              />
              <span className="text-[10px] font-mono text-slate-500">
                {label}
              </span>
            </div>
          ))}
        </div>

        <WhosNextTable />

        <p className="mt-3 text-[10px] text-slate-600 font-mono">
          Score methodology: market cap &lt;$20B (+10–30pts), hot modality (+25pts), Phase 3 count (+8pts each, max 24), derisked platform (+10pts). Normalized to 100. Not investment advice.
        </p>
      </motion.section>
    </div>
  );
}
