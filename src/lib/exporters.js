// DXF Exporter - generates AutoCAD-compatible DXF files
// Based on DXF R12 specification (widely compatible)

/**
 * Export the design as a DXF file content string.
 * @param {Object} params - { floors, plot, building, unit }
 * @returns {string} DXF content
 */
export function exportToDXF({ floors, plot, building }) {
  const lines = [];

  // Helper to add a DXF line with group code
  const add = (code, value) => {
    lines.push(String(code));
    lines.push(String(value));
  };

  // ===== HEADER section =====
  lines.push('0');
  lines.push('SECTION');
  add(2, 'HEADER');
  add(9, '$ACADVER');
  add(1, 'AC1009');
  add(9, '$INSBASE');
  add(10, 0);
  add(20, 0);
  add(30, 0);
  add(9, '$EXTMIN');
  add(10, -plot.width / 2);
  add(20, -plot.depth / 2);
  add(30, 0);
  add(9, '$EXTMAX');
  add(10, plot.width / 2);
  add(20, plot.depth / 2);
  add(30, 0);
  add(9, '$LUNITS');
  add(70, 2); // decimal
  add(9, '$INSUNITS');
  add(70, 4); // millimeters - we'll convert cm to mm
  lines.push('0');
  lines.push('ENDSEC');

  // ===== TABLES section =====
  lines.push('0');
  lines.push('SECTION');
  add(2, 'TABLES');

  // Layer table
  lines.push('0');
  lines.push('TABLE');
  add(2, 'LAYER');
  add(70, 10);

  const layers = [
    { name: 'PLOT', color: 3 },      // green
    { name: 'BUILDING', color: 5 },  // blue
    { name: 'WALLS', color: 7 },     // white/black
    { name: 'COLUMNS', color: 1 },   // red
    { name: 'ITEMS', color: 8 },     // gray
    { name: 'DIMENSIONS', color: 2 }, // yellow
    { name: 'TEXT', color: 6 },      // magenta
  ];

  layers.forEach((l) => {
    lines.push('0');
    lines.push('LAYER');
    add(2, l.name);
    add(70, 0);
    add(62, l.color);
    add(6, 'CONTINUOUS');
  });

  lines.push('0');
  lines.push('ENDTAB');
  lines.push('0');
  lines.push('ENDSEC');

  // ===== ENTITIES section =====
  lines.push('0');
  lines.push('SECTION');
  add(2, 'ENTITIES');

  // Convert cm to mm for DXF (AutoCAD standard)
  const CM = 10;

  // Plot (rectangle)
  const px = -plot.width / 2 * CM;
  const py = -plot.depth / 2 * CM;
  const pw = plot.width * CM;
  const pd = plot.depth * CM;
  addRectangle(add, lines, px, py, pw, pd, 'PLOT');

  // Building (rectangle)
  const bx = (-plot.width / 2 + building.offsetX) * CM;
  const by = (-plot.depth / 2 + building.offsetY) * CM;
  const bw = building.width * CM;
  const bd = building.depth * CM;
  addRectangle(add, lines, bx, by, bw, bd, 'BUILDING');

  // Process each floor
  let floorOffsetY = 0;
  floors.forEach((floor, fIdx) => {
    // Floor label text
    addText(add, lines, px - 500, py + floorOffsetY - 200, `${floor.name} (Tinggi: ${floor.height} cm)`, 'TEXT', 200);

    // Walls (as lines)
    floor.walls.forEach((wall) => {
      lines.push('0');
      lines.push('LINE');
      add(8, 'WALLS');
      add(10, wall.x1 * CM);
      add(20, wall.y1 * CM);
      add(30, 0);
      add(11, wall.x2 * CM);
      add(21, wall.y2 * CM);
      add(31, 0);
    });

    // Columns (as rectangles)
    floor.columns.forEach((col) => {
      const cx = col.x * CM;
      const cy = col.y * CM;
      const cs = col.size * CM;
      addRectangle(add, lines, cx - cs / 2, cy - cs / 2, cs, cs, 'COLUMNS');
    });

    // Items (as rectangles with labels)
    floor.items.forEach((item) => {
      const ix = item.x * CM;
      const iy = item.y * CM;
      const iw = item.w * CM;
      const ih = item.h * CM;
      // Account for rotation by drawing axis-aligned bbox (DXF R12 simplified)
      addRectangle(add, lines, ix - iw / 2, iy - ih / 2, iw, ih, 'ITEMS');
      // Label
      addText(add, lines, ix, iy, item.type, 'TEXT', 50);
    });

    floorOffsetY += pd + 2000; // Offset each floor's text below
  });

  // Dimensions
  addDimension(add, lines, px, py - 800, px + pw, py - 800, `Lebar: ${plot.width} cm`);
  addDimension(add, lines, px - 800, py, px - 800, py + pd, `Panjang: ${plot.depth} cm`);

  lines.push('0');
  lines.push('ENDSEC');

  // ===== End of file =====
  lines.push('0');
  lines.push('EOF');

  return lines.join('\n');
}

