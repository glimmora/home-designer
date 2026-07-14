// ============================================================
// STRUCTURAL ANALYSIS LIBRARY - SNI Standards
// ============================================================
// Based on:
// - SNI 03-2847-2002: Tata Cara Perhitungan Struktur Beton Bertulang
// - SNI 1726-2012: Beban Minimum untuk Desain Bangunan
// - SNI 1727-2013: Beban Minimum untuk Desain Bangunan dan Struktur Lain
// - SNI 03-1729-2002: Baja Bukan Profil untuk Struktur
//
// All units: force in Newton (N), dimensions in mm, area in mm²
// ============================================================

// ============= STEEL REBAR PROPERTIES (SNI 03-2847-2002) =============
// Standard rebar diameters and cross-sectional areas
export const rebarProperties = {
  D4:  { diameter: 4,    area: 12.57,  weight: 0.099,  name: 'D4 (4mm)',   useCase: 'Wire mesh' },
  D6:  { diameter: 6,    area: 28.27,  weight: 0.222,  name: 'D6 (6mm)',   useCase: 'Sengkang kecil' },
  D8:  { diameter: 8,    area: 50.27,  weight: 0.395,  name: 'D8 (8mm)',   useCase: 'Sengkang standar' },
  D10: { diameter: 10,   area: 78.54,  weight: 0.617,  name: 'D10 (10mm)', useCase: 'Besi plat, sengkang balok' },
  D13: { diameter: 13,   area: 132.73, weight: 1.040,  name: 'D13 (13mm)', useCase: 'Besi utama kecil' },
  D16: { diameter: 16,   area: 201.06, weight: 1.580,  name: 'D16 (16mm)', useCase: 'Besi utama kolom/balok' },
  D19: { diameter: 19,   area: 283.53, weight: 2.230,  name: 'D19 (19mm)', useCase: 'Besi utama kolom besar' },
  D22: { diameter: 22,   area: 380.13, weight: 2.980,  name: 'D22 (22mm)', useCase: 'Besi utama kolom utama' },
  D25: { diameter: 25,   area: 490.87, weight: 3.850,  name: 'D25 (25mm)', useCase: 'Besi utama kolom besar' },
  D29: { diameter: 29,   area: 660.52, weight: 5.180,  name: 'D29 (29mm)', useCase: 'Kolom struktur besar' },
  D32: { diameter: 32,   area: 804.25, weight: 6.310,  name: 'D32 (32mm)', useCase: 'Kolom struktur besar' },
};

// Steel yield strength (fy) per SNI 03-1729-2002
export const steelGrades = {
  BJTD240: { fy: 240, fu: 330, name: 'BJTD-240 (fy=240 MPa)', useCase: 'Besi beton ulir' },
  BJTD280: { fy: 280, fu: 420, name: 'BJTD-280 (fy=280 MPa)', useCase: 'Besi beton ulir' },
  BJTD320: { fy: 320, fu: 480, name: 'BJTD-320 (fy=320 MPa)', useCase: 'Besi beton ulir' },
  BJTD360: { fy: 360, fu: 540, name: 'BJTD-360 (fy=360 MPa)', useCase: 'Besi beton ulir' },
  BJTD400: { fy: 400, fu: 600, name: 'BJTD-400 (fy=400 MPa)', useCase: 'Besi beton ulir standar' },
  BJTP240: { fy: 240, fu: 330, name: 'BJTP-240 (fy=240 MPa)', useCase: 'Besi beton polos' },
  BJTP280: { fy: 280, fu: 420, name: 'BJTP-280 (fy=280 MPa)', useCase: 'Besi beton polos' },
  BJTP320: { fy: 320, fu: 480, name: 'BJTP-320 (fy=320 MPa)', useCase: 'Besi beton polos' },
};

// Default steel grade (most common in Indonesia)
export const DEFAULT_STEEL_GRADE = 'BJTD400';
export const DEFAULT_STIRRUP_GRADE = 'BJTP240';

// ============= CONCRETE PROPERTIES (SNI 03-2847-2002) =============
// f'c = compressive strength (MPa)
export const concreteGrades = {
  'K-150':  { fc: 12,  name: 'K-150 (f\'c=12 MPa)',  useCase: 'Pondasi, struktur ringan' },
  'K-175':  { fc: 14,  name: 'K-175 (f\'c=14 MPa)',  useCase: 'Pondasi, struktur ringan' },
  'K-200':  { fc: 16,  name: 'K-200 (f\'c=16 MPa)',  useCase: 'Struktur rumah tinggal' },
  'K-225':  { fc: 18,  name: 'K-225 (f\'c=18 MPa)',  useCase: 'Struktur rumah tinggal standar' },
  'K-250':  { fc: 20,  name: 'K-250 (f\'c=20 MPa)',  useCase: 'Struktur rumah 2 lantai' },
  'K-300':  { fc: 24,  name: 'K-300 (f\'c=24 MPa)',  useCase: 'Struktur kolom & balok utama' },
  'K-350':  { fc: 28,  name: 'K-350 (f\'c=28 MPa)',  useCase: 'Struktur 3+ lantai' },
  'K-400':  { fc: 32,  name: 'K-400 (f\'c=32 MPa)',  useCase: 'Struktur bangunan tinggi' },
  'K-450':  { fc: 36,  name: 'K-450 (f\'c=36 MPa)',  useCase: 'Struktur bangunan tinggi' },
  'K-500':  { fc: 40,  name: 'K-500 (f\'c=40 MPa)',  useCase: 'Struktur bangunan tinggi' },
};

