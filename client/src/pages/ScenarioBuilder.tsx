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
import { companyPipelines, approvalProbability } from "@/data/investmentData";

// ─── Types ─────────────────────────────────────────────────────────────────────

interface ModalityLOA {
  modality: string;
  baseLoa: number;
  adjustedLoa: number;
}

// ─── Constants ─────────────────────────────────────────────────────────────────

const MODALITY_COLORS: Record<string, string> = {
  "Small Molecule": "#06b6d4",
  "mAb": "#6366f1",
  "ADC": "#f43f5e",
  "Bispecific": "#a855f7",
  "Gene Therapy": "#10b981",
  "CAR-T": "#f97316",
  "RNAi": "#eab308",
  "mRNA": "#3b82f6",
  "CRISPR": "#14b8a6",
  "ASO": "#ec4899",
  "Radiopharmaceutical": "#84cc16",
  "Other": "#94a3b8",
};

// Phase value weights for pipeline scoring
const PHASE_WEIGHTS = { phase1: 1, phase2: 3, phase3: 9, approved: 15 };

// Implied value per program ($M) by phase — rough M&A comp baseline
const BASE_VALUE_PER_PHASE: Record<string, number> = {
  phase1: 25,
  phase2: 120,
  phase3: 450,
  approved: 1200,
};

// ─── Helpers ───────────────────────────────────────────────────────────────────

function getModalityLOA(modality: string, adjustments: Record<string, number>): number {
  const found = approvalProbability.find((a) => a.modality === modality);
  const base = found?.loa ?? 8;
  return adjustments[modality] ?? base;
}

function computeImpliedValue(
  company: (typeof companyPipelines)[0],
  loaAdjustments: Record<string, number>,
  maPremium: number,
  phase3Multiplier: number
): number {
  const modality = company.primaryModality;
  const loa = getModalityLOA(modality, loaAdjustments);
  const loaFactor = loa / 10; // normalize: 10% = 1.0x

  const phase1Val = company.phase1 * BASE_VALUE_PER_PHASE.phase1 * loaFactor;
  const phase2Val = company.phase2 * BASE_VALUE_PER_PHASE.phase2 * loaFactor;
  const phase3Val = company.phase3 * BASE_VALUE_PER_PHASE.phase3 * loaFactor * phase3Multiplier;
  const approvedVal = company.approved * BASE_VALUE_PER_PHASE.approved;

  const pipelineValue = phase1Val + phase2Val + phase3Val + approvedVal;
  const acquisitionValue = pipelineValue * (1 + maPremium / 100);

  return Math.round(acquisitionValue);
}

function computePipelineDensity(
  company: (typeof companyPipelines)[0],
  loaAdjustments: Record<string, number>
): number {
  const loa = getModalityLOA(company.primaryModality, loaAdjustments);
  const loaFactor = loa / 10;
  return (
    company.phase1 * PHASE_WEIGHTS.phase1 * loaFactor +
    company.phase2 * PHASE_WEIGHTS.phase2 * loaFactor +
    company.phase3 * PHASE_WEIGHTS.phase3 * loaFactor +
    company.approved * PHASE_WEIGHTS.approved
  );
}

// ─── Slider Component ──────────────────────────────────────────────────────────

interface SliderProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  format: (v: number) => string;
  onChange: (v: number) => void;
  color?: string;
  "data-testid"?: string;
}

function Slider({
  label,
  value,
  min,
  max,
  step,
  format,
  onChange,
  color = "#6366f1",
  "data-testid": testId,
}: SliderProps) {
  const pct = ((value - min) / (max - min)) * 100;

  return (
    <div className="space-y-1.5">
      <div className="flex justify-between items-baseline">
        <label className="text-xs text-slate-400 font-['JetBrains_Mono',monospace]">{label}</label>
        <span
          className="text-sm font-bold font-['JetBrains_Mono',monospace]"
          style={{ color }}
        >
          {format(value)}
        </span>
      </div>
      <div className="relative h-1.5 bg-slate-700/60 rounded-full">
        <div
          className="absolute left-0 top-0 h-full rounded-full transition-all"
          style={{ width: `${pct}%`, background: color }}
        />
        <input
          data-testid={testId}
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(parseFloat(e.target.value))}
          className="absolute inset-0 w-full opacity-0 cursor-pointer h-full"
          style={{ WebkitAppearance: "none" }}
        />
        <div
          className="absolute top-1/2 -translate-y-1/2 w-3.5 h-3.5 rounded-full border-2 border-white shadow-lg transition-all"
          style={{ left: `calc(${pct}% - 7px)`, background: color }}
        />
      </div>
      <div className="flex justify-between text-xs text-slate-600 font-['JetBrains_Mono',monospace]">
        <span>{format(min)}</span>
        <span>{format(max)}</span>
      </div>
    </div>
  );
}

