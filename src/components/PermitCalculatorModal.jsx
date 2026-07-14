import React, { useState, useMemo } from 'react';
import { useStore } from '../lib/store';
import { calculatePermit, calculateMaterialQuantity, landUseZones } from '../lib/permitCalculator';
import { X, FileCheck, Check, AlertTriangle, Calculator, Building2, MapPin } from 'lucide-react';

export default function PermitCalculatorModal() {
  const {
    isPermitCalculatorOpen,
    closePermitCalculator,
    plot,
    building,
    floors,
  } = useStore();

  const [zone, setZone] = useState('R-1');
  const [customPlot, setCustomPlot] = useState(false);
  const [manualPlot, setManualPlot] = useState({ area: 120, footprint: 60, totalFloor: 60, green: 30, height: 4, floors: 1, parking: 1, window: 8 });
  const [showMaterialCalc, setShowMaterialCalc] = useState(false);

  // Auto-compute from store
  const plotArea = customPlot ? manualPlot.area : ((plot?.width || 1200) * (plot?.depth || 1500)) / 10000; // m²
  const buildingFootprint = customPlot ? manualPlot.footprint : ((building?.width || 600) * (building?.depth || 800)) / 10000;
  const totalFloorArea = customPlot ? manualPlot.totalFloor : buildingFootprint * (floors?.length || 1);
  const greenArea = customPlot ? manualPlot.green : Math.max(0, plotArea - buildingFootprint) * 0.5;
  const buildingHeight = customPlot ? manualPlot.height : (floors?.reduce((s, f) => s + f.height, 0) || 300) / 100;
  const numFloors = customPlot ? manualPlot.floors : (floors?.length || 1);
  const numParking = customPlot ? manualPlot.parking : 1;
  const windowArea = customPlot ? manualPlot.window : totalFloorArea * 0.1; // assume 10% default

  const result = useMemo(() => {
    if (!isPermitCalculatorOpen) return null;
    return calculatePermit({
      plotArea_m2: plotArea,
      buildingFootprint_m2: buildingFootprint,
      totalFloorArea_m2: totalFloorArea,
      greenArea_m2: greenArea,
      zone,
      buildingHeight_m: buildingHeight,
      numFloors,
      numParkingSlots: numParking,
      windowArea_m2: windowArea,
    });
  }, [plotArea, buildingFootprint, totalFloorArea, greenArea, zone, buildingHeight, numFloors, numParking, windowArea, isPermitCalculatorOpen]);

  // Material calc
  const matResult = useMemo(() => {
    if (!showMaterialCalc || !isPermitCalculatorOpen) return null;
    return calculateMaterialQuantity({
      floorArea_m2: totalFloorArea,
      wallArea_m2: totalFloorArea * 2.5, // estimate wall area
      ceilingArea_m2: totalFloorArea,
      floorType: 'granite-60',
      wallType: 'wall-paint-white',
      ceilingType: 'ceiling-gypsum',
    });
  }, [showMaterialCalc, totalFloorArea, isPermitCalculatorOpen]);

  if (!isPermitCalculatorOpen || !result) return null;

  return (
    <div
      className="modal-overlay fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-2 sm:p-4"
      onMouseDown={(e) => e.target === e.currentTarget && closePermitCalculator()}
    >
      <div className="modal-content bg-white dark:bg-slate-800 dark:text-slate-100 rounded-xl shadow-2xl w-full max-w-4xl max-h-[94vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700 bg-gradient-to-r from-emerald-600 to-teal-700 text-white">
          <h2 className="text-lg font-bold flex items-center gap-2">
            <FileCheck size={20} />
            Kalkulator IMB — KDB/KDH/KLB (Permen PU)
          </h2>
          <button onClick={closePermitCalculator} className="text-white/70 hover:text-white p-1.5 rounded hover:bg-white/10">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Input */}
          <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-lg p-3 space-y-3">
            <div className="text-xs font-semibold text-emerald-700 dark:text-emerald-300 flex items-center gap-1">
              <MapPin size={12} /> INPUT DATA & ZONASI
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] block mb-1">Zonasi Lahan (Rencana Kota)</label>
                <select className="prop-input" value={zone} onChange={e => setZone(e.target.value)}>
                  {Object.entries(landUseZones).map(([k, v]) => (
                    <option key={k} value={k}>{k} - {v.name.split('(')[1]?.replace(')', '') || v.name}</option>
                  ))}
                </select>
                <div className="text-[10px] text-slate-500 mt-1">{result.zoneDesc}</div>
              </div>
              <div>
                <label className="text-[11px] block mb-1">Mode Input</label>
                <select className="prop-input" value={customPlot ? 'manual' : 'auto'} onChange={e => setCustomPlot(e.target.value === 'manual')}>
                  <option value="auto">Auto dari Desain Saat Ini</option>
                  <option value="manual">Manual Input</option>
                </select>
              </div>
            </div>

            {customPlot && (
              <div className="grid grid-cols-4 gap-2 animate-fade-in">
                <div>
                  <label className="text-[10px] block mb-0.5">Luas Tanah (m²)</label>
                  <input type="number" className="prop-input text-xs" value={manualPlot.area} onChange={e => setManualPlot({ ...manualPlot, area: parseFloat(e.target.value) || 100 })} />
                </div>
                <div>
                  <label className="text-[10px] block mb-0.5">Luas Dasar (m²)</label>
                  <input type="number" className="prop-input text-xs" value={manualPlot.footprint} onChange={e => setManualPlot({ ...manualPlot, footprint: parseFloat(e.target.value) || 60 })} />
                </div>
                <div>
                  <label className="text-[10px] block mb-0.5">Total Lantai (m²)</label>
                  <input type="number" className="prop-input text-xs" value={manualPlot.totalFloor} onChange={e => setManualPlot({ ...manualPlot, totalFloor: parseFloat(e.target.value) || 60 })} />
                </div>
                <div>
                  <label className="text-[10px] block mb-0.5">Area Hijau (m²)</label>
                  <input type="number" className="prop-input text-xs" value={manualPlot.green} onChange={e => setManualPlot({ ...manualPlot, green: parseFloat(e.target.value) || 30 })} />
                </div>
                <div>
                  <label className="text-[10px] block mb-0.5">Tinggi (m)</label>
                  <input type="number" className="prop-input text-xs" value={manualPlot.height} onChange={e => setManualPlot({ ...manualPlot, height: parseFloat(e.target.value) || 4 })} />
                </div>
                <div>
                  <label className="text-[10px] block mb-0.5">Lantai</label>
                  <input type="number" className="prop-input text-xs" value={manualPlot.floors} onChange={e => setManualPlot({ ...manualPlot, floors: parseInt(e.target.value) || 1 })} />
                </div>
                <div>
                  <label className="text-[10px] block mb-0.5">Parkir</label>
                  <input type="number" className="prop-input text-xs" value={manualPlot.parking} onChange={e => setManualPlot({ ...manualPlot, parking: parseInt(e.target.value) || 1 })} />
                </div>
                <div>
                  <label className="text-[10px] block mb-0.5">Luas Jendela (m²)</label>
                  <input type="number" className="prop-input text-xs" value={manualPlot.window} onChange={e => setManualPlot({ ...manualPlot, window: parseFloat(e.target.value) || 8 })} />
                </div>
              </div>
            )}

            {!customPlot && (
              <div className="grid grid-cols-4 gap-2 text-[11px] text-slate-600 dark:text-slate-300">
                <div>Luas Tanah: <strong>{plotArea.toFixed(1)} m²</strong></div>
                <div>Luas Dasar: <strong>{buildingFootprint.toFixed(1)} m²</strong></div>
                <div>Total Lantai: <strong>{totalFloorArea.toFixed(1)} m²</strong></div>
                <div>Area Hijau: <strong>{greenArea.toFixed(1)} m²</strong></div>
                <div>Tinggi: <strong>{buildingHeight.toFixed(1)} m</strong></div>
                <div>Lantai: <strong>{numFloors}</strong></div>
                <div>Parkir: <strong>{numParking}</strong></div>
                <div>Jendela: <strong>{windowArea.toFixed(1)} m²</strong></div>
              </div>
            )}
          </div>

          {/* Overall status */}
          <div className={`rounded-lg p-4 border-2 ${result.allOK ? 'bg-green-50 dark:bg-green-900/20 border-green-300 dark:border-green-700' : 'bg-red-50 dark:bg-red-900/20 border-red-300 dark:border-red-700'}`}>
            <div className={`text-lg font-bold flex items-center gap-2 ${result.allOK ? 'text-green-700 dark:text-green-400' : 'text-red-700 dark:text-red-400'}`}>
              {result.allOK ? <Check size={24} /> : <AlertTriangle size={24} />}
              {result.allOK ? 'MEMENUHI SYARAT IMB' : 'TIDAK MEMENUHI SYARAT'}
            </div>
            <div className="text-xs text-slate-500 mt-1">
              {result.allOK
                ? 'Desain Anda dapat diajukan untuk IMB/PBG'
                : `Ada ${result.violations.length} pelanggaran yang perlu diperbaiki`}
            </div>
          </div>

          {/* KDB / KDH / KLB cards */}
          <div className="grid grid-cols-3 gap-3">
            <CoefCard label="KDB" desc="Koefisien Dasar Bangunan"
              actual={result.KDB_actual} max={result.KDB_max} unit="%"
              ok={result.KDBOK} color="blue" />
            <CoefCard label="KDH" desc="Koefisien Dasar Hijau"
              actual={result.KDH_actual} min={result.KDH_min} unit="%"
              ok={result.KDHOK} color="green" />
            <CoefCard label="KLB" desc="Koefisien Luas Bangunan"
              actual={result.KLB_actual} max={result.KLB_max} unit=""
              ok={result.KLBOK} color="amber" />
          </div>

          {/* Additional checks */}
          <div className="grid grid-cols-3 gap-3">
            <SmallCheck label="Tinggi Bangunan" value={`${result.buildingHeight_m}m / max ${result.zone ? landUseZones[result.zoneKey]?.buildingHeight_max : 8}m`} ok={result.heightOK} />
            <SmallCheck label="Parkir" value={`${numParking} / min ${landUseZones[result.zoneKey]?.parking_min} slot`} ok={result.parkingOK} />
            <SmallCheck label="Window Ratio (SNI)" value={`${result.WFR_actual}% / min ${result.WFR_min}%`} ok={result.WFROK} />
          </div>

          {/* Violations */}
          {result.violations.length > 0 && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
              <div className="text-sm font-bold text-red-700 dark:text-red-400 mb-2 flex items-center gap-1">
                <AlertTriangle size={14} /> PELANGGARAN
              </div>
              <div className="space-y-2">
                {result.violations.map((v, i) => (
                  <div key={i} className={`text-xs p-2 rounded ${v.severity === 'critical' ? 'bg-red-100 dark:bg-red-900/30' : 'bg-yellow-100 dark:bg-yellow-900/30'}`}>
                    <div className="font-bold">{v.item}: {v.severity === 'critical' ? '✗' : '⚠️'}</div>
                    <div className="text-slate-600 dark:text-slate-300">{v.message}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recommendations */}
          {result.recommendations.length > 0 && (
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
              <div className="text-sm font-bold text-blue-700 dark:text-blue-400 mb-2 flex items-center gap-1">
                <Calculator size={14} /> SARAN & REKOMENDASI
              </div>
              <div className="space-y-1">
                {result.recommendations.map((r, i) => (
                  <div key={i} className="text-xs text-slate-600 dark:text-slate-300 flex gap-1">
                    <span className="text-blue-500">•</span>
                    {r}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Setback */}
          <div className="bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-700 rounded-lg p-3">
            <div className="text-sm font-bold mb-2 flex items-center gap-1">
              <Building2 size={14} /> SETBACK (GARIS SEPADAN BANGUNAN)
            </div>
            <div className="grid grid-cols-3 gap-2 text-xs">
              <div className="bg-white dark:bg-slate-800 rounded p-2 text-center">
                <div className="text-[10px] text-slate-500">Depan (GSP)</div>
                <div className="font-bold">{result.setback.front} m</div>
              </div>
              <div className="bg-white dark:bg-slate-800 rounded p-2 text-center">
                <div className="text-[10px] text-slate-500">Samping (GSS)</div>
                <div className="font-bold">{result.setback.side} m</div>
              </div>
              <div className="bg-white dark:bg-slate-800 rounded p-2 text-center">
                <div className="text-[10px] text-slate-500">Belakang (GSB)</div>
                <div className="font-bold">{result.setback.rear} m</div>
              </div>
            </div>
          </div>

          {/* Max allowed (guidance) */}
          <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-3">
            <div className="text-sm font-bold text-amber-700 dark:text-amber-400 mb-2">LIMIT ZONA {zone}</div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="flex justify-between"><span>Max luas dasar:</span><span className="font-bold">{result.maxBuildingFootprint_m2} m²</span></div>
              <div className="flex justify-between"><span>Max total lantai:</span><span className="font-bold">{result.maxTotalFloorArea_m2} m²</span></div>
              <div className="flex justify-between"><span>Min area hijau:</span><span className="font-bold">{result.requiredGreenArea_m2} m²</span></div>
              <div className="flex justify-between"><span>Min luas jendela:</span><span className="font-bold">{result.requiredWindowArea_m2} m²</span></div>
              <div className="flex justify-between"><span>Open space:</span><span className="font-bold">{result.openSpace_pct}%</span></div>
              <div className="flex justify-between"><span>FAR:</span><span className="font-bold">{result.FAR}</span></div>
            </div>
          </div>

          {/* Required Permits */}
          <div className="bg-violet-50 dark:bg-violet-900/20 border border-violet-200 dark:border-violet-800 rounded-lg p-3">
            <div className="text-sm font-bold text-violet-700 dark:text-violet-400 mb-2">IZIN YANG DIBUTUHKAN</div>
            <div className="space-y-2">
              {result.permitsNeeded.map((p, i) => (
                <div key={i} className="bg-white dark:bg-slate-800 rounded p-2 border border-violet-100 dark:border-violet-800">
                  <div className="flex items-center justify-between">
                    <div className="font-semibold text-xs">{p.name}</div>
                    <div className="text-xs font-bold text-violet-700 dark:text-violet-400">Rp {p.cost_est.toLocaleString('id-ID')}</div>
                  </div>
                  <div className="text-[10px] text-slate-500 mt-0.5">{p.desc}</div>
                  <div className="text-[10px] text-slate-400">Estimasi proses: {p.duration_weeks} minggu</div>
                </div>
              ))}
              <div className="pt-2 border-t border-violet-200 dark:border-violet-800 flex items-center justify-between text-xs">
                <span className="font-semibold">TOTAL ESTIMASI BIAYA PERIZINAN:</span>
                <span className="font-bold text-violet-700 dark:text-violet-400">
                  Rp {result.permitsNeeded.reduce((s, p) => s + p.cost_est, 0).toLocaleString('id-ID')}
                </span>
              </div>
            </div>
          </div>

          {/* Material Calculator (bonus) */}
          <div className="bg-cyan-50 dark:bg-cyan-900/20 border border-cyan-200 dark:border-cyan-800 rounded-lg p-3">
            <button onClick={() => setShowMaterialCalc(!showMaterialCalc)} className="w-full text-sm font-bold text-cyan-700 dark:text-cyan-400 flex items-center justify-between">
              <span className="flex items-center gap-1"><Calculator size={14} /> KALKULATOR KEBUTUHAN MATERIAL (BONUS)</span>
              <span>{showMaterialCalc ? '▲' : '▼'}</span>
            </button>
            {showMaterialCalc && matResult && (
              <div className="mt-3 space-y-2 animate-fade-in">
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="flex justify-between"><span>Cat (liter):</span><span className="font-bold">{matResult.paintLiters} L</span></div>
                  <div className="flex justify-between"><span>Keramik/Granit (box):</span><span className="font-bold">{matResult.tileBoxes} box</span></div>
                  <div className="flex justify-between"><span>Wallpaper (roll):</span><span className="font-bold">{matResult.wallpaperRolls} roll</span></div>
                  <div className="flex justify-between"><span>Gypsum (sheet):</span><span className="font-bold">{matResult.ceilingSheets} sheet</span></div>
                  <div className="flex justify-between"><span>Kapasitas AC:</span><span className="font-bold">{matResult.acCapacity_PK} PK</span></div>
                  <div className="flex justify-between"><span>Toren Air:</span><span className="font-bold">{matResult.waterTank_L} L</span></div>
                  <div className="flex justify-between"><span>Jumlah Penghuni:</span><span className="font-bold">{matResult.numPeople} orang</span></div>
                </div>
                <div className="pt-2 border-t border-cyan-200 dark:border-cyan-800">
                  <div className="text-[10px] font-semibold text-cyan-600 dark:text-cyan-400 mb-1">RINCIAN BIAYA MATERIAL:</div>
                  <div className="grid grid-cols-2 gap-1 text-[11px]">
                    <div className="flex justify-between"><span className="text-slate-500">Cat:</span><span>Rp {matResult.breakdown.paint.toLocaleString('id-ID')}</span></div>
                    <div className="flex justify-between"><span className="text-slate-500">Lantai:</span><span>Rp {matResult.breakdown.tile.toLocaleString('id-ID')}</span></div>
                    <div className="flex justify-between"><span className="text-slate-500">Wallpaper:</span><span>Rp {matResult.breakdown.wallpaper.toLocaleString('id-ID')}</span></div>
                    <div className="flex justify-between"><span className="text-slate-500">Plafon:</span><span>Rp {matResult.breakdown.ceiling.toLocaleString('id-ID')}</span></div>
                    <div className="flex justify-between"><span className="text-slate-500">AC:</span><span>Rp {matResult.breakdown.ac.toLocaleString('id-ID')}</span></div>
                  </div>
                  <div className="mt-2 p-2 bg-cyan-100 dark:bg-cyan-900/40 rounded text-center">
                    <div className="text-[10px] text-cyan-600 dark:text-cyan-400">TOTAL ESTIMASI MATERIAL</div>
                    <div className="font-bold text-cyan-700 dark:text-cyan-400">Rp {matResult.totalCost_IDR.toLocaleString('id-ID')}</div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* SNI References */}
          <div className="text-[10px] text-slate-400 text-center">
            Acuan: {result.sniStandards.join(' · ')}
            <br />Perhitungan ini adalah estimasi awal. Untuk pengajuan IMB resmi, konsultasi dengan konsultan bidang tata ruang setempat (DPMPTSP).
          </div>
        </div>

        <div className="p-4 border-t border-slate-200 dark:border-slate-700 flex justify-between items-center">
          <div className="text-xs text-slate-500">
            {result.allOK ? '✓' : '⚠'} Zona {zone} · {result.violations.length} pelanggaran
          </div>
          <button onClick={closePermitCalculator} className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md text-sm font-medium">
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
}

function CoefCard({ label, desc, actual, max, min, unit, ok, color }) {
  const colorClasses = {
    blue: ok ? 'border-blue-300 dark:border-blue-700 bg-blue-50 dark:bg-blue-900/20' : 'border-red-300 dark:border-red-700 bg-red-50 dark:bg-red-900/20',
    green: ok ? 'border-green-300 dark:border-green-700 bg-green-50 dark:bg-green-900/20' : 'border-red-300 dark:border-red-700 bg-red-50 dark:bg-red-900/20',
    amber: ok ? 'border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-900/20' : 'border-red-300 dark:border-red-700 bg-red-50 dark:bg-red-900/20',
  };
  const textClasses = {
    blue: 'text-blue-700 dark:text-blue-400',
    green: 'text-green-700 dark:text-green-400',
    amber: 'text-amber-700 dark:text-amber-400',
  };
  return (
    <div className={`border-2 rounded-lg p-3 ${colorClasses[color]}`}>
      <div className="flex items-center justify-between mb-1">
        <div className="font-bold text-base">{label}</div>
        <div className={`text-xs font-bold ${ok ? 'text-green-600' : 'text-red-600'}`}>
          {ok ? '✓' : '✗'}
        </div>
      </div>
      <div className="text-[10px] text-slate-500 mb-2">{desc}</div>
      <div className={`text-2xl font-bold ${textClasses[color]}`}>
        {actual}{unit}
      </div>
      <div className="text-[10px] text-slate-500">
        {max !== undefined ? `Max: ${max}${unit}` : `Min: ${min}${unit}`}
      </div>
    </div>
  );
}

function SmallCheck({ label, value, ok }) {
  return (
    <div className={`border rounded-lg p-2 ${ok ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800' : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'}`}>
      <div className="text-[10px] text-slate-500">{label}</div>
      <div className="text-xs font-bold">{value}</div>
      <div className={`text-[10px] font-bold ${ok ? 'text-green-600' : 'text-red-600'}`}>
        {ok ? '✓ OK' : '✗ PERLU PERHATIAN'}
      </div>
    </div>
  );
}