export const DEFAULT_CONCRETE_GRADE = 'K-250';

// ============= LOADS (SNI 1727-2013) =============
// Minimum live loads per SNI 1727-2013 Table 4-1
export const liveLoads = {
  residential: { value: 2.0, name: 'Tempat Tinggal (2.0 kN/m²)', useCase: 'Kamar, ruang tamu' },
  bedroom:     { value: 2.0, name: 'Kamar Tidur (2.0 kN/m²)',    useCase: 'Kamar tidur' },
  office:      { value: 2.5, name: 'Kantor (2.5 kN/m²)',          useCase: 'Ruang kantor' },
  school:      { value: 2.0, name: 'Sekolah (2.0 kN/m²)',         useCase: 'Ruang kelas' },
  corridor:    { value: 4.0, name: 'Koridor (4.0 kN/m²)',         useCase: 'Koridor, tangga' },
  balcony:     { value: 3.0, name: 'Balkon (3.0 kN/m²)',          useCase: 'Balkon, teras' },
  garage:      { value: 3.0, name: 'Garasi (3.0 kN/m²)',          useCase: 'Garasi mobil' },
  warehouse:   { value: 6.0, name: 'Gudang (6.0 kN/m²)',          useCase: 'Gudang, storage' },
  public:      { value: 5.0, name: 'Ruang Publik (5.0 kN/m²)',    useCase: 'Aula, bioskop' },
};

// Material unit weights for dead load calculation
export const materialWeights = {
  reinforcedConcrete: 24,   // kN/m³
  plainConcrete:      22,   // kN/m³
  brickMasonry:       18,   // kN/m³ (bata merah)
  lightweightBrick:   10,   // kN/m³ (hebel)
  steel:              78.5, // kN/m³
  wood:               6,    // kN/m³
  plaster:            20,   // kN/m³
  ceramicTile:        22,   // kN/m³
  gypsumCeiling:      0.15, // kN/m² (per area)
  pvcCeiling:         0.12, // kN/m² (per area)
  roofTile:           0.45, // kN/m² (per area)
  metalRoof:          0.08, // kN/m² (per area)
};

// ============= SEISMIC LOAD (SNI 1726-2012) =============
// Seismic hazard coefficients for Indonesian cities (Ss & S1)
export const seismicHazardZones = {
  // Zone 1 (low seismic)
  'medan':     { city: 'Medan',     Ss: 0.4, S1: 0.2,  zone: 1 },
  'palembang': { city: 'Palembang', Ss: 0.4, S1: 0.2,  zone: 1 },
  'banjarmasin': { city: 'Banjarmasin', Ss: 0.4, S1: 0.2, zone: 1 },
  // Zone 2 (moderate)
  'jakarta':   { city: 'Jakarta',   Ss: 0.6, S1: 0.3,  zone: 2 },
  'bandung':   { city: 'Bandung',   Ss: 0.7, S1: 0.35, zone: 2 },
  'semarang':  { city: 'Semarang',  Ss: 0.6, S1: 0.3,  zone: 2 },
  'surabaya':  { city: 'Surabaya',  Ss: 0.6, S1: 0.3,  zone: 2 },
  'denpasar':  { city: 'Denpasar',  Ss: 0.6, S1: 0.3,  zone: 2 },
  'pontianak': { city: 'Pontianak', Ss: 0.6, S1: 0.3,  zone: 2 },
  // Zone 3 (high seismic)
  'padang':    { city: 'Padang',    Ss: 0.9, S1: 0.45, zone: 3 },
  'bengkulu':  { city: 'Bengkulu',  Ss: 0.9, S1: 0.45, zone: 3 },
  'lampung':   { city: 'Bandar Lampung', Ss: 0.8, S1: 0.4, zone: 3 },
  'yogya':     { city: 'Yogyakarta', Ss: 0.8, S1: 0.4, zone: 3 },
  // Zone 4 (very high)
  'manado':    { city: 'Manado',    Ss: 1.0, S1: 0.5,  zone: 4 },
  'ternate':   { city: 'Ternate',   Ss: 1.0, S1: 0.5,  zone: 4 },
  'ambon':     { city: 'Ambon',     Ss: 1.0, S1: 0.5,  zone: 4 },
  'biak':      { city: 'Biak',      Ss: 1.0, S1: 0.5,  zone: 4 },
};

