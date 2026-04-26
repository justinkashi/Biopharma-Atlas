import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { modalityInfo } from "@/data/pipelineData";

interface InfoPanelProps {
  modalityKey: string | null;
  onClose: () => void;
}

export function InfoPanel({ modalityKey, onClose }: InfoPanelProps) {
  const info = modalityKey ? modalityInfo[modalityKey] : null;

  useEffect(() => {
    if (!info) return;
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [info, onClose]);

  return (
    <AnimatePresence>
      {info && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 z-40"
            onClick={onClose}
          />
          {/* Slide-over panel */}
          <motion.div
            data-testid="info-panel"
            initial={{ x: 400, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 400, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed right-0 top-0 bottom-0 w-[400px] bg-card border-l border-border z-50 overflow-y-auto"
          >
            <div className="p-6">
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h2 className="text-base font-semibold text-foreground">{info.name}</h2>
                  <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{info.mechanism}</p>
                </div>
                <button
                  data-testid="btn-close-infopanel"
                  onClick={onClose}
                  className="text-muted-foreground hover:text-foreground transition-colors ml-3 mt-0.5"
                >
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <line x1="3" y1="3" x2="13" y2="13"/>
                    <line x1="13" y1="3" x2="3" y2="13"/>
                  </svg>
                </button>
              </div>

              {/* Separator */}
              <div className="border-t border-border mb-4" />

              {/* How it works */}
              <div className="mb-4">
                <div className="text-[10px] font-semibold text-primary uppercase tracking-widest mb-2">How It Works</div>
                <p className="text-xs text-foreground/80 leading-relaxed">{info.howItWorks}</p>
              </div>

              {/* Advantages */}
              <div className="mb-4">
                <div className="text-[10px] font-semibold text-[#22c55e] uppercase tracking-widest mb-2">Advantages</div>
                <div className="flex flex-wrap gap-1.5">
                  {info.advantages.map((adv) => (
                    <span key={adv} className="px-2 py-0.5 rounded-full text-[10px] bg-[#22c55e]/10 text-[#22c55e] border border-[#22c55e]/20">
                      {adv}
                    </span>
                  ))}
                </div>
              </div>

              {/* Limitations */}
              <div className="mb-4">
                <div className="text-[10px] font-semibold text-[#f59e0b] uppercase tracking-widest mb-2">Limitations</div>
                <div className="flex flex-wrap gap-1.5">
                  {info.limitations.map((lim) => (
                    <span key={lim} className="px-2 py-0.5 rounded-full text-[10px] bg-[#f59e0b]/10 text-[#f59e0b] border border-[#f59e0b]/20">
                      {lim}
                    </span>
                  ))}
                </div>
              </div>

              {/* Landmark drugs */}
              <div className="mb-4">
                <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest mb-2">Landmark Drugs</div>
                <div className="space-y-3">
                  {info.landmarks.map((lm, i) => (
                    <div key={i} className="flex gap-3">
                      <div className="font-mono text-[10px] text-primary pt-0.5 w-8 flex-shrink-0">{lm.year}</div>
                      <div>
                        <div className="text-xs font-medium text-foreground">{lm.drug}</div>
                        <div className="text-[10px] text-muted-foreground leading-relaxed mt-0.5">{lm.significance}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Separator */}
              <div className="border-t border-border mb-4" />

              {/* Current status */}
              <div>
                <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest mb-2">Current Status</div>
                <p className="text-xs text-foreground/80 leading-relaxed">{info.currentStatus}</p>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
