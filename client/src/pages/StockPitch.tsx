import { useState, useEffect, useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Link } from "wouter";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  ReferenceLine,
} from "recharts";
import {
  picks,
  bntxStats,
  bntxThesis,
  bntxScenarios,
  bntxValuationChart,
  bntxAssumptions,
  bntxCatalysts,
  bntxCompTable,
  bntxADCTable,
  secondaryPicks,
  screeningFunnel,
  modalityAsymmetry,
  structuralTrends,
  riskFactors,
  dataSources,
  dashboardLinks,
} from "@/data/stockPitchData";

// ── Fade-in wrapper ───────────────────────────────────────────

function FadeIn({
  children,
  delay = 0,
  className = "",
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 28 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// ── Slide nav ─────────────────────────────────────────────────

const SLIDES = [
  { id: "slide-title", label: "Executive Summary" },
  { id: "slide-screen", label: "Screening Process" },
  { id: "slide-trends", label: "Structural Trends" },
  { id: "slide-bntx", label: "LONG BNTX" },
  { id: "slide-valuation", label: "BNTX Valuation" },
  { id: "slide-catalysts", label: "BNTX Catalysts" },
  { id: "slide-competitive", label: "BNTX Competition" },
  { id: "slide-secondary", label: "Secondary Picks" },
  { id: "slide-risks", label: "Risk Factors" },
  { id: "slide-methodology", label: "Methodology" },
];

function SlideNav({ activeSlide }: { activeSlide: number }) {
  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };
  return (
    <div className="fixed right-4 top-1/2 -translate-y-1/2 z-50 flex flex-col gap-1.5">
      {SLIDES.map((s, i) => (
        <button
          key={s.id}
          onClick={() => scrollTo(s.id)}
          title={s.label}
          className="group flex items-center gap-2 justify-end"
        >
          <span className="opacity-0 group-hover:opacity-100 transition-opacity text-[10px] text-muted-foreground bg-card border border-border px-2 py-0.5 rounded whitespace-nowrap">
            {s.label}
          </span>
          <div
            className={`transition-all duration-200 rounded-full ${
              activeSlide === i
                ? "w-2.5 h-2.5 bg-indigo-400"
                : "w-1.5 h-1.5 bg-muted-foreground/40 hover:bg-muted-foreground"
            }`}
          />
        </button>
      ))}
    </div>
  );
}

// ── Section wrapper ───────────────────────────────────────────

function Slide({
  id,
  children,
  className = "",
  minHeight = "min-h-[85vh]",
}: {
  id: string;
  children: React.ReactNode;
  className?: string;
  minHeight?: string;
}) {
  return (
    <section
      id={id}
      className={`${minHeight} w-full flex flex-col justify-center px-8 py-16 relative border-b border-white/5 ${className}`}
    >
      {children}
    </section>
  );
}

// ── Direction badge ───────────────────────────────────────────

function DirectionBadge({ direction }: { direction: "LONG" | "SHORT" }) {
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-bold tracking-wide ${
        direction === "LONG"
          ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
          : "bg-red-500/15 text-red-400 border border-red-500/30"
      }`}
    >
      {direction === "LONG" ? "▲" : "▼"} {direction}
    </span>
  );
}

// ── Upside badge ──────────────────────────────────────────────

function UpsideBadge({ upside }: { upside: number }) {
  const positive = upside > 0;
  return (
    <span
      className={`font-mono font-bold text-sm ${
        positive ? "text-emerald-400" : "text-red-400"
      }`}
    >
      {positive ? "+" : ""}
      {upside}%
    </span>
  );
}

// ── Custom tooltip ────────────────────────────────────────────

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-card border border-border rounded-lg px-3 py-2 text-xs shadow-xl">
      <div className="text-muted-foreground mb-1">{label}</div>
      {payload.map((p: any, i: number) => (
        <div key={i} style={{ color: p.fill || p.color }} className="font-mono font-bold">
          {p.value}%
        </div>
      ))}
    </div>
  );
}

function ValuationTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-card border border-border rounded-lg px-3 py-2 text-xs shadow-xl">
      <div className="text-muted-foreground mb-1">{label}</div>
      <div className="font-mono font-bold text-indigo-300">${payload[0].value}/share</div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────

export default function StockPitch() {
  const [activeSlide, setActiveSlide] = useState(0);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const idx = SLIDES.findIndex((s) => s.id === entry.target.id);
            if (idx !== -1) setActiveSlide(idx);
          }
        });
      },
      { threshold: 0.3 }
    );
    SLIDES.forEach((s) => {
      const el = document.getElementById(s.id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, []);

  return (
    <div className="relative bg-[#0f1117] min-h-screen w-full">
      <SlideNav activeSlide={activeSlide} />

      {/* ── Slide 1: Title / Executive Summary ── */}
      <Slide id="slide-title" className="bg-gradient-to-b from-[#0d1025] to-[#0f1117]" minHeight="min-h-screen">
        {/* Radial glow */}
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[400px] rounded-full opacity-20 pointer-events-none"
          style={{
            background: "radial-gradient(ellipse at center, #6366f1 0%, transparent 70%)",
          }}
        />

        <div className="max-w-5xl mx-auto w-full">
          <FadeIn>
            <div className="text-xs font-mono text-indigo-400/70 tracking-widest uppercase mb-4">
              Stock Pitch Competition · April 2026
            </div>
            <h1 className="text-5xl md:text-6xl font-bold text-white leading-tight tracking-tight mb-2">
              BioPharma Atlas
            </h1>
            <h2 className="text-3xl md:text-4xl font-light text-indigo-300 mb-6">
              Investment Thesis
            </h2>
            <p className="text-sm text-muted-foreground mb-2">
              Built with Perplexity Computer · April 2026
            </p>
          </FadeIn>

          <FadeIn delay={0.15}>
            <div className="mt-8 mb-10 p-5 rounded-xl border border-indigo-500/30 bg-indigo-500/5 max-w-2xl">
              <p className="text-base text-indigo-100 leading-relaxed font-light">
                We recommend{" "}
                <span className="text-indigo-300 font-semibold">LONG BioNTech (BNTX)</span> at{" "}
                <span className="font-mono font-bold text-white">$92</span> with a{" "}
                <span className="font-mono font-bold text-emerald-400">$155 target (+68% upside)</span>
                , driven by a pipeline priced at just{" "}
                <span className="font-mono font-bold text-indigo-300">$18/share</span> after cash.
              </p>
            </div>
          </FadeIn>

          {/* 4 Pick cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {picks.map((pick, i) => (
              <FadeIn key={pick.ticker} delay={0.2 + i * 0.08}>
                <div
                  className="rounded-xl border p-4 bg-white/[0.02] hover:bg-white/[0.04] transition-colors cursor-default"
                  style={{ borderColor: `${pick.color}30` }}
                >
                  <div className="flex items-start justify-between mb-2">
                    <span
                      className="text-xl font-bold font-mono"
                      style={{ color: pick.color }}
                    >
                      {pick.ticker}
                    </span>
                    <DirectionBadge direction={pick.direction} />
                  </div>
                  <div className="text-xs text-muted-foreground mb-1">{pick.name}</div>
                  <div className="flex items-baseline gap-2 mt-2">
                    <span className="font-mono text-sm text-white">
                      ${pick.price}
                    </span>
                    <span className="text-muted-foreground text-xs">→</span>
                    <span className="font-mono text-sm font-bold" style={{ color: pick.color }}>
                      ${pick.target}
                    </span>
                  </div>
                  <div className="mt-1.5">
                    <UpsideBadge upside={pick.upside} />
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>

          <FadeIn delay={0.55}>
            <div className="mt-12 flex items-center gap-2 text-xs text-muted-foreground">
              <motion.span
                animate={{ y: [0, 5, 0] }}
                transition={{ repeat: Infinity, duration: 1.6, ease: "easeInOut" }}
              >
                ↓
              </motion.span>
              Scroll to explore the analysis
            </div>
          </FadeIn>
        </div>
      </Slide>

      {/* ── Slide 2: Screening Process ── */}
      <Slide id="slide-screen">
        <div className="max-w-4xl mx-auto w-full">
          <FadeIn>
            <div className="text-xs font-mono text-cyan-400/70 tracking-widest uppercase mb-3">
              Slide 02 · Screening Process
            </div>
            <h2 className="text-3xl font-bold text-white mb-2">The Screening Process</h2>
            <p className="text-sm text-muted-foreground max-w-lg mb-10">
              From 500+ public biopharma companies to 4 high-conviction picks — a six-stage systematic filter.
            </p>
          </FadeIn>

          {/* Funnel visualization */}
          <div className="flex flex-col gap-0">
            {screeningFunnel.map((stage, i) => {
              const widths = ["100%", "62%", "44%", "30%", "20%", "12%"];
              const colors = [
                "#6366f1",
                "#8b5cf6",
                "#06b6d4",
                "#10b981",
                "#f59e0b",
                "#ef4444",
              ];
              return (
                <FadeIn key={stage.stage} delay={i * 0.08}>
                  <div className="flex items-center gap-4 mb-2">
                    {/* Bar */}
                    <div className="w-64 relative h-9 flex-shrink-0">
                      <motion.div
                        initial={{ width: 0 }}
                        whileInView={{ width: widths[i] }}
                        transition={{ duration: 0.7, delay: i * 0.08, ease: "easeOut" }}
                        viewport={{ once: true }}
                        className="absolute left-0 top-0 h-full rounded-r-md flex items-center px-3"
                        style={{ background: `${colors[i]}25`, borderLeft: `3px solid ${colors[i]}` }}
                      >
                        <span className="font-mono font-bold text-sm" style={{ color: colors[i] }}>
                          {stage.count}{i === 0 ? "+" : ""}
                        </span>
                      </motion.div>
                    </div>
                    {/* Label */}
                    <div>
                      <div className="text-sm font-semibold text-white">{stage.stage}</div>
                      <div className="text-xs text-muted-foreground">{stage.description}</div>
                    </div>
                  </div>
                </FadeIn>
              );
            })}
          </div>

          <FadeIn delay={0.6}>
            <div className="mt-8 p-4 rounded-lg border border-white/10 bg-white/[0.02] max-w-2xl">
              <div className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-2">
                Methodology
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Ranked by pipeline-to-market-cap ratio, modality exposure to fastest-growing drug classes
                (ADCs, bispecifics, RNA), and proximity to binary catalysts. Pipeline Density Score =
                (Phase 3 × 1.0 + Phase 2 × 0.5 + Approved × 2.0) / Market Cap ($B). Probability of
                success rates from BIO/QLS Advisors 2020 clinical development data, adjusted by modality.
              </p>
            </div>
          </FadeIn>
        </div>
      </Slide>

      {/* ── Slide 3: Structural Trends ── */}
      <Slide id="slide-trends">
        <div className="max-w-5xl mx-auto w-full">
          <FadeIn>
            <div className="text-xs font-mono text-purple-400/70 tracking-widest uppercase mb-3">
              Slide 03 · Structural Trends
            </div>
            <h2 className="text-3xl font-bold text-white mb-2">Three Structural Tailwinds</h2>
            <p className="text-sm text-muted-foreground mb-10">
              The macro forces driving the investment thesis.
            </p>
          </FadeIn>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
            {structuralTrends.map((trend, i) => (
              <FadeIn key={trend.title} delay={i * 0.1}>
                <div className="p-5 rounded-xl border border-white/10 bg-white/[0.02] h-full">
                  <div className="text-sm font-bold text-white mb-3">{trend.title}</div>
                  <div className="grid grid-cols-1 gap-2 mb-3">
                    {trend.stats.map((stat) => (
                      <div key={stat.label} className="flex justify-between items-center">
                        <span className="text-xs text-muted-foreground">{stat.label}</span>
                        <span className="font-mono font-bold text-indigo-300 text-sm">{stat.value}</span>
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">{trend.detail}</p>
                </div>
              </FadeIn>
            ))}
          </div>

          <FadeIn delay={0.4}>
            <div>
              <div className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-4">
                Modality Asymmetry Ratios — Success vs. Failure Moves
              </div>
              <div className="text-xs text-muted-foreground mb-3">
                Ratio &lt;1 = market skeptical (best long setup) · Ratio &gt;1 = market optimistic (avoid pre-catalyst)
              </div>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart
                  data={modalityAsymmetry}
                  margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff08" />
                  <XAxis
                    dataKey="modality"
                    tick={{ fill: "#94a3b8", fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fill: "#94a3b8", fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(v) => `${v}×`}
                  />
                  <Tooltip
                    cursor={{ fill: "rgba(255,255,255,0.03)" }}
                    content={({ active, payload, label }) => {
                      if (!active || !payload?.length) return null;
                      const d = modalityAsymmetry.find((m) => m.modality === label);
                      return (
                        <div className="bg-card border border-border rounded-lg px-3 py-2 text-xs shadow-xl">
                          <div className="text-white font-bold mb-1">{label}</div>
                          <div className="text-emerald-400">Avg Success: +{d?.successAvg}%</div>
                          <div className="text-red-400">Avg Failure: {d?.failureAvg}%</div>
                          <div className="text-indigo-300 font-mono font-bold mt-1">
                            Ratio: {d?.ratio}×
                          </div>
                        </div>
                      );
                    }}
                  />
                  <ReferenceLine y={1} stroke="#ef444450" strokeDasharray="4 4" />
                  <Bar dataKey="ratio" radius={[3, 3, 0, 0]}>
                    {modalityAsymmetry.map((entry, i) => (
                      <Cell key={i} fill={entry.color} opacity={0.85} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </FadeIn>
        </div>
      </Slide>

      {/* ── Slide 4: Primary Thesis — BNTX ── */}
      <Slide id="slide-bntx" className="bg-gradient-to-b from-[#0f1117] to-[#0d1025]">
        <div className="max-w-5xl mx-auto w-full">
          <FadeIn>
            <div className="text-xs font-mono text-indigo-400/70 tracking-widest uppercase mb-3">
              Slide 04 · Primary Thesis
            </div>
          </FadeIn>

          {/* Hero header */}
          <FadeIn delay={0.05}>
            <div
              className="rounded-2xl border p-6 mb-8"
              style={{
                borderColor: "#6366f130",
                background:
                  "linear-gradient(135deg, rgba(99,102,241,0.08) 0%, rgba(99,102,241,0.02) 100%)",
              }}
            >
              <div className="flex flex-wrap items-center gap-3 mb-2">
                <DirectionBadge direction="LONG" />
                <span className="font-mono font-bold text-indigo-400 text-sm">BNTX</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-white tracking-tight">
                LONG BioNTech (BNTX)
              </h2>
              <div className="flex flex-wrap items-center gap-4 mt-2">
                <span className="font-mono text-lg text-muted-foreground">$92.08</span>
                <span className="text-muted-foreground">→</span>
                <span className="font-mono text-2xl font-bold text-indigo-300">$155.00</span>
                <span className="px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 font-bold text-sm font-mono">
                  +68% Upside
                </span>
              </div>
            </div>
          </FadeIn>

          {/* Stat cards */}
          <FadeIn delay={0.15}>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-2 mb-8">
              {bntxStats.slice(0, 10).map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-lg border border-white/10 bg-white/[0.02] p-3 text-center"
                >
                  <div className="font-mono font-bold text-indigo-300 text-base">{stat.value}</div>
                  <div className="text-xs text-muted-foreground mt-1 leading-tight">{stat.label}</div>
                </div>
              ))}
            </div>
          </FadeIn>

          {/* Thesis paragraphs */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {bntxThesis.map((t, i) => (
              <FadeIn key={t.heading} delay={0.2 + i * 0.1}>
                <div className="p-4 rounded-xl border border-indigo-500/15 bg-indigo-500/[0.03] h-full">
                  <div className="text-xs font-bold text-indigo-400 mb-2 uppercase tracking-wide">
                    {i + 1}. {t.heading}
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">{t.body}</p>
                </div>
              </FadeIn>
            ))}
          </div>

          <FadeIn delay={0.55}>
            <div className="mt-6 p-4 rounded-xl border border-amber-500/20 bg-amber-500/[0.03]">
              <p className="text-sm text-amber-200/80 leading-relaxed">
                <span className="font-bold text-amber-300">The Valuation Absurdity:</span> At $92/share,
                the market values the entire pipeline at{" "}
                <span className="font-mono font-bold text-white">$4.3B</span> — less than what AbbVie
                paid for a single ADC (ImmunoGen at{" "}
                <span className="font-mono font-bold text-white">$10.1B</span>). BNT323 alone met its
                China Phase 3 primary endpoint.
              </p>
            </div>
          </FadeIn>
        </div>
      </Slide>

      {/* ── Slide 5: BNTX Valuation ── */}
      <Slide id="slide-valuation">
        <div className="max-w-5xl mx-auto w-full">
          <FadeIn>
            <div className="text-xs font-mono text-indigo-400/70 tracking-widest uppercase mb-3">
              Slide 05 · BNTX Valuation
            </div>
            <h2 className="text-3xl font-bold text-white mb-8">DCF Scenarios & M&A Comps</h2>
          </FadeIn>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Scenario table */}
            <FadeIn delay={0.1}>
              <div>
                <div className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-3">
                  3-Scenario DCF
                </div>
                <div className="rounded-xl border border-white/10 overflow-hidden">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b border-white/10 bg-white/[0.03]">
                        <th className="text-left p-3 text-muted-foreground font-medium">Scenario</th>
                        <th className="text-right p-3 text-muted-foreground font-medium">Weight</th>
                        <th className="text-right p-3 text-muted-foreground font-medium">Price Target</th>
                      </tr>
                    </thead>
                    <tbody>
                      {bntxScenarios.map((s, i) => (
                        <tr
                          key={s.label}
                          className="border-b border-white/5 hover:bg-white/[0.02] transition-colors"
                        >
                          <td className="p-3 font-medium text-white">{s.label}</td>
                          <td className="p-3 text-right text-muted-foreground">
                            {s.weight ? `${(s.weight * 100).toFixed(0)}%` : "—"}
                          </td>
                          <td className="p-3 text-right font-mono font-bold" style={{ color: s.color }}>
                            ${s.value}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="mt-4">
                  <div className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-2">
                    Key Assumptions
                  </div>
                  <ul className="space-y-1">
                    {bntxAssumptions.map((a, i) => (
                      <li key={i} className="flex gap-2 text-xs text-muted-foreground">
                        <span className="text-indigo-400 flex-shrink-0">·</span>
                        <span>{a}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </FadeIn>

            {/* Bar chart */}
            <FadeIn delay={0.2}>
              <div>
                <div className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-3">
                  Price Target Comparison
                </div>
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart
                    data={bntxValuationChart}
                    margin={{ top: 5, right: 20, left: 0, bottom: 60 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff08" />
                    <XAxis
                      dataKey="name"
                      tick={{ fill: "#94a3b8", fontSize: 10 }}
                      axisLine={false}
                      tickLine={false}
                      angle={-35}
                      textAnchor="end"
                      interval={0}
                    />
                    <YAxis
                      tick={{ fill: "#94a3b8", fontSize: 11 }}
                      axisLine={false}
                      tickLine={false}
                      tickFormatter={(v) => `$${v}`}
                    />
                    <Tooltip content={<ValuationTooltip />} cursor={{ fill: "rgba(255,255,255,0.03)" }} />
                    <ReferenceLine y={92} stroke="#64748b" strokeDasharray="4 4" label={{ value: "Current $92", fill: "#64748b", fontSize: 10 }} />
                    <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                      {bntxValuationChart.map((entry, i) => (
                        <Cell key={i} fill={entry.fill} opacity={0.85} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </FadeIn>
          </div>
        </div>
      </Slide>

      {/* ── Slide 6: BNTX Catalysts ── */}
      <Slide id="slide-catalysts">
        <div className="max-w-4xl mx-auto w-full">
          <FadeIn>
            <div className="text-xs font-mono text-indigo-400/70 tracking-widest uppercase mb-3">
              Slide 06 · BNTX Catalysts & Timeline
            </div>
            <h2 className="text-3xl font-bold text-white mb-8">Catalyst Calendar</h2>
          </FadeIn>

          {/* Timeline */}
          <div className="relative">
            {/* Vertical line */}
            <div className="absolute left-[120px] top-0 bottom-0 w-px bg-white/10" />

            <div className="space-y-4">
              {bntxCatalysts.map((c, i) => (
                <FadeIn key={i} delay={i * 0.08}>
                  <div className="flex items-start gap-6">
                    {/* Date */}
                    <div className="w-[108px] flex-shrink-0 text-right">
                      <span className="font-mono text-sm font-bold text-indigo-300">{c.date}</span>
                    </div>

                    {/* Dot */}
                    <div
                      className={`relative z-10 w-3 h-3 rounded-full flex-shrink-0 mt-1 ${
                        c.type === "risk"
                          ? "bg-amber-400"
                          : "bg-indigo-400"
                      }`}
                    />

                    {/* Content */}
                    <div className="flex-1 pb-4">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-semibold text-white">{c.event}</span>
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            c.type === "risk"
                              ? "bg-amber-500/15 text-amber-400 border border-amber-500/30"
                              : c.impact === "HIGH"
                              ? "bg-indigo-500/15 text-indigo-300 border border-indigo-500/30"
                              : "bg-white/5 text-muted-foreground border border-white/10"
                          }`}
                        >
                          {c.type === "risk" ? "⚠ RISK" : c.impact}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground">{c.detail}</p>
                    </div>
                  </div>
                </FadeIn>
              ))}
            </div>
          </div>

          <FadeIn delay={0.6}>
            <div className="mt-8 p-4 rounded-xl border border-amber-500/20 bg-amber-500/[0.03]">
              <div className="text-xs font-bold text-amber-400 mb-1">Key Risk Callout</div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Co-founder spin-out IP agreement resolution (H1 2026) is the primary overhang. Until the
                IP boundary between BioNTech and the founders' new venture is legally defined, the stock
                may remain depressed. Resolution is the catalyst to remove this discount. €14.9B in cash
                provides full financial protection regardless of IP outcome.
              </p>
            </div>
          </FadeIn>
        </div>
      </Slide>

      {/* ── Slide 7: BNTX Competitive Positioning ── */}
      <Slide id="slide-competitive">
        <div className="max-w-5xl mx-auto w-full">
          <FadeIn>
            <div className="text-xs font-mono text-indigo-400/70 tracking-widest uppercase mb-3">
              Slide 07 · Competitive Positioning
            </div>
            <h2 className="text-3xl font-bold text-white mb-8">BNTX Pipeline vs. Competitors</h2>
          </FadeIn>

          {/* BNT327 table */}
          <FadeIn delay={0.1}>
            <div className="mb-8">
              <div className="text-xs font-semibold text-indigo-400 uppercase tracking-widest mb-3">
                BNT327 — PD-L1×VEGF-A Bispecific
              </div>
              <div className="rounded-xl border border-white/10 overflow-x-auto">
                <table className="w-full text-xs min-w-[600px]">
                  <thead>
                    <tr className="border-b border-white/10 bg-white/[0.03]">
                      {["Asset", "Company", "Target", "Phase", "Key Data", "Differentiation"].map(
                        (h) => (
                          <th key={h} className="text-left p-3 text-muted-foreground font-medium">
                            {h}
                          </th>
                        )
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {bntxCompTable.map((row, i) => (
                      <tr
                        key={i}
                        className={`border-b border-white/5 ${
                          row.status === "active"
                            ? "bg-indigo-500/[0.04]"
                            : row.status === "failed"
                            ? "opacity-50"
                            : ""
                        }`}
                      >
                        <td className="p-3 font-bold text-white">{row.asset}</td>
                        <td className="p-3 text-muted-foreground">{row.company}</td>
                        <td className="p-3 font-mono text-indigo-300">{row.target}</td>
                        <td className="p-3">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              row.phase === "Discontinued"
                                ? "bg-red-500/10 text-red-400 border border-red-500/20"
                                : row.phase === "Phase 3"
                                ? "bg-indigo-500/10 text-indigo-300 border border-indigo-500/20"
                                : "bg-white/5 text-muted-foreground border border-white/10"
                            }`}
                          >
                            {row.phase}
                          </span>
                        </td>
                        <td className="p-3 text-muted-foreground">{row.keyData}</td>
                        <td className="p-3 text-muted-foreground">{row.differentiation}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </FadeIn>

          {/* BNT323 table */}
          <FadeIn delay={0.2}>
            <div>
              <div className="text-xs font-semibold text-cyan-400 uppercase tracking-widest mb-3">
                BNT323 — HER2 ADC vs. Enhertu
              </div>
              <div className="rounded-xl border border-white/10 overflow-x-auto">
                <table className="w-full text-xs min-w-[600px]">
                  <thead>
                    <tr className="border-b border-white/10 bg-white/[0.03]">
                      {["Asset", "Company", "Mechanism", "Phase", "Key Data", "Differentiation"].map(
                        (h) => (
                          <th key={h} className="text-left p-3 text-muted-foreground font-medium">
                            {h}
                          </th>
                        )
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {bntxADCTable.map((row, i) => (
                      <tr
                        key={i}
                        className={`border-b border-white/5 ${
                          row.status === "active" ? "bg-cyan-500/[0.03]" : ""
                        }`}
                      >
                        <td className="p-3 font-bold text-white">{row.asset}</td>
                        <td className="p-3 text-muted-foreground">{row.company}</td>
                        <td className="p-3 font-mono text-cyan-300 text-[11px]">{row.target}</td>
                        <td className="p-3">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              row.phase === "Approved"
                                ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                                : "bg-indigo-500/10 text-indigo-300 border border-indigo-500/20"
                            }`}
                          >
                            {row.phase}
                          </span>
                        </td>
                        <td className="p-3 text-muted-foreground">{row.keyData}</td>
                        <td className="p-3 text-muted-foreground">{row.differentiation}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </FadeIn>
        </div>
      </Slide>

      {/* ── Slide 8: Secondary Picks ── */}
      <Slide id="slide-secondary" minHeight="min-h-[90vh]">
        <div className="max-w-5xl mx-auto w-full">
          <FadeIn>
            <div className="text-xs font-mono text-emerald-400/70 tracking-widest uppercase mb-3">
              Slide 08 · Secondary Picks
            </div>
            <h2 className="text-3xl font-bold text-white mb-8">Supporting Portfolio</h2>
          </FadeIn>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {secondaryPicks.map((pick, i) => (
              <FadeIn key={pick.ticker} delay={i * 0.12}>
                <div
                  className="rounded-xl border p-5 bg-white/[0.02] hover:bg-white/[0.03] transition-colors h-full flex flex-col"
                  style={{ borderColor: `${pick.color}25` }}
                >
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span
                          className="font-mono font-bold text-xl"
                          style={{ color: pick.color }}
                        >
                          {pick.ticker}
                        </span>
                        <DirectionBadge direction={pick.direction} />
                      </div>
                      <div className="text-xs text-muted-foreground">{pick.name}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-mono font-bold text-lg" style={{ color: pick.color }}>
                        <UpsideBadge upside={pick.upside} />
                      </div>
                      <div className="text-xs text-muted-foreground">
                        ${pick.price} → ${pick.target}
                      </div>
                    </div>
                  </div>

                  {/* Key metrics */}
                  <div
                    className="rounded-lg p-3 mb-4 border"
                    style={{ borderColor: `${pick.color}15`, background: `${pick.color}08` }}
                  >
                    {pick.keyMetrics.map((m) => (
                      <div key={m.label} className="flex justify-between items-center py-0.5">
                        <span className="text-xs text-muted-foreground">{m.label}</span>
                        <span className="font-mono text-xs font-bold text-white">{m.value}</span>
                      </div>
                    ))}
                  </div>

                  {/* Bullets */}
                  <ul className="space-y-2 flex-1">
                    {pick.bullets.map((b, j) => (
                      <li key={j} className="flex gap-2 text-xs text-muted-foreground">
                        <span style={{ color: pick.color }} className="flex-shrink-0 font-bold mt-0.5">
                          ·
                        </span>
                        <span>{b}</span>
                      </li>
                    ))}
                  </ul>

                  {/* Timeframe */}
                  <div className="mt-3 pt-3 border-t border-white/5">
                    <div className="text-xs text-muted-foreground">
                      Timeframe:{" "}
                      <span className="text-white font-medium">{pick.timeframe}</span>
                    </div>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </Slide>

      {/* ── Slide 9: Risk Factors ── */}
      <Slide id="slide-risks">
        <div className="max-w-4xl mx-auto w-full">
          <FadeIn>
            <div className="text-xs font-mono text-amber-400/70 tracking-widest uppercase mb-3">
              Slide 09 · Risk Factors
            </div>
            <h2 className="text-3xl font-bold text-white mb-8">Key Risks & Mitigations</h2>
          </FadeIn>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {riskFactors.map((r, i) => (
              <FadeIn key={r.risk} delay={i * 0.1}>
                <div className="p-5 rounded-xl border border-amber-500/15 bg-amber-500/[0.02] h-full">
                  <div className="flex items-start gap-3 mb-3">
                    <div
                      className={`flex-shrink-0 px-2 py-0.5 rounded text-[10px] font-bold border mt-0.5 ${
                        r.severity === "HIGH"
                          ? "bg-red-500/15 text-red-400 border-red-500/30"
                          : r.severity === "MEDIUM"
                          ? "bg-amber-500/15 text-amber-400 border-amber-500/30"
                          : "bg-emerald-500/15 text-emerald-400 border-emerald-500/30"
                      }`}
                    >
                      {r.severity}
                    </div>
                    <div className="text-sm font-semibold text-white">{r.risk}</div>
                  </div>
                  <div className="flex gap-2">
                    <span className="text-emerald-400 text-xs font-bold flex-shrink-0 mt-0.5">✓</span>
                    <p className="text-xs text-muted-foreground leading-relaxed">{r.mitigation}</p>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>

          <FadeIn delay={0.5}>
            <div className="mt-8 p-4 rounded-xl border border-white/10 bg-white/[0.02]">
              <div className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-2">
                Portfolio-Level Risk Assessment
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                The four picks are constructed to have limited correlation: BNTX is an mRNA/bispecific
                story, LEGN is a CAR-T / buyout story, IONS is an RNA/ASO story, and GILD is a short
                on franchise overvaluation. A sector-wide selloff would affect all longs but the GILD
                short would partially offset losses. The BNTX cash floor (~$74/share) and LEGN buyout
                premium provide structural downside protection across the portfolio.
              </p>
            </div>
          </FadeIn>
        </div>
      </Slide>

      {/* ── Slide 10: Methodology & Sources ── */}
      <Slide id="slide-methodology" className="bg-gradient-to-b from-[#0f1117] to-[#0a0d1a]">
        <div className="max-w-4xl mx-auto w-full">
          <FadeIn>
            <div className="text-xs font-mono text-muted-foreground tracking-widest uppercase mb-3">
              Slide 10 · Methodology & Sources
            </div>
            <h2 className="text-3xl font-bold text-white mb-3">Research Methodology</h2>
          </FadeIn>

          <FadeIn delay={0.1}>
            <div className="p-5 rounded-xl border border-indigo-500/20 bg-indigo-500/[0.03] mb-6">
              <div className="text-xs font-bold text-indigo-400 mb-2 uppercase tracking-wide">
                Built with Perplexity Computer
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                This investment thesis was developed through a systematic 14-prompt research pipeline
                using Perplexity Computer. The workflow covered: (1) Public biopharma universe expansion
                to 28 companies, (2) Pipeline density scoring using BIO/QLS POS data, (3) Modality
                exposure mapping, (4) Catalyst deep dives with binary event mispricing analysis,
                (5) M&A comparable transaction analysis (28 deals, 2023–2026), (6) Risk-adjusted SOTP
                valuations, (7) Historical price-catalyst attribution across 40+ events, (8) Modality-level
                event studies, (9) SEC 10-K/20-F filing analysis and earnings sentiment, (10) Competitive
                landscape deep dives, and (11) Three-scenario DCF modeling for each pick.
              </p>
            </div>
          </FadeIn>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FadeIn delay={0.2}>
              <div>
                <div className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-3">
                  Data Sources
                </div>
                <ul className="space-y-1.5">
                  {dataSources.map((s) => (
                    <li key={s.name}>
                      <a
                        href={s.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors"
                      >
                        → {s.name}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </FadeIn>

            <FadeIn delay={0.3}>
              <div>
                <div className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-3">
                  Explore BioPharma Atlas
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {dashboardLinks.map((link) => (
                    <Link key={link.path} href={link.path}>
                      <div className="p-3 rounded-lg border border-white/10 bg-white/[0.02] hover:bg-white/[0.05] hover:border-indigo-500/30 cursor-pointer transition-all text-xs text-muted-foreground hover:text-white">
                        → {link.label}
                      </div>
                    </Link>
                  ))}
                </div>

                {/* Deep-Dive Research Documents */}
                <div className="mt-6">
                  <div className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-3">
                    Deep-Dive Research (8 documents · ~48,000 words)
                  </div>
                  <p className="text-xs text-muted-foreground/70 mb-3">
                    Full research files are included in the project export under <span className="font-mono text-cyan-400/80">docs/research/</span>
                  </p>
                  <div className="space-y-1.5">
                    {[
                      { file: "01-investment-thesis.md", title: "Investment Thesis — Top 4 Picks", prompts: "Prompt 10", words: "~6,000" },
                      { file: "02-pipeline-screen.md", title: "Pipeline Density Screen", prompts: "Prompts 1–3", words: "~4,000" },
                      { file: "03-catalyst-events.md", title: "Catalyst Deep Dives & Binary Events", prompts: "Prompts 4–5", words: "~7,000" },
                      { file: "04-valuation.md", title: "M&A Comps & Pipeline Valuation", prompts: "Prompts 6–7", words: "~6,000" },
                      { file: "05-event-studies.md", title: "Price-Catalyst Attribution & Event Studies", prompts: "Prompts 8–9", words: "~5,000" },
                      { file: "06-sec-filings.md", title: "SEC Filings & Earnings Sentiment", prompts: "Prompts 11–12", words: "~6,500" },
                      { file: "07-competition-model.md", title: "Competitive Landscape & Financial Model", prompts: "Prompts 13–14", words: "~6,500" },
                      { file: "08-base-data.md", title: "Base Data: Companies, Catalysts, M&A", prompts: "Base Research", words: "~7,000" },
                    ].map((doc) => (
                      <div key={doc.file} className="p-2.5 rounded-lg border border-white/10 bg-white/[0.02]">
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="text-xs font-medium text-gray-200">{doc.title}</span>
                            <span className="text-[10px] text-muted-foreground ml-2">{doc.prompts}</span>
                          </div>
                          <span className="text-[10px] font-mono text-muted-foreground">{doc.words}</span>
                        </div>
                        <div className="text-[10px] font-mono text-cyan-500/60 mt-0.5">docs/research/{doc.file}</div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-6 p-4 rounded-xl border border-white/10 bg-white/[0.02]">
                  <div className="text-xs font-bold text-muted-foreground mb-1">Disclaimer</div>
                  <p className="text-xs text-muted-foreground/70 leading-relaxed">
                    For educational purposes only. Not investment advice. All data as of April 8, 2026.
                    Past performance does not guarantee future results. This research was produced
                    for a stock pitch competition and should not be construed as a solicitation to buy
                    or sell any security.
                  </p>
                </div>

                {/* Judges callout */}
                <div className="mt-4 p-3 rounded-lg border border-indigo-500/20 bg-indigo-500/[0.04]">
                  <div className="text-xs text-indigo-400/80 mb-1 font-semibold">Competition Judges</div>
                  <div className="text-xs text-muted-foreground space-y-0.5">
                    <div>Philippe Laffont — Coatue Management</div>
                    <div>Dan Loeb — Third Point LLC</div>
                    <div>Ken Hao — Silver Lake</div>
                  </div>
                </div>
              </div>
            </FadeIn>
          </div>
        </div>
      </Slide>
    </div>
  );
}
