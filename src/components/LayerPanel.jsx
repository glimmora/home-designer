import React from 'react';
import { useStore } from '../lib/store';
import { X, Eye, EyeOff } from 'lucide-react';
import { useLang } from '../lib/i18n';

export default function LayerPanel() {
  const { t } = useLang();
  const {
    isLayerPanelOpen,
    closeLayerPanel,
    layers,
    toggleLayer,
  } = useStore();

  if (!isLayerPanelOpen) return null;

  const layerDefs = [
    { key: 'walls', label: 'Dinding', icon: '🧱' },
    { key: 'items', label: 'Furnitur', icon: '🛋️' },
    { key: 'columns', label: 'Kolom', icon: '🏗️' },
    { key: 'mep', label: 'MEP (Pipa/Kabel)', icon: '🔧' },
    { key: 'dimensions', label: 'Dimensi', icon: '📏' },
    { key: 'annotations', label: 'Anotasi', icon: '📝' },
  ];

  return (
    <div className="fixed top-14 right-4 z-[100] bg-white dark:bg-slate-800 rounded-lg shadow-2xl border border-slate-200 dark:border-slate-700 w-56 animate-fade-in">
      <div className="flex items-center justify-between p-3 border-b border-slate-200 dark:border-slate-700">
        <h3 className="font-bold text-sm">Layer Panel</h3>
        <button onClick={closeLayerPanel} className="text-slate-400 hover:text-slate-600 p-1 rounded">
          <X size={16} />
        </button>
      </div>
      <div className="p-2 space-y-1">
        {layerDefs.map(({ key, label, icon }) => (
          <button
            key={key}
            onClick={() => toggleLayer(key)}
            className={`w-full flex items-center gap-2 px-2 py-1.5 rounded text-xs font-medium transition-colors ${
              layers[key]
                ? 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200'
                : 'text-slate-400 dark:text-slate-500'
            }`}
          >
            <span>{icon}</span>
            <span className="flex-1 text-left">{label}</span>
            {layers[key] ? <Eye size={13} /> : <EyeOff size={13} />}
          </button>
        ))}
      </div>
    </div>
  );
}
