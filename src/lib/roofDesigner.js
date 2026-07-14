// ============================================================
// ROOF TRUSS DESIGNER (KUDA-KUDA ATAP)
// References:
// - SNI 7971:2013: Spesifikasi Desain untuk Konstruksi Kayu
// - SNI 1729:2020: Spesifikasi Baja Struktural
// - SNI 1727-2013: Beban Minimum (wind on roof, dead load roof)
// ============================================================

// Roof types
export const roofTypes = {
  'pelana': {
    name: 'Atap Pelana (Gable)',
    desc: 'Atap 2 sisi miring, paling umum rumah tinggal',
    slopes: 2,
    icon: '🔺',
  },
  'limasan': {
    name: 'Atap Limasan (Hip)',
    desc: 'Atap 4 sisi miring, klasik Jawa',
    slopes: 4,
    icon: '⛰️',
  },
  'perisai': {
    name: 'Atap Perisai (Pyramid)',
    desc: 'Atap 4 sisi segitiga bertemu di puncak',
    slopes: 4,
    icon: '⛰️',
  },
  'datar': {
    name: 'Atap Datar (Flat)',
    desc: 'Atap datar untuk roof deck / taman atap',
    slopes: 0,
    icon: '▬',
  },
};

// Roof materials
export const roofMaterials = {
  'genteng-keramik': {
    name: 'Genteng Keramik',
    weight_kN_per_m2: 0.45,
    pitch_min: 15,
    pitch_max: 45,
    cost_per_m2: 120000,
    lifespan_years: 50,
  },
  'genteng-beton': {
    name: 'Genteng Beton',
    weight_kN_per_m2: 0.55,
    pitch_min: 15,
    pitch_max: 35,
    cost_per_m2: 95000,
    lifespan_years: 50,
  },
  'genteng-metal': {
    name: 'Genteng Metal (Spandek)',
    weight_kN_per_m2: 0.08,
    pitch_min: 5,
    pitch_max: 30,
    cost_per_m2: 65000,
    lifespan_years: 25,
  },
  'asbes-gelombang': {
    name: 'Asbes / Fiber Gelombang',
    weight_kN_per_m2: 0.12,
    pitch_min: 10,
    pitch_max: 30,
    cost_per_m2: 45000,
    lifespan_years: 20,
  },
  'bitumen': {
    name: 'Atap Bitumen (Onduline)',
    weight_kN_per_m2: 0.07,
    pitch_min: 5,
    pitch_max: 30,
    cost_per_m2: 85000,
    lifespan_years: 20,
  },
};

// Frame material options
export const frameMaterials = {
  'kayu-kamper': {
    name: 'Kayu Kamper (Jati Kapur)',
    type: 'wood',
    E: 11000,     // MPa modulus elastisitas
    fb: 12.5,     // MPa tegangan lentur ijin
    fv: 0.85,     // MPa tegangan geser ijin
    fc: 9.5,      // MPa tegangan tekan ijin
    density: 620, // kg/m³
    cost_per_m3: 5500000,
  },
  'kayu-meranti': {
    name: 'Kayu Meranti Merah',
    type: 'wood',
    E: 9500,
    fb: 9.0,
    fv: 0.7,
    fc: 7.0,
    density: 540,
    cost_per_m3: 3800000,
  },
  'kayu-nyatoh': {
    name: 'Kayu Nyatoh',
    type: 'wood',
    E: 8500,
    fb: 7.5,
    fv: 0.6,
    fc: 6.0,
    density: 480,
    cost_per_m3: 3200000,
  },
  'baja-ringan-C75': {
    name: 'Baja Ringan C75.35 (0.75mm)',
    type: 'steel',
    E: 200000,
    fb: 550,      // MPa (fy)
    fv: 320,
    fc: 550,
    density: 7850,
    cost_per_m: 38000, // per meter
    section: { h: 75, b: 35, t: 0.75 },
  },
  'baja-ringan-C100': {
    name: 'Baja Ringan C100.50 (0.95mm)',
    type: 'steel',
    E: 200000,
    fb: 550,
    fv: 320,
    fc: 550,
    density: 7850,
    cost_per_m: 52000,
    section: { h: 100, b: 50, t: 0.95 },
  },
  'baja-WF150': {
    name: 'Baja WF 150.75 (Konvensional)',
    type: 'steel',
    E: 200000,
    fb: 240,
    fv: 140,
    fc: 240,
    density: 7850,
    cost_per_m: 185000,
    section: { h: 150, b: 75, t: 5 },
  },
};

