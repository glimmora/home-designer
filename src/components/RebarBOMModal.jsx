import React, { useState, useMemo } from 'react';
import { useStore } from '../lib/store';
import { calculateFullRebarBOM, formatIDR } from '../lib/rebarBOM';
import { X, Package, Layers, AlertTriangle, FileDown, Check } from 'lucide-react';

export default function RebarBOMModal() {
  const {
    isRebarBOMOpen,
    closeRebarBOM,
    floors,
    building,
    plot,
    structuralSettings,
    foundationConfig,
    roofConfig,
  } = useStore();

  const [activeView, setActiveView] = useState('byElement'); // 'byElement' | 'byDiameter'

  const bom = useMemo(() => {
    if (!isRebarBOMOpen) return null;
    return calculateFullRebarBOM({
      floors: floors || [],
      building: building || { width: 600, depth: 800 },
      plot: plot || { width: 1200, depth: 1500 },
      structuralSettings: structuralSettings || {},
      roofConfig: roofConfig || null,
      foundationConfig: foundationConfig || { type: 'strip-footing' },
    });
  }, [floors, building, plot, structuralSettings, roofConfig, foundationConfig, isRebarBOMOpen]);

  if (!isRebarBOMOpen || !bom) return null;

  // Group items by element key
  const grouped = {};
  (bom.items || []).forEach(item => {
    if (!grouped[item.elementKey]) grouped[item.elementKey] = { label: getElementLabel(item.elementKey), items: [], subtotal_kg: 0 };
    grouped[item.elementKey].items.push(item);
    grouped[item.elementKey].subtotal_kg += parseFloat(item.weight_kg);
  });

  return (
    <div
      className="modal-overlay fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-2 sm:p-4"
      onMouseDown={(e) => e.target === e.currentTarget && closeRebarBOM()}
    >
      <div className="modal-content bg-white dark:bg-slate-800 dark:text-slate-100 rounded-xl shadow-2xl w-full max-w-5xl max-h-[94vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700 bg-gradient-to-r from-indigo-600 to-violet-700 text-white">
          <h2 className="text-lg font-bold flex items-center gap-2">
            <Package size={20} />
            BOM Besi Beton — Pondasi → Atap
          </h2>
          <button onClick={closeRebarBOM} className="text-white/70 hover:text-white p-1.5 rounded hover:bg-white/10">
            <X size={20} />
          </button>
        </div>

        {/* View toggle */}
        <div className="flex border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-700/50">
          <button onClick={() => setActiveView('byElement')}
            className={`px-4 py-2.5 text-sm font-medium flex items-center gap-1.5 border-b-2 ${activeView === 'byElement' ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400' : 'border-transparent text-slate-500'}`}>
            <Layers size={14} /> Per Elemen
          </button>
          <button onClick={() => setActiveView('byDiameter')}
            className={`px-4 py-2.5 text-sm font-medium flex items-center gap-1.5 border-b-2 ${activeView === 'byDiameter' ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400' : 'border-transparent text-slate-500'}`}>
            <Package size={14} /> Per Diameter
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* SUMMARY CARDS */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <SummaryCard label="Total Berat Besi" value={`${bom.totals.totalWeight_kg} kg`} color="indigo" />
            <SummaryCard label="Total Biaya Besi" value={formatIDR(bom.totals.totalCost_IDR)} color="emerald" />
            <SummaryCard label="Total Volume Beton" value={`${bom.totals.totalConcrete_m3} m³`} color="amber" />
            <SummaryCard label="Jumlah Item Besi" value={`${bom.totals.numRebarItems} item`} color="rose" />
          </div>

          {/* CONCRETE VOLUME BREAKDOWN */}
          <div className="bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-700 rounded-lg p-3">
            <div className="text-xs font-semibold mb-2">VOLUME BETON PER ELEMEN</div>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-2 text-xs">
              <VolCard label="Pondasi" vol={bom.totals.foundationVol_m3} unit="m³" />
              <VolCard label="Sloof" vol={bom.totals.sloofVol_m3} unit="m³" />
              <VolCard label="Kolom" vol={bom.totals.columnVol_m3} unit="m³" />
              <VolCard label="Balok" vol={bom.totals.beamVol_m3} unit="m³" />
              <VolCard label="Ring Balok" vol={bom.totals.ringBeamVol_m3} unit="m³" />
            </div>
          </div>

          {/* BY ELEMENT VIEW */}
          {activeView === 'byElement' && (
            <div className="space-y-3">
              {Object.entries(grouped).map(([key, group]) => (
                <div key={key} className="border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden">
                  <div className="bg-slate-100 dark:bg-slate-700 px-3 py-2 flex items-center justify-between">
                    <div className="font-semibold text-sm flex items-center gap-2">
                      <span className="text-indigo-600 dark:text-indigo-400">{getElementIcon(key)}</span>
                      {group.label}
                    </div>
                    <div className="text-xs">
                      <span className="text-slate-500">Subtotal:</span>
                      <span className="font-bold ml-1">{group.subtotal_kg.toFixed(2)} kg</span>
                    </div>
                  </div>
                  <table className="w-full text-xs">
                    <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500">
                      <tr>
                        <th className="text-left p-2">Elemen</th>
                        <th className="text-left p-2">Lokasi/Penempatan</th>
                        <th className="text-center p-2">Diameter</th>
                        <th className="text-center p-2">Jumlah</th>
                        <th className="text-right p-2">Panjang/Batang</th>
                        <th className="text-right p-2">Total Panjang</th>
                        <th className="text-right p-2">Berat (kg)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                      {group.items.map((item, i) => (
                        <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-700/30">
                          <td className="p-2 font-medium">{item.element}</td>
                          <td className="p-2 text-slate-500">{item.location}</td>
                          <td className="p-2 text-center">
                            <span className="inline-block px-1.5 py-0.5 bg-slate-100 dark:bg-slate-700 rounded font-mono font-bold">
                              D{item.dia}
                            </span>
                          </td>
                          <td className="p-2 text-center">{item.count}</td>
                          <td className="p-2 text-right">{item.lengthPerUnit_m} m</td>
                          <td className="p-2 text-right font-semibold">{item.totalLength_m} m</td>
                          <td className="p-2 text-right font-bold text-indigo-600 dark:text-indigo-400">{item.weight_kg}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ))}
            </div>
          )}

          {/* BY DIAMETER VIEW */}
          {activeView === 'byDiameter' && (
            <div className="space-y-3">
              <div className="bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800 rounded-lg p-3">
                <div className="text-sm font-bold mb-2 text-indigo-700 dark:text-indigo-300">REKAPITULASI PER DIAMETER BESI</div>
                <table className="w-full text-xs">
                  <thead className="text-indigo-600 dark:text-indigo-400">
                    <tr>
                      <th className="text-left p-2">Diameter</th>
                      <th className="text-right p-2">Total Batang</th>
                      <th className="text-right p-2">Total Panjang (m)</th>
                      <th className="text-right p-2">Berat (kg)</th>
                      <th className="text-right p-2">% dari Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-indigo-100 dark:divide-indigo-800">
                    {bom.diameterSummary.map(d => {
                      const pct = (parseFloat(d.weight_kg) / parseFloat(bom.totals.totalWeight_kg) * 100).toFixed(1);
                      return (
                        <tr key={d.dia}>
                          <td className="p-2 font-bold">
                            <span className="inline-block px-2 py-0.5 bg-indigo-100 dark:bg-indigo-900 rounded font-mono">D{d.dia}</span>
                          </td>
                          <td className="p-2 text-right">{d.count}</td>
                          <td className="p-2 text-right font-semibold">{d.totalLength_m} m</td>
                          <td className="p-2 text-right font-bold">{d.weight_kg} kg</td>
                          <td className="p-2 text-right">
                            <div className="flex items-center gap-2 justify-end">
                              <div className="w-20 h-2 bg-slate-200 dark:bg-slate-700 rounded overflow-hidden">
                                <div className="h-full bg-indigo-500" style={{ width: `${pct}%` }} />
                              </div>
                              <span>{pct}%</span>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                  <tfoot>
                    <tr className="bg-indigo-100 dark:bg-indigo-900/50 font-bold">
                      <td className="p-2">TOTAL</td>
                      <td className="p-2 text-right">{bom.diameterSummary.reduce((s, d) => s + d.count, 0)}</td>
                      <td className="p-2 text-right">{bom.diameterSummary.reduce((s, d) => s + parseFloat(d.totalLength_m), 0).toFixed(2)} m</td>
                      <td className="p-2 text-right">{bom.totals.totalWeight_kg} kg</td>
                      <td className="p-2 text-right">100%</td>
                    </tr>
                  </tfoot>
                </table>
              </div>

              {/* Diameter buying guide */}
              <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-3">
                <div className="text-xs font-semibold text-amber-700 dark:text-amber-300 mb-2">PANDUAN PEMBELIAN BESI PER DIAMETER</div>
                <div className="space-y-2 text-xs">
                  {bom.diameterSummary.map(d => {
                    // Standard batang: 12m
                    const batangStandar = Math.ceil(parseFloat(d.totalLength_m) / 12);
                    const rebarProps = getRebarInfo(d.dia);
                    return (
                      <div key={d.dia} className="flex items-center justify-between border-b border-amber-200 dark:border-amber-800 pb-1">
                        <div>
                          <span className="font-bold">D{d.dia}</span>
                          <span className="text-slate-500 ml-2">({rebarProps?.name}) - {rebarProps?.weight} kg/m</span>
                        </div>
                        <div className="text-right">
                          <span className="font-bold text-amber-700 dark:text-amber-400">Beli {batangStandar} batang x 12m</span>
                          <span className="text-slate-500 ml-2">({d.weight_kg} kg)</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* ELEMENT SUMMARY (compact) */}
          <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-lg p-3">
            <div className="text-sm font-bold mb-2 text-emerald-700 dark:text-emerald-300">REKAP BERAT PER ELEMEN STRUKTUR</div>
            <div className="grid grid-cols-2 md:grid-cols-6 gap-2 text-xs">
              {bom.elementSummary.map(e => (
                <div key={e.elementKey} className="bg-white dark:bg-slate-800 rounded p-2 text-center">
                  <div className="text-xl mb-1">{getElementIcon(e.elementKey)}</div>
                  <div className="text-[10px] text-slate-500">{getElementLabel(e.elementKey)}</div>
                  <div className="font-bold text-emerald-700 dark:text-emerald-400">{e.weight_kg} kg</div>
                </div>
              ))}
            </div>
          </div>

          {/* SNI standards */}
          <div className="text-[10px] text-slate-400 text-center">
            Acuan SNI: {bom.sniStandards.join(' · ')}
            <br />Perhitungan ini adalah estimasi awal. Untuk konstruksi aktual, konsultasi dengan ahli struktur (SKK Mekanika).
          </div>
        </div>

        <div className="p-4 border-t border-slate-200 dark:border-slate-700 flex justify-between items-center">
          <div className="text-xs text-slate-500">
            <Check size={12} className="inline" /> Estimasi {bom.totals.numRebarItems} item besi, total {bom.totals.totalWeight_kg} kg ({formatIDR(bom.totals.totalCost_IDR)})
          </div>
          <button onClick={closeRebarBOM} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md text-sm font-medium">
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
}

function getElementLabel(key) {
  const labels = {
    'foundation': 'Pondasi',
    'sloof': 'Sloof',
    'column': 'Kolom',
    'beam': 'Balok Lantai',
    'ring-beam': 'Ring Balok Atas',
    'roof': 'Atap',
  };
  return labels[key] || key;
}

function getElementIcon(key) {
  const icons = {
    'foundation': '🪨',
    'sloof': '🟫',
    'column': '🏛️',
    'beam': '📐',
    'ring-beam': '⭕',
    'roof': '🔺',
  };
  return icons[key] || '📦';
}

function getRebarInfo(dia) {
  const map = {
    4: { name: 'D4 (4mm) - Wire mesh', weight: 0.099 },
    6: { name: 'D6 (6mm) - Sengkang kecil', weight: 0.222 },
    8: { name: 'D8 (8mm) - Sengkang standar', weight: 0.395 },
    10: { name: 'D10 (10mm) - Ring balok/sengkang besar', weight: 0.617 },
    13: { name: 'D13 (13mm) - Tulangan utama kecil', weight: 1.040 },
    16: { name: 'D16 (16mm) - Tulangan utama', weight: 1.580 },
    19: { name: 'D19 (19mm) - Tulangan utama besar', weight: 2.230 },
    22: { name: 'D22 (22mm) - Kolom besar', weight: 2.980 },
    25: { name: 'D25 (25mm) - Kolom utama', weight: 3.850 },
  };
  return map[dia] || null;
}

function SummaryCard({ label, value, color }) {
  const colorClasses = {
    indigo: 'bg-indigo-50 dark:bg-indigo-900/20 border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-400',
    emerald: 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400',
    amber: 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-400',
    rose: 'bg-rose-50 dark:bg-rose-900/20 border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-400',
  };
  return (
    <div className={`border rounded-lg p-3 ${colorClasses[color]}`}>
      <div className="text-[10px] font-semibold uppercase">{label}</div>
      <div className="text-lg font-bold mt-1">{value}</div>
    </div>
  );
}

function VolCard({ label, vol, unit }) {
  return (
    <div className="bg-white dark:bg-slate-800 rounded p-2 text-center">
      <div className="text-[10px] text-slate-500">{label}</div>
      <div className="font-bold text-sm">{vol} <span className="text-[10px] font-normal">{unit}</span></div>
    </div>
  );
}
