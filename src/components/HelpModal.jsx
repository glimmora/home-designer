import React from 'react';
import { useStore } from '../lib/store';
import { X, Keyboard, MousePointer2, Box, Layers } from 'lucide-react';

export default function HelpModal() {
  const { isHelpOpen, closeHelp } = useStore();
  if (!isHelpOpen) return null;

  const shortcuts = [
    { keys: 'V', desc: 'Mode Pilih (select)' },
    { keys: 'W', desc: 'Mode Dinding (wall)' },
    { keys: 'R', desc: 'Putar item terpilih 45°' },
    { keys: 'C', desc: 'Mode Kolom (column)' },
    { keys: 'Del / Backspace', desc: 'Hapus item terpilih' },
    { keys: 'Ctrl+D', desc: 'Duplikat item terpilih' },
    { keys: 'Ctrl+Z', desc: 'Undo' },
    { keys: 'Ctrl+Y', desc: 'Redo' },
    { keys: 'Ctrl+S', desc: 'Simpan desain ke browser' },
    { keys: 'Ctrl+Shift+L', desc: 'Toggle dark mode' },
    { keys: 'Esc', desc: 'Batal pilihan / batal gambar dinding' },
    { keys: '+ / -', desc: 'Zoom in / out' },
    { keys: '0', desc: 'Reset view' },
    { keys: 'Scroll', desc: 'Zoom in/out (2D & 3D)' },
    { keys: 'Klik tengah + seret', desc: 'Geser canvas (pan)' },
    { keys: 'Klik kanan + seret (3D)', desc: 'Putar kamera 3D' },
  ];

  return (
    <div
      className="modal-overlay fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4"
      onMouseDown={(e) => e.target === e.currentTarget && closeHelp()}
    >
      <div className="modal-content bg-white dark:bg-slate-800 rounded-xl shadow-2xl w-full max-w-2xl max-h-[92vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700 sticky top-0 bg-white dark:bg-slate-800">
          <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <Keyboard className="text-indigo-600" size={20} />
            Bantuan & Shortcut
          </h2>
          <button
            onClick={closeHelp}
            className="text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:bg-slate-700 p-1 rounded"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-4 space-y-4">
          <section>
            <h3 className="font-semibold text-slate-800 dark:text-slate-100 mb-2 flex items-center gap-1.5">
              <MousePointer2 size={16} className="text-indigo-600" />
              Cara Menggunakan
            </h3>
            <ul className="text-sm text-slate-600 dark:text-slate-300 space-y-1 list-disc list-inside">
              <li>
                Klik item di sidebar kiri untuk menambahkan ke lantai aktif
              </li>
              <li>Gunakan tool <strong>Dinding</strong> untuk menggambar dinding (klik 2 titik)</li>
              <li>Gunakan tool <strong>Ruangan</strong> untuk membuat 4 dinding sekaligus</li>
              <li>Gunakan tool <strong>Kolom</strong> untuk menambahkan kolom struktural</li>
              <li>Klik item untuk memilih, lalu edit propertinya di panel kanan</li>
              <li>Gunakan handle hijau untuk resize dan handle bulat untuk rotasi</li>
              <li>Tambah lantai baru dengan tombol "Tambah Lantai"</li>
            </ul>
          </section>

          <section>
            <h3 className="font-semibold text-slate-800 dark:text-slate-100 mb-2 flex items-center gap-1.5">
              <Box size={16} className="text-indigo-600" />
              Mode Tampilan
            </h3>
            <ul className="text-sm text-slate-600 dark:text-slate-300 space-y-1 list-disc list-inside">
              <li><strong>2D</strong>: Tampilan denah atas untuk editing presisi</li>
              <li><strong>3D</strong>: Tampilan 3D dengan kamera yang bisa diputar</li>
              <li><strong>Normal</strong>: Tampilkan semua item dengan warna asli</li>
              <li><strong>Struktur</strong>: Highlight elemen struktural (kolom, balok, tangga)</li>
            </ul>
          </section>

          <section>
            <h3 className="font-semibold text-slate-800 dark:text-slate-100 mb-2 flex items-center gap-1.5">
              <Layers size={16} className="text-indigo-600" />
              Multi-Lantai
            </h3>
            <ul className="text-sm text-slate-600 dark:text-slate-300 space-y-1 list-disc list-inside">
              <li>Tambah lantai baru dengan tombol di panel kanan bawah</li>
              <li>Klik 2x nama lantai untuk rename</li>
              <li>Atur tinggi setiap lantai (200-500 cm)</li>
              <li>Di mode 3D, semua lantai ditampilkan bertumpuk</li>
              <li>Tangga otomatis menghubungkan antar lantai</li>
            </ul>
          </section>

          <section>
            <h3 className="font-semibold text-slate-800 dark:text-slate-100 mb-2">⌨️ Shortcut Keyboard</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-1.5">
              {shortcuts.map((s, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between bg-slate-50 dark:bg-slate-700/50 rounded px-3 py-1.5 text-sm"
                >
                  <span className="text-slate-600 dark:text-slate-300">{s.desc}</span>
                  <kbd className="px-2 py-0.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded text-xs font-mono text-slate-700 dark:text-slate-200 shadow-sm">
                    {s.keys}
                  </kbd>
                </div>
              ))}
            </div>
          </section>

          <section className="bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-200 dark:border-indigo-800 rounded-lg p-3">
            <h3 className="font-semibold text-indigo-800 dark:text-indigo-300 mb-1">💾 Penyimpanan & Fitur Lanjutan</h3>
            <p className="text-sm text-indigo-700 dark:text-indigo-300 mb-2">
              Desain disimpan di browser (localStorage). Gunakan tombol "Simpan" untuk menyimpan
              dan "Muat" untuk memuat kembali. Bersihkan data dengan icon eraser.
            </p>
            <ul className="text-sm text-indigo-700 dark:text-indigo-300 space-y-1 list-disc list-inside">
              <li><strong>📦 Item Kustom</strong>: Buat item sendiri dengan ukuran, warna, dan ikon kustom</li>
              <li><strong>🧮 Estimasi Biaya</strong>: Hitung biaya material berdasarkan volume dinding, lantai, kolom, cat, pondasi</li>
              <li><strong>📤 Export/Import</strong>: Simpan project sebagai JSON (lengkap), DXF (AutoCAD), SVG (vektor), atau PNG (gambar)</li>
              <li><strong>🌙 Dark Mode</strong>: Toggle tema terang/gelap (Ctrl+Shift+L)</li>
              <li><strong>↩️ Undo/Redo</strong>: 50 langkah history untuk semua perubahan</li>
            </ul>
          </section>
        </div>

        <div className="p-4 border-t border-slate-200 dark:border-slate-700 flex justify-end">
          <button
            onClick={closeHelp}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md text-sm font-medium"
          >
            Mengerti
          </button>
        </div>
      </div>
    </div>
  );
}