export const soilTypes = {
  SA: { name: 'Tanah Batu Keras (SA)', Fa: 0.8, Fv: 0.8, desc: 'Rock, Vs > 1500 m/s' },
  SB: { name: 'Tanah Batu (SB)',       Fa: 0.9, Fv: 0.9, desc: 'Soft rock, 760 < Vs < 1500 m/s' },
  SC: { name: 'Tanah Keras (SC)',      Fa: 1.3, Fv: 1.5, desc: 'Dense soil, 360 < Vs < 760 m/s' },
  SD: { name: 'Tanah Sedang (SD)',     Fa: 1.6, Fv: 2.4, desc: 'Stiff soil, 180 < Vs < 360 m/s' },
  SE: { name: 'Tanah Lunak (SE)',      Fa: 2.4, Fv: 3.5, desc: 'Soft clay, Vs < 180 m/s' },
};

// ============= STRUCTURAL ANALYSIS =============

/**
 * Calculate column capacity per SNI 03-2847-2002 Section 10.3
 * Pn = 0.85 * fc' * (Ag - As) + fy * As
 * φPn = 0.65 * Pn (for tied columns, spiral=0.75)
 */
export function calculateColumnCapacity({
  width,           // mm
  depth,           // mm (column height)
  fc,              // MPa (concrete strength)
  fy,              // MPa (steel yield)
  mainBars,        // array of rebar diameters, e.g. [16, 16, 16, 16]
  concreteGrade,   // key for concreteGrades
}) {
  const fcVal = typeof fc === 'number' ? fc : concreteGrades[concreteGrade || DEFAULT_CONCRETE_GRADE].fc;
  const Ag = width * width; // mm² (assuming square column)
  const As = mainBars.reduce((sum, d) => {
    const rebar = Object.values(rebarProperties).find(r => r.diameter === d);
    return sum + (rebar ? rebar.area : 0);
  }, 0);
  const rho = As / Ag; // reinforcement ratio

  // Nominal axial capacity
  const Pn = 0.85 * fcVal * (Ag - As) + fy * As;
  // Design capacity (φ=0.65 for tied column)
  const phi = 0.65;
  const phiPn = phi * Pn;

  // Check reinforcement ratio (SNI 10.5.1: min 1%, max 8%)
  const rhoMin = 0.01;
  const rhoMax = 0.08;
  const rhoCheck = {
    value: rho,
    min: rhoMin,
    max: rhoMax,
    passed: rho >= rhoMin && rho <= rhoMax,
    warning: rho < rhoMin ? `Tulangan kurang dari minimum SNI (1%). Butuh min ${Math.ceil(rhoMin * Ag)} mm²` :
             rho > rhoMax ? `Tulangan melebihi maximum SNI (8%). Maks ${Math.floor(rhoMax * Ag)} mm²` : null,
  };

  // Minimum bars for tied columns (SNI 10.9.2): min 4 bars
  const minBarsCheck = {
    count: mainBars.length,
    min: 4,
    passed: mainBars.length >= 4,
  };

  // Slenderness ratio (SNI 10.10)
  // kl/r where k=1.0 (uncracked), r=0.3*dimension
  const k = 1.0;
  const r = Math.max(0.1, 0.3 * width); // prevent division by zero
  const slenderness = (k * depth) / r;
  // Protect against NaN/Infinity in isShort calculation
  const stressRatio = Ag > 0 && fcVal > 0 ? Pn / (Ag * fcVal) : 0.1;
  const sqrtVal = Math.sqrt(Math.max(0.001, stressRatio));
  const isShort = slenderness <= 40 / sqrtVal;

  return {
    Ag,             // mm² gross area
    As,             // mm² steel area
    rho,            // reinforcement ratio
    Pn,             // nominal capacity (N)
    phiPn,          // design capacity (N)
    phiPn_kN: phiPn / 1000,
    phiPn_ton: phiPn / 9810,
    slenderness,
    isShort,
    rhoCheck,
    minBarsCheck,
    fc: fcVal,
    fy,
  };
}

/**
 * Calculate beam capacity (flexural) per SNI 03-2847-2002 Section 8
 * Mn = As * fy * (d - a/2)  where a = As*fy / (0.85*fc'*b)
 * φMn = 0.8 * Mn (tension controlled)
 */
