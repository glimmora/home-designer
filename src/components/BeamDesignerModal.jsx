import React, { useState, useMemo } from 'react';
import { useStore } from '../lib/store';
import {
  autoCalculateBeam, beamPresets, spanToDepthRatios, getSNIBeamOptions, standardBeamWidths,
  autoCalculateSloof, sloofPresets, sloofMinDimensions, getSNISloofOptions,
} from '../lib/beamDesigner';
import { concreteGrades, steelGrades, rebarProperties } from '../lib/structuralAnalysis';
import { X, Ruler, Zap, Check, AlertTriangle, ArrowRight, Layers } from 'lucide-react';

export default function BeamDesignerModal() {
  const {
    isBeamDesignerOpen,
    closeBeamDesigner,
    floors,
  } = useStore();

  const [activeTab, setActiveTab] = useState('beam'); // 'beam' | 'sloof' | 'ring'

  // ---- BEAM STATE ----
  const [span, setSpan] = useState(4);
  const [load, setLoad] = useState(15);
  const [supportType, setSupportType] = useState('simply-supported');
  const [selectedPreset, setSelectedPreset] = useState(null);
  const [width, setWidth] = useState(200);
  const [height, setHeight] = useState(300);
  const [numBars, setNumBars] = useState(4);
  const [mainDiameter, setMainDiameter] = useState(13);
  const [stirrupDiameter, setStirrupDiameter] = useState(8);
  const [fcGrade, setFcGrade] = useState('K-250');
  const [fyGrade, setFyGrade] = useState('BJTD400');
  const [autoMode, setAutoMode] = useState(true);

  // ---- SLOOF STATE ----
  const [sloofSpan, setSloofSpan] = useState(3);
  const [numStories, setNumStories] = useState(floors?.length || 1);
  const [sloofPreset, setSloofPreset] = useState(null);
  const [sloofWallLoad, setSloofWallLoad] = useState(8);

  // ---- RING BALOK (use preset) ----
  const [ringKey, setRingKey] = useState('ring-balok');

  const sniBeamOptions = useMemo(() => getSNIBeamOptions(span, supportType), [span, supportType]);
  const sniSloofOptions = useMemo(() => getSNISloofOptions(numStories, sloofSpan), [numStories, sloofSpan]);

  const beamResult = useMemo(() => {
    if (!isBeamDesignerOpen || activeTab !== 'beam') return null;
    return autoCalculateBeam({
      span_m: span, load_kN_per_m: load, supportType,
      concreteGrade: fcGrade, steelGrade: fyGrade,
      numMainBars: numBars, mainDiameter, stirrupDiameter, cover: 40,
    });
  }, [span, load, supportType, fcGrade, fyGrade, numBars, mainDiameter, stirrupDiameter, isBeamDesignerOpen, activeTab]);

  const sloofResult = useMemo(() => {
    if (!isBeamDesignerOpen || activeTab !== 'sloof') return null;
    return autoCalculateSloof({
      span_m: sloofSpan,
      numStories,
      wallLoad_kN_per_m: sloofWallLoad,
      concreteGrade: fcGrade,
      steelGrade: fyGrade,
      cover: 50,
    });
  }, [sloofSpan, numStories, sloofWallLoad, fcGrade, fyGrade, isBeamDesignerOpen, activeTab]);

  const ringResult = useMemo(() => {
    if (!isBeamDesignerOpen || activeTab !== 'ring') return null;
    const p = beamPresets[ringKey] || beamPresets['ring-balok'];
    return autoCalculateBeam({
      span_m: p.span_m,
      load_kN_per_m: 10,
      supportType: 'continuous',
      concreteGrade: p.fc_grade,
      steelGrade: p.fy_grade,
      numMainBars: p.mainBars,
      mainDiameter: p.mainDiameter,
      stirrupDiameter: p.stirrupDiameter,
      cover: 40,
    });
  }, [ringKey, isBeamDesignerOpen, activeTab]);

  if (!isBeamDesignerOpen) return null;

  const handleBeamPreset = (presetKey) => {
    const p = beamPresets[presetKey];
    setSelectedPreset(presetKey);
    setSpan(p.span_m); setWidth(p.width_mm); setHeight(p.height_mm);
    setNumBars(p.mainBars); setMainDiameter(p.mainDiameter); setStirrupDiameter(p.stirrupDiameter);
    setFcGrade(p.fc_grade); setFyGrade(p.fy_grade);
  };

  const handleSNIOption = (opt) => {
    setWidth(opt.width); setHeight(opt.height);
    setNumBars(opt.mainBars); setMainDiameter(opt.mainDiameter);
    setStirrupDiameter(opt.stirrupDiameter); setFcGrade(opt.fc_grade);
  };

  const handleSloofPreset = (k) => {
    const p = sloofPresets[k];
    setSloofPreset(k);
    setSloofSpan(p.span_m);
    setNumStories(k === 'sloof-1lt' ? 1 : k === 'sloof-3lt' ? 3 : 2);
    setFcGrade(p.fc_grade); setFyGrade(p.fy_grade);
  };

  const handleSloofOption = (opt) => {
    setFcGrade(opt.fc_grade);
  };

  const tabs = [
    { id: 'beam', label: 'Balok', icon: Ruler, color: 'amber' },
    { id: 'sloof', label: 'Sloof', icon: Layers, color: 'orange' },
    { id: 'ring', label: 'Ring Balok', icon: ArrowRight, color: 'yellow' },
  ];

  const colorMap = {
    amber: { bg: 'from-amber-500 to-orange-600', active: 'border-amber-500 text-amber-600 dark:text-amber-400' },
    orange: { bg: 'from-orange-500 to-red-600', active: 'border-orange-500 text-orange-600 dark:text-orange-400' },
    yellow: { bg: 'from-yellow-500 to-amber-600', active: 'border-yellow-500 text-yellow-600 dark:text-yellow-400' },
  };

  return (
    <div
      className="modal-overlay fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-2 sm:p-4"
      onMouseDown={(e) => e.target === e.currentTarget && closeBeamDesigner()}
    >
      <div className="modal-content bg-white dark:bg-slate-800 dark:text-slate-100 rounded-xl shadow-2xl w-full max-w-3xl max-h-[94vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700 bg-gradient-to-r from-amber-500 to-orange-600 text-white">
          <h2 className="text-lg font-bold flex items-center gap-2">
            <Ruler size={20} />
            SNI Beam Designer — Balok · Sloof · Ring Balok
          </h2>
          <button onClick={closeBeamDesigner} className="text-white/70 hover:text-white p-1.5 rounded hover:bg-white/10">
            <X size={20} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-700/50">
          {tabs.map(tab => {
            const Icon = tab.icon;
            const c = colorMap[tab.color];
            return (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2.5 text-sm font-medium flex items-center gap-1.5 border-b-2 ${activeTab === tab.id ? c.active : 'border-transparent text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700'}`}>
                <Icon size={14} />{tab.label}
              </button>
            );
          })}
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">

          {/* ============= BEAM TAB ============= */}
          {activeTab === 'beam' && beamResult && (
            <>
              <div className="flex gap-2">
                <button onClick={() => setAutoMode(true)}
                  className={`flex-1 px-3 py-2 rounded-md text-sm font-medium ${autoMode ? 'bg-amber-500 text-white' : 'bg-slate-100 dark:bg-slate-700'}`}>
                  🔧 Auto (Input Bentang)
                </button>
                <button onClick={() => setAutoMode(false)}
                  className={`flex-1 px-3 py-2 rounded-md text-sm font-medium ${!autoMode ? 'bg-amber-500 text-white' : 'bg-slate-100 dark:bg-slate-700'}`}>
                  📋 Preset SNI
                </button>
              </div>

              {autoMode && (
                <div className="space-y-3 animate-fade-in">
                  <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-3 space-y-3">
                    <div className="text-xs font-semibold text-amber-700 dark:text-amber-300">INPUT DESAIN BALOK</div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-[11px] block mb-1">Bentang (m)</label>
                        <input type="number" className="prop-input" value={span} onChange={e => setSpan(parseFloat(e.target.value) || 3)} min="1" max="12" step="0.5" />
                      </div>
                      <div>
                        <label className="text-[11px] block mb-1">Beban Merata (kN/m)</label>
                        <input type="number" className="prop-input" value={load} onChange={e => setLoad(parseFloat(e.target.value) || 10)} min="5" max="50" step="1" />
                      </div>
                    </div>
                    <div>
                      <label className="text-[11px] block mb-1">Tipe Tumpuan</label>
                      <select className="prop-input" value={supportType} onChange={e => setSupportType(e.target.value)}>
                        {Object.entries(spanToDepthRatios).map(([k, v]) => (
                          <option key={k} value={k}>{v.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
                    <div className="text-xs font-semibold text-blue-700 dark:text-blue-300 mb-2 flex items-center gap-1">
                      <Zap size={12} /> OPSI OTOMATIS SESUAI SNI 03-2847-2002
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      {sniBeamOptions.map((opt, i) => (
                        <button key={i} onClick={() => handleSNIOption(opt)}
                          className="border border-blue-200 dark:border-blue-800 rounded-lg p-2 text-center hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors">
                          <div className="text-[10px] font-bold text-blue-600 dark:text-blue-400 mb-1">{opt.label}</div>
                          <div className="text-xs">{opt.width}x{opt.height}mm</div>
                          <div className="text-[10px] text-slate-400">{opt.mainBars}xD{opt.mainDiameter}</div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {!autoMode && (
                <div className="space-y-2 animate-fade-in">
                  <div className="text-xs font-semibold">PILIH PRESET BALOK (SNI)</div>
                  {Object.entries(beamPresets).map(([key, p]) => (
                    <button key={key} onClick={() => handleBeamPreset(key)}
                      className={`w-full text-left border-2 rounded-lg p-3 transition-all ${selectedPreset === key ? 'border-amber-500 bg-amber-50 dark:bg-amber-900/20' : 'border-slate-200 dark:border-slate-700 hover:border-amber-300'}`}>
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-semibold text-sm">{p.name}</div>
                          <div className="text-[11px] text-slate-500">{p.desc}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-xs font-bold">{p.width_mm}x{p.height_mm}mm</div>
                          <div className="text-[10px] text-slate-400">{p.mainBars}xD{p.mainDiameter}</div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              <ResultCard result={beamResult} />
              <BarArrangementVisual result={beamResult} />
            </>
          )}

          {/* ============= SLOOF TAB ============= */}
          {activeTab === 'sloof' && sloofResult && (
            <>
              <div className="flex gap-2">
                <button onClick={() => setAutoMode(true)}
                  className={`flex-1 px-3 py-2 rounded-md text-sm font-medium ${autoMode ? 'bg-orange-500 text-white' : 'bg-slate-100 dark:bg-slate-700'}`}>
                  🔧 Auto (Input Lantai + Bentang)
                </button>
                <button onClick={() => setAutoMode(false)}
                  className={`flex-1 px-3 py-2 rounded-md text-sm font-medium ${!autoMode ? 'bg-orange-500 text-white' : 'bg-slate-100 dark:bg-slate-700'}`}>
                  📋 Preset SNI
                </button>
              </div>

              {autoMode && (
                <div className="space-y-3 animate-fade-in">
                  <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg p-3 space-y-3">
                    <div className="text-xs font-semibold text-orange-700 dark:text-orange-300">INPUT DESAIN SLOOF</div>
                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <label className="text-[11px] block mb-1">Bentang Antar Kolom (m)</label>
                        <input type="number" className="prop-input" value={sloofSpan} onChange={e => setSloofSpan(parseFloat(e.target.value) || 3)} min="2" max="8" step="0.5" />
                      </div>
                      <div>
                        <label className="text-[11px] block mb-1">Jumlah Lantai</label>
                        <select className="prop-input" value={numStories} onChange={e => setNumStories(parseInt(e.target.value))}>
                          <option value={1}>1 Lantai</option>
                          <option value={2}>2 Lantai</option>
                          <option value={3}>3 Lantai</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-[11px] block mb-1">Beban Dinding (kN/m)</label>
                        <input type="number" className="prop-input" value={sloofWallLoad} onChange={e => setSloofWallLoad(parseFloat(e.target.value) || 8)} min="3" max="15" step="0.5" />
                      </div>
                    </div>
                  </div>

                  <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
                    <div className="text-xs font-semibold text-blue-700 dark:text-blue-300 mb-2 flex items-center gap-1">
                      <Zap size={12} /> OPSI OTOMATIS SLOOF SNI
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      {sniSloofOptions.map((opt, i) => (
                        <button key={i} onClick={() => handleSloofOption(opt)}
                          className="border border-blue-200 dark:border-blue-800 rounded-lg p-2 text-center hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors">
                          <div className="text-[10px] font-bold text-blue-600 dark:text-blue-400 mb-1">{opt.label}</div>
                          <div className="text-xs">{opt.width}x{opt.height}mm</div>
                          <div className="text-[10px] text-slate-400">{opt.mainBars}xD{opt.mainDiameter}</div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {!autoMode && (
                <div className="space-y-2 animate-fade-in">
                  <div className="text-xs font-semibold">PILIH PRESET SLOOF (SNI)</div>
                  {Object.entries(sloofPresets).map(([key, p]) => (
                    <button key={key} onClick={() => handleSloofPreset(key)}
                      className={`w-full text-left border-2 rounded-lg p-3 transition-all ${sloofPreset === key ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20' : 'border-slate-200 dark:border-slate-700 hover:border-orange-300'}`}>
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-semibold text-sm">{p.name}</div>
                          <div className="text-[11px] text-slate-500">{p.desc}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-xs font-bold">{p.width_mm}x{p.height_mm}mm</div>
                          <div className="text-[10px] text-slate-400">{p.mainBars}xD{p.mainDiameter}</div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              <SloofResultCard result={sloofResult} />
              <BarArrangementVisual result={sloofResult} />
            </>
          )}

          {/* ============= RING BALOK TAB ============= */}
          {activeTab === 'ring' && ringResult && (
            <>
              <div className="space-y-2 animate-fade-in">
                <div className="text-xs font-semibold">PILIH PRESET RING BALOK ATAS (SNI)</div>
                {Object.entries(beamPresets).filter(([k]) => k.includes('ring') || k.includes('Ring')).length === 0 ? (
                  // If no ring-specific preset, show the ring-balok preset
                  <button onClick={() => setRingKey('ring-balok')}
                    className={`w-full text-left border-2 rounded-lg p-3 transition-all ${ringKey === 'ring-balok' ? 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20' : 'border-slate-200 dark:border-slate-700'}`}>
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-semibold text-sm">{beamPresets['ring-balok'].name}</div>
                        <div className="text-[11px] text-slate-500">{beamPresets['ring-balok'].desc}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs font-bold">{beamPresets['ring-balok'].width_mm}x{beamPresets['ring-balok'].height_mm}mm</div>
                        <div className="text-[10px] text-slate-400">{beamPresets['ring-balok'].mainBars}xD{beamPresets['ring-balok'].mainDiameter}</div>
                      </div>
                    </div>
                  </button>
                ) : (
                  Object.entries(beamPresets).filter(([k]) => k.toLowerCase().includes('ring')).map(([key, p]) => (
                    <button key={key} onClick={() => setRingKey(key)}
                      className={`w-full text-left border-2 rounded-lg p-3 transition-all ${ringKey === key ? 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20' : 'border-slate-200 dark:border-slate-700'}`}>
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-semibold text-sm">{p.name}</div>
                          <div className="text-[11px] text-slate-500">{p.desc}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-xs font-bold">{p.width_mm}x{p.height_mm}mm</div>
                          <div className="text-[10px] text-slate-400">{p.mainBars}xD{p.mainDiameter}</div>
                        </div>
                      </div>
                    </button>
                  ))
                )}
              </div>

              <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3 text-xs">
                <div className="font-semibold mb-1">📋 TENTANG RING BALOK</div>
                <p className="text-slate-600 dark:text-slate-300">
                  Ring balok adalah balok pengikat di puncak dinding yang menahan beban atap dan meratakan ke kolom.
                  Untuk rumah tinggal 1-2 lantai standarnya 150x200mm dengan 4xD10 + sengkang D8@150mm.
                  Ring balok juga berfungsi sebagai pengikat balok atap (kuda-kuda) agar tidak bergeser saat angin/gempa.
                </p>
              </div>

              <ResultCard result={ringResult} />
              <BarArrangementVisual result={ringResult} />
            </>
          )}
        </div>

        <div className="p-4 border-t border-slate-200 dark:border-slate-700 flex justify-end">
          <button onClick={closeBeamDesigner} className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-md text-sm font-medium">
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
}

// ============= RESULT CARD COMPONENT =============
function ResultCard({ result }) {
  return (
    <div className={`rounded-lg p-3 border-2 ${result.safe ? 'bg-green-50 dark:bg-green-900/20 border-green-300 dark:border-green-700' : 'bg-red-50 dark:bg-red-900/20 border-red-300 dark:border-red-700'}`}>
      <div className={`text-sm font-bold mb-2 flex items-center gap-1.5 ${result.safe ? 'text-green-700 dark:text-green-400' : 'text-red-700 dark:text-red-400'}`}>
        {result.safe ? <Check size={16} /> : <AlertTriangle size={16} />}
        HASIL PERHITUNGAN SNI 03-2847-2002
      </div>

      <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-xs">
        <div className="flex justify-between"><span className="text-slate-500">Ukuran:</span><span className="font-bold">{result.width_mm} x {result.height_mm} mm</span></div>
        <div className="flex justify-between"><span className="text-slate-500">d (efektif):</span><span className="font-bold">{result.effectiveDepth_mm} mm</span></div>
        <div className="flex justify-between"><span className="text-slate-500">Tulangan Utama:</span><span className="font-bold">{result.numMainBars} x D{result.mainDiameter_mm}</span></div>
        <div className="flex justify-between"><span className="text-slate-500">Sengkang:</span><span className="font-bold">D{result.stirrupDiameter_mm} @{result.recommendedStirrupSpacing_mm || 150}mm</span></div>
        <div className="flex justify-between"><span className="text-slate-500">As dibutuhkan:</span><span className="font-bold">{result.As_required_mm2} mm²</span></div>
        <div className="flex justify-between"><span className="text-slate-500">As tersedia:</span><span className="font-bold">{result.As_provided_mm2} mm²</span></div>
        <div className="flex justify-between"><span className="text-slate-500">Momen Maks:</span><span className="font-bold">{result.maxMoment_kNm} kNm</span></div>
        <div className="flex justify-between"><span className="text-slate-500">Geser Maks:</span><span className="font-bold">{result.maxShear_kN} kN</span></div>
        <div className="flex justify-between"><span className="text-slate-500">φVc:</span><span className="font-bold">{result.phiVc_kN} kN</span></div>
        <div className="flex justify-between"><span className="text-slate-500">ρ (rasio):</span><span className="font-bold">{result.rho}%</span></div>
        <div className="flex justify-between"><span className="text-slate-500">Defleksi:</span><span className="font-bold">{result.deflection_mm} / {result.deflectionLimit_mm} mm</span></div>
        <div className="flex justify-between"><span className="text-slate-500">Berat Besi Utama:</span><span className="font-bold">{result.mainBarWeight_kg} kg</span></div>
      </div>

      <div className="flex flex-wrap gap-1.5 mt-2">
        <CheckBadge ok={result.steelOK} label="As ≥ As_min" />
        <CheckBadge ok={result.rhoOK} label="ρ 0.1%-8%" />
        <CheckBadge ok={result.shearOK} label="Geser φVc ≥ Vu" />
        <CheckBadge ok={result.deflectionOK} label="Defleksi ≤ L/360" />
      </div>
    </div>
  );
}

function SloofResultCard({ result }) {
  return (
    <div className={`rounded-lg p-3 border-2 ${result.safe ? 'bg-green-50 dark:bg-green-900/20 border-green-300 dark:border-green-700' : 'bg-red-50 dark:bg-red-900/20 border-red-300 dark:border-red-700'}`}>
      <div className={`text-sm font-bold mb-2 flex items-center gap-1.5 ${result.safe ? 'text-green-700 dark:text-green-400' : 'text-red-700 dark:text-red-400'}`}>
        {result.safe ? <Check size={16} /> : <AlertTriangle size={16} />}
        HASIL SLOOF SNI 03-2847-2002 (Kontak Tanah, Cover 50mm)
      </div>

      <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-xs">
        <div className="flex justify-between"><span className="text-slate-500">Ukuran:</span><span className="font-bold">{result.width_mm} x {result.height_mm} mm</span></div>
        <div className="flex justify-between"><span className="text-slate-500">d (efektif):</span><span className="font-bold">{result.effectiveDepth_mm} mm</span></div>
        <div className="flex justify-between"><span className="text-slate-500">Tulangan Utama:</span><span className="font-bold">{result.numMainBars} x D{result.mainDiameter_mm}</span></div>
        <div className="flex justify-between"><span className="text-slate-500">Cover:</span><span className="font-bold">{result.cover_mm} mm</span></div>
        <div className="flex justify-between"><span className="text-slate-500">Sengkang (tumpuan):</span><span className="font-bold">D{result.stirrupDiameter_mm} @{result.stirrupSpacingSupport_mm}mm</span></div>
        <div className="flex justify-between"><span className="text-slate-500">Sengkang (tengah):</span><span className="font-bold">D{result.stirrupDiameter_mm} @{result.stirrupSpacingField_mm}mm</span></div>
        <div className="flex justify-between"><span className="text-slate-500">As dibutuhkan:</span><span className="font-bold">{result.As_required_mm2} mm²</span></div>
        <div className="flex justify-between"><span className="text-slate-500">As tersedia:</span><span className="font-bold">{result.As_provided_mm2} mm²</span></div>
        <div className="flex justify-between"><span className="text-slate-500">Momen Maks:</span><span className="font-bold">{result.maxMoment_kNm} kNm</span></div>
        <div className="flex justify-between"><span className="text-slate-500">Geser Maks:</span><span className="font-bold">{result.maxShear_kN} kN</span></div>
        <div className="flex justify-between"><span className="text-slate-500">Jumlah Sengkang:</span><span className="font-bold">{result.totalStirrups} buah per bentang</span></div>
        <div className="flex justify-between"><span className="text-slate-500">Vol Beton:</span><span className="font-bold">{result.concreteVolume_m3} m³ per bentang</span></div>
        <div className="flex justify-between"><span className="text-slate-500">Berat Besi Utama:</span><span className="font-bold">{result.mainBarWeight_kg} kg</span></div>
        <div className="flex justify-between"><span className="text-slate-500">Berat Sengkang:</span><span className="font-bold">{result.stirrupWeight_kg} kg</span></div>
        <div className="flex justify-between"><span className="text-slate-500">Total Berat Besi:</span><span className="font-bold text-orange-600 dark:text-orange-400">{result.totalSteelWeight_kg} kg</span></div>
      </div>

      <div className="flex flex-wrap gap-1.5 mt-2">
        <CheckBadge ok={result.steelOK} label="As ≥ As_min" />
        <CheckBadge ok={result.rhoOK} label="ρ 0.1%-8%" />
        <CheckBadge ok={result.shearOK} label="Geser φVc ≥ Vu" />
      </div>
    </div>
  );
}

function BarArrangementVisual({ result }) {
  if (!result?.arrangement?.mainBarPositions) return null;
  return (
    <div className="bg-slate-100 dark:bg-slate-700/50 rounded-lg p-3">
      <div className="text-xs font-semibold mb-2">PENEMPATAN TULANGAN (POTONGAN MELINTANG)</div>
      <div className="flex justify-center">
        <svg width="140" height="100" viewBox="-70 -50 140 100">
          <rect x={-result.width_mm/4} y={-result.height_mm/4} width={result.width_mm/2} height={result.height_mm/2} fill="none" stroke="#64748b" strokeWidth="1.5" rx="2" />
          <rect x={-result.width_mm/4 + 8} y={-result.height_mm/4 + 8} width={result.width_mm/2 - 16} height={result.height_mm/2 - 16} fill="none" stroke="#94a3b8" strokeWidth="1" strokeDasharray="3 2" rx="1" />
          {result.arrangement.mainBarPositions.map((pos, i) => (
            <g key={i}>
              <circle cx={pos.x / 2.5} cy={pos.y / 2.5} r={result.mainDiameter_mm / 4} fill={pos.label === 'T' ? '#dc2626' : '#2563eb'} stroke="#000" strokeWidth="0.5" />
              <text x={pos.x / 2.5 + 5} y={pos.y / 2.5 + 3} fontSize="6" fill="#64748b">{pos.label}</text>
            </g>
          ))}
        </svg>
      </div>
      <div className="text-[10px] text-center text-slate-400 mt-1">
        🔴 = Tulangan atas (T) · 🔵 = Tulangan bawah (B) · Garis putus = Sengkang
      </div>
    </div>
  );
}

function CheckBadge({ ok, label }) {
  return (
    <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${ok ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'}`}>
      {ok ? '✓' : '✗'} {label}
    </span>
  );
}
