import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useStore } from '../lib/store';
import { categoryLabels, itemDefinitions, getItemDef } from '../lib/itemDefinitions';
import { formatDimension } from '../lib/utils';
import { useLang } from '../lib/i18n';
import { Plus, Pencil, Search, Star, ChevronLeft, ChevronRight, Info } from 'lucide-react';

export default function Sidebar() {
  const { t } = useLang();
  const {
    category,
    setCategory,
    unit,
    addItem,
    viewMode,
    customItems,
    getAllItemDefinitions,
    openCustomItemModal,
    favorites,
    addFavorite,
  } = useStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [showLegend, setShowLegend] = useState(false);
  const catScrollRef = useRef(null);
  const allDefs = getAllItemDefinitions();
  const items = allDefs[category] || [];
  const isStructural = viewMode === 'structural';
  const customInCat = (customItems[category] || []).length;

  // Search across all categories
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return null;
    const q = searchQuery.toLowerCase();
    const results = [];
    for (const cat in allDefs) {
      allDefs[cat].forEach(item => {
        if (item.name.toLowerCase().includes(q) || item.type.toLowerCase().includes(q) || (item.desc || '').toLowerCase().includes(q)) {
          results.push({ ...item, category: cat });
        }
      });
    }
    return results;
  }, [searchQuery, allDefs]);

  // Favorite items
  const favoriteItems = useMemo(() => {
    return favorites.map(type => getItemDef(type)).filter(Boolean);
  }, [favorites]);

  // Handle drag start from sidebar
  const handleDragStart = (e, itemType) => {
    e.dataTransfer.setData('text/plain', itemType);
    e.dataTransfer.effectAllowed = 'copy';
  };

  // Display: search results override category items
  const displayItems = searchResults || items;

  // Scroll category tabs left/right
  const scrollCats = (dir) => {
    if (catScrollRef.current) {
      catScrollRef.current.scrollBy({ left: dir * 200, behavior: 'smooth' });
    }
  };

  // Category entries as array
  const categoryEntries = Object.entries(categoryLabels);

  return (
    <aside className="w-60 bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 flex flex-col overflow-hidden flex-shrink-0 h-full">
      {/* Header: Title + Add custom button */}
      <div className="p-2.5 border-b border-slate-200 dark:border-slate-700 flex-shrink-0">
        <div className="flex items-center justify-between mb-2">
          <h2 className="font-semibold text-slate-700 dark:text-slate-200 text-sm">{t.kategoriItem}</h2>
          <button
            onClick={() => openCustomItemModal()}
            className="text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/30 p-1 rounded"
            title="Tambah item kustom"
          >
            <Plus size={14} />
          </button>
        </div>

        {/* Category horizontal scrollable list */}
        <div className="relative flex items-center gap-0.5">
          <button
            onClick={() => scrollCats(-1)}
            className="flex-shrink-0 p-0.5 rounded hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400"
            title="Scroll kiri"
          >
            <ChevronLeft size={14} />
          </button>
          <div
            ref={catScrollRef}
            className="flex-1 flex gap-1 overflow-x-auto scrollbar-thin pb-1"
            style={{ scrollbarWidth: 'thin' }}
          >
            {categoryEntries.map(([key, { label, icon }]) => {
              const customCount = (customItems[key] || []).length;
              const isActive = category === key;
              const itemCount = (allDefs[key] || []).length;
              return (
                <button
                  key={key}
                  className={`flex-shrink-0 px-2 py-1 rounded text-[11px] font-medium flex items-center gap-1 relative whitespace-nowrap transition-all ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
                  }`}
                  onClick={() => setCategory(key)}
                  title={`${label} (${itemCount} item)`}
                >
                  <span>{icon}</span>
                  <span>{label.split(' ')[0]}</span>
                  {customCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-purple-500 text-white text-[8px] px-1 rounded-full min-w-[12px] text-center">
                      {customCount}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
          <button
            onClick={() => scrollCats(1)}
            className="flex-shrink-0 p-0.5 rounded hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400"
            title="Scroll kanan"
          >
            <ChevronRight size={14} />
          </button>
        </div>
      </div>

      {/* Search bar + category info */}
      <div className="px-2.5 py-1.5 bg-slate-50 dark:bg-slate-700/50 border-b border-slate-200 dark:border-slate-700 flex-shrink-0">
        <div className="relative">
          <Search size={12} className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder={t.klikItem || 'Cari item...'}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-7 pr-2 py-1.5 text-xs bg-white dark:bg-slate-600 border border-slate-200 dark:border-slate-500 rounded-md text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-400"
          />
        </div>
        <div className="text-[11px] text-slate-600 dark:text-slate-300 flex items-center justify-between mt-1">
          {!searchQuery ? (
            <>
              <span className="font-semibold truncate">{categoryLabels[category]?.label}</span>
              <span className="text-slate-400 flex-shrink-0 ml-1">
                {items.length}{customInCat > 0 && ` +${customInCat}`} item
              </span>
            </>
          ) : (
            <span className="font-semibold">Hasil: {searchResults?.length || 0}</span>
          )}
        </div>
      </div>

      {/* Favorites bar (compact) */}
      {!searchQuery && favoriteItems.length > 0 && (
        <div className="px-2.5 py-1 border-b border-slate-100 dark:border-slate-700 bg-amber-50 dark:bg-amber-900/20 flex-shrink-0">
          <div className="flex gap-1 overflow-x-auto scrollbar-thin">
            {favoriteItems.map(item => (
              <button
                key={item.type}
                onClick={() => addItem(item.type)}
                onDragStart={(e) => handleDragStart(e, item.type)}
                draggable
                className="flex-shrink-0 w-7 h-7 flex items-center justify-center bg-white dark:bg-slate-700 border border-amber-200 dark:border-amber-800 rounded text-sm hover:bg-amber-50 dark:hover:bg-amber-900/30"
                title={item.name}
              >
                {item.icon}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Items grid - main scrollable area */}
      <div className="flex-1 overflow-y-auto p-2 min-h-0">
        <div className="grid grid-cols-2 gap-1.5">
          {displayItems.map((item) => (
            <div
              key={item.type}
              className="sidebar-item bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg p-1.5 text-center relative hover:border-indigo-300 group cursor-pointer transition-colors"
              onClick={() => { addItem(item.type); addFavorite(item.type); }}
              onDragStart={(e) => handleDragStart(e, item.type)}
              draggable
            >
              {item.structural && (
                <span className="absolute top-0.5 right-0.5 bg-red-500 text-white text-[8px] px-1 rounded font-semibold">
                  STR
                </span>
              )}
              <button
                onClick={(e) => { e.stopPropagation(); addFavorite(item.type); }}
                className="absolute top-0.5 left-0.5 text-amber-400 hover:text-amber-500 opacity-0 group-hover:opacity-100 transition-opacity"
                title="Tambah ke favorit"
              >
                <Star size={10} fill={favorites.includes(item.type) ? 'currentColor' : 'none'} />
              </button>
              {item.custom && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    openCustomItemModal(item);
                  }}
                  className="absolute top-0.5 left-6 bg-purple-500 hover:bg-purple-600 text-white text-[9px] p-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                  title="Edit item kustom"
                >
                  <Pencil size={8} />
                </button>
              )}
              <div className="text-xl mb-0.5">{item.icon}</div>
              <div className="text-[11px] font-medium text-slate-700 dark:text-slate-200 leading-tight line-clamp-2 min-h-[1.8rem]" title={item.name}>
                {item.name}
              </div>
              <div className="text-[9px] text-slate-400">
                {formatDimension(item.w, unit)}x{formatDimension(item.h, unit)}
              </div>
            </div>
          ))}
        </div>

        {displayItems.length === 0 && (
          <div className="text-center text-slate-400 text-xs py-8">
            <p>Belum ada item</p>
            <button
              onClick={() => openCustomItemModal()}
              className="mt-2 text-purple-600 hover:underline"
            >
              + Tambah item kustom
            </button>
          </div>
        )}
      </div>

      {/* Bottom: Add custom + Legend toggle (collapsible) */}
      <div className="border-t border-slate-200 dark:border-slate-700 flex-shrink-0">
        <button
          onClick={() => openCustomItemModal()}
          className="w-full bg-purple-50 dark:bg-purple-900/30 hover:bg-purple-100 dark:hover:bg-purple-900/50 text-purple-700 dark:text-purple-300 border-b border-purple-200 dark:border-purple-800 px-2 py-1.5 text-xs font-medium flex items-center justify-center gap-1.5 transition-colors"
        >
          <Plus size={12} />
          {t.tambahItemKustom}
        </button>
        <button
          onClick={() => setShowLegend(!showLegend)}
          className="w-full px-2.5 py-1 text-[10px] text-slate-500 dark:text-slate-400 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-700/50"
        >
          <span className="flex items-center gap-1">
            <Info size={10} /> {t.legenda}
          </span>
          <span>{showLegend ? '▲' : '▼'}</span>
        </button>
        {showLegend && (
          <div className="px-2.5 pb-2 bg-slate-50 dark:bg-slate-700/50">
            <div className="grid grid-cols-2 gap-1">
              <div className="legend-item text-[10px]">
                <div className="legend-color" style={{ background: '#22c55e' }} />
                {t.tanah}
              </div>
              <div className="legend-item text-[10px]">
                <div className="legend-color" style={{ background: '#3b82f6' }} />
                {t.bangunan}
              </div>
              <div className="legend-item text-[10px]">
                <div className="legend-color" style={{ background: '#dc2626' }} />
                {t.kolom}
              </div>
              <div className="legend-item text-[10px]">
                <div className="legend-color" style={{ background: '#f59e0b' }} />
                {t.balok}
              </div>
              <div className="legend-item text-[10px]">
                <div className="legend-color" style={{ background: '#1a202c' }} />
                {t.dinding}
              </div>
              <div className="legend-item text-[10px]">
                <div className="legend-color" style={{ background: '#78716c' }} />
                {t.tangga}
              </div>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