export function calculateBeamCapacity({
  width,           // mm (beam width)
  height,          // mm (beam total height)
  cover,           // mm (concrete cover)
  fc,              // MPa
  fy,              // MPa
  tensionBars,     // array of rebar diameters in tension zone
  concreteGrade,
}) {
  const fcVal = typeof fc === 'number' ? fc : concreteGrades[concreteGrade || DEFAULT_CONCRETE_GRADE].fc;
  const d = height - cover - 10; // effective depth (assume 10mm stirrup)
  const b = width;
  const As = tensionBars.reduce((sum, dn) => {
    const rebar = Object.values(rebarProperties).find(r => r.diameter === dn);
    return sum + (rebar ? rebar.area : 0);
  }, 0);

  // Depth of equivalent stress block (protect against division by zero)
  const a = fcVal > 0 && b > 0 ? (As * fy) / (0.85 * fcVal * b) : 0;
  // Nominal moment
  const Mn = As * fy * (d - a / 2);
  const phi = 0.8; // tension controlled
  const phiMn = phi * Mn;

  // Minimum reinforcement (SNI 10.5.1)
  const AsMin = Math.max(
    (0.25 * Math.sqrt(fcVal) * b * d) / fy,
    (1.4 * b * d) / fy
  );
  const AsMax = (0.75 * 0.85 * fcVal * b * d * 0.85) / fy * (1 - Math.sqrt(1 - 2 * 0.85 * 0.005 / 0.85)); // simplified

  // Shear capacity (SNI 11.1)
  // Vc = 0.17 * sqrt(fc') * b * d (for no axial load)
  const Vc = 0.17 * Math.sqrt(fcVal) * b * d; // N
  const phiVc = 0.75 * Vc;

  return {
    As,
    d,
    a,
    Mn,                  // N-mm
    phiMn,               // N-mm
    phiMn_kNm: phiMn / 1e6,
    AsMin,
    AsMax,
    AsCheck: As >= AsMin,
    Vc,                  // N (concrete shear capacity)
    phiVc,               // N
    phiVc_kN: phiVc / 1000,
    fc: fcVal,
    fy,
  };
}

/**
 * Calculate slab capacity per SNI 03-2847-2002
 * For one-way slab: thickness min = L/24 (simple) or L/28 (continuous)
 * For two-way slab: thickness min = L/30 (simple) or L/36 (continuous)
 */
export function calculateSlabCapacity({
  length,          // mm (longer span)
  width,           // mm (shorter span)
  thickness,       // mm
  cover,           // mm
  fc,              // MPa
  fy,              // MPa
  rebarDiameter,   // mm (each way)
  rebarSpacing,    // mm (each way)
  concreteGrade,
}) {
  const fcVal = typeof fc === 'number' ? fc : concreteGrades[concreteGrade || DEFAULT_CONCRETE_GRADE].fc;
  const isTwoWay = width / length > 0.5;

  // Min thickness per SNI 9.5
  const minThickness = isTwoWay ? length / 30 : length / 24;
  const thicknessOK = thickness >= minThickness;

  // Rebar area per meter
  const rebar = Object.values(rebarProperties).find(r => r.diameter === rebarDiameter);
  const AsPerMeter = (rebar ? rebar.area : 0) * (1000 / rebarSpacing);

  // Min reinforcement (SNI 10.5.1 for slabs)
  const AsMin = Math.max(
    (0.25 * Math.sqrt(fcVal) * 1000 * thickness) / fy,
    (1.4 * 1000 * thickness) / fy
  );

  // Moment capacity per meter width
  const d = thickness - cover - rebarDiameter / 2;
  const a = (AsPerMeter * fy) / (0.85 * fcVal * 1000);
  const Mn = AsPerMeter * fy * (d - a / 2); // N-mm per m
  const phi = 0.9;
  const phiMn = phi * Mn;
  const phiMn_kNm_per_m = phiMn / 1e6;

  return {
    isTwoWay,
    minThickness,
    thicknessOK,
    AsPerMeter,
    AsMin,
    AsCheck: AsPerMeter >= AsMin,
    d,
    a,
    phiMn,
    phiMn_kNm_per_m,
    fc: fcVal,
    fy,
  };
}

/**
 * Calculate loads on a floor
 * Dead Load = self weight + permanent fixtures
 * Live Load = per SNI 1727-2013
 * Total = 1.2*DL + 1.6*LL (LRFD per SNI)
 */
