import { useState } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from "recharts";
import { attritionData, pipelineByModality, dataSourceNotes } from "@/data/pipelineData";
import { useInfoPanel } from "@/App";
import { DataBadge } from "@/components/DataBadge";
import { exportCsv } from "@/lib/exportCsv";

const pipelineChartData = Object.entries(pipelineByModality)
  .map(([key, value]) => ({
    name: key.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase()),
    value,
  }))
  .sort((a, b) => b.value - a.value);

const PIPELINE_COLORS = [
  "#06b6d4","#6366f1","#ec4899","#22c55e","#a855f7","#f97316","#eab308","#f43f5e",
  "#14b8a6","#78716c","#3b82f6","#84cc16","#fb923c","#c084fc","#34d399","#fbbf24","#60a5fa"
];

const CustomFunnelTooltip = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-card border border-border rounded-lg px-3 py-2 text-xs shadow-lg">
      <div className="text-foreground font-medium mb-1">{payload[0]?.payload.name}</div>
      <div className="text-primary font-mono">{payload[0]?.value?.toLocaleString()} trials</div>
    </div>
  );
};

// Phase bar tooltip with dropout stats
function PhaseBarTooltip({
  phase,
  prevPhase,
  color,
  isFirst,
  visible,
}: {
  phase: { label: string; value: number };
  prevPhase: { label: string; value: number } | null;
  color: string;
  isFirst: boolean;
  visible: boolean;
}) {
  if (!visible) return null;
  const dropout = prevPhase ? prevPhase.value - phase.value : 0;
  const dropoutPct = prevPhase ? ((dropout / prevPhase.value) * 100).toFixed(0) : "0";
  return (
    <div
      className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-50 min-w-[140px] rounded-lg px-3 py-2 text-xs shadow-xl pointer-events-none"
      style={{ background: "#141720", border: `1px solid ${color}40` }}
    >
      <div className="font-semibold mb-1" style={{ color }}>{phase.label}</div>
      <div className="font-mono text-foreground font-bold">{phase.value.toLocaleString()}</div>
      {isFirst ? (
        <div className="text-muted-foreground mt-1">Entry point</div>
      ) : prevPhase ? (
        <div className="text-muted-foreground mt-1">
          <span style={{ color: "#f43f5e" }}>{dropout.toLocaleString()} dropped out</span>
          <span className="ml-1">({dropoutPct}%)</span>
        </div>
      ) : null}
    </div>
  );
}

