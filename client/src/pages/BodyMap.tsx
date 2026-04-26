import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { organSystemData, dataSourceNotes } from "@/data/pipelineData";
import { DataBadge } from "@/components/DataBadge";
import anatomySvgRaw from "@/assets/human-anatomy.svg?raw";

// Organ region accent colors — keys must match organSystemData keys
const ORGAN_COLORS: Record<string, string> = {
  brain: "#6366f1",
  eye: "#06b6d4",
  lungs: "#22c55e",
  heart: "#f43f5e",
  liver: "#f97316",
  stomach: "#eab308",
  kidney: "#14b8a6",
  bone: "#78716c",
  skin: "#ec4899",
  blood: "#a855f7",
  immune: "#06b6d4",
  pancreas: "#22c55e",
};

// Hit region definitions — coordinates in the 600x1000 viewBox
// Each shape is rendered as a transparent interactive overlay
type HitRegion =
  | { type: "ellipse"; cx: number; cy: number; rx: number; ry: number; label: string; labelX: number; labelY: number }
  | { type: "circle"; cx: number; cy: number; r: number; label: string; labelX: number; labelY: number }
  | { type: "rect"; x: number; y: number; width: number; height: number; label: string; labelX: number; labelY: number };

interface OrganHitGroup {
  id: string;
  label: string;
  regions: HitRegion[];
  labelAnchor: { x: number; y: number };
}