export function calculateFloorLoads({
  floorArea_m2,        // m²
  slabThickness_mm,    // mm
  floorHeight_m,       // m
  wallLength_m,        // m (total wall length)
  wallThickness_mm,    // mm
  wallHeight_mm,       // mm (wall height = floor height)
  liveLoadType,        // key in liveLoads
  hasRoof,             // bool (top floor with roof load)
  includeFinishes,     // bool (include tile, plaster, ceiling)
  includePartitions,   // bool (include partition walls)
}) {
  const DL = { slab: 0, walls: 0, finishes: 0, partitions: 0, ceiling: 0, roof: 0 };
  const LL = { live: 0, roof: 0 };

  // Slab self-weight
  DL.slab = materialWeights.reinforcedConcrete * (slabThickness_mm / 1000) * floorArea_m2; // kN

  // Walls (perimeter + partitions)
  DL.walls = materialWeights.reinforcedConcrete * (wallThickness_mm / 1000) * wallHeight_mm / 1000 * wallLength_m;

  if (includeFinishes) {
    DL.finishes = materialWeights.ceramicTile * 0.02 * floorArea_m2; // 2cm tile
    DL.ceiling = materialWeights.gypsumCeiling * floorArea_m2;
  }

  if (includePartitions) {
    DL.partitions = 1.0 * floorArea_m2; // 1 kN/m² partition allowance
  }

  if (hasRoof) {
    DL.roof = materialWeights.roofTile * floorArea_m2 * 0.6; // 60% roof coverage
  }

  // Live load
  const ll = liveLoads[liveLoadType] || liveLoads.residential;
  LL.live = ll.value * floorArea_m2;

  if (hasRoof) {
    LL.roof = 1.0 * floorArea_m2; // 1 kN/m² roof live load
  }

  const totalDL = Object.values(DL).reduce((a, b) => a + b, 0);
  const totalLL = Object.values(LL).reduce((a, b) => a + b, 0);

  // Factored load (LRFD)
  const factoredLoad = 1.2 * totalDL + 1.6 * totalLL;

  return {
    DL,
    LL,
    totalDL,
    totalLL,
    factoredLoad,
    liveLoadType: ll.name,
  };
}

/**
 * Calculate seismic base shear per SNI 1726-2012
 * V = Cs * W
 * Cs = SDS / (R / Ie)    (upper limit check applies)
 */
export function calculateSeismicLoad({
  buildingWeight_kN,    // total seismic weight W
  city,                 // key in seismicHazardZones
  soilType,             // key in soilTypes
  responseModR,         // R (response modification factor)
  importanceFactor,     // Ie (1.0 residential, 1.25 office, 1.5 essential)
  periodT,              // T (fundamental period, sec)
}) {
  const cityData = seismicHazardZones[city] || seismicHazardZones.jakarta;
  const soil = soilTypes[soilType] || soilTypes.SC;

  // Site coefficients
  const Fa = soil.Fa;
  const Fv = soil.Fv;

  // SMS = Fa * Ss, SM1 = Fv * S1
  const SMS = Fa * cityData.Ss;
  const SM1 = Fv * cityData.S1;

  // SDS = 2/3 * SMS, SD1 = 2/3 * SM1
  const SDS = (2 / 3) * SMS;
  const SD1 = (2 / 3) * SM1;

  // Cs = SDS / (R / Ie)
  const Cs_max = SD1 / (periodT * (responseModR / importanceFactor));
  const Cs_min = Math.max(0.044 * SDS * importanceFactor, 0.01);
  let Cs = SDS / (responseModR / importanceFactor);
  Cs = Math.min(Cs, Cs_max);
  Cs = Math.max(Cs, Cs_min);

  // Base shear
  const V = Cs * buildingWeight_kN;

  return {
    city: cityData.city,
    zone: cityData.zone,
    Ss: cityData.Ss,
    S1: cityData.S1,
    Fa,
    Fv,
    SMS,
    SM1,
    SDS,
    SD1,
    Cs,
    V,
    periodT,
    R: responseModR,
    Ie: importanceFactor,
  };
}

// Response modification factors (R) per SNI 1726-2012 Table 12
export const responseModificationFactors = {
  'SMF':     { R: 8,  name: 'Special Moment Frame (R=8)',  useCase: 'Struktur beton bertulang khusus' },
  'IMF':     { R: 5,  name: 'Intermediate MF (R=5)',       useCase: 'Struktur beton bertulang menengah' },
  'OMF':     { R: 3,  name: 'Ordinary MF (R=3)',            useCase: 'Struktur beton bertulang biasa' },
  'SCBF':    { R: 6,  name: 'Special CBF (R=6)',            useCase: 'Braced frame baja khusus' },
  'EBF':     { R: 8,  name: 'Eccentrically BF (R=8)',       useCase: 'Eccentric braced frame' },
  'BEARING': { R: 2,  name: 'Bearing Wall (R=2)',           useCase: 'Dinding penahan' },
  'BUILDING_FRAME': { R: 3, name: 'Building Frame (R=3)', useCase: 'Sistem rangka bangunan' },
};

