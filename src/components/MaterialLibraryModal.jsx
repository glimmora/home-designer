import React, { useState, useMemo } from 'react';
import { useStore } from '../lib/store';
import { materialLibrary, getAllMaterials, searchMaterials } from '../lib/materialLibrary';
import { formatCurrency } from '../lib/costCalculator';
import { Layers, X, Search, Package, ShoppingCart, TrendingUp } from 'lucide-react';

export default function MaterialLibraryModal() {
  const { isMaterialModalOpen, closeMaterialModal, costSettings } = useStore();
  const [activeCat, setActiveCat] = useState(null);
  const [query, setQuery] = useState('');
  const [cart, setCart] = useState({}); // { materialId: quantity }

  const currency = costSettings.currency;

  const materials = useMemo(() => {
    if (query.trim()) return searchMaterials(query);
    if (activeCat) return materialLibrary[activeCat].materials.map((m) => ({ ...m, category: activeCat }));
    return getAllMaterials();
  }, [query, activeCat]);

  const cartItems = Object.entries(cart)
    .map(([id, qty]) => {
      const m = getAllMaterials().find((x) => x.id === id);
      return m ? { ...m, quantity: qty, subtotal: m.price * qty } : null;
    })
    .filter(Boolean);

  const cartTotal = cartItems.reduce((sum, item) => sum + item.subtotal, 0);

  const updateQty = (id, qty) => {
    if (qty <= 0) {
      const newCart = { ...cart };
      delete newCart[id];
      setCart(newCart);
    } else {
      setCart({ ...cart, [id]: qty });
    }
  };

  if (!isMaterialModalOpen) return null;

  return (
    <div
      className="modal-overlay fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4"
      onMouseDown={(e) => e.target === e.currentTarget && closeMaterialModal()}
    >
      <div className="modal-content bg-white dark:bg-slate-800 dark:text-slate-100 rounded-xl shadow-2xl w-full max-w-5xl max-h-[92vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700 flex-shrink-0">
          <h2 className="text-lg font-bold flex items-center gap-2">
            <Layers className="text-pink-600" size={20} />
            Library Material & Harga
          </h2>
          <button
            onClick={closeMaterialModal}
            className="text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700 p-1 rounded"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar categories */}
          <div className="w-48 border-r border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-700/50 overflow-y-auto">
            <button
              onClick={() => {
                setActiveCat(null);
                setQuery('');
              }}
              className={`w-full text-left px-3 py-2.5 text-sm flex items-center gap-2 transition-colors ${
                !activeCat && !query
                  ? 'bg-pink-100 dark:bg-pink-900/30 text-pink-700 dark:text-pink-300 font-semibold'
                  : 'hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200'
              }`}
            >
              <Package size={14} />
              Semua
            </button>
            {Object.entries(materialLibrary).map(([key, cat]) => (
              <button
                key={key}
                onClick={() => {
                  setActiveCat(key);
                  setQuery('');
                }}
                className={`w-full text-left px-3 py-2.5 text-sm flex items-center gap-2 transition-colors ${
                  activeCat === key
                    ? 'bg-pink-100 dark:bg-pink-900/30 text-pink-700 dark:text-pink-300 font-semibold'
                    : 'hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200'
                }`}
              >
                <span>{cat.icon}</span>
                <span className="truncate">{cat.label}</span>
                <span className="ml-auto text-[10px] text-slate-400">{cat.materials.length}</span>
              </button>
            ))}
          </div>

          {/* Main content */}
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Search */}
            <div className="p-3 border-b border-slate-200 dark:border-slate-700">
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Cari material, brand, atau deskripsi..."
                  value={query}
                  onChange={(e) => {
                    setQuery(e.target.value);
                    setActiveCat(null);
                  }}
                  className="prop-input pl-8"
                />
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                {materials.length} material ditemukan
                {activeCat && ` di kategori ${materialLibrary[activeCat].label}`}
              </div>
            </div>

            {/* Materials list */}
            <div className="flex-1 overflow-y-auto p-3">
              <div className="grid grid-cols-1 gap-2">
                {materials.map((m) => (
                  <div
                    key={m.id}
                    className="border border-slate-200 dark:border-slate-700 rounded-lg p-3 hover:border-pink-300 dark:hover:border-pink-700 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="font-semibold text-sm text-slate-800 dark:text-slate-100">
                            {m.name}
                          </h4>
                          <span className="text-[10px] bg-slate-100 dark:bg-slate-700 px-1.5 py-0.5 rounded text-slate-600 dark:text-slate-300">
                            {m.brand}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{m.desc}</p>
                        <div className="flex items-center gap-3 mt-1.5">
                          <span className="text-base font-bold text-pink-600 dark:text-pink-400">
                            {formatCurrency(m.price, currency)}
                          </span>
                          <span className="text-xs text-slate-400">/ {m.unit}</span>
                        </div>
                      </div>
                      {/* Quantity controls */}
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <button
                          onClick={() => updateQty(m.id, (cart[m.id] || 0) - 1)}
                          className="w-7 h-7 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 rounded text-sm font-bold text-slate-600 dark:text-slate-200"
                        >
                          −
                        </button>
                        <input
                          type="number"
                          min="0"
                          value={cart[m.id] || 0}
                          onChange={(e) => updateQty(m.id, parseInt(e.target.value) || 0)}
                          className="w-14 px-2 py-1 text-center text-sm border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 rounded"
                        />
                        <button
                          onClick={() => updateQty(m.id, (cart[m.id] || 0) + 1)}
                          className="w-7 h-7 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 rounded text-sm font-bold text-slate-600 dark:text-slate-200"
                        >
                          +
                        </button>
                      </div>
                    </div>
                    {cart[m.id] > 0 && (
                      <div className="mt-2 pt-2 border-t border-slate-100 dark:border-slate-700 text-xs text-pink-600 dark:text-pink-400 font-medium">
                        Subtotal: {formatCurrency(m.price * cart[m.id], currency)} ({cart[m.id]} {m.unit})
                      </div>
                    )}
                  </div>
                ))}
                {materials.length === 0 && (
                  <div className="text-center text-slate-400 py-12">
                    <Package size={32} className="mx-auto mb-2" />
                    Tidak ada material ditemukan
                  </div>
                )}
              </div>
            </div>

            {/* Cart footer */}
            {cartItems.length > 0 && (
              <div className="border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-700/50 p-3">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm font-semibold flex items-center gap-1.5">
                    <ShoppingCart size={14} />
                    Keranjang ({cartItems.length} item)
                  </h4>
                  <button
                    onClick={() => setCart({})}
                    className="text-xs text-red-600 hover:underline"
                  >
                    Kosongkan
                  </button>
                </div>
                <div className="max-h-32 overflow-y-auto space-y-1 mb-2">
                  {cartItems.map((item) => (
                    <div key={item.id} className="flex items-center justify-between text-xs">
                      <span className="truncate flex-1">{item.name}</span>
                      <span className="text-slate-500 dark:text-slate-400 mx-2">
                        {item.quantity} x {formatCurrency(item.price, currency)}
                      </span>
                      <span className="font-medium">{formatCurrency(item.subtotal, currency)}</span>
                    </div>
                  ))}
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-slate-200 dark:border-slate-600">
                  <span className="font-bold text-sm flex items-center gap-1.5">
                    <TrendingUp size={14} />
                    Total:
                  </span>
                  <span className="font-bold text-lg text-pink-600 dark:text-pink-400">
                    {formatCurrency(cartTotal, currency)}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="p-4 border-t border-slate-200 dark:border-slate-700 flex justify-between items-center flex-shrink-0">
          <p className="text-xs text-slate-500 dark:text-slate-400">
            💡 Harga estimasi pasar Indonesia 2024. Edit di Cost Settings untuk akurasi.
          </p>
          <button
            onClick={closeMaterialModal}
            className="px-4 py-2 bg-pink-600 hover:bg-pink-700 text-white rounded-md text-sm font-medium"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
}
