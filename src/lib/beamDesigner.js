// ============================================================
// SNI BEAM DESIGNER - Auto-sizing balok per SNI 03-2847-2002
// User input: bentang (span) + beban → auto hitung ukuran + rebar
// ============================================================

import { concreteGrades, steelGrades, rebarProperties, DEFAULT_CONCRETE_GRADE, DEFAULT_STEEL_GRADE } from './structuralAnalysis';

// SNI standard beam presets (rumah tinggal)
export const beamPresets = {
  'ring-balok': {
    name: 'Ring Balok (Tiang)',
    desc: 'Balok pengikat di atas kolom, rumah 1 lantai',
    span_m: 3,
    width_mm: 150,
    height_mm: 200,
    mainBars: 4,
    mainDiameter: 10,
    stirrupDiameter: 8,
    stirrupSpacing: 150,
    fc_grade: 'K-200',
    fy_grade: 'BJTD400',
  },
  'balok-lantai1': {
    name: 'Balok Lantai 1',
    desc: 'Balok utama lantai 1, beban lantai + atap',
    span_m: 4,
    width_mm: 200,
    height_mm: 300,
    mainBars: 4,
    mainDiameter: 13,
    stirrupDiameter: 8,
    stirrupSpacing: 100,
    fc_grade: 'K-250',
    fy_grade: 'BJTD400',
  },
  'balok-lantai2': {
    name: 'Balok Lantai 2',
    desc: 'Balok utama lantai 2, beban lantai + atap',
    span_m: 5,
    width_mm: 200,
    height_mm: 350,
    mainBars: 6,
    mainDiameter: 16,
    stirrupDiameter: 10,
    stirrupSpacing: 100,
    fc_grade: 'K-250',
    fy_grade: 'BJTD400',
  },
  'balok-bentang-panjang': {
    name: 'Balok Bentang Panjang',
    desc: 'Bentang 6m+, rumah 2+ lantai',
    span_m: 6,
    width_mm: 250,
    height_mm: 450,
    mainBars: 6,
    mainDiameter: 19,
    stirrupDiameter: 10,
    stirrupSpacing: 75,
    fc_grade: 'K-300',
    fy_grade: 'BJTD400',
  },
  'balok-kantilever': {
    name: 'Balok Kantilever',
    desc: 'Balok overhang, balkon, kanopi',
    span_m: 1.5,
    width_mm: 200,
    height_mm: 250,
    mainBars: 4,
    mainDiameter: 13,
    stirrupDiameter: 8,
    stirrupSpacing: 100,
    fc_grade: 'K-250',
    fy_grade: 'BJTD400',
  },
};

// SNI standard beam dimensions (L/bentang → tinggi minimum)
// SNI 03-2847-2002 Table 9.5a: Min height for beams
// h = L/16 (simply supported), L/18 (continuous), L/21 (cantilever)
export const spanToDepthRatios = {
  'simply-supported': { name: 'Sederhana (L/16)', ratio: 16 },
  'continuous': { name: 'Kontinu (L/21)', ratio: 21 },
  'cantilever': { name: 'Kantilever (L/8)', ratio: 8 },
};

// SNI standard beam widths
export const standardBeamWidths = [150, 200, 250, 300]; // mm

/**
 * AUTO-CALCULATE beam dimensions per SNI 03-2847-2002
 * Input: span (m), load (kN/m), support type → Output: width, height, rebar
 */
