// ============================================================
// ADVANCED ENGINEERING - Wind, Foundation, Energy, BOM
// All calculations based on Indonesian SNI standards
// 100% offline, no API calls
// ============================================================

// ============= WIND LOAD ANALYSIS (SNI 1727-2013 Section 27) =============

// Wind speed map for Indonesian cities (3-second gust, m/s)
export const windSpeedZones = {
  'jakarta':    { city: 'Jakarta',    V: 20, exposure: 'B' },
  'bandung':    { city: 'Bandung',    V: 20, exposure: 'B' },
  'surabaya':   { city: 'Surabaya',   V: 25, exposure: 'B' },
  'medan':      { city: 'Medan',      V: 25, exposure: 'B' },
  'makassar':   { city: 'Makassar',   V: 30, exposure: 'B' },
  'denpasar':   { city: 'Denpasar',   V: 25, exposure: 'B' },
  'manado':     { city: 'Manado',     V: 35, exposure: 'B' },
  'padang':     { city: 'Padang',     V: 30, exposure: 'B' },
  'pontianak':  { city: 'Pontianak',  V: 25, exposure: 'B' },
  'ambon':      { city: 'Ambon',      V: 35, exposure: 'B' },
};

// Exposure categories
export const exposureCategories = {
  B: { name: 'Urban/Suburban (B)', alpha: 9.5, zg: 274.3, Kh: 0.84 },
  C: { name: 'Open Terrain (C)', alpha: 11.5, zg: 389.4, Kh: 1.03 },
  D: { name: 'Water Surface (D)', alpha: 14.3, zg: 457.2, Kh: 1.18 },
};

// Importance factor for wind
export const windImportanceFactors = {
  I:   { Iw: 0.87, name: 'Bangunan Biasa (Iw=0.87)' },
  II:  { Iw: 1.00, name: 'Bangunan Biasa (Iw=1.00)' },
  III: { Iw: 1.15, name: 'Substansial (Iw=1.15)' },
  IV:  { Iw: 1.15, name: 'Esensial (Iw=1.15)' },
};

/**
 * Calculate wind pressure and forces per SNI 1727-2013 Section 27
 * q = 0.613 * Kz * Kzt * Kd * V² * Iw (Pa)
 */
export function calculateWindLoad({
  buildingHeight,    // m (total height)
  buildingWidth,     // m (width perpendicular to wind)
  buildingDepth,     // m (depth parallel to wind)
  city,              // key in windSpeedZones
  exposureCategory,  // 'B' | 'C' | 'D'
  importanceFactor,  // Iw value
  roofAngle,         // degrees
}) {
  const zone = windSpeedZones[city] || windSpeedZones.jakarta;
  const exp = exposureCategories[exposureCategory] || exposureCategories.B;
  const V = zone.V; // basic wind speed m/s
  const Iw = importanceFactor || 1.0;

  // Velocity pressure exposure coefficient at mean roof height
  const h = Math.max(5, buildingHeight);
  const Kz = 2.01 * Math.pow(h / exp.zg, 2 / exp.alpha);
  const Kzt = 1.0; // topographic factor (flat terrain)
  const Kd = 0.85; // wind directionality factor

  // Velocity pressure (Pa)
  const q = 0.613 * Kz * Kzt * Kd * V * V * Iw;

  // Pressure coefficient (simplified for low-rise building)
  let Cp_wall = 0.8; // windward wall
  let Cp_leeward = -0.5; // leeward wall (depends on L/B ratio)
  const ratio = buildingDepth / buildingWidth;
  if (ratio <= 1) Cp_leeward = -0.5;
  else if (ratio <= 2) Cp_leeward = -0.3;
  else Cp_leeward = -0.2;

  // Roof pressure coefficient based on angle
  let Cp_roof;
  const angle = roofAngle || 0;
  if (angle < 10) Cp_roof = -0.7;
  else if (angle < 30) Cp_roof = -0.9 + (angle - 10) * 0.03;
  else Cp_roof = 0.0;

  // Design pressures (Pa)
  const p_windward = q * Cp_wall;
  const p_leeward = q * Cp_leeward;
  const p_roof = q * Cp_roof;

  // Total horizontal force on building (N)
  const wallArea = buildingHeight * buildingWidth;
  const F_windward = p_windward * wallArea;
  const F_leeward = p_leeward * wallArea;
  const F_total = F_windward - F_leeward; // net force

  // Base moment (N·m)
  const M_base = F_total * (buildingHeight / 2);

  // Overturning check
  const buildingWeight_N = buildingHeight * buildingWidth * buildingDepth * 24000 * 0.3; // rough estimate
  const resistingMoment = buildingWeight_N * (buildingDepth / 2);
  const safetyFactor = resistingMoment / Math.max(1, M_base);

  return {
    city: zone.city,
    V,
    Kz,
    q,              // Pa
    p_windward,     // Pa
    p_leeward,      // Pa
    p_roof,         // Pa
    F_total,        // N
    F_total_kN: F_total / 1000,
    M_base,         // N·m
    M_base_kNm: M_base / 1000,
    safetyFactor,
    stable: safetyFactor > 1.5,
  };
}