// Coordinates mapped from the 600×1000 viewBox using grid overlay on the actual Wikimedia SVG
// (File:202403_human_anatomy_organs.svg by Mikael Häggström, Public Domain)
const ORGAN_HIT_GROUPS: OrganHitGroup[] = [
  {
    id: "brain",
    label: "Brain",
    labelAnchor: { x: 287, y: 12 },
    regions: [
      { type: "ellipse", cx: 287, cy: 40, rx: 42, ry: 30, label: "Brain", labelX: 287, labelY: 12 },
    ],
  },
  {
    id: "eye",
    label: "Eyes",
    labelAnchor: { x: 287, y: 60 },
    regions: [
      { type: "circle", cx: 272, cy: 68, r: 8, label: "Eyes", labelX: 287, labelY: 60 },
      { type: "circle", cx: 303, cy: 68, r: 8, label: "Eyes", labelX: 287, labelY: 60 },
    ],
  },
  {
    id: "lungs",
    label: "Lungs",
    labelAnchor: { x: 287, y: 200 },
    regions: [
      // Left lung (viewer's right)
      { type: "ellipse", cx: 240, cy: 255, rx: 45, ry: 50, label: "Lungs", labelX: 287, labelY: 200 },
      // Right lung (viewer's left)
      { type: "ellipse", cx: 345, cy: 250, rx: 42, ry: 48, label: "Lungs", labelX: 287, labelY: 200 },
    ],
  },
  {
    id: "heart",
    label: "Heart",
    labelAnchor: { x: 300, y: 230 },
    regions: [
      { type: "ellipse", cx: 295, cy: 270, rx: 28, ry: 28, label: "Heart", labelX: 300, labelY: 230 },
    ],
  },
  {
    id: "liver",
    label: "Liver",
    labelAnchor: { x: 260, y: 300 },
    regions: [
      // Large dark-brown organ spanning most of the upper abdomen
      { type: "ellipse", cx: 270, cy: 335, rx: 55, ry: 28, label: "Liver", labelX: 260, labelY: 300 },
    ],
  },
  {
    id: "stomach",
    label: "GI",
    labelAnchor: { x: 340, y: 320 },
    regions: [
      // Stomach (yellowish, right side of body/left of viewer)
      { type: "ellipse", cx: 335, cy: 345, rx: 30, ry: 25, label: "GI", labelX: 340, labelY: 320 },
      // Intestines (large coiled mass filling lower abdomen)
      { type: "ellipse", cx: 290, cy: 440, rx: 55, ry: 55, label: "GI", labelX: 340, labelY: 320 },
    ],
  },
  {
    id: "pancreas",
    label: "Pancreas",
    labelAnchor: { x: 290, y: 355 },
    regions: [
      // Small greenish strip behind stomach
      { type: "ellipse", cx: 295, cy: 368, rx: 38, ry: 10, label: "Pancreas", labelX: 290, labelY: 355 },
    ],
  },
  {
    id: "kidney",
    label: "Kidneys",
    labelAnchor: { x: 287, y: 370 },
    regions: [
      // Left kidney
      { type: "ellipse", cx: 245, cy: 385, rx: 16, ry: 22, label: "Kidneys", labelX: 287, labelY: 370 },
      // Right kidney
      { type: "ellipse", cx: 335, cy: 385, rx: 16, ry: 22, label: "Kidneys", labelX: 287, labelY: 370 },
    ],
  },
  {
    id: "blood",
    label: "Blood",
    labelAnchor: { x: 287, y: 258 },
    regions: [
      // Centered on heart/aorta area
      { type: "ellipse", cx: 287, cy: 275, rx: 12, ry: 10, label: "Blood", labelX: 287, labelY: 258 },
    ],
  },
  {
    id: "immune",
    label: "Immune",
    labelAnchor: { x: 287, y: 95 },
    regions: [
      // Cervical lymph nodes (neck) — visible at y~100
      { type: "circle", cx: 275, cy: 100, r: 7, label: "Immune", labelX: 287, labelY: 95 },
      { type: "circle", cx: 300, cy: 100, r: 7, label: "Immune", labelX: 287, labelY: 95 },
      // Axillary lymph nodes (armpits) — where arms meet torso
      { type: "circle", cx: 195, cy: 215, r: 9, label: "Immune", labelX: 287, labelY: 95 },
      { type: "circle", cx: 385, cy: 215, r: 9, label: "Immune", labelX: 287, labelY: 95 },
      // Thymus (upper chest, behind sternum)
      { type: "circle", cx: 287, cy: 205, r: 8, label: "Immune", labelX: 287, labelY: 95 },
      // Inguinal lymph nodes (groin crease)
      { type: "circle", cx: 255, cy: 535, r: 8, label: "Immune", labelX: 287, labelY: 95 },
      { type: "circle", cx: 320, cy: 535, r: 8, label: "Immune", labelX: 287, labelY: 95 },
    ],
  },
  {
    id: "bone",
    label: "Bone",
    labelAnchor: { x: 190, y: 300 },
    regions: [
      // Spine — runs from neck to pelvis along center
      { type: "rect", x: 280, y: 130, width: 16, height: 250, label: "Bone", labelX: 190, labelY: 300 },
      // Pelvis region
      { type: "ellipse", cx: 287, cy: 520, rx: 55, ry: 16, label: "Bone", labelX: 190, labelY: 300 },
    ],
  },
  {
    id: "skin",
    label: "Skin",
    labelAnchor: { x: 175, y: 240 },
    regions: [
      // Left shoulder/upper arm (where skin is visible without internal organs)
      { type: "ellipse", cx: 175, cy: 250, rx: 22, ry: 30, label: "Skin", labelX: 175, labelY: 240 },
    ],
  },
  {
    id: "bladder",
    label: "Bladder",
    labelAnchor: { x: 287, y: 500 },
    regions: [
      // Small yellow organ below intestines
      { type: "ellipse", cx: 287, cy: 515, rx: 18, ry: 14, label: "Bladder", labelX: 287, labelY: 500 },
    ],
  },
];

