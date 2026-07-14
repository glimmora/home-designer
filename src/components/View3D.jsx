import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { useStore } from '../lib/store';
import { getItemDef } from '../lib/itemDefinitions';

export default function View3D() {
  const mountRef = useRef(null);
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const rendererRef = useRef(null);
  const orbitRef = useRef({
    theta: Math.PI / 4,
    phi: Math.PI / 4,
    distance: 2500,
    target: new THREE.Vector3(0, 0, 0),
  });
  const animationRef = useRef(null);

  const state = useStore();
  const { floors, plot, building, viewMode, activeFloorId, unit, theme, view3DOptions } = state;
  const activeFloor = floors.find((f) => f.id === activeFloorId) || floors[0];

  // ---------- Init Three.js scene ----------
  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const scene = new THREE.Scene();
    const bgColor = theme === 'dark' ? 0x0f172a : 0xe8f0f8;
    scene.background = new THREE.Color(bgColor);
    scene.fog = new THREE.Fog(bgColor, 4000, 10000);

    const camera = new THREE.PerspectiveCamera(
      60,
      mount.clientWidth / mount.clientHeight,
      0.1,
      30000
    );

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;
    mount.appendChild(renderer.domElement);

    // Lights - softer and more natural
    scene.add(new THREE.AmbientLight(0xffffff, 0.45));
    const dirLight = new THREE.DirectionalLight(0xfff5e6, 0.85);
    dirLight.position.set(1500, 2500, 1000);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 2048;
    dirLight.shadow.mapSize.height = 2048;
    dirLight.shadow.camera.left = -3000;
    dirLight.shadow.camera.right = 3000;
    dirLight.shadow.camera.top = 3000;
    dirLight.shadow.camera.bottom = -3000;
    dirLight.shadow.camera.near = 100;
    dirLight.shadow.camera.far = 8000;
    scene.add(dirLight);
    scene.add(new THREE.HemisphereLight(0x87ceeb, 0x8b7355, 0.35));

    sceneRef.current = scene;
    cameraRef.current = camera;
    rendererRef.current = renderer;
    // Expose scene globally for export
    window.__threeScene = scene;

    // ---------- Custom orbit controls ----------
    const orbit = orbitRef.current;
    let isDragging = false;
    let lastMouse = { x: 0, y: 0 };

    const updateCamera = () => {
      const x = orbit.target.x + orbit.distance * Math.sin(orbit.phi) * Math.cos(orbit.theta);
      const y = orbit.target.y + orbit.distance * Math.cos(orbit.phi);
      const z = orbit.target.z + orbit.distance * Math.sin(orbit.phi) * Math.sin(orbit.theta);
      camera.position.set(x, y, z);
      camera.lookAt(orbit.target);
    };
    updateCamera();

    const onMouseDown = (e) => {
      isDragging = true;
      lastMouse = { x: e.clientX, y: e.clientY };
    };
    const onMouseMove = (e) => {
      if (!isDragging) return;
      const dx = e.clientX - lastMouse.x;
      const dy = e.clientY - lastMouse.y;
      orbit.theta -= dx * 0.005;
      orbit.phi = Math.max(0.1, Math.min(Math.PI / 2 - 0.05, orbit.phi - dy * 0.005));
      lastMouse = { x: e.clientX, y: e.clientY };
      updateCamera();
    };
    const onMouseUp = () => {
      isDragging = false;
    };
    const onWheel = (e) => {
      e.preventDefault();
      orbit.distance = Math.max(500, Math.min(15000, orbit.distance + e.deltaY * 3));
      updateCamera();
    };
    const onContext = (e) => e.preventDefault();

    // Touch handlers for mobile 3D
    let touchLastDist = 0;
    const onTouchStart = (e) => {
      e.preventDefault();
      if (e.touches.length === 1) {
        isDragging = true;
        lastMouse = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      } else if (e.touches.length === 2) {
        const t1 = e.touches[0];
        const t2 = e.touches[1];
        touchLastDist = Math.hypot(t1.clientX - t2.clientX, t1.clientY - t2.clientY);
      }
    };
    const onTouchMove = (e) => {
      e.preventDefault();
      if (e.touches.length === 1 && isDragging) {
        const dx = e.touches[0].clientX - lastMouse.x;
        const dy = e.touches[0].clientY - lastMouse.y;
        orbit.theta -= dx * 0.005;
        orbit.phi = Math.max(0.1, Math.min(Math.PI / 2 - 0.05, orbit.phi - dy * 0.005));
        lastMouse = { x: e.touches[0].clientX, y: e.touches[0].clientY };
        updateCamera();
      } else if (e.touches.length === 2 && touchLastDist > 0) {
        const t1 = e.touches[0];
        const t2 = e.touches[1];
        const dist = Math.hypot(t1.clientX - t2.clientX, t1.clientY - t2.clientY);
        const delta = touchLastDist - dist;
        orbit.distance = Math.max(500, Math.min(15000, orbit.distance + delta * 5));
        touchLastDist = dist;
        updateCamera();
      }
    };
    const onTouchEnd = (e) => {
      if (e.touches.length === 0) {
        isDragging = false;
        touchLastDist = 0;
      }
    };

    const canvas = renderer.domElement;
    canvas.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    canvas.addEventListener('wheel', onWheel, { passive: false });
    canvas.addEventListener('contextmenu', onContext);
    canvas.addEventListener('touchstart', onTouchStart, { passive: false });
    canvas.addEventListener('touchmove', onTouchMove, { passive: false });
    canvas.addEventListener('touchend', onTouchEnd);

    // Resize
    const onResize = () => {
      if (!mount) return;
      camera.aspect = mount.clientWidth / mount.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(mount.clientWidth, mount.clientHeight);
    };
    window.addEventListener('resize', onResize);

    // Handle WebGL context loss (important for production stability)
    const onContextLost = (e) => {
      e.preventDefault();
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      console.warn('WebGL context lost - 3D view paused');
    };
    const onContextRestored = () => {
      console.log('WebGL context restored - resuming 3D view');
      const animate = () => {
        animationRef.current = requestAnimationFrame(animate);
        if (rendererRef.current && sceneRef.current && cameraRef.current) {
          rendererRef.current.render(sceneRef.current, cameraRef.current);
        }
      };
      animate();
    };
    renderer.domElement.addEventListener('webglcontextlost', onContextLost, false);
    renderer.domElement.addEventListener('webglcontextrestored', onContextRestored, false);

    // Animation loop
    const animate = () => {
      animationRef.current = requestAnimationFrame(animate);
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(animationRef.current);
      canvas.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      canvas.removeEventListener('touchstart', onTouchStart);
      canvas.removeEventListener('touchmove', onTouchMove);
      canvas.removeEventListener('touchend', onTouchEnd);
      canvas.removeEventListener('wheel', onWheel);
      canvas.removeEventListener('contextmenu', onContext);
      canvas.removeEventListener('webglcontextlost', onContextLost);
      canvas.removeEventListener('webglcontextrestored', onContextRestored);
      window.removeEventListener('resize', onResize);
      if (mount.contains(renderer.domElement)) {
        mount.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  // ---------- Rebuild scene when state changes ----------
  useEffect(() => {
    const scene = sceneRef.current;
    if (!scene || !activeFloor) return;

    // Clear previous objects (keep lights)
    const toRemove = scene.children.filter(
      (c) => !(c.isLight || c.isAmbientLight || c.isHemisphereLight || c.isDirectionalLight)
    );
    toRemove.forEach((obj) => {
      scene.remove(obj);
      if (obj.geometry) obj.geometry.dispose();
      if (obj.material) {
        if (Array.isArray(obj.material)) obj.material.forEach((m) => m.dispose());
        else obj.material.dispose();
      }
    });

    const isStructural = viewMode === 'structural';
    let totalHeight = 0;
    floors.forEach((f) => (totalHeight += f.height));
    const baseY = 0;

    // Outer ground
    const outerGround = new THREE.Mesh(
      new THREE.PlaneGeometry(10000, 10000),
      new THREE.MeshStandardMaterial({ color: 0x9ca88a, roughness: 1 })
    );
    outerGround.rotation.x = -Math.PI / 2;
    outerGround.position.y = baseY - 2;
    outerGround.receiveShadow = true;
    scene.add(outerGround);

    // Plot (tanah)
    const plotMesh = new THREE.Mesh(
      new THREE.PlaneGeometry(plot.width, plot.depth),
      new THREE.MeshStandardMaterial({
        color: isStructural ? 0x86efac : 0x86efac,
        roughness: 0.9,
        transparent: isStructural,
        opacity: isStructural ? 0.4 : 0.8,
      })
    );
    plotMesh.rotation.x = -Math.PI / 2;
    plotMesh.position.y = baseY + 0.5;
    plotMesh.receiveShadow = true;
    scene.add(plotMesh);

    // Plot border
    const plotBorder = new THREE.LineSegments(
      new THREE.EdgesGeometry(new THREE.PlaneGeometry(plot.width, plot.depth)),
      new THREE.LineBasicMaterial({ color: 0x166534 })
    );
    plotBorder.rotation.x = -Math.PI / 2;
    plotBorder.position.y = baseY + 1;
    scene.add(plotBorder);

    // Building footprint
    const bldgX = -plot.width / 2 + building.offsetX + building.width / 2;
    const bldgZ = -plot.depth / 2 + building.offsetY + building.depth / 2;

    const bldgFoot = new THREE.Mesh(
      new THREE.PlaneGeometry(building.width, building.depth),
      new THREE.MeshStandardMaterial({
        color: isStructural ? 0xfef3c7 : 0xd4a574,
        roughness: 0.8,
        transparent: isStructural,
        opacity: isStructural ? 0.5 : 1,
      })
    );
    bldgFoot.rotation.x = -Math.PI / 2;
    bldgFoot.position.set(bldgX, baseY + 1, bldgZ);
    bldgFoot.receiveShadow = true;
    scene.add(bldgFoot);

    const bldgBorder = new THREE.LineSegments(
      new THREE.EdgesGeometry(new THREE.PlaneGeometry(building.width, building.depth)),
      new THREE.LineBasicMaterial({ color: 0x1e40af })
    );
    bldgBorder.rotation.x = -Math.PI / 2;
    bldgBorder.position.set(bldgX, baseY + 2, bldgZ);
    scene.add(bldgBorder);

    // Grid
    const grid = new THREE.GridHelper(4000, 40, 0x666666, 0xcccccc);
    grid.position.y = baseY + 0.5;
    grid.material.transparent = true;
    grid.material.opacity = 0.3;
    scene.add(grid);

    // Build floors stacked
    let currentY = baseY;
    floors.forEach((floor, fIdx) => {
      const isActive = floor.id === activeFloorId;
      const floorGroup = new THREE.Group();

      // Floor slab
      const slab = new THREE.Mesh(
        new THREE.BoxGeometry(building.width, 10, building.depth),
        new THREE.MeshStandardMaterial({
          color: isActive ? 0xa78bfa : 0x94a3b8,
          roughness: 0.9,
          metalness: 0.0,
          transparent: !isActive,
          opacity: isActive ? 0.95 : 0.55,
        })
      );
      slab.position.set(bldgX, currentY + 5, bldgZ);
      slab.receiveShadow = true;
      floorGroup.add(slab);

      // Walls
      floor.walls.forEach((wall) => {
        const dx = wall.x2 - wall.x1;
        const dz = wall.y2 - wall.y1;
        const length = Math.sqrt(dx * dx + dz * dz);
        if (length < 1) return;
        const angle = Math.atan2(dz, dx);
        const wallMesh = new THREE.Mesh(
          new THREE.BoxGeometry(length, floor.height, 15),
          new THREE.MeshStandardMaterial({
            color: isStructural ? 0x94a3b8 : 0xf5f0e8,
            transparent: isStructural,
            opacity: isStructural ? 0.3 : 0.92,
            roughness: 0.85,
            metalness: 0.0,
          })
        );
        wallMesh.position.set(
          (wall.x1 + wall.x2) / 2,
          currentY + floor.height / 2 + 5,
          (wall.y1 + wall.y2) / 2
        );
        wallMesh.rotation.y = -angle;
        wallMesh.castShadow = !isStructural;
        wallMesh.receiveShadow = true;
        floorGroup.add(wallMesh);

        if (isStructural) {
          const edgeLines = new THREE.LineSegments(
            new THREE.EdgesGeometry(wallMesh.geometry),
            new THREE.LineBasicMaterial({ color: 0x475569 })
          );
          edgeLines.position.copy(wallMesh.position);
          edgeLines.rotation.copy(wallMesh.rotation);
          floorGroup.add(edgeLines);
        }
      });

      // Items
      floor.items.forEach((item) => {
        const def = getItemDef(item.type);
        if (!def) return;
        const isStructuralItem = def.structural;
        const isStairs = item.type && (item.type === 'stairs' || item.type.startsWith('stairs'));
        const isFenceItem = item.type && item.type.startsWith('fence-');
        const isSteelRailing = item.type && (
          item.type.startsWith('fence-stainless') ||
          item.type === 'fence-steel-pipe' ||
          item.type === 'fence-aluminum-slat' ||
          item.type === 'fence-glass-frameless' ||
          item.type === 'fence-wire-rope' ||
          item.type === 'fence-wood-slat-vertical'
        );
        const isGateItem = item.type && item.type.startsWith('gate-');
        const isTreeItem = item.type === 'tree' || item.type === 'tree-palm' || item.type === 'tree-small';
        const isPoolItem = item.type === 'swimming-pool' || item.type === 'pond';
        const isGrassItem = item.type === 'grass' || item.type === 'patio' || item.type === 'deck' || item.type === 'pathway' || item.type === 'driveway' || item.type === 'pool-deck';

        const isLighting = item.type && item.type.startsWith('light-');
        const isCeiling = item.type && item.type.startsWith('ceiling-') && item.type !== 'ceiling-fan';
        const isTrim = item.type && (item.type.startsWith('lisplang-') || item.type.startsWith('tali-air-') || item.type.startsWith('list-'));
        const isVentilation = item.type && item.type.startsWith('vent-');
        const isFlooring = item.type && item.type.startsWith('floor-') && item.type !== 'floor-drain' && item.type !== 'floor-lamp';
        const isSpecialColumn = item.type && (item.type.startsWith('column-wood') || item.type.startsWith('column-steel') || item.type.startsWith('column-marble') || item.type.startsWith('column-classic') || item.type.startsWith('column-modern') || item.type.startsWith('column-hexagon') || item.type.startsWith('column-octagon') || item.type.startsWith('column-fence') || item.type.startsWith('column-lamp') || item.type.startsWith('column-canopy') || item.type.startsWith('column-decorative') || item.type === 'column-rect' || item.type === 'column-round' || item.type === 'beam' || item.type === 'foundation' || item.type === 'retaining-wall');
        const isSanitary = item.type && (item.type.startsWith('closet-') || item.type.startsWith('bathtub-') || item.type.startsWith('shower-') || item.type.startsWith('sink-') || item.type === 'bidet' || item.type === 'urinoir' || item.type === 'floor-drain' || item.type === 'water-tap' || item.type.startsWith('water-heater') || item.type.startsWith('toren') || item.type === 'septic-tank' || item.type === 'sumur-air' || item.type === 'pump-water' || item.type === 'toilet' || item.type === 'toilet-squat' || item.type === 'bathtub' || item.type === 'shower' || item.type === 'bathroom-sink' || item.type === 'double-vanity' || item.type === 'mirror' || item.type === 'mirror-large');
        const isElectrical = item.type && (item.type.startsWith('outlet-') || item.type.startsWith('switch-') || item.type.startsWith('mcb-') || item.type === 'doorbell' || item.type.startsWith('cctv') || item.type === 'intercom' || item.type === 'motion-sensor' || item.type === 'smoke-detector' || item.type === 'antenna-tv' || item.type === 'smart-hub' || item.type === 'ev-charger');
        const isKitchenItem = item.type && (
          item.type.startsWith('counter-') ||
          item.type.startsWith('kitchen-') ||
          item.type.startsWith('cabinet-') ||
          item.type.startsWith('stove-') ||
          item.type.startsWith('range-hood') ||
          item.type.startsWith('fridge-') ||
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
        const isAppliance = item.type && (item.type.startsWith('ac-') || item.type.startsWith('fan-') || item.type.startsWith('tv-') || item.type === 'home-theater' || item.type === 'speaker-stand' || item.type.startsWith('washing-') || item.type === 'dryer' || item.type === 'microwave' || item.type === 'dispenser' || item.type === 'water-purifier' || item.type === 'vacuum' || item.type === 'ceiling-fan');
        const isDecor = item.type && (item.type.startsWith('painting-') || item.type.startsWith('photo-') || item.type.startsWith('vase-') || item.type.startsWith('mirror-') || item.type.startsWith('curtain-') || item.type.startsWith('blind-') || item.type.startsWith('rug-') || item.type.startsWith('plant-') || item.type === 'sculpture' || item.type === 'wall-clock' || item.type === 'candle-set' || item.type === 'book-stack');
        const isWallFinish = item.type && (item.type.startsWith('wall-') || item.type.startsWith('wallpaper-'));
        const isBedroomItem = item.type && (item.type === 'bed' || item.type === 'bed-king' || item.type === 'single-bed' || item.type === 'bunk-bed' || item.type === 'wardrobe' || item.type === 'walk-in-closet' || item.type === 'nightstand' || item.type === 'dresser' || item.type === 'desk' || item.type === 'vanity-table' || item.type === 'chaise-longue');
        const isDoorItem = item.type && (item.type === 'door' || item.type.startsWith('door-') || item.type === 'sliding-door' || item.type === 'folding-door' || item.type === 'french-door' || item.type === 'window' || item.type.startsWith('window-') || item.type === 'skylight' || item.type === 'louver-window');
        const isOutdoorExtra = item.type && (item.type === 'carport' || item.type === 'carport-2' || item.type === 'garage-door' || item.type === 'bush' || item.type === 'flower-bed' || item.type === 'gazebo' || item.type === 'pergola' || item.type === 'lamp-post' || item.type === 'garden-bench' || item.type === 'fountain' || item.type === 'mailbox');
        const isMEPItem = item.type && (item.type.startsWith('pipe-') || item.type.startsWith('cable-') || item.type.startsWith('conduit-') || item.type === 'grounding-rod-5-8' || item.type === 'busbar-copper-100a' || item.type === 'cabel-fiber-optic');
        const isWeatherItem = item.type && (item.type.startsWith('hood-') || item.type.startsWith('canopy-') || item.type.startsWith('drip-course') || item.type.startsWith('weather-shed') || item.type.startsWith('coping-'));

        if (isStairs) {
          build3DStairs(floorGroup, item, bldgX, bldgZ, currentY, building, isStructural);
        } else if (isSteelRailing) {
          build3DSteelRailing(floorGroup, item, bldgX, bldgZ, currentY, building, def);
        } else if (isLighting) {
          build3DLighting(floorGroup, item, bldgX, bldgZ, currentY, building, def);
        } else if (isCeiling) {
          build3DCeiling(floorGroup, item, bldgX, bldgZ, currentY, building, def);
        } else if (isTrim) {
          build3DTrim(floorGroup, item, bldgX, bldgZ, currentY, building, def);
        } else if (isVentilation) {
          build3DVentilation(floorGroup, item, bldgX, bldgZ, currentY, building, def);
        } else if (isFlooring) {
          build3DFlooring(floorGroup, item, bldgX, bldgZ, currentY, building, def);
        } else if (isSpecialColumn) {
          build3DSpecialColumn(floorGroup, item, bldgX, bldgZ, currentY, building, def, isStructural);
        } else if (isSanitary) {
          build3DSanitary(floorGroup, item, bldgX, bldgZ, currentY, building, def);
        } else if (isElectrical) {
          build3DElectrical(floorGroup, item, bldgX, bldgZ, currentY, building, def);
        } else if (isKitchenItem) {
          build3DKitchen(floorGroup, item, bldgX, bldgZ, currentY, building, def);
        } else if (isAppliance) {
          build3DAppliance(floorGroup, item, bldgX, bldgZ, currentY, building, def);
        } else if (isDecor) {
          build3DDecor(floorGroup, item, bldgX, bldgZ, currentY, building, def);
        } else if (isWallFinish) {
          build3DWallFinish(floorGroup, item, bldgX, bldgZ, currentY, building, def);
        } else if (isBedroomItem) {
          build3DBedroom(floorGroup, item, bldgX, bldgZ, currentY, building, def);
        } else if (isDoorItem) {
          build3DDoor(floorGroup, item, bldgX, bldgZ, currentY, building, def);
        } else if (isOutdoorExtra) {
          build3DOutdoorExtra(floorGroup, item, bldgX, bldgZ, currentY, building, def);
        } else if (isMEPItem) {
          build3DMEP(floorGroup, item, bldgX, bldgZ, currentY, building, def);
        } else if (isWeatherItem) {
          build3DWeather(floorGroup, item, bldgX, bldgZ, currentY, building, def);
        } else if (isFenceItem) {
          build3DFence(floorGroup, item, bldgX, bldgZ, currentY, building, def);
        } else if (isGateItem) {
          build3DGate(floorGroup, item, bldgX, bldgZ, currentY, building, def);
        } else if (isTreeItem) {
          build3DTree(floorGroup, item, bldgX, bldgZ, currentY, building, def);
        } else if (isPoolItem) {
          build3DPool(floorGroup, item, bldgX, bldgZ, currentY, building, def);
        } else if (isGrassItem) {
          build3DGrassArea(floorGroup, item, bldgX, bldgZ, currentY, building, def);
        } else {
          // Enhanced 3D rendering with better materials based on item type
          const itemColor = normalizeHex(item.color || def.color || '#8B7355');
          let material;
          const itemType = item.type;

          if (itemType.includes('bed') || itemType.includes('sofa') || itemType.includes('armchair')) {
            // Fabric/furniture - soft material with slight sheen
            material = new THREE.MeshStandardMaterial({
              color: itemColor,
              roughness: 0.85,
              metalness: 0.0,
              transparent: isStructural && !isStructuralItem,
              opacity: isStructural && !isStructuralItem ? 0.15 : 1,
            });
          } else if (itemType.includes('fridge') || itemType.includes('stove') || itemType.includes('sink') || itemType.includes('oven')) {
            // Metal appliances - shiny
            material = new THREE.MeshStandardMaterial({
              color: itemColor,
              roughness: 0.25,
              metalness: 0.7,
              transparent: isStructural && !isStructuralItem,
              opacity: isStructural && !isStructuralItem ? 0.15 : 1,
            });
          } else if (itemType.includes('toilet') || itemType.includes('bathtub') || itemType.includes('shower') || itemType.includes('sink')) {
            // Ceramic - smooth and glossy
            material = new THREE.MeshStandardMaterial({
              color: itemColor,
              roughness: 0.15,
              metalness: 0.0,
              transparent: isStructural && !isStructuralItem,
              opacity: isStructural && !isStructuralItem ? 0.15 : 1,
            });
          } else if (itemType.includes('door') || itemType.includes('window') || itemType.includes('wardrobe') || itemType.includes('desk')) {
            // Wood - medium roughness
            material = new THREE.MeshStandardMaterial({
              color: itemColor,
              roughness: 0.7,
              metalness: 0.0,
              transparent: isStructural && !isStructuralItem,
              opacity: isStructural && !isStructuralItem ? 0.15 : 1,
            });
          } else if (itemType.includes('glass') || itemType.includes('window') || itemType.includes('mirror')) {
            // Glass - transparent
            material = new THREE.MeshPhysicalMaterial({
              color: itemColor,
              roughness: 0.05,
              metalness: 0.0,
              transmission: 0.8,
              transparent: true,
              opacity: 0.4,
              ior: 1.5,
            });
          } else {
            // Default - standard
            material = new THREE.MeshStandardMaterial({
              color: itemColor,
              roughness: 0.6,
              metalness: 0.1,
              transparent: isStructural && !isStructuralItem,
              opacity: isStructural && !isStructuralItem ? 0.15 : 1,
            });
          }

          const itemMesh = new THREE.Mesh(
            new THREE.BoxGeometry(item.w, def.height3d || 80, item.h),
            material
          );
          itemMesh.position.set(
            item.x,
            currentY + (def.height3d || 80) / 2 + 5,
            item.y
          );
          itemMesh.rotation.y = -item.rotation;
          itemMesh.castShadow = !isStructural || isStructuralItem;
          itemMesh.receiveShadow = true;
          floorGroup.add(itemMesh);

          // Always add edge wireframe for better visibility
          const edgeColor = isStructural
            ? (isStructuralItem ? 0x92400e : 0x475569)
            : 0x000000;
          const edgeLines = new THREE.LineSegments(
            new THREE.EdgesGeometry(itemMesh.geometry),
            new THREE.LineBasicMaterial({ color: edgeColor })
          );
          edgeLines.position.copy(itemMesh.position);
          edgeLines.rotation.copy(itemMesh.rotation);
          floorGroup.add(edgeLines);
        }
      });

      // Columns
      floor.columns.forEach((col) => {
        const colMesh = new THREE.Mesh(
          new THREE.BoxGeometry(col.size, floor.height, col.size),
          new THREE.MeshStandardMaterial({
            color: isStructural ? 0xef4444 : 0xd1d5db,
            roughness: 0.6,
            transparent: viewMode === 'rebar',
            opacity: viewMode === 'rebar' ? 0.2 : 1,
          })
        );
        colMesh.position.set(
          col.x,
          currentY + floor.height / 2 + 5,
          col.y
        );
        colMesh.castShadow = true;
        colMesh.receiveShadow = true;
        floorGroup.add(colMesh);

        const edgeLines = new THREE.LineSegments(
          new THREE.EdgesGeometry(colMesh.geometry),
          new THREE.LineBasicMaterial({ color: isStructural ? 0x991b1b : 0x64748b })
        );
        edgeLines.position.copy(colMesh.position);
        floorGroup.add(edgeLines);

        // ===== Rebar visualization (mode: rebar, structural) - SNI 03-2847-2002 compliant =====
        if ((viewMode === 'rebar' || viewMode === 'structural') && view3DOptions.showRebar) {
          // Get SNI structural settings from store
          const stSettings = useStore.getState().structuralSettings;
          const coverCm = (stSettings?.cover || 40) / 10; // mm → cm
          const mainDiameterCm = (stSettings?.mainBarDiameter || 16) / 10;
          const stirrupDiameterCm = (stSettings?.stirrupDiameter || 8) / 10;
          const stirrupSpacingCm = (stSettings?.stirrupSpacing || 150) / 10;
          const numMainBars = stSettings?.numMainBars || 4;

          const rebarGroup = new THREE.Group();

          // Main rebars - positions per SNI (corner + sides based on count)
          const cornerOffset = col.size / 2 - coverCm - stirrupDiameterCm - mainDiameterCm / 2;
          const mainBarPositions = [];

          // 4 corner bars (always)
          mainBarPositions.push([cornerOffset, cornerOffset]);
          mainBarPositions.push([-cornerOffset, cornerOffset]);
          mainBarPositions.push([cornerOffset, -cornerOffset]);
          mainBarPositions.push([-cornerOffset, -cornerOffset]);

          // Additional side bars per SNI 10.9 (if numMainBars > 4)
          if (numMainBars >= 6) {
            mainBarPositions.push([0, cornerOffset]);
            mainBarPositions.push([0, -cornerOffset]);
          }
          if (numMainBars >= 8) {
            mainBarPositions.push([cornerOffset, 0]);
            mainBarPositions.push([-cornerOffset, 0]);
          }
          if (numMainBars >= 10) {
            mainBarPositions.push([cornerOffset / 2, cornerOffset]);
            mainBarPositions.push([-cornerOffset / 2, cornerOffset]);
          }
          if (numMainBars >= 12) {
            mainBarPositions.push([cornerOffset / 2, -cornerOffset]);
            mainBarPositions.push([-cornerOffset / 2, -cornerOffset]);
          }

          // Render main rebars (vertical cylinders)
          mainBarPositions.forEach(([cx, cz]) => {
            const rebar = new THREE.Mesh(
              new THREE.CylinderGeometry(mainDiameterCm / 2, mainDiameterCm / 2, floor.height, 12),
              new THREE.MeshStandardMaterial({
                color: 0x334155,
                metalness: 0.85,
                roughness: 0.3,
              })
            );
            rebar.position.set(
              col.x + cx,
              currentY + floor.height / 2 + 5,
              col.y + cz
            );
            rebarGroup.add(rebar);
          });

          // Stirrups per SNI 7.10 (sengkang along height with proper spacing)
          const stirrupCount = Math.floor(floor.height / stirrupSpacingCm);
          const stirrupSize = col.size - 2 * coverCm - 2 * stirrupDiameterCm;

          for (let i = 0; i <= stirrupCount; i++) {
            const y = currentY + 5 + i * stirrupSpacingCm;
            // Rectangular stirrup (4 sides)
            const ringPoints = [
              [-stirrupSize/2, -stirrupSize/2],
              [stirrupSize/2, -stirrupSize/2],
              [stirrupSize/2, stirrupSize/2],
              [-stirrupSize/2, stirrupSize/2],
              [-stirrupSize/2, -stirrupSize/2],
            ];
            for (let j = 0; j < ringPoints.length - 1; j++) {
              const [x1, z1] = ringPoints[j];
              const [x2, z2] = ringPoints[j + 1];
              const len = Math.sqrt((x2-x1)**2 + (z2-z1)**2);
              if (len < 0.1) continue;
              const stirrup = new THREE.Mesh(
                new THREE.CylinderGeometry(stirrupDiameterCm / 2, stirrupDiameterCm / 2, len, 8),
                new THREE.MeshStandardMaterial({
                  color: 0x64748b,
                  metalness: 0.7,
                  roughness: 0.4,
                })
              );
              stirrup.position.set(
                col.x + (x1+x2)/2,
                y,
                col.y + (z1+z2)/2
              );
              // Orient the cylinder along the segment direction (horizontal)
              stirrup.rotation.z = Math.PI / 2;
              stirrup.rotation.y = Math.atan2(z2-z1, x2-x1);
              rebarGroup.add(stirrup);
            }
          }

          floorGroup.add(rebarGroup);
        }
      });

      // ===== Pipes visualization (mode: plumbing, mep) =====
      if ((viewMode === 'plumbing' || viewMode === 'mep') && view3DOptions.showPipes && floor.pipes) {
        floor.pipes.forEach((pipe) => {
          const dx = pipe.x2 - pipe.x1;
          const dz = pipe.y2 - pipe.y1;
          const length = Math.sqrt(dx * dx + dz * dz);
          if (length < 1) return;
          const diameter = pipe.diameter || 2.5;
          const pipeColor = pipe.color ? parseInt(pipe.color.replace('#', ''), 16) : 0x3b82f6;
          const pipeMesh = new THREE.Mesh(
            new THREE.CylinderGeometry(diameter / 2, diameter / 2, length, 12),
            new THREE.MeshStandardMaterial({ color: pipeColor, metalness: 0.3, roughness: 0.5 })
          );
          pipeMesh.position.set(
            (pipe.x1 + pipe.x2) / 2,
            currentY + (pipe.height || 200),
            (pipe.y1 + pipe.y2) / 2
          );
          pipeMesh.rotation.x = Math.PI / 2;
          pipeMesh.rotation.y = -Math.atan2(dz, dx);
          floorGroup.add(pipeMesh);
        });
      }

      // ===== Wires visualization (mode: electrical, mep) =====
      if ((viewMode === 'electrical' || viewMode === 'mep') && view3DOptions.showWires && floor.wires) {
        floor.wires.forEach((wire) => {
          const dx = wire.x2 - wire.x1;
          const dz = wire.y2 - wire.y1;
          const length = Math.sqrt(dx * dx + dz * dz);
          if (length < 1) return;
          const wireColor = wire.color ? parseInt(wire.color.replace('#', ''), 16) : 0xdc2626;
          // Draw wire as thin tube along the path
          const points = [
            new THREE.Vector3(
              wire.x1,
              currentY + (wire.height || 250),
              wire.y1
            ),
            new THREE.Vector3(
              wire.x2,
              currentY + (wire.height || 250),
              wire.y2
            ),
          ];
          const lineGeo = new THREE.BufferGeometry().setFromPoints(points);
          const lineMat = new THREE.LineBasicMaterial({ color: wireColor, linewidth: 3 });
          const line = new THREE.Line(lineGeo, lineMat);
          floorGroup.add(line);
        });
      }

      // ===== Fixtures visualization (mode: plumbing, electrical, mep) =====
      if (view3DOptions.showFixtures && floor.fixtures) {
        floor.fixtures.forEach((fx) => {
          if (
            viewMode !== 'plumbing' &&
            viewMode !== 'electrical' &&
            viewMode !== 'mep' &&
            viewMode !== 'design'
          ) return;
          const size = fx.size || 15;
          const fxColor = fx.color ? parseInt(fx.color.replace('#', ''), 16) : 0xfacc15;
          const fxMesh = new THREE.Mesh(
            new THREE.SphereGeometry(size / 2, 12, 12),
            new THREE.MeshStandardMaterial({
              color: fxColor,
              emissive: fxColor,
              emissiveIntensity: 0.3,
              metalness: 0.5,
              roughness: 0.4,
            })
          );
          fxMesh.position.set(
            fx.x,
            currentY + (fx.height || 100),
            fx.y
          );
          floorGroup.add(fxMesh);
        });
      }

      scene.add(floorGroup);
      currentY += floor.height + 10;

      // Floor label
      const labelGeo = new THREE.PlaneGeometry(200, 60);
      const labelCanvas = document.createElement('canvas');
      labelCanvas.width = 256;
      labelCanvas.height = 64;
      const lctx = labelCanvas.getContext('2d');
      lctx.fillStyle = isActive ? 'rgba(99, 102, 241, 0.95)' : 'rgba(100, 116, 139, 0.85)';
      lctx.fillRect(0, 0, 256, 64);
      lctx.fillStyle = 'white';
      lctx.font = 'bold 28px Inter, sans-serif';
      lctx.textAlign = 'center';
      lctx.textBaseline = 'middle';
      lctx.fillText(floor.name, 128, 32);
      const labelTex = new THREE.CanvasTexture(labelCanvas);
      const labelMat = new THREE.MeshBasicMaterial({ map: labelTex, transparent: true });
      const label = new THREE.Mesh(labelGeo, labelMat);
      label.position.set(
        bldgX + building.width / 2 + 150,
        currentY - floor.height / 2,
        bldgZ - building.depth / 2
      );
      label.lookAt(cameraRef.current.position);
      scene.add(label);
    });

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [floors, plot, building, viewMode, activeFloorId, view3DOptions, state.structuralSettings]);

  return (
    <div className="canvas-container absolute inset-0">
      <div ref={mountRef} className="w-full h-full" />
      <div className="floor-indicator">
        {activeFloor?.name} · Tampilan 3D · {viewMode === 'structural' ? 'Struktur' : 'Normal'}
      </div>

      {/* 3D controls hint */}
      <div className="absolute top-12 left-4 bg-white/90 backdrop-blur px-3 py-2 rounded-lg shadow text-xs text-slate-600">
        <div className="font-semibold mb-1">Kontrol 3D:</div>
        <div>· Klik + seret: Putar kamera</div>
        <div>· Scroll: Zoom in/out</div>
      </div>

      <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur px-3 py-2 rounded-lg shadow text-xs text-slate-600">
        <div>
          Tanah: {(plot.width / 100).toFixed(2)}m x {(plot.depth / 100).toFixed(2)}m
        </div>
        <div>
          Bangunan: {(building.width / 100).toFixed(2)}m x {(building.depth / 100).toFixed(2)}m
        </div>
        <div>Total Lantai: {floors.length}</div>
      </div>
    </div>
  );
}

function normalizeHex(color) {
  if (!color) return 0x8b7355;
  const c = color.trim().replace('#', '');
  return parseInt(c, 16);
}

function build3DStairs(group, item, bldgX, bldgZ, currentY, building, isStructural) {
  const stairsGroup = new THREE.Group();
  stairsGroup.position.set(
    item.x,
    currentY + 5,
    item.y
  );
  stairsGroup.rotation.y = -item.rotation;

  const totalWidth = item.w;
  const totalLength = item.h;
  const floorHeight = item.height3d || 300;
  const type = item.type || 'stairs';

  // Determine stair parameters by type
  let numSteps, stepHeight, stepDepth, layout, mainColor, lineColor, hasStringer = true;

  switch (type) {
    case 'stairs-spiral':
      numSteps = 16; layout = 'spiral';
      mainColor = 0x5B3A1A; lineColor = 0x3D2810;
      hasStringer = false;
      break;
    case 'stairs-u':
      numSteps = 18; layout = 'u';
      mainColor = isStructural ? 0xf59e0b : 0x78716c; lineColor = 0x44403c;
      break;
    case 'stairs-curved':
      numSteps = 14; layout = 'curved';
      mainColor = 0x8B6F47; lineColor = 0x5D3A1A;
      break;
    case 'stairs-cantilever':
      numSteps = 14; layout = 'straight';
      mainColor = 0x374151; lineColor = 0x9CA3AF;
      hasStringer = false;
      break;
    case 'stairs-steel':
      numSteps = 14; layout = 'straight';
      mainColor = 0x64748B; lineColor = 0x1E293B;
      break;
    case 'stairs-mini':
      numSteps = 16; layout = 'straight';
      mainColor = 0x8B6F47; lineColor = 0x5D3A1A;
      break;
    case 'stairs-floating':
      numSteps = 14; layout = 'straight';
      mainColor = 0x1F2937; lineColor = 0x9CA3AF;
      hasStringer = false;
      break;
    case 'stairs-straight':
    case 'stairs':
    default:
      numSteps = type === 'stairs' ? 12 : 14;
      layout = type === 'stairs' ? 'l' : 'straight';
      mainColor = isStructural ? 0xf59e0b : 0x78716c;
      lineColor = 0x44403c;
      break;
  }

  stepHeight = floorHeight / numSteps;
  stepDepth = totalLength / numSteps;

  const stepMat = new THREE.MeshStandardMaterial({
    color: mainColor,
    roughness: type === 'stairs-steel' || type === 'stairs-cantilever' ? 0.4 : 0.8,
    metalness: type === 'stairs-steel' || type === 'stairs-cantilever' || type === 'stairs-floating' ? 0.6 : 0.1,
  });

  if (layout === 'spiral') {
    // Spiral staircase
    const radius = Math.min(totalWidth, totalLength) / 2;
    const innerRadius = radius * 0.2;
    for (let i = 0; i < numSteps; i++) {
      const angle = (i / numSteps) * Math.PI * 2;
      const wedgeShape = new THREE.Shape();
      wedgeShape.moveTo(0, 0);
      wedgeShape.lineTo(Math.cos(angle) * radius, Math.sin(angle) * radius);
      wedgeShape.lineTo(Math.cos(angle + (Math.PI * 2 / numSteps)) * radius, Math.sin(angle + (Math.PI * 2 / numSteps)) * radius);
      wedgeShape.lineTo(0, 0);
      const wedgeGeo = new THREE.ExtrudeGeometry(wedgeShape, { depth: stepHeight, bevelEnabled: false });
      const wedge = new THREE.Mesh(wedgeGeo, stepMat);
      wedge.position.y = stepHeight * i;
      wedge.castShadow = true;
      wedge.receiveShadow = true;
      stairsGroup.add(wedge);
    }
    // Center column
    const colGeo = new THREE.CylinderGeometry(innerRadius, innerRadius, floorHeight, 16);
    const col = new THREE.Mesh(colGeo, new THREE.MeshStandardMaterial({ color: lineColor, roughness: 0.6, metalness: 0.4 }));
    col.position.y = floorHeight / 2;
    stairsGroup.add(col);
    // Handrail (spiral)
    const handrailPoints = [];
    for (let i = 0; i <= numSteps; i++) {
      const angle = (i / numSteps) * Math.PI * 2;
      handrailPoints.push(new THREE.Vector3(
        Math.cos(angle) * radius,
        stepHeight * i + 90,
        Math.sin(angle) * radius
      ));
    }
    const handrailGeo = new THREE.TubeGeometry(
      new THREE.CatmullRomCurve3(handrailPoints),
      64, 2, 8, false
    );
    const handrail = new THREE.Mesh(handrailGeo, new THREE.MeshStandardMaterial({ color: 0xC0C0C0, roughness: 0.3, metalness: 0.9 }));
    stairsGroup.add(handrail);
  } else if (layout === 'u') {
    // U-shape: 2 flights side by side
    const halfSteps = Math.floor(numSteps / 2);
    const halfH = floorHeight / 2;
    const stepH_half = halfH / halfSteps;
    const stepD_half = (totalLength / 2) / halfSteps;

    // Left flight (going up)
    for (let i = 0; i < halfSteps; i++) {
      const step = new THREE.Mesh(
        new THREE.BoxGeometry(totalWidth / 2 - 5, stepH_half, stepD_half),
        stepMat
      );
      step.position.set(
        -totalWidth / 4 - 2.5,
        stepH_half * i + stepH_half / 2,
        -totalLength / 2 + stepD_half * i + stepD_half / 2
      );
      step.castShadow = true;
      stairsGroup.add(step);
    }
    // Right flight (going up back)
    for (let i = 0; i < halfSteps; i++) {
      const step = new THREE.Mesh(
        new THREE.BoxGeometry(totalWidth / 2 - 5, stepH_half, stepD_half),
        stepMat
      );
      step.position.set(
        totalWidth / 4 + 2.5,
        halfH + stepH_half * i + stepH_half / 2,
        totalLength / 2 - stepD_half * i - stepD_half / 2
      );
      step.castShadow = true;
      stairsGroup.add(step);
    }
    // Bordes (landing)
    const landing = new THREE.Mesh(
      new THREE.BoxGeometry(totalWidth, 10, totalWidth),
      stepMat
    );
    landing.position.set(0, halfH, 0);
    stairsGroup.add(landing);
  } else if (layout === 'curved') {
    // Curved staircase
    for (let i = 0; i < numSteps; i++) {
      const t = i / numSteps;
      const curveOffset = Math.sin(t * Math.PI) * 30;
      const step = new THREE.Mesh(
        new THREE.BoxGeometry(totalWidth, stepHeight, stepDepth),
        stepMat
      );
      step.position.set(
        curveOffset,
        stepHeight * i + stepHeight / 2,
        -totalLength / 2 + stepDepth * i + stepDepth / 2
      );
      step.castShadow = true;
      stairsGroup.add(step);
    }
  } else {
    // Straight / L-shape
    if (layout === 'l') {
      // L-shape: 2 flights
      const halfSteps = Math.floor(numSteps / 2);
      const stepH_half = (floorHeight / 2) / halfSteps;
      // Flight 1 (along length)
      for (let i = 0; i < halfSteps; i++) {
        const step = new THREE.Mesh(
          new THREE.BoxGeometry(totalWidth, stepH_half, stepDepth),
          stepMat
        );
        step.position.set(
          0,
          stepH_half * i + stepH_half / 2,
          -totalLength / 2 + stepDepth * i + stepDepth / 2
        );
        step.castShadow = true;
        stairsGroup.add(step);
      }
      // Landing
      const landing = new THREE.Mesh(
        new THREE.BoxGeometry(totalWidth, 10, totalWidth),
        stepMat
      );
      landing.position.set(0, floorHeight / 2, 0);
      stairsGroup.add(landing);
      // Flight 2 (along width)
      const stepD2 = totalWidth / halfSteps;
      for (let i = 0; i < halfSteps; i++) {
        const step = new THREE.Mesh(
          new THREE.BoxGeometry(stepD2, stepH_half, totalWidth),
          stepMat
        );
        step.position.set(
          -totalWidth / 2 + stepD2 * i + stepD2 / 2,
          floorHeight / 2 + stepH_half * i + stepH_half / 2,
          totalLength / 2 - totalWidth / 2
        );
        step.castShadow = true;
        stairsGroup.add(step);
      }
    } else {
      // Pure straight
      for (let i = 0; i < numSteps; i++) {
        const step = new THREE.Mesh(
          new THREE.BoxGeometry(totalWidth, stepHeight, stepDepth),
          stepMat
        );
        step.position.set(
          0,
          stepHeight * i + stepHeight / 2,
          -totalLength / 2 + stepDepth * i + stepDepth / 2
        );
        step.castShadow = true;
        step.receiveShadow = true;
        stairsGroup.add(step);
      }

      // Cantilever/Floating: no stringer, but add hidden wall bracket
      if (!hasStringer) {
        // Wall bracket (only one side, hidden in wall)
        const bracketGeo = new THREE.BoxGeometry(8, floorHeight, 5);
        const bracket = new THREE.Mesh(bracketGeo, new THREE.MeshStandardMaterial({ color: 0x4B5563, roughness: 0.7 }));
        bracket.position.set(-totalWidth / 2 - 4, floorHeight / 2, 0);
        stairsGroup.add(bracket);
      }

      // Steel: add visible diagonal stringers
      if (type === 'stairs-steel') {
        const steelStringerMat = new THREE.MeshStandardMaterial({ color: 0x1E293B, roughness: 0.3, metalness: 0.8 });
        // Left diagonal stringer
        const leftStr = new THREE.Mesh(
          new THREE.BoxGeometry(3, 8, totalLength * 1.05),
          steelStringerMat
        );
        leftStr.position.set(-totalWidth / 2 - 2, floorHeight / 2, 0);
        leftStr.rotation.x = -Math.atan2(floorHeight, totalLength);
        stairsGroup.add(leftStr);
        const rightStr = leftStr.clone();
        rightStr.position.x = totalWidth / 2 + 2;
        stairsGroup.add(rightStr);
      }
    }
  }

  // Side stringers (for normal stairs)
  if (hasStringer && layout === 'straight') {
    const stringerGeo = new THREE.BoxGeometry(5, floorHeight + 20, totalLength);
    const stringerMat = new THREE.MeshStandardMaterial({ color: lineColor, roughness: 0.7 });
    const leftStringer = new THREE.Mesh(stringerGeo, stringerMat);
    leftStringer.position.set(-totalWidth / 2 - 2.5, floorHeight / 2 + 10, 0);
    stairsGroup.add(leftStringer);
    const rightStringer = new THREE.Mesh(stringerGeo, stringerMat);
    rightStringer.position.set(totalWidth / 2 + 2.5, floorHeight / 2 + 10, 0);
    stairsGroup.add(rightStringer);
  }

  // Handrail (for straight/u/l stairs, not for floating/cantilever)
  if (type !== 'stairs-floating' && type !== 'stairs-cantilever' && type !== 'stairs-spiral' && type !== 'stairs-mini') {
    const handrailHeight = 90;
    const handrailMat = new THREE.MeshStandardMaterial({ color: 0xC0C0C0, roughness: 0.3, metalness: 0.8 });
    // Left handrail
    const handrailGeo = new THREE.CylinderGeometry(2, 2, totalLength, 8);
    const leftHandrail = new THREE.Mesh(handrailGeo, handrailMat);
    leftHandrail.position.set(-totalWidth / 2 - 5, floorHeight + handrailHeight, 0);
    leftHandrail.rotation.x = Math.PI / 2;
    stairsGroup.add(leftHandrail);
    const rightHandrail = leftHandrail.clone();
    rightHandrail.position.x = totalWidth / 2 + 5;
    stairsGroup.add(rightHandrail);
    // Balusters
    const balusterMat = new THREE.MeshStandardMaterial({ color: 0x9CA3AF, roughness: 0.4, metalness: 0.7 });
    const balusterCount = 8;
    for (let i = 0; i <= balusterCount; i++) {
      const x = -totalLength / 2 + (totalLength * i / balusterCount);
      [(-totalWidth / 2 - 5), (totalWidth / 2 + 5)].forEach(sideX => {
        const baluster = new THREE.Mesh(
          new THREE.CylinderGeometry(1, 1, handrailHeight, 6),
          balusterMat
        );
        baluster.position.set(sideX, floorHeight + handrailHeight / 2, x);
        stairsGroup.add(baluster);
      });
    }
  }

  group.add(stairsGroup);
}

// ============= 3D STAINLESS STEEL RAILING BUILDER =============
function build3DSteelRailing(group, item, bldgX, bldgZ, currentY, building, def) {
  const railGroup = new THREE.Group();
  railGroup.position.set(
    item.x,
    currentY + 5,
    item.y
  );
  railGroup.rotation.y = -item.rotation;

  const w = item.w;
  const thickness = Math.max(item.h, 8);
  const height = def.height3d || 110;
  const type = item.type;

  // Material selection
  const isGlass = type === 'fence-glass-frameless' || type === 'fence-stainless-glass';
  const isSteel = type === 'fence-steel-pipe';
  const isAluminum = type === 'fence-aluminum-slat';
  const isWood = type === 'fence-wood-slat-vertical';

  const stainlessMat = new THREE.MeshStandardMaterial({
    color: 0xC0C0C0,
    roughness: 0.2,
    metalness: 0.9,
  });
  const steelMat = new THREE.MeshStandardMaterial({
    color: 0x1F2937,
    roughness: 0.4,
    metalness: 0.7,
  });
  const aluminumMat = new THREE.MeshStandardMaterial({
    color: 0x9CA3AF,
    roughness: 0.3,
    metalness: 0.7,
  });
  const woodMat = new THREE.MeshStandardMaterial({
    color: 0x8B6F47,
    roughness: 0.7,
    metalness: 0.1,
  });
  const glassMat = new THREE.MeshPhysicalMaterial({
    color: 0xE0F2FE,
    roughness: 0.05,
    metalness: 0.0,
    transparent: true,
    opacity: 0.4,
    transmission: 0.7,
  });

  const mainMat = isGlass ? stainlessMat : isSteel ? steelMat : isAluminum ? aluminumMat : isWood ? woodMat : stainlessMat;

  // Base track
  const baseGeo = new THREE.BoxGeometry(w, 4, thickness);
  const base = new THREE.Mesh(baseGeo, mainMat);
  base.position.y = 2;
  railGroup.add(base);

  // Top handrail
  const handrailGeo = new THREE.BoxGeometry(w, 5, thickness * 0.6);
  const handrail = new THREE.Mesh(handrailGeo, mainMat);
  handrail.position.y = height - 2.5;
  railGroup.add(handrail);

  // Alternative: cylindrical handrail for stainless types
  if (type.startsWith('fence-stainless') && type !== 'fence-stainless-glass') {
    const cylHandrail = new THREE.Mesh(
      new THREE.CylinderGeometry(2.5, 2.5, w, 12),
      stainlessMat
    );
    cylHandrail.position.y = height;
    cylHandrail.rotation.z = Math.PI / 2;
    railGroup.add(cylHandrail);
  }

  if (type === 'fence-stainless-vertical' || type === 'fence-steel-pipe' || type === 'fence-aluminum-slat' || type === 'fence-wood-slat-vertical') {
    // Vertical balusters
    const spacing = 12;
    const numBalusters = Math.floor(w / spacing);
    const actualSpacing = w / numBalusters;
    const balusterRadius = type === 'fence-steel-pipe' ? 1.5 : 0.8;
    for (let i = 0; i <= numBalusters; i++) {
      const x = -w / 2 + actualSpacing * i;
      const baluster = new THREE.Mesh(
        new THREE.CylinderGeometry(balusterRadius, balusterRadius, height - 10, 8),
        mainMat
      );
      baluster.position.set(x, height / 2, 0);
      baluster.castShadow = true;
      railGroup.add(baluster);
    }
  } else if (type === 'fence-stainless-horizontal' || type === 'fence-wire-rope') {
    // Horizontal cables/lines
    const numLines = type === 'fence-stainless-horizontal' ? 5 : 7;
    for (let i = 1; i < numLines; i++) {
      const y = (height * i / numLines);
      const cable = new THREE.Mesh(
        new THREE.CylinderGeometry(0.5, 0.5, w, 6),
        stainlessMat
      );
      cable.position.set(0, y, 0);
      cable.rotation.z = Math.PI / 2;
      railGroup.add(cable);
    }
    // Vertical posts at ends + every 100cm
    const postSpacing = 100;
    const numPosts = Math.ceil(w / postSpacing) + 1;
    for (let i = 0; i < numPosts; i++) {
      const x = -w / 2 + (w / (numPosts - 1)) * i;
      const post = new THREE.Mesh(
        new THREE.BoxGeometry(3, height, thickness * 0.8),
        stainlessMat
      );
      post.position.set(x, height / 2, 0);
      railGroup.add(post);
    }
  } else if (type === 'fence-stainless-tube') {
    // Horizontal tubes (thicker)
    const numTubes = 3;
    for (let i = 1; i <= numTubes; i++) {
      const y = (height * (i + 0.5) / (numTubes + 1));
      const tube = new THREE.Mesh(
        new THREE.CylinderGeometry(2, 2, w, 8),
        stainlessMat
      );
      tube.position.set(0, y, 0);
      tube.rotation.z = Math.PI / 2;
      railGroup.add(tube);
    }
    // End posts
    [-w / 2, w / 2].forEach(x => {
      const post = new THREE.Mesh(
        new THREE.BoxGeometry(4, height, thickness * 0.8),
        stainlessMat
      );
      post.position.set(x, height / 2, 0);
      railGroup.add(post);
    });
  } else if (type === 'fence-stainless-glass' || type === 'fence-glass-frameless') {
    // Glass panels with stainless posts
    const panelWidth = 60;
    const numPanels = Math.ceil(w / panelWidth);
    const actualPanelW = w / numPanels;
    for (let i = 0; i < numPanels; i++) {
      const x = -w / 2 + actualPanelW * i + actualPanelW / 2;
      const glass = new THREE.Mesh(
        new THREE.BoxGeometry(actualPanelW - 4, height - 10, 4),
        glassMat
      );
      glass.position.set(x, height / 2, 0);
      railGroup.add(glass);
    }
    // Stainless posts between panels
    for (let i = 0; i <= numPanels; i++) {
      const x = -w / 2 + actualPanelW * i;
      const post = new THREE.Mesh(
        new THREE.BoxGeometry(3, height, thickness * 0.8),
        stainlessMat
      );
      post.position.set(x, height / 2, 0);
      railGroup.add(post);
    }
  } else if (type === 'fence-stainless-perforated') {
    // Perforated plate
    const plate = new THREE.Mesh(
      new THREE.BoxGeometry(w, height - 10, 2),
      new THREE.MeshStandardMaterial({
        color: 0xB8B8B8,
        roughness: 0.4,
        metalness: 0.7,
        transparent: true,
        opacity: 0.8,
      })
    );
    plate.position.set(0, height / 2, 0);
    railGroup.add(plate);
    // Dot pattern (small spheres for perforation effect)
    const dotMat = new THREE.MeshStandardMaterial({ color: 0x1F2937 });
    for (let xi = 0; xi < w / 8; xi++) {
      for (let yi = 0; yi < (height - 10) / 8; yi++) {
        if ((xi + yi) % 2 === 0) {
          const dot = new THREE.Mesh(new THREE.SphereGeometry(1, 4, 4), dotMat);
          dot.position.set(-w / 2 + xi * 8, 5 + yi * 8, 1.5);
          railGroup.add(dot);
        }
      }
    }
    // End posts
    [-w / 2, w / 2].forEach(x => {
      const post = new THREE.Mesh(
        new THREE.BoxGeometry(4, height, thickness * 0.8),
        stainlessMat
      );
      post.position.set(x, height / 2, 0);
      railGroup.add(post);
    });
  } else if (type === 'fence-stainless-mesh') {
    // Wire mesh grid
    const meshMat = new THREE.MeshStandardMaterial({
      color: 0xA8A8A8,
      roughness: 0.5,
      metalness: 0.5,
      wireframe: true,
    });
    const meshPanel = new THREE.Mesh(
      new THREE.BoxGeometry(w, height - 10, 1),
      meshMat
    );
    meshPanel.position.set(0, height / 2, 0);
    railGroup.add(meshPanel);
    // End posts
    [-w / 2, w / 2].forEach(x => {
      const post = new THREE.Mesh(
        new THREE.BoxGeometry(4, height, thickness * 0.8),
        stainlessMat
      );
      post.position.set(x, height / 2, 0);
      railGroup.add(post);
    });
  }

  group.add(railGroup);
}


// ============= 3D FENCE BUILDER =============
function build3DFence(group, item, bldgX, bldgZ, currentY, building, def) {
  const fenceGroup = new THREE.Group();
  fenceGroup.position.set(
    item.x,
    currentY + 5,
    item.y
  );
  fenceGroup.rotation.y = -item.rotation;

  const w = item.w;
  const height = def.height3d || 180;
  const thickness = item.h;
  const color = normalizeHex(item.color || def.color || '#3D3D3D');
  const fenceType = item.type;

  // Base foundation
  const baseMat = new THREE.MeshStandardMaterial({ color, roughness: 0.7, metalness: 0.3 });
  const baseGeo = new THREE.BoxGeometry(w, 5, thickness);
  const base = new THREE.Mesh(baseGeo, baseMat);
  base.position.y = 2.5;
  base.castShadow = true;
  base.receiveShadow = true;
  fenceGroup.add(base);

  if (fenceType === 'fence-iron' || fenceType === 'fence-wrought-iron') {
    // Iron fence - posts + rails + pickets
    const ironMat = new THREE.MeshStandardMaterial({
      color: fenceType === 'fence-wrought-iron' ? 0x1f1f1f : 0x3d3d3d,
      roughness: 0.4,
      metalness: 0.8,
    });
    // Posts every 50cm
    const postSpacing = 50;
    const numPosts = Math.max(2, Math.floor(w / postSpacing));
    const actualSpacing = w / numPosts;

    for (let i = 0; i <= numPosts; i++) {
      const x = -w / 2 + i * actualSpacing;
      // Post
      const post = new THREE.Mesh(
        new THREE.BoxGeometry(4, height, 4),
        ironMat
      );
      post.position.set(x, height / 2 + 5, 0);
      post.castShadow = true;
      fenceGroup.add(post);
      // Ornamental top
      if (fenceType === 'fence-wrought-iron') {
        const top = new THREE.Mesh(
          new THREE.SphereGeometry(3, 8, 8),
          ironMat
        );
        top.position.set(x, height + 5, 0);
        fenceGroup.add(top);
      }
    }
    // Top rail
    const topRail = new THREE.Mesh(
      new THREE.BoxGeometry(w, 3, 3),
      ironMat
    );
    topRail.position.set(0, height + 2, 0);
    fenceGroup.add(topRail);
    // Middle rail
    const midRail = new THREE.Mesh(
      new THREE.BoxGeometry(w, 3, 3),
      ironMat
    );
    midRail.position.set(0, height / 2, 0);
    fenceGroup.add(midRail);
    // Pickets between posts
    for (let i = 0; i < numPosts; i++) {
      const startX = -w / 2 + i * actualSpacing;
      const endX = startX + actualSpacing;
      const picketCount = Math.floor(actualSpacing / 8);
      for (let j = 1; j < picketCount; j++) {
        const x = startX + (actualSpacing / picketCount) * j;
        const picket = new THREE.Mesh(
          new THREE.BoxGeometry(1.5, height - 10, 1.5),
          ironMat
        );
        picket.position.set(x, height / 2, 0);
        fenceGroup.add(picket);
      }
    }
  } else if (fenceType === 'fence-wood') {
    // Wood fence - horizontal planks + posts
    const woodMat = new THREE.MeshStandardMaterial({ color: 0x8b6f47, roughness: 0.8 });
    const postMat = new THREE.MeshStandardMaterial({ color: 0x6b4423, roughness: 0.8 });
    // Posts
    const postSpacing = 60;
    const numPosts = Math.max(2, Math.floor(w / postSpacing));
    const actualSpacing = w / numPosts;
    for (let i = 0; i <= numPosts; i++) {
      const x = -w / 2 + i * actualSpacing;
      const post = new THREE.Mesh(
        new THREE.BoxGeometry(8, height + 10, 8),
        postMat
      );
      post.position.set(x, (height + 10) / 2 + 5, 0);
      post.castShadow = true;
      fenceGroup.add(post);
    }
    // Horizontal planks
    const numPlanks = 4;
    const plankSpacing = height / numPlanks;
    for (let i = 0; i < numPlanks; i++) {
      const y = (height / (numPlanks + 1)) * (i + 1);
      const plank = new THREE.Mesh(
        new THREE.BoxGeometry(w, plankSpacing - 2, thickness),
        woodMat
      );
      plank.position.set(0, y + 5, 0);
      plank.castShadow = true;
      fenceGroup.add(plank);
    }
  } else if (fenceType === 'fence-bamboo') {
    // Bamboo fence
    const bambooMat = new THREE.MeshStandardMaterial({ color: 0xa0826d, roughness: 0.6 });
    const bamboos = Math.floor(w / 8);
    for (let i = 0; i <= bamboos; i++) {
      const x = -w / 2 + (w / bamboos) * i;
      const bamboo = new THREE.Mesh(
        new THREE.CylinderGeometry(3, 3, height, 8),
        bambooMat
      );
      bamboo.position.set(x, height / 2 + 5, 0);
      bamboo.castShadow = true;
      fenceGroup.add(bamboo);
    }
  } else if (fenceType === 'fence-hedge') {
    // Hedge - green spheres
    const hedgeMat = new THREE.MeshStandardMaterial({ color: 0x4a7c2e, roughness: 0.9 });
    const hedgeBase = new THREE.Mesh(
      new THREE.BoxGeometry(w, height, thickness),
      hedgeMat
    );
    hedgeBase.position.set(0, height / 2 + 5, 0);
    hedgeBase.castShadow = true;
    fenceGroup.add(hedgeBase);
    // Texture spheres
    for (let i = 0; i < w / 25; i++) {
      const x = -w / 2 + (w / (w / 25)) * i + Math.random() * 10;
      const y = 10 + Math.random() * height;
      const sphere = new THREE.Mesh(
        new THREE.SphereGeometry(12, 6, 6),
        hedgeMat
      );
      sphere.position.set(x, y, 0);
      fenceGroup.add(sphere);
    }
  } else if (fenceType === 'fence-stone' || fenceType === 'fence-concrete') {
    // Stone/concrete solid wall
    const wallMat = new THREE.MeshStandardMaterial({
      color: fenceType === 'fence-stone' ? 0x78716c : 0xa8a29e,
      roughness: 0.9,
    });
    const wall = new THREE.Mesh(
      new THREE.BoxGeometry(w, height, thickness),
      wallMat
    );
    wall.position.set(0, height / 2 + 5, 0);
    wall.castShadow = true;
    wall.receiveShadow = true;
    fenceGroup.add(wall);
    // Cap on top
    const cap = new THREE.Mesh(
      new THREE.BoxGeometry(w + 4, 5, thickness + 4),
      wallMat
    );
    cap.position.set(0, height + 7, 0);
    fenceGroup.add(cap);
  } else if (fenceType === 'fence-vinyl') {
    // Vinyl picket fence
    const vinylMat = new THREE.MeshStandardMaterial({ color: 0xf5f5f5, roughness: 0.3 });
    // Posts
    const postSpacing = 60;
    const numPosts = Math.max(2, Math.floor(w / postSpacing));
    const actualSpacing = w / numPosts;
    for (let i = 0; i <= numPosts; i++) {
      const x = -w / 2 + i * actualSpacing;
      const post = new THREE.Mesh(
        new THREE.BoxGeometry(6, height, 6),
        vinylMat
      );
      post.position.set(x, height / 2 + 5, 0);
      fenceGroup.add(post);
    }
    // Pickets
    const picketSpacing = 12;
    const numPickets = Math.floor(w / picketSpacing);
    for (let i = 0; i < numPickets; i++) {
      const x = -w / 2 + picketSpacing * i + picketSpacing / 2;
      const picket = new THREE.Mesh(
        new THREE.BoxGeometry(4, height - 10, 2),
        vinylMat
      );
      picket.position.set(x, (height - 10) / 2 + 5, 0);
      fenceGroup.add(picket);
    }
    // Rails
    const topRail = new THREE.Mesh(new THREE.BoxGeometry(w, 3, 3), vinylMat);
    topRail.position.set(0, height - 5, 0);
    fenceGroup.add(topRail);
  } else if (fenceType === 'fence-chain-link') {
    // Chain link - thin mesh
    const linkMat = new THREE.MeshStandardMaterial({
      color: 0x9ca3af, roughness: 0.5, metalness: 0.7,
      transparent: true, opacity: 0.6,
    });
    const mesh = new THREE.Mesh(
      new THREE.BoxGeometry(w, height, 2),
      linkMat
    );
    mesh.position.set(0, height / 2 + 5, 0);
    fenceGroup.add(mesh);
    // Posts
    const postMat = new THREE.MeshStandardMaterial({ color: 0x4b5563, metalness: 0.8 });
    const postSpacing = 100;
    const numPosts = Math.max(2, Math.floor(w / postSpacing));
    const actualSpacing = w / numPosts;
    for (let i = 0; i <= numPosts; i++) {
      const x = -w / 2 + i * actualSpacing;
      const post = new THREE.Mesh(
        new THREE.CylinderGeometry(3, 3, height, 8),
        postMat
      );
      post.position.set(x, height / 2 + 5, 0);
      fenceGroup.add(post);
    }
  } else if (fenceType === 'fence-modern') {
    // Modern minimalist - clean panels
    const modMat = new THREE.MeshStandardMaterial({ color: 0xe5e5e5, roughness: 0.4 });
    // Panels
    const panelSpacing = 100;
    const numPanels = Math.max(1, Math.floor(w / panelSpacing));
    const actualSpacing = w / numPanels;
    for (let i = 0; i < numPanels; i++) {
      const x = -w / 2 + actualSpacing * i + actualSpacing / 2;
      const panel = new THREE.Mesh(
        new THREE.BoxGeometry(actualSpacing - 10, height, thickness),
        modMat
      );
      panel.position.set(x, height / 2 + 5, 0);
      panel.castShadow = true;
      fenceGroup.add(panel);
    }
    // Top cap
    const cap = new THREE.Mesh(
      new THREE.BoxGeometry(w, 3, thickness + 2),
      new THREE.MeshStandardMaterial({ color: 0x1f2937 })
    );
    cap.position.set(0, height + 6, 0);
    fenceGroup.add(cap);
  }

  group.add(fenceGroup);
}

// ============= 3D GATE BUILDER =============
function build3DGate(group, item, bldgX, bldgZ, currentY, building, def) {
  const gateGroup = new THREE.Group();
  gateGroup.position.set(
    item.x,
    currentY + 5,
    item.y
  );
  gateGroup.rotation.y = -item.rotation;

  const w = item.w;
  const height = def.height3d || 200;
  const color = normalizeHex(item.color || def.color || '#3D3D3D');
  const gateMat = new THREE.MeshStandardMaterial({ color, roughness: 0.4, metalness: 0.7 });

  // Gate frame
  const frameThickness = 5;
  const frame = new THREE.Mesh(
    new THREE.BoxGeometry(w, height, frameThickness),
    gateMat
  );
  frame.position.set(0, height / 2, 0);
  frame.castShadow = true;
  gateGroup.add(frame);

  // Inner bars
  const barCount = Math.floor(w / 25);
  const barMat = new THREE.MeshStandardMaterial({ color: 0x1f1f1f, metalness: 0.8, roughness: 0.3 });
  for (let i = 1; i < barCount; i++) {
    const x = -w / 2 + (w / barCount) * i;
    const bar = new THREE.Mesh(
      new THREE.BoxGeometry(2, height - 10, 2),
      barMat
    );
    bar.position.set(x, height / 2, 0);
    gateGroup.add(bar);
  }

  // Center division for swing gate
  if (item.type === 'gate-swing') {
    const divider = new THREE.Mesh(
      new THREE.BoxGeometry(3, height + 20, 3),
      barMat
    );
    divider.position.set(0, height / 2, 0);
    gateGroup.add(divider);
  }

  // Decorative top
  const topBar = new THREE.Mesh(
    new THREE.BoxGeometry(w + 10, 5, frameThickness + 5),
    new THREE.MeshStandardMaterial({ color: 0xd4af37, metalness: 0.9, roughness: 0.2 })
  );
  topBar.position.set(0, height + 5, 0);
  gateGroup.add(topBar);

  // Posts on each end
  const postMat = new THREE.MeshStandardMaterial({ color: 0x1f1f1f, metalness: 0.8 });
  [-w / 2 - 5, w / 2 + 5].forEach((x) => {
    const post = new THREE.Mesh(
      new THREE.BoxGeometry(10, height + 20, 10),
      postMat
    );
    post.position.set(x, (height + 20) / 2, 0);
    post.castShadow = true;
    gateGroup.add(post);
    // Post cap
    const cap = new THREE.Mesh(
      new THREE.SphereGeometry(6, 8, 8),
      new THREE.MeshStandardMaterial({ color: 0xd4af37, metalness: 0.9 })
    );
    cap.position.set(x, height + 20, 0);
    gateGroup.add(cap);
  });

  group.add(gateGroup);
}

// ============= 3D TREE BUILDER =============
function build3DTree(group, item, bldgX, bldgZ, currentY, building, def) {
  const treeGroup = new THREE.Group();
  treeGroup.position.set(
    item.x,
    currentY + 5,
    item.y
  );

  const height = def.height3d || 500;
  const isPalm = item.type === 'tree-palm';
  const isSmall = item.type === 'tree-small';

  // Trunk
  const trunkHeight = isSmall ? height * 0.4 : height * 0.3;
  const trunkRadius = isSmall ? 5 : 10;
  const trunkMat = new THREE.MeshStandardMaterial({ color: 0x5b3a1a, roughness: 0.9 });
  const trunk = new THREE.Mesh(
    new THREE.CylinderGeometry(trunkRadius * 0.8, trunkRadius, trunkHeight, 8),
    trunkMat
  );
  trunk.position.y = trunkHeight / 2;
  trunk.castShadow = true;
  treeGroup.add(trunk);

  if (isPalm) {
    // Palm - fronds radiating
    const frondMat = new THREE.MeshStandardMaterial({ color: 0x4a7c2e, roughness: 0.7, side: THREE.DoubleSide });
    const frondCount = 8;
    const frondLength = item.w / 2;
    for (let i = 0; i < frondCount; i++) {
      const angle = (i / frondCount) * Math.PI * 2;
      const frond = new THREE.Mesh(
        new THREE.ConeGeometry(frondLength * 0.3, frondLength, 4),
        frondMat
      );
      frond.position.y = trunkHeight + frondLength / 3;
      frond.rotation.z = Math.PI / 3;
      frond.rotation.y = angle;
      frond.position.x = Math.cos(angle) * frondLength / 3;
      frond.position.z = Math.sin(angle) * frondLength / 3;
      frond.castShadow = true;
      treeGroup.add(frond);
    }
    // Coconuts
    const coconutMat = new THREE.MeshStandardMaterial({ color: 0x5b3a1a });
    for (let i = 0; i < 4; i++) {
      const angle = (i / 4) * Math.PI * 2;
      const coconut = new THREE.Mesh(new THREE.SphereGeometry(4, 6, 6), coconutMat);
      coconut.position.set(Math.cos(angle) * 8, trunkHeight, Math.sin(angle) * 8);
      treeGroup.add(coconut);
    }
  } else {
    // Regular tree - layered spheres
    const leafMat = new THREE.MeshStandardMaterial({
      color: normalizeHex(item.color || def.color || '#4A7C2E'),
      roughness: 0.8,
    });
    const numLayers = isSmall ? 1 : 3;
    const baseRadius = Math.min(item.w, item.h) / 2.5;
    for (let i = 0; i < numLayers; i++) {
      const r = baseRadius * (1 - i * 0.15);
      const y = trunkHeight + i * (r * 0.7);
      const sphere = new THREE.Mesh(
        new THREE.SphereGeometry(r, 10, 10),
        leafMat
      );
      sphere.position.y = y;
      sphere.castShadow = true;
      treeGroup.add(sphere);
    }
  }

  group.add(treeGroup);
}

// ============= 3D POOL BUILDER =============
function build3DPool(group, item, bldgX, bldgZ, currentY, building, def) {
  const poolGroup = new THREE.Group();
  poolGroup.position.set(
    item.x,
    currentY + 5,
    item.y
  );

  const w = item.w;
  const d = item.h;
  const depth = 150; // pool depth 150cm

  // Pool water (top surface)
  const waterMat = new THREE.MeshStandardMaterial({
    color: 0x03a9f4,
    roughness: 0.1,
    metalness: 0.3,
    transparent: true,
    opacity: 0.8,
  });
  const water = new THREE.Mesh(
    new THREE.PlaneGeometry(w, d),
    waterMat
  );
  water.rotation.x = -Math.PI / 2;
  water.position.y = 0;
  poolGroup.add(water);

  // Pool floor
  const floorMat = new THREE.MeshStandardMaterial({ color: 0x0288d1, roughness: 0.9 });
  const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(w, d),
    floorMat
  );
  floor.rotation.x = -Math.PI / 2;
  floor.position.y = -depth;
  poolGroup.add(floor);

  // Pool walls
  const wallMat = new THREE.MeshStandardMaterial({ color: 0x4fc3f7, roughness: 0.7 });
  const wallHeight = depth;
  const walls = [
    { w: w, d: 5, x: 0, z: -d / 2 },
    { w: w, d: 5, x: 0, z: d / 2 },
    { w: 5, d: d, x: -w / 2, z: 0 },
    { w: 5, d: d, x: w / 2, z: 0 },
  ];
  walls.forEach((wall) => {
    const wallMesh = new THREE.Mesh(
      new THREE.BoxGeometry(wall.w, wallHeight, wall.d),
      wallMat
    );
    wallMesh.position.set(wall.x, -wallHeight / 2, wall.z);
    poolGroup.add(wallMesh);
  });

  // Pool deck border
  const deckMat = new THREE.MeshStandardMaterial({ color: 0x8b6f47, roughness: 0.8 });
  const deckBorder = new THREE.Mesh(
    new THREE.BoxGeometry(w + 20, 10, d + 20),
    deckMat
  );
  deckBorder.position.y = -2;
  poolGroup.add(deckBorder);

  group.add(poolGroup);
}

// ============= 3D GRASS AREA BUILDER =============
function build3DGrassArea(group, item, bldgX, bldgZ, currentY, building, def) {
  const areaGroup = new THREE.Group();
  areaGroup.position.set(
    item.x,
    currentY + 2,
    item.y
  );

  const w = item.w;
  const d = item.h;
  const color = normalizeHex(item.color || def.color || '#7CB342');
  const height = def.height3d || 5;

  // Base plane
  const baseMat = new THREE.MeshStandardMaterial({ color, roughness: 0.9 });
  const base = new THREE.Mesh(
    new THREE.PlaneGeometry(w, d),
    baseMat
  );
  base.rotation.x = -Math.PI / 2;
  base.position.y = height / 2;
  base.receiveShadow = true;
  areaGroup.add(base);

  // Add texture elements based on type
  if (item.type === 'grass') {
    // Grass tufts
    const tuftMat = new THREE.MeshStandardMaterial({ color: 0x5a8a3e, roughness: 0.9 });
    const tuftCount = Math.floor(w * d / 500);
    for (let i = 0; i < tuftCount; i++) {
      const tuft = new THREE.Mesh(
        new THREE.ConeGeometry(3, 8, 4),
        tuftMat
      );
      tuft.position.set(
        (Math.random() - 0.5) * w,
        height / 2 + 4,
        (Math.random() - 0.5) * d
      );
      areaGroup.add(tuft);
    }
  } else if (item.type === 'deck' || item.type === 'pool-deck') {
    // Wood planks
    const plankMat = new THREE.MeshStandardMaterial({ color: 0x6b4423, roughness: 0.8 });
    const plankWidth = 15;
    const numPlanks = Math.floor(w / plankWidth);
    for (let i = 0; i < numPlanks; i++) {
      const x = -w / 2 + plankWidth * i + plankWidth / 2;
      const plank = new THREE.Mesh(
        new THREE.BoxGeometry(plankWidth - 1, height, d),
        plankMat
      );
      plank.position.set(x, height / 2, 0);
      plank.receiveShadow = true;
      areaGroup.add(plank);
    }
  } else if (item.type === 'pathway' || item.type === 'patio' || item.type === 'driveway') {
    // Stone tiles
    const tileMat = new THREE.MeshStandardMaterial({ color: 0x78716c, roughness: 0.9 });
    const tileSize = 40;
    const numTilesX = Math.floor(w / tileSize);
    const numTilesZ = Math.floor(d / tileSize);
    for (let i = 0; i < numTilesX; i++) {
      for (let j = 0; j < numTilesZ; j++) {
        const x = -w / 2 + tileSize * i + tileSize / 2;
        const z = -d / 2 + tileSize * j + tileSize / 2;
        const tile = new THREE.Mesh(
          new THREE.BoxGeometry(tileSize - 2, height, tileSize - 2),
          tileMat
        );
        tile.position.set(x, height / 2, z);
        tile.receiveShadow = true;
        areaGroup.add(tile);
      }
    }
  }

  group.add(areaGroup);
}

// ============= 3D LIGHTING BUILDER =============
function build3DLighting(group, item, bldgX, bldgZ, currentY, building, def) {
  const lightGroup = new THREE.Group();
  lightGroup.position.set(
    item.x,
    currentY + 5,
    item.y
  );
  lightGroup.rotation.y = -item.rotation;

  const type = item.type;
  const color = normalizeHex(item.color || '#FFEB99');
  const w = item.w;
  const h = item.h;
  const height = def.height3d || 15;
  const floorHeight = 280; // approx floor-to-ceiling

  // Light material (emissive so it glows)
  const lightMat = new THREE.MeshStandardMaterial({
    color: color,
    emissive: color,
    emissiveIntensity: 0.8,
    roughness: 0.2,
    metalness: 0.3,
  });
  const bodyMat = new THREE.MeshStandardMaterial({
    color: 0x1F2937,
    roughness: 0.5,
    metalness: 0.5,
  });

  if (type === 'light-pendant' || type === 'light-chandelier' || type === 'light-industrial') {
    // Pendant/chandelier: ceiling mount + cable + body
    // Mount plate
    const plate = new THREE.Mesh(
      new THREE.CylinderGeometry(4, 4, 1, 12),
      bodyMat
    );
    plate.position.y = floorHeight;
    lightGroup.add(plate);
    // Cable
    const cable = new THREE.Mesh(
      new THREE.CylinderGeometry(0.5, 0.5, height, 6),
      bodyMat
    );
    cable.position.y = floorHeight - height / 2;
    lightGroup.add(cable);
    // Shade (cone)
    const shadeHeight = type === 'light-chandelier' ? height * 0.8 : 25;
    const shade = new THREE.Mesh(
      new THREE.ConeGeometry(w / 2, shadeHeight, 16, 1, true),
      type === 'light-industrial' ? bodyMat : new THREE.MeshStandardMaterial({ color: 0x374151, roughness: 0.4, metalness: 0.6 })
    );
    shade.position.y = floorHeight - height - shadeHeight / 2;
    lightGroup.add(shade);
    // Bulb
    const bulb = new THREE.Mesh(
      new THREE.SphereGeometry(w / 4, 12, 12),
      lightMat
    );
    bulb.position.y = floorHeight - height - shadeHeight / 2;
    lightGroup.add(bulb);
    // Point light (actual light source)
    const pointLight = new THREE.PointLight(color, 0.8, 200, 2);
    pointLight.position.y = floorHeight - height - shadeHeight / 2;
    lightGroup.add(pointLight);

    if (type === 'light-chandelier') {
      // Multiple arms for chandelier
      for (let i = 0; i < 6; i++) {
        const angle = (i / 6) * Math.PI * 2;
        const armRadius = w / 3;
        const arm = new THREE.Mesh(
          new THREE.CylinderGeometry(0.5, 0.5, armRadius, 6),
          bodyMat
        );
        arm.position.set(Math.cos(angle) * armRadius / 2, floorHeight - height - shadeHeight / 2, Math.sin(angle) * armRadius / 2);
        arm.rotation.z = Math.PI / 2;
        arm.rotation.y = -angle;
        lightGroup.add(arm);
        const armBulb = new THREE.Mesh(
          new THREE.SphereGeometry(3, 8, 8),
          lightMat
        );
        armBulb.position.set(Math.cos(angle) * armRadius, floorHeight - height - shadeHeight / 2 - 3, Math.sin(angle) * armRadius);
        lightGroup.add(armBulb);
      }
    }
  } else if (type === 'light-ceiling' || type === 'light-decorative') {
    // Ceiling light: dome shape
    const dome = new THREE.Mesh(
      new THREE.SphereGeometry(w / 2, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2),
      lightMat
    );
    dome.position.y = floorHeight - 5;
    dome.rotation.x = Math.PI;
    lightGroup.add(dome);
    // Mount plate
    const plate = new THREE.Mesh(
      new THREE.CylinderGeometry(w / 2 + 1, w / 2 + 1, 2, 16),
      bodyMat
    );
    plate.position.y = floorHeight - 1;
    lightGroup.add(plate);
    // Point light
    const pointLight = new THREE.PointLight(color, 0.6, 150, 2);
    pointLight.position.y = floorHeight - 15;
    lightGroup.add(pointLight);
  } else if (type === 'light-downlight' || type === 'light-spotlight') {
    // Downlight: small cylinder
    const downlight = new THREE.Mesh(
      new THREE.CylinderGeometry(w / 2, w / 2, 8, 12),
      bodyMat
    );
    downlight.position.y = floorHeight - 4;
    lightGroup.add(downlight);
    // Inner light
    const innerLight = new THREE.Mesh(
      new THREE.CylinderGeometry(w / 2 - 1, w / 2 - 1, 1, 12),
      lightMat
    );
    innerLight.position.y = floorHeight - 8;
    lightGroup.add(innerLight);
    // Spot light
    const spotLight = new THREE.SpotLight(color, 0.8, 100, Math.PI / 6, 0.4);
    spotLight.position.y = floorHeight - 8;
    spotLight.target.position.y = 0;
    lightGroup.add(spotLight);
    lightGroup.add(spotLight.target);
  } else if (type === 'light-led-strip' || type === 'light-track') {
    // LED strip / track: long thin extrusion
    const track = new THREE.Mesh(
      new THREE.BoxGeometry(w, 4, h),
      bodyMat
    );
    track.position.y = floorHeight - 2;
    lightGroup.add(track);
    // LED bulbs (small spheres along the strip)
    const numBulbs = Math.max(3, Math.floor(w / 20));
    for (let i = 0; i < numBulbs; i++) {
      const x = -w / 2 + (w / (numBulbs - 1)) * i;
      const bulb = new THREE.Mesh(
        new THREE.SphereGeometry(1.5, 8, 8),
        lightMat
      );
      bulb.position.set(x, floorHeight - 5, 0);
      lightGroup.add(bulb);
    }
    // Light source along the strip
    const pointLight = new THREE.PointLight(color, 0.5, 100);
    pointLight.position.y = floorHeight - 10;
    lightGroup.add(pointLight);
  } else if (type === 'light-wall-sconce') {
    // Wall sconce: half dome on wall
    const dome = new THREE.Mesh(
      new THREE.SphereGeometry(w / 2, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2),
      lightMat
    );
    dome.position.set(0, floorHeight - 80, 0);
    dome.rotation.x = -Math.PI / 2;
    lightGroup.add(dome);
    const pointLight = new THREE.PointLight(color, 0.4, 80);
    pointLight.position.set(0, floorHeight - 80, 5);
    lightGroup.add(pointLight);
  } else if (type === 'light-floor' || type === 'light-bedside' || type === 'light-table') {
    // Floor/table lamp: base + pole + shade
    const baseHeight = 5;
    const base = new THREE.Mesh(
      new THREE.CylinderGeometry(w / 3, w / 2, baseHeight, 12),
      bodyMat
    );
    base.position.y = baseHeight / 2;
    lightGroup.add(base);
    // Pole
    const pole = new THREE.Mesh(
      new THREE.CylinderGeometry(1, 1, height - baseHeight - 15, 8),
      bodyMat
    );
    pole.position.y = baseHeight + (height - baseHeight - 15) / 2;
    lightGroup.add(pole);
    // Shade
    const shade = new THREE.Mesh(
      new THREE.ConeGeometry(w / 2, 15, 16, 1, true),
      lightMat
    );
    shade.position.y = height - 7.5;
    lightGroup.add(shade);
    // Bulb inside shade
    const bulb = new THREE.Mesh(
      new THREE.SphereGeometry(3, 8, 8),
      lightMat
    );
    bulb.position.y = height - 12;
    lightGroup.add(bulb);
    // Point light
    const pointLight = new THREE.PointLight(color, 0.5, 80);
    pointLight.position.y = height - 12;
    lightGroup.add(pointLight);
  } else if (type === 'light-garden' || type === 'light-flood' || type === 'light-bulkhead') {
    // Outdoor light: post + lamp head
    const post = new THREE.Mesh(
      new THREE.CylinderGeometry(1.5, 2, height, 8),
      bodyMat
    );
    post.position.y = height / 2;
    lightGroup.add(post);
    // Lamp head
    const lampHead = new THREE.Mesh(
      new THREE.BoxGeometry(w / 2, 8, w / 2),
      bodyMat
    );
    lampHead.position.y = height + 4;
    lightGroup.add(lampHead);
    // Glass panel (emissive)
    const glass = new THREE.Mesh(
      new THREE.BoxGeometry(w / 2 - 2, 5, w / 2 - 2),
      lightMat
    );
    glass.position.y = height + 4;
    lightGroup.add(glass);
    // Top cap
    const cap = new THREE.Mesh(
      new THREE.ConeGeometry(w / 2 + 2, 5, 4),
      bodyMat
    );
    cap.position.y = height + 10;
    lightGroup.add(cap);
    // Point light
    const pointLight = new THREE.PointLight(color, 0.6, 100);
    pointLight.position.y = height + 4;
    lightGroup.add(pointLight);
  } else if (type === 'light-pool') {
    // Pool light: small round in floor
    const lens = new THREE.Mesh(
      new THREE.CylinderGeometry(w / 2, w / 2, 2, 12),
      lightMat
    );
    lens.position.y = 1;
    lightGroup.add(lens);
    // Point light underwater
    const pointLight = new THREE.PointLight(color, 0.5, 50);
    pointLight.position.y = 5;
    lightGroup.add(pointLight);
  } else if (type === 'light-emergency') {
    // Emergency light: box with red indicator
    const box = new THREE.Mesh(
      new THREE.BoxGeometry(w, 8, 5),
      bodyMat
    );
    box.position.y = floorHeight - 4;
    lightGroup.add(box);
    // Two lamp heads
    for (let i = 0; i < 2; i++) {
      const head = new THREE.Mesh(
        new THREE.SphereGeometry(2, 8, 8),
        lightMat
      );
      head.position.set(-w / 4 + i * w / 2, floorHeight - 4, 3);
      lightGroup.add(head);
    }
    // Red LED indicator
    const indicator = new THREE.Mesh(
      new THREE.SphereGeometry(0.5, 6, 6),
      new THREE.MeshStandardMaterial({ color: 0xFF0000, emissive: 0xFF0000, emissiveIntensity: 1 })
    );
    indicator.position.set(0, floorHeight - 4, 3);
    lightGroup.add(indicator);
  } else {
    // Default light: small bulb
    const bulb = new THREE.Mesh(
      new THREE.SphereGeometry(w / 2, 12, 12),
      lightMat
    );
    bulb.position.y = floorHeight - 5;
    lightGroup.add(bulb);
    const pointLight = new THREE.PointLight(color, 0.5, 100);
    pointLight.position.y = floorHeight - 5;
    lightGroup.add(pointLight);
  }

  group.add(lightGroup);
}

// ============= 3D CEILING BUILDER =============
function build3DCeiling(group, item, bldgX, bldgZ, currentY, building, def) {
  const ceilingGroup = new THREE.Group();
  ceilingGroup.position.set(
    item.x,
    currentY + 5,
    item.y
  );
  ceilingGroup.rotation.y = -item.rotation;

  const w = item.w;
  const h = item.h;
  const thickness = Math.max(def.height3d || 5, 1);
  const color = normalizeHex(item.color || '#F5F5F5');
  const type = item.type;
  const floorHeight = 280;

  // Main ceiling plane (thin slab at ceiling level)
  const ceilMat = new THREE.MeshStandardMaterial({
    color: color,
    roughness: type === 'ceiling-gypsum' || type === 'ceiling-pvc' ? 0.9 : 0.7,
    metalness: type === 'ceiling-metal-deck' ? 0.6 : 0.1,
    side: THREE.DoubleSide,
  });

  if (type === 'ceiling-exposed') {
    // No ceiling - just show beams
    const beamMat = new THREE.MeshStandardMaterial({ color: 0x78716C, roughness: 0.8 });
    // Main beams (every 100cm)
    for (let x = -w / 2; x <= w / 2; x += 100) {
      const beam = new THREE.Mesh(
        new THREE.BoxGeometry(8, 20, h),
        beamMat
      );
      beam.position.set(x, floorHeight - 10, 0);
      ceilingGroup.add(beam);
    }
    // Cross beams
    for (let z = -h / 2; z <= h / 2; z += 100) {
      const beam = new THREE.Mesh(
        new THREE.BoxGeometry(w, 15, 8),
        beamMat
      );
      beam.position.set(0, floorHeight - 7, z);
      ceilingGroup.add(beam);
    }
  } else if (type === 'ceiling-coffered') {
    // Coffered ceiling: grid of sunken squares
    const ceiling = new THREE.Mesh(
      new THREE.BoxGeometry(w, thickness, h),
      ceilMat
    );
    ceiling.position.y = floorHeight;
    ceilingGroup.add(ceiling);
    // Coffered beams (grid pattern, 40cm cells)
    const beamMat = new THREE.MeshStandardMaterial({ color: 0xD4A574, roughness: 0.5, metalness: 0.2 });
    const beamHeight = 8;
    const cellSize = 40;
    for (let x = -w / 2; x <= w / 2; x += cellSize) {
      const beam = new THREE.Mesh(
        new THREE.BoxGeometry(3, beamHeight, h),
        beamMat
      );
      beam.position.set(x, floorHeight - beamHeight / 2, 0);
      ceilingGroup.add(beam);
    }
    for (let z = -h / 2; z <= h / 2; z += cellSize) {
      const beam = new THREE.Mesh(
        new THREE.BoxGeometry(w, beamHeight, 3),
        beamMat
      );
      beam.position.set(0, floorHeight - beamHeight / 2, z);
      ceilingGroup.add(beam);
    }
  } else if (type === 'ceiling-cove') {
    // Cove ceiling: outer ring + inner ceiling
    const outerCeil = new THREE.Mesh(
      new THREE.BoxGeometry(w, thickness, h),
      ceilMat
    );
    outerCeil.position.y = floorHeight;
    ceilingGroup.add(outerCeil);
    // Inner ceiling (raised)
    const innerW = w - 30;
    const innerH = h - 30;
    const innerCeil = new THREE.Mesh(
      new THREE.BoxGeometry(innerW, thickness, innerH),
      new THREE.MeshStandardMaterial({ color: 0xFAFAFA, roughness: 0.9 })
    );
    innerCeil.position.y = floorHeight + 15;
    ceilingGroup.add(innerCeil);
    // LED strip glow (emissive)
    const ledStrip = new THREE.Mesh(
      new THREE.BoxGeometry(w - 5, 2, h - 5),
      new THREE.MeshStandardMaterial({ color: 0xFFEB99, emissive: 0xFFEB99, emissiveIntensity: 0.8 })
    );
    ledStrip.position.y = floorHeight + 5;
    ceilingGroup.add(ledStrip);
  } else if (type === 'ceiling-drop-tbar') {
    // Drop ceiling T-bar
    const ceiling = new THREE.Mesh(
      new THREE.BoxGeometry(w, thickness, h),
      ceilMat
    );
    ceiling.position.y = floorHeight;
    ceilingGroup.add(ceiling);
    // T-bar grid (60cm cells)
    const tbarMat = new THREE.MeshStandardMaterial({ color: 0x374151, roughness: 0.4, metalness: 0.6 });
    for (let x = -w / 2; x <= w / 2; x += 60) {
      const tbar = new THREE.Mesh(
        new THREE.BoxGeometry(1.5, 4, h),
        tbarMat
      );
      tbar.position.set(x, floorHeight - 2, 0);
      ceilingGroup.add(tbar);
    }
    for (let z = -h / 2; z <= h / 2; z += 60) {
      const tbar = new THREE.Mesh(
        new THREE.BoxGeometry(w, 4, 1.5),
        tbarMat
      );
      tbar.position.set(0, floorHeight - 2, z);
      ceilingGroup.add(tbar);
    }
  } else if (type === 'ceiling-wood') {
    // Wood ceiling with planks
    const ceiling = new THREE.Mesh(
      new THREE.BoxGeometry(w, thickness, h),
      new THREE.MeshStandardMaterial({ color: 0x8B6F47, roughness: 0.7, metalness: 0.1 })
    );
    ceiling.position.y = floorHeight;
    ceilingGroup.add(ceiling);
    // Plank lines (every 15cm)
    const plankMat = new THREE.MeshStandardMaterial({ color: 0x6B4423, roughness: 0.7 });
    for (let z = -h / 2; z <= h / 2; z += 15) {
      const plank = new THREE.Mesh(
        new THREE.BoxGeometry(w, 1, 0.5),
        plankMat
      );
      plank.position.set(0, floorHeight + thickness / 2, z);
      ceilingGroup.add(plank);
    }
  } else {
    // Default: gypsum, PVC, metal deck, stretch (flat ceiling)
    const ceiling = new THREE.Mesh(
      new THREE.BoxGeometry(w, thickness, h),
      ceilMat
    );
    ceiling.position.y = floorHeight;
    ceilingGroup.add(ceiling);
  }

  group.add(ceilingGroup);
}

// ============= 3D TRIM BUILDER (Lisplang & Tali Air) =============
function build3DTrim(group, item, bldgX, bldgZ, currentY, building, def) {
  const trimGroup = new THREE.Group();
  trimGroup.position.set(
    item.x,
    currentY + 5,
    item.y
  );
  trimGroup.rotation.y = -item.rotation;

  const w = item.w;
  const h = item.h;
  const height = def.height3d || 15;
  const color = normalizeHex(item.color || '#8B6F47');
  const type = item.type;
  const floorHeight = 280;

  const trimMat = new THREE.MeshStandardMaterial({
    color: color,
    roughness: type.includes('aluminum') ? 0.3 : 0.7,
    metalness: type.includes('aluminum') || type.includes('galvanized') || type.includes('copper') ? 0.7 : 0.2,
  });

  if (type.startsWith('lisplang-')) {
    // Lisplang: long board at top of wall (fascia board)
    const lisplang = new THREE.Mesh(
      new THREE.BoxGeometry(w, height, h),
      trimMat
    );
    lisplang.position.y = floorHeight + height / 2;
    trimGroup.add(lisplang);
    // Slope on top for modern/klasik
    if (type === 'lisplang-modern' || type === 'lisplang-klasik') {
      const slope = new THREE.Mesh(
        new THREE.BoxGeometry(w, 2, h + 4),
        trimMat
      );
      slope.position.y = floorHeight + height;
      slope.rotation.x = Math.PI * 0.05;
      trimGroup.add(slope);
    }
    // Decorative cutouts for klasik
    if (type === 'lisplang-klasik') {
      const decorMat = new THREE.MeshStandardMaterial({ color: 0x5D3A1A, roughness: 0.6 });
      const numCutouts = Math.floor(w / 30);
      for (let i = 0; i < numCutouts; i++) {
        const x = -w / 2 + (w / numCutouts) * (i + 0.5);
        const cutout = new THREE.Mesh(
          new THREE.BoxGeometry(8, 8, 2),
          decorMat
        );
        cutout.position.set(x, floorHeight + height / 2, h / 2);
        trimGroup.add(cutout);
      }
    }
  } else if (type.startsWith('tali-air-')) {
    // Tali air (gutter): U-channel
    // Main gutter body
    const gutter = new THREE.Mesh(
      new THREE.BoxGeometry(w, height, h),
      trimMat
    );
    gutter.position.y = floorHeight + height / 2;
    trimGroup.add(gutter);
    // Inner channel (carved out look - use box on top)
    const innerChannel = new THREE.Mesh(
      new THREE.BoxGeometry(w - 4, 3, h - 4),
      new THREE.MeshStandardMaterial({ color: 0x1F2937, roughness: 0.5 })
    );
    innerChannel.position.y = floorHeight + height - 1;
    trimGroup.add(innerChannel);
    // Downspout at end
    if (type !== 'tali-air-hidden') {
      const downspout = new THREE.Mesh(
        new THREE.BoxGeometry(4, 100, 4),
        trimMat
      );
      downspout.position.set(w / 2 - 2, floorHeight - 50, 0);
      trimGroup.add(downspout);
    }
  } else if (type.startsWith('list-')) {
    // List (thin trim): small rectangle
    const list = new THREE.Mesh(
      new THREE.BoxGeometry(w, height, h),
      trimMat
    );
    list.position.y = floorHeight / 2;
    trimGroup.add(list);
  }

  group.add(trimGroup);
}

// ============= 3D VENTILATION BUILDER =============
function build3DVentilation(group, item, bldgX, bldgZ, currentY, building, def) {
  const ventGroup = new THREE.Group();
  ventGroup.position.set(
    item.x,
    currentY + 5,
    item.y
  );
  ventGroup.rotation.y = -item.rotation;

  const w = item.w;
  const h = item.h;
  const height = def.height3d || 30;
  const color = normalizeHex(item.color || '#9CA3AF');
  const type = item.type;
  const floorHeight = 280;

  const ventMat = new THREE.MeshStandardMaterial({
    color: color,
    roughness: 0.5,
    metalness: 0.6,
  });

  if (type === 'vent-wall' || type === 'vent-louver-wall' || type === 'vent-gable' || type === 'louver-window') {
    // Louver vent: box with horizontal slats
    const frame = new THREE.Mesh(
      new THREE.BoxGeometry(w, height, 5),
      ventMat
    );
    frame.position.y = floorHeight / 2;
    ventGroup.add(frame);
    // Slats (horizontal)
    const slatMat = new THREE.MeshStandardMaterial({ color: 0x1F2937, roughness: 0.5, metalness: 0.5 });
    const numSlats = 5;
    for (let i = 0; i < numSlats; i++) {
      const y = floorHeight / 2 - height / 2 + (height / numSlats) * (i + 0.5);
      const slat = new THREE.Mesh(
        new THREE.BoxGeometry(w - 4, 3, 2),
        slatMat
      );
      slat.position.set(0, y, 3);
      slat.rotation.x = -Math.PI * 0.1; // tilt for water runoff
      ventGroup.add(slat);
    }
  } else if (type === 'vent-turbine' || type === 'vent-mushroom') {
    // Turbine vent: round base + turbine top
    const base = new THREE.Mesh(
      new THREE.CylinderGeometry(w / 3, w / 3, 15, 12),
      ventMat
    );
    base.position.y = 7.5;
    ventGroup.add(base);
    // Head (round)
    const head = new THREE.Mesh(
      new THREE.SphereGeometry(w / 2, 16, 12),
      ventMat
    );
    head.position.y = 25;
    ventGroup.add(head);
    // Blades (vertical lines)
    const bladeMat = new THREE.MeshStandardMaterial({ color: 0x4B5563, roughness: 0.5, metalness: 0.7 });
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2;
      const blade = new THREE.Mesh(
        new THREE.BoxGeometry(1, 20, w / 3),
        bladeMat
      );
      blade.position.set(Math.cos(angle) * w / 4, 25, Math.sin(angle) * w / 4);
      blade.rotation.y = angle;
      ventGroup.add(blade);
    }
  } else if (type === 'vent-kitchen-hood') {
    // Kitchen hood: trapezoid body
    const hood = new THREE.Mesh(
      new THREE.CylinderGeometry(w / 3, w / 2, height, 4),
      ventMat
    );
    hood.position.y = height / 2;
    hood.rotation.y = Math.PI / 4;
    ventGroup.add(hood);
    // Duct pipe up
    const duct = new THREE.Mesh(
      new THREE.CylinderGeometry(w / 4, w / 4, 30, 12),
      ventMat
    );
    duct.position.y = height + 15;
    ventGroup.add(duct);
  } else if (type === 'vent-bathroom-exhaust' || type === 'vent-exhaust-fan') {
    // Exhaust fan: round with fan
    const housing = new THREE.Mesh(
      new THREE.CylinderGeometry(w / 2, w / 2, 10, 16),
      ventMat
    );
    housing.position.y = 5;
    housing.rotation.x = Math.PI / 2;
    ventGroup.add(housing);
    // Fan blades
    const fanMat = new THREE.MeshStandardMaterial({ color: 0x9CA3AF, roughness: 0.4, metalness: 0.6 });
    for (let i = 0; i < 3; i++) {
      const angle = (i / 3) * Math.PI * 2;
      const blade = new THREE.Mesh(
        new THREE.BoxGeometry(w / 2 - 2, 1, 4),
        fanMat
      );
      blade.position.set(Math.cos(angle) * w / 5, 5, Math.sin(angle) * w / 5);
      blade.rotation.y = angle;
      ventGroup.add(blade);
    }
    // Center hub
    const hub = new THREE.Mesh(
      new THREE.CylinderGeometry(2, 2, 3, 8),
      new THREE.MeshStandardMaterial({ color: 0x1F2937, roughness: 0.5 })
    );
    hub.position.y = 5;
    hub.rotation.x = Math.PI / 2;
    ventGroup.add(hub);
  } else if (type === 'vent-ridge' || type === 'vent-soffit') {
    // Ridge/soffit vent: long thin profile
    const vent = new THREE.Mesh(
      new THREE.BoxGeometry(w, 5, h),
      ventMat
    );
    vent.position.y = height / 2;
    ventGroup.add(vent);
    // Vent slots
    const slotMat = new THREE.MeshStandardMaterial({ color: 0x1F2937 });
    const numSlots = Math.floor(w / 10);
    for (let i = 0; i < numSlots; i++) {
      const x = -w / 2 + (w / numSlots) * (i + 0.5);
      const slot = new THREE.Mesh(
        new THREE.BoxGeometry(3, 2, h - 2),
        slotMat
      );
      slot.position.set(x, 3, 0);
      ventGroup.add(slot);
    }
  } else if (type === 'vent-ac') {
    // AC outdoor unit: box with fan
    const unit = new THREE.Mesh(
      new THREE.BoxGeometry(w, height, 20),
      ventMat
    );
    unit.position.y = floorHeight / 2;
    ventGroup.add(unit);
    // Fan grille
    const fanGrille = new THREE.Mesh(
      new THREE.CylinderGeometry(height / 3, height / 3, 2, 16),
      new THREE.MeshStandardMaterial({ color: 0x1F2937, roughness: 0.5 })
    );
    fanGrille.position.set(-w / 4, floorHeight / 2, 11);
    fanGrille.rotation.x = Math.PI / 2;
    ventGroup.add(fanGrille);
    // Fan blades
    for (let i = 0; i < 5; i++) {
      const angle = (i / 5) * Math.PI * 2;
      const blade = new THREE.Mesh(
        new THREE.BoxGeometry(height / 3, 1, 2),
        new THREE.MeshStandardMaterial({ color: 0x9CA3AF })
      );
      blade.position.set(-w / 4, floorHeight / 2, 11);
      blade.rotation.x = Math.PI / 2;
      blade.rotation.y = angle;
      ventGroup.add(blade);
    }
    // Heat fins (back)
    for (let i = 0; i < 6; i++) {
      const fin = new THREE.Mesh(
        new THREE.BoxGeometry(1, height - 4, 2),
        new THREE.MeshStandardMaterial({ color: 0x374151, roughness: 0.4, metalness: 0.7 })
      );
      fin.position.set(w / 4 + i * 2, floorHeight / 2, -10);
      ventGroup.add(fin);
    }
  } else if (type === 'vent-solar') {
    // Solar vent: round with solar panel top
    const base = new THREE.Mesh(
      new THREE.CylinderGeometry(w / 2, w / 2, 8, 16),
      ventMat
    );
    base.position.y = 4;
    ventGroup.add(base);
    // Solar panel top
    const panel = new THREE.Mesh(
      new THREE.CylinderGeometry(w / 2 - 2, w / 2 - 2, 3, 16),
      new THREE.MeshStandardMaterial({ color: 0x1E3A5F, roughness: 0.2, metalness: 0.8 })
    );
    panel.position.y = 9;
    ventGroup.add(panel);
    // Solar cell lines
    const cellMat = new THREE.MeshStandardMaterial({ color: 0x3B82F6, emissive: 0x1E40AF, emissiveIntensity: 0.2 });
    for (let i = 0; i < 4; i++) {
      const line = new THREE.Mesh(
        new THREE.BoxGeometry(w - 4, 0.5, 1),
        cellMat
      );
      line.position.set(0, 11, -w / 4 + i * w / 6);
      ventGroup.add(line);
    }
  } else {
    // Default vent (roof, static)
    const vent = new THREE.Mesh(
      new THREE.BoxGeometry(w, height, h),
      ventMat
    );
    vent.position.y = height / 2;
    ventGroup.add(vent);
    // Top slats
    const slatMat = new THREE.MeshStandardMaterial({ color: 0x1F2937 });
    for (let i = 0; i < 4; i++) {
      const slat = new THREE.Mesh(
        new THREE.BoxGeometry(w - 4, 1, 1),
        slatMat
      );
      slat.position.set(0, height - 2, -h / 4 + i * h / 4);
      ventGroup.add(slat);
    }
  }

  group.add(ventGroup);
}

// ============= 3D FLOORING BUILDER =============
function build3DFlooring(group, item, bldgX, bldgZ, currentY, building, def) {
  const floorGroup = new THREE.Group();
  floorGroup.position.set(
    item.x,
    currentY + 5,
    item.y
  );
  floorGroup.rotation.y = -item.rotation;

  const w = item.w;
  const h = item.h;
  const thickness = Math.max(def.height3d || 5, 1);
  const color = normalizeHex(item.color || '#E5E5E5');
  const type = item.type;

  // Floor material (texture varies by type)
  let floorMat;
  if (type.includes('granite-polished') || type.includes('marble')) {
    floorMat = new THREE.MeshStandardMaterial({ color, roughness: 0.1, metalness: 0.2 });
  } else if (type.includes('epoxy')) {
    floorMat = new THREE.MeshStandardMaterial({ color, roughness: 0.05, metalness: 0.3 });
  } else if (type.includes('wood') || type.includes('parquet') || type.includes('hardwood') || type.includes('bamboo') || type.includes('laminate')) {
    floorMat = new THREE.MeshStandardMaterial({ color, roughness: 0.7, metalness: 0.1 });
  } else if (type.includes('vinyl')) {
    floorMat = new THREE.MeshStandardMaterial({ color, roughness: 0.6, metalness: 0.05 });
  } else if (type.includes('concrete') || type.includes('terrazzo')) {
    floorMat = new THREE.MeshStandardMaterial({ color, roughness: 0.85, metalness: 0.0 });
  } else if (type.includes('carpet')) {
    floorMat = new THREE.MeshStandardMaterial({ color, roughness: 0.95, metalness: 0.0 });
  } else {
    // Ceramic, granite honed, etc.
    floorMat = new THREE.MeshStandardMaterial({ color, roughness: 0.4, metalness: 0.05 });
  }

  // Main floor slab (very thin, on the floor level)
  const floor = new THREE.Mesh(
    new THREE.BoxGeometry(w, thickness, h),
    floorMat
  );
  floor.position.y = thickness / 2;
  floor.receiveShadow = true;
  floorGroup.add(floor);

  // Add tile/grout pattern for ceramic/granite/marble (using thin boxes on top)
  if (type.includes('ceramic') || type.includes('granite') || type.includes('marble') || type.includes('terrazzo') || type.includes('carpet-tile') || type.includes('bathroom-tile') || type.includes('kitchen-tile')) {
    const groutMat = new THREE.MeshStandardMaterial({ color: 0x6B7280, roughness: 0.8 });
    let tileSize = 30;
    if (type.includes('ceramic-40')) tileSize = 40;
    else if (type.includes('ceramic-60') || type.includes('granite-60')) tileSize = 60;
    else if (type.includes('granite-80') || type.includes('granite-polished') || type.includes('granite-honed')) tileSize = 80;
    else if (type.includes('marble')) tileSize = 60;
    else if (type.includes('terrazzo')) tileSize = 100;
    else if (type.includes('carpet-tile')) tileSize = 50;
    // Grout lines (only if tile is small enough to show)
    if (tileSize <= 100 && w / tileSize < 30) {
      for (let x = -w / 2 + tileSize; x < w / 2; x += tileSize) {
        const grout = new THREE.Mesh(
          new THREE.BoxGeometry(0.5, 0.5, h),
          groutMat
        );
        grout.position.set(x, thickness, 0);
        floorGroup.add(grout);
      }
      for (let z = -h / 2 + tileSize; z < h / 2; z += tileSize) {
        const grout = new THREE.Mesh(
          new THREE.BoxGeometry(w, 0.5, 0.5),
          groutMat
        );
        grout.position.set(0, thickness, z);
        floorGroup.add(grout);
      }
    }
  } else if (type.includes('parquet') || type.includes('hardwood') || type.includes('laminate') || type.includes('bamboo') || type.includes('wood-deck')) {
    // Wood planks
    const plankMat = new THREE.MeshStandardMaterial({ color: 0x5D3A1A, roughness: 0.7 });
    const plankH = 12;
    for (let z = -h / 2 + plankH; z < h / 2; z += plankH) {
      const plank = new THREE.Mesh(
        new THREE.BoxGeometry(w, 0.5, 0.5),
        plankMat
      );
      plank.position.set(0, thickness, z);
      floorGroup.add(plank);
    }
  } else if (type.includes('mosaic')) {
    // Mosaic: many small boxes (limit count for performance)
    const mSize = 6;
    if (w * h < 50000) {
      const mMat = new THREE.MeshStandardMaterial({ color: 0xE91E63, roughness: 0.4 });
      for (let x = -w / 2 + mSize; x < w / 2; x += mSize) {
        for (let z = -h / 2 + mSize; z < h / 2; z += mSize) {
          const m = new THREE.Mesh(
            new THREE.BoxGeometry(mSize - 0.5, 0.5, mSize - 0.5),
            mMat
          );
          m.position.set(x, thickness, z);
          floorGroup.add(m);
        }
      }
    }
  }

  group.add(floorGroup);
}

// ============= 3D SPECIAL COLUMN BUILDER =============
function build3DSpecialColumn(group, item, bldgX, bldgZ, currentY, building, def, isStructural) {
  const colGroup = new THREE.Group();
  colGroup.position.set(
    item.x,
    currentY + 5,
    item.y
  );
  colGroup.rotation.y = -item.rotation;

  const w = item.w;
  const h = item.h;
  const height = def.height3d || 300;
  const color = isStructural ? 0xf59e0b : normalizeHex(item.color || '#DC2626');
  const type = item.type;

  // Material selection
  let colMat;
  if (type === 'column-marble') {
    colMat = new THREE.MeshStandardMaterial({ color: 0xF5F5F5, roughness: 0.15, metalness: 0.1 });
  } else if (type.startsWith('column-wood')) {
    colMat = new THREE.MeshStandardMaterial({ color: 0x8B6F47, roughness: 0.7, metalness: 0.1 });
  } else if (type.startsWith('column-steel')) {
    colMat = new THREE.MeshStandardMaterial({ color: 0x6B7280, roughness: 0.3, metalness: 0.8 });
  } else if (type.startsWith('column-classic')) {
    colMat = new THREE.MeshStandardMaterial({ color: 0xF5F5F5, roughness: 0.4, metalness: 0.1 });
  } else if (type === 'column-modern-square') {
    colMat = new THREE.MeshStandardMaterial({ color: 0x1F2937, roughness: 0.5, metalness: 0.4 });
  } else {
    colMat = new THREE.MeshStandardMaterial({ color, roughness: 0.6, metalness: 0.2 });
  }

  if (type === 'column-round' || type === 'column-marble') {
    // Round column
    const col = new THREE.Mesh(
      new THREE.CylinderGeometry(w / 2, w / 2, height, 24),
      colMat
    );
    col.position.y = height / 2;
    col.castShadow = true;
    colGroup.add(col);
  } else if (type === 'column-wood-round') {
    // Wood round - slightly tapered
    const col = new THREE.Mesh(
      new THREE.CylinderGeometry(w / 2.5, w / 2, height, 16),
      colMat
    );
    col.position.y = height / 2;
    col.castShadow = true;
    colGroup.add(col);
    // Bark texture (rings on top)
    const top = new THREE.Mesh(
      new THREE.CylinderGeometry(w / 2.5, w / 2.5, 1, 16),
      new THREE.MeshStandardMaterial({ color: 0x5D3A1A, roughness: 0.8 })
    );
    top.position.y = height;
    colGroup.add(top);
  } else if (type === 'column-hexagon' || type === 'column-octagon') {
    // Polygon column
    const sides = type === 'column-hexagon' ? 6 : 8;
    const col = new THREE.Mesh(
      new THREE.CylinderGeometry(w / 2, w / 2, height, sides),
      colMat
    );
    col.position.y = height / 2;
    col.castShadow = true;
    colGroup.add(col);
  } else if (type === 'column-classic' || type === 'column-classic-ionic' || type === 'column-classic-corinthian') {
    // Classical column: base + shaft + capital
    const shaftHeight = height - 30;
    // Base
    const base = new THREE.Mesh(
      new THREE.BoxGeometry(w + 8, 8, h + 8),
      colMat
    );
    base.position.y = 4;
    colGroup.add(base);
    const baseMolding = new THREE.Mesh(
      new THREE.CylinderGeometry(w / 2 + 4, w / 2 + 6, 6, 24),
      colMat
    );
    baseMolding.position.y = 11;
    colGroup.add(baseMolding);
    // Shaft (with entasis - slight bulge)
    const shaft = new THREE.Mesh(
      new THREE.CylinderGeometry(w / 2.2, w / 2.4, shaftHeight, 24),
      colMat
    );
    shaft.position.y = 14 + shaftHeight / 2;
    shaft.castShadow = true;
    colGroup.add(shaft);
    // Flutes (vertical lines)
    const fluteMat = new THREE.MeshStandardMaterial({ color: 0xD4D4D4, roughness: 0.5 });
    const numFlutes = 20;
    for (let i = 0; i < numFlutes; i++) {
      const angle = (i / numFlutes) * Math.PI * 2;
      const flute = new THREE.Mesh(
        new THREE.BoxGeometry(1, shaftHeight, 1),
        fluteMat
      );
      flute.position.set(
        Math.cos(angle) * (w / 2 - 1),
        14 + shaftHeight / 2,
        Math.sin(angle) * (w / 2 - 1)
      );
      flute.rotation.y = angle;
      colGroup.add(flute);
    }
    // Capital (top decoration)
    const capBase = new THREE.Mesh(
      new THREE.CylinderGeometry(w / 2 + 4, w / 2.2, 4, 24),
      colMat
    );
    capBase.position.y = 14 + shaftHeight + 2;
    colGroup.add(capBase);
    const capAbacus = new THREE.Mesh(
      new THREE.BoxGeometry(w + 10, 6, h + 10),
      colMat
    );
    capAbacus.position.y = 14 + shaftHeight + 7;
    colGroup.add(capAbacus);
    // Volute/ornaments for Ionic/Corinthian
    if (type === 'column-classic-ionic') {
      // Ionic volutes (spirals on sides)
      const voluteMat = new THREE.MeshStandardMaterial({ color: 0xF5F5F5, roughness: 0.4 });
      [(-w / 2 - 4), (w / 2 + 4)].forEach(x => {
        const volute = new THREE.Mesh(
          new THREE.TorusGeometry(4, 1.5, 8, 16, Math.PI * 1.5),
          voluteMat
        );
        volute.position.set(x, 14 + shaftHeight + 4, 0);
        volute.rotation.y = Math.PI / 2;
        colGroup.add(volute);
      });
    } else if (type === 'column-classic-corinthian') {
      // Corinthian acanthus leaves (simplified as cones)
      const leafMat = new THREE.MeshStandardMaterial({ color: 0xFAFAFA, roughness: 0.4 });
      for (let i = 0; i < 8; i++) {
        const angle = (i / 8) * Math.PI * 2;
        const leaf = new THREE.Mesh(
          new THREE.ConeGeometry(3, 12, 4),
          leafMat
        );
        leaf.position.set(
          Math.cos(angle) * (w / 2),
          14 + shaftHeight + 3,
          Math.sin(angle) * (w / 2)
        );
        leaf.rotation.z = -Math.cos(angle) * 0.5;
        leaf.rotation.x = Math.sin(angle) * 0.5;
        colGroup.add(leaf);
      }
    }
  } else if (type === 'column-steel-pipe') {
    // Steel pipe (hollow)
    const pipe = new THREE.Mesh(
      new THREE.CylinderGeometry(w / 2, w / 2, height, 16),
      colMat
    );
    pipe.position.y = height / 2;
    colGroup.add(pipe);
    // Top and bottom caps
    const capMat = new THREE.MeshStandardMaterial({ color: 0x1F2937, roughness: 0.4, metalness: 0.7 });
    const topCap = new THREE.Mesh(
      new THREE.CylinderGeometry(w / 2, w / 2, 2, 16),
      capMat
    );
    topCap.position.y = height;
    colGroup.add(topCap);
    const botCap = topCap.clone();
    botCap.position.y = 0;
    colGroup.add(botCap);
  } else if (type === 'column-steel-hollow') {
    // Hollow steel box
    const box = new THREE.Mesh(
      new THREE.BoxGeometry(w, height, h),
      colMat
    );
    box.position.y = height / 2;
    colGroup.add(box);
    // Visible seam
    const seam = new THREE.Mesh(
      new THREE.BoxGeometry(0.5, height, 0.5),
      new THREE.MeshStandardMaterial({ color: 0x1F2937 })
    );
    seam.position.set(w / 2, height / 2, 0);
    colGroup.add(seam);
  } else if (type === 'column-lamp-post') {
    // Lamp post: tall post + light fixture on top
    const post = new THREE.Mesh(
      new THREE.CylinderGeometry(w / 3, w / 2, height, 12),
      colMat
    );
    post.position.y = height / 2;
    colGroup.add(post);
    // Light fixture
    const fixture = new THREE.Mesh(
      new THREE.BoxGeometry(w + 4, 8, h + 4),
      new THREE.MeshStandardMaterial({ color: 0x4B5563, roughness: 0.5, metalness: 0.5 })
    );
    fixture.position.y = height + 4;
    colGroup.add(fixture);
    // Light bulb
    const bulb = new THREE.Mesh(
      new THREE.SphereGeometry(w / 2, 12, 12),
      new THREE.MeshStandardMaterial({ color: 0xFFEB99, emissive: 0xFFEB99, emissiveIntensity: 0.9 })
    );
    bulb.position.y = height + 8;
    colGroup.add(bulb);
    // Top cap
    const cap = new THREE.Mesh(
      new THREE.ConeGeometry(w / 2 + 4, 6, 4),
      colMat
    );
    cap.position.y = height + 15;
    cap.rotation.y = Math.PI / 4;
    colGroup.add(cap);
    // Point light
    const pl = new THREE.PointLight(0xFFEB99, 0.8, 150, 2);
    pl.position.y = height + 8;
    colGroup.add(pl);
  } else if (type === 'column-canopy') {
    // Canopy post (thin steel)
    const post = new THREE.Mesh(
      new THREE.BoxGeometry(w, height, h),
      colMat
    );
    post.position.y = height / 2;
    colGroup.add(post);
  } else if (type === 'column-decorative') {
    // Decorative column with ornaments
    const shaft = new THREE.Mesh(
      new THREE.CylinderGeometry(w / 2, w / 2, height - 20, 16),
      colMat
    );
    shaft.position.y = 10 + (height - 20) / 2;
    colGroup.add(shaft);
    // Base
    const base = new THREE.Mesh(
      new THREE.BoxGeometry(w + 6, 10, h + 6),
      colMat
    );
    base.position.y = 5;
    colGroup.add(base);
    // Capital
    const cap = new THREE.Mesh(
      new THREE.BoxGeometry(w + 6, 10, h + 6),
      colMat
    );
    cap.position.y = height - 5;
    colGroup.add(cap);
    // Decorative rings
    const ringMat = new THREE.MeshStandardMaterial({ color: 0xD4A574, roughness: 0.4, metalness: 0.5 });
    const ring1 = new THREE.Mesh(
      new THREE.TorusGeometry(w / 2 + 1, 1, 6, 16),
      ringMat
    );
    ring1.position.y = 20;
    ring1.rotation.x = Math.PI / 2;
    colGroup.add(ring1);
    const ring2 = ring1.clone();
    ring2.position.y = height - 20;
    colGroup.add(ring2);
  } else if (type === 'column-fence-post') {
    // Fence post (short, with decorative top)
    const post = new THREE.Mesh(
      new THREE.BoxGeometry(w, height, h),
      colMat
    );
    post.position.y = height / 2;
    colGroup.add(post);
    // Decorative ball top
    const ball = new THREE.Mesh(
      new THREE.SphereGeometry(w * 0.8, 12, 12),
      new THREE.MeshStandardMaterial({ color: 0x1F2937, roughness: 0.3, metalness: 0.8 })
    );
    ball.position.y = height + w;
    colGroup.add(ball);
  } else if (type === 'column-modern-square') {
    // Modern square (minimalis)
    const col = new THREE.Mesh(
      new THREE.BoxGeometry(w, height, h),
      colMat
    );
    col.position.y = height / 2;
    col.castShadow = true;
    colGroup.add(col);
  } else if (type === 'column-wood-square') {
    // Wood square
    const col = new THREE.Mesh(
      new THREE.BoxGeometry(w, height, h),
      colMat
    );
    col.position.y = height / 2;
    col.castShadow = true;
    colGroup.add(col);
    // Wood grain lines (horizontal)
    const grainMat = new THREE.MeshStandardMaterial({ color: 0x6B4423, roughness: 0.7 });
    for (let y = 50; y < height; y += 80) {
      const grain = new THREE.Mesh(
        new THREE.BoxGeometry(w + 0.5, 0.3, h + 0.5),
        grainMat
      );
      grain.position.y = y;
      colGroup.add(grain);
    }
  } else {
    // Default
    const col = new THREE.Mesh(
      new THREE.BoxGeometry(w, height, h),
      colMat
    );
    col.position.y = height / 2;
    colGroup.add(col);
  }

  group.add(colGroup);
}

// ============= 3D SANITARY BUILDER =============
function build3DSanitary(group, item, bldgX, bldgZ, currentY, building, def) {
  const sanGroup = new THREE.Group();
  sanGroup.position.set(
    item.x,
    currentY + 5,
    item.y
  );
  sanGroup.rotation.y = -item.rotation;

  const type = item.type;
  const w = item.w;
  const d = item.h;
  const height = def.height3d || 40;
  const color = normalizeHex(item.color || def.color || '#FFFFFF');

  // Common materials
  const ceramicMat = new THREE.MeshStandardMaterial({
    color: color,
    roughness: 0.15,
    metalness: 0.05,
  });
  const metalMat = new THREE.MeshStandardMaterial({
    color: 0x9CA3AF,
    roughness: 0.2,
    metalness: 0.8,
  });
  const waterMat = new THREE.MeshPhysicalMaterial({
    color: 0x4FC3F7,
    roughness: 0.05,
    metalness: 0.0,
    transmission: 0.6,
    transparent: true,
    opacity: 0.7,
  });
  const darkMat = new THREE.MeshStandardMaterial({ color: 0x1F2937, roughness: 0.5 });

  if (type.startsWith('closet-') || type === 'toilet' || type === 'toilet-squat') {
    // Toilet (closet): bowl + tank
    // Base/bowl
    const bowl = new THREE.Mesh(
      new THREE.CylinderGeometry(w / 2.5, w / 3, height * 0.5, 16),
      ceramicMat
    );
    bowl.position.y = height * 0.25;
    bowl.castShadow = true;
    sanGroup.add(bowl);
    // Seat (top ellipse)
    const seat = new THREE.Mesh(
      new THREE.CylinderGeometry(w / 2.2, w / 2.2, 4, 24),
      ceramicMat
    );
    seat.position.y = height * 0.52;
    sanGroup.add(seat);
    // Inner bowl hole
    const inner = new THREE.Mesh(
      new THREE.CylinderGeometry(w / 4, w / 4, 4, 16),
      darkMat
    );
    inner.position.y = height * 0.54;
    sanGroup.add(inner);
    // Tank
    const tank = new THREE.Mesh(
      new THREE.BoxGeometry(w * 0.8, height * 0.6, d * 0.35),
      ceramicMat
    );
    tank.position.set(0, height * 0.55, -d / 2 + d * 0.18);
    tank.castShadow = true;
    sanGroup.add(tank);
    // Flush button
    const button = new THREE.Mesh(
      new THREE.CylinderGeometry(2, 2, 1, 12),
      metalMat
    );
    button.position.set(0, height * 0.85, -d / 2 + d * 0.18);
    sanGroup.add(button);
    if (type === 'toilet-squat') {
      // Squat toilet: flat pan
      sanGroup.remove(bowl, seat, inner, tank, button);
      const pan = new THREE.Mesh(
        new THREE.BoxGeometry(w, 4, d),
        ceramicMat
      );
      pan.position.y = 2;
      pan.receiveShadow = true;
      sanGroup.add(pan);
      const hole = new THREE.Mesh(
        new THREE.BoxGeometry(w * 0.5, 5, d * 0.4),
        darkMat
      );
      hole.position.y = 3;
      sanGroup.add(hole);
    }
  } else if (type.startsWith('bathtub-') || type === 'bathtub') {
    // Bathtub: box with hollow interior
    const tubH = height * 1.5;
    const outer = new THREE.Mesh(
      new THREE.BoxGeometry(w, tubH, d),
      ceramicMat
    );
    outer.position.y = tubH / 2;
    outer.castShadow = true;
    outer.receiveShadow = true;
    sanGroup.add(outer);
    // Hollow interior (water surface)
    const water = new THREE.Mesh(
      new THREE.BoxGeometry(w - 12, 2, d - 12),
      waterMat
    );
    water.position.y = tubH - 6;
    sanGroup.add(water);
    // Inner walls (darker)
    const inner = new THREE.Mesh(
      new THREE.BoxGeometry(w - 10, tubH - 6, d - 10),
      new THREE.MeshStandardMaterial({ color: 0xE5E5E5, roughness: 0.15 })
    );
    inner.position.y = tubH / 2 - 1;
    sanGroup.add(inner);
    // Faucet
    const faucet = new THREE.Mesh(
      new THREE.CylinderGeometry(1.5, 1.5, 12, 8),
      metalMat
    );
    faucet.position.set(0, tubH + 4, -d / 2 + 4);
    sanGroup.add(faucet);
    // Faucet handle
    const handle = new THREE.Mesh(
      new THREE.BoxGeometry(8, 2, 2),
      metalMat
    );
    handle.position.set(0, tubH + 10, -d / 2 + 4);
    sanGroup.add(handle);
  } else if (type.startsWith('shower-') || type === 'shower') {
    // Shower: glass enclosure with floor pan
    const panH = 5;
    // Floor pan
    const pan = new THREE.Mesh(
      new THREE.BoxGeometry(w, panH, d),
      ceramicMat
    );
    pan.position.y = panH / 2;
    pan.receiveShadow = true;
    sanGroup.add(pan);
    // Glass walls (4 thin panels)
    const glassMat = new THREE.MeshPhysicalMaterial({
      color: 0xBEE3F8,
      roughness: 0.05,
      transmission: 0.85,
      transparent: true,
      opacity: 0.4,
    });
    const wallT = 1;
    const wallH = height * 5;
    // Back wall
    const back = new THREE.Mesh(
      new THREE.BoxGeometry(w, wallH, wallT),
      glassMat
    );
    back.position.set(0, wallH / 2 + panH, -d / 2);
    sanGroup.add(back);
    // Side walls
    const left = new THREE.Mesh(
      new THREE.BoxGeometry(wallT, wallH, d),
      glassMat
    );
    left.position.set(-w / 2, wallH / 2 + panH, 0);
    sanGroup.add(left);
    const right = new THREE.Mesh(
      new THREE.BoxGeometry(wallT, wallH, d),
      glassMat
    );
    right.position.set(w / 2, wallH / 2 + panH, 0);
    sanGroup.add(right);
    // Shower head
    const head = new THREE.Mesh(
      new THREE.CylinderGeometry(4, 4, 3, 12),
      metalMat
    );
    head.position.set(0, wallH + panH - 5, -d / 2 + 6);
    sanGroup.add(head);
    // Drain
    const drain = new THREE.Mesh(
      new THREE.CylinderGeometry(2, 2, 1, 8),
      metalMat
    );
    drain.position.set(0, panH + 0.5, 0);
    sanGroup.add(drain);
  } else if (type.startsWith('sink-') || type === 'sink' || type === 'bathroom-sink' || type === 'double-vanity') {
    // Sink: counter with bowl
    const counterH = height * 2;
    const counter = new THREE.Mesh(
      new THREE.BoxGeometry(w, counterH, d),
      new THREE.MeshStandardMaterial({ color: 0xF5F5F5, roughness: 0.3 })
    );
    counter.position.y = counterH / 2;
    counter.castShadow = true;
    sanGroup.add(counter);
    // Sink bowl(s)
    const isDouble = type === 'double-vanity' || type.includes('double');
    const bowls = isDouble ? 2 : 1;
    for (let i = 0; i < bowls; i++) {
      const offsetX = isDouble ? (i === 0 ? -w / 4 : w / 4) : 0;
      const bowl = new THREE.Mesh(
        new THREE.CylinderGeometry(d / 3, d / 4, 8, 16),
        ceramicMat
      );
      bowl.position.set(offsetX, counterH + 1, 0);
      sanGroup.add(bowl);
      // Inner drain
      const drain = new THREE.Mesh(
        new THREE.CylinderGeometry(1.5, 1.5, 2, 8),
        metalMat
      );
      drain.position.set(offsetX, counterH + 5, 0);
      sanGroup.add(drain);
    }
    // Faucet
    const faucet = new THREE.Mesh(
      new THREE.CylinderGeometry(1, 1, 20, 8),
      metalMat
    );
    const faucetX = isDouble ? 0 : 0;
    faucet.position.set(faucetX, counterH + 8, -d / 2 + 4);
    sanGroup.add(faucet);
    // Faucet neck (curved - approximated with horizontal piece)
    const neck = new THREE.Mesh(
      new THREE.BoxGeometry(2, 2, 8),
      metalMat
    );
    neck.position.set(faucetX, counterH + 17, -d / 2 + 8);
    sanGroup.add(neck);
    // Mirror (vanity)
    if (type === 'bathroom-sink' || type === 'double-vanity') {
      const mirror = new THREE.Mesh(
        new THREE.BoxGeometry(w * 0.9, 60, 1),
        new THREE.MeshPhysicalMaterial({
          color: 0xFFFFFF,
          roughness: 0.0,
          metalness: 0.9,
        })
      );
      mirror.position.set(0, counterH + 40, -d / 2 + 0.5);
      sanGroup.add(mirror);
    }
  } else if (type === 'bidet') {
    // Bidet: small oval bowl
    const bowl = new THREE.Mesh(
      new THREE.CylinderGeometry(w / 2.5, w / 3, height * 0.5, 16),
      ceramicMat
    );
    bowl.position.y = height * 0.25;
    sanGroup.add(bowl);
    // Rim
    const rim = new THREE.Mesh(
      new THREE.CylinderGeometry(w / 2.2, w / 2.2, 3, 16),
      ceramicMat
    );
    rim.position.y = height * 0.52;
    sanGroup.add(rim);
    // Water jet
    const jet = new THREE.Mesh(
      new THREE.CylinderGeometry(1, 1, 4, 8),
      metalMat
    );
    jet.position.set(0, height * 0.55, 0);
    sanGroup.add(jet);
  } else if (type === 'urinoir') {
    // Urinoir: wall-mounted urinal
    const body = new THREE.Mesh(
      new THREE.BoxGeometry(w, height, d * 0.5),
      ceramicMat
    );
    body.position.y = height * 1.2;
    sanGroup.add(body);
    // Curved top (bowl)
    const bowl = new THREE.Mesh(
      new THREE.SphereGeometry(w / 2.5, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2),
      ceramicMat
    );
    bowl.position.set(0, height * 1.6, 0);
    sanGroup.add(bowl);
    // Flush pipe
    const pipe = new THREE.Mesh(
      new THREE.CylinderGeometry(1, 1, height * 0.4, 8),
      metalMat
    );
    pipe.position.set(0, height * 2, 0);
    sanGroup.add(pipe);
  } else if (type === 'floor-drain') {
    // Floor drain: small cylinder flush with floor
    const drain = new THREE.Mesh(
      new THREE.CylinderGeometry(w / 2, w / 2, 3, 12),
      metalMat
    );
    drain.position.y = 1.5;
    sanGroup.add(drain);
    // Grate (cross)
    const grate1 = new THREE.Mesh(
      new THREE.BoxGeometry(w, 1, 1),
      darkMat
    );
    grate1.position.y = 3;
    sanGroup.add(grate1);
    const grate2 = new THREE.Mesh(
      new THREE.BoxGeometry(1, 1, w),
      darkMat
    );
    grate2.position.y = 3;
    sanGroup.add(grate2);
  } else if (type === 'water-tap') {
    // Water tap: small faucet
    const base = new THREE.Mesh(
      new THREE.CylinderGeometry(2, 2, 3, 8),
      metalMat
    );
    base.position.y = 1.5;
    sanGroup.add(base);
    const stem = new THREE.Mesh(
      new THREE.CylinderGeometry(0.8, 0.8, 12, 8),
      metalMat
    );
    stem.position.y = 9;
    sanGroup.add(stem);
    const handle = new THREE.Mesh(
      new THREE.BoxGeometry(4, 1, 4),
      metalMat
    );
    handle.position.y = 15;
    sanGroup.add(handle);
  } else if (type.startsWith('water-heater') || type === 'water-heater') {
    // Water heater: vertical cylinder
    const body = new THREE.Mesh(
      new THREE.CylinderGeometry(w / 2, w / 2, height * 4, 16),
      new THREE.MeshStandardMaterial({ color: 0xE5E5E5, roughness: 0.4, metalness: 0.3 })
    );
    body.position.y = height * 2;
    body.castShadow = true;
    sanGroup.add(body);
    // Indicator light
    const indicator = new THREE.Mesh(
      new THREE.SphereGeometry(1.5, 8, 8),
      new THREE.MeshStandardMaterial({ color: 0x10B981, emissive: 0x10B981, emissiveIntensity: 0.8 })
    );
    indicator.position.set(w / 2 - 2, height * 3.5, 0);
    sanGroup.add(indicator);
    // Pipes
    const pipe1 = new THREE.Mesh(
      new THREE.CylinderGeometry(1, 1, 15, 8),
      metalMat
    );
    pipe1.position.set(w / 3, -2, 0);
    sanGroup.add(pipe1);
  } else if (type.startsWith('toren')) {
    // Toren: large water tank cylinder
    const body = new THREE.Mesh(
      new THREE.CylinderGeometry(w / 2, w / 2, height * 5, 24),
      new THREE.MeshStandardMaterial({ color: color, roughness: 0.5, metalness: 0.2 })
    );
    body.position.y = height * 2.5;
    body.castShadow = true;
    sanGroup.add(body);
    // Top dome
    const top = new THREE.Mesh(
      new THREE.SphereGeometry(w / 2, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2),
      new THREE.MeshStandardMaterial({ color: 0x4A5568, roughness: 0.4 })
    );
    top.position.y = height * 5;
    sanGroup.add(top);
    // Stand legs
    for (let i = 0; i < 4; i++) {
      const angle = (i / 4) * Math.PI * 2;
      const leg = new THREE.Mesh(
        new THREE.BoxGeometry(3, height * 2, 3),
        metalMat
      );
      leg.position.set(Math.cos(angle) * w / 2.5, height, Math.sin(angle) * w / 2.5);
      sanGroup.add(leg);
    }
  } else if (type === 'septic-tank') {
    // Septic tank: buried box with cover
    const body = new THREE.Mesh(
      new THREE.BoxGeometry(w, height * 2, d),
      new THREE.MeshStandardMaterial({ color: 0x374151, roughness: 0.7 })
    );
    body.position.y = height;
    sanGroup.add(body);
    // Cover (circle on top)
    const cover = new THREE.Mesh(
      new THREE.CylinderGeometry(w / 5, w / 5, 3, 16),
      metalMat
    );
    cover.position.y = height * 2 + 1.5;
    sanGroup.add(cover);
    // Pipes
    const inlet = new THREE.Mesh(
      new THREE.CylinderGeometry(2, 2, 10, 8),
      new THREE.MeshStandardMaterial({ color: 0x6B7280, roughness: 0.5 })
    );
    inlet.rotation.z = Math.PI / 2;
    inlet.position.set(-w / 2 - 4, height * 1.5, 0);
    sanGroup.add(inlet);
  } else if (type === 'sumur-air') {
    // Water well: cylinder with water
    const wall = new THREE.Mesh(
      new THREE.CylinderGeometry(w / 2, w / 2, height * 3, 24, 1, true),
      new THREE.MeshStandardMaterial({ color: 0x6B7280, roughness: 0.8, side: THREE.DoubleSide })
    );
    wall.position.y = height * 1.5;
    sanGroup.add(wall);
    // Water surface
    const water = new THREE.Mesh(
      new THREE.CylinderGeometry(w / 2 - 2, w / 2 - 2, 2, 24),
      waterMat
    );
    water.position.y = height * 2;
    sanGroup.add(water);
    // Top ring
    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(w / 2, 2, 8, 24),
      new THREE.MeshStandardMaterial({ color: 0x4B5563, roughness: 0.6 })
    );
    ring.rotation.x = Math.PI / 2;
    ring.position.y = height * 3;
    sanGroup.add(ring);
  } else if (type === 'pump-water') {
    // Water pump: box with motor
    const base = new THREE.Mesh(
      new THREE.BoxGeometry(w, height, d),
      new THREE.MeshStandardMaterial({ color: 0x1F2937, roughness: 0.5 })
    );
    base.position.y = height / 2;
    base.castShadow = true;
    sanGroup.add(base);
    // Motor (cylinder on top)
    const motor = new THREE.Mesh(
      new THREE.CylinderGeometry(w / 3, w / 3, height * 1.5, 16),
      new THREE.MeshStandardMaterial({ color: 0x4B5563, roughness: 0.4, metalness: 0.6 })
    );
    motor.position.y = height + height * 0.75;
    sanGroup.add(motor);
    // Pressure gauge
    const gauge = new THREE.Mesh(
      new THREE.CylinderGeometry(3, 3, 2, 12),
      metalMat
    );
    gauge.rotation.x = Math.PI / 2;
    gauge.position.set(w / 3, height * 1.5, d / 2);
    sanGroup.add(gauge);
  } else if (type === 'mirror' || type === 'mirror-large') {
    // Wall mirror
    const mw = type === 'mirror-large' ? w : w * 0.8;
    const mh = type === 'mirror-large' ? 100 : 60;
    const frame = new THREE.Mesh(
      new THREE.BoxGeometry(mw + 4, mh + 4, 3),
      new THREE.MeshStandardMaterial({ color: 0x5D3A1A, roughness: 0.5 })
    );
    frame.position.y = 120;
    sanGroup.add(frame);
    const glass = new THREE.Mesh(
      new THREE.BoxGeometry(mw, mh, 1),
      new THREE.MeshPhysicalMaterial({ color: 0xFFFFFF, roughness: 0.0, metalness: 0.95 })
    );
    glass.position.y = 120;
    glass.position.z = 1.5;
    sanGroup.add(glass);
  } else {
    // Default sanitary: box
    const body = new THREE.Mesh(
      new THREE.BoxGeometry(w, height, d),
      ceramicMat
    );
    body.position.y = height / 2;
    body.castShadow = true;
    sanGroup.add(body);
  }

  group.add(sanGroup);
}

// ============= 3D ELECTRICAL BUILDER =============
function build3DElectrical(group, item, bldgX, bldgZ, currentY, building, def) {
  const elecGroup = new THREE.Group();
  elecGroup.position.set(
    item.x,
    currentY + 5,
    item.y
  );
  elecGroup.rotation.y = -item.rotation;

  const type = item.type;
  const w = item.w;
  const d = item.h;
  const height = def.height3d || 8;
  const color = normalizeHex(item.color || def.color || '#FFFFFF');
  const wallY = 120; // wall height for wall-mounted items

  const plateMat = new THREE.MeshStandardMaterial({
    color: color,
    roughness: 0.3,
    metalness: 0.1,
  });
  const darkMat = new THREE.MeshStandardMaterial({ color: 0x1F2937, roughness: 0.5 });
  const metalMat = new THREE.MeshStandardMaterial({ color: 0x9CA3AF, roughness: 0.2, metalness: 0.8 });
  const ledMat = new THREE.MeshStandardMaterial({
    color: 0x10B981,
    emissive: 0x10B981,
    emissiveIntensity: 0.8,
  });

  if (type.startsWith('outlet-')) {
    // Wall outlet: small plate with prongs
    const plate = new THREE.Mesh(
      new THREE.BoxGeometry(10, 10, 2),
      plateMat
    );
    plate.position.y = wallY;
    elecGroup.add(plate);
    // Prongs (two vertical slots + ground hole)
    const prong1 = new THREE.Mesh(
      new THREE.BoxGeometry(1, 4, 1),
      darkMat
    );
    prong1.position.set(-2, wallY + 1, 1.5);
    elecGroup.add(prong1);
    const prong2 = new THREE.Mesh(
      new THREE.BoxGeometry(1, 4, 1),
      darkMat
    );
    prong2.position.set(2, wallY + 1, 1.5);
    elecGroup.add(prong2);
    const ground = new THREE.Mesh(
      new THREE.CylinderGeometry(1, 1, 1, 8),
      darkMat
    );
    ground.position.set(0, wallY - 3, 1.5);
    elecGroup.add(ground);
  } else if (type.startsWith('switch-')) {
    // Switch: small plate with toggle
    const plate = new THREE.Mesh(
      new THREE.BoxGeometry(10, 12, 2),
      plateMat
    );
    plate.position.y = wallY;
    elecGroup.add(plate);
    // Toggle
    const toggle = new THREE.Mesh(
      new THREE.BoxGeometry(3, 5, 1.5),
      darkMat
    );
    toggle.position.set(0, wallY + 1, 1.5);
    elecGroup.add(toggle);
    // Multi-gang for switch-double, switch-triple
    if (type === 'switch-double' || type === 'switch-triple') {
      const gangs = type === 'switch-triple' ? 3 : 2;
      plate.scale.x = gangs;
      for (let i = 1; i < gangs; i++) {
        const extraToggle = new THREE.Mesh(
          new THREE.BoxGeometry(3, 5, 1.5),
          darkMat
        );
        extraToggle.position.set(-10 + i * 10, wallY + 1, 1.5);
        elecGroup.add(extraToggle);
      }
    }
  } else if (type.startsWith('mcb-')) {
    // MCB: electrical distribution box
    const boxH = 40;
    const box = new THREE.Mesh(
      new THREE.BoxGeometry(w, boxH, d),
      new THREE.MeshStandardMaterial({ color: 0x374151, roughness: 0.5, metalness: 0.3 })
    );
    box.position.y = wallY + boxH / 2;
    box.castShadow = true;
    elecGroup.add(box);
    // Breaker switches (small levers)
    const numBreakers = Math.min(8, Math.floor(w / 8));
    for (let i = 0; i < numBreakers; i++) {
      const x = -w / 2 + 5 + ((w - 10) / numBreakers) * (i + 0.5);
      const breaker = new THREE.Mesh(
        new THREE.BoxGeometry(3, 6, 1),
        darkMat
      );
      breaker.position.set(x, wallY + boxH / 2, d / 2);
      elecGroup.add(breaker);
      // Indicator
      const ind = new THREE.Mesh(
        new THREE.BoxGeometry(2, 2, 0.5),
        ledMat
      );
      ind.position.set(x, wallY + boxH / 2 - 5, d / 2 + 0.5);
      elecGroup.add(ind);
    }
  } else if (type === 'doorbell') {
    // Doorbell: small button plate
    const plate = new THREE.Mesh(
      new THREE.BoxGeometry(8, 8, 2),
      plateMat
    );
    plate.position.y = wallY - 40;
    elecGroup.add(plate);
    const button = new THREE.Mesh(
      new THREE.CylinderGeometry(2, 2, 1, 12),
      ledMat
    );
    button.rotation.x = Math.PI / 2;
    button.position.set(0, wallY - 40, 2);
    elecGroup.add(button);
  } else if (type === 'cctv' || type === 'cctv-bullet') {
    // CCTV camera
    const isBullet = type === 'cctv-bullet';
    // Mount
    const mount = new THREE.Mesh(
      new THREE.BoxGeometry(6, 4, 4),
      darkMat
    );
    mount.position.y = wallY + 30;
    elecGroup.add(mount);
    // Arm
    const arm = new THREE.Mesh(
      new THREE.CylinderGeometry(1, 1, 15, 8),
      metalMat
    );
    arm.rotation.z = Math.PI / 2;
    arm.position.set(8, wallY + 30, 0);
    elecGroup.add(arm);
    // Camera body
    const body = new THREE.Mesh(
      new THREE.BoxGeometry(10, 8, 8),
      darkMat
    );
    body.position.set(15, wallY + 30, 0);
    body.castShadow = true;
    elecGroup.add(body);
    // Lens
    const lens = new THREE.Mesh(
      new THREE.CylinderGeometry(3, 3, 2, 16),
      new THREE.MeshStandardMaterial({ color: 0x000000, roughness: 0.1, metalness: 0.9 })
    );
    lens.rotation.z = Math.PI / 2;
    lens.position.set(20, wallY + 30, 0);
    elecGroup.add(lens);
    if (isBullet) {
      // Bullet shape: longer cylinder
      const bulletBody = new THREE.Mesh(
        new THREE.CylinderGeometry(4, 4, 16, 16),
        darkMat
      );
      bulletBody.rotation.z = Math.PI / 2;
      bulletBody.position.set(20, wallY + 30, 0);
      elecGroup.add(bulletBody);
    }
    // LED ring
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2;
      const led = new THREE.Mesh(
        new THREE.SphereGeometry(0.5, 6, 6),
        ledMat
      );
      led.position.set(20, wallY + 30 + Math.sin(a) * 2.5, Math.cos(a) * 2.5);
      elecGroup.add(led);
    }
  } else if (type === 'intercom') {
    // Intercom: small wall box with screen
    const plate = new THREE.Mesh(
      new THREE.BoxGeometry(15, 25, 3),
      new THREE.MeshStandardMaterial({ color: 0x4B5563, roughness: 0.4 })
    );
    plate.position.y = wallY - 30;
    elecGroup.add(plate);
    // Screen
    const screen = new THREE.Mesh(
      new THREE.BoxGeometry(11, 8, 1),
      new THREE.MeshStandardMaterial({ color: 0x111827, emissive: 0x1E3A8A, emissiveIntensity: 0.5 })
    );
    screen.position.set(0, wallY - 22, 2);
    elecGroup.add(screen);
    // Speaker
    const speaker = new THREE.Mesh(
      new THREE.BoxGeometry(11, 8, 1),
      darkMat
    );
    speaker.position.set(0, wallY - 38, 2);
    elecGroup.add(speaker);
    // Button
    const button = new THREE.Mesh(
      new THREE.CylinderGeometry(2, 2, 1, 8),
      ledMat
    );
    button.rotation.x = Math.PI / 2;
    button.position.set(0, wallY - 38, 2);
    elecGroup.add(button);
  } else if (type === 'motion-sensor') {
    // Motion sensor: small dome
    const base = new THREE.Mesh(
      new THREE.BoxGeometry(8, 4, 6),
      plateMat
    );
    base.position.y = wallY + 40;
    elecGroup.add(base);
    // Dome
    const dome = new THREE.Mesh(
      new THREE.SphereGeometry(3, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2),
      new THREE.MeshStandardMaterial({ color: 0xFFFFFF, roughness: 0.1, transparent: true, opacity: 0.8 })
    );
    dome.position.set(0, wallY + 42, 2);
    elecGroup.add(dome);
  } else if (type === 'smoke-detector') {
    // Smoke detector: disk on ceiling
    const base = new THREE.Mesh(
      new THREE.CylinderGeometry(8, 8, 3, 16),
      plateMat
    );
    base.position.y = 270;
    elecGroup.add(base);
    // Holes (sensor vents)
    const vent = new THREE.Mesh(
      new THREE.CylinderGeometry(3, 3, 1, 16),
      darkMat
    );
    vent.position.y = 271.5;
    elecGroup.add(vent);
    // LED indicator
    const led = new THREE.Mesh(
      new THREE.SphereGeometry(0.8, 6, 6),
      ledMat
    );
    led.position.set(5, 271.5, 0);
    elecGroup.add(led);
  } else if (type === 'antenna-tv') {
    // TV antenna: pole with antenna
    const pole = new THREE.Mesh(
      new THREE.CylinderGeometry(1, 1, 200, 8),
      metalMat
    );
    pole.position.y = 100;
    elecGroup.add(pole);
    // Antenna elements (horizontal rods)
    for (let i = 0; i < 4; i++) {
      const arm = new THREE.Mesh(
        new THREE.CylinderGeometry(0.5, 0.5, 30 - i * 5, 6),
        metalMat
      );
      arm.rotation.z = Math.PI / 2;
      arm.position.y = 180 - i * 8;
      elecGroup.add(arm);
    }
    // Dish (parabolic, approximated by sphere section)
    const dish = new THREE.Mesh(
      new THREE.SphereGeometry(15, 16, 8, 0, Math.PI * 2, 0, Math.PI / 3),
      metalMat
    );
    dish.position.set(0, 200, 0);
    dish.rotation.x = Math.PI;
    elecGroup.add(dish);
  } else if (type === 'smart-hub') {
    // Smart hub: small cylinder speaker
    const body = new THREE.Mesh(
      new THREE.CylinderGeometry(12, 12, 30, 24),
      new THREE.MeshStandardMaterial({ color: 0x374151, roughness: 0.4, metalness: 0.5 })
    );
    body.position.y = 15;
    body.castShadow = true;
    elecGroup.add(body);
    // Top (light ring)
    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(8, 1, 8, 24),
      ledMat
    );
    ring.rotation.x = Math.PI / 2;
    ring.position.y = 30;
    elecGroup.add(ring);
    // Speaker grille (ring details)
    for (let i = 0; i < 3; i++) {
      const grille = new THREE.Mesh(
        new THREE.TorusGeometry(11, 0.3, 4, 32),
        darkMat
      );
      grille.rotation.x = Math.PI / 2;
      grille.position.y = 8 + i * 8;
      elecGroup.add(grille);
    }
  } else if (type === 'ev-charger') {
    // EV charger: tall box with display and cable
    const body = new THREE.Mesh(
      new THREE.BoxGeometry(20, 120, 15),
      new THREE.MeshStandardMaterial({ color: 0x374151, roughness: 0.4, metalness: 0.4 })
    );
    body.position.y = 60;
    body.castShadow = true;
    elecGroup.add(body);
    // Display
    const display = new THREE.Mesh(
      new THREE.BoxGeometry(12, 8, 1),
      new THREE.MeshStandardMaterial({ color: 0x111827, emissive: 0x10B981, emissiveIntensity: 0.7 })
    );
    display.position.set(0, 100, 8);
    elecGroup.add(display);
    // LED indicator
    const led = new THREE.Mesh(
      new THREE.SphereGeometry(1.5, 8, 8),
      ledMat
    );
    led.position.set(0, 80, 8);
    elecGroup.add(led);
    // Cable (curved cylinder)
    const cable = new THREE.Mesh(
      new THREE.CylinderGeometry(1.5, 1.5, 80, 8),
      new THREE.MeshStandardMaterial({ color: 0x1F2937, roughness: 0.7 })
    );
    cable.position.set(15, 30, 5);
    cable.rotation.z = Math.PI * 0.3;
    elecGroup.add(cable);
    // Connector
    const connector = new THREE.Mesh(
      new THREE.BoxGeometry(6, 15, 6),
      darkMat
    );
    connector.position.set(20, 5, 5);
    elecGroup.add(connector);
  } else {
    // Default: small box
    const body = new THREE.Mesh(
      new THREE.BoxGeometry(w, height, d),
      plateMat
    );
    body.position.y = wallY;
    elecGroup.add(body);
  }

  group.add(elecGroup);
}

