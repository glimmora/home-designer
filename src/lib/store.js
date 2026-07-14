import { create } from 'zustand';
import { getItemDef as getItemDefBase, itemDefinitions as defaultItemDefinitions } from './itemDefinitions';
import { collab } from './collaboration';

// ============= INITIAL STATE =============
const createDefaultFloor = (id, name, height = 300) => ({
  id,
  name,
  height,
  items: [],
  walls: [],
  columns: [],
  pipes: [],      // MEP: plumbing pipes
  wires: [],      // MEP: electrical wires
  fixtures: [],   // MEP: fixtures (outlets, switches, taps, etc.)
});

// Default cost settings (in IDR)
const defaultCostSettings = {
  wallPerM2: 850000,      // Cost per m² of wall (material + labor)
  floorPerM2: 650000,     // Cost per m² of floor slab
  columnPerM3: 1200000,   // Cost per m³ of column
  foundationPerM2: 450000, // Cost per m² of foundation
  paintPerM2: 85000,      // Cost per m² of paint
  currency: 'IDR',
};

const THEME_STORAGE_KEY = 'home-designer-pro-theme';

const createInitialState = () => ({
  mode: '2d',
  tool: 'select',
  category: 'bedroom',
  viewMode: 'design', // 'design' | 'structural' | 'rebar' | 'plumbing' | 'electrical' | 'mep'
  mepTool: 'pipe-water', // active MEP tool when in MEP modes
  unit: 'cm',
  plotUnit: 'cm',
  zoom: 0.4,
  panX: 0,
  panY: 0,

  plot: { width: 1500, depth: 2000 },
  building: { width: 1200, depth: 1500, offsetX: 150, offsetY: 250 },

  floors: [createDefaultFloor(1, 'Lantai 1', 300)],
  activeFloorId: 1,
  nextFloorId: 2,

  selectedId: null,
  selectedType: null,
  nextId: 1,

  // Custom items (user-defined, merged with defaults)
  customItems: {}, // { categoryKey: [items...] }
  nextCustomItemId: 1,

  // Cost settings
  costSettings: { ...defaultCostSettings },

  // Theme
  theme: typeof localStorage !== 'undefined'
    ? (localStorage.getItem(THEME_STORAGE_KEY) || 'light')
    : 'light',

  // Drawing state
  isDrawingWall: false,
  wallStart: null,
  isDrawingMEP: false,
  mepStart: null,

  // Multi-select
  selectedIds: [],
  isGrouping: false,

  // Measure tool
  isMeasuring: false,
  measureStart: null,
  measureResult: null,

  // Snap
  snapToGridEnabled: true,
  gridSize: 10,

  // Layer visibility
  layers: {
    walls: true,
    items: true,
    columns: true,
    mep: true,
    dimensions: true,
    annotations: true,
  },

  // Annotations (text labels on canvas)
  annotations: [],

  // Favorites (recently used item types)
  favorites: [],

  // Context menu
  contextMenu: null, // { x, y, visible }

  // Auto-save
  autoSaveEnabled: true,
  lastAutoSave: null,

  // Onboarding
  hasSeenOnboarding: typeof localStorage !== 'undefined'
    ? localStorage.getItem('hdp-onboarded') === 'true'
    : false,
  onboardingStep: 0,

  // UI state
  isPlotModalOpen: false,
  isHelpOpen: false,
  isCustomItemModalOpen: false,
  isCostModalOpen: false,
  isExportModalOpen: false,
  isPresetModalOpen: false,
  isMaterialModalOpen: false,
  isCollabModalOpen: false,
  isLayerPanelOpen: false,
  isUndoHistoryOpen: false,
  isShareModalOpen: false,
  isPrintPreviewOpen: false,
  isBOMModalOpen: false,
  isEngineeringModalOpen: false,
  isBeamDesignerOpen: false,
  editingCustomItem: null,

  // Mobile responsive state
  leftSidebarOpen: false,   // mobile drawer for left sidebar
  rightSidebarOpen: false,  // mobile drawer for right sidebar
  mobileToolbarOpen: false, // mobile overflow menu for header toolbar

  // Collaboration
  collabActive: false,
  collabInfo: null, // { userId, userName, userColor }
  collabPeers: [], // [{ id, name, color, cursor }]
  collabMessages: [], // [{ userId, userName, userColor, text, timestamp }]

  // 3D viewer options
  view3DOptions: {
    showRebar: true,
    showPipes: true,
    showWires: true,
    showFixtures: true,
    wireframe: false,
  },

  // AR mode
  isARMode: false,

  // Structural analysis modal & settings
  isStructuralModalOpen: false,
  isDocumentModalOpen: false,
  isNewProjectModalOpen: false,
  isRoofDesignerOpen: false,
  isRebarBOMOpen: false,
  isPermitCalculatorOpen: false,
  structuralSettings: {
    concreteGrade: 'K-250',
    steelGrade: 'BJTD400',
    mainBarDiameter: 16,
    stirrupDiameter: 8,
    stirrupSpacing: 150,
    cover: 40,
    slabThickness: 120,
    wallThickness: 150,
    numMainBars: 4,
  },
  foundationConfig: {
    type: 'strip-footing',
    soilBearing: 200,
    depth: 60,
  },
  roofConfig: {
    roofType: 'pelana',
    frameMaterial: 'kayu-kamper',
    roofingMaterial: 'genteng-keramik',
    pitch_deg: 25,
  },
  seismicSettings: {
    city: 'jakarta',
    soilType: 'SC',
    responseModR: 8,
    importanceFactor: 1.0,
    periodT: null,
  },
  liveLoadType: 'residential',
  structuralResults: null,

  // History
  past: [],
  future: [],
});

