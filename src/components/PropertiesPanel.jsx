import React from 'react';
import { useStore, useActiveFloor } from '../lib/store';
import { getItemDef, getItemCategory, categoryLabels } from '../lib/itemDefinitions';
import { formatDimension, formatDimensionShort, fromDisplay, toDisplay } from '../lib/utils';
import { Trash2, RotateCw, Copy, Lock, Unlock, MousePointerClick } from 'lucide-react';
import DimensionSlider from './DimensionSlider';

export default function PropertiesPanel() {
  const {
    selectedId,
    selectedType,
    unit,
    floors,
    activeFloorId,
    updateItem,
    updateColumn,
    deleteSelected,
    rotateSelected,
    duplicateSelected,
    commit,
  } = useStore();

  const activeFloor = useActiveFloor();
  const [localSize, setLocalSize] = React.useState(null);

  // Find selected entity
  let selected = null;
  let def = null;
  if (selectedType === 'item' && activeFloor) {
    selected = activeFloor.items.find((i) => i.id === selectedId);
    if (selected) def = getItemDef(selected.type);
  } else if (selectedType === 'column' && activeFloor) {
    selected = activeFloor.columns.find((c) => c.id === selectedId);
  }

  if (!selected) {
    return (
      <>
        <PropertiesHeader />
        <div className="flex-1 flex items-center justify-center text-center text-slate-400 dark:text-slate-500 text-xs sm:text-sm p-4">
          <div className="prop-text-wrap">
            <div className="mb-2 opacity-40">
              <MousePointerClick size={36} className="mx-auto" />
            </div>
            <p className="leading-relaxed">Pilih item, kolom, atau dinding untuk melihat properti</p>
          </div>
        </div>
        <StatsPanel />
      </>
    );
  }

  const stepVal = unit === 'm' ? '0.01' : '1';

  const handleUpdate = (updates) => {
    commit();
    if (selectedType === 'item') updateItem(selectedId, updates);
    else if (selectedType === 'column') updateColumn(selectedId, updates);
  };

  const handleColorChange = (color) => {
    commit();
    if (selectedType === 'item') updateItem(selectedId, { color });
  };

  return (
    <>
      <PropertiesHeader />

      <div className="flex-1 overflow-y-auto p-3">
        {/* Item header */}
        <div
          className={`border rounded-lg p-3 mb-3 ${
            def?.structural ? 'bg-red-50 dark:bg-red-900/30 border-red-200 dark:border-red-800' : 'bg-indigo-50 dark:bg-indigo-900/30 border-indigo-200 dark:border-indigo-800'
          }`}
        >
          <div className="text-3xl text-center mb-1">{def?.icon || '📦'}</div>
          <div className="text-center font-semibold text-slate-800 dark:text-slate-100">
            {def?.name || (selectedType === 'column' ? 'Kolom' : selected.type)}
          </div>
          {def?.structural && (
            <div className="text-center text-xs text-red-600 mt-1">🏗️ Elemen Struktural</div>
          )}
          {def?.desc && (
            <div className="text-center text-xs text-slate-500 dark:text-slate-400 mt-1">{def.desc}</div>
          )}
          <div className="text-center text-xs text-slate-500 dark:text-slate-400 mt-1">
            ID: {selected.id} · {activeFloor?.name}
          </div>
        </div>

        {/* Quick actions */}
        {selectedType === 'item' && (
          <div className="grid grid-cols-3 gap-1 mb-3">
            <button
              onClick={rotateSelected}
              className="bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 text-slate-700 dark:text-slate-200 px-2 py-1.5 rounded text-xs font-medium flex items-center justify-center gap-1 transition-colors"
              title="Putar 45°"
            >
              <RotateCw size={12} />
              Putar
            </button>
            <button
              onClick={duplicateSelected}
              className="bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 text-slate-700 dark:text-slate-200 px-2 py-1.5 rounded text-xs font-medium flex items-center justify-center gap-1 transition-colors"
              title="Duplikat"
            >
              <Copy size={12} />
              Duplikat
            </button>
            <button
              onClick={deleteSelected}
              className="bg-red-100 hover:bg-red-200 text-red-700 px-2 py-1.5 rounded text-xs font-medium flex items-center justify-center gap-1 transition-colors"
              title="Hapus"
            >
              <Trash2 size={12} />
              Hapus
            </button>
          </div>
        )}

        {/* Position */}
        <Section title="Posisi">
          <DimensionSlider
            label={`X (${unit})`}
            value={toDisplay(selected.x, unit)}
            onChange={(v) => {
              const cmVal = fromDisplay(v, unit);
              if (selectedType === 'item') updateItem(selectedId, { x: cmVal });
              else if (selectedType === 'column') updateColumn(selectedId, { x: cmVal });
            }}
            onCommit={() => commit()}
            min={unit === 'm' ? -50 : -5000}
            max={unit === 'm' ? 50 : 5000}
            step={unit === 'm' ? 0.01 : 1}
            unit={unit}
            color="indigo"
            icon="↔"
          />
          <DimensionSlider
            label={`Y (${unit})`}
            value={toDisplay(selected.y, unit)}
            onChange={(v) => {
              const cmVal = fromDisplay(v, unit);
              if (selectedType === 'item') updateItem(selectedId, { y: cmVal });
              else if (selectedType === 'column') updateColumn(selectedId, { y: cmVal });
            }}
            onCommit={() => commit()}
            min={unit === 'm' ? -50 : -5000}
            max={unit === 'm' ? 50 : 5000}
            step={unit === 'm' ? 0.01 : 1}
            unit={unit}
            color="indigo"
            icon="↕"
          />
        </Section>

        {/* Size */}
        <Section title="Ukuran">
          <DimensionSlider
            label={`Lebar (${unit})`}
            value={toDisplay(selected.w || selected.size, unit)}
            onChange={(v) => {
              const cmVal = Math.max(10, fromDisplay(v, unit));
              if (selectedType === 'column') updateColumn(selectedId, { size: cmVal });
              else updateItem(selectedId, { w: cmVal });
            }}
            onCommit={() => commit()}
            min={1}
            max={unit === 'm' ? 20 : 2000}
            step={unit === 'm' ? 0.01 : 1}
            unit={unit}
            color="blue"
            icon="↔"
          />
          {selectedType === 'item' && (
            <DimensionSlider
              label={`Panjang (${unit})`}
              value={toDisplay(selected.h, unit)}
              onChange={(v) => updateItem(selectedId, { h: Math.max(10, fromDisplay(v, unit)) })}
              onCommit={() => commit()}
              min={1}
              max={unit === 'm' ? 20 : 2000}
              step={unit === 'm' ? 0.01 : 1}
              unit={unit}
              color="blue"
              icon="↕"
            />
          )}
        </Section>

        {/* Rotation for items */}
        {selectedType === 'item' && (
          <Section title="Rotasi">
            <DimensionSlider
              label="Derajat"
              value={Math.round((selected.rotation * 180) / Math.PI) % 360}
              onChange={(v) => updateItem(selectedId, { rotation: (v * Math.PI) / 180 })}
              onCommit={() => commit()}
              min={0}
              max={360}
              step={1}
              unit="°"
              color="amber"
              icon="↻"
            />
            <div className="flex gap-1 mt-1">
              {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => (
                <button
                  key={deg}
                  onClick={() => { commit(); updateItem(selectedId, { rotation: (deg * Math.PI) / 180 }); }}
                  className="flex-1 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 text-slate-700 dark:text-slate-200 px-1 py-1 rounded text-[10px] font-medium transition-colors"
                >
                  {deg}°
                </button>
              ))}
            </div>
          </Section>
        )}

        {/* Color for items */}
        {selectedType === 'item' && (
          <Section title="Warna">
            <div className="flex items-center gap-2 mb-2">
              <input
                type="color"
                className="w-9 h-8 rounded-lg border border-slate-300 dark:border-slate-600 cursor-pointer"
                value={(selected.color || def?.color || '#8B7355').trim()}
                onChange={(e) => handleColorChange(e.target.value)}
              />
              <input
                type="text"
                className="prop-input flex-1"
                value={selected.color || def?.color || '#8B7355'}
                onChange={(e) => handleColorChange(e.target.value)}
              />
            </div>
            <div className="grid grid-cols-8 gap-1.5">
              {[
                '#8B7355', '#4A5568', '#1A202C', '#DC2626',
                '#F59E0B', '#10B981', '#3B82F6', '#8B5CF6',
                '#EC4899', '#06B6D4', '#84CC16', '#F97316',
                '#6366F1', '#A855F7', '#14B8A6', '#E11D48',
              ].map((c) => (
                <button
                  key={c}
                  onClick={() => handleColorChange(c)}
                  className={`quick-color ${(selected.color || def?.color) === c ? 'selected' : ''}`}
                  style={{ background: c }}
                  title={c}
                />
              ))}
            </div>
          </Section>
        )}

        {/* Info */}
        <Section title="Info">
          <div className="text-xs text-slate-600 dark:text-slate-300 space-y-1">
            {selectedType === 'item' && (
              <>
                <div className="flex justify-between">
                  <span>Kategori:</span>
                  <span className="font-medium">
                    {categoryLabels[getItemCategory(selected.type)]?.label || '-'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Tinggi 3D:</span>
                  <span className="font-medium">{formatDimension(def?.height3d || 80, unit)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Luas:</span>
                  <span className="font-medium">
                    {((selected.w * selected.h) / 10000).toFixed(2)} m²
                  </span>
                </div>
              </>
            )}
            {selectedType === 'column' && (
              <div className="flex justify-between">
                <span>Luas:</span>
                <span className="font-medium">
                  {((selected.size * selected.size) / 10000).toFixed(3)} m²
                </span>
              </div>
            )}
          </div>
        </Section>
      </div>

      <StatsPanel />
    </>
  );
}

function PropertiesHeader() {
  const activeFloor = useActiveFloor();
  return (
    <div className="p-3 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
      <h2 className="font-semibold text-slate-700 dark:text-slate-200 text-sm">Properti</h2>
      <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded font-medium">
        {activeFloor?.name}
      </span>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div className="mb-3 space-y-1.5">
      <h3 className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1">
        {title}
      </h3>
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

function StatsPanel() {
  const { floors, plot, building, activeFloorId } = useStore();
  const activeFloor = floors.find((f) => f.id === activeFloorId) || floors[0];

  return (
    <div className="p-3 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-700/50">
      <h3 className="text-xs font-semibold text-slate-700 dark:text-slate-200 mb-2">Statistik</h3>
      <div className="text-xs text-slate-500 dark:text-slate-400 space-y-1">
        <div className="flex justify-between">
          <span>Total Lantai:</span>
          <span className="font-semibold text-slate-700 dark:text-slate-200">{floors.length}</span>
        </div>
        <div className="flex justify-between">
          <span>Item (lantai ini):</span>
          <span className="font-semibold text-slate-700 dark:text-slate-200">{activeFloor?.items.length || 0}</span>
        </div>
        <div className="flex justify-between">
          <span>Dinding:</span>
          <span className="font-semibold text-slate-700 dark:text-slate-200">{activeFloor?.walls.length || 0}</span>
        </div>
        <div className="flex justify-between">
          <span>Kolom:</span>
          <span className="font-semibold text-slate-700 dark:text-slate-200">{activeFloor?.columns.length || 0}</span>
        </div>
        <div className="border-t border-slate-200 dark:border-slate-700 my-1"></div>
        <div className="flex justify-between">
          <span>Luas Tanah:</span>
          <span className="font-semibold text-slate-700 dark:text-slate-200">
            {((plot.width * plot.depth) / 10000).toFixed(2)} m²
          </span>
        </div>
        <div className="flex justify-between">
          <span>Luas Bangunan:</span>
          <span className="font-semibold text-slate-700 dark:text-slate-200">
            {((building.width * building.depth) / 10000).toFixed(2)} m²
          </span>
        </div>
        <div className="flex justify-between">
          <span>KDB:</span>
          <span className="font-semibold text-slate-700 dark:text-slate-200">
            {((building.width * building.depth * 100) / (plot.width * plot.depth)).toFixed(1)}%
          </span>
        </div>
      </div>
    </div>
  );
}
