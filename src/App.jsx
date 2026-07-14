import React, { useEffect } from 'react';
import { useStore } from './lib/store';
import ErrorBoundary from './components/ErrorBoundary';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import Canvas2D from './components/Canvas2D';
import View3D from './components/View3D';
import PropertiesPanel from './components/PropertiesPanel';
import PlotSettingsModal from './components/PlotSettingsModal';
import HelpModal from './components/HelpModal';
import ZoomControls from './components/ZoomControls';
import FloorManagement from './components/FloorManagement';
import CustomItemModal from './components/CustomItemModal';
import CostEstimationModal from './components/CostEstimationModal';
import ExportImportModal from './components/ExportImportModal';
import PresetModal from './components/PresetModal';
import MaterialLibraryModal from './components/MaterialLibraryModal';
import CollaborationModal from './components/CollaborationModal';
import StructuralAnalysisModal from './components/StructuralAnalysisModal';
import DocumentExportModal from './components/DocumentExportModal';
import NewProjectModal from './components/NewProjectModal';
import ContextMenu from './components/ContextMenu';
import LayerPanel from './components/LayerPanel';
import OnboardingTutorial from './components/OnboardingTutorial';
import ShareModal from './components/ShareModal';
import BOMModal from './components/BOMModal';
import EngineeringModal from './components/EngineeringModal';
import UndoHistoryPanel from './components/UndoHistoryPanel';
import PrintPreview from './components/PrintPreview';
import BeamDesignerModal from './components/BeamDesignerModal';
import RoofDesignerModal from './components/RoofDesignerModal';
import RebarBOMModal from './components/RebarBOMModal';
import PermitCalculatorModal from './components/PermitCalculatorModal';
import ARView from './components/ARView';
import { X } from 'lucide-react';

