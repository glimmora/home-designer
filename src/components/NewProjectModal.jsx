import React, { useState } from 'react';
import { useStore } from '../lib/store';
import DimensionSlider from './DimensionSlider';
import { toDisplay, fromDisplay, formatDimension } from '../lib/utils';
import { Plus, X, Home, Ruler, Building2, Check, ArrowRight, ArrowLeft } from 'lucide-react';

export default function NewProjectModal() {
  const {
    isNewProjectModalOpen,
    closeNewProjectModal,
    startNewProject,
    plot,
    building,
    unit,
  } = useStore();

  const [step, setStep] = useState(1); // 1 = plot setup, 2 = building setup, 3 = confirm
  const [plotSize, setPlotSize] = useState({
    width: plot.width,
    depth: plot.depth,
  });
  const [buildingSize, setBuildingSize] = useState({
    width: building.width,
    depth: building.depth,
    offsetX: building.offsetX,
    offsetY: building.offsetY,
  });
  const [includeColumns, setIncludeColumns] = useState(true);
  const [floorHeight, setFloorHeight] = useState(300);

  if (!isNewProjectModalOpen) return null;

  const u = unit;
  const maxPlot = u === 'm' ? 100 : 10000;
  const maxBuilding = u === 'm' ? 50 : 5000;
  const maxOffset = u === 'm' ? 20 : 2000;
  const stepVal = u === 'm' ? 0.1 : 10;

  const plotArea = (plotSize.width * plotSize.depth) / 10000;
  const buildingArea = (buildingSize.width * buildingSize.depth) / 10000;
  const kdb = plotArea > 0 ? (buildingArea / plotArea * 100).toFixed(1) : 0;

  // Check if building fits within plot
  const fitsX = buildingSize.width + buildingSize.offsetX <= plotSize.width;
  const fitsY = buildingSize.depth + buildingSize.offsetY <= plotSize.depth;

  const handleStart = () => {
    startNewProject({
      plot: { width: plotSize.width, depth: plotSize.depth },
      building: {
        width: buildingSize.width,
        depth: buildingSize.depth,
        offsetX: buildingSize.offsetX,
        offsetY: buildingSize.offsetY,
      },
      includeColumns,
      floorHeight,
    });
  };

  const handleReset = () => {
    setPlotSize({ width: 1500, depth: 2000 });
    setBuildingSize({ width: 1200, depth: 1500, offsetX: 150, offsetY: 250 });
    setStep(1);
  };

  return (
    <div
      className="modal-overlay fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-2 sm:p-4"
      onMouseDown={(e) => e.target === e.currentTarget && closeNewProjectModal()}
    >
      <div className="modal-content bg-white dark:bg-slate-800 dark:text-slate-100 rounded-xl shadow-2xl w-full max-w-lg max-h-[92vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700 flex-shrink-0 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white">
          <h2 className="text-lg font-bold flex items-center gap-2">
            <Plus size={20} />
            Proyek Baru
          </h2>
          <button
            onClick={closeNewProjectModal}
            className="text-white/70 hover:text-white p-1.5 rounded hover:bg-white/10"
          >
            <X size={20} />
          </button>
        </div>

        {/* Progress indicator */}
        <div className="flex items-center px-4 py-2 bg-slate-50 dark:bg-slate-700/50 border-b border-slate-200 dark:border-slate-700">
          {[1, 2, 3].map((s) => (
            <React.Fragment key={s}>
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                  step >= s
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-200 dark:bg-slate-600 text-slate-400'
                }`}
              >
                {step > s ? <Check size={14} /> : s}
              </div>
              {s < 3 && (
                <div className={`flex-1 h-0.5 mx-1 ${step > s ? 'bg-indigo-600' : 'bg-slate-200 dark:bg-slate-600'}`} />
              )}
            </React.Fragment>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Step 1: Plot Size */}
          {step === 1 && (
            <div className="space-y-4 animate-fade-in">
              <div className="text-center">
                <Ruler className="mx-auto text-green-600 mb-2" size={32} />
                <h3 className="font-bold text-base">Ukuran Tanah</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Geser slider atau ketik manual untuk mengatur ukuran lahan
                </p>
              </div>

              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-3 space-y-3">
                <DimensionSlider
                  label="Lebar Tanah (X)"
                  value={toDisplay(plotSize.width, u)}
                  onChange={(v) => setPlotSize({ ...plotSize, width: fromDisplay(v, u) })}
                  onCommit={() => {}}
                  min={u === 'm' ? 1 : 100}
                  max={maxPlot}
                  step={stepVal}
                  unit={u}
                  color="green"
                  icon="↔"
                />
                <DimensionSlider
                  label="Panjang Tanah (Y)"
                  value={toDisplay(plotSize.depth, u)}
                  onChange={(v) => setPlotSize({ ...plotSize, depth: fromDisplay(v, u) })}
                  onCommit={() => {}}
                  min={u === 'm' ? 1 : 100}
                  max={maxPlot}
                  step={stepVal}
                  unit={u}
                  color="green"
                  icon="↕"
                />
              </div>

              {/* Live preview */}
              <div className="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-3">
                <div className="text-xs font-semibold text-slate-600 dark:text-slate-300 mb-2">Preview Denah:</div>
                <svg
                  viewBox={`${-plotSize.width / 2} ${-plotSize.depth / 2} ${plotSize.width} ${plotSize.depth}`}
                  className="w-full h-32 border border-slate-200 dark:border-slate-600 rounded"
                  preserveAspectRatio="xMidYMid meet"
                >
                  <rect
                    x={-plotSize.width / 2}
                    y={-plotSize.depth / 2}
                    width={plotSize.width}
                    height={plotSize.depth}
                    fill="rgba(134, 239, 172, 0.3)"
                    stroke="#166534"
                    strokeWidth="3"
                    strokeDasharray="10 5"
                  />
                  <text
                    x={0}
                    y={0}
                    textAnchor="middle"
                    fontSize={Math.min(plotSize.width, plotSize.depth) * 0.08}
                    fill="#166534"
                    fontWeight="bold"
                  >
                    {formatDimension(plotSize.width, u)} x {formatDimension(plotSize.depth, u)}
                  </text>
                </svg>
                <div className="text-center text-sm font-semibold text-green-700 dark:text-green-400 mt-2">
                  Luas: {plotArea.toFixed(2)} m²
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Building Size */}
          {step === 2 && (
            <div className="space-y-4 animate-fade-in">
              <div className="text-center">
                <Building2 className="mx-auto text-blue-600 mb-2" size={32} />
                <h3 className="font-bold text-base">Ukuran Bangunan</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Atur footprint bangunan di atas tanah
                </p>
              </div>

              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3 space-y-3">
                <DimensionSlider
                  label="Lebar Bangunan (X)"
                  value={toDisplay(buildingSize.width, u)}
                  onChange={(v) => setBuildingSize({ ...buildingSize, width: fromDisplay(v, u) })}
                  onCommit={() => {}}
                  min={u === 'm' ? 1 : 100}
                  max={Math.max(maxBuilding, plotSize.width)}
                  step={stepVal}
                  unit={u}
                  color="blue"
                  icon="↔"
                />
                <DimensionSlider
                  label="Panjang Bangunan (Y)"
                  value={toDisplay(buildingSize.depth, u)}
                  onChange={(v) => setBuildingSize({ ...buildingSize, depth: fromDisplay(v, u) })}
                  onCommit={() => {}}
                  min={u === 'm' ? 1 : 100}
                  max={Math.max(maxBuilding, plotSize.depth)}
                  step={stepVal}
                  unit={u}
                  color="blue"
                  icon="↕"
                />
              </div>

              <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-3 space-y-3">
                <div className="text-xs font-semibold text-amber-800 dark:text-amber-300">
                  Posisi Bangunan (Offset dari Sudut Tanah)
                </div>
                <DimensionSlider
                  label="Offset X (kiri)"
                  value={toDisplay(buildingSize.offsetX, u)}
                  onChange={(v) => setBuildingSize({ ...buildingSize, offsetX: fromDisplay(v, u) })}
                  onCommit={() => {}}
                  min={0}
                  max={Math.max(maxOffset, plotSize.width)}
                  step={stepVal}
                  unit={u}
                  color="amber"
                  icon="←"
                />
                <DimensionSlider
                  label="Offset Y (depan)"
                  value={toDisplay(buildingSize.offsetY, u)}
                  onChange={(v) => setBuildingSize({ ...buildingSize, offsetY: fromDisplay(v, u) })}
                  onCommit={() => {}}
                  min={0}
                  max={Math.max(maxOffset, plotSize.depth)}
                  step={stepVal}
                  unit={u}
                  color="amber"
                  icon="↓"
                />
              </div>

              {/* Warnings */}
              {(!fitsX || !fitsY) && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-2">
                  <p className="text-xs text-red-700 dark:text-red-300">
                    ⚠️ Bangunan melebihi batas tanah! Sesuaikan ukuran atau offset.
                  </p>
                </div>
              )}

              {/* Live preview with both plot and building */}
              <div className="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-3">
                <div className="text-xs font-semibold text-slate-600 dark:text-slate-300 mb-2">Preview:</div>
                <svg
                  viewBox={`${-plotSize.width / 2} ${-plotSize.depth / 2} ${plotSize.width} ${plotSize.depth}`}
                  className="w-full h-32 border border-slate-200 dark:border-slate-600 rounded"
                  preserveAspectRatio="xMidYMid meet"
                >
                  <rect
                    x={-plotSize.width / 2}
                    y={-plotSize.depth / 2}
                    width={plotSize.width}
                    height={plotSize.depth}
                    fill="rgba(134, 239, 172, 0.3)"
                    stroke="#166534"
                    strokeWidth="3"
                    strokeDasharray="10 5"
                  />
                  <rect
                    x={-plotSize.width / 2 + buildingSize.offsetX}
                    y={-plotSize.depth / 2 + buildingSize.offsetY}
                    width={buildingSize.width}
                    height={buildingSize.depth}
                    fill={(!fitsX || !fitsY) ? 'rgba(239, 68, 68, 0.3)' : 'rgba(99, 102, 241, 0.3)'}
                    stroke={(!fitsX || !fitsY) ? '#dc2626' : '#4338ca'}
                    strokeWidth="2"
                  />
                </svg>
                <div className="flex justify-between text-xs mt-2">
                  <span className="text-green-700 dark:text-green-400">Tanah: {plotArea.toFixed(1)} m²</span>
                  <span className="text-blue-700 dark:text-blue-400">Bangunan: {buildingArea.toFixed(1)} m²</span>
                  <span className="text-slate-700 dark:text-slate-300">KDB: {kdb}%</span>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Options & Confirm */}
          {step === 3 && (
            <div className="space-y-4 animate-fade-in">
              <div className="text-center">
                <Home className="mx-auto text-indigo-600 mb-2" size={32} />
                <h3 className="font-bold text-base">Opsi Tambahan</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Konfigurasi terakhir sebelum memulai
                </p>
              </div>

              {/* Floor height */}
              <div className="bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800 rounded-lg p-3">
                <DimensionSlider
                  label="Tinggi Lantai"
                  value={toDisplay(floorHeight, u)}
                  onChange={(v) => setFloorHeight(fromDisplay(v, u))}
                  onCommit={() => {}}
                  min={u === 'm' ? 2 : 200}
                  max={u === 'm' ? 5 : 500}
                  step={u === 'm' ? 0.1 : 10}
                  unit={u}
                  color="indigo"
                  icon="↕"
                />
              </div>

              {/* Columns option */}
              <div className="bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-700 rounded-lg p-3">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={includeColumns}
                    onChange={(e) => setIncludeColumns(e.target.checked)}
                    className="w-4 h-4 rounded"
                  />
                  <span className="text-sm font-medium">
                    Tambahkan 4 kolom struktural di sudut bangunan
                  </span>
                </label>
                {includeColumns && (
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 ml-6">
                    Kolom akan ditempatkan di 4 sudut bangunan (30x30 cm)
                  </p>
                )}
              </div>

              {/* Summary */}
              <div className="bg-slate-100 dark:bg-slate-700/50 rounded-lg p-3">
                <div className="text-xs font-semibold text-slate-600 dark:text-slate-300 mb-2">Ringkasan Proyek:</div>
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Tanah:</span>
                    <span className="font-medium">{formatDimension(plotSize.width, u)} x {formatDimension(plotSize.depth, u)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Bangunan:</span>
                    <span className="font-medium">{formatDimension(buildingSize.width, u)} x {formatDimension(buildingSize.depth, u)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Luas Tanah:</span>
                    <span className="font-medium">{plotArea.toFixed(2)} m²</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Luas Bangunan:</span>
                    <span className="font-medium">{buildingArea.toFixed(2)} m²</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">KDB:</span>
                    <span className="font-medium">{kdb}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Tinggi Lantai:</span>
                    <span className="font-medium">{formatDimension(floorHeight, u)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Kolom:</span>
                    <span className="font-medium">{includeColumns ? '4 kolom (sudut)' : 'Tidak ada'}</span>
                  </div>
                </div>
              </div>

              <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-2">
                <p className="text-xs text-amber-700 dark:text-amber-300">
                  ⚠️ Proyek baru akan menggantikan desain saat ini (bisa di-undo dengan Ctrl+Z).
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer with navigation */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-700 flex justify-between items-center bg-white dark:bg-slate-800 flex-shrink-0">
          <div className="flex gap-2">
            {step > 1 && (
              <button
                onClick={() => setStep(step - 1)}
                className="px-3 py-2 border border-slate-300 dark:border-slate-600 dark:text-slate-200 rounded-md text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center gap-1"
              >
                <ArrowLeft size={14} />
                Kembali
              </button>
            )}
            <button
              onClick={handleReset}
              className="px-3 py-2 text-xs text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
            >
              Reset
            </button>
          </div>
          <div className="flex gap-2">
            <button
              onClick={closeNewProjectModal}
              className="px-3 py-2 text-xs text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
            >
              Batal
            </button>
            {step < 3 ? (
              <button
                onClick={() => setStep(step + 1)}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md text-sm font-medium flex items-center gap-1.5"
              >
                Lanjut
                <ArrowRight size={14} />
              </button>
            ) : (
              <button
                onClick={handleStart}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md text-sm font-medium flex items-center gap-1.5"
              >
                <Check size={14} />
                Mulai Proyek
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