export function autoCalculateBeam({
  span_m,           // bentang dalam meter
  load_kN_per_m,    // beaban merata (kN/m) - dead + live
  supportType,      // 'simply-supported' | 'continuous' | 'cantilever'
  concreteGrade,    // key in concreteGrades
  steelGrade,       // key in steelGrades
  numMainBars,      // number of main bars (default 4)
  mainDiameter,     // mm
  stirrupDiameter,  // mm
  cover,            // mm (default 40)
}) {
  const fcGrade = concreteGrades[concreteGrade || DEFAULT_CONCRETE_GRADE];
  const fyGrade = steelGrades[steelGrade || DEFAULT_STEEL_GRADE];
  const fc = fcGrade.fc;
  const fy = fyGrade.fy;
  const cov = cover || 40;

  // 1. MINIMUM HEIGHT per SNI 9.5a
  const ratio = spanToDepthRatios[supportType || 'simply-supported'].ratio;
  const minHeight_mm = Math.ceil((span_m * 1000) / ratio / 10) * 10; // round to 10mm
  // SNI practical: also L/10 minimum for residential
  const practicalHeight = Math.max(minHeight_mm, Math.ceil(span_m * 100));

  // 2. WIDTH: typically 2/3 to 1/2 of height, min 150mm
  const recommendedWidth = Math.max(150, Math.round(practicalHeight * 0.5 / 10) * 10);
  // Round to standard
  const width = standardBeamWidths.find(w => w >= recommendedWidth) || 300;

  // 3. EFFECTIVE DEPTH
  const d = practicalHeight - cov - stirrupDiameter - mainDiameter / 2;

  // 4. MAX MOMENT (kN·m)
  let maxMoment_kNm;
  const w = load_kN_per_m || 15; // default 15 kN/m
  const L = span_m;
  if (supportType === 'cantilever') {
    maxMoment_kNm = (w * L * L) / 2;
  } else if (supportType === 'continuous') {
    maxMoment_kNm = (w * L * L) / 12; // negative moment at support
  } else {
    maxMoment_kNm = (w * L * L) / 8; // simply supported
  }

  // 5. REQUIRED STEEL AREA (As) per SNI 8.1
  // Mu = φ·As·fy·(d - a/2), φ = 0.8
  // Approximate: As ≈ Mu / (0.9 · fy · d)
  const Mu_Nmm = maxMoment_kNm * 1e6; // convert kN·m to N·mm
  const phi = 0.8;
  const As_required = Mu_Nmm / (phi * fy * d); // mm²

  // 6. MINIMUM STEEL per SNI 10.5.1
  const As_min = Math.max(
    (0.25 * Math.sqrt(fc) * width * d) / fy,
    (1.4 * width * d) / fy
  );

  // 7. SELECT REBAR
  const numBars = numMainBars || 4;
  const dia = mainDiameter || 13;
  const rebar = rebarProperties[`D${dia}`] || rebarProperties.D13;
  const As_provided = rebar.area * numBars;

  // 8. CHECK
  const steelOK = As_provided >= Math.max(As_required, As_min);
  const rho = As_provided / (width * d);
  const rhoOK = rho >= 0.001 && rho <= 0.08; // SNI 10.5.1 & 10.9.1

  // 9. SHEAR CAPACITY per SNI 11.1
  // Vc = 0.17 · √fc · b · d
  const Vc = 0.17 * Math.sqrt(fc) * width * d; // N
  const phiVc = 0.75 * Vc;
  const maxShear_kN = supportType === 'cantilever' ? w * L : (w * L) / 2;
  const shearOK = phiVc >= maxShear_kN * 1000;

  // 10. STIRRUP SPACING per SNI 7.10.5
  // Max spacing = min(d/2, 600mm) for non-seismic
  const maxStirrupSpacing = Math.min(d / 2, 300);
  // If shear > φVc/2, need stirrups at d/2 max
  const needsTightStirrups = (maxShear_kN * 1000) > (phiVc / 2);
  const recommendedStirrupSpacing = needsTightStirrups
    ? Math.min(100, Math.round(maxStirrupSpacing / 25) * 25)
    : Math.min(150, Math.round(maxStirrupSpacing / 25) * 25);

  // 11. BAR ARRANGEMENT
  const arrangement = generateBarArrangement(width, practicalHeight, cov, dia, numBars, stirrupDiameter);

  // 12. DEFLECTION CHECK (simplified)
  // Δmax = 5wL⁴ / (384EI)
  const E = 4700 * Math.sqrt(fc); // MPa, SNI 8.5.1
  const Ig = (width * Math.pow(practicalHeight, 3)) / 12; // gross moment of inertia mm⁴
  const deflection_mm = (5 * w * Math.pow(L * 1000, 4)) / (384 * E * 1000 * Ig);
  const deflectionLimit = L * 1000 / 360; // L/360 for live load
  const deflectionOK = deflection_mm <= deflectionLimit;

  return {
    // Input
    span_m,
    load_kN_per_m: w,
    supportType,
    supportTypeName: spanToDepthRatios[supportType || 'simply-supported'].name,

    // Auto-calculated dimensions
    width_mm: width,
    height_mm: practicalHeight,
    effectiveDepth_mm: Math.round(d),

    // Rebar
    numMainBars: numBars,
    mainDiameter_mm: dia,
    mainBarName: rebar.name,
    As_required_mm2: Math.round(As_required),
    As_min_mm2: Math.round(As_min),
    As_provided_mm2: Math.round(As_provided),
    stirrupDiameter_mm: stirrupDiameter || 8,
    recommendedStirrupSpacing_mm: recommendedStirrupSpacing,
    cover_mm: cov,

    // Forces
    maxMoment_kNm: maxMoment_kNm.toFixed(2),
    maxShear_kN: maxShear_kN.toFixed(2),

    // Capacity
    phiVc_kN: (phiVc / 1000).toFixed(2),
    nominalMoment_kNm: ((As_provided * fy * (d - (As_provided * fy) / (0.85 * fc * width)) / 2)) / 1e6,
    phiMoment_kNm: (phi * (As_provided * fy * (d - (As_provided * fy) / (0.85 * fc * width)) / 2)) / 1e6,

    // Checks
    steelOK,
    rho: (rho * 100).toFixed(3),
    rhoOK,
    shearOK,
    deflection_mm: deflection_mm.toFixed(2),
    deflectionLimit_mm: deflectionLimit.toFixed(0),
    deflectionOK,

    // Overall
    safe: steelOK && rhoOK && shearOK && deflectionOK,
    concreteGrade: fcGrade.name,
    steelGrade: fyGrade.name,
    fc: fc,
    fy: fy,

    // Arrangement
    arrangement,

    // Weight
    mainBarWeight_kg: ((numBars * rebar.weight * L) ).toFixed(2), // kg
    stirrupWeight_kg: ((arrangement.stirrupCount * (2 * (width - 2*cov) + 2 * (practicalHeight - 2*cov)) / 1000 * 0.395)).toFixed(2),
  };
}

