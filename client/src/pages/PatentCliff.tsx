import { useState, useMemo, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  Legend,
  LabelList,
} from "recharts";

// ── Patent Cliff Data ─────────────────────────────────────────────────────────

type PhaseLevel = "Approved" | "Phase 3" | "Phase 2" | "Discovery";

interface ReplacementDrug {
  name: string;
  phase: PhaseLevel;
  modality: string;
  description: string;
}

interface PatentCliffEntry {
  drug: string;
  brandNote?: string;           // e.g. "pembrolizumab"
  company: string;
  ticker: string;
  peakRevenueB: number;         // $B/yr
  patentExpiryStart: number;    // year
  patentExpiryEnd: number;      // year (same if single year)
  status: "Active Cliff" | "Biosimilars Live" | "Generics Entering" | "Protected";
  expiryNote: string;
  replacements: ReplacementDrug[];
  color: string;                // company brand color
  revenueAtRiskB: number;       // revenue specifically within next 5 years (2026-2031)
}

const PATENT_CLIFFS: PatentCliffEntry[] = [
  {
    drug: "Humira",
    brandNote: "adalimumab",
    company: "AbbVie",
    ticker: "ABBV",
    peakRevenueB: 21,
    patentExpiryStart: 2023,
    patentExpiryEnd: 2023,
    status: "Biosimilars Live",
    expiryNote: "US biosimilars launched Jan 2023",
    replacements: [
      { name: "Skyrizi (risankizumab)", phase: "Approved", modality: "mAb", description: "IL-23 inhibitor; $12B+ peak sales potential across psoriasis, IBD, PsA" },
      { name: "Rinvoq (upadacitinib)", phase: "Approved", modality: "Small Molecule", description: "JAK1 inhibitor; $10B+ peak sales potential; approved 7+ indications" },
    ],
    color: "#06b6d4",
    revenueAtRiskB: 0,  // biosimilars already eating share
  },
  {
    drug: "Revlimid",
    brandNote: "lenalidomide",
    company: "Bristol Myers Squibb",
    ticker: "BMY",
    peakRevenueB: 12,
    patentExpiryStart: 2026,
    patentExpiryEnd: 2026,
    status: "Generics Entering",
    expiryNote: "Generic entry began 2026 per patent settlement",
    replacements: [
      { name: "Breyanzi (lisocabtagene)", phase: "Approved", modality: "CAR-T", description: "CD19 CAR-T; approved 2nd-line LBCL; expanding to earlier lines" },
      { name: "Abecma (idecabtagene)", phase: "Approved", modality: "CAR-T", description: "BCMA CAR-T; approved RRMM; competitive pressure from ciltacabtagene" },
    ],
    color: "#f43f5e",
    revenueAtRiskB: 8,
  },
  {
    drug: "Stelara",
    brandNote: "ustekinumab",
    company: "Johnson & Johnson",
    ticker: "JNJ",
    peakRevenueB: 11,
    patentExpiryStart: 2025,
    patentExpiryEnd: 2025,
    status: "Biosimilars Live",
    expiryNote: "US & EU biosimilars entering 2025",
    replacements: [
      { name: "Tremfya (guselkumab)", phase: "Approved", modality: "mAb", description: "IL-23 subunit p19 inhibitor; plaque psoriasis, PsA; differentiated vs. ustekinumab" },
      { name: "Rybrevant + Lazcluze", phase: "Approved", modality: "Bispecific", description: "EGFR×MET bispecific + 3G EGFR-TKI combo; PDUFA Apr 2026; 1L NSCLC" },
    ],
    color: "#dc2626",
    revenueAtRiskB: 5,
  },
  {
    drug: "Eliquis",
    brandNote: "apixaban",
    company: "BMS / Pfizer",
    ticker: "BMY/PFE",
    peakRevenueB: 18,
    patentExpiryStart: 2026,
    patentExpiryEnd: 2028,
    status: "Active Cliff",
    expiryNote: "US patent 2026 (BMS) to 2028 (extended); generics by 2028",
    replacements: [
      { name: "Milvexian", phase: "Phase 3", modality: "Small Molecule", description: "Factor XIa inhibitor; Phase 3 LIBREXIA studies in ACS, AFib, stroke prevention" },
    ],
    color: "#f43f5e",
    revenueAtRiskB: 14,
  },
  {
    drug: "Opdivo",
    brandNote: "nivolumab",
    company: "Bristol Myers Squibb",
    ticker: "BMY",
    peakRevenueB: 9,
    patentExpiryStart: 2028,
    patentExpiryEnd: 2030,
    status: "Active Cliff",
    expiryNote: "Core patent 2028; formulation extends to 2030",
    replacements: [
      { name: "Opdualag (relatlimab+nivo)", phase: "Approved", modality: "Bispecific", description: "First LAG-3+PD-1 fixed combo; approved melanoma; expanding to NSCLC, GI" },
      { name: "Iza-bren ADC (izalontamab)", phase: "Phase 3", modality: "ADC", description: "EGFR-targeting ADC via SystImmune; Phase 3 TNBC; NSCLC potential" },
    ],
    color: "#f43f5e",
    revenueAtRiskB: 7,
  },
  {
    drug: "Keytruda",
    brandNote: "pembrolizumab",
    company: "Merck & Co.",
    ticker: "MRK",
    peakRevenueB: 25,
    patentExpiryStart: 2028,
    patentExpiryEnd: 2028,
    status: "Active Cliff",
    expiryNote: "Core US patent expires Sep 2028; subcutaneous formulation extends",
    replacements: [
      { name: "MK-2010 bispecific", phase: "Phase 2", modality: "Bispecific", description: "PD-1×VEGF bispecific; preclinical/early data; designed to maintain IO franchise" },
      { name: "MK-1026 (nemtabrutinib)", phase: "Phase 3", modality: "Small Molecule", description: "Non-covalent BTK inhibitor; CLL, non-GCB DLBCL; Phase 3 data expected 2026" },
      { name: "CD388 (Cidara)", phase: "Phase 3", modality: "Other", description: "Multivalent antifungal-flu prevention; acquired via Cidara ($9.2B); Phase 3" },
    ],
    color: "#3b82f6",
    revenueAtRiskB: 20,
  },
  {
    drug: "Imbruvica",
    brandNote: "ibrutinib",
    company: "AbbVie / J&J",
    ticker: "ABBV/JNJ",
    peakRevenueB: 5,
    patentExpiryStart: 2027,
    patentExpiryEnd: 2029,
    status: "Active Cliff",
    expiryNote: "Compound patent 2027; extended to 2029 via method-of-use patents",
    replacements: [
      { name: "Epkinly (epcoritamab)", phase: "Approved", modality: "Bispecific", description: "CD3×CD20 bispecific; approved DLBCL; expanding to follicular, CLL" },
    ],
    color: "#06b6d4",
    revenueAtRiskB: 4,
  },
  {
    drug: "Eylea",
    brandNote: "aflibercept",
    company: "Regeneron",
    ticker: "REGN",
    peakRevenueB: 10,
    patentExpiryStart: 2027,
    patentExpiryEnd: 2027,
    status: "Active Cliff",
    expiryNote: "Biosimilar expected 2027; Biocon/Samsung biosimilars in FDA review",
    replacements: [
      { name: "Eylea HD (aflibercept 8mg)", phase: "Approved", modality: "mAb", description: "High-dose extended-interval formulation; approved nAMD, DME; 16-week dosing" },
      { name: "Faricimab competition (Vabysmo)", phase: "Approved", modality: "Bispecific", description: "Roche/Genentech bispecific Ang-2×VEGF; gaining share; 16–24 week dosing" },
    ],
    color: "#a855f7",
    revenueAtRiskB: 6,
  },
  {
    drug: "Biktarvy",
    brandNote: "bictegravir/FTC/TAF",
    company: "Gilead Sciences",
    ticker: "GILD",
    peakRevenueB: 13,
    patentExpiryStart: 2033,
    patentExpiryEnd: 2033,
    status: "Protected",
    expiryNote: "Patent through 2033 but lenacapavir disruption risk",
    replacements: [
      { name: "Lenacapavir (Sunlenca)", phase: "Approved", modality: "Small Molecule", description: "Twice-yearly capsid inhibitor; approved HIV-1 salvage; PURPOSE-1/2 PrEP trial (HIV prevention, Phase 3)" },
    ],
    color: "#f59e0b",
    revenueAtRiskB: 0,
  },
  {
    drug: "Dupixent",
    brandNote: "dupilumab",
    company: "Regeneron / Sanofi",
    ticker: "REGN",
    peakRevenueB: 13,
    patentExpiryStart: 2031,
    patentExpiryEnd: 2031,
    status: "Protected",
    expiryNote: "Composition-of-matter patent 2031; continued label expansions",
    replacements: [
      { name: "Itepekimab (REGN-3500)", phase: "Phase 3", modality: "mAb", description: "Anti-IL-33 mAb; Phase 3 asthma; potential in COPD beyond dupilumab" },
      { name: "REGN-EB (bispecific)", phase: "Phase 2", modality: "Bispecific", description: "Bispecific targeting Th2 pathway; early-stage potential next-gen immunology" },
    ],
    color: "#a855f7",
    revenueAtRiskB: 0,
  },
  {
    drug: "Ozempic / Wegovy",
    brandNote: "semaglutide",
    company: "Novo Nordisk",
    ticker: "NVO",
    peakRevenueB: 25,
    patentExpiryStart: 2031,
    patentExpiryEnd: 2032,
    status: "Protected",
    expiryNote: "Core patents 2031-2032; earlier expiry in some markets",
    replacements: [
      { name: "CagriSema (cagrilintide+sema)", phase: "Phase 3", modality: "Other", description: "Dual amylin+GLP-1 agonist; Phase 3 REDEFINE trials; Phase 3 Triumph readout H1 2026" },
      { name: "Oral semaglutide (Rybelsus)", phase: "Approved", modality: "Small Molecule", description: "Approved oral GLP-1 for T2D; expanding obesity indication; OASIS trial data" },
    ],
    color: "#22c55e",
    revenueAtRiskB: 0,
  },
  {
    drug: "Mounjaro / Zepbound",
    brandNote: "tirzepatide",
    company: "Eli Lilly",
    ticker: "LLY",
    peakRevenueB: 15,
    patentExpiryStart: 2036,
    patentExpiryEnd: 2036,
    status: "Protected",
    expiryNote: "Composition-of-matter patent 2036; significant runway",
    replacements: [
      { name: "Orforglipron (Foundayo)", phase: "Phase 3", modality: "Small Molecule", description: "Oral GLP-1 receptor agonist; PDUFA Apr 10, 2026 for obesity; non-peptide molecule" },
      { name: "Retatrutide", phase: "Phase 3", modality: "Other", description: "GLP-1/GIP/glucagon triple agonist; Phase 3 ongoing; ~24% weight loss in Phase 2" },
    ],
    color: "#f59e0b",
    revenueAtRiskB: 0,
  },
];

