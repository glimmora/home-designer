// ============= UNIT CONVERSION =============
export function toDisplay(cmValue, unit) {
  return unit === 'm' ? cmValue / 100 : cmValue;
}

export function fromDisplay(displayValue, unit) {
  return unit === 'm' ? displayValue * 100 : displayValue;
}

export function formatDimension(cmValue, unit) {
  if (unit === 'm') return (cmValue / 100).toFixed(2) + ' m';
  return Math.round(cmValue) + ' cm';
}

export function formatDimensionShort(cmValue, unit) {
  return unit === 'm' ? (cmValue / 100).toFixed(2) : Math.round(cmValue);
}

export function formatArea(cmWidth, cmDepth) {
  const m2 = (cmWidth * cmDepth) / 10000;
  return m2.toFixed(2) + ' m²';
}

export function unitLabel(unit) {
  return unit;
}

// Snap to grid (in cm)
export function snapToGrid(value, gridSize = 10) {
  return Math.round(value / gridSize) * gridSize;
}

// Color helpers
export function normalizeColor(color) {
  if (!color) return '#8B7355';
  return color.trim();
}