// ============= 3D KITCHEN BUILDER =============
function build3DKitchen(group, item, bldgX, bldgZ, currentY, building, def) {
  const kitGroup = new THREE.Group();
  kitGroup.position.set(
    item.x,
    currentY + 5,
    item.y
  );
  kitGroup.rotation.y = -item.rotation;

  const type = item.type;
  const w = item.w;
  const d = item.h;
  const height = def.height3d || 90;
  const color = normalizeHex(item.color || def.color || '#8B6F47');

  // Materials
  const woodMat = new THREE.MeshStandardMaterial({
    color: color,
    roughness: 0.65,
    metalness: 0.1,
  });
  const counterMat = new THREE.MeshStandardMaterial({
    color: 0x1F2937,
    roughness: 0.3,
    metalness: 0.2,
  });
  const metalMat = new THREE.MeshStandardMaterial({ color: 0x9CA3AF, roughness: 0.2, metalness: 0.85 });
  const darkMat = new THREE.MeshStandardMaterial({ color: 0x111827, roughness: 0.4 });
  const handleMat = new THREE.MeshStandardMaterial({ color: 0x374151, roughness: 0.3, metalness: 0.8 });

  if (type.startsWith('counter-')) {
    // Countertop: box with thicker top
    const counterColor = type === 'counter-granite' ? 0x0F172A :
                         type === 'counter-quartz' ? 0xFAFAFA :
                         type === 'counter-marble' ? 0xF5F5DC :
                         type === 'counter-wood-butcher' ? color :
                         type === 'counter-stainless' ? 0x9CA3AF :
                         type === 'counter-concrete' ? 0xA8A29E :
                         0x1F2937;
    const cmat = new THREE.MeshStandardMaterial({ color: counterColor, roughness: 0.3, metalness: type === 'counter-stainless' ? 0.9 : 0.2 });
    // Base cabinet
    const base = new THREE.Mesh(
      new THREE.BoxGeometry(w, height, d),
      woodMat
    );
    base.position.y = height / 2;
    base.castShadow = true;
    base.receiveShadow = true;
    kitGroup.add(base);
    // Countertop (top)
    const top = new THREE.Mesh(
      new THREE.BoxGeometry(w + 2, 5, d + 2),
      cmat
    );
    top.position.y = height + 2.5;
    top.castShadow = true;
    kitGroup.add(top);
    // Drawer/door lines
    const numDoors = Math.max(1, Math.floor(w / 40));
    for (let i = 0; i < numDoors; i++) {
      const x = -w / 2 + (w / numDoors) * (i + 0.5);
      const handle = new THREE.Mesh(
        new THREE.BoxGeometry(8, 1.5, 1),
        handleMat
      );
      handle.position.set(x, height * 0.7, d / 2 + 0.5);
      kitGroup.add(handle);
    }
  } else if (type.startsWith('kitchen-island')) {
    // Kitchen island
    const base = new THREE.Mesh(
      new THREE.BoxGeometry(w, height, d),
      woodMat
    );
    base.position.y = height / 2;
    base.castShadow = true;
    base.receiveShadow = true;
    kitGroup.add(base);
    // Countertop
    const top = new THREE.Mesh(
      new THREE.BoxGeometry(w + 4, 6, d + 4),
      counterMat
    );
    top.position.y = height + 3;
    top.castShadow = true;
    kitGroup.add(top);
    // Sink (if applicable)
    if (type === 'kitchen-island-with-sink') {
      const sink = new THREE.Mesh(
        new THREE.BoxGeometry(w * 0.4, 4, d * 0.5),
        metalMat
      );
      sink.position.set(0, height + 5, 0);
      kitGroup.add(sink);
      const faucet = new THREE.Mesh(
        new THREE.CylinderGeometry(1, 1, 25, 8),
        metalMat
      );
      faucet.position.set(0, height + 17, -d / 4);
      kitGroup.add(faucet);
    }
    // Breakfast bar overhang
    if (type === 'kitchen-island-breakfast' || type === 'kitchen-island-large') {
      const overhang = new THREE.Mesh(
        new THREE.BoxGeometry(w + 4, 4, 15),
        woodMat
      );
      overhang.position.set(0, height + 6, d / 2 + 8);
      kitGroup.add(overhang);
      // Stools
      for (let i = 0; i < 3; i++) {
        const x = -w / 3 + (w / 3) * i;
        const stool = new THREE.Mesh(
          new THREE.CylinderGeometry(8, 8, 50, 12),
          woodMat
        );
        stool.position.set(x, 25, d / 2 + 18);
        kitGroup.add(stool);
      }
    }
  } else if (type.startsWith('cabinet-')) {
    // Cabinet: box with doors
    const cabH = type === 'cabinet-tall' || type === 'cabinet-pantry' ? height * 2.2 : height;
    const cabinet = new THREE.Mesh(
      new THREE.BoxGeometry(w, cabH, d),
      woodMat
    );
    cabinet.position.y = cabH / 2;
    cabinet.castShadow = true;
    kitGroup.add(cabinet);
    // Door divisions
    const numDoors = w > 80 ? 2 : 1;
    for (let i = 1; i < numDoors; i++) {
      const x = -w / 2 + (w / numDoors) * i;
      const div = new THREE.Mesh(
        new THREE.BoxGeometry(0.5, cabH - 2, 0.5),
        darkMat
      );
      div.position.set(x, cabH / 2, d / 2 + 0.2);
      kitGroup.add(div);
    }
    // Handles
    for (let i = 0; i < numDoors; i++) {
      const x = -w / 2 + (w / numDoors) * (i + 0.5);
      const handle = new THREE.Mesh(
        new THREE.BoxGeometry(1.5, 12, 1),
        handleMat
      );
      handle.position.set(x, cabH / 2, d / 2 + 0.5);
      kitGroup.add(handle);
    }
    // Glass front
    if (type === 'cabinet-glass-front') {
      const glass = new THREE.Mesh(
        new THREE.BoxGeometry(w - 4, cabH - 4, 0.5),
        new THREE.MeshPhysicalMaterial({ color: 0xBEE3F8, roughness: 0.05, transmission: 0.8, transparent: true, opacity: 0.5 })
      );
      glass.position.set(0, cabH / 2, d / 2 + 0.3);
      kitGroup.add(glass);
    }
  } else if (type.startsWith('stove-') || type === 'stove') {
    // Stove: box with burners
    const stoveH = height;
    const body = new THREE.Mesh(
      new THREE.BoxGeometry(w, stoveH, d),
      new THREE.MeshStandardMaterial({ color: 0x1F2937, roughness: 0.3, metalness: 0.6 })
    );
    body.position.y = stoveH / 2;
    body.castShadow = true;
    kitGroup.add(body);
    // Cooktop (top)
    const top = new THREE.Mesh(
      new THREE.BoxGeometry(w - 4, 2, d - 4),
      new THREE.MeshStandardMaterial({ color: 0x111827, roughness: 0.2, metalness: 0.7 })
    );
    top.position.y = stoveH + 1;
    kitGroup.add(top);
    // Burners (4 circles)
    const burnerMat = new THREE.MeshStandardMaterial({ color: 0x374151, roughness: 0.5 });
    const burnerPositions = [
      [-w / 4, -d / 4], [w / 4, -d / 4],
      [-w / 4, d / 4], [w / 4, d / 4],
    ];
    for (const [bx, bz] of burnerPositions) {
      const burner = new THREE.Mesh(
        new THREE.CylinderGeometry(Math.min(w, d) / 8, Math.min(w, d) / 8, 1.5, 16),
        burnerMat
      );
      burner.position.set(bx, stoveH + 2.5, bz);
      kitGroup.add(burner);
      // Inner ring
      const inner = new THREE.Mesh(
        new THREE.TorusGeometry(Math.min(w, d) / 12, 0.5, 6, 16),
        darkMat
      );
      inner.rotation.x = Math.PI / 2;
      inner.position.set(bx, stoveH + 3, bz);
      kitGroup.add(inner);
    }
    // Oven door handle
    const handle = new THREE.Mesh(
      new THREE.BoxGeometry(w * 0.7, 1.5, 2),
      handleMat
    );
    handle.position.set(0, stoveH * 0.4, d / 2 + 0.5);
    kitGroup.add(handle);
    // Oven window
    const window = new THREE.Mesh(
      new THREE.BoxGeometry(w * 0.6, stoveH * 0.25, 0.5),
      new THREE.MeshPhysicalMaterial({ color: 0x111827, roughness: 0.1, transmission: 0.3, transparent: true, opacity: 0.6 })
    );
    window.position.set(0, stoveH * 0.25, d / 2 + 0.3);
    kitGroup.add(window);
  } else if (type.startsWith('range-hood') || type === 'range-hood') {
    // Range hood: tapered box on wall
    const hoodH = 40;
    const body = new THREE.Mesh(
      new THREE.BoxGeometry(w, hoodH, d),
      new THREE.MeshStandardMaterial({ color: 0x9CA3AF, roughness: 0.3, metalness: 0.7 })
    );
    body.position.y = height * 2 + hoodH / 2;
    body.castShadow = true;
    kitGroup.add(body);
    // Tapered bottom (chimney part)
    const chimney = new THREE.Mesh(
      new THREE.CylinderGeometry(w / 2.5, w / 2.5, hoodH * 0.8, 16),
      new THREE.MeshStandardMaterial({ color: 0x374151, roughness: 0.3, metalness: 0.6 })
    );
    chimney.position.y = height * 2 + hoodH + hoodH * 0.4;
    kitGroup.add(chimney);
    // Light strip at bottom
    const light = new THREE.Mesh(
      new THREE.BoxGeometry(w * 0.8, 2, 2),
      new THREE.MeshStandardMaterial({ color: 0xFFEB99, emissive: 0xFFEB99, emissiveIntensity: 0.6 })
    );
    light.position.set(0, height * 2 + 1, d / 2 - 2);
    kitGroup.add(light);
    // PointLight for actual illumination
    const pt = new THREE.PointLight(0xFFEB99, 0.5, 200);
    pt.position.set(0, height * 2, d / 2);
    kitGroup.add(pt);
  } else if (type.startsWith('fridge-') || type === 'fridge') {
    // Fridge: tall box with door divisions
    const fridgeH = 180;
    const body = new THREE.Mesh(
      new THREE.BoxGeometry(w, fridgeH, d),
      new THREE.MeshStandardMaterial({ color: 0xF5F5F5, roughness: 0.25, metalness: 0.4 })
    );
    body.position.y = fridgeH / 2;
    body.castShadow = true;
    kitGroup.add(body);
    // Door division (freezer / fridge)
    const divY = type === 'fridge-side-by-side' ? fridgeH * 0.5 : fridgeH * 0.3;
    if (type === 'fridge-side-by-side') {
      const div = new THREE.Mesh(
        new THREE.BoxGeometry(0.5, fridgeH - 2, 0.5),
        darkMat
      );
      div.position.set(0, fridgeH / 2, d / 2 + 0.2);
      kitGroup.add(div);
    } else {
      const div = new THREE.Mesh(
        new THREE.BoxGeometry(w - 2, 0.5, 0.5),
        darkMat
      );
      div.position.set(0, fridgeH - divY, d / 2 + 0.2);
      kitGroup.add(div);
    }
    // Handles
    const handleMat2 = new THREE.MeshStandardMaterial({ color: 0x374151, roughness: 0.3, metalness: 0.7 });
    const handle1 = new THREE.Mesh(
      new THREE.BoxGeometry(2, 30, 2),
      handleMat2
    );
    handle1.position.set(w / 2 - 5, fridgeH * 0.6, d / 2 + 1);
    kitGroup.add(handle1);
    const handle2 = new THREE.Mesh(
      new THREE.BoxGeometry(2, 20, 2),
      handleMat2
    );
    handle2.position.set(w / 2 - 5, fridgeH * 0.15, d / 2 + 1);
    kitGroup.add(handle2);
    // Water dispenser (for some types)
    if (type === 'fridge-french-door' || type === 'fridge-side-by-side') {
      const dispenser = new THREE.Mesh(
        new THREE.BoxGeometry(8, 15, 1),
        darkMat
      );
      dispenser.position.set(0, fridgeH * 0.4, d / 2 + 0.5);
      kitGroup.add(dispenser);
    }
  } else if (type.startsWith('sink-kitchen') || type === 'sink' || type === 'water-faucet-pullout' || type === 'water-faucet-gooseneck') {
    // Kitchen sink: counter with sink basin
    const counterH = 90;
    const counter = new THREE.Mesh(
      new THREE.BoxGeometry(w, counterH, d),
      woodMat
    );
    counter.position.y = counterH / 2;
    counter.castShadow = true;
    kitGroup.add(counter);
    // Top
    const top = new THREE.Mesh(
      new THREE.BoxGeometry(w + 2, 4, d + 2),
      counterMat
    );
    top.position.y = counterH + 2;
    kitGroup.add(top);
    // Sink basin
    const basin = new THREE.Mesh(
      new THREE.BoxGeometry(w * 0.5, 12, d * 0.6),
      metalMat
    );
    basin.position.set(0, counterH + 2, 0);
    kitGroup.add(basin);
    // Inner basin (depth)
    const inner = new THREE.Mesh(
      new THREE.BoxGeometry(w * 0.45, 10, d * 0.55),
      darkMat
    );
    inner.position.set(0, counterH + 3, 0);
    kitGroup.add(inner);
    // Faucet
    const faucet = new THREE.Mesh(
      new THREE.CylinderGeometry(1.2, 1.2, 25, 8),
      metalMat
    );
    faucet.position.set(0, counterH + 15, -d / 2 + 6);
    kitGroup.add(faucet);
    // Gooseneck curve
    if (type === 'water-faucet-gooseneck') {
      const neck = new THREE.Mesh(
        new THREE.TorusGeometry(8, 1.2, 8, 12, Math.PI / 2),
        metalMat
      );
      neck.rotation.y = Math.PI;
      neck.position.set(0, counterH + 27, -d / 2 + 6);
      kitGroup.add(neck);
    }
  } else if (type.startsWith('pantry-') || type === 'pantry') {
    // Pantry: tall cabinet
    const pantryH = 220;
    const body = new THREE.Mesh(
      new THREE.BoxGeometry(w, pantryH, d),
      woodMat
    );
    body.position.y = pantryH / 2;
    body.castShadow = true;
    kitGroup.add(body);
    // Door divisions
    const numDoors = w > 80 ? 2 : 1;
    for (let i = 1; i < numDoors; i++) {
      const div = new THREE.Mesh(
        new THREE.BoxGeometry(0.5, pantryH - 2, 0.5),
        darkMat
      );
      div.position.set(0, pantryH / 2, d / 2 + 0.2);
      kitGroup.add(div);
    }
    // Handles
    for (let i = 0; i < numDoors; i++) {
      const x = -w / 2 + (w / numDoors) * (i + 0.5);
      const handle = new THREE.Mesh(
        new THREE.BoxGeometry(1.5, 20, 1.5),
        handleMat
      );
      handle.position.set(x, pantryH / 2, d / 2 + 0.6);
      kitGroup.add(handle);
    }
    // Shelf lines (visible through door)
    for (let i = 1; i < 5; i++) {
      const shelf = new THREE.Mesh(
        new THREE.BoxGeometry(w - 4, 1, d - 4),
        darkMat
      );
      shelf.position.set(0, (pantryH / 5) * i, 0);
      kitGroup.add(shelf);
    }
  } else if (type.startsWith('dining-table') || type === 'bistro-table' || type === 'butcher-block-table' || type === 'prep-table' || type === 'baking-table') {
    // Dining/prep table: top with 4 legs
    const tableH = type === 'bistro-table' ? 75 : 75;
    const top = new THREE.Mesh(
      new THREE.BoxGeometry(w, 5, d),
      woodMat
    );
    top.position.y = tableH;
    top.castShadow = true;
    top.receiveShadow = true;
    kitGroup.add(top);
    // Legs
    const legW = 5;
    const legPositions = [
      [-w / 2 + legW, -d / 2 + legW],
      [w / 2 - legW, -d / 2 + legW],
      [-w / 2 + legW, d / 2 - legW],
      [w / 2 - legW, d / 2 - legW],
    ];
    for (const [lx, lz] of legPositions) {
      const leg = new THREE.Mesh(
        new THREE.BoxGeometry(legW, tableH, legW),
        woodMat
      );
      leg.position.set(lx, tableH / 2, lz);
      leg.castShadow = true;
      kitGroup.add(leg);
    }
    // Butcher block: thicker top
    if (type === 'butcher-block-table') {
      const butcherTop = new THREE.Mesh(
        new THREE.BoxGeometry(w + 2, 12, d + 2),
        new THREE.MeshStandardMaterial({ color: 0x8B6F47, roughness: 0.6 })
      );
      butcherTop.position.y = tableH + 4;
      kitGroup.add(butcherTop);
    }
  } else if (type.startsWith('bar-stool') || type === 'chair' || type.startsWith('chair-') || type === 'bench-dining') {
    // Chair / bar stool
    const seatH = type.startsWith('bar-stool') ? 75 : 45;
    // Seat
    const seat = new THREE.Mesh(
      new THREE.BoxGeometry(w, 4, d),
      woodMat
    );
    seat.position.y = seatH;
    seat.castShadow = true;
    kitGroup.add(seat);
    // Legs
    const legW = 3;
    const legPositions = [
      [-w / 2 + legW, -d / 2 + legW],
      [w / 2 - legW, -d / 2 + legW],
      [-w / 2 + legW, d / 2 - legW],
      [w / 2 - legW, d / 2 - legW],
    ];
    for (const [lx, lz] of legPositions) {
      const leg = new THREE.Mesh(
        new THREE.BoxGeometry(legW, seatH, legW),
        woodMat
      );
      leg.position.set(lx, seatH / 2, lz);
      kitGroup.add(leg);
    }
    // Backrest (for chairs)
    if (type === 'chair' || type.startsWith('chair-') || type === 'bench-dining') {
      const back = new THREE.Mesh(
        new THREE.BoxGeometry(w, 45, 3),
        woodMat
      );
      back.position.set(0, seatH + 22, -d / 2 + 1.5);
      back.castShadow = true;
      kitGroup.add(back);
    }
  } else if (type === 'built-in-oven' || type === 'steam-oven' || type === 'microwave-built-in' || type === 'coffee-machine-built-in' || type === 'warming-drawer') {
    // Built-in appliance: tall cabinet front
    const cabH = height * 2;
    const body = new THREE.Mesh(
      new THREE.BoxGeometry(w, cabH, d),
      woodMat
    );
    body.position.y = cabH / 2;
    body.castShadow = true;
    kitGroup.add(body);
    // Appliance front (glass / metal)
    const front = new THREE.Mesh(
      new THREE.BoxGeometry(w - 4, cabH * 0.4, 1),
      new THREE.MeshPhysicalMaterial({ color: 0x111827, roughness: 0.15, metalness: 0.5 })
    );
    front.position.set(0, cabH * 0.6, d / 2 + 0.5);
    kitGroup.add(front);
    // Handle
    const handle = new THREE.Mesh(
      new THREE.BoxGeometry(w * 0.7, 1.5, 1.5),
      handleMat
    );
    handle.position.set(0, cabH * 0.85, d / 2 + 1);
    kitGroup.add(handle);
    // Control panel
    const ctrl = new THREE.Mesh(
      new THREE.BoxGeometry(w * 0.7, 6, 0.5),
      darkMat
    );
    ctrl.position.set(0, cabH * 0.9, d / 2 + 0.5);
    kitGroup.add(ctrl);
  } else if (type === 'dishwasher') {
    // Dishwasher: front-loading appliance
    const dwH = 90;
    const body = new THREE.Mesh(
      new THREE.BoxGeometry(w, dwH, d),
      new THREE.MeshStandardMaterial({ color: 0x9CA3AF, roughness: 0.3, metalness: 0.5 })
    );
    body.position.y = dwH / 2;
    body.castShadow = true;
    kitGroup.add(body);
    // Door
    const door = new THREE.Mesh(
      new THREE.BoxGeometry(w - 4, dwH - 10, 1),
      new THREE.MeshStandardMaterial({ color: 0x6B7280, roughness: 0.3, metalness: 0.4 })
    );
    door.position.set(0, dwH / 2 - 5, d / 2 + 0.5);
    kitGroup.add(door);
    // Handle
    const handle = new THREE.Mesh(
      new THREE.BoxGeometry(w * 0.5, 2, 2),
      handleMat
    );
    handle.position.set(0, dwH * 0.8, d / 2 + 1);
    kitGroup.add(handle);
    // Control panel
    const ctrl = new THREE.Mesh(
      new THREE.BoxGeometry(w * 0.6, 5, 0.5),
      darkMat
    );
    ctrl.position.set(0, dwH - 5, d / 2 + 0.5);
    kitGroup.add(ctrl);
  } else if (type === 'microwave') {
    // Microwave: small box with door
    const mwH = 35;
    const body = new THREE.Mesh(
      new THREE.BoxGeometry(w, mwH, d),
      new THREE.MeshStandardMaterial({ color: 0x374151, roughness: 0.3, metalness: 0.5 })
    );
    body.position.y = mwH / 2 + 60;
    body.castShadow = true;
    kitGroup.add(body);
    // Door (window)
    const door = new THREE.Mesh(
      new THREE.BoxGeometry(w * 0.6, mwH * 0.7, 1),
      new THREE.MeshPhysicalMaterial({ color: 0x111827, roughness: 0.1, transmission: 0.3, transparent: true, opacity: 0.7 })
    );
    door.position.set(-w * 0.15, mwH / 2 + 60, d / 2 + 0.5);
    kitGroup.add(door);
    // Control panel
    const ctrl = new THREE.Mesh(
      new THREE.BoxGeometry(w * 0.25, mwH * 0.7, 0.5),
      darkMat
    );
    ctrl.position.set(w * 0.32, mwH / 2 + 60, d / 2 + 0.5);
    kitGroup.add(ctrl);
  } else if (type === 'pot-rack' || type === 'spice-rack' || type === 'shelf-floating') {
    // Floating shelf / rack
    const shelfH = 5;
    const shelf = new THREE.Mesh(
      new THREE.BoxGeometry(w, shelfH, d),
      woodMat
    );
    shelf.position.y = 150;
    shelf.castShadow = true;
    kitGroup.add(shelf);
    // Pot rack: hanging hooks
    if (type === 'pot-rack') {
      const numPots = Math.floor(w / 15);
      for (let i = 0; i < numPots; i++) {
        const x = -w / 2 + 10 + (w - 20) * (i / Math.max(1, numPots - 1));
        const hook = new THREE.Mesh(
          new THREE.CylinderGeometry(0.5, 0.5, 10, 6),
          metalMat
        );
        hook.position.set(x, 145, 0);
        kitGroup.add(hook);
        // Pot (cylinder)
        const pot = new THREE.Mesh(
          new THREE.CylinderGeometry(6, 6, 12, 12),
          darkMat
        );
        pot.position.set(x, 138, 0);
        kitGroup.add(pot);
      }
    }
    // Spice rack: small jars
    if (type === 'spice-rack') {
      const numJars = Math.floor(w / 8);
      for (let i = 0; i < numJars; i++) {
        const x = -w / 2 + 4 + (w - 8) * (i / Math.max(1, numJars - 1));
        const jar = new THREE.Mesh(
          new THREE.CylinderGeometry(2, 2, 6, 8),
          new THREE.MeshPhysicalMaterial({ color: 0xFAFAFA, roughness: 0.1, transmission: 0.7, transparent: true, opacity: 0.6 })
        );
        jar.position.set(x, 156, 0);
        kitGroup.add(jar);
        const lid = new THREE.Mesh(
          new THREE.CylinderGeometry(2, 2, 1.5, 8),
          metalMat
        );
        lid.position.set(x, 159.5, 0);
        kitGroup.add(lid);
      }
    }
  } else if (type === 'wine-cooler-built-in') {
    // Wine cooler: tall narrow fridge
    const wcH = 90;
    const body = new THREE.Mesh(
      new THREE.BoxGeometry(w, wcH, d),
      new THREE.MeshStandardMaterial({ color: 0x1F2937, roughness: 0.3, metalness: 0.5 })
    );
    body.position.y = wcH / 2;
    body.castShadow = true;
    kitGroup.add(body);
    // Glass door
    const door = new THREE.Mesh(
      new THREE.BoxGeometry(w - 4, wcH - 6, 0.5),
      new THREE.MeshPhysicalMaterial({ color: 0x111827, roughness: 0.05, transmission: 0.5, transparent: true, opacity: 0.5 })
    );
    door.position.set(0, wcH / 2, d / 2 + 0.5);
    kitGroup.add(door);
    // Wine bottle racks (horizontal lines)
    for (let i = 0; i < 5; i++) {
      const rack = new THREE.Mesh(
        new THREE.BoxGeometry(w - 8, 1, d - 4),
        metalMat
      );
      rack.position.set(0, 10 + i * 16, 0);
      kitGroup.add(rack);
      // Bottles
      for (let j = 0; j < 3; j++) {
        const bottle = new THREE.Mesh(
          new THREE.CylinderGeometry(2, 2, 12, 8),
          new THREE.MeshStandardMaterial({ color: 0x4B2E1A, roughness: 0.4 })
        );
        bottle.rotation.z = Math.PI / 2;
        bottle.position.set(-w / 4 + (w / 4) * j, 16 + i * 16, 0);
        kitGroup.add(bottle);
      }
    }
    // Handle
    const handle = new THREE.Mesh(
      new THREE.BoxGeometry(1.5, wcH * 0.4, 2),
      handleMat
    );
    handle.position.set(w / 2 - 3, wcH / 2, d / 2 + 1);
    kitGroup.add(handle);
  } else if (type === 'trash-pullout' || type === 'recycling-bin') {
    // Trash pullout: cabinet with bins
    const cabH = 80;
    const body = new THREE.Mesh(
      new THREE.BoxGeometry(w, cabH, d),
      woodMat
    );
    body.position.y = cabH / 2;
    body.castShadow = true;
    kitGroup.add(body);
    // Bin (visible at top)
    const binColor = type === 'recycling-bin' ? 0x10B981 : 0x374151;
    const bin = new THREE.Mesh(
      new THREE.CylinderGeometry(w / 2 - 2, w / 2 - 2, 40, 12),
      new THREE.MeshStandardMaterial({ color: binColor, roughness: 0.5 })
    );
    bin.position.set(0, cabH + 20, 0);
    kitGroup.add(bin);
    // Handle
    const handle = new THREE.Mesh(
      new THREE.BoxGeometry(1.5, 12, 1.5),
      handleMat
    );
    handle.position.set(0, cabH / 2, d / 2 + 0.6);
    kitGroup.add(handle);
  } else if (type === 'breakfast-nook' || type === 'bar-counter') {
    // Breakfast nook / bar counter: L-shaped or straight counter
    const counterH = 105;
    const body = new THREE.Mesh(
      new THREE.BoxGeometry(w, counterH, d),
      woodMat
    );
    body.position.y = counterH / 2;
    body.castShadow = true;
    kitGroup.add(body);
    // Countertop
    const top = new THREE.Mesh(
      new THREE.BoxGeometry(w + 4, 5, d + 4),
      counterMat
    );
    top.position.y = counterH + 2.5;
    top.castShadow = true;
    kitGroup.add(top);
    // Stools
    if (type === 'bar-counter') {
      const numStools = Math.max(2, Math.floor(w / 50));
      for (let i = 0; i < numStools; i++) {
        const x = -w / 2 + 25 + (w - 50) * (i / Math.max(1, numStools - 1));
        const stool = new THREE.Mesh(
          new THREE.CylinderGeometry(10, 10, 60, 12),
          woodMat
        );
        stool.position.set(x, 30, d / 2 + 15);
        kitGroup.add(stool);
      }
    }
  } else {
    // Default kitchen item: box
    const body = new THREE.Mesh(
      new THREE.BoxGeometry(w, height, d),
      woodMat
    );
    body.position.y = height / 2;
    body.castShadow = true;
    kitGroup.add(body);
  }

  group.add(kitGroup);
}

