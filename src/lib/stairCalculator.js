// ============================================================
// STAIR DESIGNER (TANGGA) - SNI 1727-2013 + SNI 03-2847-2002
// References:
// - SNI 1727-2013 Section 4.5 (Stairs): riser ≤ 18cm, tread ≥ 25cm
// - Convenience rule: 2R + T = 60-65 cm (Blondel formula)
// - Minimum width: 80cm (1 orang), 120cm (2 orang), 100cm standar rumah
// ============================================================

// Stair types
export const stairTypes = {
  'straight':   { name: 'Tangga Lurus',     icon: '🪜', desc: 'Lurus tanpa belokan, butuh ruang panjang' },
  'l-shape':    { name: 'Tangga L',         icon: '🪜', desc: 'Belok 90° dengan bordes di tengah' },
  'u-shape':    { name: 'Tangga U (Bordes)',icon: '🪜', desc: 'Belok 180° dengan bordes, hemat ruang' },
  'spiral':     { name: 'Tangga Putar',     icon: '🪜', desc: 'Spiral melingkar, hemat ruang' },
  'curved':     { name: 'Tangga Lengkung',  icon: '🪜', desc: 'Lengkung elegan untuk rumah mewah' },
  'cantilever': { name: 'Tangga Kantilever',icon: '🪜', desc: 'Menggantung dari dinding, modern' },
  'floating':   { name: 'Tangga Melayang',  icon: '🪜', desc: 'Tanpa stringer samping, futuristic' },
  'steel':      { name: 'Tangga Baja Ringan',icon:'🪜',desc: 'Baja ringan, industrial, ringan' },
  'mini':       { name: 'Tangga Mini (Loteng)',icon:'🪜',desc:'Curam untuk akses loteng, sudut 50-60°' },
};

// Materials
export const stairMaterials = {
  'concrete': {
    name: 'Beton Bertulang',
    cost_per_m2: 1500000,
    thickness_mm: 150,
    lifespan: 50,
    fireRating: 'Tinggi (2 jam)',
  },
  'wood-kamper': {
    name: 'Kayu Kamper',
    cost_per_m2: 2200000,
    thickness_mm: 40,
    lifespan: 40,
    fireRating: 'Sedang',
  },
  'wood-meranti': {
    name: 'Kayu Meranti',
    cost_per_m2: 1600000,
    thickness_mm: 40,
    lifespan: 30,
    fireRating: 'Sedang',
  },
  'steel': {
    name: 'Baja Ringan',
    cost_per_m2: 1800000,
    thickness_mm: 25,
    lifespan: 30,
    fireRating: 'Rendah',
  },
  'steel-conventional': {
    name: 'Baja Konvensional (WF)',
    cost_per_m2: 2800000,
    thickness_mm: 25,
    lifespan: 50,
    fireRating: 'Tinggi (1 jam)',
  },
  'granite': {
    name: 'Granit (Finishing)',
    cost_per_m2: 950000,
    thickness_mm: 20,
    lifespan: 50,
    fireRating: 'Tinggi',
  },
  'marble': {
    name: 'Marmer (Finishing)',
    cost_per_m2: 1200000,
    thickness_mm: 20,
    lifespan: 50,
    fireRating: 'Tinggi',
  },
  'wood-tile': {
    name: 'Tegel Kayu (Finishing)',
    cost_per_m2: 380000,
    thickness_mm: 15,
    lifespan: 20,
    fireRating: 'Rendah',
  },
};

/**
 * AUTO-CALCULATE STAIR DIMENSIONS per SNI 1727-2013
 * Input: floor-to-floor height, available length, stair type
 * Output: riser, tread, number of steps, layout dimensions
 */