// ============= HISTORY HELPERS =============
const HISTORY_KEYS = [
  'plot', 'building', 'floors', 'activeFloorId', 'nextFloorId', 'nextId',
  'customItems', 'nextCustomItemId', 'costSettings',
];

// Fallback for older browsers without structuredClone
const deepClone = (obj) => {
  if (typeof structuredClone === 'function') return structuredClone(obj);
  try { return JSON.parse(JSON.stringify(obj)); } catch { return obj; }
};

const snapshot = (state) => {
  const snap = {};
  for (const k of HISTORY_KEYS) snap[k] = deepClone(state[k]);
  return snap;
};

const restore = (state, snap) => ({
  ...state,
  ...deepClone(snap),
});

// ============= STORE =============
export const useStore = create((set, get) => ({
  ...createInitialState(),

  // ---------- Mode & Tool ----------
  setMode: (mode) => set({ mode, selectedId: null, isDrawingWall: false, wallStart: null }),

  setTool: (tool) => {
    set({ tool, isDrawingWall: false, wallStart: null });
    if (tool !== 'select') set({ selectedId: null, selectedType: null });
  },

  setCategory: (category) => set({ category }),
  setViewMode: (viewMode) => set({ viewMode }),
  setMepTool: (mepTool) => set({ mepTool }),
  setUnit: (unit) => set({ unit }),
  setPlotUnit: (plotUnit) => set({ plotUnit }),

  // ---------- Theme ----------
  setTheme: (theme) => {
    if (typeof localStorage !== 'undefined') localStorage.setItem(THEME_STORAGE_KEY, theme);
    set({ theme });
  },
  toggleTheme: () => {
    const next = get().theme === 'light' ? 'dark' : 'light';
    if (typeof localStorage !== 'undefined') localStorage.setItem(THEME_STORAGE_KEY, next);
    set({ theme: next });
  },

  // ---------- Zoom & Pan ----------
  setZoom: (zoom) => set({ zoom: Math.max(0.05, Math.min(5, zoom)) }),
  zoomIn: () => set((s) => ({ zoom: Math.min(5, s.zoom * 1.2) })),
  zoomOut: () => set((s) => ({ zoom: Math.max(0.05, s.zoom / 1.2) })),
  resetView: () => set({ zoom: 0.4, panX: 0, panY: 0 }),
  setPan: (panX, panY) => set({ panX, panY }),

  // ---------- History ----------
  commit: () => {
    set((state) => ({
      past: [...state.past, snapshot(state)].slice(-50),
      future: [],
    }));
  },

  undo: () => {
    set((state) => {
      if (state.past.length === 0) return state;
      const previous = state.past[state.past.length - 1];
      const newPast = state.past.slice(0, -1);
      const current = snapshot(state);
      return {
        ...restore(state, previous),
        past: newPast,
        future: [current, ...state.future].slice(0, 50),
      };
    });
  },

  redo: () => {
    set((state) => {
      if (state.future.length === 0) return state;
      const next = state.future[0];
      const newFuture = state.future.slice(1);
      const current = snapshot(state);
      return {
        ...restore(state, next),
        past: [...state.past, current].slice(-50),
        future: newFuture,
      };
    });
  },

  // ---------- Item operations ----------
  addItem: (type, x = 0, y = 0) => {
    const def = get().getItemDef(type);
    if (!def) return;
    get().commit();
    set((state) => {
      const floors = state.floors.map((f) =>
        f.id === state.activeFloorId
          ? {
              ...f,
              items: [
                ...f.items,
                {
                  id: state.nextId,
                  type,
                  x: x !== 0 || y !== 0 ? x : 0,
                  y: x !== 0 || y !== 0 ? y : 0,
                  w: def.w,
                  h: def.h,
                  rotation: 0,
                  color: def.color,
                },
              ],
            }
          : f
      );
      return {
        floors,
        nextId: state.nextId + 1,
        selectedId: state.nextId,
        selectedType: 'item',
      };
    });
  },

  updateItem: (id, updates) => {
    set((state) => ({
      floors: state.floors.map((f) =>
        f.id === state.activeFloorId
          ? { ...f, items: f.items.map((it) => (it.id === id ? { ...it, ...updates } : it)) }
          : f
      ),
    }));
  },

  deleteSelected: () => {
    const state = get();
    if (state.selectedId == null) return;
    get().commit();
    set((s) => {
      const floors = s.floors.map((f) => {
        if (f.id !== s.activeFloorId) return f;
        if (s.selectedType === 'item')
          return { ...f, items: f.items.filter((it) => it.id !== s.selectedId) };
        if (s.selectedType === 'column')
          return { ...f, columns: f.columns.filter((c) => c.id !== s.selectedId) };
        if (s.selectedType === 'wall')
          return { ...f, walls: f.walls.filter((w) => w.id !== s.selectedId) };
        return f;
      });
      return { floors, selectedId: null, selectedType: null };
    });
  },

  rotateSelected: () => {
    const state = get();
    if (state.selectedId == null || state.selectedType !== 'item') return;
    get().commit();
    set((s) => ({
      floors: s.floors.map((f) =>
        f.id === s.activeFloorId
          ? {
              ...f,
              items: f.items.map((it) =>
                it.id === s.selectedId ? { ...it, rotation: it.rotation + Math.PI / 4 } : it
              ),
            }
          : f
      ),
    }));
  },

  duplicateSelected: () => {
    const state = get();
    if (state.selectedId == null || state.selectedType !== 'item') return;
    const floor = state.floors.find((f) => f.id === state.activeFloorId);
    const item = floor?.items.find((it) => it.id === state.selectedId);
    if (!item) return;
    get().commit();
    set((s) => ({
      floors: s.floors.map((f) =>
        f.id === s.activeFloorId
          ? { ...f, items: [...f.items, { ...item, id: s.nextId, x: item.x + 30, y: item.y + 30 }] }
          : f
      ),
      nextId: s.nextId + 1,
      selectedId: s.nextId,
    }));
  },

  // ---------- Custom Items CRUD ----------
  addCustomItem: (itemDef) => {
    get().commit();
    set((state) => {
      const id = `custom-${state.nextCustomItemId}`;
      const newItem = {
        ...itemDef,
        type: id,
        custom: true,
      };
      const cat = itemDef.category || 'bedroom';
      const existing = state.customItems[cat] || [];
      return {
        customItems: { ...state.customItems, [cat]: [...existing, newItem] },
        nextCustomItemId: state.nextCustomItemId + 1,
      };
    });
  },

  updateCustomItem: (type, updates) => {
    get().commit();
    set((state) => {
      const newCustom = { ...state.customItems };
      for (const cat in newCustom) {
        newCustom[cat] = newCustom[cat].map((it) =>
          it.type === type ? { ...it, ...updates } : it
        );
      }
      return { customItems: newCustom };
    });
  },

  deleteCustomItem: (type) => {
    get().commit();
    set((state) => {
      const newCustom = { ...state.customItems };
      for (const cat in newCustom) {
        newCustom[cat] = newCustom[cat].filter((it) => it.type !== type);
      }
      return { customItems: newCustom };
    });
  },

  // Get merged item definitions (default + custom)
  getItemDef: (type) => {
    // Check custom items first
    const custom = get().customItems;
    for (const cat in custom) {
      const found = custom[cat].find((i) => i.type === type);
      if (found) return found;
    }
    return getItemDefBase(type);
  },

  // Get merged all definitions
  getAllItemDefinitions: () => {
    const custom = get().customItems;
    const merged = JSON.parse(JSON.stringify(defaultItemDefinitions));
    for (const cat in custom) {
      if (!merged[cat]) merged[cat] = [];
      merged[cat] = [...merged[cat], ...custom[cat]];
    }
    return merged;
  },

  // ---------- Wall ----------
  addWall: (x1, y1, x2, y2) => {
    get().commit();
    set((state) => ({
      floors: state.floors.map((f) =>
        f.id === state.activeFloorId
          ? { ...f, walls: [...f.walls, { id: Date.now() + Math.floor(Math.random() * 1000), x1, y1, x2, y2 }] }
          : f
      ),
    }));
  },

  // ---------- Column ----------
  addColumn: (x, y, size = 30) => {
    get().commit();
    set((state) => ({
      floors: state.floors.map((f) =>
        f.id === state.activeFloorId
          ? { ...f, columns: [...f.columns, { id: Date.now() + Math.floor(Math.random() * 1000), x, y, size }] }
          : f
      ),
    }));
  },

  updateColumn: (id, updates) => {
    set((state) => ({
      floors: state.floors.map((f) =>
        f.id === state.activeFloorId
          ? { ...f, columns: f.columns.map((c) => (c.id === id ? { ...c, ...updates } : c)) }
          : f
      ),
    }));
  },

  // ---------- MEP: Pipes ----------
  addPipe: (pipeData) => {
    get().commit();
    set((state) => ({
      floors: state.floors.map((f) =>
        f.id === state.activeFloorId
          ? {
              ...f,
              pipes: [
                ...f.pipes,
                {
                  id: Date.now() + Math.floor(Math.random() * 1000),
                  ...pipeData,
                },
              ],
            }
          : f
      ),
    }));
  },

  // ---------- MEP: Wires ----------
  addWire: (wireData) => {
    get().commit();
    set((state) => ({
      floors: state.floors.map((f) =>
        f.id === state.activeFloorId
          ? {
              ...f,
              wires: [
                ...f.wires,
                {
                  id: Date.now() + Math.floor(Math.random() * 1000),
                  ...wireData,
                },
              ],
            }
          : f
      ),
    }));
  },

  // ---------- MEP: Fixtures ----------
  addFixture: (fixtureData) => {
    get().commit();
    set((state) => ({
      floors: state.floors.map((f) =>
        f.id === state.activeFloorId
          ? {
              ...f,
              fixtures: [
                ...f.fixtures,
                {
                  id: Date.now() + Math.floor(Math.random() * 1000),
                  ...fixtureData,
                },
              ],
            }
          : f
      ),
    }));
  },

  deleteMEPSelected: () => {
    const state = get();
    if (state.selectedId == null) return;
    const type = state.selectedType;
    if (!['pipe', 'wire', 'fixture'].includes(type)) return;
    get().commit();
    set((s) => ({
      floors: s.floors.map((f) => {
        if (f.id !== s.activeFloorId) return f;
        if (type === 'pipe') return { ...f, pipes: f.pipes.filter((p) => p.id !== s.selectedId) };
        if (type === 'wire') return { ...f, wires: f.wires.filter((w) => w.id !== s.selectedId) };
        if (type === 'fixture') return { ...f, fixtures: f.fixtures.filter((fx) => fx.id !== s.selectedId) };
        return f;
      }),
      selectedId: null,
      selectedType: null,
    }));
  },

  // ---------- MEP drawing state ----------
  setMepStart: (point) => set({ mepStart: point, isDrawingMEP: !!point }),

  // ---------- Selection ----------
  selectItem: (id, type = 'item') => set({ selectedId: id, selectedType: type }),
  clearSelection: () => set({ selectedId: null, selectedType: null }),

  // ---------- Cost settings ----------
  setCostSettings: (settings) => {
    get().commit();
    set({ costSettings: { ...get().costSettings, ...settings } });
  },

  // ---------- Plot settings ----------
  applyPlotSettings: ({ plot, building }) => {
    get().commit();
    set({ plot, building, isPlotModalOpen: false });
  },
  openPlotModal: () => set({ isPlotModalOpen: true, plotUnit: get().unit }),
  closePlotModal: () => set({ isPlotModalOpen: false }),
  openHelp: () => set({ isHelpOpen: true }),
  closeHelp: () => set({ isHelpOpen: false }),

  // ---------- Custom Item Modal ----------
  openCustomItemModal: (editing = null) =>
    set({ isCustomItemModalOpen: true, editingCustomItem: editing }),
  closeCustomItemModal: () => set({ isCustomItemModalOpen: false, editingCustomItem: null }),

  // ---------- Cost Modal ----------
  openCostModal: () => set({ isCostModalOpen: true }),
  closeCostModal: () => set({ isCostModalOpen: false }),

  // ---------- Export Modal ----------
  openExportModal: () => set({ isExportModalOpen: true }),
  closeExportModal: () => set({ isExportModalOpen: false }),

  // ---------- Preset Modal ----------
  openPresetModal: () => set({ isPresetModalOpen: true }),
  closePresetModal: () => set({ isPresetModalOpen: false }),
  loadPreset: (preset) => {
    get().commit();
    set({
      plot: { ...preset.plot },
      building: { ...preset.building },
      floors: preset.floors.map((f) => ({
        ...f,
        items: f.items.map((it) => ({ ...it })),
        walls: f.walls.map((w) => ({ ...w })),
        columns: f.columns.map((c) => ({ ...c })),
        pipes: [],
        wires: [],
        fixtures: [],
      })),
      activeFloorId: preset.floors[0].id,
      nextFloorId: preset.floors.length + 1,
      nextId: Math.max(...preset.floors.flatMap((f) => f.items.map((i) => i.id))) + 1,
      selectedId: null,
      selectedType: null,
      isPresetModalOpen: false,
    });
  },

  // ---------- Material Library Modal ----------
  openMaterialModal: () => set({ isMaterialModalOpen: true }),
  closeMaterialModal: () => set({ isMaterialModalOpen: false }),

  // ---------- Structural Analysis Modal ----------
  openStructuralModal: () => set({ isStructuralModalOpen: true }),
  closeStructuralModal: () => set({ isStructuralModalOpen: false }),
  // ---------- Document Export Modal ----------
  openDocumentModal: () => set({ isDocumentModalOpen: true }),
  closeDocumentModal: () => set({ isDocumentModalOpen: false }),
  // ---------- New Project Modal ----------
  openNewProjectModal: () => set({ isNewProjectModalOpen: true }),
  closeNewProjectModal: () => set({ isNewProjectModalOpen: false }),
  startNewProject: ({ plot: newPlot, building: newBuilding, includeColumns, floorHeight }) => {
    get().commit();
    const colSize = 30;
    // Building corners in absolute coordinates
    const left = -newPlot.width / 2 + newBuilding.offsetX;
    const right = left + newBuilding.width;
    const top = -newPlot.depth / 2 + newBuilding.offsetY;
    const bottom = top + newBuilding.depth;
    const columns = includeColumns ? [
      { id: Date.now() + 1, x: left, y: top, size: colSize },
      { id: Date.now() + 2, x: right, y: top, size: colSize },
      { id: Date.now() + 3, x: left, y: bottom, size: colSize },
      { id: Date.now() + 4, x: right, y: bottom, size: colSize },
    ] : [];

    set({
      plot: { width: newPlot.width, depth: newPlot.depth },
      building: {
        width: newBuilding.width,
        depth: newBuilding.depth,
        offsetX: newBuilding.offsetX,
        offsetY: newBuilding.offsetY,
      },
      floors: [{
        id: 1,
        name: 'Lantai 1',
        height: floorHeight || 300,
        items: [],
        walls: [],
        columns,
        pipes: [],
        wires: [],
        fixtures: [],
      }],
      activeFloorId: 1,
      nextFloorId: 2,
      nextId: 1,
      selectedId: null,
      selectedType: null,
      isNewProjectModalOpen: false,
      zoom: 0.4,
      panX: 0,
      panY: 0,
    });
  },
  setStructuralSettings: (settings) =>
    set((state) => ({ structuralSettings: { ...state.structuralSettings, ...settings } })),
  setSeismicSettings: (settings) =>
    set((state) => ({ seismicSettings: { ...state.seismicSettings, ...settings } })),
  setLiveLoadType: (type) => set({ liveLoadType: type }),
  setStructuralResults: (results) => set({ structuralResults: results }),

  // ---------- View 3D options ----------
  setView3DOption: (key, value) =>
    set((state) => ({ view3DOptions: { ...state.view3DOptions, [key]: value } })),

  // ---------- AR mode ----------
  setARMode: (enabled) => set({ isARMode: enabled }),

  // ---------- Collaboration ----------
  openCollabModal: () => set({ isCollabModalOpen: true }),
  closeCollabModal: () => set({ isCollabModalOpen: false }),
  joinCollab: (name) => {
    try {
      const info = collab.join(name);
      set({ collabActive: true, collabInfo: info });
      // Setup listeners
      collab.on('peerJoin', (id, name, color) => {
        set((state) => ({
          collabPeers: [...state.collabPeers.filter((p) => p.id !== id), { id, name, color, cursor: null }],
        }));
      });
      collab.on('peerLeave', (id) => {
        set((state) => ({ collabPeers: state.collabPeers.filter((p) => p.id !== id) }));
      });
      collab.on('peerCursor', (id, peer, x, y, mode) => {
        set((state) => ({
          collabPeers: state.collabPeers.map((p) =>
            p.id === id ? { ...p, cursor: { x, y, mode } } : p
          ),
        }));
      });
      collab.on('projectSync', (project, userId, userName) => {
        // Receive project from peer
        get().importProject(project);
        set((state) => ({
          collabMessages: [
            ...state.collabMessages,
            { userId, userName, text: '📊 Sinkronisasi project diterima', timestamp: Date.now(), system: true },
          ],
        }));
      });
      collab.on('message', (userId, userName, userColor, text) => {
        set((state) => ({
          collabMessages: [
            ...state.collabMessages,
            { userId, userName, userColor, text, timestamp: Date.now() },
          ],
        }));
      });
      return info;
    } catch (e) {
      console.error('Collab join failed:', e);
      return null;
    }
  },
  leaveCollab: () => {
    collab.leave();
    set({ collabActive: false, collabInfo: null, collabPeers: [] });
  },
  sendCollabMessage: (text) => {
    if (!get().collabActive) return;
    const info = get().collabInfo;
    collab.sendMessage(text);
    set((state) => ({
      collabMessages: [
        ...state.collabMessages,
        { userId: info.userId, userName: info.userName, userColor: info.userColor, text, timestamp: Date.now(), self: true },
      ],
    }));
  },
  sendCollabCursor: (x, y, mode) => {
    if (get().collabActive) collab.sendCursor(x, y, mode);
  },
  sendCollabProject: () => {
    if (!get().collabActive) return;
    const project = get().exportProject();
    collab.sendProjectSync(project);
    const info = get().collabInfo;
    set((state) => ({
      collabMessages: [
        ...state.collabMessages,
        { userId: info.userId, userName: info.userName, userColor: info.userColor, text: '📊 Project dikirim ke semua peer', timestamp: Date.now(), self: true, system: true },
      ],
    }));
  },

  // ---------- Floor management ----------
  addFloor: () => {
    get().commit();
    set((state) => {
      const newId = state.nextFloorId;
      return {
        floors: [...state.floors, createDefaultFloor(newId, `Lantai ${newId}`, 300)],
        nextFloorId: newId + 1,
        activeFloorId: newId,
        selectedId: null,
        selectedType: null,
      };
    });
  },

  removeFloor: () => {
    if (get().floors.length <= 1) return;
    get().commit();
    set((s) => {
      const idx = s.floors.findIndex((f) => f.id === s.activeFloorId);
      const newFloors = s.floors.filter((f) => f.id !== s.activeFloorId);
      const newActive = newFloors[Math.max(0, idx - 1)].id;
      return { floors: newFloors, activeFloorId: newActive, selectedId: null, selectedType: null };
    });
  },

  switchFloor: (floorId) => set({ activeFloorId: floorId, selectedId: null, selectedType: null }),

  renameFloor: (floorId, name) => {
    get().commit();
    set((state) => ({
      floors: state.floors.map((f) => (f.id === floorId ? { ...f, name } : f)),
    }));
  },

  setFloorHeight: (floorId, height) => {
    set((state) => ({
      floors: state.floors.map((f) =>
        f.id === floorId ? { ...f, height: Math.max(200, Math.min(500, height)) } : f
      ),
    }));
  },

  // ---------- Persistence (localStorage) ----------
  saveDesign: () => {
    const state = get();
    const data = {
      version: 2,
      plot: state.plot,
      building: state.building,
      floors: state.floors,
      nextId: state.nextId,
      nextFloorId: state.nextFloorId,
      customItems: state.customItems,
      nextCustomItemId: state.nextCustomItemId,
      costSettings: state.costSettings,
      savedAt: new Date().toISOString(),
    };
    localStorage.setItem('home-designer-pro', JSON.stringify(data));
    return data;
  },

  loadDesign: () => {
    const raw = localStorage.getItem('home-designer-pro');
    if (!raw) return null;
    try {
      const data = JSON.parse(raw);
      get().commit();
      set({
        plot: data.plot || get().plot,
        building: data.building || get().building,
        floors: data.floors || get().floors,
        nextId: data.nextId || get().nextId,
        nextFloorId: data.nextFloorId || get().nextFloorId,
        customItems: data.customItems || {},
        nextCustomItemId: data.nextCustomItemId || 1,
        costSettings: { ...defaultCostSettings, ...(data.costSettings || {}) },
        selectedId: null,
        selectedType: null,
      });
      return data;
    } catch {
      return null;
    }
  },

  // ---------- Project Export / Import (JSON file) ----------
  exportProject: () => {
    const state = get();
    return {
      version: 3,
      app: 'Home Designer Pro',
      exportedAt: new Date().toISOString(),
      plot: state.plot,
      building: state.building,
      floors: state.floors,
      nextId: state.nextId,
      nextFloorId: state.nextFloorId,
      customItems: state.customItems,
      nextCustomItemId: state.nextCustomItemId,
      costSettings: state.costSettings,
    };
  },

  importProject: (data) => {
    if (!data || !Array.isArray(data.floors)) throw new Error('Format file tidak valid: floors bukan array');
    get().commit();

    // Sanitize and validate imported data to prevent crashes
    const sanitizeNum = (v, defaultVal) => (typeof v === 'number' && isFinite(v) ? v : defaultVal);
    const sanitizeStr = (v, defaultVal) => (typeof v === 'string' ? v.slice(0, 100) : defaultVal);
    const sanitizeArr = (v) => (Array.isArray(v) ? v : []);

    // Ensure each floor has MEP arrays and valid structure
    const floors = (data.floors.length > 0 ? data.floors : [createDefaultFloor(1, 'Lantai 1', 300)]).map((f) => {
      if (!f || typeof f !== 'object') return createDefaultFloor(1, 'Lantai 1', 300);
      return {
        id: sanitizeNum(f.id, Date.now()),
        name: sanitizeStr(f.name, 'Lantai'),
        height: sanitizeNum(f.height, 300),
        items: sanitizeArr(f.items).filter(i => i && typeof i === 'object'),
        walls: sanitizeArr(f.walls).filter(w => w && typeof w === 'object'),
        columns: sanitizeArr(f.columns).filter(c => c && typeof c === 'object'),
        pipes: sanitizeArr(f.pipes),
        wires: sanitizeArr(f.wires),
        fixtures: sanitizeArr(f.fixtures),
      };
    });

    // Sanitize plot and building
    const plot = data.plot && typeof data.plot === 'object' ? {
      width: sanitizeNum(data.plot.width, 1500),
      depth: sanitizeNum(data.plot.depth, 2000),
    } : { width: 1500, depth: 2000 };

    const building = data.building && typeof data.building === 'object' ? {
      width: sanitizeNum(data.building.width, 1200),
      depth: sanitizeNum(data.building.depth, 1500),
      offsetX: sanitizeNum(data.building.offsetX, 150),
      offsetY: sanitizeNum(data.building.offsetY, 250),
    } : { width: 1200, depth: 1500, offsetX: 150, offsetY: 250 };

    set({
      plot,
      building,
      floors,
      nextId: sanitizeNum(data.nextId, 1),
      nextFloorId: sanitizeNum(data.nextFloorId, 2),
      customItems: data.customItems && typeof data.customItems === 'object' ? data.customItems : {},
      nextCustomItemId: sanitizeNum(data.nextCustomItemId, 1),
      costSettings: { ...defaultCostSettings, ...(data.costSettings && typeof data.costSettings === 'object' ? data.costSettings : {}) },
      activeFloorId: floors[0].id,
      selectedId: null,
      selectedType: null,
    });
  },

  clearAll: () => {
    get().commit();
    set({
      floors: [createDefaultFloor(1, 'Lantai 1', 300)],
      activeFloorId: 1,
      nextFloorId: 2,
      nextId: 1,
      selectedId: null,
      selectedType: null,
    });
  },

  setWallStart: (point) => set({ wallStart: point, isDrawingWall: !!point }),

  // ---------- Mobile responsive drawers ----------
  toggleLeftSidebar: () => set((s) => ({ leftSidebarOpen: !s.leftSidebarOpen })),
  toggleRightSidebar: () => set((s) => ({ rightSidebarOpen: !s.rightSidebarOpen })),
  openRightSidebar: () => set({ rightSidebarOpen: true }),
  toggleMobileToolbar: () => set((s) => ({ mobileToolbarOpen: !s.mobileToolbarOpen })),
  closeMobileDrawers: () => set({ leftSidebarOpen: false, rightSidebarOpen: false, mobileToolbarOpen: false }),

  // ---------- Multi-select ----------
  toggleMultiSelect: (id, type) => set((s) => {
    const key = `${type}-${id}`;
    const exists = s.selectedIds.includes(key);
    return {
      selectedIds: exists ? s.selectedIds.filter(k => k !== key) : [...s.selectedIds, key],
      selectedId: null,
      selectedType: null,
    };
  }),
  clearMultiSelect: () => set({ selectedIds: [] }),

  // ---------- Measure tool ----------
  setMeasuring: (val) => set({ isMeasuring: val, measureStart: null, measureResult: null }),
  setMeasureStart: (point) => set({ measureStart: point }),
  setMeasureResult: (result) => set({ measureResult: result }),

  // ---------- Snap ----------
  toggleSnap: () => set((s) => ({ snapToGridEnabled: !s.snapToGridEnabled })),
  setGridSize: (size) => set({ gridSize: Math.max(1, size) }),

  // ---------- Layers ----------
  toggleLayer: (layer) => set((s) => ({ layers: { ...s.layers, [layer]: !s.layers[layer] } })),
  openLayerPanel: () => set({ isLayerPanelOpen: true }),
  closeLayerPanel: () => set({ isLayerPanelOpen: false }),

  // ---------- Annotations ----------
  addAnnotation: (x, y, text) => set((s) => ({
    annotations: [...s.annotations, { id: Date.now(), x, y, text }],
  })),
  updateAnnotation: (id, updates) => set((s) => ({
    annotations: s.annotations.map(a => a.id === id ? { ...a, ...updates } : a),
  })),
  deleteAnnotation: (id) => set((s) => ({
    annotations: s.annotations.filter(a => a.id !== id),
  })),

  // ---------- Favorites ----------
  addFavorite: (type) => set((s) => ({
    favorites: [type, ...s.favorites.filter(t => t !== type)].slice(0, 8),
  })),

  // ---------- Context menu ----------
  showContextMenu: (x, y) => set({ contextMenu: { x, y, visible: true } }),
  hideContextMenu: () => set({ contextMenu: null }),

  // ---------- Auto-save ----------
  setLastAutoSave: (time) => set({ lastAutoSave: time }),

  // ---------- Onboarding ----------
  setOnboarded: () => {
    if (typeof localStorage !== 'undefined') localStorage.setItem('hdp-onboarded', 'true');
    set({ hasSeenOnboarding: true, onboardingStep: 0 });
  },
  setOnboardingStep: (step) => set({ onboardingStep: step }),

  // ---------- New modals ----------
  openUndoHistory: () => set({ isUndoHistoryOpen: true }),
  closeUndoHistory: () => set({ isUndoHistoryOpen: false }),
  openShareModal: () => set({ isShareModalOpen: true }),
  closeShareModal: () => set({ isShareModalOpen: false }),
  openPrintPreview: () => set({ isPrintPreviewOpen: true }),
  closePrintPreview: () => set({ isPrintPreviewOpen: false }),
  openBOMModal: () => set({ isBOMModalOpen: true }),
  closeBOMModal: () => set({ isBOMModalOpen: false }),
  openEngineeringModal: () => set({ isEngineeringModalOpen: true }),
  closeEngineeringModal: () => set({ isEngineeringModalOpen: false }),
  openBeamDesigner: () => set({ isBeamDesignerOpen: true }),
  closeBeamDesigner: () => set({ isBeamDesignerOpen: false }),
  openRoofDesigner: () => set({ isRoofDesignerOpen: true }),
  closeRoofDesigner: () => set({ isRoofDesignerOpen: false }),
  openRebarBOM: () => set({ isRebarBOMOpen: true }),
  closeRebarBOM: () => set({ isRebarBOMOpen: false }),
  openPermitCalculator: () => set({ isPermitCalculatorOpen: true }),
  closePermitCalculator: () => set({ isPermitCalculatorOpen: false }),
  setFoundationConfig: (cfg) => set((state) => ({ foundationConfig: { ...state.foundationConfig, ...cfg } })),
  setRoofConfig: (cfg) => set((state) => ({ roofConfig: { ...state.roofConfig, ...cfg } })),

  // ---------- Copy/Paste between floors ----------
  copyToFloor: (targetFloorId) => {
    const s = get();
    const activeFloor = s.floors.find(f => f.id === s.activeFloorId);
    if (!activeFloor) return;
    const selectedItems = activeFloor.items.filter(i => s.selectedIds.includes(`item-${i.id}`));
    if (selectedItems.length === 0 && s.selectedId != null) {
      const item = activeFloor.items.find(i => i.id === s.selectedId);
      if (item) selectedItems.push(item);
    }
    if (selectedItems.length === 0) return;
    get().commit();
    set((state) => ({
      floors: state.floors.map(f => {
        if (f.id !== targetFloorId) return f;
        const newItems = selectedItems.map(item => ({
          ...item, id: Date.now() + Math.floor(Math.random()*1000),
          x: item.x + 30, y: item.y + 30,
        }));
        return { ...f, items: [...f.items, ...newItems] };
      }),
    }));
  },

  // ---------- Zoom to fit ----------
  zoomToFit: () => {
    const s = get();
    const canvas = document.getElementById('canvas2d');
    if (!canvas) return;
    const floor = s.floors.find(f => f.id === s.activeFloorId);
    if (!floor) return;
    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
    const check = (x, y) => { if(isFinite(x)&&isFinite(y)){minX=Math.min(minX,x);maxX=Math.max(maxX,x);minY=Math.min(minY,y);maxY=Math.max(maxY,y);} };
    floor.items.forEach(i => { check(i.x - i.w/2, i.y - i.h/2); check(i.x + i.w/2, i.y + i.h/2); });
    floor.walls.forEach(w => { check(w.x1, w.y1); check(w.x2, w.y2); });
    floor.columns.forEach(c => check(c.x, c.y));
    check(-s.plot.width/2, -s.plot.depth/2);
    check(s.plot.width/2, s.plot.depth/2);
    if (!isFinite(minX)) return;
    const contentW = Math.max(1, maxX - minX);
    const contentH = Math.max(1, maxY - minY);
    const padding = 100;
    const zoomX = (canvas.width - padding * 2) / contentW;
    const zoomY = (canvas.height - padding * 2) / contentH;
    const newZoom = Math.max(0.05, Math.min(zoomX, zoomY, 5));
    const centerX = (minX + maxX) / 2;
    const centerY = (minY + maxY) / 2;
    set({ zoom: newZoom, panX: -centerX * newZoom, panY: -centerY * newZoom });
  },

  // ---------- Share via URL ----------
  shareViaURL: () => {
    const data = get().exportProject();
    const json = JSON.stringify(data);
    try {
      const encoded = btoa(unescape(encodeURIComponent(json)));
      const url = `${window.location.origin}${window.location.pathname}#project=${encoded}`;
      if (navigator.clipboard) navigator.clipboard.writeText(url).catch(() => {});
      return url;
    } catch(e) { return null; }
  },

  // ---------- Load from URL ----------
  loadFromURL: () => {
    const hash = window.location.hash;
    if (hash.startsWith('#project=')) {
      try {
        const encoded = hash.substring(9);
        const json = decodeURIComponent(escape(atob(encoded)));
        const data = JSON.parse(json);
        if (data && data.floors) {
          get().importProject(data);
          history.replaceState(null, '', window.location.pathname + window.location.search);
          return true;
        }
      } catch(e) { console.warn('Failed to load from URL:', e); }
    }
    return false;
  },
}));

// ============= SELECTORS =============
export const useActiveFloor = () =>
  useStore((s) => s.floors.find((f) => f.id === s.activeFloorId) || s.floors[0]);
