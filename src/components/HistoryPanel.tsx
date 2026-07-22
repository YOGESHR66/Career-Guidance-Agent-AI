import React, { useState } from "react";
import { CareerGuidance } from "../types";
import { History, Trash2, Calendar, ChevronRight, User } from "lucide-react";

interface HistoryPanelProps {
  history: CareerGuidance[];
  onSelectReport: (guidance: CareerGuidance) => void;
  onDeleteReport: (index: number) => void;
  onClearHistory: () => void;
  selectedIdx: number | null;
}

export const HistoryPanel: React.FC<HistoryPanelProps> = ({
  history,
  onSelectReport,
  onDeleteReport,
  onClearHistory,
  selectedIdx,
}) => {
  const [showConfirmClear, setShowConfirmClear] = useState(false);

  if (history.length === 0) {
    return null;
  }

  return (
    <div className="bg-[var(--bg-card)] rounded-2xl border-2 border-[var(--color-border)] shadow-[var(--card-shadow)] p-5 space-y-4 transition-all duration-300">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold uppercase tracking-tight text-[var(--text-main)] flex items-center gap-2">
          <History className="w-4 h-4 text-[var(--accent-primary)]" />
          Previous Consultation Logs
        </h3>
        <button
          onClick={() => setShowConfirmClear(true)}
          className="text-xs text-rose-500 hover:text-rose-600 font-semibold uppercase tracking-tight transition-colors cursor-pointer"
        >
          Clear All
        </button>
      </div>

      {showConfirmClear && (
        <div className="bg-rose-500/10 border-2 border-rose-500/30 p-3 flex flex-col gap-2 text-xs text-[var(--text-main)] rounded-xl animate-in fade-in duration-200">
          <span className="font-semibold text-rose-600 dark:text-rose-400">
            Clear all consultation history? This action cannot be undone.
          </span>
          <div className="flex gap-2 justify-end">
            <button
              onClick={() => {
                onClearHistory();
                setShowConfirmClear(false);
              }}
              className="px-2.5 py-1 bg-rose-600 hover:bg-rose-700 text-white text-[10px] font-bold uppercase rounded-lg cursor-pointer"
            >
              Yes, Clear All
            </button>
            <button
              onClick={() => setShowConfirmClear(false)}
              className="px-2.5 py-1 bg-[var(--bg-card)] border-2 border-[var(--color-border)] hover:bg-[var(--bg-input)] text-[var(--text-muted)] text-[10px] font-bold uppercase rounded-lg cursor-pointer"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
        {history.map((item, idx) => (
          <div
            key={idx}
            className={`p-3 rounded-xl border-2 text-left transition-all relative group flex items-center justify-between ${
              selectedIdx === idx
                ? "bg-[var(--accent-light)] border-[var(--accent-primary)] text-[var(--text-main)] shadow-sm"
                : "bg-[var(--bg-card)] border-[var(--color-border)] text-[var(--text-main)] hover:bg-[var(--bg-input)] shadow-xs"
            }`}
          >
            <button
              onClick={() => onSelectReport(item)}
              className="flex-1 text-left cursor-pointer min-w-0"
            >
              <div className="font-semibold text-xs text-[var(--text-main)] truncate">
                {item.recommendedCareer}
              </div>
              <div className="flex items-center gap-2 mt-1 text-[10px] text-[var(--text-muted)] font-medium">
                <span className="flex items-center gap-0.5 truncate">
                  <User className="w-3 h-3 text-[var(--text-muted)] opacity-70" />
                  {item.profile?.name || "Anonymous student"}
                </span>
                <span>•</span>
                <span className="flex items-center gap-0.5 shrink-0">
                  <Calendar className="w-3 h-3 text-[var(--text-muted)] opacity-70" />
                  {item.timestamp ? new Date(item.timestamp).toLocaleDateString() : "Just now"}
                </span>
              </div>
            </button>

            <div className="flex items-center gap-1 shrink-0 pl-1">
              <button
                onClick={() => onSelectReport(item)}
                className="p-1 rounded-none hover:bg-[var(--bg-input)] text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors cursor-pointer"
                title="View Report"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => onDeleteReport(idx)}
                className="p-1 rounded-none hover:bg-rose-50 dark:hover:bg-rose-950/20 text-slate-400 hover:text-rose-500 transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100 cursor-pointer"
                title="Delete Log"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
