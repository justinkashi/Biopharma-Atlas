import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { targetClassData, dataSourceNotes } from "@/data/pipelineData";
import { DataBadge } from "@/components/DataBadge";

const YEARS = [2005, 2015, 2025] as const;
const MAX_ACTIVITY = Math.max(...targetClassData.map(d => Math.max(d.activity2005, d.activity2015, d.activity2025)));

function activityKey(year: typeof YEARS[number]): "activity2005" | "activity2015" | "activity2025" {
  return `activity${year}` as "activity2005" | "activity2015" | "activity2025";
}

function getColor(value: number, max: number): string {
  const pct = value / max;
  // Scale: dark (low) → bright cyan/teal (high)
  if (pct < 0.05) return "#0c1b22";
  if (pct < 0.15) return "#0e3040";
  if (pct < 0.30) return "#0e5068";
  if (pct < 0.50) return "#077090";
  if (pct < 0.70) return "#059ab8";
  if (pct < 0.85) return "#06b6d4";
  return "#22d3ee";
}

function TrendIcon({ trend }: { trend: string }) {
  if (trend === "up") return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="#22c55e" strokeWidth="1.5">
      <polyline points="2,9 6,3 10,9"/>
    </svg>
  );
  if (trend === "down") return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="#ef4444" strokeWidth="1.5">
      <polyline points="2,3 6,9 10,3"/>
    </svg>
  );
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="#f59e0b" strokeWidth="1.5">
      <line x1="2" y1="6" x2="10" y2="6"/>
    </svg>
  );
}

