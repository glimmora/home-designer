// Item definitions for the home designer
// All dimensions in CM (internal unit)
// Based on Indonesian architectural styles

export const itemDefinitions = {
  bedroom: [
    { type: 'bed', name: 'Tempat Tidur Queen', w: 160, h: 200, color: '#8B7355', icon: '🛏️', height3d: 50, structural: false, desc: 'Queen size 160x200' },
    { type: 'bed-king', name: 'Tempat Tidur King', w: 180, h: 200, color: '#8B6F47', icon: '🛏️', height3d: 55, structural: false, desc: 'King size 180x200' },
    { type: 'single-bed', name: 'Kasur Single', w: 100, h: 200, color: '#A0826D', icon: '🛌', height3d: 40, structural: false, desc: 'Single 100x200' },
    { type: 'bunk-bed', name: 'Tempat Tidur Susun', w: 100, h: 200, color: '#6B4423', icon: '🛏️', height3d: 180, structural: false, desc: 'Bunk bed 2 tingkat' },
    { type: 'wardrobe', name: 'Lemari Pakaian', w: 120, h: 60, color: '#6B4423', icon: '🚪', height3d: 200, structural: false, desc: 'Lemari pakaian 2 pintu' },
    { type: 'walk-in-closet', name: 'Walk-in Closet', w: 200, h: 80, color: '#5B3A1A', icon: '👔', height3d: 220, structural: false, desc: 'Lemari pakaian walk-in' },
    { type: 'nightstand', name: 'Meja Nakas', w: 50, h: 50, color: '#8B6F47', icon: '🗄️', height3d: 60, structural: false, desc: 'Meja samping tidur' },
    { type: 'dresser', name: 'Lemari Laci', w: 120, h: 50, color: '#7B5B3A', icon: '🗃️', height3d: 80, structural: false, desc: 'Lemari laci 4 tingkat' },
    { type: 'desk', name: 'Meja Kerja', w: 120, h: 60, color: '#8B6F47', icon: '📝', height3d: 75, structural: false, desc: 'Meja belajar/kerja' },
    { type: 'vanity-table', name: 'Meja Rias', w: 100, h: 45, color: '#A0826D', icon: '🪞', height3d: 140, structural: false, desc: 'Meja rias dengan cermin' },
    { type: 'chaise-longue', name: 'Chaise Longue', w: 160, h: 60, color: '#7B5B3A', icon: '🛋️', height3d: 80, structural: false, desc: 'Kursi rebahan' },
  ],
  living: [
    { type: 'sofa', name: 'Sofa 3-Dudukan', w: 200, h: 90, color: '#4A5568', icon: '🛋️', height3d: 80, structural: false, desc: 'Sofa 3 dudukan' },
    { type: 'sofa-l', name: 'Sofa L', w: 240, h: 180, color: '#4A5568', icon: '🛋️', height3d: 80, structural: false, desc: 'Sofa sudut L-shape' },
    { type: 'loveseat', name: 'Sofa 2-Dudukan', w: 140, h: 90, color: '#5A6478', icon: '🛋️', height3d: 80, structural: false, desc: 'Sofa 2 dudukan' },
    { type: 'sectional', name: 'Sofa Sectional', w: 300, h: 200, color: '#3D4451', icon: '🛋️', height3d: 85, structural: false, desc: 'Sofa sectional U-shape' },
    { type: 'coffee-table', name: 'Meja Tamu', w: 110, h: 60, color: '#8B6F47', icon: '☕', height3d: 45, structural: false, desc: 'Meja kopi' },
    { type: 'tv-stand', name: 'Rak TV', w: 160, h: 45, color: '#2D3748', icon: '📺', height3d: 60, structural: false, desc: 'Rak TV minimalis' },
    { type: 'tv-cabinet', name: 'Kabinet TV', w: 200, h: 50, color: '#1A202C', icon: '📺', height3d: 180, structural: false, desc: 'Kabinet TV full height' },
    { type: 'armchair', name: 'Kursi Single', w: 80, h: 80, color: '#6B7280', icon: '🪑', height3d: 90, structural: false, desc: 'Kursi santai' },
    { type: 'bookshelf', name: 'Rak Buku', w: 100, h: 35, color: '#5B3A1A', icon: '📚', height3d: 200, structural: false, desc: 'Rak buku 2m' },
    { type: 'display-cabinet', name: 'Vitrin', w: 120, h: 40, color: '#3D2914', icon: '🏺', height3d: 180, structural: false, desc: 'Vitrin etalase' },
    { type: 'rug', name: 'Karpet', w: 200, h: 150, color: '#9C7B5A', icon: '🟫', height3d: 2, structural: false, desc: 'Karpet ruang tamu' },
    { type: 'floor-lamp', name: 'Lampu Lantai', w: 35, h: 35, color: '#D4A574', icon: '💡', height3d: 160, structural: false, desc: 'Lampu standing' },
    { type: 'console-table', name: 'Meja Konsol', w: 120, h: 35, color: '#8B6F47', icon: '🗄️', height3d: 80, structural: false, desc: 'Meja konsol entry' },
  ],
  kitchen: [
    { type: 'stove', name: 'Kompor', w: 60, h: 60, color: '#1A202C', icon: '🔥', height3d: 85, structural: false, desc: 'Kompor 4 tungku' },
    { type: 'stove-built-in', name: 'Kompor Built-in', w: 75, h: 55, color: '#0F1419', icon: '🔥', height3d: 5, structural: false, desc: 'Kompor tanam countertop' },
    { type: 'range-hood', name: 'Cooker Hood', w: 90, h: 50, color: '#A0AEC0', icon: '🌬️', height3d: 50, structural: false, desc: 'Pengisap asap dapur' },
    { type: 'sink', name: 'Wastafel Dapur', w: 60, h: 50, color: '#E2E8F0', icon: '🚰', height3d: 85, structural: false, desc: 'Wastafel dapur' },
    { type: 'fridge', name: 'Kulkas 2 Pintu', w: 70, h: 70, color: '#CBD5E0', icon: '🧊', height3d: 180, structural: false, desc: 'Kulkas 2 pintu' },
    { type: 'fridge-side-by-side', name: 'Kulkas Side-by-Side', w: 90, h: 80, color: '#A0AEC0', icon: '🧊', height3d: 200, structural: false, desc: 'Kulkas side-by-side' },
    { type: 'counter', name: 'Countertop', w: 120, h: 60, color: '#718096', icon: '🍳', height3d: 85, structural: false, desc: 'Topi meja dapur' },
    { type: 'kitchen-island', name: 'Kitchen Island', w: 180, h: 100, color: '#5B3A1A', icon: '🏝️', height3d: 90, structural: false, desc: 'Pulau dapur' },
    { type: 'pantry', name: 'Pantry', w: 100, h: 50, color: '#6B4423', icon: '🥫', height3d: 200, structural: false, desc: 'Lemari penyimpanan makanan' },
    { type: 'built-in-oven', name: 'Oven Built-in', w: 60, h: 60, color: '#1A202C', icon: '🔥', height3d: 60, structural: false, desc: 'Oven tanam dinding' },
    { type: 'dishwasher', name: 'Mesin Cuci Piring', w: 60, h: 60, color: '#A0AEC0', icon: '🍽️', height3d: 85, structural: false, desc: 'Dishwasher' },
    { type: 'dining-table', name: 'Meja Makan 6', w: 140, h: 80, color: '#8B6F47', icon: '🍽️', height3d: 75, structural: false, desc: 'Meja makan 6 orang' },
    { type: 'dining-table-8', name: 'Meja Makan 8', w: 200, h: 100, color: '#5B3A1A', icon: '🍽️', height3d: 75, structural: false, desc: 'Meja makan 8 orang' },
    { type: 'bar-stool', name: 'Kursi Bar', w: 40, h: 40, color: '#2D3748', icon: '🪑', height3d: 110, structural: false, desc: 'Kursi bar tinggi' },
    { type: 'chair', name: 'Kursi Makan', w: 45, h: 45, color: '#4A5568', icon: '🪑', height3d: 90, structural: false, desc: 'Kursi makan' },
    { type: 'stove-gas-2burner', name: 'Kompor Gas 2 Tungku', w: 50, h: 35, color: '#1A202C', icon: '🔥', height3d: 10, structural: false, desc: 'Kompor gas portable 2 tungku' },
    { type: 'stove-induction', name: 'Kompor Induksi', w: 60, h: 40, color: '#1F2937', icon: '⚡', height3d: 6, structural: false, desc: 'Kompor induksi 2 plate flat' },
    { type: 'stove-freestanding', name: 'Kompor Freestanding', w: 60, h: 60, color: '#374151', icon: '🔥', height3d: 90, structural: false, desc: 'Kompor + oven freestanding 60cm' },
    { type: 'stove-range-90', name: 'Range 90cm', w: 90, h: 60, color: '#1F2937', icon: '🔥', height3d: 90, structural: false, desc: 'Range 90cm 5 tungku + oven besar' },
    // ===== KOMPOR TANAM (BUILT-IN HOB) =====
    { type: 'stove-hob-gas-4', name: 'Kompor Tanam Gas 4 Burner', w: 75, h: 55, color: '#1A202C', icon: '🔥', height3d: 5, structural: false, desc: 'Built-in gas hob 4 burner Rinnex/Ferro' },
    { type: 'stove-hob-gas-3', name: 'Kompor Tanam Gas 3 Burner', w: 60, h: 50, color: '#1A202C', icon: '🔥', height3d: 5, structural: false, desc: 'Built-in gas hob 3 burner kompak' },
    { type: 'stove-hob-gas-2', name: 'Kompor Tanam Gas 2 Burner', w: 45, h: 45, color: '#1A202C', icon: '🔥', height3d: 5, structural: false, desc: 'Built-in gas hob 2 burner mini' },
    { type: 'stove-hob-gas-5', name: 'Kompor Tanam Gas 5 Burner', w: 90, h: 55, color: '#0F1419', icon: '🔥', height3d: 5, structural: false, desc: 'Built-in gas hob 5 burner dengan wok burner tengah' },
    { type: 'stove-hob-induction-4', name: 'Kompor Tanam Induksi 4 Zone', w: 75, h: 55, color: '#1F2937', icon: '⚡', height3d: 5, structural: false, desc: 'Built-in induction hob 4 zone touch control' },
    { type: 'stove-hob-induction-2', name: 'Kompor Tanam Induksi 2 Zone', w: 45, h: 45, color: '#1F2937', icon: '⚡', height3d: 5, structural: false, desc: 'Built-in induction hob 2 zone kompak' },
    { type: 'stove-hob-ceramic-4', name: 'Kompor Tanam Ceramic 4 Zone', w: 75, h: 55, color: '#374151', icon: '🔴', height3d: 5, structural: false, desc: 'Built-in ceramic hob 4 zone halogen' },
    { type: 'stove-hob-ceramic-2', name: 'Kompor Tanam Ceramic 2 Zone', w: 45, h: 45, color: '#374151', icon: '🔴', height3d: 5, structural: false, desc: 'Built-in ceramic hob 2 zone mini' },
    { type: 'stove-hob-hybrid', name: 'Kompor Tanam Hybrid (Gas+Induksi)', w: 75, h: 55, color: '#1F2937', icon: '⚡', height3d: 5, structural: false, desc: 'Built-in hybrid hob: 2 gas + 2 induksi' },
    { type: 'stove-hob-domino', name: 'Kompor Tanam Domino (Modular)', w: 30, h: 50, color: '#1F2937', icon: '⬜', height3d: 5, structural: false, desc: 'Domino hob modular 1 zone (gabung bebas)' },
    { type: 'stove-hob-wok', name: 'Kompor Tanam Wok Burner', w: 75, h: 55, color: '#1A202C', icon: '🍳', height3d: 5, structural: false, desc: 'Built-in hob dengan wok burner pusat high power' },
    { type: 'stove-hob-teppan', name: 'Teppanyaki Grill Tanam', w: 60, h: 45, color: '#1F2937', icon: '🍳', height3d: 5, structural: false, desc: 'Built-in teppanyaki plate flat stainless' },
    { type: 'stove-hob-fryer', name: 'Deep Fryer Tanam', w: 30, h: 50, color: '#374151', icon: '🍳', height3d: 5, structural: false, desc: 'Built-in deep fryer dengan basket stainless' },
    { type: 'stove-hob-bbq', name: 'BBQ Grill Tanam', w: 60, h: 45, color: '#1A202C', icon: '🍖', height3d: 5, structural: false, desc: 'Built-in BBQ grill plate cast iron' },
    // ===== KOMPOR DUDUK (TABLETOP / PORTABLE) =====
    { type: 'stove-tabletop-gas-4', name: 'Kompor Duduk Gas 4 Tungku', w: 60, h: 60, color: '#1A202C', icon: '🔥', height3d: 12, structural: false, desc: 'Tabletop gas stove 4 tungku standalone' },
    { type: 'stove-tabletop-gas-3', name: 'Kompor Duduk Gas 3 Tungku', w: 55, h: 55, color: '#1A202C', icon: '🔥', height3d: 12, structural: false, desc: 'Tabletop gas stove 3 tungku kompak' },
    { type: 'stove-tabletop-gas-2-inox', name: 'Kompor Duduk Gas 2 Tungku Inox', w: 50, h: 35, color: '#9CA3AF', icon: '🔥', height3d: 10, structural: false, desc: 'Tabletop gas stove 2 tungku stainless' },
    { type: 'stove-tabletop-induction-2', name: 'Kompor Duduk Induksi 2 Plate', w: 50, h: 35, color: '#1F2937', icon: '⚡', height3d: 8, structural: false, desc: 'Tabletop induction stove 2 plate portable' },
    { type: 'stove-tabletop-induction-1', name: 'Kompor Duduk Induksi 1 Plate', w: 30, h: 30, color: '#1F2937', icon: '⚡', height3d: 7, structural: false, desc: 'Mini induction stove 1 plate portable' },
    { type: 'stove-portable-gas-1', name: 'Kompor Gas Portable 1 Tungku', w: 35, h: 35, color: '#1A202C', icon: '🔥', height3d: 10, structural: false, desc: 'Kompor gas portable 1 tungku (tube tabung)' },
    { type: 'stove-portable-butane', name: 'Kompor Butane Portable', w: 30, h: 35, color: '#374151', icon: '🔥', height3d: 10, structural: false, desc: 'Kompor butane cartridge portable (kemping)' },
    { type: 'stove-tabletop-mini', name: 'Kompor Mini Travel', w: 25, h: 25, color: '#1F2937', icon: '🔥', height3d: 6, structural: false, desc: 'Mini stove travel single burner USB/solar' },
    // ===== KOMPOR TRADISIONAL =====
    { type: 'stove-charcoal', name: 'Kompor Arang', w: 40, h: 40, color: '#1F2937', icon: '🔥', height3d: 35, structural: false, desc: 'Kompor arang tradisional untuk sate/grill' },
    { type: 'stove-wood', name: 'Tungku Kayu', w: 50, h: 50, color: '#5D3A1A', icon: '🔥', height3d: 60, structural: false, desc: 'Tungku kayu tradisional (podang)' },
    { type: 'stove-clay', name: 'Tungku Tanah Liat', w: 40, h: 40, color: '#9C5A2F', icon: '🔥', height3d: 40, structural: false, desc: 'Tungku tanah liat tradisional Indonesia' },
    { type: 'stove-anglo', name: 'Anglo Arang', w: 35, h: 35, color: '#1F2937', icon: '🔥', height3d: 30, structural: false, desc: 'Anglo arang klasik (warung)' },
    // ===== KOMPOR KOMERSIAL =====
    { type: 'stove-commercial-burner', name: 'Kompor Komersial Heavy Duty', w: 60, h: 60, color: '#374151', icon: '🔥', height3d: 80, structural: false, desc: 'Kompor komersial heavy duty untuk restoran' },
    { type: 'stove-commercial-wok', name: 'Wok Burner Komersial', w: 50, h: 50, color: '#1F2937', icon: '🍳', height3d: 90, structural: false, desc: 'Wok burner komersial high BTU untuk capcay' },
    { type: 'stove-commercial-range', name: 'Range Komersial 4 Burner', w: 80, h: 70, color: '#374151', icon: '🔥', height3d: 90, structural: false, desc: 'Range komersial 4 burner + oven bawah' },
    { type: 'stove-commercial-flat-top', name: 'Flat Top Grill Komersial', w: 80, h: 60, color: '#1F2937', icon: '🍳', height3d: 85, structural: false, desc: 'Flat top grill stainless komersial' },
    { type: 'range-hood-chimney', name: 'Cooker Hood Chimney', w: 90, h: 50, color: '#9CA3AF', icon: '🌬️', height3d: 100, structural: false, desc: 'Chimney hood premium stainless' },
    { type: 'range-hood-island', name: 'Cooker Hood Island', w: 100, h: 60, color: '#9CA3AF', icon: '🌬️', height3d: 110, structural: false, desc: 'Hood untuk kitchen island gantung' },
    { type: 'microwave-built-in', name: 'Microwave Built-in', w: 60, h: 40, color: '#1A202C', icon: '🍱', height3d: 40, structural: false, desc: 'Microwave tanam dinding/kabinet' },
    { type: 'steam-oven', name: 'Steam Oven', w: 60, h: 60, color: '#1F2937', icon: '♨️', height3d: 60, structural: false, desc: 'Steam oven healthy cooking' },
    { type: 'sink-double-bowl', name: 'Wastafel Dapur Double', w: 80, h: 50, color: '#9CA3AF', icon: '🚰', height3d: 85, structural: false, desc: 'Wastafel double bowl stainless' },
    { type: 'sink-farmhouse', name: 'Wastafel Farmhouse (Apron)', w: 80, h: 55, color: '#F5F5F5', icon: '🚰', height3d: 85, structural: false, desc: 'Wastafel farmhouse apron front' },
    { type: 'sink-undermount', name: 'Wastafel Undermount', w: 70, h: 45, color: '#9CA3AF', icon: '🚰', height3d: 85, structural: false, desc: 'Wastafel undermount granite/quartz' },
    { type: 'sink-prep', name: 'Wastafel Prep (Kecil)', w: 40, h: 35, color: '#9CA3AF', icon: '🚰', height3d: 85, structural: false, desc: 'Wastafel prep kecil untuk bar/island' },
    // ===== KITCHEN SINK - MATERIAL VARIANTS =====
    { type: 'sink-stainless-304', name: 'Sink Stainless 304 Single', w: 60, h: 50, color: '#9CA3AF', icon: '🚰', height3d: 85, structural: false, desc: 'Kitchen sink stainless steel 304 single bowl (anti karat)' },
    { type: 'sink-stainless-double-equal', name: 'Sink Stainless Double Equal', w: 80, h: 50, color: '#9CA3AF', icon: '🚰', height3d: 85, structural: false, desc: 'Double bowl equal 50:50 stainless steel' },
    { type: 'sink-stainless-double-offset', name: 'Sink Stainless Double Offset', w: 80, h: 50, color: '#9CA3AF', icon: '🚰', height3d: 85, structural: false, desc: 'Double bowl offset 60:40 (bowl besar + kecil)' },
    { type: 'sink-stainless-triple', name: 'Sink Stainless Triple Bowl', w: 100, h: 50, color: '#9CA3AF', icon: '🚰', height3d: 85, structural: false, desc: 'Triple bowl stainless (2 besar + 1 prep kecil)' },
    { type: 'sink-granite-composite-black', name: 'Sink Granit Composite Hitam', w: 80, h: 50, color: '#1F2937', icon: '🚰', height3d: 85, structural: false, desc: 'Granite composite sink 80% granit + 20% resin hitam' },
    { type: 'sink-granite-composite-white', name: 'Sink Granit Composite Putih', w: 80, h: 50, color: '#F5F5F5', icon: '🚰', height3d: 85, structural: false, desc: 'Granite composite sink putih ivory tahan gores' },
    { type: 'sink-granite-composite-grey', name: 'Sink Granit Composite Abu', w: 80, h: 50, color: '#6B7280', icon: '🚰', height3d: 85, structural: false, desc: 'Granite composite sink abu modern tahan panas' },
    { type: 'sink-quartz-black', name: 'Sink Quartz Hitam', w: 75, h: 50, color: '#111827', icon: '🚰', height3d: 85, structural: false, desc: 'Quartz composite sink hitam premium (Silestone)' },
    { type: 'sink-ceramic-white', name: 'Sink Keramik Putih', w: 70, h: 45, color: '#FAFAFA', icon: '🚰', height3d: 85, structural: false, desc: 'Ceramic sink putih gloss klasik (tahan noda)' },
    { type: 'sink-ceramic-cream', name: 'Sink Keramik Cream', w: 70, h: 45, color: '#F5DEB3', icon: '🚰', height3d: 85, structural: false, desc: 'Ceramic sink cream off-white klasik' },
    { type: 'sink-fireclay-white', name: 'Sink Fireclay Putih', w: 80, h: 55, color: '#FFFFFF', icon: '🚰', height3d: 85, structural: false, desc: 'Fireclay sink putih dibakar tinggi (tahan panas ekstrim)' },
    { type: 'sink-copper-hammered', name: 'Sink Tembaga Tempa', w: 70, h: 45, color: '#B87333', icon: '🚰', height3d: 85, structural: false, desc: 'Copper sink hammered handmade (antimikroba alami)' },
    { type: 'sink-bronze-oil-rubbed', name: 'Sink Bronze Oil-Rubbed', w: 70, h: 45, color: '#5D3A1A', icon: '🚰', height3d: 85, structural: false, desc: 'Bronze sink oil-rubbed klasik vintage (anti bakteri)' },
    { type: 'sink-marble-white', name: 'Sink Marmer Putih', w: 75, h: 50, color: '#F5F5DC', icon: '🚰', height3d: 85, structural: false, desc: 'Marble sink carved solid putih mewah (Calacatta)' },
    { type: 'sink-concrete-grey', name: 'Sink Beton Exposed', w: 75, h: 50, color: '#A8A29E', icon: '🚰', height3d: 85, structural: false, desc: 'Concrete sink cast exposed industrial modern' },
    { type: 'sink-glass-tempered', name: 'Sink Kaca Tempered', w: 60, h: 45, color: '#E0F2FE', icon: '🚰', height3d: 85, structural: false, desc: 'Tempered glass sink transparent modern minimalis' },
    // ===== KITCHEN SINK - BENTUK & MOUNTING =====
    { type: 'sink-topmount-drop-in', name: 'Sink Topmount (Drop-in)', w: 75, h: 50, color: '#9CA3AF', icon: '🚰', height3d: 85, structural: false, desc: 'Topmount drop-in sink dengan rim di atas countertop' },
    { type: 'sink-undermount-deep', name: 'Sink Undermount Deep', w: 75, h: 50, color: '#9CA3AF', icon: '🚰', height3d: 90, structural: false, desc: 'Undermount sink deep bowl 25cm (cuci panci besar)' },
    { type: 'sink-flushmount', name: 'Sink Flushmount', w: 75, h: 50, color: '#9CA3AF', icon: '🚰', height3d: 85, structural: false, desc: 'Flushmount sink sejajar countertop (zero radius)' },
    { type: 'sink-integrated-solid-surface', name: 'Sink Integrated Solid Surface', w: 80, h: 50, color: '#F5F5F5', icon: '🚰', height3d: 85, structural: false, desc: 'Integrated sink + countertop corian seamless' },
    { type: 'sink-corner-diagonal', name: 'Sink Sudut Diagonal', w: 80, h: 80, color: '#9CA3AF', icon: '🚰', height3d: 85, structural: false, desc: 'Corner sink diagonal untuk dapur sudut L/U' },
    { type: 'sink-corner-L', name: 'Sink Sudut L-Shape', w: 90, h: 70, color: '#9CA3AF', icon: '🚰', height3d: 85, structural: false, desc: 'Corner sink L-shape 2 bowl untuk sudut dapur' },
    { type: 'sink-round', name: 'Sink Bulat', w: 45, h: 45, color: '#9CA3AF', icon: '⭕', height3d: 85, structural: false, desc: 'Round sink bar/prep single bowl bulat' },
    { type: 'sink-square-deep', name: 'Sink Kotak Deep', w: 50, h: 50, color: '#1F2937', icon: '🚰', height3d: 90, structural: false, desc: 'Square deep bowl sink zero radius modern' },
    { type: 'sink-double-bowl-low-divide', name: 'Sink Double Low Divide', w: 80, h: 50, color: '#9CA3AF', icon: '🚰', height3d: 85, structural: false, desc: 'Double bowl low divide (sekat rendah, bisa cuci tray panjang)' },
    { type: 'sink-single-large', name: 'Sink Single Large', w: 80, h: 55, color: '#9CA3AF', icon: '🚰', height3d: 90, structural: false, desc: 'Single bowl large 80x55 deep (cuci wajan besar)' },
    { type: 'sink-workstation', name: 'Sink Workstation (Accessories)', w: 90, h: 50, color: '#9CA3AF', icon: '🚰', height3d: 85, structural: false, desc: 'Workstation sink dengan cutting board + colander + drying rack' },
    { type: 'sink-with-drainboard', name: 'Sink + Drainboard', w: 100, h: 55, color: '#9CA3AF', icon: '🚰', height3d: 85, structural: false, desc: 'Sink dengan drainboard integrated (tiris) tunggal' },
    { type: 'sink-double-drainboard', name: 'Sink Double Drainboard', w: 120, h: 55, color: '#9CA3AF', icon: '🚰', height3d: 85, structural: false, desc: 'Sink double bowl + 2 drainboard kiri kanan' },
    // ===== BAR SINK & PREP SINK =====
    { type: 'sink-bar-round', name: 'Bar Sink Bulat', w: 35, h: 35, color: '#9CA3AF', icon: '🍷', height3d: 80, structural: false, desc: 'Bar sink bulat kecil untuk mini bar/island' },
    { type: 'sink-bar-square', name: 'Bar Sink Kotak', w: 35, h: 35, color: '#1F2937', icon: '🍷', height3d: 80, structural: false, desc: 'Bar sink square kecil stainless hitam' },
    { type: 'sink-prep-corner', name: 'Prep Sink Sudut', w: 45, h: 45, color: '#9CA3AF', icon: '🚰', height3d: 85, structural: false, desc: 'Prep sink corner untuk kitchen island sudut' },
    { type: 'sink-veg-sink', name: 'Vegetable Sink', w: 40, h: 35, color: '#9CA3AF', icon: '🥬', height3d: 85, structural: false, desc: 'Vegetable prep sink kecil terpisah untuk cuci sayur' },
    // ===== LAUNDRY & UTILITY SINK =====
    { type: 'sink-laundry-deep', name: 'Laundry Sink Deep', w: 70, h: 55, color: '#9CA3AF', icon: '🧺', height3d: 90, structural: false, desc: 'Laundry sink deep bowl stainless (cuci jemuran)' },
    { type: 'sink-utility-tub', name: 'Utility Tub Double', w: 90, h: 55, color: '#9CA3AF', icon: '🪣', height3d: 85, structural: false, desc: 'Utility tub double bowl untuk garasi/laundry room' },
    { type: 'sink-mop-sink', name: 'Mop Sink (Floor)', w: 50, h: 50, color: '#9CA3AF', icon: '🧹', height3d: 30, structural: false, desc: 'Mop sink floor-mounted (cuci mop di lantai)' },
    { type: 'sink-service-sink', name: 'Service Sink (Wall)', w: 50, h: 45, color: '#F5F5F5', icon: '🚰', height3d: 60, structural: false, desc: 'Service sink wall-mounted keramik (janitor)' },
    { type: 'water-faucet-pullout', name: 'Faucet Pull-out', w: 25, h: 15, color: '#9CA3AF', icon: '🚿', height3d: 35, structural: false, desc: 'Faucet pull-out sprayer stainless' },
    { type: 'water-faucet-gooseneck', name: 'Faucet Gooseneck', w: 25, h: 15, color: '#D4D4D4', icon: '🚿', height3d: 40, structural: false, desc: 'Faucet gooseneck tinggi' },
    { type: 'fridge-built-in', name: 'Kulkas Built-in', w: 75, h: 70, color: '#9CA3AF', icon: '🧊', height3d: 200, structural: false, desc: 'Kulkas built-in terintegrasi kabinet' },
    { type: 'fridge-bottom-freezer', name: 'Kulkas Bottom Freezer', w: 70, h: 70, color: '#CBD5E0', icon: '🧊', height3d: 190, structural: false, desc: 'Kulkas bottom freezer (freezer bawah)' },
    { type: 'fridge-mini-bar', name: 'Kulkas Mini Bar', w: 45, h: 50, color: '#1F2937', icon: '🧊', height3d: 65, structural: false, desc: 'Mini bar fridge untuk wine/drink' },
    { type: 'wine-cooler-built-in', name: 'Wine Cooler Built-in', w: 30, h: 50, color: '#1F2937', icon: '🍷', height3d: 130, structural: false, desc: 'Wine cooler tanam 18 botol' },
    { type: 'counter-granite', name: 'Countertop Granit', w: 120, h: 60, color: '#1F2937', icon: '🍳', height3d: 85, structural: false, desc: 'Countertop granit hitam premium' },
    { type: 'counter-quartz', name: 'Countertop Quartz', w: 120, h: 60, color: '#F5F5F5', icon: '🍳', height3d: 85, structural: false, desc: 'Countertop quartz putih mewah' },
    { type: 'counter-marble', name: 'Countertop Marmer', w: 120, h: 60, color: '#F5DEB3', icon: '🍳', height3d: 85, structural: false, desc: 'Countertop marmer crema' },
    { type: 'counter-wood-butcher', name: 'Countertop Butcher Block', w: 120, h: 60, color: '#8B6F47', icon: '🪵', height3d: 85, structural: false, desc: 'Countertop kayu butcher block' },
    { type: 'counter-stainless', name: 'Countertop Stainless', w: 120, h: 60, color: '#9CA3AF', icon: '🍳', height3d: 85, structural: false, desc: 'Countertop stainless steel industrial' },
    { type: 'counter-concrete', name: 'Countertop Beton', w: 120, h: 60, color: '#A8A29E', icon: '🍳', height3d: 85, structural: false, desc: 'Countertop beton exposed industrial' },
    { type: 'counter-l-shape', name: 'Counter L-Shape', w: 200, h: 150, color: '#718096', icon: '⬛', height3d: 85, structural: false, desc: 'Counter dapur bentuk L' },
    { type: 'counter-u-shape', name: 'Counter U-Shape', w: 240, h: 180, color: '#718096', icon: '⬛', height3d: 85, structural: false, desc: 'Counter dapur bentuk U' },
    { type: 'counter-straight', name: 'Counter Lurus', w: 200, h: 60, color: '#718096', icon: '➖', height3d: 85, structural: false, desc: 'Counter dapur lurus galley' },
    { type: 'counter-galley', name: 'Counter Galley (Parallel)', w: 200, h: 150, color: '#718096', icon: '⬛', height3d: 85, structural: false, desc: 'Counter dapur paralel (2 sisi)' },
    { type: 'counter-peninsula', name: 'Counter Peninsula', w: 200, h: 100, color: '#718096', icon: '⬛', height3d: 85, structural: false, desc: 'Counter peninsula (menyambung dari dinding)' },
    { type: 'kitchen-island-large', name: 'Kitchen Island Besar', w: 240, h: 120, color: '#5B3A1A', icon: '🏝️', height3d: 90, structural: false, desc: 'Pulau dapur besar dengan seating' },
    { type: 'kitchen-island-with-sink', name: 'Kitchen Island + Sink', w: 200, h: 100, color: '#5B3A1A', icon: '🏝️', height3d: 90, structural: false, desc: 'Pulau dapur dengan wastafel + cooktop' },
    { type: 'kitchen-island-portable', name: 'Kitchen Cart (Mobile)', w: 80, h: 50, color: '#8B6F47', icon: '🛒', height3d: 85, structural: false, desc: 'Kitchen cart mobile dengan roda' },
    { type: 'kitchen-island-breakfast', name: 'Island Breakfast Bar', w: 220, h: 100, color: '#5B3A1A', icon: '🍽️', height3d: 90, structural: false, desc: 'Island dengan overhang untuk breakfast bar' },
    { type: 'butcher-block-table', name: 'Meja Butcher Block', w: 100, h: 60, color: '#8B6F47', icon: '🪵', height3d: 85, structural: false, desc: 'Meja potong kayu butcher block' },
    { type: 'prep-table', name: 'Meja Prep Stainless', w: 120, h: 60, color: '#9CA3AF', icon: '🍳', height3d: 85, structural: false, desc: 'Meja preparasi stainless steel' },
    { type: 'baking-table', name: 'Meja Marmer Baking', w: 100, h: 60, color: '#F5F5DC', icon: '🥖', height3d: 85, structural: false, desc: 'Meja marmer khusus baking pastry' },
    { type: 'cabinet-base', name: 'Kabinet Bawah', w: 80, h: 60, color: '#8B6F47', icon: '🗄️', height3d: 85, structural: false, desc: 'Kabinet dapur bawah 80cm' },
    { type: 'cabinet-wall', name: 'Kabinet Atas (Wall)', w: 80, h: 35, color: '#8B6F47', icon: '🗄️', height3d: 70, structural: false, desc: 'Kabinet dapur atas gantung' },
    { type: 'cabinet-tall', name: 'Kabinet Tinggi (Pantry)', w: 60, h: 60, color: '#8B6F47', icon: '🗄️', height3d: 220, structural: false, desc: 'Kabinet tinggi pantry 2.2m' },
    { type: 'cabinet-corner', name: 'Kabinet Sudut', w: 90, h: 90, color: '#8B6F47', icon: '🗄️', height3d: 85, structural: false, desc: 'Kabinet sudut lazy susan' },
    { type: 'cabinet-drawer', name: 'Kabinet Laci', w: 80, h: 60, color: '#6B4423', icon: '🗄️', height3d: 85, structural: false, desc: 'Kabinet dapur dengan laci 3 tier' },
    { type: 'cabinet-glass-front', name: 'Kabinet Kaca', w: 80, h: 35, color: '#8B6F47', icon: '🚪', height3d: 70, structural: false, desc: 'Kabinet atas dengan pintu kaca display' },
    { type: 'cabinet-open-shelf', name: 'Kabinet Open Shelf', w: 80, h: 35, color: '#8B6F47', icon: '📚', height3d: 70, structural: false, desc: 'Kabinet rak terbuka (open shelving)' },
    { type: 'cabinet-under-stairs', name: 'Kabinet Bawah Tangga', w: 100, h: 50, color: '#8B6F47', icon: '🗄️', height3d: 250, structural: false, desc: 'Kabinet storage bawah tangga' },
    { type: 'pantry-walk-in', name: 'Walk-in Pantry', w: 150, h: 100, color: '#8B6F47', icon: '🥫', height3d: 250, structural: false, desc: 'Walk-in pantry ruang terpisah' },
    { type: 'pantry-cabinet-tall', name: 'Pantry Cabinet Tall', w: 60, h: 60, color: '#6B4423', icon: '🥫', height3d: 220, structural: false, desc: 'Pantry cabinet tinggi pull-out' },
    { type: 'spice-rack', name: 'Rak Bumbu', w: 60, h: 10, color: '#6B4423', icon: '🌶️', height3d: 60, structural: false, desc: 'Rak bumbu dinding pull-out' },
    { type: 'pot-rack', name: 'Rak Panci Gantung', w: 80, h: 30, color: '#1F2937', icon: '🍳', height3d: 50, structural: false, desc: 'Rak panci gantung atas island' },
    { type: 'shelf-floating', name: 'Rak Apung Dapur', w: 80, h: 20, color: '#8B6F47', icon: '📚', height3d: 5, structural: false, desc: 'Rak apung kayu untuk display' },
    { type: 'dishwasher-drawer', name: 'Dishwasher Drawer', w: 60, h: 35, color: '#9CA3AF', icon: '🍽️', height3d: 45, structural: false, desc: 'Dishwasher drawer single' },
    { type: 'coffee-machine-built-in', name: 'Mesin Kopi Built-in', w: 45, h: 35, color: '#1F2937', icon: '☕', height3d: 60, structural: false, desc: 'Mesin kopi otomatis built-in' },
    { type: 'warming-drawer', name: 'Warming Drawer', w: 60, h: 30, color: '#1F2937', icon: '🔥', height3d: 30, structural: false, desc: 'Laci penghangat makanan built-in' },
    { type: 'trash-pullout', name: 'Tempat Sampah Pull-out', w: 40, h: 50, color: '#374151', icon: '🗑️', height3d: 80, structural: false, desc: 'Pull-out tempat sampah terintegrasi' },
    { type: 'recycling-bin', name: 'Bin Daur Ulang', w: 50, h: 40, color: '#10B981', icon: '♻️', height3d: 80, structural: false, desc: 'Bin pemisah daur ulang 3 compartment' },
    { type: 'dining-table-4', name: 'Meja Makan 4', w: 120, h: 70, color: '#8B6F47', icon: '🍽️', height3d: 75, structural: false, desc: 'Meja makan 4 orang kecil' },
    { type: 'dining-table-round', name: 'Meja Makan Bulat', w: 120, h: 120, color: '#8B6F47', icon: '⭕', height3d: 75, structural: false, desc: 'Meja makan bulat 4-6 orang' },
    { type: 'dining-table-extendable', name: 'Meja Makan Extendable', w: 160, h: 90, color: '#8B6F47', icon: '🍽️', height3d: 75, structural: false, desc: 'Meja makan bisa diperpanjang' },
    { type: 'dining-table-marble', name: 'Meja Makan Marmer', w: 180, h: 90, color: '#F5F5DC', icon: '🍽️', height3d: 75, structural: false, desc: 'Meja makan top marmer mewah' },
    { type: 'dining-table-glass', name: 'Meja Makan Kaca', w: 160, h: 90, color: '#BEE3F8', icon: '🍽️', height3d: 75, structural: false, desc: 'Meja makan top kaca tempered' },
    { type: 'breakfast-nook', name: 'Breakfast Nook', w: 200, h: 80, color: '#8B6F47', icon: '🪑', height3d: 90, structural: false, desc: 'Sudut breakfast dengan bench' },
    { type: 'bar-counter', name: 'Bar Counter', w: 180, h: 50, color: '#5B3A1A', icon: '🍸', height3d: 110, structural: false, desc: 'Counter bar tinggi 110cm' },
    { type: 'bistro-table', name: 'Meja Bistro', w: 60, h: 60, color: '#1F2937', icon: '☕', height3d: 105, structural: false, desc: 'Meja bistro tinggi bulat 2 orang' },
    { type: 'bar-stool-swivel', name: 'Kursi Bar Putar', w: 40, h: 40, color: '#1F2937', icon: '🪑', height3d: 110, structural: false, desc: 'Kursi bar swivel dengan punggung' },
    { type: 'chair-upholstered', name: 'Kursi Berlapis', w: 50, h: 50, color: '#7C2D12', icon: '🪑', height3d: 95, structural: false, desc: 'Kursi makan upholstered mewah' },
    { type: 'bench-dining', name: 'Bench Makan', w: 150, h: 35, color: '#8B6F47', icon: '🪑', height3d: 45, structural: false, desc: 'Bench panjang untuk meja makan' },
    { type: 'kitchen-backsplash', name: 'Backsplash', w: 200, h: 60, color: '#9CA3AF', icon: '⬜', height3d: 60, structural: false, desc: 'Backsplash keramik/subway di belakang counter' },
    { type: 'kitchen-rail-suspended', name: 'Rail Gantung Pot', w: 120, h: 30, color: '#1F2937', icon: '🪝', height3d: 100, structural: false, desc: 'Rail gantung pot/pan utensil' },
    { type: 'kitchen-utensil-holder', name: 'Holder Alat Masak', w: 15, h: 15, color: '#9CA3AF', icon: '🍴', height3d: 25, structural: false, desc: 'Holder alat masak countertop' },
    { type: 'kitchen-cutting-board', name: 'Cutting Board', w: 40, h: 25, color: '#8B6F47', icon: '🪵', height3d: 3, structural: false, desc: 'Talenan kayu besar' },
    { type: 'kitchen-knife-block', name: 'Knife Block', w: 15, h: 10, color: '#1F2937', icon: '🔪', height3d: 25, structural: false, desc: 'Block pisau dapur countertop' },
    { type: 'kitchen-fruit-basket', name: 'Keranjang Buah', w: 30, h: 30, color: '#9CA3AF', icon: '🍎', height3d: 20, structural: false, desc: 'Keranjang buah countertop' },
    { type: 'kitchen-spice-jars', name: 'Set Bumbu Jar', w: 25, h: 10, color: '#D4A574', icon: '🌶️', height3d: 15, structural: false, desc: 'Set toples bumbu countertop' },
    { type: 'kitchen-mixer', name: 'Mixer Stand', w: 25, h: 30, color: '#9CA3AF', icon: '🥣', height3d: 35, structural: false, desc: 'Stand mixer KitchenAid' },
    { type: 'kitchen-blender', name: 'Blender', w: 20, h: 20, color: '#1F2937', icon: '🥤', height3d: 40, structural: false, desc: 'Blender countertop' },
    { type: 'kitchen-toaster', name: 'Toaster', w: 35, h: 20, color: '#9CA3AF', icon: '🍞', height3d: 25, structural: false, desc: 'Toaster 2 slice countertop' },
    { type: 'kitchen-coffee-maker', name: 'Coffee Maker', w: 25, h: 20, color: '#1F2937', icon: '☕', height3d: 35, structural: false, desc: 'Coffee maker drip countertop' },
    { type: 'kitchen-kettle', name: 'Ketel Listrik', w: 20, h: 18, color: '#9CA3AF', icon: '💧', height3d: 25, structural: false, desc: 'Electric kettle countertop' },
    { type: 'kitchen-rice-cooker', name: 'Magic Com (Rice Cooker)', w: 30, h: 30, color: '#FFFFFF', icon: '🍚', height3d: 30, structural: false, desc: 'Magic com penanak nasi' },
    { type: 'kitchen-water-dispenser-portable', name: 'Dispenser Air Countertop', w: 30, h: 30, color: '#FFFFFF', icon: '💧', height3d: 40, structural: false, desc: 'Dispenser air panas/dingin countertop' },
    { type: 'kitchen-range-hood-downdraft', name: 'Downdraft Vent', w: 80, h: 15, color: '#9CA3AF', icon: '🌬️', height3d: 50, structural: false, desc: 'Downdraft vent naik-turun di belakang cooktop' },
    { type: 'kitchen-air-purifier', name: 'Air Purifier Dapur', w: 35, h: 35, color: '#F5F5F5', icon: '💨', height3d: 60, structural: false, desc: 'Air purifier dapur untuk bau' },
  ],
  bathroom: [
    { type: 'toilet', name: 'Closet Duduk', w: 40, h: 60, color: '#F7FAFC', icon: '🚽', height3d: 75, structural: false, desc: 'Closet duduk' },
    { type: 'toilet-squat', name: 'Closet Jongkok', w: 50, h: 70, color: '#F7FAFC', icon: '🚽', height3d: 30, structural: false, desc: 'Closet jongkok' },
    { type: 'bidet', name: 'Bidet', w: 40, h: 60, color: '#F7FAFC', icon: '🚿', height3d: 40, structural: false, desc: 'Bidet spray' },
    { type: 'bathtub', name: 'Bathtub', w: 170, h: 75, color: '#E2E8F0', icon: '🛁', height3d: 60, structural: false, desc: 'Bathtub 170cm' },
    { type: 'bathtub-corner', name: 'Bathtub Sudut', w: 140, h: 140, color: '#E2E8F0', icon: '🛁', height3d: 60, structural: false, desc: 'Bathtub sudut' },
    { type: 'shower', name: 'Shower Area', w: 90, h: 90, color: '#CBD5E0', icon: '🚿', height3d: 200, structural: false, desc: 'Kamar shower' },
    { type: 'shower-enclosure', name: 'Shower Glass', w: 90, h: 90, color: '#BEE3F8', icon: '🚿', height3d: 200, structural: false, desc: 'Kaca shower enclosure' },
    { type: 'bathroom-sink', name: 'Wastafel KM', w: 60, h: 50, color: '#F7FAFC', icon: '🪥', height3d: 80, structural: false, desc: 'Wastafel kamar mandi' },
    { type: 'double-vanity', name: 'Wastafel Ganda', w: 120, h: 50, color: '#F7FAFC', icon: '🪥', height3d: 80, structural: false, desc: 'Wastafel 2 bak' },
    { type: 'mirror', name: 'Cermin', w: 80, h: 10, color: '#BEE3F8', icon: '🪞', height3d: 100, structural: false, desc: 'Cermin dinding' },
    { type: 'mirror-large', name: 'Cermin Besar', w: 120, h: 10, color: '#BEE3F8', icon: '🪞', height3d: 180, structural: false, desc: 'Cermin full height' },
    { type: 'water-heater', name: 'Water Heater', w: 40, h: 60, color: '#A0AEC0', icon: '🔥', height3d: 60, structural: false, desc: 'Pemanas air' },
  ],
  doors: [
    // ===== PINTU =====
    { type: 'door', name: 'Pintu Kayu', w: 90, h: 10, color: '#8B6F47', icon: '🚪', height3d: 210, structural: false, desc: 'Pintu kayu 90cm' },
    { type: 'door-glass', name: 'Pintu Kaca', w: 100, h: 10, color: '#BEE3F8', icon: '🚪', height3d: 210, structural: false, desc: 'Pintu kaca tempered' },
    { type: 'door-double', name: 'Pintu Ganda', w: 180, h: 10, color: '#6B4423', icon: '🚪', height3d: 230, structural: false, desc: 'Pintu ganda klasik' },
    { type: 'sliding-door', name: 'Pintu Geser', w: 150, h: 10, color: '#A0826D', icon: '🚪', height3d: 210, structural: false, desc: 'Pintu geser 150cm' },
    { type: 'folding-door', name: 'Pintu Lipat', w: 200, h: 10, color: '#9C7B5A', icon: '🚪', height3d: 210, structural: false, desc: 'Pintu lipat 200cm' },
    { type: 'french-door', name: 'Pintu Prancis', w: 160, h: 10, color: '#8B6F47', icon: '🚪', height3d: 240, structural: false, desc: 'French door ganda kaca' },
    { type: 'door-pivot', name: 'Pintu Pivot', w: 120, h: 10, color: '#1F2937', icon: '🚪', height3d: 240, structural: false, desc: 'Pintu pivot modern besar' },
    { type: 'door-aluminum', name: 'Pintu Aluminium', w: 100, h: 10, color: '#9CA3AF', icon: '🚪', height3d: 210, structural: false, desc: 'Pintu aluminium sliding' },
    { type: 'door-upvc', name: 'Pintu UPVC', w: 90, h: 10, color: '#F5F5F5', icon: '🚪', height3d: 210, structural: false, desc: 'Pintu UPVC putih' },
    { type: 'door-solid-wood', name: 'Pintu Kayu Solid', w: 100, h: 10, color: '#5D3A1A', icon: '🚪', height3d: 220, structural: false, desc: 'Pintu jati solid mewah' },
    { type: 'door-panel', name: 'Pintu Panel', w: 90, h: 10, color: '#8B6F47', icon: '🚪', height3d: 210, structural: false, desc: 'Pintu panel kayu 4-panel' },
    { type: 'door-flush', name: 'Pintu Flush', w: 80, h: 10, color: '#D4A574', icon: '🚪', height3d: 210, structural: false, desc: 'Pintu flush datar minimalis' },
    { type: 'door-louver', name: 'Pintu Louver', w: 80, h: 10, color: '#A0826D', icon: '🚪', height3d: 210, structural: false, desc: 'Pintu louver ventilasi' },
    { type: 'door-carving', name: 'Pintu Ukir', w: 100, h: 10, color: '#5D3A1A', icon: '🚪', height3d: 230, structural: false, desc: 'Pintu ukiran klasik Jawa' },
    { type: 'door-sliding-glass', name: 'Pintu Geser Kaca', w: 240, h: 10, color: '#BEE3F8', icon: '🚪', height3d: 220, structural: false, desc: 'Pintu geser kaca besar (sky door)' },
    { type: 'door-steel', name: 'Pintu Baja', w: 100, h: 10, color: '#374151', icon: '🚪', height3d: 210, structural: false, desc: 'Pintu baja industrial keamanan' },
    { type: 'door-minimalis', name: 'Pintu Minimalis', w: 90, h: 10, color: '#1F2937', icon: '🚪', height3d: 220, structural: false, desc: 'Pintu minimalis modern' },
    { type: 'door-klasik', name: 'Pintu Klasik', w: 120, h: 10, color: '#6B4423', icon: '🚪', height3d: 240, structural: false, desc: 'Pintu klasik Eropa panel tinggi' },
    // ===== JENDELA =====
    { type: 'window', name: 'Jendela Standar', w: 120, h: 10, color: '#BEE3F8', icon: '🪟', height3d: 120, structural: false, desc: 'Jendela 120cm' },
    { type: 'window-large', name: 'Jendela Besar', w: 200, h: 10, color: '#BEE3F8', icon: '🪟', height3d: 180, structural: false, desc: 'Jendela panorama' },
    { type: 'window-bay', name: 'Jendela Bay Window', w: 180, h: 60, color: '#BEE3F8', icon: '🪟', height3d: 150, structural: false, desc: 'Jendela bay menonjol' },
    { type: 'skylight', name: 'Skylight', w: 100, h: 100, color: '#BEE3F8', icon: '⬜', height3d: 5, structural: false, desc: 'Jendela atap' },
    { type: 'louver-window', name: 'Jendela Louver', w: 100, h: 10, color: '#718096', icon: '🪟', height3d: 120, structural: false, desc: 'Jendela louvered' },
    { type: 'window-sliding', name: 'Jendela Sliding', w: 150, h: 10, color: '#BEE3F8', icon: '🪟', height3d: 140, structural: false, desc: 'Jendela geser 2 leaf' },
    { type: 'window-casement', name: 'Jendela Casement', w: 120, h: 10, color: '#BEE3F8', icon: '🪟', height3d: 140, structural: false, desc: 'Jendela swing bukaan ke luar' },
    { type: 'window-awning', name: 'Jendela Awning', w: 100, h: 10, color: '#BEE3F8', icon: '🪟', height3d: 80, structural: false, desc: 'Jendela awning bukaan atas' },
    { type: 'window-fixed', name: 'Jendela Fixed', w: 180, h: 10, color: '#BEE3F8', icon: '🪟', height3d: 200, structural: false, desc: 'Jendela fixed picture (tidak dibuka)' },
    { type: 'window-jengki', name: 'Jendela Jengki', w: 120, h: 10, color: '#8B6F47', icon: '🪟', height3d: 120, structural: false, desc: 'Jendela jengki klasik Indonesia' },
    { type: 'window-twin', name: 'Jendela Twin', w: 200, h: 10, color: '#BEE3F8', icon: '🪟', height3d: 140, structural: false, desc: 'Jendela kembar 2 leaf' },
    { type: 'window-triple', name: 'Jendela Triple', w: 300, h: 10, color: '#BEE3F8', icon: '🪟', height3d: 140, structural: false, desc: 'Jendela triple 3 leaf panorama' },
    { type: 'window-nako', name: 'Jendela Nako', w: 100, h: 10, color: '#9CA3AF', icon: '🪟', height3d: 120, structural: false, desc: 'Jendela nako kaca tebal berlapis' },
    { type: 'window-tempered', name: 'Jendela Kaca Tempered', w: 150, h: 10, color: '#E0F2FE', icon: '🪟', height3d: 200, structural: false, desc: 'Jendela kaca tempered 12mm' },
    { type: 'window-tinted', name: 'Jendela Kaca Tinted', w: 150, h: 10, color: '#1E3A5F', icon: '🪟', height3d: 200, structural: false, desc: 'Jendela kaca tinted hitam/bronz' },
    { type: 'window-wood-frame', name: 'Jendela Frame Kayu', w: 120, h: 10, color: '#8B6F47', icon: '🪟', height3d: 140, structural: false, desc: 'Jendela dengan frame kayu jati' },
    { type: 'window-aluminum-frame', name: 'Jendela Frame Aluminium', w: 120, h: 10, color: '#9CA3AF', icon: '🪟', height3d: 140, structural: false, desc: 'Jendela dengan frame aluminium' },
    { type: 'window-upvc-frame', name: 'Jendela Frame UPVC', w: 120, h: 10, color: '#F5F5F5', icon: '🪟', height3d: 140, structural: false, desc: 'Jendela frame UPVC tahan cuaca' },
    { type: 'window-glass-block', name: 'Blok Kaca (Glass Block)', w: 100, h: 100, color: '#E0F2FE', icon: '⬜', height3d: 200, structural: false, desc: 'Glass block wall untuk privasi + cahaya' },
    { type: 'window-horizontal-sliding', name: 'Jendela Sliding Horizontal', w: 180, h: 10, color: '#BEE3F8', icon: '🪟', height3d: 130, structural: false, desc: 'Jendela geser horizontal 3 track' },
  ],
  structural: [
    { type: 'stairs', name: 'Tangga L', w: 100, h: 250, color: '#78716C', icon: '🪜', height3d: 300, structural: true, desc: 'Tangga L antar lantai' },
    { type: 'stairs-straight', name: 'Tangga Lurus', w: 100, h: 300, color: '#78716C', icon: '🪜', height3d: 300, structural: true, desc: 'Tangga lurus' },
    { type: 'stairs-spiral', name: 'Tangga Putar', w: 150, h: 150, color: '#5B3A1A', icon: '🪜', height3d: 300, structural: true, desc: 'Tangga spiral' },
    { type: 'stairs-u', name: 'Tangga U (Bordes)', w: 200, h: 200, color: '#78716C', icon: '🪜', height3d: 300, structural: true, desc: 'Tangga U dengan bordes tengah, hemat ruang' },
    { type: 'stairs-curved', name: 'Tangga Lengkung', w: 250, h: 250, color: '#8B6F47', icon: '🪜', height3d: 300, structural: true, desc: 'Tangga melengkung elegan untuk rumah mewah' },
    { type: 'stairs-cantilever', name: 'Tangga Kantilever', w: 100, h: 300, color: '#374151', icon: '🪜', height3d: 300, structural: true, desc: 'Tangga menggantung modern minimalis' },
    { type: 'stairs-steel', name: 'Tangga Baja Ringan', w: 100, h: 300, color: '#64748B', icon: '🪜', height3d: 300, structural: true, desc: 'Tangga baja ringan industrial' },
    { type: 'stairs-mini', name: 'Tangga Mini (Loteng)', w: 80, h: 150, color: '#8B6F47', icon: '🪜', height3d: 250, structural: true, desc: 'Tangga curam untuk akses loteng' },
    { type: 'stairs-floating', name: 'Tangga Melayang', w: 120, h: 300, color: '#1F2937', icon: '🪜', height3d: 300, structural: true, desc: 'Tangga floating tanpa stringer samping' },
    { type: 'beam', name: 'Balok', w: 200, h: 30, color: '#F59E0B', icon: '📏', height3d: 30, structural: true, desc: 'Balok struktural' },
    { type: 'column-rect', name: 'Kolom Beton', w: 30, h: 30, color: '#DC2626', icon: '🏗️', height3d: 300, structural: true, desc: 'Kolom beton 30x30' },
    { type: 'column-round', name: 'Kolom Bulat', w: 30, h: 30, color: '#DC2626', icon: '⚪', height3d: 300, structural: true, desc: 'Kolom bulat dekoratif' },
    { type: 'column-wood-round', name: 'Tiang Kayu Bulat', w: 25, h: 25, color: '#8B6F47', icon: '🪵', height3d: 300, structural: true, desc: 'Tiang kayu bulat alami (glugu)' },
    { type: 'column-wood-square', name: 'Tiang Kayu Kotak', w: 25, h: 25, color: '#A0826D', icon: '🪵', height3d: 300, structural: true, desc: 'Tiang kayu kotak 25x25' },
    { type: 'column-steel-pipe', name: 'Tiang Baja Pipa', w: 20, h: 20, color: '#6B7280', icon: '⬛', height3d: 300, structural: true, desc: 'Tiang baja pipa sch 40' },
    { type: 'column-steel-hollow', name: 'Tiang Baja Hollow', w: 20, h: 20, color: '#9CA3AF', icon: '⬛', height3d: 300, structural: true, desc: 'Tiang baja hollow 4x4' },
    { type: 'column-marble', name: 'Tiang Marmer', w: 30, h: 30, color: '#F5F5F5', icon: '⚪', height3d: 300, structural: true, desc: 'Tiang marmer mewah' },
    { type: 'column-classic', name: 'Tiang Klasik (Doric)', w: 40, h: 40, color: '#E5E5E5', icon: '🏛️', height3d: 350, structural: true, desc: 'Tiang klasik gaya Yunani/Romawi' },
    { type: 'column-classic-ionic', name: 'Tiang Klasik (Ionic)', w: 40, h: 40, color: '#F5F5F5', icon: '🏛️', height3d: 350, structural: true, desc: 'Tiang Ionic dengan volute (scroll)' },
    { type: 'column-classic-corinthian', name: 'Tiang Klasik (Corinthian)', w: 45, h: 45, color: '#FAFAFA', icon: '🏛️', height3d: 380, structural: true, desc: 'Tiang Corinthian dengan daun acanthus' },
    { type: 'column-modern-square', name: 'Tiang Modern Kotak', w: 30, h: 30, color: '#1F2937', icon: '⬛', height3d: 300, structural: true, desc: 'Tiang modern kotak minimalis' },
    { type: 'column-hexagon', name: 'Tiang Hexagon', w: 30, h: 30, color: '#78716C', icon: '⬡', height3d: 300, structural: true, desc: 'Tiang segi enam dekoratif' },
    { type: 'column-octagon', name: 'Tiang Octagon', w: 30, h: 30, color: '#8B6F47', icon: '⬡', height3d: 300, structural: true, desc: 'Tiang segi delapan klasik' },
    { type: 'column-fence-post', name: 'Tiang Pagar', w: 15, h: 15, color: '#374151', icon: '⬛', height3d: 200, structural: true, desc: 'Tiang pagar besi/stainless' },
    { type: 'column-lamp-post', name: 'Tiang Lampu', w: 20, h: 20, color: '#4B5563', icon: '💡', height3d: 400, structural: true, desc: 'Tiang lampu taman 4m' },
    { type: 'column-canopy', name: 'Tiang Kanopi', w: 12, h: 12, color: '#6B7280', icon: '⬛', height3d: 300, structural: true, desc: 'Tiang kanopi carport' },
    { type: 'column-decorative', name: 'Tiang Dekoratif', w: 25, h: 25, color: '#D4A574', icon: '⬛', height3d: 280, structural: true, desc: 'Tiang dekoratif dengan ornamen' },
    { type: 'foundation', name: 'Pondasi', w: 100, h: 100, color: '#78716C', icon: '⬛', height3d: 60, structural: true, desc: 'Tapak pondasi' },
    { type: 'retaining-wall', name: 'Dinding Penahan', w: 200, h: 20, color: '#57534E', icon: '🧱', height3d: 150, structural: true, desc: 'Dinding penahan tanah' },
  ],
  // NEW: Outdoor & Landscape category with fences (pagar)
  outdoor: [
    // ===== PAGAR / FENCES =====
    { type: 'fence-modern', name: 'Pagar Modern', w: 200, h: 15, color: '#E5E5E5', icon: '🚧', height3d: 180, structural: false, desc: 'Pagar modern minimalis beton' },
    { type: 'fence-iron', name: 'Pagar Besi', w: 200, h: 15, color: '#3D3D3D', icon: '🚧', height3d: 180, structural: false, desc: 'Pagar besi tempa' },
    { type: 'fence-wrought-iron', name: 'Pagar Besi Tempa Klasik', w: 200, h: 15, color: '#1F1F1F', icon: '🚧', height3d: 200, structural: false, desc: 'Pagar besi tempa klasik dengan ornamen' },
    { type: 'fence-wood', name: 'Pagar Kayu', w: 200, h: 15, color: '#8B6F47', icon: '🚧', height3d: 180, structural: false, desc: 'Pagar kayu horizontal' },
    { type: 'fence-bamboo', name: 'Pagar Bambu', w: 200, h: 15, color: '#A0826D', icon: '🚧', height3d: 200, structural: false, desc: 'Pagar bambu tropis' },
    { type: 'fence-hedge', name: 'Pagar Tanaman', w: 200, h: 60, color: '#4A7C2E', icon: '🌳', height3d: 180, structural: false, desc: 'Pagar hidup tanaman' },
    { type: 'fence-stone', name: 'Pagar Batu', w: 200, h: 20, color: '#78716C', icon: '🚧', height3d: 200, structural: false, desc: 'Pagar batu alam' },
    { type: 'fence-concrete', name: 'Pagar Beton', w: 200, h: 20, color: '#A8A29E', icon: '🚧', height3d: 250, structural: false, desc: 'Pagar beton plester' },
    { type: 'fence-vinyl', name: 'Pagar Vinyl', w: 200, h: 15, color: '#F5F5F5', icon: '🚧', height3d: 150, structural: false, desc: 'Pagar vinyl putih' },
    { type: 'fence-chain-link', name: 'Pagar Kawat', w: 200, h: 10, color: '#9CA3AF', icon: '🔗', height3d: 200, structural: false, desc: 'Pagar kawat rantai' },
    { type: 'fence-stainless-vertical', name: 'Pagar Stainless Vertikal', w: 200, h: 10, color: '#C0C0C0', icon: '⬛', height3d: 110, structural: false, desc: 'Pagar stainless steel tiang vertikal (lantai atas)' },
    { type: 'fence-stainless-horizontal', name: 'Pagar Stainless Horizontal', w: 200, h: 10, color: '#C0C0C0', icon: '⬛', height3d: 110, structural: false, desc: 'Pagar stainless steel cable horizontal' },
    { type: 'fence-stainless-glass', name: 'Pagar Stainless + Kaca', w: 200, h: 10, color: '#E0F2FE', icon: '⬛', height3d: 110, structural: false, desc: 'Pagar stainless dengan in-fill kaca tempered' },
    { type: 'fence-stainless-perforated', name: 'Pagar Stainless Perforated', w: 200, h: 10, color: '#B8B8B8', icon: '⬛', height3d: 110, structural: false, desc: 'Pagar stainless plate perforated modern' },
    { type: 'fence-stainless-mesh', name: 'Pagar Stainless Mesh', w: 200, h: 10, color: '#A8A8A8', icon: '⬛', height3d: 110, structural: false, desc: 'Pagar stainless wire mesh industrial' },
    { type: 'fence-stainless-tube', name: 'Pagar Stainless Tube', w: 200, h: 10, color: '#D4D4D4', icon: '⬛', height3d: 110, structural: false, desc: 'Pagar stainless tube horizontal minimalis' },
    { type: 'fence-steel-pipe', name: 'Pagar Baja Pipa', w: 200, h: 10, color: '#6B7280', icon: '⬛', height3d: 110, structural: false, desc: 'Pagar baja pipa hitam industrial (lantai atas)' },
    { type: 'fence-aluminum-slat', name: 'Pagar Aluminium Slat', w: 200, h: 10, color: '#9CA3AF', icon: '⬛', height3d: 110, structural: false, desc: 'Pagar aluminium slat vertikal (lantai atas)' },
    { type: 'fence-glass-frameless', name: 'Pagar Kaca Frameless', w: 200, h: 10, color: '#E0F2FE', icon: '⬛', height3d: 110, structural: false, desc: 'Pagar kaca frameless minimalis (lantai atas)' },
    { type: 'fence-wire-rope', name: 'Pagar Wire Rope', w: 200, h: 10, color: '#71717A', icon: '⬛', height3d: 110, structural: false, desc: 'Pagar wire rope vertikal modern (lantai atas)' },
    { type: 'fence-wood-slat-vertical', name: 'Pagar Kayu Slat Vertikal', w: 200, h: 10, color: '#8B6F47', icon: '⬛', height3d: 110, structural: false, desc: 'Pagar kayu slat vertikal (lantai atas)' },
    // ===== GATES / GERBANG =====
    { type: 'gate-swing', name: 'Gerbang Swing', w: 300, h: 15, color: '#3D3D3D', icon: '🚪', height3d: 200, structural: false, desc: 'Gerbang swing 2 daun' },
    { type: 'gate-sliding', name: 'Gerbang Geser', w: 400, h: 15, color: '#3D3D3D', icon: '🚪', height3d: 200, structural: false, desc: 'Gerbang geser otomatis' },
    { type: 'gate-folding', name: 'Gerbang Lipat', w: 350, h: 15, color: '#5D5D5D', icon: '🚪', height3d: 200, structural: false, desc: 'Gerbang lipat manual' },
    // ===== CARPORT & GARAGE =====
    { type: 'carport', name: 'Carport', w: 300, h: 500, color: '#A0AEC0', icon: '🚗', height3d: 250, structural: false, desc: 'Carport 1 mobil' },
    { type: 'carport-2', name: 'Carport 2 Mobil', w: 500, h: 500, color: '#A0AEC0', icon: '🚗', height3d: 250, structural: false, desc: 'Carport 2 mobil' },
    { type: 'garage-door', name: 'Pintu Garasi', w: 250, h: 15, color: '#A0AEC0', icon: '🚪', height3d: 220, structural: false, desc: 'Pintu garasi rolling' },
    // ===== LANDSCAPE =====
    { type: 'tree', name: 'Pohon', w: 200, h: 200, color: '#4A7C2E', icon: '🌳', height3d: 500, structural: false, desc: 'Pohon rindang' },
    { type: 'tree-palm', name: 'Pohon Palem', w: 150, h: 150, color: '#4A7C2E', icon: '🌴', height3d: 600, structural: false, desc: 'Pohon palem tropis' },
    { type: 'tree-small', name: 'Pohon Kecil', w: 100, h: 100, color: '#5A8A3E', icon: '🪴', height3d: 250, structural: false, desc: 'Pohon kecil/hias' },
    { type: 'bush', name: 'Semak', w: 80, h: 80, color: '#5A8A3E', icon: '🌿', height3d: 60, structural: false, desc: 'Semak hias' },
    { type: 'flower-bed', name: 'Taman Bunga', w: 200, h: 60, color: '#E91E63', icon: '🌸', height3d: 40, structural: false, desc: 'Taman bunga' },
    { type: 'grass', name: 'Rumput', w: 300, h: 300, color: '#7CB342', icon: '🌱', height3d: 5, structural: false, desc: 'Lahan rumput' },
    { type: 'swimming-pool', name: 'Kolam Renang', w: 400, h: 250, color: '#03A9F4', icon: '🏊', height3d: 150, structural: false, desc: 'Kolam renang' },
    { type: 'pool-deck', name: 'Deck Kolam', w: 500, h: 350, color: '#8B6F47', icon: '🟫', height3d: 10, structural: false, desc: 'Deck kayu kolam' },
    { type: 'gazebo', name: 'Gazebo', w: 300, h: 300, color: '#8B6F47', icon: '🏛️', height3d: 280, structural: false, desc: 'Gazebo taman' },
    { type: 'pergola', name: 'Pergola', w: 300, h: 60, color: '#6B4423', icon: '🌿', height3d: 250, structural: false, desc: 'Pergola kayu' },
    { type: 'patio', name: 'Patio', w: 300, h: 300, color: '#A8A29E', icon: '🧱', height3d: 5, structural: false, desc: 'Patio batu' },
    { type: 'deck', name: 'Deck Kayu', w: 300, h: 200, color: '#8B6F47', icon: '🟫', height3d: 15, structural: false, desc: 'Deck kayu outdoor' },
    { type: 'pathway', name: 'Jalan Setapak', w: 100, h: 300, color: '#A8A29E', icon: '🛤️', height3d: 5, structural: false, desc: 'Jalan setapak batu' },
    { type: 'driveway', name: 'Jalan Masuk', w: 300, h: 500, color: '#6B7280', icon: '🛣️', height3d: 5, structural: false, desc: 'Driveway mobil' },
    { type: 'lamp-post', name: 'Tiang Lampu', w: 30, h: 30, color: '#D4A574', icon: '💡', height3d: 350, structural: false, desc: 'Lampu taman' },
    { type: 'garden-bench', name: 'Bangku Taman', w: 150, h: 60, color: '#6B4423', icon: '🪑', height3d: 90, structural: false, desc: 'Bangku taman kayu' },
    { type: 'fountain', name: 'Air Mancur', w: 150, h: 150, color: '#03A9F4', icon: '⛲', height3d: 120, structural: false, desc: 'Air mancur taman' },
    { type: 'pond', name: 'Kolam', w: 200, h: 150, color: '#0288D1', icon: '💧', height3d: 80, structural: false, desc: 'Kolam ikan' },
    { type: 'mailbox', name: 'Kotak Surat', w: 40, h: 40, color: '#8B6F47', icon: '📮', height3d: 150, structural: false, desc: 'Kotak surat' },
  ],
  // ===== PLAFOOND / CEILING =====
  ceiling: [
    { type: 'ceiling-gypsum', name: 'Plafond Gypsum', w: 200, h: 200, color: '#F5F5F5', icon: '⬜', height3d: 5, structural: false, desc: 'Plafond gypsum standar 9mm' },
    { type: 'ceiling-gypsum-borderless', name: 'Plafond Gypsum Borderless', w: 200, h: 200, color: '#FAFAFA', icon: '⬜', height3d: 8, structural: false, desc: 'Plafond gypsum tanpa bordir, modern' },
    { type: 'ceiling-pvc', name: 'Plafond PVC', w: 200, h: 200, color: '#E5E5E5', icon: '⬜', height3d: 5, structural: false, desc: 'Plafond PVC tahan air (KM/dapur)' },
    { type: 'ceiling-wood', name: 'Plafond Kayu', w: 200, h: 200, color: '#8B6F47', icon: '🟫', height3d: 10, structural: false, desc: 'Plafond kayu lambring klasik' },
    { type: 'ceiling-metal-deck', name: 'Plafond Metal Deck', w: 200, h: 200, color: '#9CA3AF', icon: '⬜', height3d: 5, structural: false, desc: 'Plafond metal deck industrial' },
    { type: 'ceiling-exposed', name: 'Plafond Exposed (Buka)', w: 200, h: 200, color: '#78716C', icon: '⬛', height3d: 0, structural: false, desc: 'Tanpa plafond, balok terlihat (industrial)' },
    { type: 'ceiling-coffered', name: 'Plafond Coffered', w: 200, h: 200, color: '#F5F5DC', icon: '🔲', height3d: 20, structural: false, desc: 'Plafond coffered dengan kotak ornamen' },
    { type: 'ceiling-drop-tbar', name: 'Plafond Drop T-Bar', w: 200, h: 200, color: '#F5F5F5', icon: '⬜', height3d: 10, structural: false, desc: 'Plafond drop ceiling grid T-bar (kantor)' },
    { type: 'ceiling-stretch', name: 'Plafond Stretch (Barrisol)', w: 200, h: 200, color: '#FFFFFF', icon: '⬜', height3d: 5, structural: false, desc: 'Plafond stretch PVC modern mewah' },
    { type: 'ceiling-cove', name: 'Plafond Cove (Indirect)', w: 200, h: 200, color: '#FAFAFA', icon: '⬜', height3d: 15, structural: false, desc: 'Plafond cove dengan LED strip indirect' },
  ],
  // ===== LIGHTING / LAMPU =====
  lighting: [
    { type: 'light-ceiling', name: 'Lampu Plafon', w: 40, h: 40, color: '#FFEB99', icon: '💡', height3d: 15, structural: false, desc: 'Lampu plafon bulat 40cm' },
    { type: 'light-pendant', name: 'Lampu Gantung (Pendant)', w: 30, h: 30, color: '#FFC857', icon: '💡', height3d: 60, structural: false, desc: 'Lampu gantung pendant 30cm' },
    { type: 'light-chandelier', name: 'Lampu Kristal (Chandelier)', w: 80, h: 80, color: '#FFE4B5', icon: '🕯️', height3d: 80, structural: false, desc: 'Chandelier kristal mewah' },
    { type: 'light-wall-sconce', name: 'Lampu Dinding (Sconce)', w: 25, h: 10, color: '#FFD580', icon: '💡', height3d: 35, structural: false, desc: 'Lampu dinding sconce dekoratif' },
    { type: 'light-table', name: 'Lampu Meja', w: 30, h: 30, color: '#FFE4B5', icon: '🛋️', height3d: 50, structural: false, desc: 'Lampu meja belajar/kerja' },
    { type: 'light-floor', name: 'Lampu Lantai (Floor Lamp)', w: 35, h: 35, color: '#FFE4B5', icon: '💡', height3d: 160, structural: false, desc: 'Lampu lantai standing 160cm' },
    { type: 'light-led-strip', name: 'Lampu LED Strip', w: 200, h: 5, color: '#FFEB99', icon: '➖', height3d: 5, structural: false, desc: 'LED strip untuk indirect lighting' },
    { type: 'light-spotlight', name: 'Lampu Sorot (Spotlight)', w: 15, h: 15, color: '#FFFFFF', icon: '🔦', height3d: 10, structural: false, desc: 'Lampu sorot LED 5W' },
    { type: 'light-track', name: 'Lampu Track (Spot Track)', w: 100, h: 10, color: '#1F2937', icon: '➖', height3d: 10, structural: false, desc: 'Track light dengan 3-4 spot' },
    { type: 'light-decorative', name: 'Lampu Hias', w: 40, h: 40, color: '#FFC857', icon: '✨', height3d: 50, structural: false, desc: 'Lampu hias dekoratif ruang tamu' },
    { type: 'light-garden', name: 'Lampu Taman', w: 20, h: 20, color: '#FFEB99', icon: '🌿', height3d: 60, structural: false, desc: 'Lampu taman outdoor IP65' },
    { type: 'light-bedside', name: 'Lampu Tidur', w: 25, h: 25, color: '#FFD580', icon: '🛏️', height3d: 45, structural: false, desc: 'Lampu meja tidur kecil' },
    { type: 'light-emergency', name: 'Lampu Emergency', w: 30, h: 10, color: '#FF0000', icon: '🚨', height3d: 10, structural: false, desc: 'Lampu emergency battery backup' },
    { type: 'light-industrial', name: 'Lampu Industrial', w: 30, h: 30, color: '#1F2937', icon: '💡', height3d: 40, structural: false, desc: 'Lampu industrial pendant steel' },
    { type: 'light-downlight', name: 'Lampu Downlight', w: 12, h: 12, color: '#FFFFFF', icon: '⭕', height3d: 8, structural: false, desc: 'Downlight LED 7W tanam plafond' },
    { type: 'light-bulkhead', name: 'Lampu Bulkhead', w: 20, h: 20, color: '#F5F5F5', icon: '⬜', height3d: 15, structural: false, desc: 'Lampu bulkhead outdoor/terrace' },
    { type: 'light-pool', name: 'Lampu Kolam', w: 15, h: 15, color: '#BEE3F8', icon: '🏊', height3d: 5, structural: false, desc: 'Lampu kolam renang underwater' },
    { type: 'light-flood', name: 'Lampu Floodlight', w: 25, h: 25, color: '#FFFFFF', icon: '🔦', height3d: 20, structural: false, desc: 'Floodlight LED 50W halaman' },
  ],
  // ===== LISPLANG & TALI AIR (TRIM/GUTTER) =====
  trim: [
    { type: 'lisplang-wood', name: 'Lisplang Kayu', w: 200, h: 10, color: '#8B6F47', icon: '➖', height3d: 25, structural: false, desc: 'Lisplang kayu 2x15 cm' },
    { type: 'lisplang-concrete', name: 'Lisplang Beton', w: 200, h: 10, color: '#A8A29E', icon: '➖', height3d: 25, structural: false, desc: 'Lisplang beton dicor' },
    { type: 'lisplang-pvc', name: 'Lisplang PVC', w: 200, h: 10, color: '#F5F5F5', icon: '➖', height3d: 25, structural: false, desc: 'Lisplang PVC tahan air' },
    { type: 'lisplang-aluminum', name: 'Lisplang Aluminium', w: 200, h: 10, color: '#9CA3AF', icon: '➖', height3d: 25, structural: false, desc: 'Lisplang aluminium 1.2mm' },
    { type: 'lisplang-modern', name: 'Lisplang Modern', w: 200, h: 10, color: '#1F2937', icon: '➖', height3d: 30, structural: false, desc: 'Lisplang modern minimalis' },
    { type: 'lisplang-klasik', name: 'Lisplang Klasik', w: 200, h: 10, color: '#5D3A1A', icon: '➖', height3d: 35, structural: false, desc: 'Lisplang klasik dengan ukiran' },
    { type: 'tali-air-pvc', name: 'Tali Air PVC', w: 200, h: 15, color: '#9CA3AF', icon: '🟦', height3d: 15, structural: false, desc: 'Tali air (gutter) PVC 4 inch' },
    { type: 'tali-air-aluminum', name: 'Tali Air Aluminium', w: 200, h: 15, color: '#D4D4D4', icon: '🟦', height3d: 15, structural: false, desc: 'Tali air aluminium 5 inch' },
    { type: 'tali-air-concrete', name: 'Tali Air Beton', w: 200, h: 20, color: '#A8A29E', icon: '🟦', height3d: 20, structural: false, desc: 'Tali air beton dicor permanen' },
    { type: 'tali-air-galvanized', name: 'Tali Air Galvanis', w: 200, h: 15, color: '#71717A', icon: '🟦', height3d: 15, structural: false, desc: 'Tali air baja galvanis anti karat' },
    { type: 'tali-air-hidden', name: 'Tali Air Hidden', w: 200, h: 15, color: '#1F2937', icon: '➖', height3d: 10, structural: false, desc: 'Tali air tersembunyi (concealed gutter)' },
    { type: 'tali-air-copper', name: 'Tali Air Tembaga', w: 200, h: 15, color: '#B87333', icon: '🟦', height3d: 15, structural: false, desc: 'Tali air tembaga premium (anti karat seumur hidup)' },
    { type: 'list-kayu', name: 'List Kayu', w: 200, h: 5, color: '#8B6F47', icon: '➖', height3d: 5, structural: false, desc: 'List kayu untuk dinding/plafon' },
    { type: 'list-aluminum', name: 'List Aluminium', w: 200, h: 5, color: '#9CA3AF', icon: '➖', height3d: 5, structural: false, desc: 'List aluminium dekoratif' },
  ],
  // ===== VENTILASI UDARA =====
  ventilation: [
    { type: 'vent-wall', name: 'Ventilasi Dinding', w: 40, h: 40, color: '#9CA3AF', icon: '🌀', height3d: 40, structural: false, desc: 'Ventilasi dinding louvered 40x40' },
    { type: 'vent-roof', name: 'Ventilasi Atap', w: 50, h: 50, color: '#71717A', icon: '🌀', height3d: 30, structural: false, desc: 'Ventilasi atap statis 50cm' },
    { type: 'vent-turbine', name: 'Ventilasi Turbin', w: 50, h: 50, color: '#6B7280', icon: '🌀', height3d: 60, structural: false, desc: 'Ventilasi turbin berputar angin' },
    { type: 'vent-kitchen-hood', name: 'Kitchen Hood', w: 90, h: 20, color: '#9CA3AF', icon: '🍳', height3d: 80, structural: false, desc: 'Kitchen hood extractor dapur' },
    { type: 'vent-bathroom-exhaust', name: 'Bathroom Exhaust', w: 25, h: 25, color: '#9CA3AF', icon: '🚿', height3d: 25, structural: false, desc: 'Exhaust fan kamar mandi' },
    { type: 'vent-gable', name: 'Ventilasi Gable (Louvered)', w: 80, h: 80, color: '#78716C', icon: '🌀', height3d: 80, structural: false, desc: 'Ventilasi gable triangle louvered' },
    { type: 'vent-ridge', name: 'Ventilasi Ridge', w: 100, h: 15, color: '#71717A', icon: '➖', height3d: 20, structural: false, desc: 'Ventilasi ridge di puncak atap' },
    { type: 'vent-soffit', name: 'Ventilasi Soffit', w: 100, h: 10, color: '#9CA3AF', icon: '➖', height3d: 10, structural: false, desc: 'Ventilasi soffit bawah atap' },
    { type: 'vent-louver-wall', name: 'Louver Dinding', w: 100, h: 60, color: '#9CA3AF', icon: '🌀', height3d: 60, structural: false, desc: 'Louver dinding besar 100x60' },
    { type: 'vent-mushroom', name: 'Ventilasi Mushroom', w: 35, h: 35, color: '#6B7280', icon: '🍄', height3d: 35, structural: false, desc: 'Ventilasi mushroom atap' },
    { type: 'vent-static', name: 'Ventilasi Static', w: 40, h: 40, color: '#71717A', icon: '⬛', height3d: 30, structural: false, desc: 'Ventilasi static (tanpa motor)' },
    { type: 'vent-solar', name: 'Ventilasi Solar', w: 50, h: 50, color: '#1E3A5F', icon: '☀️', height3d: 40, structural: false, desc: 'Ventilasi tenaga surya otomatis' },
    { type: 'vent-ac', name: 'Lubang AC (Split)', w: 80, h: 30, color: '#1F2937', icon: '❄️', height3d: 30, structural: false, desc: 'Lubang AC split + outdoor unit' },
    { type: 'vent-exhaust-fan', name: 'Exhaust Fan Industrial', w: 60, h: 60, color: '#374151', icon: '🌀', height3d: 30, structural: false, desc: 'Exhaust fan industrial besar' },
  ],
  // ===== LANTAI / FLOORING =====
  flooring: [
    { type: 'floor-ceramic-30', name: 'Keramik 30x30', w: 200, h: 200, color: '#E5E5E5', icon: '⬜', height3d: 5, structural: false, desc: 'Keramik 30x30cm standar' },
    { type: 'floor-ceramic-40', name: 'Keramik 40x40', w: 200, h: 200, color: '#E5E5E5', icon: '⬜', height3d: 5, structural: false, desc: 'Keramik 40x40cm' },
    { type: 'floor-ceramic-60', name: 'Keramik 60x60', w: 200, h: 200, color: '#D4D4D4', icon: '⬜', height3d: 6, structural: false, desc: 'Keramik 60x60cm modern' },
    { type: 'floor-granite-60', name: 'Granit 60x60', w: 200, h: 200, color: '#A8A29E', icon: '⬜', height3d: 8, structural: false, desc: 'Granit 60x60cm premium' },
    { type: 'floor-granite-80', name: 'Granit 80x80', w: 200, h: 200, color: '#78716C', icon: '⬜', height3d: 10, structural: false, desc: 'Granit 80x80cm luxury' },
    { type: 'floor-granite-polished', name: 'Granit Polished', w: 200, h: 200, color: '#1F2937', icon: '⬛', height3d: 10, structural: false, desc: 'Granit polished hitam mewah' },
    { type: 'floor-granite-honed', name: 'Granit Honed', w: 200, h: 200, color: '#57534E', icon: '⬛', height3d: 10, structural: false, desc: 'Granit honed matte (anti slip)' },
    { type: 'floor-marble', name: 'Marmer', w: 200, h: 200, color: '#F5F5DC', icon: '⬜', height3d: 10, structural: false, desc: 'Marmer alam mewah' },
    { type: 'floor-vinyl', name: 'Vinyl Flooring', w: 200, h: 200, color: '#8B6F47', icon: '🟫', height3d: 3, structural: false, desc: 'Vinyl flooring murah & tahan air' },
    { type: 'floor-parquet', name: 'Parquet Kayu', w: 200, h: 200, color: '#6B4423', icon: '🟫', height3d: 10, structural: false, desc: 'Parquet kayu solid jati' },
    { type: 'floor-laminate', name: 'Laminate Flooring', w: 200, h: 200, color: '#A0826D', icon: '🟫', height3d: 8, structural: false, desc: 'Laminate flooring HDF 12mm' },
    { type: 'floor-terrazzo', name: 'Terrazzo', w: 200, h: 200, color: '#A8A29E', icon: '⬜', height3d: 15, structural: false, desc: 'Terrazzo klasik (semen + batu)' },
    { type: 'floor-natural-stone', name: 'Batu Alam', w: 200, h: 200, color: '#78716C', icon: '🪨', height3d: 12, structural: false, desc: 'Batu alam untuk taman/carport' },
    { type: 'floor-slate', name: 'Slate', w: 200, h: 200, color: '#374151', icon: '⬛', height3d: 10, structural: false, desc: 'Slate alam anti slip' },
    { type: 'floor-bathroom-tile', name: 'Tegel Kamar Mandi', w: 200, h: 200, color: '#BEE3F8', icon: '🚿', height3d: 5, structural: false, desc: 'Tegel anti slip kamar mandi 25x25' },
    { type: 'floor-kitchen-tile', name: 'Tegel Dapur', w: 200, h: 200, color: '#9CA3AF', icon: '🍳', height3d: 6, structural: false, desc: 'Tegel dapur tahan noda' },
    { type: 'floor-mosaic', name: 'Mosaik', w: 200, h: 200, color: '#E91E63', icon: '🎨', height3d: 5, structural: false, desc: 'Mosaik keramik kecil dekoratif' },
    { type: 'floor-hardwood', name: 'Hardwood', w: 200, h: 200, color: '#5D3A1A', icon: '🟫', height3d: 15, structural: false, desc: 'Hardwood jati solid 15mm' },
    { type: 'floor-bamboo', name: 'Bamboo Flooring', w: 200, h: 200, color: '#A0826D', icon: '🎋', height3d: 10, structural: false, desc: 'Bamboo flooring eco-friendly' },
    { type: 'floor-concrete', name: 'Lantai Beton', w: 200, h: 200, color: '#A8A29E', icon: '⬛', height3d: 80, structural: false, desc: 'Lantai beton dicor industrial' },
    { type: 'floor-epoxy', name: 'Lantai Epoxy', w: 200, h: 200, color: '#1E3A5F', icon: '⬛', height3d: 3, structural: false, desc: 'Lantai epoxy mengkilap (garasi)' },
    { type: 'floor-carpet-tile', name: 'Carpet Tile', w: 200, h: 200, color: '#6B4423', icon: '🟫', height3d: 6, structural: false, desc: 'Carpet tile 50x50 (kantor)' },
    { type: 'floor-tatami', name: 'Tatami', w: 200, h: 200, color: '#D4A574', icon: '⬜', height3d: 6, structural: false, desc: 'Tatami Jepang (tatami room)' },
    { type: 'floor-marble-cream', name: 'Marmer Cream', w: 200, h: 200, color: '#F5DEB3', icon: '⬜', height3d: 12, structural: false, desc: 'Marmer crema marfil mewah' },
    { type: 'floor-wood-deck-tile', name: 'Wood Deck Tile', w: 200, h: 200, color: '#8B6F47', icon: '🟫', height3d: 20, structural: false, desc: 'Wood deck tile outdoor 30x30' },
  ],
  // ===== SANITARY & PLUMBING =====
  sanitary: [
    { type: 'closet-sitting', name: 'Closet Duduk', w: 40, h: 60, color: '#FFFFFF', icon: '🚽', height3d: 40, structural: false, desc: 'Closet duduk (toilet bowl) putih' },
    { type: 'closet-squat', name: 'Closet Jongkok', w: 40, h: 60, color: '#FFFFFF', icon: '🚽', height3d: 25, structural: false, desc: 'Closet jongkok porselen' },
    { type: 'closet-one-piece', name: 'Closet One Piece', w: 40, h: 65, color: '#FAFAFA', icon: '🚽', height3d: 45, structural: false, desc: 'Closet one piece premium' },
    { type: 'closet-smart', name: 'Closet Smart (Washlet)', w: 40, h: 65, color: '#F5F5F5', icon: '🚽', height3d: 48, structural: false, desc: 'Smart toilet dengan washlet (Jepang)' },
    { type: 'bidet', name: 'Bidet', w: 40, h: 60, color: '#FFFFFF', icon: '🚿', height3d: 40, structural: false, desc: 'Bidet porselen terpisah' },
    { type: 'urinoir', name: 'Urinoir', w: 35, h: 30, color: '#FFFFFF', icon: '🚽', height3d: 60, structural: false, desc: 'Urinoir dinding porselen' },
    { type: 'bathtub-oval', name: 'Bath Tub Oval', w: 80, h: 170, color: '#FFFFFF', icon: '🛁', height3d: 55, structural: false, desc: 'Bath tub oval 170x80' },
    { type: 'bathtub-corner', name: 'Bath Tub Sudut', w: 120, h: 120, color: '#FFFFFF', icon: '🛁', height3d: 55, structural: false, desc: 'Bath tub sudut segitiga' },
    { type: 'bathtub-jacuzzi', name: 'Jacuzzi/Whirlpool', w: 90, h: 180, color: '#F5F5F5', icon: '🛁', height3d: 60, structural: false, desc: 'Jacuzzi whirlpool dengan jet' },
    { type: 'shower-enclosure', name: 'Shower Enclosure Kaca', w: 90, h: 90, color: '#BEE3F8', icon: '🚿', height3d: 200, structural: false, desc: 'Shower enclosure kaca 8mm' },
    { type: 'shower-pan', name: 'Shower Pan', w: 80, h: 80, color: '#9CA3AF', icon: '🚿', height3d: 5, structural: false, desc: 'Shower pan base stainless' },
    { type: 'shower-head', name: 'Shower Head', w: 25, h: 25, color: '#9CA3AF', icon: '🚿', height3d: 15, structural: false, desc: 'Shower head dinding/langit' },
    { type: 'sink-kitchen-double', name: 'Kitchen Sink Double', w: 80, h: 50, color: '#9CA3AF', icon: '🚿', height3d: 20, structural: false, desc: 'Kitchen sink double bowl stainless' },
    { type: 'sink-kitchen-single', name: 'Kitchen Sink Single', w: 60, h: 50, color: '#9CA3AF', icon: '🚿', height3d: 20, structural: false, desc: 'Kitchen sink single bowl stainless' },
    { type: 'sink-laundry', name: 'Bak Cuci Laundry', w: 70, h: 50, color: '#9CA3AF', icon: '🚿', height3d: 30, structural: false, desc: 'Bak cuci laundry stainless' },
    { type: 'floor-drain', name: 'Floor Drain', w: 15, h: 15, color: '#6B7280', icon: '⭕', height3d: 5, structural: false, desc: 'Lubang lantai (floor drain)' },
    { type: 'water-tap', name: 'Kran Air', w: 5, h: 5, color: '#9CA3AF', icon: '🚿', height3d: 15, structural: false, desc: 'Kran air dinding/single lever' },
    { type: 'water-heater-electric', name: 'Water Heater Listrik', w: 35, h: 35, color: '#F5F5F5', icon: '🔌', height3d: 50, structural: false, desc: 'Water heater electric 10L' },
    { type: 'water-heater-gas', name: 'Water Heater Gas', w: 40, h: 50, color: '#E5E5E5', icon: '🔥', height3d: 60, structural: false, desc: 'Water heater gas 10L outdoor' },
    { type: 'toren-air', name: 'Toren Air (500L)', w: 60, h: 60, color: '#1E3A5F', icon: '🛢️', height3d: 130, structural: false, desc: 'Toren air 500L tangki atas' },
    { type: 'toren-air-1000', name: 'Toren Air (1000L)', w: 80, h: 80, color: '#1E3A5F', icon: '🛢️', height3d: 150, structural: false, desc: 'Toren air 1000L tandon besar' },
    { type: 'septic-tank', name: 'Septic Tank', w: 100, h: 150, color: '#1F2937', icon: '🛢️', height3d: 150, structural: false, desc: 'Septic tank BIO 1m³' },
    { type: 'sumur-air', name: 'Sumur Air', w: 100, h: 100, color: '#57534E', icon: '⛲', height3d: 80, structural: false, desc: 'Sumur air tanah + pompa' },
    { type: 'pump-water', name: 'Pompa Air', w: 30, h: 30, color: '#374151', icon: '⚙️', height3d: 40, structural: false, desc: 'Pompa air booster 100W' },
  ],
  // ===== ELECTRICAL =====
  electrical: [
    { type: 'outlet-single', name: 'Stop Kontak 1 Gang', w: 8, h: 8, color: '#FFFFFF', icon: '🔌', height3d: 5, structural: false, desc: 'Stop kontak 1 gang dinding' },
    { type: 'outlet-double', name: 'Stop Kontak 2 Gang', w: 8, h: 15, color: '#FFFFFF', icon: '🔌', height3d: 5, structural: false, desc: 'Stop kontak 2 gang dinding' },
    { type: 'outlet-quad', name: 'Stop Kontak 4 Gang', w: 15, h: 15, color: '#FFFFFF', icon: '🔌', height3d: 5, structural: false, desc: 'Stop kontak 4 gang dinding' },
    { type: 'outlet-floor', name: 'Stop Kontak Lantai', w: 10, h: 10, color: '#1F2937', icon: '🔌', height3d: 5, structural: false, desc: 'Stop kontak tanam lantai' },
    { type: 'outlet-waterproof', name: 'Stop Kontak Waterproof', w: 10, h: 10, color: '#9CA3AF', icon: '🔌', height3d: 8, structural: false, desc: 'Stop kontak防水 IP66 (outdoor/KM)' },
    { type: 'switch-single', name: 'Saklar 1 Gang', w: 8, h: 8, color: '#FFFFFF', icon: '💡', height3d: 5, structural: false, desc: 'Saklar 1 gang tunggal' },
    { type: 'switch-double', name: 'Saklar 2 Gang', w: 8, h: 15, color: '#FFFFFF', icon: '💡', height3d: 5, structural: false, desc: 'Saklar 2 gang' },
    { type: 'switch-triple', name: 'Saklar 3 Gang', w: 8, h: 22, color: '#FFFFFF', icon: '💡', height3d: 5, structural: false, desc: 'Saklar 3 gang' },
    { type: 'switch-dimmer', name: 'Saklar Dimmer', w: 8, h: 8, color: '#F5F5F5', icon: '💡', height3d: 5, structural: false, desc: 'Saklar dimmer (atur terang lampu)' },
    { type: 'switch-automatic', name: 'Saklar Otomatis (PIR)', w: 10, h: 10, color: '#FFFFFF', icon: '🤖', height3d: 8, structural: false, desc: 'Saklar sensor gerak PIR' },
    { type: 'mcb-panel', name: 'Panel MCB', w: 30, h: 40, color: '#374151', icon: '⚡', height3d: 12, structural: false, desc: 'Panel MCB distribusi 8 modul' },
    { type: 'mcb-panel-large', name: 'Panel MCB Besar', w: 40, h: 60, color: '#1F2937', icon: '⚡', height3d: 12, structural: false, desc: 'Panel MCB 16 modul + RCCB' },
    { type: 'doorbell', name: 'Bel Rumah', w: 12, h: 5, color: '#FFFFFF', icon: '🔔', height3d: 8, structural: false, desc: 'Bel rumah video interkom' },
    { type: 'cctv', name: 'CCTV Camera', w: 10, h: 10, color: '#1F2937', icon: '📷', height3d: 8, structural: false, desc: 'Kamera CCTV dome 2MP' },
    { type: 'cctv-bullet', name: 'CCTV Bullet', w: 15, h: 8, color: '#1F2937', icon: '📷', height3d: 8, structural: false, desc: 'Kamera CCTV bullet outdoor' },
    { type: 'intercom', name: 'Interkom', w: 15, h: 20, color: '#374151', icon: '📞', height3d: 8, structural: false, desc: 'Interkom video gate' },
    { type: 'motion-sensor', name: 'Sensor Gerak', w: 10, h: 10, color: '#FFFFFF', icon: '📡', height3d: 5, structural: false, desc: 'Sensor gerak PIR (lampu otomatis)' },
    { type: 'smoke-detector', name: 'Smoke Detector', w: 12, h: 12, color: '#FFFFFF', icon: '🚨', height3d: 4, structural: false, desc: 'Smoke detector plafon' },
    { type: 'antenna-tv', name: 'Antena TV', w: 30, h: 5, color: '#374151', icon: '📺', height3d: 50, structural: false, desc: 'Antena TV UHF outdoor' },
    { type: 'smart-hub', name: 'Smart Home Hub', w: 12, h: 12, color: '#1F2937', icon: '🏠', height3d: 4, structural: false, desc: 'Smart home hub (Google/Alexa)' },
    { type: 'ev-charger', name: 'EV Charger', w: 20, h: 10, color: '#1F2937', icon: '🔋', height3d: 35, structural: false, desc: 'Wallbox EV charger 7kW' },
  ],
  // ===== APPLIANCES =====
  appliances: [
    { type: 'ac-split-1pk', name: 'AC Split 1 PK', w: 80, h: 25, color: '#F5F5F5', icon: '❄️', height3d: 30, structural: false, desc: 'AC split 1 PK low watt inverter' },
    { type: 'ac-split-2pk', name: 'AC Split 2 PK', w: 100, h: 30, color: '#F5F5F5', icon: '❄️', height3d: 30, structural: false, desc: 'AC split 2 PK inverter' },
    { type: 'ac-split-half-pk', name: 'AC Split ½ PK', w: 70, h: 25, color: '#F5F5F5', icon: '❄️', height3d: 28, structural: false, desc: 'AC split ½ PK untuk kamar kecil' },
    { type: 'ac-cassette', name: 'AC Cassette 4 Way', w: 90, h: 90, color: '#F5F5F5', icon: '❄️', height3d: 30, structural: false, desc: 'AC cassette 4 way ceiling' },
    { type: 'ac-outdoor', name: 'AC Outdoor Unit', w: 80, h: 50, color: '#9CA3AF', icon: '❄️', height3d: 60, structural: false, desc: 'AC outdoor unit compressor' },
    { type: 'ceiling-fan', name: 'Kipas Plafon', w: 120, h: 120, color: '#8B6F47', icon: '🌀', height3d: 35, structural: false, desc: 'Kipas angin plafon 48 inch + lampu' },
    { type: 'fan-stand', name: 'Kipas Berdiri', w: 40, h: 40, color: '#374151', icon: '🌀', height3d: 120, structural: false, desc: 'Kipas berdiri (stand fan) 16 inch' },
    { type: 'fan-table', name: 'Kipas Meja', w: 35, h: 35, color: '#374151', icon: '🌀', height3d: 40, structural: false, desc: 'Kipas meja 12 inch' },
    { type: 'fan-wall', name: 'Kipas Dinding', w: 40, h: 40, color: '#374151', icon: '🌀', height3d: 25, structural: false, desc: 'Kipas dinding 16 inch' },
    { type: 'fan-exhaust', name: 'Exhaust Fan', w: 40, h: 40, color: '#9CA3AF', icon: '🌀', height3d: 15, structural: false, desc: 'Exhaust fan plafon/dinding' },
    { type: 'tv-43', name: 'TV LED 43"', w: 100, h: 8, color: '#1F2937', icon: '📺', height3d: 60, structural: false, desc: 'TV LED 43 inch Smart TV' },
    { type: 'tv-55', name: 'TV LED 55"', w: 125, h: 8, color: '#1F2937', icon: '📺', height3d: 75, structural: false, desc: 'TV LED 55 inch 4K Smart' },
    { type: 'tv-65', name: 'TV LED 65"', w: 145, h: 8, color: '#1F2937', icon: '📺', height3d: 85, structural: false, desc: 'TV LED 65 inch 4K Premium' },
    { type: 'home-theater', name: 'Home Theater', w: 100, h: 40, color: '#1F2937', icon: '🔊', height3d: 40, structural: false, desc: 'Home theater 5.1 surround' },
    { type: 'speaker-stand', name: 'Speaker Floor', w: 25, h: 25, color: '#1F2937', icon: '🔊', height3d: 100, structural: false, desc: 'Speaker floor standing 3 way' },
    { type: 'washing-machine', name: 'Mesin Cuci Front', w: 60, h: 60, color: '#F5F5F5', icon: '🧺', height3d: 85, structural: false, desc: 'Mesin cuci front load 7kg' },
    { type: 'washing-top', name: 'Mesin Cuci Top', w: 55, h: 55, color: '#F5F5F5', icon: '🧺', height3d: 95, structural: false, desc: 'Mesin cuci top load 8kg 1 tabung' },
    { type: 'washing-2tub', name: 'Mesin Cuci 2 Tabung', w: 70, h: 50, color: '#E5E5E5', icon: '🧺', height3d: 90, structural: false, desc: 'Mesin cuci 2 tabung 7kg' },
    { type: 'dryer', name: 'Dryer', w: 60, h: 60, color: '#F5F5F5', icon: '👕', height3d: 85, structural: false, desc: 'Mesin pengering baju (dryer)' },
    { type: 'fridge-2pintu', name: 'Kulkas 2 Pintu', w: 70, h: 65, color: '#9CA3AF', icon: '🧊', height3d: 170, structural: false, desc: 'Kulkas 2 pintu 250L no frost' },
    { type: 'fridge-1pintu', name: 'Kulkas 1 Pintu', w: 55, h: 60, color: '#9CA3AF', icon: '🧊', height3d: 100, structural: false, desc: 'Kulkas 1 pintu 100L' },
    { type: 'fridge-side-by-side', name: 'Kulkas Side-by-Side', w: 90, h: 80, color: '#9CA3AF', icon: '🧊', height3d: 180, structural: false, desc: 'Kulkas side-by-side 500L inverter' },
    { type: 'microwave', name: 'Microwave', w: 50, h: 40, color: '#1F2937', icon: '🍱', height3d: 30, structural: false, desc: 'Microwave oven 20L' },
    { type: 'dishwasher', name: 'Dishwasher', w: 60, h: 60, color: '#9CA3AF', icon: '🍽️', height3d: 85, structural: false, desc: 'Mesin cuci piring 12 settings' },
    { type: 'wine-cooler', name: 'Wine Cooler', w: 40, h: 50, color: '#1F2937', icon: '🍷', height3d: 90, structural: false, desc: 'Wine cooler 18 botol' },
    { type: 'dispenser', name: 'Dispenser Air', w: 30, h: 30, color: '#F5F5F5', icon: '💧', height3d: 100, structural: false, desc: 'Dispenser air panas/dingin' },
    { type: 'water-purifier', name: 'Water Purifier', w: 25, h: 25, color: '#F5F5F5', icon: '💧', height3d: 45, structural: false, desc: 'Water purifier RO 6 stage' },
    { type: 'vacuum', name: 'Vacuum Cleaner', w: 30, h: 30, color: '#9CA3AF', icon: '🧹', height3d: 30, structural: false, desc: 'Vacuum cleaner canister' },
  ],
  // ===== DEKORASI INTERIOR =====
  decor: [
    { type: 'painting-medium', name: 'Lukisan Sedang', w: 60, h: 5, color: '#8B6F47', icon: '🖼️', height3d: 80, structural: false, desc: 'Lukisan dinding 60x80cm' },
    { type: 'painting-large', name: 'Lukisan Besar', w: 100, h: 5, color: '#8B6F47', icon: '🖼️', height3d: 120, structural: false, desc: 'Lukisan dinding 100x120cm' },
    { type: 'painting-set', name: 'Set Lukisan (3 Panel)', w: 150, h: 5, color: '#8B6F47', icon: '🖼️', height3d: 90, structural: false, desc: 'Set 3 lukisan modular' },
    { type: 'photo-frame', name: 'Bingkai Foto', w: 30, h: 3, color: '#8B6F47', icon: '🖼️', height3d: 40, structural: false, desc: 'Bingkai foto 30x40cm' },
    { type: 'photo-wall', name: 'Photo Wall Set', w: 100, h: 5, color: '#D4A574', icon: '🖼️', height3d: 80, structural: false, desc: 'Set 6 bingkai foto gallery wall' },
    { type: 'vase-small', name: 'Vas Bunga Kecil', w: 15, h: 15, color: '#E91E63', icon: '🏺', height3d: 25, structural: false, desc: 'Vas bunga keramik kecil' },
    { type: 'vase-large', name: 'Vas Bunga Besar', w: 30, h: 30, color: '#1F2937', icon: '🏺', height3d: 80, structural: false, desc: 'Vas bunga besar lantai 80cm' },
    { type: 'vase-floor', name: 'Vas Lantai (Floor Vase)', w: 40, h: 40, color: '#5D3A1A', icon: '🏺', height3d: 100, structural: false, desc: 'Vas lantai tinggi dekoratif' },
    { type: 'mirror-round', name: 'Cermin Bulat', w: 60, h: 5, color: '#BEE3F8', icon: '🪞', height3d: 60, structural: false, desc: 'Cermin bulat dinding 60cm' },
    { type: 'mirror-full', name: 'Cermin Full Body', w: 50, h: 5, color: '#BEE3F8', icon: '🪞', height3d: 180, structural: false, desc: 'Cermin full body 50x180' },
    { type: 'mirror-decorative', name: 'Cermin Hias', w: 80, h: 5, color: '#D4A574', icon: '🪞', height3d: 100, structural: false, desc: 'Cermin hias dengan frame ornamen' },
    { type: 'curtain-sheer', name: 'Tirai Sheer', w: 200, h: 5, color: '#FAFAFA', icon: '🪟', height3d: 250, structural: false, desc: 'Tirai sheer putih tipis' },
    { type: 'curtain-blackout', name: 'Tirai Blackout', w: 200, h: 5, color: '#1F2937', icon: '🪟', height3d: 250, structural: false, desc: 'Tirai blackout gelap (anti cahaya)' },
    { type: 'curtain-velvet', name: 'Tirai Velvet', w: 200, h: 5, color: '#7C2D12', icon: '🪟', height3d: 250, structural: false, desc: 'Tirai velvet mewah' },
    { type: 'blind-vertical', name: 'Blind Vertikal', w: 150, h: 5, color: '#F5F5F5', icon: '🪟', height3d: 220, structural: false, desc: 'Vertical blind (venetian)' },
    { type: 'blind-horizontal', name: 'Blind Horizontal', w: 150, h: 5, color: '#F5F5F5', icon: '🪟', height3d: 180, structural: false, desc: 'Horizontal blind kayu/aluminium' },
    { type: 'blind-roller', name: 'Roller Blind', w: 150, h: 5, color: '#9CA3AF', icon: '🪟', height3d: 200, structural: false, desc: 'Roller blind minimalis' },
    { type: 'rug-large', name: 'Karpet Besar', w: 250, h: 250, color: '#7C2D12', icon: '🟫', height3d: 3, structural: false, desc: 'Karpet 250x250cm' },
    { type: 'rug-runner', name: 'Karpet Runner', w: 80, h: 250, color: '#A0826D', icon: '🟫', height3d: 3, structural: false, desc: 'Karpet runner lorong/tangga' },
    { type: 'rug-round', name: 'Karpet Bulat', w: 200, h: 200, color: '#5D3A1A', icon: '⭕', height3d: 3, structural: false, desc: 'Karpet bulat 200cm' },
    { type: 'plant-indoor', name: 'Tanaman Indoor', w: 40, h: 40, color: '#4A7C2E', icon: '🪴', height3d: 80, structural: false, desc: 'Tanaman hias indoor pot' },
    { type: 'plant-tall', name: 'Tanaman Tinggi', w: 50, h: 50, color: '#4A7C2E', icon: '🪴', height3d: 180, structural: false, desc: 'Tanaman hias tinggi (monstera/palem)' },
    { type: 'plant-hanging', name: 'Tanaman Gantung', w: 30, h: 30, color: '#4A7C2E', icon: '🌿', height3d: 60, structural: false, desc: 'Tanaman gantung pot' },
    { type: 'sculpture', name: 'Patung Dekoratif', w: 30, h: 30, color: '#D4A574', icon: '🗿', height3d: 80, structural: false, desc: 'Patung dekoratif abstrak' },
    { type: 'wall-clock', name: 'Jam Dinding', w: 30, h: 3, color: '#1F2937', icon: '🕐', height3d: 30, structural: false, desc: 'Jam dinding 30cm' },
    { type: 'candle-set', name: 'Set Lilin Hias', w: 20, h: 20, color: '#FFC857', icon: '🕯️', height3d: 15, structural: false, desc: 'Set lilin hias aromaterapi' },
    { type: 'book-stack', name: 'Tumpukan Buku', w: 40, h: 30, color: '#8B6F47', icon: '📚', height3d: 25, structural: false, desc: 'Tumpukan buku dekoratif' },
  ],
  // ===== WALL FINISHES =====
  wallfinish: [
    { type: 'wall-paint-white', name: 'Cat Dinding Putih', w: 200, h: 200, color: '#FAFAFA', icon: '🎨', height3d: 1, structural: false, desc: 'Cat dinding warna putih' },
    { type: 'wall-paint-cream', name: 'Cat Dinding Cream', w: 200, h: 200, color: '#F5DEB3', icon: '🎨', height3d: 1, structural: false, desc: 'Cat dinding warna cream/off-white' },
    { type: 'wall-paint-grey', name: 'Cat Dinding Abu', w: 200, h: 200, color: '#9CA3AF', icon: '🎨', height3d: 1, structural: false, desc: 'Cat dinding warna abu-abu modern' },
    { type: 'wall-paint-blue', name: 'Cat Dinding Biru', w: 200, h: 200, color: '#3B82F6', icon: '🎨', height3d: 1, structural: false, desc: 'Cat dinding warna biru laut' },
    { type: 'wall-paint-green', name: 'Cat Dinding Hijau', w: 200, h: 200, color: '#10B981', icon: '🎨', height3d: 1, structural: false, desc: 'Cat dinding warna hijau sage' },
    { type: 'wall-paint-yellow', name: 'Cat Dinding Kuning', w: 200, h: 200, color: '#FBBF24', icon: '🎨', height3d: 1, structural: false, desc: 'Cat dinding warna kuning hangat' },
    { type: 'wall-paint-accent', name: 'Cat Dinding Aksen', w: 200, h: 200, color: '#7C2D12', icon: '🎨', height3d: 1, structural: false, desc: 'Cat dinding warna aksen (feature wall)' },
    { type: 'wall-paint-black', name: 'Cat Dinding Hitam', w: 200, h: 200, color: '#1F2937', icon: '🎨', height3d: 1, structural: false, desc: 'Cat dinding hitam industrial' },
    { type: 'wallpaper-floral', name: 'Wallpaper Floral', w: 200, h: 200, color: '#FCE7F3', icon: '🌸', height3d: 1, structural: false, desc: 'Wallpaper motif bunga' },
    { type: 'wallpaper-geometric', name: 'Wallpaper Geometris', w: 200, h: 200, color: '#E5E5E5', icon: '🔺', height3d: 1, structural: false, desc: 'Wallpaper motif geometris modern' },
    { type: 'wallpaper-stripe', name: 'Wallpaper Garis', w: 200, h: 200, color: '#F5F5F5', icon: '➖', height3d: 1, structural: false, desc: 'Wallpaper motif garis vertikal' },
    { type: 'wallpaper-brick', name: 'Wallpaper Batu Bata', w: 200, h: 200, color: '#9C5A2F', icon: '🧱', height3d: 1, structural: false, desc: 'Wallpaper motif batu bata' },
    { type: 'wallpaper-wood', name: 'Wallpaper Kayu', w: 200, h: 200, color: '#8B6F47', icon: '🪵', height3d: 1, structural: false, desc: 'Wallpaper motif serat kayu' },
    { type: 'wallpaper-mural', name: 'Wallpaper Mural', w: 200, h: 200, color: '#3B82F6', icon: '🖼️', height3d: 1, structural: false, desc: 'Wallpaper mural custom 3D' },
    { type: 'wall-tile-ceramic', name: 'Keramik Dinding', w: 200, h: 200, color: '#E5E5E5', icon: '⬜', height3d: 5, structural: false, desc: 'Keramik dinding 25x40 (KM/dapur)' },
    { type: 'wall-tile-mosaic', name: 'Mosaik Dinding', w: 200, h: 200, color: '#E91E63', icon: '🎨', height3d: 5, structural: false, desc: 'Mosaik keramik dinding dekoratif' },
    { type: 'wall-tile-subway', name: 'Subway Tile', w: 200, h: 200, color: '#FAFAFA', icon: '⬜', height3d: 5, structural: false, desc: 'Subway tile 10x20 klasik' },
    { type: 'wall-marble', name: 'Marmer Dinding', w: 200, h: 200, color: '#F5F5DC', icon: '⬜', height3d: 10, structural: false, desc: 'Marmer dinding mewah' },
    { type: 'wall-stone', name: 'Batu Alam Dinding', w: 200, h: 200, color: '#78716C', icon: '🪨', height3d: 12, structural: false, desc: 'Batu alam (culture stone) dinding' },
    { type: 'wall-brick-exposed', name: 'Batu Bata Exposed', w: 200, h: 200, color: '#9C5A2F', icon: '🧱', height3d: 10, structural: false, desc: 'Batu bata exposed tanpa plester' },
    { type: 'wall-wood-panel', name: 'Panel Kayu Dinding', w: 200, h: 200, color: '#8B6F47', icon: '🪵', height3d: 12, structural: false, desc: 'Panel kayu lambring dinding' },
    { type: 'wall-3d-panel', name: 'Panel 3D Dinding', w: 200, h: 200, color: '#F5F5F5', icon: '⬜', height3d: 15, structural: false, desc: 'Panel 3D GRC dinding modern' },
    { type: 'wall-concrete-exposed', name: 'Beton Exposed', w: 200, h: 200, color: '#A8A29E', icon: '🟫', height3d: 8, structural: false, desc: 'Beton exposed (concrete finish) industrial' },
    { type: 'wall-wainscot', name: 'Wainscot Kayu', w: 200, h: 200, color: '#D4A574', icon: '🪵', height3d: 8, structural: false, desc: 'Wainscot kayu setengah dinding klasik' },
  ],
  // ===== MEP / INSTALASI (Pipa & Kabel) =====
  mep: [
    // ===== PIPA AIR BERSIH (WATER SUPPLY) =====
    { type: 'pipe-water-pvc-1-2', name: 'Pipa Air PVC 1/2"', w: 200, h: 4, color: '#3B82F6', icon: '🔵', height3d: 4, structural: false, desc: 'Pipa PVC AW 1/2 inch (air bersih)' },
    { type: 'pipe-water-pvc-3-4', name: 'Pipa Air PVC 3/4"', w: 200, h: 5, color: '#3B82F6', icon: '🔵', height3d: 5, structural: false, desc: 'Pipa PVC AW 3/4 inch (distribusi utama)' },
    { type: 'pipe-water-pvc-1', name: 'Pipa Air PVC 1"', w: 200, h: 6, color: '#3B82F6', icon: '🔵', height3d: 6, structural: false, desc: 'Pipa PVC AW 1 inch (header)' },
    { type: 'pipe-water-pvc-2', name: 'Pipa Air PVC 2"', w: 200, h: 8, color: '#3B82F6', icon: '🔵', height3d: 8, structural: false, desc: 'Pipa PVC 2 inch (main supply)' },
    { type: 'pipe-water-pex-1-2', name: 'Pipa PEX 1/2"', w: 200, h: 4, color: '#1E40AF', icon: '🔵', height3d: 4, structural: false, desc: 'PEX pipe 1/2 inch (air panas & dingin)' },
    { type: 'pipe-water-pex-3-4', name: 'Pipa PEX 3/4"', w: 200, h: 5, color: '#1E40AF', icon: '🔵', height3d: 5, structural: false, desc: 'PEX pipe 3/4 inch (manifold system)' },
    { type: 'pipe-water-copper-1-2', name: 'Pipa Tembaga 1/2"', w: 200, h: 4, color: '#B87333', icon: '🟠', height3d: 4, structural: false, desc: 'Copper pipe type L 1/2 inch (air panas)' },
    { type: 'pipe-water-copper-3-4', name: 'Pipa Tembaga 3/4"', w: 200, h: 5, color: '#B87333', icon: '🟠', height3d: 5, structural: false, desc: 'Copper pipe type L 3/4 inch (AC refrigerant)' },
    { type: 'pipe-water-galvanized-1', name: 'Pipa Galvanis 1"', w: 200, h: 6, color: '#9CA3AF', icon: '⚪', height3d: 6, structural: false, desc: 'Pipa baja galvanis 1 inch (air bersih lama)' },
    { type: 'pipe-water-galvanized-2', name: 'Pipa Galvanis 2"', w: 200, h: 8, color: '#9CA3AF', icon: '⚪', height3d: 8, structural: false, desc: 'Pipa baja galvanis 2 inch (main supply)' },
    { type: 'pipe-water-hdpe-2', name: 'Pipa HDPE 2"', w: 200, h: 8, color: '#1F2937', icon: '⚫', height3d: 8, structural: false, desc: 'HDPE pipe 2 inch (air tanah, tahan tekanan)' },
    // ===== PIPA AIR PANAS (HOT WATER) =====
    { type: 'pipe-hot-pex-1-2', name: 'Pipa Air Panas PEX 1/2"', w: 200, h: 4, color: '#EF4444', icon: '🔴', height3d: 4, structural: false, desc: 'PEX pipe air panas 1/2 inch (insulated)' },
    { type: 'pipe-hot-copper-3-4', name: 'Pipa Air Panas Tembaga 3/4"', w: 200, h: 5, color: '#DC2626', icon: '🔴', height3d: 5, structural: false, desc: 'Copper pipe air panas 3/4 inch + insulation' },
    { type: 'pipe-hot-cpvc-1-2', name: 'Pipa CPVC 1/2"', w: 200, h: 4, color: '#F87171', icon: '🔴', height3d: 4, structural: false, desc: 'CPVC pipe 1/2 inch (air panas high temp)' },
    // ===== PIPA BUANG / TOILET (WASTE & SEWER) =====
    { type: 'pipe-waste-pvc-3', name: 'Pipa Buang PVC 3"', w: 200, h: 10, color: '#A16207', icon: '🟤', height3d: 10, structural: false, desc: 'Pipa PVC buang 3 inch (toilet/wastafel)' },
    { type: 'pipe-waste-pvc-4', name: 'Pipa Buang PVC 4"', w: 200, h: 12, color: '#A16207', icon: '🟤', height3d: 12, structural: false, desc: 'Pipa PVC buang 4 inch (closet duduk main stack)' },
    { type: 'pipe-waste-pvc-6', name: 'Pipa Buang PVC 6"', w: 200, h: 16, color: '#92400E', icon: '🟤', height3d: 16, structural: false, desc: 'Pipa PVC buang 6 inch (septic line)' },
    { type: 'pipe-waste-vent-2', name: 'Pipa Vent PVC 2"', w: 200, h: 8, color: '#CA8A04', icon: '🟡', height3d: 8, structural: false, desc: 'Pipa vent 2 inch (udara buang plumbing)' },
    { type: 'pipe-waste-vent-3', name: 'Pipa Vent PVC 3"', w: 200, h: 10, color: '#CA8A04', icon: '🟡', height3d: 10, structural: false, desc: 'Pipa vent 3 inch (soil stack venting)' },
    { type: 'pipe-waste-schedule-40', name: 'Pipa Sch 40 PVC 4"', w: 200, h: 12, color: '#78350F', icon: '🟤', height3d: 12, structural: false, desc: 'PVC Schedule 40 4 inch (heavy duty waste)' },
    { type: 'pipe-waste-cast-iron-4', name: 'Pipa Besi Tuang 4"', w: 200, h: 12, color: '#1F2937', icon: '⚫', height3d: 12, structural: false, desc: 'Cast iron pipe 4 inch (bangunan lama, anti suara)' },
    { type: 'pipe-waste-abs-3', name: 'Pipa ABS 3"', w: 200, h: 10, color: '#1F2937', icon: '⚫', height3d: 10, structural: false, desc: 'ABS pipe 3 inch (waste, tahan kimia)' },
    { type: 'pipe-waste-floor-2', name: 'Floor Drain Pipe 2"', w: 200, h: 8, color: '#92400E', icon: '🟤', height3d: 8, structural: false, desc: 'Pipa floor drain 2 inch (luabng lantai KM/dapur)' },
    // ===== PIPA AIR HUJAN (RAINWATER) =====
    { type: 'pipe-rain-pvc-4', name: 'Tali Air PVC 4"', w: 200, h: 12, color: '#06B6D4', icon: '🟦', height3d: 12, structural: false, desc: 'Pipa talang PVC 4 inch (air hujan atap)' },
    { type: 'pipe-rain-pvc-5', name: 'Tali Air PVC 5"', w: 200, h: 14, color: '#06B6D4', icon: '🟦', height3d: 14, structural: false, desc: 'Pipa talang PVC 5 inch (downspout besar)' },
    { type: 'pipe-rain-galvanized-4', name: 'Tali Air Galvanis 4"', w: 200, h: 12, color: '#0891B2', icon: '🟦', height3d: 12, structural: false, desc: 'Pipa talang galvanis 4 inch (tahan lama)' },
    // ===== PIPA GAS =====
    { type: 'pipe-gas-pvc-1-2', name: 'Pipa Gas PVC 1/2"', w: 200, h: 4, color: '#F97316', icon: '🟠', height3d: 4, structural: false, desc: 'Pipa gas kuning PVC 1/2 inch (LPG/NG)' },
    { type: 'pipe-gas-steel-1-2', name: 'Pipa Gas Baja 1/2"', w: 200, h: 5, color: '#EA580C', icon: '🟠', height3d: 5, structural: false, desc: 'Pipa baja gas 1/2 inch (galvanis threaded)' },
    { type: 'pipe-gas-flexible', name: 'Selang Gas Fleksibel', w: 100, h: 3, color: '#FB923C', icon: '🟠', height3d: 3, structural: false, desc: 'Selang gas fleksibel stainless (kompor)' },
    // ===== PIPA AC / REFRIGERANT =====
    { type: 'pipe-ac-liquid-1-4', name: 'Pipa AC Liquid 1/4"', w: 200, h: 3, color: '#0EA5E9', icon: '🔵', height3d: 3, structural: false, desc: 'Pipa AC liquid line 1/4 inch (refrigerant)' },
    { type: 'pipe-ac-suction-3-8', name: 'Pipa AC Suction 3/8"', w: 200, h: 4, color: '#0284C7', icon: '🔵', height3d: 4, structural: false, desc: 'Pipa AC suction 3/8 inch (refrigerant return)' },
    { type: 'pipe-ac-drain-5-8', name: 'Pipa AC Drain 5/8"', w: 200, h: 5, color: '#7DD3FC', icon: '🔵', height3d: 5, structural: false, desc: 'Pipa AC drain 5/8 inch (condensate buang)' },
    { type: 'pipe-ac-insulated-3-8', name: 'Pipa AC Insulated 3/8"', w: 200, h: 7, color: '#BAE6FD', icon: '🔵', height3d: 7, structural: false, desc: 'Pipa AC 3/8 + insulation (anti condensate)' },
    // ===== KABEL LISTRIK (POWER) =====
    { type: 'cable-nym-3x2-5', name: 'Kabel NYM 3x2.5mm²', w: 200, h: 3, color: '#DC2626', icon: '🔴', height3d: 3, structural: false, desc: 'Kabel NYM 3 core 2.5mm² (instalasi dalam)' },
    { type: 'cable-nym-3x1-5', name: 'Kabel NYM 3x1.5mm²', w: 200, h: 3, color: '#DC2626', icon: '🔴', height3d: 3, structural: false, desc: 'Kabel NYM 3 core 1.5mm² (lampu/switch)' },
    { type: 'cable-nym-4x2-5', name: 'Kabel NYM 4x2.5mm²', w: 200, h: 4, color: '#B91C1C', icon: '🔴', height3d: 4, structural: false, desc: 'Kabel NYM 4 core 2.5mm² (AC/heater)' },
    { type: 'cable-nym-3x4', name: 'Kabel NYM 3x4mm²', w: 200, h: 5, color: '#991B1B', icon: '🔴', height3d: 5, structural: false, desc: 'Kabel NYM 3 core 4mm² (AC 2PK / water heater)' },
    { type: 'cable-nym-3x6', name: 'Kabel NYM 3x6mm²', w: 200, h: 6, color: '#7F1D1D', icon: '🔴', height3d: 6, structural: false, desc: 'Kabel NYM 3 core 6mm² (induction cooker)' },
    { type: 'cable-nym-3x10', name: 'Kabel NYM 3x10mm²', w: 200, h: 8, color: '#450A0A', icon: '🔴', height3d: 8, structural: false, desc: 'Kabel NYM 3 core 10mm² (sub panel feeder)' },
    { type: 'cable-nym-3x16', name: 'Kabel NYM 3x16mm²', w: 200, h: 10, color: '#1F2937', icon: '⚫', height3d: 10, structural: false, desc: 'Kabel NYM 3 core 16mm² (main feeder)' },
    // ===== KABEL LUAR / BAWAH TANAH =====
    { type: 'cable-nyy-4x2-5', name: 'Kabel NYY 4x2.5mm²', w: 200, h: 5, color: '#1F2937', icon: '⚫', height3d: 5, structural: false, desc: 'Kabel NYY 4 core 2.5mm² (bawah tanah)' },
    { type: 'cable-nyy-4x6', name: 'Kabel NYY 4x6mm²', w: 200, h: 8, color: '#1F2937', icon: '⚫', height3d: 8, structural: false, desc: 'Kabel NYY 4 core 6mm² (bawah tanah service)' },
    { type: 'cable-nyy-4x16', name: 'Kabel NYY 4x16mm²', w: 200, h: 12, color: '#111827', icon: '⚫', height3d: 12, structural: false, desc: 'Kabel NYY 4 core 16mm² (underground main)' },
    { type: 'cable-njp-2x2-5', name: 'Kabel NJP 2x2.5mm²', w: 200, h: 4, color: '#FBBF24', icon: '🟡', height3d: 4, structural: false, desc: 'Kabel NJP outdoor 2 core 2.5mm² (garden light)' },
    { type: 'cable-nja-2x1-5', name: 'Kabel NYA 2x1.5mm²', w: 200, h: 3, color: '#F59E0B', icon: '🟡', height3d: 3, structural: false, desc: 'Kabel NYA 2 core 1.5mm² (overhead service)' },
    // ===== KABEL DATA / KOMUNIKASI =====
    { type: 'cable-utp-cat6', name: 'Kabel UTP Cat 6', w: 200, h: 3, color: '#22C55E', icon: '🟢', height3d: 3, structural: false, desc: 'Kabel UTP Cat 6 (LAN internet gigabit)' },
    { type: 'cable-utp-cat5e', name: 'Kabel UTP Cat 5e', w: 200, h: 3, color: '#16A34A', icon: '🟢', height3d: 3, structural: false, desc: 'Kabel UTP Cat 5e (LAN 100Mbps)' },
    { type: 'cabel-fiber-optic', name: 'Kabel Fiber Optik', w: 200, h: 4, color: '#15803D', icon: '🟢', height3d: 4, structural: false, desc: 'Fiber optic cable single mode (FTTH)' },
    { type: 'cable-coax-tv', name: 'Kabel Coaxial TV', w: 200, h: 4, color: '#A855F7', icon: '🟣', height3d: 4, structural: false, desc: 'Kabel coaxial RG6 (TV/antenna)' },
    { type: 'cable-phone-2pair', name: 'Kabel Telepon 2 Pair', w: 200, h: 3, color: '#3B82F6', icon: '🔵', height3d: 3, structural: false, desc: 'Kabel telepon 2 pair (PSTN/intercom)' },
    { type: 'cable-phone-4pair', name: 'Kabel Telepon 4 Pair', w: 200, h: 4, color: '#1D4ED8', icon: '🔵', height3d: 4, structural: false, desc: 'Kabel telepon 4 pair (PABX multi-line)' },
    { type: 'cable-cctv-rg59', name: 'Kabel CCTV RG59+Power', w: 200, h: 5, color: '#6B7280', icon: '⚫', height3d: 5, structural: false, desc: 'Kabel CCTV combo RG59 + power 2x0.5' },
    // ===== CONDUIT (PIPA KABEL) =====
    { type: 'conduit-pvc-3-4', name: 'Conduit PVC 3/4"', w: 200, h: 5, color: '#6B7280', icon: '⚪', height3d: 5, structural: false, desc: 'Conduit PVC 3/4 inch (pelindung kabel dinding)' },
    { type: 'conduit-pvc-1', name: 'Conduit PVC 1"', w: 200, h: 6, color: '#6B7280', icon: '⚪', height3d: 6, structural: false, desc: 'Conduit PVC 1 inch (kabel banyak)' },
    { type: 'conduit-flexible-3-4', name: 'Conduit Fleksibel 3/4"', w: 200, h: 5, color: '#374151', icon: '⚫', height3d: 5, structural: false, desc: 'Flexible conduit 3/4 inch (bending)' },
    { type: 'conduit-eme-1', name: 'Conduit EMT 1"', w: 200, h: 6, color: '#9CA3AF', icon: '⚪', height3d: 6, structural: false, desc: 'EMT metal conduit 1 inch (industrial)' },
    { type: 'conduit-imc-1', name: 'Conduit IMC 1"', w: 200, h: 7, color: '#6B7280', icon: '⚫', height3d: 7, structural: false, desc: 'IMC intermediate metal conduit 1 inch (heavy)' },
    { type: 'cable-tray-200', name: 'Cable Tray 200mm', w: 200, h: 15, color: '#4B5563', icon: '⬜', height3d: 8, structural: false, desc: 'Cable tray 200mm ( Jalur kabel industri)' },
    { type: 'cable-tray-300', name: 'Cable Tray 300mm', w: 200, h: 20, color: '#4B5563', icon: '⬜', height3d: 10, structural: false, desc: 'Cable tray 300mm (kabel besar/data center)' },
    // ===== GROUNDING & BUSBAR =====
    { type: 'cable-grounding-16', name: 'Kabel Grounding 16mm²', w: 200, h: 5, color: '#FCD34D', icon: '🟡', height3d: 5, structural: false, desc: 'BC grounding 16mm² (ke grounding rod)' },
    { type: 'cable-grounding-50', name: 'Kabel Grounding 50mm²', w: 200, h: 8, color: '#FCD34D', icon: '🟡', height3d: 8, structural: false, desc: 'BC grounding 50mm² (main panel)' },
    { type: 'grounding-rod-5-8', name: 'Grounding Rod 5/8"', w: 30, h: 5, color: '#92400E', icon: '🟫', height3d: 300, structural: false, desc: 'Copper grounding rod 5/8 inch x 3m (pentanahan)' },
    { type: 'busbar-copper-100a', name: 'Busbar Tembaga 100A', w: 100, h: 8, color: '#B87333', icon: '🟠', height3d: 8, structural: false, desc: 'Busbar tembaga 100A (panel distribusi)' },
  ],
  // ===== PELINDUNG BUKAAN (Tudung/Kanopi/Drip Course) =====
  // Mencegah air hujan mengalir dari tembok masuk ke ruangan melalui ventilasi/jendela/pintu
  weather: [
    // ===== TUDUNG VENTILASI (VENT HOOD) =====
    { type: 'hood-vent-wall', name: 'Tudung Ventilasi Dinding', w: 60, h: 25, color: '#78716C', icon: '☂️', height3d: 15, structural: false, desc: 'Tudung miring di atas ventilasi dinding (anti air masuk)' },
    { type: 'hood-vent-roof', name: 'Tudung Ventilasi Atap', w: 50, h: 50, color: '#57534E', icon: '☂️', height3d: 30, structural: false, desc: 'Tudung ventilasi atap (cukup besar untuk air hujan)' },
    { type: 'hood-vent-pvc', name: 'Tudung Vent PVC', w: 40, h: 20, color: '#F5F5F5', icon: '☂️', height3d: 12, structural: false, desc: 'Tudung PVC kecil untuk ventilasi dinding KM/dapur' },
    { type: 'hood-vent-aluminum', name: 'Tudung Vent Aluminium', w: 50, h: 25, color: '#9CA3AF', icon: '☂️', height3d: 15, structural: false, desc: 'Tudung aluminium untuk ventilasi dinding luar' },
    { type: 'hood-vent-stainless', name: 'Tudung Vent Stainless', w: 50, h: 25, color: '#D4D4D4', icon: '☂️', height3d: 15, structural: false, desc: 'Tudung stainless steel premium anti karat' },
    { type: 'hood-vent-louver', name: 'Tudung Vent Louver', w: 60, h: 30, color: '#78716C', icon: '☂️', height3d: 20, structural: false, desc: 'Tudung louvered dengan slats miring (air + udara)' },
    { type: 'hood-vent-round', name: 'Tudung Vent Bulat', w: 35, h: 35, color: '#6B7280', icon: '⭕', height3d: 20, structural: false, desc: 'Tudung bulat untuk pipa ventilasi exhaust' },
    // ===== TUDUNG JENDELA (WINDOW HOOD) =====
    { type: 'hood-window-wood', name: 'Tudung Jendela Kayu', w: 150, h: 30, color: '#8B6F47', icon: '☂️', height3d: 25, structural: false, desc: 'Tudung kayu miring di atas jendela (anti air tembok)' },
    { type: 'hood-window-concrete', name: 'Tudung Jendela Beton', w: 150, h: 25, color: '#A8A29E', icon: '☂️', height3d: 30, structural: false, desc: 'Tudung beton dicor di atas jendela (permanen)' },
    { type: 'hood-window-aluminum', name: 'Tudung Jendela Aluminium', w: 150, h: 25, color: '#9CA3AF', icon: '☂️', height3d: 20, structural: false, desc: 'Tudung aluminium ringan anti karat' },
    { type: 'hood-window-polycarbonate', name: 'Tudung Jendela Polikarbonat', w: 150, h: 25, color: '#E0F2FE', icon: '☂️', height3d: 18, structural: false, desc: 'Tudung polikarbonat bening (cahaya tetap masuk)' },
    { type: 'hood-window-glass-tempered', name: 'Tudung Jendela Kaca', w: 150, h: 20, color: '#BEE3F8', icon: '☂️', height3d: 15, structural: false, desc: 'Tudung kaca tempered tempered premium modern' },
    { type: 'hood-window-fabric', name: 'Tudung Jendela Kain (Awning)', w: 150, h: 40, color: '#7C2D12', icon: '☂️', height3d: 35, structural: false, desc: 'Awning kain retractable bisa digulung' },
    { type: 'hood-window-metal-deck', name: 'Tudung Jendela Metal Deck', w: 150, h: 25, color: '#6B7280', icon: '☂️', height3d: 22, structural: false, desc: 'Tudung metal deck (spandek) ringan kuat' },
    // ===== TUDUNG PINTU (DOOR HOOD/CANOPI) =====
    { type: 'hood-door-wood', name: 'Tudung Pintu Kayu', w: 120, h: 40, color: '#8B6F47', icon: '☂️', height3d: 30, structural: false, desc: 'Tudung kayu di atas pintu entrance (anti air)' },
    { type: 'hood-door-concrete', name: 'Tudung Pintu Beton', w: 130, h: 35, color: '#A8A29E', icon: '☂️', height3d: 35, structural: false, desc: 'Tudung beton dicor di atas pintu (permanen)' },
    { type: 'hood-door-aluminum', name: 'Tudung Pintu Aluminium', w: 120, h: 35, color: '#9CA3AF', icon: '☂️', height3d: 25, structural: false, desc: 'Tudung aluminium ringan modern' },
    { type: 'canopy-door-polycarbonate', name: 'Kanopi Pintu Polikarbonat', w: 200, h: 100, color: '#E0F2FE', icon: '☂️', height3d: 30, structural: false, desc: 'Kanopi besar polikarbonat bening untuk pintu entrance' },
    { type: 'canopy-door-steel', name: 'Kanopi Pintu Baja Ringan', w: 200, h: 100, color: '#6B7280', icon: '☂️', height3d: 30, structural: false, desc: 'Kanopi baja ringan + spandek untuk carport/pintu' },
    { type: 'canopy-door-fabric', name: 'Kanopi Pintu Kain Retractable', w: 200, h: 80, color: '#7C2D12', icon: '☂️', height3d: 40, structural: false, desc: 'Kanopi kain bisa digulung (retractable awning)' },
    { type: 'canopy-door-glass', name: 'Kanopi Pintu Kaca Tempered', w: 180, h: 90, color: '#BEE3F8', icon: '☂️', height3d: 25, structural: false, desc: 'Kanopi kaca tempered premium modern minimalis' },
    { type: 'canopy-door-flat', name: 'Kanopi Pintu Flat', w: 150, h: 60, color: '#374151', icon: '☂️', height3d: 15, structural: false, desc: 'Kanopi flat minimalis untuk pintu modern' },
    { type: 'canopy-door-curved', name: 'Kanopi Pintu Lengkung', w: 180, h: 80, color: '#9CA3AF', icon: '☂️', height3d: 50, structural: false, desc: 'Kanopi lengkung (curved) aluminium elegan' },
    { type: 'canopy-door-gable', name: 'Kanopi Pintu Gable (Pelana)', w: 180, h: 100, color: '#8B6F47', icon: '☂️', height3d: 80, structural: false, desc: 'Kanopi pelana kayu + genteng untuk pintu mewah' },
    { type: 'canopy-door-dome', name: 'Kanopi Pintu Dome', w: 180, h: 90, color: '#9CA3AF', icon: '☂️', height3d: 60, structural: false, desc: 'Kanopi dome (kubah) aluminium premium' },
    // ===== DRIP COURSE & WEATHER SHED =====
    { type: 'drip-course', name: 'Drip Course Atas Bukaan', w: 200, h: 10, color: '#A8A29E', icon: '➖', height3d: 8, structural: false, desc: 'Drip course penjepit aliran air di atas bukaan (groove)' },
    { type: 'drip-course-wood', name: 'Drip Course Kayu', w: 200, h: 10, color: '#8B6F47', icon: '➖', height3d: 8, structural: false, desc: 'Drip course kayu dengan groove bawah (anti air)' },
    { type: 'drip-course-aluminum', name: 'Drip Course Aluminium', w: 200, h: 8, color: '#9CA3AF', icon: '➖', height3d: 6, structural: false, desc: 'Drip course aluminium dengan drip edge' },
    { type: 'drip-course-pvc', name: 'Drip Course PVC', w: 200, h: 8, color: '#F5F5F5', icon: '➖', height3d: 6, structural: false, desc: 'Drip course PVC putih untuk finishing bukaan' },
    { type: 'weather-shed', name: 'Weather Shed Atas Bukaan', w: 200, h: 40, color: '#78716C', icon: '☂️', height3d: 30, structural: false, desc: 'Weather shed miring di atas bukaan (lebar anti air)' },
    { type: 'weather-shed-concrete', name: 'Weather Shed Beton', w: 200, h: 40, color: '#A8A29E', icon: '☂️', height3d: 35, structural: false, desc: 'Weather shed beton dicor permanen (lebar 40cm)' },
    { type: 'weather-shed-tile', name: 'Weather Shed Genteng', w: 200, h: 50, color: '#9C5A2F', icon: '☂️', height3d: 40, structural: false, desc: 'Weather shed dengan genteng kecil di atas bukaan' },
    // ===== COPING (PENUTUP ATAS DINDING PARAPET) =====
    { type: 'coping-wall-concrete', name: 'Coping Beton Atas Dinding', w: 200, h: 20, color: '#A8A29E', icon: '⬛', height3d: 12, structural: false, desc: 'Coping beton di atas dinding parapet (anti air)' },
    { type: 'coping-wall-stone', name: 'Coping Batu Alam', w: 200, h: 20, color: '#78716C', icon: '⬛', height3d: 15, structural: false, desc: 'Coping batu alam di atas dinding parapet' },
    { type: 'coping-wall-metal', name: 'Coping Metal', w: 200, h: 15, color: '#9CA3AF', icon: '⬛', height3d: 10, structural: false, desc: 'Coping metal aluminium di atas dinding parapet' },
    { type: 'coping-wall-tile', name: 'Coping Genteng Keramik', w: 200, h: 18, color: '#9C5A2F', icon: '⬛', height3d: 12, structural: false, desc: 'Coping genteng keramik di atas dinding (anti air)' },
    // ===== TUDUNG BUKAAN GENERIC =====
    { type: 'hood-opening-generic', name: 'Tudung Bukaan Generic', w: 120, h: 30, color: '#78716C', icon: '☂️', height3d: 20, structural: false, desc: 'Tudung serbaguna untuk bukaan (vent/jendela/pintu)' },
    { type: 'hood-opening-large', name: 'Tudung Bukaan Besar', w: 200, h: 50, color: '#57534E', icon: '☂️', height3d: 35, structural: false, desc: 'Tudung besar untuk bukaan lebar (pintu garasi/toko)' },
  ],
};

