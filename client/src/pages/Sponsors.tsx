import { useState } from "react";
import { motion } from "framer-motion";
import { sponsorData } from "@/data/pipelineData";

type SponsorType = "All" | "Big Pharma" | "Biotech" | "Academic";

const TYPE_COLORS: Record<string, string> = {
  "Big Pharma": "#06b6d4",
  "Biotech": "#a855f7",
  "Academic": "#22c55e",
};

const MODALITY_COLORS: Record<string, string> = {
  "mAbs": "#06b6d4",
  "ADCs": "#f43f5e",
  "Bispecifics": "#f97316",
  "Small Molecules": "#6366f1",
  "CAR-T": "#a855f7",
  "Gene Therapy": "#22c55e",
  "mRNA": "#14b8a6",
  "mRNA Vaccines": "#14b8a6",
  "mRNA Therapeutics": "#14b8a6",
  "siRNA": "#eab308",
  "ASOs": "#78716c",
  "Peptides": "#ec4899",
  "Peptides (GLP-1)": "#ec4899",
  "CRISPR Gene Editing": "#22c55e",
  "Gene Therapy (Lentiviral)": "#22c55e",
  "All modalities": "#8892a8",
};

function getModalityColor(m: string): string {
  return MODALITY_COLORS[m] || "#8892a8";
}

export default function Sponsors() {
  const [filter, setFilter] = useState<SponsorType>("All");
  const [sortBy, setSortBy] = useState<"pipeline" | "name">("pipeline");

  const filtered = sponsorData
    .filter(s => filter === "All" || s.type === filter)
    .sort((a, b) =>
      sortBy === "pipeline" ? b.pipelineSize - a.pipelineSize : a.name.localeCompare(b.name)
    );

  const counts = {
    All: sponsorData.length,
    "Big Pharma": sponsorData.filter(s => s.type === "Big Pharma").length,
    Biotech: sponsorData.filter(s => s.type === "Biotech").length,
    Academic: sponsorData.filter(s => s.type === "Academic").length,
  };

  return (
    <div className="p-6 min-h-full">
      <div className="mb-4">
        <h1 className="text-lg font-semibold text-foreground tracking-tight">Pipeline Sponsors</h1>
        <p className="text-xs text-muted-foreground mt-0.5">
          Major companies and institutions driving drug development
        </p>
      </div>

      {/* Filters + Sort */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex gap-2">
          {(["All", "Big Pharma", "Biotech", "Academic"] as SponsorType[]).map(type => (
            <button
              key={type}
              data-testid={`filter-${type.toLowerCase().replace(" ", "-")}`}
              onClick={() => setFilter(type)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                filter === type
                  ? "bg-primary/10 border-primary/30 text-primary"
                  : "border-border text-muted-foreground hover:text-foreground hover:border-border"
              }`}
            >
              {type}
              <span className="ml-1.5 font-mono text-[10px] opacity-70">{counts[type]}</span>
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-muted-foreground">Sort by:</span>
          <button
            onClick={() => setSortBy("pipeline")}
            className={`text-xs px-2 py-1 rounded border transition-all ${sortBy === "pipeline" ? "border-primary/40 text-primary" : "border-border text-muted-foreground"}`}
          >
            Pipeline Size
          </button>
          <button
            onClick={() => setSortBy("name")}
            className={`text-xs px-2 py-1 rounded border transition-all ${sortBy === "name" ? "border-primary/40 text-primary" : "border-border text-muted-foreground"}`}
          >
            A–Z
          </button>
        </div>
      </div>

      {/* Sponsor grid */}
      <div className="grid grid-cols-3 gap-3">
        {filtered.map((sponsor, i) => {
          const typeColor = TYPE_COLORS[sponsor.type] || "#8892a8";
          return (
            <motion.div
              key={sponsor.name}
              data-testid={`sponsor-card-${sponsor.name.toLowerCase().replace(/\s/g, "-")}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
              className="bg-card border border-card-border rounded-xl p-4 hover:border-primary/20 transition-colors relative overflow-hidden"
            >
              {/* Background glow */}
              <div
                className="absolute inset-0 opacity-3"
                style={{ background: `radial-gradient(circle at top left, ${typeColor}20, transparent 60%)` }}
              />

              <div className="relative">
                {/* Header row */}
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="text-sm font-semibold text-foreground">{sponsor.name}</div>
                    <div className="text-[10px] text-muted-foreground mt-0.5">{sponsor.focus}</div>
                  </div>
                  <span
                    className="text-[9px] font-semibold px-2 py-0.5 rounded-full flex-shrink-0"
                    style={{ color: typeColor, background: `${typeColor}15`, border: `1px solid ${typeColor}30` }}
                  >
                    {sponsor.type}
                  </span>
                </div>

                {/* Pipeline size */}
                <div className="flex items-center gap-2 mb-3">
                  <div className="flex-1 h-1.5 bg-background rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${Math.min((sponsor.pipelineSize / 2500) * 100, 100)}%`,
                        background: typeColor,
                        opacity: 0.7,
                      }}
                    />
                  </div>
                  <span className="font-mono text-xs text-foreground font-bold w-12 text-right">
                    {sponsor.pipelineSize.toLocaleString()}
                  </span>
                </div>

                {/* Modalities */}
                <div className="flex flex-wrap gap-1">
                  {sponsor.topModalities.map(m => (
                    <span
                      key={m}
                      className="text-[9px] px-1.5 py-0.5 rounded-full border"
                      style={{
                        color: getModalityColor(m),
                        borderColor: `${getModalityColor(m)}40`,
                        background: `${getModalityColor(m)}10`,
                      }}
                    >
                      {m}
                    </span>
                  ))}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