export default function App() {
  const {
    mode,
    selectedId,
    selectedType,
    isDrawingWall,
    isPlotModalOpen,
    isHelpOpen,
    isCustomItemModalOpen,
    isCostModalOpen,
    isExportModalOpen,
    isPresetModalOpen,
    isMaterialModalOpen,
    isCollabModalOpen,
    isStructuralModalOpen,
    isDocumentModalOpen,
    isNewProjectModalOpen,
    isARMode,
    theme,
    leftSidebarOpen,
    rightSidebarOpen,
    deleteSelected,
    rotateSelected,
    duplicateSelected,
    undo,
    redo,
    saveDesign,
    setTool,
    clearSelection,
    setWallStart,
    zoomIn,
    zoomOut,
    resetView,
    toggleTheme,
    closeMobileDrawers,
  } = useStore();

  // Apply dark mode class to documentElement
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  // Close mobile drawers on resize to desktop
  useEffect(() => {
    const handler = () => {
      if (window.innerWidth >= 768) {
        closeMobileDrawers();
      }
    };
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, [closeMobileDrawers]);

  // Load from URL on mount
  const { loadFromURL, autoSaveEnabled, setLastAutoSave } = useStore();
  useEffect(() => {
    loadFromURL();
  }, [loadFromURL]);

  // Auto-save every 30 seconds
  useEffect(() => {
    if (!autoSaveEnabled) return;
    const interval = setInterval(() => {
      saveDesign();
      setLastAutoSave(new Date().toISOString());
    }, 30000);
    return () => clearInterval(interval);
  }, [autoSaveEnabled, saveDesign, setLastAutoSave]);

  // Global keyboard shortcuts
  useEffect(() => {
    const handler = (e) => {
      const tag = document.activeElement?.tagName;
      if (tag === 'INPUT' || tag === 'SELECT' || tag === 'TEXTAREA') return;
      const anyModalOpen =
        isPlotModalOpen || isHelpOpen || isCustomItemModalOpen ||
        isCostModalOpen || isExportModalOpen || isPresetModalOpen ||
        isMaterialModalOpen || isCollabModalOpen || isStructuralModalOpen || isDocumentModalOpen || isNewProjectModalOpen;
      if (anyModalOpen || isARMode) return;

      if (e.key === 'Delete' || e.key === 'Backspace') {
        e.preventDefault();
        deleteSelected();
        return;
      }

      if ((e.key === 'r' || e.key === 'R') && !e.ctrlKey && !e.metaKey) {
        if (selectedId != null && selectedType === 'item') {
          rotateSelected();
          return;
        }
        setTool('room');
        return;
      }

      if (e.key === 'v' || e.key === 'V') { setTool('select'); return; }
      if (e.key === 'w' || e.key === 'W') { setTool('wall'); return; }
      if (e.key === 'c' || e.key === 'C') { setTool('column'); return; }

      if (e.key === 'd' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        duplicateSelected();
        return;
      }

      if (e.key === 'z' && (e.ctrlKey || e.metaKey) && !e.shiftKey) {
        e.preventDefault();
        undo();
        return;
      }
      if (e.key === 'y' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        redo();
        return;
      }
      if (e.key === 'z' && (e.ctrlKey || e.metaKey) && e.shiftKey) {
        e.preventDefault();
        redo();
        return;
      }

      if (e.key === 's' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        saveDesign();
        return;
      }

      if (e.key === 'l' && (e.ctrlKey || e.metaKey) && e.shiftKey) {
        e.preventDefault();
        toggleTheme();
        return;
      }

      if (e.key === 'Escape') {
        if (isDrawingWall) {
          setWallStart(null);
        } else {
          clearSelection();
        }
        return;
      }

      if (e.key === '+' || e.key === '=') { zoomIn(); return; }
      if (e.key === '-' || e.key === '_') { zoomOut(); return; }
      if (e.key === '0') { resetView(); return; }
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [
    deleteSelected, rotateSelected, duplicateSelected, undo, redo, saveDesign,
    setTool, clearSelection, setWallStart, zoomIn, zoomOut, resetView, toggleTheme,
    selectedId, selectedType, isDrawingWall,
    isPlotModalOpen, isHelpOpen, isCustomItemModalOpen, isCostModalOpen, isExportModalOpen,
    isPresetModalOpen, isMaterialModalOpen, isCollabModalOpen, isStructuralModalOpen, isDocumentModalOpen, isNewProjectModalOpen, isARMode,
  ]);

  return (
    <div className="h-screen flex flex-col bg-slate-100 dark:bg-slate-900 overflow-hidden">
      <Header />

      <div className="flex flex-1 overflow-hidden relative">
        {/* Desktop left sidebar */}
        <div className="hidden md:flex">
          <Sidebar />
        </div>

        {/* Mobile left sidebar drawer */}
        {leftSidebarOpen && (
          <div
            className="md:hidden fixed inset-0 z-40 bg-black/30"
            onClick={closeMobileDrawers}
          >
            <div
              className="absolute top-0 left-0 bottom-0 w-72 max-w-[85vw] bg-white dark:bg-slate-800 shadow-2xl overflow-y-auto safe-top safe-bottom"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-2 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between sticky top-0 bg-white dark:bg-slate-800 z-10">
                <h3 className="font-bold text-sm">Kategori Item</h3>
                <button
                  onClick={closeMobileDrawers}
                  className="p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-700"
                >
                  <X size={18} />
                </button>
              </div>
              <Sidebar />
            </div>
          </div>
        )}

        {/* Main canvas area */}
        <main className="flex-1 relative overflow-hidden bg-slate-200 dark:bg-slate-950 min-w-0">
          {mode === '2d' ? (
            <>
              <Canvas2D />
              <ZoomControls />
            </>
          ) : (
            <View3D />
          )}
        </main>

        {/* Desktop right sidebar */}
        <div className="hidden md:flex">
          <aside className="w-60 bg-white dark:bg-slate-800 border-l border-slate-200 dark:border-slate-700 flex flex-col overflow-hidden flex-shrink-0">
            <PropertiesPanel />
            <FloorManagement />
          </aside>
        </div>

        {/* Mobile right sidebar drawer */}
        {rightSidebarOpen && (
          <div
            className="md:hidden fixed inset-0 z-40 bg-black/30"
            onClick={closeMobileDrawers}
          >
            <div
              className="absolute top-0 right-0 bottom-0 w-72 max-w-[85vw] bg-white dark:bg-slate-800 shadow-2xl overflow-y-auto safe-top safe-bottom"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-2 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between sticky top-0 bg-white dark:bg-slate-800 z-10">
                <h3 className="font-bold text-sm">Properti & Lantai</h3>
                <button
                  onClick={closeMobileDrawers}
                  className="p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-700"
                >
                  <X size={18} />
                </button>
              </div>
              <PropertiesPanel />
              <FloorManagement />
            </div>
          </div>
        )}
      </div>

      {/* All modals */}
      <PlotSettingsModal />
      <HelpModal />
      <CustomItemModal />
      <CostEstimationModal />
      <ExportImportModal />
      <PresetModal />
      <MaterialLibraryModal />
      <CollaborationModal />
      <StructuralAnalysisModal />
      <DocumentExportModal />
      <NewProjectModal />
      <ShareModal />
      <BOMModal />
      <EngineeringModal />
      <UndoHistoryPanel />
      <PrintPreview />
      <BeamDesignerModal />
      <RoofDesignerModal />
      <RebarBOMModal />
      <PermitCalculatorModal />
      <OnboardingTutorial />
      <LayerPanel />
      <ContextMenu />

      {/* AR View (overlay) */}
      {isARMode && <ARView />}
    </div>
  );
}

// Wrap with ErrorBoundary for production safety
export function AppWithBoundary() {
  return (
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  );
}