// Importance factors (Ie) per SNI 1726-2012 Table 4
export const importanceFactors = {
  'I':   { Ie: 1.0,  name: 'Bangunan Biasa (Ie=1.0)',  useCase: 'Rumah tinggal, kantor kecil' },
  'II':  { Ie: 1.0,  name: 'Bangunan Biasa (Ie=1.0)',  useCase: 'Komersial biasa' },
  'III': { Ie: 1.25, name: 'Substansial (Ie=1.25)',    useCase: 'Sekolah, tempat umum' },
  'IV':  { Ie: 1.5,  name: 'Esensial (Ie=1.5)',        useCase: 'Rumah sakit, pemadam' },
};

// ============= SNI REBAR LAYOUT GENERATOR =============
// Generate SNI-compliant rebar layout for a column
export function generateSNIRebarLayout({
  columnSize_mm,       // square column side
  fc_grade,            // concrete grade key
  steel_grade,         // steel grade key
  numMainBars,         // number of main bars (typically 4, 6, 8)
  mainBarDiameter,     // mm (D16, D19, D22, D25)
  stirrupDiameter,     // mm (typically D8, D10)
  stirrupSpacing,      // mm (typically 100-150)
  cover,               // mm (concrete cover, typically 40mm)
  floorHeight_mm,      // mm
}) {
  const fc = concreteGrades[fc_grade || DEFAULT_CONCRETE_GRADE].fc;
  const fy = steelGrades[steel_grade || DEFAULT_STEEL_GRADE].fy;
  const stirrupFy = steelGrades[DEFAULT_STIRRUP_GRADE].fy;

  const mainBars = Array(numMainBars).fill(mainBarDiameter);
  const capacity = calculateColumnCapacity({
    width: columnSize_mm,
    depth: floorHeight_mm,
    fc,
    fy,
    mainBars,
  });

  // Rebar positions (corners + sides)
  const positions = [];
  const cornerOffset = cover + stirrupDiameter + mainBarDiameter / 2;
  const sideLength = columnSize_mm - 2 * cornerOffset;

  // Corner bars
  positions.push({ x: -sideLength / 2, y: -sideLength / 2, type: 'main' });
  positions.push({ x:  sideLength / 2, y: -sideLength / 2, type: 'main' });
  positions.push({ x: -sideLength / 2, y:  sideLength / 2, type: 'main' });
  positions.push({ x:  sideLength / 2, y:  sideLength / 2, type: 'main' });

  // Additional side bars (if numMainBars > 4)
  if (numMainBars >= 6) {
    positions.push({ x: 0, y: -sideLength / 2, type: 'main' });
    positions.push({ x: 0, y:  sideLength / 2, type: 'main' });
  }
  if (numMainBars >= 8) {
    positions.push({ x: -sideLength / 2, y: 0, type: 'main' });
    positions.push({ x:  sideLength / 2, y: 0, type: 'main' });
  }

  // Stirrups
  const stirrups = [];
  const stirrupCount = Math.floor(floorHeight_mm / stirrupSpacing);
  for (let i = 0; i <= stirrupCount; i++) {
    stirrups.push({
      z: i * stirrupSpacing,
      size: columnSize_mm - 2 * cover,
    });
  }

  return {
    mainBars: positions,
    stirrups,
    capacity,
    specs: {
      fc,
      fy,
      stirrupFy,
      numMainBars,
      mainBarDiameter,
      stirrupDiameter,
      stirrupSpacing,
      cover,
    },
    sniChecks: {
      rhoPassed: capacity.rhoCheck.passed,
      minBarsPassed: capacity.minBarsCheck.passed,
      isShortColumn: capacity.isShort,
    },
  };
}

