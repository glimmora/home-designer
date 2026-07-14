// ============================================================
// PERMIT CALCULATOR - KDB/KDH/KLB per Permen PU & SNI 1727-2013
// References:
// - Permen PU No. 21/PRT/M/2007 (KDB KDH KLB)
// - Permen PU No. 6/PRT/M/2007 (Rencana Kota)
// - SNI 1727-2013 (Window-to-Floor Ratio)
// - Perda setempat (zoning)
// ============================================================

// Land use zones (zonasi) dengan KDB/KDH/KLB
export const landUseZones = {
  'R-1': {
    name: 'R-1 (Perumahan Kepadatan Rendah)',
    desc: 'Perumahan dengan KDB rendah, rumah tapak kepadatan rendah',
    KDB_max: 60,   // Koefisien Dasar Bangunan (%)
    KDH_min: 30,   // Koefisien Dasar Hijau (%)
    KLB_max: 1.0,  // Koefisien Luas Bangunan
    buildingHeight_max: 8, // meter
    parking_min: 1,        // mobil per unit
  },
  'R-2': {
    name: 'R-2 (Perumahan Kepadatan Sedang)',
    desc: 'Perumahan kepadatan sedang, cluster townhouse',
    KDB_max: 65,
    KDH_min: 25,
    KLB_max: 1.5,
    buildingHeight_max: 12,
    parking_min: 1,
  },
  'R-3': {
    name: 'R-3 (Perumahan Kepadatan Tinggi)',
    desc: 'Perumahan padat, apartemen rumah susun',
    KDB_max: 70,
    KDH_min: 20,
    KLB_max: 2.5,
    buildingHeight_max: 32,
    parking_min: 1,
  },
  'K-1': {
    name: 'K-1 (Komersial Kecil)',
    desc: 'Kompleks perdagangan kecil, ruko',
    KDB_max: 75,
    KDH_min: 15,
    KLB_max: 3.0,
    buildingHeight_max: 24,
    parking_min: 2,
  },
  'K-2': {
    name: 'K-2 (Komersial Besar)',
    desc: 'Pusat perdagangan, mal, perkantoran',
    KDB_max: 80,
    KDH_min: 10,
    KLB_max: 5.0,
    buildingHeight_max: 60,
    parking_min: 3,
  },
  'I-1': {
    name: 'I-1 (Industri Ringan)',
    desc: 'Industri ringan, gudang',
    KDB_max: 70,
    KDH_min: 20,
    KLB_max: 2.0,
    buildingHeight_max: 20,
    parking_min: 2,
  },
  'P-1': {
    name: 'P-1 (Pemerintahan/Instansi)',
    desc: 'Bangunan pemerintah, instansi',
    KDB_max: 65,
    KDH_min: 25,
    KLB_max: 2.0,
    buildingHeight_max: 24,
    parking_min: 2,
  },
};

/**
 * CALCULATE PERMIT (KDB/KDH/KLB)
 * Inputs: plot dimensions, building dimensions, zone
 * Output: compliance check vs Permen PU
 */