function addRectangle(add, lines, x, y, w, h, layer) {
  // LWPOLYLINE closed
  lines.push('0');
  lines.push('LWPOLYLINE');
  add(8, layer);
  add(90, 4); // vertex count
  add(70, 1); // closed
  add(10, x);
  add(20, y);
  add(10, x + w);
  add(20, y);
  add(10, x + w);
  add(20, y + h);
  add(10, x);
  add(20, y + h);
}

function addText(add, lines, x, y, text, layer, height = 100) {
  lines.push('0');
  lines.push('TEXT');
  add(8, layer);
  add(10, x);
  add(20, y);
  add(30, 0);
  add(40, height);
  add(1, text);
  add(50, 0); // rotation
}

function addDimension(add, lines, x1, y1, x2, y2, label) {
  // Simple line + text for dimension
  lines.push('0');
  lines.push('LINE');
  add(8, 'DIMENSIONS');
  add(10, x1);
  add(20, y1);
  add(30, 0);
  add(11, x2);
  add(21, y2);
  add(31, 0);
  addText(add, lines, (x1 + x2) / 2, (y1 + y2) / 2 - 100, label, 'DIMENSIONS', 80);
}

// ===== SVG Exporter =====
// Escape XML special characters to prevent XSS in SVG output
function escapeXml(str) {
  if (str == null) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export function exportToSVG({ floors, plot, building, viewMode = 'normal' }) {
  const CM = 1; // Use cm directly for SVG
  const padding = 100;
  const w = plot.width + padding * 2;
  const h = (plot.depth + padding * 2) * floors.length;

  const parts = [];
  parts.push(`<?xml version="1.0" encoding="UTF-8"?>`);
  parts.push(`<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="${-padding} ${-padding} ${w} ${h}">`);
  parts.push(`<rect x="${-padding}" y="${-padding}" width="${w}" height="${h}" fill="#f8fafc"/>`);

  // Define styles
  parts.push(`<defs>
    <style>
      .plot { fill: rgba(134,239,172,0.3); stroke: #166534; stroke-width: 3; stroke-dasharray: 10 5; }
      .building { fill: rgba(212,165,116,0.6); stroke: #1e40af; stroke-width: 2; }
      .wall { stroke: #1a202c; stroke-width: 10; stroke-linecap: round; }
      .column { fill: #dc2626; stroke: #991b1b; stroke-width: 2; }
      .item { stroke: #000; stroke-width: 1; }
      .label { font-family: Inter, sans-serif; font-size: 24px; fill: #1e293b; text-anchor: middle; font-weight: bold; }
      .dim { font-family: Inter, sans-serif; font-size: 18px; fill: #475569; text-anchor: middle; }
      .floor-title { font-family: Inter, sans-serif; font-size: 32px; fill: #6366f1; font-weight: bold; }
    </style>
  </defs>`);

  // Plot
  parts.push(`<rect class="plot" x="${-plot.width / 2}" y="${-plot.depth / 2}" width="${plot.width}" height="${plot.depth}"/>`);

  // Building
  const bx = -plot.width / 2 + building.offsetX;
  const by = -plot.depth / 2 + building.offsetY;
  parts.push(`<rect class="building" x="${bx}" y="${by}" width="${building.width}" height="${building.depth}"/>`);

  // Dimensions
  parts.push(`<text class="dim" x="0" y="${-plot.depth / 2 - 30}">${plot.width} cm</text>`);
  parts.push(`<text class="dim" x="${-plot.width / 2 - 30}" y="0" transform="rotate(-90 ${-plot.width / 2 - 30} 0)">${plot.depth} cm</text>`);

  // Each floor
  floors.forEach((floor, fIdx) => {
    const yOffset = fIdx * (plot.depth + padding);

    parts.push(`<g transform="translate(0, ${yOffset})">`);

    // Floor title
    parts.push(`<text class="floor-title" x="${-plot.width / 2}" y="${-plot.depth / 2 - 60}">${escapeXml(floor.name)} (Tinggi: ${floor.height} cm)</text>`);

    // Walls
    floor.walls.forEach((wall) => {
      parts.push(`<line class="wall" x1="${wall.x1}" y1="${wall.y1}" x2="${wall.x2}" y2="${wall.y2}"/>`);
    });

    // Columns
    floor.columns.forEach((col) => {
      parts.push(`<rect class="column" x="${col.x - col.size / 2}" y="${col.y - col.size / 2}" width="${col.size}" height="${col.size}"/>`);
    });

    // Items
    floor.items.forEach((item) => {
      const cx = item.x;
      const cy = item.y;
      const angle = (item.rotation * 180) / Math.PI;
      const safeColor = /^[#a-zA-Z0-9]+$/.test(item.color || '') ? item.color : '#8B7355';
      parts.push(`<g transform="translate(${cx}, ${cy}) rotate(${angle})">`);
      parts.push(`<rect class="item" x="${-item.w / 2}" y="${-item.h / 2}" width="${item.w}" height="${item.h}" fill="${safeColor}"/>`);
      parts.push(`<text class="label" x="0" y="6">${escapeXml(item.type)}</text>`);
      parts.push(`</g>`);
    });

    parts.push(`</g>`);
  });

  parts.push(`</svg>`);
  return parts.join('\n');
}

// ===== File download helper =====
export function downloadFile(content, filename, mimeType = 'text/plain') {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => URL.revokeObjectURL(url), 100);
}

// ===== glTF/OBJ Export (3D) =====
// Requires THREE.js scene passed in

/**
 * Export a Three.js scene as glTF (.glb binary format).
 * @param {THREE.Scene} scene
 * @param {THREE.Object3D} objectToExport - specific object or whole scene
 * @param {string} filename
 */
export async function exportToGLB(scene, filename = 'home-designer.glb') {
  const { GLTFExporter } = await import('three/examples/jsm/exporters/GLTFExporter.js');

  return new Promise((resolve, reject) => {
    const exporter = new GLTFExporter();
    exporter.parse(
      scene,
      (result) => {
        if (result instanceof ArrayBuffer) {
          const blob = new Blob([result], { type: 'model/gltf-binary' });
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = filename;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          setTimeout(() => URL.revokeObjectURL(url), 100);
          resolve(filename);
        } else {
          // JSON output
          const json = JSON.stringify(result, null, 2);
          downloadFile(json, filename.replace('.glb', '.gltf'), 'model/gltf+json');
          resolve(filename.replace('.glb', '.gltf'));
        }
      },
      (error) => reject(error),
      { binary: true }
    );
  });
}

/**
 * Export a Three.js scene as OBJ (.obj format).
 */
export async function exportToOBJ(scene, filename = 'home-designer.obj') {
  const { OBJExporter } = await import('three/examples/jsm/exporters/OBJExporter.js');
  const exporter = new OBJExporter();
  const objString = exporter.parse(scene);
  downloadFile(objString, filename, 'text/plain');
  return filename;
}

/**
 * Export a Three.js scene as STL (.stl binary format).
 */
export async function exportToSTL(scene, filename = 'home-designer.stl') {
  const { STLExporter } = await import('three/examples/jsm/exporters/STLExporter.js');
  const exporter = new STLExporter();
  const stlBuffer = exporter.parse(scene, { binary: true });
  const blob = new Blob([stlBuffer], { type: 'model/stl' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => URL.revokeObjectURL(url), 100);
  return filename;
}

// ===== DAE (Collada) Export - Native SketchUp Compatible =====
// Generates Collada .dae file that SketchUp can import directly (File > Import)
// Manual XML generation since Three.js doesn't include ColladaExporter
export async function exportToDAE(scene, filename = 'home-designer.dae') {
  // Collect all meshes from scene
  const meshes = [];
  scene.traverse((obj) => {
    if (obj.isMesh && obj.geometry) {
      meshes.push(obj);
    }
  });

  const now = new Date().toISOString();
  let vertexData = '';
  let normalData = '';
  let triangleData = '';
  let materialData = '';
  let vOffset = 0;
  let materialId = 0;
  const materials = new Map();

  meshes.forEach((mesh, meshIdx) => {
    const geo = mesh.geometry;
    const mat = mesh.material;
    const matColor = mat && mat.color ? `${mat.color.r} ${mat.color.g} ${mat.color.b}` : '0.7 0.7 0.7';
    const matName = mat && mat.name ? mat.name : `Material_${materialId}`;

    if (!materials.has(matName)) {
      materials.set(matName, { id: materialId, color: matColor, name: matName });
      materialId++;
    }

    const matRef = materials.get(matName);
    const meshId = `Mesh_${meshIdx}`;
    const sourceId = `_${meshIdx}`;

    // Get vertices
    const positions = geo.attributes.position;
    if (!positions) return;

    const verts = [];
    for (let i = 0; i < positions.count; i++) {
      verts.push(`${positions.getX(i).toFixed(4)} ${positions.getY(i).toFixed(4)} ${positions.getZ(i).toFixed(4)}`);
    }

    // Get indices
    const indices = geo.index ? geo.index.array : null;
    const tris = [];
    if (indices) {
      for (let i = 0; i < indices.length; i += 3) {
        tris.push(`${indices[i] + vOffset} ${indices[i + 1] + vOffset} ${indices[i + 2] + vOffset}`);
      }
    } else {
      for (let i = 0; i < positions.count; i += 3) {
        tris.push(`${i + vOffset} ${i + 1 + vOffset} ${i + 2 + vOffset}`);
      }
    }

    vertexData += verts.join(' ') + ' ';
    triangleData += tris.join(' ') + ' ';
    vOffset += positions.count;

    // Material
    materialData += `
    <instance_material symbol="${meshId}_mat" target="#${matRef.name}">
      <bind_vertex_input semantic="COLOR" input_semantic="COLOR" input_set="0"/>
    </instance_material>`;
  });

  // Build Collada XML
  const dae = `<?xml version="1.0" encoding="UTF-8"?>
<COLLADA xmlns="http://www.collada.org/2005/11/COLLADASchema" version="1.4.1">
  <asset>
    <created>${now}</created>
    <modified>${now}</modified>
    <unit name="centimeter" meter="0.01"/>
    <up_axis>Y_UP</up_axis>
  </asset>
  <library_materials>
${Array.from(materials.values()).map(m => `    <material id="${m.name}" name="${m.name}">
      <instance_effect url="#${m.name}_effect"/>
    </material>`).join('\n')}
  </library_materials>
  <library_effects>
${Array.from(materials.values()).map(m => `    <effect id="${m.name}_effect">
      <profile_COMMON>
        <technique sid="common">
          <phong>
            <diffuse>
              <color>${m.color} 1.0</color>
            </diffuse>
          </phong>
        </technique>
      </profile_COMMON>
    </effect>`).join('\n')}
  </library_effects>
  <library_geometries>
    <geometry id="Geometry_0" name="HomeDesigner">
      <mesh>
        <source id="positions">
          <float_array id="positions_array" count="${vOffset * 3}">${vertexData.trim()}</float_array>
          <technique_common>
            <accessor source="#positions_array" count="${vOffset}" stride="3">
              <param name="X" type="float"/>
              <param name="Y" type="float"/>
              <param name="Z" type="float"/>
            </accessor>
          </technique_common>
        </source>
        <vertices id="vertices">
          <input semantic="POSITION" source="#positions"/>
        </vertices>
        <triangles count="${triangleData.trim().split(' ').length / 3}">
          <input semantic="VERTEX" source="#vertices" offset="0"/>
          <p>${triangleData.trim()}</p>
        </triangles>
      </mesh>
    </geometry>
  </library_geometries>
  <library_visual_scenes>
    <visual_scene id="Scene" name="Scene">
      <node id="HomeDesigner" name="HomeDesigner" type="NODE">
        <instance_geometry url="#Geometry_0">
          <bind_material>
            <technique_common>${materialData}
            </technique_common>
          </bind_material>
        </instance_geometry>
      </node>
    </visual_scene>
  </library_visual_scenes>
  <scene>
    <instance_visual_scene url="#Scene"/>
  </scene>
</COLLADA>`;

  downloadFile(dae, filename, 'model/xml');
  return filename;
}

// ===== DXF Import - Import from SketchUp/AutoCAD =====
// Parses DXF entities (LINE, LWPOLYLINE, CIRCLE, ARC) into walls/items
export function parseDXF(dxfContent) {
  const lines = dxfContent.split('\n').map(l => l.trim());
  const entities = [];
  let i = 0;
  let currentEntity = null;

  while (i < lines.length) {
    const code = parseInt(lines[i]);
    const value = lines[i + 1];

    if (code === 0 && value === 'SECTION') {
      i += 2;
      continue;
    }
    if (code === 0 && value === 'ENDSEC') {
      i += 2;
      continue;
    }
    if (code === 0 && value === 'EOF') {
      break;
    }

    // Start new entity
    if (code === 0 && value !== 'SECTION' && value !== 'ENDSEC' && value !== 'EOF' && value !== 'TABLE' && value !== 'ENDTAB' && value !== 'BLOCK' && value !== 'ENDBLK') {
      if (currentEntity) entities.push(currentEntity);
      currentEntity = { type: value, points: [], layer: '0' };
      i += 2;
      continue;
    }

    if (currentEntity) {
      // Layer name
      if (code === 8) currentEntity.layer = value;
      // X coordinate (group 10)
      else if (code === 10) currentEntity.points.push({ x: parseFloat(value) || 0, y: 0 });
      // Y coordinate (group 20)
      else if (code === 20 && currentEntity.points.length > 0) {
        currentEntity.points[currentEntity.points.length - 1].y = parseFloat(value) || 0;
      }
      // X2 coordinate (group 11)
      else if (code === 11) currentEntity.points.push({ x: parseFloat(value) || 0, y: 0, isEnd: true });
      // Y2 coordinate (group 21)
      else if (code === 21 && currentEntity.points.length > 0) {
        currentEntity.points[currentEntity.points.length - 1].y = parseFloat(value) || 0;
      }
      // Circle radius
      else if (code === 40) currentEntity.radius = parseFloat(value) || 0;
      // Vertex count for LWPOLYLINE
      else if (code === 90) currentEntity.vertexCount = parseInt(value) || 0;
      // Closed flag
      else if (code === 70) currentEntity.closed = (parseInt(value) & 1) === 1;
    }

    i += 2;
  }
  if (currentEntity) entities.push(currentEntity);

  // Convert DXF entities (mm) to app format (cm)
  // DXF from SketchUp is typically in mm, we divide by 10 to get cm
  const scale = 0.1; // mm to cm

  const walls = [];
  const columns = [];
  const items = [];

  entities.forEach((ent, idx) => {
    if (ent.type === 'LINE' && ent.points.length >= 2) {
      // LINE entity: two points (start and end)
      // DXF LINE uses groups 10/20 for start, 11/21 for end
      const start = ent.points[0];
      const end = ent.points.find(p => p.isEnd) || ent.points[1];
      walls.push({
        id: Date.now() + idx,
        x1: start.x * scale,
        y1: start.y * scale,
        x2: end.x * scale,
        y2: end.y * scale,
      });
    } else if (ent.type === 'LWPOLYLINE' && ent.points.length >= 2) {
      // LWPOLYLINE: connected line segments
      for (let j = 0; j < ent.points.length - 1; j++) {
        walls.push({
          id: Date.now() + idx * 100 + j,
          x1: ent.points[j].x * scale,
          y1: ent.points[j].y * scale,
          x2: ent.points[j + 1].x * scale,
          y2: ent.points[j + 1].y * scale,
        });
      }
      // Close the polyline if flagged
      if (ent.closed && ent.points.length > 2) {
        const last = ent.points[ent.points.length - 1];
        const first = ent.points[0];
        walls.push({
          id: Date.now() + idx * 100 + 99,
          x1: last.x * scale,
          y1: last.y * scale,
          x2: first.x * scale,
          y2: first.y * scale,
        });
      }
    } else if (ent.type === 'CIRCLE' && ent.radius) {
      // CIRCLE: approximate as square column
      const center = ent.points[0] || { x: 0, y: 0 };
      const sizeCm = ent.radius * scale * 2; // diameter in cm
      if (sizeCm < 100) {
        // Small circle = column
        columns.push({
          id: Date.now() + idx,
          x: center.x * scale,
          y: center.y * scale,
          size: Math.max(15, Math.min(sizeCm, 50)),
        });
      }
    }
  });

  return { walls, columns, items, entityCount: entities.length };
}