// ============= 3D APPLIANCE BUILDER =============
function build3DAppliance(group, item, bldgX, bldgZ, currentY, building, def) {
  const appGroup = new THREE.Group();
  appGroup.position.set(
    item.x,
    currentY + 5,
    item.y
  );
  appGroup.rotation.y = -item.rotation;

  const type = item.type;
  const w = item.w;
  const d = item.h;
  const height = def.height3d || 30;
  const color = normalizeHex(item.color || def.color || '#F5F5F5');
  const wallY = 180; // wall height for wall-mounted appliances

  const bodyMat = new THREE.MeshStandardMaterial({ color: color, roughness: 0.3, metalness: 0.4 });
  const darkMat = new THREE.MeshStandardMaterial({ color: 0x1F2937, roughness: 0.4 });
  const metalMat = new THREE.MeshStandardMaterial({ color: 0x9CA3AF, roughness: 0.2, metalness: 0.85 });
  const ledMat = new THREE.MeshStandardMaterial({ color: 0x10B981, emissive: 0x10B981, emissiveIntensity: 0.7 });
  const screenMat = new THREE.MeshStandardMaterial({ color: 0x000000, roughness: 0.1 });

  if (type.startsWith('ac-')) {
    // Air conditioner: wall-mounted box
    const acH = 30;
    const acW = w;
    const acD = 20;
    // Mount plate on wall
    const body = new THREE.Mesh(
      new THREE.BoxGeometry(acW, acH, acD),
      bodyMat
    );
    body.position.y = wallY - 20;
    body.castShadow = true;
    appGroup.add(body);
    // Front face (slightly slanted)
    const front = new THREE.Mesh(
      new THREE.BoxGeometry(acW - 4, acH - 4, 1),
      new THREE.MeshStandardMaterial({ color: 0xFAFAFA, roughness: 0.3 })
    );
    front.position.set(0, wallY - 20, acD / 2 + 0.5);
    appGroup.add(front);
    // Louver vent (horizontal slats)
    for (let i = 0; i < 4; i++) {
      const slat = new THREE.Mesh(
        new THREE.BoxGeometry(acW - 8, 1, 0.5),
        darkMat
      );
      slat.position.set(0, wallY - 30 + i * 5, acD / 2 + 0.5);
      appGroup.add(slat);
    }
    // LED indicator
    const led = new THREE.Mesh(
      new THREE.SphereGeometry(0.8, 6, 6),
      ledMat
    );
    led.position.set(acW / 2 - 5, wallY - 10, acD / 2 + 0.5);
    appGroup.add(led);
    // Outdoor condenser for split AC
    if (type === 'ac-split' || type === 'ac-inverter') {
      const cond = new THREE.Mesh(
        new THREE.BoxGeometry(40, 60, 30),
        new THREE.MeshStandardMaterial({ color: 0x9CA3AF, roughness: 0.4, metalness: 0.5 })
      );
      cond.position.set(50, 30, -50);
      cond.castShadow = true;
      appGroup.add(cond);
      // Fan grille
      const fan = new THREE.Mesh(
        new THREE.CylinderGeometry(15, 15, 2, 16),
        darkMat
      );
      fan.rotation.x = Math.PI / 2;
      fan.position.set(50, 40, -34);
      appGroup.add(fan);
    }
  } else if (type.startsWith('fan-') && type !== 'ceiling-fan') {
    // Pedestal / wall fan
    if (type === 'fan-pedestal' || type === 'fan-stand') {
      // Base
      const base = new THREE.Mesh(
        new THREE.CylinderGeometry(15, 18, 4, 16),
        darkMat
      );
      base.position.y = 2;
      appGroup.add(base);
      // Pole
      const pole = new THREE.Mesh(
        new THREE.CylinderGeometry(1.5, 1.5, 110, 8),
        metalMat
      );
      pole.position.y = 60;
      appGroup.add(pole);
      // Fan head
      const head = new THREE.Mesh(
        new THREE.CylinderGeometry(20, 20, 8, 16),
        bodyMat
      );
      head.rotation.x = Math.PI / 2;
      head.position.y = 120;
      appGroup.add(head);
      // Blades
      for (let i = 0; i < 3; i++) {
        const angle = (i / 3) * Math.PI * 2;
        const blade = new THREE.Mesh(
          new THREE.BoxGeometry(25, 1, 6),
          new THREE.MeshStandardMaterial({ color: 0xFAFAFA, roughness: 0.4 })
        );
        blade.position.set(Math.cos(angle) * 12, 120, Math.sin(angle) * 12);
        blade.rotation.y = angle;
        appGroup.add(blade);
      }
      // Guard ring
      const ring = new THREE.Mesh(
        new THREE.TorusGeometry(22, 1, 6, 24),
        metalMat
      );
      ring.position.y = 120;
      appGroup.add(ring);
    } else {
      // Wall fan
      const body = new THREE.Mesh(
        new THREE.CylinderGeometry(20, 20, 8, 16),
        bodyMat
      );
      body.rotation.x = Math.PI / 2;
      body.position.y = wallY;
      appGroup.add(body);
      for (let i = 0; i < 3; i++) {
        const angle = (i / 3) * Math.PI * 2;
        const blade = new THREE.Mesh(
          new THREE.BoxGeometry(25, 1, 6),
          new THREE.MeshStandardMaterial({ color: 0xFAFAFA, roughness: 0.4 })
        );
        blade.position.set(Math.cos(angle) * 12, wallY, Math.sin(angle) * 12);
        blade.rotation.y = angle;
        appGroup.add(blade);
      }
      const ring = new THREE.Mesh(
        new THREE.TorusGeometry(22, 1, 6, 24),
        metalMat
      );
      ring.position.y = wallY;
      appGroup.add(ring);
    }
  } else if (type === 'ceiling-fan') {
    // Ceiling fan: mount + blades
    const mount = new THREE.Mesh(
      new THREE.CylinderGeometry(6, 6, 8, 12),
      darkMat
    );
    mount.position.y = 260;
    appGroup.add(mount);
    // Central body
    const hub = new THREE.Mesh(
      new THREE.CylinderGeometry(8, 8, 10, 12),
      bodyMat
    );
    hub.position.y = 250;
    appGroup.add(hub);
    // Blades (4-5)
    const numBlades = 4;
    for (let i = 0; i < numBlades; i++) {
      const angle = (i / numBlades) * Math.PI * 2;
      const blade = new THREE.Mesh(
        new THREE.BoxGeometry(60, 1, 10),
        new THREE.MeshStandardMaterial({ color: 0x8B6F47, roughness: 0.5 })
      );
      blade.position.set(Math.cos(angle) * 35, 248, Math.sin(angle) * 35);
      blade.rotation.y = -angle;
      blade.castShadow = true;
      appGroup.add(blade);
    }
    // Light kit
    const lightKit = new THREE.Mesh(
      new THREE.SphereGeometry(6, 12, 8),
      new THREE.MeshStandardMaterial({ color: 0xFFEB99, emissive: 0xFFEB99, emissiveIntensity: 0.6 })
    );
    lightKit.position.y = 240;
    appGroup.add(lightKit);
    const pt = new THREE.PointLight(0xFFEB99, 0.5, 150);
    pt.position.y = 235;
    appGroup.add(pt);
  } else if (type.startsWith('tv-') || type === 'home-theater') {
    // TV: flat panel on wall (or stand)
    const isHomeTheater = type === 'home-theater';
    const tvW = isHomeTheater ? w * 1.5 : w;
    const tvH = isHomeTheater ? 90 : 55;
    const tvD = 4;
    // TV body
    const tv = new THREE.Mesh(
      new THREE.BoxGeometry(tvW, tvH, tvD),
      darkMat
    );
    tv.position.y = wallY - 20;
    tv.castShadow = true;
    appGroup.add(tv);
    // Screen
    const screen = new THREE.Mesh(
      new THREE.BoxGeometry(tvW - 4, tvH - 4, 0.5),
      new THREE.MeshStandardMaterial({ color: 0x0F172A, roughness: 0.05, emissive: 0x1E3A8A, emissiveIntensity: 0.15 })
    );
    screen.position.set(0, wallY - 20, tvD / 2 + 0.3);
    appGroup.add(screen);
    // Stand legs (if floor TV)
    if (type === 'tv-stand' || type === 'home-theater') {
      const legL = new THREE.Mesh(
        new THREE.BoxGeometry(2, wallY - 20 - tvH / 2, 4),
        darkMat
      );
      legL.position.set(-tvW / 4, (wallY - 20 - tvH / 2) / 2, 0);
      appGroup.add(legL);
      const legR = legL.clone();
      legR.position.x = tvW / 4;
      appGroup.add(legR);
      // Base
      const base = new THREE.Mesh(
        new THREE.BoxGeometry(tvW * 0.6, 2, 15),
        darkMat
      );
      base.position.y = 1;
      appGroup.add(base);
    }
    // Speaker stand
    if (type === 'tv-with-soundbar' || isHomeTheater) {
      const bar = new THREE.Mesh(
        new THREE.BoxGeometry(tvW * 0.6, 8, 6),
        darkMat
      );
      bar.position.set(0, wallY - 20 - tvH / 2 - 6, tvD / 2 + 3);
      appGroup.add(bar);
    }
  } else if (type === 'speaker-stand') {
    // Speaker stand: pole with speaker on top
    const base = new THREE.Mesh(
      new THREE.CylinderGeometry(15, 18, 3, 16),
      darkMat
    );
    base.position.y = 1.5;
    appGroup.add(base);
    const pole = new THREE.Mesh(
      new THREE.CylinderGeometry(2, 2, 90, 8),
      metalMat
    );
    pole.position.y = 48;
    appGroup.add(pole);
    // Speaker
    const speaker = new THREE.Mesh(
      new THREE.BoxGeometry(25, 35, 20),
      darkMat
    );
    speaker.position.y = 110;
    speaker.castShadow = true;
    appGroup.add(speaker);
    // Speaker cones
    const coneMat = new THREE.MeshStandardMaterial({ color: 0x111827, roughness: 0.5 });
    for (let i = 0; i < 2; i++) {
      const cone = new THREE.Mesh(
        new THREE.CylinderGeometry(6 - i * 2, 6 - i * 2, 1, 16),
        coneMat
      );
      cone.rotation.x = Math.PI / 2;
      cone.position.set(0, 105 + i * 12, 10.5);
      appGroup.add(cone);
    }
  } else if (type.startsWith('washing-') || type === 'dryer') {
    // Washing machine / dryer: front-loading box
    const wmH = 90;
    const body = new THREE.Mesh(
      new THREE.BoxGeometry(w, wmH, d),
      new THREE.MeshStandardMaterial({ color: 0xF5F5F5, roughness: 0.25, metalness: 0.3 })
    );
    body.position.y = wmH / 2;
    body.castShadow = true;
    appGroup.add(body);
    // Door (circular glass)
    const door = new THREE.Mesh(
      new THREE.CylinderGeometry(15, 15, 3, 24),
      new THREE.MeshPhysicalMaterial({ color: 0x111827, roughness: 0.05, transmission: 0.5, transparent: true, opacity: 0.6 })
    );
    door.rotation.x = Math.PI / 2;
    door.position.set(0, wmH / 2, d / 2 + 1.5);
    appGroup.add(door);
    // Door ring
    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(15, 1.5, 6, 24),
      metalMat
    );
    ring.position.set(0, wmH / 2, d / 2 + 1.5);
    appGroup.add(ring);
    // Control panel
    const ctrl = new THREE.Mesh(
      new THREE.BoxGeometry(w * 0.4, 12, 1),
      darkMat
    );
    ctrl.position.set(-w * 0.25, wmH - 10, d / 2 + 0.5);
    appGroup.add(ctrl);
    // Display
    const disp = new THREE.Mesh(
      new THREE.BoxGeometry(w * 0.25, 5, 0.3),
      new THREE.MeshStandardMaterial({ color: 0x10B981, emissive: 0x10B981, emissiveIntensity: 0.5 })
    );
    disp.position.set(-w * 0.25, wmH - 5, d / 2 + 1);
    appGroup.add(disp);
    // Detergent drawer
    const drawer = new THREE.Mesh(
      new THREE.BoxGeometry(w * 0.3, 5, 1),
      metalMat
    );
    drawer.position.set(w * 0.25, wmH - 10, d / 2 + 0.5);
    appGroup.add(drawer);
  } else if (type === 'microwave') {
    // Microwave (smaller appliance version)
    const mwH = 35;
    const body = new THREE.Mesh(
      new THREE.BoxGeometry(w, mwH, d),
      new THREE.MeshStandardMaterial({ color: 0x374151, roughness: 0.3, metalness: 0.5 })
    );
    body.position.y = mwH / 2;
    body.castShadow = true;
    appGroup.add(body);
    // Door
    const door = new THREE.Mesh(
      new THREE.BoxGeometry(w * 0.6, mwH * 0.7, 1),
      new THREE.MeshPhysicalMaterial({ color: 0x111827, roughness: 0.1, transmission: 0.3, transparent: true, opacity: 0.7 })
    );
    door.position.set(-w * 0.15, mwH / 2, d / 2 + 0.5);
    appGroup.add(door);
    // Control panel
    const ctrl = new THREE.Mesh(
      new THREE.BoxGeometry(w * 0.25, mwH * 0.7, 0.5),
      darkMat
    );
    ctrl.position.set(w * 0.32, mwH / 2, d / 2 + 0.5);
    appGroup.add(ctrl);
  } else if (type === 'dispenser') {
    // Water dispenser: tall thin box
    const disH = 110;
    const body = new THREE.Mesh(
      new THREE.BoxGeometry(35, disH, 35),
      bodyMat
    );
    body.position.y = disH / 2;
    body.castShadow = true;
    appGroup.add(body);
    // Water bottle on top (cylinder)
    const bottle = new THREE.Mesh(
      new THREE.CylinderGeometry(15, 15, 30, 16),
      new THREE.MeshPhysicalMaterial({ color: 0xBEE3F8, roughness: 0.1, transmission: 0.7, transparent: true, opacity: 0.5 })
    );
    bottle.position.y = disH + 15;
    appGroup.add(bottle);
    // Tap area
    const tap = new THREE.Mesh(
      new THREE.BoxGeometry(20, 15, 2),
      darkMat
    );
    tap.position.set(0, disH * 0.3, 17.5);
    appGroup.add(tap);
    // Taps (hot/cold)
    const hot = new THREE.Mesh(
      new THREE.CylinderGeometry(2, 2, 4, 8),
      new THREE.MeshStandardMaterial({ color: 0xEF4444, roughness: 0.3 })
    );
    hot.position.set(-5, disH * 0.3, 19.5);
    appGroup.add(hot);
    const cold = new THREE.Mesh(
      new THREE.CylinderGeometry(2, 2, 4, 8),
      new THREE.MeshStandardMaterial({ color: 0x3B82F6, roughness: 0.3 })
    );
    cold.position.set(5, disH * 0.3, 19.5);
    appGroup.add(cold);
  } else if (type === 'water-purifier') {
    // Water purifier: small box
    const pH = 45;
    const body = new THREE.Mesh(
      new THREE.BoxGeometry(25, pH, 20),
      bodyMat
    );
    body.position.y = pH / 2 + 70;
    body.castShadow = true;
    appGroup.add(body);
    // Filter cylinders (visible)
    for (let i = 0; i < 3; i++) {
      const filter = new THREE.Mesh(
        new THREE.CylinderGeometry(3, 3, 25, 12),
        new THREE.MeshStandardMaterial({ color: 0xFAFAFA, roughness: 0.3 })
      );
      filter.position.set(-8 + i * 8, pH / 2 + 70, 11);
      appGroup.add(filter);
    }
    // Spout
    const spout = new THREE.Mesh(
      new THREE.CylinderGeometry(1, 1, 5, 8),
      metalMat
    );
    spout.position.set(0, pH / 2 + 50, 11);
    appGroup.add(spout);
  } else if (type === 'vacuum') {
    // Vacuum cleaner: canister shape
    const body = new THREE.Mesh(
      new THREE.SphereGeometry(15, 16, 12),
      bodyMat
    );
    body.position.y = 15;
    body.castShadow = true;
    appGroup.add(body);
    // Handle
    const handle = new THREE.Mesh(
      new THREE.CylinderGeometry(1.5, 1.5, 50, 8),
      metalMat
    );
    handle.position.set(15, 35, 0);
    handle.rotation.z = -Math.PI / 6;
    appGroup.add(handle);
    // Hose (curved cylinder approximation)
    const hose = new THREE.Mesh(
      new THREE.TorusGeometry(15, 1, 6, 12, Math.PI / 2),
      darkMat
    );
    hose.position.set(8, 25, 0);
    hose.rotation.y = Math.PI / 2;
    appGroup.add(hose);
    // Wheels
    for (let i = 0; i < 2; i++) {
      const wheel = new THREE.Mesh(
        new THREE.CylinderGeometry(4, 4, 3, 12),
        darkMat
      );
      wheel.rotation.z = Math.PI / 2;
      wheel.position.set(-10 + i * 8, 4, 8);
      appGroup.add(wheel);
    }
  } else {
    // Default appliance: box
    const body = new THREE.Mesh(
      new THREE.BoxGeometry(w, height, d),
      bodyMat
    );
    body.position.y = height / 2;
    body.castShadow = true;
    appGroup.add(body);
  }

  group.add(appGroup);
}

