import React from "react";
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
  if (history.length === 0) {
    return null;
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-800 flex items-center gap-2">
          <History className="w-4 h-4 text-indigo-600" />
          Previous Consultation Logs
        </h3>
        <button
          onClick={onClearHistory}
          className="text-xs text-rose-500 hover:text-rose-600 font-medium transition-colors"
        >
          Clear All
        </button>
      </div>

      <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
        {history.map((item, idx) => (
          <div
            key={idx}
            className={`p-3 rounded-xl border text-left transition-all relative group flex items-center justify-between ${
              selectedIdx === idx
                ? "bg-indigo-50/40 border-indigo-200 text-indigo-900"
                : "bg-slate-50/30 border-slate-100 text-slate-700 hover:bg-slate-50 hover:border-slate-200"
            }`}
          >
            <button
              onClick={() => onSelectReport(item)}
              className="flex-1 text-left"
            >
              <div className="font-semibold text-xs text-slate-800 truncate">
                {item.recommendedCareer}
              </div>
              <div className="flex items-center gap-2 mt-1 text-[10px] text-slate-400">
                <span className="flex items-center gap-0.5 truncate">
                  <User className="w-3 h-3 text-slate-300" />
                  {item.profile?.name || "Anonymous student"}
                </span>
                <span>•</span>
                <span className="flex items-center gap-0.5 shrink-0">
                  <Calendar className="w-3 h-3 text-slate-300" />
                  {item.timestamp ? new Date(item.timestamp).toLocaleDateString() : "Just now"}
                </span>
              </div>
            </button>

            <div className="flex items-center gap-2">
              <button
                onClick={() => onSelectReport(item)}
                className="p-1 rounded-lg hover:bg-slate-200/50 text-slate-400 hover:text-slate-700 transition-colors"
                title="View Report"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => onDeleteReport(idx)}
                className="p-1 rounded-lg hover:bg-rose-50 text-slate-400 hover:text-rose-500 transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
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
