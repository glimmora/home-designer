// Material library with prices (IDR)
// Prices are illustrative - based on Indonesian market 2024 estimates
// Users can edit these prices in the Material Library modal

export const materialLibrary = {
  // ===== STRUKTUR =====
  structure: {
    label: 'Material Struktur',
    icon: '🏗️',
    materials: [
      { id: 'cement-50', name: 'Semen Portland 50kg', unit: 'sak', price: 65000, brand: 'Tiga Roda / Gresik', desc: 'Semen OPC untuk beton, plesteran' },
      { id: 'cement-ppc', name: 'Semen PPC 50kg', unit: 'sak', price: 60000, brand: 'Tiga Roda / Gresik', desc: 'Semen PPC untuk dinding & finishing' },
      { id: 'sand-masonry', name: 'Pasir Pasang', unit: 'm³', price: 280000, brand: 'Lokal', desc: 'Pasir untuk plesteran dan dinding' },
      { id: 'sand-concrete', name: 'Pasir Beton', unit: 'm³', price: 350000, brand: 'Lokal', desc: 'Pasir untuk campuran beton' },
      { id: 'gravel', name: 'Batu Split / Koral', unit: 'm³', price: 320000, brand: 'Lokal', desc: 'Batu split untuk campuran beton' },
      { id: 'rebar-d8', name: 'Besi Beton D8 (12m)', unit: 'batang', price: 55000, brand: 'BJTM / IAT', desc: 'Besi beton diameter 8mm, sengkang' },
      { id: 'rebar-d10', name: 'Besi Beton D10 (12m)', unit: 'batang', price: 85000, brand: 'BJTM / IAT', desc: 'Besi beton diameter 10mm, plat' },
      { id: 'rebar-d12', name: 'Besi Beton D12 (12m)', unit: 'batang', price: 120000, brand: 'BJTM / IAT', desc: 'Besi beton diameter 12mm' },
      { id: 'rebar-d16', name: 'Besi Beton D16 (12m)', unit: 'batang', price: 185000, brand: 'BJTM / IAT', desc: 'Besi beton diameter 16mm, utama kolom/balok' },
      { id: 'rebar-d20', name: 'Besi Beton D20 (12m)', unit: 'batang', price: 285000, brand: 'BJTM / IAT', desc: 'Besi beton diameter 20mm, utama kolom besar' },
      { id: 'brick-red', name: 'Bata Merah', unit: 'pcs', price: 800, brand: 'Lokal', desc: 'Bata merah untuk dinding' },
      { id: 'brick-light', name: 'Bata Ringan (Hebel)', unit: 'pcs', price: 14000, brand: 'Ekalog / Smartblock', desc: 'Bata ringan 60x20x10cm' },
      { id: 'concrete-ready', name: 'Beton Ready Mix K-225', unit: 'm³', price: 950000, brand: 'Ready Mix', desc: 'Beton siap pakai K-225' },
      { id: 'concrete-k300', name: 'Beton Ready Mix K-300', unit: 'm³', price: 1050000, brand: 'Ready Mix', desc: 'Beton siap pakai K-300 (kolom utama)' },
    ],
  },

  // ===== DINDING & FINISHING =====
  finishing: {
    label: 'Dinding & Finishing',
    icon: '🧱',
    materials: [
      { id: 'tile-floor-30', name: 'Keramik Lantai 30x30', unit: 'm²', price: 55000, brand: 'Roman / Milan', desc: 'Keramik lantai 30x30cm' },
      { id: 'tile-floor-40', name: 'Keramik Lantai 40x40', unit: 'm²', price: 75000, brand: 'Roman / Milan', desc: 'Keramik lantai 40x40cm' },
      { id: 'tile-floor-60', name: 'Granit Lantai 60x60', unit: 'm²', price: 145000, brand: 'Roman / Platinum', desc: 'Granit lantai 60x60cm' },
      { id: 'tile-wall-25', name: 'Keramik Dinding 25x40', unit: 'm²', price: 65000, brand: 'Roman / Milan', desc: 'Keramik dinding KM/dapur' },
      { id: 'tile-wall-mosaic', name: 'Mosaik Dinding', unit: 'm²', price: 125000, brand: 'Roman / KIA', desc: 'Keramik mosaik untuk accent' },
      { id: 'paint-interior', name: 'Cat Dinding Interior 25kg', unit: 'galon', price: 580000, brand: 'Dulux / Nippon', desc: 'Cat interior 1 galon (25kg) untuk ~50m²' },
      { id: 'paint-exterior', name: 'Cat Dinding Eksterior 25kg', unit: 'galon', price: 650000, brand: 'Dulux / Nippon', desc: 'Cat eksterior weathproof' },
      { id: 'paint-wood', name: 'Cat Kayu/Metal 1kg', unit: 'kg', price: 85000, brand: 'Avian / Dulux', desc: 'Cat untuk kayu dan besi' },
      { id: 'plaster', name: 'Plesteran Dinding', unit: 'm²', price: 45000, brand: 'Jasa', desc: 'Jasa plesteran dinding (material + upah)' },
      { id: 'ceiling-gypsum', name: 'Plafon Gypsum 9mm', unit: 'm²', price: 85000, brand: 'Gyproc / National', desc: 'Plafon gypsum + rangka' },
      { id: 'ceiling-pvc', name: 'Plafon PVC', unit: 'm²', price: 95000, brand: 'Maspion / Vinilex', desc: 'Plafon PVC anti rayap' },
    ],
  },

  // ===== ATAP =====
  roof: {
    label: 'Atap',
    icon: '🏠',
    materials: [
      { id: 'roof-tile-ceramic', name: 'Genteng Keramik', unit: 'm²', price: 125000, brand: 'Keratronik / Kanmuri', desc: 'Genteng keramik pres' },
      { id: 'roof-tile-concrete', name: 'Genteng Beton', unit: 'm²', price: 55000, brand: 'Keratronik / Tegel', desc: 'Genteng beton pres' },
      { id: 'roof-metal', name: 'Spandek Metal Atap', unit: 'm²', price: 75000, brand: 'Krisbow / Yume', desc: 'Atap metal spandek 0.4mm' },
      { id: 'roof-zinc', name: 'Genteng Seng Gelombang', unit: 'm²', price: 45000, brand: 'Krisbow / Yume', desc: 'Atap seng gelombang' },
      { id: 'rafter-wood', name: 'Kaso Kayu 5x7 (4m)', unit: 'batang', price: 75000, brand: 'Kamper/Lokal', desc: 'Kaso kayu untuk rangka atap' },
      { id: 'rafter-steel', name: 'Rangka Atap Baja Ringan', unit: 'm²', price: 145000, brand: 'Krisbow / Taso', desc: 'Rangka baja ringan lengkap' },
      { id: 'gutter', name: 'Talang Air PVC', unit: 'm', price: 45000, brand: 'Maspion / Vinilex', desc: 'Talang air 4"' },
    ],
  },

  // ===== PINTU & JENDELA =====
  doorsWindows: {
    label: 'Pintu & Jendela',
    icon: '🚪',
    materials: [
      { id: 'door-wood', name: 'Pintu Kayu Solid', unit: 'unit', price: 1850000, brand: 'Custom', desc: 'Pintu kayu solid 80x210cm' },
      { id: 'door-engineered', name: 'Pintu Kayu Engineering', unit: 'unit', price: 850000, brand: 'Sungai Budi', desc: 'Pintu engineered 80x210cm' },
      { id: 'door-pvc', name: 'Pintu PVC', unit: 'unit', price: 650000, brand: 'Maspion', desc: 'Pintu PVC untuk kamar mandi' },
      { id: 'door-aluminium', name: 'Pintu Aluminium + Kaca', unit: 'unit', price: 1450000, brand: 'Custom', desc: 'Pintu aluminium sliding' },
      { id: 'window-aluminium', name: 'Jendela Aluminium Sliding', unit: 'm²', price: 425000, brand: 'Custom', desc: 'Jendela aluminium + kaca 5mm' },
      { id: 'window-upvc', name: 'Jendela uPVC', unit: 'm²', price: 685000, brand: 'VPI / Maspion', desc: 'Jendela uPVC + kaca double' },
      { id: 'glass-5mm', name: 'Kaca Bening 5mm', unit: 'm²', price: 285000, brand: 'Asahimas', desc: 'Kaca bening 5mm' },
      { id: 'glass-tempered', name: 'Kaca Tempered 8mm', unit: 'm²', price: 685000, brand: 'Asahimas', desc: 'Kaca tempered 8mm' },
    ],
  },

  // ===== PLUMBING =====
  plumbing: {
    label: 'Plumbing',
    icon: '🚰',
    materials: [
      { id: 'pipe-pvc-1/2', name: 'Pipa PVC 1/2" (4m)', unit: 'batang', price: 35000, brand: 'Rucika / Wavin', desc: 'Pipa PVC AW 1/2" untuk air bersih' },
      { id: 'pipe-pvc-3/4', name: 'Pipa PVC 3/4" (4m)', unit: 'batang', price: 45000, brand: 'Rucika / Wavin', desc: 'Pipa PVC AW 3/4" untuk air bersih' },
      { id: 'pipe-pvc-3', name: 'Pipa PVC 3" (4m)', unit: 'batang', price: 95000, brand: 'Rucika / Wavin', desc: 'Pipa PVC 3" untuk air buang' },
      { id: 'pipe-pvc-4', name: 'Pipa PVC 4" (4m)', unit: 'batang', price: 135000, brand: 'Rucika / Wavin', desc: 'Pipa PVC 4" untuk air buang utama' },
      { id: 'pipe-ppr', name: 'Pipa PPR 20mm (4m)', unit: 'batang', price: 55000, brand: 'Rucika / Wavin', desc: 'Pipa PPR untuk air panas' },
      { id: 'toilet-set', name: 'Closet Duduk', unit: 'unit', price: 1850000, brand: 'TOTO / American Standard', desc: 'Closet duduk one piece' },
      { id: 'toilet-squat', name: 'Closet Jongkok', unit: 'unit', price: 285000, brand: 'TOTO / American Standard', desc: 'Closet jongkok' },
      { id: 'washbasin', name: 'Wastafel + Keran', unit: 'unit', price: 850000, brand: 'TOTO / American Standard', desc: 'Wastafel countertop + keran' },
      { id: 'shower-set', name: 'Shower Set', unit: 'unit', price: 685000, brand: 'TOTO / Grohe', desc: 'Shower head + mixer' },
      { id: 'bathtub', name: 'Bathtub', unit: 'unit', price: 3850000, brand: 'TOTO / American Standard', desc: 'Bathtub acrylic 170x75cm' },
      { id: 'water-heater', name: 'Water Heater 10L', unit: 'unit', price: 1450000, brand: 'Rinnai / Modena', desc: 'Water heater gas 10 liter' },
      { id: 'water-pump', name: 'Pompa Air', unit: 'unit', price: 850000, brand: 'Sanyo / Shimizu', desc: 'Pompa air otomatis 125W' },
      { id: 'water-tank-500', name: 'Tandon Air 500L', unit: 'unit', price: 685000, brand: 'Sanyo / Pentair', desc: 'Tandon polyethylene 500 liter' },
      { id: 'septic-tank', name: 'Septic Tank Bio', unit: 'unit', price: 2850000, brand: 'Biofilter / Kangaroo', desc: 'Septic tank biofilter 3 kubik' },
    ],
  },

  // ===== ELECTRICAL =====
  electrical: {
    label: 'Electrical',
    icon: '⚡',
    materials: [
      { id: 'cable-nym-3x2.5', name: 'Kabel NYM 3x2.5mm (50m)', unit: 'roll', price: 685000, brand: 'Supreme / Kabel Metal', desc: 'Kabel NYM 3x2.5 untuk instalasi' },
      { id: 'cable-nym-3x4', name: 'Kabel NYM 3x4mm (50m)', unit: 'roll', price: 1085000, brand: 'Supreme / Kabel Metal', desc: 'Kabel NYM 3x4 untuk AC/water heater' },
      { id: 'cable-nym-3x6', name: 'Kabel NYM 3x6mm (50m)', unit: 'roll', price: 1485000, brand: 'Supreme / Kabel Metal', desc: 'Kabel NYM 3x6 untuk MCB utama' },
      { id: 'pipe-conduit-3/4', name: 'Pipa Conduit 3/4" (3m)', unit: 'batang', price: 18500, brand: 'Top', desc: 'Pipa conduit untuk kabel' },
      { id: 'outlet', name: 'Stop Kontak', unit: 'unit', price: 28500, brand: 'ABB / Broco', desc: 'Stop kontak dinding' },
      { id: 'switch', name: 'Saklar', unit: 'unit', price: 18500, brand: 'ABB / Broco', desc: 'Saklar tunggal' },
      { id: 'lamp-led-18w', name: 'Lampu LED 18W', unit: 'unit', price: 85000, brand: 'Philips / Opple', desc: 'Lampu LED 18W downlight' },
      { id: 'lamp-led-36w', name: 'Lampu LED 36W Tube', unit: 'unit', price: 95000, brand: 'Philips / Opple', desc: 'Lampu LED tube 36W' },
      { id: 'mcb-10a', name: 'MCB 10A', unit: 'unit', price: 65000, brand: 'ABB / Hager', desc: 'MCB 10 ampere' },
      { id: 'panel-board', name: 'Box MCB 12 grup', unit: 'unit', price: 285000, brand: 'ABB / Hager', desc: 'Box MCB 12 grup' },
      { id: 'ac-1pk', name: 'AC Split 1 PK', unit: 'unit', price: 3850000, brand: 'Daikin / Panasonic', desc: 'AC split 1 PK inverter' },
      { id: 'ac-2pk', name: 'AC Split 2 PK', unit: 'unit', price: 6850000, brand: 'Daikin / Panasonic', desc: 'AC split 2 PK inverter' },
      { id: 'fan-ceiling', name: 'Kipas Angin Ceiling', unit: 'unit', price: 685000, brand: 'Maspion / Sanex', desc: 'Kipas angin gantung' },
      { id: 'fan-exhaust', name: 'Fan Exhaust', unit: 'unit', price: 285000, brand: 'Maspion / Sanex', desc: 'Fan exhaust untuk KM/dapur' },
    ],
  },

  // ===== LAINNYA =====
  misc: {
    label: 'Lainnya',
    icon: '📦',
    materials: [
      { id: 'nail-5cm', name: 'Paku 5cm (1kg)', unit: 'kg', price: 18000, brand: 'Lokal', desc: 'Paku 5cm untuk kayu' },
      { id: 'screw-3cm', name: 'Baut 3cm (100pcs)', unit: 'pack', price: 35000, brand: 'Lokal', desc: 'Baut 3cm + mur' },
      { id: 'silicon', name: 'Silicon Sealant', unit: 'tube', price: 45000, brand: 'Sika / ISP', desc: 'Silicon sealant untuk sambungan' },
      { id: 'waterproofing', name: 'Waterproofing Coating', unit: 'kg', price: 85000, brand: 'Sika / Mapei', desc: 'Waterproofing untuk KM/dapur' },
      { id: 'ceramic-glue', name: 'Adhesive Keramik 25kg', unit: 'sak', price: 145000, brand: 'Sika / Mortar', desc: 'Perekat keramik' },
      { id: 'grout', name: 'Nat Keramik 5kg', unit: 'pack', price: 65000, brand: 'Sika / Mapei', desc: 'Nat keramik' },
    ],
  },
};

// Get all materials as flat array
export function getAllMaterials() {
  const all = [];
  for (const cat in materialLibrary) {
    materialLibrary[cat].materials.forEach((m) => {
      all.push({ ...m, category: cat, categoryLabel: materialLibrary[cat].label });
    });
  }
  return all;
}

// Search materials
export function searchMaterials(query) {
  const q = query.toLowerCase().trim();
  if (!q) return getAllMaterials();
  return getAllMaterials().filter(
    (m) =>
      m.name.toLowerCase().includes(q) ||
      m.brand.toLowerCase().includes(q) ||
      m.desc.toLowerCase().includes(q)
  );
}
