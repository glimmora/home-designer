import React, { useRef, useState } from 'react';
import { useStore } from '../lib/store';
import { exportToDXF, exportToSVG, exportToGLB, exportToOBJ, exportToSTL, exportToDAE, parseDXF, downloadFile } from '../lib/exporters';
import { exportToIFC } from '../lib/advancedEngineering';
import {
  Download,
  Upload,
  X,
  FileJson,
  FileCode,
  Image as ImageIcon,
  FileText,
  Check,
  AlertCircle,
  Box as BoxIcon,
  Layers,
} from 'lucide-react';

export default function ExportImportModal() {
  const {
    isExportModalOpen,
    closeExportModal,
    exportProject,
    importProject,
    floors,
    plot,
    building,
    mode,
  } = useStore();

  const fileInputRef = useRef(null);
  const dxfInputRef = useRef(null);
  const [importStatus, setImportStatus] = useState(null);
  const [exportStatus, setExportStatus] = useState(null);
  const [exporting3D, setExporting3D] = useState(false);

  if (!isExportModalOpen) return null;

  const showStatus = (msg, type = 'success') => {
    setExportStatus({ msg, type });
    setTimeout(() => setExportStatus(null), 2500);
  };

  // ===== Export JSON project =====
  const handleExportJSON = () => {
    const data = exportProject();
    const json = JSON.stringify(data, null, 2);
    const filename = `home-designer-${new Date().toISOString().slice(0, 10)}.json`;
    downloadFile(json, filename, 'application/json');
    showStatus(`Project diekspor: ${filename}`);
  };

  // ===== Export DXF =====
  const handleExportDXF = () => {
    try {
      const dxf = exportToDXF({ floors, plot, building });
      const filename = `home-designer-${new Date().toISOString().slice(0, 10)}.dxf`;
      downloadFile(dxf, filename, 'application/dxf');
      showStatus(`DXF diekspor: ${filename} (${(dxf.length / 1024).toFixed(1)} KB)`);
    } catch (e) {
      showStatus('Error: ' + e.message, 'error');
    }
  };

  // ===== Export SVG =====
  const handleExportSVG = () => {
    try {
      const svg = exportToSVG({ floors, plot, building });
      const filename = `home-designer-${new Date().toISOString().slice(0, 10)}.svg`;
      downloadFile(svg, filename, 'image/svg+xml');
      showStatus(`SVG diekspor: ${filename} (${(svg.length / 1024).toFixed(1)} KB)`);
    } catch (e) {
      showStatus('Error: ' + e.message, 'error');
    }
  };

  // ===== Export PNG =====
  const handleExportPNG = () => {
    const canvas = document.getElementById('canvas2d');
    if (!canvas) {
      showStatus('PNG hanya tersedia di mode 2D', 'error');
      return;
    }
    const temp = document.createElement('canvas');
    temp.width = canvas.width;
    temp.height = canvas.height;
    const tctx = temp.getContext('2d');
    tctx.fillStyle = 'white';
    tctx.fillRect(0, 0, temp.width, temp.height);
    tctx.drawImage(canvas, 0, 0);
    const filename = `home-designer-${new Date().toISOString().slice(0, 10)}.png`;
    temp.toBlob((blob) => {
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      link.click();
      setTimeout(() => URL.revokeObjectURL(url), 100);
      showStatus(`PNG diekspor: ${filename}`);
    });
  };

  // ===== Export 3D (glTF/OBJ/STL) =====
  const getThreeScene = () => {
    // Access the global THREE scene from View3D via window
    return window.__threeScene || null;
  };

  const handleExportGLB = async () => {
    const scene = getThreeScene();
    if (!scene) {
      showStatus('Aktifkan mode 3D dulu untuk export glTF', 'error');
      return;
    }
    setExporting3D(true);
    try {
      const filename = `home-designer-${new Date().toISOString().slice(0, 10)}.glb`;
      await exportToGLB(scene, filename);
      showStatus(`glTF diekspor: ${filename}`);
    } catch (e) {
      showStatus('Error: ' + e.message, 'error');
    } finally {
      setExporting3D(false);
    }
  };

  const handleExportOBJ = async () => {
    const scene = getThreeScene();
    if (!scene) {
      showStatus('Aktifkan mode 3D dulu untuk export OBJ', 'error');
      return;
    }
    setExporting3D(true);
    try {
      const filename = `home-designer-${new Date().toISOString().slice(0, 10)}.obj`;
      await exportToOBJ(scene, filename);
      showStatus(`OBJ diekspor: ${filename}`);
    } catch (e) {
      showStatus('Error: ' + e.message, 'error');
    } finally {
      setExporting3D(false);
    }
  };

  const handleExportSTL = async () => {
    const scene = getThreeScene();
    if (!scene) {
      showStatus('Aktifkan mode 3D dulu untuk export STL', 'error');
      return;
    }
    setExporting3D(true);
    try {
      const filename = `home-designer-${new Date().toISOString().slice(0, 10)}.stl`;
      await exportToSTL(scene, filename);
      showStatus(`STL diekspor: ${filename} (siap 3D print)`);
    } catch (e) {
      showStatus('Error: ' + e.message, 'error');
    } finally {
      setExporting3D(false);
    }
  };

  // ===== Export DAE (Collada) - native SketchUp =====
  const handleExportDAE = async () => {
    const scene = getThreeScene();
    if (!scene) {
      showStatus('Aktifkan mode 3D dulu untuk export DAE', 'error');
      return;
    }
    setExporting3D(true);
    try {
      const filename = `home-designer-${new Date().toISOString().slice(0, 10)}.dae`;
      await exportToDAE(scene, filename);
      showStatus(`DAE diekspor: ${filename} (siap untuk SketchUp)`);
    } catch (e) {
      showStatus('Error: ' + e.message, 'error');
    } finally {
      setExporting3D(false);
    }
  };

  // ===== Export IFC (BIM) =====
  const handleExportIFC = () => {
    try {
      const ifc = exportToIFC({ floors, plot, building });
      const filename = `home-designer-${new Date().toISOString().slice(0, 10)}.ifc`;
      downloadFile(ifc, filename, 'application/x-step');
      showStatus(`IFC diekspor: ${filename} (siap untuk Revit/ArchiCAD)`);
    } catch (e) {
      showStatus('Error: ' + e.message, 'error');
    }
  };

  // ===== Import JSON project =====
  const handleImportClick = () => fileInputRef.current?.click();
  const handleImportDXFClick = () => dxfInputRef.current?.click();

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const data = JSON.parse(ev.target.result);
        if (!data.floors || !Array.isArray(data.floors)) {
          throw new Error('Format tidak valid: tidak ada array floors');
        }
        importProject(data);
        setImportStatus({
          msg: `Project berhasil diimpor! ${data.floors.length} lantai, ${data.floors.reduce(
            (a, f) => a + f.items.length,
            0
          )} item`,
          type: 'success',
        });
        setTimeout(() => {
          setImportStatus(null);
          closeExportModal();
        }, 1500);
      } catch (err) {
        setImportStatus({ msg: 'Gagal impor: ' + err.message, type: 'error' });
        setTimeout(() => setImportStatus(null), 3000);
      }
    };
    reader.readAsText(file);
    // Reset input so same file can be re-selected
    e.target.value = '';
  };

  // ===== Import DXF (from SketchUp/AutoCAD) =====
  const handleDXFFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const dxfText = ev.target.result;
        const result = parseDXF(dxfText);
        if (result.walls.length === 0 && result.columns.length === 0) {
          throw new Error('Tidak ada entitas LINE/LWPOLYLINE/CIRCLE ditemukan di DXF');
        }
        // Add imported walls and columns to current floor
        const { floors, activeFloorId, commit } = useStore.getState();
        commit();
        const updatedFloors = floors.map(f => {
          if (f.id !== activeFloorId) return f;
          return {
            ...f,
            walls: [...f.walls, ...result.walls],
            columns: [...f.columns, ...result.columns],
          };
        });
        useStore.setState({ floors: updatedFloors });
        setImportStatus({
          msg: `DXF berhasil diimpor! ${result.walls.length} dinding, ${result.columns.length} kolom dari ${result.entityCount} entitas`,
          type: 'success',
        });
        setTimeout(() => setImportStatus(null), 4000);
      } catch (err) {
        setImportStatus({ msg: 'Gagal impor DXF: ' + err.message, type: 'error' });
        setTimeout(() => setImportStatus(null), 4000);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const exportOptions = [
    {
      id: 'json',
      icon: FileJson,
      title: 'Project JSON',
      desc: 'Format lengkap untuk backup & berbagi. Bisa diimpor kembali.',
      ext: '.json',
      color: 'indigo',
      onClick: handleExportJSON,
    },
    {
      id: 'dxf',
      icon: FileCode,
      title: 'DXF (AutoCAD)',
      desc: 'Format CAD untuk dibuka di AutoCAD, SketchUp, FreeCAD, dll.',
      ext: '.dxf',
      color: 'red',
      onClick: handleExportDXF,
    },
    {
      id: 'svg',
      icon: FileText,
      title: 'SVG (Vector)',
      desc: 'Gambar vektor untuk diedit di Illustrator, Inkscape, Figma.',
      ext: '.svg',
      color: 'purple',
      onClick: handleExportSVG,
    },
    {
      id: 'png',
      icon: ImageIcon,
      title: 'PNG (Gambar)',
      desc: 'Screenshot denah 2D resolusi tinggi. Hanya tersedia di mode 2D.',
      ext: '.png',
      color: 'emerald',
      onClick: handleExportPNG,
    },
    {
      id: 'glb',
      icon: BoxIcon,
      title: 'glTF 3D (.glb)',
      desc: 'Model 3D binary untuk Blender, Three.js, SketchUp, dll. Aktifkan mode 3D dulu.',
      ext: '.glb',
      color: 'orange',
      onClick: handleExportGLB,
      disabled: mode !== '3d' || exporting3D,
    },
    {
      id: 'obj',
      icon: Layers,
      title: 'OBJ 3D',
      desc: 'Format 3D universal untuk 3D printing & editing. Aktifkan mode 3D dulu.',
      ext: '.obj',
      color: 'amber',
      onClick: handleExportOBJ,
      disabled: mode !== '3d' || exporting3D,
    },
    {
      id: 'stl',
      icon: BoxIcon,
      title: 'STL (3D Print)',
      desc: 'Format khusus 3D printing. Siap untuk Cura/Slic3r. Aktifkan mode 3D dulu.',
      ext: '.stl',
      color: 'rose',
      onClick: handleExportSTL,
      disabled: mode !== '3d' || exporting3D,
    },
    {
      id: 'dae',
      icon: BoxIcon,
      title: 'DAE (Collada/SketchUp)',
      desc: 'Format Collada .dae untuk import langsung ke SketchUp (File > Import). Aktifkan mode 3D dulu.',
      ext: '.dae',
      color: 'cyan',
      onClick: handleExportDAE,
      disabled: mode !== '3d' || exporting3D,
    },
    {
      id: 'ifc',
      icon: FileCode,
      title: 'IFC (BIM/Revit)',
      desc: 'Format IFC 2x3 untuk Revit, ArchiCAD, FreeCAD. Industry Foundation Classes.',
      ext: '.ifc',
      color: 'orange',
      onClick: handleExportIFC,
    },
  ];

  const colorClasses = {
    indigo: 'border-indigo-200 dark:border-indigo-800 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400',
    red: 'border-red-200 dark:border-red-800 hover:bg-red-50 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400',
    purple: 'border-purple-200 dark:border-purple-800 hover:bg-purple-50 dark:hover:bg-purple-900/30 text-purple-600 dark:text-purple-400',
    emerald: 'border-emerald-200 dark:border-emerald-800 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400',
    orange: 'border-orange-200 dark:border-orange-800 hover:bg-orange-50 dark:hover:bg-orange-900/30 text-orange-600 dark:text-orange-400',
    amber: 'border-amber-200 dark:border-amber-800 hover:bg-amber-50 dark:hover:bg-amber-900/30 text-amber-600 dark:text-amber-400',
    rose: 'border-rose-200 dark:border-rose-800 hover:bg-rose-50 dark:hover:bg-rose-900/30 text-rose-600 dark:text-rose-400',
  };

  const totalItems = floors.reduce((a, f) => a + f.items.length, 0);
  const totalWalls = floors.reduce((a, f) => a + f.walls.length, 0);
  const totalColumns = floors.reduce((a, f) => a + f.columns.length, 0);

  return (
    <div
      className="modal-overlay fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4"
      onMouseDown={(e) => e.target === e.currentTarget && closeExportModal()}
    >
      <div className="modal-content bg-white dark:bg-slate-800 dark:text-slate-100 rounded-xl shadow-2xl w-full max-w-2xl max-h-[92vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700 sticky top-0 bg-white dark:bg-slate-800 z-10">
          <h2 className="text-lg font-bold flex items-center gap-2">
            <Download className="text-indigo-600" size={20} />
            Export & Import Project
          </h2>
          <button
            onClick={closeExportModal}
            className="text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700 p-1 rounded"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-4 space-y-4">
          {/* Project summary */}
          <div className="bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-700 rounded-lg p-3">
            <h3 className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
              Ringkasan Project
            </h3>
            <div className="grid grid-cols-4 gap-2 text-center">
              <div>
                <div className="text-xl font-bold text-indigo-600 dark:text-indigo-400">{floors.length}</div>
                <div className="text-[10px] text-slate-500">Lantai</div>
              </div>
              <div>
                <div className="text-xl font-bold text-indigo-600 dark:text-indigo-400">{totalItems}</div>
                <div className="text-[10px] text-slate-500">Item</div>
              </div>
              <div>
                <div className="text-xl font-bold text-indigo-600 dark:text-indigo-400">{totalWalls}</div>
                <div className="text-[10px] text-slate-500">Dinding</div>
              </div>
              <div>
                <div className="text-xl font-bold text-indigo-600 dark:text-indigo-400">{totalColumns}</div>
                <div className="text-[10px] text-slate-500">Kolom</div>
              </div>
            </div>
          </div>

          {/* Status messages */}
          {exportStatus && (
            <div
              className={`p-3 rounded-lg flex items-center gap-2 text-sm ${
                exportStatus.type === 'error'
                  ? 'bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800'
                  : 'bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-800'
              }`}
            >
              {exportStatus.type === 'error' ? <AlertCircle size={16} /> : <Check size={16} />}
              {exportStatus.msg}
            </div>
          )}
          {importStatus && (
            <div
              className={`p-3 rounded-lg flex items-center gap-2 text-sm ${
                importStatus.type === 'error'
                  ? 'bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800'
                  : 'bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-800'
              }`}
            >
              {importStatus.type === 'error' ? <AlertCircle size={16} /> : <Check size={16} />}
              {importStatus.msg}
            </div>
          )}

          {/* Export section */}
          <div>
            <h3 className="font-semibold text-slate-800 dark:text-slate-100 mb-2 flex items-center gap-1.5">
              <Download size={16} className="text-indigo-600" />
              Export Project
            </h3>
            <div className="grid grid-cols-2 gap-2">
              {exportOptions.map((opt) => {
                const Icon = opt.icon;
                return (
                  <button
                    key={opt.id}
                    onClick={opt.onClick}
                    disabled={opt.disabled}
                    className={`border rounded-lg p-3 text-left transition-all ${colorClasses[opt.color]} ${
                      opt.disabled ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  >
                    <div className="flex items-start gap-2">
                      <Icon size={20} className={`flex-shrink-0 mt-0.5 ${opt.id === 'stl' || opt.id === 'glb' || opt.id === 'obj' ? 'animate-pulse' : ''}`} />
                      <div className="min-w-0">
                        <div className="font-semibold text-sm flex items-center gap-1">
                          {opt.title}
                          <span className="text-[10px] font-mono bg-slate-200 dark:bg-slate-600 px-1 rounded">
                            {opt.ext}
                          </span>
                          {opt.disabled && mode !== '3d' && (
                            <span className="text-[9px] bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 px-1 rounded">
                              3D only
                            </span>
                          )}
                          {opt.disabled && mode === '3d' && exporting3D && (
                            <span className="text-[9px] bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-1 rounded">
                              Processing...
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-snug">
                          {opt.desc}
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Import section */}
          <div>
            <h3 className="font-semibold text-slate-800 dark:text-slate-100 mb-2 flex items-center gap-1.5">
              <Upload size={16} className="text-emerald-600" />
              Import Project
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* JSON Import */}
              <div className="border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg p-4 text-center">
                <Upload size={24} className="mx-auto text-emerald-500 mb-2" />
                <p className="text-xs text-slate-600 dark:text-slate-300 mb-2 font-medium">
                  Project JSON
                </p>
                <p className="text-[11px] text-slate-400 mb-2">
                  Import project lengkap dari file .json
                </p>
                <button
                  onClick={handleImportClick}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md text-xs font-medium w-full"
                >
                  Pilih File JSON
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".json,application/json"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </div>

              {/* DXF Import (from SketchUp/AutoCAD) */}
              <div className="border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg p-4 text-center">
                <FileCode size={24} className="mx-auto text-red-500 mb-2" />
                <p className="text-xs text-slate-600 dark:text-slate-300 mb-2 font-medium">
                  DXF (dari SketchUp/AutoCAD)
                </p>
                <p className="text-[11px] text-slate-400 mb-2">
                  Import dinding & kolom dari file .dxf
                </p>
                <button
                  onClick={handleImportDXFClick}
                  className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-md text-xs font-medium w-full"
                >
                  Pilih File DXF
                </button>
                <input
                  ref={dxfInputRef}
                  type="file"
                  accept=".dxf"
                  onChange={handleDXFFileChange}
                  className="hidden"
                />
              </div>
            </div>
            <p className="text-[11px] text-slate-400 mt-2 text-center">
              ⚠️ Import JSON menggantikan desain saat ini · Import DXF menambah ke lantai aktif
            </p>
          </div>

          {/* Info */}
          <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
            <h4 className="text-xs font-semibold text-blue-800 dark:text-blue-300 mb-1">
              💡 Tips Format
            </h4>
            <ul className="text-xs text-blue-700 dark:text-blue-300 space-y-0.5 list-disc list-inside">
              <li><strong>JSON</strong>: Backup lengkap, termasuk item kustom & pengaturan biaya</li>
              <li><strong>DXF</strong>: Buka di AutoCAD untuk editing presisi</li>
              <li><strong>SVG</strong>: Vektor terpisah per lantai, cocok untuk presentasi</li>
              <li><strong>PNG</strong>: Gambar denah 2D yang sedang ditampilkan</li>
            </ul>
          </div>
        </div>

        <div className="p-4 border-t border-slate-200 dark:border-slate-700 flex justify-end">
          <button
            onClick={closeExportModal}
            className="px-4 py-2 border border-slate-300 dark:border-slate-600 dark:text-slate-200 rounded-md text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-700"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
}
