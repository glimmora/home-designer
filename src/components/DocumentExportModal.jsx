import React, { useState } from 'react';
import { useStore } from '../lib/store';
import {
  exportDesignDocument,
  exportStructuralDocument,
  exportRebarDocument,
} from '../lib/documentExporter';
import {
  FileText,
  X,
  FileStack,
  Building,
  Nut,
  Check,
  AlertCircle,
  Download,
} from 'lucide-react';

export default function DocumentExportModal() {
  const {
    isDocumentModalOpen,
    closeDocumentModal,
    floors,
    plot,
    building,
    unit,
    structuralSettings,
    seismicSettings,
    liveLoadType,
  } = useStore();

  const [exporting, setExporting] = useState(null);
  const [status, setStatus] = useState(null);

  if (!isDocumentModalOpen) return null;

  const showStatus = (msg, type = 'success') => {
    setStatus({ msg, type });
    setTimeout(() => setStatus(null), 3000);
  };

  const handleExportDesign = async () => {
    setExporting('design');
    try {
      await new Promise(r => setTimeout(r, 100)); // let UI update
      exportDesignDocument({ floors, plot, building, unit, structuralSettings });
      showStatus('Dokumen Desain berhasil dibuat!');
    } catch (e) {
      showStatus('Error: ' + e.message, 'error');
    } finally {
      setExporting(null);
    }
  };

  const handleExportStructural = async () => {
    setExporting('structural');
    try {
      await new Promise(r => setTimeout(r, 100));
      exportStructuralDocument({ floors, plot, building, structuralSettings, seismicSettings, liveLoadType });
      showStatus('Dokumen Struktur berhasil dibuat!');
    } catch (e) {
      showStatus('Error: ' + e.message, 'error');
    } finally {
      setExporting(null);
    }
  };

  const handleExportRebar = async () => {
    setExporting('rebar');
    try {
      await new Promise(r => setTimeout(r, 100));
      exportRebarDocument({ floors, plot, building, structuralSettings });
      showStatus('Dokumen Pembesian berhasil dibuat!');
    } catch (e) {
      showStatus('Error: ' + e.message, 'error');
    } finally {
      setExporting(null);
    }
  };

  const documents = [
    {
      id: 'design',
      icon: Building,
      title: 'Dokumen Desain',
      subtitle: 'Denah & Spesifikasi Bangunan',
      color: 'indigo',
      description: 'Denah lantai, jadwal ruangan, jadwal pintu/jendela, jadwal material furnitur. Format PDF profesional.',
      contents: [
        'Informasi umum bangunan (luas, KDB, tinggi lantai)',
        'Denah per lantai dengan posisi dinding, kolom, furnitur',
        'Jadwal ruangan (room schedule) per lantai',
        'Jadwal pintu & jendela (door/window schedule)',
        'Jadwal material furnitur',
      ],
      onClick: handleExportDesign,
    },
    {
      id: 'structural',
      icon: FileStack,
      title: 'Dokumen Struktur',
      subtitle: 'Analisis & Perhitungan Struktur',
      color: 'red',
      description: 'Spesifikasi material, analisis beban, gempa SNI 1726-2012, kapasitas kolom & balok, safety score.',
      contents: [
        'Spesifikasi material (beton, baja, tulangan)',
        'Analisis beban mati & beban hidup (SNI 1727-2013)',
        'Analisis gempa: V = Cs x W (SNI 1726-2012)',
        'Kapasitas kolom: φPn = 0.65[0.85f\'c(Ag-As)+fyxAs]',
        'Kapasitas dinding sebagai balok: φMn & φVc',
        'Ringkasan keamanan (Safety Score)',
        'Referensi standar SNI',
      ],
      onClick: handleExportStructural,
    },
    {
      id: 'rebar',
      icon: Nut,
      title: 'Dokumen Pembesian',
      subtitle: 'Detail Penulangan & BBS',
      color: 'amber',
      description: 'Spesifikasi penulangan SNI, detail rebar per kolom, Bar Bending Schedule, cek kepatuhan SNI.',
      contents: [
        'Spesifikasi penulangan (diameter, mutu, berat)',
        'Pemeriksaan kepatuhan SNI 03-2847-2002',
        'Detail pembesian per kolom (ρ, As, Ag, φPn)',
        'Bar Bending Schedule (BBS) per lantai',
        'Perhitungan berat besi total',
        'Referensi klausa SNI (7.7, 7.10, 10.5, 10.9)',
      ],
      onClick: handleExportRebar,
    },
  ];

  const colorClasses = {
    indigo: {
      border: 'border-indigo-200 dark:border-indigo-800',
      hover: 'hover:bg-indigo-50 dark:hover:bg-indigo-900/30',
      text: 'text-indigo-600 dark:text-indigo-400',
      bg: 'bg-indigo-600',
      badge: 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300',
    },
    red: {
      border: 'border-red-200 dark:border-red-800',
      hover: 'hover:bg-red-50 dark:hover:bg-red-900/30',
      text: 'text-red-600 dark:text-red-400',
      bg: 'bg-red-600',
      badge: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300',
    },
    amber: {
      border: 'border-amber-200 dark:border-amber-800',
      hover: 'hover:bg-amber-50 dark:hover:bg-amber-900/30',
      text: 'text-amber-600 dark:text-amber-400',
      bg: 'bg-amber-600',
      badge: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300',
    },
  };

  // Summary stats
  const totalItems = floors.reduce((a, f) => a + f.items.length, 0);
  const totalWalls = floors.reduce((a, f) => a + f.walls.length, 0);
  const totalColumns = floors.reduce((a, f) => a + f.columns.length, 0);

  return (
    <div
      className="modal-overlay fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-2 sm:p-4"
      onMouseDown={(e) => e.target === e.currentTarget && closeDocumentModal()}
    >
      <div className="modal-content bg-white dark:bg-slate-800 dark:text-slate-100 rounded-xl shadow-2xl w-full max-w-3xl max-h-[92vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700 flex-shrink-0">
          <h2 className="text-lg font-bold flex items-center gap-2">
            <FileText className="text-violet-600" size={20} />
            Export Dokumen Teknis
          </h2>
          <button
            onClick={closeDocumentModal}
            className="text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700 p-1.5 rounded"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Status message */}
          {status && (
            <div
              className={`p-3 rounded-lg flex items-center gap-2 text-sm ${
                status.type === 'error'
                  ? 'bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800'
                  : 'bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-800'
              }`}
            >
              {status.type === 'error' ? <AlertCircle size={16} /> : <Check size={16} />}
              {status.msg}
            </div>
          )}

          {/* Project summary */}
          <div className="bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-700 rounded-lg p-3">
            <div className="grid grid-cols-4 gap-3 text-center">
              <div>
                <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">{floors.length}</div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400">Lantai</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">{totalItems}</div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400">Item</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">{totalWalls}</div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400">Dinding</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">{totalColumns}</div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400">Kolom</div>
              </div>
            </div>
          </div>

          {/* Document options */}
          <div className="space-y-3">
            {documents.map((doc) => {
              const Icon = doc.icon;
              const colors = colorClasses[doc.color];
              const isExporting = exporting === doc.id;
              return (
                <div
                  key={doc.id}
                  className={`border-2 rounded-lg p-4 transition-all ${colors.border} ${colors.hover}`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 ${colors.badge}`}>
                      <Icon size={24} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <h3 className="font-bold text-slate-800 dark:text-slate-100">{doc.title}</h3>
                        <span className={`text-[10px] ${colors.badge} px-2 py-0.5 rounded-full font-medium`}>
                          PDF
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">{doc.subtitle}</p>
                      <p className="text-sm text-slate-600 dark:text-slate-300 mb-3">{doc.description}</p>

                      {/* Contents list */}
                      <div className="bg-white/50 dark:bg-slate-800/50 rounded-lg p-2 mb-3">
                        <div className="text-[10px] font-semibold uppercase text-slate-400 mb-1">Isi Dokumen:</div>
                        <ul className="text-xs text-slate-600 dark:text-slate-300 space-y-0.5">
                          {doc.contents.map((c, i) => (
                            <li key={i} className="flex items-start gap-1.5">
                              <Check size={11} className="flex-shrink-0 mt-0.5 text-green-500" />
                              {c}
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Export button */}
                      <button
                        onClick={doc.onClick}
                        disabled={isExporting}
                        className={`${colors.bg} hover:opacity-90 disabled:opacity-50 text-white px-4 py-2 rounded-md text-sm font-medium flex items-center gap-1.5 transition-all`}
                      >
                        {isExporting ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            Membuat dokumen...
                          </>
                        ) : (
                          <>
                            <Download size={14} />
                            Export PDF
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* SNI info */}
          <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
            <h4 className="text-xs font-semibold text-blue-800 dark:text-blue-300 mb-1">
              📋 Standar SNI yang Digunakan
            </h4>
            <ul className="text-xs text-blue-700 dark:text-blue-300 space-y-0.5 list-disc list-inside">
              <li><strong>SNI 03-2847-2002</strong> — Struktur Beton Bertulang (kolom, balok, plat)</li>
              <li><strong>SNI 1726-2012</strong> — Beban Gempa (base shear, hazard zones)</li>
              <li><strong>SNI 1727-2013</strong> — Beban Minimum (dead load, live load)</li>
              <li><strong>SNI 03-1729-2002</strong> — Baja Bukan Profil (mutu fy besi)</li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-700 flex justify-end">
          <button
            onClick={closeDocumentModal}
            className="px-4 py-2 border border-slate-300 dark:border-slate-600 dark:text-slate-200 rounded-md text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-700"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
}
