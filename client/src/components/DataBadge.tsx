import { useState } from "react";
import { DataConfidence } from "@/data/pipelineData";

interface DataBadgeProps {
  confidence: DataConfidence;
  source: string;
  note: string;
  className?: string;
}

const BADGE_CONFIG: Record<DataConfidence, {
  symbol: string;
  label: string;
  color: string;
  bg: string;
  border: string;
}> = {
  verified: {
    symbol: "✓",
    label: "verified",
    color: "#22c55e",
    bg: "#22c55e12",
    border: "#22c55e30",
  },
  composite: {
    symbol: "~",
    label: "composite",
    color: "#06b6d4",
    bg: "#06b6d412",
    border: "#06b6d430",
  },
  estimated: {
    symbol: "*",
    label: "estimated",
    color: "#f59e0b",
    bg: "#f59e0b12",
    border: "#f59e0b30",
  },
};

export function DataBadge({ confidence, source, note, className = "" }: DataBadgeProps) {
  const [showTooltip, setShowTooltip] = useState(false);
  const cfg = BADGE_CONFIG[confidence];

  return (
    <span className={`relative inline-flex items-center ${className}`}>
      <button
        data-testid={`data-badge-${confidence}`}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        onClick={(e) => { e.stopPropagation(); setShowTooltip(!showTooltip); }}
        className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[9px] font-mono font-semibold transition-opacity hover:opacity-80 cursor-help"
        style={{
          color: cfg.color,
          background: cfg.bg,
          border: `1px solid ${cfg.border}`,
        }}
      >
        <span>{cfg.symbol}</span>
        <span>{cfg.label}</span>
      </button>

      {showTooltip && (
        <div
          className="absolute bottom-full left-0 mb-1.5 z-50 w-64 rounded-lg border shadow-xl text-[10px] leading-relaxed"
          style={{
            background: "#141720",
            borderColor: "#1e2230",
          }}
        >
          {/* Arrow */}
          <div
            className="absolute top-full left-3 w-0 h-0"
            style={{
              borderLeft: "5px solid transparent",
              borderRight: "5px solid transparent",
              borderTop: `5px solid #1e2230`,
            }}
          />
          <div className="p-3 space-y-1.5">
            <div className="flex items-center gap-1.5">
              <span
                className="inline-flex items-center justify-center w-4 h-4 rounded text-[10px] font-bold"
                style={{ color: cfg.color, background: cfg.bg, border: `1px solid ${cfg.border}` }}
              >
                {cfg.symbol}
              </span>
              <span className="font-semibold capitalize" style={{ color: cfg.color }}>
                {confidence} data
              </span>
            </div>
            <div>
              <span className="font-semibold text-foreground/60">Source: </span>
              <span className="text-foreground/80">{source}</span>
            </div>
            <div>
              <span className="font-semibold text-foreground/60">Note: </span>
              <span className="text-foreground/70">{note}</span>
            </div>
            <div className="pt-1 border-t" style={{ borderColor: "#1e2230" }}>
              <div className="flex gap-3 text-[9px]">
                <span style={{ color: "#22c55e" }}>✓ verified = primary API</span>
                <span style={{ color: "#06b6d4" }}>~ composite = multi-source</span>
                <span style={{ color: "#f59e0b" }}>* estimated = industry reports</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </span>
  );
}