// Generate bar arrangement layout
function generateBarArrangement(width, height, cover, mainDia, numBars, stirrupDia) {
  const innerW = width - 2 * cover - stirrupDia;
  const innerH = height - 2 * cover - stirrupDia;

  let positions = [];
  if (numBars === 2) {
    positions = [
      { x: -innerW / 4, y: -innerH / 4, label: 'T' },
      { x: innerW / 4, y: -innerH / 4, label: 'T' },
    ];
  } else if (numBars === 3) {
    positions = [
      { x: -innerW / 3, y: -innerH / 4, label: 'T' },
      { x: 0, y: -innerH / 4, label: 'T' },
      { x: innerW / 3, y: -innerH / 4, label: 'T' },
    ];
  } else if (numBars === 4) {
    // 2 top + 2 bottom
    positions = [
      { x: -innerW / 3, y: -innerH / 3, label: 'T' },
      { x: innerW / 3, y: -innerH / 3, label: 'T' },
      { x: -innerW / 3, y: innerH / 3, label: 'B' },
      { x: innerW / 3, y: innerH / 3, label: 'B' },
    ];
  } else if (numBars === 6) {
    // 3 top + 3 bottom
    positions = [
      { x: -innerW / 3, y: -innerH / 3, label: 'T' },
      { x: 0, y: -innerH / 3, label: 'T' },
      { x: innerW / 3, y: -innerH / 3, label: 'T' },
      { x: -innerW / 3, y: innerH / 3, label: 'B' },
      { x: 0, y: innerH / 3, label: 'B' },
      { x: innerW / 3, y: innerH / 3, label: 'B' },
    ];
  }

  // Stirrup count along span
  const stirrupCount = Math.ceil((3 * 1000) / 150); // assume 3m span, 150mm spacing

  return {
    mainBarPositions: positions,
    stirrupCount,
    stirrupSize: { width: innerW, height: innerH },
  };
}