// ── Colours & helpers ─────────────────────────────────────────────────────────

const TODAY_YEAR = 2026;
const CHART_START = 2024;
const CHART_END   = 2037;

const PHASE_COLORS: Record<PhaseLevel, string> = {
  Approved:    "#22c55e",
  "Phase 3":   "#f59e0b",
  "Phase 2":   "#f97316",
  Discovery:   "#ef4444",
};

const STATUS_COLORS: Record<string, string> = {
  "Active Cliff":       "#ef4444",
  "Biosimilars Live":   "#f97316",
  "Generics Entering":  "#f59e0b",
  "Protected":          "#22c55e",
};

function ReplacementReadiness(replacements: ReplacementDrug[]): "green" | "yellow" | "red" {
  if (replacements.length === 0) return "red";
  const best = replacements.reduce((a, b) => {
    const rank = { Approved: 4, "Phase 3": 3, "Phase 2": 2, Discovery: 1 };
    return rank[a.phase] >= rank[b.phase] ? a : b;
  });
  if (best.phase === "Approved") return "green";
  if (best.phase === "Phase 3") return "yellow";
  return "red";
}

function ReadinessIcon({ level }: { level: "green" | "yellow" | "red" }) {
  const colors = { green: "#22c55e", yellow: "#f59e0b", red: "#ef4444" };
  const labels = { green: "Replacement Ready", yellow: "Phase 3 (watch)", red: "Phase 2 / Gap Risk" };
  const c = colors[level];
  return (
    <span
      className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-semibold"
      style={{ color: c, background: `${c}15`, border: `1px solid ${c}30` }}
    >
      <span className="w-1.5 h-1.5 rounded-full inline-block flex-shrink-0" style={{ background: c }} />
      {labels[level]}
    </span>
  );
}

