// MEP (Mechanical, Electrical, Plumbing) element definitions
// All dimensions in CM

// Pipe types for plumbing mode
export const pipeTypes = {
  'clean-water': { name: 'Air Bersih', diameter: 2.5, color: '#3b82f6', icon: '🔵' },
  'hot-water': { name: 'Air Panas', diameter: 2.0, color: '#ef4444', icon: '🔴' },
  'waste': { name: 'Air Buang', diameter: 4.0, color: '#a16207', icon: '🟤' },
  'rain': { name: 'Air Hujan', diameter: 5.0, color: '#06b6d4', icon: '🟦' },
  'gas': { name: 'Gas', diameter: 1.5, color: '#f97316', icon: '🟠' },
};

// Electrical wire types
export const wireTypes = {
  'power': { name: 'Listrik Power', color: '#dc2626', voltage: '220V', icon: '⚡' },
  'lighting': { name: 'Lighting', color: '#facc15', voltage: '220V', icon: '💡' },
  'data': { name: 'Data/Internet', color: '#22c55e', voltage: 'Low', icon: '🌐' },
  'tv': { name: 'TV/Antenna', color: '#a855f7', voltage: 'Low', icon: '📺' },
  'phone': { name: 'Telepon', color: '#3b82f6', voltage: 'Low', icon: '📞' },
};

// Rebar (besi beton) specifications
// Rebar types - SNI 03-2847-2002 compliant (diameters in cm for canvas, mm equivalent noted)
export const rebarTypes = {
  'main':           { name: 'Besi Utama (D16)',     diameter: 1.6, color: '#475569', spacing: 15, sniDiameter_mm: 16, fy: 400 },
  'main-d19':       { name: 'Besi Utama (D19)',     diameter: 1.9, color: '#475569', spacing: 15, sniDiameter_mm: 19, fy: 400 },
  'main-d22':       { name: 'Besi Utama (D22)',     diameter: 2.2, color: '#475569', spacing: 15, sniDiameter_mm: 22, fy: 400 },
  'main-d25':       { name: 'Besi Utama (D25)',     diameter: 2.5, color: '#475569', spacing: 15, sniDiameter_mm: 25, fy: 400 },
  'stirrup':        { name: 'Sengkang (D8)',        diameter: 0.8, color: '#64748b', spacing: 15, sniDiameter_mm: 8,  fy: 240 }, // BJTP240
  'stirrup-d10':    { name: 'Sengkang (D10)',       diameter: 1.0, color: '#64748b', spacing: 15, sniDiameter_mm: 10, fy: 240 },
  'slab':           { name: 'Besi Plat (D10)',      diameter: 1.0, color: '#64748b', spacing: 15, sniDiameter_mm: 10, fy: 400 },
  'slab-d8':        { name: 'Besi Plat (D8)',       diameter: 0.8, color: '#64748b', spacing: 15, sniDiameter_mm: 8,  fy: 240 },
  'beam-main':      { name: 'Besi Balok (D16)',     diameter: 1.6, color: '#334155', spacing: 0,  sniDiameter_mm: 16, fy: 400 },
  'beam-main-d19':  { name: 'Besi Balok (D19)',     diameter: 1.9, color: '#334155', spacing: 0,  sniDiameter_mm: 19, fy: 400 },
  'beam-stirrup':   { name: 'Sengkang Balok (D8)',  diameter: 0.8, color: '#64748b', spacing: 10, sniDiameter_mm: 8,  fy: 240 },
  'beam-stirrup-d10': { name: 'Sengkang Balok (D10)', diameter: 1.0, color: '#64748b', spacing: 10, sniDiameter_mm: 10, fy: 240 },
};

// SNI 03-2847-2002 standard rebar specifications
export const sniRebarSpecs = {
  // Minimum concrete cover per SNI 7.7
  cover: {
    interior:    40,  // mm - not exposed to weather
    exterior:    50,  // mm - exposed to weather
    inGround:    75,  // mm - in contact with ground
    foundation:  75,  // mm - for foundations
  },
  // Min reinforcement ratio per SNI 10.5.1
  minRho: 0.01,   // 1%
  maxRho: 0.08,   // 8%
  // Min main bars per SNI 10.9.2
  minMainBars: 4,
  // Stirrup spacing limits per SNI 7.10
  stirrupSpacing: {
    min: 75,   // mm
    max: 300,  // mm
    typicalColumn: 150, // mm
    typicalBeam: 100,   // mm
  },
  // Standard rebar diameters (mm)
  standardDiameters: [6, 8, 10, 13, 16, 19, 22, 25, 29, 32],
};