export const categoryLabels = {
  bedroom: { label: 'Kamar Tidur', icon: '🛏️' },
  living: { label: 'Ruang Tamu', icon: '🛋️' },
  kitchen: { label: 'Dapur', icon: '🍳' },
  bathroom: { label: 'Kamar Mandi', icon: '🚿' },
  doors: { label: 'Pintu & Jendela', icon: '🚪' },
  structural: { label: 'Struktural & Tiang', icon: '🏗️' },
  outdoor: { label: 'Outdoor & Pagar', icon: '🌳' },
  ceiling: { label: 'Plafond', icon: '⬜' },
  lighting: { label: 'Lampu', icon: '💡' },
  trim: { label: 'Lisplang & Tali Air', icon: '➖' },
  ventilation: { label: 'Ventilasi', icon: '🌀' },
  flooring: { label: 'Lantai', icon: '⬜' },
  sanitary: { label: 'Sanitary & Plumbing', icon: '🚽' },
  electrical: { label: 'Elektrikal', icon: '🔌' },
  appliances: { label: 'Elektronik', icon: '❄️' },
  decor: { label: 'Dekorasi', icon: '🖼️' },
  wallfinish: { label: 'Finishing Dinding', icon: '🎨' },
  mep: { label: 'MEP / Instalasi', icon: '🔧' },
  weather: { label: 'Pelindung Bukaan', icon: '☂️' },
};