function formatRevenue(b: number) {
  return `$${b}B`;
}

// ── Company revenue-at-risk aggregation ──────────────────────────────────────

function buildRevenueAtRiskData() {
  const companyMap: Record<string, { name: string; ticker: string; color: string; total: number; drugs: string[] }> = {};

  for (const cliff of PATENT_CLIFFS) {
    if (cliff.revenueAtRiskB <= 0) continue;
    // Some entries share a company name across tickers
    const key = cliff.ticker;
    const compNames = cliff.company.split(" / ");
    const tickerParts = cliff.ticker.split("/");
    for (let i = 0; i < tickerParts.length; i++) {
      const t = tickerParts[i].trim();
      const c = compNames[i]?.trim() ?? compNames[0];
      if (!companyMap[t]) {
        companyMap[t] = { name: c, ticker: t, color: cliff.color, total: 0, drugs: [] };
      }
      // Split revenue evenly for shared drugs
      const share = cliff.revenueAtRiskB / tickerParts.length;
      companyMap[t].total += share;
      companyMap[t].drugs.push(cliff.drug);
    }
  }

  return Object.values(companyMap)
    .sort((a, b) => b.total - a.total)
    .map((c) => ({ ...c, total: Math.round(c.total * 10) / 10 }));
}

// ── Tooltip (Recharts) ────────────────────────────────────────────────────────

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#1a1d2a] border border-white/10 rounded-lg p-3 text-xs shadow-xl min-w-[160px]">
      <p className="font-semibold text-white mb-1.5">{label}</p>
      {payload.map((p: any) => (
        <div key={p.dataKey} className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: p.fill }} />
          <span className="text-muted-foreground">{p.name ?? p.dataKey}:</span>
          <span className="font-mono font-semibold text-white">${p.value}B</span>
        </div>
      ))}
    </div>
  );
}