// ============= 3D DECOR BUILDER =============
function build3DDecor(group, item, bldgX, bldgZ, currentY, building, def) {
  const decorGroup = new THREE.Group();
  decorGroup.position.set(
    item.x,
    currentY + 5,
    item.y
  );
  decorGroup.rotation.y = -item.rotation;

  const type = item.type;
  const w = item.w;
  const d = item.h;
  const height = def.height3d || 30;
  const color = normalizeHex(item.color || def.color || '#8B7355');
  const wallY = 150; // wall height for wall-mounted decor

  const woodMat = new THREE.MeshStandardMaterial({ color: 0x5D3A1A, roughness: 0.6 });
  const metalMat = new THREE.MeshStandardMaterial({ color: 0x9CA3AF, roughness: 0.3, metalness: 0.7 });
  const glassMat = new THREE.MeshPhysicalMaterial({ color: 0xFFFFFF, roughness: 0.05, metalness: 0.9, transmission: 0.0 });

  if (type.startsWith('painting-') || type.startsWith('photo-')) {
    // Painting / photo: framed picture on wall
    const pw = w * 0.8;
    const ph = type === 'painting-large' || type === 'photo-large' ? 80 : 50;
    // Frame
    const frame = new THREE.Mesh(
      new THREE.BoxGeometry(pw + 4, ph + 4, 3),
      woodMat
    );
    frame.position.y = wallY;
    frame.castShadow = true;
    decorGroup.add(frame);
    // Picture surface
    const picColor = type.startsWith('painting-') ? color : 0xFAFAFA;
    const pic = new THREE.Mesh(
      new THREE.BoxGeometry(pw, ph, 0.5),
      new THREE.MeshStandardMaterial({ color: picColor, roughness: 0.6 })
    );
    pic.position.set(0, wallY, 1.5);
    decorGroup.add(pic);
    // Highlight color accents for painting
    if (type === 'painting-abstract') {
      const accent1 = new THREE.Mesh(
        new THREE.BoxGeometry(pw * 0.5, ph * 0.3, 0.3),
        new THREE.MeshStandardMaterial({ color: 0xE91E63, roughness: 0.5 })
      );
      accent1.position.set(-pw * 0.15, wallY + ph * 0.1, 1.7);
      decorGroup.add(accent1);
      const accent2 = new THREE.Mesh(
        new THREE.BoxGeometry(pw * 0.3, ph * 0.4, 0.3),
        new THREE.MeshStandardMaterial({ color: 0xFFC107, roughness: 0.5 })
      );
      accent2.position.set(pw * 0.2, wallY - ph * 0.15, 1.7);
      decorGroup.add(accent2);
    }
  } else if (type.startsWith('vase-')) {
    // Vase: cylinder on floor or table
    const vaseH = 40;
    const body = new THREE.Mesh(
      new THREE.CylinderGeometry(w / 3, w / 2.5, vaseH, 16),
      new THREE.MeshStandardMaterial({ color: color, roughness: 0.3, metalness: 0.1 })
    );
    body.position.y = vaseH / 2 + (height * 0.5);
    body.castShadow = true;
    decorGroup.add(body);
    // Neck (narrower)
    const neck = new THREE.Mesh(
      new THREE.CylinderGeometry(w / 5, w / 3, 8, 12),
      new THREE.MeshStandardMaterial({ color: color, roughness: 0.3 })
    );
    neck.position.y = vaseH + 4 + (height * 0.5);
    decorGroup.add(neck);
    // Flowers (cones)
    const flowerColors = [0xE91E63, 0xFFC107, 0x9C27B0, 0xFF5722];
    for (let i = 0; i < 5; i++) {
      const angle = (i / 5) * Math.PI * 2;
      const flower = new THREE.Mesh(
        new THREE.SphereGeometry(3, 8, 8),
        new THREE.MeshStandardMaterial({ color: flowerColors[i % 4], roughness: 0.5 })
      );
      flower.position.set(Math.cos(angle) * 4, vaseH + 18 + (height * 0.5), Math.sin(angle) * 4);
      decorGroup.add(flower);
      // Stem
      const stem = new THREE.Mesh(
        new THREE.CylinderGeometry(0.3, 0.3, 12, 6),
        new THREE.MeshStandardMaterial({ color: 0x2E7D32, roughness: 0.6 })
      );
      stem.position.set(Math.cos(angle) * 4, vaseH + 10 + (height * 0.5), Math.sin(angle) * 4);
      decorGroup.add(stem);
    }
  } else if (type.startsWith('mirror-')) {
    // Mirror: framed mirror on wall
    const mw = w * 0.8;
    const mh = type === 'mirror-large' || type === 'mirror-floor' ? 100 : 60;
    // Frame
    const frame = new THREE.Mesh(
      new THREE.BoxGeometry(mw + 4, mh + 4, 3),
      woodMat
    );
    frame.position.y = wallY;
    decorGroup.add(frame);
    // Glass
    const mirror = new THREE.Mesh(
      new THREE.BoxGeometry(mw, mh, 1),
      new THREE.MeshPhysicalMaterial({ color: 0xFFFFFF, roughness: 0.0, metalness: 0.95 })
    );
    mirror.position.set(0, wallY, 1.5);
    decorGroup.add(mirror);
    // Floor mirror: stand
    if (type === 'mirror-floor') {
      const stand = new THREE.Mesh(
        new THREE.BoxGeometry(mw + 10, 4, 8),
        woodMat
      );
      stand.position.set(0, 2, 4);
      decorGroup.add(stand);
    }
  } else if (type.startsWith('curtain-')) {
    // Curtain: hanging fabric panels
    const rodY = 240;
    // Rod
    const rod = new THREE.Mesh(
      new THREE.CylinderGeometry(1.5, 1.5, w, 8),
      metalMat
    );
    rod.rotation.z = Math.PI / 2;
    rod.position.y = rodY;
    decorGroup.add(rod);
    // Finials
    for (let i = 0; i < 2; i++) {
      const finial = new THREE.Mesh(
        new THREE.SphereGeometry(3, 12, 12),
        metalMat
      );
      finial.position.set(-w / 2 + (i === 0 ? -2 : 2), rodY, 0);
      decorGroup.add(finial);
    }
    // Curtain panels
    const panelCount = w > 100 ? 2 : 1;
    const panelW = w / panelCount;
    const curtainMat = new THREE.MeshStandardMaterial({ color: color, roughness: 0.9, metalness: 0.0 });
    for (let i = 0; i < panelCount; i++) {
      const panel = new THREE.Mesh(
        new THREE.BoxGeometry(panelW - 2, 200, 4),
        curtainMat
      );
      panel.position.set(-w / 2 + panelW * (i + 0.5), rodY - 100, 0);
      panel.castShadow = true;
      decorGroup.add(panel);
      // Wave folds (small bumps)
      for (let j = 0; j < 5; j++) {
        const fold = new THREE.Mesh(
          new THREE.BoxGeometry(2, 200, 2),
          new THREE.MeshStandardMaterial({ color: color, roughness: 0.9 })
        );
        fold.position.set(-w / 2 + panelW * (i + 0.5) - panelW / 2 + 6 + j * (panelW - 12) / 5, rodY - 100, 2);
        decorGroup.add(fold);
      }
    }
  } else if (type.startsWith('blind-')) {
    // Window blinds: horizontal slats
    const blindH = 200;
    const blindMat = new THREE.MeshStandardMaterial({ color: color, roughness: 0.6 });
    // Top valance
    const valance = new THREE.Mesh(
      new THREE.BoxGeometry(w, 8, 6),
      blindMat
    );
    valance.position.set(0, 245, 0);
    decorGroup.add(valance);
    // Slats
    const numSlats = 30;
    for (let i = 0; i < numSlats; i++) {
      const slat = new THREE.Mesh(
        new THREE.BoxGeometry(w - 4, 1.5, 4),
        blindMat
      );
      slat.position.set(0, 240 - i * 6, 0);
      slat.castShadow = true;
      decorGroup.add(slat);
    }
    // Pull cord
    const cord = new THREE.Mesh(
      new THREE.CylinderGeometry(0.5, 0.5, blindH, 6),
      new THREE.MeshStandardMaterial({ color: 0xFAFAFA, roughness: 0.7 })
    );
    cord.position.set(w / 2 - 3, 145, 2);
    decorGroup.add(cord);
  } else if (type.startsWith('rug-')) {
    // Rug: flat plane on floor
    const rugMat = new THREE.MeshStandardMaterial({ color: color, roughness: 0.95 });
    const rug = new THREE.Mesh(
      new THREE.BoxGeometry(w, 2, d),
      rugMat
    );
    rug.position.y = 1;
    rug.receiveShadow = true;
    decorGroup.add(rug);
    // Pattern (border)
    const border = new THREE.Mesh(
      new THREE.BoxGeometry(w - 8, 2.5, d - 8),
      new THREE.MeshStandardMaterial({ color: type === 'rug-patterned' ? 0x4B2E1A : color, roughness: 0.95 })
    );
    border.position.y = 1.2;
    decorGroup.add(border);
    // Inner detail
    if (type === 'rug-patterned' || type === 'rug-oriental') {
      const center = new THREE.Mesh(
        new THREE.BoxGeometry(w / 3, 2.5, d / 3),
        new THREE.MeshStandardMaterial({ color: 0x9C27B0, roughness: 0.9 })
      );
      center.position.y = 1.3;
      decorGroup.add(center);
    }
  } else if (type.startsWith('plant-')) {
    // Plant: pot with foliage
    // Pot
    const potMat = new THREE.MeshStandardMaterial({ color: 0x8B6F47, roughness: 0.7 });
    const pot = new THREE.Mesh(
      new THREE.CylinderGeometry(w / 2.5, w / 2, height * 0.6, 16),
      potMat
    );
    pot.position.y = height * 0.3;
    pot.castShadow = true;
    decorGroup.add(pot);
    // Soil
    const soil = new THREE.Mesh(
      new THREE.CylinderGeometry(w / 2.5 - 1, w / 2.5 - 1, 2, 16),
      new THREE.MeshStandardMaterial({ color: 0x3D2817, roughness: 0.9 })
    );
    soil.position.y = height * 0.6;
    decorGroup.add(soil);
    // Foliage (cluster of spheres)
    const leafMat = new THREE.MeshStandardMaterial({ color: 0x2E7D32, roughness: 0.8 });
    const leafCount = type === 'plant-tall' ? 8 : 5;
    const leafH = type === 'plant-tall' ? height * 1.5 : height;
    for (let i = 0; i < leafCount; i++) {
      const angle = (i / leafCount) * Math.PI * 2;
      const radius = (i % 2 === 0) ? w / 4 : w / 6;
      const leaf = new THREE.Mesh(
        new THREE.SphereGeometry(w / 4, 12, 8),
        leafMat
      );
      leaf.position.set(Math.cos(angle) * radius, height * 0.6 + (i / leafCount) * leafH, Math.sin(angle) * radius);
      leaf.castShadow = true;
      decorGroup.add(leaf);
    }
    // Trunk for tall plant
    if (type === 'plant-tall') {
      const trunk = new THREE.Mesh(
        new THREE.CylinderGeometry(2, 3, height * 1.3, 8),
        new THREE.MeshStandardMaterial({ color: 0x5D3A1A, roughness: 0.8 })
      );
      trunk.position.y = height * 0.5 + height * 0.65;
      decorGroup.add(trunk);
    }
  } else if (type === 'sculpture') {
    // Sculpture: abstract stacked shapes
    const base = new THREE.Mesh(
      new THREE.BoxGeometry(w * 0.6, 5, d * 0.6),
      woodMat
    );
    base.position.y = 2.5;
    decorGroup.add(base);
    // Abstract shape (twisted torus + sphere)
    const torus = new THREE.Mesh(
      new THREE.TorusGeometry(w / 3, 3, 8, 24),
      new THREE.MeshStandardMaterial({ color: color, roughness: 0.4, metalness: 0.6 })
    );
    torus.position.y = 25;
    torus.rotation.x = Math.PI / 4;
    torus.castShadow = true;
    decorGroup.add(torus);
    const sphere = new THREE.Mesh(
      new THREE.SphereGeometry(w / 5, 16, 12),
      new THREE.MeshStandardMaterial({ color: color, roughness: 0.3, metalness: 0.7 })
    );
    sphere.position.y = 50;
    sphere.castShadow = true;
    decorGroup.add(sphere);
  } else if (type === 'wall-clock') {
    // Wall clock: disk on wall
    const clock = new THREE.Mesh(
      new THREE.CylinderGeometry(20, 20, 3, 32),
      new THREE.MeshStandardMaterial({ color: 0xFAFAFA, roughness: 0.4 })
    );
    clock.rotation.x = Math.PI / 2;
    clock.position.y = wallY;
    decorGroup.add(clock);
    // Frame
    const frame = new THREE.Mesh(
      new THREE.TorusGeometry(20, 1.5, 8, 32),
      woodMat
    );
    frame.position.y = wallY;
    frame.position.z = 1.5;
    decorGroup.add(frame);
    // Hands
    const hourHand = new THREE.Mesh(
      new THREE.BoxGeometry(1, 10, 0.5),
      darkMat
    );
    hourHand.position.set(0, wallY + 5, 1.8);
    decorGroup.add(hourHand);
    const minuteHand = new THREE.Mesh(
      new THREE.BoxGeometry(1, 15, 0.5),
      darkMat
    );
    minuteHand.position.set(3, wallY + 7, 1.8);
    minuteHand.rotation.z = -Math.PI / 4;
    decorGroup.add(minuteHand);
    // Center
    const center = new THREE.Mesh(
      new THREE.SphereGeometry(1.5, 8, 8),
      darkMat
    );
    center.position.set(0, wallY, 2);
    decorGroup.add(center);
    // Hour markers
    for (let i = 0; i < 12; i++) {
      const a = (i / 12) * Math.PI * 2;
      const marker = new THREE.Mesh(
        new THREE.BoxGeometry(1, 2, 0.5),
        darkMat
      );
      marker.position.set(Math.cos(a) * 17, wallY + Math.sin(a) * 17, 1.8);
      decorGroup.add(marker);
    }
  } else if (type === 'candle-set') {
    // Candle set: multiple candles
    const candleColors = [0xFAFAFA, 0xFFC107, 0xFAFAFA];
    const numCandles = w > 30 ? 3 : 2;
    for (let i = 0; i < numCandles; i++) {
      const x = -w / 2 + 8 + (w - 16) * (i / Math.max(1, numCandles - 1));
      // Candle body
      const candle = new THREE.Mesh(
        new THREE.CylinderGeometry(3, 3, 20, 12),
        new THREE.MeshStandardMaterial({ color: candleColors[i % 3], roughness: 0.4 })
      );
      candle.position.set(x, 12, 0);
      candle.castShadow = true;
      decorGroup.add(candle);
      // Flame
      const flame = new THREE.Mesh(
        new THREE.ConeGeometry(1.5, 4, 8),
        new THREE.MeshStandardMaterial({ color: 0xFFA500, emissive: 0xFFA500, emissiveIntensity: 0.9 })
      );
      flame.position.set(x, 24, 0);
      decorGroup.add(flame);
      // Point light
      const pt = new THREE.PointLight(0xFFA500, 0.3, 80);
      pt.position.set(x, 25, 0);
      decorGroup.add(pt);
    }
    // Tray
    const tray = new THREE.Mesh(
      new THREE.BoxGeometry(w, 2, d),
      metalMat
    );
    tray.position.y = 1;
    decorGroup.add(tray);
  } else if (type === 'book-stack') {
    // Book stack: stack of small boxes
    const bookColors = [0x8B0000, 0x000080, 0x006400, 0x8B4513, 0x4B0082, 0xFF8C00];
    const numBooks = Math.min(7, Math.floor(height / 5));
    for (let i = 0; i < numBooks; i++) {
      const bw = w * (0.8 + Math.random() * 0.2);
      const bd = d * (0.7 + Math.random() * 0.3);
      const book = new THREE.Mesh(
        new THREE.BoxGeometry(bw, 4, bd),
        new THREE.MeshStandardMaterial({ color: bookColors[i % bookColors.length], roughness: 0.6 })
      );
      book.position.set(0, 2 + i * 4, 0);
      book.castShadow = true;
      decorGroup.add(book);
      // Spine accent
      const spine = new THREE.Mesh(
        new THREE.BoxGeometry(bw * 0.9, 0.5, bd * 0.95),
        new THREE.MeshStandardMaterial({ color: 0xFAFAFA, roughness: 0.4 })
      );
      spine.position.set(0, 4 + i * 4, 0);
      decorGroup.add(spine);
    }
  } else {
    // Default decor
    const body = new THREE.Mesh(
      new THREE.BoxGeometry(w, height, d),
      new THREE.MeshStandardMaterial({ color: color, roughness: 0.6 })
    );
    body.position.y = height / 2;
    body.castShadow = true;
    decorGroup.add(body);
  }

  group.add(decorGroup);
}

