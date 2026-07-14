import React, { useState } from 'react';
import { useStore, useActiveFloor } from '../lib/store';
import { Plus, Minus, Layers, Pencil, Check, X } from 'lucide-react';
import { formatDimension, formatDimensionShort, fromDisplay } from '../lib/utils';

export default function FloorManagement() {
  const {
    floors,
    activeFloorId,
    unit,
    addFloor,
    removeFloor,
    switchFloor,
    renameFloor,
    setFloorHeight,
  } = useStore();

  const activeFloor = useActiveFloor();
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState('');

  const startEdit = (id, name) => {
    setEditingId(id);
    setEditName(name);
  };

  const confirmEdit = () => {
    if (editName.trim()) {
      renameFloor(editingId, editName.trim());
    }
    setEditingId(null);
  };

  return (
    <div className="p-3 border-t border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
      <h3 className="text-xs font-semibold text-slate-700 dark:text-slate-200 mb-2 flex items-center gap-1.5">
        <Layers size={12} />
        Manajemen Lantai
      </h3>

      <div className="flex flex-wrap gap-1 mb-2 max-h-24 overflow-y-auto">
        {floors.map((floor) => (
          <div
            key={floor.id}
            className={`floor-tab px-2 py-1 rounded text-xs font-medium flex items-center gap-1 ${
              floor.id === activeFloorId ? 'active' : 'bg-slate-100 dark:bg-slate-700'
            }`}
            onClick={() => switchFloor(floor.id)}
            onDoubleClick={() => startEdit(floor.id, floor.name)}
          >
            <Layers size={10} />
            {editingId === floor.id ? (
              <input
                autoFocus
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                onBlur={confirmEdit}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') confirmEdit();
                  if (e.key === 'Escape') setEditingId(null);
                }}
                className="bg-transparent border-b border-white/50 outline-none text-white w-16"
                onClick={(e) => e.stopPropagation()}
              />
            ) : (
              <span>{floor.name}</span>
            )}
          </div>
        ))}
      </div>

      <div className="flex gap-1 mb-2">
        <button
          onClick={addFloor}
          className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white px-2 py-1.5 rounded text-xs font-medium flex items-center justify-center gap-1 transition-colors"
        >
          <Plus size={12} />
          Tambah Lantai
        </button>
        <button
          onClick={removeFloor}
          disabled={floors.length <= 1}
          className="bg-red-50 dark:bg-red-900/300 hover:bg-red-600 disabled:opacity-40 disabled:cursor-not-allowed text-white px-2 py-1.5 rounded text-xs font-medium transition-colors"
          title="Hapus lantai aktif"
        >
          <Minus size={12} />
        </button>
      </div>

      {activeFloor && (
        <div>
          <label className="text-xs text-slate-600 dark:text-slate-300 flex items-center justify-between mb-1">
            <span>Tinggi Lantai:</span>
            <span className="unit-badge">{unit}</span>
          </label>
          <input
            type="number"
            className="prop-input"
            value={formatDimensionShort(activeFloor.height, unit)}
            step={unit === 'm' ? '0.01' : '10'}
            min="2"
            max="5"
            onChange={(e) => {
              const v = fromDisplay(parseFloat(e.target.value) || 300, unit);
              setFloorHeight(activeFloor.id, v);
            }}
          />
          <div className="text-[10px] text-slate-400 dark:text-slate-500 mt-1">
            Rentang: {formatDimension(200, unit)} - {formatDimension(500, unit)}
          </div>
        </div>
      )}

      {editingId !== null && (
        <div className="mt-2 text-[10px] text-slate-400 dark:text-slate-500 flex items-center gap-1">
          <Pencil size={10} />
          Klik 2x nama lantai untuk rename
        </div>
      )}
    </div>
  );
}