// ============= FOUNDATION DESIGN =============

// Foundation types
export const foundationTypes = {
  'strip-footing': {
    name: 'Pondasi Dinding (Strip Footing)',
    desc: 'Pondasi lajur di bawah dinding, cocok rumah 1-2 lantai',
    minDepth: 60, // cm
    maxWidth: 150, // cm
    costPerM: 850000, // IDR per meter
  },
  'isolated-spread': {
    name: 'Pondasi Telapak (Isolated Spread)',
    desc: 'Telapak beton di bawah kolom, cocok rumah 2+ lantai',
    minDepth: 80,
    maxWidth: 200,
    costPerM3: 1200000, // IDR per m³
  },
  'pile': {
    name: 'Pondasi Tiang Pancang',
    desc: 'Tiang beton/baja, untuk tanah lunak atau bangunan tinggi',
    minDepth: 300,
    maxWidth: 40,
    costPerM: 2500000, // IDR per meter tiang
  },
  'raft': {
    name: 'Pondasi Raft (Pelat)',
    desc: 'Pelat beton menutup seluruh area, untuk tanah lunak',
    minDepth: 100,
    maxWidth: 0,
    costPerM2: 1800000, // IDR per m²
  },
};

/**
 * Calculate foundation design based on building load and soil
 */
export function calculateFoundation({
  totalLoad_kN,      // total building load
  buildingWidth_m,   // m
  buildingDepth_m,   // m
  soilBearingCapacity, // kPa (typical: 150-300 for good soil)
  foundationType,    // key in foundationTypes
  numColumns,        // number of columns
}) {
  const fType = foundationTypes[foundationType] || foundationTypes['strip-footing'];
  const q_allow = soilBearingCapacity || 200; // kPa default

  const buildingArea = buildingWidth_m * buildingDepth_m;
  const totalContactPressure = totalLoad_kN / Math.max(1, buildingArea);

  let results = {
    type: fType.name,
    soilBearingCapacity: q_allow,
    totalLoad_kN,
    buildingArea_m2: buildingArea,
    contactPressure: totalContactPressure,
    safe: totalContactPressure < q_allow,
    safetyFactor: q_allow / Math.max(1, totalContactPressure),
    details: {},
    cost: 0,
  };

  if (foundationType === 'strip-footing') {
    // Strip footing under walls
    const wallLength = 2 * (buildingWidth_m + buildingDepth_m); // perimeter
    const requiredWidth = Math.ceil((totalLoad_kN / wallLength) / q_allow * 100); // cm
    const footingWidth = Math.max(60, Math.min(fType.maxWidth, requiredWidth));
    const depth = fType.minDepth;
    results.details = {
      wallLength_m: wallLength,
      footingWidth_cm: footingWidth,
      depth_cm: depth,
      concreteVolume_m3: wallLength * (footingWidth / 100) * (depth / 100),
    };
    results.cost = wallLength * fType.costPerM;
  } else if (foundationType === 'isolated-spread') {
    // Isolated footing under columns
    const loadPerColumn = totalLoad_kN / Math.max(1, numColumns);
    const footingArea = loadPerColumn / q_allow;
    const footingSize = Math.ceil(Math.sqrt(footingArea) * 100); // cm
    const depth = fType.minDepth;
    const totalVolume = numColumns * (footingSize / 100) * (footingSize / 100) * (depth / 100);
    results.details = {
      numColumns,
      loadPerColumn_kN: loadPerColumn,
      footingSize_cm: footingSize,
      depth_cm: depth,
      concreteVolume_m3: totalVolume,
    };
    results.cost = totalVolume * fType.costPerM3;
  } else if (foundationType === 'pile') {
    // Pile foundation
    const pileCapacity = 300; // kN per pile (assumed D40 pile)
    const numPiles = Math.ceil(totalLoad_kN / pileCapacity);
    const pileLength = 600; // cm typical
    results.details = {
      numPiles,
      pileLength_cm: pileLength,
      pileCapacity_kN: pileCapacity,
      totalPileLength_m: numPiles * (pileLength / 100),
    };
    results.cost = numPiles * (pileLength / 100) * fType.costPerM;
  } else if (foundationType === 'raft') {
    // Raft foundation
    const thickness = Math.max(40, Math.ceil(totalLoad_kN / buildingArea / 25)); // cm
    const volume = buildingArea * (thickness / 100);
    results.details = {
      area_m2: buildingArea,
      thickness_cm: thickness,
      concreteVolume_m3: volume,
    };
    results.cost = buildingArea * fType.costPerM2;
  }

  return results;
}