export default function PipelineFunnel() {
  const { openPanel } = useInfoPanel();
  const attritionNote = dataSourceNotes["attritionData"];
  const pipelineNote = dataSourceNotes["pipelineByModality"];
  const [hoveredPhase, setHoveredPhase] = useState<{ modality: string; idx: number } | null>(null);

  return (
    <div className="p-6 min-h-full">
      <div className="mb-4 flex items-start justify-between">
        <div>
          <h1 className="text-lg font-semibold text-foreground tracking-tight">Pipeline Funnel & Attrition</h1>
          <p className="text-xs text-muted-foreground mt-0.5">Phase progression and success rates by modality</p>
        </div>
        <button
          onClick={() => exportCsv("pipeline-attrition", attritionData as Record<string, unknown>[])}
          className="text-[9px] px-2 py-1 rounded border border-border text-muted-foreground hover:text-foreground hover:border-primary/40 transition-colors font-mono flex-shrink-0"
        >
          ↓ CSV
        </button>
      </div>

      {/* Attrition funnel cards */}
      <div className="bg-card border border-card-border rounded-xl p-4 mb-4">
        <div className="flex items-center gap-2 mb-4">
          <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">
            Phase Attrition by Modality
          </div>
          {attritionNote && (
            <DataBadge
              confidence={attritionNote.confidence}
              source={attritionNote.source}
              note={attritionNote.note}
            />
          )}
        </div>
        <div className="space-y-5">
          {attritionData.map((item) => {
            const phases = [
              { label: "Phase I", value: item.phaseI },
              { label: "Phase II", value: item.phaseII },
              { label: "Phase III", value: item.phaseIII },
              { label: "Approved", value: item.approved },
            ];
            const phaseIValue = item.phaseI;
            const MIN_WIDTH_PX = 60;

            return (
              <div key={item.modality} data-testid={`funnel-row-${item.modality.toLowerCase().replace(/\s/g, "-")}`}>
                <div className="flex items-center justify-between mb-2">
                  <button
                    onClick={() => {
                      const key = Object.entries({
                        "Small Molecules": "smallMolecule",
                        "Monoclonal Antibodies": "mAb",
                        "ADCs": "adc",
                        "Gene Therapy": "geneTherapy",
                        "CAR-T / Cell": "carT",
                        "RNA Therapeutics": "rnaTherapeutic",
                        "Bispecifics": "bispecific",
                        "Peptides": "peptide",
                      }).find(([k]) => k === item.modality)?.[1];
                      if (key) openPanel(key);
                    }}
                    className="text-xs font-medium hover:text-primary transition-colors"
                    style={{ color: item.color }}
                  >
                    {item.modality}
                  </button>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full border"
                    style={{ color: item.color, borderColor: `${item.color}40`, background: `${item.color}10` }}>
                    Success rate: {item.successRate}
                  </span>
                </div>

                {/* Proportional funnel bars — widths shrink left to right */}
                <div className="grid gap-1.5" style={{ gridTemplateColumns: phases.map((phase) => {
                    const pct = Math.max(5, (phase.value / phaseIValue) * 100);
                    return `${pct}fr`;
                  }).join(" ") }}>
                  {phases.map((phase, idx) => {
                    const isHovered = hoveredPhase?.modality === item.modality && hoveredPhase?.idx === idx;
                    return (
                      <div
                        key={phase.label}
                        className="relative min-w-0"
                        onMouseEnter={() => setHoveredPhase({ modality: item.modality, idx })}
                        onMouseLeave={() => setHoveredPhase(null)}
                      >
                        <div className="text-[9px] text-muted-foreground mb-1 font-mono text-center truncate">{phase.label}</div>
                        <div
                          className="h-8 rounded flex items-center justify-center relative transition-all duration-150"
                          style={{
                            background: `${item.color}${idx === 3 ? "60" : "30"}`,
                            border: `1px solid ${item.color}${isHovered ? "80" : "40"}`,
                            boxShadow: isHovered ? `0 0 8px ${item.color}30` : "none",
                          }}
                        >
                          <span className="text-[10px] font-mono font-bold" style={{ color: item.color }}>
                            {phase.value.toLocaleString()}
                          </span>
                        </div>
                        {/* Dropout tooltip */}
                        <PhaseBarTooltip
                          phase={phase}
                          prevPhase={idx > 0 ? phases[idx - 1] : null}
                          color={item.color}
                          isFirst={idx === 0}
                          visible={isHovered}
                        />
                        {/* Arrow connector */}
                        {idx < 3 && (
                          <div className="absolute right-0 top-1/2 translate-y-2 translate-x-1.5 z-10 text-muted-foreground text-[10px]">›</div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Pipeline by modality bar chart */}
      <div className="bg-card border border-card-border rounded-xl p-4">
        <div className="mb-3">
          <div className="flex items-center gap-2">
            <h2 className="text-xs font-semibold text-foreground">Total Pipeline by Modality</h2>
            {pipelineNote && (
              <DataBadge
                confidence={pipelineNote.confidence}
                source={pipelineNote.source}
                note={pipelineNote.note}
              />
            )}
          </div>
          <p className="text-[10px] text-muted-foreground">Active clinical trials on ClinicalTrials.gov</p>
        </div>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={pipelineChartData} layout="vertical" margin={{ left: 12, right: 20, top: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={false} />
            <XAxis
              type="number"
              tick={{ fill: "#8892a8", fontSize: 10, fontFamily: "JetBrains Mono" }}
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
              width={130}
            />
            <Tooltip content={<CustomFunnelTooltip />} />
            <Bar dataKey="value" radius={[0, 4, 4, 0]}>
              {pipelineChartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={PIPELINE_COLORS[index % PIPELINE_COLORS.length]} fillOpacity={0.8} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