export function calculatePermit({
  plotArea_m2,        // luas tanah (m²)
  buildingFootprint_m2, // luas dasar bangunan (m²)
  totalFloorArea_m2,  // total luas lantai bangunan (m²)
  greenArea_m2,       // luas area hijau (m²)
  zone,               // key in landUseZones
  buildingHeight_m,   // tinggi bangunan (m)
  numFloors,          // jumlah lantai
  numParkingSlots,    // jumlah slot parkir
  windowArea_m2,      // total luas jendela (m²)
}) {
  const z = landUseZones[zone] || landUseZones['R-1'];

  // 1. KDB (Koefisien Dasar Bangunan) = luas dasar bangunan / luas tanah x 100%
  const KDB_actual = (buildingFootprint_m2 / plotArea_m2) * 100;
  const KDB_max = z.KDB_max;
  const KDBOK = KDB_actual <= KDB_max;

  // 2. KDH (Koefisien Dasar Hijau) = luas area hijau / luas tanah x 100%
  const KDH_actual = (greenArea_m2 / plotArea_m2) * 100;
  const KDH_min = z.KDH_min;
  const KDHOK = KDH_actual >= KDH_min;

  // 3. KLB (Koefisien Luas Bangunan) = total luas lantai / luas tanah
  const KLB_actual = totalFloorArea_m2 / plotArea_m2;
  const KLB_max = z.KLB_max;
  const KLBOK = KLB_actual <= KLB_max;

  // 4. Tinggi Bangunan
  const heightOK = buildingHeight_m <= z.buildingHeight_max;

  // 5. Parkir
  const parkingOK = numParkingSlots >= z.parking_min;

  // 6. Window-to-Floor Ratio (SNI 1727-2013: min 10% luas lantai)
  // Untuk natural light & ventilasi
  const WFR_actual = (windowArea_m2 / totalFloorArea_m2) * 100;
  const WFR_min = 10;
  const WFROK = WFR_actual >= WFR_min;

  // 7. Building Coverage = 100% - KDB = open space %
  const openSpace_pct = 100 - KDB_actual;

  // 8. FAR (Floor Area Ratio) - same as KLB
  const FAR = KLB_actual;

  // 9. Setback estimation
  // Setback depan (GSP): min 6m untuk jalan kolektor, 4m kolektor lokal, 3m lokal
  // Setback samping (GSS): 3m untuk >2 lantai, 1m untuk 1 lantai (bebas untuk <60m²)
  // Setback belakang (GSB): 3m
  const suggestedFrontSetback = numFloors >= 2 ? 5 : 3;
  const suggestedSideSetback = numFloors >= 2 ? 3 : 1;
  const suggestedRearSetback = 3;

  // 10. Max allowed building footprint given KDB
  const maxBuildingFootprint_m2 = (KDB_max / 100) * plotArea_m2;

  // 11. Max allowed total floor area given KLB
  const maxTotalFloorArea_m2 = KLB_max * plotArea_m2;

  // 12. Required green area given KDH
  const requiredGreenArea_m2 = (KDH_min / 100) * plotArea_m2;

  // 13. Required window area given WFR
  const requiredWindowArea_m2 = (WFR_min / 100) * totalFloorArea_m2;

  // Overall compliance
  const allOK = KDBOK && KDHOK && KLBOK && heightOK && parkingOK && WFROK;

  // Violations list
  const violations = [];
  if (!KDBOK) violations.push({
    item: 'KDB',
    message: `KDB ${KDB_actual.toFixed(1)}% melebihi batas maksimum ${KDB_max}% untuk zona ${zone}. Kurangi luas dasar bangunan sebesar ${(buildingFootprint_m2 - maxBuildingFootprint_m2).toFixed(1)} m².`,
    severity: 'critical',
  });
  if (!KDHOK) violations.push({
    item: 'KDH',
    message: `KDH ${KDH_actual.toFixed(1)}% di bawah batas minimum ${KDH_min}% untuk zona ${zone}. Tambah area hijau minimal ${(requiredGreenArea_m2 - greenArea_m2).toFixed(1)} m².`,
    severity: 'critical',
  });
  if (!KLBOK) violations.push({
    item: 'KLB',
    message: `KLB ${KLB_actual.toFixed(2)} melebihi batas maksimum ${KLB_max} untuk zona ${zone}. Kurangi luas total lantai sebesar ${(totalFloorArea_m2 - maxTotalFloorArea_m2).toFixed(1)} m².`,
    severity: 'critical',
  });
  if (!heightOK) violations.push({
    item: 'Tinggi Bangunan',
    message: `Tinggi bangunan ${buildingHeight_m}m melebihi batas maksimum ${z.buildingHeight_max}m untuk zona ${zone}.`,
    severity: 'critical',
  });
  if (!parkingOK) violations.push({
    item: 'Parkir',
    message: `Slot parkir ${numParkingSlots} kurang dari minimum ${z.parking_min} untuk zona ${zone}.`,
    severity: 'warning',
  });
  if (!WFROK) violations.push({
    item: 'Window-to-Floor Ratio',
    message: `Rasio jendela-lantai ${WFR_actual.toFixed(1)}% di bawah minimum ${WFR_min}% (SNI 1727-2013). Tambah jendela minimal ${(requiredWindowArea_m2 - windowArea_m2).toFixed(1)} m².`,
    severity: 'warning',
  });

  // Recommendations (saran perbaikan)
  const recommendations = [];
  if (KDB_actual > KDB_max * 0.9) {
    recommendations.push(`KDB mendekati batas maksimum (${KDB_max}%). Pertimbangkan untuk mengurangi footprint atau pindah ke zona dengan KDB lebih besar.`);
  }
  if (KDH_actual < KDH_min * 1.2 && KDHOK) {
    recommendations.push(`KDH cukup tipis. Tambah tanaman untuk cadangan area hijau.`);
  }
  if (KLB_actual > KLB_max * 0.8) {
    recommendations.push(`KLB mendekati batas. Pastikan tidak ada penambahan lantai.`);
  }
  if (numFloors >= 3) {
    recommendations.push(`Bangunan ${numFloors} lantai wajib ada tangga darurat dan akses pemadam kebakaran.`);
  }
  if (plotArea_m2 < 100) {
    recommendations.push(`Luas tanah < 100 m² wajib saluran air tersendiri dan septictank BIO.`);
  }
  if (WFR_actual < 15) {
    recommendations.push(`Rasio jendela rendah. Tambah skylight atau lightwell untuk pencahayaan alami.`);
  }

  return {
    // Zone info
    zone: z.name,
    zoneKey: zone,
    zoneDesc: z.desc,

    // Plot info
    plotArea_m2: plotArea_m2.toFixed(1),
    buildingFootprint_m2: buildingFootprint_m2.toFixed(1),
    totalFloorArea_m2: totalFloorArea_m2.toFixed(1),
    greenArea_m2: greenArea_m2.toFixed(1),
    buildingHeight_m,
    numFloors,

    // Calculations
    KDB_actual: KDB_actual.toFixed(1),
    KDB_max,
    KDBOK,
    KDH_actual: KDH_actual.toFixed(1),
    KDH_min,
    KDHOK,
    KLB_actual: KLB_actual.toFixed(2),
    KLB_max,
    KLBOK,
    FAR: FAR.toFixed(2),
    openSpace_pct: openSpace_pct.toFixed(1),
    WFR_actual: WFR_actual.toFixed(1),
    WFR_min,
    WFROK,
    heightOK,
    parkingOK,

    // Maximum allowed (for guidance)
    maxBuildingFootprint_m2: maxBuildingFootprint_m2.toFixed(1),
    maxTotalFloorArea_m2: maxTotalFloorArea_m2.toFixed(1),
    requiredGreenArea_m2: requiredGreenArea_m2.toFixed(1),
    requiredWindowArea_m2: requiredWindowArea_m2.toFixed(1),

    // Setback suggestions
    setback: {
      front: suggestedFrontSetback,
      side: suggestedSideSetback,
      rear: suggestedRearSetback,
    },

    // Overall
    allOK,
    violations,
    recommendations,

    // Permits needed
    permitsNeeded: getRequiredPermits(numFloors, buildingHeight_m, plotArea_m2, KLB_actual),

    // SNI reference
    sniStandards: ['Permen PU 21/PRT/M/2007', 'Permen PU 6/PRT/M/2007', 'SNI 1727-2013 (Window Ratio)'],
  };
}