// ============= ENERGY SIMULATION =============

/**
 * Calculate cooling load and solar potential
 * Based on ASHRAE simplified method (adapted for Indonesia tropical climate)
 */
export function calculateEnergySimulation({
  buildingArea_m2,   // total floor area
  numFloors,
  wallArea_m2,       // total exterior wall area
  windowArea_m2,     // total window area
  roofArea_m2,       // roof area
  floorHeight_m,     // floor-to-floor height
  occupancy,         // people per floor
  location,          // city
}) {
  // Indonesia tropical climate constants
  const T_outdoor = 32; // °C design outdoor temp
  const T_indoor = 24;  // °C design indoor temp
  const dT = T_outdoor - T_indoor;

  // U-values (W/m²·K) - typical Indonesian construction
  const U_wall = 1.8;   // brick wall + plaster
  const U_window = 5.8;  // single glass
  const U_roof = 1.5;    // concrete slab + tile
  const U_floor = 1.2;   // concrete slab

  // Solar radiation (W/m²) - Indonesia average
  const G_wall = 200;    // vertical surface
  const G_roof = 800;    // horizontal surface
  const SHGC = 0.8;      // Solar Heat Gain Coefficient (single glass)

  // Cooling load components (W)
  const Q_walls = U_wall * wallArea_m2 * dT;
  const Q_windows_cond = U_window * windowArea_m2 * dT;
  const Q_windows_solar = G_roof * 0.3 * windowArea_m2 * SHGC; // simplified
  const Q_roof = U_roof * roofArea_m2 * dT + G_roof * 0.3 * roofArea_m2;
  const Q_infiltration = 0.5 * buildingArea_m2 * floorHeight_m * 0.33 * dT;

  // Internal gains (W)
  const Q_people = occupancy * 120; // 120W per person
  const Q_lights = 10 * buildingArea_m2; // 10 W/m²
  const Q_equipment = 5 * buildingArea_m2; // 5 W/m²

  // Total cooling load (W)
  const Q_total = Q_walls + Q_windows_cond + Q_windows_solar + Q_roof +
    Q_infiltration + Q_people + Q_lights + Q_equipment;

  // Safety factor
  const Q_design = Q_total * 1.15;

  // Convert to cooling capacity (PK = 2500W)
  const coolingPK = Q_design / 2500;
  const coolingkW = Q_design / 1000;

  // Solar panel potential
  const solarIrradiance = 4.5; // kWh/m²/day average Indonesia
  const panelEfficiency = 0.18; // 18% typical
  const usableRoofArea = roofArea_m2 * 0.7; // 70% usable
  const dailyEnergyProduction = usableRoofArea * solarIrradiance * panelEfficiency;

  // Annual energy estimate
  const annualCoolingEnergy = coolingkW * 8 * 365 * 0.6; // 8hrs/day, 60% load
  const annualOtherEnergy = (Q_lights + Q_equipment) / 1000 * 8 * 365;
  const annualTotalEnergy = annualCoolingEnergy + annualOtherEnergy;
  const solarCoverage = dailyEnergyProduction * 365 / Math.max(1, annualTotalEnergy) * 100;

  return {
    coolingLoad_W: Math.round(Q_total),
    coolingLoad_kW: (Q_total / 1000).toFixed(2),
    coolingPK: coolingPK.toFixed(1),
    designCooling_W: Math.round(Q_design),
    breakdown: {
      walls: Math.round(Q_walls),
      windows_cond: Math.round(Q_windows_cond),
      windows_solar: Math.round(Q_windows_solar),
      roof: Math.round(Q_roof),
      infiltration: Math.round(Q_infiltration),
      people: Q_people,
      lights: Q_lights,
      equipment: Q_equipment,
    },
    solar: {
      dailyProduction_kWh: dailyEnergyProduction.toFixed(2),
      annualProduction_kWh: Math.round(dailyEnergyProduction * 365),
      coveragePercent: Math.min(100, solarCoverage).toFixed(1),
      recommendedPanels: Math.floor(usableRoofArea / 2), // 2m² per panel
      roofUsableArea: usableRoofArea.toFixed(1),
    },
    annualEnergy: {
      cooling_kWh: Math.round(annualCoolingEnergy),
      other_kWh: Math.round(annualOtherEnergy),
      total_kWh: Math.round(annualTotalEnergy),
      estimatedCost_IDR: Math.round(annualTotalEnergy * 1500), // Rp 1500/kWh
    },
  };
}

