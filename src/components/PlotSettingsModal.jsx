import React, { useState, useEffect, useMemo } from 'react';
import { useStore } from '../lib/store';
import { toDisplay, fromDisplay } from '../lib/utils';
import { Ruler, X, Check, AlertTriangle } from 'lucide-react';

/**
 * Plot Settings Modal
 *
 * FIX BUG dari aplikasi asli: "kok klik terapkan popup tdk hilang"
 * Bug terjadi karena tombol "Terapkan" (Apply) tidak memanggil fungsi
 * yang menutup modal. Sekarang Apply memanggil applyPlotSettings yang
 * otomatis menutup modal setelah menyimpan perubahan.
 */
export default function PlotSettingsModal() {
  const {
    isPlotModalOpen,
    plotUnit,
    unit,
    plot,
    building,
    setPlotUnit,
    applyPlotSettings,
    closePlotModal,
  } = useStore();

  // Local form state - synced when modal opens
  const [formPlot, setFormPlot] = useState({
    width: toDisplay(plot.width, plotUnit),
    depth: toDisplay(plot.depth, plotUnit),
  });
  const [formBuilding, setFormBuilding] = useState({
    width: toDisplay(building.width, plotUnit),
    depth: toDisplay(building.depth, plotUnit),
    offsetX: toDisplay(building.offsetX, plotUnit),
    offsetY: toDisplay(building.offsetY, plotUnit),
  });

  // Re-sync form whenever modal opens or plot unit changes
  useEffect(() => {
    if (isPlotModalOpen) {
      setFormPlot({
        width: toDisplay(plot.width, plotUnit),
        depth: toDisplay(plot.depth, plotUnit),
      });
      setFormBuilding({
        width: toDisplay(building.width, plotUnit),
        depth: toDisplay(building.depth, plotUnit),
        offsetX: toDisplay(building.offsetX, plotUnit),
        offsetY: toDisplay(building.offsetY, plotUnit),
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPlotModalOpen, plotUnit]);

  // Switching plot unit: re-convert existing form values
  const handleSetPlotUnit = (newUnit) => {
    if (newUnit === plotUnit) return;
    const oldUnit = plotUnit;
    // Convert current form values to cm first, then to new unit
    const cmPlotW = fromDisplay(formPlot.width, oldUnit);
    const cmPlotD = fromDisplay(formPlot.depth, oldUnit);
    const cmBldgW = fromDisplay(formBuilding.width, oldUnit);
    const cmBldgD = fromDisplay(formBuilding.depth, oldUnit);
    const cmOffX = fromDisplay(formBuilding.offsetX, oldUnit);
    const cmOffY = fromDisplay(formBuilding.offsetY, oldUnit);
    setFormPlot({
      width: toDisplay(cmPlotW, newUnit),
      depth: toDisplay(cmPlotD, newUnit),
    });
    setFormBuilding({
      width: toDisplay(cmBldgW, newUnit),
      depth: toDisplay(cmBldgD, newUnit),
      offsetX: toDisplay(cmOffX, newUnit),
      offsetY: toDisplay(cmOffY, newUnit),
    });
    setPlotUnit(newUnit);
  };

  // Computed values
  const plotAreaM2 = useMemo(() => {
    const w = fromDisplay(formPlot.width, plotUnit);
    const d = fromDisplay(formPlot.depth, plotUnit);
    return (w * d) / 10000;
  }, [formPlot, plotUnit]);

  const buildingAreaM2 = useMemo(() => {
    const w = fromDisplay(formBuilding.width, plotUnit);
    const d = fromDisplay(formBuilding.depth, plotUnit);
    return (w * d) / 10000;
  }, [formBuilding, plotUnit]);

  const kdb = useMemo(() => {
    if (plotAreaM2 === 0) return 0;
    return (buildingAreaM2 / plotAreaM2) * 100;
  }, [buildingAreaM2, plotAreaM2]);

  const warnings = useMemo(() => {
    const list = [];
    const w = fromDisplay(formBuilding.width, plotUnit);
    const d = fromDisplay(formBuilding.depth, plotUnit);
    const pw = fromDisplay(formPlot.width, plotUnit);
    const pd = fromDisplay(formPlot.depth, plotUnit);
    const offX = fromDisplay(formBuilding.offsetX, plotUnit);
    const offY = fromDisplay(formBuilding.offsetY, plotUnit);

    if (w + offX > pw) list.push('Bangunan melebihi batas tanah (sumbu X)');
    if (d + offY > pd) list.push('Bangunan melebihi batas tanah (sumbu Y)');
    if (kdb > 100) list.push(`KDB ${kdb.toFixed(1)}% > 100%`);
    if (kdb > 60) list.push(`KDB ${kdb.toFixed(1)}% — perhatikan regulasi setempat`);
    if (w <= 0 || d <= 0) list.push('Ukuran bangunan tidak valid');
    if (pw <= 0 || pd <= 0) list.push('Ukuran tanah tidak valid');
    return list;
  }, [formPlot, formBuilding, plotUnit, kdb]);

  if (!isPlotModalOpen) return null;

  const stepVal = plotUnit === 'm' ? '0.01' : '1';
  const u = plotUnit;

  // ============= THE FIX: Apply button properly closes modal =============
  const handleApply = () => {
    // Convert form values back to cm
    const finalPlot = {
      width: Math.max(100, fromDisplay(parseFloat(formPlot.width) || 0, u)),
      depth: Math.max(100, fromDisplay(parseFloat(formPlot.depth) || 0, u)),
    };
    const finalBuilding = {
      width: Math.max(100, fromDisplay(parseFloat(formBuilding.width) || 0, u)),
      depth: Math.max(100, fromDisplay(parseFloat(formBuilding.depth) || 0, u)),
      offsetX: Math.max(0, fromDisplay(parseFloat(formBuilding.offsetX) || 0, u)),
      offsetY: Math.max(0, fromDisplay(parseFloat(formBuilding.offsetY) || 0, u)),
    };

    // This will commit to history, set state, AND close the modal
    applyPlotSettings({ plot: finalPlot, building: finalBuilding });
  };

  const handleCancel = () => {
    closePlotModal();
  };

  // Close on Escape
  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      handleCancel();
    } else if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      handleApply();
    }
  };

  return (
    <div
      className="modal-overlay fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4"
      onMouseDown={(e) => {
        // Click outside to close
        if (e.target === e.currentTarget) handleCancel();
      }}
      onKeyDown={handleKeyDown}
      tabIndex={-1}
    >
      <div className="modal-content bg-white dark:bg-slate-800 rounded-xl shadow-2xl w-full max-w-xl max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700 sticky top-0 bg-white dark:bg-slate-800 z-10">
          <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <Ruler className="text-amber-500" size={20} />
            Ukuran Tanah & Bangunan
          </h2>
          <button
            onClick={handleCancel}
            className="text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:bg-slate-700 p-1 rounded transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-4 space-y-4">
          {/* Unit toggle */}
          <div className="p-2.5 bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-200 dark:border-indigo-800 rounded-lg flex items-center justify-between">
            <span className="text-xs font-medium text-indigo-800">Satuan input:</span>
            <div className="flex items-center bg-white dark:bg-slate-800 rounded-md p-0.5 shadow-sm">
              <button
                type="button"
                className={`px-3 py-1 rounded text-xs font-semibold transition-all ${
                  plotUnit === 'cm'
                    ? 'bg-indigo-600 text-white shadow'
                    : 'text-indigo-700 hover:bg-indigo-50 dark:bg-indigo-900/30'
                }`}
                onClick={() => handleSetPlotUnit('cm')}
              >
                CM
              </button>
              <button
                type="button"
                className={`px-3 py-1 rounded text-xs font-semibold transition-all ${
                  plotUnit === 'm'
                    ? 'bg-indigo-600 text-white shadow'
                    : 'text-indigo-700 hover:bg-indigo-50 dark:bg-indigo-900/30'
                }`}
                onClick={() => handleSetPlotUnit('m')}
              >
                M
              </button>
            </div>
          </div>

          {/* Plot (Land) section */}
          <div className="bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 rounded-lg p-3">
            <h3 className="text-sm font-semibold text-green-800 mb-2 flex items-center gap-1.5">
              🌳 Ukuran Tanah
            </h3>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs text-slate-600 dark:text-slate-300 flex items-center justify-between">
                  <span>Lebar (X)</span>
                  <span className="unit-badge">{u}</span>
                </label>
                <input
                  type="number"
                  className="prop-input mt-1"
                  step={stepVal}
                  min="1"
                  value={formPlot.width}
                  onChange={(e) => setFormPlot({ ...formPlot, width: parseFloat(e.target.value) || 0 })}
                />
              </div>
              <div>
                <label className="text-xs text-slate-600 dark:text-slate-300 flex items-center justify-between">
                  <span>Panjang (Y)</span>
                  <span className="unit-badge">{u}</span>
                </label>
                <input
                  type="number"
                  className="prop-input mt-1"
                  step={stepVal}
                  min="1"
                  value={formPlot.depth}
                  onChange={(e) => setFormPlot({ ...formPlot, depth: parseFloat(e.target.value) || 0 })}
                />
              </div>
            </div>
            <p className="text-xs text-green-700 mt-2">
              Luas: <strong>{plotAreaM2.toFixed(2)} m²</strong>
            </p>
          </div>

          {/* Building section */}
          <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
            <h3 className="text-sm font-semibold text-blue-800 mb-2 flex items-center gap-1.5">
              🏠 Ukuran Bangunan (Footprint)
            </h3>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs text-slate-600 dark:text-slate-300 flex items-center justify-between">
                  <span>Lebar (X)</span>
                  <span className="unit-badge">{u}</span>
                </label>
                <input
                  type="number"
                  className="prop-input mt-1"
                  step={stepVal}
                  min="1"
                  value={formBuilding.width}
                  onChange={(e) =>
                    setFormBuilding({ ...formBuilding, width: parseFloat(e.target.value) || 0 })
                  }
                />
              </div>
              <div>
                <label className="text-xs text-slate-600 dark:text-slate-300 flex items-center justify-between">
                  <span>Panjang (Y)</span>
                  <span className="unit-badge">{u}</span>
                </label>
                <input
                  type="number"
                  className="prop-input mt-1"
                  step={stepVal}
                  min="1"
                  value={formBuilding.depth}
                  onChange={(e) =>
                    setFormBuilding({ ...formBuilding, depth: parseFloat(e.target.value) || 0 })
                  }
                />
              </div>
            </div>
            <p className="text-xs text-blue-700 mt-2">
              Luas per lantai: <strong>{buildingAreaM2.toFixed(2)} m²</strong> · KDB:{' '}
              <strong>{kdb.toFixed(1)}%</strong>
            </p>
          </div>

          {/* Building offset */}
          <div className="bg-amber-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-800 rounded-lg p-3">
            <h3 className="text-sm font-semibold text-amber-800 mb-2 flex items-center gap-1.5">
              ↔️ Offset Bangunan (Posisi)
            </h3>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs text-slate-600 dark:text-slate-300 flex items-center justify-between">
                  <span>Offset X (kiri)</span>
                  <span className="unit-badge">{u}</span>
                </label>
                <input
                  type="number"
                  className="prop-input mt-1"
                  step={stepVal}
                  min="0"
                  value={formBuilding.offsetX}
                  onChange={(e) =>
                    setFormBuilding({ ...formBuilding, offsetX: parseFloat(e.target.value) || 0 })
                  }
                />
              </div>
              <div>
                <label className="text-xs text-slate-600 dark:text-slate-300 flex items-center justify-between">
                  <span>Offset Y (depan)</span>
                  <span className="unit-badge">{u}</span>
                </label>
                <input
                  type="number"
                  className="prop-input mt-1"
                  step={stepVal}
                  min="0"
                  value={formBuilding.offsetY}
                  onChange={(e) =>
                    setFormBuilding({ ...formBuilding, offsetY: parseFloat(e.target.value) || 0 })
                  }
                />
              </div>
            </div>
            <p className="text-xs text-amber-700 mt-2">
              Jarak bangunan dari sudut kiri-depan tanah
            </p>
          </div>

          {/* Warnings */}
          {warnings.length > 0 && (
            <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg p-3">
              <h3 className="text-sm font-semibold text-red-800 mb-1.5 flex items-center gap-1.5">
                <AlertTriangle size={14} />
                Peringatan ({warnings.length})
              </h3>
              <ul className="text-xs text-red-700 space-y-1 list-disc list-inside">
                {warnings.map((w, i) => (
                  <li key={i}>{w}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Info box */}
          <div className="bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-700 rounded-lg p-3">
            <h3 className="text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1.5">💡 Tips</h3>
            <ul className="text-xs text-slate-600 dark:text-slate-300 space-y-1 list-disc list-inside">
              <li>KDB (Koefisien Daerah Bangunan) = luas bangunan ÷ luas tanah x 100%</li>
              <li>Maksimal KDB umumnya 60-80% tergantung zonasi</li>
              <li>Esc untuk batal · Ctrl+Enter untuk terapkan</li>
            </ul>
          </div>
        </div>

        {/* Footer with action buttons */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-700 flex justify-end gap-2 sticky bottom-0 bg-white dark:bg-slate-800">
          <button
            type="button"
            onClick={handleCancel}
            className="px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-md text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:bg-slate-700/50 transition-colors"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={handleApply}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md text-sm font-medium flex items-center gap-1.5 transition-colors shadow-sm"
          >
            <Check size={14} />
            Terapkan
          </button>
        </div>
      </div>
    </div>
  );
}