export function getItemDef(type) {
  for (const cat in itemDefinitions) {
    const found = itemDefinitions[cat].find((i) => i.type === type);
    if (found) return found;
  }
  return null;
}

export function getItemCategory(type) {
  for (const cat in itemDefinitions) {
    if (itemDefinitions[cat].some((i) => i.type === type)) return cat;
  }
  return null;
}

export function getCategoryLabel(cat) {
  return categoryLabels[cat] || { label: cat, icon: '📦' };
}

// All valid categories for the custom item form
export const ALL_CATEGORIES = Object.keys(categoryLabels);

// Check if item is a fence type (for special rendering)
export function isFenceType(type) {
  return type && type.startsWith('fence-');
}

// Check if item is a gate type
export function isGateType(type) {
  return type && type.startsWith('gate-');
}

// Check if item is outdoor/landscape type
export function isOutdoorType(type) {
  const outdoor = itemDefinitions.outdoor || [];
  return outdoor.some((i) => i.type === type);
}

// Check if item is a stair type (for special 2D/3D rendering)
export function isStairsType(type) {
  return type && (type.startsWith('stairs') || type === 'stairs');
}

// Check if item is a stainless steel railing / balcony fence type
export function isSteelRailingType(type) {
  if (!type) return false;
  return (
    type.startsWith('fence-stainless') ||
    type === 'fence-steel-pipe' ||
    type === 'fence-aluminum-slat' ||
    type === 'fence-glass-frameless' ||
    type === 'fence-wire-rope' ||
    type === 'fence-wood-slat-vertical'
  );
}

