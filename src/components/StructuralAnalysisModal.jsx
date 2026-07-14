import React, { useState, useMemo } from 'react';
import { useStore, useActiveFloor } from '../lib/store';
import {
  analyzeBuilding,
  calculateColumnCapacity,
  calculateBeamCapacity,
  generateSNIRebarLayout,
  formatForce,
  formatMoment,
  formatUtilization,
  concreteGrades,
  steelGrades,
  rebarProperties,
  seismicHazardZones,
  soilTypes,
  liveLoads,
  responseModificationFactors,
  importanceFactors,
  DEFAULT_CONCRETE_GRADE,
  DEFAULT_STEEL_GRADE,
} from '../lib/structuralAnalysis';
import {
  Microscope,
  X,
  AlertTriangle,
  CheckCircle,
  XCircle,
  AlertCircle,
  Building,
  Columns3,
  Layers,
  Waves,
  Calculator,
  Play,
  RefreshCw,
  Save,
} from 'lucide-react';

export default function StructuralAnalysisModal() {
  const {
    isStructuralModalOpen,
    closeStructuralModal,
    floors,
    plot,
    building,
    structuralSettings,
    seismicSettings,
    liveLoadType,
    setStructuralSettings,
    setSeismicSettings,
    setLiveLoadType,
    structuralResults,
    setStructuralResults,
  } = useStore();

  const [activeTab, setActiveTab] = useState('summary'); // summary | columns | walls | seismic | settings
  const [analyzing, setAnalyzing] = useState(false);

  const runAnalysis = () => {
    setAnalyzing(true);
    // Simulate async (heavy compute)
    setTimeout(() => {
      try {
        const results = analyzeBuilding({
          floors,
          plot,
          building,
          settings: structuralSettings,
          seismic: seismicSettings,
          liveLoadType,
        });
        setStructuralResults(results);
      } catch (e) {
        console.error('Analysis failed:', e);
        alert('Analisis gagal: ' + e.message);
      } finally {
        setAnalyzing(false);
      }
    }, 100);
  };

  // Auto-run analysis on first open
  React.useEffect(() => {
    if (isStructuralModalOpen && !structuralResults && !analyzing) {
      runAnalysis();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isStructuralModalOpen]);

  if (!isStructuralModalOpen) return null;

  const results = structuralResults;

  return (
    <div
      className="modal-overlay fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4"
      onMouseDown={(e) => e.target === e.currentTarget && closeStructuralModal()}
    >
      <div className="modal-content bg-white dark:bg-slate-800 dark:text-slate-100 rounded-xl shadow-2xl w-full max-w-5xl max-h-[92vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700 flex-shrink-0">
          <h2 className="text-lg font-bold flex items-center gap-2">
            <Microscope className="text-purple-600" size={20} />
            Structural Analysis (SNI)
            <span className="text-xs bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 px-2 py-0.5 rounded-full font-normal">
              SNI 03-2847-2002 · SNI 1726-2012
            </span>
          </h2>
          <button
            onClick={closeStructuralModal}
            className="text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700 p-1 rounded"
          >
            <X size={20} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-700/50 flex-shrink-0">
          {[
            { id: 'summary', label: 'Ringkasan', icon: Calculator },
            { id: 'columns', label: 'Kolom', icon: Columns3 },
            { id: 'walls', label: 'Dinding/Balok', icon: Building },
            { id: 'seismic', label: 'Gempa', icon: Waves },
            { id: 'settings', label: 'Pengaturan', icon: Layers },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2.5 text-sm font-medium flex items-center gap-1.5 border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-purple-600 text-purple-600 dark:text-purple-400'
                    : 'border-transparent text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                }`}
              >
                <Icon size={14} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {analyzing ? (
            <div className="flex flex-col items-center justify-center py-16">
              <RefreshCw size={32} className="text-purple-600 animate-spin mb-3" />
              <p className="text-slate-600 dark:text-slate-300">Menganalisis struktur...</p>
              <p className="text-xs text-slate-400 mt-1">Menghitung kapasitas per SNI 03-2847-2002</p>
            </div>
          ) : !results ? (
            <div className="text-center py-16">
              <Microscope size={48} className="mx-auto text-slate-300 mb-3" />
              <p className="text-slate-500 dark:text-slate-400 mb-3">Belum ada hasil analisis</p>
              <button
                onClick={runAnalysis}
                className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-md text-sm font-medium flex items-center gap-1.5 mx-auto"
              >
                <Play size={14} />
                Jalankan Analisis
              </button>
            </div>
          ) : (
            <>
              {activeTab === 'summary' && <SummaryTab results={results} onRerun={runAnalysis} />}
              {activeTab === 'columns' && <ColumnsTab results={results} settings={structuralSettings} />}
              {activeTab === 'walls' && <WallsTab results={results} />}
              {activeTab === 'seismic' && <SeismicTab results={results} />}
              {activeTab === 'settings' && (
                <SettingsTab
                  structuralSettings={structuralSettings}
                  seismicSettings={seismicSettings}
                  liveLoadType={liveLoadType}
                  setStructuralSettings={setStructuralSettings}
                  setSeismicSettings={setSeismicSettings}
                  setLiveLoadType={setLiveLoadType}
                  onRerun={runAnalysis}
                />
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-700 flex justify-between items-center flex-shrink-0 bg-white dark:bg-slate-800">
          <div className="text-xs text-slate-500 dark:text-slate-400">
            {results && (
              <span>
                Safety Score: <strong className={
                  results.totals.safetyScore >= 80 ? 'text-green-600' :
                  results.totals.safetyScore >= 50 ? 'text-amber-600' : 'text-red-600'
                }>{results.totals.safetyScore}/100</strong>
                {' · '}
                {results.safetyChecks.critical.length} critical · {results.safetyChecks.warnings.length} warning
              </span>
            )}
          </div>
          <div className="flex gap-2">
            <button
              onClick={runAnalysis}
              disabled={analyzing}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white rounded-md text-sm font-medium flex items-center gap-1.5"
            >
              <RefreshCw size={14} className={analyzing ? 'animate-spin' : ''} />
              Re-analisis
            </button>
            <button
              onClick={closeStructuralModal}
              className="px-4 py-2 border border-slate-300 dark:border-slate-600 dark:text-slate-200 rounded-md text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-700"
            >
              Tutup
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============= SUMMARY TAB =============
function SummaryTab({ results, onRerun }) {
  const score = results.totals.safetyScore;
  const scoreColor = score >= 80 ? 'green' : score >= 50 ? 'amber' : 'red';
  const scoreBg = {
    green: 'from-green-500 to-green-700',
    amber: 'from-amber-500 to-amber-700',
    red: 'from-red-500 to-red-700',
  }[scoreColor];

  return (
    <div className="space-y-4">
      {/* Score card */}
      <div className={`bg-gradient-to-r ${scoreBg} text-white rounded-xl p-5 shadow-lg`}>
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm opacity-90 mb-1">Safety Score (Penilaian Struktur)</div>
            <div className="text-4xl font-bold">{score}<span className="text-2xl opacity-70">/100</span></div>
            <div className="text-xs opacity-80 mt-1">
              {score >= 80 ? '✓ Struktur MEMENUHI standar SNI' :
               score >= 50 ? '⚠ Struktur perlu perhatian' :
               '✗ Struktur TIDAK AMAN - perlu redesain'}
            </div>
          </div>
          <div className="text-6xl opacity-30">
            {score >= 80 ? '✓' : score >= 50 ? '⚠' : '✗'}
          </div>
        </div>
      </div>

      {/* Critical & warnings */}
      {results.safetyChecks.critical.length > 0 && (
        <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg p-3">
          <h3 className="text-sm font-bold text-red-800 dark:text-red-300 mb-2 flex items-center gap-1.5">
            <XCircle size={14} />
            Critical ({results.safetyChecks.critical.length})
          </h3>
          <ul className="text-xs text-red-700 dark:text-red-300 space-y-1 list-disc list-inside">
            {results.safetyChecks.critical.map((msg, i) => <li key={i}>{msg}</li>)}
          </ul>
        </div>
      )}
      {results.safetyChecks.warnings.length > 0 && (
        <div className="bg-amber-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-800 rounded-lg p-3">
          <h3 className="text-sm font-bold text-amber-800 dark:text-amber-300 mb-2 flex items-center gap-1.5">
            <AlertTriangle size={14} />
            Warnings ({results.safetyChecks.warnings.length})
          </h3>
          <ul className="text-xs text-amber-700 dark:text-amber-300 space-y-1 list-disc list-inside">
            {results.safetyChecks.warnings.map((msg, i) => <li key={i}>{msg}</li>)}
          </ul>
        </div>
      )}
      {results.safetyChecks.critical.length === 0 && results.safetyChecks.warnings.length === 0 && (
        <div className="bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 rounded-lg p-3">
          <h3 className="text-sm font-bold text-green-800 dark:text-green-300 flex items-center gap-1.5">
            <CheckCircle size={14} />
            Semua pemeriksaan aman!
          </h3>
          <p className="text-xs text-green-700 dark:text-green-300 mt-1">
            Struktur memenuhi semua persyaratan SNI 03-2847-2002 & SNI 1726-2012
          </p>
        </div>
      )}

      {/* Statistics grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard
          label="Total Lantai"
          value={results.floors.length}
          icon={Building}
          color="indigo"
        />
        <StatCard
          label="Total Kolom"
          value={results.totals.totalColumns}
          icon={Columns3}
          color="blue"
        />
        <StatCard
          label="Total Dinding"
          value={`${results.totals.totalWalls_m.toFixed(1)} m`}
          icon={Layers}
          color="purple"
        />
        <StatCard
          label="Total Luas Lantai"
          value={`${results.totals.totalFloorArea_m2.toFixed(1)} m²`}
          icon={Calculator}
          color="emerald"
        />
        <StatCard
          label="Berat Total"
          value={formatForce(results.totals.totalWeight_kN)}
          icon={Building}
          color="amber"
        />
        <StatCard
          label="Berat Seismik"
          value={formatForce(results.totals.totalSeismicWeight_kN)}
          icon={Waves}
          color="rose"
        />
        <StatCard
          label="Avg Kapasitas Kolom"
          value={results.totals.avgColumnCapacity_kN > 0 ? formatForce(results.totals.avgColumnCapacity_kN) : '-'}
          icon={Columns3}
          color="cyan"
        />
        <StatCard
          label="Max Utilisasi Kolom"
          value={`${(results.totals.maxColumnUtilization * 100).toFixed(1)}%`}
          icon={AlertCircle}
          color={results.totals.maxColumnUtilization > 1 ? 'red' : results.totals.maxColumnUtilization > 0.85 ? 'amber' : 'green'}
        />
      </div>

      {/* SNI Standards Used */}
      <div className="bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-700 rounded-lg p-3">
        <h3 className="text-sm font-semibold mb-2 flex items-center gap-1.5">
          <Microscope size={14} className="text-purple-600" />
          Standar SNI yang Digunakan
        </h3>
        <ul className="text-xs text-slate-600 dark:text-slate-300 space-y-1">
          <li><strong>SNI 03-2847-2002</strong> — Tata Cara Perhitungan Struktur Beton Bertulang</li>
          <li><strong>SNI 1726-2012</strong> — Beban Minimum untuk Desain Bangunan terhadap Gempa</li>
          <li><strong>SNI 1727-2013</strong> — Beban Minimum untuk Desain Bangunan dan Struktur Lain</li>
          <li><strong>SNI 03-1729-2002</strong> — Baja Bukan Profil untuk Struktur (untuk fy besi)</li>
        </ul>
      </div>
    </div>
  );
}

// ============= COLUMNS TAB =============
function ColumnsTab({ results, settings }) {
  return (
    <div className="space-y-3">
      <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
        <h3 className="text-sm font-bold text-blue-800 dark:text-blue-300 mb-1">
          Analisis Kapasitas Kolom per SNI 03-2847-2002
        </h3>
        <p className="text-xs text-blue-700 dark:text-blue-300">
          φPn = 0.65 x [0.85 x f'c x (Ag - As) + fy x As] · Min tulangan 1%, maks 8% · Min 4 batang
        </p>
      </div>

      {results.floors.map((floor, fIdx) => (
        <div key={fIdx} className="border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden">
          <div className="bg-slate-100 dark:bg-slate-700 px-3 py-2 font-semibold text-sm flex items-center justify-between">
            <span>{floor.name}</span>
            <span className="text-xs text-slate-500">
              {floor.columnCount} kolom · Tinggi {floor.height} cm
            </span>
          </div>

          {floor.columns.length === 0 ? (
            <div className="p-3 text-sm text-slate-400 text-center">Tidak ada kolom</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead className="bg-slate-50 dark:bg-slate-700/50">
                  <tr>
                    <th className="text-left p-2">ID</th>
                    <th className="text-right p-2">Ukuran</th>
                    <th className="text-right p-2">Kapasitas (φPn)</th>
                    <th className="text-right p-2">Beban</th>
                    <th className="text-right p-2">Utilisasi</th>
                    <th className="text-right p-2">ρ (rasio)</th>
                    <th className="text-center p-2">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {floor.columns.map((col) => {
                    const util = formatUtilization(col.utilization);
                    return (
                      <tr key={col.id} className="border-t border-slate-100 dark:border-slate-700">
                        <td className="p-2 font-mono">#{col.id}</td>
                        <td className="p-2 text-right">{col.size_mm}x{col.size_mm} mm</td>
                        <td className="p-2 text-right font-medium">{formatForce(col.capacity_kN)} ({col.capacity_ton.toFixed(1)} t)</td>
                        <td className="p-2 text-right">{formatForce(col.load_kN)}</td>
                        <td className={`p-2 text-right font-medium text-${util.color}-600 dark:text-${util.color}-400`}>
                          {util.text}
                        </td>
                        <td className="p-2 text-right">
                          {(col.rho * 100).toFixed(2)}%
                          {!col.rhoCheck.passed && <span className="text-red-500 ml-1">⚠</span>}
                        </td>
                        <td className="p-2 text-center">
                          {col.safe ? (
                            <CheckCircle size={14} className="inline text-green-500" />
                          ) : (
                            <XCircle size={14} className="inline text-red-500" />
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* SNI rebar detail */}
          {floor.rebarLayout && (
            <div className="bg-slate-50 dark:bg-slate-700/30 p-3 text-xs">
              <div className="font-semibold mb-1 flex items-center gap-1">
                <Microscope size={11} />
                Detail Pembesian (SNI)
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-slate-600 dark:text-slate-300">
                <div>
                  <span className="text-slate-400">Tulangan Utama:</span>{' '}
                  <strong>{floor.rebarLayout.specs.numMainBars} x D{floor.rebarLayout.specs.mainBarDiameter}</strong>
                </div>
                <div>
                  <span className="text-slate-400">Sengkang:</span>{' '}
                  <strong>D{floor.rebarLayout.specs.stirrupDiameter} @{floor.rebarLayout.specs.stirrupSpacing}mm</strong>
                </div>
                <div>
                  <span className="text-slate-400">Selimut:</span>{' '}
                  <strong>{floor.rebarLayout.specs.cover} mm</strong>
                </div>
                <div>
                  <span className="text-slate-400">f'c / fy:</span>{' '}
                  <strong>{floor.rebarLayout.specs.fc}/{floor.rebarLayout.specs.fy} MPa</strong>
                </div>
              </div>
              <div className="mt-2 flex flex-wrap gap-1">
                <SniBadge passed={floor.rebarLayout.sniChecks.rhoPassed} label="ρ dalam 1-8%" />
                <SniBadge passed={floor.rebarLayout.sniChecks.minBarsPassed} label="Min 4 batang" />
                <SniBadge passed={floor.rebarLayout.sniChecks.isShortColumn} label="Kolom pendek" />
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

// ============= WALLS TAB =============
function WallsTab({ results }) {
  return (
    <div className="space-y-3">
      <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
        <h3 className="text-sm font-bold text-blue-800 dark:text-blue-300 mb-1">
          Analisis Dinding sebagai Balok per SNI 03-2847-2002
        </h3>
        <p className="text-xs text-blue-700 dark:text-blue-300">
          φMn = 0.8 x As x fy x (d - a/2) · φVc = 0.75 x 0.17√f'c x b x d
        </p>
      </div>

      {results.floors.map((floor, fIdx) => (
        <div key={fIdx} className="border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden">
          <div className="bg-slate-100 dark:bg-slate-700 px-3 py-2 font-semibold text-sm flex items-center justify-between">
            <span>{floor.name}</span>
            <span className="text-xs text-slate-500">{floor.walls.length} dinding</span>
          </div>

          {floor.walls.length === 0 ? (
            <div className="p-3 text-sm text-slate-400 text-center">Tidak ada dinding</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead className="bg-slate-50 dark:bg-slate-700/50">
                  <tr>
                    <th className="text-left p-2">ID</th>
                    <th className="text-right p-2">Panjang</th>
                    <th className="text-right p-2">Kap. Momen (φMn)</th>
                    <th className="text-right p-2">Momen Beban</th>
                    <th className="text-right p-2">Kap. Geser (φVc)</th>
                    <th className="text-right p-2">Geser Beban</th>
                    <th className="text-center p-2">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {floor.walls.map((wall) => {
                    const mUtil = formatUtilization(wall.momentUtilization);
                    const vUtil = formatUtilization(wall.shearUtilization);
                    return (
                      <tr key={wall.id} className="border-t border-slate-100 dark:border-slate-700">
                        <td className="p-2 font-mono">#{wall.id}</td>
                        <td className="p-2 text-right">{wall.length_m.toFixed(2)} m</td>
                        <td className="p-2 text-right font-medium">{formatMoment(wall.capacity_Mn_kNm)}</td>
                        <td className={`p-2 text-right text-${mUtil.color}-600 dark:text-${mUtil.color}-400`}>
                          {formatMoment(wall.load_moment_kNm)} ({mUtil.text})
                        </td>
                        <td className="p-2 text-right font-medium">{formatForce(wall.capacity_Vc_kN)}</td>
                        <td className={`p-2 text-right text-${vUtil.color}-600 dark:text-${vUtil.color}-400`}>
                          {formatForce(wall.load_shear_kN)} ({vUtil.text})
                        </td>
                        <td className="p-2 text-center">
                          {wall.safe ? (
                            <CheckCircle size={14} className="inline text-green-500" />
                          ) : (
                            <XCircle size={14} className="inline text-red-500" />
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

// ============= SEISMIC TAB =============
function SeismicTab({ results }) {
  if (!results.seismic) {
    return <div className="text-center text-slate-400 py-8">Analisis gempa tidak tersedia</div>;
  }
  const s = results.seismic;

  return (
    <div className="space-y-4">
      <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
        <h3 className="text-sm font-bold text-blue-800 dark:text-blue-300 mb-1">
          Analisis Beban Gempa per SNI 1726-2012
        </h3>
        <p className="text-xs text-blue-700 dark:text-blue-300">
          V = Cs x W · Cs = SDS / (R / Ie) · dengan batasan Cs_max & Cs_min
        </p>
      </div>

      {/* Base shear card */}
      <div className="bg-gradient-to-r from-rose-500 to-rose-700 text-white rounded-xl p-5 shadow-lg">
        <div className="text-rose-100 text-sm mb-1">Gaya Gempa Dasar (Base Shear, V)</div>
        <div className="text-3xl font-bold">{formatForce(s.V)}</div>
        <div className="text-rose-100 text-xs mt-1">
          {s.city} · Zone {s.zone} · Cs = {s.Cs.toFixed(4)} · T = {s.periodT.toFixed(2)}s
        </div>
      </div>

      {/* Seismic parameters */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <ParamCard label="Ss (Mapped)" value={s.Ss} unit="g" desc="Spektrum percepatan pendek" />
        <ParamCard label="S1 (Mapped)" value={s.S1} unit="g" desc="Spektrum 1-detik" />
        <ParamCard label="SMS = Fa·Ss" value={s.SMS.toFixed(3)} unit="g" desc="Spektrum max pendek" />
        <ParamCard label="SM1 = Fv·S1" value={s.SM1.toFixed(3)} unit="g" desc="Spektrum max 1-detik" />
        <ParamCard label="SDS = ⅔SMS" value={s.SDS.toFixed(3)} unit="g" desc="Spektrum desain pendek" />
        <ParamCard label="SD1 = ⅔SM1" value={s.SD1.toFixed(3)} unit="g" desc="Spektrum desain 1-detik" />
        <ParamCard label="R (Response Mod.)" value={s.R} unit="" desc="Faktor modifikasi respon" />
        <ParamCard label="Ie (Importance)" value={s.Ie} unit="" desc="Faktor kepentingan" />
      </div>

      {/* Seismic weight comparison */}
      <div className="border border-slate-200 dark:border-slate-700 rounded-lg p-3">
        <h4 className="font-semibold text-sm mb-2">Perbandingan Beban</h4>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-slate-600 dark:text-slate-400">Berat Total Bangunan (W):</span>
            <span className="font-medium">{formatForce(results.totals.totalWeight_kN)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-600 dark:text-slate-400">Berat Efektif Seismik (W x 1.0 DL + 0.25 LL):</span>
            <span className="font-medium">{formatForce(results.totals.totalSeismicWeight_kN)}</span>
          </div>
          <div className="flex justify-between border-t pt-2">
            <span className="text-slate-600 dark:text-slate-400">Gaya Gempa Dasar (V = Cs x W):</span>
            <span className="font-bold text-rose-600 dark:text-rose-400">{formatForce(s.V)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-600 dark:text-slate-400">Rasio V/W (Cs):</span>
            <span className="font-medium">{(s.Cs * 100).toFixed(2)}%</span>
          </div>
        </div>
      </div>

      <div className="bg-amber-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-800 rounded-lg p-3">
        <p className="text-xs text-amber-700 dark:text-amber-300">
          {'⚠️'} <strong>Catatan:</strong> Analisis ini menggunakan metode statik ekuivalen (Equivalent Lateral Force).
          Untuk bangunan tinggi {'(>40m)'} atau irregularitas tinggi, diperlukan analisis dinamik (Response Spectrum
          atau Time History) per SNI 1726-2012 Section 12.
        </p>
      </div>
    </div>
  );
}

// ============= SETTINGS TAB =============
function SettingsTab({
  structuralSettings,
  seismicSettings,
  liveLoadType,
  setStructuralSettings,
  setSeismicSettings,
  setLiveLoadType,
  onRerun,
}) {
  return (
    <div className="space-y-4">
      {/* Material settings */}
      <Section title="Material Beton & Baja">
        <div className="grid grid-cols-2 gap-3">
          <Field label="Mutu Beton (f'c)">
            <select
              className="prop-input"
              value={structuralSettings.concreteGrade}
              onChange={(e) => setStructuralSettings({ concreteGrade: e.target.value })}
            >
              {Object.entries(concreteGrades).map(([k, v]) => (
                <option key={k} value={k}>{v.name}</option>
              ))}
            </select>
          </Field>
          <Field label="Mutu Baja (fy)">
            <select
              className="prop-input"
              value={structuralSettings.steelGrade}
              onChange={(e) => setStructuralSettings({ steelGrade: e.target.value })}
            >
              {Object.entries(steelGrades).map(([k, v]) => (
                <option key={k} value={k}>{v.name}</option>
              ))}
            </select>
          </Field>
        </div>
      </Section>

      {/* Rebar settings */}
      <Section title="Konfigurasi Pembesian (SNI)">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Field label="Tulangan Utama">
            <select
              className="prop-input"
              value={structuralSettings.mainBarDiameter}
              onChange={(e) => setStructuralSettings({ mainBarDiameter: Number(e.target.value) })}
            >
              {Object.entries(rebarProperties).filter(([k]) => !['D4','D6'].includes(k)).map(([k, v]) => (
                <option key={k} value={v.diameter}>{v.name}</option>
              ))}
            </select>
          </Field>
          <Field label="Jumlah Batang">
            <select
              className="prop-input"
              value={structuralSettings.numMainBars}
              onChange={(e) => setStructuralSettings({ numMainBars: Number(e.target.value) })}
            >
              <option value={4}>4 (minimal SNI)</option>
              <option value={6}>6</option>
              <option value={8}>8</option>
              <option value={10}>10</option>
              <option value={12}>12</option>
            </select>
          </Field>
          <Field label="Sengkang">
            <select
              className="prop-input"
              value={structuralSettings.stirrupDiameter}
              onChange={(e) => setStructuralSettings({ stirrupDiameter: Number(e.target.value) })}
            >
              <option value={6}>D6 (6mm)</option>
              <option value={8}>D8 (8mm) — standar</option>
              <option value={10}>D10 (10mm)</option>
            </select>
          </Field>
          <Field label="Spasi Sengkang (mm)">
            <input
              type="number"
              className="prop-input"
              min="75"
              max="300"
              step="25"
              value={structuralSettings.stirrupSpacing}
              onChange={(e) => setStructuralSettings({ stirrupSpacing: Number(e.target.value) })}
            />
          </Field>
          <Field label="Selimut Beton (mm)">
            <input
              type="number"
              className="prop-input"
              min="20"
              max="75"
              step="5"
              value={structuralSettings.cover}
              onChange={(e) => setStructuralSettings({ cover: Number(e.target.value) })}
            />
          </Field>
          <Field label="Tebal Plat (mm)">
            <input
              type="number"
              className="prop-input"
              min="80"
              max="300"
              step="10"
              value={structuralSettings.slabThickness}
              onChange={(e) => setStructuralSettings({ slabThickness: Number(e.target.value) })}
            />
          </Field>
          <Field label="Tebal Dinding (mm)">
            <input
              type="number"
              className="prop-input"
              min="100"
              max="300"
              step="10"
              value={structuralSettings.wallThickness}
              onChange={(e) => setStructuralSettings({ wallThickness: Number(e.target.value) })}
            />
          </Field>
        </div>
      </Section>

      {/* Live load */}
      <Section title="Beban Hidup (SNI 1727-2013)">
        <Field label="Jenis Penggunaan">
          <select
            className="prop-input"
            value={liveLoadType}
            onChange={(e) => setLiveLoadType(e.target.value)}
          >
            {Object.entries(liveLoads).map(([k, v]) => (
              <option key={k} value={k}>{v.name}</option>
            ))}
          </select>
        </Field>
      </Section>

      {/* Seismic settings */}
      <Section title="Parameter Gempa (SNI 1726-2012)">
        <div className="grid grid-cols-2 gap-3">
          <Field label="Lokasi (Kota)">
            <select
              className="prop-input"
              value={seismicSettings.city}
              onChange={(e) => setSeismicSettings({ city: e.target.value })}
            >
              {Object.entries(seismicHazardZones).map(([k, v]) => (
                <option key={k} value={k}>{v.city} (Zone {v.zone})</option>
              ))}
            </select>
          </Field>
          <Field label="Jenis Tanah">
            <select
              className="prop-input"
              value={seismicSettings.soilType}
              onChange={(e) => setSeismicSettings({ soilType: e.target.value })}
            >
              {Object.entries(soilTypes).map(([k, v]) => (
                <option key={k} value={k}>{v.name}</option>
              ))}
            </select>
          </Field>
          <Field label="Sistem Struktur (R)">
            <select
              className="prop-input"
              value={seismicSettings.responseModR}
              onChange={(e) => setSeismicSettings({ responseModR: Number(e.target.value) })}
            >
              {Object.entries(responseModificationFactors).map(([k, v]) => (
                <option key={k} value={v.R}>{v.name}</option>
              ))}
            </select>
          </Field>
          <Field label="Faktor Kepentingan (Ie)">
            <select
              className="prop-input"
              value={seismicSettings.importanceFactor}
              onChange={(e) => setSeismicSettings({ importanceFactor: Number(e.target.value) })}
            >
              {Object.entries(importanceFactors).map(([k, v]) => (
                <option key={k} value={v.Ie}>{v.name}</option>
              ))}
            </select>
          </Field>
        </div>
      </Section>

      <div className="flex justify-end">
        <button
          onClick={onRerun}
          className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-md text-sm font-medium flex items-center gap-1.5"
        >
          <RefreshCw size={14} />
          Re-analisis dengan Pengaturan Baru
        </button>
      </div>
    </div>
  );
}

// ============= HELPER COMPONENTS =============
function StatCard({ label, value, icon: Icon, color }) {
  const colorClasses = {
    indigo: 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800',
    blue: 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800',
    purple: 'bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800',
    emerald: 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
    amber: 'bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800',
    rose: 'bg-rose-50 dark:bg-rose-900/30 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800',
    cyan: 'bg-cyan-50 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-300 border-cyan-200 dark:border-cyan-800',
    green: 'bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800',
    red: 'bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800',
  };
  return (
    <div className={`border rounded-lg p-3 ${colorClasses[color]}`}>
      <div className="flex items-center justify-between mb-1">
        <Icon size={14} />
      </div>
      <div className="text-lg font-bold leading-tight">{value}</div>
      <div className="text-[10px] opacity-80 mt-0.5">{label}</div>
    </div>
  );
}

function ParamCard({ label, value, unit, desc }) {
  return (
    <div className="border border-slate-200 dark:border-slate-700 rounded-lg p-2">
      <div className="text-[10px] text-slate-500 dark:text-slate-400">{label}</div>
      <div className="text-lg font-bold text-slate-800 dark:text-slate-100">
        {value}<span className="text-xs ml-0.5 text-slate-400">{unit}</span>
      </div>
      <div className="text-[9px] text-slate-400 mt-0.5">{desc}</div>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div>
      <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">{title}</h3>
      {children}
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div>
      <label className="text-[11px] text-slate-600 dark:text-slate-300 block mb-1">{label}</label>
      {children}
    </div>
  );
}

function SniBadge({ passed, label }) {
  return (
    <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${
      passed
        ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
        : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
    }`}>
      {passed ? '✓' : '✗'} {label}
    </span>
  );
}
