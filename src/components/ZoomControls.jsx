import React from 'react';
import { useStore } from '../lib/store';
import { Plus, Minus, Maximize2 } from 'lucide-react';

export default function ZoomControls() {
  const { zoom, zoomIn, zoomOut, resetView } = useStore();

  return (
    <div className="absolute bottom-4 right-4 flex flex-col gap-1.5 z-10 safe-bottom">
      <button
        onClick={zoomIn}
        className="zoom-btn bg-white dark:bg-slate-800 shadow-lg rounded-lg w-10 h-10 sm:w-9 sm:h-9 flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200"
        title="Zoom in (+)"
        aria-label="Zoom in"
      >
        <Plus size={18} className="text-slate-700 dark:text-slate-200" />
      </button>
      <div className="bg-white dark:bg-slate-800 shadow-lg rounded-lg px-1 py-1 text-center text-[10px] font-bold text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 min-h-[28px] flex items-center justify-center">
        {(zoom * 100).toFixed(0)}%
      </div>
      <button
        onClick={zoomOut}
        className="zoom-btn bg-white dark:bg-slate-800 shadow-lg rounded-lg w-10 h-10 sm:w-9 sm:h-9 flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors border border-slate-200 dark:border-slate-700"
        title="Zoom out (-)"
        aria-label="Zoom out"
      >
        <Minus size={18} className="text-slate-700 dark:text-slate-200" />
      </button>
      <button
        onClick={resetView}
        className="zoom-btn bg-white dark:bg-slate-800 shadow-lg rounded-lg w-10 h-10 sm:w-9 sm:h-9 flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors border border-slate-200 dark:border-slate-700"
        title="Reset view (0)"
        aria-label="Reset view"
      >
        <Maximize2 size={15} className="text-slate-700 dark:text-slate-200" />
      </button>
    </div>
  );
}