// ============= 3D WALL FINISH BUILDER =============
function build3DWallFinish(group, item, bldgX, bldgZ, currentY, building, def) {
  const finishGroup = new THREE.Group();
  finishGroup.position.set(
    item.x,
    currentY + 5,
    item.y
  );
  finishGroup.rotation.y = -item.rotation;

  const type = item.type;
  const w = item.w;
  const d = item.h;
  const height = def.height3d || 280;
  const color = normalizeHex(item.color || def.color || '#FAFAFA');

  // Main wall material
  const wallMat = new THREE.MeshStandardMaterial({
    color: color,
    roughness: type.includes('tile') || type.includes('marble') ? 0.2 : type.includes('wood') ? 0.7 : 0.85,
    metalness: type.includes('steel') || type.includes('metal') ? 0.7 : 0.0,
  });

  // Wall plane (vertical)
  const wall = new THREE.Mesh(
    new THREE.BoxGeometry(w, height, 2),
    wallMat
  );
  wall.position.y = height / 2;
  wall.receiveShadow = true;
  finishGroup.add(wall);

  // Tile pattern (small box overlays)
  if (type.startsWith('wall-tile-')) {
    const tileMat = new THREE.MeshStandardMaterial({ color: 0xFAFAFA, roughness: 0.2 });
    const tileSize = type === 'wall-tile-subway' ? 20 : type === 'wall-tile-mosaic' ? 8 : 30;
    const rows = Math.floor(height / tileSize);
    const cols = Math.floor(w / tileSize);
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const offset = (type === 'wall-tile-subway' && r % 2 === 1) ? tileSize / 2 : 0;
        const tile = new THREE.Mesh(
          new THREE.BoxGeometry(tileSize - 1, tileSize - 1, 0.5),
          tileMat
        );
        tile.position.set(
          -w / 2 + tileSize / 2 + c * tileSize + offset,
          tileSize / 2 + r * tileSize,
          1.2
        );
        finishGroup.add(tile);
      }
    }
  } else if (type === 'wall-brick-exposed') {
    // Brick pattern
    const brickMat = new THREE.MeshStandardMaterial({ color: 0x8B4513, roughness: 0.8 });
    const bw = 25, bh = 10;
    const rows = Math.floor(height / bh);
    const cols = Math.floor(w / bw);
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const offset = (r % 2 === 1) ? bw / 2 : 0;
        const brick = new THREE.Mesh(
          new THREE.BoxGeometry(bw - 1, bh - 1, 0.5),
          brickMat
        );
        brick.position.set(
          -w / 2 + bw / 2 + c * bw + offset,
          bh / 2 + r * bh,
          1.2
        );
        finishGroup.add(brick);
      }
    }
  } else if (type === 'wall-stone') {
    // Stone pattern (irregular)
    const stoneMat = new THREE.MeshStandardMaterial({ color: 0x78716C, roughness: 0.9 });
    for (let i = 0; i < 30; i++) {
      const sw = 15 + Math.random() * 20;
      const sh = 10 + Math.random() * 15;
      const stone = new THREE.Mesh(
        new THREE.BoxGeometry(sw, sh, 0.5),
        stoneMat
      );
      stone.position.set(
        -w / 2 + Math.random() * w,
        Math.random() * height,
        1.2
      );
      finishGroup.add(stone);
    }
  } else if (type === 'wall-wood-panel') {
    // Wood panel: vertical planks
    const plankMat = new THREE.MeshStandardMaterial({ color: 0x8B6F47, roughness: 0.7 });
    const plankW = 20;
    const numPlanks = Math.floor(w / plankW);
    for (let i = 0; i < numPlanks; i++) {
      const plank = new THREE.Mesh(
        new THREE.BoxGeometry(plankW - 1, height, 0.5),
        plankMat
      );
      plank.position.set(-w / 2 + plankW / 2 + i * plankW, height / 2, 1.2);
      finishGroup.add(plank);
    }
  } else if (type === 'wall-3d-panel') {
    // 3D panel: geometric pattern
    const panelMat = new THREE.MeshStandardMaterial({ color: color, roughness: 0.5 });
    const size = 30;
    const rows = Math.floor(height / size);
    const cols = Math.floor(w / size);
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const panel = new THREE.Mesh(
          new THREE.BoxGeometry(size - 2, size - 2, 2),
          panelMat
        );
        panel.position.set(
          -w / 2 + size / 2 + c * size,
          size / 2 + r * size,
          1.5
        );
        finishGroup.add(panel);
      }
    }
  } else if (type === 'wall-concrete-exposed') {
    // Concrete: subtle texture
    const concMat = new THREE.MeshStandardMaterial({ color: 0xA8A29E, roughness: 0.85 });
    const overlay = new THREE.Mesh(
      new THREE.BoxGeometry(w, height, 0.5),
      concMat
    );
    overlay.position.y = height / 2;
    overlay.position.z = 1.2;
    finishGroup.add(overlay);
  } else if (type === 'wall-wainscot') {
    // Wainscot: paneling on lower half
    const wainscotMat = new THREE.MeshStandardMaterial({ color: 0xD4A574, roughness: 0.6 });
    const lower = new THREE.Mesh(
      new THREE.BoxGeometry(w, height / 2, 1),
      wainscotMat
    );
    lower.position.y = height / 4;
    lower.position.z = 1.2;
    finishGroup.add(lower);
    // Vertical stiles
    const stileMat = new THREE.MeshStandardMaterial({ color: 0x5D3A1A, roughness: 0.6 });
    const numStiles = Math.floor(w / 30);
    for (let i = 0; i <= numStiles; i++) {
      const stile = new THREE.Mesh(
        new THREE.BoxGeometry(1.5, height / 2, 1.5),
        stileMat
      );
      stile.position.set(-w / 2 + (w / numStiles) * i, height / 4, 1.5);
      finishGroup.add(stile);
    }
    // Chair rail (horizontal molding)
    const rail = new THREE.Mesh(
      new THREE.BoxGeometry(w, 3, 2),
      stileMat
    );
    rail.position.y = height / 2;
    rail.position.z = 1.5;
    finishGroup.add(rail);
  } else if (type === 'wall-marble') {
    // Marble: glossy finish with veins (approximated)
    const marbleMat = new THREE.MeshStandardMaterial({ color: 0xF5F5DC, roughness: 0.15, metalness: 0.1 });
    const overlay = new THREE.Mesh(
      new THREE.BoxGeometry(w, height, 0.5),
      marbleMat
    );
    overlay.position.y = height / 2;
    overlay.position.z = 1.2;
    finishGroup.add(overlay);
    // Vein accents
    const veinMat = new THREE.MeshStandardMaterial({ color: 0x78716C, roughness: 0.4 });
    for (let i = 0; i < 5; i++) {
      const vein = new THREE.Mesh(
        new THREE.BoxGeometry(w * 0.6, 1, 0.3),
        veinMat
      );
      vein.position.set((Math.random() - 0.5) * w * 0.3, Math.random() * height, 1.5);
      vein.rotation.z = (Math.random() - 0.5) * 0.3;
      finishGroup.add(vein);
    }
  } else if (type.startsWith('wallpaper-')) {
    // Wallpaper: thin overlay with pattern
    const wpMat = new THREE.MeshStandardMaterial({ color: color, roughness: 0.7 });
    const overlay = new THREE.Mesh(
      new THREE.BoxGeometry(w, height, 0.5),
      wpMat
    );
    overlay.position.y = height / 2;
    overlay.position.z = 1.2;
    finishGroup.add(overlay);
    // Pattern accents
    if (type === 'wallpaper-floral') {
      const flowerMat = new THREE.MeshStandardMaterial({ color: 0xE91E63, roughness: 0.5 });
      for (let i = 0; i < 8; i++) {
        const flower = new THREE.Mesh(
          new THREE.SphereGeometry(3, 8, 8),
          flowerMat
        );
        flower.position.set(
          -w / 2 + (w / 4) * (i % 4) + 10,
          height / 6 + (height / 3) * Math.floor(i / 4),
          1.6
        );
        finishGroup.add(flower);
      }
    } else if (type === 'wallpaper-stripe') {
      const stripeMat = new THREE.MeshStandardMaterial({ color: 0x5D3A1A, roughness: 0.6 });
      for (let x = 10; x < w; x += 20) {
        const stripe = new THREE.Mesh(
          new THREE.BoxGeometry(1, height, 0.3),
          stripeMat
        );
        stripe.position.set(-w / 2 + x, height / 2, 1.5);
        finishGroup.add(stripe);
      }
    }
  } else if (type.startsWith('wall-paint-')) {
    // Paint: just the base wall (no overlay needed)
    // Could add slight texture variation
  }

  group.add(finishGroup);
}

