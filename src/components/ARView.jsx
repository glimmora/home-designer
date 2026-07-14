import React, { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';
import { useStore } from '../lib/store';
import { getItemDef } from '../lib/itemDefinitions';
import { X, Camera, Maximize, RotateCw, Move3D, AlertTriangle } from 'lucide-react';

export default function ARView() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const rendererRef = useRef(null);
  const animationRef = useRef(null);
  const [cameraError, setCameraError] = useState(null);
  const [arReady, setArReady] = useState(false);

  const { floors, plot, building, isARMode, setARMode } = useStore();

  // ===== Start camera =====
  useEffect(() => {
    if (!isARMode) return;

    let stream = null;
    async function startCamera() {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: 'environment', // back camera on mobile
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
          audio: false,
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
          setArReady(true);
        }
      } catch (e) {
        console.error('Camera error:', e);
        setCameraError(e.message || 'Tidak bisa akses kamera');
      }
    }
    startCamera();

    return () => {
      if (stream) {
        stream.getTracks().forEach((t) => t.stop());
      }
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      if (rendererRef.current) {
        rendererRef.current.dispose();
        rendererRef.current = null;
      }
      setArReady(false);
    };
  }, [isARMode]);

  // ===== Setup Three.js overlay =====
  useEffect(() => {
    if (!arReady || !containerRef.current) return;

    const container = containerRef.current;
    const w = container.clientWidth;
    const h = container.clientHeight;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(60, w / h, 0.1, 30000);
    camera.position.set(1500, 1000, 1500);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({
      canvas: canvasRef.current,
      alpha: true,
      antialias: true,
    });
    renderer.setSize(w, h);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;

    // Lights
    scene.add(new THREE.AmbientLight(0xffffff, 0.7));
    const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
    dirLight.position.set(1500, 2500, 1000);
    scene.add(dirLight);

    sceneRef.current = scene;
    cameraRef.current = camera;
    rendererRef.current = renderer;

    // Build simplified 3D model
    buildModel(scene);

    // Camera orbit state
    const orbit = {
      theta: Math.PI / 4,
      phi: Math.PI / 3,
      distance: 2000,
    };

    let isDragging = false;
    let lastMouse = { x: 0, y: 0 };

    const updateCamera = () => {
      const x = orbit.distance * Math.sin(orbit.phi) * Math.cos(orbit.theta);
      const y = orbit.distance * Math.cos(orbit.phi);
      const z = orbit.distance * Math.sin(orbit.phi) * Math.sin(orbit.theta);
      camera.position.set(x, y, z);
      camera.lookAt(0, 100, 0);
    };
    updateCamera();

    const onDown = (e) => {
      isDragging = true;
      lastMouse = { x: e.clientX, y: e.clientY };
    };
    const onMove = (e) => {
      if (!isDragging) return;
      const dx = e.clientX - lastMouse.x;
      const dy = e.clientY - lastMouse.y;
      orbit.theta -= dx * 0.005;
      orbit.phi = Math.max(0.1, Math.min(Math.PI / 2 - 0.05, orbit.phi - dy * 0.005));
      lastMouse = { x: e.clientX, y: e.clientY };
      updateCamera();
    };
    const onUp = () => {
      isDragging = false;
    };
    const onWheel = (e) => {
      e.preventDefault();
      orbit.distance = Math.max(500, Math.min(8000, orbit.distance + e.deltaY * 3));
      updateCamera();
    };

    container.addEventListener('mousedown', onDown);
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    container.addEventListener('wheel', onWheel, { passive: false });

    // Resize
    const onResize = () => {
      if (!containerRef.current) return;
      const nw = containerRef.current.clientWidth;
      const nh = containerRef.current.clientHeight;
      camera.aspect = nw / nh;
      camera.updateProjectionMatrix();
      renderer.setSize(nw, nh);
    };
    window.addEventListener('resize', onResize);

    // Animation
    const animate = () => {
      animationRef.current = requestAnimationFrame(animate);
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      container.removeEventListener('mousedown', onDown);
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
      container.removeEventListener('wheel', onWheel);
      window.removeEventListener('resize', onResize);
      renderer.dispose();
    };
  }, [arReady, floors, plot, building]);

  function buildModel(scene) {
    // Clear existing
    while (scene.children.length > 0) {
      const obj = scene.children[0];
      if (obj.isLight) {
        scene.children.shift();
        continue;
      }
      scene.remove(obj);
      if (obj.geometry) obj.geometry.dispose();
      if (obj.material) obj.material.dispose();
    }

    // Re-add lights
    scene.add(new THREE.AmbientLight(0xffffff, 0.7));
    const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
    dirLight.position.set(1500, 2500, 1000);
    scene.add(dirLight);

    // Ground plane (invisible, for shadow context)
    const ground = new THREE.Mesh(
      new THREE.PlaneGeometry(plot.width * 2, plot.depth * 2),
      new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.15 })
    );
    ground.rotation.x = -Math.PI / 2;
    scene.add(ground);

    // Building footprint
    const bldgX = -plot.width / 2 + building.offsetX + building.width / 2;
    const bldgZ = -plot.depth / 2 + building.offsetY + building.depth / 2;

    let currentY = 0;
    floors.forEach((floor) => {
      const floorGroup = new THREE.Group();

      // Slab
      const slab = new THREE.Mesh(
        new THREE.BoxGeometry(building.width, 10, building.depth),
        new THREE.MeshStandardMaterial({ color: 0xa78bfa, transparent: true, opacity: 0.7 })
      );
      slab.position.set(bldgX, currentY + 5, bldgZ);
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
            color: 0xfafaf9,
            transparent: true,
            opacity: 0.5,
          })
        );
        wallMesh.position.set(
          bldgX + (wall.x1 + wall.x2) / 2 - building.width / 2,
          currentY + floor.height / 2 + 10,
          bldgZ + (wall.y1 + wall.y2) / 2 - building.depth / 2
        );
        wallMesh.rotation.y = -angle;
        floorGroup.add(wallMesh);
      });

      // Items (simplified as boxes)
      floor.items.forEach((item) => {
        const def = getItemDef(item.type);
        if (!def) return;
        const itemMesh = new THREE.Mesh(
          new THREE.BoxGeometry(item.w, def.height3d || 80, item.h),
          new THREE.MeshStandardMaterial({
            color: parseInt((item.color || def.color || '#8B7355').replace('#', ''), 16),
            transparent: true,
            opacity: 0.85,
          })
        );
        itemMesh.position.set(
          bldgX + item.x - building.width / 2,
          currentY + (def.height3d || 80) / 2 + 10,
          bldgZ + item.y - building.depth / 2
        );
        itemMesh.rotation.y = -item.rotation;
        floorGroup.add(itemMesh);
      });

      scene.add(floorGroup);
      currentY += floor.height + 10;
    });
  }

  if (!isARMode) return null;

  return (
    <div className="fixed inset-0 z-[200] bg-black flex items-center justify-center">
      {/* Camera feed */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="absolute inset-0 w-full h-full object-cover"
      />

      {/* 3D overlay canvas */}
      <div ref={containerRef} className="absolute inset-0">
        <canvas ref={canvasRef} className="w-full h-full" />
      </div>

      {/* Top bar */}
      <div className="absolute top-0 left-0 right-0 p-4 flex items-center justify-between bg-gradient-to-b from-black/70 to-transparent">
        <div className="flex items-center gap-2 text-white">
          <Camera size={20} />
          <div>
            <div className="font-bold text-sm">AR Preview Mode</div>
            <div className="text-xs text-white/70">
              {arReady ? ' ✓ Siap · ' : 'Memulai kamera... · '}
              {floors.length} lantai ditampilkan
            </div>
          </div>
        </div>
        <button
          onClick={() => setARMode(false)}
          className="bg-red-600 hover:bg-red-700 text-white p-2 rounded-full"
          title="Tutup AR"
        >
          <X size={18} />
        </button>
      </div>

      {/* Error state */}
      {cameraError && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/80">
          <div className="bg-white dark:bg-slate-800 rounded-lg p-6 max-w-sm text-center">
            <AlertTriangle size={32} className="mx-auto text-amber-500 mb-2" />
            <h3 className="font-bold text-slate-800 dark:text-slate-100 mb-2">
              Kamera Tidak Tersedia
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-300 mb-4">{cameraError}</p>
            <div className="text-xs text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-700 p-3 rounded text-left mb-4">
              <p className="font-semibold mb-1">Kemungkinan penyebab:</p>
              <ul className="list-disc list-inside space-y-0.5">
                <li>Browser tidak mendukung getUserMedia</li>
                <li>Izin kamera ditolak</li>
                <li>Tidak ada kamera (desktop tanpa webcam)</li>
                <li>HTTP (bukan HTTPS/localhost)</li>
              </ul>
            </div>
            <button
              onClick={() => setARMode(false)}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm font-medium"
            >
              Tutup
            </button>
          </div>
        </div>
      )}

      {/* Controls hint */}
      {arReady && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/70 backdrop-blur text-white px-4 py-2 rounded-full text-xs flex items-center gap-3">
          <span className="flex items-center gap-1">
            <Move3D size={12} /> Seret untuk putar
          </span>
          <span className="flex items-center gap-1">
            <Maximize size={12} /> Scroll untuk zoom
          </span>
        </div>
      )}

      {/* Side controls */}
      {arReady && (
        <div className="absolute right-4 top-1/2 -translate-y-1/2 flex flex-col gap-2">
          <button
            onClick={() => {
              if (cameraRef.current) {
                cameraRef.current.position.set(1500, 1000, 1500);
                cameraRef.current.lookAt(0, 100, 0);
              }
            }}
            className="bg-white/90 hover:bg-white text-slate-700 p-2.5 rounded-full shadow-lg"
            title="Reset view"
          >
            <RotateCw size={16} />
          </button>
        </div>
      )}
    </div>
  );
}