// MEP fixtures (electrical outlets, switches, plumbing fixtures)
export const mepFixtures = {
  electrical: [
    { type: 'outlet', name: 'Stop Kontak', icon: '🔌', color: '#dc2626', size: 10 },
    { type: 'switch', name: 'Saklar', icon: '🔘', color: '#facc15', size: 8 },
    { type: 'lamp', name: 'Lampu', icon: '💡', color: '#fde047', size: 12 },
    { type: 'panel', name: 'Panel Listrik', icon: '⚙️', color: '#1e40af', size: 30 },
    { type: 'fan', name: 'Kipas', icon: '🌀', color: '#0891b2', size: 40 },
    { type: 'ac', name: 'AC', icon: '❄️', color: '#0ea5e9', size: 50 },
  ],
  plumbing: [
    { type: 'tap', name: 'Kran Air', icon: '🚰', color: '#3b82f6', size: 12 },
    { type: 'drain', name: 'Saluran Buang', icon: '🔽', color: '#a16207', size: 15 },
    { type: 'water-meter', name: 'Meter Air', icon: '📊', color: '#1e40af', size: 25 },
    { type: 'water-tank', name: 'Tandon', icon: '🛢️', color: '#0891b2', size: 60 },
    { type: 'pump', name: 'Pompa', icon: '🔄', color: '#7c3aed', size: 30 },
    { type: 'septic', name: 'Septic Tank', icon: '🕳️', color: '#451a03', size: 100 },
  ],
  hvac: [
    { type: 'vent-in', name: 'Vent In', icon: '🌬️', color: '#0ea5e9', size: 30 },
    { type: 'vent-out', name: 'Vent Out', icon: '💨', color: '#64748b', size: 30 },
    { type: 'duct', name: 'Ducting', icon: '▢', color: '#94a3b8', size: 40 },
  ],
};

// View mode definitions
export const viewModes = {
  design: { name: 'Desain', icon: '🎨', desc: 'Tampilan denah lengkap dengan furnitur' },
  structural: { name: 'Struktur', icon: '🏗️', desc: 'Highlight kolom, balok, dinding struktural' },
  rebar: { name: 'Pembesian', icon: '🔩', desc: 'Detail besi beton (rebar) pada kolom & balok' },
  plumbing: { name: 'Pipa/Plumbing', icon: '🚰', desc: 'Jalur pipa air bersih, buang, gas' },
  electrical: { name: 'Listrik', icon: '⚡', desc: 'Jalur kabel listrik & instalasi' },
  mep: { name: 'MEP', icon: '🔧', desc: 'Gabungan Mechanical, Electrical, Plumbing' },
};

// Generate rebar layout for a column
export function generateColumnRebar(column, floorHeight) {
  const rebar = [];
  const size = column.size;
  const mainD = rebarTypes.main.diameter;
  const stirrupD = rebarTypes.stirrup.diameter;
  const cover = 4; // concrete cover 4cm

  // Main rebars (4 corner + sides based on size)
  const mainCount = Math.max(4, Math.floor(size / 15) * 2);
  for (let i = 0; i < mainCount; i++) {
    const angle = (i / mainCount) * Math.PI * 2;
    const r = size / 2 - cover - mainD / 2;
    rebar.push({
      type: 'main',
      x: Math.cos(angle) * r,
      y: Math.sin(angle) * r,
      z: 0,
      length: floorHeight,
      diameter: mainD,
    });
  }

  // Stirrups along height
  const stirrupSpacing = rebarTypes.stirrup.spacing;
  const stirrupCount = Math.floor(floorHeight / stirrupSpacing);
  for (let i = 0; i <= stirrupCount; i++) {
    rebar.push({
      type: 'stirrup',
      x: 0,
      y: 0,
      z: i * stirrupSpacing,
      length: 0,
      diameter: stirrupD,
      size: size - cover * 2,
    });
  }

  return rebar;
}

// Generate beam rebar (for walls acting as beams)
export function generateBeamRebar(wall, floorHeight) {
  const rebar = [];
  const dx = wall.x2 - wall.x1;
  const dy = wall.y2 - wall.y1;
  const length = Math.sqrt(dx * dx + dy * dy);
  if (length < 1) return rebar;

  const beamWidth = 15; // beam width
  const beamHeight = 20; // beam height
  const mainD = rebarTypes['beam-main'].diameter;
  const stirrupD = rebarTypes['beam-stirrup'].diameter;
  const cover = 3;

  // 4 main rebars (top-left, top-right, bottom-left, bottom-right)
  const corners = [
    { x: -beamWidth / 2 + cover, y: -beamHeight / 2 + cover },
    { x: beamWidth / 2 - cover, y: -beamHeight / 2 + cover },
    { x: -beamWidth / 2 + cover, y: beamHeight / 2 - cover },
    { x: beamWidth / 2 - cover, y: beamHeight / 2 - cover },
  ];
  corners.forEach((c) => {
    rebar.push({
      type: 'beam-main',
      x: c.x,
      y: c.y,
      length: length,
      diameter: mainD,
    });
  });

  // Stirrups along beam length
  const spacing = rebarTypes['beam-stirrup'].spacing;
  const count = Math.floor(length / spacing);
  for (let i = 0; i <= count; i++) {
    rebar.push({
      type: 'beam-stirrup',
      x: -length / 2 + i * spacing,
      y: 0,
      length: 0,
      diameter: stirrupD,
      size: beamWidth - cover * 2,
      height: beamHeight - cover * 2,
    });
  }

  return rebar;
}

// Helper to get MEP fixture by type
export function getMepFixture(type) {
  for (const cat in mepFixtures) {
    const found = mepFixtures[cat].find((f) => f.type === type);
    if (found) return found;
  }
  return null;
}
