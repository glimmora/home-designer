import React from 'react';
import {
  MousePointer2,
  Minus,
  Square,
  GripVertical,
  Eye,
  HardHat,
  Box,
  Compass,
  Trash2,
  RotateCw,
  Copy,
  Save,
  FolderOpen,
  Eraser,
  Undo2,
  Redo2,
  Ruler,
  HelpCircle,
  Building2,
  Download,
  Moon,
  Sun,
  Package,
  Calculator,
  Upload,
  Home,
  Layers,
  Users,
  Camera,
  Wrench,
  Zap,
  Droplets,
  Nut,
  Microscope,
  FileText,
  FileCheck,
  Plus,
  Magnet,
  Maximize,
  Layers as LayersIcon,
  Share2,
  Type,
  ClipboardList,
  Wind,
  History,
  Printer,
  Ruler as RulerIcon,
  Home as HomeIcon,
  Package as PackageIcon,
  Menu,
  PanelLeft,
  PanelRight,
  X,
} from 'lucide-react';
import { useStore } from '../lib/store';
import { viewModes } from '../lib/mepDefinitions';
import { useLang } from '../lib/i18n';
import { Languages } from 'lucide-react';

export default function Header() {
  const {
    mode,
    tool,
    viewMode,
    unit,
    theme,
    isARMode,
    collabActive,
    setMode,
    setTool,
    setViewMode,
    setUnit,
    toggleTheme,
    setARMode,
    openPlotModal,
    deleteSelected,
    rotateSelected,
    duplicateSelected,
    saveDesign,
    loadDesign,
    clearAll,
    undo,
    redo,
    past,
    future,
    openHelp,
    openCustomItemModal,
    openCostModal,
    openExportModal,
    openPresetModal,
    openMaterialModal,
    openCollabModal,
    openStructuralModal,
    openDocumentModal,
    openNewProjectModal,
    isMeasuring,
    setMeasuring,
    snapToGridEnabled,
    toggleSnap,
    zoomToFit,
    openLayerPanel,
    openShareModal,
    openBOMModal,
    openEngineeringModal,
    openBeamDesigner,
    openRoofDesigner,
    openRebarBOM,
    openPermitCalculator,
    openUndoHistory,
    openPrintPreview,
    lastAutoSave,
    toggleLeftSidebar,
    toggleRightSidebar,
    toggleMobileToolbar,
    mobileToolbarOpen,
    closeMobileDrawers,
  } = useStore();

  const { t, lang, setLang } = useLang();
  const [savedMsg, setSavedMsg] = React.useState(null);

  const showMsg = (msg) => {
    setSavedMsg(msg);
    setTimeout(() => setSavedMsg(null), 2000);
  };

  const handleSave = () => {
    const data = saveDesign();
    showMsg(`Tersimpan: ${new Date(data.savedAt).toLocaleTimeString('id-ID')}`);
  };

  const handleLoad = () => {
    const data = loadDesign();
    showMsg(data ? 'Desain dimuat' : 'Tidak ada desain tersimpan');
  };

  const handleClear = () => {
    if (window.confirm('Yakin ingin menghapus semua item? Tindakan ini bisa di-undo.')) {
      clearAll();
    }
  };

  return (
    <header className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 shadow-sm z-30 safe-top">
      {/* Row 1: Brand + primary actions (always visible) */}
      <div className="px-2 sm:px-3 py-2 flex items-center justify-between gap-2">
        {/* Left: sidebar toggles + brand */}
        <div className="flex items-center gap-1.5 min-w-0 flex-shrink-0">
          {/* Mobile sidebar toggle - left */}
          <button
            onClick={toggleLeftSidebar}
            className="md:hidden p-2 rounded-md hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300"
            title="Buka panel kiri"
          >
            <PanelLeft size={18} />
          </button>

          <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-indigo-700 rounded-lg flex items-center justify-center shadow-md flex-shrink-0">
            <Building2 className="text-white" size={16} />
          </div>
          <div className="hidden sm:block min-w-0">
            <h1 className="font-bold text-slate-800 dark:text-slate-100 text-sm leading-tight truncate">
              Home Designer Pro
            </h1>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
              Multi-Floor · <span className="unit-badge">{unit.toUpperCase()}</span>
            </p>
          </div>
        </div>

        {/* Center: primary toolbar (desktop & tablet) */}
        <div className="hidden md:flex items-center gap-1 flex-1 justify-center min-w-0 overflow-x-auto">
          <button
            onClick={openPlotModal}
            className="bg-amber-500 hover:bg-amber-600 text-white px-2.5 py-1.5 rounded-md text-xs font-medium flex items-center gap-1 transition-colors shadow-sm flex-shrink-0"
            title="Atur ukuran tanah dan bangunan"
          >
            <Ruler size={13} />
            <span className="hidden md:inline">Ukuran Tanah</span>
          </button>

          {/* Unit toggle */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-700 rounded-lg p-0.5 flex-shrink-0">
            <button
              className={`unit-toggle px-2 py-1 rounded text-[11px] font-semibold ${unit === 'cm' ? 'active' : ''}`}
              onClick={() => setUnit('cm')}
            >
              CM
            </button>
            <button
              className={`unit-toggle px-2 py-1 rounded text-[11px] font-semibold ${unit === 'm' ? 'active' : ''}`}
              onClick={() => setUnit('m')}
            >
              M
            </button>
          </div>

          {/* 2D/3D toggle */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-700 rounded-lg p-0.5 flex-shrink-0">
            <button
              className={`tool-btn px-2.5 py-1 rounded text-xs font-semibold flex items-center gap-1 ${mode === '2d' ? 'active' : ''}`}
              onClick={() => setMode('2d')}
              title="Mode 2D"
            >
              <Compass size={12} />
              2D
            </button>
            <button
              className={`tool-btn px-2.5 py-1 rounded text-xs font-semibold flex items-center gap-1 ${mode === '3d' ? 'active' : ''}`}
              onClick={() => setMode('3d')}
              title="Mode 3D"
            >
              <Box size={12} />
              3D
            </button>
          </div>

          {/* History */}
          <button
            className="tool-btn p-1.5 rounded-md text-xs font-medium disabled:opacity-40 disabled:cursor-not-allowed flex-shrink-0"
            onClick={undo}
            disabled={past.length === 0}
            title="Undo (Ctrl+Z)"
          >
            <Undo2 size={14} />
          </button>
          <button
            className="tool-btn p-1.5 rounded-md text-xs font-medium disabled:opacity-40 disabled:cursor-not-allowed flex-shrink-0"
            onClick={redo}
            disabled={future.length === 0}
            title="Redo (Ctrl+Y)"
          >
            <Redo2 size={14} />
          </button>
        </div>

        {/* Right: mobile menu + sidebar toggle + theme + help */}
        <div className="flex items-center gap-1 flex-shrink-0">
          {/* Mobile toolbar overflow menu */}
          <button
            onClick={toggleMobileToolbar}
            className="md:hidden p-2 rounded-md hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300"
            title="Menu lengkap"
          >
            <Menu size={18} />
          </button>

          {/* Desktop: language toggle + dark mode + help */}
          <button
            onClick={() => setLang(lang === 'id' ? 'en' : 'id')}
            className="hidden md:flex tool-btn p-1.5 rounded-md text-xs font-bold"
            title={lang === 'id' ? 'Switch to English' : 'Ganti ke Bahasa Indonesia'}
          >
            {lang === 'id' ? '🇮🇩 ID' : '🇬🇧 EN'}
          </button>
          <button
            onClick={toggleTheme}
            className="hidden md:flex tool-btn p-1.5 rounded-md"
            title={theme === 'light' ? t.modeGelap : t.modeTerang}
          >
            {theme === 'light' ? <Moon size={14} /> : <Sun size={14} />}
          </button>
          <button
            onClick={openHelp}
            className="hidden md:flex tool-btn p-1.5 rounded-md"
            title={t.bantuan}
          >
            <HelpCircle size={14} />
          </button>

          {/* Mobile sidebar toggle - right */}
          <button
            onClick={toggleRightSidebar}
            className="md:hidden p-2 rounded-md hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300"
            title="Buka panel kanan"
          >
            <PanelRight size={18} />
          </button>
        </div>
      </div>

      {/* Row 2: Tools (desktop only, scrollable on tablet) */}
      <div className="hidden md:flex items-center gap-1 px-2 sm:px-3 py-1.5 border-t border-slate-100 dark:border-slate-700 overflow-x-auto">
        {/* Drawing tools */}
        <div className="flex items-center bg-slate-100 dark:bg-slate-700 rounded-lg p-0.5 gap-0.5 flex-shrink-0">
          <ToolButton tool="select" active={tool === 'select'} onClick={() => setTool('select')} icon={MousePointer2} label="Pilih" shortcut="V" />
          <ToolButton tool="wall" active={tool === 'wall'} onClick={() => setTool('wall')} icon={Minus} label="Dinding" shortcut="W" />
          <ToolButton tool="room" active={tool === 'room'} onClick={() => setTool('room')} icon={Square} label="Ruangan" shortcut="R" />
          <ToolButton tool="column" active={tool === 'column'} onClick={() => setTool('column')} icon={GripVertical} label="Kolom" shortcut="C" />
        </div>

        <Divider />

        {/* View modes dropdown */}
        <ViewModeDropdown viewMode={viewMode} setViewMode={setViewMode} />

        <Divider />

        {/* Item ops */}
        <ToolButton onClick={deleteSelected} icon={Trash2} label="Hapus" shortcut="Del" />
        <ToolButton onClick={rotateSelected} icon={RotateCw} label="Putar" shortcut="R" />
        <ToolButton onClick={duplicateSelected} icon={Copy} label="Duplikat" shortcut="Ctrl+D" />

        <Divider />

        {/* Feature buttons */}
        <FeatureButton onClick={openCustomItemModal} icon={Package} label="Item Kustom" color="purple" />
        <FeatureButton onClick={openCostModal} icon={Calculator} label="Biaya" color="emerald" />
        <FeatureButton onClick={openExportModal} icon={Upload} label="Export" color="cyan" />
        <FeatureButton onClick={openPresetModal} icon={Home} label="Template" color="orange" />
        <FeatureButton onClick={openMaterialModal} icon={Layers} label="Material" color="pink" />
        <FeatureButton onClick={openStructuralModal} icon={Microscope} label="SNI" color="violet" />
        <FeatureButton onClick={openDocumentModal} icon={FileText} label="Dokumen" color="slate" />
        <FeatureButton
          onClick={openCollabModal}
          icon={Users}
          label={collabActive ? 'Collab ON' : 'Collab'}
          color={collabActive ? 'green' : 'slate'}
          pulse={collabActive}
        />
        <FeatureButton
          onClick={() => setARMode(!isARMode)}
          icon={Camera}
          label="AR"
          color={isARMode ? 'purple' : 'slate'}
        />

        <Divider />

        {/* Tools: Measure, Snap, Zoom-to-fit, Layers */}
        <FeatureButton onClick={() => setMeasuring(!isMeasuring)} icon={Ruler} label={isMeasuring ? 'Ukur ON' : 'Ukur'} color={isMeasuring ? 'amber' : 'slate'} />
        <FeatureButton onClick={toggleSnap} icon={Magnet} label={snapToGridEnabled ? 'Snap ON' : 'Snap'} color={snapToGridEnabled ? 'indigo' : 'slate'} />
        <FeatureButton onClick={zoomToFit} icon={Maximize} label="Fit" color="slate" />
        <FeatureButton onClick={openLayerPanel} icon={LayersIcon} label="Layer" color="slate" />
        <FeatureButton onClick={openShareModal} icon={Share2} label="Share" color="cyan" />
        <FeatureButton onClick={openBOMModal} icon={ClipboardList} label="BOM" color="amber" />
        <FeatureButton onClick={openEngineeringModal} icon={Wind} label="Engineering" color="cyan" />
        <FeatureButton onClick={openBeamDesigner} icon={RulerIcon} label="Balok" color="amber" />
        <FeatureButton onClick={openRoofDesigner} icon={HomeIcon} label="Atap" color="rose" />
        <FeatureButton onClick={openRebarBOM} icon={PackageIcon} label="BOM Besi" color="indigo" />
        <FeatureButton onClick={openPermitCalculator} icon={FileCheck} label="IMB" color="emerald" />
        <FeatureButton onClick={openUndoHistory} icon={History} label="Riwayat" color="slate" />
        <FeatureButton onClick={openPrintPreview} icon={Printer} label="Print" color="slate" />

        <Divider />

        {/* New Project */}
        <FeatureButton onClick={openNewProjectModal} icon={Plus} label="Proyek Baru" color="green" />

        {/* Save/Load */}
        <FeatureButton onClick={handleSave} icon={Save} label="Simpan" color="indigo" />
        <FeatureButton onClick={handleLoad} icon={FolderOpen} label="Muat" color="slate" />
        <FeatureButton onClick={handleClear} icon={Eraser} color="red" />
      </div>

      {/* Mobile: compact toolbar row (2D/3D + unit + theme) */}
      <div className="md:hidden flex items-center gap-1 px-2 py-1.5 border-t border-slate-100 dark:border-slate-700 overflow-x-auto">
        <div className="flex items-center bg-slate-100 dark:bg-slate-700 rounded-lg p-0.5 flex-shrink-0">
          <button
            className={`unit-toggle px-2 py-1 rounded text-[11px] font-semibold ${unit === 'cm' ? 'active' : ''}`}
            onClick={() => setUnit('cm')}
          >CM</button>
          <button
            className={`unit-toggle px-2 py-1 rounded text-[11px] font-semibold ${unit === 'm' ? 'active' : ''}`}
            onClick={() => setUnit('m')}
          >M</button>
        </div>

        <div className="flex items-center bg-slate-100 dark:bg-slate-700 rounded-lg p-0.5 flex-shrink-0">
          <button
            className={`tool-btn px-2 py-1 rounded text-xs font-semibold ${mode === '2d' ? 'active' : ''}`}
            onClick={() => setMode('2d')}
          >2D</button>
          <button
            className={`tool-btn px-2 py-1 rounded text-xs font-semibold ${mode === '3d' ? 'active' : ''}`}
            onClick={() => setMode('3d')}
          >3D</button>
        </div>

        <button
          onClick={() => setLang(lang === 'id' ? 'en' : 'id')}
          className="tool-btn px-2 py-1 rounded-md text-[10px] font-bold flex-shrink-0"
          title={lang === 'id' ? 'Switch to English' : 'Ganti ke Indonesia'}
        >
          {lang === 'id' ? '🇮🇩' : '🇬🇧'}
        </button>

        <button
          onClick={toggleTheme}
          className="tool-btn p-1.5 rounded-md flex-shrink-0"
          title={theme === 'light' ? t.modeGelap : t.modeTerang}
        >
          {theme === 'light' ? <Moon size={14} /> : <Sun size={14} />}
        </button>

        <button
          onClick={openHelp}
          className="tool-btn p-1.5 rounded-md flex-shrink-0"
          title={t.bantuan}
        >
          <HelpCircle size={14} />
        </button>

        <div className="flex-1" />

        {/* Compact quick actions */}
        <button
          onClick={undo}
          disabled={past.length === 0}
          className="tool-btn p-1.5 rounded-md disabled:opacity-40 flex-shrink-0"
          title="Undo"
        >
          <Undo2 size={14} />
        </button>
        <button
          onClick={redo}
          disabled={future.length === 0}
          className="tool-btn p-1.5 rounded-md disabled:opacity-40 flex-shrink-0"
          title="Redo"
        >
          <Redo2 size={14} />
        </button>
      </div>

      {/* Mobile overflow menu drawer */}
      {mobileToolbarOpen && (
        <MobileOverflowMenu
          onClose={closeMobileDrawers}
          actions={{
            openPlotModal,
            openCustomItemModal,
            openCostModal,
            openExportModal,
            openPresetModal,
            openMaterialModal,
            openStructuralModal,
            openDocumentModal,
            openNewProjectModal,
            openCollabModal,
            openBeamDesigner,
            openRoofDesigner,
            openRebarBOM,
            openPermitCalculator,
            setARMode,
            isARMode,
            handleSave,
            handleLoad,
            handleClear,
            deleteSelected,
            rotateSelected,
            duplicateSelected,
            setTool,
            tool,
          }}
        />
      )}

      {savedMsg && (
        <div className="fixed top-2 left-1/2 -translate-x-1/2 bg-slate-800 dark:bg-slate-700 text-white text-xs px-3 py-1.5 rounded-full shadow-lg z-50 animate-fade-in">
          ✓ {savedMsg}
        </div>
      )}

      {/* Auto-save indicator */}
      {lastAutoSave && !savedMsg && (
        <div className="fixed top-2 right-4 bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 text-green-600 dark:text-green-400 text-[10px] px-2 py-0.5 rounded-full shadow-sm z-50 flex items-center gap-1 no-print">
          <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
          Auto-saved
        </div>
      )}
    </header>
  );
}

// ============= Tool Button =============
function ToolButton({ tool, active, onClick, icon: Icon, label, shortcut }) {
  return (
    <button
      className={`tool-btn h-8 px-2.5 rounded-md text-xs font-medium flex items-center gap-1 flex-shrink-0 ${active ? 'active' : ''}`}
      onClick={onClick}
      title={shortcut ? `${label} (${shortcut})` : label}
      aria-label={label}
    >
      <Icon size={13} />
      <span className="hidden xl:inline">{label}</span>
    </button>
  );
}

// ============= Feature Button (colored) =============
function FeatureButton({ onClick, icon: Icon, label, color, pulse }) {
  const colorClasses = {
    purple: 'bg-purple-600 hover:bg-purple-700',
    emerald: 'bg-emerald-600 hover:bg-emerald-700',
    cyan: 'bg-cyan-600 hover:bg-cyan-700',
    orange: 'bg-orange-600 hover:bg-orange-700',
    pink: 'bg-pink-600 hover:bg-pink-700',
    violet: 'bg-violet-700 hover:bg-violet-800',
    green: 'bg-green-600 hover:bg-green-700',
    slate: 'bg-slate-500 hover:bg-slate-600',
    indigo: 'bg-indigo-600 hover:bg-indigo-700',
    red: 'bg-red-500 hover:bg-red-600',
  };
  return (
    <button
      onClick={onClick}
      className={`${colorClasses[color]} text-white h-8 px-2.5 rounded-md text-xs font-medium flex items-center gap-1 transition-colors shadow-sm flex-shrink-0 relative`}
      title={label}
      aria-label={label}
    >
      <Icon size={13} />
      <span className="hidden xl:inline">{label}</span>
      {pulse && <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-green-300 rounded-full animate-pulse" />}
    </button>
  );
}

function Divider() {
  return <div className="h-6 w-px bg-slate-300 dark:bg-slate-600 mx-0.5 flex-shrink-0" />;
}

// ============= View Mode Dropdown =============
function ViewModeDropdown({ viewMode, setViewMode }) {
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef(null);

  React.useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    document.addEventListener('touchstart', handler);
    return () => {
      document.removeEventListener('mousedown', handler);
      document.removeEventListener('touchstart', handler);
    };
  }, []);

  const modeIcons = {
    design: Eye,
    structural: HardHat,
    rebar: Nut,
    plumbing: Droplets,
    electrical: Zap,
    mep: Wrench,
  };
  const current = viewModes[viewMode] || viewModes.design;
  const CurrentIcon = modeIcons[viewMode] || Eye;

  return (
    <div ref={ref} className="relative flex-shrink-0">
      <button
        onClick={() => setOpen(!open)}
        className={`tool-btn view-mode-btn px-2 py-1.5 rounded-md text-xs font-semibold flex items-center gap-1 ${viewMode !== 'design' ? 'active' : ''}`}
        title={current.desc}
      >
        <CurrentIcon size={13} />
        <span className="hidden lg:inline">{current.name}</span>
      </button>
      {open && (
        <div className="absolute top-full left-0 mt-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-xl z-50 min-w-[220px] max-w-[280px] py-1 animate-fade-in max-h-[80vh] overflow-y-auto">
          {Object.entries(viewModes).map(([key, mode]) => {
            const Icon = modeIcons[key] || Eye;
            return (
              <button
                key={key}
                onClick={() => {
                  setViewMode(key);
                  setOpen(false);
                }}
                className={`w-full text-left px-3 py-2 flex items-start gap-2 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors ${
                  viewMode === key ? 'bg-indigo-50 dark:bg-indigo-900/30' : ''
                }`}
              >
                <Icon size={14} className="mt-0.5 flex-shrink-0 text-slate-600 dark:text-slate-300" />
                <div className="min-w-0">
                  <div className="text-sm font-medium text-slate-700 dark:text-slate-200">
                    {mode.icon} {mode.name}
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug">
                    {mode.desc}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ============= Mobile Overflow Menu =============
function MobileOverflowMenu({ onClose, actions }) {
  const {
    openPlotModal, openCustomItemModal, openCostModal, openExportModal,
    openPresetModal, openMaterialModal, openStructuralModal, openDocumentModal, openNewProjectModal, openCollabModal,
    openBeamDesigner, openRoofDesigner, openRebarBOM, openPermitCalculator,
    setARMode, isARMode, handleSave, handleLoad, handleClear,
    deleteSelected, rotateSelected, duplicateSelected, setTool, tool,
  } = actions;

  const handle = (fn) => () => {
    if (typeof fn === 'function') fn();
    onClose();
  };

  const MenuItem = ({ icon: Icon, label, onClick, color = 'slate' }) => {
    const colorClasses = {
      slate: 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700',
      amber: 'text-amber-700 dark:text-amber-300 hover:bg-amber-50 dark:hover:bg-amber-900/30',
      purple: 'text-purple-700 dark:text-purple-300 hover:bg-purple-50 dark:hover:bg-purple-900/30',
      emerald: 'text-emerald-700 dark:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-900/30',
      cyan: 'text-cyan-700 dark:text-cyan-300 hover:bg-cyan-50 dark:hover:bg-cyan-900/30',
      orange: 'text-orange-700 dark:text-orange-300 hover:bg-orange-50 dark:hover:bg-orange-900/30',
      pink: 'text-pink-700 dark:text-pink-300 hover:bg-pink-50 dark:hover:bg-pink-900/30',
      violet: 'text-violet-700 dark:text-violet-300 hover:bg-violet-50 dark:hover:bg-violet-900/30',
      green: 'text-green-700 dark:text-green-300 hover:bg-green-50 dark:hover:bg-green-900/30',
      indigo: 'text-indigo-700 dark:text-indigo-300 hover:bg-indigo-50 dark:hover:bg-indigo-900/30',
      red: 'text-red-700 dark:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/30',
    };
    return (
      <button
        onClick={handle(onClick)}
        className={`w-full text-left px-3 py-2.5 flex items-center gap-2.5 text-sm font-medium transition-colors ${colorClasses[color]}`}
      >
        <Icon size={16} className="flex-shrink-0" />
        {label}
      </button>
    );
  };

  return (
    <div
      className="md:hidden fixed inset-0 z-40 bg-black/30"
      onClick={onClose}
    >
      <div
        className="absolute top-0 right-0 bottom-0 w-72 max-w-[85vw] bg-white dark:bg-slate-800 shadow-2xl overflow-y-auto safe-top safe-bottom"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-3 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between sticky top-0 bg-white dark:bg-slate-800 z-10">
          <h3 className="font-bold text-sm">Menu Lengkap</h3>
          <button onClick={onClose} className="p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-700">
            <X size={18} />
          </button>
        </div>

        {/* Drawing tools */}
        <div className="py-1">
          <div className="px-3 py-1.5 text-[10px] font-semibold uppercase text-slate-400">Mode Gambar</div>
          <MenuItem icon={MousePointer2} label="Pilih" onClick={() => setTool('select')} color={tool === 'select' ? 'indigo' : 'slate'} />
          <MenuItem icon={Minus} label="Dinding" onClick={() => setTool('wall')} color={tool === 'wall' ? 'indigo' : 'slate'} />
          <MenuItem icon={Square} label="Ruangan" onClick={() => setTool('room')} color={tool === 'room' ? 'indigo' : 'slate'} />
          <MenuItem icon={GripVertical} label="Kolom" onClick={() => setTool('column')} color={tool === 'column' ? 'indigo' : 'slate'} />
        </div>

        <div className="border-t border-slate-100 dark:border-slate-700 py-1">
          <div className="px-3 py-1.5 text-[10px] font-semibold uppercase text-slate-400">Item</div>
          <MenuItem icon={RotateCw} label="Putar Item" onClick={rotateSelected} />
          <MenuItem icon={Copy} label="Duplikat" onClick={duplicateSelected} />
          <MenuItem icon={Trash2} label="Hapus Item" onClick={deleteSelected} color="red" />
        </div>

        <div className="border-t border-slate-100 dark:border-slate-700 py-1">
          <div className="px-3 py-1.5 text-[10px] font-semibold uppercase text-slate-400">Fitur</div>
          <MenuItem icon={Ruler} label="Ukuran Tanah" onClick={openPlotModal} color="amber" />
          <MenuItem icon={Package} label="Item Kustom" onClick={openCustomItemModal} color="purple" />
          <MenuItem icon={Calculator} label="Estimasi Biaya" onClick={openCostModal} color="emerald" />
          <MenuItem icon={Upload} label="Export / Import" onClick={openExportModal} color="cyan" />
          <MenuItem icon={Home} label="Template Rumah" onClick={openPresetModal} color="orange" />
          <MenuItem icon={Layers} label="Material Library" onClick={openMaterialModal} color="pink" />
          <MenuItem icon={Microscope} label="SNI Analisis Struktur" onClick={openStructuralModal} color="violet" />
          <MenuItem icon={RulerIcon} label="Desain Balok/Sloof/Ring" onClick={openBeamDesigner} color="amber" />
          <MenuItem icon={HomeIcon} label="Desain Kuda-kuda Atap" onClick={openRoofDesigner} color="red" />
          <MenuItem icon={PackageIcon} label="BOM Besi (Pondasi-Atap)" onClick={openRebarBOM} color="indigo" />
          <MenuItem icon={FileCheck} label="Kalkulator IMB (KDB/KDH/KLB)" onClick={openPermitCalculator} color="green" />
          <MenuItem icon={FileText} label="Export Dokumen Teknis" onClick={openDocumentModal} color="indigo" />
          <MenuItem icon={Users} label="Kolaborasi" onClick={openCollabModal} color="green" />
          <MenuItem icon={Camera} label={isARMode ? 'Tutup AR' : 'AR Mode'} onClick={() => setARMode(!isARMode)} color="slate" />
        </div>

        <div className="border-t border-slate-100 dark:border-slate-700 py-1">
          <div className="px-3 py-1.5 text-[10px] font-semibold uppercase text-slate-400">File</div>
          <MenuItem icon={Plus} label="Proyek Baru" onClick={openNewProjectModal} color="green" />
          <MenuItem icon={Save} label="Simpan" onClick={handleSave} color="indigo" />
          <MenuItem icon={FolderOpen} label="Muat" onClick={handleLoad} />
          <MenuItem icon={Eraser} label="Bersihkan Semua" onClick={handleClear} color="red" />
        </div>

        <div className="h-4" />
      </div>
    </div>
  );
}
