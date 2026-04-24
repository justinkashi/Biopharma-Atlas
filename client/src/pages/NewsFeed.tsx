import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  catalystMoves,
  mnaDeals,
  catalystCalendar,
  MODALITY_COLORS,
  type Modality,
} from "@/data/investmentData";

// ── Types ────────────────────────────────────────────────────────────────────

type EventCategory = "Stock Move" | "FDA Approval" | "Clinical Trial" | "M&A" | "Upcoming";

interface FeedEvent {
  id: string;
  date: string;             // display string
  sortDate: string;         // YYYY-MM-DD for sorting
  category: EventCategory;
  headline: string;
  description: string;
  company: string;
  ticker: string;
  modality: Modality | string;
  sentiment: "positive" | "negative" | "neutral";
  stockMove?: number;       // percentage
  tags?: string[];
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function parseSortDate(dateStr: string): string {
  // Already ISO-ish
  if (/^\d{4}-\d{2}-\d{2}/.test(dateStr)) return dateStr.slice(0, 10);
  // "Jul 23, 2025" → 2025-07-23
  const d = new Date(dateStr);
  if (!isNaN(d.getTime())) return d.toISOString().slice(0, 10);
  // "Full-year 2025" → sort to mid-year
  const m = dateStr.match(/(\d{4})/);
  if (m) return `${m[1]}-07-01`;
  return "2025-07-01";
}

// Year → approximate date string for display
function yearToDisplayDate(year: number): string {
  return `${year}`;
}

// ── Sentiment → left-bar colour ─────────────────────────────────────────────

const SENTIMENT_COLORS = {
  positive: "#22c55e",
  negative: "#ef4444",
  neutral:  "#06b6d4",
};

const CATEGORY_COLORS: Record<EventCategory, string> = {
  "Stock Move":    "#f59e0b",
  "FDA Approval":  "#06b6d4",
  "Clinical Trial":"#a855f7",
  "M&A":           "#ec4899",
  "Upcoming":      "#64748b",
};

// ── Badge components ─────────────────────────────────────────────────────────

function Badge({ label, color }: { label: string; color: string }) {
  return (
    <span
      className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-mono font-semibold whitespace-nowrap"
      style={{ color, background: `${color}18`, border: `1px solid ${color}35` }}
    >
      {label}
    </span>
  );
}

function TickerBadge({ ticker }: { ticker: string }) {
  return (
    <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-white/5 text-slate-200 border border-white/10">
      {ticker}
    </span>
  );
}

// ── Move badge ───────────────────────────────────────────────────────────────

function MoveBadge({ pct }: { pct: number }) {
  const positive = pct >= 0;
  return (
    <span
      className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded font-mono font-bold text-sm"
      style={{
        color: positive ? "#22c55e" : "#ef4444",
        background: positive ? "rgba(34,197,94,0.1)" : "rgba(239,68,68,0.1)",
        border: `1px solid ${positive ? "rgba(34,197,94,0.25)" : "rgba(239,68,68,0.25)"}`,
      }}
    >
      {positive ? "▲" : "▼"} {Math.abs(pct).toFixed(0)}%
    </span>
  );
}

// ── Filter pill ──────────────────────────────────────────────────────────────

function FilterPill({
  label,
  active,
  color,
  onClick,
}: {
  label: string;
  active: boolean;
  color?: string;
  onClick: () => void;
}) {
  const accent = color ?? "#06b6d4";
  return (
    <button
      onClick={onClick}
      className="px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-150"
      style={
        active
          ? { background: `${accent}20`, color: accent, border: `1px solid ${accent}50` }
          : { background: "rgba(255,255,255,0.04)", color: "#6b7280", border: "1px solid rgba(255,255,255,0.08)" }
      }
    >
      {label}
    </button>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

const TODAY = "2026-04-08";

export default function NewsFeed() {
  const [categoryFilter, setCategoryFilter] = useState<EventCategory | "All">("All");
  const [modalityFilter, setModalityFilter] = useState<string>("All");
  const [search, setSearch] = useState("");

  // ── Build unified event feed ──────────────────────────────────────────────
  const allEvents = useMemo<FeedEvent[]>(() => {
    const events: FeedEvent[] = [];

    // 1. Catalyst moves → Stock Move events
    for (const move of catalystMoves) {
      const sd = parseSortDate(move.date);
      const sign = move.movePct >= 0 ? "+" : "";
      events.push({
        id: `move-${move.id}`,
        date: move.date,
        sortDate: sd,
        category: "Stock Move",
        headline: `${move.company} ${sign}${move.movePct}% — ${move.catalyst}`,
        description: `${move.company} (${move.ticker}) moved ${sign}${move.movePct}% on ${move.catalyst}. ${move.drug} targeting ${move.indication}.`,
        company: move.company,
        ticker: move.ticker,
        modality: move.modality,
        sentiment: move.direction === "positive" ? "positive" : "negative",
        stockMove: move.movePct,
      });
    }

    // 2. M&A deals → M&A events
    for (let i = 0; i < mnaDeals.length; i++) {
      const deal = mnaDeals[i];
      const year = deal.year;
      // Approximate month from closeNote
      let monthGuess = "07";
      const noteL = deal.closeNote.toLowerCase();
      const monthMap: Record<string, string> = {
        jan: "01", feb: "02", mar: "03", apr: "04", may: "05", jun: "06",
        jul: "07", aug: "08", sep: "09", oct: "10", nov: "11", dec: "12",
      };
      for (const [k, v] of Object.entries(monthMap)) {
        if (noteL.includes(k)) { monthGuess = v; break; }
      }
      const sd = `${year}-${monthGuess}-15`;
      const premium = deal.premiumPct != null ? ` at ${deal.premiumPct}% premium` : "";
      events.push({
        id: `mna-${i}`,
        date: yearToDisplayDate(year),
        sortDate: sd,
        category: "M&A",
        headline: `${deal.acquirer} acquires ${deal.target} for $${deal.valueB}B`,
        description: `${deal.acquirer} acquired ${deal.target} for $${deal.valueB}B${premium}. Key asset: ${deal.keyAsset}. ${deal.closeNote}.`,
        company: deal.acquirer,
        ticker: "",
        modality: deal.modality,
        sentiment: "neutral",
      });
    }

    // 3. Catalyst calendar — past events (before today) → FDA Approval or Clinical Trial
    for (const evt of catalystCalendar) {
      if (evt.sortDate <= TODAY) {
        const isFDA = evt.eventType === "PDUFA";
        const isAdCom = evt.eventType === "AdCom";
        const cat: EventCategory = isFDA ? "FDA Approval" : "Clinical Trial";
        const headline = isFDA
          ? `FDA Decision — ${evt.drug} (${evt.company})`
          : isAdCom
          ? `AdCom: ${evt.drug} — ${evt.indication}`
          : `Phase 3 Readout — ${evt.drug} (${evt.company})`;
        const desc = isFDA
          ? `PDUFA date for ${evt.drug} by ${evt.company} (${evt.ticker}) for ${evt.indication}. ${evt.designations ? `Designations: ${evt.designations}.` : ""}`
          : isAdCom
          ? `FDA Advisory Committee meeting for ${evt.drug} by ${evt.company} (${evt.ticker}) for ${evt.indication}.`
          : `Phase 3 data readout for ${evt.drug} by ${evt.company} (${evt.ticker}) in ${evt.indication}.`;
        events.push({
          id: `cal-past-${evt.sortDate}-${evt.ticker}`,
          date: evt.date,
          sortDate: evt.sortDate,
          category: cat,
          headline,
          description: desc,
          company: evt.company,
          ticker: evt.ticker,
          modality: evt.modality,
          sentiment: "neutral",
        });
      }
    }

    // 4. Upcoming catalyst calendar events → Upcoming
    for (const evt of catalystCalendar) {
      if (evt.sortDate > TODAY) {
        const isFDA = evt.eventType === "PDUFA";
        const isAdCom = evt.eventType === "AdCom";
        const headline = isFDA
          ? `Upcoming PDUFA — ${evt.drug} (${evt.company})`
          : isAdCom
          ? `Upcoming AdCom — ${evt.drug}`
          : `Upcoming Phase 3 Readout — ${evt.drug}`;
        const desc = isFDA
          ? `FDA action date for ${evt.drug} by ${evt.company} (${evt.ticker}) in ${evt.indication}. ${evt.designations ? `Designations: ${evt.designations}.` : ""}`
          : isAdCom
          ? `FDA Advisory Committee meeting for ${evt.drug} by ${evt.company} (${evt.ticker}) in ${evt.indication}.`
          : `Phase 3 data expected for ${evt.drug} by ${evt.company} (${evt.ticker}) in ${evt.indication}.`;
        events.push({
          id: `cal-up-${evt.sortDate}-${evt.ticker}`,
          date: evt.date,
          sortDate: evt.sortDate,
          category: "Upcoming",
          headline,
          description: desc,
          company: evt.company,
          ticker: evt.ticker,
          modality: evt.modality,
          sentiment: "neutral",
        });
      }
    }

    // Sort descending by sortDate (most recent first), upcoming last
    events.sort((a, b) => {
      const aUp = a.category === "Upcoming";
      const bUp = b.category === "Upcoming";
      if (aUp && !bUp) return 1;
      if (!aUp && bUp) return -1;
      // Both upcoming → ascending
      if (aUp && bUp) return a.sortDate.localeCompare(b.sortDate);
      // Past → descending
      return b.sortDate.localeCompare(a.sortDate);
    });

    return events;
  }, []);

  // Unique modalities
  const allModalities = useMemo(() => {
    const s = new Set<string>();
    for (const e of allEvents) if (e.modality) s.add(e.modality as string);
    return Array.from(s).sort();
  }, [allEvents]);

  // Filtered events
  const filtered = useMemo(() => {
    return allEvents.filter((e) => {
      if (categoryFilter !== "All" && e.category !== categoryFilter) return false;
      if (modalityFilter !== "All" && e.modality !== modalityFilter) return false;
      if (search.trim()) {
        const q = search.toLowerCase();
        if (
          !e.headline.toLowerCase().includes(q) &&
          !e.company.toLowerCase().includes(q) &&
          !e.ticker.toLowerCase().includes(q) &&
          !e.description.toLowerCase().includes(q)
        ) return false;
      }
      return true;
    });
  }, [allEvents, categoryFilter, modalityFilter, search]);

  const categories: (EventCategory | "All")[] = ["All", "Stock Move", "FDA Approval", "Clinical Trial", "M&A", "Upcoming"];

  return (
    <div className="min-h-screen bg-[#0f1117] text-foreground">
      {/* Header */}
      <div className="sticky top-0 z-30 bg-[#0f1117]/95 backdrop-blur-sm border-b border-white/6">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-lg font-semibold text-white tracking-tight">Catalyst Feed</h1>
              <p className="text-xs text-muted-foreground font-mono mt-0.5">
                {filtered.length} events — stock moves, FDA actions, M&A, upcoming catalysts
              </p>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative">
                <svg
                  className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground"
                  fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 16 16"
                >
                  <circle cx="7" cy="7" r="5" /><path d="M12 12l2.5 2.5" strokeLinecap="round"/>
                </svg>
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search company, drug…"
                  className="pl-8 pr-3 py-1.5 rounded-lg text-xs bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500/50 w-48"
                />
              </div>
            </div>
          </div>

          {/* Filter rows */}
          <div className="space-y-2">
            {/* Category filters */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] text-muted-foreground font-mono uppercase tracking-wider w-16 flex-shrink-0">Type</span>
              {categories.map((cat) => (
                <FilterPill
                  key={cat}
                  label={cat}
                  active={categoryFilter === cat}
                  color={cat === "All" ? "#06b6d4" : CATEGORY_COLORS[cat as EventCategory]}
                  onClick={() => setCategoryFilter(cat)}
                />
              ))}
            </div>

            {/* Modality filters */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] text-muted-foreground font-mono uppercase tracking-wider w-16 flex-shrink-0">Modality</span>
              <FilterPill
                label="All"
                active={modalityFilter === "All"}
                color="#06b6d4"
                onClick={() => setModalityFilter("All")}
              />
              {allModalities.map((m) => (
                <FilterPill
                  key={m}
                  label={m}
                  active={modalityFilter === m}
                  color={(MODALITY_COLORS as Record<string, string>)[m] ?? "#64748b"}
                  onClick={() => setModalityFilter(m)}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Feed */}
      <div className="px-6 py-4 max-w-4xl">
        {/* Upcoming section divider */}
        {filtered.some((e) => e.category === "Upcoming") && (
          <>
            {/* Past events */}
            <div className="space-y-2 mb-6">
              {filtered.filter((e) => e.category !== "Upcoming").map((event, i) => (
                <EventCard key={event.id} event={event} index={i} />
              ))}
            </div>
            {/* Upcoming divider */}
            {filtered.filter((e) => e.category !== "Upcoming").length > 0 && (
              <div className="flex items-center gap-3 my-6">
                <div className="flex-1 h-px bg-white/10" />
                <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest px-3 py-1 rounded-full border border-white/10 bg-white/3">
                  Upcoming Catalysts
                </span>
                <div className="flex-1 h-px bg-white/10" />
              </div>
            )}
            <div className="space-y-2">
              {filtered.filter((e) => e.category === "Upcoming").map((event, i) => (
                <EventCard key={event.id} event={event} index={i} />
              ))}
            </div>
          </>
        )}

        {/* All past (no upcoming in filter) */}
        {!filtered.some((e) => e.category === "Upcoming") && (
          <div className="space-y-2">
            {filtered.map((event, i) => (
              <EventCard key={event.id} event={event} index={i} />
            ))}
          </div>
        )}

        {filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <svg className="w-10 h-10 text-muted-foreground/40 mb-3" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35" strokeLinecap="round"/>
            </svg>
            <p className="text-sm text-muted-foreground">No events match the current filters.</p>
            <button
              className="mt-3 text-xs text-cyan-400 hover:text-cyan-300"
              onClick={() => { setCategoryFilter("All"); setModalityFilter("All"); setSearch(""); }}
            >
              Clear filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Event Card ────────────────────────────────────────────────────────────────

function EventCard({ event, index }: { event: FeedEvent; index: number }) {
  const [expanded, setExpanded] = useState(false);
  const barColor = event.category === "Stock Move"
    ? SENTIMENT_COLORS[event.sentiment]
    : CATEGORY_COLORS[event.category];
  const categoryColor = CATEGORY_COLORS[event.category];
  const modalityColor = (MODALITY_COLORS as Record<string, string>)[event.modality as string] ?? "#64748b";

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, delay: Math.min(index * 0.02, 0.3) }}
      className="group relative flex gap-0 rounded-lg overflow-hidden border border-white/6 bg-white/[0.025] hover:bg-white/[0.04] hover:border-white/10 transition-all duration-150 cursor-pointer"
      onClick={() => setExpanded(!expanded)}
    >
      {/* Left colour bar */}
      <div
        className="w-1 flex-shrink-0 transition-all duration-150"
        style={{ background: barColor, opacity: 0.85 }}
      />

      {/* Content */}
      <div className="flex-1 px-4 py-3 min-w-0">
        <div className="flex items-start gap-3">
          {/* Date */}
          <div className="flex-shrink-0 w-28">
            <span className="text-[11px] font-mono text-muted-foreground leading-tight block">
              {event.date}
            </span>
          </div>

          {/* Main content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-3">
              <p className="text-sm font-medium text-white leading-snug line-clamp-2 group-hover:text-cyan-100 transition-colors">
                {event.headline}
              </p>
              {/* Stock move badge */}
              {event.stockMove !== undefined && (
                <div className="flex-shrink-0">
                  <MoveBadge pct={event.stockMove} />
                </div>
              )}
            </div>

            {/* Description — expandable */}
            <AnimatePresence>
              {expanded && (
                <motion.p
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.18 }}
                  className="text-xs text-muted-foreground leading-relaxed mt-2 mb-1"
                >
                  {event.description}
                </motion.p>
              )}
            </AnimatePresence>

            {/* Tags row */}
            <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
              {event.ticker && event.ticker !== "" && event.ticker !== "—" && (
                <TickerBadge ticker={event.ticker} />
              )}
              <Badge label={event.category} color={categoryColor} />
              {event.modality && (
                <Badge label={event.modality as string} color={modalityColor} />
              )}
            </div>
          </div>

          {/* Expand chevron */}
          <svg
            className={`w-3.5 h-3.5 flex-shrink-0 text-muted-foreground/40 transition-transform duration-200 mt-0.5 ${expanded ? "rotate-180" : ""}`}
            fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 12 12"
          >
            <path d="M2 4l4 4 4-4" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
      </div>
    </motion.div>
  );
}
