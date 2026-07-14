import React from 'react';
import { useStore } from '../lib/store';
import { X, History, RotateCcw, RotateCw } from 'lucide-react';

export default function UndoHistoryPanel() {
  const {
    isUndoHistoryOpen,
    closeUndoHistory,
    past,
    future,
    undo,
    redo,
  } = useStore();

  if (!isUndoHistoryOpen) return null;

  const totalSteps = past.length + future.length + 1;
  const currentIndex = past.length;

  return (
    <div
      className="modal-overlay fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4"
      onMouseDown={(e) => e.target === e.currentTarget && closeUndoHistory()}
    >
      <div className="modal-content bg-white dark:bg-slate-800 dark:text-slate-100 rounded-xl shadow-2xl w-full max-w-md max-h-[80vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700 bg-gradient-to-r from-slate-700 to-slate-800 text-white">
          <h2 className="text-lg font-bold flex items-center gap-2">
            <History size={20} />
            Riwayat Undo
          </h2>
          <button onClick={closeUndoHistory} className="text-white/70 hover:text-white p-1.5 rounded hover:bg-white/10">
            <X size={20} />
          </button>
        </div>

        <div className="p-4 space-y-3">
          {/* Current state */}
          <div className="bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-200 dark:border-indigo-800 rounded-lg p-3">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-bold text-indigo-700 dark:text-indigo-300">Status Saat Ini</div>
                <div className="text-xs text-slate-500">Langkah {currentIndex + 1} dari {totalSteps}</div>
              </div>
              <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">{currentIndex + 1}</div>
            </div>
          </div>

          {/* Undo/Redo buttons */}
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={undo}
              disabled={past.length === 0}
              className="px-3 py-2 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 disabled:opacity-40 rounded-md text-sm font-medium flex items-center justify-center gap-1.5"
            >
              <RotateCcw size={14} />
              Undo ({past.length})
            </button>
            <button
              onClick={redo}
              disabled={future.length === 0}
              className="px-3 py-2 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 disabled:opacity-40 rounded-md text-sm font-medium flex items-center justify-center gap-1.5"
            >
              <RotateCw size={14} />
              Redo ({future.length})
            </button>
          </div>

          {/* Timeline */}
          <div className="space-y-1 max-h-60 overflow-y-auto">
            {past.length === 0 && future.length === 0 && (
              <div className="text-center text-slate-400 text-xs py-4">
                Belum ada riwayat perubahan.
              </div>
            )}
            {/* Past states */}
            {past.map((_, i) => (
              <div key={`past-${i}`} className="flex items-center gap-2 text-xs text-slate-400 px-2 py-1">
                <div className="w-2 h-2 rounded-full bg-slate-300 dark:bg-slate-600" />
                Langkah {i + 1}
                <span className="ml-auto">undo</span>
              </div>
            ))}
            {/* Current */}
            <div className="flex items-center gap-2 text-xs font-bold text-indigo-600 dark:text-indigo-400 px-2 py-1.5 bg-indigo-50 dark:bg-indigo-900/20 rounded">
              <div className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
              Langkah {currentIndex + 1} (Saat Ini)
            </div>
            {/* Future states */}
            {future.map((_, i) => (
              <div key={`future-${i}`} className="flex items-center gap-2 text-xs text-slate-400 px-2 py-1">
                <div className="w-2 h-2 rounded-full bg-slate-200 dark:bg-slate-700" />
                Langkah {currentIndex + 2 + i}
                <span className="ml-auto">redo</span>
              </div>
            ))}
          </div>

          <div className="text-[11px] text-slate-400 text-center">
            Shortcut: Ctrl+Z (Undo) · Ctrl+Y (Redo) · Maks 50 langkah
          </div>
        </div>

        <div className="p-4 border-t border-slate-200 dark:border-slate-700 flex justify-end">
          <button onClick={closeUndoHistory} className="px-4 py-2 bg-slate-600 hover:bg-slate-700 text-white rounded-md text-sm font-medium">
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
}
