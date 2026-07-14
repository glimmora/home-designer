import React from 'react';
import { useStore } from '../lib/store';
import { generateBOM } from '../lib/advancedEngineering';
import { formatCurrency } from '../lib/costCalculator';
import { X, Package, ClipboardList, Download } from 'lucide-react';

export default function BOMModal() {
  const {
    isBOMModalOpen,
    closeBOMModal,
    floors,
    plot,
    building,
    structuralSettings,
    costSettings,
  } = useStore();

  const bom = React.useMemo(() => {
    if (!isBOMModalOpen) return null;
    try {
      return generateBOM({ floors, plot, building, structuralSettings, costSettings });
    } catch (e) {
      console.error('BOM error:', e);
      return null;
    }
  }, [floors, plot, building, structuralSettings, costSettings, isBOMModalOpen]);

  if (!isBOMModalOpen || !bom) return null;

  const handleExportCSV = () => {
    const rows = [['Kategori', 'Item', 'Spesifikasi', 'Satuan', 'Jumlah', 'Harga Satuan', 'Total']];
    bom.items.forEach(item => {
      rows.push([item.category, item.item, item.spec, item.unit, item.quantity, item.unitPrice, item.total]);
    });
    rows.push(['', '', '', '', '', 'TOTAL', bom.totalCost]);
    const csv = rows.map(r => r.map(c => `"${c}"`).join(',')).join('\n');
    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `BOM-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 100);
  };

  const categoryIcons = {
    'Struktur': '🏗️',
    'Dinding': '🧱',
    'Material': '📦',
    'Finishing': '🎨',
    'Pintu & Jendela': '🚪',
    'Atap': '🏠',
    'Instalasi': '⚡',
  };

  return (
    <div
      className="modal-overlay fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-2 sm:p-4"
      onMouseDown={(e) => e.target === e.currentTarget && closeBOMModal()}
    >
      <div className="modal-content bg-white dark:bg-slate-800 dark:text-slate-100 rounded-xl shadow-2xl w-full max-w-3xl max-h-[92vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700 bg-gradient-to-r from-amber-500 to-orange-600 text-white">
          <h2 className="text-lg font-bold flex items-center gap-2">
            <ClipboardList size={20} />
            Bill of Materials (BOM)
          </h2>
          <div className="flex items-center gap-2">
            <button
              onClick={handleExportCSV}
              className="px-3 py-1.5 bg-white/20 hover:bg-white/30 rounded-md text-xs font-medium flex items-center gap-1"
            >
              <Download size={13} />
              Export CSV
            </button>
            <button
              onClick={closeBOMModal}
              className="text-white/70 hover:text-white p-1.5 rounded hover:bg-white/10"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Total cost summary */}
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-semibold">Total Biaya</div>
                <div className="text-xl font-bold text-amber-700 dark:text-amber-400">{bom.totalCostFormatted}</div>
              </div>
              <div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-semibold">Per m²</div>
                <div className="text-xl font-bold text-amber-700 dark:text-amber-400">
                  Rp {bom.costPerM2.toLocaleString('id-ID')}
                </div>
              </div>
              <div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-semibold">Volume Beton</div>
                <div className="text-xl font-bold text-slate-700 dark:text-slate-300">
                  {bom.summary.concreteVolume_m3} m³
                </div>
              </div>
              <div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-semibold">Besi Beton</div>
                <div className="text-xl font-bold text-slate-700 dark:text-slate-300">
                  {bom.summary.rebarWeight_kg} kg
                </div>
              </div>
            </div>
          </div>

          {/* Summary stats */}
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
            <div className="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-2 text-center">
              <div className="text-base font-bold text-indigo-600 dark:text-indigo-400">{bom.summary.wallArea_m2}</div>
              <div className="text-[9px] text-slate-400">Dinding (m²)</div>
            </div>
            <div className="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-2 text-center">
              <div className="text-base font-bold text-indigo-600 dark:text-indigo-400">{bom.summary.floorArea_m2}</div>
              <div className="text-[9px] text-slate-400">Lantai (m²)</div>
            </div>
            <div className="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-2 text-center">
              <div className="text-base font-bold text-indigo-600 dark:text-indigo-400">{bom.summary.doors}</div>
              <div className="text-[9px] text-slate-400">Pintu</div>
            </div>
            <div className="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-2 text-center">
              <div className="text-base font-bold text-indigo-600 dark:text-indigo-400">{bom.summary.windows}</div>
              <div className="text-[9px] text-slate-400">Jendela</div>
            </div>
          </div>

          {/* BOM Table by Category */}
          {Object.entries(bom.grouped).map(([category, items]) => (
            <div key={category} className="border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden">
              <div className="bg-slate-100 dark:bg-slate-700 px-3 py-2 font-semibold text-sm flex items-center gap-1.5">
                <span>{categoryIcons[category] || '📦'}</span>
                {category}
                <span className="ml-auto text-xs text-slate-400">
                  {items.length} item
                </span>
              </div>
              <table className="w-full text-xs">
                <thead className="bg-slate-50 dark:bg-slate-700/50">
                  <tr>
                    <th className="text-left p-2 font-medium text-slate-600 dark:text-slate-300">Item</th>
                    <th className="text-left p-2 font-medium text-slate-600 dark:text-slate-300 hidden sm:table-cell">Spec</th>
                    <th className="text-right p-2 font-medium text-slate-600 dark:text-slate-300">Qty</th>
                    <th className="text-right p-2 font-medium text-slate-600 dark:text-slate-300 hidden sm:table-cell">Harga</th>
                    <th className="text-right p-2 font-medium text-slate-600 dark:text-slate-300">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item, i) => (
                    <tr key={i} className="border-t border-slate-100 dark:border-slate-700">
                      <td className="p-2 text-slate-700 dark:text-slate-200 font-medium">{item.item}</td>
                      <td className="p-2 text-slate-500 dark:text-slate-400 hidden sm:table-cell">{item.spec}</td>
                      <td className="p-2 text-right text-slate-600 dark:text-slate-300">
                        {item.quantity} <span className="text-slate-400">{item.unit}</span>
                      </td>
                      <td className="p-2 text-right text-slate-500 dark:text-slate-400 hidden sm:table-cell">
                        Rp {item.unitPrice.toLocaleString('id-ID')}
                      </td>
                      <td className="p-2 text-right font-semibold text-slate-700 dark:text-slate-200">
                        Rp {item.total.toLocaleString('id-ID')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}

          {/* Grand total */}
          <div className="bg-slate-800 dark:bg-slate-900 text-white rounded-lg p-3 flex items-center justify-between">
            <span className="font-bold text-sm">TOTAL KESELURUHAN</span>
            <span className="font-bold text-xl">{bom.totalCostFormatted}</span>
          </div>

          {/* Disclaimer */}
          <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-3">
            <p className="text-[11px] text-amber-700 dark:text-amber-300">
              ⚠️ Estimasi BOM berdasarkan perhitungan volume dari desain. Harga estimasi pasar Indonesia 2024.
              Selalu konfirmasi dengan kontraktor/supplier untuk RAB yang akurat.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-700 flex justify-end">
          <button
            onClick={closeBOMModal}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md text-sm font-medium"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
}
