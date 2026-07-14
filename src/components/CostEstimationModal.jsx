import React, { useMemo, useState } from 'react';
import { useStore } from '../lib/store';
import { calculateCost, formatCurrency, formatNumber } from '../lib/costCalculator';
import { Calculator, X, Save, TrendingUp, Building2, Layers, Paintbrush, Boxes, Archive } from 'lucide-react';

export default function CostEstimationModal() {
  const {
    isCostModalOpen,
    floors,
    plot,
    building,
    costSettings,
    setCostSettings,
    closeCostModal,
  } = useStore();

  const [localCost, setLocalCost] = useState(costSettings);

  React.useEffect(() => {
    if (isCostModalOpen) setLocalCost(costSettings);
  }, [isCostModalOpen, costSettings]);

  const breakdown = useMemo(
    () => calculateCost({ floors, plot, building, costSettings: localCost }),
    [floors, plot, building, localCost]
  );

  if (!isCostModalOpen) return null;

  const handleSave = () => {
    setCostSettings(localCost);
    closeCostModal();
  };

  const costRows = [
    { key: 'walls', label: 'Dinding', icon: Building2, area: breakdown.totals.wallArea, unit: 'm²', rate: localCost.wallPerM2, cost: breakdown.costs.walls, color: 'blue' },
    { key: 'floors', label: 'Lantai (Slab)', icon: Layers, area: breakdown.totals.floorArea, unit: 'm²', rate: localCost.floorPerM2, cost: breakdown.costs.floors, color: 'green' },
    { key: 'columns', label: 'Kolom', icon: Boxes, area: breakdown.totals.columnVolume, unit: 'm³', rate: localCost.columnPerM3, cost: breakdown.costs.columns, color: 'red' },
    { key: 'paint', label: 'Cat', icon: Paintbrush, area: breakdown.totals.paintArea, unit: 'm²', rate: localCost.paintPerM2, cost: breakdown.costs.paint, color: 'purple' },
    { key: 'foundation', label: 'Pondasi', icon: Archive, area: breakdown.totals.foundationArea, unit: 'm²', rate: localCost.foundationPerM2, cost: breakdown.costs.foundation, color: 'amber' },
  ];

  const colorClasses = {
    blue: 'bg-blue-50 dark:bg-blue-900/30 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300',
    green: 'bg-green-50 dark:bg-green-900/30 border-green-200 dark:border-green-800 text-green-700 dark:text-green-300',
    red: 'bg-red-50 dark:bg-red-900/30 border-red-200 dark:border-red-800 text-red-700 dark:text-red-300',
    purple: 'bg-purple-50 dark:bg-purple-900/30 border-purple-200 dark:border-purple-800 text-purple-700 dark:text-purple-300',
    amber: 'bg-amber-50 dark:bg-amber-900/30 border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-300',
  };

  return (
    <div
      className="modal-overlay fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4"
      onMouseDown={(e) => e.target === e.currentTarget && closeCostModal()}
    >
      <div className="modal-content bg-white dark:bg-slate-800 dark:text-slate-100 rounded-xl shadow-2xl w-full max-w-4xl max-h-[92vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700 sticky top-0 bg-white dark:bg-slate-800 z-10">
          <h2 className="text-lg font-bold flex items-center gap-2">
            <Calculator className="text-emerald-600" size={20} />
            Estimasi Biaya Material
          </h2>
          <button
            onClick={closeCostModal}
            className="text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700 p-1 rounded"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-4 space-y-4">
          {/* Grand total card */}
          <div className="bg-gradient-to-r from-emerald-500 to-emerald-700 text-white rounded-xl p-5 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-emerald-100 text-sm font-medium mb-1 flex items-center gap-1.5">
                  <TrendingUp size={14} />
                  Total Estimasi Biaya Konstruksi
                </div>
                <div className="text-3xl font-bold">
                  {formatCurrency(breakdown.grandTotal, localCost.currency)}
                </div>
                <div className="text-emerald-100 text-xs mt-1">
                  {floors.length} lantai · {(building.width * building.depth / 10000).toFixed(2)} m²/lantai · {(plot.width * plot.depth / 10000).toFixed(2)} m² tanah
                </div>
              </div>
              <div className="text-right">
                <div className="text-emerald-100 text-xs">Per m² bangunan</div>
                <div className="text-xl font-semibold">
                  {formatCurrency(breakdown.grandTotal / (breakdown.totals.floorArea || 1), localCost.currency)}
                </div>
              </div>
            </div>
          </div>

          {/* Cost breakdown table */}
          <div>
            <h3 className="font-semibold text-slate-800 dark:text-slate-100 mb-2">
              Rincian Biaya per Komponen
            </h3>
            <div className="space-y-2">
              {costRows.map((row) => {
                const Icon = row.icon;
                return (
                  <div
                    key={row.key}
                    className={`border rounded-lg p-3 ${colorClasses[row.color]}`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Icon size={18} />
                        <div>
                          <div className="font-semibold text-sm">{row.label}</div>
                          <div className="text-xs opacity-80">
                            {formatNumber(row.area, row.unit)} x {formatCurrency(row.rate, localCost.currency)}/{row.unit}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-base">
                          {formatCurrency(row.cost, localCost.currency)}
                        </div>
                        <div className="text-xs opacity-80">
                          {((row.cost / breakdown.grandTotal) * 100).toFixed(1)}% dari total
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Per-floor breakdown */}
          <div>
            <h3 className="font-semibold text-slate-800 dark:text-slate-100 mb-2">
              Rincian per Lantai
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-xs border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden">
                <thead className="bg-slate-100 dark:bg-slate-700">
                  <tr>
                    <th className="text-left p-2 font-semibold">Lantai</th>
                    <th className="text-right p-2 font-semibold">Panjang Dinding</th>
                    <th className="text-right p-2 font-semibold">Luas Dinding</th>
                    <th className="text-right p-2 font-semibold">Jml Kolom</th>
                    <th className="text-right p-2 font-semibold">Vol. Kolom</th>
                    <th className="text-right p-2 font-semibold">Luas Cat</th>
                    <th className="text-right p-2 font-semibold">Jml Item</th>
                  </tr>
                </thead>
                <tbody>
                  {breakdown.floors.map((f, i) => (
                    <tr key={i} className="border-t border-slate-200 dark:border-slate-700">
                      <td className="p-2 font-medium">{f.name}</td>
                      <td className="p-2 text-right">{formatNumber(f.wallLength, 'cm', 0)}</td>
                      <td className="p-2 text-right">{formatNumber(f.wallArea, 'm²')}</td>
                      <td className="p-2 text-right">{f.columnCount}</td>
                      <td className="p-2 text-right">{formatNumber(f.columnVolume, 'm³', 3)}</td>
                      <td className="p-2 text-right">{formatNumber(f.paintArea, 'm²')}</td>
                      <td className="p-2 text-right">{f.itemCount}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-slate-50 dark:bg-slate-700/50 font-semibold">
                  <tr className="border-t-2 border-slate-300 dark:border-slate-600">
                    <td className="p-2">TOTAL</td>
                    <td className="p-2 text-right">—</td>
                    <td className="p-2 text-right">{formatNumber(breakdown.totals.wallArea, 'm²')}</td>
                    <td className="p-2 text-right">{breakdown.floors.reduce((a, b) => a + b.columnCount, 0)}</td>
                    <td className="p-2 text-right">{formatNumber(breakdown.totals.columnVolume, 'm³', 3)}</td>
                    <td className="p-2 text-right">{formatNumber(breakdown.totals.paintArea, 'm²')}</td>
                    <td className="p-2 text-right">{breakdown.floors.reduce((a, b) => a + b.itemCount, 0)}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          {/* Cost rate settings */}
          <div>
            <h3 className="font-semibold text-slate-800 dark:text-slate-100 mb-2">
              Pengaturan Harga Satuan (Rate)
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <RateField
                label="Dinding per m²"
                value={localCost.wallPerM2}
                onChange={(v) => setLocalCost({ ...localCost, wallPerM2: v })}
              />
              <RateField
                label="Lantai per m²"
                value={localCost.floorPerM2}
                onChange={(v) => setLocalCost({ ...localCost, floorPerM2: v })}
              />
              <RateField
                label="Kolom per m³"
                value={localCost.columnPerM3}
                onChange={(v) => setLocalCost({ ...localCost, columnPerM3: v })}
              />
              <RateField
                label="Cat per m²"
                value={localCost.paintPerM2}
                onChange={(v) => setLocalCost({ ...localCost, paintPerM2: v })}
              />
              <RateField
                label="Pondasi per m²"
                value={localCost.foundationPerM2}
                onChange={(v) => setLocalCost({ ...localCost, foundationPerM2: v })}
              />
              <div>
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1 block">
                  Mata Uang
                </label>
                <select
                  className="prop-input"
                  value={localCost.currency}
                  onChange={(e) => setLocalCost({ ...localCost, currency: e.target.value })}
                >
                  <option value="IDR">IDR (Rp)</option>
                  <option value="USD">USD ($)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Disclaimer */}
          <div className="bg-amber-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-800 rounded-lg p-3">
            <p className="text-xs text-amber-800 dark:text-amber-300">
              ⚠️ <strong>Disclaimer:</strong> Estimasi ini bersifat indikatif berdasarkan volume
              material yang dihitung dari desain. Biaya aktual dapat bervariasi tergantung lokasi,
              kualitas material, upah pekerja, kondisi tanah, dan biaya lainnya (perizinan, listrik,
              plumbing, dll). Selalu konsultasikan dengan kontraktor untuk RAB yang akurat.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-700 flex justify-end gap-2 sticky bottom-0 bg-white dark:bg-slate-800">
          <button
            type="button"
            onClick={closeCostModal}
            className="px-4 py-2 border border-slate-300 dark:border-slate-600 dark:text-slate-200 rounded-md text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-700"
          >
            Tutup
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md text-sm font-medium flex items-center gap-1.5"
          >
            <Save size={14} />
            Simpan Rate
          </button>
        </div>
      </div>
    </div>
  );
}

function RateField({ label, value, onChange }) {
  return (
    <div>
      <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1 block">
        {label}
      </label>
      <input
        type="number"
        className="prop-input"
        value={value}
        min="0"
        step="1000"
        onChange={(e) => onChange(Number(e.target.value) || 0)}
      />
    </div>
  );
}