// Check if item is a ceiling type
export function isCeilingType(type) {
  return type && type.startsWith('ceiling-');
}

// Check if item is a lighting type
export function isLightingType(type) {
  return type && type.startsWith('light-');
}

// Check if item is a trim type (lisplang/tali air)
export function isTrimType(type) {
  return type && (type.startsWith('lisplang-') || type.startsWith('tali-air-') || type.startsWith('list-'));
}

// Check if item is a ventilation type
export function isVentilationType(type) {
  return type && type.startsWith('vent-');
}

// Check if item is a flooring type
export function isFlooringType(type) {
  return type && type.startsWith('floor-');
}

// Check if item is a column type (extended set)
export function isColumnType(type) {
  return type && (type === 'column-rect' || type === 'column-round' || type.startsWith('column-'));
}

// Check if item is a window type
export function isWindowType(type) {
  return type && (type.startsWith('window-') || type === 'window' || type === 'skylight' || type === 'louver-window' || type === 'window-glass-block');
}

// Check if item is a door type
export function isDoorType(type) {
  return type && (type === 'door' || type.startsWith('door-') || type === 'sliding-door' || type === 'folding-door' || type === 'french-door');
}

// Check if item is sanitary type
export function isSanitaryType(type) {
  return type && (type.startsWith('closet-') || type.startsWith('bathtub-') || type.startsWith('shower-') || type.startsWith('sink-') || type === 'bidet' || type === 'urinoir' || type === 'floor-drain' || type === 'water-tap' || type.startsWith('water-heater') || type.startsWith('toren') || type === 'septic-tank' || type === 'sumur-air' || type === 'pump-water');
}