// ───────────────────────────────────────────────────────────────────────────────
// WikimediaBodySVG — renders the real anatomical SVG with overlay hit regions
// ───────────────────────────────────────────────────────────────────────────────
function WikimediaBodySVG({
  hoveredOrgan,
  selectedOrgan,
  onHover,
  onSelect,
}: {
  hoveredOrgan: string | null;
  selectedOrgan: string | null;
  onHover: (id: string | null) => void;
  onSelect: (id: string) => void;
}) {
  const activeOrganId = hoveredOrgan || selectedOrgan;

  return (
    <div className="relative w-full" style={{ maxWidth: 340 }}>
      {/* ─── Anatomical illustration ─── */}
      <div
        className="w-full [&>svg]:w-full [&>svg]:h-auto [&>svg]:block"
        style={{
          filter: "brightness(0.68) saturate(0.75)",
          opacity: 0.88,
          pointerEvents: "none",
          userSelect: "none",
        }}
        dangerouslySetInnerHTML={{ __html: anatomySvgRaw }}
      />

      {/* ─── Interactive SVG overlay ─── */}
      <svg
        viewBox="0 0 600 1000"
        className="absolute inset-0 w-full h-full"
        style={{ overflow: "visible" }}
        xmlns="http://www.w3.org/2000/svg"
        role="img"
        aria-label="Interactive anatomical body map — use Tab to navigate organ regions"
      >
        <defs>
          {Object.entries(ORGAN_COLORS).map(([id, color]) => (
            <filter key={id} id={`hit-glow-${id}`} x="-80%" y="-80%" width="260%" height="260%">
              <feGaussianBlur stdDeviation="6" result="blur" in="SourceGraphic" />
              <feFlood floodColor={color} floodOpacity="0.6" result="color" />
              <feComposite in="color" in2="blur" operator="in" result="shadow" />
              <feMerge>
                <feMergeNode in="shadow" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          ))}
        </defs>

        {ORGAN_HIT_GROUPS.map((group) => {
          // Skip "bladder" — no organSystemData key for it, just skip it
          if (group.id === "bladder") return null;

          const isHovered = hoveredOrgan === group.id;
          const isSelected = selectedOrgan === group.id;
          const isActive = isHovered || isSelected;
          const color = ORGAN_COLORS[group.id] ?? "#8892a8";

          return (
            <g
              key={group.id}
              data-testid={`organ-${group.id}`}
              role="button"
              tabIndex={0}
              aria-label={`${group.label} — click to view clinical trial data`}
              aria-pressed={isSelected}
              style={{ cursor: "pointer", outline: "none" }}
              onClick={() => onSelect(group.id)}
              onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onSelect(group.id); } }}
              onMouseEnter={() => onHover(group.id)}
              onMouseLeave={() => onHover(null)}
              onFocus={() => onHover(group.id)}
              onBlur={() => onHover(null)}
            >
              {group.regions.map((region, i) => {
                const sharedProps = {
                  fill: color,
                  fillOpacity: isActive ? 0.32 : 0,
                  stroke: color,
                  strokeWidth: isActive ? 1.8 : 0.8,
                  strokeOpacity: isActive ? 0.9 : 0.3,
                  style: {
                    filter: isActive ? `url(#hit-glow-${group.id})` : "none",
                    transition: "all 0.25s ease",
                  },
                };

                if (region.type === "ellipse") {
                  return (
                    <ellipse
                      key={i}
                      cx={region.cx}
                      cy={region.cy}
                      rx={region.rx}
                      ry={region.ry}
                      {...sharedProps}
                    />
                  );
                } else if (region.type === "circle") {
                  return (
                    <circle
                      key={i}
                      cx={region.cx}
                      cy={region.cy}
                      r={region.r}
                      {...sharedProps}
                    />
                  );
                } else {
                  return (
                    <rect
                      key={i}
                      x={region.x}
                      y={region.y}
                      width={region.width}
                      height={region.height}
                      rx="6"
                      {...sharedProps}
                    />
                  );
                }
              })}

              {/* Floating label — shown on hover/select */}
              {isActive && (
                <g>
                  {/* Label pill background */}
                  <rect
                    x={group.labelAnchor.x - 30}
                    y={group.labelAnchor.y - 11}
                    width={60}
                    height={14}
                    rx={4}
                    fill="#0f1117"
                    fillOpacity={0.85}
                    stroke={color}
                    strokeWidth={0.8}
                    strokeOpacity={0.7}
                  />
                  <text
                    x={group.labelAnchor.x}
                    y={group.labelAnchor.y - 1}
                    textAnchor="middle"
                    fill={color}
                    fontSize="9"
                    fontFamily="JetBrains Mono, monospace"
                    fontWeight="600"
                    style={{ pointerEvents: "none" }}
                  >
                    {group.label}
                  </text>
                </g>
              )}
            </g>
          );
        })}

        {/* Trial count badge — top left */}
        {activeOrganId && organSystemData[activeOrganId] && (
          <g>
            <rect x="6" y="6" width="112" height="40" rx="6"
              fill="#0f1117" fillOpacity="0.92" stroke="#1e2230" strokeWidth="1" />
            <text x="58" y="21" textAnchor="middle" fill="#8892a8" fontSize="8.5" fontFamily="JetBrains Mono, monospace">
              {organSystemData[activeOrganId].name}
            </text>
            <text x="58" y="38" textAnchor="middle"
              fill={ORGAN_COLORS[activeOrganId] ?? "#06b6d4"} fontSize="11"
              fontFamily="JetBrains Mono, monospace" fontWeight="bold">
              {organSystemData[activeOrganId].trials.toLocaleString()} trials
            </text>
          </g>
        )}
      </svg>
    </div>
  );
}

