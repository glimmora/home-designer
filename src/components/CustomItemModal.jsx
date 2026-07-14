import React, { useState, useEffect } from 'react';
import { useStore } from '../lib/store';
import { categoryLabels, ALL_CATEGORIES } from '../lib/itemDefinitions';
import { X, Check, Trash2, Package } from 'lucide-react';

const EMOJI_CHOICES = ['📦', '🪑', '🛏️', '🛋️', '🍽️', '🚪', '🪟', '🚽', '🚿', '🛁', '🧊', '🔥', '🍳', '📚', '💡', '🔌', '🪞', '🖼️', '🪴', '🎮', '🖥️', '📺', '🎹', '🎸', '⚽', '🚲', '🛴', '🧸', '🗄️', '🗃️', '🧹', '🪤'];

export default function CustomItemModal() {
  const {
    isCustomItemModalOpen,
    editingCustomItem,
    customItems,
    addCustomItem,
    updateCustomItem,
    deleteCustomItem,
    closeCustomItemModal,
    category,
  } = useStore();

  const [form, setForm] = useState({
    name: '',
    category: category,
    icon: '📦',
    w: 100,
    h: 100,
    color: '#8B7355',
    height3d: 80,
    desc: '',
    structural: false,
  });

  useEffect(() => {
    if (editingCustomItem) {
      setForm({
        name: editingCustomItem.name || '',
        category: editingCustomItem.category || category,
        icon: editingCustomItem.icon || '📦',
        w: editingCustomItem.w || 100,
        h: editingCustomItem.h || 100,
        color: editingCustomItem.color || '#8B7355',
        height3d: editingCustomItem.height3d || 80,
        desc: editingCustomItem.desc || '',
        structural: editingCustomItem.structural || false,
      });
    } else {
      setForm({
        name: '',
        category: category,
        icon: '📦',
        w: 100,
        h: 100,
        color: '#8B7355',
        height3d: 80,
        desc: '',
        structural: false,
      });
    }
  }, [editingCustomItem, category, isCustomItemModalOpen]);

  if (!isCustomItemModalOpen) return null;

  const handleSubmit = () => {
    if (!form.name.trim()) {
      alert('Nama item wajib diisi');
      return;
    }
    if (form.w <= 0 || form.h <= 0) {
      alert('Ukuran harus lebih besar dari 0');
      return;
    }

    const itemData = {
      name: form.name.trim(),
      category: form.category,
      icon: form.icon,
      w: Number(form.w),
      h: Number(form.h),
      color: form.color,
      height3d: Number(form.height3d),
      desc: form.desc.trim(),
      structural: form.structural,
    };

    if (editingCustomItem) {
      updateCustomItem(editingCustomItem.type, itemData);
    } else {
      addCustomItem(itemData);
    }
    closeCustomItemModal();
  };

  const handleDelete = () => {
    if (editingCustomItem && window.confirm(`Hapus item "${editingCustomItem.name}"?`)) {
      deleteCustomItem(editingCustomItem.type);
      closeCustomItemModal();
    }
  };

  // Collect all custom items for listing
  const allCustomItems = [];
  for (const cat in customItems) {
    customItems[cat].forEach((item) => {
      allCustomItems.push({ ...item, category: cat });
    });
  }

  return (
    <div
      className="modal-overlay fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4"
      onMouseDown={(e) => e.target === e.currentTarget && closeCustomItemModal()}
    >
      <div className="modal-content bg-white dark:bg-slate-800 dark:text-slate-100 rounded-xl shadow-2xl w-full max-w-2xl max-h-[92vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700 sticky top-0 bg-white dark:bg-slate-800 z-10">
          <h2 className="text-lg font-bold flex items-center gap-2">
            <Package className="text-indigo-600" size={20} />
            {editingCustomItem ? 'Edit Item Kustom' : 'Tambah Item Kustom'}
          </h2>
          <button
            onClick={closeCustomItemModal}
            className="text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700 p-1 rounded"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-4 space-y-4">
          {/* Name & Category */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1 block">
                Nama Item *
              </label>
              <input
                type="text"
                className="prop-input"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="contoh: Meja Custom"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1 block">
                Kategori
              </label>
              <select
                className="prop-input"
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
              >
                {ALL_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {categoryLabels[cat]?.icon} {categoryLabels[cat]?.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Icon picker */}
          <div>
            <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5 block">
              Ikon
            </label>
            <div className="grid grid-cols-12 gap-1 p-2 border border-slate-200 dark:border-slate-700 rounded-lg max-h-32 overflow-y-auto">
              {EMOJI_CHOICES.map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => setForm({ ...form, icon: emoji })}
                  className={`text-xl p-1 rounded transition-all ${
                    form.icon === emoji
                      ? 'bg-indigo-100 dark:bg-indigo-900 ring-2 ring-indigo-500'
                      : 'hover:bg-slate-100 dark:hover:bg-slate-700'
                  }`}
                >
                  {emoji}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2 mt-2">
              <input
                type="text"
                className="prop-input flex-1"
                value={form.icon}
                onChange={(e) => setForm({ ...form, icon: e.target.value })}
                maxLength={2}
              />
              <span className="text-xs text-slate-500">Atau ketik emoji sendiri</span>
            </div>
          </div>

          {/* Dimensions */}
          <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
            <h3 className="text-sm font-semibold text-blue-800 dark:text-blue-300 mb-2">
              📐 Ukuran (cm)
            </h3>
            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="text-xs text-slate-600 dark:text-slate-400">Lebar (W)</label>
                <input
                  type="number"
                  className="prop-input"
                  value={form.w}
                  min="1"
                  onChange={(e) => setForm({ ...form, w: e.target.value })}
                />
              </div>
              <div>
                <label className="text-xs text-slate-600 dark:text-slate-400">Panjang (H)</label>
                <input
                  type="number"
                  className="prop-input"
                  value={form.h}
                  min="1"
                  onChange={(e) => setForm({ ...form, h: e.target.value })}
                />
              </div>
              <div>
                <label className="text-xs text-slate-600 dark:text-slate-400">Tinggi 3D</label>
                <input
                  type="number"
                  className="prop-input"
                  value={form.height3d}
                  min="1"
                  onChange={(e) => setForm({ ...form, height3d: e.target.value })}
                />
              </div>
            </div>
          </div>

          {/* Color & structural */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1 block">
                Warna
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  className="w-10 h-9 rounded border border-slate-300 cursor-pointer"
                  value={form.color}
                  onChange={(e) => setForm({ ...form, color: e.target.value })}
                />
                <input
                  type="text"
                  className="prop-input flex-1"
                  value={form.color}
                  onChange={(e) => setForm({ ...form, color: e.target.value })}
                />
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1 block">
                Tipe
              </label>
              <label className="flex items-center gap-2 p-2 bg-slate-50 dark:bg-slate-700 rounded border border-slate-200 dark:border-slate-600 h-9">
                <input
                  type="checkbox"
                  checked={form.structural}
                  onChange={(e) => setForm({ ...form, structural: e.target.checked })}
                  className="w-4 h-4"
                />
                <span className="text-xs">Elemen Struktural</span>
              </label>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1 block">
              Deskripsi (opsional)
            </label>
            <input
              type="text"
              className="prop-input"
              value={form.desc}
              onChange={(e) => setForm({ ...form, desc: e.target.value })}
              placeholder="contoh: Meja kayu jati 4 kaki"
            />
          </div>

          {/* Preview */}
          <div className="bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-700 rounded-lg p-3">
            <h3 className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
              Preview
            </h3>
            <div className="flex items-center gap-3">
              <div
                className="w-16 h-16 rounded border border-slate-300 flex items-center justify-center text-3xl"
                style={{ background: form.color }}
              >
                {form.icon}
              </div>
              <div>
                <div className="font-semibold text-slate-800 dark:text-slate-100">
                  {form.name || 'Nama Item'}
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400">
                  {form.w} x {form.h} cm · Tinggi 3D: {form.height3d} cm
                </div>
                {form.structural && (
                  <span className="inline-block mt-1 bg-red-500 text-white text-[9px] px-1.5 py-0.5 rounded font-semibold">
                    STRUKTURAL
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Existing custom items list */}
          {!editingCustomItem && allCustomItems.length > 0 && (
            <div>
              <h3 className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                Item Kustom yang Sudah Ada ({allCustomItems.length})
              </h3>
              <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto">
                {allCustomItems.map((item) => (
                  <button
                    key={item.type}
                    type="button"
                    onClick={() => useStore.getState().openCustomItemModal(item)}
                    className="flex items-center gap-2 p-2 border border-slate-200 dark:border-slate-700 rounded hover:bg-slate-50 dark:hover:bg-slate-700 text-left"
                  >
                    <span className="text-2xl">{item.icon}</span>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-medium truncate">{item.name}</div>
                      <div className="text-[10px] text-slate-400">
                        {categoryLabels[item.category]?.label} · {item.w}x{item.h}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-700 flex justify-between gap-2 sticky bottom-0 bg-white dark:bg-slate-800">
          {editingCustomItem ? (
            <button
              type="button"
              onClick={handleDelete}
              className="px-4 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-md text-sm font-medium flex items-center gap-1.5"
            >
              <Trash2 size={14} />
              Hapus
            </button>
          ) : (
            <div />
          )}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={closeCustomItemModal}
              className="px-4 py-2 border border-slate-300 dark:border-slate-600 dark:text-slate-200 rounded-md text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-700"
            >
              Batal
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md text-sm font-medium flex items-center gap-1.5"
            >
              <Check size={14} />
              {editingCustomItem ? 'Simpan Perubahan' : 'Tambah Item'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