// ── SVG Timeline ──────────────────────────────────────────────────────────────

interface TooltipState {
  entry: PatentCliffEntry;
  x: number;
  y: number;
}

function PatentTimeline() {
  const [hovered, setHovered] = useState<TooltipState | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  const WIDTH  = 860;
  const HEIGHT = 340;
  const PAD_LEFT  = 160;
  const PAD_RIGHT  = 20;
  const PAD_TOP    = 24;
  const PAD_BOTTOM = 32;

  const CHART_W = WIDTH  - PAD_LEFT - PAD_RIGHT;
  const CHART_H = HEIGHT - PAD_TOP  - PAD_BOTTOM;

  const years = Array.from({ length: CHART_END - CHART_START + 1 }, (_, i) => CHART_START + i);
  const xScale = (year: number) => ((year - CHART_START) / (CHART_END - CHART_START)) * CHART_W;

  // Sort by patent expiry start
  const sorted = [...PATENT_CLIFFS].sort((a, b) => a.patentExpiryStart - b.patentExpiryStart);

  const ROW_H = CHART_H / sorted.length;
  const BAR_H = Math.min(ROW_H * 0.55, 20);

  // Max revenue for height scaling
  const maxRev = Math.max(...PATENT_CLIFFS.map((c) => c.peakRevenueB));

  const handleMouseEnter = useCallback((entry: PatentCliffEntry, rowIndex: number, e: React.MouseEvent<SVGRectElement>) => {
    const svgRect = svgRef.current?.getBoundingClientRect();
    if (!svgRect) return;
    const bx = e.clientX - svgRect.left;
    const by = e.clientY - svgRect.top;
    setHovered({ entry, x: bx, y: by });
  }, []);

  const handleMouseLeave = useCallback(() => setHovered(null), []);

  return (
    <div className="relative w-full overflow-x-auto">
      <svg
        ref={svgRef}
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        className="w-full"
        style={{ minWidth: "600px" }}
        onMouseLeave={handleMouseLeave}
      >
        {/* Background grid */}
        {years.map((yr) => {
          const x = PAD_LEFT + xScale(yr);
          const isTodayLine = yr === TODAY_YEAR;
          return (
            <g key={yr}>
              <line
                x1={x} y1={PAD_TOP}
                x2={x} y2={HEIGHT - PAD_BOTTOM}
                stroke={isTodayLine ? "#ef4444" : "rgba(255,255,255,0.06)"}
                strokeWidth={isTodayLine ? 1.5 : 0.5}
                strokeDasharray={isTodayLine ? "4 3" : undefined}
              />
              <text
                x={x} y={HEIGHT - PAD_BOTTOM + 14}
                textAnchor="middle"
                fontSize="9"
                fontFamily="JetBrains Mono, monospace"
                fill={isTodayLine ? "#ef4444" : "rgba(255,255,255,0.3)"}
              >
                {yr % 2 === 0 || isTodayLine ? yr : ""}
              </text>
              {isTodayLine && (
                <text
                  x={x + 4} y={PAD_TOP - 6}
                  fontSize="8" fontFamily="JetBrains Mono, monospace"
                  fill="#ef4444"
                >
                  Today
                </text>
              )}
            </g>
          );
        })}

        {/* Drug bars */}
        {sorted.map((entry, i) => {
          const rowY = PAD_TOP + i * ROW_H + (ROW_H - BAR_H) / 2;
          // Bar spans from current year (or start, whichever earlier) to expiry end
          const barStart = Math.min(entry.patentExpiryStart, CHART_START + 0.5);
          const barEnd   = entry.patentExpiryEnd + 0.5;
          const x1 = PAD_LEFT + xScale(barStart);
          const x2 = PAD_LEFT + xScale(Math.min(barEnd, CHART_END));
          const bw = x2 - x1;

          // Height scaled by revenue
          const barH = BAR_H * 0.5 + BAR_H * 0.5 * (entry.peakRevenueB / maxRev);

          const fillColor = entry.color;
          const isExpired = entry.patentExpiryEnd <= TODAY_YEAR;
          const opacity = isExpired ? 0.4 : 0.85;

          return (
            <g key={entry.drug}>
              {/* Drug name label */}
              <text
                x={PAD_LEFT - 8} y={rowY + barH / 2 + 1}
                textAnchor="end"
                fontSize="10"
                fontFamily="Inter, sans-serif"
                fill="rgba(255,255,255,0.75)"
                fontWeight="500"
              >
                {entry.drug}
              </text>
              {/* Ticker label */}
              <text
                x={PAD_LEFT - 8} y={rowY + barH / 2 + 12}
                textAnchor="end"
                fontSize="8"
                fontFamily="JetBrains Mono, monospace"
                fill="rgba(255,255,255,0.3)"
              >
                {entry.ticker}
              </text>

              {/* Background track */}
              <rect
                x={PAD_LEFT} y={rowY}
                width={CHART_W} height={barH}
                fill="rgba(255,255,255,0.03)"
                rx={2}
              />

              {/* Main bar */}
              <rect
                x={x1} y={rowY}
                width={Math.max(bw, 4)} height={barH}
                fill={fillColor}
                opacity={opacity}
                rx={2}
                className="cursor-pointer"
                onMouseEnter={(e) => handleMouseEnter(entry, i, e)}
                onMouseMove={(e) => handleMouseEnter(entry, i, e)}
              />

              {/* Revenue label on bar */}
              {bw > 40 && (
                <text
                  x={x1 + 6} y={rowY + barH / 2 + 3.5}
                  fontSize="9"
                  fontFamily="JetBrains Mono, monospace"
                  fill="rgba(255,255,255,0.9)"
                  fontWeight="600"
                >
                  {formatRevenue(entry.peakRevenueB)}/yr
                </text>
              )}

              {/* Expiry end marker */}
              {entry.patentExpiryEnd < CHART_END && (
                <line
                  x1={PAD_LEFT + xScale(entry.patentExpiryEnd + 0.5)}
                  y1={rowY - 2}
                  x2={PAD_LEFT + xScale(entry.patentExpiryEnd + 0.5)}
                  y2={rowY + barH + 2}
                  stroke={fillColor}
                  strokeWidth={2}
                  opacity={0.9}
                />
              )}
            </g>
          );
        })}
      </svg>

      {/* Hover tooltip */}
      {hovered && (
        <div
          className="absolute pointer-events-none z-50 bg-[#1a1d2a] border border-white/12 rounded-xl p-4 shadow-2xl max-w-xs"
          style={{
            left: Math.min(hovered.x + 12, WIDTH - 280),
            top: Math.max(hovered.y - 60, 0),
          }}
        >
          <div className="flex items-center gap-2 mb-2">
            <span
              className="w-2.5 h-2.5 rounded-full flex-shrink-0"
              style={{ background: hovered.entry.color }}
            />
            <span className="text-sm font-semibold text-white">{hovered.entry.drug}</span>
            <span className="text-[10px] font-mono text-muted-foreground">({hovered.entry.brandNote})</span>
          </div>
          <div className="space-y-1 text-xs mb-3">
            <div className="flex justify-between gap-4">
              <span className="text-muted-foreground">Company</span>
              <span className="text-white font-medium">{hovered.entry.company}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-muted-foreground">Peak Revenue</span>
              <span className="font-mono font-bold text-white">{formatRevenue(hovered.entry.peakRevenueB)}/yr</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-muted-foreground">LOE</span>
              <span className="font-mono text-white">
                {hovered.entry.patentExpiryStart === hovered.entry.patentExpiryEnd
                  ? hovered.entry.patentExpiryStart
                  : `${hovered.entry.patentExpiryStart}–${hovered.entry.patentExpiryEnd}`}
              </span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-muted-foreground">Status</span>
              <span
                className="font-mono font-semibold text-[10px]"
                style={{ color: STATUS_COLORS[hovered.entry.status] }}
              >
                {hovered.entry.status}
              </span>
            </div>
          </div>
          <div className="text-[10px] text-muted-foreground font-mono border-t border-white/8 pt-2">
            {hovered.entry.expiryNote}
          </div>
          <div className="mt-2">
            <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Replacements</span>
            {hovered.entry.replacements.map((r) => (
              <div key={r.name} className="flex items-center gap-1.5 mt-1">
                <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: PHASE_COLORS[r.phase] }} />
                <span className="text-xs text-white">{r.name}</span>
                <span
                  className="text-[9px] font-mono px-1 py-0.5 rounded"
                  style={{ color: PHASE_COLORS[r.phase], background: `${PHASE_COLORS[r.phase]}18` }}
                >
                  {r.phase}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Legend */}
      <div className="flex items-center gap-4 flex-wrap mt-3 px-2">
        <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider">Status:</span>
        {Object.entries(STATUS_COLORS).map(([s, c]) => (
          <span key={s} className="flex items-center gap-1.5 text-[10px]" style={{ color: c }}>
            <span className="w-2 h-2 rounded-full inline-block flex-shrink-0" style={{ background: c }} />
            {s}
          </span>
        ))}
        <span className="ml-4 flex items-center gap-1.5 text-[10px] text-red-400">
          <span className="inline-block w-4 border-t border-dashed border-red-400" />
          Today (Apr 2026)
        </span>
      </div>
    </div>
  );
}

// ── Revenue At Risk Chart ─────────────────────────────────────────────────────

function RevenueAtRiskChart() {
  const data = buildRevenueAtRiskData();

  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart
        data={data}
        margin={{ top: 12, right: 20, bottom: 8, left: 0 }}
        barSize={36}
      >
        <XAxis
          dataKey="ticker"
          tick={{ fill: "rgba(255,255,255,0.55)", fontSize: 11, fontFamily: "JetBrains Mono, monospace" }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tick={{ fill: "rgba(255,255,255,0.35)", fontSize: 9, fontFamily: "JetBrains Mono, monospace" }}
          axisLine={false}
          tickLine={false}
          tickFormatter={(v) => `$${v}B`}
          width={42}
        />
        <Tooltip
          content={<CustomTooltip />}
          cursor={{ fill: "rgba(255,255,255,0.04)" }}
        />
        <Bar dataKey="total" name="Revenue at Risk" radius={[4, 4, 0, 0]}>
          {data.map((entry) => (
            <Cell key={entry.ticker} fill={entry.color} />
          ))}
          <LabelList
            dataKey="total"
            position="top"
            style={{ fill: "rgba(255,255,255,0.6)", fontSize: "10px", fontFamily: "JetBrains Mono, monospace" }}
            formatter={(v: number) => `$${v}B`}
          />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

// ── Replacement Scorecard ─────────────────────────────────────────────────────

function ScorecardRow({ entry }: { entry: PatentCliffEntry }) {
  const [open, setOpen] = useState(false);
  const readiness = ReplacementReadiness(entry.replacements);
  const gapYears = Math.max(0, entry.patentExpiryStart - TODAY_YEAR);

  return (
    <div
      className="border border-white/6 rounded-lg overflow-hidden mb-2 cursor-pointer hover:border-white/12 transition-colors"
      onClick={() => setOpen(!open)}
    >
      <div className="flex items-center gap-4 px-4 py-3">
        {/* Readiness indicator */}
        <div
          className="w-1 self-stretch rounded-full flex-shrink-0 min-h-[40px]"
          style={{ background: readiness === "green" ? "#22c55e" : readiness === "yellow" ? "#f59e0b" : "#ef4444" }}
        />

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-semibold text-white">{entry.drug}</span>
            <span className="text-[10px] font-mono text-muted-foreground">({entry.brandNote})</span>
            <span
              className="text-[10px] font-mono px-1.5 py-0.5 rounded border"
              style={{ color: STATUS_COLORS[entry.status], borderColor: `${STATUS_COLORS[entry.status]}35`, background: `${STATUS_COLORS[entry.status]}10` }}
            >
              {entry.status}
            </span>
          </div>
          <div className="text-[11px] text-muted-foreground mt-0.5">{entry.company} · {entry.ticker}</div>
        </div>

        {/* Stats */}
        <div className="hidden sm:flex items-center gap-6 text-center flex-shrink-0">
          <div>
            <div className="text-xs font-mono font-bold text-white">{formatRevenue(entry.peakRevenueB)}/yr</div>
            <div className="text-[9px] text-muted-foreground font-mono uppercase">Peak Rev</div>
          </div>
          <div>
            <div className="text-xs font-mono font-bold" style={{ color: gapYears > 0 ? "#f59e0b" : "#22c55e" }}>
              {gapYears > 0 ? `${gapYears}yr` : "Now"}
            </div>
            <div className="text-[9px] text-muted-foreground font-mono uppercase">to LOE</div>
          </div>
          <div>
            <ReadinessIcon level={readiness} />
          </div>
        </div>

        <svg
          className={`w-4 h-4 flex-shrink-0 text-muted-foreground/40 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
          fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 12 12"
        >
          <path d="M2 4l4 4 4-4" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>

      {open && (
        <div className="border-t border-white/6 px-4 py-3 bg-white/[0.015]">
          <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">
            Replacement Pipeline ({entry.replacements.length} candidate{entry.replacements.length !== 1 ? "s" : ""})
          </div>
          <div className="space-y-2">
            {entry.replacements.map((r) => (
              <div key={r.name} className="flex items-start gap-3">
                <span
                  className="mt-1 w-2 h-2 rounded-full flex-shrink-0"
                  style={{ background: PHASE_COLORS[r.phase] }}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-semibold text-white">{r.name}</span>
                    <span
                      className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded"
                      style={{ color: PHASE_COLORS[r.phase], background: `${PHASE_COLORS[r.phase]}15`, border: `1px solid ${PHASE_COLORS[r.phase]}30` }}
                    >
                      {r.phase}
                    </span>
                    <span className="text-[9px] font-mono text-muted-foreground bg-white/5 px-1.5 py-0.5 rounded border border-white/8">
                      {r.modality}
                    </span>
                  </div>
                  <p className="text-[11px] text-muted-foreground leading-relaxed mt-0.5">{r.description}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-3 text-[10px] font-mono text-muted-foreground border-t border-white/6 pt-2">
            LOE: {entry.expiryNote}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function PatentCliff() {
  const [scorecardFilter, setScorecardFilter] = useState<"All" | "At Risk" | "Protected">("All");

  const filteredForScorecard = useMemo(() => {
    if (scorecardFilter === "At Risk") return PATENT_CLIFFS.filter((e) => e.patentExpiryStart <= 2031);
    if (scorecardFilter === "Protected") return PATENT_CLIFFS.filter((e) => e.patentExpiryStart > 2031);
    return PATENT_CLIFFS;
  }, [scorecardFilter]);

  const totalAtRisk = PATENT_CLIFFS.filter((e) => e.patentExpiryStart <= 2031)
    .reduce((s, e) => s + e.peakRevenueB, 0);

  return (
    <div className="min-h-screen bg-[#0f1117] text-foreground px-6 py-6 pb-16">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="mb-8"
      >
        <h1 className="text-lg font-semibold text-white tracking-tight">Patent Cliff Visualizer</h1>
        <p className="text-xs text-muted-foreground font-mono mt-1">
          12 blockbuster drugs · {PATENT_CLIFFS.length} entries · ${totalAtRisk}B+ peak revenue approaching loss-of-exclusivity
        </p>
      </motion.div>

      {/* KPI bar */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.05 }}
        className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8"
      >
        {[
          { label: "Active Cliffs", value: PATENT_CLIFFS.filter(e => e.status === "Active Cliff").length.toString(), color: "#ef4444", note: "patent expiring 2026-2032" },
          { label: "LOE by 2028", value: `$${PATENT_CLIFFS.filter(e => e.patentExpiryStart <= 2028).reduce((s,e) => s+e.peakRevenueB,0)}B`, color: "#f59e0b", note: "peak annual revenue at risk" },
          { label: "Approved Replacements", value: PATENT_CLIFFS.flatMap(e => e.replacements).filter(r => r.phase === "Approved").length.toString(), color: "#22c55e", note: "already launched successors" },
          { label: "Phase 3 Gap Fillers", value: PATENT_CLIFFS.flatMap(e => e.replacements).filter(r => r.phase === "Phase 3").length.toString(), color: "#f59e0b", note: "late-stage pipeline candidates" },
        ].map((kpi) => (
          <div key={kpi.label} className="bg-white/[0.025] border border-white/6 rounded-lg p-4">
            <div className="text-2xl font-mono font-bold" style={{ color: kpi.color }}>{kpi.value}</div>
            <div className="text-xs font-medium text-white mt-0.5">{kpi.label}</div>
            <div className="text-[10px] text-muted-foreground mt-0.5">{kpi.note}</div>
          </div>
        ))}
      </motion.div>

      {/* Section 1: Timeline */}
      <motion.section
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.1 }}
        className="bg-white/[0.025] border border-white/6 rounded-xl p-5 mb-6"
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-sm font-semibold text-white">Patent Cliff Timeline</h2>
            <p className="text-[11px] text-muted-foreground font-mono mt-0.5">
              Horizontal bars = patent protection window. Bar height ∝ peak revenue. Hover for details.
            </p>
          </div>
          <span className="text-[10px] font-mono text-muted-foreground">2024 – 2037</span>
        </div>
        <PatentTimeline />
      </motion.section>

      {/* Section 2: Revenue at Risk */}
      <motion.section
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.15 }}
        className="bg-white/[0.025] border border-white/6 rounded-xl p-5 mb-6"
      >
        <div className="mb-4">
          <h2 className="text-sm font-semibold text-white">Revenue at Risk by Company</h2>
          <p className="text-[11px] text-muted-foreground font-mono mt-0.5">
            Peak annual revenue from drugs with LOE before 2031. BMS has the most concentrated exposure.
          </p>
        </div>
        <RevenueAtRiskChart />

        {/* Annotations */}
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            {
              ticker: "BMY",
              note: "Highest concentration risk — Eliquis + Opdivo + Revlimid. Multiple blockbusters losing exclusivity within 4-year window.",
              color: "#f43f5e",
            },
            {
              ticker: "MRK",
              note: "Single-asset risk — Keytruda is ~50% of revenue. No approved replacement yet; pipeline in Phase 2.",
              color: "#3b82f6",
            },
            {
              ticker: "JNJ",
              note: "Stelara biosimilars already live. Tremfya + Rybrevant combo partially offset; concentrated in immunology.",
              color: "#dc2626",
            },
          ].map((a) => (
            <div key={a.ticker} className="bg-white/[0.02] border border-white/6 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-1.5">
                <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: a.color }} />
                <span className="text-xs font-mono font-bold text-white">{a.ticker}</span>
              </div>
              <p className="text-[11px] text-muted-foreground leading-relaxed">{a.note}</p>
            </div>
          ))}
        </div>
      </motion.section>

      {/* Section 3: Replacement Scorecard */}
      <motion.section
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.2 }}
        className="bg-white/[0.025] border border-white/6 rounded-xl p-5"
      >
        <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
          <div>
            <h2 className="text-sm font-semibold text-white">Replacement Pipeline Scorecard</h2>
            <p className="text-[11px] text-muted-foreground font-mono mt-0.5">
              Click any row to expand replacement candidates. Color = pipeline readiness.
            </p>
          </div>
          <div className="flex gap-2">
            {(["All", "At Risk", "Protected"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setScorecardFilter(f)}
                className="px-3 py-1.5 rounded-full text-xs font-medium transition-all"
                style={
                  scorecardFilter === f
                    ? { background: "rgba(6,182,212,0.15)", color: "#06b6d4", border: "1px solid rgba(6,182,212,0.4)" }
                    : { background: "rgba(255,255,255,0.04)", color: "#6b7280", border: "1px solid rgba(255,255,255,0.08)" }
                }
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* Phase legend */}
        <div className="flex items-center gap-4 flex-wrap mb-4 p-3 bg-white/[0.02] rounded-lg border border-white/5">
          <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider">Readiness:</span>
          {Object.entries(PHASE_COLORS).map(([phase, color]) => (
            <span key={phase} className="flex items-center gap-1.5 text-[10px]" style={{ color }}>
              <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: color }} />
              {phase}
            </span>
          ))}
        </div>

        <div>
          {filteredForScorecard.map((entry) => (
            <ScorecardRow key={entry.drug} entry={entry} />
          ))}
        </div>

        {/* Investment note */}
        <div className="mt-4 p-4 bg-amber-500/5 border border-amber-500/15 rounded-lg">
          <div className="flex items-start gap-2.5">
            <svg className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 16 16">
              <path d="M8 2l5.5 9.5H2.5L8 2z" strokeLinejoin="round"/>
              <line x1="8" y1="7" x2="8" y2="10" strokeLinecap="round"/>
              <circle cx="8" cy="12" r="0.5" fill="currentColor"/>
            </svg>
            <div>
              <div className="text-xs font-semibold text-amber-300 mb-0.5">Investment Signal: Patent Cliff Acquirers</div>
              <p className="text-[11px] text-amber-200/60 leading-relaxed">
                Companies facing imminent LOE with only Phase 2 replacements (red readiness) have structural M&A motivation.
                Merck (Keytruda 2028, MK-2010 Phase 2) and BMS (Eliquis 2026–28, Milvexian Phase 3) are the most active acquirers.
                $138B in biopharma M&A in 2025 was driven largely by patent cliff replacement pressure — expect sustained activity through 2028.
              </p>
            </div>
          </div>
        </div>
      </motion.section>
    </div>
  );
}