// ───────────────────────────────────────────────────────────────────────────────
// Main page
// ───────────────────────────────────────────────────────────────────────────────
export default function BodyMap() {
  const [hoveredOrgan, setHoveredOrgan] = useState<string | null>(null);
  const [selectedOrgan, setSelectedOrgan] = useState<string | null>("immune");
  const [showTooltip, setShowTooltip] = useState(false);

  const detail = selectedOrgan ? organSystemData[selectedOrgan] : null;
  const accentColor = selectedOrgan ? (ORGAN_COLORS[selectedOrgan] ?? "#06b6d4") : "#06b6d4";

  const organList = [
    { id: "brain", label: "Brain" },
    { id: "eye", label: "Eyes" },
    { id: "lungs", label: "Lungs" },
    { id: "heart", label: "Heart" },
    { id: "liver", label: "Liver" },
    { id: "stomach", label: "GI" },
    { id: "pancreas", label: "Pancreas" },
    { id: "kidney", label: "Kidneys" },
    { id: "immune", label: "Immune" },
    { id: "blood", label: "Blood" },
    { id: "bone", label: "Bone" },
    { id: "skin", label: "Skin" },
  ];

  const trialsNote = dataSourceNotes["organSystemData.trials"];
  const detailsNote = dataSourceNotes["organSystemData.details"];

  return (
    <div className="p-6 min-h-full">
      {/* Page header */}
      <div className="mb-4 flex items-start justify-between">
        <div>
          <h1 className="text-lg font-semibold text-foreground tracking-tight">Anatomical Body Map</h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Click organ regions to explore clinical trial data by body system
          </p>
        </div>
        <div className="flex items-center gap-2">
          {trialsNote && (
            <DataBadge
              confidence={trialsNote.confidence}
              source={trialsNote.source}
              note={trialsNote.note}
            />
          )}
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 lg:h-[calc(100vh-140px)]">
        {/* ── Left panel: SVG body ── */}
        <div className="w-full lg:w-[360px] flex-shrink-0 bg-card border border-card-border rounded-xl p-4 flex flex-col items-center">
          <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest mb-3 self-start">
            Select an organ system
          </div>

          {/* SVG container — fills available height proportionally */}
          <div className="flex-1 flex items-center justify-center w-full overflow-hidden">
            <WikimediaBodySVG
              hoveredOrgan={hoveredOrgan}
              selectedOrgan={selectedOrgan}
              onHover={setHoveredOrgan}
              onSelect={setSelectedOrgan}
            />
          </div>

          {/* Quick organ selector buttons */}
          <div className="w-full mt-3">
            <div className="flex flex-wrap gap-1">
              {organList.map((o) => (
                <button
                  key={o.id}
                  data-testid={`organ-btn-${o.id}`}
                  onClick={() => setSelectedOrgan(o.id)}
                  className="text-[9px] px-1.5 py-0.5 rounded border transition-all"
                  style={{
                    color: selectedOrgan === o.id ? ORGAN_COLORS[o.id] : "#8892a8",
                    borderColor: selectedOrgan === o.id ? `${ORGAN_COLORS[o.id]}60` : "#2a2d3a",
                    background: selectedOrgan === o.id ? `${ORGAN_COLORS[o.id]}15` : "transparent",
                  }}
                >
                  {o.label}
                </button>
              ))}
            </div>
          </div>

          {/* Attribution */}
          <p className="text-[8px] text-muted-foreground/50 mt-2 text-center leading-snug">
            Anatomy: Mikael Häggström / Wikimedia Commons (Public Domain)
          </p>
        </div>

        {/* ── Right panel: Detail info ── */}
        <div className="flex-1 bg-card border border-card-border rounded-xl overflow-y-auto">
          <AnimatePresence mode="wait">
            {detail ? (
              <motion.div
                key={selectedOrgan}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="p-6 h-full"
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-4 pb-4 border-b border-border">
                  <div>
                    <h2 className="text-base font-semibold" style={{ color: accentColor }}>
                      {detail.name}
                    </h2>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="font-mono text-xl font-bold text-foreground">
                        {detail.trials.toLocaleString()}
                      </span>
                      <span className="text-xs text-muted-foreground">clinical trials</span>
                      <span
                        className="text-xs px-2 py-0.5 rounded-full font-mono font-semibold"
                        style={{ color: "#22c55e", background: "#22c55e15", border: "1px solid #22c55e30" }}
                      >
                        {detail.pipelineGrowth}
                      </span>
                    </div>
                  </div>
                  {detailsNote && (
                    <DataBadge
                      confidence={detailsNote.confidence}
                      source={detailsNote.source}
                      note={detailsNote.note}
                    />
                  )}
                </div>

                {/* Description */}
                <p className="text-sm text-foreground/80 leading-relaxed mb-4">{detail.description}</p>

                {/* Learn More expandable */}
                <div
                  className="mb-4 rounded-lg border overflow-hidden"
                  style={{ borderColor: `${accentColor}30`, background: `${accentColor}08` }}
                >
                  <button
                    onClick={() => setShowTooltip(!showTooltip)}
                    className="w-full flex items-center justify-between px-3 py-2 text-[10px] font-semibold transition-colors hover:opacity-80"
                    style={{ color: accentColor }}
                  >
                    <span>Learn More — Biology &amp; Drug Delivery</span>
                    <span className="text-base leading-none">{showTooltip ? "−" : "+"}</span>
                  </button>
                  {showTooltip && (
                    <div className="px-3 pb-3 border-t" style={{ borderColor: `${accentColor}20` }}>
                      <p className="text-xs text-foreground/75 leading-relaxed mt-2">{detail.tooltip}</p>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* Top modalities */}
                  <div>
                    <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest mb-2">
                      Top Modalities
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {detail.topModalities.map((m) => (
                        <span
                          key={m}
                          className="text-[10px] px-2 py-0.5 rounded-full border"
                          style={{ color: accentColor, borderColor: `${accentColor}40`, background: `${accentColor}10` }}
                        >
                          {m}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Delivery routes */}
                  <div>
                    <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest mb-2">
                      Delivery Routes
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {detail.deliveryRoutes.map((r) => (
                        <span
                          key={r}
                          className="text-[10px] px-2 py-0.5 rounded-full border border-border text-muted-foreground"
                        >
                          {r}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Drug targets */}
                  <div>
                    <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest mb-2">
                      Key Drug Targets
                    </div>
                    <div className="space-y-1">
                      {detail.topTargets.map((t) => (
                        <div key={t} className="flex items-center gap-2">
                          <div
                            className="w-1 h-1 rounded-full flex-shrink-0"
                            style={{ background: accentColor }}
                          />
                          <span className="text-xs text-foreground/80 font-mono">{t}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Approved drugs */}
                  <div>
                    <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest mb-2">
                      Key Approved Drugs
                    </div>
                    <div className="space-y-1">
                      {detail.keyDrugs.map((d) => (
                        <div key={d} className="text-xs text-foreground/80 leading-relaxed">
                          • {d}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
                Click an organ on the body diagram to explore data
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
