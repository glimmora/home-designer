import React, { useState, useMemo } from 'react';
import { useStore } from '../lib/store';
import { calculateWindLoad, calculateFoundation, calculateEnergySimulation, windSpeedZones, exposureCategories, foundationTypes } from '../lib/advancedEngineering';
import { X, Wind, Building, Sun, Calculator } from 'lucide-react';

export default function EngineeringModal() {
  const {
    isEngineeringModalOpen,
    closeEngineeringModal,
    floors,
    building,
    plot,
    structuralSettings,
  } = useStore();

  const [activeTab, setActiveTab] = useState('wind');
  const [windCity, setWindCity] = useState('jakarta');
  const [windExposure, setWindExposure] = useState('B');
  const [windIw, setWindIw] = useState(1.0);
  const [foundType, setFoundType] = useState('strip-footing');
  const [soilCap, setSoilCap] = useState(200);

  const totalHeight_m = floors.reduce((s, f) => s + f.height, 0) / 100;
  const buildingW_m = building.width / 100;
  const buildingD_m = building.depth / 100;
  const totalLoad_kN = floors.length * (buildingW_m * buildingD_m) * 12;
  const numColumns = floors[0]?.columns.length || 4;
  const buildingArea_m2 = buildingW_m * buildingD_m;
  const wallArea_m2 = floors.reduce((s, f) => {
    return s + f.walls.reduce((ws, w) => {
      const len = Math.sqrt((w.x2-w.x1)**2 + (w.y2-w.y1)**2) / 100;
      return ws + len * (f.height / 100);
    }, 0);
  }, 0);

  const windResult = useMemo(() => {
    if (!isEngineeringModalOpen) return null;
    return calculateWindLoad({
    buildingHeight: totalHeight_m,
    buildingWidth: buildingW_m,
    buildingDepth: buildingD_m,
    city: windCity,
    exposureCategory: windExposure,
    importanceFactor: windIw,
    roofAngle: 0,
  });
  }, [totalHeight_m, buildingW_m, buildingD_m, windCity, windExposure, windIw, isEngineeringModalOpen]);

  const foundResult = useMemo(() => {
    if (!isEngineeringModalOpen) return null;
    return calculateFoundation({
    totalLoad_kN,
    buildingWidth_m: buildingW_m,
    buildingDepth_m: buildingD_m,
    soilBearingCapacity: soilCap,
    foundationType: foundType,
    numColumns,
  });
  }, [totalLoad_kN, buildingW_m, buildingD_m, soilCap, foundType, numColumns, isEngineeringModalOpen]);

  const energyResult = useMemo(() => {
    if (!isEngineeringModalOpen) return null;
    return calculateEnergySimulation({
    buildingArea_m2: buildingArea_m2 * floors.length,
    numFloors: floors.length,
    wallArea_m2: wallArea_m2,
    windowArea_m2: wallArea_m2 * 0.15,
    roofArea_m2: buildingArea_m2,
    floorHeight_m: totalHeight_m / floors.length,
    occupancy: 4 * floors.length,
    location: windCity,
  });
  }, [buildingArea_m2, floors.length, wallArea_m2, totalHeight_m, windCity, isEngineeringModalOpen]);

  if (!isEngineeringModalOpen || !windResult || !foundResult || !energyResult) return null;

  const tabs = [
    { id: 'wind', label: 'Beban Angin', icon: Wind },
    { id: 'foundation', label: 'Pondasi', icon: Building },
    { id: 'energy', label: 'Energi', icon: Sun },
  ];

  return (
    <div className="modal-overlay fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-2 sm:p-4"
      onMouseDown={(e) => e.target === e.currentTarget && closeEngineeringModal()}>
      <div className="modal-content bg-white dark:bg-slate-800 dark:text-slate-100 rounded-xl shadow-2xl w-full max-w-3xl max-h-[92vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700 bg-gradient-to-r from-cyan-600 to-blue-700 text-white">
          <h2 className="text-lg font-bold flex items-center gap-2">
            <Calculator size={20} />
            Advanced Engineering
          </h2>
          <button onClick={closeEngineeringModal} className="text-white/70 hover:text-white p-1.5 rounded hover:bg-white/10">
            <X size={20} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-700/50">
          {tabs.map(tab => {
            const Icon = tab.icon;
            return (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2.5 text-sm font-medium flex items-center gap-1.5 border-b-2 ${activeTab === tab.id ? 'border-cyan-600 text-cyan-600 dark:text-cyan-400' : 'border-transparent text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700'}`}>
                <Icon size={14} />{tab.label}
              </button>
            );
          })}
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* WIND TAB */}
          {activeTab === 'wind' && (
            <div className="space-y-3 animate-fade-in">
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-[11px] text-slate-600 dark:text-slate-300 block mb-1">Kota</label>
                  <select className="prop-input" value={windCity} onChange={e => setWindCity(e.target.value)}>
                    {Object.entries(windSpeedZones).map(([k,v]) => <option key={k} value={k}>{v.city}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-[11px] text-slate-600 dark:text-slate-300 block mb-1">Exposure</label>
                  <select className="prop-input" value={windExposure} onChange={e => setWindExposure(e.target.value)}>
                    {Object.entries(exposureCategories).map(([k,v]) => <option key={k} value={k}>{v.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-[11px] text-slate-600 dark:text-slate-300 block mb-1">Iw</label>
                  <select className="prop-input" value={windIw} onChange={e => setWindIw(parseFloat(e.target.value))}>
                    <option value={0.87}>0.87 (Biasa)</option>
                    <option value={1.0}>1.00 (Normal)</option>
                    <option value={1.15}>1.15 (Esensial)</option>
                  </select>
                </div>
              </div>

              <div className="bg-cyan-50 dark:bg-cyan-900/20 border border-cyan-200 dark:border-cyan-800 rounded-lg p-3">
                <div className="text-sm font-bold text-cyan-800 dark:text-cyan-300 mb-2">Hasil Perhitungan Beban Angin (SNI 1727-2013)</div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="flex justify-between"><span className="text-slate-500">Kecepatan Angin (V):</span><span className="font-semibold">{windResult.V} m/s</span></div>
                  <div className="flex justify-between"><span className="text-slate-500">Kz:</span><span className="font-semibold">{windResult.Kz.toFixed(3)}</span></div>
                  <div className="flex justify-between"><span className="text-slate-500">Tekanan (q):</span><span className="font-semibold">{windResult.q.toFixed(1)} Pa</span></div>
                  <div className="flex justify-between"><span className="text-slate-500">Tekanan Angin:</span><span className="font-semibold">{windResult.p_windward.toFixed(1)} Pa</span></div>
                  <div className="flex justify-between"><span className="text-slate-500">Tekanan Sisi Bawah:</span><span className="font-semibold">{windResult.p_leeward.toFixed(1)} Pa</span></div>
                  <div className="flex justify-between"><span className="text-slate-500">Tekanan Atap:</span><span className="font-semibold">{windResult.p_roof.toFixed(1)} Pa</span></div>
                  <div className="flex justify-between"><span className="text-slate-500">Gaya Total:</span><span className="font-semibold">{windResult.F_total_kN.toFixed(1)} kN</span></div>
                  <div className="flex justify-between"><span className="text-slate-500">Momen Dasar:</span><span className="font-semibold">{windResult.M_base_kNm.toFixed(1)} kNm</span></div>
                </div>
                <div className={`mt-2 p-2 rounded text-center font-bold text-sm ${windResult.stable ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'}`}>
                  Safety Factor: {windResult.safetyFactor.toFixed(2)} → {windResult.stable ? '✓ STABIL' : '✗ TIDAK STABIL'}
                </div>
              </div>
            </div>
          )}

          {/* FOUNDATION TAB */}
          {activeTab === 'foundation' && (
            <div className="space-y-3 animate-fade-in">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] text-slate-600 dark:text-slate-300 block mb-1">Tipe Pondasi</label>
                  <select className="prop-input" value={foundType} onChange={e => setFoundType(e.target.value)}>
                    {Object.entries(foundationTypes).map(([k,v]) => <option key={k} value={k}>{v.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-[11px] text-slate-600 dark:text-slate-300 block mb-1">Daya Dukung Tanah (kPa)</label>
                  <input type="number" className="prop-input" value={soilCap} onChange={e => setSoilCap(parseFloat(e.target.value)||200)} min="50" max="500" step="10" />
                </div>
              </div>

              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
                <div className="text-sm font-bold text-blue-800 dark:text-blue-300 mb-2">Hasil Perhitungan Pondasi</div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="flex justify-between"><span className="text-slate-500">Tipe:</span><span className="font-semibold">{foundResult.type}</span></div>
                  <div className="flex justify-between"><span className="text-slate-500">Beban Total:</span><span className="font-semibold">{foundResult.totalLoad_kN.toFixed(1)} kN</span></div>
                  <div className="flex justify-between"><span className="text-slate-500">Luas Bangunan:</span><span className="font-semibold">{foundResult.buildingArea_m2.toFixed(1)} m²</span></div>
                  <div className="flex justify-between"><span className="text-slate-500">Tekanan Kontak:</span><span className="font-semibold">{foundResult.contactPressure.toFixed(1)} kPa</span></div>
                  <div className="flex justify-between"><span className="text-slate-500">Daya Dukung:</span><span className="font-semibold">{foundResult.soilBearingCapacity} kPa</span></div>
                  <div className="flex justify-between"><span className="text-slate-500">Estimasi Biaya:</span><span className="font-semibold">Rp {foundResult.cost.toLocaleString('id-ID')}</span></div>
                </div>
                {Object.keys(foundResult.details).length > 0 && (
                  <div className="mt-2 pt-2 border-t border-blue-200 dark:border-blue-800">
                    <div className="text-[10px] font-semibold text-blue-600 dark:text-blue-400 mb-1">DETAIL:</div>
                    <div className="grid grid-cols-2 gap-1 text-[11px]">
                      {Object.entries(foundResult.details).map(([k,v]) => (
                        <div key={k} className="flex justify-between"><span className="text-slate-500">{k}:</span><span className="font-medium">{typeof v === 'number' ? v.toLocaleString('id-ID') : v}</span></div>
                      ))}
                    </div>
                  </div>
                )}
                <div className={`mt-2 p-2 rounded text-center font-bold text-sm ${foundResult.safe ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'}`}>
                  Safety Factor: {foundResult.safetyFactor.toFixed(2)} → {foundResult.safe ? '✓ AMAN' : '✗ PERLU PERHATIAN'}
                </div>
              </div>
            </div>
          )}

          {/* ENERGY TAB */}
          {activeTab === 'energy' && (
            <div className="space-y-3 animate-fade-in">
              <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-3">
                <div className="text-sm font-bold text-amber-800 dark:text-amber-300 mb-2">Cooling Load & Energi</div>
                <div className="grid grid-cols-2 gap-2 text-xs mb-3">
                  <div className="flex justify-between"><span className="text-slate-500">Cooling Load:</span><span className="font-semibold">{energyResult.coolingLoad_kW} kW ({energyResult.coolingPK} PK)</span></div>
                  <div className="flex justify-between"><span className="text-slate-500">Design Load:</span><span className="font-semibold">{energyResult.designCooling_W} W</span></div>
                  <div className="flex justify-between"><span className="text-slate-500">Energi Tahunan:</span><span className="font-semibold">{energyResult.annualEnergy.total_kWh.toLocaleString('id-ID')} kWh</span></div>
                  <div className="flex justify-between"><span className="text-slate-500">Estimasi Biaya:</span><span className="font-semibold">Rp {energyResult.annualEnergy.estimatedCost_IDR.toLocaleString('id-ID')}</span></div>
                </div>
                <div className="text-[10px] font-semibold text-amber-600 dark:text-amber-400 mb-1">BREAKDOWN COOLING:</div>
                <div className="grid grid-cols-2 gap-1 text-[11px]">
                  <div className="flex justify-between"><span className="text-slate-500">Dinding:</span><span>{energyResult.breakdown.walls} W</span></div>
                  <div className="flex justify-between"><span className="text-slate-500">Jendela (kondusi):</span><span>{energyResult.breakdown.windows_cond} W</span></div>
                  <div className="flex justify-between"><span className="text-slate-500">Jendela (solar):</span><span>{energyResult.breakdown.windows_solar} W</span></div>
                  <div className="flex justify-between"><span className="text-slate-500">Atap:</span><span>{energyResult.breakdown.roof} W</span></div>
                  <div className="flex justify-between"><span className="text-slate-500">Infiltrasi:</span><span>{energyResult.breakdown.infiltration} W</span></div>
                  <div className="flex justify-between"><span className="text-slate-500">Orang:</span><span>{energyResult.breakdown.people} W</span></div>
                </div>
              </div>

              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-3">
                <div className="text-sm font-bold text-green-800 dark:text-green-300 mb-2">☀️ Potensi Solar Panel</div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="flex justify-between"><span className="text-slate-500">Area Atap Usable:</span><span className="font-semibold">{energyResult.solar.roofUsableArea} m²</span></div>
                  <div className="flex justify-between"><span className="text-slate-500">Panel Direkomendasikan:</span><span className="font-semibold">{energyResult.solar.recommendedPanels} unit</span></div>
                  <div className="flex justify-between"><span className="text-slate-500">Produksi Harian:</span><span className="font-semibold">{energyResult.solar.dailyProduction_kWh} kWh</span></div>
                  <div className="flex justify-between"><span className="text-slate-500">Produksi Tahunan:</span><span className="font-semibold">{energyResult.solar.annualProduction_kWh.toLocaleString('id-ID')} kWh</span></div>
                </div>
                <div className="mt-2 p-2 rounded text-center font-bold text-sm bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400">
                  Coverage: {energyResult.solar.coveragePercent}% dari kebutuhan energi tahunan
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="p-4 border-t border-slate-200 dark:border-slate-700 flex justify-end">
          <button onClick={closeEngineeringModal} className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-md text-sm font-medium">Tutup</button>
        </div>
      </div>
    </div>
  );
}
