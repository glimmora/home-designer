// Cost calculation utilities

/**
 * Calculate material cost estimate based on design.
 * @param {Object} params - { floors, plot, building, costSettings }
 * @returns {Object} Detailed cost breakdown
 */
export function calculateCost({ floors, plot, building, costSettings }) {
  const breakdown = {
    floors: [],
    totals: {
      wallArea: 0,         // m²
      floorArea: 0,        // m²
      columnVolume: 0,     // m³
      paintArea: 0,        // m²
      foundationArea: 0,   // m²
    },
    costs: {
      walls: 0,
      floors: 0,
      columns: 0,
      paint: 0,
      foundation: 0,
    },
    grandTotal: 0,
  };

  const buildingAreaM2 = (building.width * building.depth) / 10000;

  floors.forEach((floor) => {
    const floorData = {
      name: floor.name,
      wallLength: 0,       // cm
      wallArea: 0,         // m²
      floorArea: 0,        // m²
      columnCount: 0,
      columnVolume: 0,     // m³
      paintArea: 0,        // m²
      itemArea: 0,         // m² (footprint)
      itemCount: 0,
    };

    // Wall length & area
    floor.walls.forEach((wall) => {
      const dx = wall.x2 - wall.x1;
      const dy = wall.y2 - wall.y1;
      const len = Math.sqrt(dx * dx + dy * dy);
      floorData.wallLength += len;
    });
    // Wall area = length (m) * height (m)
    floorData.wallArea = (floorData.wallLength / 100) * (floor.height / 100);

    // Floor area (use building footprint if no walls, else bounding of walls)
    if (floorData.wallArea > 0) {
      floorData.floorArea = buildingAreaM2;
    } else {
      floorData.floorArea = buildingAreaM2;
    }

    // Columns
    floorData.columnCount = floor.columns.length;
    floor.columns.forEach((col) => {
      // Volume = size x size x height (m³)
      const vol = (col.size / 100) * (col.size / 100) * (floor.height / 100);
      floorData.columnVolume += vol;
    });

    // Paint area (interior walls both sides = 2x wall area)
    floorData.paintArea = floorData.wallArea * 2;

    // Items
    floorData.itemCount = floor.items.length;
    floor.items.forEach((item) => {
      floorData.itemArea += (item.w * item.h) / 10000;
    });

    breakdown.floors.push(floorData);

    breakdown.totals.wallArea += floorData.wallArea;
    breakdown.totals.floorArea += floorData.floorArea;
    breakdown.totals.columnVolume += floorData.columnVolume;
    breakdown.totals.paintArea += floorData.paintArea;
  });

  // Foundation (only once, area = building footprint)
  breakdown.totals.foundationArea = buildingAreaM2;

  // Calculate costs
  breakdown.costs.walls = breakdown.totals.wallArea * costSettings.wallPerM2;
  breakdown.costs.floors = breakdown.totals.floorArea * costSettings.floorPerM2;
  breakdown.costs.columns = breakdown.totals.columnVolume * costSettings.columnPerM3;
  breakdown.costs.paint = breakdown.totals.paintArea * costSettings.paintPerM2;
  breakdown.costs.foundation = breakdown.totals.foundationArea * costSettings.foundationPerM2;

  breakdown.grandTotal =
    breakdown.costs.walls +
    breakdown.costs.floors +
    breakdown.costs.columns +
    breakdown.costs.paint +
    breakdown.costs.foundation;

  return breakdown;
}

/**
 * Format currency (IDR by default).
 */
export function formatCurrency(amount, currency = 'IDR') {
  if (currency === 'IDR') {
    return 'Rp ' + Math.round(amount).toLocaleString('id-ID');
  }
  if (currency === 'USD') {
    return '$' + amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }
  return amount.toLocaleString() + ' ' + currency;
}

/**
 * Format number with unit.
 */
export function formatNumber(value, unit = '', decimals = 2) {
  return value.toLocaleString('id-ID', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }) + (unit ? ' ' + unit : '');
}
