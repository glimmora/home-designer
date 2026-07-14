import React, { useState, useMemo } from 'react';
import { useStore } from '../lib/store';
import { presetList, housePresets } from '../lib/housePresets';
import { Home, X, Layers, Maximize, Check, Filter, Building2, Building } from 'lucide-react';

export default function PresetModal() {
  const { isPresetModalOpen, closePresetModal, loadPreset, unit } = useStore();
  const [selected, setSelected] = useState(null);
  const [filter, setFilter] = useState('all'); // all | 1 | 2

  const handleLoad = () => {
    if (!selected) return;
    const preset = housePresets[selected];
    if (preset) {
      loadPreset(preset);
    }
  };

  const filteredPresets = useMemo(() => {
    if (filter === 'all') return presetList;
    return presetList.filter((p) => p.floors === Number(filter));
  }, [filter]);

  const singleCount = presetList.filter((p) => p.floors === 1).length;
  const twoCount = presetList.filter((p) => p.floors === 2).length;

  if (!isPresetModalOpen) return null;

  return (
    <div
      className="modal-overlay fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-2 sm:p-4"
      onMouseDown={(e) => e.target === e.currentTarget && closePresetModal()}
    >
      <div className="modal-content bg-white dark:bg-slate-800 dark:text-slate-100 rounded-xl shadow-2xl w-full max-w-5xl max-h-[92vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700 sticky top-0 bg-white dark:bg-slate-800 z-10">
          <h2 className="text-lg font-bold flex items-center gap-2">
            <Home className="text-orange-600" size={20} />
            Template Rumah Siap Pakai
            <span className="text-xs bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 px-2 py-0.5 rounded-full font-normal">
              {presetList.length} template
            </span>
          </h2>
          <button
            onClick={closePresetModal}
            className="text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700 p-1.5 rounded"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-4 border-b border-slate-200 dark:border-slate-700">
          <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-lg p-3 mb-3">
            <p className="text-xs text-blue-700 dark:text-blue-300">
              💡 Pilih template rumah sesuai gaya yang diinginkan
              untuk memulai desain dengan cepat. Anda bisa mengedit setelahnya.
            </p>
          </div>

          {/* Filter buttons */}
          <div className="flex items-center gap-2 flex-wrap">
            <Filter size={14} className="text-slate-400" />
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                filter === 'all'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
              }`}
            >
              Semua ({presetList.length})
            </button>
            <button
              onClick={() => setFilter('1')}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors flex items-center gap-1 ${
                filter === '1'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
              }`}
            >
              <Building size={12} />
              1 Lantai ({singleCount})
            </button>
            <button
              onClick={() => setFilter('2')}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors flex items-center gap-1 ${
                filter === '2'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
              }`}
            >
              <Building2 size={12} />
              2 Lantai ({twoCount})
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {filteredPresets.map((preset) => {
              const full = housePresets[preset.id];
              const isSelected = selected === preset.id;
              return (
                <button
                  key={preset.id}
                  onClick={() => setSelected(preset.id)}
                  className={`text-left border-2 rounded-lg p-3 transition-all ${
                    isSelected
                      ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30 shadow-md'
                      : 'border-slate-200 dark:border-slate-700 hover:border-indigo-300 hover:bg-slate-50 dark:hover:bg-slate-700'
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-slate-800 dark:text-slate-100 text-sm leading-tight">
                        {preset.name}
                      </h3>
                      {preset.style && (
                        <span className="inline-block mt-1 text-[10px] bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 px-1.5 py-0.5 rounded font-medium">
                          {preset.style}
                        </span>
                      )}
                    </div>
                    {isSelected && (
                      <div className="bg-indigo-600 text-white rounded-full p-1 flex-shrink-0">
                        <Check size={12} />
                      </div>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mb-2 leading-snug">
                    {preset.description}
                  </p>
                  <div className="flex items-center gap-2 text-[11px] text-slate-600 dark:text-slate-300 flex-wrap">
                    <span className="flex items-center gap-0.5">
                      <Layers size={10} />
                      {preset.floors}L
                    </span>
                    <span className="flex items-center gap-0.5">
                      <Maximize size={10} />
                      {preset.area} m²{preset.floors > 1 && ` (${preset.totalArea} total)`}
                    </span>
                    <span className="text-slate-400">
                      · {preset.bedroomCount} KT
                    </span>
                  </div>
                  {/* Mini floor plan preview */}
                  <div className="mt-2 bg-slate-50 dark:bg-slate-700/50 rounded p-1.5">
                    <svg
                      viewBox={`${-full.plot.width / 2} ${-full.plot.depth / 2} ${full.plot.width} ${full.plot.depth}`}
                      className="w-full h-16"
                      preserveAspectRatio="xMidYMid meet"
                    >
                      <rect
                        x={-full.plot.width / 2}
                        y={-full.plot.depth / 2}
                        width={full.plot.width}
                        height={full.plot.depth}
                        fill="rgba(134, 239, 172, 0.3)"
                        stroke="#166534"
                        strokeWidth="20"
                        strokeDasharray="80 40"
                      />
                      <rect
                        x={-full.plot.width / 2 + full.building.offsetX}
                        y={-full.plot.depth / 2 + full.building.offsetY}
                        width={full.building.width}
                        height={full.building.depth}
                        fill="rgba(99, 102, 241, 0.2)"
                        stroke="#4338ca"
                        strokeWidth="15"
                      />
                      {/* Walls */}
                      {full.floors[0].walls.map((w, i) => (
                        <line
                          key={i}
                          x1={w.x1}
                          y1={w.y1}
                          x2={w.x2}
                          y2={w.y2}
                          stroke="#1e293b"
                          strokeWidth="40"
                          strokeLinecap="round"
                        />
                      ))}
                    </svg>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <div className="p-4 border-t border-slate-200 dark:border-slate-700 flex justify-end gap-2 sticky bottom-0 bg-white dark:bg-slate-800">
          <button
            onClick={closePresetModal}
            className="px-4 py-2 border border-slate-300 dark:border-slate-600 dark:text-slate-200 rounded-md text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-700"
          >
            Batal
          </button>
          <button
            onClick={handleLoad}
            disabled={!selected}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-md text-sm font-medium flex items-center gap-1.5"
          >
            <Home size={14} />
            Muat Template
          </button>
        </div>
      </div>
    </div>
  );
}