// ─── Custom Tooltip ────────────────────────────────────────────────────────────

function CustomBarTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-slate-700 bg-slate-900/95 p-3 shadow-2xl text-xs font-['JetBrains_Mono',monospace]">
      <p className="text-slate-300 font-bold mb-1">{label}</p>
      {payload.map((p: any, i: number) => (
        <p key={i} style={{ color: p.color }}>
          {p.name}: ${(p.value / 1000).toFixed(1)}B
        </p>
      ))}
    </div>
  );
}

// ─── Sensitivity Table ─────────────────────────────────────────────────────────

function SensitivityTable({
  company,
  baseLoa,
  baseMA,
  baseP3,
}: {
  company: (typeof companyPipelines)[0];
  baseLoa: number;
  baseMA: number;
  baseP3: number;
}) {
  const modality = company.primaryModality;
  const foundLoa = approvalProbability.find((a) => a.modality === modality)?.loa ?? 8;

  const loaScenarios = [
    { label: "Low LOA", loa: Math.max(1, foundLoa - 3) },
    { label: "Base LOA", loa: foundLoa },
    { label: "High LOA", loa: Math.min(25, foundLoa + 5) },
  ];
  const maScenarios = [
    { label: "Low M&A", ma: Math.max(20, baseMA - 20) },
    { label: "Base M&A", ma: baseMA },
    { label: "High M&A", ma: Math.min(150, baseMA + 30) },
  ];

  // Calculate max for heat-map coloring
  const allVals = loaScenarios.flatMap((loa) =>
    maScenarios.map((ma) =>
      computeImpliedValue({ ...company }, { [modality]: loa.loa }, ma.ma, baseP3)
    )
  );
  const maxVal = Math.max(...allVals);
  const minVal = Math.min(...allVals);

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-xs font-['JetBrains_Mono',monospace]">
        <thead>
          <tr>
            <th className="text-left text-slate-500 pb-2 pr-4 font-normal">LOA \ M&A</th>
            {maScenarios.map((ms) => (
              <th key={ms.label} className="text-center text-slate-400 pb-2 px-3 font-semibold">
                {ms.label}
                <br />
                <span className="text-slate-600 font-normal">{ms.ma}%</span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {loaScenarios.map((ls) => (
            <tr key={ls.label}>
              <td className="text-slate-400 pr-4 py-2 font-semibold whitespace-nowrap">
                {ls.label}
                <br />
                <span className="text-slate-600 font-normal">{ls.loa}% LOA</span>
              </td>
              {maScenarios.map((ms) => {
                const val = computeImpliedValue(
                  { ...company },
                  { [modality]: ls.loa },
                  ms.ma,
                  baseP3
                );
                const intensity = (val - minVal) / (maxVal - minVal || 1);
                const cellColor =
                  intensity > 0.66
                    ? "rgba(16,185,129,0.15)"
                    : intensity > 0.33
                    ? "rgba(99,102,241,0.12)"
                    : "rgba(244,63,94,0.12)";
                const textColor =
                  intensity > 0.66 ? "#10b981" : intensity > 0.33 ? "#818cf8" : "#f87171";

                return (
                  <td key={ms.label} className="py-2 px-3">
                    <div
                      className="rounded-lg py-2 px-3 text-center font-bold"
                      style={{ background: cellColor, color: textColor }}
                    >
                      ${(val / 1000).toFixed(1)}B
                    </div>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ─── Main Scenario Builder Page ─────────────────────────────────────────────────

export default function ScenarioBuilder() {
  // ── Global Adjustors ──
  const [maPremium, setMaPremium] = useState(50);
  const [phase3Multiplier, setPhase3Multiplier] = useState(1.0);

  // ── Per-modality LOA sliders ──
  const initialLoaAdjustments = useMemo(() => {
    const result: Record<string, number> = {};
    approvalProbability.forEach((ap) => {
      result[ap.modality] = ap.loa;
    });
    return result;
  }, []);

  const [loaAdjustments, setLoaAdjustments] = useState<Record<string, number>>(
    initialLoaAdjustments
  );

  // ── Company Selection ──
  const [selectedCompany, setSelectedCompany] = useState<string>(
    companyPipelines[0].company
  );

  const company = useMemo(
    () => companyPipelines.find((c) => c.company === selectedCompany) || companyPipelines[0],
    [selectedCompany]
  );

  // ── Computed Values ──
  const baseImpliedValue = useMemo(
    () => computeImpliedValue(company, initialLoaAdjustments, maPremium, phase3Multiplier),
    [company, initialLoaAdjustments, maPremium, phase3Multiplier]
  );

  const adjustedImpliedValue = useMemo(
    () => computeImpliedValue(company, loaAdjustments, maPremium, phase3Multiplier),
    [company, loaAdjustments, maPremium, phase3Multiplier]
  );

  const delta = adjustedImpliedValue - baseImpliedValue;
  const deltaSign = delta >= 0 ? "+" : "";
  const deltaColor = delta >= 0 ? "#10b981" : "#f43f5e";

  // Bar chart data
  const valuationData = [
    {
      label: "Base Scenario",
      value: baseImpliedValue,
      color: "#475569",
    },
    {
      label: "Adjusted Scenario",
      value: adjustedImpliedValue,
      color: adjustedImpliedValue >= baseImpliedValue ? "#10b981" : "#f43f5e",
    },
    {
      label: "Market Cap",
      value: Math.round(company.marketCapB * 1000),
      color: "#6366f1",
    },
  ];

  // Portfolio re-rank — adjusted density scores
  const portfolioRanking = useMemo(() => {
    return companyPipelines
      .map((c) => ({
        company: c.company,
        ticker: c.ticker,
        modality: c.primaryModality,
        adjustedScore: computePipelineDensity(c, loaAdjustments),
        baseScore: computePipelineDensity(c, initialLoaAdjustments),
        tier: c.tier,
      }))
      .sort((a, b) => b.adjustedScore - a.adjustedScore)
      .slice(0, 20);
  }, [loaAdjustments, initialLoaAdjustments]);

  const maxScore = Math.max(...portfolioRanking.map((r) => r.adjustedScore));

  const updateLoa = (modality: string, value: number) => {
    setLoaAdjustments((prev) => ({ ...prev, [modality]: value }));
  };

  const resetAll = () => {
    setLoaAdjustments(initialLoaAdjustments);
    setMaPremium(50);
    setPhase3Multiplier(1.0);
  };

  return (
    <div
      className="flex h-screen overflow-hidden"
      style={{ background: "#0f1117", fontFamily: "'Inter', sans-serif" }}
    >
      {/* ── Left Controls Panel ─────────────────────────────────────────────── */}
      <div
        className="flex flex-col border-r border-slate-800/60 overflow-y-auto flex-shrink-0"
        style={{ width: 300 }}
      >
        {/* Header */}
        <div className="p-5 border-b border-slate-800/60">
          <div className="flex items-center justify-between mb-1">
            <h1 className="text-sm font-bold text-white font-['JetBrains_Mono',monospace] tracking-wide uppercase">
              Scenario Builder
            </h1>
            <button
              onClick={resetAll}
              data-testid="reset-all"
              className="text-xs text-slate-500 hover:text-slate-300 font-['JetBrains_Mono',monospace] transition-colors border border-slate-700 px-2 py-1 rounded"
            >
              Reset
            </button>
          </div>
          <p className="text-xs text-slate-500 font-['Inter',sans-serif]">
            Adjust assumptions to model pipeline value scenarios
          </p>
        </div>

        {/* Company Selector */}
        <div className="p-5 border-b border-slate-800/60">
          <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 block font-['JetBrains_Mono',monospace]">
            Company
          </label>
          <select
            data-testid="company-selector"
            value={selectedCompany}
            onChange={(e) => setSelectedCompany(e.target.value)}
            className="w-full px-3 py-2 rounded-lg text-xs bg-slate-800/60 border border-slate-700/50 text-slate-300 outline-none focus:border-slate-500 transition-colors font-['JetBrains_Mono',monospace] cursor-pointer"
          >
            {companyPipelines.map((c) => (
              <option key={c.company} value={c.company}>
                {c.ticker} — {c.company}
              </option>
            ))}
          </select>
          <div className="flex gap-2 mt-2 flex-wrap">
            {company.areas.map((area, i) => (
              <span
                key={i}
                className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-400 font-['JetBrains_Mono',monospace]"
              >
                {area}
              </span>
            ))}
          </div>
        </div>

        {/* Global Adjustors */}
        <div className="p-5 border-b border-slate-800/60 space-y-5">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider font-['JetBrains_Mono',monospace]">
            Global Assumptions
          </p>

          <Slider
            label="M&A Acquisition Premium"
            value={maPremium}
            min={20}
            max={150}
            step={5}
            format={(v) => `${v}%`}
            onChange={setMaPremium}
            color="#6366f1"
            data-testid="slider-ma-premium"
          />

          <Slider
            label="Phase 3 Value Multiplier"
            value={phase3Multiplier}
            min={0.5}
            max={3.0}
            step={0.1}
            format={(v) => `${v.toFixed(1)}×`}
            onChange={setPhase3Multiplier}
            color="#a855f7"
            data-testid="slider-phase3-multiplier"
          />
        </div>

        {/* Per-Modality LOA Sliders */}
        <div className="p-5 space-y-5 flex-1">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider font-['JetBrains_Mono',monospace]">
            Approval Rates (LOA from Ph1)
          </p>
          {approvalProbability.map((ap) => {
            const color = MODALITY_COLORS[ap.modality] || "#94a3b8";
            const current = loaAdjustments[ap.modality] ?? ap.loa;
            const isHighlighted = ap.modality === company.primaryModality;
            return (
              <div
                key={ap.modality}
                className="rounded-lg p-3 transition-all"
                style={{
                  background: isHighlighted ? `${color}08` : "transparent",
                  border: isHighlighted ? `1px solid ${color}25` : "1px solid transparent",
                }}
              >
                <Slider
                  label={`${ap.modality}${isHighlighted ? " ★" : ""}`}
                  value={current}
                  min={1}
                  max={25}
                  step={0.5}
                  format={(v) => `${v}%`}
                  onChange={(v) => updateLoa(ap.modality, v)}
                  color={color}
                  data-testid={`slider-loa-${ap.modality.replace(/\s+/g, "-").toLowerCase()}`}
                />
                {current !== ap.loa && (
                  <p className="text-xs mt-1 font-['JetBrains_Mono',monospace]" style={{ color }}>
                    {current > ap.loa ? "+" : ""}
                    {(current - ap.loa).toFixed(1)}pp vs base ({ap.loa}%)
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Right Results Panel ─────────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-4xl mx-auto space-y-6">

          {/* Company Header */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-white font-['Inter',sans-serif]">
                {company.company}
              </h2>
              <p className="text-sm text-slate-400 font-['JetBrains_Mono',monospace]">
                {company.ticker} · {company.primaryModality} primary · Tier {company.tier}
              </p>
            </div>
            <div className="text-right">
              <div className="text-xs text-slate-500 font-['JetBrains_Mono',monospace]">Market Cap</div>
              <div className="text-xl font-bold text-indigo-400 font-['JetBrains_Mono',monospace]">
                ${company.marketCapB}B
              </div>
            </div>
          </div>

          {/* KPI Row */}
          <div className="grid grid-cols-4 gap-4">
            {[
              { label: "Base Pipeline Value", value: `$${(baseImpliedValue / 1000).toFixed(1)}B`, color: "#475569", note: "at default LOA" },
              { label: "Adjusted Value", value: `$${(adjustedImpliedValue / 1000).toFixed(1)}B`, color: adjustedImpliedValue >= baseImpliedValue ? "#10b981" : "#f43f5e", note: "your scenario" },
              { label: "Value Delta", value: `${deltaSign}$${Math.abs(delta / 1000).toFixed(1)}B`, color: deltaColor, note: "vs base case" },
              { label: "vs Market Cap", value: `${adjustedImpliedValue > company.marketCapB * 1000 ? "+" : ""}${(((adjustedImpliedValue / (company.marketCapB * 1000)) - 1) * 100).toFixed(0)}%`, color: adjustedImpliedValue >= company.marketCapB * 1000 ? "#10b981" : "#f43f5e", note: "implied upside" },
            ].map((kpi, i) => (
              <motion.div
                key={i}
                className="rounded-xl p-4 border border-slate-800 bg-slate-900/40"
                animate={{ borderColor: i === 1 ? `${kpi.color}40` : undefined }}
                transition={{ duration: 0.3 }}
              >
                <p className="text-xs text-slate-500 font-['JetBrains_Mono',monospace] mb-1">{kpi.label}</p>
                <p
                  className="text-xl font-bold font-['JetBrains_Mono',monospace]"
                  style={{ color: kpi.color }}
                >
                  {kpi.value}
                </p>
                <p className="text-xs text-slate-600 font-['JetBrains_Mono',monospace] mt-0.5">{kpi.note}</p>
              </motion.div>
            ))}
          </div>

          {/* Valuation Bar Chart */}
          <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-semibold text-white font-['Inter',sans-serif]">
                  Valuation Impact
                </h3>
                <p className="text-xs text-slate-500 font-['JetBrains_Mono',monospace]">
                  Base vs. adjusted pipeline value vs. current market cap
                </p>
              </div>
              <div className="flex items-center gap-3 text-xs font-['JetBrains_Mono',monospace]">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-slate-500 inline-block" />
                  <span className="text-slate-500">Base</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full inline-block" style={{ background: deltaColor }} />
                  <span className="text-slate-400">Adjusted</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-indigo-400 inline-block" />
                  <span className="text-slate-400">Mkt Cap</span>
                </span>
              </div>
            </div>
            <div data-testid="valuation-chart" style={{ height: 200 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={valuationData}
                  margin={{ top: 0, right: 20, left: 10, bottom: 0 }}
                >
                  <XAxis
                    dataKey="label"
                    tick={{ fill: "#94a3b8", fontSize: 11, fontFamily: "JetBrains Mono, monospace" }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tickFormatter={(v) => `$${(v / 1000).toFixed(0)}B`}
                    tick={{ fill: "#475569", fontSize: 10, fontFamily: "JetBrains Mono, monospace" }}
                    axisLine={false}
                    tickLine={false}
                    width={55}
                  />
                  <Tooltip content={<CustomBarTooltip />} cursor={{ fill: "rgba(255,255,255,0.03)" }} />
                  <Bar dataKey="value" radius={[6, 6, 0, 0]} maxBarSize={80}>
                    {valuationData.map((entry, index) => (
                      <Cell key={index} fill={entry.color} fillOpacity={0.85} />
                    ))}
                  </Bar>
                  {/* Market cap reference line */}
                  <ReferenceLine
                    y={company.marketCapB * 1000}
                    stroke="#6366f1"
                    strokeDasharray="4 3"
                    strokeWidth={1}
                    label={{
                      value: "Market Cap",
                      position: "right",
                      fill: "#6366f1",
                      fontSize: 9,
                      fontFamily: "JetBrains Mono, monospace",
                    }}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Portfolio Screen — Re-ranked */}
          <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-semibold text-white font-['Inter',sans-serif]">
                  Portfolio Screen
                </h3>
                <p className="text-xs text-slate-500 font-['JetBrains_Mono',monospace]">
                  Companies re-ranked by adjusted pipeline density score
                </p>
              </div>
              <span className="text-xs text-slate-500 font-['JetBrains_Mono',monospace]">
                Score = Σ(phase × weight × LOA factor)
              </span>
            </div>
            <div data-testid="portfolio-ranking" className="space-y-1.5">
              {portfolioRanking.map((row, i) => {
                const color = MODALITY_COLORS[row.modality] || "#94a3b8";
                const isSelected = row.company === selectedCompany;
                const scoreDelta = row.adjustedScore - row.baseScore;
                const barPct = (row.adjustedScore / maxScore) * 100;

                return (
                  <div
                    key={row.company}
                    className="flex items-center gap-3 rounded-lg px-3 py-2 transition-all"
                    style={{
                      background: isSelected ? `${color}10` : "rgba(15,23,42,0.3)",
                      border: isSelected ? `1px solid ${color}25` : "1px solid transparent",
                    }}
                  >
                    <span
                      className="text-xs font-bold w-5 text-center font-['JetBrains_Mono',monospace]"
                      style={{ color: i < 3 ? color : "#475569" }}
                    >
                      {i + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span
                          className="text-xs font-semibold font-['JetBrains_Mono',monospace] truncate"
                          style={{ color: isSelected ? color : "#cbd5e1" }}
                        >
                          {row.ticker}
                        </span>
                        <span className="text-xs text-slate-500 truncate font-['Inter',sans-serif]">
                          {row.company}
                        </span>
                        <span
                          className="text-xs px-1.5 py-0.5 rounded ml-auto flex-shrink-0 font-['JetBrains_Mono',monospace]"
                          style={{ background: `${color}15`, color }}
                        >
                          {row.modality}
                        </span>
                      </div>
                      <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                        <motion.div
                          className="h-full rounded-full"
                          style={{ background: color, opacity: 0.7 }}
                          initial={{ width: 0 }}
                          animate={{ width: `${barPct}%` }}
                          transition={{ duration: 0.5, delay: i * 0.02 }}
                        />
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0 w-20">
                      <div
                        className="text-xs font-bold font-['JetBrains_Mono',monospace]"
                        style={{ color }}
                      >
                        {row.adjustedScore.toFixed(0)}
                      </div>
                      {scoreDelta !== 0 && (
                        <div
                          className="text-xs font-['JetBrains_Mono',monospace]"
                          style={{ color: scoreDelta > 0 ? "#10b981" : "#f43f5e" }}
                        >
                          {scoreDelta > 0 ? "+" : ""}
                          {scoreDelta.toFixed(0)}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Sensitivity Table */}
          <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-5">
            <div className="mb-4">
              <h3 className="text-sm font-semibold text-white font-['Inter',sans-serif]">
                Sensitivity Table — {company.company}
              </h3>
              <p className="text-xs text-slate-500 font-['JetBrains_Mono',monospace]">
                Implied acquisition value across LOA × M&A premium scenarios
              </p>
            </div>
            <div data-testid="sensitivity-table">
              <SensitivityTable
                company={company}
                baseLoa={loaAdjustments[company.primaryModality] ?? 10}
                baseMA={maPremium}
                baseP3={phase3Multiplier}
              />
            </div>
          </div>

          {/* Pipeline Breakdown */}
          <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-5">
            <h3 className="text-sm font-semibold text-white mb-4 font-['Inter',sans-serif]">
              {company.company} — Pipeline Breakdown
            </h3>
            <div className="grid grid-cols-4 gap-3">
              {[
                { label: "Phase 1", count: company.phase1, color: "#475569" },
                { label: "Phase 2", count: company.phase2, color: "#6366f1" },
                { label: "Phase 3", count: company.phase3, color: "#a855f7" },
                { label: "Approved", count: company.approved, color: "#10b981" },
              ].map((phase) => {
                const loa = loaAdjustments[company.primaryModality] ?? 10;
                const loaFactor = loa / 10;
                const phaseKey = phase.label.toLowerCase().replace(" ", "") as keyof typeof BASE_VALUE_PER_PHASE;
                const phaseVal =
                  phase.count *
                  (BASE_VALUE_PER_PHASE[phaseKey] || 25) *
                  (phaseKey !== "approved" ? loaFactor : 1);

                return (
                  <div
                    key={phase.label}
                    className="rounded-lg p-3 text-center border border-slate-700/40"
                    style={{ background: `${phase.color}08` }}
                  >
                    <div className="text-2xl font-bold font-['JetBrains_Mono',monospace]" style={{ color: phase.color }}>
                      {phase.count}
                    </div>
                    <div className="text-xs text-slate-400 font-['JetBrains_Mono',monospace] mb-1">{phase.label}</div>
                    <div className="text-xs font-['JetBrains_Mono',monospace]" style={{ color: phase.color }}>
                      ~${(phaseVal / 1000).toFixed(1)}B
                    </div>
                    <div className="text-xs text-slate-600 font-['JetBrains_Mono',monospace]">risk-adj.</div>
                  </div>
                );
              })}
            </div>
            <div className="mt-3 text-xs text-slate-600 font-['JetBrains_Mono',monospace]">
              Primary modality: {company.primaryModality} · LOA used:{" "}
              <span style={{ color: MODALITY_COLORS[company.primaryModality] || "#94a3b8" }}>
                {(loaAdjustments[company.primaryModality] ?? 10).toFixed(1)}%
              </span>
              {" "}(base: {approvalProbability.find((a) => a.modality === company.primaryModality)?.loa ?? 10}%)
            </div>
          </div>

          {/* Footer note */}
          <div className="text-xs text-slate-600 font-['JetBrains_Mono',monospace] text-center pb-4">
            Model for illustrative purposes. Values based on M&A comp framework; not investment advice.
          </div>
        </div>
      </div>
    </div>
  );
}
