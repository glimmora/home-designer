// ============================================================
// REBAR BILL OF MATERIALS (BOM) - Aggregate semua besi
// Mencakup: Pondasi → Sloof → Kolom → Balok → Ring Balok → Atap
// ============================================================

import { rebarProperties, concreteGrades, steelGrades } from './structuralAnalysis';
import { autoCalculateSloof, sloofMinDimensions } from './beamDesigner';
import { autoCalculateBeam, beamPresets } from './beamDesigner';
import { roofTypes, roofMaterials, frameMaterials, autoCalculateRoofTruss } from './roofDesigner';

// Standard column dimensions per number of stories
const columnDimensionsByStory = {
  1: { size: 200, mainDia: 10, numBars: 4, stirrupDia: 8, stirrupSpacing: 150 },
  2: { size: 250, mainDia: 13, numBars: 4, stirrupDia: 8, stirrupSpacing: 150 },
  3: { size: 300, mainDia: 16, numBars: 6, stirrupDia: 10, stirrupSpacing: 100 },
};

/**
 * Calculate rebar BOM for entire building from foundation to roof
 * Reads from store: floors, building, plot, structuralSettings
 */
export function calculateFullRebarBOM({
  floors,
  building,
  plot,
  structuralSettings,
  roofConfig,           // { roofType, frameMaterial, roofingMaterial, pitch_deg }
  foundationConfig,     // { type, soilBearing, depth }
}) {
  const items = []; // each: { element, location, dia, type, count, lengthPerUnit_m, totalLength_m, weight_kg, fy }
  const warnings = [];

  // ============= 1. PONDASI (FOUNDATION) =============
  // Untuk pondasi telapak: tulangan D10 @ 200mm dua arah (mesh)
  // Untuk pondasi batu kali: tidak pakai besi (beton tidak bertulang)
  const foundationType = foundationConfig?.type || 'strip-footing';
  const buildingW_m = (building?.width || 600) / 100;
  const buildingD_m = (building?.depth || 800) / 100;
  const perimeter_m = 2 * (buildingW_m + buildingD_m);
  const numColumns = floors[0]?.columns?.length || 4;
  const numStories = floors.length;

  if (foundationType === 'isolated-spread' || foundationType === 'raft') {
    // Telapak pondasi: mesh D10-200
    const footingSize_m = 1.0; // 100x100cm std untuk rumah 1-2 lantai
    const meshSpacing = 0.20; // 200mm
    const barsPerFooting = Math.ceil(footingSize_m / meshSpacing);
    const totalBars = barsPerFooting * 2 * numColumns; // dua arah x numColumns
    const lengthPerBar = footingSize_m;
    const totalLength_m = totalBars * lengthPerBar;
    const weight = totalLength_m * rebarProperties.D10.weight;

    items.push({
      element: 'Pondasi Telapak',
      elementKey: 'foundation',
      location: `${numColumns} titik pondasi`,
      dia: 10,
      type: 'D10 (mesh dua arah)',
      count: totalBars,
      lengthPerUnit_m: lengthPerBar.toFixed(2),
      totalLength_m: totalLength_m.toFixed(2),
      weight_kg: weight.toFixed(2),
      fy: 400,
    });
  } else if (foundationType === 'pile') {
    // Pondasi tiang pancang: tiang beton prategang (PC pile) - tidak ada besi tulangan terpisah
    // Tapi pile cap pakai besi D13 mesh
    const capSize_m = 1.5; // 150x150cm
    const meshSpacing = 0.15;
    const barsPerCap = Math.ceil(capSize_m / meshSpacing);
    const totalBars = barsPerCap * 2 * numColumns;
    const totalLength_m = totalBars * capSize_m;
    const weight = totalLength_m * rebarProperties.D13.weight;

    items.push({
      element: 'Pile Cap (Pondasi Tiang)',
      elementKey: 'foundation',
      location: `${numColumns} pile cap`,
      dia: 13,
      type: 'D13 (mesh dua arah)',
      count: totalBars,
      lengthPerUnit_m: capSize_m.toFixed(2),
      totalLength_m: totalLength_m.toFixed(2),
      weight_kg: weight.toFixed(2),
      fy: 400,
    });
  }
  // strip-footing: batu kali + beton tidak bertulang (skip besi)

  // ============= 2. SLOOF (FOUNDATION BEAM) =============
  // Sloof kontinu di sekeliling perimeter + di bawah dinding interior
  const sloofSpan = 3; // asumsi jarak antar kolom rata-rata
  const sloofResult = autoCalculateSloof({
    span_m: sloofSpan,
    numStories,
    concreteGrade: structuralSettings?.concreteGrade || 'K-200',
    steelGrade: structuralSettings?.steelGrade || 'BJTD400',
  });

  // Estimasi total panjang sloof: perimeter + dinding interior (asumsi 1.5x perimeter)
  const sloofTotalLength_m = perimeter_m * 1.5;
  const sloofSegments = Math.ceil(sloofTotalLength_m / sloofSpan);
  const sloofMainBarsTotalLength = sloofResult.numMainBars * sloofTotalLength_m;
  const sloofStirrupCount = sloofSegments * sloofResult.totalStirrups;
  const sloofMainWeight = sloofMainBarsTotalLength * rebarProperties[`D${sloofResult.mainDiameter_mm}`].weight;
  const sloofStirrupWeight = sloofStirrupCount * (2 * (sloofResult.width_mm - 2*sloofResult.cover_mm) + 2 * (sloofResult.height_mm - 2*sloofResult.cover_mm)) / 1000 * rebarProperties[`D${sloofResult.stirrupDiameter_mm}`].weight;

  items.push({
    element: 'Sloof - Tulangan Utama',
    elementKey: 'sloof',
    location: `${sloofTotalLength_m.toFixed(1)} m total (${sloofResult.numMainBars} batang kontinyu)`,
    dia: sloofResult.mainDiameter_mm,
    type: `D${sloofResult.mainDiameter_mm} (tulangan utama)`,
    count: sloofResult.numMainBars,
    lengthPerUnit_m: sloofTotalLength_m.toFixed(2),
    totalLength_m: sloofMainBarsTotalLength.toFixed(2),
    weight_kg: sloofMainWeight.toFixed(2),
    fy: 400,
  });

  items.push({
    element: 'Sloof - Sengkang',
    elementKey: 'sloof',
    location: `D${sloofResult.stirrupDiameter_mm} @ ${sloofResult.stirrupSpacingField_mm}mm (tengah), ${sloofResult.stirrupSpacingSupport_mm}mm (tumpuan)`,
    dia: sloofResult.stirrupDiameter_mm,
    type: `D${sloofResult.stirrupDiameter_mm} (sengkang)`,
    count: sloofStirrupCount,
    lengthPerUnit_m: ((2 * (sloofResult.width_mm - 2*sloofResult.cover_mm) + 2 * (sloofResult.height_mm - 2*sloofResult.cover_mm))/1000).toFixed(2),
    totalLength_m: (sloofStirrupCount * (2 * (sloofResult.width_mm - 2*sloofResult.cover_mm) + 2 * (sloofResult.height_mm - 2*sloofResult.cover_mm)) / 1000).toFixed(2),
    weight_kg: sloofStirrupWeight.toFixed(2),
    fy: 240,
  });

  // ============= 3. KOLOM (COLUMNS) =============
  // Setiap kolom: 4 atau 6 batang utama + sengkang sepanjang tinggi
  const colDim = columnDimensionsByStory[numStories] || columnDimensionsByStory[2];
  const colMainDia = structuralSettings?.mainBarDiameter || colDim.mainDia;
  const colStirrupDia = structuralSettings?.stirrupDiameter || colDim.stirrupDia;
  const colStirrupSpacing = structuralSettings?.stirrupSpacing || colDim.stirrupSpacing;
  const colNumBars = colDim.numBars;
  const colSize_mm = colDim.size;
  const colCover = 40;

  // Total height = sum of floor heights
  const colTotalHeight_m = floors.reduce((s, f) => s + (f.height || 300) / 100, 0);
  // Add 1.5m foundation-to-sloof stub column
  const colStubHeight_m = 1.5;
  const colFullHeight_m = colTotalHeight_m + colStubHeight_m;

  // Main bars: per column x num columns x height (with lap splices +1m each)
  const lapLength_m = 1.0; // sambungan lempiran 1m
  const colMainLengthPerBar = colFullHeight_m + (numStories * lapLength_m);
  const colMainTotalBars = colNumBars * numColumns;
  const colMainTotalLength_m = colMainTotalBars * colMainLengthPerBar;
  const colMainWeight = colMainTotalLength_m * rebarProperties[`D${colMainDia}`].weight;

  items.push({
    element: 'Kolom - Tulangan Utama',
    elementKey: 'column',
    location: `${numColumns} kolom x ${colNumBars} batang x ${colFullHeight_m.toFixed(1)} m (termasuk lempiran)`,
    dia: colMainDia,
    type: `D${colMainDia} (tulangan utama)`,
    count: colMainTotalBars,
    lengthPerUnit_m: colMainLengthPerBar.toFixed(2),
    totalLength_m: colMainTotalLength_m.toFixed(2),
    weight_kg: colMainWeight.toFixed(2),
    fy: 400,
  });

  // Stirrups: count x numColumns x numStories (per floor has its own set)
  const colStirrupsPerColumn = Math.ceil(colFullHeight_m * 1000 / colStirrupSpacing);
  const colStirrupCount = colStirrupsPerColumn * numColumns;
  const colStirrupPerim_mm = 4 * (colSize_mm - 2 * colCover); // square column
  const colStirrupLengthPerUnit_m = colStirrupPerim_mm / 1000;
  const colStirrupTotalLength_m = colStirrupCount * colStirrupLengthPerUnit_m;
  const colStirrupWeight = colStirrupTotalLength_m * rebarProperties[`D${colStirrupDia}`].weight;

  items.push({
    element: 'Kolom - Sengkang',
    elementKey: 'column',
    location: `D${colStirrupDia} @ ${colStirrupSpacing}mm sepanjang ${colFullHeight_m.toFixed(1)} m`,
    dia: colStirrupDia,
    type: `D${colStirrupDia} (sengkang)`,
    count: colStirrupCount,
    lengthPerUnit_m: colStirrupLengthPerUnit_m.toFixed(2),
    totalLength_m: colStirrupTotalLength_m.toFixed(2),
    weight_kg: colStirrupWeight.toFixed(2),
    fy: 240,
  });

  // ============= 4. BALOK (BEAMS per floor) =============
  // Untuk setiap lantai: balok perimeter + balok interior
  // Asumsi: total panjang balok per lantai = 1.5 x perimeter
  const beamSpan = 4; // rata-rata
  const beamPreset = numStories >= 2 ? beamPresets['balok-lantai2'] : beamPresets['balok-lantai1'];
  const beamResult = autoCalculateBeam({
    span_m: beamSpan,
    load_kN_per_m: numStories >= 2 ? 20 : 15,
    supportType: 'continuous',
    concreteGrade: beamPreset.fc_grade,
    steelGrade: beamPreset.fy_grade,
    numMainBars: beamPreset.mainBars,
    mainDiameter: beamPreset.mainDiameter,
    stirrupDiameter: beamPreset.stirrupDiameter,
    cover: 40,
  });

  const beamLengthPerFloor = perimeter_m * 1.5;
  const beamSegmentsPerFloor = Math.ceil(beamLengthPerFloor / beamSpan);
  const beamTotalLength_m = beamLengthPerFloor * numStories;
  const beamTotalSegments = beamSegmentsPerFloor * numStories;

  // Beam main bars
  const beamMainTotalLength = beamResult.numMainBars * beamTotalLength_m;
  const beamMainWeight = beamMainTotalLength * rebarProperties[`D${beamPreset.mainDiameter}`].weight;

  items.push({
    element: `Balok Lantai (semua lantai) - Tulangan Utama`,
    elementKey: 'beam',
    location: `${beamResult.numMainBars} batang x ${beamTotalLength_m.toFixed(1)} m total (semua lantai)`,
    dia: beamPreset.mainDiameter,
    type: `D${beamPreset.mainDiameter} (tulangan utama)`,
    count: beamResult.numMainBars * beamTotalSegments,
    lengthPerUnit_m: beamSpan.toFixed(2),
    totalLength_m: beamMainTotalLength.toFixed(2),
    weight_kg: beamMainWeight.toFixed(2),
    fy: 400,
  });

  // Beam stirrups
  const beamStirrupCount = beamTotalSegments * Math.ceil(beamSpan * 1000 / beamPreset.stirrupSpacing);
  const beamStirrupPerim_m = (2 * (beamPreset.width_mm - 80) + 2 * (beamPreset.height_mm - 80)) / 1000;
  const beamStirrupTotalLength_m = beamStirrupCount * beamStirrupPerim_m;
  const beamStirrupWeight = beamStirrupTotalLength_m * rebarProperties[`D${beamPreset.stirrupDiameter}`].weight;

  items.push({
    element: `Balok Lantai - Sengkang`,
    elementKey: 'beam',
    location: `D${beamPreset.stirrupDiameter} @ ${beamPreset.stirrupSpacing}mm (${beamTotalSegments} batang)`,
    dia: beamPreset.stirrupDiameter,
    type: `D${beamPreset.stirrupDiameter} (sengkang)`,
    count: beamStirrupCount,
    lengthPerUnit_m: beamStirrupPerim_m.toFixed(2),
    totalLength_m: beamStirrupTotalLength_m.toFixed(2),
    weight_kg: beamStirrupWeight.toFixed(2),
    fy: 240,
  });

  // ============= 5. RING BALOK ATAS (TOP RING BEAM) =============
  // Di puncak dinding, di bawah kuda-kuda atap
  const ringPreset = beamPresets['ring-balok'];
  const ringPerimeter_m = perimeter_m;
  const ringMainTotalLength = ringPreset.mainBars * ringPerimeter_m;
  const ringMainWeight = ringMainTotalLength * rebarProperties[`D${ringPreset.mainDiameter}`].weight;

  items.push({
    element: 'Ring Balok Atas - Tulangan Utama',
    elementKey: 'ring-beam',
    location: `${ringPreset.mainBars} batang x ${ringPerimeter_m.toFixed(1)} m perimeter`,
    dia: ringPreset.mainDiameter,
    type: `D${ringPreset.mainDiameter} (tulangan utama)`,
    count: ringPreset.mainBars,
    lengthPerUnit_m: ringPerimeter_m.toFixed(2),
    totalLength_m: ringMainTotalLength.toFixed(2),
    weight_kg: ringMainWeight.toFixed(2),
    fy: 400,
  });

  const ringStirrupCount = Math.ceil(ringPerimeter_m / (ringPreset.stirrupSpacing / 1000));
  const ringStirrupPerim_m = (2 * (ringPreset.width_mm - 80) + 2 * (ringPreset.height_mm - 80)) / 1000;
  const ringStirrupTotalLength = ringStirrupCount * ringStirrupPerim_m;
  const ringStirrupWeight = ringStirrupTotalLength * rebarProperties[`D${ringPreset.stirrupDiameter}`].weight;

  items.push({
    element: 'Ring Balok Atas - Sengkang',
    elementKey: 'ring-beam',
    location: `D${ringPreset.stirrupDiameter} @ ${ringPreset.stirrupSpacing}mm (${ringStirrupCount} buah)`,
    dia: ringPreset.stirrupDiameter,
    type: `D${ringPreset.stirrupDiameter} (sengkang)`,
    count: ringStirrupCount,
    lengthPerUnit_m: ringStirrupPerim_m.toFixed(2),
    totalLength_m: ringStirrupTotalLength.toFixed(2),
    weight_kg: ringStirrupWeight.toFixed(2),
    fy: 240,
  });

  // ============= 6. ATAP (ROOF) =============
  // Jika roofConfig ada, hitung ring balok atap yang dipisah
  if (roofConfig && roofConfig.frameMaterial) {
    const roofResult = autoCalculateRoofTruss({
      span_m: buildingW_m,
      length_m: buildingD_m,
      roofType: roofConfig.roofType || 'pelana',
      frameMaterial: roofConfig.frameMaterial || 'kayu-kamper',
      roofingMaterial: roofConfig.roofingMaterial || 'genteng-keramik',
      pitch_deg: roofConfig.pitch_deg || 25,
    });

    // Ring balok atap (di atas ring balok dinding teratas, di bawah kuda-kuda)
    // Already covered above by ring-balok preset, but for tall roofs add separate "rooftop ring beam"
    // (not adding new item, but if frameType is steel, no rebar needed for truss itself)

    if (roofResult.frameType === 'steel') {
      // Steel roof = no concrete rebar, but anchors D13
      items.push({
        element: 'Atap - Anchor Bolt (Baja)',
        elementKey: 'roof',
        location: `${roofResult.numTrusses} kuda-kuda x 4 anchor`,
        dia: 13,
        type: `D13 (anchor bolt ke ring balok)`,
        count: roofResult.numTrusses * 4,
        lengthPerUnit_m: '0.40',
        totalLength_m: (roofResult.numTrusses * 4 * 0.4).toFixed(2),
        weight_kg: (roofResult.numTrusses * 4 * 0.4 * rebarProperties.D13.weight).toFixed(2),
        fy: 400,
      });
    }
    // Wood roof: hold-down bolts D10
    if (roofResult.frameType === 'wood') {
      items.push({
        element: 'Atap - Hold-down Bolt (Kayu)',
        elementKey: 'roof',
        location: `${roofResult.numTrusses} kuda-kuda x 2 bolt`,
        dia: 10,
        type: `D10 (hold-down bolt ke ring balok)`,
        count: roofResult.numTrusses * 2,
        lengthPerUnit_m: '0.30',
        totalLength_m: (roofResult.numTrusses * 2 * 0.3).toFixed(2),
        weight_kg: (roofResult.numTrusses * 2 * 0.3 * rebarProperties.D10.weight).toFixed(2),
        fy: 400,
      });
    }
  }

  // ============= AGGREGATE BY DIAMETER =============
  const byDiameter = {};
  items.forEach(item => {
    if (!byDiameter[item.dia]) {
      byDiameter[item.dia] = { dia: item.dia, count: 0, totalLength_m: 0, weight_kg: 0 };
    }
    byDiameter[item.dia].count += item.count;
    byDiameter[item.dia].totalLength_m += parseFloat(item.totalLength_m);
    byDiameter[item.dia].weight_kg += parseFloat(item.weight_kg);
  });

  const diameterSummary = Object.values(byDiameter).sort((a, b) => a.dia - b.dia).map(d => ({
    ...d,
    totalLength_m: d.totalLength_m.toFixed(2),
    weight_kg: d.weight_kg.toFixed(2),
  }));

  // ============= AGGREGATE BY ELEMENT =============
  const byElement = {};
  items.forEach(item => {
    if (!byElement[item.elementKey]) {
      byElement[item.elementKey] = { elementKey: item.elementKey, weight_kg: 0, items: [] };
    }
    byElement[item.elementKey].weight_kg += parseFloat(item.weight_kg);
    byElement[item.elementKey].items.push(item);
  });

  const elementSummary = Object.values(byElement).map(e => ({
    ...e,
    weight_kg: e.weight_kg.toFixed(2),
  }));

  const totalWeight = items.reduce((s, i) => s + parseFloat(i.weight_kg), 0);

  // ============= COST ESTIMATE =============
  // Harga besi beton per kg (2024):
  // D10: Rp 12.500/kg, D13: Rp 12.500/kg, D16+: Rp 12.800/kg, Sengkang D6/D8: Rp 13.000/kg
  const pricePerKg = (dia) => dia >= 16 ? 12800 : dia >= 10 ? 12500 : 13000;
  const totalCost = items.reduce((s, i) => s + parseFloat(i.weight_kg) * pricePerKg(i.dia), 0);

  // ============= CONCRETE VOLUME =============
  // Pondasi (strip): perimeter x 0.6m x 0.6m
  const foundationVol = foundationType === 'strip-footing'
    ? perimeter_m * 0.6 * 0.6
    : foundationType === 'isolated-spread'
    ? numColumns * 1.0 * 1.0 * 0.25
    : foundationType === 'raft'
    ? buildingW_m * buildingD_m * 0.4
    : 0;

  // Sloof: width x height x length
  const sloofVol = (sloofResult.width_mm / 1000) * (sloofResult.height_mm / 1000) * sloofTotalLength_m;

  // Columns: size² x height x numColumns
  const colVol = Math.pow(colSize_mm / 1000, 2) * colFullHeight_m * numColumns;

  // Beams: width x height x totalLength per floor
  const beamVol = (beamPreset.width_mm / 1000) * (beamPreset.height_mm / 1000) * beamTotalLength_m;

  // Ring beam
  const ringVol = (ringPreset.width_mm / 1000) * (ringPreset.height_mm / 1000) * ringPerimeter_m;

  const totalConcreteVol_m3 = foundationVol + sloofVol + colVol + beamVol + ringVol;

  return {
    items,
    diameterSummary,
    elementSummary,
    totals: {
      totalWeight_kg: totalWeight.toFixed(2),
      totalCost_IDR: Math.round(totalCost),
      totalConcrete_m3: totalConcreteVol_m3.toFixed(2),
      foundationVol_m3: foundationVol.toFixed(2),
      sloofVol_m3: sloofVol.toFixed(2),
      columnVol_m3: colVol.toFixed(2),
      beamVol_m3: beamVol.toFixed(2),
      ringBeamVol_m3: ringVol.toFixed(2),
      numRebarItems: items.length,
    },
    warnings,
    sniStandards: [
      'SNI 03-2847-2002 (Beton Bertulang)',
      'SNI 03-1729-2002 (Baja Bukan Profil)',
      'SNI 1726-2012 (Beban Gempa)',
      'SNI 1727-2013 (Beban Minimum)',
    ],
  };
}

// Helper: format currency
export function formatIDR(num) {
  return 'Rp ' + Math.round(num).toLocaleString('id-ID');
}
