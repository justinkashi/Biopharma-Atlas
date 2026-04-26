import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface MilestoneEvent {
  year: number;
  event: string;
  description: string;
  category: string;
}

const CATEGORY_COLORS: Record<string, string> = {
  "Small Molecule": "#6366f1",
  "mAb": "#06b6d4",
  "ADC": "#f43f5e",
  "ADC/Gene": "#f43f5e",
  "RNA": "#eab308",
  "Cell/Gene": "#a855f7",
  "mRNA": "#14b8a6",
  "Bispecific": "#f97316",
  "Gene Editing": "#22c55e",
  "Cell Therapy": "#a855f7",
  "Vaccine": "#22c55e",
  "Pandemic": "#8892a8",
};

export function DrugDetailModal({
  milestone,
  onClose,
}: {
  milestone: MilestoneEvent | null;
  onClose: () => void;
}) {
  useEffect(() => {
    if (!milestone) return;
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [milestone, onClose]);

  const color = milestone ? (CATEGORY_COLORS[milestone.category] ?? "#06b6d4") : "#06b6d4";

  return (
    <AnimatePresence>
      {milestone && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-40"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
          >
            <div
              className="relative pointer-events-auto w-full max-w-lg rounded-2xl border shadow-2xl p-6"
              style={{ background: "hsl(var(--card))", borderColor: `${color}30` }}
            >
              {/* Close button */}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Close"
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <line x1="3" y1="3" x2="13" y2="13"/><line x1="13" y1="3" x2="3" y2="13"/>
                </svg>
              </button>

              {/* Year badge */}
              <div
                className="inline-flex items-center gap-1.5 text-[10px] font-mono font-semibold px-2.5 py-1 rounded-full mb-3"
                style={{ color, background: `${color}15`, border: `1px solid ${color}30` }}
              >
                <span>{milestone.year}</span>
                <span className="opacity-60">·</span>
                <span>{milestone.category}</span>
              </div>

              {/* Title */}
              <h2 className="text-base font-semibold text-foreground mb-3 pr-6">{milestone.event}</h2>

              {/* Divider */}
              <div className="h-px mb-4" style={{ background: `${color}20` }} />

              {/* Description */}
              <p className="text-sm text-foreground/80 leading-relaxed mb-4">{milestone.description}</p>

              {/* Context cards */}
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-lg p-3" style={{ background: `${color}08`, border: `1px solid ${color}20` }}>
                  <div className="text-[10px] font-semibold uppercase tracking-widest mb-1" style={{ color }}>
                    Year
                  </div>
                  <div className="font-mono text-lg font-bold text-foreground">{milestone.year}</div>
                </div>
                <div className="rounded-lg p-3" style={{ background: `${color}08`, border: `1px solid ${color}20` }}>
                  <div className="text-[10px] font-semibold uppercase tracking-widest mb-1" style={{ color }}>
                    Modality Class
                  </div>
                  <div className="text-sm font-semibold text-foreground">{milestone.category}</div>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
