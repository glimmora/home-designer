import React, { useState, useRef, useCallback, useEffect } from 'react';

/**
 * DimensionSlider - Combined slider + manual input for dimension editing
 * Supports: drag to change, tap to input manually, real-time update
 * Works on both desktop (mouse) and mobile (touch)
 */
export default function DimensionSlider({
  label,
  value,          // current value in display unit
  onChange,       // callback when value changes (during drag)
  onCommit,       // callback when drag ends or input committed
  min = 1,
  max = 10000,
  step = 1,
  unit = 'cm',
  color = 'indigo',
  icon,
}) {
  const [isDragging, setIsDragging] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [inputValue, setInputValue] = useState(String(value));
  const trackRef = useRef(null);
  const dragStartRef = useRef({ x: 0, value: 0 });

  // Sync input value when external value changes (and not editing)
  useEffect(() => {
    if (!isEditing && !isDragging) {
      setInputValue(value % 1 === 0 ? String(value) : value.toFixed(2));
    }
  }, [value, isEditing, isDragging]);

  // ===== Drag handlers (mouse + touch) =====
  const handlePointerDown = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    dragStartRef.current = { x: clientX, value: parseFloat(value) || 0 };
    setIsDragging(true);

    const onMove = (ev) => {
      ev.preventDefault();
      const cx = ev.touches ? ev.touches[0].clientX : ev.clientX;
      const dx = cx - dragStartRef.current.x;
      // Each pixel = step * sensitivity (adjust for unit)
      const sensitivity = unit === 'm' ? 0.01 : 1;
      const delta = dx * sensitivity * step;
      let newVal = dragStartRef.current.value + delta;
      newVal = Math.round(newVal / step) * step;
      newVal = Math.max(min, Math.min(max, newVal));
      if (unit === 'm') {
        newVal = Math.round(newVal * 100) / 100;
      }
      onChange(newVal);
    };

    const onUp = () => {
      setIsDragging(false);
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
      document.removeEventListener('touchmove', onMove);
      document.removeEventListener('touchend', onUp);
      if (onCommit) onCommit();
    };

    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
    document.addEventListener('touchmove', onMove, { passive: false });
    document.addEventListener('touchend', onUp);
  }, [value, onChange, onCommit, min, max, step, unit]);

  // ===== Track click (jump to position) =====
  const handleTrackClick = useCallback((e) => {
    if (isDragging) return;
    const rect = trackRef.current.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const ratio = (clientX - rect.left) / rect.width;
    let newVal = min + ratio * (max - min);
    newVal = Math.round(newVal / step) * step;
    newVal = Math.max(min, Math.min(max, newVal));
    onChange(newVal);
    if (onCommit) onCommit();
  }, [isDragging, min, max, step, onChange, onCommit]);

  // ===== Manual input =====
  const handleInputChange = useCallback((e) => {
    setInputValue(e.target.value);
  }, []);

  const handleInputCommit = useCallback(() => {
    const parsed = parseFloat(inputValue);
    if (isFinite(parsed)) {
      const clamped = Math.max(min, Math.min(max, parsed));
      onChange(clamped);
      if (onCommit) onCommit();
      setInputValue(clamped % 1 === 0 ? String(clamped) : clamped.toFixed(2));
    } else {
      setInputValue(value % 1 === 0 ? String(value) : value.toFixed(2));
    }
    setIsEditing(false);
  }, [inputValue, min, max, onChange, onCommit, value]);

  const handleInputKeyDown = useCallback((e) => {
    if (e.key === 'Enter') {
      e.target.blur();
    } else if (e.key === 'Escape') {
      setInputValue(value % 1 === 0 ? String(value) : value.toFixed(2));
      setIsEditing(false);
    }
    e.stopPropagation();
  }, [value]);

  // ===== Quick increment/decrement buttons =====
  const handleStep = useCallback((dir) => {
    let newVal = (parseFloat(value) || 0) + dir * step;
    newVal = Math.round(newVal / step) * step;
    newVal = Math.max(min, Math.min(max, newVal));
    onChange(newVal);
    if (onCommit) onCommit();
  }, [value, step, min, max, onChange, onCommit]);

  // Calculate slider percentage
  const percent = Math.max(0, Math.min(100, ((parseFloat(value) || 0) - min) / (max - min) * 100));

  const colorClasses = {
    indigo: 'bg-indigo-600',
    blue: 'bg-blue-600',
    green: 'bg-green-600',
    amber: 'bg-amber-600',
    red: 'bg-red-600',
    purple: 'bg-purple-600',
    slate: 'bg-slate-600',
  };

  return (
    <div className="space-y-1">
      {/* Label + Input row */}
      <div className="flex items-center justify-between gap-2">
        <label className="text-[11px] text-slate-600 dark:text-slate-300 flex items-center gap-1 flex-shrink-0">
          {icon && <span className="text-[10px]">{icon}</span>}
          {label}
        </label>
        <div className="flex items-center gap-1">
          {/* Decrement button */}
          <button
            onPointerDown={(e) => { e.stopPropagation(); handleStep(-1); }}
            className="w-6 h-6 flex items-center justify-center bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 rounded text-xs font-bold text-slate-600 dark:text-slate-300 flex-shrink-0"
            title="Kurangi"
          >
            −
          </button>
          {/* Manual input */}
          {isEditing ? (
            <input
              type="number"
              value={inputValue}
              onChange={handleInputChange}
              onBlur={handleInputCommit}
              onKeyDown={handleInputKeyDown}
              onFocus={(e) => e.target.select()}
              className="w-16 px-1.5 py-0.5 text-xs text-center border border-indigo-400 dark:border-indigo-600 dark:bg-slate-700 dark:text-slate-100 rounded focus:outline-none focus:ring-1 focus:ring-indigo-500"
              autoFocus
              step={step}
              min={min}
              max={max}
            />
          ) : (
            <button
              onClick={() => {
                setIsEditing(true);
                setInputValue(value % 1 === 0 ? String(value) : value.toFixed(2));
              }}
              className="w-16 px-1.5 py-0.5 text-xs text-center bg-slate-50 dark:bg-slate-700 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 border border-slate-200 dark:border-slate-600 rounded text-slate-700 dark:text-slate-200 font-medium cursor-text transition-colors"
              title="Klik untuk input manual"
            >
              {value % 1 === 0 ? value : value.toFixed(2)}
            </button>
          )}
          {/* Increment button */}
          <button
            onPointerDown={(e) => { e.stopPropagation(); handleStep(1); }}
            className="w-6 h-6 flex items-center justify-center bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 rounded text-xs font-bold text-slate-600 dark:text-slate-300 flex-shrink-0"
            title="Tambah"
          >
            +
          </button>
          <span className="text-[10px] text-slate-400 w-6">{unit}</span>
        </div>
      </div>

      {/* Slider track */}
      <div
        ref={trackRef}
        className="relative h-6 flex items-center cursor-pointer touch-none select-none"
        onPointerDown={handlePointerDown}
        onClick={handleTrackClick}
      >
        {/* Track background */}
        <div className="absolute inset-x-0 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full" />
        {/* Filled portion */}
        <div
          className={`absolute h-1.5 ${colorClasses[color] || colorClasses.indigo} rounded-full transition-none ${isDragging ? '' : 'transition-all'}`}
          style={{ width: `${percent}%` }}
        />
        {/* Drag handle */}
        <div
          className={`absolute w-4 h-4 ${colorClasses[color] || colorClasses.indigo} rounded-full shadow-md border-2 border-white dark:border-slate-800 transform -translate-x-1/2 transition-none ${isDragging ? 'scale-125' : ''}`}
          style={{ left: `${percent}%` }}
        />
        {/* Drag hint */}
        {isDragging && (
          <div
            className="absolute -top-6 transform -translate-x-1/2 bg-slate-800 text-white text-[10px] px-1.5 py-0.5 rounded shadow-lg whitespace-nowrap z-10"
            style={{ left: `${percent}%` }}
          >
            {value % 1 === 0 ? value : value.toFixed(2)} {unit}
          </div>
        )}
      </div>
    </div>
  );
}