export function autoCalculateStairs({
  floorHeight_cm,     // tinggi lantai ke lantai (cm), biasanya 300
  availableLength_cm, // panjang ruang tersedia (cm)
  availableWidth_cm,  // lebar tangga (cm), standar 100
  stairType,          // key in stairTypes
  material,           // key in stairMaterials (struktur)
  finishMaterial,     // key in stairMaterials (finishing)
}) {
  const fh = floorHeight_cm || 300;
  const aL = availableLength_cm || 350;
  const aW = availableWidth_cm || 100;
  const stType = stairTypes[stairType] || stairTypes['straight'];

  // ============ 1. RISER (tinggi undakan) ============
  // SNI 1727-2013: riser max 18cm (residential), min 15cm
  // Comfortable: 17-18cm
  const riserMin = 15;
  const riserMax = stairType === 'mini' ? 25 : 18; // mini stairs can be steeper

  // Try riser heights from 15 to 18cm (or 25cm for mini)
  let bestRiser = 18;
  let bestSteps = 0;
  for (let r = riserMin; r <= riserMax; r++) {
    const steps = Math.ceil(fh / r);
    const actualRiser = fh / steps;
    if (actualRiser >= riserMin && actualRiser <= riserMax) {
      // Pick the one with most comfortable ratio
      bestRiser = actualRiser;
      bestSteps = steps;
      break;
    }
  }

  const riser = bestRiser;
  const numSteps = bestSteps;
  const numRisers = numSteps; // number of vertical rises

  // ============ 2. TREAD (lebar injakan) ============
  // SNI 1727-2013: tread min 25cm
  // Blondel: 2R + T = 60-65 cm → T = 65 - 2R
  const treadMin = stairType === 'mini' ? 18 : 25;
  const treadBlondel = Math.max(treadMin, 65 - 2 * riser);

  // Limit by available length (for straight types)
  // For U/L: total length = (numSteps/2) x tread + bordes
  // For straight: total length = (numSteps-1) x tread
  let tread = treadBlondel;
  let requiredLength = 0;
  let hasBordes = false;
  let numFlights = 1;
  let stepsPerFlight = numSteps;
  let bordesDepth = 0;

  if (stairType === 'straight' || stairType === 'cantilever' || stairType === 'floating' || stairType === 'steel') {
    // Single flight
    requiredLength = (numSteps - 1) * tread;
    if (requiredLength > aL) {
      // Reduce tread to fit (minimum)
      tread = Math.max(treadMin, (aL) / (numSteps - 1));
      requiredLength = (numSteps - 1) * tread;
    }
  } else if (stairType === 'l-shape') {
    // 2 flights + L-shaped bordes
    numFlights = 2;
    stepsPerFlight = Math.ceil(numSteps / 2);
    bordesDepth = aW; // bordes = stair width
    requiredLength = (stepsPerFlight - 1) * tread + bordesDepth;
    if (requiredLength > aL) {
      tread = Math.max(treadMin, (aL - bordesDepth) / (stepsPerFlight - 1));
      requiredLength = (stepsPerFlight - 1) * tread + bordesDepth;
    }
    hasBordes = true;
  } else if (stairType === 'u-shape') {
    // 2 flights + U-shaped bordes
    numFlights = 2;
    stepsPerFlight = Math.ceil(numSteps / 2);
    bordesDepth = aW; // bordes depth = stair width
    requiredLength = (stepsPerFlight - 1) * tread;
    if (requiredLength > aL) {
      tread = Math.max(treadMin, aL / (stepsPerFlight - 1));
      requiredLength = (stepsPerFlight - 1) * tread;
    }
    hasBordes = true;
  } else if (stairType === 'spiral') {
    // Spiral: tread measured at center
    // Total circumference = numSteps x tread
    // Diameter = circumference / π
    const circumference = numSteps * tread;
    const diameter = circumference / Math.PI;
    requiredLength = Math.min(diameter, 200); // cap at 200cm
    tread = Math.max(treadMin, (Math.PI * 150) / numSteps); // recompute for diameter 150cm
  } else if (stairType === 'curved') {
    // Curved: like straight but with curve
    requiredLength = (numSteps - 1) * tread * 0.85; // smaller because curved
    if (requiredLength > aL) {
      tread = Math.max(treadMin, aL / ((numSteps - 1) * 0.85));
      requiredLength = (numSteps - 1) * tread * 0.85;
    }
  } else if (stairType === 'mini') {
    // Mini stairs (loteng): steeper, smaller tread
    tread = Math.max(treadMin, 60 - 2 * riser);
    requiredLength = (numSteps - 1) * tread;
  }

  // ============ 3. SLOPE / KEMIRINGAN ============
  const slopeRad = Math.atan2(riser, tread);
  const slopeDeg = (slopeRad * 180 / Math.PI);

  // ============ 4. LANDING (BORDES) ============
  // SNI: min landing depth = stair width, min 100cm
  const landingDepth = Math.max(aW, 100);
  const landingWidth = aW;

  // ============ 5. STAIR FOOTPRINT ============
  let footprint = { length: requiredLength, width: aW };
  if (hasBordes) {
    if (stairType === 'u-shape') {
      // U-shape: 2 flights side by side
      footprint = { length: requiredLength, width: aW * 2 + 10 }; // 10cm gap
    } else if (stairType === 'l-shape') {
      // L-shape: L-form
      footprint = { length: requiredLength, width: aW + bordesDepth };
    }
  }

  // ============ 6. HANDRAIL (Pegangan) ============
  // SNI: handrail height 86-96cm from tread nosing
  const handrailHeight = 90; // cm
  const handrailLength = numSteps * Math.sqrt(riser * riser + tread * tread) / 100; // m, approx
  // Number of balusters per tread: tread/15cm
  const balusterSpacing = 15; // cm (max 15cm to prevent child passing)
  const balustersPerTread = Math.ceil(tread / balusterSpacing);

  // ============ 7. MATERIAL QUANTITY ============
  const sMat = stairMaterials[material] || stairMaterials['concrete'];
  const fMat = stairMaterials[finishMaterial] || stairMaterials['wood-tile'];

  // Total stair area (m²)
  const totalRun_m = (numSteps - 1) * tread / 100;
  const totalRise_m = fh / 100;
  const hypotenuse_m = Math.sqrt(totalRun_m * totalRun_m + totalRise_m * totalRise_m);
  const stairArea_m2 = hypotenuse_m * (aW / 100);

  // Concrete volume (for concrete stairs): area x thickness
  const concreteVolume_m3 = stairArea_m2 * (sMat.thickness_mm / 1000);
  // Reinforcement for concrete stairs: ~80 kg/m³
  const rebarWeight_kg = concreteVolume_m3 * 80;

  // Cost
  const structureCost = stairArea_m2 * sMat.cost_per_m2;
  const finishCost = stairArea_m2 * fMat.cost_per_m2;
  const handrailCostPerM = 250000; // wood/stainless handrail ~Rp 250k/m
  const handrailCost = handrailLength * handrailCostPerM;
  const totalCost = structureCost + finishCost + handrailCost;

  // ============ 8. SNI CHECKS ============
  const checks = {
    riserOK: riser <= riserMax && riser >= riserMin,
    treadOK: tread >= treadMin,
    blondelOK: (2 * riser + tread) >= 60 && (2 * riser + tread) <= 65,
    widthOK: aW >= 80,
    slopeOK: slopeDeg >= 30 && slopeDeg <= 50,
    headroomOK: true, // assumed
  };

  const safe = checks.riserOK && checks.treadOK && checks.widthOK;

  // ============ 9. LAYOUT POSITIONS (for visualization) ============
  // Array of step positions: {x, y, z} where z=rise
  const stepPositions = [];
  for (let i = 0; i < numSteps; i++) {
    const x = i * tread;
    const z = i * riser;
    stepPositions.push({ step: i + 1, x, z, riser, tread });
  }

  return {
    // Input
    stairType: stType.name,
    stairTypeKey: stairType,
    material: sMat.name,
    materialKey: material,
    finishMaterial: fMat.name,
    finishMaterialKey: finishMaterial,

    // Dimensions
    floorHeight_cm: fh,
    riser_cm: riser.toFixed(2),
    tread_cm: tread.toFixed(2),
    numRisers,
    numSteps,
    numFlights,
    stepsPerFlight,
    slope_deg: slopeDeg.toFixed(1),
    blondelValue: (2 * riser + tread).toFixed(2),

    // Layout
    requiredLength_cm: requiredLength.toFixed(0),
    availableLength_cm: aL,
    width_cm: aW,
    footprint: { length: footprint.length.toFixed(0), width: footprint.width.toFixed(0) },
    hasBordes,
    bordesDepth_cm: hasBordes ? bordesDepth.toFixed(0) : 0,
    landingDepth_cm: landingDepth,
    landingWidth_cm: landingWidth,

    // Handrail
    handrailHeight_cm: handrailHeight,
    handrailLength_m: handrailLength.toFixed(2),
    balustersPerTread,
    balusterSpacing_cm: balusterSpacing,

    // Material
    stairArea_m2: stairArea_m2.toFixed(2),
    concreteVolume_m3: concreteVolume_m3.toFixed(3),
    rebarWeight_kg: rebarWeight_kg.toFixed(1),
    structureCost_IDR: Math.round(structureCost),
    finishCost_IDR: Math.round(finishCost),
    handrailCost_IDR: Math.round(handrailCost),
    totalCost_IDR: Math.round(totalCost),

    // Steps for visualization
    stepPositions,

    // Checks
    checks,
    safe,

    // SNI Reference
    sniStandards: ['SNI 1727-2013 (Beban & Geometri)', 'SNI 03-2847-2002 (Beton Bertulang)'],
  };
}

// Get recommended stair type based on available space
export function getRecommendedStairType(availableLength_cm, availableWidth_cm) {
  const aL = availableLength_cm || 350;
  const aW = availableWidth_cm || 100;

  if (aL < 150) return 'spiral';
  if (aL < 200) return 'u-shape';
  if (aL < 300) return 'l-shape';
  if (aL < 400) return 'straight';
  return 'straight';
}
