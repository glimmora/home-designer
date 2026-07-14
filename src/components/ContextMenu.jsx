import React from 'react';
import { useStore } from '../lib/store';
import { Copy, Trash2, RotateCw, Layers, ArrowRight, Clipboard } from 'lucide-react';

export default function ContextMenu() {
  const {
    contextMenu,
    hideContextMenu,
    deleteSelected,
    rotateSelected,
    duplicateSelected,
    copyToFloor,
    floors,
    activeFloorId,
  } = useStore();

  if (!contextMenu || !contextMenu.visible) return null;

  const otherFloors = floors.filter(f => f.id !== activeFloorId);

  const MenuItem = ({ icon: Icon, label, onClick, color = 'slate' }) => {
    const colors = {
      slate: 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700',
      red: 'text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30',
      indigo: 'text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/30',
    };
    return (
      <button
        onClick={() => { onClick(); hideContextMenu(); }}
        className={`w-full text-left px-3 py-2 flex items-center gap-2 text-xs font-medium ${colors[color]}`}
      >
        <Icon size={13} />
        {label}
      </button>
    );
  };

  return (
    <>
      <div className="fixed inset-0 z-[200]" onClick={hideContextMenu} onContextMenu={(e) => { e.preventDefault(); hideContextMenu(); }} />
      <div
        className="fixed z-[201] bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-2xl py-1 min-w-[160px] animate-fade-in"
        style={{ left: contextMenu.x, top: contextMenu.y }}
      >
        <MenuItem icon={RotateCw} label="Putar 45°" onClick={rotateSelected} color="indigo" />
        <MenuItem icon={Copy} label="Duplikat" onClick={duplicateSelected} color="indigo" />
        <MenuItem icon={Trash2} label="Hapus" onClick={deleteSelected} color="red" />
        {otherFloors.length > 0 && (
          <>
            <div className="border-t border-slate-100 dark:border-slate-700 my-1" />
            <div className="px-3 py-1 text-[9px] font-semibold uppercase text-slate-400 flex items-center gap-1">
              <Layers size={9} /> Copy ke lantai:
            </div>
            {otherFloors.map(f => (
              <button
                key={f.id}
                onClick={() => { copyToFloor(f.id); hideContextMenu(); }}
                className="w-full text-left px-3 py-1.5 flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
              >
                <ArrowRight size={11} />
                {f.name}
              </button>
            ))}
          </>
        )}
      </div>
    </>
  );
}
