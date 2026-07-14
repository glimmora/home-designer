# Home Designer Pro - Multi-Floor

Aplikasi desain rumah interaktif 2D/3D dengan dukungan multi-lantai, MEP (Mechanical, Electrical, Plumbing), kolaborasi real-time, AR preview, **structural analysis berbasis SNI**, dan export ke berbagai format CAD/3D.

![React](https://img.shields.io/badge/React-18.3-blue) ![Vite](https://img.shields.io/badge/Vite-5.4-purple) ![Tailwind](https://img.shields.io/badge/Tailwind-3.4-cyan) ![Three.js](https://img.shields.io/badge/Three.js-0.169-orange) ![SNI](https://img.shields.io/badge/SNI-03--2847--2002-purple) ![SNI](https://img.shields.io/badge/SNI-1726--2012-red)

## ✨ Fitur Utama

### Desain & Editing
- **6 Mode Tampilan**: Desain, Struktur, Pembesian (Rebar), Pipa/Plumbing, Listrik, MEP
- **Mode 2D & 3D**: Denah 2D presisi & rendering 3D dengan shadow
- **Multi-Lantai**: Tambah/hapus/rename lantai, atur tinggi per lantai (200-500 cm)
- **Tool Drawing**: Pilih, Dinding, Ruangan (4 dinding sekaligus), Kolom
- **80+ Item Built-in** (7 kategori): Kamar Tidur, Ruang Tamu, Dapur, Kamar Mandi, Pintu/Jendela, Struktural, **Outdoor & Pagar** (baru)
- **10 Model Pagar**: Modern, Besi, Besi Tempa Klasik, Kayu, Bambu, Tanaman (Hedge), Batu, Beton, Vinyl, Kawat
- **3 Gerbang**: Swing, Geser, Lipat
- **Outdoor Items**: Carport, Pohon, Palem, Kolam Renang, Gazebo, Pergola, Patio, Deck, Pathway, Driveway, Lampu Taman, Air Mancur, Kolam Ikan, dll
- **Item Kustom (CRUD)**: Buat item sendiri dengan emoji picker, warna, ukuran

### 🏗️ Structural Analysis (SNI Compliance)
- **SNI 03-2847-2002**: Tata Cara Perhitungan Struktur Beton Bertulang
  - Kapasitas kolom: φPn = 0.65 x [0.85 x f'c x (Ag - As) + fy x As]
  - Kapasitas balok: φMn = 0.8 x As x fy x (d - a/2)
  - Cek rasio tulangan (1%-8%), min 4 batang utama, slenderness ratio
  - Concrete grades: K-150 sampai K-500 (12-40 MPa)
  - Steel grades: BJTD-240 sampai BJTD-400, BJTP-240 sampai BJTP-320
  - Rebar: D4, D6, D8, D10, D13, D16, D19, D22, D25, D29, D32
- **SNI 1726-2012**: Beban Gempa
  - Base shear: V = Cs x W, Cs = SDS / (R / Ie)
  - 17 kota Indonesia dengan hazard zones (Ss & S1)
  - 5 jenis tanah (SA, SB, SC, SD, SE) dengan site coefficients
  - Response modification factor R (SMF=8, IMF=5, OMF=3, dll)
  - Importance factor Ie (1.0, 1.25, 1.5)
- **SNI 1727-2013**: Beban Minimum
  - Live loads per occupancy type (2.0-6.0 kN/m²)
  - Material unit weights untuk dead load
- **Safety Score**: Penilaian 0-100 dengan critical/warning checks
- **5 Tab Analisis**: Ringkasan, Kolom, Dinding/Balok, Gempa, Pengaturan
- **Visualisasi Rebar 3D**: SNI-compliant dengan main bars + sengkang

### MEP (Mechanical, Electrical, Plumbing)
- **Mode Pembesian**: Visualisasi besi beton (rebar) utama & sengkang pada kolom
- **Mode Plumbing**: Jalur pipa air bersih, air panas, buang, hujan, gas
- **Mode Listrik**: Jalur kabel power, lighting, data, TV, telepon
- **Mode MEP**: Gabungan tampilan plumbing + electrical + fixtures
- **MEP Fixtures**: Stop kontak, saklar, lampu, kran, saluran, panel, dll

### Template Rumah Siap Pakai (20 Template)
Berbagai gaya rumah modern Indonesia. Filter berdasarkan jumlah lantai.

**10 Rumah 1 Lantai:**
- **Modern Minimalis 36 m²** — Type 36, 1 kamar tidur, gaya modern simpel
- **Modern Tropis 45 m²** — 2 kamar tidur, bukaan lebar, gaya tropis
- **Industrial 50 m²** — 2 kamar tidur, ekspos material industrial
- **Klasik Modern 60 m²** — 2 kamar tidur, pilar dekoratif klasik
- **Mediteran 70 m²** — 3 kamar tidur, elemen lengkung & terracotta
- **Villa Bali 80 m²** — 2 kamar tidur, taman interior & kolam
- **American Style 90 m²** — 3 kamar tidur, porch & garage
- **Japandi 55 m²** — 2 kamar tidur, Jepang-Skandinavia Zen
- **Scandinavian 45 m²** — 2 kamar tidur, kayu terang & hygge
- **Tropis Modern 60 m²** — 2 kamar tidur, cross-ventilation

**10 Rumah 2 Lantai:**
- **Modern Tropis 2L 100 m²** — 3 kamar tidur, tropis modern
- **Klasik Modern 2L 150 m²** — 4 kamar tidur, mewah klasik
- **Industrial 2L 120 m²** — 3 kamar tidur, ekspos struktur
- **Mediteran 2L 180 m²** — 5 kamar tidur, mewah Mediteran
- **American 2L 200 m²** — 5 kamar tidur, porch & garage
- **Villa Bali 2L 160 m²** — 4 kamar tidur, taman & kolam
- **Japandi 2L 110 m²** — 3 kamar tidur, Zen minimalis
- **Tropis Modern 2L 130 m²** — 4 kamar tidur, cross-ventilation
- **Scandinavian 2L 120 m²** — 4 kamar tidur, kayu terang
- **Modern Minimalis 2L 90 m²** — 3 kamar tidur, hemat lahan

### Material Library & Estimasi Biaya
- **70+ Material** dengan harga pasar Indonesia 2024
- Kategori: Struktur, Finishing, Atap, Pintu/Jendela, Plumbing, Electrical, Lainnya
- **Shopping cart** untuk hitung total kebutuhan material
- **Estimasi biaya otomatis**: dinding, lantai, kolom, cat, pondasi
- Rate dapat diedit, support IDR/USD

### Kolaborasi Real-time
- **BroadcastChannel API** untuk sync antar tab/browser
- Lihat peer online dengan warna identitas unik
- **Chat** dengan peer lain
- **Kirim project** ke semua peer
- Lihat kursor peer real-time (preview)

### AR Mode
- **Camera + 3D overlay** untuk preview di lokasi nyata
- Akses kamera belakang (mobile-friendly)
- Orbit control & zoom di AR view
- Graceful fallback jika kamera tidak tersedia

### Export & Import (7 Format)
- **JSON**: Project lengkap (backup/berbagi, bisa diimpor)
- **DXF**: AutoCAD R12 (buka di AutoCAD, SketchUp, FreeCAD)
- **SVG**: Vektor per lantai (Illustrator, Inkscape, Figma)
- **PNG**: Screenshot denah 2D
- **glTF (.glb)**: Model 3D binary (Blender, Three.js, SketchUp)
- **OBJ**: Format 3D universal
- **STL**: 3D printing (Cura, Slic3r, PrusaSlicer)

### Lainnya
- **Dark Mode**: Toggle terang/gelap (Ctrl+Shift+L), persist di localStorage
- **Undo/Redo**: 50 langkah history
- **Save/Load**: localStorage browser
- **Keyboard Shortcuts**: Lengkap (V/W/R/C, Del, Ctrl+Z/Y/D/S, Esc, +/-/0)
- **Help Modal**: Dokumentasi & shortcut lengkap

## Tech Stack

| Library | Versi | Penggunaan |
|---------|-------|------------|
| React | 18.3 | UI framework |
| Vite | 5.4 | Build tool & dev server |
| Tailwind CSS | 3.4 | Styling (dark mode) |
| Three.js | 0.169 | 3D rendering + GLTFExporter, OBJExporter, STLExporter |
| Zustand | 5.0 | State management |
| lucide-react | 0.460 | Icon library |

## Struktur Project

```
home-designer-pro/
├── index.html
├── package.json
├── vite.config.js
├── tailwind.config.js         # darkMode: 'class'
├── postcss.config.js
├── README.md
├── src/
│   ├── main.jsx
│   ├── App.jsx                # Root + keyboard shortcuts + AR overlay
│   ├── index.css              # Tailwind + dark mode overrides
│   ├── lib/
│   │   ├── store.js           # Zustand store (MEP, collab, presets, dll)
│   │   ├── itemDefinitions.js # 30+ item default
│   │   ├── mepDefinitions.js  # Pipe, wire, rebar, fixture types
│   │   ├── housePresets.js    # 20 template rumah (10 lantai 1 + 10 lantai 2)
│   │   ├── materialLibrary.js # 70+ material dengan harga
│   │   ├── collaboration.js   # BroadcastChannel collab manager
│   │   ├── structuralAnalysis.js # SNI structural analysis (column, beam, seismic)
│   │   ├── costCalculator.js  # Estimasi biaya material
│   │   ├── exporters.js       # DXF, SVG, glTF, OBJ, STL exporters
│   │   └── utils.js           # Unit conversion helpers
│   └── components/
│       ├── Header.jsx              # Toolbar lengkap (16+ tombol)
│       ├── Sidebar.jsx             # Kategori & item catalog
│       ├── Canvas2D.jsx            # 2D canvas (6 mode rendering)
│       ├── View3D.jsx              # Three.js 3D + MEP overlays
│       ├── ARView.jsx              # Camera + 3D AR overlay
│       ├── PropertiesPanel.jsx     # Edit selected item
│       ├── FloorManagement.jsx     # Multi-floor management
│       ├── ZoomControls.jsx        # Zoom in/out/reset
│       ├── PlotSettingsModal.jsx   # Plot & building dimensions
│       ├── PresetModal.jsx         # Template rumah siap pakai
│       ├── MaterialLibraryModal.jsx# 70+ material + cart
│       ├── CostEstimationModal.jsx # Material cost calculator
│       ├── CollaborationModal.jsx  # Real-time collab + chat
│       ├── CustomItemModal.jsx     # CRUD custom items
│       ├── StructuralAnalysisModal.jsx # SNI structural analysis (5 tabs)
│       ├── ExportImportModal.jsx   # 7 format export + import
│       └── HelpModal.jsx           # Documentation & shortcuts
└── scripts/
    └── add_dark_mode.py       # Utility: add dark: classes
```

## Cara Menjalankan

### Prasyarat
- Node.js 18+ (disarankan 20+)
- npm 9+

### Install & Run

```bash
# Install dependencies
npm install

# Jalankan dev server (http://localhost:5173)
npm run dev

# Build untuk production (output ke dist/)
npm run build

# Preview production build (http://localhost:4173)
npm run preview
```

## Keyboard Shortcuts

| Shortcut | Aksi |
|----------|------|
| `V` | Mode Pilih |
| `W` | Mode Dinding |
| `R` | Mode Ruangan / Putar item terpilih |
| `C` | Mode Kolom |
| `Del` / `Backspace` | Hapus item terpilih |
| `Ctrl+D` | Duplikat item terpilih |
| `Ctrl+Z` | Undo |
| `Ctrl+Y` / `Ctrl+Shift+Z` | Redo |
| `Ctrl+S` | Simpan ke browser |
| `Ctrl+Shift+L` | Toggle dark mode |
| `Esc` | Batal pilihan / batal gambar dinding |
| `+` / `-` | Zoom in / out |
| `0` | Reset view |
| `Scroll` | Zoom in/out (2D & 3D) |
| `Klik tengah + seret` | Geser canvas (pan) |
| `Klik kanan + seret (3D)` | Putar kamera 3D |

## View Modes (6 Mode)

| Mode | Icon | Deskripsi |
|------|------|-----------|
| **Desain** | 🎨 | Tampilan denah lengkap dengan furnitur (default) |
| **Struktur** | 🏗️ | Highlight kolom, balok, dinding struktural |
| **Pembesian** | 🔩 | Detail besi beton (rebar) pada kolom & balok |
| **Pipa/Plumbing** | 🚰 | Jalur pipa air bersih, buang, gas |
| **Listrik** | ⚡ | Jalur kabel listrik & instalasi |
| **MEP** | 🔧 | Gabungan Mechanical, Electrical, Plumbing |

## Export Formats

| Format | Ext | Use Case |
|--------|-----|----------|
| Project JSON | .json | Backup lengkap, bisa diimpor kembali |
| DXF | .dxf | AutoCAD, SketchUp, FreeCAD, LibreCAD |
| SVG | .svg | Illustrator, Inkscape, Figma (vektor) |
| PNG | .png | Gambar denah 2D (mode 2D only) |
| glTF | .glb | Blender, Three.js, SketchUp 3D (mode 3D only) |
| OBJ | .obj | Universal 3D format (mode 3D only) |
| STL | .stl | 3D printing - Cura, Slic3r (mode 3D only) |

## Bug Fix dari Aplikasi Asli

**Bug asli (Qwen Chat)**: "kok klik terapkan popup tdk hilang"
- Penyebab: Tombol "Terapkan" tidak memanggil fungsi close modal
- **Fix**: `applyPlotSettings()` sekarang otomatis `set({ ..., isPlotModalOpen: false })`

## Lisensi

MIT License - bebas digunakan untuk project pribadi & komersial.

## Credits

Dibuat ulang & disempurnakan dari aplikasi "Desain Rumah Interaktif 2D 3D" menggunakan React + Vite.