// Get required permits based on building scale
function getRequiredPermits(numFloors, height_m, plotArea_m2, KLB) {
  const permits = [
    {
      name: 'IMB/PBG (Izin Mendirikan Bangunan / Persetujuan Bangunan Gedung)',
      desc: 'Wajib untuk semua bangunan baru',
      cost_est: Math.round(plotArea_m2 * 200000), // Rp 200k/m²
      duration_weeks: 4,
    },
  ];

  if (numFloors >= 2) {
    permits.push({
      name: 'SLF (Sertifikat Laik Fungsi)',
      desc: 'Wajib untuk bangunan 2+ lantai setelah selesai',
      cost_est: 5000000,
      duration_weeks: 2,
    });
  }

  if (height_m > 8) {
    permits.push({
      name: 'ANDAL (Analisis Dampak Lingkungan)',
      desc: 'Wajib untuk bangunan > 2 lantai atau tinggi > 8m',
      cost_est: 25000000,
      duration_weeks: 8,
    });
  }

  if (KLB > 2 || plotArea_m2 > 500) {
    permits.push({
      name: 'UKL-UPL (Upaya Kelola Lingkungan)',
      desc: 'Wajib untuk skala >500 m² atau KLB > 2',
      cost_est: 15000000,
      duration_weeks: 6,
    });
  }

  if (numFloors >= 4) {
    permits.push({
      name: 'Sertifikat Ahli Mekanika (SKK)',
      desc: 'Wajib untuk bangunan 4+ lantai, perlu konsultan struktur',
      cost_est: 50000000,
      duration_weeks: 12,
    });
  }

  return permits;
}