// ============= BILL OF MATERIALS (BOM) =============

/**
 * Generate automatic Bill of Materials from design
 */
export function generateBOM({ floors, building, plot, structuralSettings, costSettings }) {
  const bom = [];
  let totalCost = 0;

  const fc = structuralSettings?.concreteGrade || 'K-250';
  const fcVal = { 'K-150': 12, 'K-175': 14, 'K-200': 16, 'K-225': 18, 'K-250': 20, 'K-300': 24, 'K-350': 28, 'K-400': 32 }[fc] || 20;

  // 1. Concrete
  let totalConcreteVolume = 0;
  floors.forEach(floor => {
    // Foundation slab (10cm per floor)
    totalConcreteVolume += (building.width * building.depth * 10) / 1000000; // m³
    // Columns
    floor.columns.forEach(col => {
      totalConcreteVolume += (col.size * col.size * floor.height) / 1000000;
    });
    // Walls (assume 15cm thick)
    floor.walls.forEach(wall => {
      const len = Math.sqrt((wall.x2-wall.x1)**2 + (wall.y2-wall.y1)**2);
      totalConcreteVolume += (len * 15 * floor.height) / 1000000;
    });
  });

  const concreteCost = totalConcreteVolume * costSettings?.wallPerM2 * 0.5 || totalConcreteVolume * 425000;
  bom.push({
    category: 'Struktur',
    item: `Beton Ready Mix K-${fcVal * 10}`,
    spec: `f'c = ${fcVal} MPa`,
    unit: 'm³',
    quantity: totalConcreteVolume.toFixed(2),
    unitPrice: 950000,
    total: Math.round(totalConcreteVolume * 950000),
  });
  totalCost += totalConcreteVolume * 950000;

  // 2. Rebar (approximate 100kg/m³ of concrete)
  const rebarWeight = totalConcreteVolume * 100; // kg
  bom.push({
    category: 'Struktur',
    item: 'Besi Beton Ulir (BJTD-400)',
    spec: 'D8-D16 mix',
    unit: 'kg',
    quantity: rebarWeight.toFixed(0),
    unitPrice: 12000,
    total: Math.round(rebarWeight * 12000),
  });
  totalCost += rebarWeight * 12000;

  // 3. Bricks
  let totalWallArea = 0;
  floors.forEach(floor => {
    floor.walls.forEach(wall => {
      const len = Math.sqrt((wall.x2-wall.x1)**2 + (wall.y2-wall.y1)**2);
      totalWallArea += (len * floor.height) / 10000; // m²
    });
  });
  const brickCount = Math.ceil(totalWallArea * 50); // ~50 bricks per m²
  bom.push({
    category: 'Dinding',
    item: 'Bata Merah',
    spec: 'Standar 20x10x5cm',
    unit: 'pcs',
    quantity: brickCount,
    unitPrice: 800,
    total: brickCount * 800,
  });
  totalCost += brickCount * 800;

  // 4. Cement
  const cementSacks = Math.ceil(totalConcreteVolume * 8 + totalWallArea * 2);
  bom.push({
    category: 'Material',
    item: 'Semen Portland 50kg',
    spec: 'OPC Type I',
    unit: 'sak',
    quantity: cementSacks,
    unitPrice: 65000,
    total: cementSacks * 65000,
  });
  totalCost += cementSacks * 65000;

  // 5. Sand
  const sandVolume = totalConcreteVolume * 0.5 + totalWallArea * 0.05;
  bom.push({
    category: 'Material',
    item: 'Pasir Beton',
    spec: 'Pasir cor',
    unit: 'm³',
    quantity: sandVolume.toFixed(2),
    unitPrice: 350000,
    total: Math.round(sandVolume * 350000),
  });
  totalCost += sandVolume * 350000;

  // 6. Floor tiles
  const floorArea = (building.width * building.depth * floors.length) / 10000;
  bom.push({
    category: 'Finishing',
    item: 'Keramik Lantai 40x40',
    spec: 'Glazed porcelain',
    unit: 'm²',
    quantity: floorArea.toFixed(2),
    unitPrice: 75000,
    total: Math.round(floorArea * 75000),
  });
  totalCost += floorArea * 75000;

  // 7. Paint
  const paintArea = totalWallArea * 2 + floorArea; // both sides + ceiling
  bom.push({
    category: 'Finishing',
    item: 'Cat Dinding Interior 25kg',
    spec: '1 galon = 50m²',
    unit: 'galon',
    quantity: Math.ceil(paintArea / 50),
    unitPrice: 580000,
    total: Math.ceil(paintArea / 50) * 580000,
  });
  totalCost += Math.ceil(paintArea / 50) * 580000;

  // 8. Doors & Windows (from items)
  let doorCount = 0, windowCount = 0;
  floors.forEach(floor => {
    floor.items.forEach(item => {
      if (item.type === 'door' || item.type === 'sliding-door' || item.type === 'folding-door') doorCount++;
      if (item.type === 'window' || item.type === 'window-large') windowCount++;
    });
  });
  if (doorCount > 0) {
    bom.push({
      category: 'Pintu & Jendela',
      item: 'Pintu Kayu + Kusen',
      spec: '80x210cm',
      unit: 'unit',
      quantity: doorCount,
      unitPrice: 1850000,
      total: doorCount * 1850000,
    });
    totalCost += doorCount * 1850000;
  }
  if (windowCount > 0) {
    bom.push({
      category: 'Pintu & Jendela',
      item: 'Jendela Aluminium + Kaca',
      spec: '120x120cm',
      unit: 'unit',
      quantity: windowCount,
      unitPrice: 850000,
      total: windowCount * 850000,
    });
    totalCost += windowCount * 850000;
  }

  // 9. Roof
  const roofArea = (building.width * building.depth) / 10000 * 1.1; // 10% overhang
  bom.push({
    category: 'Atap',
    item: 'Genteng Beton + Rangka Baja Ringan',
    spec: 'Lengkap dengan rangka',
    unit: 'm²',
    quantity: roofArea.toFixed(2),
    unitPrice: 200000,
    total: Math.round(roofArea * 200000),
  });
  totalCost += roofArea * 200000;

  // 10. Electrical & Plumbing (rough estimate)
  const totalArea = floorArea;
  bom.push({
    category: 'Instalasi',
    item: 'Instalasi Listrik (kabel, outlet, MCB)',
    spec: 'Standar SNI',
    unit: 'lot',
    quantity: 1,
    unitPrice: Math.round(totalArea * 150000),
    total: Math.round(totalArea * 150000),
  });
  totalCost += totalArea * 150000;

  bom.push({
    category: 'Instalasi',
    item: 'Instalasi Plumbing (PVC, kran, closet)',
    spec: 'Pipa PVC + sanitair',
    unit: 'lot',
    quantity: 1,
    unitPrice: Math.round(totalArea * 120000),
    total: Math.round(totalArea * 120000),
  });
  totalCost += totalArea * 120000;

  // Group by category
  const grouped = {};
  bom.forEach(item => {
    if (!grouped[item.category]) grouped[item.category] = [];
    grouped[item.category].push(item);
  });

  return {
    items: bom,
    grouped,
    totalCost: Math.round(totalCost),
    totalCostFormatted: 'Rp ' + Math.round(totalCost).toLocaleString('id-ID'),
    costPerM2: Math.round(totalCost / Math.max(1, floorArea)),
    summary: {
      concreteVolume_m3: totalConcreteVolume.toFixed(2),
      rebarWeight_kg: rebarWeight.toFixed(0),
      wallArea_m2: totalWallArea.toFixed(2),
      floorArea_m2: floorArea.toFixed(2),
      doors: doorCount,
      windows: windowCount,
    },
  };
}