// ============= 3D BEDROOM BUILDER =============
function build3DBedroom(group, item, bldgX, bldgZ, currentY, building, def) {
  const bedGroup = new THREE.Group();
  bedGroup.position.set(
    item.x,
    currentY + 5,
    item.y
  );
  bedGroup.rotation.y = -item.rotation;

  const type = item.type;
  const w = item.w;
  const d = item.h;
  const height = def.height3d || 50;
  const color = normalizeHex(item.color || def.color || '#8B7355');

  // Materials
  const woodMat = new THREE.MeshStandardMaterial({ color: 0x5D3A1A, roughness: 0.7 });
  const mattressMat = new THREE.MeshStandardMaterial({ color: 0xFAFAFA, roughness: 0.85 });
  const pillowMat = new THREE.MeshStandardMaterial({ color: 0xFFFFFF, roughness: 0.9 });
  const blanketMat = new THREE.MeshStandardMaterial({ color: color, roughness: 0.85 });
  const metalMat = new THREE.MeshStandardMaterial({ color: 0x9CA3AF, roughness: 0.3, metalness: 0.7 });

  if (type === 'bed' || type === 'bed-king' || type === 'single-bed') {
    // Bed: frame, mattress, pillow, headboard
    const bedH = 30;
    const isKing = type === 'bed-king';
    const isSingle = type === 'single-bed';
    // Frame
    const frame = new THREE.Mesh(
      new THREE.BoxGeometry(w, bedH, d),
      woodMat
    );
    frame.position.y = bedH / 2;
    frame.castShadow = true;
    frame.receiveShadow = true;
    bedGroup.add(frame);
    // Mattress
    const mattress = new THREE.Mesh(
      new THREE.BoxGeometry(w - 6, 15, d - 6),
      mattressMat
    );
    mattress.position.y = bedH + 7.5;
    mattress.castShadow = true;
    bedGroup.add(mattress);
    // Blanket (covers part of mattress)
    const blanket = new THREE.Mesh(
      new THREE.BoxGeometry(w - 6, 2, d * 0.6),
      blanketMat
    );
    blanket.position.set(0, bedH + 16, d * 0.2);
    bedGroup.add(blanket);
    // Headboard
    const headH = 60;
    const headboard = new THREE.Mesh(
      new THREE.BoxGeometry(w, headH, 5),
      woodMat
    );
    headboard.position.set(0, headH / 2 + bedH, -d / 2 + 2.5);
    headboard.castShadow = true;
    bedGroup.add(headboard);
    // Pillows
    const pillowCount = isSingle ? 1 : isKing ? 3 : 2;
    const pillowW = (w - 8) / pillowCount - 2;
    for (let i = 0; i < pillowCount; i++) {
      const x = -w / 2 + 4 + pillowW / 2 + i * (pillowW + 2);
      const pillow = new THREE.Mesh(
        new THREE.BoxGeometry(pillowW, 6, d / 4),
        pillowMat
      );
      pillow.position.set(x, bedH + 18, -d / 2 + d / 8 + 2);
      pillow.castShadow = true;
      bedGroup.add(pillow);
    }
    // Legs
    const legW = 4;
    const legPositions = [
      [-w / 2 + legW, -d / 2 + legW], [w / 2 - legW, -d / 2 + legW],
      [-w / 2 + legW, d / 2 - legW], [w / 2 - legW, d / 2 - legW],
    ];
    for (const [lx, lz] of legPositions) {
      const leg = new THREE.Mesh(
        new THREE.BoxGeometry(legW, 8, legW),
        woodMat
      );
      leg.position.set(lx, 4, lz);
      bedGroup.add(leg);
    }
  } else if (type === 'bunk-bed') {
    // Bunk bed: two mattresses stacked
    const bedH = 25;
    const frameH = 180;
    // Frame (4 posts)
    const postW = 6;
    const postPositions = [
      [-w / 2 + postW / 2, -d / 2 + postW / 2],
      [w / 2 - postW / 2, -d / 2 + postW / 2],
      [-w / 2 + postW / 2, d / 2 - postW / 2],
      [w / 2 - postW / 2, d / 2 - postW / 2],
    ];
    for (const [px, pz] of postPositions) {
      const post = new THREE.Mesh(
        new THREE.BoxGeometry(postW, frameH, postW),
        woodMat
      );
      post.position.set(px, frameH / 2, pz);
      post.castShadow = true;
      bedGroup.add(post);
    }
    // Top bunk
    const topBed = new THREE.Mesh(
      new THREE.BoxGeometry(w, bedH, d),
      woodMat
    );
    topBed.position.y = 150;
    bedGroup.add(topBed);
    const topMattress = new THREE.Mesh(
      new THREE.BoxGeometry(w - 6, 10, d - 6),
      mattressMat
    );
    topMattress.position.y = 160;
    bedGroup.add(topMattress);
    const topPillow = new THREE.Mesh(
      new THREE.BoxGeometry(w - 10, 5, d / 4),
      pillowMat
    );
    topPillow.position.set(0, 168, -d / 2 + d / 8 + 2);
    bedGroup.add(topPillow);
    // Safety rail (top bunk)
    const rail = new THREE.Mesh(
      new THREE.BoxGeometry(w - 4, 3, 2),
      woodMat
    );
    rail.position.set(0, 170, d / 2 - 1);
    bedGroup.add(rail);
    // Bottom bunk
    const botBed = new THREE.Mesh(
      new THREE.BoxGeometry(w, bedH, d),
      woodMat
    );
    botBed.position.y = 40;
    bedGroup.add(botBed);
    const botMattress = new THREE.Mesh(
      new THREE.BoxGeometry(w - 6, 10, d - 6),
      mattressMat
    );
    botMattress.position.y = 50;
    bedGroup.add(botMattress);
    const botPillow = new THREE.Mesh(
      new THREE.BoxGeometry(w - 10, 5, d / 4),
      pillowMat
    );
    botPillow.position.set(0, 58, -d / 2 + d / 8 + 2);
    bedGroup.add(botPillow);
    // Ladder
    const ladderSide = new THREE.Mesh(
      new THREE.BoxGeometry(2, 120, 2),
      woodMat
    );
    ladderSide.position.set(w / 2, 90, d / 2 - 2);
    bedGroup.add(ladderSide);
    // Rungs
    for (let i = 0; i < 6; i++) {
      const rung = new THREE.Mesh(
        new THREE.BoxGeometry(8, 2, 2),
        woodMat
      );
      rung.position.set(w / 2 - 4, 40 + i * 20, d / 2 - 2);
      bedGroup.add(rung);
    }
  } else if (type === 'wardrobe' || type === 'walk-in-closet') {
    // Wardrobe: tall cabinet with doors
    const wardH = 220;
    const body = new THREE.Mesh(
      new THREE.BoxGeometry(w, wardH, d),
      woodMat
    );
    body.position.y = wardH / 2;
    body.castShadow = true;
    bedGroup.add(body);
    // Door divisions
    const numDoors = type === 'walk-in-closet' ? (w > 120 ? 4 : 3) : (w > 100 ? 3 : 2);
    for (let i = 1; i < numDoors; i++) {
      const div = new THREE.Mesh(
        new THREE.BoxGeometry(0.5, wardH - 2, 0.5),
        new THREE.MeshStandardMaterial({ color: 0x3D2817, roughness: 0.6 })
      );
      div.position.set(-w / 2 + (w / numDoors) * i, wardH / 2, d / 2 + 0.2);
      bedGroup.add(div);
    }
    // Handles
    for (let i = 0; i < numDoors; i++) {
      const x = -w / 2 + (w / numDoors) * (i + 0.5);
      const handle = new THREE.Mesh(
        new THREE.BoxGeometry(1.5, 20, 1.5),
        metalMat
      );
      handle.position.set(x, wardH / 2, d / 2 + 0.6);
      bedGroup.add(handle);
    }
    // Top cornice
    const cornice = new THREE.Mesh(
      new THREE.BoxGeometry(w + 4, 6, d + 4),
      woodMat
    );
    cornice.position.y = wardH + 3;
    bedGroup.add(cornice);
    // Walk-in closet: hanging rod + shelf
    if (type === 'walk-in-closet') {
      // Hanging rod
      const rod = new THREE.Mesh(
        new THREE.CylinderGeometry(1, 1, w - 8, 8),
        metalMat
      );
      rod.rotation.z = Math.PI / 2;
      rod.position.set(0, wardH * 0.7, 0);
      bedGroup.add(rod);
      // Hanging clothes (simple cylinders)
      const clothColors = [0x4B2E1A, 0x1F2937, 0x374151, 0x6B7280, 0x8B4513];
      for (let i = 0; i < Math.min(6, Math.floor(w / 20)); i++) {
        const cx = -w / 2 + 10 + (w - 20) * (i / Math.max(1, Math.floor(w / 20) - 1));
        const cloth = new THREE.Mesh(
          new THREE.BoxGeometry(12, 80, 4),
          new THREE.MeshStandardMaterial({ color: clothColors[i % clothColors.length], roughness: 0.8 })
        );
        cloth.position.set(cx, wardH * 0.4, 0);
        bedGroup.add(cloth);
      }
    }
  } else if (type === 'nightstand') {
    // Nightstand: small cabinet with drawer
    const nsH = 50;
    const body = new THREE.Mesh(
      new THREE.BoxGeometry(w, nsH, d),
      woodMat
    );
    body.position.y = nsH / 2;
    body.castShadow = true;
    bedGroup.add(body);
    // Drawer division
    const drawerLine = new THREE.Mesh(
      new THREE.BoxGeometry(w - 2, 0.5, 0.5),
      new THREE.MeshStandardMaterial({ color: 0x3D2817, roughness: 0.5 })
    );
    drawerLine.position.set(0, nsH / 2, d / 2 + 0.2);
    bedGroup.add(drawerLine);
    // Handle
    const handle = new THREE.Mesh(
      new THREE.BoxGeometry(8, 1.5, 1.5),
      metalMat
    );
    handle.position.set(0, nsH * 0.7, d / 2 + 0.6);
    bedGroup.add(handle);
    // Legs
    const legW = 3;
    const legPositions = [
      [-w / 2 + legW, -d / 2 + legW], [w / 2 - legW, -d / 2 + legW],
      [-w / 2 + legW, d / 2 - legW], [w / 2 - legW, d / 2 - legW],
    ];
    for (const [lx, lz] of legPositions) {
      const leg = new THREE.Mesh(
        new THREE.BoxGeometry(legW, 8, legW),
        woodMat
      );
      leg.position.set(lx, 4, lz);
      bedGroup.add(leg);
    }
  } else if (type === 'dresser') {
    // Dresser: chest of drawers
    const drH = 90;
    const body = new THREE.Mesh(
      new THREE.BoxGeometry(w, drH, d),
      woodMat
    );
    body.position.y = drH / 2;
    body.castShadow = true;
    bedGroup.add(body);
    // Drawer divisions
    const numDrawers = 4;
    for (let i = 1; i < numDrawers; i++) {
      const y = (drH / numDrawers) * i;
      const line = new THREE.Mesh(
        new THREE.BoxGeometry(w - 2, 0.5, 0.5),
        new THREE.MeshStandardMaterial({ color: 0x3D2817, roughness: 0.5 })
      );
      line.position.set(0, y, d / 2 + 0.2);
      bedGroup.add(line);
    }
    // Vertical division (split into 2 columns)
    const vline = new THREE.Mesh(
      new THREE.BoxGeometry(0.5, drH - 2, 0.5),
      new THREE.MeshStandardMaterial({ color: 0x3D2817, roughness: 0.5 })
    );
    vline.position.set(0, drH / 2, d / 2 + 0.2);
    bedGroup.add(vline);
    // Handles (2 per row)
    for (let r = 0; r < numDrawers; r++) {
      const y = (drH / numDrawers) * (r + 0.5);
      const handleL = new THREE.Mesh(
        new THREE.BoxGeometry(8, 1.5, 1.5),
        metalMat
      );
      handleL.position.set(-w / 4, y, d / 2 + 0.6);
      bedGroup.add(handleL);
      const handleR = handleL.clone();
      handleR.position.x = w / 4;
      bedGroup.add(handleR);
    }
    // Legs
    const legW = 4;
    const legPositions = [
      [-w / 2 + legW, -d / 2 + legW], [w / 2 - legW, -d / 2 + legW],
      [-w / 2 + legW, d / 2 - legW], [w / 2 - legW, d / 2 - legW],
    ];
    for (const [lx, lz] of legPositions) {
      const leg = new THREE.Mesh(
        new THREE.BoxGeometry(legW, 12, legW),
        woodMat
      );
      leg.position.set(lx, 6, lz);
      bedGroup.add(leg);
    }
  } else if (type === 'desk') {
    // Desk: top + legs + drawer
    const deskH = 75;
    // Top
    const top = new THREE.Mesh(
      new THREE.BoxGeometry(w, 4, d),
      woodMat
    );
    top.position.y = deskH;
    top.castShadow = true;
    top.receiveShadow = true;
    bedGroup.add(top);
    // Legs
    const legW = 4;
    const legPositions = [
      [-w / 2 + legW, -d / 2 + legW], [w / 2 - legW, -d / 2 + legW],
      [-w / 2 + legW, d / 2 - legW], [w / 2 - legW, d / 2 - legW],
    ];
    for (const [lx, lz] of legPositions) {
      const leg = new THREE.Mesh(
        new THREE.BoxGeometry(legW, deskH, legW),
        woodMat
      );
      leg.position.set(lx, deskH / 2, lz);
      leg.castShadow = true;
      bedGroup.add(leg);
    }
    // Drawer compartment (on one side)
    const drawer = new THREE.Mesh(
      new THREE.BoxGeometry(w / 3, deskH - 10, d - 4),
      woodMat
    );
    drawer.position.set(w / 2 - w / 6, deskH / 2 - 5, 0);
    bedGroup.add(drawer);
    // Drawer lines
    for (let i = 1; i < 3; i++) {
      const line = new THREE.Mesh(
        new THREE.BoxGeometry(w / 3 - 2, 0.5, 0.5),
        new THREE.MeshStandardMaterial({ color: 0x3D2817, roughness: 0.5 })
      );
      line.position.set(w / 2 - w / 6, 15 + (deskH - 20) / 3 * i, d / 2 - 2);
      bedGroup.add(line);
    }
    // Handles
    for (let i = 0; i < 3; i++) {
      const handle = new THREE.Mesh(
        new THREE.BoxGeometry(6, 1.5, 1.5),
        metalMat
      );
      handle.position.set(w / 2 - w / 6, 15 + (deskH - 20) / 3 * (i + 0.5), d / 2 - 1.5);
      bedGroup.add(handle);
    }
  } else if (type === 'vanity-table') {
    // Vanity table: desk with mirror
    const vanH = 75;
    // Table top
    const top = new THREE.Mesh(
      new THREE.BoxGeometry(w, 4, d),
      woodMat
    );
    top.position.y = vanH;
    top.castShadow = true;
    bedGroup.add(top);
    // Legs
    const legW = 4;
    const legPositions = [
      [-w / 2 + legW, -d / 2 + legW], [w / 2 - legW, -d / 2 + legW],
      [-w / 2 + legW, d / 2 - legW], [w / 2 - legW, d / 2 - legW],
    ];
    for (const [lx, lz] of legPositions) {
      const leg = new THREE.Mesh(
        new THREE.BoxGeometry(legW, vanH, legW),
        woodMat
      );
      leg.position.set(lx, vanH / 2, lz);
      bedGroup.add(leg);
    }
    // Drawers on sides
    const drawerMat = woodMat;
    const drawerL = new THREE.Mesh(
      new THREE.BoxGeometry(w / 4, vanH - 10, d - 4),
      drawerMat
    );
    drawerL.position.set(-w / 2 + w / 8, vanH / 2 - 5, 0);
    bedGroup.add(drawerL);
    const drawerR = drawerL.clone();
    drawerR.position.x = w / 2 - w / 8;
    bedGroup.add(drawerR);
    // Handles
    const handleL = new THREE.Mesh(
      new THREE.BoxGeometry(1.5, 4, 1.5),
      metalMat
    );
    handleL.position.set(-w / 2 + w / 8, vanH / 2, d / 2 - 1.5);
    bedGroup.add(handleL);
    const handleR = handleL.clone();
    handleR.position.x = w / 2 - w / 8;
    bedGroup.add(handleR);
    // Mirror (oval shape using sphere)
    const mirrorFrame = new THREE.Mesh(
      new THREE.TorusGeometry(w / 3, 3, 8, 24),
      woodMat
    );
    mirrorFrame.position.set(0, vanH + 50, -d / 2 + 2);
    bedGroup.add(mirrorFrame);
    const mirror = new THREE.Mesh(
      new THREE.CircleGeometry(w / 3 - 3, 24),
      new THREE.MeshPhysicalMaterial({ color: 0xFFFFFF, roughness: 0.0, metalness: 0.95 })
    );
    mirror.position.set(0, vanH + 50, -d / 2 + 2.5);
    bedGroup.add(mirror);
    // Stool (small seat in front)
    const stool = new THREE.Mesh(
      new THREE.CylinderGeometry(15, 15, 5, 16),
      woodMat
    );
    stool.position.set(0, 22, d / 2 + 20);
    bedGroup.add(stool);
    const stoolLeg = new THREE.Mesh(
      new THREE.CylinderGeometry(2, 2, 20, 8),
      woodMat
    );
    stoolLeg.position.set(0, 10, d / 2 + 20);
    bedGroup.add(stoolLeg);
  } else if (type === 'chaise-longue') {
    // Chaise longue: elongated curved seat
    const baseH = 35;
    // Main body
    const base = new THREE.Mesh(
      new THREE.BoxGeometry(w, baseH, d),
      woodMat
    );
    base.position.y = baseH / 2;
    base.castShadow = true;
    bedGroup.add(base);
    // Cushion
    const cushion = new THREE.Mesh(
      new THREE.BoxGeometry(w - 6, 8, d - 6),
      blanketMat
    );
    cushion.position.y = baseH + 4;
    cushion.castShadow = true;
    bedGroup.add(cushion);
    // Backrest (angled)
    const back = new THREE.Mesh(
      new THREE.BoxGeometry(w - 6, 50, 8),
      blanketMat
    );
    back.position.set(0, baseH + 25, -d / 2 + 4);
    back.rotation.x = Math.PI * 0.15;
    back.castShadow = true;
    bedGroup.add(back);
    // Arm rest (one side)
    const arm = new THREE.Mesh(
      new THREE.BoxGeometry(8, 30, d - 6),
      woodMat
    );
    arm.position.set(-w / 2 + 4, baseH + 15, 0);
    bedGroup.add(arm);
    // Legs
    const legW = 4;
    const legPositions = [
      [-w / 2 + legW, -d / 2 + legW], [w / 2 - legW, -d / 2 + legW],
      [-w / 2 + legW, d / 2 - legW], [w / 2 - legW, d / 2 - legW],
    ];
    for (const [lx, lz] of legPositions) {
      const leg = new THREE.Mesh(
        new THREE.BoxGeometry(legW, 8, legW),
        woodMat
      );
      leg.position.set(lx, 4, lz);
      bedGroup.add(leg);
    }
  } else {
    // Default bedroom item
    const body = new THREE.Mesh(
      new THREE.BoxGeometry(w, height, d),
      woodMat
    );
    body.position.y = height / 2;
    body.castShadow = true;
    bedGroup.add(body);
  }

  group.add(bedGroup);
}

