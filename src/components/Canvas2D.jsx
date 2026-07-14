import React, { useRef, useEffect, useCallback } from 'react';
import { useStore, useActiveFloor } from '../lib/store';
import { getItemDef } from '../lib/itemDefinitions';
import { formatDimension, formatDimensionShort, snapToGrid } from '../lib/utils';

export default function Canvas2D() {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);

  const {
    zoom,
    panX,
    panY,
    tool,
    viewMode,
    unit,
    theme,
    plot,
    building,
    selectedId,
    selectedType,
    isDrawingWall,
    wallStart,
    isMeasuring,
    measureStart,
    setMeasuring,
    setMeasureStart,
    setMeasureResult,
    snapToGridEnabled,
    gridSize,
    layers,
    annotations,
    addAnnotation,
    showContextMenu,
    selectedIds,
    toggleMultiSelect,
    clearMultiSelect,
    setZoom,
    setPan,
    addItem,
    addWall,
    addColumn,
    selectItem,
    clearSelection,
    updateItem,
    updateColumn,
    setWallStart,
    commit,
    openRightSidebar,
  } = useStore();

  const activeFloor = useActiveFloor();

  // Dragging state
  const dragState = useRef({
    isDragging: false,
    isResizing: false,
    isRotating: false,
    isPanning: false,
    resizeHandle: null,
    dragOffset: { x: 0, y: 0 },
    panStart: { x: 0, y: 0 },
    panStartOffset: { x: 0, y: 0 },
    mouseStart: { x: 0, y: 0 },
    initialItem: null,
  });

  // ---------- Canvas resize ----------
  useEffect(() => {
    const resize = () => {
      const canvas = canvasRef.current;
      const container = containerRef.current;
      if (!canvas || !container) return;
      canvas.width = container.clientWidth;
      canvas.height = container.clientHeight;
      render();
    };
    resize();
    window.addEventListener('resize', resize);
    return () => window.removeEventListener('resize', resize);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ---------- Render whenever state changes ----------
  useEffect(() => {
    render();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeFloor, zoom, panX, panY, tool, viewMode, unit, theme, plot, building, selectedId, selectedType, isDrawingWall, wallStart]);

  // ---------- Mouse position helpers ----------
  const getMousePos = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    return {
      x: (e.clientX - rect.left - canvas.width / 2 - panX) / zoom,
      y: (e.clientY - rect.top - canvas.height / 2 - panY) / zoom,
    };
  };

  // ---------- Hit testing ----------
  const hitTestItem = (x, y) => {
    if (!activeFloor || !activeFloor.items) return null;
    for (let i = activeFloor.items.length - 1; i >= 0; i--) {
      const item = activeFloor.items[i];
      const cos = Math.cos(-item.rotation);
      const sin = Math.sin(-item.rotation);
      const dx = x - item.x;
      const dy = y - item.y;
      const localX = dx * cos - dy * sin;
      const localY = dx * sin + dy * cos;
      if (Math.abs(localX) <= item.w / 2 && Math.abs(localY) <= item.h / 2) {
        return item;
      }
    }
    return null;
  };

  const hitTestColumn = (x, y) => {
    if (!activeFloor || !activeFloor.columns) return null;
    for (let i = activeFloor.columns.length - 1; i >= 0; i--) {
      const col = activeFloor.columns[i];
      if (
        x >= col.x - col.size / 2 &&
        x <= col.x + col.size / 2 &&
        y >= col.y - col.size / 2 &&
        y <= col.y + col.size / 2
      ) {
        return col;
      }
    }
    return null;
  };

  const hitTestWall = (x, y) => {
    if (!activeFloor || !activeFloor.walls) return null;
    const threshold = 8 / zoom;
    for (let i = activeFloor.walls.length - 1; i >= 0; i--) {
      const wall = activeFloor.walls[i];
      const dx = wall.x2 - wall.x1;
      const dy = wall.y2 - wall.y1;
      const len = Math.sqrt(dx * dx + dy * dy);
      if (len === 0) continue;
      const t = Math.max(0, Math.min(1, ((x - wall.x1) * dx + (y - wall.y1) * dy) / (len * len)));
      const px = wall.x1 + t * dx;
      const py = wall.y1 + t * dy;
      const dist = Math.sqrt((x - px) ** 2 + (y - py) ** 2);
      if (dist < threshold) return wall;
    }
    return null;
  };

  const hitTestHandle = (x, y) => {
    if (selectedType !== 'item' || selectedId == null) return null;
    const item = activeFloor?.items.find((i) => i.id === selectedId);
    if (!item) return null;
    const cos = Math.cos(-item.rotation);
    const sin = Math.sin(-item.rotation);
    const dx = x - item.x;
    const dy = y - item.y;
    const localX = dx * cos - dy * sin;
    const localY = dx * sin + dy * cos;
    const handleSize = 12 / zoom;

    // Rotation handle
    const rotDist = Math.sqrt(localX ** 2 + (localY + item.h / 2 + 25) ** 2);
    if (rotDist < handleSize) return { type: 'rotate' };

    const handles = [
      { name: 'nw', x: -item.w / 2, y: -item.h / 2 },
      { name: 'n', x: 0, y: -item.h / 2 },
      { name: 'ne', x: item.w / 2, y: -item.h / 2 },
      { name: 'w', x: -item.w / 2, y: 0 },
      { name: 'e', x: item.w / 2, y: 0 },
      { name: 'sw', x: -item.w / 2, y: item.h / 2 },
      { name: 's', x: 0, y: item.h / 2 },
      { name: 'se', x: item.w / 2, y: item.h / 2 },
    ];
    for (const h of handles) {
      if (Math.abs(localX - h.x) < handleSize && Math.abs(localY - h.y) < handleSize) {
        return { type: 'resize', handle: h.name };
      }
    }
    return null;
  };

  // ---------- Mouse events ----------
  const handleMouseDown = (e) => {
    const pos = getMousePos(e);
    const ds = dragState.current;
    ds.mouseStart = pos;

    // Middle button or space-pan (we use middle button)
    if (e.button === 1) {
      ds.isPanning = true;
      ds.panStart = { x: e.clientX, y: e.clientY };
      ds.panStartOffset = { x: panX, y: panY };
      e.preventDefault();
      return;
    }

    // Measure tool
    if (isMeasuring) {
      const snapped = { x: snapToGridEnabled ? snapToGrid(pos.x, gridSize) : pos.x, y: snapToGridEnabled ? snapToGrid(pos.y, gridSize) : pos.y };
      if (!measureStart) {
        setMeasureStart(snapped);
      } else {
        const dx = snapped.x - measureStart.x;
        const dy = snapped.y - measureStart.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        setMeasureResult({ distance: dist, distanceM: dist / 100 });
        setMeasureStart(null);
      }
      return;
    }

    if (tool === 'wall') {
      const snapped = { x: snapToGridEnabled ? snapToGrid(pos.x, gridSize) : pos.x, y: snapToGridEnabled ? snapToGrid(pos.y, gridSize) : pos.y };
      if (!isDrawingWall) {
        setWallStart(snapped);
      } else {
        commit();
        addWall(wallStart.x, wallStart.y, snapped.x, snapped.y);
        setWallStart(null);
      }
      return;
    }

    if (tool === 'column') {
      commit();
      addColumn(snapToGridEnabled ? snapToGrid(pos.x, gridSize) : pos.x, snapToGridEnabled ? snapToGrid(pos.y, gridSize) : pos.y);
      return;
    }

    if (tool === 'room') {
      // Add a 4-wall room rectangle
      commit();
      const w = 300;
      const h = 250;
      const x1 = snapToGridEnabled ? snapToGrid(pos.x - w / 2, gridSize) : (pos.x - w / 2);
      const y1 = snapToGridEnabled ? snapToGrid(pos.y - h / 2, gridSize) : (pos.y - h / 2);
      const x2 = snapToGridEnabled ? snapToGrid(pos.x + w / 2, gridSize) : (pos.x + w / 2);
      const y2 = snapToGridEnabled ? snapToGrid(pos.y + h / 2, gridSize) : (pos.y + h / 2);
      addWall(x1, y1, x2, y1);
      addWall(x2, y1, x2, y2);
      addWall(x2, y2, x1, y2);
      addWall(x1, y2, x1, y1);
      return;
    }

    // Select tool
    const handle = hitTestHandle(pos.x, pos.y);
    if (handle) {
      if (handle.type === 'rotate') {
        ds.isRotating = true;
      } else {
        ds.isResizing = true;
        ds.resizeHandle = handle.handle;
      }
      const item = activeFloor.items.find((i) => i.id === selectedId);
      ds.initialItem = { ...item };
      commit();
      return;
    }

    const item = hitTestItem(pos.x, pos.y);
    if (item) {
      if (e.shiftKey) {
        toggleMultiSelect(item.id, 'item');
      } else {
        selectItem(item.id, 'item');
        clearMultiSelect();
      }
      ds.isDragging = true;
      ds.dragOffset = { x: pos.x - item.x, y: pos.y - item.y };
      commit();
      return;
    }

    const col = hitTestColumn(pos.x, pos.y);
    if (col) {
      if (e.shiftKey) {
        toggleMultiSelect(col.id, 'column');
      } else {
        selectItem(col.id, 'column');
        clearMultiSelect();
      }
      ds.isDragging = true;
      ds.dragOffset = { x: pos.x - col.x, y: pos.y - col.y };
      commit();
      return;
    }

    const wall = hitTestWall(pos.x, pos.y);
    if (wall) {
      selectItem(wall.id, 'wall');
      return;
    }

    clearSelection();
  };

  const handleMouseMove = (e) => {
    const pos = getMousePos(e);
    const ds = dragState.current;

    // Update cursor
    const canvas = canvasRef.current;
    if (canvas) {
      if (ds.isPanning) canvas.style.cursor = 'grabbing';
      else if (tool === 'wall') canvas.style.cursor = 'crosshair';
      else if (tool === 'column') canvas.style.cursor = 'cell';
      else if (tool === 'room') canvas.style.cursor = 'crosshair';
      else canvas.style.cursor = 'default';
    }

    if (ds.isPanning) {
      const dx = e.clientX - ds.panStart.x;
      const dy = e.clientY - ds.panStart.y;
      setPan(ds.panStartOffset.x + dx, ds.panStartOffset.y + dy);
      return;
    }

    if (ds.isDragging && selectedId != null) {
      const newX = snapToGridEnabled ? snapToGrid(pos.x - ds.dragOffset.x, gridSize) : (pos.x - ds.dragOffset.x);
      const newY = snapToGridEnabled ? snapToGrid(pos.y - ds.dragOffset.y, gridSize) : (pos.y - ds.dragOffset.y);
      // Move primary selected item
      if (selectedType === 'item') {
        const mainItem = activeFloor.items.find(i => i.id === selectedId);
        if (mainItem) {
          const deltaX = newX - mainItem.x;
          const deltaY = newY - mainItem.y;
          updateItem(selectedId, { x: newX, y: newY });
          // Move all multi-selected items together
          if (selectedIds.length > 0) {
            selectedIds.forEach(key => {
              if (key === `item-${selectedId}`) return;
              const [type, id] = key.split('-');
              const numId = parseInt(id);
              if (type === 'item') {
                const it = activeFloor.items.find(i => i.id === numId);
                if (it) updateItem(numId, { x: it.x + deltaX, y: it.y + deltaY });
              } else if (type === 'column') {
                const co = activeFloor.columns.find(c => c.id === numId);
                if (co) updateColumn(numId, { x: co.x + deltaX, y: co.y + deltaY });
              }
            });
          }
        }
      } else if (selectedType === 'column') {
        const mainCol = activeFloor.columns.find(c => c.id === selectedId);
        if (mainCol) {
          const deltaX = newX - mainCol.x;
          const deltaY = newY - mainCol.y;
          updateColumn(selectedId, { x: newX, y: newY });
          if (selectedIds.length > 0) {
            selectedIds.forEach(key => {
              if (key === `column-${selectedId}`) return;
              const [type, id] = key.split('-');
              const numId = parseInt(id);
              if (type === 'item') {
                const it = activeFloor.items.find(i => i.id === numId);
                if (it) updateItem(numId, { x: it.x + deltaX, y: it.y + deltaY });
              } else if (type === 'column') {
                const co = activeFloor.columns.find(c => c.id === numId);
                if (co) updateColumn(numId, { x: co.x + deltaX, y: co.y + deltaY });
              }
            });
          }
        }
      }
      return;
    }

    if (ds.isResizing && selectedId != null && selectedType === 'item') {
      const item = activeFloor.items.find((i) => i.id === selectedId);
      if (!item) return;
      const cos = Math.cos(-item.rotation);
      const sin = Math.sin(-item.rotation);
      const dx = pos.x - item.x;
      const dy = pos.y - item.y;
      const localX = dx * cos - dy * sin;
      const localY = dx * sin + dy * cos;
      const h = ds.resizeHandle;
      const updates = {};
      if (h.includes('e')) updates.w = Math.max(20, localX * 2);
      if (h.includes('w')) updates.w = Math.max(20, -localX * 2);
      if (h.includes('s')) updates.h = Math.max(20, localY * 2);
      if (h.includes('n')) updates.h = Math.max(20, -localY * 2);
      updateItem(selectedId, updates);
      return;
    }

    if (ds.isRotating && selectedId != null && selectedType === 'item') {
      const item = activeFloor.items.find((i) => i.id === selectedId);
      if (!item) return;
      const newRotation = Math.atan2(pos.x - item.x, -(pos.y - item.y));
      updateItem(selectedId, { rotation: newRotation });
      return;
    }
  };

  const handleMouseUp = (e) => {
    const ds = dragState.current;
    ds.isDragging = false;
    ds.isResizing = false;
    ds.isRotating = false;
    ds.isPanning = false;
    ds.resizeHandle = null;
    ds.initialItem = null;
  };

  // ---------- Touch handlers for mobile ----------
  const touchState = useRef({ lastTouch: null, pinchStart: null, lastTap: 0 });

  const getTouchPos = (touch) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    return {
      x: (touch.clientX - rect.left - canvas.width / 2 - panX) / zoom,
      y: (touch.clientY - rect.top - canvas.height / 2 - panY) / zoom,
      clientX: touch.clientX,
      clientY: touch.clientY,
    };
  };

  const handleTouchStart = (e) => {
    e.preventDefault();
    const ds = dragState.current;
    const ts = touchState.current;

    if (e.touches.length === 1) {
      // Single touch - simulate mouse down
      const touch = e.touches[0];
      const pos = getTouchPos(touch);
      ds.mouseStart = pos;
      ts.lastTouch = { x: touch.clientX, y: touch.clientY };

      // Detect double tap (for finishing wall OR editing item)
      const now = Date.now();
      if (now - ts.lastTap < 300) {
        // Double tap detected
        if (tool === 'wall' && isDrawingWall) {
          setWallStart(null);
          ts.lastTap = 0;
          return;
        }
        // Double tap on item/column = open properties
        const item = hitTestItem(pos.x, pos.y);
        if (item) {
          selectItem(item.id, 'item');
          clearMultiSelect();
          openRightSidebar();
          ts.lastTap = 0;
          return;
        }
        const col = hitTestColumn(pos.x, pos.y);
        if (col) {
          selectItem(col.id, 'column');
          clearMultiSelect();
          openRightSidebar();
          ts.lastTap = 0;
          return;
        }
        const wall = hitTestWall(pos.x, pos.y);
        if (wall) {
          selectItem(wall.id, 'wall');
          openRightSidebar();
          ts.lastTap = 0;
          return;
        }
      }
      ts.lastTap = now;

      // Same logic as mouse down
      if (tool === 'wall') {
        const snapped = { x: snapToGridEnabled ? snapToGrid(pos.x, gridSize) : pos.x, y: snapToGridEnabled ? snapToGrid(pos.y, gridSize) : pos.y };
        if (!isDrawingWall) {
          setWallStart(snapped);
        } else {
          commit();
          addWall(wallStart.x, wallStart.y, snapped.x, snapped.y);
          setWallStart(null);
        }
        return;
      }

      if (tool === 'column') {
        commit();
        addColumn(snapToGridEnabled ? snapToGrid(pos.x, gridSize) : pos.x, snapToGridEnabled ? snapToGrid(pos.y, gridSize) : pos.y);
        return;
      }

      if (tool === 'room') {
        commit();
        const w = 300;
        const h = 250;
        const x1 = snapToGridEnabled ? snapToGrid(pos.x - w / 2, gridSize) : (pos.x - w / 2);
        const y1 = snapToGridEnabled ? snapToGrid(pos.y - h / 2, gridSize) : (pos.y - h / 2);
        const x2 = snapToGridEnabled ? snapToGrid(pos.x + w / 2, gridSize) : (pos.x + w / 2);
        const y2 = snapToGridEnabled ? snapToGrid(pos.y + h / 2, gridSize) : (pos.y + h / 2);
        addWall(x1, y1, x2, y1);
        addWall(x2, y1, x2, y2);
        addWall(x2, y2, x1, y2);
        addWall(x1, y2, x1, y1);
        return;
      }

      // Select tool - hit testing
      const handle = hitTestHandle(pos.x, pos.y);
      if (handle) {
        if (handle.type === 'rotate') {
          ds.isRotating = true;
        } else {
          ds.isResizing = true;
          ds.resizeHandle = handle.handle;
        }
        const item = activeFloor.items.find((i) => i.id === selectedId);
        ds.initialItem = { ...item };
        commit();
        return;
      }

      const item = hitTestItem(pos.x, pos.y);
      if (item) {
        selectItem(item.id, 'item');
        ds.isDragging = true;
        ds.dragOffset = { x: pos.x - item.x, y: pos.y - item.y };
        commit();
        return;
      }

      const col = hitTestColumn(pos.x, pos.y);
      if (col) {
        selectItem(col.id, 'column');
        ds.isDragging = true;
        ds.dragOffset = { x: pos.x - col.x, y: pos.y - col.y };
        commit();
        return;
      }

      const wall = hitTestWall(pos.x, pos.y);
      if (wall) {
        selectItem(wall.id, 'wall');
        return;
      }

      // Empty tap - start panning
      ds.isPanning = true;
      ds.panStart = { x: touch.clientX, y: touch.clientY };
      ds.panStartOffset = { x: panX, y: panY };
      clearSelection();
    } else if (e.touches.length === 2) {
      // Pinch start
      ds.isPanning = false;
      ds.isDragging = false;
      ds.isResizing = false;
      ds.isRotating = false;
      const t1 = e.touches[0];
      const t2 = e.touches[1];
      const dist = Math.hypot(t1.clientX - t2.clientX, t1.clientY - t2.clientY);
      ts.pinchStart = { dist, zoom };
    }
  };

  const handleTouchMove = (e) => {
    e.preventDefault();
    const ds = dragState.current;
    const ts = touchState.current;

    if (e.touches.length === 2 && ts.pinchStart) {
      // Pinch zoom
      const t1 = e.touches[0];
      const t2 = e.touches[1];
      const dist = Math.hypot(t1.clientX - t2.clientX, t1.clientY - t2.clientY);
      const scale = dist / ts.pinchStart.dist;
      setZoom(ts.pinchStart.zoom * scale);
      return;
    }

    if (e.touches.length !== 1) return;
    const touch = e.touches[0];
    const pos = getTouchPos(touch);

    if (ds.isPanning) {
      const dx = touch.clientX - ds.panStart.x;
      const dy = touch.clientY - ds.panStart.y;
      setPan(ds.panStartOffset.x + dx, ds.panStartOffset.y + dy);
      return;
    }

    if (ds.isDragging && selectedId != null) {
      const newX = snapToGridEnabled ? snapToGrid(pos.x - ds.dragOffset.x, gridSize) : (pos.x - ds.dragOffset.x);
      const newY = snapToGridEnabled ? snapToGrid(pos.y - ds.dragOffset.y, gridSize) : (pos.y - ds.dragOffset.y);
      // Move primary selected item
      if (selectedType === 'item') {
        const mainItem = activeFloor.items.find(i => i.id === selectedId);
        if (mainItem) {
          const deltaX = newX - mainItem.x;
          const deltaY = newY - mainItem.y;
          updateItem(selectedId, { x: newX, y: newY });
          // Move all multi-selected items together
          if (selectedIds.length > 0) {
            selectedIds.forEach(key => {
              if (key === `item-${selectedId}`) return;
              const [type, id] = key.split('-');
              const numId = parseInt(id);
              if (type === 'item') {
                const it = activeFloor.items.find(i => i.id === numId);
                if (it) updateItem(numId, { x: it.x + deltaX, y: it.y + deltaY });
              } else if (type === 'column') {
                const co = activeFloor.columns.find(c => c.id === numId);
                if (co) updateColumn(numId, { x: co.x + deltaX, y: co.y + deltaY });
              }
            });
          }
        }
      } else if (selectedType === 'column') {
        const mainCol = activeFloor.columns.find(c => c.id === selectedId);
        if (mainCol) {
          const deltaX = newX - mainCol.x;
          const deltaY = newY - mainCol.y;
          updateColumn(selectedId, { x: newX, y: newY });
          if (selectedIds.length > 0) {
            selectedIds.forEach(key => {
              if (key === `column-${selectedId}`) return;
              const [type, id] = key.split('-');
              const numId = parseInt(id);
              if (type === 'item') {
                const it = activeFloor.items.find(i => i.id === numId);
                if (it) updateItem(numId, { x: it.x + deltaX, y: it.y + deltaY });
              } else if (type === 'column') {
                const co = activeFloor.columns.find(c => c.id === numId);
                if (co) updateColumn(numId, { x: co.x + deltaX, y: co.y + deltaY });
              }
            });
          }
        }
      }
      return;
    }

    if (ds.isResizing && selectedId != null && selectedType === 'item') {
      const item = activeFloor.items.find((i) => i.id === selectedId);
      if (!item) return;
      const cos = Math.cos(-item.rotation);
      const sin = Math.sin(-item.rotation);
      const dx = pos.x - item.x;
      const dy = pos.y - item.y;
      const localX = dx * cos - dy * sin;
      const localY = dx * sin + dy * cos;
      const h = ds.resizeHandle;
      const updates = {};
      if (h.includes('e')) updates.w = Math.max(20, localX * 2);
      if (h.includes('w')) updates.w = Math.max(20, -localX * 2);
      if (h.includes('s')) updates.h = Math.max(20, localY * 2);
      if (h.includes('n')) updates.h = Math.max(20, -localY * 2);
      updateItem(selectedId, updates);
      return;
    }

    if (ds.isRotating && selectedId != null && selectedType === 'item') {
      const item = activeFloor.items.find((i) => i.id === selectedId);
      if (!item) return;
      const newRotation = Math.atan2(pos.x - item.x, -(pos.y - item.y));
      updateItem(selectedId, { rotation: newRotation });
      return;
    }
  };

  const handleTouchEnd = (e) => {
    e.preventDefault();
    const ds = dragState.current;
    const ts = touchState.current;
    ds.isDragging = false;
    ds.isResizing = false;
    ds.isRotating = false;
    ds.isPanning = false;
    ds.resizeHandle = null;
    ds.initialItem = null;
    if (e.touches.length === 0) {
      ts.pinchStart = null;
    }
  };

  const handleWheel = (e) => {
    e.preventDefault();
    const delta = -e.deltaY * 0.001;
    setZoom(zoom * (1 + delta));
  };

  const handleDoubleClick = (e) => {
    if (tool === 'wall' && isDrawingWall) {
      setWallStart(null);
      return;
    }
    // Double-click on item/column/wall = select + open properties panel
    const pos = getMousePos(e);
    const item = hitTestItem(pos.x, pos.y);
    if (item) {
      selectItem(item.id, 'item');
      clearMultiSelect();
      openRightSidebar(); // open properties on mobile
      return;
    }
    const col = hitTestColumn(pos.x, pos.y);
    if (col) {
      selectItem(col.id, 'column');
      clearMultiSelect();
      openRightSidebar();
      return;
    }
    const wall = hitTestWall(pos.x, pos.y);
    if (wall) {
      selectItem(wall.id, 'wall');
      openRightSidebar();
      return;
    }
  };

  // ---------- RENDER ----------
  const render = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !activeFloor) return;
    const ctx = canvas.getContext('2d');

    // Clear
    ctx.fillStyle = theme === 'dark' ? '#0f172a' : '#f8fafc';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.save();
    ctx.translate(canvas.width / 2 + panX, canvas.height / 2 + panY);
    ctx.scale(zoom, zoom);

    drawGrid(ctx);
    drawPlotAndBuilding(ctx);
    drawFloorContent(ctx, activeFloor);
    if (selectedId != null) drawSelection(ctx);
    if (isDrawingWall && wallStart) drawWallPreview(ctx);

    // Draw measure line if measuring
    if (isMeasuring && measureStart) {
      drawMeasureLine(ctx);
    }

    // Draw annotations if layer visible
    if (layers.annotations && annotations.length > 0) {
      drawAnnotations(ctx);
    }

    ctx.restore();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeFloor, zoom, panX, panY, viewMode, theme, plot, building, selectedId, selectedType, isDrawingWall, wallStart, isMeasuring, measureStart, layers, annotations]);

  // ---------- Drawing functions ----------
  function drawGrid(ctx) {
    const range = 4000;
    const gridSize = 50;
    const isStructural = viewMode === 'structural';
    const dark = theme === 'dark';

    // Minor grid lines - very subtle
    ctx.strokeStyle = dark ? '#1a2744' : (isStructural ? '#eef2f7' : '#eef2f7');
    ctx.lineWidth = 0.4 / zoom;
    for (let x = -range; x <= range; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, -range);
      ctx.lineTo(x, range);
      ctx.stroke();
    }
    for (let y = -range; y <= range; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(-range, y);
      ctx.lineTo(range, y);
      ctx.stroke();
    }

    // Major grid lines (every 250cm = 2.5m) - slightly more visible
    ctx.strokeStyle = dark ? '#2d3a5c' : '#dbe4f0';
    ctx.lineWidth = 0.7 / zoom;
    for (let x = -range; x <= range; x += 250) {
      ctx.beginPath();
      ctx.moveTo(x, -range);
      ctx.lineTo(x, range);
      ctx.stroke();
    }
    for (let y = -range; y <= range; y += 250) {
      ctx.beginPath();
      ctx.moveTo(-range, y);
      ctx.lineTo(range, y);
      ctx.stroke();
    }

    // Axes
    ctx.strokeStyle = dark ? '#475569' : '#94a3b8';
    ctx.lineWidth = 1.2 / zoom;
    ctx.beginPath();
    ctx.moveTo(-range, 0);
    ctx.lineTo(range, 0);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(0, -range);
    ctx.lineTo(0, range);
    ctx.stroke();
  }

  function drawPlotAndBuilding(ctx) {
    const isStructural = viewMode === 'structural';

    // Plot (tanah)
    ctx.fillStyle = isStructural ? 'rgba(134, 239, 172, 0.15)' : 'rgba(134, 239, 172, 0.3)';
    ctx.fillRect(-plot.width / 2, -plot.depth / 2, plot.width, plot.depth);
    ctx.strokeStyle = '#166534';
    ctx.lineWidth = 3 / zoom;
    ctx.setLineDash([10 / zoom, 5 / zoom]);
    ctx.strokeRect(-plot.width / 2, -plot.depth / 2, plot.width, plot.depth);
    ctx.setLineDash([]);

    // Plot dimensions
    drawDimensionLine(
      ctx,
      plot.width / 2 + 30,
      -plot.depth / 2,
      plot.width / 2 + 30,
      plot.depth / 2,
      formatDimension(plot.depth, unit)
    );
    drawDimensionLine(
      ctx,
      -plot.width / 2,
      plot.depth / 2 + 30,
      plot.width / 2,
      plot.depth / 2 + 30,
      formatDimension(plot.width, unit)
    );

    // Building
    const bldgX = -plot.width / 2 + building.offsetX;
    const bldgY = -plot.depth / 2 + building.offsetY;

    ctx.fillStyle = isStructural ? 'rgba(254, 243, 199, 0.4)' : 'rgba(212, 165, 116, 0.6)';
    ctx.fillRect(bldgX, bldgY, building.width, building.depth);
    ctx.strokeStyle = '#1e40af';
    ctx.lineWidth = 2 / zoom;
    ctx.strokeRect(bldgX, bldgY, building.width, building.depth);

    // Building dimensions
    drawDimensionLine(
      ctx,
      bldgX,
      bldgY - 20,
      bldgX + building.width,
      bldgY - 20,
      formatDimension(building.width, unit)
    );
    drawDimensionLine(
      ctx,
      bldgX - 20,
      bldgY,
      bldgX - 20,
      bldgY + building.depth,
      formatDimension(building.depth, unit)
    );

    // Offset guides
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 1 / zoom;
    ctx.setLineDash([3 / zoom, 3 / zoom]);
    ctx.beginPath();
    ctx.moveTo(-plot.width / 2, bldgY);
    ctx.lineTo(bldgX, bldgY);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(bldgX, -plot.depth / 2);
    ctx.lineTo(bldgX, bldgY);
    ctx.stroke();
    ctx.setLineDash([]);

    // Offset labels
    if (building.offsetX > 0) {
      ctx.fillStyle = '#64748b';
      ctx.font = `bold ${10 / zoom}px Inter, sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(
        formatDimension(building.offsetX, unit),
        -plot.width / 2 + building.offsetX / 2,
        bldgY - 12
      );
    }
    if (building.offsetY > 0) {
      ctx.fillStyle = '#64748b';
      ctx.font = `bold ${10 / zoom}px Inter, sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.save();
      ctx.translate(bldgX - 12, -plot.depth / 2 + building.offsetY / 2);
      ctx.rotate(-Math.PI / 2);
      ctx.fillText(formatDimension(building.offsetY, unit), 0, 0);
      ctx.restore();
    }
  }

  function drawDimensionLine(ctx, x1, y1, x2, y2, label) {
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 1 / zoom;
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();

    const arrowSize = 6 / zoom;
    const angle = Math.atan2(y2 - y1, x2 - x1);
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x1 + arrowSize * Math.cos(angle - 0.4), y1 + arrowSize * Math.sin(angle - 0.4));
    ctx.lineTo(x1 + arrowSize * Math.cos(angle + 0.4), y1 + arrowSize * Math.sin(angle + 0.4));
    ctx.closePath();
    ctx.fillStyle = '#475569';
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(x2, y2);
    ctx.lineTo(x2 - arrowSize * Math.cos(angle - 0.4), y2 - arrowSize * Math.sin(angle - 0.4));
    ctx.lineTo(x2 - arrowSize * Math.cos(angle + 0.4), y2 - arrowSize * Math.sin(angle + 0.4));
    ctx.closePath();
    ctx.fill();

    const mx = (x1 + x2) / 2;
    const my = (y1 + y2) / 2;
    ctx.fillStyle = '#1e293b';
    ctx.font = `bold ${11 / zoom}px Inter, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'bottom';

    const isHorizontal = Math.abs(x2 - x1) > Math.abs(y2 - y1);
    if (!isHorizontal) {
      ctx.save();
      ctx.translate(mx, my);
      ctx.rotate(Math.PI / 2);
      ctx.fillText(label, 0, -4 / zoom);
      ctx.restore();
    } else {
      ctx.fillText(label, mx, my - 4 / zoom);
    }
  }

  function drawFloorContent(ctx, floor) {
    const isStructural = viewMode === 'structural';

    // Draw walls first
    floor.walls.forEach((wall) => {
      const isSelected = selectedId === wall.id && selectedType === 'wall';
      if (isStructural) {
        ctx.strokeStyle = isSelected ? '#6366f1' : '#1a202c';
        ctx.lineWidth = 10 / zoom;
        ctx.beginPath();
        ctx.moveTo(wall.x1, wall.y1);
        ctx.lineTo(wall.x2, wall.y2);
        ctx.stroke();
        // Hatch pattern
        ctx.lineWidth = 0.5 / zoom;
        const dx = wall.x2 - wall.x1;
        const dy = wall.y2 - wall.y1;
        const len = Math.sqrt(dx * dx + dy * dy);
        if (len > 0) {
          const nx = (-dy / len) * 4;
          const ny = (dx / len) * 4;
          for (let t = 0; t < 1; t += 0.05) {
            const px = wall.x1 + dx * t;
            const py = wall.y1 + dy * t;
            ctx.beginPath();
            ctx.moveTo(px - nx, py - ny);
            ctx.lineTo(px + nx, py + ny);
            ctx.stroke();
          }
        }
      } else {
        ctx.strokeStyle = isSelected ? '#6366f1' : '#1a202c';
        ctx.lineWidth = 10 / zoom;
        ctx.beginPath();
        ctx.moveTo(wall.x1, wall.y1);
        ctx.lineTo(wall.x2, wall.y2);
        ctx.stroke();
        // Wall outline
        ctx.strokeStyle = isSelected ? '#4338ca' : '#2d3748';
        ctx.lineWidth = 1 / zoom;
        ctx.stroke();
      }
    });

    // Draw items
    floor.items.forEach((item) => {
      const def = getItemDef(item.type);
      const isStructuralItem = def?.structural;
      const isStairsItem = item.type === 'stairs' || (item.type && item.type.startsWith('stairs'));
      const isFenceItem = item.type && item.type.startsWith('fence-');
      const isGateItem = item.type && item.type.startsWith('gate-');
      const isTreeItem = item.type === 'tree' || item.type === 'tree-palm' || item.type === 'tree-small';
      const isPoolItem = item.type === 'swimming-pool' || item.type === 'pond';
      const isGrassItem = item.type === 'grass' || item.type === 'patio' || item.type === 'deck' || item.type === 'pathway' || item.type === 'driveway' || item.type === 'pool-deck';
      const isSteelRailing = item.type && (
        item.type.startsWith('fence-stainless') ||
        item.type === 'fence-steel-pipe' ||
        item.type === 'fence-aluminum-slat' ||
        item.type === 'fence-glass-frameless' ||
        item.type === 'fence-wire-rope' ||
        item.type === 'fence-wood-slat-vertical'
      );
      const isLighting = item.type && item.type.startsWith('light-');
      const isCeiling = item.type && item.type.startsWith('ceiling-') && item.type !== 'ceiling-fan';
      const isTrim = item.type && (item.type.startsWith('lisplang-') || item.type.startsWith('tali-air-') || item.type.startsWith('list-'));
      const isVentilation = item.type && item.type.startsWith('vent-');
      const isFlooring = item.type && item.type.startsWith('floor-') && item.type !== 'floor-drain' && item.type !== 'floor-lamp';
      const isSpecialColumn = item.type && (item.type.startsWith('column-wood') || item.type.startsWith('column-steel') || item.type.startsWith('column-marble') || item.type.startsWith('column-classic') || item.type.startsWith('column-modern') || item.type.startsWith('column-hexagon') || item.type.startsWith('column-octagon') || item.type.startsWith('column-fence') || item.type.startsWith('column-lamp') || item.type.startsWith('column-canopy') || item.type.startsWith('column-decorative') || item.type === 'column-rect' || item.type === 'column-round' || item.type === 'beam' || item.type === 'foundation' || item.type === 'retaining-wall');
      const isSanitary = item.type && (item.type.startsWith('closet-') || item.type.startsWith('bathtub-') || item.type.startsWith('shower-') || item.type.startsWith('sink-') || item.type === 'bidet' || item.type === 'urinoir' || item.type === 'floor-drain' || item.type === 'water-tap' || item.type.startsWith('water-heater') || item.type.startsWith('toren') || item.type === 'septic-tank' || item.type === 'sumur-air' || item.type === 'pump-water' || item.type === 'toilet' || item.type === 'toilet-squat' || item.type === 'bathtub' || item.type === 'shower' || item.type === 'bathroom-sink' || item.type === 'double-vanity' || item.type === 'mirror' || item.type === 'mirror-large');
      const isElectrical = item.type && (item.type.startsWith('outlet-') || item.type.startsWith('switch-') || item.type.startsWith('mcb-') || item.type === 'doorbell' || item.type.startsWith('cctv') || item.type === 'intercom' || item.type === 'motion-sensor' || item.type === 'smoke-detector' || item.type === 'antenna-tv' || item.type === 'smart-hub' || item.type === 'ev-charger');
      const isAppliance = item.type && (item.type.startsWith('ac-') || item.type.startsWith('fan-') || item.type.startsWith('tv-') || item.type === 'home-theater' || item.type === 'speaker-stand' || item.type.startsWith('washing-') || item.type === 'dryer' || item.type.startsWith('fridge-') || item.type === 'microwave' || item.type === 'dishwasher' || item.type === 'wine-cooler' || item.type === 'dispenser' || item.type === 'water-purifier' || item.type === 'vacuum' || item.type === 'ceiling-fan');
      const isDecor = item.type && (item.type.startsWith('painting-') || item.type.startsWith('photo-') || item.type.startsWith('vase-') || item.type.startsWith('mirror-') || item.type.startsWith('curtain-') || item.type.startsWith('blind-') || item.type.startsWith('rug-') || item.type.startsWith('plant-') || item.type === 'sculpture' || item.type === 'wall-clock' || item.type === 'candle-set' || item.type === 'book-stack');
      const isWallFinish = item.type && (item.type.startsWith('wall-') || item.type.startsWith('wallpaper-'));
      const isKitchenItem = item.type && (
        item.type.startsWith('counter-') ||
        item.type.startsWith('kitchen-') ||
        item.type.startsWith('cabinet-') ||
        item.type.startsWith('stove-') ||
        item.type.startsWith('range-hood') ||
        item.type.startsWith('fridge-') ||
        item.type.startsWith('sink-') ||
        item.type.startsWith('pantry-') ||
        item.type.startsWith('dining-table') ||
        item.type.startsWith('bar-stool') ||
        item.type.startsWith('chair-') ||
        item.type === 'pantry' || item.type === 'stove' || item.type === 'fridge' || item.type === 'sink' ||
        item.type === 'range-hood' || item.type === 'built-in-oven' || item.type === 'dishwasher' ||
        item.type === 'chair' || item.type === 'bar-stool' || item.type === 'dining-table' ||
        item.type === 'pot-rack' || item.type === 'spice-rack' || item.type === 'shelf-floating' ||
        item.type === 'wine-cooler-built-in' || item.type === 'steam-oven' || item.type === 'microwave-built-in' ||
        item.type === 'coffee-machine-built-in' || item.type === 'warming-drawer' ||
        item.type === 'trash-pullout' || item.type === 'recycling-bin' ||
        item.type === 'breakfast-nook' || item.type === 'bar-counter' || item.type === 'bistro-table' ||
        item.type === 'bench-dining' || item.type === 'butcher-block-table' || item.type === 'prep-table' ||
        item.type === 'baking-table' || item.type === 'water-faucet-pullout' || item.type === 'water-faucet-gooseneck'
      );
      const isBedroomItem = item.type && (item.type === 'bed' || item.type === 'bed-king' || item.type === 'single-bed' || item.type === 'bunk-bed' || item.type === 'wardrobe' || item.type === 'walk-in-closet' || item.type === 'nightstand' || item.type === 'dresser' || item.type === 'desk' || item.type === 'vanity-table' || item.type === 'chaise-longue');
      const isDoorItem = item.type && (item.type === 'door' || item.type.startsWith('door-') || item.type === 'sliding-door' || item.type === 'folding-door' || item.type === 'french-door' || item.type === 'window' || item.type.startsWith('window-') || item.type === 'skylight' || item.type === 'louver-window');
      const isOutdoorExtra = item.type && (item.type === 'carport' || item.type === 'carport-2' || item.type === 'garage-door' || item.type === 'bush' || item.type === 'flower-bed' || item.type === 'gazebo' || item.type === 'pergola' || item.type === 'lamp-post' || item.type === 'garden-bench' || item.type === 'fountain' || item.type === 'mailbox');
      const isMEPItem = item.type && (item.type.startsWith('pipe-') || item.type.startsWith('cable-') || item.type.startsWith('conduit-') || item.type === 'grounding-rod-5-8' || item.type === 'busbar-copper-100a' || item.type === 'cabel-fiber-optic');
      const isWeatherItem = item.type && (item.type.startsWith('hood-') || item.type.startsWith('canopy-') || item.type.startsWith('drip-course') || item.type.startsWith('weather-shed') || item.type.startsWith('coping-'));
      const isSelected = selectedId === item.id && selectedType === 'item';

      ctx.save();
      ctx.translate(item.x, item.y);
      ctx.rotate(item.rotation);

      const w = item.w;
      const h = item.h;

      if (isStructural && !isStructuralItem) {
        ctx.globalAlpha = 0.15;
      }

      if (isStairsItem) {
        drawStairs2D(ctx, item, w, h, isStructural);
      } else if (isSteelRailing) {
        drawSteelRailing2D(ctx, item, w, h);
      } else if (isLighting) {
        drawLighting2D(ctx, item, w, h);
      } else if (isCeiling) {
        drawCeiling2D(ctx, item, w, h);
      } else if (isTrim) {
        drawTrim2D(ctx, item, w, h);
      } else if (isVentilation) {
        drawVentilation2D(ctx, item, w, h);
      } else if (isFlooring) {
        drawFlooring2D(ctx, item, w, h);
      } else if (isSpecialColumn) {
        drawColumn2D(ctx, item, w, h, isStructural);
      } else if (isSanitary) {
        drawSanitary2D(ctx, item, w, h);
      } else if (isElectrical) {
        drawElectrical2D(ctx, item, w, h);
      } else if (isKitchenItem) {
        drawKitchen2D(ctx, item, w, h);
      } else if (isBedroomItem) {
        drawBedroom2D(ctx, item, w, h);
      } else if (isDoorItem) {
        drawDoor2D(ctx, item, w, h);
      } else if (isOutdoorExtra) {
        drawOutdoorExtra2D(ctx, item, w, h);
      } else if (isMEPItem) {
        drawMEP2D(ctx, item, w, h);
      } else if (isWeatherItem) {
        drawWeather2D(ctx, item, w, h);
      } else if (isAppliance) {
        drawAppliance2D(ctx, item, w, h);
      } else if (isDecor) {
        drawDecor2D(ctx, item, w, h);
      } else if (isWallFinish) {
        drawWallFinish2D(ctx, item, w, h);
      } else if (isFenceItem) {
        drawFence2D(ctx, item, w, h);
      } else if (isGateItem) {
        drawGate2D(ctx, item, w, h);
      } else if (isTreeItem) {
        drawTree2D(ctx, item, w, h);
      } else if (isPoolItem) {
        drawPool2D(ctx, item, w, h);
      } else if (isGrassItem) {
        drawGrassArea2D(ctx, item, w, h);
      } else {
        if (!isStructural) {
          ctx.fillStyle = 'rgba(0,0,0,0.08)';
          ctx.fillRect(-w / 2 + 3, -h / 2 + 3, w, h);
        }
        ctx.fillStyle = (item.color || def?.color || '#8B7355').trim();
        ctx.fillRect(-w / 2, -h / 2, w, h);
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 1 / zoom;
        ctx.strokeRect(-w / 2, -h / 2, w, h);

        if (isStructuralItem) {
          // Cross-hatch pattern
          ctx.strokeStyle = 'rgba(255,255,255,0.5)';
          ctx.lineWidth = 1 / zoom;
          ctx.setLineDash([3 / zoom, 3 / zoom]);
          for (let i = -w / 2; i < w / 2; i += 8) {
            ctx.beginPath();
            ctx.moveTo(i, -h / 2);
            ctx.lineTo(i, h / 2);
            ctx.stroke();
          }
          ctx.setLineDash([]);
        }

        // Icon
        if (def && !isStructural) {
          ctx.fillStyle = '#000';
          ctx.font = `${Math.min(w, h) * 0.4}px Inter, sans-serif`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(def.icon, 0, 0);
        }
      }

      ctx.restore();
    });

    // Draw columns
    floor.columns.forEach((col) => {
      const isSelected = selectedId === col.id && selectedType === 'column';
      ctx.save();
      ctx.translate(col.x, col.y);
      ctx.fillStyle = isSelected ? '#6366f1' : '#dc2626';
      ctx.strokeStyle = isSelected ? '#4338ca' : '#991b1b';
      ctx.lineWidth = 2 / zoom;
      ctx.fillRect(-col.size / 2, -col.size / 2, col.size, col.size);
      ctx.strokeRect(-col.size / 2, -col.size / 2, col.size, col.size);
      ctx.strokeStyle = 'white';
      ctx.lineWidth = 2 / zoom;
      ctx.beginPath();
      ctx.moveTo(-col.size / 2, -col.size / 2);
      ctx.lineTo(col.size / 2, col.size / 2);
      ctx.moveTo(col.size / 2, -col.size / 2);
      ctx.lineTo(-col.size / 2, col.size / 2);
      ctx.stroke();
      ctx.restore();
    });
  }

  function drawStairs2D(ctx, item, w, h, isStructural) {
    const type = item.type || 'stairs';
    // Determine steps based on stair type
    let numSteps = 10;
    let layout = 'straight'; // 'straight', 'l', 'u', 'spiral', 'curved'
    let mainColor = item.color || '#78716c';
    let lineColor = '#44403c';

    switch (type) {
      case 'stairs-spiral':
        layout = 'spiral';
        numSteps = 14;
        mainColor = '#5B3A1A';
        break;
      case 'stairs-u':
        layout = 'u';
        numSteps = 16;
        mainColor = '#78716c';
        break;
      case 'stairs-curved':
        layout = 'curved';
        numSteps = 12;
        mainColor = '#8B6F47';
        break;
      case 'stairs-cantilever':
        layout = 'straight';
        numSteps = 12;
        mainColor = '#374151';
        lineColor = '#9CA3AF';
        break;
      case 'stairs-steel':
        layout = 'straight';
        numSteps = 12;
        mainColor = '#64748B';
        lineColor = '#1E293B';
        break;
      case 'stairs-mini':
        layout = 'straight';
        numSteps = 14;
        mainColor = '#8B6F47';
        break;
      case 'stairs-floating':
        layout = 'straight';
        numSteps = 12;
        mainColor = '#1F2937';
        lineColor = '#9CA3AF';
        break;
      case 'stairs-straight':
      case 'stairs':
      default:
        layout = 'straight';
        numSteps = type === 'stairs' ? 10 : 12; // L-shape default
        if (type === 'stairs') layout = 'l';
        break;
    }

    if (isStructural) mainColor = '#f59e0b';

    if (layout === 'spiral') {
      // Spiral: circle with radial divisions
      const radius = Math.min(w, h) / 2;
      ctx.fillStyle = mainColor;
      ctx.beginPath();
      ctx.arc(0, 0, radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = lineColor;
      ctx.lineWidth = 1 / zoom;
      for (let i = 0; i < numSteps; i++) {
        const angle = (i / numSteps) * Math.PI * 2;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(Math.cos(angle) * radius, Math.sin(angle) * radius);
        ctx.stroke();
      }
      ctx.beginPath();
      ctx.arc(0, 0, radius, 0, Math.PI * 2);
      ctx.stroke();
      // Center dot
      ctx.fillStyle = '#1F2937';
      ctx.beginPath();
      ctx.arc(0, 0, 3, 0, Math.PI * 2);
      ctx.fill();
      // Label
      ctx.fillStyle = '#fff';
      ctx.font = `bold ${Math.min(w, h) * 0.18}px Inter`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('↻', 0, -radius * 0.5);
    } else if (layout === 'u') {
      // U-shape: 2 columns of steps
      ctx.fillStyle = mainColor;
      ctx.fillRect(-w / 2, -h / 2, w, h);
      ctx.strokeStyle = lineColor;
      ctx.lineWidth = 1 / zoom;
      // Left flight (going up)
      const halfW = w / 2;
      const stepH = h / numSteps * 2;
      for (let i = 0; i <= numSteps / 2; i++) {
        const y = -h / 2 + stepH * i;
        ctx.beginPath();
        ctx.moveTo(-w / 2, y);
        ctx.lineTo(0, y);
        ctx.stroke();
      }
      // Right flight (going up back)
      for (let i = 0; i <= numSteps / 2; i++) {
        const y = h / 2 - stepH * i;
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(w / 2, y);
        ctx.stroke();
      }
      // Center divider
      ctx.beginPath();
      ctx.moveTo(0, -h / 2);
      ctx.lineTo(0, h / 2);
      ctx.stroke();
      // Arrows
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 2 / zoom;
      ctx.beginPath();
      ctx.moveTo(-halfW / 2, h / 2 - 5);
      ctx.lineTo(-halfW / 2, -h / 2 + 5);
      ctx.lineTo(-halfW / 2 - 4, -h / 2 + 10);
      ctx.moveTo(-halfW / 2, -h / 2 + 5);
      ctx.lineTo(-halfW / 2 + 4, -h / 2 + 10);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(halfW / 2, -h / 2 + 5);
      ctx.lineTo(halfW / 2, h / 2 - 5);
      ctx.stroke();
      // Label
      ctx.fillStyle = '#fff';
      ctx.font = `bold ${Math.min(w, h) * 0.12}px Inter`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('U', 0, 0);
    } else if (layout === 'l') {
      // L-shape: bottom half horizontal, top half vertical
      ctx.fillStyle = mainColor;
      ctx.fillRect(-w / 2, -h / 2, w, h);
      ctx.strokeStyle = lineColor;
      ctx.lineWidth = 1 / zoom;
      // Bottom flight horizontal lines
      const halfSteps = Math.floor(numSteps / 2);
      const stepBottom = (w / 2) / halfSteps;
      for (let i = 0; i <= halfSteps; i++) {
        const x = -w / 2 + stepBottom * i;
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, h / 2);
        ctx.stroke();
      }
      // Top flight vertical lines
      const stepTop = (h / 2) / halfSteps;
      for (let i = 0; i <= halfSteps; i++) {
        const y = -h / 2 + stepTop * i;
        ctx.beginPath();
        ctx.moveTo(-w / 2, y);
        ctx.lineTo(0, y);
        ctx.stroke();
      }
      // L corner label
      ctx.fillStyle = '#fff';
      ctx.font = `bold ${Math.min(w, h) * 0.15}px Inter`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('L', 0, 0);
    } else if (layout === 'curved') {
      // Curved: arc-based steps
      ctx.fillStyle = mainColor;
      ctx.fillRect(-w / 2, -h / 2, w, h);
      ctx.strokeStyle = lineColor;
      ctx.lineWidth = 1 / zoom;
      // Curved step lines
      for (let i = 0; i <= numSteps; i++) {
        const t = i / numSteps;
        const y = -h / 2 + (h * t);
        const curveOffset = Math.sin(t * Math.PI) * w * 0.15;
        ctx.beginPath();
        ctx.moveTo(-w / 2, y);
        ctx.bezierCurveTo(-w / 4, y - curveOffset, w / 4, y + curveOffset, w / 2, y);
        ctx.stroke();
      }
      // Arrow
      ctx.strokeStyle = '#fff';
      ctx.fillStyle = '#fff';
      ctx.lineWidth = 2 / zoom;
      ctx.beginPath();
      ctx.moveTo(0, h / 2 - 8);
      ctx.lineTo(0, -h / 2 + 8);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(0, -h / 2 + 8);
      ctx.lineTo(-5, -h / 2 + 13);
      ctx.lineTo(5, -h / 2 + 13);
      ctx.closePath();
      ctx.fill();
    } else {
      // Straight layout
      ctx.fillStyle = mainColor;
      ctx.fillRect(-w / 2, -h / 2, w, h);
      ctx.strokeStyle = lineColor;
      ctx.lineWidth = 1 / zoom;
      const stepH = h / numSteps;
      for (let i = 0; i <= numSteps; i++) {
        const y = -h / 2 + stepH * i;
        ctx.beginPath();
        ctx.moveTo(-w / 2, y);
        ctx.lineTo(w / 2, y);
        ctx.stroke();
      }

      // For cantilever/floating: show as dashed lines (no stringer)
      if (type === 'stairs-cantilever' || type === 'stairs-floating') {
        ctx.setLineDash([3 / zoom, 3 / zoom]);
        ctx.strokeStyle = '#9CA3AF';
        ctx.lineWidth = 1 / zoom;
        ctx.beginPath();
        ctx.moveTo(-w / 2, h / 2);
        ctx.lineTo(w / 2, -h / 2);
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.strokeStyle = lineColor;
      }
      // For steel: add diagonal cross-bracing
      if (type === 'stairs-steel') {
        ctx.strokeStyle = '#1E293B';
        ctx.lineWidth = 1.5 / zoom;
        ctx.beginPath();
        ctx.moveTo(-w / 2, h / 2);
        ctx.lineTo(w / 2, -h / 2);
        ctx.moveTo(-w / 2, -h / 2);
        ctx.lineTo(w / 2, h / 2);
        ctx.stroke();
        ctx.strokeStyle = lineColor;
      }
      // Arrow up
      ctx.strokeStyle = '#fff';
      ctx.fillStyle = '#fff';
      ctx.lineWidth = 2 / zoom;
      ctx.beginPath();
      ctx.moveTo(0, h / 2 - 8);
      ctx.lineTo(0, -h / 2 + 8);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(0, -h / 2 + 8);
      ctx.lineTo(-6, -h / 2 + 14);
      ctx.lineTo(6, -h / 2 + 14);
      ctx.closePath();
      ctx.fill();
    }
  }

  function drawSteelRailing2D(ctx, item, w, h) {
    const type = item.type || 'fence-stainless-vertical';
    const baseColor = item.color || '#C0C0C0';
    const lineColor = type === 'fence-steel-pipe' ? '#1F2937'
      : type === 'fence-aluminum-slat' ? '#374151'
      : type === 'fence-wood-slat-vertical' ? '#5D3A1A'
      : '#94A3B8';

    // Background (transparent for glass)
    if (type === 'fence-glass-frameless' || type === 'fence-stainless-glass') {
      ctx.fillStyle = 'rgba(190, 227, 248, 0.5)';
    } else {
      ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
    }
    ctx.fillRect(-w / 2, -h / 2, w, h);

    ctx.strokeStyle = lineColor;
    ctx.lineWidth = 1.5 / zoom;

    // Top & bottom rails (handrail + base)
    ctx.beginPath();
    ctx.moveTo(-w / 2, -h / 2);
    ctx.lineTo(w / 2, -h / 2);
    ctx.moveTo(-w / 2, h / 2);
    ctx.lineTo(w / 2, h / 2);
    ctx.stroke();

    if (type === 'fence-stainless-vertical' || type === 'fence-steel-pipe' || type === 'fence-aluminum-slat' || type === 'fence-wood-slat-vertical') {
      // Vertical balusters
      const spacing = 12;
      const numPosts = Math.floor(w / spacing);
      const actualSpacing = w / numPosts;
      ctx.lineWidth = (type === 'fence-steel-pipe' ? 2.5 : 1.5) / zoom;
      for (let i = 0; i <= numPosts; i++) {
        const x = -w / 2 + actualSpacing * i;
        ctx.beginPath();
        ctx.moveTo(x, -h / 2);
        ctx.lineTo(x, h / 2);
        ctx.stroke();
      }
    } else if (type === 'fence-stainless-horizontal' || type === 'fence-wire-rope') {
      // Horizontal cables/lines
      const numLines = type === 'fence-stainless-horizontal' ? 5 : 7;
      ctx.lineWidth = 1 / zoom;
      for (let i = 1; i < numLines; i++) {
        const y = -h / 2 + (h * i / numLines);
        ctx.beginPath();
        ctx.moveTo(-w / 2, y);
        ctx.lineTo(w / 2, y);
        ctx.stroke();
      }
      // Vertical posts at ends + every 100cm
      ctx.lineWidth = 2 / zoom;
      const postSpacing = 100;
      const numPosts = Math.ceil(w / postSpacing) + 1;
      for (let i = 0; i < numPosts; i++) {
        const x = -w / 2 + (w / (numPosts - 1)) * i;
        ctx.beginPath();
        ctx.moveTo(x, -h / 2);
        ctx.lineTo(x, h / 2);
        ctx.stroke();
      }
    } else if (type === 'fence-stainless-tube') {
      // Horizontal tubes (thicker)
      const numTubes = 3;
      ctx.lineWidth = 4 / zoom;
      for (let i = 1; i <= numTubes; i++) {
        const y = -h / 2 + (h * (i + 1) / (numTubes + 2));
        ctx.beginPath();
        ctx.moveTo(-w / 2, y);
        ctx.lineTo(w / 2, y);
        ctx.stroke();
      }
      // End posts
      ctx.lineWidth = 3 / zoom;
      ctx.beginPath();
      ctx.moveTo(-w / 2, -h / 2);
      ctx.lineTo(-w / 2, h / 2);
      ctx.moveTo(w / 2, -h / 2);
      ctx.lineTo(w / 2, h / 2);
      ctx.stroke();
    } else if (type === 'fence-stainless-glass' || type === 'fence-glass-frameless') {
      // Glass panels with stainless posts
      const panelWidth = 60;
      const numPanels = Math.ceil(w / panelWidth);
      const actualPanelW = w / numPanels;
      ctx.fillStyle = 'rgba(190, 227, 248, 0.3)';
      for (let i = 0; i < numPanels; i++) {
        const x = -w / 2 + actualPanelW * i;
        ctx.fillRect(x + 1, -h / 2 + 2, actualPanelW - 2, h - 4);
      }
      // Glass panel borders
      ctx.strokeStyle = '#94A3B8';
      ctx.lineWidth = 1 / zoom;
      for (let i = 0; i <= numPanels; i++) {
        const x = -w / 2 + actualPanelW * i;
        ctx.beginPath();
        ctx.moveTo(x, -h / 2);
        ctx.lineTo(x, h / 2);
        ctx.stroke();
      }
      // Stainless posts (top handrail)
      ctx.strokeStyle = '#9CA3AF';
      ctx.lineWidth = 3 / zoom;
      ctx.beginPath();
      ctx.moveTo(-w / 2, -h / 2);
      ctx.lineTo(w / 2, -h / 2);
      ctx.stroke();
    } else if (type === 'fence-stainless-perforated') {
      // Perforated plate - dots
      ctx.fillStyle = lineColor;
      const dotSpacing = 8;
      const dotRadius = 2 / zoom;
      for (let x = -w / 2 + dotSpacing; x < w / 2; x += dotSpacing) {
        for (let y = -h / 2 + dotSpacing; y < h / 2; y += dotSpacing) {
          ctx.beginPath();
          ctx.arc(x, y, dotRadius, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    } else if (type === 'fence-stainless-mesh') {
      // Wire mesh - grid pattern
      ctx.strokeStyle = '#A8A8A8';
      ctx.lineWidth = 0.5 / zoom;
      const meshSize = 6;
      for (let x = -w / 2; x <= w / 2; x += meshSize) {
        ctx.beginPath();
        ctx.moveTo(x, -h / 2);
        ctx.lineTo(x, h / 2);
        ctx.stroke();
      }
      for (let y = -h / 2; y <= h / 2; y += meshSize) {
        ctx.beginPath();
        ctx.moveTo(-w / 2, y);
        ctx.lineTo(w / 2, y);
        ctx.stroke();
      }
    }

    // Label
    ctx.fillStyle = '#fff';
    ctx.font = `${Math.min(w, h) * 0.25}px Inter`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('⬛', 0, 0);
  }

  function drawLighting2D(ctx, item, w, h) {
    const type = item.type;
    const color = item.color || '#FFEB99';
    // Background shadow
    ctx.fillStyle = 'rgba(255, 235, 153, 0.2)';
    ctx.beginPath();
    ctx.arc(0, 0, Math.max(w, h) / 2 + 8, 0, Math.PI * 2);
    ctx.fill();
    // Light body
    ctx.fillStyle = color;
    ctx.strokeStyle = '#1F2937';
    ctx.lineWidth = 1 / zoom;
    if (type === 'light-pendant' || type === 'light-chandelier') {
      // Pendant/chandelier: cone shape (ceiling mount + body)
      ctx.beginPath();
      ctx.moveTo(-w / 4, -h / 2);
      ctx.lineTo(w / 4, -h / 2);
      ctx.lineTo(w / 2, h / 2);
      ctx.lineTo(-w / 2, h / 2);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    } else if (type === 'light-led-strip' || type === 'light-track') {
      // Long thin strip
      ctx.fillRect(-w / 2, -h / 4, w, h / 2);
      ctx.strokeRect(-w / 2, -h / 4, w, h / 2);
      // Light dots
      ctx.fillStyle = '#FFFFFF';
      const numDots = Math.floor(w / 20);
      for (let i = 0; i < numDots; i++) {
        const x = -w / 2 + (w / numDots) * (i + 0.5);
        ctx.beginPath();
        ctx.arc(x, 0, 2, 0, Math.PI * 2);
        ctx.fill();
      }
    } else if (type === 'light-spotlight' || type === 'light-downlight' || type === 'light-pool' || type === 'light-flood') {
      // Circular spotlight
      ctx.beginPath();
      ctx.arc(0, 0, Math.min(w, h) / 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      // Inner bright spot
      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.arc(0, 0, Math.min(w, h) / 4, 0, Math.PI * 2);
      ctx.fill();
    } else if (type === 'light-floor' || type === 'light-garden' || type === 'light-lamp-post' || type === 'light-industrial') {
      // Vertical lamp post
      ctx.fillRect(-w / 8, -h / 2, w / 4, h);
      ctx.strokeRect(-w / 8, -h / 2, w / 4, h);
      // Lamp head
      ctx.beginPath();
      ctx.arc(0, -h / 2, w / 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    } else {
      // Default: ceiling light round
      ctx.beginPath();
      ctx.arc(0, 0, Math.min(w, h) / 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      // Inner bulb
      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.arc(0, 0, Math.min(w, h) / 4, 0, Math.PI * 2);
      ctx.fill();
    }
    // Light rays (for visible lights)
    if (type !== 'light-led-strip' && type !== 'light-track' && type !== 'light-emergency') {
      ctx.strokeStyle = color;
      ctx.lineWidth = 1.5 / zoom;
      for (let i = 0; i < 8; i++) {
        const angle = (i / 8) * Math.PI * 2;
        ctx.beginPath();
        ctx.moveTo(Math.cos(angle) * Math.min(w, h) / 2, Math.sin(angle) * Math.min(w, h) / 2);
        ctx.lineTo(Math.cos(angle) * (Math.min(w, h) / 2 + 5), Math.sin(angle) * (Math.min(w, h) / 2 + 5));
        ctx.stroke();
      }
    }
  }

  function drawCeiling2D(ctx, item, w, h) {
    const type = item.type;
    const color = item.color || '#F5F5F5';
    ctx.fillStyle = color;
    ctx.fillRect(-w / 2, -h / 2, w, h);
    ctx.strokeStyle = '#64748B';
    ctx.lineWidth = 1 / zoom;
    ctx.strokeRect(-w / 2, -h / 2, w, h);

    if (type === 'ceiling-gypsum' || type === 'ceiling-gypsum-borderless' || type === 'ceiling-pvc') {
      // Grid pattern (60x60 or 120x120)
      ctx.strokeStyle = 'rgba(100, 116, 139, 0.3)';
      ctx.lineWidth = 0.5 / zoom;
      const gridSize = 60;
      for (let x = -w / 2 + gridSize; x < w / 2; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, -h / 2);
        ctx.lineTo(x, h / 2);
        ctx.stroke();
      }
      for (let y = -h / 2 + gridSize; y < h / 2; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(-w / 2, y);
        ctx.lineTo(w / 2, y);
        ctx.stroke();
      }
    } else if (type === 'ceiling-wood') {
      // Wood plank lines
      ctx.strokeStyle = '#6B4423';
      ctx.lineWidth = 0.5 / zoom;
      for (let y = -h / 2; y < h / 2; y += 15) {
        ctx.beginPath();
        ctx.moveTo(-w / 2, y);
        ctx.lineTo(w / 2, y);
        ctx.stroke();
      }
    } else if (type === 'ceiling-metal-deck') {
      // Metal deck ribbed pattern
      ctx.strokeStyle = '#6B7280';
      ctx.lineWidth = 0.5 / zoom;
      for (let x = -w / 2; x < w / 2; x += 12) {
        ctx.beginPath();
        ctx.moveTo(x, -h / 2);
        ctx.lineTo(x, h / 2);
        ctx.stroke();
      }
    } else if (type === 'ceiling-exposed') {
      // Exposed: show beam grid
      ctx.fillStyle = 'rgba(120, 113, 108, 0.3)';
      ctx.fillRect(-w / 2, -h / 2, w, h);
      ctx.strokeStyle = '#1F2937';
      ctx.lineWidth = 2 / zoom;
      // Main beams
      for (let x = -w / 2; x <= w / 2; x += 60) {
        ctx.beginPath();
        ctx.moveTo(x, -h / 2);
        ctx.lineTo(x, h / 2);
        ctx.stroke();
      }
      for (let y = -h / 2; y <= h / 2; y += 60) {
        ctx.beginPath();
        ctx.moveTo(-w / 2, y);
        ctx.lineTo(w / 2, y);
        ctx.stroke();
      }
    } else if (type === 'ceiling-coffered') {
      // Coffered: grid of rectangles with border
      ctx.strokeStyle = '#D4A574';
      ctx.lineWidth = 2 / zoom;
      const cellSize = 40;
      for (let x = -w / 2; x < w / 2; x += cellSize) {
        for (let y = -h / 2; y < h / 2; y += cellSize) {
          ctx.strokeRect(x + 4, y + 4, cellSize - 8, cellSize - 8);
        }
      }
    } else if (type === 'ceiling-drop-tbar') {
      // T-bar grid (2x2 ft = 60x60cm)
      ctx.strokeStyle = '#374151';
      ctx.lineWidth = 1.5 / zoom;
      for (let x = -w / 2; x <= w / 2; x += 60) {
        ctx.beginPath();
        ctx.moveTo(x, -h / 2);
        ctx.lineTo(x, h / 2);
        ctx.stroke();
      }
      for (let y = -h / 2; y <= h / 2; y += 60) {
        ctx.beginPath();
        ctx.moveTo(-w / 2, y);
        ctx.lineTo(w / 2, y);
        ctx.stroke();
      }
    } else if (type === 'ceiling-cove') {
      // Cove: border + inner ceiling
      ctx.strokeStyle = '#FFEB99';
      ctx.lineWidth = 4 / zoom;
      ctx.strokeRect(-w / 2 + 8, -h / 2 + 8, w - 16, h - 16);
      ctx.fillStyle = '#FAFAFA';
      ctx.fillRect(-w / 2 + 16, -h / 2 + 16, w - 32, h - 32);
    }
    // Label
    ctx.fillStyle = '#1F2937';
    ctx.font = `${Math.min(w, h) * 0.15}px Inter`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('⬜', 0, 0);
  }

  function drawTrim2D(ctx, item, w, h) {
    const type = item.type;
    const color = item.color || '#8B6F47';
    ctx.fillStyle = color;
    ctx.fillRect(-w / 2, -h / 2, w, h);
    ctx.strokeStyle = '#1F2937';
    ctx.lineWidth = 1 / zoom;
    ctx.strokeRect(-w / 2, -h / 2, w, h);

    if (type.startsWith('lisplang-')) {
      // Lisplang: top edge highlighted (sloped profile)
      ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
      ctx.beginPath();
      ctx.moveTo(-w / 2, -h / 2);
      ctx.lineTo(w / 2, -h / 2);
      ctx.lineTo(w / 2, -h / 2 + 3);
      ctx.lineTo(-w / 2, -h / 2 + 3);
      ctx.closePath();
      ctx.fill();
      // Pattern: vertical lines every 50cm (joint)
      ctx.strokeStyle = 'rgba(0, 0, 0, 0.3)';
      ctx.lineWidth = 0.5 / zoom;
      for (let x = -w / 2 + 50; x < w / 2; x += 50) {
        ctx.beginPath();
        ctx.moveTo(x, -h / 2);
        ctx.lineTo(x, h / 2);
        ctx.stroke();
      }
      // Slope line for modern/klasik
      if (type === 'lisplang-modern' || type === 'lisplang-klasik') {
        ctx.strokeStyle = '#1F2937';
        ctx.lineWidth = 1 / zoom;
        ctx.beginPath();
        ctx.moveTo(-w / 2, h / 2);
        ctx.lineTo(w / 2, -h / 2);
        ctx.stroke();
      }
    } else if (type.startsWith('tali-air-')) {
      // Tali air: gutter shape (U-channel)
      ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
      ctx.fillRect(-w / 2 + 2, -h / 2 + 2, w - 4, h / 2 - 2);
      // Water flow arrows
      ctx.strokeStyle = '#0288D1';
      ctx.fillStyle = '#0288D1';
      ctx.lineWidth = 1.5 / zoom;
      const numArrows = Math.floor(w / 30);
      for (let i = 0; i < numArrows; i++) {
        const x = -w / 2 + (w / numArrows) * (i + 0.5);
        ctx.beginPath();
        ctx.moveTo(x - 3, 0);
        ctx.lineTo(x + 3, 0);
        ctx.lineTo(x + 1, -2);
        ctx.moveTo(x + 3, 0);
        ctx.lineTo(x + 1, 2);
        ctx.stroke();
      }
      // Joint marks every 100cm
      ctx.strokeStyle = '#1F2937';
      ctx.lineWidth = 0.5 / zoom;
      for (let x = -w / 2 + 100; x < w / 2; x += 100) {
        ctx.beginPath();
        ctx.moveTo(x, -h / 2);
        ctx.lineTo(x, h / 2);
        ctx.stroke();
      }
    } else if (type.startsWith('list-')) {
      // Simple list: thin line
      ctx.strokeStyle = 'rgba(0, 0, 0, 0.4)';
      ctx.lineWidth = 0.5 / zoom;
      ctx.beginPath();
      ctx.moveTo(-w / 2, 0);
      ctx.lineTo(w / 2, 0);
      ctx.stroke();
    }
  }

  function drawVentilation2D(ctx, item, w, h) {
    const type = item.type;
    const color = item.color || '#9CA3AF';
    ctx.fillStyle = color;
    ctx.fillRect(-w / 2, -h / 2, w, h);
    ctx.strokeStyle = '#1F2937';
    ctx.lineWidth = 1 / zoom;
    ctx.strokeRect(-w / 2, -h / 2, w, h);

    if (type === 'vent-wall' || type === 'vent-louver-wall' || type === 'vent-gable' || type === 'louver-window') {
      // Louver slats (horizontal lines)
      ctx.strokeStyle = 'rgba(0, 0, 0, 0.5)';
      ctx.lineWidth = 1.5 / zoom;
      const numSlats = Math.floor(h / 6);
      for (let i = 0; i < numSlats; i++) {
        const y = -h / 2 + (h / numSlats) * (i + 0.5);
        ctx.beginPath();
        ctx.moveTo(-w / 2 + 2, y);
        ctx.lineTo(w / 2 - 2, y);
        ctx.stroke();
      }
    } else if (type === 'vent-turbine' || type === 'vent-mushroom') {
      // Turbine/mushroom: round shape with blades
      ctx.fillStyle = '#6B7280';
      ctx.beginPath();
      ctx.arc(0, 0, Math.min(w, h) / 2 - 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#1F2937';
      ctx.stroke();
      // Blades
      for (let i = 0; i < 6; i++) {
        const angle = (i / 6) * Math.PI * 2;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(Math.cos(angle) * (Math.min(w, h) / 2 - 2), Math.sin(angle) * (Math.min(w, h) / 2 - 2));
        ctx.stroke();
      }
    } else if (type === 'vent-kitchen-hood') {
      // Kitchen hood: trapezoid shape
      ctx.fillStyle = '#9CA3AF';
      ctx.beginPath();
      ctx.moveTo(-w / 2, -h / 2);
      ctx.lineTo(w / 2, -h / 2);
      ctx.lineTo(w / 2 - 10, h / 2);
      ctx.lineTo(-w / 2 + 10, h / 2);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      // Exhaust arrows up
      ctx.strokeStyle = '#1F2937';
      ctx.fillStyle = '#1F2937';
      ctx.lineWidth = 1 / zoom;
      ctx.beginPath();
      ctx.moveTo(0, h / 2);
      ctx.lineTo(0, -h / 2 + 5);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(0, -h / 2 + 5);
      ctx.lineTo(-3, -h / 2 + 10);
      ctx.lineTo(3, -h / 2 + 10);
      ctx.closePath();
      ctx.fill();
    } else if (type === 'vent-bathroom-exhaust' || type === 'vent-exhaust-fan') {
      // Exhaust fan: circle with fan blades
      ctx.fillStyle = '#374151';
      ctx.beginPath();
      ctx.arc(0, 0, Math.min(w, h) / 2 - 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      // Fan blades (Y shape)
      ctx.strokeStyle = '#9CA3AF';
      ctx.lineWidth = 2 / zoom;
      for (let i = 0; i < 3; i++) {
        const angle = (i / 3) * Math.PI * 2;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(Math.cos(angle) * (Math.min(w, h) / 2 - 4), Math.sin(angle) * (Math.min(w, h) / 2 - 4));
        ctx.stroke();
      }
      // Center hub
      ctx.fillStyle = '#1F2937';
      ctx.beginPath();
      ctx.arc(0, 0, 2, 0, Math.PI * 2);
      ctx.fill();
    } else if (type === 'vent-ridge' || type === 'vent-soffit') {
      // Ridge/soffit vent: long thin with vents
      ctx.strokeStyle = 'rgba(0, 0, 0, 0.4)';
      ctx.lineWidth = 1 / zoom;
      const numVents = Math.floor(w / 8);
      for (let i = 0; i < numVents; i++) {
        const x = -w / 2 + (w / numVents) * (i + 0.5);
        ctx.beginPath();
        ctx.moveTo(x - 2, -h / 2 + 1);
        ctx.lineTo(x + 2, h / 2 - 1);
        ctx.stroke();
      }
    } else if (type === 'vent-ac') {
      // AC: box with split unit visualization
      ctx.strokeStyle = '#1F2937';
      ctx.lineWidth = 1.5 / zoom;
      // Outdoor unit box
      ctx.strokeRect(-w / 2 + 2, -h / 2 + 2, w - 4, h - 4);
      // Fan circle (outdoor)
      ctx.beginPath();
      ctx.arc(-w / 4, 0, Math.min(w, h) / 4, 0, Math.PI * 2);
      ctx.stroke();
      // Lines for fins
      for (let i = 0; i < 5; i++) {
        ctx.beginPath();
        ctx.moveTo(w / 4 - 5, -h / 2 + 4 + i * (h - 8) / 4);
        ctx.lineTo(w / 2 - 4, -h / 2 + 4 + i * (h - 8) / 4);
        ctx.stroke();
      }
    } else if (type === 'vent-solar') {
      // Solar vent: round with solar panel pattern
      ctx.fillStyle = '#1E3A5F';
      ctx.beginPath();
      ctx.arc(0, 0, Math.min(w, h) / 2 - 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#0F172A';
      ctx.stroke();
      // Solar cell grid
      ctx.strokeStyle = '#3B82F6';
      ctx.lineWidth = 0.5 / zoom;
      const r = Math.min(w, h) / 2 - 2;
      for (let i = -r; i <= r; i += 5) {
        ctx.beginPath();
        ctx.moveTo(-r, i);
        ctx.lineTo(r, i);
        ctx.stroke();
      }
    } else if (type === 'vent-roof' || type === 'vent-static') {
      // Roof vent: box with slats
      ctx.strokeStyle = 'rgba(0, 0, 0, 0.5)';
      ctx.lineWidth = 1 / zoom;
      for (let i = 0; i < 4; i++) {
        const y = -h / 2 + (h / 5) * (i + 1);
        ctx.beginPath();
        ctx.moveTo(-w / 2 + 3, y);
        ctx.lineTo(w / 2 - 3, y);
        ctx.stroke();
      }
    }
  }

  function drawFlooring2D(ctx, item, w, h) {
    const type = item.type;
    const color = item.color || '#E5E5E5';
    ctx.fillStyle = color;
    ctx.fillRect(-w / 2, -h / 2, w, h);
    ctx.strokeStyle = '#64748B';
    ctx.lineWidth = 1 / zoom;
    ctx.strokeRect(-w / 2, -h / 2, w, h);

    // Determine tile size based on type
    let tileSize = 30;
    if (type.includes('ceramic-30')) tileSize = 30;
    else if (type.includes('ceramic-40')) tileSize = 40;
    else if (type.includes('ceramic-60')) tileSize = 60;
    else if (type.includes('granite-60')) tileSize = 60;
    else if (type.includes('granite-80')) tileSize = 80;
    else if (type.includes('granite-polished') || type.includes('granite-honed')) tileSize = 80;
    else if (type.includes('marble')) tileSize = 60;
    else if (type.includes('terrazzo')) tileSize = 100;
    else if (type.includes('carpet-tile')) tileSize = 50;
    else if (type.includes('tatami')) tileSize = 90;

    // Draw tile pattern
    if (type.includes('ceramic') || type.includes('granite') || type.includes('marble') || type.includes('terrazzo') || type.includes('carpet-tile') || type.includes('tatami') || type.includes('bathroom-tile') || type.includes('kitchen-tile')) {
      ctx.strokeStyle = 'rgba(100, 116, 139, 0.4)';
      ctx.lineWidth = 0.5 / zoom;
      for (let x = -w / 2 + tileSize; x < w / 2; x += tileSize) {
        ctx.beginPath();
        ctx.moveTo(x, -h / 2);
        ctx.lineTo(x, h / 2);
        ctx.stroke();
      }
      for (let y = -h / 2 + tileSize; y < h / 2; y += tileSize) {
        ctx.beginPath();
        ctx.moveTo(-w / 2, y);
        ctx.lineTo(w / 2, y);
        ctx.stroke();
      }
    } else if (type.includes('parquet') || type.includes('hardwood') || type.includes('laminate') || type.includes('bamboo') || type.includes('wood-deck')) {
      // Wood planks (horizontal)
      ctx.strokeStyle = 'rgba(91, 58, 26, 0.4)';
      ctx.lineWidth = 0.5 / zoom;
      const plankH = 12;
      for (let y = -h / 2 + plankH; y < h / 2; y += plankH) {
        ctx.beginPath();
        ctx.moveTo(-w / 2, y);
        ctx.lineTo(w / 2, y);
        ctx.stroke();
      }
      // Random plank joints
      ctx.strokeStyle = 'rgba(91, 58, 26, 0.6)';
      for (let y = -h / 2; y < h / 2; y += plankH) {
        const offset = (Math.floor(y / plankH) % 3) * 25;
        for (let x = -w / 2 + offset + 30; x < w / 2; x += 60) {
          ctx.beginPath();
          ctx.moveTo(x, y);
          ctx.lineTo(x, y + plankH);
          ctx.stroke();
        }
      }
    } else if (type.includes('vinyl')) {
      // Vinyl: subtle wood-like pattern
      ctx.strokeStyle = 'rgba(139, 111, 71, 0.3)';
      ctx.lineWidth = 0.3 / zoom;
      for (let y = -h / 2 + 15; y < h / 2; y += 15) {
        ctx.beginPath();
        ctx.moveTo(-w / 2, y);
        ctx.lineTo(w / 2, y);
        ctx.stroke();
      }
    } else if (type.includes('mosaic')) {
      // Mosaic: small squares
      ctx.strokeStyle = 'rgba(0, 0, 0, 0.4)';
      ctx.lineWidth = 0.3 / zoom;
      const mSize = 6;
      for (let x = -w / 2; x < w / 2; x += mSize) {
        for (let y = -h / 2; y < h / 2; y += mSize) {
          ctx.strokeRect(x, y, mSize, mSize);
        }
      }
    } else if (type.includes('slate') || type.includes('natural-stone')) {
      // Slate/stone: irregular shapes
      ctx.strokeStyle = 'rgba(0, 0, 0, 0.4)';
      ctx.lineWidth = 0.5 / zoom;
      for (let i = 0; i < 8; i++) {
        const x1 = -w / 2 + Math.random() * w;
        const y1 = -h / 2 + Math.random() * h;
        const x2 = x1 + (Math.random() - 0.5) * 40;
        const y2 = y1 + (Math.random() - 0.5) * 40;
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
      }
    } else if (type.includes('concrete') || type.includes('epoxy')) {
      // Concrete/epoxy: smooth with control joints
      ctx.strokeStyle = 'rgba(0, 0, 0, 0.3)';
      ctx.lineWidth = 0.5 / zoom;
      // Control joints every 100cm
      for (let x = -w / 2 + 100; x < w / 2; x += 100) {
        ctx.beginPath();
        ctx.moveTo(x, -h / 2);
        ctx.lineTo(x, h / 2);
        ctx.stroke();
      }
      for (let y = -h / 2 + 100; y < h / 2; y += 100) {
        ctx.beginPath();
        ctx.moveTo(-w / 2, y);
        ctx.lineTo(w / 2, y);
        ctx.stroke();
      }
    }
  }

  function drawColumn2D(ctx, item, w, h, isStructural) {
    const type = item.type;
    const color = isStructural ? '#f59e0b' : (item.color || '#DC2626');
    ctx.fillStyle = color;
    ctx.strokeStyle = '#1F2937';
    ctx.lineWidth = 1 / zoom;

    if (type === 'column-round' || type === 'column-marble') {
      // Round column
      ctx.beginPath();
      ctx.arc(0, 0, w / 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      // Inner circle (section)
      ctx.strokeStyle = 'rgba(0,0,0,0.4)';
      ctx.beginPath();
      ctx.arc(0, 0, w / 3, 0, Math.PI * 2);
      ctx.stroke();
    } else if (type === 'column-wood-round') {
      // Wood round (tree trunk)
      ctx.beginPath();
      ctx.arc(0, 0, w / 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      // Tree rings
      ctx.strokeStyle = 'rgba(91, 58, 26, 0.6)';
      for (let r = w / 8; r < w / 2; r += w / 8) {
        ctx.beginPath();
        ctx.arc(0, 0, r, 0, Math.PI * 2);
        ctx.stroke();
      }
    } else if (type === 'column-hexagon' || type === 'column-octagon') {
      // Polygon
      const sides = type === 'column-hexagon' ? 6 : 8;
      ctx.beginPath();
      for (let i = 0; i < sides; i++) {
        const angle = (i / sides) * Math.PI * 2;
        const x = Math.cos(angle) * w / 2;
        const y = Math.sin(angle) * h / 2;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    } else if (type === 'column-classic' || type === 'column-classic-ionic' || type === 'column-classic-corinthian') {
      // Classic column with flutes
      ctx.beginPath();
      ctx.arc(0, 0, w / 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      // Flutes (vertical lines)
      ctx.strokeStyle = 'rgba(0,0,0,0.4)';
      const numFlutes = 20;
      for (let i = 0; i < numFlutes; i++) {
        const angle = (i / numFlutes) * Math.PI * 2;
        ctx.beginPath();
        ctx.moveTo(Math.cos(angle) * (w / 4), Math.sin(angle) * (h / 4));
        ctx.lineTo(Math.cos(angle) * (w / 2), Math.sin(angle) * (h / 2));
        ctx.stroke();
      }
      // Capital (top decoration)
      ctx.strokeStyle = '#1F2937';
      ctx.lineWidth = 1.5 / zoom;
      ctx.beginPath();
      ctx.arc(0, 0, w / 2 + 2, 0, Math.PI * 2);
      ctx.stroke();
    } else if (type === 'column-steel-pipe') {
      // Steel pipe: ring shape
      ctx.beginPath();
      ctx.arc(0, 0, w / 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      // Hollow inside
      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.arc(0, 0, w / 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#1F2937';
      ctx.stroke();
    } else if (type === 'column-lamp-post') {
      // Lamp post: small dot for post + light
      ctx.fillRect(-w / 4, -h / 4, w / 2, h / 2);
      ctx.strokeRect(-w / 4, -h / 4, w / 2, h / 2);
      // Light symbol on top
      ctx.fillStyle = '#FFEB99';
      ctx.beginPath();
      ctx.arc(0, -h / 2 - 3, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    } else {
      // Default square column
      ctx.fillRect(-w / 2, -h / 2, w, h);
      ctx.strokeRect(-w / 2, -h / 2, w, h);
      // Cross-hatch (structural)
      ctx.strokeStyle = 'rgba(255,255,255,0.5)';
      ctx.lineWidth = 1 / zoom;
      ctx.setLineDash([3 / zoom, 3 / zoom]);
      for (let i = -w / 2; i < w / 2; i += 8) {
        ctx.beginPath();
        ctx.moveTo(i, -h / 2);
        ctx.lineTo(i, h / 2);
        ctx.stroke();
      }
      ctx.setLineDash([]);
    }
  }

  function drawSanitary2D(ctx, item, w, h) {
    const type = item.type;
    const color = item.color || '#FFFFFF';
    ctx.fillStyle = color;
    ctx.strokeStyle = '#1F2937';
    ctx.lineWidth = 1 / zoom;

    if (type.startsWith('closet-')) {
      // Closet (toilet): oval shape
      ctx.beginPath();
      ctx.ellipse(0, 0, w / 2, h / 2, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      // Tank
      ctx.fillStyle = '#F5F5F5';
      ctx.fillRect(-w / 3, -h / 2, w * 2 / 3, h / 4);
      ctx.strokeRect(-w / 3, -h / 2, w * 2 / 3, h / 4);
      // Seat (inner ellipse)
      ctx.fillStyle = '#E5E5E5';
      ctx.beginPath();
      ctx.ellipse(0, h / 6, w / 3, h / 5, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    } else if (type === 'bidet') {
      // Bidet: shallow oval
      ctx.beginPath();
      ctx.ellipse(0, 0, w / 2, h / 2, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      // Water jet
      ctx.fillStyle = '#BEE3F8';
      ctx.beginPath();
      ctx.arc(0, 0, w / 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    } else if (type === 'urinoir') {
      // Urinoir: shield shape
      ctx.beginPath();
      ctx.moveTo(-w / 2, -h / 2);
      ctx.lineTo(w / 2, -h / 2);
      ctx.lineTo(w / 2.5, h / 2);
      ctx.lineTo(-w / 2.5, h / 2);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    } else if (type.startsWith('bathtub-')) {
      // Bathtub: rounded rectangle with inner tub
      ctx.fillRect(-w / 2, -h / 2, w, h);
      ctx.strokeRect(-w / 2, -h / 2, w, h);
      // Inner tub (water)
      ctx.fillStyle = '#BEE3F8';
      ctx.fillRect(-w / 2 + 6, -h / 2 + 6, w - 12, h - 12);
      ctx.strokeRect(-w / 2 + 6, -h / 2 + 6, w - 12, h - 12);
      // Drain
      ctx.fillStyle = '#9CA3AF';
      ctx.beginPath();
      ctx.arc(w / 3, 0, 3, 0, Math.PI * 2);
      ctx.fill();
      // Faucet
      ctx.fillStyle = '#9CA3AF';
      ctx.fillRect(-w / 2 + 2, -2, 4, 4);
    } else if (type === 'shower-enclosure' || type === 'shower-pan') {
      // Shower: square with glass walls (blue tint)
      ctx.fillStyle = 'rgba(190, 227, 248, 0.4)';
      ctx.fillRect(-w / 2, -h / 2, w, h);
      ctx.strokeRect(-w / 2, -h / 2, w, h);
      // Shower head symbol
      ctx.fillStyle = '#9CA3AF';
      ctx.beginPath();
      ctx.arc(0, -h / 3, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      // Water droplets
      ctx.fillStyle = '#0288D1';
      for (let i = 0; i < 5; i++) {
        const angle = (i / 5) * Math.PI;
        ctx.beginPath();
        ctx.arc(Math.cos(angle) * 6, -h / 3 + 8 + Math.sin(angle) * 4, 1.5, 0, Math.PI * 2);
        ctx.fill();
      }
    } else if (type === 'shower-head') {
      // Just shower head
      ctx.beginPath();
      ctx.arc(0, 0, w / 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#0288D1';
      ctx.beginPath();
      ctx.arc(0, 0, w / 4, 0, Math.PI * 2);
      ctx.fill();
    } else if (type.startsWith('sink-')) {
      // Sink: rectangle with double bowl
      ctx.fillRect(-w / 2, -h / 2, w, h);
      ctx.strokeRect(-w / 2, -h / 2, w, h);
      // Bowl(s)
      ctx.fillStyle = '#374151';
      if (type.includes('double')) {
        ctx.fillRect(-w / 2 + 4, -h / 2 + 4, w / 2 - 6, h - 8);
        ctx.fillRect(2, -h / 2 + 4, w / 2 - 6, h - 8);
      } else {
        ctx.fillRect(-w / 2 + 4, -h / 2 + 4, w - 8, h - 8);
      }
      // Faucet
      ctx.fillStyle = '#9CA3AF';
      ctx.fillRect(-2, -h / 2, 4, 6);
    } else if (type === 'floor-drain') {
      // Floor drain: small circle with grid
      ctx.beginPath();
      ctx.arc(0, 0, w / 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      // Cross grid
      ctx.strokeStyle = '#374151';
      ctx.lineWidth = 1.5 / zoom;
      ctx.beginPath();
      ctx.moveTo(-w / 2, 0);
      ctx.lineTo(w / 2, 0);
      ctx.moveTo(0, -h / 2);
      ctx.lineTo(0, h / 2);
      ctx.stroke();
    } else if (type === 'water-tap') {
      // Water tap: small with curve
      ctx.beginPath();
      ctx.arc(0, 0, w / 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      // Handle
      ctx.fillStyle = '#1F2937';
      ctx.fillRect(-1, -h / 2 - 2, 2, 4);
    } else if (type.startsWith('water-heater')) {
      // Water heater: cylinder
      ctx.beginPath();
      ctx.ellipse(0, 0, w / 2, h / 2, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      // Indicator
      ctx.fillStyle = '#10B981';
      ctx.beginPath();
      ctx.arc(w / 4, -h / 4, 2, 0, Math.PI * 2);
      ctx.fill();
    } else if (type.startsWith('toren')) {
      // Toren: large cylinder
      ctx.beginPath();
      ctx.ellipse(0, 0, w / 2, h / 2, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      // Logo/lid
      ctx.fillStyle = '#1F2937';
      ctx.beginPath();
      ctx.ellipse(0, -h / 2 + 4, w / 3, 3, 0, 0, Math.PI * 2);
      ctx.fill();
    } else if (type === 'septic-tank') {
      // Septic tank: rectangle
      ctx.fillRect(-w / 2, -h / 2, w, h);
      ctx.strokeRect(-w / 2, -h / 2, w, h);
      // Inlet/outlet pipes
      ctx.fillStyle = '#6B7280';
      ctx.fillRect(-w / 2 - 4, -2, 4, 4);
      ctx.fillRect(w / 2, -2, 4, 4);
      // Cover
      ctx.beginPath();
      ctx.arc(0, 0, w / 4, 0, Math.PI * 2);
      ctx.stroke();
    } else if (type === 'sumur-air') {
      // Well: circle with water
      ctx.beginPath();
      ctx.arc(0, 0, w / 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      // Water
      ctx.fillStyle = '#0288D1';
      ctx.beginPath();
      ctx.arc(0, 0, w / 3, 0, Math.PI * 2);
      ctx.fill();
    } else if (type === 'pump-water') {
      // Pump: box with motor
      ctx.fillRect(-w / 2, -h / 2, w, h);
      ctx.strokeRect(-w / 2, -h / 2, w, h);
      // Motor circle
      ctx.fillStyle = '#374151';
      ctx.beginPath();
      ctx.arc(0, 0, w / 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    }
  }

  function drawElectrical2D(ctx, item, w, h) {
    const type = item.type;
    const color = item.color || '#FFFFFF';
    ctx.fillStyle = color;
    ctx.strokeStyle = '#1F2937';
    ctx.lineWidth = 1 / zoom;

    if (type.startsWith('outlet-')) {
      // Outlet: square with plug holes
      ctx.fillRect(-w / 2, -h / 2, w, h);
      ctx.strokeRect(-w / 2, -h / 2, w, h);
      // Plug holes
      ctx.fillStyle = '#1F2937';
      // Vertical slots
      ctx.fillRect(-w / 4, -h / 6, 1.5, h / 3);
      ctx.fillRect(w / 4 - 1.5, -h / 6, 1.5, h / 3);
      // Ground (circle below)
      ctx.beginPath();
      ctx.arc(0, h / 4, 1.5, 0, Math.PI * 2);
      ctx.fill();
    } else if (type.startsWith('switch-')) {
      // Switch: square with toggle
      ctx.fillRect(-w / 2, -h / 2, w, h);
      ctx.strokeRect(-w / 2, -h / 2, w, h);
      // Switch toggles (1, 2, or 3 depending on gang count)
      const numGangs = type === 'switch-single' ? 1 : type === 'switch-double' ? 2 : 3;
      for (let i = 0; i < numGangs; i++) {
        const y = -h / 2 + (h / numGangs) * (i + 0.5);
        ctx.fillStyle = '#1F2937';
        ctx.fillRect(-w / 4, y - 2, w / 2, 4);
      }
    } else if (type.startsWith('mcb-')) {
      // MCB panel: rectangle with breakers
      ctx.fillRect(-w / 2, -h / 2, w, h);
      ctx.strokeRect(-w / 2, -h / 2, w, h);
      // Breakers (vertical lines)
      ctx.strokeStyle = '#1F2937';
      const numBreakers = type === 'mcb-panel-large' ? 8 : 4;
      for (let i = 0; i < numBreakers; i++) {
        const x = -w / 2 + (w / numBreakers) * (i + 0.5);
        ctx.beginPath();
        ctx.moveTo(x, -h / 2 + 2);
        ctx.lineTo(x, h / 2 - 2);
        ctx.stroke();
        // Switch on each
        ctx.fillStyle = '#DC2626';
        ctx.fillRect(x - 1, -h / 4, 2, h / 2);
      }
    } else if (type === 'doorbell') {
      // Doorbell: small with bell icon
      ctx.beginPath();
      ctx.arc(0, 0, w / 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      // Bell icon
      ctx.fillStyle = '#1F2937';
      ctx.font = `${Math.min(w, h) * 0.6}px Inter`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('🔔', 0, 0);
    } else if (type.startsWith('cctv')) {
      // CCTV: dome or bullet
      if (type === 'cctv-bullet') {
        // Bullet: long rectangle
        ctx.fillRect(-w / 2, -h / 2, w, h);
        ctx.strokeRect(-w / 2, -h / 2, w, h);
        // Lens
        ctx.fillStyle = '#1F2937';
        ctx.beginPath();
        ctx.arc(-w / 3, 0, h / 3, 0, Math.PI * 2);
        ctx.fill();
      } else {
        // Dome: half circle
        ctx.beginPath();
        ctx.arc(0, 0, w / 2, 0, Math.PI);
        ctx.fill();
        ctx.stroke();
        // Lens
        ctx.fillStyle = '#1F2937';
        ctx.beginPath();
        ctx.arc(0, 0, w / 5, 0, Math.PI * 2);
        ctx.fill();
      }
    } else if (type === 'intercom') {
      // Intercom: rectangle with screen
      ctx.fillRect(-w / 2, -h / 2, w, h);
      ctx.strokeRect(-w / 2, -h / 2, w, h);
      // Screen
      ctx.fillStyle = '#1F2937';
      ctx.fillRect(-w / 2 + 2, -h / 2 + 2, w - 4, h / 2);
      // Buttons
      ctx.fillStyle = '#9CA3AF';
      ctx.fillRect(-w / 4, h / 8, w / 2, h / 4);
    } else if (type === 'motion-sensor' || type === 'smoke-detector') {
      // Sensor: circle with LED
      ctx.beginPath();
      ctx.arc(0, 0, w / 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      // LED
      ctx.fillStyle = type === 'smoke-detector' ? '#10B981' : '#DC2626';
      ctx.beginPath();
      ctx.arc(0, 0, w / 6, 0, Math.PI * 2);
      ctx.fill();
    } else if (type === 'antenna-tv') {
      // Antenna: lines radiating
      ctx.strokeStyle = '#1F2937';
      ctx.lineWidth = 2 / zoom;
      for (let i = -2; i <= 2; i++) {
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(i * w / 5, -h / 2);
        ctx.stroke();
      }
    } else if (type === 'smart-hub') {
      // Smart hub: small box with WiFi
      ctx.fillRect(-w / 2, -h / 2, w, h);
      ctx.strokeRect(-w / 2, -h / 2, w, h);
      ctx.fillStyle = '#3B82F6';
      ctx.font = `${Math.min(w, h) * 0.5}px Inter`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('🌐', 0, 0);
    } else if (type === 'ev-charger') {
      // EV charger: tall box
      ctx.fillRect(-w / 2, -h / 2, w, h);
      ctx.strokeRect(-w / 2, -h / 2, w, h);
      // Screen
      ctx.fillStyle = '#3B82F6';
      ctx.fillRect(-w / 3, -h / 3, w * 2 / 3, h / 4);
      // Cable
      ctx.strokeStyle = '#1F2937';
      ctx.lineWidth = 2 / zoom;
      ctx.beginPath();
      ctx.moveTo(w / 2, 0);
      ctx.lineTo(w / 2 + 5, h / 3);
      ctx.stroke();
    }
  }

  function drawAppliance2D(ctx, item, w, h) {
    const type = item.type;
    const color = item.color || '#F5F5F5';
    ctx.fillStyle = color;
    ctx.strokeStyle = '#1F2937';
    ctx.lineWidth = 1 / zoom;

    if (type.startsWith('ac-') && type !== 'ac-outdoor') {
      // AC indoor unit: long thin box with vents
      ctx.fillRect(-w / 2, -h / 2, w, h);
      ctx.strokeRect(-w / 2, -h / 2, w, h);
      // Vents (louvers)
      ctx.strokeStyle = '#9CA3AF';
      ctx.lineWidth = 0.5 / zoom;
      for (let i = 0; i < 5; i++) {
        const y = -h / 2 + (h / 6) * (i + 1);
        ctx.beginPath();
        ctx.moveTo(-w / 2 + 3, y);
        ctx.lineTo(w / 2 - 3, y);
        ctx.stroke();
      }
      // Brand indicator
      ctx.fillStyle = '#3B82F6';
      ctx.beginPath();
      ctx.arc(w / 2 - 4, 0, 1.5, 0, Math.PI * 2);
      ctx.fill();
    } else if (type === 'ac-outdoor') {
      // AC outdoor: square with fan + fins
      ctx.fillRect(-w / 2, -h / 2, w, h);
      ctx.strokeRect(-w / 2, -h / 2, w, h);
      // Fan circle
      ctx.fillStyle = '#6B7280';
      ctx.beginPath();
      ctx.arc(-w / 4, 0, h / 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      // Fan blades
      ctx.strokeStyle = '#1F2937';
      for (let i = 0; i < 4; i++) {
        const angle = (i / 4) * Math.PI * 2;
        ctx.beginPath();
        ctx.moveTo(-w / 4, 0);
        ctx.lineTo(-w / 4 + Math.cos(angle) * h / 3, Math.sin(angle) * h / 3);
        ctx.stroke();
      }
      // Heat fins
      for (let i = 0; i < 6; i++) {
        ctx.beginPath();
        ctx.moveTo(w / 6 + i * 3, -h / 2 + 2);
        ctx.lineTo(w / 6 + i * 3, h / 2 - 2);
        ctx.stroke();
      }
    } else if (type === 'ceiling-fan') {
      // Ceiling fan: 3-4 blades
      ctx.fillStyle = '#8B6F47';
      for (let i = 0; i < 4; i++) {
        const angle = (i / 4) * Math.PI * 2;
        ctx.save();
        ctx.rotate(angle);
        ctx.beginPath();
        ctx.ellipse(w / 3, 0, w / 3, h / 8, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.restore();
      }
      // Center motor
      ctx.fillStyle = '#1F2937';
      ctx.beginPath();
      ctx.arc(0, 0, w / 8, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    } else if (type.startsWith('fan-') && type !== 'fan-exhaust') {
      // Stand/table/wall fan: round with blade cage
      ctx.beginPath();
      ctx.arc(0, 0, w / 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      // Cage grid
      ctx.strokeStyle = '#374151';
      ctx.lineWidth = 0.5 / zoom;
      for (let i = 0; i < 8; i++) {
        const angle = (i / 8) * Math.PI * 2;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(Math.cos(angle) * w / 2, Math.sin(angle) * w / 2);
        ctx.stroke();
      }
      // Outer ring
      ctx.beginPath();
      ctx.arc(0, 0, w / 2, 0, Math.PI * 2);
      ctx.stroke();
      // Center hub
      ctx.fillStyle = '#1F2937';
      ctx.beginPath();
      ctx.arc(0, 0, w / 6, 0, Math.PI * 2);
      ctx.fill();
    } else if (type === 'fan-exhaust') {
      // Exhaust fan: square with fan
      ctx.fillRect(-w / 2, -h / 2, w, h);
      ctx.strokeRect(-w / 2, -h / 2, w, h);
      ctx.fillStyle = '#374151';
      ctx.beginPath();
      ctx.arc(0, 0, w / 3, 0, Math.PI * 2);
      ctx.fill();
      // Blades
      ctx.strokeStyle = '#9CA3AF';
      for (let i = 0; i < 3; i++) {
        const angle = (i / 3) * Math.PI * 2;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(Math.cos(angle) * w / 3, Math.sin(angle) * w / 3);
        ctx.stroke();
      }
    } else if (type.startsWith('tv-')) {
      // TV: thin rectangle (top view)
      ctx.fillRect(-w / 2, -h / 2, w, h);
      ctx.strokeRect(-w / 2, -h / 2, w, h);
      // Screen (slightly different color)
      ctx.fillStyle = '#1F2937';
      ctx.fillRect(-w / 2 + 1, -h / 2 + 1, w - 2, h - 2);
      // Stand
      ctx.fillStyle = '#374151';
      ctx.fillRect(-w / 6, h / 2, w / 3, 2);
    } else if (type === 'home-theater' || type === 'speaker-stand') {
      // Speaker: rectangle with grille
      ctx.fillRect(-w / 2, -h / 2, w, h);
      ctx.strokeRect(-w / 2, -h / 2, w, h);
      // Speakers (circles)
      ctx.fillStyle = '#1F2937';
      ctx.beginPath();
      ctx.arc(0, -h / 4, w / 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(0, h / 4, w / 4, 0, Math.PI * 2);
      ctx.fill();
    } else if (type.startsWith('washing-')) {
      // Washing machine: square with drum
      ctx.fillRect(-w / 2, -h / 2, w, h);
      ctx.strokeRect(-w / 2, -h / 2, w, h);
      // Drum
      ctx.fillStyle = '#9CA3AF';
      ctx.beginPath();
      ctx.arc(0, 0, w / 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      // Control panel
      ctx.fillStyle = '#1F2937';
      ctx.fillRect(-w / 2, -h / 2, w, h / 5);
    } else if (type === 'dryer') {
      // Dryer: square with drum + vent
      ctx.fillRect(-w / 2, -h / 2, w, h);
      ctx.strokeRect(-w / 2, -h / 2, w, h);
      ctx.fillStyle = '#9CA3AF';
      ctx.beginPath();
      ctx.arc(0, 0, w / 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      // Vent (heat)
      ctx.fillStyle = '#FFC857';
      ctx.beginPath();
      ctx.arc(w / 2 - 4, -h / 2 + 4, 2, 0, Math.PI * 2);
      ctx.fill();
    } else if (type.startsWith('fridge-')) {
      // Fridge: rectangle with door lines
      ctx.fillRect(-w / 2, -h / 2, w, h);
      ctx.strokeRect(-w / 2, -h / 2, w, h);
      // Door division
      ctx.strokeStyle = '#1F2937';
      ctx.lineWidth = 1 / zoom;
      if (type === 'fridge-2pintu' || type === 'fridge-side-by-side') {
        if (type === 'fridge-side-by-side') {
          // Side by side: vertical line
          ctx.beginPath();
          ctx.moveTo(0, -h / 2);
          ctx.lineTo(0, h / 2);
          ctx.stroke();
        } else {
          // 2 pintu: horizontal line
          ctx.beginPath();
          ctx.moveTo(-w / 2, -h / 5);
          ctx.lineTo(w / 2, -h / 5);
          ctx.stroke();
        }
      }
      // Handle
      ctx.fillStyle = '#1F2937';
      ctx.fillRect(-w / 2 + 2, -h / 2 + h / 4, 2, h / 4);
    } else if (type === 'microwave' || type === 'dishwasher' || type === 'wine-cooler') {
      // Microwave/dishwasher: square with door
      ctx.fillRect(-w / 2, -h / 2, w, h);
      ctx.strokeRect(-w / 2, -h / 2, w, h);
      // Door window
      ctx.fillStyle = '#1F2937';
      ctx.fillRect(-w / 2 + 3, -h / 2 + 3, w - 6, h - 6);
      // Handle
      ctx.fillStyle = '#9CA3AF';
      ctx.fillRect(w / 2 - 4, -h / 4, 2, h / 2);
    } else if (type === 'dispenser' || type === 'water-purifier') {
      // Dispenser: tall narrow with taps
      ctx.fillRect(-w / 2, -h / 2, w, h);
      ctx.strokeRect(-w / 2, -h / 2, w, h);
      // Water bottle on top
      ctx.fillStyle = '#BEE3F8';
      ctx.beginPath();
      ctx.ellipse(0, -h / 2 + 5, w / 3, 4, 0, 0, Math.PI * 2);
      ctx.fill();
      // Taps
      ctx.fillStyle = '#DC2626';
      ctx.beginPath();
      ctx.arc(-w / 4, h / 4, 1.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#3B82F6';
      ctx.beginPath();
      ctx.arc(w / 4, h / 4, 1.5, 0, Math.PI * 2);
      ctx.fill();
    } else if (type === 'vacuum') {
      // Vacuum: round
      ctx.beginPath();
      ctx.arc(0, 0, w / 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      // Hose
      ctx.strokeStyle = '#1F2937';
      ctx.lineWidth = 2 / zoom;
      ctx.beginPath();
      ctx.moveTo(w / 2, 0);
      ctx.quadraticCurveTo(w, -h / 2, w / 2, -h / 2);
      ctx.stroke();
    } else {
      // Default appliance: rectangle
      ctx.fillRect(-w / 2, -h / 2, w, h);
      ctx.strokeRect(-w / 2, -h / 2, w, h);
    }
  }

  function drawDecor2D(ctx, item, w, h) {
    const type = item.type;
    const color = item.color || '#8B6F47';
    ctx.fillStyle = color;
    ctx.strokeStyle = '#1F2937';
    ctx.lineWidth = 1 / zoom;

    if (type.startsWith('painting-') || type.startsWith('photo-')) {
      // Painting: thin rectangle with frame
      ctx.fillRect(-w / 2, -h / 2, w, h);
      ctx.strokeRect(-w / 2, -h / 2, w, h);
      // Inner content (colorful)
      ctx.fillStyle = '#FBBF24';
      ctx.fillRect(-w / 2 + 2, -h / 2 + 2, w - 4, h - 4);
      // Border
      ctx.strokeStyle = '#5D3A1A';
      ctx.lineWidth = 2 / zoom;
      ctx.strokeRect(-w / 2, -h / 2, w, h);
    } else if (type.startsWith('vase-')) {
      // Vase: round/oval shape
      ctx.beginPath();
      ctx.ellipse(0, 0, w / 2, h / 2, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      // Top opening
      ctx.fillStyle = '#1F2937';
      ctx.beginPath();
      ctx.ellipse(0, -h / 2 + 3, w / 4, 2, 0, 0, Math.PI * 2);
      ctx.fill();
    } else if (type.startsWith('mirror-')) {
      // Mirror: thin with reflective look
      ctx.fillStyle = 'rgba(190, 227, 248, 0.6)';
      ctx.fillRect(-w / 2, -h / 2, w, h);
      ctx.strokeRect(-w / 2, -h / 2, w, h);
      // Frame
      ctx.strokeStyle = '#D4A574';
      ctx.lineWidth = 2 / zoom;
      ctx.strokeRect(-w / 2, -h / 2, w, h);
      // Reflection lines
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
      ctx.lineWidth = 1 / zoom;
      ctx.beginPath();
      ctx.moveTo(-w / 3, -h / 3);
      ctx.lineTo(-w / 6, h / 3);
      ctx.stroke();
    } else if (type.startsWith('curtain-') || type.startsWith('blind-')) {
      // Curtain/blind: long thin vertical
      ctx.fillStyle = color;
      ctx.fillRect(-w / 2, -h / 2, w, h);
      ctx.strokeRect(-w / 2, -h / 2, w, h);
      // Vertical folds
      ctx.strokeStyle = 'rgba(0, 0, 0, 0.3)';
      ctx.lineWidth = 0.5 / zoom;
      const numFolds = type.startsWith('blind') ? 15 : 8;
      for (let i = 1; i < numFolds; i++) {
        const x = -w / 2 + (w / numFolds) * i;
        ctx.beginPath();
        ctx.moveTo(x, -h / 2);
        ctx.lineTo(x, h / 2);
        ctx.stroke();
      }
      // Rod at top
      ctx.strokeStyle = '#1F2937';
      ctx.lineWidth = 1.5 / zoom;
      ctx.beginPath();
      ctx.moveTo(-w / 2, -h / 2);
      ctx.lineTo(w / 2, -h / 2);
      ctx.stroke();
    } else if (type.startsWith('rug-')) {
      // Rug: thin flat with pattern
      ctx.fillStyle = color;
      ctx.fillRect(-w / 2, -h / 2, w, h);
      ctx.strokeStyle = '#1F2937';
      ctx.lineWidth = 0.5 / zoom;
      // Border pattern
      ctx.strokeRect(-w / 2 + 4, -h / 2 + 4, w - 8, h - 8);
      ctx.strokeRect(-w / 2 + 8, -h / 2 + 8, w - 16, h - 16);
      // Center pattern
      ctx.fillStyle = '#D4A574';
      ctx.beginPath();
      ctx.arc(0, 0, Math.min(w, h) / 4, 0, Math.PI * 2);
      ctx.fill();
    } else if (type.startsWith('plant-')) {
      // Plant: round pot + foliage
      // Pot
      ctx.fillStyle = '#8B6F47';
      ctx.beginPath();
      ctx.ellipse(0, h / 4, w / 2, h / 4, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      // Foliage (green circles)
      ctx.fillStyle = '#4A7C2E';
      ctx.beginPath();
      ctx.arc(-w / 5, -h / 6, w / 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(w / 5, -h / 6, w / 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(0, -h / 3, w / 3, 0, Math.PI * 2);
      ctx.fill();
      // Outline
      ctx.strokeStyle = '#2D5016';
      ctx.beginPath();
      ctx.arc(-w / 5, -h / 6, w / 3, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(w / 5, -h / 6, w / 3, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(0, -h / 3, w / 3, 0, Math.PI * 2);
      ctx.stroke();
    } else if (type === 'sculpture') {
      // Sculpture: abstract shape
      ctx.beginPath();
      ctx.moveTo(-w / 3, h / 2);
      ctx.bezierCurveTo(-w / 2, 0, -w / 4, -h / 2, 0, -h / 3);
      ctx.bezierCurveTo(w / 4, -h / 2, w / 2, 0, w / 3, h / 2);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      // Base
      ctx.fillStyle = '#1F2937';
      ctx.fillRect(-w / 4, h / 2 - 2, w / 2, 4);
    } else if (type === 'wall-clock') {
      // Clock: circle with hands
      ctx.beginPath();
      ctx.arc(0, 0, w / 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      // Hour markers
      ctx.strokeStyle = '#1F2937';
      for (let i = 0; i < 12; i++) {
        const angle = (i / 12) * Math.PI * 2;
        ctx.beginPath();
        ctx.moveTo(Math.cos(angle) * w / 2.5, Math.sin(angle) * w / 2.5);
        ctx.lineTo(Math.cos(angle) * w / 2, Math.sin(angle) * w / 2);
        ctx.stroke();
      }
      // Hands (showing 10:10)
      ctx.lineWidth = 2 / zoom;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(-w / 5, w / 4);
      ctx.moveTo(0, 0);
      ctx.lineTo(w / 4, -w / 5);
      ctx.stroke();
    } else if (type === 'candle-set') {
      // Candles: 3 small circles
      for (let i = -1; i <= 1; i++) {
        ctx.fillStyle = '#FFC857';
        ctx.beginPath();
        ctx.arc(i * w / 4, 0, w / 8, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        // Flame
        ctx.fillStyle = '#FF6B35';
        ctx.beginPath();
        ctx.arc(i * w / 4, -w / 6, 1.5, 0, Math.PI * 2);
        ctx.fill();
      }
    } else if (type === 'book-stack') {
      // Books: stacked rectangles
      ctx.fillStyle = '#8B6F47';
      ctx.fillRect(-w / 2, -h / 2, w, h);
      ctx.strokeRect(-w / 2, -h / 2, w, h);
      // Book spines (different colors)
      const colors = ['#DC2626', '#3B82F6', '#10B981', '#FBBF24'];
      for (let i = 0; i < 4; i++) {
        ctx.fillStyle = colors[i];
        ctx.fillRect(-w / 2 + 1, -h / 2 + 1 + (i * h / 4), w - 2, h / 4 - 1);
        ctx.strokeRect(-w / 2 + 1, -h / 2 + 1 + (i * h / 4), w - 2, h / 4 - 1);
      }
    }
  }

  function drawWallFinish2D(ctx, item, w, h) {
    const type = item.type;
    const color = item.color || '#FAFAFA';
    ctx.fillStyle = color;
    ctx.fillRect(-w / 2, -h / 2, w, h);
    ctx.strokeStyle = '#64748B';
    ctx.lineWidth = 1 / zoom;
    ctx.strokeRect(-w / 2, -h / 2, w, h);

    if (type.startsWith('wall-paint-')) {
      // Paint: subtle texture or just solid color
      // Slight pattern based on color
      ctx.strokeStyle = 'rgba(0, 0, 0, 0.05)';
      ctx.lineWidth = 0.3 / zoom;
      for (let i = 0; i < 5; i++) {
        ctx.beginPath();
        ctx.moveTo(-w / 2 + Math.random() * w, -h / 2);
        ctx.lineTo(-w / 2 + Math.random() * w, h / 2);
        ctx.stroke();
      }
    } else if (type.startsWith('wallpaper-')) {
      // Wallpaper patterns
      ctx.strokeStyle = 'rgba(0, 0, 0, 0.3)';
      ctx.lineWidth = 0.5 / zoom;
      if (type === 'wallpaper-floral') {
        // Floral: scattered flower shapes
        ctx.fillStyle = '#E91E63';
        for (let i = 0; i < 8; i++) {
          const x = -w / 2 + (w / 4) * (i % 4);
          const y = -h / 2 + (h / 2) * Math.floor(i / 4);
          ctx.beginPath();
          ctx.arc(x, y, 3, 0, Math.PI * 2);
          ctx.fill();
        }
      } else if (type === 'wallpaper-geometric') {
        // Geometric: triangle pattern
        const size = 15;
        for (let x = -w / 2; x < w / 2; x += size) {
          for (let y = -h / 2; y < h / 2; y += size) {
            ctx.beginPath();
            ctx.moveTo(x, y);
            ctx.lineTo(x + size, y);
            ctx.lineTo(x + size / 2, y + size);
            ctx.closePath();
            ctx.stroke();
          }
        }
      } else if (type === 'wallpaper-stripe') {
        // Vertical stripes
        for (let x = -w / 2 + 10; x < w / 2; x += 20) {
          ctx.beginPath();
          ctx.moveTo(x, -h / 2);
          ctx.lineTo(x, h / 2);
          ctx.stroke();
        }
      } else if (type === 'wallpaper-brick') {
        // Brick pattern
        const brickW = 20;
        const brickH = 8;
        for (let y = -h / 2; y < h / 2; y += brickH) {
          const offset = (Math.floor(y / brickH) % 2) * brickW / 2;
          for (let x = -w / 2; x < w / 2; x += brickW) {
            ctx.strokeRect(x + offset, y, brickW - 1, brickH - 1);
          }
        }
      } else if (type === 'wallpaper-wood') {
        // Wood grain
        ctx.strokeStyle = 'rgba(91, 58, 26, 0.4)';
        for (let i = 0; i < 5; i++) {
          const y = -h / 2 + (h / 5) * i + Math.random() * 3;
          ctx.beginPath();
          ctx.moveTo(-w / 2, y);
          ctx.bezierCurveTo(-w / 4, y + 2, w / 4, y - 2, w / 2, y);
          ctx.stroke();
        }
      } else if (type === 'wallpaper-mural') {
        // Mural: landscape pattern
        ctx.fillStyle = '#3B82F6';
        ctx.fillRect(-w / 2, -h / 4, w, h / 2);
        ctx.fillStyle = '#10B981';
        ctx.fillRect(-w / 2, -h / 2, w, h / 4);
      }
    } else if (type.startsWith('wall-tile-')) {
      // Wall tiles: grid pattern
      ctx.strokeStyle = 'rgba(100, 116, 139, 0.4)';
      ctx.lineWidth = 0.5 / zoom;
      const tileSize = type === 'wall-tile-subway' ? 10 : type === 'wall-tile-mosaic' ? 5 : 25;
      if (type === 'wall-tile-subway') {
        // Subway (brick pattern)
        for (let y = -h / 2; y < h / 2; y += tileSize * 2) {
          const offset = (Math.floor(y / (tileSize * 2)) % 2) * tileSize;
          for (let x = -w / 2; x < w / 2; x += tileSize * 2) {
            ctx.strokeRect(x + offset, y, tileSize * 2 - 1, tileSize - 1);
          }
        }
      } else {
        // Grid tile
        for (let x = -w / 2 + tileSize; x < w / 2; x += tileSize) {
          ctx.beginPath();
          ctx.moveTo(x, -h / 2);
          ctx.lineTo(x, h / 2);
          ctx.stroke();
        }
        for (let y = -h / 2 + tileSize; y < h / 2; y += tileSize) {
          ctx.beginPath();
          ctx.moveTo(-w / 2, y);
          ctx.lineTo(w / 2, y);
          ctx.stroke();
        }
      }
    } else if (type === 'wall-marble') {
      // Marble: veins
      ctx.strokeStyle = 'rgba(120, 113, 108, 0.4)';
      ctx.lineWidth = 1 / zoom;
      for (let i = 0; i < 5; i++) {
        ctx.beginPath();
        ctx.moveTo(-w / 2 + Math.random() * w, -h / 2);
        ctx.bezierCurveTo(
          -w / 4 + Math.random() * w / 2, -h / 4,
          w / 4 + Math.random() * w / 2, h / 4,
          -w / 2 + Math.random() * w, h / 2
        );
        ctx.stroke();
      }
    } else if (type === 'wall-stone' || type === 'wall-brick-exposed') {
      // Stone/brick: irregular or regular pattern
      ctx.strokeStyle = 'rgba(0, 0, 0, 0.5)';
      ctx.lineWidth = 0.5 / zoom;
      if (type === 'wall-brick-exposed') {
        // Regular brick
        const bw = 20, bh = 8;
        for (let y = -h / 2; y < h / 2; y += bh) {
          const offset = (Math.floor(y / bh) % 2) * bw / 2;
          for (let x = -w / 2; x < w / 2; x += bw) {
            ctx.strokeRect(x + offset, y, bw - 1, bh - 1);
          }
        }
      } else {
        // Irregular stone
        for (let i = 0; i < 15; i++) {
          const x = -w / 2 + Math.random() * w;
          const y = -h / 2 + Math.random() * h;
          const sw = 10 + Math.random() * 15;
          const sh = 8 + Math.random() * 10;
          ctx.strokeRect(x, y, sw, sh);
        }
      }
    } else if (type === 'wall-wood-panel') {
      // Wood panel: vertical planks
      ctx.strokeStyle = 'rgba(91, 58, 26, 0.5)';
      ctx.lineWidth = 0.5 / zoom;
      for (let x = -w / 2 + 15; x < w / 2; x += 15) {
        ctx.beginPath();
        ctx.moveTo(x, -h / 2);
        ctx.lineTo(x, h / 2);
        ctx.stroke();
      }
    } else if (type === 'wall-3d-panel') {
      // 3D panel: geometric pattern
      ctx.strokeStyle = 'rgba(100, 116, 139, 0.5)';
      ctx.lineWidth = 1 / zoom;
      const size = 30;
      for (let x = -w / 2; x < w / 2; x += size) {
        for (let y = -h / 2; y < h / 2; y += size) {
          ctx.beginPath();
          ctx.moveTo(x, y);
          ctx.lineTo(x + size, y + size);
          ctx.moveTo(x + size, y);
          ctx.lineTo(x, y + size);
          ctx.stroke();
        }
      }
    } else if (type === 'wall-concrete-exposed') {
      // Concrete: subtle texture
      ctx.fillStyle = 'rgba(120, 113, 108, 0.3)';
      for (let i = 0; i < 20; i++) {
        const x = -w / 2 + Math.random() * w;
        const y = -h / 2 + Math.random() * h;
        ctx.beginPath();
        ctx.arc(x, y, 0.5, 0, Math.PI * 2);
        ctx.fill();
      }
    } else if (type === 'wall-wainscot') {
      // Wainscot: only bottom half decorated
      ctx.fillStyle = '#D4A574';
      ctx.fillRect(-w / 2, 0, w, h / 2);
      ctx.strokeStyle = 'rgba(91, 58, 26, 0.5)';
      ctx.lineWidth = 0.5 / zoom;
      // Vertical lines on bottom
      for (let x = -w / 2 + 15; x < w / 2; x += 15) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, h / 2);
        ctx.stroke();
      }
      // Border between top and bottom
      ctx.strokeStyle = '#5D3A1A';
      ctx.lineWidth = 2 / zoom;
      ctx.beginPath();
      ctx.moveTo(-w / 2, 0);
      ctx.lineTo(w / 2, 0);
      ctx.stroke();
    }
  }

  function drawKitchen2D(ctx, item, w, h) {
    const type = item.type;
    const color = item.color || '#8B6F47';
    ctx.fillStyle = color;
    ctx.strokeStyle = '#1F2937';
    ctx.lineWidth = 1 / zoom;

    if (type.startsWith('counter-')) {
      // Countertop variants
      ctx.fillRect(-w / 2, -h / 2, w, h);
      ctx.strokeRect(-w / 2, -h / 2, w, h);
      // Top surface (slightly different color for stone types)
      ctx.fillStyle = type === 'counter-granite' ? '#0F172A' :
                       type === 'counter-quartz' ? '#FAFAFA' :
                       type === 'counter-marble' ? '#F5F5DC' :
                       type === 'counter-wood-butcher' ? '#8B6F47' :
                       type === 'counter-stainless' ? '#9CA3AF' :
                       type === 'counter-concrete' ? '#A8A29E' :
                       color;
      ctx.fillRect(-w / 2, -h / 2, w, 4);
      // Pattern: L-shape indicator
      if (type === 'counter-l-shape' || type === 'counter-u-shape') {
        ctx.strokeStyle = '#1F2937';
        ctx.lineWidth = 1.5 / zoom;
        ctx.strokeRect(-w / 2 + 4, -h / 2 + 4, w - 8, h - 8);
        // Inner cutout (for U-shape)
        if (type === 'counter-u-shape') {
          ctx.fillStyle = '#FFFFFF';
          ctx.fillRect(-w / 4, -h / 4, w / 2, h / 2);
          ctx.strokeRect(-w / 4, -h / 4, w / 2, h / 2);
        }
      }
      // Grain for wood
      if (type === 'counter-wood-butcher') {
        ctx.strokeStyle = 'rgba(91, 58, 26, 0.4)';
        ctx.lineWidth = 0.5 / zoom;
        for (let x = -w / 2 + 10; x < w / 2; x += 10) {
          ctx.beginPath();
          ctx.moveTo(x, -h / 2);
          ctx.lineTo(x, h / 2);
          ctx.stroke();
        }
      }
      // Stainless steel reflection
      if (type === 'counter-stainless') {
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
        ctx.lineWidth = 0.5 / zoom;
        for (let i = 0; i < 3; i++) {
          ctx.beginPath();
          ctx.moveTo(-w / 2 + (w / 4) * i, -h / 2);
          ctx.lineTo(-w / 2 + (w / 4) * i + 10, h / 2);
          ctx.stroke();
        }
      }
      // Marble veins
      if (type === 'counter-marble') {
        ctx.strokeStyle = 'rgba(120, 113, 108, 0.4)';
        ctx.lineWidth = 0.5 / zoom;
        for (let i = 0; i < 3; i++) {
          ctx.beginPath();
          ctx.moveTo(-w / 2 + Math.random() * w, -h / 2);
          ctx.bezierCurveTo(
            -w / 4, -h / 4,
            w / 4, h / 4,
            w / 2 - Math.random() * w / 2, h / 2
          );
          ctx.stroke();
        }
      }
    } else if (type.startsWith('kitchen-island')) {
      // Kitchen island variants
      ctx.fillStyle = color;
      ctx.fillRect(-w / 2, -h / 2, w, h);
      ctx.strokeRect(-w / 2, -h / 2, w, h);
      // Top surface (countertop)
      ctx.fillStyle = '#374151';
      ctx.fillRect(-w / 2 + 3, -h / 2 + 3, w - 6, h - 6);
      ctx.strokeRect(-w / 2 + 3, -h / 2 + 3, w - 6, h - 6);

      // Special features
      if (type === 'kitchen-island-with-sink') {
        // Sink in middle
        ctx.fillStyle = '#9CA3AF';
        ctx.fillRect(-15, -10, 30, 20);
        ctx.strokeRect(-15, -10, 30, 20);
        // Cooktop
        ctx.fillStyle = '#1F2937';
        ctx.beginPath();
        ctx.arc(-w / 4, 0, 8, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(-w / 4 + 12, 0, 8, 0, Math.PI * 2);
        ctx.fill();
      }
      if (type === 'kitchen-island-breakfast' || type === 'kitchen-island-large') {
        // Breakfast bar overhang (extended top)
        ctx.fillStyle = '#5D3A1A';
        ctx.fillRect(-w / 2 - 8, h / 2 - 8, w + 16, 8);
        ctx.strokeRect(-w / 2 - 8, h / 2 - 8, w + 16, 8);
        // Stools indicator
        ctx.fillStyle = '#1F2937';
        for (let i = 0; i < 4; i++) {
          const x = -w / 2 + (w / 4) * (i + 0.5);
          ctx.beginPath();
          ctx.arc(x, h / 2 + 5, 4, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      if (type === 'kitchen-island-portable') {
        // Wheels
        ctx.fillStyle = '#1F2937';
        ctx.beginPath();
        ctx.arc(-w / 2 + 5, h / 2 - 2, 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(w / 2 - 5, h / 2 - 2, 3, 0, Math.PI * 2);
        ctx.fill();
      }
    } else if (type.startsWith('cabinet-')) {
      // Cabinets
      ctx.fillStyle = color;
      ctx.fillRect(-w / 2, -h / 2, w, h);
      ctx.strokeRect(-w / 2, -h / 2, w, h);
      // Door divisions (1-3 doors)
      const numDoors = w > 120 ? 3 : w > 60 ? 2 : 1;
      ctx.strokeStyle = '#5D3A1A';
      ctx.lineWidth = 1 / zoom;
      for (let i = 1; i < numDoors; i++) {
        const x = -w / 2 + (w / numDoors) * i;
        ctx.beginPath();
        ctx.moveTo(x, -h / 2);
        ctx.lineTo(x, h / 2);
        ctx.stroke();
      }
      // Handles
      ctx.fillStyle = '#1F2937';
      for (let i = 0; i < numDoors; i++) {
        const x = -w / 2 + (w / numDoors) * (i + 0.5);
        ctx.fillRect(x - 4, -h / 4, 8, 2);
      }
      // Glass front
      if (type === 'cabinet-glass-front') {
        ctx.fillStyle = 'rgba(190, 227, 248, 0.5)';
        ctx.fillRect(-w / 2 + 4, -h / 2 + 4, w - 8, h - 8);
        // Display items (shelves)
        ctx.strokeStyle = '#1F2937';
        ctx.lineWidth = 0.5 / zoom;
        ctx.beginPath();
        ctx.moveTo(-w / 2 + 4, 0);
        ctx.lineTo(w / 2 - 4, 0);
        ctx.stroke();
      }
      // Open shelf
      if (type === 'cabinet-open-shelf') {
        ctx.fillStyle = '#F5F5F5';
        ctx.fillRect(-w / 2 + 4, -h / 2 + 4, w - 8, h - 8);
        // Shelves
        ctx.strokeStyle = '#1F2937';
        ctx.lineWidth = 0.5 / zoom;
        ctx.beginPath();
        ctx.moveTo(-w / 2 + 4, 0);
        ctx.lineTo(w / 2 - 4, 0);
        ctx.stroke();
      }
      // Drawer (3 tiers)
      if (type === 'cabinet-drawer') {
        ctx.strokeStyle = '#1F2937';
        ctx.lineWidth = 1 / zoom;
        for (let i = 1; i < 3; i++) {
          const y = -h / 2 + (h / 3) * i;
          ctx.beginPath();
          ctx.moveTo(-w / 2, y);
          ctx.lineTo(w / 2, y);
          ctx.stroke();
        }
        // Handles
        ctx.fillStyle = '#1F2937';
        for (let i = 0; i < 3; i++) {
          ctx.fillRect(-4, -h / 2 + (h / 3) * (i + 0.5) - 1, 8, 2);
        }
      }
      // Corner cabinet
      if (type === 'cabinet-corner') {
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.moveTo(-w / 2, -h / 2);
        ctx.lineTo(w / 2, -h / 2);
        ctx.lineTo(w / 2, h / 2);
        ctx.lineTo(-h / 2, h / 2);
        ctx.lineTo(-w / 2, h / 2 - (w - h));
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
      }
    } else if (type.startsWith('stove-') || type === 'stove') {
      // Stove variants
      ctx.fillStyle = color;
      ctx.fillRect(-w / 2, -h / 2, w, h);
      ctx.strokeRect(-w / 2, -h / 2, w, h);
      // Burners (circles)
      ctx.fillStyle = '#374151';
      const numBurners = type === 'stove-range-90' ? 5 : type === 'stove-gas-2burner' || type === 'stove-induction' ? 2 : 4;
      const positions = [];
      if (numBurners === 2) {
        positions.push({ x: -w / 4, y: 0 }, { x: w / 4, y: 0 });
      } else if (numBurners === 4) {
        positions.push(
          { x: -w / 4, y: -h / 4 }, { x: w / 4, y: -h / 4 },
          { x: -w / 4, y: h / 4 }, { x: w / 4, y: h / 4 }
        );
      } else if (numBurners === 5) {
        positions.push(
          { x: -w / 3, y: -h / 4 }, { x: 0, y: -h / 4 }, { x: w / 3, y: -h / 4 },
          { x: -w / 4, y: h / 4 }, { x: w / 4, y: h / 4 }
        );
      }
      positions.forEach(p => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, Math.min(w, h) / 8, 0, Math.PI * 2);
        ctx.fill();
        // Inner ring
        ctx.fillStyle = '#1F2937';
        ctx.beginPath();
        ctx.arc(p.x, p.y, Math.min(w, h) / 16, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#374151';
      });
      // Knobs (for freestanding)
      if (type === 'stove-freestanding' || type === 'stove-range-90') {
        ctx.fillStyle = '#9CA3AF';
        for (let i = 0; i < 4; i++) {
          ctx.beginPath();
          ctx.arc(-w / 3 + i * w / 6, h / 2 - 4, 2, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    } else if (type.startsWith('range-hood') || type === 'range-hood') {
      // Range hood variants
      ctx.fillStyle = color;
      if (type === 'range-hood-chimney' || type === 'range-hood-island') {
        // Chimney: trapezoid
        ctx.beginPath();
        ctx.moveTo(-w / 2, -h / 2);
        ctx.lineTo(w / 2, -h / 2);
        ctx.lineTo(w / 3, h / 2);
        ctx.lineTo(-w / 3, h / 2);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        // Chimney pipe up
        ctx.fillRect(-w / 8, -h / 2 - 5, w / 4, 5);
        ctx.strokeRect(-w / 8, -h / 2 - 5, w / 4, 5);
      } else {
        // Standard under-cabinet hood
        ctx.beginPath();
        ctx.moveTo(-w / 2, -h / 2);
        ctx.lineTo(w / 2, -h / 2);
        ctx.lineTo(w / 2 - 5, h / 2);
        ctx.lineTo(-w / 2 + 5, h / 2);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
      }
      // Lights
      ctx.fillStyle = '#FFEB99';
      ctx.beginPath();
      ctx.arc(-w / 4, h / 4, 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(w / 4, h / 4, 2, 0, Math.PI * 2);
      ctx.fill();
    } else if (type === 'built-in-oven' || type === 'steam-oven' || type === 'microwave-built-in') {
      // Built-in oven/microwave
      ctx.fillStyle = color;
      ctx.fillRect(-w / 2, -h / 2, w, h);
      ctx.strokeRect(-w / 2, -h / 2, w, h);
      // Door (glass)
      ctx.fillStyle = '#1F2937';
      ctx.fillRect(-w / 2 + 4, -h / 2 + 4, w - 8, h - 8);
      // Handle
      ctx.fillStyle = '#9CA3AF';
      ctx.fillRect(-w / 2 + 4, h / 2 - 6, w - 8, 2);
      // Display
      if (type !== 'microwave-built-in') {
        ctx.fillStyle = '#10B981';
        ctx.fillRect(-w / 4, -h / 2 + 6, w / 2, 3);
      } else {
        // Microwave buttons
        ctx.fillStyle = '#9CA3AF';
        for (let i = 0; i < 4; i++) {
          ctx.fillRect(w / 2 - 8, -h / 4 + i * 4, 4, 2);
        }
      }
    } else if (type.startsWith('fridge-') || type === 'fridge') {
      // Fridge variants
      ctx.fillStyle = color;
      ctx.fillRect(-w / 2, -h / 2, w, h);
      ctx.strokeRect(-w / 2, -h / 2, w, h);
      // Door divisions
      if (type === 'fridge-side-by-side') {
        // Vertical divider
        ctx.beginPath();
        ctx.moveTo(0, -h / 2);
        ctx.lineTo(0, h / 2);
        ctx.stroke();
      } else if (type === 'fridge' || type === 'fridge-bottom-freezer') {
        // Horizontal divider (2 doors)
        const dividerY = type === 'fridge-bottom-freezer' ? h / 3 : -h / 5;
        ctx.beginPath();
        ctx.moveTo(-w / 2, dividerY);
        ctx.lineTo(w / 2, dividerY);
        ctx.stroke();
      }
      // Handle
      ctx.fillStyle = '#1F2937';
      ctx.fillRect(w / 2 - 5, -h / 4, 2, h / 2);
      // Water dispenser (side-by-side)
      if (type === 'fridge-side-by-side') {
        ctx.fillStyle = '#9CA3AF';
        ctx.fillRect(-w / 4, h / 4, w / 8, h / 4);
      }
      // Mini bar: glass front
      if (type === 'fridge-mini-bar') {
        ctx.fillStyle = 'rgba(190, 227, 248, 0.6)';
        ctx.fillRect(-w / 2 + 3, -h / 2 + 3, w - 6, h - 6);
      }
    } else if (type === 'wine-cooler-built-in') {
      // Wine cooler
      ctx.fillStyle = color;
      ctx.fillRect(-w / 2, -h / 2, w, h);
      ctx.strokeRect(-w / 2, -h / 2, w, h);
      // Glass door
      ctx.fillStyle = 'rgba(31, 41, 55, 0.7)';
      ctx.fillRect(-w / 2 + 3, -h / 2 + 3, w - 6, h - 6);
      // Wine bottle shelves (horizontal lines)
      ctx.strokeStyle = '#9CA3AF';
      ctx.lineWidth = 0.5 / zoom;
      for (let i = 1; i < 5; i++) {
        const y = -h / 2 + (h / 5) * i;
        ctx.beginPath();
        ctx.moveTo(-w / 2 + 3, y);
        ctx.lineTo(w / 2 - 3, y);
        ctx.stroke();
      }
    } else if (type.startsWith('sink-') || type === 'sink') {
      // Sink variants
      ctx.fillStyle = color;
      ctx.fillRect(-w / 2, -h / 2, w, h);
      ctx.strokeRect(-w / 2, -h / 2, w, h);
      // Bowl
      ctx.fillStyle = '#374151';
      if (type === 'sink-double-bowl' || type.includes('double')) {
        ctx.fillRect(-w / 2 + 4, -h / 2 + 4, w / 2 - 6, h - 8);
        ctx.fillRect(2, -h / 2 + 4, w / 2 - 6, h - 8);
      } else {
        ctx.fillRect(-w / 2 + 4, -h / 2 + 4, w - 8, h - 8);
      }
      // Drain
      ctx.fillStyle = '#1F2937';
      ctx.beginPath();
      ctx.arc(0, 0, 2, 0, Math.PI * 2);
      ctx.fill();
      // Farmhouse: apron front indicator
      if (type === 'sink-farmhouse') {
        ctx.strokeStyle = '#1F2937';
        ctx.lineWidth = 1 / zoom;
        ctx.strokeRect(-w / 2 + 2, h / 2 - 8, w - 4, 6);
      }
      // Faucet
      ctx.fillStyle = '#9CA3AF';
      ctx.fillRect(-2, -h / 2, 4, 6);
      if (type !== 'sink-prep') {
        // Gooseneck faucet
        ctx.beginPath();
        ctx.arc(0, -h / 2 + 6, 4, Math.PI, 0);
        ctx.stroke();
      }
    } else if (type.startsWith('pantry-') || type === 'pantry') {
      // Pantry variants
      ctx.fillStyle = color;
      ctx.fillRect(-w / 2, -h / 2, w, h);
      ctx.strokeRect(-w / 2, -h / 2, w, h);
      // Shelves (horizontal lines)
      ctx.strokeStyle = '#5D3A1A';
      ctx.lineWidth = 0.5 / zoom;
      const numShelves = 4;
      for (let i = 1; i < numShelves; i++) {
        const y = -h / 2 + (h / numShelves) * i;
        ctx.beginPath();
        ctx.moveTo(-w / 2, y);
        ctx.lineTo(w / 2, y);
        ctx.stroke();
      }
      // Walk-in pantry: outline + door
      if (type === 'pantry-walk-in') {
        ctx.strokeStyle = '#1F2937';
        ctx.lineWidth = 2 / zoom;
        ctx.strokeRect(-w / 2 + 5, -h / 2 + 5, w - 10, h - 10);
        // Door arc
        ctx.beginPath();
        ctx.arc(w / 2, h / 2, 15, Math.PI, Math.PI * 1.5);
        ctx.stroke();
      }
    } else if (type === 'dishwasher' || type === 'dishwasher-drawer') {
      // Dishwasher
      ctx.fillStyle = color;
      ctx.fillRect(-w / 2, -h / 2, w, h);
      ctx.strokeRect(-w / 2, -h / 2, w, h);
      // Door (front)
      ctx.fillStyle = '#9CA3AF';
      ctx.fillRect(-w / 2 + 3, -h / 2 + 3, w - 6, h - 6);
      // Control panel
      ctx.fillStyle = '#1F2937';
      ctx.fillRect(-w / 2 + 3, -h / 2 + 3, w - 6, 5);
      // Display
      ctx.fillStyle = '#10B981';
      ctx.fillRect(-w / 4, -h / 2 + 4, w / 2, 2);
      // Handle
      ctx.fillStyle = '#1F2937';
      ctx.fillRect(-w / 4, h / 2 - 8, w / 2, 2);
    } else if (type === 'coffee-machine-built-in') {
      // Coffee machine
      ctx.fillStyle = color;
      ctx.fillRect(-w / 2, -h / 2, w, h);
      ctx.strokeRect(-w / 2, -h / 2, w, h);
      // Display
      ctx.fillStyle = '#3B82F6';
      ctx.fillRect(-w / 2 + 3, -h / 2 + 3, w - 6, h / 4);
      // Spout
      ctx.fillStyle = '#9CA3AF';
      ctx.fillRect(-3, h / 4, 6, h / 4);
      // Cup indicator
      ctx.fillStyle = '#1F2937';
      ctx.fillRect(-8, h / 4 + 5, 16, 8);
    } else if (type === 'warming-drawer') {
      // Warming drawer
      ctx.fillStyle = color;
      ctx.fillRect(-w / 2, -h / 2, w, h);
      ctx.strokeRect(-w / 2, -h / 2, w, h);
      // Drawer front
      ctx.fillStyle = '#374151';
      ctx.fillRect(-w / 2 + 3, -h / 2 + 3, w - 6, h - 6);
      // Handle
      ctx.fillStyle = '#9CA3AF';
      ctx.fillRect(-w / 4, h / 4, w / 2, 3);
      // Heat indicator
      ctx.fillStyle = '#DC2626';
      ctx.beginPath();
      ctx.arc(w / 2 - 5, -h / 4, 1.5, 0, Math.PI * 2);
      ctx.fill();
    } else if (type === 'trash-pullout' || type === 'recycling-bin') {
      // Trash/recycling
      ctx.fillStyle = color;
      ctx.fillRect(-w / 2, -h / 2, w, h);
      ctx.strokeRect(-w / 2, -h / 2, w, h);
      // Compartments
      const numBins = type === 'recycling-bin' ? 3 : 2;
      ctx.strokeStyle = '#1F2937';
      ctx.lineWidth = 0.5 / zoom;
      for (let i = 1; i < numBins; i++) {
        const x = -w / 2 + (w / numBins) * i;
        ctx.beginPath();
        ctx.moveTo(x, -h / 2);
        ctx.lineTo(x, h / 2);
        ctx.stroke();
      }
      // Recycling symbol
      if (type === 'recycling-bin') {
        ctx.fillStyle = '#FFFFFF';
        ctx.font = `${Math.min(w, h) * 0.3}px Inter`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('♻️', 0, 0);
      }
    } else if (type.startsWith('dining-table-') || type === 'dining-table') {
      // Dining table variants
      ctx.fillStyle = color;
      if (type === 'dining-table-round') {
        // Round table
        ctx.beginPath();
        ctx.ellipse(0, 0, w / 2, h / 2, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      } else if (type === 'dining-table-marble' || type === 'dining-table-glass') {
        // Rectangular with special top
        ctx.fillRect(-w / 2, -h / 2, w, h);
        ctx.strokeRect(-w / 2, -h / 2, w, h);
        // Top finish
        ctx.fillStyle = type === 'dining-table-marble' ? '#F5F5DC' : 'rgba(190, 227, 248, 0.5)';
        ctx.fillRect(-w / 2 + 3, -h / 2 + 3, w - 6, h - 6);
        // Veins for marble
        if (type === 'dining-table-marble') {
          ctx.strokeStyle = 'rgba(120, 113, 108, 0.4)';
          ctx.lineWidth = 0.5 / zoom;
          for (let i = 0; i < 3; i++) {
            ctx.beginPath();
            ctx.moveTo(-w / 2 + Math.random() * w, -h / 2);
            ctx.bezierCurveTo(-w / 4, -h / 4, w / 4, h / 4, w / 2 - Math.random() * w / 2, h / 2);
            ctx.stroke();
          }
        }
      } else if (type === 'dining-table-extendable') {
        // Extendable: show extension lines
        ctx.fillRect(-w / 2, -h / 2, w, h);
        ctx.strokeRect(-w / 2, -h / 2, w, h);
        // Extension seams
        ctx.strokeStyle = '#5D3A1A';
        ctx.lineWidth = 1 / zoom;
        ctx.beginPath();
        ctx.moveTo(-w / 4, -h / 2);
        ctx.lineTo(-w / 4, h / 2);
        ctx.moveTo(w / 4, -h / 2);
        ctx.lineTo(w / 4, h / 2);
        ctx.stroke();
      } else {
        // Standard rectangular
        ctx.fillRect(-w / 2, -h / 2, w, h);
        ctx.strokeRect(-w / 2, -h / 2, w, h);
      }
    } else if (type === 'bar-counter' || type === 'bistro-table') {
      // Bar counter / bistro table (taller)
      ctx.fillStyle = color;
      if (type === 'bistro-table') {
        // Round
        ctx.beginPath();
        ctx.ellipse(0, 0, w / 2, h / 2, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      } else {
        // Bar counter rectangle
        ctx.fillRect(-w / 2, -h / 2, w, h);
        ctx.strokeRect(-w / 2, -h / 2, w, h);
        // Top edge
        ctx.fillStyle = '#374151';
        ctx.fillRect(-w / 2, -h / 2, w, 4);
      }
    } else if (type === 'breakfast-nook') {
      // Breakfast nook: L-shape with bench
      ctx.fillStyle = color;
      ctx.fillRect(-w / 2, -h / 2, w, h);
      ctx.strokeRect(-w / 2, -h / 2, w, h);
      // Bench along back
      ctx.fillStyle = '#5D3A1A';
      ctx.fillRect(-w / 2, -h / 2, w, h / 3);
      ctx.strokeRect(-w / 2, -h / 2, w, h / 3);
      // Table indicator
      ctx.strokeStyle = '#1F2937';
      ctx.lineWidth = 0.5 / zoom;
      ctx.strokeRect(-w / 2 + 4, h / 6, w - 8, h / 3);
    } else if (type === 'bar-stool' || type === 'bar-stool-swivel' || type === 'chair' || type === 'chair-upholstered' || type === 'bench-dining') {
      // Chair/stool variants
      ctx.fillStyle = color;
      if (type === 'bench-dining') {
        // Bench: long rectangle
        ctx.fillRect(-w / 2, -h / 2, w, h);
        ctx.strokeRect(-w / 2, -h / 2, w, h);
        // Cushion lines
        ctx.strokeStyle = 'rgba(0,0,0,0.3)';
        ctx.lineWidth = 0.5 / zoom;
        for (let i = 1; i < 4; i++) {
          const x = -w / 2 + (w / 4) * i;
          ctx.beginPath();
          ctx.moveTo(x, -h / 2);
          ctx.lineTo(x, h / 2);
          ctx.stroke();
        }
      } else {
        // Round/seat shape
        ctx.beginPath();
        ctx.ellipse(0, 0, w / 2, h / 2, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        // Back rest for swivel/upholstered
        if (type === 'bar-stool-swivel' || type === 'chair-upholstered') {
          ctx.fillStyle = type === 'chair-upholstered' ? '#7C2D12' : '#1F2937';
          ctx.fillRect(-w / 2, -h / 2, w, h / 4);
          ctx.strokeRect(-w / 2, -h / 2, w, h / 4);
        }
      }
    } else if (type === 'butcher-block-table' || type === 'prep-table' || type === 'baking-table') {
      // Prep tables
      ctx.fillStyle = color;
      ctx.fillRect(-w / 2, -h / 2, w, h);
      ctx.strokeRect(-w / 2, -h / 2, w, h);
      // Top finish
      if (type === 'prep-table') {
        // Stainless top
        ctx.fillStyle = '#9CA3AF';
        ctx.fillRect(-w / 2, -h / 2, w, 4);
        // Reflection
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
        ctx.lineWidth = 0.5 / zoom;
        ctx.beginPath();
        ctx.moveTo(-w / 3, -h / 2);
        ctx.lineTo(-w / 3 + 8, -h / 2);
        ctx.stroke();
      } else if (type === 'baking-table') {
        // Marble top
        ctx.fillStyle = '#F5F5DC';
        ctx.fillRect(-w / 2, -h / 2, w, 4);
        // Veins
        ctx.strokeStyle = 'rgba(120, 113, 108, 0.5)';
        ctx.lineWidth = 0.5 / zoom;
        ctx.beginPath();
        ctx.moveTo(-w / 2, -h / 2 + 2);
        ctx.bezierCurveTo(-w / 4, -h / 2, w / 4, -h / 2 + 4, w / 2, -h / 2 + 2);
        ctx.stroke();
      } else {
        // Butcher block: wood grain
        ctx.fillStyle = '#5D3A1A';
        ctx.fillRect(-w / 2, -h / 2, w, 4);
        ctx.strokeStyle = 'rgba(91, 58, 26, 0.4)';
        ctx.lineWidth = 0.5 / zoom;
        for (let x = -w / 2 + 10; x < w / 2; x += 10) {
          ctx.beginPath();
          ctx.moveTo(x, -h / 2);
          ctx.lineTo(x, h / 2);
          ctx.stroke();
        }
      }
    } else if (type === 'kitchen-backsplash') {
      // Backsplash: thin tall panel
      ctx.fillStyle = color;
      ctx.fillRect(-w / 2, -h / 2, w, h);
      ctx.strokeStyle = '#1F2937';
      ctx.lineWidth = 1 / zoom;
      ctx.strokeRect(-w / 2, -h / 2, w, h);
      // Subway tile pattern
      ctx.strokeStyle = 'rgba(100, 116, 139, 0.4)';
      ctx.lineWidth = 0.5 / zoom;
      const tileW = 10, tileH = 5;
      for (let y = -h / 2; y < h / 2; y += tileH) {
        const offset = (Math.floor(y / tileH) % 2) * tileW / 2;
        for (let x = -w / 2; x < w / 2; x += tileW) {
          ctx.strokeRect(x + offset, y, tileW - 0.5, tileH - 0.5);
        }
      }
    } else if (type === 'kitchen-rail-suspended' || type === 'pot-rack') {
      // Suspended rail / pot rack
      ctx.fillStyle = color;
      ctx.fillRect(-w / 2, -h / 2, w, h);
      ctx.strokeStyle = '#1F2937';
      ctx.lineWidth = 1 / zoom;
      ctx.strokeRect(-w / 2, -h / 2, w, h);
      // Hooks with pots
      ctx.strokeStyle = '#9CA3AF';
      ctx.lineWidth = 1 / zoom;
      const numHooks = Math.floor(w / 15);
      for (let i = 0; i < numHooks; i++) {
        const x = -w / 2 + (w / numHooks) * (i + 0.5);
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, h / 4);
        ctx.stroke();
        // Pot (circle)
        ctx.fillStyle = '#1F2937';
        ctx.beginPath();
        ctx.arc(x, h / 4 + 3, 3, 0, Math.PI * 2);
        ctx.fill();
      }
    } else if (type === 'spice-rack') {
      // Spice rack
      ctx.fillStyle = color;
      ctx.fillRect(-w / 2, -h / 2, w, h);
      ctx.strokeStyle = '#1F2937';
      ctx.lineWidth = 1 / zoom;
      ctx.strokeRect(-w / 2, -h / 2, w, h);
      // Spice jars
      ctx.fillStyle = '#D4A574';
      const numJars = Math.floor(w / 6);
      for (let i = 0; i < numJars; i++) {
        const x = -w / 2 + (w / numJars) * (i + 0.5);
        ctx.fillRect(x - 1.5, -h / 4, 3, h / 2);
        ctx.strokeRect(x - 1.5, -h / 4, 3, h / 2);
      }
    } else if (type === 'shelf-floating') {
      // Floating shelf
      ctx.fillStyle = color;
      ctx.fillRect(-w / 2, -h / 2, w, h);
      ctx.strokeRect(-w / 2, -h / 2, w, h);
      // Items on shelf
      ctx.fillStyle = '#FBBF24';
      ctx.fillRect(-w / 3, -h / 2 + 1, 5, h - 2);
      ctx.fillStyle = '#3B82F6';
      ctx.fillRect(-w / 6, -h / 2 + 1, 5, h - 2);
      ctx.fillStyle = '#10B981';
      ctx.fillRect(w / 8, -h / 2 + 1, 5, h - 2);
    } else if (type === 'kitchen-utensil-holder' || type === 'kitchen-knife-block') {
      // Utensil holder / knife block
      ctx.fillStyle = color;
      ctx.fillRect(-w / 2, -h / 2, w, h);
      ctx.strokeRect(-w / 2, -h / 2, w, h);
      if (type === 'kitchen-utensil-holder') {
        // Utensils sticking out
        ctx.strokeStyle = '#9CA3AF';
        ctx.lineWidth = 1 / zoom;
        ctx.beginPath();
        ctx.moveTo(-w / 4, -h / 2);
        ctx.lineTo(-w / 4, -h / 2 - 5);
        ctx.moveTo(0, -h / 2);
        ctx.lineTo(0, -h / 2 - 8);
        ctx.moveTo(w / 4, -h / 2);
        ctx.lineTo(w / 4, -h / 2 - 6);
        ctx.stroke();
      } else {
        // Knife slots
        ctx.fillStyle = '#1F2937';
        for (let i = 0; i < 5; i++) {
          ctx.fillRect(-w / 3 + i * (w / 7), -h / 2 + 2, 1, h - 4);
        }
      }
    } else if (type === 'kitchen-cutting-board') {
      // Cutting board
      ctx.fillStyle = color;
      ctx.fillRect(-w / 2, -h / 2, w, h);
      ctx.strokeRect(-w / 2, -h / 2, w, h);
      // Wood grain
      ctx.strokeStyle = 'rgba(91, 58, 26, 0.5)';
      ctx.lineWidth = 0.5 / zoom;
      for (let i = 0; i < 3; i++) {
        const y = -h / 2 + (h / 4) * (i + 1);
        ctx.beginPath();
        ctx.moveTo(-w / 2, y);
        ctx.bezierCurveTo(-w / 4, y + 2, w / 4, y - 2, w / 2, y);
        ctx.stroke();
      }
      // Handle hole
      ctx.fillStyle = '#1F2937';
      ctx.beginPath();
      ctx.arc(-w / 2 + 5, 0, 1.5, 0, Math.PI * 2);
      ctx.fill();
    } else if (type === 'kitchen-fruit-basket' || type === 'kitchen-spice-jars') {
      // Fruit basket / spice jars
      ctx.fillStyle = color;
      ctx.fillRect(-w / 2, -h / 2, w, h);
      ctx.strokeRect(-w / 2, -h / 2, w, h);
      if (type === 'kitchen-fruit-basket') {
        // Fruits (colored circles)
        const colors = ['#DC2626', '#FBBF24', '#10B981', '#F97316'];
        for (let i = 0; i < 4; i++) {
          ctx.fillStyle = colors[i];
          ctx.beginPath();
          ctx.arc(-w / 4 + (w / 4) * (i % 2), -h / 4 + (h / 4) * Math.floor(i / 2), 3, 0, Math.PI * 2);
          ctx.fill();
        }
      } else {
        // Spice jars
        ctx.fillStyle = '#D4A574';
        for (let i = 0; i < 4; i++) {
          const x = -w / 2 + (w / 4) * (i + 0.5);
          ctx.fillRect(x - 2, -h / 2 + 2, 4, h - 4);
          ctx.strokeRect(x - 2, -h / 2 + 2, 4, h - 4);
        }
      }
    } else if (type === 'kitchen-mixer' || type === 'kitchen-blender' || type === 'kitchen-toaster' || type === 'kitchen-coffee-maker' || type === 'kitchen-kettle' || type === 'kitchen-rice-cooker' || type === 'kitchen-water-dispenser-portable') {
      // Small appliances: rectangle with detail
      ctx.fillStyle = color;
      ctx.fillRect(-w / 2, -h / 2, w, h);
      ctx.strokeRect(-w / 2, -h / 2, w, h);
      // Specific details
      if (type === 'kitchen-mixer') {
        // Mixer: bowl + arm
        ctx.fillStyle = '#9CA3AF';
        ctx.beginPath();
        ctx.ellipse(0, h / 4, w / 3, h / 4, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      } else if (type === 'kitchen-blender') {
        // Blender: jar + base
        ctx.fillStyle = 'rgba(190, 227, 248, 0.6)';
        ctx.fillRect(-w / 4, -h / 2 + 2, w / 2, h * 2 / 3);
        ctx.strokeRect(-w / 4, -h / 2 + 2, w / 2, h * 2 / 3);
      } else if (type === 'kitchen-toaster') {
        // Toaster: 2 slots
        ctx.fillStyle = '#374151';
        ctx.fillRect(-w / 3, -h / 2 + 2, w / 6, 2);
        ctx.fillRect(w / 6, -h / 2 + 2, w / 6, 2);
      } else if (type === 'kitchen-coffee-maker') {
        // Coffee maker: pot + reservoir
        ctx.fillStyle = '#1F2937';
        ctx.fillRect(-w / 4, h / 4, w / 2, h / 3);
      } else if (type === 'kitchen-kettle') {
        // Kettle: round body + spout
        ctx.beginPath();
        ctx.ellipse(0, 0, w / 3, h / 3, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        // Spout
        ctx.beginPath();
        ctx.moveTo(w / 3, -h / 6);
        ctx.lineTo(w / 2, -h / 2);
        ctx.stroke();
      } else if (type === 'kitchen-rice-cooker') {
        // Rice cooker: round + lid
        ctx.beginPath();
        ctx.ellipse(0, 0, w / 2.5, h / 2.5, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        // Lid line
        ctx.beginPath();
        ctx.moveTo(-w / 3, -h / 4);
        ctx.lineTo(w / 3, -h / 4);
        ctx.stroke();
      } else if (type === 'kitchen-water-dispenser-portable') {
        // Dispenser: 2 taps
        ctx.fillStyle = '#DC2626';
        ctx.beginPath();
        ctx.arc(-w / 4, h / 4, 1.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#3B82F6';
        ctx.beginPath();
        ctx.arc(w / 4, h / 4, 1.5, 0, Math.PI * 2);
        ctx.fill();
      }
    } else if (type === 'water-faucet-pullout' || type === 'water-faucet-gooseneck') {
      // Faucet
      ctx.fillStyle = color;
      // Base
      ctx.fillRect(-3, -h / 2, 6, h / 4);
      // Neck
      ctx.fillRect(-1, -h / 2 + h / 4, 2, h / 2 - h / 4);
      // Spout (curve)
      ctx.strokeStyle = color;
      ctx.lineWidth = 2 / zoom;
      ctx.beginPath();
      if (type === 'water-faucet-gooseneck') {
        // High arc
        ctx.moveTo(0, -h / 2 + h / 4);
        ctx.bezierCurveTo(-w / 3, -h / 2 - 2, w / 3, -h / 2 - 2, w / 2, -h / 2 + h / 4);
      } else {
        // Pull-out (lower arc)
        ctx.moveTo(0, -h / 2 + h / 4);
        ctx.bezierCurveTo(0, -h / 2 - 3, w / 4, -h / 2 - 3, w / 3, -h / 2 + 2);
      }
      ctx.stroke();
      // Handle
      ctx.fillStyle = '#1F2937';
      ctx.fillRect(-4, -h / 2 - 2, 8, 2);
    } else if (type === 'kitchen-range-hood-downdraft') {
      // Downdraft vent
      ctx.fillStyle = color;
      ctx.fillRect(-w / 2, -h / 2, w, h);
      ctx.strokeRect(-w / 2, -h / 2, w, h);
      // Vent slats
      ctx.strokeStyle = '#1F2937';
      ctx.lineWidth = 0.5 / zoom;
      for (let i = 0; i < 5; i++) {
        const y = -h / 2 + (h / 6) * (i + 1);
        ctx.beginPath();
        ctx.moveTo(-w / 2 + 2, y);
        ctx.lineTo(w / 2 - 2, y);
        ctx.stroke();
      }
    } else if (type === 'kitchen-air-purifier') {
      // Air purifier
      ctx.fillStyle = color;
      ctx.fillRect(-w / 2, -h / 2, w, h);
      ctx.strokeRect(-w / 2, -h / 2, w, h);
      // Display
      ctx.fillStyle = '#10B981';
      ctx.fillRect(-w / 4, -h / 2 + 3, w / 2, 3);
      // Vent grilles
      ctx.strokeStyle = '#9CA3AF';
      ctx.lineWidth = 0.5 / zoom;
      for (let i = 0; i < 4; i++) {
        const y = -h / 4 + (h / 8) * i;
        ctx.beginPath();
        ctx.moveTo(-w / 2 + 3, y);
        ctx.lineTo(w / 2 - 3, y);
        ctx.stroke();
      }
    } else {
      // Default kitchen item: rectangle with icon
      ctx.fillStyle = color;
      ctx.fillRect(-w / 2, -h / 2, w, h);
      ctx.strokeRect(-w / 2, -h / 2, w, h);
    }
  }

  // ============= BEDROOM 2D RENDERING =============
  function drawBedroom2D(ctx, item, w, h) {
    const type = item.type;
    const color = item.color || '#8B7355';
    ctx.fillStyle = color;
    ctx.strokeStyle = '#1F2937';
    ctx.lineWidth = 1 / zoom;

    if (type === 'bed' || type === 'bed-king' || type === 'single-bed') {
      // Bed: rectangle with mattress, pillow(s), headboard
      // Headboard
      ctx.fillStyle = '#5D3A1A';
      ctx.fillRect(-w / 2, -h / 2, w, h / 8);
      ctx.strokeRect(-w / 2, -h / 2, w, h / 8);
      // Mattress
      ctx.fillStyle = '#FAFAFA';
      ctx.fillRect(-w / 2, -h / 2 + h / 8, w, h * 7 / 8);
      ctx.strokeRect(-w / 2, -h / 2 + h / 8, w, h * 7 / 8);
      // Pillows
      ctx.fillStyle = '#FFFFFF';
      const pillowCount = type === 'single-bed' ? 1 : type === 'bed-king' ? 3 : 2;
      const pillowW = (w / pillowCount) - 6;
      for (let i = 0; i < pillowCount; i++) {
        const px = -w / 2 + 3 + (pillowW + 6) * i;
        ctx.fillRect(px, -h / 2 + h / 8 + 3, pillowW, h / 5);
        ctx.strokeRect(px, -h / 2 + h / 8 + 3, pillowW, h / 5);
      }
      // Blanket line
      ctx.strokeStyle = '#9CA3AF';
      ctx.lineWidth = 1 / zoom;
      ctx.beginPath();
      ctx.moveTo(-w / 2, h / 4);
      ctx.lineTo(w / 2, h / 4);
      ctx.stroke();
    } else if (type === 'bunk-bed') {
      // Bunk bed: two mattresses stacked in 2D (show side view)
      ctx.fillStyle = '#5D3A1A';
      ctx.fillRect(-w / 2, -h / 2, w, h);
      ctx.strokeRect(-w / 2, -h / 2, w, h);
      // Top mattress
      ctx.fillStyle = '#FAFAFA';
      ctx.fillRect(-w / 2 + 3, -h / 2 + 3, w - 6, h / 3 - 6);
      ctx.strokeRect(-w / 2 + 3, -h / 2 + 3, w - 6, h / 3 - 6);
      // Bottom mattress
      ctx.fillRect(-w / 2 + 3, h / 6, w - 6, h / 3 - 6);
      ctx.strokeRect(-w / 2 + 3, h / 6, w - 6, h / 3 - 6);
      // Ladder
      ctx.strokeStyle = '#3D3D3D';
      ctx.lineWidth = 1.5 / zoom;
      ctx.beginPath();
      ctx.moveTo(w / 2 - 4, -h / 2 + h / 3);
      ctx.lineTo(w / 2 - 4, h / 2 - h / 6);
      ctx.moveTo(w / 2 - 10, -h / 2 + h / 3 + h / 6);
      ctx.lineTo(w / 2 - 10, h / 2 - h / 6);
      ctx.stroke();
      // Rungs
      for (let i = 0; i < 3; i++) {
        const y = -h / 2 + h / 3 + (h / 6) * (i + 1);
        ctx.beginPath();
        ctx.moveTo(w / 2 - 10, y);
        ctx.lineTo(w / 2 - 4, y);
        ctx.stroke();
      }
    } else if (type === 'wardrobe' || type === 'walk-in-closet') {
      // Wardrobe: tall cabinet with doors
      ctx.fillStyle = color;
      ctx.fillRect(-w / 2, -h / 2, w, h);
      ctx.strokeRect(-w / 2, -h / 2, w, h);
      // Door divisions
      const numDoors = type === 'walk-in-closet' ? (w > 120 ? 4 : 3) : (w > 100 ? 3 : 2);
      ctx.strokeStyle = '#3D3D3D';
      ctx.lineWidth = 1.5 / zoom;
      for (let i = 1; i < numDoors; i++) {
        const x = -w / 2 + (w / numDoors) * i;
        ctx.beginPath();
        ctx.moveTo(x, -h / 2);
        ctx.lineTo(x, h / 2);
        ctx.stroke();
      }
      // Handles
      ctx.fillStyle = '#9CA3AF';
      for (let i = 0; i < numDoors; i++) {
        const x = -w / 2 + (w / numDoors) * (i + 0.5);
        ctx.fillRect(x - 2, -2, 4, 4);
      }
      // Walk-in closet: hanging rod indicator
      if (type === 'walk-in-closet') {
        ctx.strokeStyle = '#6B7280';
        ctx.lineWidth = 0.5 / zoom;
        ctx.setLineDash([3, 3]);
        ctx.beginPath();
        ctx.moveTo(-w / 2 + 4, 0);
        ctx.lineTo(w / 2 - 4, 0);
        ctx.stroke();
        ctx.setLineDash([]);
      }
    } else if (type === 'nightstand') {
      // Nightstand: small box with drawer
      ctx.fillStyle = color;
      ctx.fillRect(-w / 2, -h / 2, w, h);
      ctx.strokeRect(-w / 2, -h / 2, w, h);
      // Drawer line
      ctx.strokeStyle = '#3D3D3D';
      ctx.lineWidth = 1 / zoom;
      ctx.beginPath();
      ctx.moveTo(-w / 2, 0);
      ctx.lineTo(w / 2, 0);
      ctx.stroke();
      // Handle
      ctx.fillStyle = '#9CA3AF';
      ctx.fillRect(-3, h / 4 - 1, 6, 2);
    } else if (type === 'dresser') {
      // Dresser: box with multiple drawers
      ctx.fillStyle = color;
      ctx.fillRect(-w / 2, -h / 2, w, h);
      ctx.strokeRect(-w / 2, -h / 2, w, h);
      // Drawer divisions (3 rows)
      ctx.strokeStyle = '#3D3D3D';
      ctx.lineWidth = 1 / zoom;
      const drawers = w > 80 ? 3 : 2;
      // Horizontal lines
      for (let i = 1; i < drawers; i++) {
        const y = -h / 2 + (h / drawers) * i;
        ctx.beginPath();
        ctx.moveTo(-w / 2, y);
        ctx.lineTo(w / 2, y);
        ctx.stroke();
      }
      // Vertical lines (split each row in 2)
      ctx.beginPath();
      ctx.moveTo(0, -h / 2);
      ctx.lineTo(0, h / 2);
      ctx.stroke();
      // Handles
      ctx.fillStyle = '#9CA3AF';
      for (let r = 0; r < drawers; r++) {
        const y = -h / 2 + (h / drawers) * (r + 0.5);
        ctx.fillRect(-w / 4 - 3, y - 1, 6, 2);
        ctx.fillRect(w / 4 - 3, y - 1, 6, 2);
      }
    } else if (type === 'desk') {
      // Desk: top surface with legs
      ctx.fillStyle = color;
      ctx.fillRect(-w / 2, -h / 2, w, h);
      ctx.strokeRect(-w / 2, -h / 2, w, h);
      // Drawer compartment on one side
      ctx.fillStyle = '#5D3A1A';
      const drawerW = w / 3;
      ctx.fillRect(w / 2 - drawerW, -h / 2 + 3, drawerW - 3, h - 6);
      ctx.strokeRect(w / 2 - drawerW, -h / 2 + 3, drawerW - 3, h - 6);
      // Drawer lines
      ctx.strokeStyle = '#3D3D3D';
      ctx.lineWidth = 0.5 / zoom;
      for (let i = 1; i < 3; i++) {
        const y = -h / 2 + 3 + ((h - 6) / 3) * i;
        ctx.beginPath();
        ctx.moveTo(w / 2 - drawerW, y);
        ctx.lineTo(w / 2 - 3, y);
        ctx.stroke();
      }
      // Handles
      ctx.fillStyle = '#9CA3AF';
      for (let i = 0; i < 3; i++) {
        const y = -h / 2 + 3 + ((h - 6) / 3) * (i + 0.5);
        ctx.fillRect(w / 2 - drawerW / 2 - 3, y - 1, 6, 2);
      }
    } else if (type === 'vanity-table') {
      // Vanity table: desk with mirror
      ctx.fillStyle = color;
      ctx.fillRect(-w / 2, -h / 2, w, h);
      ctx.strokeRect(-w / 2, -h / 2, w, h);
      // Mirror (oval at back)
      ctx.fillStyle = 'rgba(190, 227, 248, 0.5)';
      ctx.beginPath();
      ctx.ellipse(0, -h / 2 - h / 6, w / 3, h / 4, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      // Drawers on sides
      ctx.fillStyle = '#5D3A1A';
      ctx.fillRect(-w / 2 + 3, -h / 2 + 3, w / 4 - 3, h - 6);
      ctx.strokeRect(-w / 2 + 3, -h / 2 + 3, w / 4 - 3, h - 6);
      ctx.fillRect(w / 4, -h / 2 + 3, w / 4 - 3, h - 6);
      ctx.strokeRect(w / 4, -h / 2 + 3, w / 4 - 3, h - 6);
      // Handles
      ctx.fillStyle = '#9CA3AF';
      ctx.fillRect(-w / 2 + w / 8 - 2, -2, 4, 4);
      ctx.fillRect(w / 2 - w / 8 - 2, -2, 4, 4);
    } else if (type === 'chaise-longue') {
      // Chaise longue: elongated curved seat
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.moveTo(-w / 2, -h / 2 + h / 4);
      ctx.lineTo(-w / 2 + w / 4, -h / 2);
      ctx.lineTo(w / 2, -h / 2);
      ctx.lineTo(w / 2, h / 2);
      ctx.lineTo(-w / 2, h / 2);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      // Backrest curve
      ctx.fillStyle = '#5D3A1A';
      ctx.beginPath();
      ctx.moveTo(-w / 2, -h / 2 + h / 4);
      ctx.lineTo(-w / 2 + w / 4, -h / 2);
      ctx.lineTo(-w / 2 + w / 4, h / 2);
      ctx.lineTo(-w / 2, h / 2);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      // Seat cushion division
      ctx.strokeStyle = '#3D3D3D';
      ctx.lineWidth = 0.5 / zoom;
      ctx.beginPath();
      ctx.moveTo(-w / 2 + w / 4, 0);
      ctx.lineTo(w / 2, 0);
      ctx.stroke();
    } else {
      // Default bedroom item
      ctx.fillStyle = color;
      ctx.fillRect(-w / 2, -h / 2, w, h);
      ctx.strokeRect(-w / 2, -h / 2, w, h);
    }
  }

  // ============= DOOR & WINDOW 2D RENDERING =============
  function drawDoor2D(ctx, item, w, h) {
    const type = item.type;
    const color = item.color || '#8B6F47';
    ctx.fillStyle = color;
    ctx.strokeStyle = '#1F2937';
    ctx.lineWidth = 1 / zoom;

    // Determine if window or door
    const isWindow = type === 'window' || type.startsWith('window-') || type === 'skylight' || type === 'louver-window';

    if (isWindow) {
      // Window: frame with glass
      ctx.fillStyle = '#5D3A1A';
      ctx.fillRect(-w / 2, -h / 2, w, h);
      ctx.strokeRect(-w / 2, -h / 2, w, h);
      // Glass
      ctx.fillStyle = 'rgba(190, 227, 248, 0.5)';
      ctx.fillRect(-w / 2 + 3, -h / 2 + 3, w - 6, h - 6);
      // Frame divisions
      ctx.strokeStyle = '#3D3D3D';
      ctx.lineWidth = 1 / zoom;
      if (type === 'window-large' || type === 'window-twin' || type === 'window-triple') {
        const panes = type === 'window-triple' ? 3 : type === 'window-twin' ? 2 : 2;
        for (let i = 1; i < panes; i++) {
          const x = -w / 2 + (w / panes) * i;
          ctx.beginPath();
          ctx.moveTo(x, -h / 2 + 3);
          ctx.lineTo(x, h / 2 - 3);
          ctx.stroke();
        }
      } else if (type === 'window-bay') {
        // Bay window: angled segments
        ctx.strokeStyle = '#3D3D3D';
        ctx.lineWidth = 1.5 / zoom;
        ctx.beginPath();
        ctx.moveTo(-w / 4, -h / 2 + 3);
        ctx.lineTo(-w / 4, h / 2 - 3);
        ctx.moveTo(w / 4, -h / 2 + 3);
        ctx.lineTo(w / 4, h / 2 - 3);
        ctx.stroke();
      } else if (type === 'window-awning' || type === 'window-casement' || type === 'window-horizontal-sliding' || type === 'window-sliding') {
        // Horizontal division
        ctx.beginPath();
        ctx.moveTo(-w / 2 + 3, 0);
        ctx.lineTo(w / 2 - 3, 0);
        ctx.stroke();
      } else if (type === 'window-jengki') {
        // Jengki: classic Indonesian style with grid
        ctx.beginPath();
        ctx.moveTo(0, -h / 2 + 3);
        ctx.lineTo(0, h / 2 - 3);
        ctx.moveTo(-w / 2 + 3, 0);
        ctx.lineTo(w / 2 - 3, 0);
        ctx.stroke();
      } else if (type === 'window-glass-block') {
        // Glass block: grid pattern
        const cols = Math.floor(w / 12);
        const rows = Math.floor(h / 12);
        for (let i = 1; i < cols; i++) {
          const x = -w / 2 + (w / cols) * i;
          ctx.beginPath();
          ctx.moveTo(x, -h / 2 + 3);
          ctx.lineTo(x, h / 2 - 3);
          ctx.stroke();
        }
        for (let j = 1; j < rows; j++) {
          const y = -h / 2 + (h / rows) * j;
          ctx.beginPath();
          ctx.moveTo(-w / 2 + 3, y);
          ctx.lineTo(w / 2 - 3, y);
          ctx.stroke();
        }
      } else if (type === 'louver-window') {
        // Louver: horizontal slats
        ctx.strokeStyle = '#3D3D3D';
        ctx.lineWidth = 0.5 / zoom;
        for (let y = -h / 2 + 5; y < h / 2 - 5; y += 4) {
          ctx.beginPath();
          ctx.moveTo(-w / 2 + 3, y);
          ctx.lineTo(w / 2 - 3, y);
          ctx.stroke();
        }
      } else if (type === 'skylight') {
        // Skylight: simple square with diagonal cross
        ctx.strokeStyle = '#3D3D3D';
        ctx.lineWidth = 1 / zoom;
        ctx.beginPath();
        ctx.moveTo(-w / 2 + 3, -h / 2 + 3);
        ctx.lineTo(w / 2 - 3, h / 2 - 3);
        ctx.moveTo(w / 2 - 3, -h / 2 + 3);
        ctx.lineTo(-w / 2 + 3, h / 2 - 3);
        ctx.stroke();
      } else {
        // Default window: cross division
        ctx.beginPath();
        ctx.moveTo(0, -h / 2 + 3);
        ctx.lineTo(0, h / 2 - 3);
        ctx.moveTo(-w / 2 + 3, 0);
        ctx.lineTo(w / 2 - 3, 0);
        ctx.stroke();
      }
      // Sill
      ctx.fillStyle = '#9CA3AF';
      ctx.fillRect(-w / 2 - 2, h / 2 - 2, w + 4, 3);
    } else {
      // Doors
      if (type === 'sliding-door' || type === 'door-sliding-glass' || type === 'door-glass') {
        // Sliding door: two panels with overlap
        const panelW = w / 2;
        ctx.fillStyle = type === 'door-glass' ? 'rgba(190, 227, 248, 0.4)' : color;
        ctx.fillRect(-w / 2, -h / 2, panelW, h);
        ctx.strokeRect(-w / 2, -h / 2, panelW, h);
        ctx.fillStyle = type === 'door-glass' ? 'rgba(190, 227, 248, 0.4)' : color;
        ctx.fillRect(0, -h / 2, panelW, h);
        ctx.strokeRect(0, -h / 2, panelW, h);
        // Track
        ctx.fillStyle = '#6B7280';
        ctx.fillRect(-w / 2, h / 2 - 2, w, 2);
        ctx.fillRect(-w / 2, -h / 2, w, 2);
        // Handles
        ctx.fillStyle = '#1F2937';
        ctx.fillRect(-2, -h / 4, 4, 4);
        ctx.fillRect(-2, h / 4, 4, 4);
      } else if (type === 'folding-door') {
        // Folding door: multiple panels
        const panels = w > 100 ? 4 : 3;
        const panelW = w / panels;
        ctx.fillStyle = color;
        for (let i = 0; i < panels; i++) {
          ctx.fillRect(-w / 2 + panelW * i, -h / 2, panelW, h);
          ctx.strokeRect(-w / 2 + panelW * i, -h / 2, panelW, h);
        }
        // Hinges
        ctx.fillStyle = '#9CA3AF';
        for (let i = 0; i < panels; i++) {
          const x = -w / 2 + panelW * (i + 0.5);
          ctx.fillRect(x - 1, -h / 4, 2, h / 2);
        }
      } else if (type === 'door-double' || type === 'french-door') {
        // Double door: two panels
        const panelW = w / 2;
        ctx.fillStyle = type === 'french-door' ? 'rgba(190, 227, 248, 0.3)' : color;
        ctx.fillRect(-w / 2, -h / 2, panelW, h);
        ctx.strokeRect(-w / 2, -h / 2, panelW, h);
        ctx.fillRect(0, -h / 2, panelW, h);
        ctx.strokeRect(0, -h / 2, panelW, h);
        // Panel detailing
        ctx.strokeStyle = '#3D3D3D';
        ctx.lineWidth = 0.5 / zoom;
        for (let i = 0; i < 2; i++) {
          const x0 = -w / 2 + panelW * i;
          ctx.strokeRect(x0 + 4, -h / 2 + 6, panelW - 8, h / 3);
          ctx.strokeRect(x0 + 4, h / 6, panelW - 8, h / 3);
        }
        // Handles
        ctx.fillStyle = '#9CA3AF';
        ctx.fillRect(-4, -2, 4, 4);
        ctx.fillRect(0, -2, 4, 4);
      } else if (type === 'door-pivot') {
        // Pivot door: single panel with pivot indicator
        ctx.fillStyle = color;
        ctx.fillRect(-w / 2, -h / 2, w, h);
        ctx.strokeRect(-w / 2, -h / 2, w, h);
        // Pivot line (offset from edge)
        ctx.strokeStyle = '#9CA3AF';
        ctx.lineWidth = 0.5 / zoom;
        ctx.setLineDash([2, 2]);
        ctx.beginPath();
        ctx.moveTo(-w / 4, -h / 2);
        ctx.lineTo(-w / 4, h / 2);
        ctx.stroke();
        ctx.setLineDash([]);
        // Handle
        ctx.fillStyle = '#1F2937';
        ctx.fillRect(w / 4 - 2, -2, 4, 4);
      } else {
        // Standard single door with swing arc
        // Door panel (closed position - drawn at one side)
        ctx.fillStyle = color;
        ctx.fillRect(-w / 2, -h / 2, w, h);
        ctx.strokeRect(-w / 2, -h / 2, w, h);
        // Panel detail
        ctx.strokeStyle = '#3D3D3D';
        ctx.lineWidth = 0.5 / zoom;
        ctx.strokeRect(-w / 2 + 4, -h / 2 + 6, w - 8, h / 3);
        ctx.strokeRect(-w / 2 + 4, h / 6, w - 8, h / 3);
        // Handle
        ctx.fillStyle = '#9CA3AF';
        ctx.fillRect(w / 4 - 2, -2, 4, 4);
        // Swing arc (dashed)
        ctx.strokeStyle = 'rgba(100, 116, 139, 0.5)';
        ctx.lineWidth = 0.5 / zoom;
        ctx.setLineDash([3, 3]);
        ctx.beginPath();
        ctx.arc(-w / 2, -h / 2, w, 0, Math.PI / 2);
        ctx.stroke();
        ctx.setLineDash([]);
      }
    }
  }

  // ============= OUTDOOR EXTRA 2D RENDERING =============
  function drawOutdoorExtra2D(ctx, item, w, h) {
    const type = item.type;
    const color = item.color || '#8B7355';
    ctx.fillStyle = color;
    ctx.strokeStyle = '#1F2937';
    ctx.lineWidth = 1 / zoom;

    if (type === 'carport' || type === 'carport-2') {
      // Carport: roof outline with support posts
      ctx.fillStyle = 'rgba(139, 115, 85, 0.3)';
      ctx.fillRect(-w / 2, -h / 2, w, h);
      ctx.strokeRect(-w / 2, -h / 2, w, h);
      // Roof hatch lines
      ctx.strokeStyle = '#5D3A1A';
      ctx.lineWidth = 0.5 / zoom;
      for (let x = -w / 2 + 10; x < w / 2; x += 10) {
        ctx.beginPath();
        ctx.moveTo(x, -h / 2);
        ctx.lineTo(x, h / 2);
        ctx.stroke();
      }
      // Support posts (corners)
      const postSize = 6;
      ctx.fillStyle = '#3D3D3D';
      ctx.fillRect(-w / 2, -h / 2, postSize, postSize);
      ctx.fillRect(w / 2 - postSize, -h / 2, postSize, postSize);
      ctx.fillRect(-w / 2, h / 2 - postSize, postSize, postSize);
      ctx.fillRect(w / 2 - postSize, h / 2 - postSize, postSize, postSize);
      // Car outline for carport-2 (2-car)
      if (type === 'carport-2') {
        ctx.strokeStyle = '#9CA3AF';
        ctx.lineWidth = 0.5 / zoom;
        ctx.setLineDash([4, 4]);
        ctx.strokeRect(-w / 2 + 8, -h / 2 + 10, w / 2 - 12, h - 20);
        ctx.strokeRect(4, -h / 2 + 10, w / 2 - 12, h - 20);
        ctx.setLineDash([]);
      } else {
        ctx.strokeStyle = '#9CA3AF';
        ctx.lineWidth = 0.5 / zoom;
        ctx.setLineDash([4, 4]);
        ctx.strokeRect(-w / 2 + 8, -h / 2 + 10, w - 16, h - 20);
        ctx.setLineDash([]);
      }
    } else if (type === 'garage-door') {
      // Garage door: rectangle with horizontal panels
      ctx.fillStyle = color;
      ctx.fillRect(-w / 2, -h / 2, w, h);
      ctx.strokeRect(-w / 2, -h / 2, w, h);
      // Horizontal panel lines
      ctx.strokeStyle = '#3D3D3D';
      ctx.lineWidth = 1 / zoom;
      const panels = Math.max(3, Math.floor(h / 15));
      for (let i = 1; i < panels; i++) {
        const y = -h / 2 + (h / panels) * i;
        ctx.beginPath();
        ctx.moveTo(-w / 2, y);
        ctx.lineTo(w / 2, y);
        ctx.stroke();
      }
      // Vertical handle
      ctx.fillStyle = '#1F2937';
      ctx.fillRect(-2, -h / 8, 4, h / 4);
    } else if (type === 'bush') {
      // Bush: organic cluster of circles
      ctx.fillStyle = '#3A6B1F';
      const cx = [-w / 4, 0, w / 4, -w / 6, w / 6];
      const cy = [0, h / 6, 0, -h / 6, -h / 6];
      for (let i = 0; i < cx.length; i++) {
        ctx.beginPath();
        ctx.arc(cx[i], cy[i], Math.min(w, h) / 3.5, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.strokeStyle = '#1F2937';
      ctx.lineWidth = 0.5 / zoom;
      for (let i = 0; i < cx.length; i++) {
        ctx.beginPath();
        ctx.arc(cx[i], cy[i], Math.min(w, h) / 3.5, 0, Math.PI * 2);
        ctx.stroke();
      }
    } else if (type === 'flower-bed') {
      // Flower bed: rectangle with flowers
      ctx.fillStyle = '#5D3A1A';
      ctx.fillRect(-w / 2, -h / 2, w, h);
      ctx.strokeRect(-w / 2, -h / 2, w, h);
      // Soil
      ctx.fillStyle = '#3D2817';
      ctx.fillRect(-w / 2 + 3, -h / 2 + 3, w - 6, h - 6);
      // Flowers
      const flowerColors = ['#E91E63', '#FFC107', '#9C27B0', '#FF5722'];
      const cols = Math.floor(w / 12);
      const rows = Math.floor(h / 12);
      for (let i = 0; i < cols; i++) {
        for (let j = 0; j < rows; j++) {
          const x = -w / 2 + 6 + (w - 12) * (i / Math.max(1, cols - 1));
          const y = -h / 2 + 6 + (h - 12) * (j / Math.max(1, rows - 1));
          ctx.fillStyle = flowerColors[(i + j) % flowerColors.length];
          ctx.beginPath();
          ctx.arc(x, y, 2, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    } else if (type === 'gazebo') {
      // Gazebo: octagonal shape
      ctx.fillStyle = 'rgba(139, 115, 85, 0.4)';
      ctx.beginPath();
      const sides = 8;
      const r = Math.min(w, h) / 2;
      for (let i = 0; i < sides; i++) {
        const a = (i / sides) * Math.PI * 2 - Math.PI / 2;
        const x = Math.cos(a) * r;
        const y = Math.sin(a) * r;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      // Posts at corners
      ctx.fillStyle = '#3D3D3D';
      for (let i = 0; i < sides; i++) {
        const a = (i / sides) * Math.PI * 2 - Math.PI / 2;
        const x = Math.cos(a) * r;
        const y = Math.sin(a) * r;
        ctx.fillRect(x - 3, y - 3, 6, 6);
      }
      // Center
      ctx.fillStyle = '#5D3A1A';
      ctx.beginPath();
      ctx.arc(0, 0, r / 4, 0, Math.PI * 2);
      ctx.fill();
    } else if (type === 'pergola') {
      // Pergola: slatted roof with posts
      ctx.fillStyle = 'rgba(139, 115, 85, 0.3)';
      ctx.fillRect(-w / 2, -h / 2, w, h);
      ctx.strokeRect(-w / 2, -h / 2, w, h);
      // Slats
      ctx.strokeStyle = '#5D3A1A';
      ctx.lineWidth = 1.5 / zoom;
      for (let x = -w / 2 + 8; x < w / 2; x += 8) {
        ctx.beginPath();
        ctx.moveTo(x, -h / 2);
        ctx.lineTo(x, h / 2);
        ctx.stroke();
      }
      // Beams (thicker lines on edges)
      ctx.lineWidth = 2 / zoom;
      ctx.beginPath();
      ctx.moveTo(-w / 2, -h / 4);
      ctx.lineTo(w / 2, -h / 4);
      ctx.moveTo(-w / 2, h / 4);
      ctx.lineTo(w / 2, h / 4);
      ctx.stroke();
      // Posts
      ctx.fillStyle = '#3D3D3D';
      ctx.fillRect(-w / 2, -h / 2, 6, 6);
      ctx.fillRect(w / 2 - 6, -h / 2, 6, 6);
      ctx.fillRect(-w / 2, h / 2 - 6, 6, 6);
      ctx.fillRect(w / 2 - 6, h / 2 - 6, 6, 6);
    } else if (type === 'lamp-post') {
      // Lamp post: small circle for base + post
      ctx.fillStyle = '#3D3D3D';
      ctx.beginPath();
      ctx.arc(0, 0, Math.min(w, h) / 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      // Light
      ctx.fillStyle = '#FFEB99';
      ctx.beginPath();
      ctx.arc(0, 0, Math.min(w, h) / 4, 0, Math.PI * 2);
      ctx.fill();
      // Light rays
      ctx.strokeStyle = 'rgba(255, 235, 153, 0.6)';
      ctx.lineWidth = 0.5 / zoom;
      for (let i = 0; i < 8; i++) {
        const a = (i / 8) * Math.PI * 2;
        ctx.beginPath();
        ctx.moveTo(Math.cos(a) * Math.min(w, h) / 3, Math.sin(a) * Math.min(w, h) / 3);
        ctx.lineTo(Math.cos(a) * Math.min(w, h) / 2, Math.sin(a) * Math.min(w, h) / 2);
        ctx.stroke();
      }
    } else if (type === 'garden-bench') {
      // Garden bench: seat with back
      ctx.fillStyle = color;
      ctx.fillRect(-w / 2, -h / 2, w, h);
      ctx.strokeRect(-w / 2, -h / 2, w, h);
      // Back slats
      ctx.fillStyle = '#5D3A1A';
      ctx.fillRect(-w / 2, -h / 2, w, h / 4);
      ctx.strokeRect(-w / 2, -h / 2, w, h / 4);
      // Slats
      ctx.strokeStyle = '#3D3D3D';
      ctx.lineWidth = 0.5 / zoom;
      for (let x = -w / 2 + 5; x < w / 2; x += 5) {
        ctx.beginPath();
        ctx.moveTo(x, -h / 2);
        ctx.lineTo(x, -h / 2 + h / 4);
        ctx.stroke();
      }
      // Arm rests
      ctx.fillStyle = '#5D3A1A';
      ctx.fillRect(-w / 2, -h / 2, w / 8, h);
      ctx.fillRect(w / 2 - w / 8, -h / 2, w / 8, h);
      ctx.strokeRect(-w / 2, -h / 2, w / 8, h);
      ctx.strokeRect(w / 2 - w / 8, -h / 2, w / 8, h);
    } else if (type === 'fountain') {
      // Fountain: tiered circles
      ctx.fillStyle = '#9CA3AF';
      ctx.beginPath();
      ctx.arc(0, 0, Math.min(w, h) / 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      // Water
      ctx.fillStyle = '#0288D1';
      ctx.beginPath();
      ctx.arc(0, 0, Math.min(w, h) / 3, 0, Math.PI * 2);
      ctx.fill();
      // Center tier
      ctx.fillStyle = '#9CA3AF';
      ctx.beginPath();
      ctx.arc(0, 0, Math.min(w, h) / 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      // Water spray
      ctx.fillStyle = '#BEE3F8';
      ctx.beginPath();
      ctx.arc(0, 0, Math.min(w, h) / 10, 0, Math.PI * 2);
      ctx.fill();
    } else if (type === 'mailbox') {
      // Mailbox: post with box on top
      ctx.fillStyle = '#3D3D3D';
      ctx.fillRect(-2, -h / 2, 4, h);
      ctx.strokeRect(-2, -h / 2, 4, h);
      // Box
      ctx.fillStyle = '#1F2937';
      ctx.fillRect(-w / 3, -h / 3, w * 2 / 3, h / 3);
      ctx.strokeRect(-w / 3, -h / 3, w * 2 / 3, h / 3);
      // Mail slot
      ctx.fillStyle = '#9CA3AF';
      ctx.fillRect(-w / 6, -h / 6, w / 3, 2);
      // Flag
      ctx.fillStyle = '#EF4444';
      ctx.fillRect(w / 3, -h / 4, w / 6, h / 6);
    } else {
      // Default outdoor item
      ctx.fillStyle = color;
      ctx.fillRect(-w / 2, -h / 2, w, h);
      ctx.strokeRect(-w / 2, -h / 2, w, h);
    }
  }

  function drawMEP2D(ctx, item, w, h) {
    const type = item.type;
    const color = item.color || '#3B82F6';
    ctx.fillStyle = color;
    ctx.strokeStyle = '#1F2937';
    ctx.lineWidth = 1 / zoom;

    if (type.startsWith('pipe-')) {
      // Pipe: long horizontal cylinder (top view shows as line with end-cap circles)
      // Main body
      ctx.fillStyle = color;
      ctx.fillRect(-w / 2, -h / 2, w, h);
      ctx.strokeRect(-w / 2, -h / 2, w, h);
      // Highlight (top reflection)
      ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
      ctx.fillRect(-w / 2, -h / 2, w, h / 4);
      // End cap circles (showing it's a pipe)
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.ellipse(-w / 2, 0, h / 4, h / 2, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.beginPath();
      ctx.ellipse(w / 2, 0, h / 4, h / 2, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      // Inner hole (showing it's hollow)
      ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
      ctx.beginPath();
      ctx.ellipse(-w / 2, 0, h / 6, h / 3, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(w / 2, 0, h / 6, h / 3, 0, 0, Math.PI * 2);
      ctx.fill();

      // Pipe-specific markings
      if (type.includes('water') && !type.includes('waste') && !type.includes('hot')) {
        // Water flow arrows
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 1 / zoom;
        const numArrows = Math.floor(w / 30);
        for (let i = 0; i < numArrows; i++) {
          const x = -w / 2 + (w / numArrows) * (i + 0.5);
          ctx.beginPath();
          ctx.moveTo(x - 3, 0);
          ctx.lineTo(x + 3, 0);
          ctx.lineTo(x + 1, -2);
          ctx.moveTo(x + 3, 0);
          ctx.lineTo(x + 1, 2);
          ctx.stroke();
        }
      } else if (type.includes('waste') || type.includes('vent') || type.includes('floor')) {
        // Waste: stripe pattern
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.4)';
        ctx.lineWidth = 0.5 / zoom;
        for (let x = -w / 2 + 8; x < w / 2; x += 12) {
          ctx.beginPath();
          ctx.moveTo(x, -h / 2 + 1);
          ctx.lineTo(x + 4, h / 2 - 1);
          ctx.stroke();
        }
      } else if (type.includes('rain')) {
        // Rain: drop pattern
        ctx.fillStyle = '#FFFFFF';
        for (let i = 0; i < 5; i++) {
          const x = -w / 2 + (w / 5) * (i + 0.5);
          ctx.beginPath();
          ctx.arc(x, 0, 1.5, 0, Math.PI * 2);
          ctx.fill();
        }
      } else if (type.includes('gas')) {
        // Gas: warning stripe
        ctx.fillStyle = '#FBBF24';
        ctx.fillRect(-w / 2, -h / 2, w, 1);
        ctx.fillRect(-w / 2, h / 2 - 1, w, 1);
      } else if (type.includes('ac')) {
        // AC: insulation indicator (dashed outer)
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.lineWidth = 0.5 / zoom;
        ctx.setLineDash([3 / zoom, 2 / zoom]);
        ctx.strokeRect(-w / 2 - 1, -h / 2 - 1, w + 2, h + 2);
        ctx.setLineDash([]);
      } else if (type.includes('hot')) {
        // Hot water: red insulation dashes
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
        ctx.lineWidth = 0.5 / zoom;
        ctx.setLineDash([2 / zoom, 2 / zoom]);
        ctx.strokeRect(-w / 2 - 1, -h / 2 - 1, w + 2, h + 2);
        ctx.setLineDash([]);
      }
    } else if (type.startsWith('cable-')) {
      // Cable: thin line with wire strands visible
      ctx.fillStyle = color;
      ctx.fillRect(-w / 2, -h / 2, w, h);
      ctx.strokeRect(-w / 2, -h / 2, w, h);
      // Inner core strands (lines along length)
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
      ctx.lineWidth = 0.5 / zoom;
      const numStrands = Math.max(2, Math.floor(h / 2));
      for (let i = 0; i < numStrands; i++) {
        const y = -h / 2 + (h / numStrands) * (i + 0.5);
        ctx.beginPath();
        ctx.moveTo(-w / 2 + 2, y);
        ctx.lineTo(w / 2 - 2, y);
        ctx.stroke();
      }
      // End cap (showing cross-section)
      ctx.fillStyle = '#1F2937';
      ctx.beginPath();
      ctx.arc(-w / 2, 0, h / 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(w / 2, 0, h / 3, 0, Math.PI * 2);
      ctx.fill();
      // Voltage/type label dots
      if (type.includes('nym') || type.includes('nyy')) {
        // Power cable: red/white dots
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.arc(-w / 2, -h / 4, 0.8, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(-w / 2, h / 4, 0.8, 0, Math.PI * 2);
        ctx.fill();
      } else if (type.includes('utp') || type.includes('cat')) {
        // Data cable: 4 pair dots
        ctx.fillStyle = '#FFFFFF';
        for (let i = 0; i < 4; i++) {
          ctx.beginPath();
          ctx.arc(-w / 2, -h / 3 + (h / 4) * i, 0.6, 0, Math.PI * 2);
          ctx.fill();
        }
      } else if (type.includes('coax')) {
        // Coax: single center conductor
        ctx.fillStyle = '#9CA3AF';
        ctx.beginPath();
        ctx.arc(-w / 2, 0, h / 4, 0, Math.PI * 2);
        ctx.fill();
      } else if (type.includes('grounding')) {
        // Grounding: earth symbol
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 1 / zoom;
        for (let i = 0; i < 3; i++) {
          ctx.beginPath();
          ctx.moveTo(-w / 4 - i * 2, -h / 4 + i);
          ctx.lineTo(w / 4 + i * 2, -h / 4 + i);
          ctx.stroke();
        }
      }
    } else if (type.startsWith('conduit-')) {
      // Conduit: hollow pipe with cable inside
      ctx.fillStyle = color;
      ctx.fillRect(-w / 2, -h / 2, w, h);
      ctx.strokeRect(-w / 2, -h / 2, w, h);
      // Hollow interior (showing cable space)
      ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
      ctx.fillRect(-w / 2 + 1, -h / 2 + 1, w - 2, h - 2);
      // Cable inside (smaller colored line)
      ctx.fillStyle = '#DC2626';
      ctx.fillRect(-w / 2 + 1, -1, w - 2, 2);
      // Flexible conduit: ribbed pattern
      if (type.includes('flexible')) {
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.4)';
        ctx.lineWidth = 0.5 / zoom;
        for (let x = -w / 2 + 4; x < w / 2; x += 4) {
          ctx.beginPath();
          ctx.moveTo(x, -h / 2);
          ctx.lineTo(x, h / 2);
          ctx.stroke();
        }
      }
    } else if (type.startsWith('cable-tray-')) {
      // Cable tray: open tray with multiple cables
      ctx.fillStyle = color;
      ctx.fillRect(-w / 2, -h / 2, w, h);
      ctx.strokeRect(-w / 2, -h / 2, w, h);
      // Side rails
      ctx.fillStyle = '#1F2937';
      ctx.fillRect(-w / 2, -h / 2, w, 2);
      ctx.fillRect(-w / 2, h / 2 - 2, w, 2);
      // Multiple cables inside (colored lines)
      const cableColors = ['#DC2626', '#3B82F6', '#22C55E', '#FBBF24'];
      const numCables = Math.min(6, Math.floor(h / 3));
      for (let i = 0; i < numCables; i++) {
        ctx.fillStyle = cableColors[i % 4];
        const y = -h / 2 + 3 + ((h - 6) / numCables) * (i + 0.5);
        ctx.fillRect(-w / 2 + 2, y - 1, w - 4, 2);
      }
    } else if (type === 'grounding-rod-5-8') {
      // Grounding rod: vertical rod with clamp
      ctx.fillStyle = color;
      ctx.fillRect(-w / 4, -h / 2, w / 2, h);
      ctx.strokeRect(-w / 4, -h / 2, w / 2, h);
      // Copper coating (brighter)
      ctx.fillStyle = '#B87333';
      ctx.fillRect(-w / 4, -h / 2, w / 2, h / 6);
      // Clamp at top
      ctx.fillStyle = '#9CA3AF';
      ctx.fillRect(-w / 3, -h / 2 - 2, w * 2 / 3, 4);
      ctx.strokeRect(-w / 3, -h / 2 - 2, w * 2 / 3, 4);
      // Ground symbol
      ctx.strokeStyle = '#1F2937';
      ctx.lineWidth = 1.5 / zoom;
      for (let i = 0; i < 3; i++) {
        ctx.beginPath();
        ctx.moveTo(-w / 4 - i * 2, h / 2 + 2 + i * 2);
        ctx.lineTo(w / 4 + i * 2, h / 2 + 2 + i * 2);
        ctx.stroke();
      }
    } else if (type === 'busbar-copper-100a') {
      // Busbar: thick copper bar with connection points
      ctx.fillStyle = color;
      ctx.fillRect(-w / 2, -h / 2, w, h);
      ctx.strokeRect(-w / 2, -h / 2, w, h);
      // Highlight
      ctx.fillStyle = 'rgba(255, 200, 100, 0.4)';
      ctx.fillRect(-w / 2, -h / 2, w, h / 4);
      // Bolt connection points
      ctx.fillStyle = '#1F2937';
      for (let i = 0; i < 4; i++) {
        const x = -w / 2 + (w / 4) * (i + 0.5);
        ctx.beginPath();
        ctx.arc(x, 0, 1.5, 0, Math.PI * 2);
        ctx.fill();
      }
    } else if (type === 'cabel-fiber-optic') {
      // Fiber optic: thin with bright core
      ctx.fillStyle = color;
      ctx.fillRect(-w / 2, -h / 2, w, h);
      ctx.strokeRect(-w / 2, -h / 2, w, h);
      // Bright glass core
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(-w / 2, -1, w, 2);
      // Light pulse dots
      ctx.fillStyle = '#FBBF24';
      for (let i = 0; i < 6; i++) {
        const x = -w / 2 + (w / 6) * (i + 0.5);
        ctx.beginPath();
        ctx.arc(x, 0, 0.8, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }

  function drawWeather2D(ctx, item, w, h) {
    const type = item.type;
    const color = item.color || '#78716C';
    ctx.fillStyle = color;
    ctx.strokeStyle = '#1F2937';
    ctx.lineWidth = 1 / zoom;

    if (type.startsWith('hood-vent-')) {
      // Tudung ventilasi: miring ke bawah (slope) dengan drip edge
      ctx.beginPath();
      ctx.moveTo(-w / 2, h / 2);
      ctx.lineTo(w / 2, h / 2);
      ctx.lineTo(w / 2 - 3, -h / 2);
      ctx.lineTo(-w / 2 + 3, -h / 2);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      // Top slope line (highlight)
      ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
      ctx.beginPath();
      ctx.moveTo(-w / 2 + 3, -h / 2);
      ctx.lineTo(w / 2 - 3, -h / 2);
      ctx.lineTo(w / 2 - 4, -h / 3);
      ctx.lineTo(-w / 2 + 4, -h / 3);
      ctx.closePath();
      ctx.fill();
      // Drip edge (bottom groove)
      ctx.strokeStyle = '#1F2937';
      ctx.lineWidth = 1.5 / zoom;
      ctx.beginPath();
      ctx.moveTo(-w / 2, h / 2);
      ctx.lineTo(w / 2, h / 2);
      ctx.stroke();
      // Drip lip (small overhang)
      ctx.beginPath();
      ctx.moveTo(-w / 2, h / 2);
      ctx.lineTo(-w / 2 - 1, h / 2 + 2);
      ctx.moveTo(w / 2, h / 2);
      ctx.lineTo(w / 2 + 1, h / 2 + 2);
      ctx.stroke();
      // Vent slot underneath (showing air flow)
      if (type === 'hood-vent-louver') {
        // Louver slats
        ctx.strokeStyle = 'rgba(0,0,0,0.4)';
        ctx.lineWidth = 0.5 / zoom;
        for (let i = 0; i < 4; i++) {
          const y = h / 4 - i * 3;
          ctx.beginPath();
          ctx.moveTo(-w / 2 + 4, y);
          ctx.lineTo(w / 2 - 4, y);
          ctx.stroke();
        }
      }
      if (type === 'hood-vent-round') {
        // Round pipe opening
        ctx.fillStyle = '#1F2937';
        ctx.beginPath();
        ctx.arc(0, 0, h / 4, 0, Math.PI * 2);
        ctx.fill();
      }
    } else if (type.startsWith('hood-window-') || type.startsWith('hood-door-')) {
      // Tudung jendela/pintu: pelat miring lebar dengan drip edge
      ctx.beginPath();
      ctx.moveTo(-w / 2, h / 2);
      ctx.lineTo(w / 2, h / 2);
      ctx.lineTo(w / 2 - 5, -h / 2);
      ctx.lineTo(-w / 2 + 5, -h / 2);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      // Material pattern
      if (type.includes('wood')) {
        // Wood grain lines
        ctx.strokeStyle = 'rgba(91, 58, 26, 0.4)';
        ctx.lineWidth = 0.5 / zoom;
        for (let i = 0; i < 3; i++) {
          ctx.beginPath();
          ctx.moveTo(-w / 2 + 8 + i * (w / 4), -h / 2 + 2);
          ctx.lineTo(-w / 2 + 5 + i * (w / 4), h / 2 - 2);
          ctx.stroke();
        }
      } else if (type.includes('concrete')) {
        // Concrete texture (dots)
        ctx.fillStyle = 'rgba(120, 113, 108, 0.3)';
        for (let i = 0; i < 10; i++) {
          ctx.beginPath();
          ctx.arc(-w / 2 + Math.random() * w, -h / 2 + Math.random() * h, 0.5, 0, Math.PI * 2);
          ctx.fill();
        }
      } else if (type.includes('polycarbonate') || type.includes('glass')) {
        // Transparent material: lighter color + reflection
        ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.beginPath();
        ctx.moveTo(-w / 2 + 5, -h / 2);
        ctx.lineTo(w / 2 - 5, -h / 2);
        ctx.lineTo(w / 2 - 7, -h / 3);
        ctx.lineTo(-w / 2 + 7, -h / 3);
        ctx.closePath();
        ctx.fill();
      } else if (type.includes('fabric')) {
        // Fabric folds
        ctx.strokeStyle = 'rgba(0,0,0,0.3)';
        ctx.lineWidth = 0.5 / zoom;
        const numFolds = Math.floor(w / 20);
        for (let i = 1; i < numFolds; i++) {
          const x = -w / 2 + (w / numFolds) * i;
          ctx.beginPath();
          ctx.moveTo(x, -h / 2);
          ctx.lineTo(x - 2, h / 2);
          ctx.stroke();
        }
      } else if (type.includes('metal-deck')) {
        // Metal deck ribs
        ctx.strokeStyle = 'rgba(0,0,0,0.4)';
        ctx.lineWidth = 0.5 / zoom;
        for (let x = -w / 2 + 8; x < w / 2; x += 8) {
          ctx.beginPath();
          ctx.moveTo(x, -h / 2);
          ctx.lineTo(x - 3, h / 2);
          ctx.stroke();
        }
      }
      // Drip edge (bottom overhang with groove)
      ctx.fillStyle = color;
      ctx.fillRect(-w / 2 - 3, h / 2 - 3, w + 6, 5);
      ctx.strokeRect(-w / 2 - 3, h / 2 - 3, w + 6, 5);
      // Drip lip (groove bawah)
      ctx.fillStyle = '#1F2937';
      ctx.fillRect(-w / 2 - 2, h / 2 + 1, w + 4, 1);
      // Support brackets (every 50cm)
      if (w > 100) {
        ctx.fillStyle = '#374151';
        const numBrackets = Math.floor(w / 50);
        for (let i = 0; i <= numBrackets; i++) {
          const x = -w / 2 + (w / numBrackets) * i;
          ctx.fillRect(x - 1, h / 2 + 2, 2, 4);
        }
      }
    } else if (type.startsWith('canopy-')) {
      // Kanopi pintu: struktur besar dengan support
      // Roof/top
      ctx.beginPath();
      if (type === 'canopy-door-curved' || type === 'canopy-door-dome') {
        // Curved/dome top
        ctx.moveTo(-w / 2, h / 2);
        ctx.quadraticCurveTo(0, -h / 2, w / 2, h / 2);
      } else if (type === 'canopy-door-gable') {
        // Gable (pelana)
        ctx.moveTo(-w / 2, h / 2);
        ctx.lineTo(0, -h / 2);
        ctx.lineTo(w / 2, h / 2);
      } else if (type === 'canopy-door-flat') {
        // Flat
        ctx.rect(-w / 2, -h / 2, w, h);
      } else {
        // Sloped (default)
        ctx.moveTo(-w / 2, h / 2);
        ctx.lineTo(w / 2, h / 2);
        ctx.lineTo(w / 2 - 8, -h / 2);
        ctx.lineTo(-w / 2 + 8, -h / 2);
      }
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      // Material pattern
      if (type.includes('polycarbonate') || type.includes('glass')) {
        // Transparent
        ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.fillRect(-w / 2 + 5, -h / 2 + 2, w - 10, h / 3);
      } else if (type.includes('fabric')) {
        // Fabric folds
        ctx.strokeStyle = 'rgba(0,0,0,0.3)';
        ctx.lineWidth = 0.5 / zoom;
        const numFolds = Math.floor(w / 15);
        for (let i = 1; i < numFolds; i++) {
          const x = -w / 2 + (w / numFolds) * i;
          ctx.beginPath();
          ctx.moveTo(x, -h / 2);
          ctx.lineTo(x, h / 2);
          ctx.stroke();
        }
      } else if (type.includes('steel') || type.includes('gable')) {
        // Roof tile/metal pattern
        ctx.strokeStyle = 'rgba(0,0,0,0.3)';
        ctx.lineWidth = 0.5 / zoom;
        for (let i = 0; i < 5; i++) {
          const y = -h / 2 + (h / 5) * (i + 1);
          ctx.beginPath();
          ctx.moveTo(-w / 2, y);
          ctx.lineTo(w / 2, y);
          ctx.stroke();
        }
      }
      // Support posts/brackets (diagonal)
      ctx.strokeStyle = '#374151';
      ctx.lineWidth = 2 / zoom;
      // Left diagonal support
      ctx.beginPath();
      ctx.moveTo(-w / 2, h / 2);
      ctx.lineTo(-w / 2 + 15, h / 2 - 20);
      ctx.stroke();
      // Right diagonal support
      ctx.beginPath();
      ctx.moveTo(w / 2, h / 2);
      ctx.lineTo(w / 2 - 15, h / 2 - 20);
      ctx.stroke();
      // Drip edge at bottom of canopy
      ctx.fillStyle = '#1F2937';
      ctx.fillRect(-w / 2, h / 2 - 2, w, 2);
    } else if (type.startsWith('drip-course')) {
      // Drip course: thin horizontal with groove
      ctx.fillRect(-w / 2, -h / 2, w, h);
      ctx.strokeRect(-w / 2, -h / 2, w, h);
      // Drip groove (V-shape on bottom)
      ctx.fillStyle = '#1F2937';
      ctx.beginPath();
      ctx.moveTo(-w / 2, h / 2);
      ctx.lineTo(-w / 2 + 2, h / 2 - 2);
      ctx.lineTo(-w / 2 + 4, h / 2);
      ctx.closePath();
      ctx.fill();
      // Repeating drip grooves
      const numGrooves = Math.floor(w / 15);
      for (let i = 1; i < numGrooves; i++) {
        const x = -w / 2 + (w / numGrooves) * i;
        ctx.beginPath();
        ctx.moveTo(x, h / 2);
        ctx.lineTo(x + 2, h / 2 - 2);
        ctx.lineTo(x + 4, h / 2);
        ctx.closePath();
        ctx.fill();
      }
      // Material pattern
      if (type.includes('wood')) {
        ctx.strokeStyle = 'rgba(91, 58, 26, 0.4)';
        ctx.lineWidth = 0.5 / zoom;
        ctx.beginPath();
        ctx.moveTo(-w / 2, 0);
        ctx.lineTo(w / 2, 0);
        ctx.stroke();
      } else if (type.includes('aluminum') || type.includes('pvc')) {
        // Highlight reflection
        ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.fillRect(-w / 2, -h / 2, w, h / 3);
      }
    } else if (type.startsWith('weather-shed')) {
      // Weather shed: lebar miring dengan drip edge
      ctx.beginPath();
      ctx.moveTo(-w / 2, h / 2);
      ctx.lineTo(w / 2, h / 2);
      ctx.lineTo(w / 2 - 6, -h / 2);
      ctx.lineTo(-w / 2 + 6, -h / 2);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      // Material pattern
      if (type.includes('concrete')) {
        ctx.fillStyle = 'rgba(120, 113, 108, 0.3)';
        for (let i = 0; i < 15; i++) {
          ctx.beginPath();
          ctx.arc(-w / 2 + Math.random() * w, -h / 2 + Math.random() * h, 0.5, 0, Math.PI * 2);
          ctx.fill();
        }
      } else if (type.includes('tile')) {
        // Tile pattern
        ctx.strokeStyle = 'rgba(0,0,0,0.4)';
        ctx.lineWidth = 0.5 / zoom;
        for (let i = 0; i < 5; i++) {
          const y = -h / 2 + (h / 5) * (i + 1);
          ctx.beginPath();
          ctx.moveTo(-w / 2, y);
          ctx.lineTo(w / 2, y);
          ctx.stroke();
        }
        for (let i = 0; i < 10; i++) {
          const x = -w / 2 + (w / 10) * i;
          ctx.beginPath();
          ctx.moveTo(x, -h / 2);
          ctx.lineTo(x, h / 2);
          ctx.stroke();
        }
      }
      // Drip edge (bottom overhang)
      ctx.fillStyle = color;
      ctx.fillRect(-w / 2 - 4, h / 2 - 4, w + 8, 6);
      ctx.strokeRect(-w / 2 - 4, h / 2 - 4, w + 8, 6);
      // Drip lip (groove)
      ctx.fillStyle = '#1F2937';
      ctx.fillRect(-w / 2 - 3, h / 2 + 1, w + 6, 1);
    } else if (type.startsWith('coping-')) {
      // Coping: top cap for parapet wall
      ctx.fillRect(-w / 2, -h / 2, w, h);
      ctx.strokeRect(-w / 2, -h / 2, w, h);
      // Sloped top (water runoff)
      ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
      ctx.beginPath();
      ctx.moveTo(-w / 2, -h / 2);
      ctx.lineTo(w / 2, -h / 2);
      ctx.lineTo(w / 2 - 2, -h / 4);
      ctx.lineTo(-w / 2 + 2, -h / 4);
      ctx.closePath();
      ctx.fill();
      // Drip edges (both sides)
      ctx.fillStyle = '#1F2937';
      ctx.fillRect(-w / 2, h / 2 - 2, 3, 2);
      ctx.fillRect(w / 2 - 3, h / 2 - 2, 3, 2);
      // Material pattern
      if (type.includes('stone')) {
        // Stone texture
        ctx.strokeStyle = 'rgba(0,0,0,0.3)';
        ctx.lineWidth = 0.3 / zoom;
        for (let i = 0; i < 5; i++) {
          ctx.beginPath();
          ctx.moveTo(-w / 2 + Math.random() * w, -h / 2);
          ctx.lineTo(-w / 2 + Math.random() * w, h / 2);
          ctx.stroke();
        }
      } else if (type.includes('tile')) {
        // Tile pattern
        ctx.strokeStyle = 'rgba(0,0,0,0.4)';
        ctx.lineWidth = 0.5 / zoom;
        for (let i = 0; i < 8; i++) {
          const x = -w / 2 + (w / 8) * i;
          ctx.beginPath();
          ctx.moveTo(x, -h / 2);
          ctx.lineTo(x, h / 2);
          ctx.stroke();
        }
      } else if (type.includes('metal')) {
        // Metal highlight
        ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.fillRect(-w / 2, -h / 2, w, h / 3);
      }
    } else if (type === 'hood-opening-generic' || type === 'hood-opening-large') {
      // Generic tudung bukaan
      ctx.beginPath();
      ctx.moveTo(-w / 2, h / 2);
      ctx.lineTo(w / 2, h / 2);
      ctx.lineTo(w / 2 - 4, -h / 2);
      ctx.lineTo(-w / 2 + 4, -h / 2);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      // Drip edge
      ctx.fillStyle = '#1F2937';
      ctx.fillRect(-w / 2 - 2, h / 2 - 2, w + 4, 3);
      // Highlight
      ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
      ctx.beginPath();
      ctx.moveTo(-w / 2 + 4, -h / 2);
      ctx.lineTo(w / 2 - 4, -h / 2);
      ctx.lineTo(w / 2 - 5, -h / 3);
      ctx.lineTo(-w / 2 + 5, -h / 3);
      ctx.closePath();
      ctx.fill();
    }
  }

  // ============= FENCE 2D RENDERING =============
  function drawFence2D(ctx, item, w, h) {
    const color = (item.color || '#3D3D3D').trim();
    const fenceType = item.type;
    // Base line
    ctx.fillStyle = color;
    ctx.fillRect(-w / 2, -h / 2, w, h);

    // Pattern based on fence type
    const postSpacing = 30; // posts every 30cm
    const numPosts = Math.max(2, Math.floor(w / postSpacing));
    const actualSpacing = w / numPosts;

    if (fenceType === 'fence-iron' || fenceType === 'fence-wrought-iron') {
      // Vertical bars (iron fence)
      ctx.strokeStyle = fenceType === 'fence-wrought-iron' ? '#1F1F1F' : '#3D3D3D';
      ctx.lineWidth = 2 / zoom;
      // Top and bottom rails
      ctx.beginPath();
      ctx.moveTo(-w / 2, -h / 4);
      ctx.lineTo(w / 2, -h / 4);
      ctx.moveTo(-w / 2, h / 4);
      ctx.lineTo(w / 2, h / 4);
      ctx.stroke();
      // Vertical pickets
      for (let i = 0; i <= numPosts; i++) {
        const x = -w / 2 + i * actualSpacing;
        ctx.beginPath();
        ctx.moveTo(x, -h / 2);
        ctx.lineTo(x, h / 2);
        ctx.stroke();
        // Ornamental top for wrought iron
        if (fenceType === 'fence-wrought-iron') {
          ctx.beginPath();
          ctx.arc(x, -h / 2 - 2, 3 / zoom, 0, Math.PI * 2);
          ctx.stroke();
        }
      }
    } else if (fenceType === 'fence-wood') {
      // Horizontal wood planks
      ctx.fillStyle = color;
      ctx.fillRect(-w / 2, -h / 2, w, h);
      ctx.strokeStyle = '#5B3A1A';
      ctx.lineWidth = 0.5 / zoom;
      const numPlanks = 3;
      const plankH = h / numPlanks;
      for (let i = 0; i <= numPlanks; i++) {
        const y = -h / 2 + i * plankH;
        ctx.beginPath();
        ctx.moveTo(-w / 2, y);
        ctx.lineTo(w / 2, y);
        ctx.stroke();
      }
      // Posts
      ctx.fillStyle = '#6B4423';
      for (let i = 0; i <= numPosts; i++) {
        const x = -w / 2 + i * actualSpacing;
        ctx.fillRect(x - 3, -h / 2 - 5, 6, h + 10);
      }
    } else if (fenceType === 'fence-bamboo') {
      // Bamboo pattern - uneven vertical lines
      ctx.strokeStyle = '#8B6F47';
      ctx.lineWidth = 2 / zoom;
      const bamboos = Math.floor(w / 8);
      for (let i = 0; i <= bamboos; i++) {
        const x = -w / 2 + (w / bamboos) * i;
        ctx.beginPath();
        ctx.moveTo(x, -h / 2);
        ctx.lineTo(x, h / 2);
        ctx.stroke();
      }
    } else if (fenceType === 'fence-hedge') {
      // Hedge - green with texture
      ctx.fillStyle = '#4A7C2E';
      ctx.fillRect(-w / 2, -h / 2, w, h);
      // Texture dots
      ctx.fillStyle = '#3A6C1E';
      for (let i = 0; i < w / 10; i++) {
        for (let j = 0; j < h / 10; j++) {
          const x = -w / 2 + i * 10 + Math.random() * 5;
          const y = -h / 2 + j * 10 + Math.random() * 5;
          ctx.beginPath();
          ctx.arc(x, y, 2 / zoom, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    } else if (fenceType === 'fence-stone' || fenceType === 'fence-concrete') {
      // Stone/concrete - solid with texture
      ctx.fillStyle = color;
      ctx.fillRect(-w / 2, -h / 2, w, h);
      ctx.strokeStyle = fenceType === 'fence-stone' ? '#57534E' : '#78716C';
      ctx.lineWidth = 0.5 / zoom;
      // Stone pattern
      if (fenceType === 'fence-stone') {
        const stoneW = 30;
        const stoneH = 15;
        for (let row = 0; row < Math.ceil(h / stoneH); row++) {
          for (let col = 0; col < Math.ceil(w / stoneW); col++) {
            const offset = (row % 2) * (stoneW / 2);
            const x = -w / 2 + col * stoneW + offset;
            const y = -h / 2 + row * stoneH;
            ctx.strokeRect(x, y, stoneW, stoneH);
          }
        }
      }
    } else if (fenceType === 'fence-vinyl') {
      // Vinyl white picket fence
      ctx.fillStyle = '#F5F5F5';
      ctx.fillRect(-w / 2, -h / 2, w, h);
      ctx.strokeStyle = '#D1D5DB';
      ctx.lineWidth = 1 / zoom;
      // Pointed pickets
      for (let i = 0; i <= numPosts; i++) {
        const x = -w / 2 + i * actualSpacing;
        ctx.beginPath();
        ctx.moveTo(x - 4, h / 2);
        ctx.lineTo(x, h / 2 - 4);
        ctx.lineTo(x + 4, h / 2);
        ctx.stroke();
      }
    } else if (fenceType === 'fence-chain-link') {
      // Chain link - diamond pattern
      ctx.fillStyle = 'rgba(156, 163, 175, 0.3)';
      ctx.fillRect(-w / 2, -h / 2, w, h);
      ctx.strokeStyle = '#9CA3AF';
      ctx.lineWidth = 0.5 / zoom;
      const cellSize = 10;
      for (let i = -w; i < w; i += cellSize) {
        ctx.beginPath();
        ctx.moveTo(i, -h / 2);
        ctx.lineTo(i + cellSize / 2, 0);
        ctx.lineTo(i, h / 2);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(i + cellSize, -h / 2);
        ctx.lineTo(i + cellSize / 2, 0);
        ctx.lineTo(i + cellSize, h / 2);
        ctx.stroke();
      }
    } else if (fenceType === 'fence-modern') {
      // Modern minimalis - clean horizontal lines
      ctx.fillStyle = color;
      ctx.fillRect(-w / 2, -h / 2, w, h);
      ctx.strokeStyle = '#BDBDBD';
      ctx.lineWidth = 1 / zoom;
      ctx.beginPath();
      ctx.moveTo(-w / 2, 0);
      ctx.lineTo(w / 2, 0);
      ctx.stroke();
    }
    // Border
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 1 / zoom;
    ctx.strokeRect(-w / 2, -h / 2, w, h);
  }

  // ============= GATE 2D RENDERING =============
  function drawGate2D(ctx, item, w, h) {
    const color = (item.color || '#3D3D3D').trim();
    ctx.fillStyle = color;
    ctx.fillRect(-w / 2, -h / 2, w, h);

    // Gate frame
    ctx.strokeStyle = '#1F1F1F';
    ctx.lineWidth = 2 / zoom;
    ctx.strokeRect(-w / 2, -h / 2, w, h);

    // Vertical bars
    const numBars = Math.max(4, Math.floor(w / 30));
    const barSpacing = w / numBars;
    for (let i = 1; i < numBars; i++) {
      const x = -w / 2 + i * barSpacing;
      ctx.beginPath();
      ctx.moveTo(x, -h / 2);
      ctx.lineTo(x, h / 2);
      ctx.stroke();
    }

    // Center division for swing gate
    if (item.type === 'gate-swing') {
      ctx.strokeStyle = '#FFD700';
      ctx.lineWidth = 2 / zoom;
      ctx.setLineDash([5 / zoom, 3 / zoom]);
      ctx.beginPath();
      ctx.moveTo(0, -h / 2);
      ctx.lineTo(0, h / 2);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // Gate icon
    ctx.fillStyle = '#FFF';
    ctx.font = `${Math.min(w, h) * 0.5}px Inter, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('🚪', 0, 0);
  }

  // ============= TREE 2D RENDERING =============
  function drawTree2D(ctx, item, w, h) {
    const color = (item.color || '#4A7C2E').trim();
    const isPalm = item.type === 'tree-palm';
    const isSmall = item.type === 'tree-small';

    if (isPalm) {
      // Palm tree - circle with fronds
      ctx.fillStyle = '#8B6F47';
      ctx.beginPath();
      ctx.arc(0, 0, w / 6, 0, Math.PI * 2);
      ctx.fill();
      // Fronds
      ctx.strokeStyle = color;
      ctx.lineWidth = 3 / zoom;
      for (let i = 0; i < 8; i++) {
        const angle = (i / 8) * Math.PI * 2;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(Math.cos(angle) * w / 2, Math.sin(angle) * h / 2);
        ctx.stroke();
      }
    } else {
      // Regular tree - layered circles
      const numCircles = isSmall ? 1 : 3;
      const baseRadius = Math.min(w, h) / 2;
      for (let i = 0; i < numCircles; i++) {
        const r = baseRadius * (1 - i * 0.2);
        const offsetX = (i - 1) * w / 6;
        const offsetY = (i - 1) * h / 6;
        ctx.fillStyle = i === 0 ? color : (isSmall ? '#5A8A3E' : '#3A6C1E');
        ctx.beginPath();
        ctx.arc(offsetX, offsetY, r, 0, Math.PI * 2);
        ctx.fill();
      }
      // Trunk dot
      ctx.fillStyle = '#5B3A1A';
      ctx.beginPath();
      ctx.arc(0, 0, w / 10, 0, Math.PI * 2);
      ctx.fill();
    }
    // Selection border
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 0.5 / zoom;
    ctx.setLineDash([3 / zoom, 3 / zoom]);
    ctx.strokeRect(-w / 2, -h / 2, w, h);
    ctx.setLineDash([]);
  }

  // ============= POOL 2D RENDERING =============
  function drawPool2D(ctx, item, w, h) {
    const color = (item.color || '#03A9F4').trim();
    // Pool water
    ctx.fillStyle = color;
    ctx.fillRect(-w / 2, -h / 2, w, h);
    // Water texture - wavy lines
    ctx.strokeStyle = '#4FC3F7';
    ctx.lineWidth = 1 / zoom;
    for (let y = -h / 2; y < h / 2; y += 20) {
      ctx.beginPath();
      for (let x = -w / 2; x <= w / 2; x += 5) {
        const wave = Math.sin(x * 0.1) * 3;
        if (x === -w / 2) ctx.moveTo(x, y + wave);
        else ctx.lineTo(x, y + wave);
      }
      ctx.stroke();
    }
    // Pool border (deck)
    ctx.strokeStyle = '#8B6F47';
    ctx.lineWidth = 4 / zoom;
    ctx.strokeRect(-w / 2, -h / 2, w, h);
    // Inner border
    ctx.strokeStyle = '#0288D1';
    ctx.lineWidth = 2 / zoom;
    ctx.strokeRect(-w / 2 + 4, -h / 2 + 4, w - 8, h - 8);
  }

  // ============= GRASS/AREA 2D RENDERING =============
  function drawGrassArea2D(ctx, item, w, h) {
    const color = (item.color || '#7CB342').trim();
    ctx.fillStyle = color;
    ctx.fillRect(-w / 2, -h / 2, w, h);

    // Texture based on type
    if (item.type === 'grass') {
      // Grass texture - small lines
      ctx.strokeStyle = '#5A8A3E';
      ctx.lineWidth = 0.5 / zoom;
      for (let i = 0; i < w * h / 200; i++) {
        const x = -w / 2 + Math.random() * w;
        const y = -h / 2 + Math.random() * h;
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x, y - 3 / zoom);
        ctx.stroke();
      }
    } else if (item.type === 'pathway' || item.type === 'patio' || item.type === 'driveway') {
      // Stone/paving pattern
      ctx.strokeStyle = item.type === 'driveway' ? '#4B5563' : '#78716C';
      ctx.lineWidth = 0.5 / zoom;
      const tileSize = 40;
      for (let x = -w / 2; x < w / 2; x += tileSize) {
        ctx.beginPath();
        ctx.moveTo(x, -h / 2);
        ctx.lineTo(x, h / 2);
        ctx.stroke();
      }
      for (let y = -h / 2; y < h / 2; y += tileSize) {
        ctx.beginPath();
        ctx.moveTo(-w / 2, y);
        ctx.lineTo(w / 2, y);
        ctx.stroke();
      }
    } else if (item.type === 'deck' || item.type === 'pool-deck') {
      // Wood deck planks
      ctx.strokeStyle = '#6B4423';
      ctx.lineWidth = 0.5 / zoom;
      const plankW = 15;
      for (let x = -w / 2; x < w / 2; x += plankW) {
        ctx.beginPath();
        ctx.moveTo(x, -h / 2);
        ctx.lineTo(x, h / 2);
        ctx.stroke();
      }
    }

    // Border (dashed)
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 1 / zoom;
    ctx.setLineDash([5 / zoom, 5 / zoom]);
    ctx.strokeRect(-w / 2, -h / 2, w, h);
    ctx.setLineDash([]);
  }

  function drawSelection(ctx) {
    if (selectedType === 'item') {
      const item = activeFloor.items.find((i) => i.id === selectedId);
      if (!item) return;
      ctx.save();
      ctx.translate(item.x, item.y);
      ctx.rotate(item.rotation);

      const w = item.w;
      const h = item.h;

      // Selection rectangle
      ctx.strokeStyle = '#6366f1';
      ctx.lineWidth = 2 / zoom;
      ctx.setLineDash([6 / zoom, 3 / zoom]);
      ctx.strokeRect(-w / 2 - 2, -h / 2 - 2, w + 4, h + 4);
      ctx.setLineDash([]);

      // Rotation handle
      ctx.strokeStyle = '#6366f1';
      ctx.lineWidth = 1.5 / zoom;
      ctx.beginPath();
      ctx.moveTo(0, -h / 2 - 2);
      ctx.lineTo(0, -h / 2 - 25);
      ctx.stroke();
      ctx.fillStyle = '#6366f1';
      ctx.beginPath();
      ctx.arc(0, -h / 2 - 25, 6 / zoom, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = 'white';
      ctx.beginPath();
      ctx.arc(0, -h / 2 - 25, 3 / zoom, 0, Math.PI * 2);
      ctx.fill();

      // Resize handles
      const handles = [
        { x: -w / 2, y: -h / 2 },
        { x: 0, y: -h / 2 },
        { x: w / 2, y: -h / 2 },
        { x: -w / 2, y: 0 },
        { x: w / 2, y: 0 },
        { x: -w / 2, y: h / 2 },
        { x: 0, y: h / 2 },
        { x: w / 2, y: h / 2 },
      ];
      handles.forEach((h) => {
        ctx.fillStyle = '#10b981';
        ctx.strokeStyle = 'white';
        ctx.lineWidth = 1.5 / zoom;
        ctx.fillRect(h.x - 5 / zoom, h.y - 5 / zoom, 10 / zoom, 10 / zoom);
        ctx.strokeRect(h.x - 5 / zoom, h.y - 5 / zoom, 10 / zoom, 10 / zoom);
      });

      // Dimensions
      ctx.fillStyle = '#1e293b';
      ctx.font = `bold ${11 / zoom}px Inter, sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'bottom';
      ctx.fillText(formatDimension(w, unit), 0, -h / 2 - 35);

      ctx.save();
      ctx.translate(w / 2 + 15, 0);
      ctx.rotate(Math.PI / 2);
      ctx.fillText(formatDimension(h, unit), 0, 0);
      ctx.restore();

      ctx.restore();
    }
  }

  function drawWallPreview(ctx) {
    if (!wallStart) return;
    const pos = dragState.current.mouseStart;
    const snapped = { x: snapToGridEnabled ? snapToGrid(pos.x, gridSize) : pos.x, y: snapToGridEnabled ? snapToGrid(pos.y, gridSize) : pos.y };
    ctx.strokeStyle = '#6366f1';
    ctx.lineWidth = 8 / zoom;
    ctx.globalAlpha = 0.6;
    ctx.beginPath();
    ctx.moveTo(wallStart.x, wallStart.y);
    ctx.lineTo(snapped.x, snapped.y);
    ctx.stroke();
    ctx.globalAlpha = 1;

    // Length label
    const dx = snapped.x - wallStart.x;
    const dy = snapped.y - wallStart.y;
    const len = Math.sqrt(dx * dx + dy * dy);
    ctx.fillStyle = '#4338ca';
    ctx.font = `bold ${12 / zoom}px Inter, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(
      `${Math.round(len)} cm`,
      (wallStart.x + snapped.x) / 2,
      (wallStart.y + snapped.y) / 2 - 15
    );
  }

  // ============= MEASURE LINE =============
  function drawMeasureLine(ctx) {
    if (!measureStart) return;
    const pos = dragState.current.mouseStart;
    if (!pos) return;
    const endX = snapToGridEnabled ? snapToGrid(pos.x, gridSize) : pos.x;
    const endY = snapToGridEnabled ? snapToGrid(pos.y, gridSize) : pos.y;

    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 2 / zoom;
    ctx.setLineDash([5 / zoom, 3 / zoom]);
    ctx.beginPath();
    ctx.moveTo(measureStart.x, measureStart.y);
    ctx.lineTo(endX, endY);
    ctx.stroke();
    ctx.setLineDash([]);

    // Distance label
    const dx = endX - measureStart.x;
    const dy = endY - measureStart.y;
    const len = Math.sqrt(dx * dx + dy * dy);
    const midX = (measureStart.x + endX) / 2;
    const midY = (measureStart.y + endY) / 2;

    ctx.fillStyle = '#f59e0b';
    ctx.font = `bold ${14 / zoom}px Inter, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    const label = `${(len / 100).toFixed(2)} m (${Math.round(len)} cm)`;
    const labelW = ctx.measureText(label).width;
    ctx.fillStyle = 'rgba(245, 158, 11, 0.9)';
    ctx.fillRect(midX - labelW / 2 - 4, midY - 10 / zoom - 4, labelW + 8, 20 / zoom);
    ctx.fillStyle = '#fff';
    ctx.fillText(label, midX, midY - 10 / zoom);

    // Endpoints
    ctx.fillStyle = '#f59e0b';
    ctx.beginPath();
    ctx.arc(measureStart.x, measureStart.y, 4 / zoom, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(endX, endY, 4 / zoom, 0, Math.PI * 2);
    ctx.fill();
  }

  // ============= ANNOTATIONS =============
  function drawAnnotations(ctx) {
    annotations.forEach(ann => {
      ctx.save();
      ctx.translate(ann.x, ann.y);
      // Background
      ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
      ctx.strokeStyle = '#6366f1';
      ctx.lineWidth = 1 / zoom;
      const text = ann.text || '';
      ctx.font = `bold ${12 / zoom}px Inter, sans-serif`;
      const w = ctx.measureText(text).width + 10 / zoom;
      const h = 18 / zoom;
      ctx.fillRect(-w / 2, -h / 2, w, h);
      ctx.strokeRect(-w / 2, -h / 2, w, h);
      // Text
      ctx.fillStyle = '#1e293b';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(text, 0, 0);
      ctx.restore();
    });
  }

  return (
    <div ref={containerRef} className="canvas-container absolute inset-0 bg-slate-100 dark:bg-slate-900">
      <canvas
        ref={canvasRef}
        id="canvas2d"
        className="block w-full h-full"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
        onDoubleClick={handleDoubleClick}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onContextMenu={(e) => {
          e.preventDefault();
          if (selectedId != null) {
            showContextMenu(e.clientX, e.clientY);
          }
        }}
      />
      <div className="floor-indicator">
        {activeFloor?.name} · Tinggi {formatDimension(activeFloor?.height || 300, unit)}
      </div>

      {/* Wall drawing hint */}
      {isDrawingWall && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-indigo-600 text-white text-xs px-3 py-1.5 rounded-full shadow-lg animate-fade-in">
          Klik untuk menetapkan titik akhir dinding · Esc untuk batal
        </div>
      )}

      {/* Info overlays - high contrast, WCAG AA compliant */}
      <div className="canvas-overlay absolute bottom-4 left-4 px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg shadow-lg text-[10px] sm:text-xs space-y-0.5 max-w-[calc(100%-2rem)] safe-bottom">
        <div className="hidden sm:block font-medium">
          Mode: {viewMode === 'structural' ? 'Struktur' : 'Normal'} · {activeFloor?.name}
        </div>
        <div className="flex flex-wrap gap-x-2 font-medium">
          <span>I: {activeFloor?.items.length || 0}</span>
          <span>D: {activeFloor?.walls.length || 0}</span>
          <span>K: {activeFloor?.columns.length || 0}</span>
          <span className="opacity-70">{(zoom * 100).toFixed(0)}%</span>
        </div>
      </div>

      <div className="canvas-overlay absolute bottom-4 right-4 px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg shadow-lg text-[9px] sm:text-xs safe-bottom">
        <div className="font-medium">
          <span className="opacity-70">T: </span>
          {(plot.width/100).toFixed(1)}x{(plot.depth/100).toFixed(1)}m
        </div>
        <div className="font-medium">
          <span className="opacity-70">B: </span>
          {(building.width/100).toFixed(1)}x{(building.depth/100).toFixed(1)}m
        </div>
      </div>
    </div>
  );
}