// Check if item is electrical type
export function isElectricalType(type) {
  return type && (type.startsWith('outlet-') || type.startsWith('switch-') || type.startsWith('mcb-') || type === 'doorbell' || type.startsWith('cctv') || type === 'intercom' || type === 'motion-sensor' || type === 'smoke-detector' || type === 'antenna-tv' || type === 'smart-hub' || type === 'ev-charger');
}

// Check if item is appliance type
export function isApplianceType(type) {
  return type && (type.startsWith('ac-') || type.startsWith('fan-') || type.startsWith('tv-') || type === 'home-theater' || type === 'speaker-stand' || type.startsWith('washing-') || type === 'dryer' || type.startsWith('fridge-') || type === 'microwave' || type === 'dishwasher' || type === 'wine-cooler' || type === 'dispenser' || type === 'water-purifier' || type === 'vacuum' || type === 'ceiling-fan');
}

// Check if item is decor type
export function isDecorType(type) {
  return type && (type.startsWith('painting-') || type.startsWith('photo-') || type.startsWith('vase-') || type.startsWith('mirror-') || type.startsWith('curtain-') || type.startsWith('blind-') || type.startsWith('rug-') || type.startsWith('plant-') || type === 'sculpture' || type === 'wall-clock' || type === 'candle-set' || type === 'book-stack');
}

// Check if item is wall finish type
export function isWallFinishType(type) {
  return type && (type.startsWith('wall-') || type.startsWith('wallpaper-'));
}
