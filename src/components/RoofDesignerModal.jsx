import React, { useState, useMemo, useEffect } from 'react';
import { useStore } from '../lib/store';
import {
  roofTypes, roofMaterials, frameMaterials, autoCalculateRoofTruss, getRecommendedPitch,
} from '../lib/roofDesigner';
import { X, Home, Check, AlertTriangle, TreePine, Hammer, Wrench } from 'lucide-react';

export default function RoofDesignerModal() {
  const {
    isRoofDesignerOpen,
    closeRoofDesigner,
    building,
    structuralSettings,
  } = useStore();

  const [roofType, setRoofType] = useState('pelana');
  const [frameMaterial, setFrameMaterial] = useState('kayu-kamper');
  const [roofingMaterial, setRoofingMaterial] = useState('genteng-keramik');
  const [pitch, setPitch] = useState(25);

  const buildingW_m = (building?.width || 600) / 100;
  const buildingD_m = (building?.depth || 800) / 100;

  // Auto-set recommended pitch when material changes
  useEffect(() => {
    if (isRoofDesignerOpen) {
      const rec = getRecommendedPitch(roofingMaterial);
      setPitch(rec);
    }
  }, [roofingMaterial, isRoofDesignerOpen]);

  const result = useMemo(() => {
    if (!isRoofDesignerOpen) return null;
    return autoCalculateRoofTruss({
      span_m: buildingW_m,
      length_m: buildingD_m,
      roofType,
      frameMaterial,
      roofingMaterial,
      pitch_deg: pitch,
    });
  }, [buildingW_m, buildingD_m, roofType, frameMaterial, roofingMaterial, pitch, isRoofDesignerOpen]);

  if (!isRoofDesignerOpen || !result) return null;

  return (
    <div
      className="modal-overlay fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-2 sm:p-4"
      onMouseDown={(e) => e.target === e.currentTarget && closeRoofDesigner()}
    >
      <div className="modal-content bg-white dark:bg-slate-800 dark:text-slate-100 rounded-xl shadow-2xl w-full max-w-3xl max-h-[94vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700 bg-gradient-to-r from-rose-500 to-red-700 text-white">
          <h2 className="text-lg font-bold flex items-center gap-2">
            <Home size={20} />
            SNI Roof Designer — Kuda-kuda Atap
          </h2>
          <button onClick={closeRoofDesigner} className="text-white/70 hover:text-white p-1.5 rounded hover:bg-white/10">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* INPUTS */}
          <div className="bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800 rounded-lg p-3 space-y-3">
            <div className="text-xs font-semibold text-rose-700 dark:text-rose-300">INPUT DESAIN ATAP</div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] block mb-1">Tipe Atap</label>
                <select className="prop-input" value={roofType} onChange={e => setRoofType(e.target.value)}>
                  {Object.entries(roofTypes).map(([k, v]) => (
                    <option key={k} value={k}>{v.icon} {v.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-[11px] block mb-1">Material Penutup Atap</label>
                <select className="prop-input" value={roofingMaterial} onChange={e => setRoofingMaterial(e.target.value)}>
                  {Object.entries(roofMaterials).map(([k, v]) => (
                    <option key={k} value={k}>{v.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-[11px] block mb-1">Material Rangka (Kuda-kuda)</label>
                <select className="prop-input" value={frameMaterial} onChange={e => setFrameMaterial(e.target.value)}>
                  <optgroup label="Kayu (SNI 7971:2013)">
                    {Object.entries(frameMaterials).filter(([k, v]) => v.type === 'wood').map(([k, v]) => (
                      <option key={k} value={k}>{v.name}</option>
                    ))}
                  </optgroup>
                  <optgroup label="Baja (SNI 1729:2020)">
                    {Object.entries(frameMaterials).filter(([k, v]) => v.type === 'steel').map(([k, v]) => (
                      <option key={k} value={k}>{v.name}</option>
                    ))}
                  </optgroup>
                </select>
              </div>
              <div>
                <label className="text-[11px] block mb-1">Sudut Kemiringan (°)</label>
                <input type="number" className="prop-input" value={pitch} onChange={e => setPitch(parseFloat(e.target.value) || 25)} min="5" max="45" step="1" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 text-[11px] text-slate-600 dark:text-slate-300">
              <div>Bentang: <span className="font-bold">{buildingW_m} m</span></div>
              <div>Panjang: <span className="font-bold">{buildingD_m} m</span></div>
            </div>
          </div>

          {/* RESULT */}
          <div className={`rounded-lg p-3 border-2 ${result.safetyOK ? 'bg-green-50 dark:bg-green-900/20 border-green-300 dark:border-green-700' : 'bg-red-50 dark:bg-red-900/20 border-red-300 dark:border-red-700'}`}>
            <div className={`text-sm font-bold mb-2 flex items-center gap-1.5 ${result.safetyOK ? 'text-green-700 dark:text-green-400' : 'text-red-700 dark:text-red-400'}`}>
              {result.safetyOK ? <Check size={16} /> : <AlertTriangle size={16} />}
              HASIL DESAIN KUDA-KUDA ATAP
            </div>

            <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-xs">
              <div className="flex justify-between"><span className="text-slate-500">Tipe Atap:</span><span className="font-bold">{result.roofType}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Sudut:</span><span className="font-bold">{result.pitch_deg}°</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Rangka:</span><span className="font-bold">{result.frameMaterial}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Penutup:</span><span className="font-bold">{result.roofingMaterial}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Panjang Kasau:</span><span className="font-bold">{result.rafterLength_m} m</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Tinggi Puncak:</span><span className="font-bold">{result.roofHeight_m} m</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Luas Bidang Atap:</span><span className="font-bold">{result.roofArea_m2} m²</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Jumlah Kuda-kuda:</span><span className="font-bold">{result.numTrusses} bh @{result.trussSpacing_m}m</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Beban Mati (DL):</span><span className="font-bold">{result.deadLoad_kN_per_m2} kN/m²</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Beban Hidup (LL):</span><span className="font-bold">{result.liveLoad_kN_per_m2} kN/m²</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Beban Angin:</span><span className="font-bold">{result.windLoad_kN_per_m2} kN/m²</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Beban Faktor:</span><span className="font-bold">{result.factoredLoad_kN_per_m2} kN/m²</span></div>
            </div>

            {result.warnings.length > 0 && (
              <div className="mt-2 p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded text-[11px] text-yellow-800 dark:text-yellow-300">
                {result.warnings.map((w, i) => <div key={i}>⚠️ {w}</div>)}
              </div>
            )}
          </div>

          {/* MEMBER SIZES */}
          <div className="bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-700 rounded-lg p-3">
            <div className="text-xs font-semibold mb-2 flex items-center gap-1">
              {result.frameType === 'wood' ? <TreePine size={14} /> : <Wrench size={14} />}
              UKURAN MEMBER KUDA-KUDA
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <MemberRow label="Kasau (Rafter)" size={result.memberSizes.rafter?.label} count={result.memberSizes.rafter?.count} length={result.memberSizes.rafter?.length_m} />
              <MemberRow label="Balok Pengikat (Tie Beam)" size={result.memberSizes.tieBeam?.label} count={result.memberSizes.tieBeam?.count} length={result.memberSizes.tieBeam?.length_m} />
              <MemberRow label="Tiang Tengah (Post)" size={result.memberSizes.post?.label} count={result.memberSizes.post?.count} length={result.memberSizes.post?.length_m} />
              <MemberRow label="Reng (Purlin)" size={result.memberSizes.purlin?.label} count={result.memberSizes.purlin?.count} length={result.memberSizes.purlin?.length_m} />
              {result.memberSizes.web && (
                <MemberRow label="Web (Diagonal)" size={result.memberSizes.web?.label} count={result.memberSizes.web?.count} length={result.memberSizes.web?.length_m} />
              )}
              {result.memberSizes.fbCheck && (
                <div className="col-span-2 mt-1 p-2 bg-blue-50 dark:bg-blue-900/20 rounded text-[11px]">
                  <strong>Check Lentur (fb):</strong> {result.memberSizes.fbCheck.actual} MPa / ijin {result.memberSizes.fbCheck.allowable} MPa
                  → {result.memberSizes.fbCheck.passed ? '✓ AMAN' : '✗ PERLU PERBESAR'}
                </div>
              )}
            </div>
          </div>

          {/* RING BALOK ATAS (concrete ring beam under truss) */}
          <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-3">
            <div className="text-xs font-semibold mb-2 flex items-center gap-1">
              <Hammer size={14} /> RING BALOK ATAS (BETON BERTULANG DI BAWAH KUDA-KUDA)
            </div>
            <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-xs">
              <div className="flex justify-between"><span className="text-slate-500">Ukuran:</span><span className="font-bold">{result.ringBeam.width_mm}x{result.ringBeam.height_mm} mm</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Tulangan Utama:</span><span className="font-bold">{result.ringBeam.mainBars}xD{result.ringBeam.mainDiameter_mm}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Sengkang:</span><span className="font-bold">D{result.ringBeam.stirrupDiameter_mm} @{result.ringBeam.stirrupSpacing_mm}mm</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Total Panjang:</span><span className="font-bold">{result.ringBeam.totalLength_m.toFixed(1)} m (perimeter)</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Berat Besi Utama:</span><span className="font-bold">{result.ringBeam.mainBarWeight_kg.toFixed(1)} kg</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Berat Sengkang:</span><span className="font-bold">{result.ringBeam.stirrupWeight_kg.toFixed(1)} kg</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Total Berat Besi:</span><span className="font-bold text-amber-700 dark:text-amber-400">{result.ringBeam.totalSteelWeight_kg.toFixed(1)} kg</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Vol Beton:</span><span className="font-bold">{result.ringBeam.concreteVolume_m3.toFixed(2)} m³</span></div>
            </div>
          </div>

          {/* COST */}
          <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-lg p-3">
            <div className="text-xs font-semibold text-emerald-700 dark:text-emerald-300 mb-2">ESTIMASI BIAYA</div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="flex justify-between"><span className="text-slate-500">Total Berat Rangka:</span><span className="font-bold">{result.totalFrameWeight_kg} kg</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Biaya Rangka:</span><span className="font-bold">Rp {result.frameCost_IDR.toLocaleString('id-ID')}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Biaya Penutup:</span><span className="font-bold">Rp {result.roofingCost_IDR.toLocaleString('id-ID')}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">TOTAL:</span><span className="font-bold text-emerald-700 dark:text-emerald-400">Rp {result.totalCost_IDR.toLocaleString('id-ID')}</span></div>
            </div>
          </div>

          {/* SNI Reference */}
          <div className="text-[10px] text-slate-400 text-center">
            Acuan: {result.sniStandards.join(' · ')}
          </div>
        </div>

        <div className="p-4 border-t border-slate-200 dark:border-slate-700 flex justify-end">
          <button onClick={closeRoofDesigner} className="px-4 py-2 bg-rose-500 hover:bg-rose-600 text-white rounded-md text-sm font-medium">
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
}

function MemberRow({ label, size, count, length }) {
  if (!size) return null;
  return (
    <div className="border border-slate-200 dark:border-slate-600 rounded p-2 bg-white dark:bg-slate-800">
      <div className="text-[10px] font-semibold text-slate-500 dark:text-slate-400">{label}</div>
      <div className="text-xs font-bold">{size}</div>
      <div className="text-[10px] text-slate-400">
        {count ? `${count} bh` : ''} {length ? `x ${typeof length === 'number' ? length.toFixed(1) : length} m` : ''}
      </div>
    </div>
  );
}