// ============= 3D DOOR & WINDOW BUILDER =============
function build3DDoor(group, item, bldgX, bldgZ, currentY, building, def) {
  const doorGroup = new THREE.Group();
  doorGroup.position.set(
    item.x,
    currentY + 5,
    item.y
  );
  doorGroup.rotation.y = -item.rotation;

  const type = item.type;
  const w = item.w;
  const d = item.h;
  const height = def.height3d || 210;
  const color = normalizeHex(item.color || def.color || '#8B6F47');

  const woodMat = new THREE.MeshStandardMaterial({ color: color, roughness: 0.6, metalness: 0.05 });
  const frameMat = new THREE.MeshStandardMaterial({ color: 0x5D3A1A, roughness: 0.6 });
  const glassMat = new THREE.MeshPhysicalMaterial({
    color: 0xBEE3F8,
    roughness: 0.05,
    metalness: 0.1,
    transmission: 0.85,
    transparent: true,
    opacity: 0.5,
  });
  const metalMat = new THREE.MeshStandardMaterial({ color: 0x9CA3AF, roughness: 0.3, metalness: 0.8 });
  const darkMat = new THREE.MeshStandardMaterial({ color: 0x1F2937, roughness: 0.4 });

  const isWindow = type === 'window' || type.startsWith('window-') || type === 'skylight' || type === 'louver-window';

  if (isWindow) {
    // Window: frame with glass
    const winH = type === 'window-large' ? 150 : 120;
    const winY = 90; // sill height
    // Frame
    const frame = new THREE.Mesh(
      new THREE.BoxGeometry(w + 4, winH + 4, 6),
      frameMat
    );
    frame.position.y = winY + winH / 2;
    frame.castShadow = true;
    doorGroup.add(frame);
    // Glass
    const glass = new THREE.Mesh(
      new THREE.BoxGeometry(w - 4, winH - 4, 1),
      glassMat
    );
    glass.position.y = winY + winH / 2;
    glass.position.z = 3;
    doorGroup.add(glass);
    // Mullions (dividers)
    const mullMat = frameMat;
    if (type === 'window-twin' || type === 'window-triple' || type === 'window-large') {
      const panes = type === 'window-triple' ? 3 : 2;
      for (let i = 1; i < panes; i++) {
        const x = -w / 2 + (w / panes) * i;
        const mull = new THREE.Mesh(
          new THREE.BoxGeometry(2, winH - 4, 2),
          mullMat
        );
        mull.position.set(x, winY + winH / 2, 3);
        doorGroup.add(mull);
      }
    } else if (type === 'window-casement' || type === 'window-awning' || type === 'window-sliding' || type === 'window-horizontal-sliding') {
      // Horizontal divider
      const mull = new THREE.Mesh(
        new THREE.BoxGeometry(w - 4, 2, 2),
        mullMat
      );
      mull.position.set(0, winY + winH / 2, 3);
      doorGroup.add(mull);
    } else if (type === 'window-jengki') {
      // Cross divider
      const mullV = new THREE.Mesh(
        new THREE.BoxGeometry(2, winH - 4, 2),
        mullMat
      );
      mullV.position.set(0, winY + winH / 2, 3);
      doorGroup.add(mullV);
      const mullH = new THREE.Mesh(
        new THREE.BoxGeometry(w - 4, 2, 2),
        mullMat
      );
      mullH.position.set(0, winY + winH / 2, 3);
      doorGroup.add(mullH);
    } else if (type === 'window-glass-block') {
      // Grid divider
      const cols = Math.floor(w / 20);
      const rows = Math.floor(winH / 20);
      for (let i = 1; i < cols; i++) {
        const x = -w / 2 + (w / cols) * i;
        const mull = new THREE.Mesh(
          new THREE.BoxGeometry(1, winH - 4, 1),
          mullMat
        );
        mull.position.set(x, winY + winH / 2, 3);
        doorGroup.add(mull);
      }
      for (let j = 1; j < rows; j++) {
        const y = winY + (winH / rows) * j;
        const mull = new THREE.Mesh(
          new THREE.BoxGeometry(w - 4, 1, 1),
          mullMat
        );
        mull.position.set(0, y, 3);
        doorGroup.add(mull);
      }
    } else if (type === 'louver-window') {
      // Louver slats
      const numSlats = 10;
      for (let i = 0; i < numSlats; i++) {
        const y = winY + 10 + (winH - 20) * (i / numSlats);
        const slat = new THREE.Mesh(
          new THREE.BoxGeometry(w - 4, 3, 2),
          mullMat
        );
        slat.position.set(0, y, 3);
        slat.rotation.x = Math.PI * 0.15;
        doorGroup.add(slat);
      }
    } else if (type === 'window-bay') {
      // Bay window: angled segments (simplified)
      // Already has the main window; add side glass panels
      const sideGlassL = new THREE.Mesh(
        new THREE.BoxGeometry(15, winH - 4, 1),
        glassMat
      );
      sideGlassL.position.set(-w / 2 - 8, winY + winH / 2, 8);
      sideGlassL.rotation.y = Math.PI / 4;
      doorGroup.add(sideGlassL);
      const sideGlassR = sideGlassL.clone();
      sideGlassR.position.x = w / 2 + 8;
      sideGlassR.rotation.y = -Math.PI / 4;
      doorGroup.add(sideGlassR);
    } else if (type === 'skylight') {
      // Skylight: horizontal panel on ceiling
      doorGroup.remove(frame, glass);
      const sky = new THREE.Mesh(
        new THREE.BoxGeometry(w, 4, d),
        glassMat
      );
      sky.position.y = 280;
      doorGroup.add(sky);
      const skyFrame = new THREE.Mesh(
        new THREE.BoxGeometry(w + 4, 6, d + 4),
        frameMat
      );
      skyFrame.position.y = 278;
      doorGroup.add(skyFrame);
    }
    // Sill
    const sill = new THREE.Mesh(
      new THREE.BoxGeometry(w + 8, 4, 8),
      frameMat
    );
    sill.position.set(0, winY - 2, 2);
    doorGroup.add(sill);
    // Default: simple cross divider
    if (type === 'window' || type === 'window-tempered' || type === 'window-tinted' || type === 'window-nako') {
      const mullV = new THREE.Mesh(
        new THREE.BoxGeometry(2, winH - 4, 2),
        mullMat
      );
      mullV.position.set(0, winY + winH / 2, 3);
      doorGroup.add(mullV);
      const mullH = new THREE.Mesh(
        new THREE.BoxGeometry(w - 4, 2, 2),
        mullMat
      );
      mullH.position.set(0, winY + winH / 2, 3);
      doorGroup.add(mullH);
    }
  } else if (type === 'sliding-door' || type === 'door-sliding-glass' || type === 'door-glass') {
    // Sliding door: two glass panels
    const isGlass = type === 'door-glass' || type === 'door-sliding-glass';
    const panelW = w / 2;
    const doorMat = isGlass ? glassMat : woodMat;
    // Track
    const trackTop = new THREE.Mesh(
      new THREE.BoxGeometry(w + 4, 3, 6),
      metalMat
    );
    trackTop.position.y = height + 1.5;
    doorGroup.add(trackTop);
    const trackBot = new THREE.Mesh(
      new THREE.BoxGeometry(w + 4, 3, 6),
      metalMat
    );
    trackBot.position.y = 1.5;
    doorGroup.add(trackBot);
    // Frame
    const frameL = new THREE.Mesh(
      new THREE.BoxGeometry(4, height, 6),
      frameMat
    );
    frameL.position.set(-w / 2 - 2, height / 2, 0);
    doorGroup.add(frameL);
    const frameR = frameL.clone();
    frameR.position.x = w / 2 + 2;
    doorGroup.add(frameR);
    // Panel 1 (back)
    const panel1 = new THREE.Mesh(
      new THREE.BoxGeometry(panelW - 2, height - 4, 3),
      doorMat
    );
    panel1.position.set(-panelW / 2 - 1, height / 2, -1);
    panel1.castShadow = true;
    doorGroup.add(panel1);
    // Panel 2 (front, slightly offset)
    const panel2 = new THREE.Mesh(
      new THREE.BoxGeometry(panelW - 2, height - 4, 3),
      doorMat
    );
    panel2.position.set(panelW / 2 + 1, height / 2, 1);
    panel2.castShadow = true;
    doorGroup.add(panel2);
    // Handles
    const handle1 = new THREE.Mesh(
      new THREE.BoxGeometry(2, 15, 2),
      metalMat
    );
    handle1.position.set(0, height / 2, -2);
    doorGroup.add(handle1);
    const handle2 = new THREE.Mesh(
      new THREE.BoxGeometry(2, 15, 2),
      metalMat
    );
    handle2.position.set(0, height / 2, 2);
    doorGroup.add(handle2);
  } else if (type === 'folding-door') {
    // Folding door: multiple panels
    const panels = w > 100 ? 4 : 3;
    const panelW = w / panels;
    // Track
    const track = new THREE.Mesh(
      new THREE.BoxGeometry(w + 4, 3, 6),
      metalMat
    );
    track.position.y = height + 1.5;
    doorGroup.add(track);
    const trackBot = new THREE.Mesh(
      new THREE.BoxGeometry(w + 4, 3, 6),
      metalMat
    );
    trackBot.position.y = 1.5;
    doorGroup.add(trackBot);
    // Panels
    for (let i = 0; i < panels; i++) {
      const panel = new THREE.Mesh(
        new THREE.BoxGeometry(panelW - 2, height - 4, 3),
        woodMat
      );
      panel.position.set(-w / 2 + panelW * (i + 0.5), height / 2, 0);
      panel.castShadow = true;
      doorGroup.add(panel);
      // Hinges
      const hinge = new THREE.Mesh(
        new THREE.CylinderGeometry(0.8, 0.8, 5, 6),
        metalMat
      );
      hinge.position.set(-w / 2 + panelW * (i + 0.5), height / 4, 2);
      doorGroup.add(hinge);
      const hinge2 = hinge.clone();
      hinge2.position.y = height * 3 / 4;
      doorGroup.add(hinge2);
    }
  } else if (type === 'door-double' || type === 'french-door') {
    // Double door
    const isFrench = type === 'french-door';
    const panelW = w / 2;
    const doorMat = isFrench ? glassMat : woodMat;
    // Frame
    const frame = new THREE.Mesh(
      new THREE.BoxGeometry(w + 4, height + 4, 8),
      frameMat
    );
    frame.position.y = height / 2;
    doorGroup.add(frame);
    // Two panels
    for (let i = 0; i < 2; i++) {
      const x = -w / 2 + panelW * (i + 0.5);
      const panel = new THREE.Mesh(
        new THREE.BoxGeometry(panelW - 4, height - 4, 4),
        doorMat
      );
      panel.position.set(x, height / 2, 0);
      panel.castShadow = true;
      doorGroup.add(panel);
      // Panel detailing for wood doors
      if (!isFrench) {
        const detail1 = new THREE.Mesh(
          new THREE.BoxGeometry(panelW - 12, height / 3, 0.5),
          new THREE.MeshStandardMaterial({ color: 0x3D2817, roughness: 0.5 })
        );
        detail1.position.set(x, height * 0.7, 2.2);
        doorGroup.add(detail1);
        const detail2 = detail1.clone();
        detail2.position.y = height * 0.3;
        doorGroup.add(detail2);
      }
      // Handle
      const handle = new THREE.Mesh(
        new THREE.CylinderGeometry(1, 1, 8, 8),
        metalMat
      );
      const handleX = i === 0 ? x + panelW / 2 - 5 : x - panelW / 2 + 5;
      handle.position.set(handleX, height / 2, 3);
      doorGroup.add(handle);
    }
  } else if (type === 'door-pivot') {
    // Pivot door: single panel with offset pivot
    const panel = new THREE.Mesh(
      new THREE.BoxGeometry(w, height, 5),
      woodMat
    );
    panel.position.y = height / 2;
    panel.castShadow = true;
    doorGroup.add(panel);
    // Pivot indicator (top and bottom)
    const pivotTop = new THREE.Mesh(
      new THREE.CylinderGeometry(1.5, 1.5, 4, 8),
      metalMat
    );
    pivotTop.position.set(-w / 4, height, 0);
    doorGroup.add(pivotTop);
    const pivotBot = pivotTop.clone();
    pivotBot.position.y = 0;
    doorGroup.add(pivotBot);
    // Panel detail
    const detail = new THREE.Mesh(
      new THREE.BoxGeometry(w - 10, height - 20, 0.5),
      new THREE.MeshStandardMaterial({ color: 0x3D2817, roughness: 0.5 })
    );
    detail.position.set(0, height / 2, 2.6);
    doorGroup.add(detail);
    // Handle
    const handle = new THREE.Mesh(
      new THREE.CylinderGeometry(1, 1, 12, 8),
      metalMat
    );
    handle.position.set(w / 4, height / 2, 3);
    doorGroup.add(handle);
  } else {
    // Standard single door
    // Frame
    const frame = new THREE.Mesh(
      new THREE.BoxGeometry(w + 4, height + 4, 8),
      frameMat
    );
    frame.position.y = height / 2;
    doorGroup.add(frame);
    // Door panel
    const panel = new THREE.Mesh(
      new THREE.BoxGeometry(w - 2, height - 4, 4),
      woodMat
    );
    panel.position.y = height / 2;
    panel.castShadow = true;
    doorGroup.add(panel);
    // Panel detailing
    const detail1 = new THREE.Mesh(
      new THREE.BoxGeometry(w - 12, height / 3, 0.5),
      new THREE.MeshStandardMaterial({ color: 0x3D2817, roughness: 0.5 })
    );
    detail1.position.set(0, height * 0.7, 2.2);
    doorGroup.add(detail1);
    const detail2 = detail1.clone();
    detail2.position.y = height * 0.3;
    doorGroup.add(detail2);
    // Handle
    const handle = new THREE.Mesh(
      new THREE.CylinderGeometry(1, 1, 8, 8),
      metalMat
    );
    handle.position.set(w / 4, height / 2, 3);
    doorGroup.add(handle);
    // Hinges
    for (let i = 0; i < 3; i++) {
      const hinge = new THREE.Mesh(
        new THREE.BoxGeometry(2, 4, 1),
        metalMat
      );
      hinge.position.set(-w / 2 + 1, height * (0.2 + i * 0.3), 2);
      doorGroup.add(hinge);
    }
  }

  group.add(doorGroup);
}