// ============================================================
// SLOOF (FOUNDATION BEAM) DESIGNER
// SNI 03-2847-2002 + SNI 1726-2012
// Sloof = balok pengikat di atas pondasi yang mengikat kolom
// Fungsi: meratakan beban kolom ke pondasi, tahan gempa
// ============================================================

export const sloofPresets = {
  'sloof-1lt': {
    name: 'Sloof Rumah 1 Lantai',
    desc: 'Sloof standar rumah 1 lantai, di atas pondasi batu kali/telapak',
    span_m: 3,
    width_mm: 150,
    height_mm: 200,
    mainBars: 4,
    mainDiameter: 10,
    stirrupDiameter: 8,
    stirrupSpacing: 150,
    fc_grade: 'K-200',
    fy_grade: 'BJTD400',
  },
  'sloof-2lt': {
    name: 'Sloof Rumah 2 Lantai',
    desc: 'Sloof rumah 2 lantai, beban lebih besar',
    span_m: 4,
    width_mm: 200,
    height_mm: 250,
    mainBars: 4,
    mainDiameter: 13,
    stirrupDiameter: 8,
    stirrupSpacing: 150,
    fc_grade: 'K-250',
    fy_grade: 'BJTD400',
  },
  'sloof-3lt': {
    name: 'Sloof Rumah 3 Lantai',
    desc: 'Sloof rumah 3 lantai, beban lantai + atap maksimal',
    span_m: 4,
    width_mm: 200,
    height_mm: 300,
    mainBars: 6,
    mainDiameter: 13,
    stirrupDiameter: 10,
    stirrupSpacing: 100,
    fc_grade: 'K-250',
    fy_grade: 'BJTD400',
  },
  'sloof-berat': {
    name: 'Sloof Beban Berat',
    desc: 'Sloof untuk tanah lunak / bangunan komersial',
    span_m: 5,
    width_mm: 250,
    height_mm: 300,
    mainBars: 6,
    mainDiameter: 16,
    stirrupDiameter: 10,
    stirrupSpacing: 100,
    fc_grade: 'K-300',
    fy_grade: 'BJTD400',
  },
};

// SNI minimum sloof dimensions per stories
export const sloofMinDimensions = {
  1: { width: 150, height: 200, mainDia: 10, stirrupDia: 8, stirrupSpacing: 150 },
  2: { width: 200, height: 250, mainDia: 13, stirrupDia: 8, stirrupSpacing: 150 },
  3: { width: 200, height: 300, mainDia: 13, stirrupDia: 10, stirrupSpacing: 100 },
};

/**
 * AUTO-CALCULATE SLOOF dimensions per SNI
 * Sloof adalah balok kontinyu di atas pondasi
 * Beban: berat dinding + sebagian beban lantai + tahan tarik gempa
 */