// Calculate estimated material quantities (bonus)
export function calculateMaterialQuantity({
  floorArea_m2,
  wallArea_m2,
  ceilingArea_m2,
  floorType,
  wallType,
  ceilingType,
  paintColor,
}) {
  // Paint coverage: ~10 m²/liter per layer, 2-3 layers
  const paintLiters = Math.ceil((wallArea_m2 + ceilingArea_m2) / 10 * 2);

  // Tile: 1 box (1.44 m² for 60x60) covers 1.44 m², +10% waste
  let tileBoxes = 0;
  if (floorType && floorType.includes('ceramic-60') || floorType && floorType.includes('granite-60')) {
    tileBoxes = Math.ceil((floorArea_m2 * 1.1) / 1.44);
  } else if (floorType && floorType.includes('granite-80')) {
    tileBoxes = Math.ceil((floorArea_m2 * 1.1) / 1.6);
  } else {
    tileBoxes = Math.ceil((floorArea_m2 * 1.1) / 0.9); // 30x30
  }

  // Wallpaper: 1 roll = 5 m²
  const wallpaperRolls = wallType && wallType.startsWith('wallpaper')
    ? Math.ceil((wallArea_m2 * 1.05) / 5)
    : 0;

  // Ceiling gypsum: 1 sheet 1.2x2.4m = 2.88 m²
  const ceilingSheets = ceilingType && ceilingType.startsWith('ceiling-gypsum')
    ? Math.ceil((ceilingArea_m2 * 1.05) / 2.88)
    : 0;

  // AC capacity (PK) = 0.06 x floor area (m²), min 1 PK
  const acCapacity_PK = Math.max(0.5, Math.ceil((floorArea_m2 * 0.06) * 2) / 2);

  // Water tank capacity (liter) = 200 x num_people (assume 4 person + 50L reserve per m² floor / 10)
  const numPeople = Math.ceil(floorArea_m2 / 15); // 1 person per 15 m²
  const waterTank_L = Math.max(500, numPeople * 200);

  // Cost estimates (per unit)
  const paintCost_perLiter = 85000; // Dulux/Nippon Paint
  const tileCost_perBox = 350000; // keramik 60x60
  const graniteCost_perBox = 650000; // granit
  const wallpaperCost_perRoll = 450000;
  const ceilingCost_perSheet = 75000;
  const acCost_perPK = 4500000;

  const isGranite = floorType && floorType.includes('granite');
  const totalCost = (paintLiters * paintCost_perLiter) +
    (tileBoxes * (isGranite ? graniteCost_perBox : tileCost_perBox)) +
    (wallpaperRolls * wallpaperCost_perRoll) +
    (ceilingSheets * ceilingCost_perSheet) +
    (acCapacity_PK * acCost_perPK);

  return {
    paintLiters,
    tileBoxes,
    wallpaperRolls,
    ceilingSheets,
    acCapacity_PK,
    numPeople,
    waterTank_L,
    totalCost_IDR: Math.round(totalCost),
    breakdown: {
      paint: Math.round(paintLiters * paintCost_perLiter),
      tile: Math.round(tileBoxes * (isGranite ? graniteCost_perBox : tileCost_perBox)),
      wallpaper: Math.round(wallpaperRolls * wallpaperCost_perRoll),
      ceiling: Math.round(ceilingSheets * ceilingCost_perSheet),
      ac: Math.round(acCapacity_PK * acCost_perPK),
    },
  };
}