// Standard rebar for reinforced concrete roof beams (ring balok atap)
import { rebarProperties } from './structuralAnalysis';

/**
 * AUTO-CALCULATE ROOF TRUSS dimensions per SNI
 * Inputs: span, roof type, frame material, roofing material
 * Outputs: kuda-kuda count, member sizes (kasau, reng, tie beam), loads
 */
export function autoCalculateRoofTruss({
  span_m,                // bentang bangunan (m)
  length_m,              // panjang bangunan (m)
  roofType,              // key in roofTypes
  frameMaterial,         // key in frameMaterials
  roofingMaterial,       // key in roofMaterials
  pitch_deg,             // sudut kemiringan atap (derajat)
  ceilingLoad_kN_per_m2, // beban plafon (kN/m²), default 0.2
  windCity,              // 'jakarta' etc.
}) {
  const rType = roofTypes[roofType] || roofTypes['pelana'];
  const fMat = frameMaterials[frameMaterial] || frameMaterials['kayu-kamper'];
  const rMat = roofMaterials[roofingMaterial] || roofMaterials['genteng-keramik'];
  const pitch = pitch_deg || 25; // default 25°
  const ceilingLoad = ceilingLoad_kN_per_m2 || 0.2;

  // 1. GEOMETRI ATAP
  // Untuk atap pelana: rafter length per sisi = (span/2) / cos(pitch)
  const pitchRad = pitch * Math.PI / 180;
  const rafterLength_m = (span_m / 2) / Math.cos(pitchRad);
  const roofHeight_m = (span_m / 2) * Math.tan(pitchRad);
  const roofArea_m2 = (rafterLength_m * 2) * length_m; // untuk pelana
  const roofVolume_m3 = (1/3) * span_m * roofHeight_m * length_m / 2; // approx

  // 2. SPACING KUDA-KUDA
  // SNI 7971: spacing standar 1.0-1.2m untuk kayu, 1.0-1.5m untuk baja ringan
  const trussSpacing = fMat.type === 'steel' ? 1.2 : 1.0; // m
  const numTrusses = Math.ceil(length_m / trussSpacing) + 1; // +1 untuk truss terakhir

  // 3. BEBAN ATAP (per m² bidang atap)
  // DL: berat genteng + rangka + plafon
  const dlRoofing = rMat.weight_kN_per_m2;
  const dlFrame = fMat.type === 'wood' ? 0.25 : 0.10; // rangka kayu ~0.25, baja ~0.10
  const dlCeiling = ceilingLoad;
  const totalDL = dlRoofing + dlFrame + dlCeiling;

  // LL: 0.5 kN/m² (pekerja maintenance) - SNI 1727-2013
  const LL = 0.5;

  // WL (wind on roof) - simplified, ~1.0 kN/m² suction untuk area Jakarta
  const WL = 0.9;

  // Kombinasi beban: 1.2DL + 1.6LL atau 1.2DL + 1.0WL (suction)
  const factoredLoad = Math.max(
    1.2 * totalDL + 1.6 * LL,
    1.2 * totalDL + 1.0 * WL
  );

  // 4. BEBAN PER KUDA-KUDA (tributary area = spacing x rafterLength)
  const loadPerTruss_kN_per_m = factoredLoad * trussSpacing;

  // 5. DESAIN MEMBER
  let memberSizes = {};
  if (fMat.type === 'wood') {
    // KAYU: per SNI 7971
    // Rafter (Kasau): lenturan dari beban merata
    // M = wL²/8, fb_actual = M/S, S = bxh²/6
    // Auto-pick larger sections for longer spans
    let rafterSize;
    if (rafterLength_m <= 2) rafterSize = { b: 50, h: 75, label: '5x7.5 cm' };
    else if (rafterLength_m <= 3) rafterSize = { b: 50, h: 100, label: '5x10 cm' };
    else if (rafterLength_m <= 4) rafterSize = { b: 60, h: 120, label: '6x12 cm' };
    else if (rafterLength_m <= 5) rafterSize = { b: 60, h: 150, label: '6x15 cm' };
    else if (rafterLength_m <= 6) rafterSize = { b: 70, h: 170, label: '7x17 cm' };
    else if (rafterLength_m <= 7) rafterSize = { b: 80, h: 200, label: '8x20 cm' };
    else if (rafterLength_m <= 8) rafterSize = { b: 90, h: 220, label: '9x22 cm' };
    else if (rafterLength_m <= 9) rafterSize = { b: 100, h: 250, label: '10x25 cm' };
    else rafterSize = { b: 100, h: 300, label: '10x30 cm' };

    // Auto-upgrade if fb_actual > fb_allowable (iterate up to 3 sizes)
    for (let upgrade = 0; upgrade < 4; upgrade++) {
      const M_test = (loadPerTruss_kN_per_m * Math.pow(rafterLength_m, 2)) / 8 * 1000; // N·m
      const S_test = (rafterSize.b * Math.pow(rafterSize.h, 2)) / 6; // mm³
      const fb_test = M_test / (S_test * 1e-9) / 1e6; // MPa
      if (fb_test <= fMat.fb) break;
      // Upgrade to next size
      const upgrades = [
        { b: rafterSize.b, h: rafterSize.h + 25, label: `${rafterSize.b/10}x${(rafterSize.h+25)/10} cm` },
        { b: rafterSize.b + 10, h: rafterSize.h + 25, label: `${(rafterSize.b+10)/10}x${(rafterSize.h+25)/10} cm` },
        { b: rafterSize.b + 20, h: rafterSize.h + 50, label: `${(rafterSize.b+20)/10}x${(rafterSize.h+50)/10} cm` },
        { b: rafterSize.b + 30, h: rafterSize.h + 75, label: `${(rafterSize.b+30)/10}x${(rafterSize.h+75)/10} cm` },
      ];
      if (upgrade < upgrades.length) rafterSize = upgrades[upgrade];
    }

    // Tie beam (balok pengikat / murplat): 60x100mm minimum
    const tieBeamSize = { b: 60, h: 100, label: '6x10 cm' };

    // Post (tiang tengah untuk pelana) / King Post
    const postSize = { b: 60, h: 80, label: '6x8 cm' };

    // Purlin (Reng): 30x50mm @ 30-40cm (untuk genteng), 40x60 @ 60cm untuk metal
    const purlinSize = rMat.weight_kN_per_m2 > 0.3
      ? { b: 30, h: 50, label: '3x5 cm', spacing: 35 }
      : { b: 40, h: 60, label: '4x6 cm', spacing: 60 };

    // Check fb_actual
    const M_max = (loadPerTruss_kN_per_m * Math.pow(rafterLength_m, 2)) / 8 * 1000; // N·m
    const S = (rafterSize.b * Math.pow(rafterSize.h, 2)) / 6; // mm³ → m³ = x1e-9
    const S_m3 = S * 1e-9;
    const fb_actual = M_max / S_m3 / 1e6; // MPa
    const fbOK = fb_actual <= fMat.fb;

    memberSizes = {
      rafter: { ...rafterSize, length_m: rafterLength_m, count: rType.slopes === 2 ? 2 * numTrusses : 4 * numTrusses / 2 },
      tieBeam: { ...tieBeamSize, length_m: span_m, count: numTrusses },
      post: { ...postSize, length_m: roofHeight_m, count: rType.slopes === 2 ? numTrusses : 0 },
      purlin: { ...purlinSize, length_m: span_m, count: Math.ceil(rafterLength_m / (purlinSize.spacing/100)) * 2 * Math.ceil(length_m / 3) },
      fbCheck: {
        actual: fb_actual.toFixed(2),
        allowable: fMat.fb,
        passed: fbOK,
      },
    };
  } else {
    // BAJA RINGAN / BAJA KONVENSIONAL
    // Section properties from frameMaterials
    const section = fMat.section || { h: 75, b: 35, t: 0.75 };

    // Rafter: C75 atau C100
    const rafterSection = fMat.name.includes('C100') ? 'C100.50' : 'C75.35';
    const rafterSize = {
      label: `${rafterSection} (${section.h}x${section.b}x${section.t}mm)`,
      section: rafterSection,
      length_m: rafterLength_m,
      count: rType.slopes === 2 ? 2 * numTrusses : 4 * numTrusses / 2,
    };

    // Tie beam: same section
    const tieBeamSize = {
      label: rafterSection,
      section: rafterSection,
      length_m: span_m,
      count: numTrusses,
    };

    // Post (strut)
    const postSize = {
      label: 'C75.35',
      section: 'C75.35',
      length_m: roofHeight_m,
      count: rType.slopes === 2 ? numTrusses : 0,
    };

    // Purlin (Reng Baja): C45.40 @ 1.0-1.5m
    const purlinSize = {
      label: 'C45.40 (45x40x0.75mm)',
      section: 'C45.40',
      spacing: 120, // cm
      length_m: span_m,
      count: Math.ceil(rafterLength_m / 1.2) * 2 * Math.ceil(length_m / 3),
    };

    // Web (diagonal brace)
    const webSize = {
      label: 'C75.35',
      section: 'C75.35',
      count: numTrusses * 4, // 4 diagonal per truss
      length_m: Math.sqrt(Math.pow(span_m/2, 2) + Math.pow(roofHeight_m/2, 2)) / 2,
    };

    memberSizes = {
      rafter: rafterSize,
      tieBeam: tieBeamSize,
      post: postSize,
      purlin: purlinSize,
      web: webSize,
      sectionHeight: section.h,
      sectionThickness: section.t,
    };
  }

  // 6. RING BALOK ATAS (Pengikat puncak dinding, di bawah kuda-kuda)
  // Beton bertulang 150x200mm, 4D10, sengkang D8@150
  const ringBeam = {
    width_mm: 150,
    height_mm: 200,
    mainBars: 4,
    mainDiameter_mm: 10,
    stirrupDiameter_mm: 8,
    stirrupSpacing_mm: 150,
    totalLength_m: 2 * (span_m + length_m), // perimeter
    mainBarTotalLength_m: 4 * 2 * (span_m + length_m), // 4 bars x perimeter
    stirrupCount: Math.ceil(2 * (span_m + length_m) / 0.15),
    mainBarWeight_kg: 4 * 2 * (span_m + length_m) * rebarProperties.D10.weight,
    stirrupWeight_kg: Math.ceil(2 * (span_m + length_m) / 0.15) * (2 * (150 - 2*40) + 2 * (200 - 2*40)) / 1000 * rebarProperties.D8.weight,
    concreteVolume_m3: 0.15 * 0.20 * 2 * (span_m + length_m),
  };
  ringBeam.totalSteelWeight_kg = ringBeam.mainBarWeight_kg + ringBeam.stirrupWeight_kg;

  // 7. TOTAL MATERIAL
  let totalWeight_kg = 0;
  if (fMat.type === 'wood') {
    const rafter = memberSizes.rafter;
    const tieBeam = memberSizes.tieBeam;
    const post = memberSizes.post;
    const purlin = memberSizes.purlin;
    const rafterVol = (rafter.b/100) * (rafter.h/100) * rafter.length_m * rafter.count;
    const tieBeamVol = (tieBeam.b/100) * (tieBeam.h/100) * tieBeam.length_m * tieBeam.count;
    const postVol = (post.b/100) * (post.h/100) * post.length_m * post.count;
    const purlinVol = (purlin.b/100) * (purlin.h/100) * purlin.length_m * purlin.count;
    const totalVol_m3 = rafterVol + tieBeamVol + postVol + purlinVol;
    totalWeight_kg = totalVol_m3 * fMat.density;
  } else {
    // Baja: berat = panjang x berat per meter (approx 1.05 kg/m untuk C75.35, 1.45 untuk C100)
    const wPerM = fMat.name.includes('C100') ? 1.45 : (fMat.name.includes('C75') ? 1.05 : 18.0);
    const rafterW = memberSizes.rafter.length_m * memberSizes.rafter.count * wPerM;
    const tieBeamW = memberSizes.tieBeam.length_m * memberSizes.tieBeam.count * wPerM;
    const postW = memberSizes.post.length_m * memberSizes.post.count * wPerM;
    const purlinW = memberSizes.purlin.length_m * memberSizes.purlin.count * 0.85; // C45.40 ~0.85 kg/m
    const webW = memberSizes.web.length_m * memberSizes.web.count * 1.05;
    totalWeight_kg = rafterW + tieBeamW + postW + purlinW + webW;
  }

  // 8. COST ESTIMATE
  let frameCost;
  if (fMat.type === 'wood') {
    const rafterVol = (memberSizes.rafter.b/100) * (memberSizes.rafter.h/100) * memberSizes.rafter.length_m * memberSizes.rafter.count;
    const tieBeamVol = (memberSizes.tieBeam.b/100) * (memberSizes.tieBeam.h/100) * memberSizes.tieBeam.length_m * memberSizes.tieBeam.count;
    const postVol = memberSizes.post.count > 0 ? (memberSizes.post.b/100) * (memberSizes.post.h/100) * memberSizes.post.length_m * memberSizes.post.count : 0;
    const purlinVol = (memberSizes.purlin.b/100) * (memberSizes.purlin.h/100) * memberSizes.purlin.length_m * memberSizes.purlin.count;
    frameCost = (rafterVol + tieBeamVol + postVol + purlinVol) * fMat.cost_per_m3;
  } else {
    const totalLength = memberSizes.rafter.length_m * memberSizes.rafter.count +
                        memberSizes.tieBeam.length_m * memberSizes.tieBeam.count +
                        memberSizes.post.length_m * memberSizes.post.count +
                        memberSizes.purlin.length_m * memberSizes.purlin.count +
                        (memberSizes.web ? memberSizes.web.length_m * memberSizes.web.count : 0);
    frameCost = totalLength * fMat.cost_per_m;
  }

  const roofingCost = roofArea_m2 * rMat.cost_per_m2;
  const totalCost = frameCost + roofingCost;

  // 9. SAFETY CHECK
  let safetyOK = true;
  let warnings = [];

  if (pitch < rMat.pitch_min) {
    safetyOK = false;
    warnings.push(`Sudut kemiringan (${pitch}°) kurang dari minimum ${rMat.pitch_min}° untuk ${rMat.name}`);
  }
  if (pitch > rMat.pitch_max) {
    warnings.push(`Sudut kemiringan (${pitch}°) lebih dari maksimum ${rMat.pitch_max}° untuk ${rMat.name}`);
  }
  if (fMat.type === 'wood' && memberSizes.fbCheck && !memberSizes.fbCheck.passed) {
    safetyOK = false;
    warnings.push(`Tegangan lentur kasau (${memberSizes.fbCheck.actual} MPa) melebihi ijin (${memberSizes.fbCheck.allowable} MPa). Perbesar penampang.`);
  }
  if (span_m > 12 && fMat.type === 'wood') {
    warnings.push(`Bentang > 12m dengan kayu disarankan pakai kolom penengah atau ganti ke baja`);
  }
  if (span_m > 15) {
    warnings.push(`Bentang > 15m butuh kuda-kuda baja konvensional / BJP, konsultasi ahli struktur`);
  }

  return {
    // Inputs
    roofType: rType.name,
    roofTypeKey: roofType,
    frameMaterial: fMat.name,
    frameMaterialKey: frameMaterial,
    frameType: fMat.type,
    roofingMaterial: rMat.name,
    roofingMaterialKey: roofingMaterial,
    pitch_deg: pitch,

    // Geometry
    span_m,
    length_m,
    rafterLength_m: rafterLength_m.toFixed(2),
    roofHeight_m: roofHeight_m.toFixed(2),
    roofArea_m2: roofArea_m2.toFixed(2),

    // Truss layout
    numTrusses,
    trussSpacing_m: trussSpacing,

    // Loads
    deadLoad_kN_per_m2: totalDL.toFixed(2),
    liveLoad_kN_per_m2: LL,
    windLoad_kN_per_m2: WL,
    factoredLoad_kN_per_m2: factoredLoad.toFixed(2),
    loadPerTruss_kN_per_m: loadPerTruss_kN_per_m.toFixed(2),

    // Member sizes
    memberSizes,

    // Ring balok atas (concrete ring beam at top of wall, below truss)
    ringBeam,

    // Totals
    totalFrameWeight_kg: totalWeight_kg.toFixed(1),
    totalRoofArea_m2: roofArea_m2.toFixed(2),

    // Cost
    frameCost_IDR: Math.round(frameCost),
    roofingCost_IDR: Math.round(roofingCost),
    totalCost_IDR: Math.round(totalCost),

    // Safety
    safetyOK,
    warnings,

    // SNI standards reference
    sniStandards: fMat.type === 'wood'
      ? ['SNI 7971:2013 (Kayu)', 'SNI 1727-2013 (Beban)']
      : ['SNI 1729:2020 (Baja)', 'SNI 1727-2013 (Beban)'],
  };
}

// Get recommended roof pitch by roofing material
export function getRecommendedPitch(materialKey) {
  const mat = roofMaterials[materialKey];
  if (!mat) return 25;
  // Recommended: between min and max, lean toward middle-high
  return Math.round((mat.pitch_min + mat.pitch_max) / 2);
}