// ============= COMPREHENSIVE BUILDING ANALYSIS =============
export function analyzeBuilding({
  floors,              // array of floors from store
  plot,                // { width, depth } in cm
  building,            // { width, depth, offsetX, offsetY } in cm
  settings,            // { concreteGrade, steelGrade, mainBarDiameter, stirrupDiameter, ... }
  seismic,             // { city, soilType, responseModR, importanceFactor, periodT }
  liveLoadType,        // key in liveLoads
}) {
  // Guard against invalid input
  if (!floors || !Array.isArray(floors) || floors.length === 0) {
    return {
      floors: [],
      totals: {
        totalWeight_kN: 0, totalSeismicWeight_kN: 0, totalColumns: 0,
        totalWalls_m: 0, totalFloorArea_m2: 0, avgColumnCapacity_kN: 0,
        minColumnCapacity_kN: 0, maxColumnUtilization: 0, safetyScore: 100,
      },
      seismic: null,
      safetyChecks: { columnsAdequate: true, warnings: ['Tidak ada lantai untuk dianalisis'], critical: [] },
    };
  }
  const results = {
    floors: [],
    totals: {
      totalWeight_kN: 0,
      totalSeismicWeight_kN: 0,
      totalColumns: 0,
      totalWalls_m: 0,
      totalFloorArea_m2: 0,
      avgColumnCapacity_kN: 0,
      minColumnCapacity_kN: Infinity,
      maxColumnUtilization: 0,
    },
    seismic: null,
    safetyChecks: {
      columnsAdequate: true,
      warnings: [],
      critical: [],
    },
  };

  const fc = concreteGrades[settings.concreteGrade || DEFAULT_CONCRETE_GRADE].fc;
  const fy = steelGrades[settings.steelGrade || DEFAULT_STEEL_GRADE].fy;
  const mainBarD = settings.mainBarDiameter || 16;
  const stirrupD = settings.stirrupDiameter || 8;
  const stirrupSpacing = settings.stirrupSpacing || 150;
  const cover = settings.cover || 40;
  const slabThickness = settings.slabThickness || 120;
  const wallThickness = settings.wallThickness || 150;

  const buildingArea_m2 = (building.width * building.depth) / 10000;

  // Analyze each floor
  floors.forEach((floor, idx) => {
    const floorHeight_m = floor.height / 100;
    const floorArea_m2 = buildingArea_m2;

    // Total wall length
    const wallLength_m = floor.walls.reduce((sum, w) => {
      const dx = w.x2 - w.x1;
      const dy = w.y2 - w.y1;
      return sum + Math.sqrt(dx * dx + dy * dy) / 100;
    }, 0);

    // Loads
    const isTopFloor = idx === floors.length - 1;
    const loads = calculateFloorLoads({
      floorArea_m2,
      slabThickness_mm: slabThickness,
      floorHeight_m,
      wallLength_m,
      wallThickness_mm: wallThickness,
      wallHeight_mm: floor.height,
      liveLoadType,
      hasRoof: isTopFloor,
      includeFinishes: true,
      includePartitions: true,
    });

    // Column analysis
    const columnResults = [];
    const columnSize = floor.columns[0]?.size || 30; // cm
    const columnSize_mm = columnSize * 10;
    const numMainBars = settings.numMainBars || 4;

    // Generate SNI rebar layout only if there are actual columns
    let rebarLayout = null;
    if (floor.columns.length > 0) {
      rebarLayout = generateSNIRebarLayout({
        columnSize_mm,
        fc_grade: settings.concreteGrade,
        steel_grade: settings.steelGrade,
        numMainBars,
        mainBarDiameter: mainBarD,
        stirrupDiameter: stirrupD,
        stirrupSpacing,
        cover,
        floorHeight_mm: floor.height,
      });
    }

    floor.columns.forEach((col) => {
      const colSize_mm = col.size * 10;
      const capacity = calculateColumnCapacity({
        width: colSize_mm,
        depth: floor.height,
        fc,
        fy,
        mainBars: Array(numMainBars).fill(mainBarD),
      });

      // Load per column = factored load / number of columns
      const loadPerColumn_kN = loads.factoredLoad / Math.max(floor.columns.length, 1);
      const utilization = (loadPerColumn_kN * 1000) / capacity.phiPn; // ratio

      columnResults.push({
        id: col.id,
        size_mm: colSize_mm,
        capacity_kN: capacity.phiPn / 1000,
        capacity_ton: capacity.phiPn / 9810,
        load_kN: loadPerColumn_kN,
        utilization,
        safe: utilization <= 1.0,
        rho: capacity.rho,
        rhoCheck: capacity.rhoCheck,
        minBarsCheck: capacity.minBarsCheck,
      });

      results.totals.maxColumnUtilization = Math.max(results.totals.maxColumnUtilization, utilization);
      results.totals.minColumnCapacity_kN = Math.min(results.totals.minColumnCapacity_kN, capacity.phiPn / 1000);
    });

    if (columnResults.length > 0) {
      const avgCap = columnResults.reduce((s, c) => s + c.capacity_kN, 0) / columnResults.length;
      results.totals.avgColumnCapacity_kN = (results.totals.avgColumnCapacity_kN * idx + avgCap) / (idx + 1);
    }

    // Wall analysis (as beams)
    const wallResults = floor.walls.map((wall) => {
      const dx = wall.x2 - wall.x1;
      const dy = wall.y2 - wall.y1;
      const length_m = Math.sqrt(dx * dx + dy * dy) / 100;
      const length_mm = length_m * 1000;

      // Wall as deep beam
      const beamHeight = floor.height; // mm
      const beamWidth = wallThickness; // mm
      const beam = calculateBeamCapacity({
        width: beamWidth,
        height: beamHeight,
        cover,
        fc,
        fy,
        tensionBars: [mainBarD, mainBarD], // 2 bars bottom
        concreteGrade: settings.concreteGrade,
      });

      // Distributed load on wall (from tributary area)
      const tributaryWidth = building.width / 100 / 2; // half bay
      const wallLoad_kN_m = loads.factoredLoad / (buildingArea_m2 * 4) * tributaryWidth;
      const maxMoment_kNm = (wallLoad_kN_m * length_m * length_m) / 8; // simply supported
      const maxShear_kN = (wallLoad_kN_m * length_m) / 2;

      return {
        id: wall.id,
        length_m,
        capacity_Mn_kNm: beam.phiMn_kNm,
        capacity_Vc_kN: beam.phiVc_kN,
        load_moment_kNm: maxMoment_kNm,
        load_shear_kN: maxShear_kN,
        momentUtilization: maxMoment_kNm / beam.phiMn_kNm,
        shearUtilization: maxShear_kN / beam.phiVc_kN,
        safe: maxMoment_kNm <= beam.phiMn_kNm && maxShear_kN <= beam.phiVc_kN,
      };
    });

    // Slab analysis
    const slab = calculateSlabCapacity({
      length: Math.max(building.width, building.depth), // mm
      width: Math.min(building.width, building.depth),
      thickness: slabThickness,
      cover,
      fc,
      fy,
      rebarDiameter: 10, // D10
      rebarSpacing: 150,
      concreteGrade: settings.concreteGrade,
    });

    results.totals.totalWeight_kN += loads.totalDL + loads.totalLL;
    results.totals.totalSeismicWeight_kN += loads.totalDL + 0.25 * loads.totalLL; // SNI: 25% LL for seismic
    results.totals.totalColumns += floor.columns.length;
    results.totals.totalWalls_m += wallLength_m;
    results.totals.totalFloorArea_m2 += floorArea_m2;

    results.floors.push({
      name: floor.name,
      height: floor.height,
      area_m2: floorArea_m2,
      wallLength_m,
      columnCount: floor.columns.length,
      loads,
      columns: columnResults,
      walls: wallResults,
      slab,
      rebarLayout,
    });

    // Safety checks
    columnResults.forEach((col) => {
      if (!col.safe) {
        results.safetyChecks.columnsAdequate = false;
        results.safetyChecks.critical.push(
          `${floor.name} kolom #${col.id}: utilization ${(col.utilization * 100).toFixed(1)}% (>100%)`
        );
      } else if (col.utilization > 0.85) {
        results.safetyChecks.warnings.push(
          `${floor.name} kolom #${col.id}: utilization ${(col.utilization * 100).toFixed(1)}% (>85%, mendekati batas)`
        );
      }
    });

    if (rebarLayout) {
      if (!rebarLayout.sniChecks.rhoPassed) {
        results.safetyChecks.warnings.push(
          `${floor.name}: Rasio tulangan tidak memenuhi SNI 03-2847-2002 (1%-8%)`
        );
      }
      if (!rebarLayout.sniChecks.minBarsPassed) {
        results.safetyChecks.critical.push(
          `${floor.name}: Jumlah tulangan utama kurang dari minimum SNI (4 batang)`
        );
      }
    }
  });

  // Seismic analysis
  if (seismic) {
    results.seismic = calculateSeismicLoad({
      buildingWeight_kN: results.totals.totalSeismicWeight_kN,
      city: seismic.city,
      soilType: seismic.soilType,
      responseModR: seismic.responseModR,
      importanceFactor: seismic.importanceFactor,
      periodT: seismic.periodT || 0.1 * floors.length,
    });

    // Check if columns can resist seismic load
    const totalColumnCapacity = results.totals.avgColumnCapacity_kN * results.totals.totalColumns;
    if (results.seismic.V > totalColumnCapacity * 0.6) {
      results.safetyChecks.warnings.push(
        `Gaya gempa (${results.seismic.V.toFixed(1)} kN) signifikan terhadap total kapasitas kolom`
      );
    }
  }

  if (results.totals.minColumnCapacity_kN === Infinity) {
    results.totals.minColumnCapacity_kN = 0;
  }

  results.totals.safetyScore = Math.max(0, 100 - results.safetyChecks.critical.length * 25 - results.safetyChecks.warnings.length * 5);

  return results;
}

// ============= FORMAT HELPERS =============
export function formatForce(kN) {
  if (kN >= 1000) return (kN / 1000).toFixed(2) + ' MN';
  return kN.toFixed(1) + ' kN';
}

export function formatMoment(kNm) {
  if (kNm >= 1000) return (kNm / 1000).toFixed(2) + ' MNm';
  return kNm.toFixed(2) + ' kNm';
}

export function formatUtilization(ratio) {
  const pct = (ratio * 100).toFixed(1);
  if (ratio > 1.0) return { text: `${pct}% (OVERLOAD!)`, color: 'red' };
  if (ratio > 0.85) return { text: `${pct}% (Tinggi)`, color: 'amber' };
  if (ratio > 0.6) return { text: `${pct}% (Cukup)`, color: 'blue' };
  return { text: `${pct}% (Aman)`, color: 'green' };
}