export function autoCalculateSloof({
  span_m,           // jarak antar kolom (m)
  numStories,       // jumlah lantai bangunan
  wallLoad_kN_per_m, // beban dinding di atas sloof (kN/m)
  concreteGrade,
  steelGrade,
  cover,            // mm, biasanya 50 (karena kontak tanah)
}) {
  const fcGrade = concreteGrades[concreteGrade || 'K-200'];
  const fyGrade = steelGrades[steelGrade || 'BJTD400'];
  const fc = fcGrade.fc;
  const fy = fyGrade.fy;
  const cov = cover || 50; // 50mm untuk sloof (kontak tanah)

  // 1. MINIMUM SLOOF DIMENSIONS per SNI berdasarkan jumlah lantai
  const minDim = sloofMinDimensions[numStories] || sloofMinDimensions[2];

  // 2. KOMBINASI BEBAN: DL (dinding+sedikit lantai) + LL (sebagian)
  // DL dinding bata = 18 kN/m³ x tinggi dinding 3m x tebal 0.15m = 8.1 kN/m
  // + beban lantai 1.5 kN/m x span/2 (tributary)
  const wallLoad = wallLoad_kN_per_m || 8;
  const floorLoadTributary = numStories * 1.5 * (span_m / 2);
  const totalLoad_kN_per_m = wallLoad + floorLoadTributary;

  // 3. MOMEN MAKSIMUM (sloof = balok kontinyu multi-span)
  // Untuk 2+ span: M = wL²/10 (negatif di tumpuan)
  const maxMoment_kNm = (totalLoad_kN_per_m * span_m * span_m) / 10;
  const maxShear_kN = (totalLoad_kN_per_m * span_m) / 2;

  // 4. TINGGI MINIMUM: L/15 (lebih kecil dari balok biasa karena kontinu)
  const minHeightFromSpan = Math.ceil((span_m * 1000) / 15 / 10) * 10;
  const height = Math.max(minDim.height, minHeightFromSpan);

  // 5. LEBAR MINIMUM
  const width = Math.max(minDim.width, Math.round(height * 0.7 / 10) * 10);

  // 6. EFEKTIF DEPTH
  const d = height - cov - minDim.stirrupDia - minDim.mainDia / 2;

  // 7. AS REQUIRED (As ≈ Mu / (0.8 x fy x d))
  const Mu_Nmm = maxMoment_kNm * 1e6;
  const phi = 0.8;
  const As_required = Mu_Nmm / (phi * fy * d);
  const As_min = Math.max(
    (0.25 * Math.sqrt(fc) * width * d) / fy,
    (1.4 * width * d) / fy
  );

  // 8. PILIH TULANGAN (default 4 utama, 2 atas + 2 bawah untuk kontinyu)
  const numBars = minDim.mainDia >= 13 ? 4 : 4;
  const dia = minDim.mainDia;
  const rebar = rebarProperties[`D${dia}`];
  const As_provided = rebar.area * numBars;

  // 9. CHECK
  const steelOK = As_provided >= Math.max(As_required, As_min);
  const rho = As_provided / (width * d);
  const rhoOK = rho >= 0.001 && rho <= 0.08;

  // 10. SHEAR (Vc = 0.17 x √fc x b x d)
  const Vc = 0.17 * Math.sqrt(fc) * width * d;
  const phiVc = 0.75 * Vc;
  const shearOK = phiVc >= maxShear_kN * 1000;

  // 11. STIRRUP SPACING
  // Sloof: spacing lebih rapat di zona tumpuan (L/4), lebih longgar di tengah
  const stirrupSpacingSupport = Math.min(minDim.stirrupSpacing, 100);
  const stirrupSpacingField = minDim.stirrupSpacing;

  // 12. BAR ARRANGEMENT (4 bars: 2 top + 2 bottom)
  const arrangement = generateBarArrangement(width, height, cov, dia, 4, minDim.stirrupDia);

  // 13. STIRRUP COUNT along span
  // Total stirrups = (L/4 ÷ s_support) x 2 ends + (L/2 ÷ s_field) center
  const L_mm = span_m * 1000;
  const stirrupsAtSupport = Math.ceil((L_mm / 4) / stirrupSpacingSupport);
  const stirrupsAtField = Math.ceil((L_mm / 2) / stirrupSpacingField);
  const totalStirrups = stirrupsAtSupport * 2 + stirrupsAtField;

  // 14. WEIGHT
  const mainBarWeight_kg = numBars * rebar.weight * span_m;
  const stirrupPerimeter = 2 * (width - 2 * cov) + 2 * (height - 2 * cov); // mm
  const stirrupWeight_kg = (totalStirrups * stirrupPerimeter / 1000) * rebarProperties[`D${minDim.stirrupDia}`].weight;

  // 15. CONCRETE VOLUME
  const concreteVol_m3 = (width / 1000) * (height / 1000) * span_m;

  return {
    type: 'sloof',
    span_m,
    numStories,
    width_mm: width,
    height_mm: height,
    effectiveDepth_mm: Math.round(d),

    numMainBars: numBars,
    mainDiameter_mm: dia,
    mainBarName: rebar.name,
    As_required_mm2: Math.round(As_required),
    As_min_mm2: Math.round(As_min),
    As_provided_mm2: Math.round(As_provided),
    stirrupDiameter_mm: minDim.stirrupDia,
    stirrupSpacingSupport_mm: stirrupSpacingSupport,
    stirrupSpacingField_mm: stirrupSpacingField,
    cover_mm: cov,

    maxMoment_kNm: maxMoment_kNm.toFixed(2),
    maxShear_kN: maxShear_kN.toFixed(2),
    phiVc_kN: (phiVc / 1000).toFixed(2),

    steelOK,
    rho: (rho * 100).toFixed(3),
    rhoOK,
    shearOK,
    safe: steelOK && rhoOK && shearOK,

    concreteGrade: fcGrade.name,
    steelGrade: fyGrade.name,
    fc,
    fy,

    arrangement,
    totalStirrups,
    mainBarWeight_kg: mainBarWeight_kg.toFixed(2),
    stirrupWeight_kg: stirrupWeight_kg.toFixed(2),
    totalSteelWeight_kg: (parseFloat(mainBarWeight_kg) + parseFloat(stirrupWeight_kg.toFixed(2))).toFixed(2),
    concreteVolume_m3: concreteVol_m3.toFixed(3),
  };
}

