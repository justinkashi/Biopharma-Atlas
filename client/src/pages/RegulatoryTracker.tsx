import { useState, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  catalystCalendar,
  MODALITY_COLORS,
  type CatalystEvent,
  type CatalystType,
  type Modality,
} from "@/data/investmentData";

// ─── Constants ───────────────────────────────────────────────────────────────

const EVENT_COLORS: Record<CatalystType, string> = {
  PDUFA: "#06b6d4",
  AdCom: "#f59e0b",
  "Phase 3 Readout": "#22c55e",
};

const EVENT_BORDER: Record<CatalystType, string> = {
  PDUFA: "#06b6d4",
  AdCom: "#f59e0b",
  "Phase 3 Readout": "#22c55e",
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

function parseSortDate(s: string): Date {
  return new Date(s);
}

function formatDisplayDate(d: CatalystEvent): string {
  return d.date;
}

function getMonthIndex(date: Date): number {
  // Returns month index relative to Jan 2026 (0 = Jan, 11 = Dec)
  return (date.getFullYear() - 2026) * 12 + date.getMonth();
}

// ─── Badges ──────────────────────────────────────────────────────────────────

function ModalityBadge({ modality }: { modality: Modality }) {
  const color = MODALITY_COLORS[modality] ?? "#64748b";
  return (
    <span
      className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-mono font-semibold whitespace-nowrap"
      style={{
        color,
        background: `${color}18`,
        border: `1px solid ${color}30`,
      }}
    >
      {modality}
    </span>
  );
}

function EventTypeBadge({ type }: { type: CatalystType }) {
  const color = EVENT_COLORS[type];
  return (
    <span
      className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-mono font-bold whitespace-nowrap"
      style={{
        color,
        background: `${color}18`,
        border: `1px solid ${color}35`,
      }}
    >
      {type}
    </span>
  );
}

function DesignationBadge({ text }: { text: string }) {
  return (
    <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-mono text-slate-400 bg-white/4 border border-white/10 whitespace-nowrap">
      {text}
    </span>
  );
}

// ─── Gantt Chart SVG ─────────────────────────────────────────────────────────

interface GanttTooltipState {
  event: CatalystEvent;
  x: number;
  y: number;
}

// Only show 2026 April–December data in Gantt
// Month columns: Apr(3) through Dec(11) = 9 months
const GANTT_MONTHS = [
  { label: "Apr", index: 3 },
  { label: "May", index: 4 },
  { label: "Jun", index: 5 },
  { label: "Jul", index: 6 },
  { label: "Aug", index: 7 },
  { label: "Sep", index: 8 },
  { label: "Oct", index: 9 },
  { label: "Nov", index: 10 },
  { label: "Dec", index: 11 },
];

const GANTT_START_MONTH = 3; // April (0-indexed)
const GANTT_END_MONTH = 11;  // December

function GanttChart({
  events,
}: {
  events: CatalystEvent[];
}) {
  const [tooltip, setTooltip] = useState<GanttTooltipState | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  // Only 2026 events in Apr-Dec
  const ganttEvents = useMemo(() => {
    return events.filter((e) => {
      const d = new Date(e.sortDate);
      if (d.getFullYear() !== 2026) return false;
      const mo = d.getMonth();
      return mo >= GANTT_START_MONTH && mo <= GANTT_END_MONTH;
    });
  }, [events]);

  // Group by quarter, then sort by date within quarter
  const grouped = useMemo(() => {
    const q2 = ganttEvents.filter((e) => {
      const m = new Date(e.sortDate).getMonth();
      return m >= 3 && m <= 5;
    });
    const q3 = ganttEvents.filter((e) => {
      const m = new Date(e.sortDate).getMonth();
      return m >= 6 && m <= 8;
    });
    const q4 = ganttEvents.filter((e) => {
      const m = new Date(e.sortDate).getMonth();
      return m >= 9 && m <= 11;
    });
    return [
      ...q2.sort((a, b) => a.sortDate.localeCompare(b.sortDate)),
      ...q3.sort((a, b) => a.sortDate.localeCompare(b.sortDate)),
      ...q4.sort((a, b) => a.sortDate.localeCompare(b.sortDate)),
    ];
  }, [ganttEvents]);

  const ROW_H = 28;
  const LABEL_W = 180;
  const PAD_TOP = 36;
  const PAD_BOT = 12;
  const SVG_W = 820;
  const PLOT_W = SVG_W - LABEL_W - 16;
  const N_MONTHS = GANTT_END_MONTH - GANTT_START_MONTH + 1; // 9
  const MONTH_W = PLOT_W / N_MONTHS;
  const SVG_H = PAD_TOP + grouped.length * ROW_H + PAD_BOT;

  function xForDate(date: Date): number {
    const mo = date.getMonth() - GANTT_START_MONTH;
    const day = date.getDate();
    const frac = (mo + (day - 1) / 31) / N_MONTHS;
    return LABEL_W + frac * PLOT_W;
  }

  function handleMouseEnter(
    e: React.MouseEvent<SVGRectElement | SVGCircleElement>,
    event: CatalystEvent
  ) {
    const rect = svgRef.current?.getBoundingClientRect();
    if (!rect) return;
    setTooltip({
      event,
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  }

  return (
    <div className="relative overflow-x-auto">
      <svg
        ref={svgRef}
        viewBox={`0 0 ${SVG_W} ${SVG_H}`}
        className="w-full"
        style={{ minWidth: 600, height: SVG_H }}
        onMouseLeave={() => setTooltip(null)}
      >
        {/* Month columns background */}
        {GANTT_MONTHS.map((mo, i) => (
          <g key={mo.label}>
            <rect
              x={LABEL_W + i * MONTH_W}
              y={0}
              width={MONTH_W}
              height={SVG_H}
              fill={i % 2 === 0 ? "rgba(255,255,255,0.012)" : "rgba(0,0,0,0)"}
            />
            {/* Vertical grid */}
            <line
              x1={LABEL_W + i * MONTH_W}
              y1={PAD_TOP - 8}
              x2={LABEL_W + i * MONTH_W}
              y2={SVG_H - PAD_BOT}
              stroke="#1e293b"
              strokeWidth={1}
            />
            {/* Month label */}
            <text
              x={LABEL_W + i * MONTH_W + MONTH_W / 2}
              y={16}
              textAnchor="middle"
              fill="#475569"
              fontSize={10}
              fontFamily="'JetBrains Mono', monospace"
              fontWeight="600"
            >
              {mo.label}
            </text>
            {/* Q label at start of each quarter */}
            {(i === 0 || i === 3 || i === 6) && (
              <text
                x={LABEL_W + i * MONTH_W + 3}
                y={PAD_TOP - 12}
                fill="#334155"
                fontSize={9}
                fontFamily="'JetBrains Mono', monospace"
                fontWeight="700"
              >
                Q{i === 0 ? "2" : i === 3 ? "3" : "4"} 2026
              </text>
            )}
          </g>
        ))}

        {/* "Today" line — April 8, 2026 */}
        {(() => {
          const today = new Date(2026, 3, 8); // Apr 8
          const todayX = xForDate(today);
          return (
            <g>
              <line
                x1={todayX}
                y1={PAD_TOP - 8}
                x2={todayX}
                y2={SVG_H - PAD_BOT}
                stroke="#f43f5e"
                strokeWidth={1.5}
                strokeDasharray="4,3"
                opacity={0.6}
              />
              <text
                x={todayX + 3}
                y={PAD_TOP - 14}
                fill="#f43f5e"
                fontSize={8}
                fontFamily="'JetBrains Mono', monospace"
                opacity={0.7}
              >
                today
              </text>
            </g>
          );
        })()}

        {/* Rows */}
        {grouped.map((event, i) => {
          const y = PAD_TOP + i * ROW_H;
          const date = new Date(event.sortDate);
          const eventX = xForDate(date);
          const color = EVENT_COLORS[event.eventType];
          const isHovered =
            tooltip?.event.ticker === event.ticker &&
            tooltip?.event.drug === event.drug;

          return (
            <g key={`${event.ticker}-${event.drug}-${i}`}>
              {/* Row background on hover */}
              {isHovered && (
                <rect
                  x={0}
                  y={y}
                  width={SVG_W}
                  height={ROW_H}
                  fill="rgba(255,255,255,0.03)"
                />
              )}

              {/* Row separator */}
              <line
                x1={0}
                y1={y + ROW_H}
                x2={SVG_W}
                y2={y + ROW_H}
                stroke="#1e293b"
                strokeWidth={0.5}
              />

              {/* Label: ticker + drug */}
              <text
                x={LABEL_W - 8}
                y={y + ROW_H / 2 + 1}
                textAnchor="end"
                dominantBaseline="middle"
                fill={isHovered ? "#e2e8f0" : "#94a3b8"}
                fontSize={9}
                fontFamily="'JetBrains Mono', monospace"
                fontWeight={isHovered ? "700" : "400"}
              >
                {event.ticker} · {event.drug.length > 18 ? event.drug.slice(0, 17) + "…" : event.drug}
              </text>

              {/* Event bar / dot */}
              {/* Horizontal line from axis to event dot */}
              <line
                x1={LABEL_W}
                y1={y + ROW_H / 2}
                x2={eventX - 6}
                y2={y + ROW_H / 2}
                stroke={`${color}25`}
                strokeWidth={1}
              />

              {/* Event rectangle */}
              <rect
                x={eventX - 6}
                y={y + ROW_H * 0.2}
                width={54}
                height={ROW_H * 0.6}
                rx={4}
                fill={`${color}20`}
                stroke={color}
                strokeWidth={1.5}
                style={{ cursor: "pointer" }}
                onMouseEnter={(e) => handleMouseEnter(e, event)}
              />

              {/* Event type text in rect */}
              <text
                x={eventX - 6 + 27}
                y={y + ROW_H / 2 + 1}
                textAnchor="middle"
                dominantBaseline="middle"
                fill={color}
                fontSize={7.5}
                fontFamily="'JetBrains Mono', monospace"
                fontWeight="700"
                style={{ pointerEvents: "none" }}
              >
                {event.eventType === "Phase 3 Readout"
                  ? "Ph3"
                  : event.eventType}
              </text>

              {/* Date label */}
              <text
                x={eventX + 52}
                y={y + ROW_H / 2 + 1}
                dominantBaseline="middle"
                fill="#475569"
                fontSize={8}
                fontFamily="'JetBrains Mono', monospace"
              >
                {date.toLocaleDateString("en-US", { month: "short", day: "numeric" })}
              </text>
            </g>
          );
        })}
      </svg>

      {/* Tooltip */}
      {tooltip && (
        <div
          className="absolute z-50 pointer-events-none"
          style={{
            left: Math.min(tooltip.x + 14, 820 - 260),
            top: tooltip.y - 10,
          }}
        >
          <div className="bg-[#0a0d14] border border-white/15 rounded-xl p-3.5 shadow-2xl min-w-[240px] max-w-[300px]">
            <div className="flex items-center gap-2 mb-2">
              <EventTypeBadge type={tooltip.event.eventType} />
              <span className="text-[11px] font-mono text-slate-400">
                {tooltip.event.date}
              </span>
            </div>
            <div className="text-sm font-semibold text-white mb-0.5">
              {tooltip.event.drug}
            </div>
            <div className="text-[11px] font-mono text-slate-400 mb-2">
              {tooltip.event.company} ({tooltip.event.ticker})
            </div>
            <div className="text-[11px] font-mono text-slate-300 mb-2 leading-relaxed">
              {tooltip.event.indication}
            </div>
            <div className="flex flex-wrap gap-1">
              <ModalityBadge modality={tooltip.event.modality} />
              {tooltip.event.designations
                ?.split(", ")
                .slice(0, 3)
                .map((d) => <DesignationBadge key={d} text={d} />)}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Event Card ──────────────────────────────────────────────────────────────

function EventCard({ event }: { event: CatalystEvent }) {
  const borderColor = EVENT_BORDER[event.eventType];
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl border border-white/8 bg-white/2 p-4 hover:bg-white/4 transition-colors duration-150 relative overflow-hidden"
    >
      {/* Left accent border */}
      <div
        className="absolute left-0 top-0 bottom-0 w-[3px] rounded-l-xl"
        style={{ background: borderColor }}
      />

      <div className="pl-3">
        {/* Header row */}
        <div className="flex items-start justify-between gap-2 mb-2 flex-wrap">
          <div className="flex items-center gap-2 flex-wrap">
            <EventTypeBadge type={event.eventType} />
            <span className="text-[10px] font-mono text-slate-400">
              {event.date}
            </span>
          </div>
          <ModalityBadge modality={event.modality} />
        </div>

        {/* Drug name */}
        <div className="text-sm font-semibold text-slate-100 mb-0.5 leading-tight">
          {event.drug}
        </div>

        {/* Company */}
        <div className="text-[11px] font-mono text-slate-400 mb-2">
          {event.company}{" "}
          <span className="text-slate-600">({event.ticker})</span>
        </div>

        {/* Indication */}
        <div className="text-[11px] text-slate-400 leading-relaxed mb-2">
          {event.indication}
        </div>

        {/* Designations */}
        {event.designations && (
          <div className="flex flex-wrap gap-1">
            {event.designations.split(", ").map((d) => (
              <DesignationBadge key={d} text={d} />
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}

// ─── Stats Bar ────────────────────────────────────────────────────────────────

function StatsBar({ events }: { events: CatalystEvent[] }) {
  const now = new Date(2026, 3, 8); // April 8, 2026

  const upcoming = useMemo(
    () =>
      events.filter((e) => {
        const d = new Date(e.sortDate);
        return d >= now;
      }),
    [events]
  );

  const pdufa = upcoming.filter((e) => e.eventType === "PDUFA").length;
  const adcom = upcoming.filter((e) => e.eventType === "AdCom").length;
  const ph3 = upcoming.filter((e) => e.eventType === "Phase 3 Readout").length;

  const nextEvent = useMemo(() => {
    const futureEvents = upcoming.filter(
      (e) => new Date(e.sortDate) >= now
    );
    if (!futureEvents.length) return null;
    return futureEvents.reduce((a, b) =>
      new Date(a.sortDate) < new Date(b.sortDate) ? a : b
    );
  }, [upcoming]);

  const daysToNext = nextEvent
    ? Math.ceil(
        (new Date(nextEvent.sortDate).getTime() - now.getTime()) /
          (1000 * 60 * 60 * 24)
      )
    : null;

  const stats = [
    {
      label: "PDUFA Dates",
      value: pdufa,
      color: EVENT_COLORS["PDUFA"],
      icon: (
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <circle cx="7" cy="7" r="6" stroke="currentColor" strokeWidth="1.4" />
          <path d="M7 4v3l2 1" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
        </svg>
      ),
    },
    {
      label: "AdCom Meetings",
      value: adcom,
      color: EVENT_COLORS["AdCom"],
      icon: (
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <rect x="1" y="3" width="12" height="9" rx="2" stroke="currentColor" strokeWidth="1.4" />
          <path d="M4 3V2M10 3V2" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
          <path d="M1 6h12" stroke="currentColor" strokeWidth="1.2" />
        </svg>
      ),
    },
    {
      label: "Phase 3 Readouts",
      value: ph3,
      color: EVENT_COLORS["Phase 3 Readout"],
      icon: (
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <path d="M2 10l3-4 2.5 2 3.5-5 1.5 2.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ),
    },
  ];

  return (
    <div className="rounded-xl border border-white/8 bg-white/2 p-4">
      <div className="flex flex-wrap gap-4 items-center">
        {/* Stat pills */}
        <div className="flex gap-3 flex-wrap">
          {stats.map((s) => (
            <div
              key={s.label}
              className="flex items-center gap-2.5 px-3.5 py-2 rounded-lg border"
              style={{
                background: `${s.color}10`,
                borderColor: `${s.color}30`,
              }}
            >
              <span style={{ color: s.color }}>{s.icon}</span>
              <span
                className="text-xl font-bold font-mono leading-none"
                style={{ color: s.color }}
              >
                {s.value}
              </span>
              <span className="text-[11px] font-mono text-slate-400">
                {s.label}
              </span>
            </div>
          ))}
        </div>

        {/* Divider */}
        <div className="h-8 w-px bg-white/8 hidden md:block" />

        {/* Next event callout */}
        {nextEvent && (
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: EVENT_COLORS[nextEvent.eventType] }} />
            <div>
              <div className="text-[10px] font-mono text-slate-500 uppercase tracking-widest mb-0.5">
                Next Event
              </div>
              <div className="text-[12px] font-semibold text-slate-100">
                {nextEvent.drug}
                <span className="text-slate-500 font-normal ml-1">
                  ({nextEvent.ticker})
                </span>
              </div>
              <div className="flex items-center gap-2 mt-0.5">
                <EventTypeBadge type={nextEvent.eventType} />
                <span className="text-[10px] font-mono text-slate-400">
                  {nextEvent.date}
                </span>
                {daysToNext !== null && daysToNext >= 0 && (
                  <span className="text-[10px] font-mono text-slate-500">
                    ({daysToNext === 0 ? "today" : `${daysToNext}d away`})
                  </span>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Filter buttons ──────────────────────────────────────────────────────────

function FilterPill({
  active,
  onClick,
  color,
  children,
}: {
  active: boolean;
  onClick: () => void;
  color?: string;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`px-2.5 py-1 rounded-md text-[11px] font-mono transition-all duration-150 border`}
      style={
        active
          ? {
              background: color ? `${color}18` : "rgba(6,182,212,0.15)",
              color: color ?? "#67e8f9",
              borderColor: color ? `${color}45` : "rgba(6,182,212,0.4)",
            }
          : {
              background: "rgba(255,255,255,0.04)",
              color: "#64748b",
              borderColor: "rgba(255,255,255,0.08)",
            }
      }
    >
      {children}
    </button>
  );
}

// ─── Main Page ───────────────────────────────────────────────────────────────

type EventTypeFilter = CatalystType | "All";

export default function RegulatoryTracker() {
  const [typeFilter, setTypeFilter] = useState<EventTypeFilter>("All");

  // Build filtered event list
  const filteredEvents = useMemo(() => {
    if (typeFilter === "All") return catalystCalendar;
    return catalystCalendar.filter((e) => e.eventType === typeFilter);
  }, [typeFilter]);

  // Group events by month for the card section
  const byMonth = useMemo(() => {
    const map: Record<string, CatalystEvent[]> = {};
    for (const e of filteredEvents) {
      const key = e.month;
      if (!map[key]) map[key] = [];
      map[key].push(e);
    }
    // Sort within each month
    for (const k of Object.keys(map)) {
      map[k].sort((a, b) => a.sortDate.localeCompare(b.sortDate));
    }
    // Sort keys by sortDate of first event
    const keys = Object.keys(map).sort((a, b) => {
      const da = map[a][0]?.sortDate ?? "";
      const db = map[b][0]?.sortDate ?? "";
      return da.localeCompare(db);
    });
    return keys.map((k) => ({ month: k, events: map[k] }));
  }, [filteredEvents]);

  const TYPE_FILTERS: { label: string; value: EventTypeFilter; color?: string }[] = [
    { label: "All Events", value: "All" },
    { label: "PDUFA", value: "PDUFA", color: EVENT_COLORS["PDUFA"] },
    { label: "AdCom", value: "AdCom", color: EVENT_COLORS["AdCom"] },
    { label: "Phase 3 Readout", value: "Phase 3 Readout", color: EVENT_COLORS["Phase 3 Readout"] },
  ];

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
        <div className="flex items-start justify-between flex-wrap gap-4">
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
                  y="3"
                  width="14"
                  height="13"
                  rx="2"
                  stroke="currentColor"
                  strokeWidth="1.4"
                />
                <path
                  d="M2 7h14"
                  stroke="currentColor"
                  strokeWidth="1.2"
                />
                <path
                  d="M6 2v2M12 2v2"
                  stroke="currentColor"
                  strokeWidth="1.4"
                  strokeLinecap="round"
                />
                <rect x="5" y="10" width="3" height="3" rx="0.5" fill="currentColor" opacity="0.5" />
                <rect x="10" y="10" width="3" height="3" rx="0.5" fill="currentColor" />
              </svg>
              <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">
                Regulatory Calendar
              </span>
            </div>
            <h1 className="text-xl font-bold text-slate-100 tracking-tight">
              Regulatory Tracker
            </h1>
            <p className="text-[12px] text-slate-500 mt-1 font-mono">
              {catalystCalendar.length} events · 2026 · FDA PDUFA, AdCom & Phase 3 readouts
            </p>
          </div>

          {/* Event type legend */}
          <div className="flex gap-4 items-center flex-wrap">
            {(["PDUFA", "AdCom", "Phase 3 Readout"] as CatalystType[]).map(
              (t) => (
                <div key={t} className="flex items-center gap-1.5">
                  <div
                    className="w-2.5 h-2.5 rounded-sm"
                    style={{ background: EVENT_COLORS[t] }}
                  />
                  <span className="text-[10px] font-mono text-slate-500">
                    {t}
                  </span>
                </div>
              )
            )}
          </div>
        </div>
      </motion.div>

      {/* ── Stats Bar ─────────────────────────────────────────────────────────── */}
      <motion.section
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.04 }}
      >
        <StatsBar events={catalystCalendar} />
      </motion.section>

      {/* ── Section 1: Gantt Chart ───────────────────────────────────────────── */}
      <motion.section
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.07 }}
        className="rounded-xl border border-white/8 bg-white/2 p-5"
      >
        <div className="mb-4">
          <h2 className="text-sm font-semibold text-slate-200 tracking-tight">
            Gantt Timeline — Apr–Dec 2026
          </h2>
          <p className="text-[11px] text-slate-500 mt-0.5 font-mono">
            Hover bars for full details · Red dashed line = today
          </p>
        </div>
        <GanttChart events={catalystCalendar} />
      </motion.section>

      {/* ── Filter bar ──────────────────────────────────────────────────────── */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest mr-1">
          Filter:
        </span>
        {TYPE_FILTERS.map((f) => (
          <FilterPill
            key={f.value}
            active={typeFilter === f.value}
            onClick={() => setTypeFilter(f.value)}
            color={f.color}
          >
            {f.label}
          </FilterPill>
        ))}
        <span className="text-[11px] font-mono text-slate-500 ml-2">
          {filteredEvents.length} events shown
        </span>
      </div>

      {/* ── Section 2: Event Cards by Month ──────────────────────────────────── */}
      <motion.section
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="space-y-8"
      >
        {byMonth.length === 0 ? (
          <div className="flex items-center justify-center h-40 text-slate-500 text-sm font-mono rounded-xl border border-white/8">
            No events match this filter
          </div>
        ) : (
          byMonth.map(({ month, events }) => (
            <div key={month}>
              {/* Month header */}
              <div className="flex items-center gap-3 mb-3">
                <div className="text-sm font-semibold text-slate-200 tracking-tight">
                  {month}
                </div>
                <div className="flex-1 h-px bg-white/8" />
                <div className="flex gap-1.5">
                  {(["PDUFA", "AdCom", "Phase 3 Readout"] as CatalystType[]).map(
                    (t) => {
                      const count = events.filter(
                        (e) => e.eventType === t
                      ).length;
                      if (!count) return null;
                      return (
                        <span
                          key={t}
                          className="px-1.5 py-0.5 rounded text-[9px] font-mono font-semibold"
                          style={{
                            color: EVENT_COLORS[t],
                            background: `${EVENT_COLORS[t]}15`,
                            border: `1px solid ${EVENT_COLORS[t]}30`,
                          }}
                        >
                          {count}×{t === "Phase 3 Readout" ? " Ph3" : ` ${t}`}
                        </span>
                      );
                    }
                  )}
                </div>
              </div>

              {/* Cards grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
                {events.map((event, i) => (
                  <motion.div
                    key={`${event.ticker}-${event.drug}-${i}`}
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.04 }}
                  >
                    <EventCard event={event} />
                  </motion.div>
                ))}
              </div>
            </div>
          ))
        )}
      </motion.section>

      {/* Data source note */}
      <div className="pt-4 border-t border-white/6">
        <p className="text-[10px] text-slate-600 font-mono">
          Sources: Dan Sfera Biotech Catalyst Calendar, CheckRare PDUFA tracker, BioPharma Dive 2026 trials, FDA Advisory Committee Calendar · Compiled April 2026
        </p>
      </div>
    </div>
  );
}
