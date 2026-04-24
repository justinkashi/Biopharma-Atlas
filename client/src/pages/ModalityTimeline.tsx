import { useState, useRef } from "react";
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
  CartesianGrid, ReferenceLine, Legend
} from "recharts";
import { modalityTimelineData, modalityKeys, milestoneEvents } from "@/data/pipelineData";
import { useInfoPanel } from "@/App";

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  const total = payload.reduce((s: number, p: any) => s + (p.value || 0), 0);
  return (
    <div className="bg-card border border-border rounded-lg p-3 text-xs shadow-xl min-w-[200px]">
      <div className="font-mono text-primary font-bold mb-2">{label}</div>
      <div className="space-y-1 mb-2">
        {[...payload].reverse().map((p: any) => p.value > 0 && (
          <div key={p.dataKey} className="flex items-center gap-2 justify-between">
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: p.color }} />
              <span className="text-muted-foreground">{p.name}</span>
            </div>
            <span className="font-mono text-foreground">{p.value}</span>
          </div>
        ))}
      </div>
      <div className="border-t border-border pt-1.5 flex justify-between">
        <span className="text-muted-foreground">Total</span>
        <span className="font-mono text-foreground font-bold">{total}</span>
      </div>
    </div>
  );
};

export default function ModalityTimeline() {
  const { openPanel } = useInfoPanel();
  const [hiddenModalities, setHiddenModalities] = useState<Set<string>>(new Set());
  const [hoveredModality, setHoveredModality] = useState<string | null>(null);
  const [focusedYear, setFocusedYear] = useState<number | null>(null);
  const milestoneScrollRef = useRef<HTMLDivElement>(null);

  const toggleModality = (key: string) => {
    setHiddenModalities(prev => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const handleMilestoneClick = (year: number) => {
    if (focusedYear === year) {
      // Unfocus on second click
      setFocusedYear(null);
    } else {
      setFocusedYear(year);
    }
  };

  // Compute chart domain based on focused year — center view around it
  const allYears = modalityTimelineData.map(d => d.year);
  const minYear = Math.min(...allYears);
  const maxYear = Math.max(...allYears);
  const chartDomain: [number | string, number | string] = focusedYear
    ? [
        Math.max(minYear, focusedYear - 6),
        Math.min(maxYear, focusedYear + 6),
      ]
    : [minYear, maxYear];

  return (
    <div className="p-6 min-h-full">
      <div className="mb-4">
        <h1 className="text-lg font-semibold text-foreground tracking-tight">Modality Evolution Timeline</h1>
        <p className="text-xs text-muted-foreground mt-0.5">
          FDA approvals by drug class (2000–2025). Click legend to toggle. Click modality name to learn more.
        </p>
      </div>

      {/* Legend */}
      <div className="bg-card border border-card-border rounded-xl p-4 mb-4">
        <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest mb-3">Drug Modalities</div>
        <div className="flex flex-wrap gap-2">
          {modalityKeys.map(mk => {
            const isHidden = hiddenModalities.has(mk.key);
            const isHovered = hoveredModality === mk.key;
            return (
              <div key={mk.key} className="flex items-center gap-1">
                <button
                  data-testid={`legend-toggle-${mk.key}`}
                  onClick={() => toggleModality(mk.key)}
                  onMouseEnter={() => setHoveredModality(mk.key)}
                  onMouseLeave={() => setHoveredModality(null)}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] border transition-all duration-150 ${
                    isHidden
                      ? "border-border text-muted-foreground bg-transparent opacity-50"
                      : isHovered
                        ? "border-current text-foreground"
                        : "text-foreground"
                  }`}
                  style={{
                    borderColor: isHidden ? undefined : mk.color,
                    background: isHidden ? undefined : `${mk.color}18`,
                    color: isHidden ? undefined : mk.color,
                  }}
                >
                  <div
                    className="w-2 h-2 rounded-full flex-shrink-0"
                    style={{ background: isHidden ? "#555" : mk.color }}
                  />
                  {mk.label}
                </button>
                <button
                  data-testid={`info-btn-${mk.key}`}
                  onClick={() => openPanel(mk.key)}
                  className="w-4 h-4 rounded-full border border-border text-muted-foreground hover:text-primary hover:border-primary transition-colors flex items-center justify-center text-[9px] font-bold"
                  title={`Learn about ${mk.label}`}
                >i</button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Main chart */}
      <div className="bg-card border border-card-border rounded-xl p-4 mb-4">
        {focusedYear && (
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-mono text-primary">
              Focused: {focusedYear} — showing ±6 years
            </span>
            <button
              onClick={() => setFocusedYear(null)}
              className="text-[10px] px-2 py-0.5 rounded border border-border text-muted-foreground hover:text-primary hover:border-primary transition-colors"
            >
              Reset view
            </button>
          </div>
        )}
        <ResponsiveContainer width="100%" height={380}>
          <AreaChart data={modalityTimelineData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
            <defs>
              {modalityKeys.map(mk => (
                <linearGradient key={mk.key} id={`grad-${mk.key}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={mk.color} stopOpacity={0.6} />
                  <stop offset="95%" stopColor={mk.color} stopOpacity={0.05} />
                </linearGradient>
              ))}
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis
              dataKey="year"
              type="number"
              domain={chartDomain}
              tick={{ fill: "#8892a8", fontSize: 11, fontFamily: "JetBrains Mono" }}
              tickLine={false}
              axisLine={{ stroke: "rgba(255,255,255,0.08)" }}
              tickCount={focusedYear ? 7 : 26}
              allowDataOverflow
            />
            <YAxis
              tick={{ fill: "#8892a8", fontSize: 11, fontFamily: "JetBrains Mono" }}
              tickLine={false}
              axisLine={false}
              label={{ value: "Approvals", angle: -90, position: "insideLeft", fill: "#8892a8", fontSize: 10, dx: -5 }}
            />
            <Tooltip content={<CustomTooltip />} />
            {/* Regular milestone reference lines (subtle) */}
            {milestoneEvents.filter(m => m.year !== focusedYear).map((m, i) => (
              <ReferenceLine
                key={i}
                x={m.year}
                stroke="rgba(255,255,255,0.10)"
                strokeDasharray="4 4"
                label={{
                  value: i % 3 === 0 ? m.event.slice(0, 14) + "…" : "",
                  position: "top",
                  fill: "#8892a8",
                  fontSize: 8,
                }}
              />
            ))}
            {/* Focused year reference line — prominent */}
            {focusedYear && (
              <ReferenceLine
                x={focusedYear}
                stroke="#06b6d4"
                strokeWidth={2.5}
                strokeDasharray="6 3"
                label={{
                  value: String(focusedYear),
                  position: "top",
                  fill: "#06b6d4",
                  fontSize: 11,
                  fontWeight: "bold",
                  fontFamily: "JetBrains Mono",
                }}
              />
            )}
            {modalityKeys.map(mk => (
              <Area
                key={mk.key}
                type="monotone"
                dataKey={mk.key}
                name={mk.label}
                stackId="1"
                stroke={mk.color}
                strokeWidth={hiddenModalities.has(mk.key) ? 0 : (hoveredModality === mk.key ? 2 : 1)}
                fill={`url(#grad-${mk.key})`}
                hide={hiddenModalities.has(mk.key)}
                fillOpacity={hoveredModality && hoveredModality !== mk.key ? 0.3 : 1}
              />
            ))}
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Milestone event cards */}
      <div className="bg-card border border-card-border rounded-xl p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">Key Milestones</div>
          <div className="text-[10px] text-muted-foreground flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-primary/60 inline-block" />
            Click a card to focus the chart on that year
          </div>
        </div>
        <div className="overflow-x-auto" ref={milestoneScrollRef}>
          <div className="flex gap-3 pb-2" style={{ width: "max-content" }}>
            {milestoneEvents.map((m, i) => {
              const isFocused = focusedYear === m.year;
              return (
                <div
                  key={i}
                  data-testid={`milestone-${m.year}`}
                  onClick={() => handleMilestoneClick(m.year)}
                  className="bg-background border rounded-lg p-3 w-52 flex-shrink-0 transition-all duration-200 select-none"
                  style={{
                    cursor: "pointer",
                    borderColor: isFocused ? "#06b6d4" : "rgba(255,255,255,0.1)",
                    boxShadow: isFocused ? "0 0 12px rgba(6,182,212,0.25)" : "none",
                    background: isFocused ? "rgba(6,182,212,0.06)" : undefined,
                    transform: isFocused ? "translateY(-2px)" : "none",
                  }}
                >
                  <div className="flex items-center justify-between mb-1">
                    <div className="font-mono text-[10px] text-primary">{m.year}</div>
                    {isFocused ? (
                      <span className="text-[8px] px-1.5 py-0.5 rounded-full font-mono" style={{ background: "#06b6d420", color: "#06b6d4", border: "1px solid #06b6d440" }}>
                        focused
                      </span>
                    ) : (
                      <span className="text-[8px] text-muted-foreground opacity-50 group-hover:opacity-100 transition-opacity">
                        click to focus →
                      </span>
                    )}
                  </div>
                  <div className="text-xs font-medium text-foreground mb-1 line-clamp-2">{m.event}</div>
                  <div className="text-[10px] text-muted-foreground leading-relaxed line-clamp-3">{m.description}</div>
                  <div className="mt-2">
                    <span className="text-[9px] px-1.5 py-0.5 rounded-full border border-border text-muted-foreground font-mono">{m.category}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