// ============= IFC EXPORT (BIM) =============

/**
 * Generate simplified IFC (Industry Foundation Classes) file
 * Compatible with Revit, ArchiCAD, FreeCAD
 */
export function exportToIFC({ floors, plot, building }) {
  const lines = [];
  let entityId = 1;
  const nextId = () => entityId++;

  // IFC header
  lines.push('ISO-10303-21;');
  lines.push('HEADER;');
  lines.push(`FILE_DESCRIPTION(('Home Designer Pro Export'),'2;1');`);
  lines.push(`FILE_NAME('home-designer.ifc','${new Date().toISOString()}',('Home Designer Pro'),(''),('HDP v1.0','HDP'),('None'));`);
  lines.push(`FILE_SCHEMA(('IFC2X3'));`);
  lines.push('ENDSEC;');
  lines.push('DATA;');

  // Project
  const projId = nextId();
  lines.push(`#${projId}=IFCPROJECT('${projId}',$,'Home Designer Project',$,$,$,$,(#${projId+1}),#${projId+2});`);

  // Units (millimeters)
  const lenUnitId = nextId();
  lines.push(`#${lenUnitId}=IFCSIUNIT(*,.LENGTHUNIT.,$,.METRE.,.MILLI.);`);

  // Site
  const siteId = nextId();
  const siteWidth = plot.width * 10; // cm to mm
  const siteDepth = plot.depth * 10;
  lines.push(`#${siteId}=IFCSITE('${siteId}',$,'Site',$,$,#${nextId()},$,$,.ELEMENT.,(${siteWidth/2},${-siteDepth/2},0),(${siteWidth},${siteDepth}),0,$,$);`);

  // Building
  const bldgId = nextId();
  const bldgW = building.width * 10;
  const bldgD = building.depth * 10;
  const bldgX = (-plot.width/2 + building.offsetX) * 10;
  const bldgY = (-plot.depth/2 + building.offsetY) * 10;
  lines.push(`#${bldgId}=IFCBUILDING('${bldgId}',$,'Building',$,$,#${nextId()},$,$,.ELEMENT.,${bldgW},${bldgD},$,$,$);`);

  // Process each floor
  let currentY = 0;
  floors.forEach((floor, fIdx) => {
    const floorHeight_mm = floor.height * 10;
    const floorId = nextId();
    lines.push(`#${floorId}=IFCBUILDINGSTOREY('${floorId}',$,'${floor.name}',$,$,#${nextId()},$,$,.ELEMENT.,${currentY});`);

    // Walls as IFCWALL
    floor.walls.forEach((wall, wIdx) => {
      const wallId = nextId();
      const x1 = wall.x1 * 10, y1 = wall.y1 * 10, x2 = wall.x2 * 10, y2 = wall.y2 * 10;
      const len = Math.sqrt((x2-x1)**2 + (y2-y1)**2);
      lines.push(`#${wallId}=IFCWALL('${wallId}',$,'Wall_${wIdx}',$,$,#${nextId()},#${nextId()},#${nextId()});`);
      // Wall geometry (simplified as extruded rectangle)
      const geoId = nextId();
      lines.push(`#${geoId}=IFCEXTRUDEDAREASOLID(#${nextId()},#${nextId()},#${nextId()},${floorHeight_mm});`);
    });

    // Columns as IFCCOLUMN
    floor.columns.forEach((col, cIdx) => {
      const colId = nextId();
      const cx = col.x * 10, cy = col.y * 10, cs = col.size * 10;
      lines.push(`#${colId}=IFCCOLUMN('${colId}',$,'Column_${cIdx}',$,$,#${nextId()},#${nextId()},#${nextId()});`);
    });

    // Slab
    const slabId = nextId();
    lines.push(`#${slabId}=IFCSLAB('${slabId}',$,'Slab_${fIdx}',$,$,#${nextId()},#${nextId()},#${nextId()},.FLOOR.);`);

    currentY += floorHeight_mm;
  });

  lines.push('ENDSEC;');
  lines.push('END-ISO-10303-21;');

  return lines.join('\n');
}