export default function TargetHeatmap() {
  const [selectedTarget, setSelectedTarget] = useState<typeof targetClassData[number] | null>(targetClassData[0]);
  const [hoveredCell, setHoveredCell] = useState<{ target: string; year: number; value: number } | null>(null);
  const [showTooltip, setShowTooltip] = useState(false);

  const note = dataSourceNotes["targetClassData"];

  return (
    <div className="p-6 min-h-full">
      <div className="mb-4 flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-semibold text-foreground tracking-tight">Target Class Heatmap</h1>
            {note && (
              <DataBadge
                confidence={note.confidence}
                source={note.source}
                note={note.note}
              />
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            Pipeline activity by drug target class across 2005 → 2015 → 2025. Click any row to explore.
          </p>
        </div>
      </div>

      <div className="flex gap-6">
        {/* Heatmap */}
        <div className="flex-1 bg-card border border-card-border rounded-xl p-4">
          {/* Column headers */}
          <div className="flex items-center mb-3">
            <div className="w-52 flex-shrink-0 text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">
              Target Class
            </div>
            <div className="flex-1 grid grid-cols-3 gap-2">
              {YEARS.map(year => (
                <div key={year} className="text-center text-[10px] font-mono font-semibold text-primary">{year}</div>
              ))}
            </div>
            <div className="w-20 text-center text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">
              Trend
            </div>
          </div>

          {/* Heatmap rows */}
          <div className="space-y-1.5">
            {targetClassData.map((row) => {
              const isSelected = selectedTarget?.targetClass === row.targetClass;
              return (
                <motion.div
                  key={row.targetClass}
                  data-testid={`heatmap-row-${row.targetClass.toLowerCase().replace(/\s/g, "-")}`}
                  whileHover={{ scale: 1.005 }}
                  onClick={() => setSelectedTarget(isSelected ? null : row)}
                  className={`flex items-center rounded-lg cursor-pointer transition-all duration-100 px-2 py-1.5 ${
                    isSelected ? "bg-primary/10 border border-primary/20" : "hover:bg-background/50"
                  }`}
                >
                  {/* Target name */}
                  <div className="w-52 flex-shrink-0">
                    <span className="text-xs font-medium text-foreground">{row.targetClass}</span>
                  </div>

                  {/* Heatmap cells */}
                  <div className="flex-1 grid grid-cols-3 gap-2">
                    {YEARS.map(year => {
                      const val = row[activityKey(year)];
                      const bgColor = getColor(val, MAX_ACTIVITY);
                      const isHovered = hoveredCell?.target === row.targetClass && hoveredCell.year === year;

                      return (
                        <div
                          key={year}
                          className="relative h-9 rounded flex items-center justify-center font-mono text-xs font-semibold transition-all duration-150"
                          style={{
                            background: bgColor,
                            color: val / MAX_ACTIVITY > 0.4 ? "#0f1117" : "#e2e8f0",
                            boxShadow: isHovered ? `0 0 12px ${bgColor}80` : "none",
                          }}
                          onMouseEnter={() => setHoveredCell({ target: row.targetClass, year, value: val })}
                          onMouseLeave={() => setHoveredCell(null)}
                        >
                          {val}
                        </div>
                      );
                    })}
                  </div>

                  {/* Trend */}
                  <div className="w-20 flex justify-center">
                    <TrendIcon trend={row.trend} />
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Color scale legend */}
          <div className="mt-4 flex items-center gap-3">
            <span className="text-[10px] text-muted-foreground">Low activity</span>
            <div className="flex-1 h-3 rounded" style={{
              background: "linear-gradient(to right, #0c1b22, #0e3040, #0e5068, #077090, #059ab8, #06b6d4, #22d3ee)"
            }} />
            <span className="text-[10px] text-muted-foreground">High activity</span>
          </div>

          {/* Hover tooltip */}
          {hoveredCell && (
            <div className="mt-2 text-xs text-muted-foreground font-mono">
              <span className="text-foreground">{hoveredCell.target}</span> · {hoveredCell.year} ·{" "}
              <span className="text-primary font-bold">{hoveredCell.value}</span> active programs
            </div>
          )}
        </div>

        {/* Detail panel */}
        <div className="w-80 flex-shrink-0">
          <AnimatePresence mode="wait">
            {selectedTarget ? (
              <motion.div
                key={selectedTarget.targetClass}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.2 }}
                className="bg-card border border-card-border rounded-xl p-4 h-full overflow-y-auto"
              >
                <div className="flex items-center gap-2 mb-3">
                  <h2 className="text-sm font-semibold text-foreground flex-1">{selectedTarget.targetClass}</h2>
                  <TrendIcon trend={selectedTarget.trend} />
                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${
                    selectedTarget.trend === "up"
                      ? "text-[#22c55e] border-[#22c55e30] bg-[#22c55e10]"
                      : selectedTarget.trend === "down"
                        ? "text-[#ef4444] border-[#ef444430] bg-[#ef444410]"
                        : "text-[#f59e0b] border-[#f59e0b30] bg-[#f59e0b10]"
                  }`}>
                    {selectedTarget.trend === "up" ? "Rising" : selectedTarget.trend === "down" ? "Declining" : "Stable"}
                  </span>
                </div>

                <p className="text-xs text-foreground/80 leading-relaxed mb-4">{selectedTarget.description}</p>

                {/* Activity numbers */}
                <div className="grid grid-cols-3 gap-2 mb-4">
                  {YEARS.map(year => (
                    <div key={year} className="text-center p-2 rounded-lg"
                      style={{ background: `${getColor(selectedTarget[activityKey(year)], MAX_ACTIVITY)}40`, border: `1px solid ${getColor(selectedTarget[activityKey(year)], MAX_ACTIVITY)}60` }}>
                      <div className="text-[10px] text-muted-foreground font-mono">{year}</div>
                      <div className="text-base font-mono font-bold text-foreground">{selectedTarget[activityKey(year)]}</div>
                    </div>
                  ))}
                </div>

                {/* Example drugs */}
                <div className="border-t border-border pt-3 mb-3">
                  <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest mb-2">Example Drugs</div>
                  <p className="text-xs text-foreground/80">{selectedTarget.examples}</p>
                </div>

                {/* Learn More Tooltip */}
                <div
                  className="rounded-lg border overflow-hidden"
                  style={{ borderColor: "#06b6d430", background: "#06b6d408" }}
                >
                  <button
                    onClick={() => setShowTooltip(!showTooltip)}
                    className="w-full flex items-center justify-between px-3 py-2 text-[10px] font-semibold text-primary transition-colors hover:opacity-80"
                    data-testid={`tooltip-toggle-${selectedTarget.targetClass.toLowerCase().replace(/\s/g, "-")}`}
                  >
                    <span>Learn More — Mechanism & Biology</span>
                    <span className="text-base leading-none">{showTooltip ? "−" : "+"}</span>
                  </button>
                  {showTooltip && (
                    <div className="px-3 pb-3 border-t" style={{ borderColor: "#06b6d420" }}>
                      <p className="text-xs text-foreground/75 leading-relaxed mt-2">
                        {selectedTarget.tooltip}
                      </p>
                    </div>
                  )}
                </div>
              </motion.div>
            ) : (
              <div className="bg-card border border-card-border rounded-xl p-4 h-full flex items-center justify-center">
                <p className="text-xs text-muted-foreground text-center">Click a target class row to see details</p>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