// SNI-compliant sloof options for given stories + span
export function getSNISloofOptions(numStories, span_m) {
  const minDim = sloofMinDimensions[numStories] || sloofMinDimensions[2];
  const options = [
    {
      label: 'Minimum SNI',
      width: minDim.width,
      height: minDim.height,
      mainBars: 4,
      mainDiameter: minDim.mainDia,
      stirrupDiameter: minDim.stirrupDia,
      stirrupSpacing: minDim.stirrupSpacing,
      fc_grade: numStories >= 2 ? 'K-250' : 'K-200',
    },
    {
      label: 'Rekomendasi',
      width: Math.max(minDim.width, Math.round(span_m * 50 / 10) * 10),
      height: Math.max(minDim.height, Math.ceil((span_m * 1000) / 15 / 10) * 10),
      mainBars: 4,
      mainDiameter: Math.max(minDim.mainDia, numStories >= 2 ? 13 : 10),
      stirrupDiameter: minDim.stirrupDia,
      stirrupSpacing: Math.min(minDim.stirrupSpacing, 100),
      fc_grade: 'K-250',
    },
    {
      label: 'Heavy Duty',
      width: Math.max(200, Math.round(span_m * 60 / 10) * 10),
      height: Math.max(minDim.height + 50, Math.ceil((span_m * 1000) / 12 / 10) * 10),
      mainBars: 6,
      mainDiameter: Math.max(13, numStories >= 3 ? 16 : 13),
      stirrupDiameter: 10,
      stirrupSpacing: 100,
      fc_grade: 'K-300',
    },
  ];
  return options;
}

// Get SNI-compliant options for a given span
export function getSNIBeamOptions(span_m, supportType) {
  const ratio = spanToDepthRatios[supportType || 'simply-supported'].ratio;
  const minH = Math.ceil((span_m * 1000) / ratio / 10) * 10;

  // Generate 3 options: minimum, recommended, heavy-duty
  const options = [
    {
      label: 'Minimum SNI',
      width: 150,
      height: minH,
      mainBars: 4,
      mainDiameter: Math.max(10, Math.ceil(minH / 25)),
      stirrupDiameter: 8,
      stirrupSpacing: 150,
      fc_grade: 'K-200',
    },
    {
      label: 'Rekomendasi',
      width: Math.max(200, Math.round(minH * 0.5 / 10) * 10),
      height: Math.max(minH, Math.ceil(span_m * 100 / 10) * 10),
      mainBars: 4,
      mainDiameter: Math.max(13, Math.ceil(minH / 20)),
      stirrupDiameter: 8,
      stirrupSpacing: 100,
      fc_grade: 'K-250',
    },
    {
      label: 'Heavy Duty',
      width: Math.max(250, Math.round(minH * 0.6 / 10) * 10),
      height: Math.max(minH + 50, Math.ceil(span_m * 120 / 10) * 10),
      mainBars: 6,
      mainDiameter: Math.max(16, Math.ceil(minH / 18)),
      stirrupDiameter: 10,
      stirrupSpacing: 75,
      fc_grade: 'K-300',
    },
  ];

  return options;
}