// ============= 3D OUTDOOR EXTRA BUILDER =============
function build3DOutdoorExtra(group, item, bldgX, bldgZ, currentY, building, def) {
  const outGroup = new THREE.Group();
  outGroup.position.set(
    item.x,
    currentY + 5,
    item.y
  );
  outGroup.rotation.y = -item.rotation;

  const type = item.type;
  const w = item.w;
  const d = item.h;
  const height = def.height3d || 30;
  const color = normalizeHex(item.color || def.color || '#8B7355');

  const woodMat = new THREE.MeshStandardMaterial({ color: 0x5D3A1A, roughness: 0.7 });
  const metalMat = new THREE.MeshStandardMaterial({ color: 0x6B7280, roughness: 0.4, metalness: 0.7 });
  const darkMat = new THREE.MeshStandardMaterial({ color: 0x1F2937, roughness: 0.5 });
  const waterMat = new THREE.MeshPhysicalMaterial({
    color: 0x4FC3F7,
    roughness: 0.05,
    transmission: 0.7,
    transparent: true,
    opacity: 0.7,
  });
  const leafMat = new THREE.MeshStandardMaterial({ color: 0x2E7D32, roughness: 0.8 });
  const grassMat = new THREE.MeshStandardMaterial({ color: 0x558B2F, roughness: 0.9 });

  if (type === 'carport' || type === 'carport-2') {
    // Carport: roof on posts
    const postH = 240;
    // Roof
    const roof = new THREE.Mesh(
      new THREE.BoxGeometry(w + 10, 6, d + 10),
      new THREE.MeshStandardMaterial({ color: color, roughness: 0.7 })
    );
    roof.position.y = postH;
    roof.castShadow = true;
    outGroup.add(roof);
    // Posts (4 corners)
    const postW = 8;
    const postPositions = [
      [-w / 2, -d / 2], [w / 2, -d / 2],
      [-w / 2, d / 2], [w / 2, d / 2],
    ];
    for (const [px, pz] of postPositions) {
      const post = new THREE.Mesh(
        new THREE.BoxGeometry(postW, postH, postW),
        metalMat
      );
      post.position.set(px, postH / 2, pz);
      post.castShadow = true;
      outGroup.add(post);
    }
    // Car (simplified) for visual reference
    if (type === 'carport-2') {
      // 2 cars
      const carMat = new THREE.MeshStandardMaterial({ color: 0x374151, roughness: 0.3, metalness: 0.5 });
      for (let i = 0; i < 2; i++) {
        const car = new THREE.Mesh(
          new THREE.BoxGeometry(w / 2 - 10, 50, d - 20),
          carMat
        );
        car.position.set(-w / 4 + (w / 2) * i, 25, 0);
        car.castShadow = true;
        outGroup.add(car);
        // Windshield (angled)
        const windshield = new THREE.Mesh(
          new THREE.BoxGeometry(w / 2 - 15, 20, 5),
          new THREE.MeshPhysicalMaterial({ color: 0x111827, roughness: 0.1, transmission: 0.4, transparent: true, opacity: 0.6 })
        );
        windshield.position.set(-w / 4 + (w / 2) * i, 35, 0);
        outGroup.add(windshield);
      }
    } else {
      const carMat = new THREE.MeshStandardMaterial({ color: 0x374151, roughness: 0.3, metalness: 0.5 });
      const car = new THREE.Mesh(
        new THREE.BoxGeometry(w - 20, 50, d - 20),
        carMat
      );
      car.position.y = 25;
      car.castShadow = true;
      outGroup.add(car);
    }
  } else if (type === 'garage-door') {
    // Garage door: panel door
    const doorH = 240;
    const body = new THREE.Mesh(
      new THREE.BoxGeometry(w, doorH, 6),
      new THREE.MeshStandardMaterial({ color: color, roughness: 0.5, metalness: 0.3 })
    );
    body.position.y = doorH / 2;
    body.castShadow = true;
    outGroup.add(body);
    // Horizontal panel lines
    const numPanels = 6;
    for (let i = 1; i < numPanels; i++) {
      const y = (doorH / numPanels) * i;
      const line = new THREE.Mesh(
        new THREE.BoxGeometry(w - 2, 1.5, 1),
        new THREE.MeshStandardMaterial({ color: 0x3D2817, roughness: 0.5 })
      );
      line.position.set(0, y, 3);
      outGroup.add(line);
    }
    // Vertical line (center)
    const vline = new THREE.Mesh(
      new THREE.BoxGeometry(1.5, doorH - 2, 1),
      new THREE.MeshStandardMaterial({ color: 0x3D2817, roughness: 0.5 })
    );
    vline.position.set(0, doorH / 2, 3);
    outGroup.add(vline);
    // Handle
    const handle = new THREE.Mesh(
      new THREE.CylinderGeometry(1, 1, 6, 8),
      metalMat
    );
    handle.position.set(0, doorH * 0.1, 3.5);
    outGroup.add(handle);
    // Track (sides)
    const trackL = new THREE.Mesh(
      new THREE.BoxGeometry(2, doorH, 2),
      metalMat
    );
    trackL.position.set(-w / 2 - 1, doorH / 2, 0);
    outGroup.add(trackL);
    const trackR = trackL.clone();
    trackR.position.x = w / 2 + 1;
    outGroup.add(trackR);
  } else if (type === 'bush') {
    // Bush: cluster of spheres
    const positions = [
      [-w / 4, 0, 0], [0, 0, d / 6], [w / 4, 0, 0],
      [-w / 6, 0, -d / 6], [w / 6, 0, -d / 6],
    ];
    for (const [px, py, pz] of positions) {
      const bush = new THREE.Mesh(
        new THREE.SphereGeometry(Math.min(w, d) / 3, 12, 10),
        leafMat
      );
      bush.position.set(px, Math.min(w, d) / 2 + py, pz);
      bush.castShadow = true;
      outGroup.add(bush);
    }
  } else if (type === 'flower-bed') {
    // Flower bed: raised planter with flowers
    const bedH = 25;
    // Wooden frame
    const frame = new THREE.Mesh(
      new THREE.BoxGeometry(w, bedH, d),
      woodMat
    );
    frame.position.y = bedH / 2;
    frame.castShadow = true;
    outGroup.add(frame);
    // Soil
    const soil = new THREE.Mesh(
      new THREE.BoxGeometry(w - 4, 4, d - 4),
      new THREE.MeshStandardMaterial({ color: 0x3D2817, roughness: 0.95 })
    );
    soil.position.y = bedH - 2;
    outGroup.add(soil);
    // Flowers (clusters of small spheres with stems)
    const flowerColors = [0xE91E63, 0xFFC107, 0x9C27B0, 0xFF5722, 0xF44336];
    const numFlowers = Math.min(15, Math.floor(w * d / 100));
    for (let i = 0; i < numFlowers; i++) {
      const fx = (Math.random() - 0.5) * (w - 8);
      const fz = (Math.random() - 0.5) * (d - 8);
      // Stem
      const stem = new THREE.Mesh(
        new THREE.CylinderGeometry(0.5, 0.5, 15, 6),
        grassMat
      );
      stem.position.set(fx, bedH + 6, fz);
      outGroup.add(stem);
      // Flower head
      const flower = new THREE.Mesh(
        new THREE.SphereGeometry(2, 8, 8),
        new THREE.MeshStandardMaterial({ color: flowerColors[i % flowerColors.length], roughness: 0.5 })
      );
      flower.position.set(fx, bedH + 14, fz);
      outGroup.add(flower);
    }
  } else if (type === 'gazebo') {
    // Gazebo: octagonal roof on posts
    const postH = 240;
    // Posts (6-8 around perimeter)
    const sides = 6;
    const r = Math.min(w, d) / 2;
    for (let i = 0; i < sides; i++) {
      const a = (i / sides) * Math.PI * 2;
      const post = new THREE.Mesh(
        new THREE.BoxGeometry(8, postH, 8),
        woodMat
      );
      post.position.set(Math.cos(a) * r, postH / 2, Math.sin(a) * r);
      post.castShadow = true;
      outGroup.add(post);
    }
    // Roof (pyramid)
    const roof = new THREE.Mesh(
      new THREE.ConeGeometry(r * 1.3, 60, sides),
      new THREE.MeshStandardMaterial({ color: 0x8B4513, roughness: 0.7 })
    );
    roof.position.y = postH + 30;
    roof.castShadow = true;
    outGroup.add(roof);
    // Floor
    const floor = new THREE.Mesh(
      new THREE.CylinderGeometry(r * 1.1, r * 1.1, 4, sides),
      woodMat
    );
    floor.position.y = 2;
    floor.receiveShadow = true;
    outGroup.add(floor);
    // Railings between posts
    const railMat = woodMat;
    for (let i = 0; i < sides; i++) {
      const a1 = (i / sides) * Math.PI * 2;
      const a2 = ((i + 1) / sides) * Math.PI * 2;
      const x1 = Math.cos(a1) * r;
      const z1 = Math.sin(a1) * r;
      const x2 = Math.cos(a2) * r;
      const z2 = Math.sin(a2) * r;
      const midX = (x1 + x2) / 2;
      const midZ = (z1 + z2) / 2;
      const railLen = Math.sqrt((x2 - x1) ** 2 + (z2 - z1) ** 2);
      const rail = new THREE.Mesh(
        new THREE.BoxGeometry(railLen, 4, 2),
        railMat
      );
      rail.position.set(midX, postH * 0.4, midZ);
      rail.rotation.y = Math.atan2(z2 - z1, x2 - x1);
      outGroup.add(rail);
    }
  } else if (type === 'pergola') {
    // Pergola: slatted roof on posts
    const postH = 240;
    // Posts (4 corners)
    const postPositions = [
      [-w / 2, -d / 2], [w / 2, -d / 2],
      [-w / 2, d / 2], [w / 2, d / 2],
    ];
    for (const [px, pz] of postPositions) {
      const post = new THREE.Mesh(
        new THREE.BoxGeometry(8, postH, 8),
        woodMat
      );
      post.position.set(px, postH / 2, pz);
      post.castShadow = true;
      outGroup.add(post);
    }
    // Beams (along width)
    for (let i = -1; i <= 1; i += 2) {
      const beam = new THREE.Mesh(
        new THREE.BoxGeometry(w + 10, 6, 6),
        woodMat
      );
      beam.position.set(0, postH, i * d / 2);
      beam.castShadow = true;
      outGroup.add(beam);
    }
    // Rafters (along depth, perpendicular to beams)
    const rafterSpacing = 25;
    const numRafters = Math.floor(w / rafterSpacing);
    for (let i = 0; i <= numRafters; i++) {
      const x = -w / 2 + (w / numRafters) * i;
      const rafter = new THREE.Mesh(
        new THREE.BoxGeometry(5, 4, d + 10),
        woodMat
      );
      rafter.position.set(x, postH + 5, 0);
      rafter.castShadow = true;
      outGroup.add(rafter);
    }
    // Slats (thin top pieces)
    const slatSpacing = 12;
    const numSlats = Math.floor(d / slatSpacing);
    for (let i = 0; i <= numSlats; i++) {
      const z = -d / 2 + (d / numSlats) * i;
      const slat = new THREE.Mesh(
        new THREE.BoxGeometry(w + 10, 1.5, 3),
        woodMat
      );
      slat.position.set(0, postH + 9, z);
      outGroup.add(slat);
    }
  } else if (type === 'lamp-post') {
    // Lamp post: tall pole with light on top
    const postH = 280;
    // Base
    const base = new THREE.Mesh(
      new THREE.CylinderGeometry(8, 10, 10, 16),
      darkMat
    );
    base.position.y = 5;
    outGroup.add(base);
    // Pole
    const pole = new THREE.Mesh(
      new THREE.CylinderGeometry(3, 4, postH, 12),
      metalMat
    );
    pole.position.y = postH / 2 + 5;
    pole.castShadow = true;
    outGroup.add(pole);
    // Lamp head
    const lampHead = new THREE.Mesh(
      new THREE.SphereGeometry(10, 16, 12),
      new THREE.MeshStandardMaterial({ color: 0xFFEB99, emissive: 0xFFEB99, emissiveIntensity: 0.8 })
    );
    lampHead.position.y = postH + 10;
    outGroup.add(lampHead);
    // Lamp cage
    const cage = new THREE.Mesh(
      new THREE.ConeGeometry(12, 15, 8, 1, true),
      darkMat
    );
    cage.position.y = postH + 5;
    outGroup.add(cage);
    // Top finial
    const finial = new THREE.Mesh(
      new THREE.SphereGeometry(2, 8, 8),
      metalMat
    );
    finial.position.y = postH + 22;
    outGroup.add(finial);
    // Actual light
    const pt = new THREE.PointLight(0xFFEB99, 0.8, 400);
    pt.position.y = postH + 10;
    outGroup.add(pt);
  } else if (type === 'garden-bench') {
    // Garden bench: seat + back + legs
    const benchH = 90;
    // Seat
    const seat = new THREE.Mesh(
      new THREE.BoxGeometry(w, 6, d),
      woodMat
    );
    seat.position.y = 40;
    seat.castShadow = true;
    outGroup.add(seat);
    // Back slats
    const numSlats = Math.floor(w / 8);
    for (let i = 0; i < numSlats; i++) {
      const x = -w / 2 + 4 + (w - 8) * (i / Math.max(1, numSlats - 1));
      const slat = new THREE.Mesh(
        new THREE.BoxGeometry(3, 50, 2),
        woodMat
      );
      slat.position.set(x, 65, -d / 2 + 1);
      outGroup.add(slat);
    }
    // Back top rail
    const rail = new THREE.Mesh(
      new THREE.BoxGeometry(w, 4, 3),
      woodMat
    );
    rail.position.set(0, 90, -d / 2 + 1.5);
    outGroup.add(rail);
    // Legs
    const legW = 5;
    const legPositions = [
      [-w / 2 + legW, -d / 2 + legW], [w / 2 - legW, -d / 2 + legW],
      [-w / 2 + legW, d / 2 - legW], [w / 2 - legW, d / 2 - legW],
    ];
    for (const [lx, lz] of legPositions) {
      const leg = new THREE.Mesh(
        new THREE.BoxGeometry(legW, 40, legW),
        woodMat
      );
      leg.position.set(lx, 20, lz);
      leg.castShadow = true;
      outGroup.add(leg);
    }
    // Arm rests
    for (let i = 0; i < 2; i++) {
      const x = (i === 0 ? -1 : 1) * (w / 2 - 4);
      const arm = new THREE.Mesh(
        new THREE.BoxGeometry(6, 3, d),
        woodMat
      );
      arm.position.set(x, 60, 0);
      outGroup.add(arm);
      // Arm support
      const sup = new THREE.Mesh(
        new THREE.BoxGeometry(3, 25, 3),
        woodMat
      );
      sup.position.set(x, 35, -d / 2 + 2);
      outGroup.add(sup);
    }
  } else if (type === 'fountain') {
    // Fountain: tiered basins
    // Base basin
    const baseR = Math.min(w, d) / 2;
    const baseBasin = new THREE.Mesh(
      new THREE.CylinderGeometry(baseR, baseR * 1.1, 15, 24),
      new THREE.MeshStandardMaterial({ color: 0x9CA3AF, roughness: 0.4 })
    );
    baseBasin.position.y = 7.5;
    baseBasin.castShadow = true;
    outGroup.add(baseBasin);
    // Water in base
    const water1 = new THREE.Mesh(
      new THREE.CylinderGeometry(baseR - 2, baseR - 2, 2, 24),
      waterMat
    );
    water1.position.y = 14;
    outGroup.add(water1);
    // Center column
    const column = new THREE.Mesh(
      new THREE.CylinderGeometry(3, 4, 30, 12),
      new THREE.MeshStandardMaterial({ color: 0x6B7280, roughness: 0.5 })
    );
    column.position.y = 30;
    outGroup.add(column);
    // Second tier
    const tier2 = new THREE.Mesh(
      new THREE.CylinderGeometry(baseR * 0.6, baseR * 0.7, 8, 16),
      new THREE.MeshStandardMaterial({ color: 0x9CA3AF, roughness: 0.4 })
    );
    tier2.position.y = 49;
    outGroup.add(tier2);
    // Water in tier 2
    const water2 = new THREE.Mesh(
      new THREE.CylinderGeometry(baseR * 0.55, baseR * 0.55, 1.5, 16),
      waterMat
    );
    water2.position.y = 53.5;
    outGroup.add(water2);
    // Top tier (small bowl)
    const tier3 = new THREE.Mesh(
      new THREE.CylinderGeometry(baseR * 0.25, baseR * 0.3, 6, 12),
      new THREE.MeshStandardMaterial({ color: 0x9CA3AF, roughness: 0.4 })
    );
    tier3.position.y = 58;
    outGroup.add(tier3);
    // Water spray (vertical stream)
    const spray = new THREE.Mesh(
      new THREE.CylinderGeometry(0.5, 1, 20, 8),
      new THREE.MeshPhysicalMaterial({ color: 0xFFFFFF, roughness: 0.05, transmission: 0.9, transparent: true, opacity: 0.6 })
    );
    spray.position.y = 70;
    outGroup.add(spray);
    // Splash particles
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2;
      const drop = new THREE.Mesh(
        new THREE.SphereGeometry(0.8, 6, 6),
        waterMat
      );
      drop.position.set(Math.cos(a) * 3, 80, Math.sin(a) * 3);
      outGroup.add(drop);
    }
  } else if (type === 'mailbox') {
    // Mailbox: post with box on top
    const postH = 100;
    // Post
    const post = new THREE.Mesh(
      new THREE.BoxGeometry(5, postH, 5),
      woodMat
    );
    post.position.y = postH / 2;
    post.castShadow = true;
    outGroup.add(post);
    // Mailbox body
    const box = new THREE.Mesh(
      new THREE.BoxGeometry(30, 20, 20),
      new THREE.MeshStandardMaterial({ color: 0x1F2937, roughness: 0.5, metalness: 0.4 })
    );
    box.position.set(15, postH + 10, 0);
    box.castShadow = true;
    outGroup.add(box);
    // Curved top
    const curve = new THREE.Mesh(
      new THREE.CylinderGeometry(10, 10, 30, 16, 1, false, 0, Math.PI),
      new THREE.MeshStandardMaterial({ color: 0x1F2937, roughness: 0.5, metalness: 0.4 })
    );
    curve.rotation.z = Math.PI / 2;
    curve.position.set(15, postH + 20, 0);
    outGroup.add(curve);
    // Mail slot
    const slot = new THREE.Mesh(
      new THREE.BoxGeometry(8, 1, 0.5),
      darkMat
    );
    slot.position.set(15, postH + 15, 10.2);
    outGroup.add(slot);
    // Red flag
    const flag = new THREE.Mesh(
      new THREE.BoxGeometry(1, 12, 8),
      new THREE.MeshStandardMaterial({ color: 0xEF4444, roughness: 0.4 })
    );
    flag.position.set(30, postH + 12, 0);
    outGroup.add(flag);
    // Flag pole
    const flagPole = new THREE.Mesh(
      new THREE.CylinderGeometry(0.5, 0.5, 20, 6),
      metalMat
    );
    flagPole.position.set(30, postH + 5, 0);
    outGroup.add(flagPole);
  } else {
    // Default outdoor extra
    const body = new THREE.Mesh(
      new THREE.BoxGeometry(w, height, d),
      woodMat
    );
    body.position.y = height / 2;
    body.castShadow = true;
    outGroup.add(body);
  }

  group.add(outGroup);
}

// ============= 3D MEP BUILDER (Pipa & Kabel) =============
function build3DMEP(group, item, bldgX, bldgZ, currentY, building, def) {
  const mepGroup = new THREE.Group();
  mepGroup.position.set(
    item.x,
    currentY + 5,
    item.y
  );
  mepGroup.rotation.y = -item.rotation;

  const w = item.w;
  const h = item.h;
  const height = Math.max(def.height3d || 4, 3);
  const color = normalizeHex(item.color || '#3B82F6');
  const type = item.type;

  // Material selection by type
  let mainMat;
  if (type.includes('copper') || type === 'busbar-copper-100a') {
    mainMat = new THREE.MeshStandardMaterial({ color: 0xB87333, roughness: 0.2, metalness: 0.9 });
  } else if (type.includes('galvanized') || type.includes('steel') || type.includes('cast-iron') || type.includes('imc') || type.includes('emt')) {
    mainMat = new THREE.MeshStandardMaterial({ color, roughness: 0.4, metalness: 0.7 });
  } else if (type.includes('hdpe') || type.includes('abs')) {
    mainMat = new THREE.MeshStandardMaterial({ color, roughness: 0.6, metalness: 0.1 });
  } else if (type.startsWith('cable-')) {
    // Cables: PVC sheath
    mainMat = new THREE.MeshStandardMaterial({ color, roughness: 0.7, metalness: 0.1 });
  } else {
    // PVC pipes default
    mainMat = new THREE.MeshStandardMaterial({ color, roughness: 0.3, metalness: 0.2 });
  }

  if (type.startsWith('pipe-') || type.startsWith('conduit-')) {
    // Pipe/Conduit: horizontal cylinder along X axis
    const radius = Math.max(h / 2, 1.5);
    const pipe = new THREE.Mesh(
      new THREE.CylinderGeometry(radius, radius, w, 16),
      mainMat
    );
    pipe.rotation.z = Math.PI / 2;
    pipe.position.y = height / 2;
    pipe.castShadow = true;
    mepGroup.add(pipe);

    // End caps (torus or disc)
    const capMat = new THREE.MeshStandardMaterial({ color: 0x1F2937, roughness: 0.6 });
    [(-w / 2), (w / 2)].forEach(x => {
      const cap = new THREE.Mesh(
        new THREE.CircleGeometry(radius - 0.5, 16),
        capMat
      );
      cap.position.set(x, height / 2, 0);
      cap.rotation.y = Math.PI / 2;
      mepGroup.add(cap);
    });

    // Insulation for AC/hot pipes
    if (type.includes('ac') || type.includes('hot')) {
      const insMat = new THREE.MeshStandardMaterial({
        color: 0xE5E5E5,
        roughness: 0.9,
        metalness: 0.0,
        transparent: true,
        opacity: 0.7,
      });
      const insulation = new THREE.Mesh(
        new THREE.CylinderGeometry(radius + 1, radius + 1, w, 16, 1, true),
        insMat
      );
      insulation.rotation.z = Math.PI / 2;
      insulation.position.y = height / 2;
      mepGroup.add(insulation);
    }

    // Pipe supports (clamps every 50cm)
    if (w > 50) {
      const clampMat = new THREE.MeshStandardMaterial({ color: 0x374151, roughness: 0.5, metalness: 0.6 });
      const numClamps = Math.floor(w / 50);
      for (let i = 0; i <= numClamps; i++) {
        const x = -w / 2 + (w / numClamps) * i;
        const clamp = new THREE.Mesh(
          new THREE.TorusGeometry(radius + 0.5, 0.5, 6, 12),
          clampMat
        );
        clamp.position.set(x, height / 2, 0);
        clamp.rotation.y = Math.PI / 2;
        mepGroup.add(clamp);
        // Drop to floor
        const drop = new THREE.Mesh(
          new THREE.BoxGeometry(0.5, height / 2, 0.5),
          clampMat
        );
        drop.position.set(x, height / 4, 0);
        mepGroup.add(drop);
      }
    }
  } else if (type.startsWith('cable-')) {
    // Cable: thin cylinder with sheath
    const radius = Math.max(h / 2, 1);
    const cable = new THREE.Mesh(
      new THREE.CylinderGeometry(radius, radius, w, 12),
      mainMat
    );
    cable.rotation.z = Math.PI / 2;
    cable.position.y = height / 2;
    cable.castShadow = true;
    mepGroup.add(cable);

    // Inner conductor (copper) at ends (showing cross-section)
    if (type.includes('nym') || type.includes('nyy') || type.includes('njp')) {
      const conductorMat = new THREE.MeshStandardMaterial({ color: 0xB87333, roughness: 0.3, metalness: 0.9 });
      const numCores = type.includes('3x') ? 3 : type.includes('4x') ? 4 : 2;
      [(-w / 2), (w / 2)].forEach(x => {
        for (let i = 0; i < numCores; i++) {
          const angle = (i / numCores) * Math.PI * 2;
          const core = new THREE.Mesh(
            new THREE.CircleGeometry(0.5, 8),
            conductorMat
          );
          core.position.set(x, height / 2 + Math.cos(angle) * (radius * 0.5), Math.sin(angle) * (radius * 0.5));
          core.rotation.y = Math.PI / 2;
          mepGroup.add(core);
        }
      });
    }

    // Data cable: colored pairs visible
    if (type.includes('utp') || type.includes('cat')) {
      const pairColors = [0xDC2626, 0x22C55E, 0xFBBF24, 0x3B82F6];
      [(-w / 2), (w / 2)].forEach(x => {
        pairColors.forEach((c, i) => {
          const angle = (i / 4) * Math.PI * 2;
          const pair = new THREE.Mesh(
            new THREE.CircleGeometry(0.4, 6),
            new THREE.MeshStandardMaterial({ color: c, roughness: 0.5 })
          );
          pair.position.set(x, height / 2 + Math.cos(angle) * (radius * 0.6), Math.sin(angle) * (radius * 0.6));
          pair.rotation.y = Math.PI / 2;
          mepGroup.add(pair);
        });
      });
    }
  } else if (type.startsWith('cable-tray-')) {
    // Cable tray: open U-shape with multiple cables inside
    const trayMat = new THREE.MeshStandardMaterial({ color, roughness: 0.5, metalness: 0.7 });
    // Bottom of tray
    const bottom = new THREE.Mesh(
      new THREE.BoxGeometry(w, 1, h - 4),
      trayMat
    );
    bottom.position.y = height / 2;
    mepGroup.add(bottom);
    // Side rails
    [-1, 1].forEach(side => {
      const rail = new THREE.Mesh(
        new THREE.BoxGeometry(w, 4, 1),
        trayMat
      );
      rail.position.set(0, height / 2 + 1.5, side * (h / 2 - 2));
      mepGroup.add(rail);
    });
    // Cables inside (multiple colored cylinders)
    const cableColors = [0xDC2626, 0x3B82F6, 0x22C55E, 0xFBBF24, 0xA855F7];
    const numCables = Math.min(6, Math.floor((h - 6) / 3));
    for (let i = 0; i < numCables; i++) {
      const cableMat = new THREE.MeshStandardMaterial({ color: cableColors[i % 5], roughness: 0.6 });
      const cable = new THREE.Mesh(
        new THREE.CylinderGeometry(1.2, 1.2, w - 2, 8),
        cableMat
      );
      cable.rotation.z = Math.PI / 2;
      const zPos = -h / 2 + 4 + ((h - 8) / numCables) * (i + 0.5);
      cable.position.set(0, height / 2 + 1, zPos);
      mepGroup.add(cable);
    }
  } else if (type === 'grounding-rod-5-8') {
    // Grounding rod: vertical copper rod
    const rodMat = new THREE.MeshStandardMaterial({ color: 0xB87333, roughness: 0.2, metalness: 0.9 });
    const rod = new THREE.Mesh(
      new THREE.CylinderGeometry(h / 4, h / 4, height, 12),
      rodMat
    );
    rod.position.y = height / 2;
    rod.castShadow = true;
    mepGroup.add(rod);
    // Clamp at top
    const clamp = new THREE.Mesh(
      new THREE.BoxGeometry(w, 4, h),
      new THREE.MeshStandardMaterial({ color: 0x9CA3AF, roughness: 0.4, metalness: 0.7 })
    );
    clamp.position.y = height + 2;
    mepGroup.add(clamp);
    // Ground wire
    const wire = new THREE.Mesh(
      new THREE.CylinderGeometry(0.5, 0.5, 30, 6),
      new THREE.MeshStandardMaterial({ color: 0xFCD34D, roughness: 0.6 })
    );
    wire.position.y = height + 17;
    mepGroup.add(wire);
  } else if (type === 'busbar-copper-100a') {
    // Busbar: flat copper bar with bolt holes
    const bar = new THREE.Mesh(
      new THREE.BoxGeometry(w, 2, h),
      mainMat
    );
    bar.position.y = height / 2;
    bar.castShadow = true;
    mepGroup.add(bar);
    // Bolts (4 connection points)
    const boltMat = new THREE.MeshStandardMaterial({ color: 0x1F2937, roughness: 0.4, metalness: 0.8 });
    for (let i = 0; i < 4; i++) {
      const x = -w / 2 + (w / 4) * (i + 0.5);
      const bolt = new THREE.Mesh(
        new THREE.CylinderGeometry(1, 1, 4, 8),
        boltMat
      );
      bolt.position.set(x, height / 2 + 2, 0);
      mepGroup.add(bolt);
    }
  } else if (type === 'cabel-fiber-optic') {
    // Fiber optic: thin with bright core
    const sheath = new THREE.Mesh(
      new THREE.CylinderGeometry(h / 2, h / 2, w, 12),
      mainMat
    );
    sheath.rotation.z = Math.PI / 2;
    sheath.position.y = height / 2;
    mepGroup.add(sheath);
    // Bright glass core
    const core = new THREE.Mesh(
      new THREE.CylinderGeometry(0.5, 0.5, w, 8),
      new THREE.MeshStandardMaterial({ color: 0xFFFFFF, emissive: 0xFBBF24, emissiveIntensity: 0.6 })
    );
    core.rotation.z = Math.PI / 2;
    core.position.y = height / 2;
    mepGroup.add(core);
    // Light pulses
    for (let i = 0; i < 4; i++) {
      const pulse = new THREE.Mesh(
        new THREE.SphereGeometry(0.8, 8, 8),
        new THREE.MeshStandardMaterial({ color: 0xFBBF24, emissive: 0xFBBF24, emissiveIntensity: 1 })
      );
      pulse.position.set(-w / 2 + (w / 4) * (i + 0.5), height / 2, 0);
      mepGroup.add(pulse);
    }
  }

  group.add(mepGroup);
}

// ============= 3D WEATHER PROTECTION BUILDER (Tudung/Kanopi/Drip Course) =============
function build3DWeather(group, item, bldgX, bldgZ, currentY, building, def) {
  const wGroup = new THREE.Group();
  wGroup.position.set(
    item.x,
    currentY + 5,
    item.y
  );
  wGroup.rotation.y = -item.rotation;

  const w = item.w;
  const h = item.h;
  const height = Math.max(def.height3d || 20, 5);
  const color = normalizeHex(item.color || '#78716C');
  const type = item.type;

  // Material selection
  let mainMat;
  if (type.includes('wood')) {
    mainMat = new THREE.MeshStandardMaterial({ color, roughness: 0.7, metalness: 0.1 });
  } else if (type.includes('concrete')) {
    mainMat = new THREE.MeshStandardMaterial({ color, roughness: 0.85, metalness: 0.0 });
  } else if (type.includes('aluminum') || type.includes('metal') || type.includes('steel') || type.includes('stainless')) {
    mainMat = new THREE.MeshStandardMaterial({ color, roughness: 0.3, metalness: 0.7 });
  } else if (type.includes('polycarbonate') || type.includes('glass')) {
    mainMat = new THREE.MeshPhysicalMaterial({
      color, roughness: 0.1, metalness: 0.0,
      transparent: true, opacity: 0.5, transmission: 0.6,
    });
  } else if (type.includes('fabric')) {
    mainMat = new THREE.MeshStandardMaterial({ color, roughness: 0.95, metalness: 0.0 });
  } else {
    mainMat = new THREE.MeshStandardMaterial({ color, roughness: 0.6, metalness: 0.2 });
  }

  if (type.startsWith('hood-vent-')) {
    // Tudung ventilasi: sloped plate with drip edge
    const slopeAngle = Math.PI * 0.15; // ~27°
    const plate = new THREE.Mesh(
      new THREE.BoxGeometry(w, 2, h),
      mainMat
    );
    plate.position.y = height / 2;
    plate.rotation.x = -slopeAngle;
    plate.castShadow = true;
    wGroup.add(plate);
    // Drip edge (bottom overhang)
    const dripMat = new THREE.MeshStandardMaterial({ color: 0x1F2937, roughness: 0.6 });
    const drip = new THREE.Mesh(
      new THREE.BoxGeometry(w + 2, 1, 2),
      dripMat
    );
    drip.position.set(0, height / 2 - h / 2 + 1, h / 2);
    wGroup.add(drip);
    // Side walls (enclosure) for vent cap
    if (type === 'hood-vent-round') {
      // Round pipe cap
      const cap = new THREE.Mesh(
        new THREE.CylinderGeometry(h / 3, h / 3, 4, 12),
        mainMat
      );
      cap.position.y = height / 2 + 2;
      cap.rotation.z = slopeAngle;
      wGroup.add(cap);
    }
  } else if (type.startsWith('hood-window-') || type.startsWith('hood-door-')) {
    // Tudung jendela/pintu: sloped wide plate with drip edge + brackets
    const slopeAngle = Math.PI * 0.12; // ~22°
    const plate = new THREE.Mesh(
      new THREE.BoxGeometry(w, 3, h),
      mainMat
    );
    plate.position.y = height / 2;
    plate.rotation.x = -slopeAngle;
    plate.castShadow = true;
    plate.receiveShadow = true;
    wGroup.add(plate);
    // Drip edge (front overhang with groove)
    const dripMat = new THREE.MeshStandardMaterial({ color: 0x1F2937, roughness: 0.6 });
    const drip = new THREE.Mesh(
      new THREE.BoxGeometry(w + 4, 3, 3),
      dripMat
    );
    drip.position.set(0, height / 2 - h / 2 + 1, h / 2 - 1);
    wGroup.add(drip);
    // Support brackets (diagonal, every 50cm)
    if (w > 100) {
      const bracketMat = new THREE.MeshStandardMaterial({ color: 0x374151, roughness: 0.5, metalness: 0.6 });
      const numBrackets = Math.max(2, Math.floor(w / 50));
      for (let i = 0; i <= numBrackets; i++) {
        const x = -w / 2 + (w / numBrackets) * i;
        const bracket = new THREE.Mesh(
          new THREE.BoxGeometry(2, 15, 2),
          bracketMat
        );
        bracket.position.set(x, height / 2 - 8, h / 4);
        bracket.rotation.x = slopeAngle;
        wGroup.add(bracket);
      }
    }
    // Fabric awning: rolled edge
    if (type.includes('fabric')) {
      const roll = new THREE.Mesh(
        new THREE.CylinderGeometry(2, 2, w, 12),
        new THREE.MeshStandardMaterial({ color: 0x5D3A1A, roughness: 0.7 })
      );
      roll.rotation.z = Math.PI / 2;
      roll.position.set(0, height / 2, h / 2);
      wGroup.add(roll);
    }
  } else if (type.startsWith('canopy-')) {
    // Kanopi pintu: large structure with roof + supports
    let roof;
    if (type === 'canopy-door-curved' || type === 'canopy-door-dome') {
      // Curved/dome roof (half cylinder)
      roof = new THREE.Mesh(
        new THREE.CylinderGeometry(h / 2, h / 2, w, 16, 1, false, 0, Math.PI),
        mainMat
      );
      roof.rotation.z = Math.PI / 2;
      roof.rotation.y = Math.PI / 2;
      roof.position.y = height / 2 + h / 4;
    } else if (type === 'canopy-door-gable') {
      // Gable (pelana) roof - triangular prism
      const gableShape = new THREE.Shape();
      gableShape.moveTo(-h / 2, 0);
      gableShape.lineTo(h / 2, 0);
      gableShape.lineTo(0, h / 2);
      gableShape.closePath();
      const gableGeo = new THREE.ExtrudeGeometry(gableShape, { depth: w, bevelEnabled: false });
      roof = new THREE.Mesh(gableGeo, mainMat);
      roof.rotation.y = Math.PI / 2;
      roof.position.set(0, height / 2, -w / 2);
    } else if (type === 'canopy-door-flat') {
      // Flat roof
      roof = new THREE.Mesh(
        new THREE.BoxGeometry(w, 3, h),
        mainMat
      );
      roof.position.y = height / 2;
    } else {
      // Sloped roof (default)
      roof = new THREE.Mesh(
        new THREE.BoxGeometry(w, 3, h),
        mainMat
      );
      roof.position.y = height / 2;
      roof.rotation.x = -Math.PI * 0.1;
    }
    roof.castShadow = true;
    wGroup.add(roof);

    // Support posts (4 corners or 2 diagonal brackets)
    const postMat = new THREE.MeshStandardMaterial({ color: 0x374151, roughness: 0.5, metalness: 0.6 });
    if (type === 'canopy-door-flat' || type === 'canopy-door-gable' || type === 'canopy-door-dome') {
      // 4 corner posts
      [-1, 1].forEach(sx => {
        [-1, 1].forEach(sz => {
          const post = new THREE.Mesh(
            new THREE.CylinderGeometry(2, 2, height, 8),
            postMat
          );
          post.position.set(sx * (w / 2 - 5), height / 2, sz * (h / 2 - 5));
          wGroup.add(post);
        });
      });
    } else {
      // 2 diagonal brackets
      [-1, 1].forEach(side => {
        const bracket = new THREE.Mesh(
          new THREE.BoxGeometry(3, 25, 3),
          postMat
        );
        bracket.position.set(side * (w / 2 - 10), height / 2 - 12, h / 4);
        bracket.rotation.z = side * Math.PI * 0.15;
        wGroup.add(bracket);
      });
    }
    // Drip edge at bottom of roof
    const dripMat = new THREE.MeshStandardMaterial({ color: 0x1F2937, roughness: 0.6 });
    const drip = new THREE.Mesh(
      new THREE.BoxGeometry(w, 2, 2),
      dripMat
    );
    drip.position.set(0, height / 2 - h / 4, h / 2 - 2);
    wGroup.add(drip);
  } else if (type.startsWith('drip-course')) {
    // Drip course: thin horizontal with V-grooves
    const base = new THREE.Mesh(
      new THREE.BoxGeometry(w, height, h),
      mainMat
    );
    base.position.y = height / 2;
    base.castShadow = true;
    wGroup.add(base);
    // Drip grooves (V-shape) along the bottom
    const grooveMat = new THREE.MeshStandardMaterial({ color: 0x1F2937, roughness: 0.6 });
    const numGrooves = Math.max(3, Math.floor(w / 15));
    for (let i = 0; i < numGrooves; i++) {
      const x = -w / 2 + (w / numGrooves) * (i + 0.5);
      const groove = new THREE.Mesh(
        new THREE.CylinderGeometry(0.5, 0.8, 2, 6),
        grooveMat
      );
      groove.rotation.x = Math.PI / 2;
      groove.position.set(x, 1, h / 2 - 1);
      wGroup.add(groove);
    }
    // Top slope (water runoff)
    const slope = new THREE.Mesh(
      new THREE.BoxGeometry(w, 1, h / 2),
      mainMat
    );
    slope.position.y = height;
    slope.rotation.x = -Math.PI * 0.05;
    wGroup.add(slope);
  } else if (type.startsWith('weather-shed')) {
    // Weather shed: wide sloped with drip edge
    const slopeAngle = Math.PI * 0.15;
    const shed = new THREE.Mesh(
      new THREE.BoxGeometry(w, 4, h),
      mainMat
    );
    shed.position.y = height / 2;
    shed.rotation.x = -slopeAngle;
    shed.castShadow = true;
    shed.receiveShadow = true;
    wGroup.add(shed);
    // Drip edge (front overhang)
    const dripMat = new THREE.MeshStandardMaterial({ color: 0x1F2937, roughness: 0.6 });
    const drip = new THREE.Mesh(
      new THREE.BoxGeometry(w + 6, 4, 4),
      dripMat
    );
    drip.position.set(0, height / 2 - h / 2 + 2, h / 2);
    wGroup.add(drip);
    // Tile pattern (if tile)
    if (type.includes('tile')) {
      const tileMat = new THREE.MeshStandardMaterial({ color: 0x9C5A2F, roughness: 0.7 });
      for (let i = 0; i < 6; i++) {
        const z = -h / 2 + (h / 6) * i;
        const tile = new THREE.Mesh(
          new THREE.BoxGeometry(w, 1, 4),
          tileMat
        );
        tile.position.set(0, height / 2 + 2, z);
        tile.rotation.x = -slopeAngle;
        wGroup.add(tile);
      }
    }
  } else if (type.startsWith('coping-')) {
    // Coping: top cap for parapet wall (sloped both sides)
    const coping = new THREE.Mesh(
      new THREE.BoxGeometry(w, height, h),
      mainMat
    );
    coping.position.y = height / 2;
    coping.castShadow = true;
    wGroup.add(coping);
    // Sloped top (water runoff - triangular prism)
    const slopeShape = new THREE.Shape();
    slopeShape.moveTo(-h / 2, 0);
    slopeShape.lineTo(h / 2, 0);
    slopeShape.lineTo(0, 3);
    slopeShape.closePath();
    const slopeGeo = new THREE.ExtrudeGeometry(slopeShape, { depth: w, bevelEnabled: false });
    const slope = new THREE.Mesh(slopeGeo, mainMat);
    slope.rotation.y = Math.PI / 2;
    slope.position.set(0, height, -w / 2);
    wGroup.add(slope);
    // Drip edges (both sides - small grooves)
    const dripMat = new THREE.MeshStandardMaterial({ color: 0x1F2937, roughness: 0.6 });
    [-1, 1].forEach(side => {
      const drip = new THREE.Mesh(
        new THREE.CylinderGeometry(0.5, 0.5, w, 6),
        dripMat
      );
      drip.rotation.z = Math.PI / 2;
      drip.position.set(0, 1, side * (h / 2 - 0.5));
      wGroup.add(drip);
    });
  } else if (type === 'hood-opening-generic' || type === 'hood-opening-large') {
    // Generic tudung bukaan
    const slopeAngle = Math.PI * 0.12;
    const hood = new THREE.Mesh(
      new THREE.BoxGeometry(w, 3, h),
      mainMat
    );
    hood.position.y = height / 2;
    hood.rotation.x = -slopeAngle;
    hood.castShadow = true;
    wGroup.add(hood);
    // Drip edge
    const dripMat = new THREE.MeshStandardMaterial({ color: 0x1F2937, roughness: 0.6 });
    const drip = new THREE.Mesh(
      new THREE.BoxGeometry(w + 2, 2, 2),
      dripMat
    );
    drip.position.set(0, height / 2 - h / 2 + 1, h / 2);
    wGroup.add(drip);
  }

  group.add(wGroup);
}
