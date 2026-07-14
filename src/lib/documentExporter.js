// ============================================================
// DOCUMENT EXPORTER - Professional PDF Generation
// Generates: Design Document, Structural Document, Rebar Document
// ============================================================
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { analyzeBuilding, generateSNIRebarLayout, concreteGrades, steelGrades, rebarProperties } from './structuralAnalysis';
import { getItemDef, getItemCategory, getCategoryLabel } from './itemDefinitions';

// ============= HELPERS =============
const COLORS = {
  primary: [99, 102, 241],    // indigo-600
  secondary: [71, 85, 105],   // slate-600
  accent: [220, 38, 38],      // red-600
  green: [22, 163, 74],
  amber: [245, 158, 11],
  dark: [30, 41, 59],         // slate-800
  light: [241, 245, 249],     // slate-100
  white: [255, 255, 255],
  border: [203, 213, 225],    // slate-300
};

function formatDate() {
  const d = new Date();
  const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
  return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
}

function formatTime() {
  const d = new Date();
  return d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
}

// ============= COMMON: Header & Footer =============
function addHeader(doc, title, subtitle) {
  const pageWidth = doc.internal.pageSize.getWidth();

  // Top bar
  doc.setFillColor(99, 102, 241);
  doc.rect(0, 0, pageWidth, 25, 'F');

  // Logo box
  doc.setFillColor(255, 255, 255);
  doc.roundedRect(10, 5, 15, 15, 2, 2, 'F');
  doc.setTextColor(99, 102, 241);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('HDP', 12, 14);

  // Title
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(13);
  doc.setFont('helvetica', 'bold');
  doc.text(title, 30, 12);

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text(subtitle, 30, 19);

  // Date
  doc.setFontSize(7);
  doc.text(`${formatDate()} ${formatTime()}`, pageWidth - 10, 12, { align: 'right' });
}

function addFooter(doc, pageNum, totalPages) {
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  doc.setDrawColor(203, 213, 225);
  doc.setLineWidth(0.3);
  doc.line(10, pageHeight - 15, pageWidth - 10, pageHeight - 15);

  doc.setFontSize(7);
  doc.setTextColor(71, 85, 105);
  doc.setFont('helvetica', 'normal');
  doc.text('Home Designer Pro - Dokumen Teknis', 10, pageHeight - 10);
  doc.text(`Halaman ${pageNum} dari ${totalPages}`, pageWidth - 10, pageHeight - 10, { align: 'right' });
}

function addSectionTitle(doc, y, title, color) {
  const c = color || [99, 102, 241];
  doc.setFillColor(c[0], c[1], c[2]);
  doc.rect(10, y - 4, doc.internal.pageSize.getWidth() - 20, 8, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text(title, 12, y + 1.5);
  return y + 10;
}

function pageWidthSafe(doc) {
  return doc.internal.pageSize.getWidth();
}

// Safely get the Y position after the last autoTable
function getFinalY(doc, defaultY = 35) {
  if (doc.lastAutoTable && typeof doc.lastAutoTable.finalY === 'number') {
    return doc.lastAutoTable.finalY;
  }
  return defaultY;
}

// ============= DESIGN DOCUMENT =============
export function exportDesignDocument({ floors, plot, building, unit, structuralSettings }) {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 10;
  const contentWidth = pageWidth - margin * 2;
  let y = 35;

  // =========== COVER PAGE ===========
  doc.setFillColor(30, 41, 59);
  doc.rect(0, 0, pageWidth, pageHeight, 'F');

  doc.setFillColor(99, 102, 241);
  doc.rect(0, 60, pageWidth, 80, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(28);
  doc.setFont('helvetica', 'bold');
  doc.text('DOKUMEN DESAIN', pageWidth / 2, 90, { align: 'center' });

  doc.setFontSize(14);
  doc.setFont('helvetica', 'normal');
  doc.text('Denah & Spesifikasi Bangunan', pageWidth / 2, 100, { align: 'center' });

  doc.setFontSize(10);
  doc.text(`Tanah: ${plot.width} x ${plot.depth} cm`, pageWidth / 2, 115, { align: 'center' });
  doc.text(`Bangunan: ${building.width} x ${building.depth} cm`, pageWidth / 2, 122, { align: 'center' });
  doc.text(`${floors.length} Lantai`, pageWidth / 2, 129, { align: 'center' });

  doc.setFontSize(9);
  doc.text(`Tanggal: ${formatDate()}`, pageWidth / 2, pageHeight - 30, { align: 'center' });
  doc.text('Home Designer Pro', pageWidth / 2, pageHeight - 22, { align: 'center' });

  // =========== TABLE OF CONTENTS ===========
  doc.addPage();
  addHeader(doc, 'Dokumen Desain', 'Daftar Isi');
  y = 35;
  y = addSectionTitle(doc, y, 'DAFTAR ISI');
  const tocItems = [
    '1. Informasi Umum Bangunan',
    '2. Denah Lantai (per lantai)',
    '3. Jadwal Ruangan (Room Schedule)',
    '4. Jadwal Pintu & Jendela (Door/Window Schedule)',
    '5. Jadwal Material Furnitur',
  ];
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(30, 41, 59);
  tocItems.forEach((item) => {
    doc.text(item, 15, y);
    y += 7;
  });

  // =========== GENERAL INFO ===========
  doc.addPage();
  addHeader(doc, 'Dokumen Desain', 'Informasi Umum');
  y = 35;
  y = addSectionTitle(doc, y, '1. INFORMASI UMUM BANGUNAN');

  const buildingArea = (building.width * building.depth) / 10000;
  const totalArea = buildingArea * floors.length;
  const plotArea = (plot.width * plot.depth) / 10000;
  const kdb = (buildingArea / plotArea * 100).toFixed(1);

  autoTable(doc, {
    startY: y,
    head: [['Parameter', 'Nilai', 'Satuan']],
    body: [
      ['Luas Tanah', plotArea.toFixed(2), 'm²'],
      ['Lebar Tanah', (plot.width / 100).toFixed(2), 'm'],
      ['Panjang Tanah', (plot.depth / 100).toFixed(2), 'm'],
      ['Luas Bangunan (per lantai)', buildingArea.toFixed(2), 'm²'],
      ['Total Luas Bangunan', totalArea.toFixed(2), 'm²'],
      ['Lebar Bangunan', (building.width / 100).toFixed(2), 'm'],
      ['Panjang Bangunan', (building.depth / 100).toFixed(2), 'm'],
      ['Jumlah Lantai', String(floors.length), 'lantai'],
      ['Koefisien Daerah Bangunan (KDB)', kdb, '%'],
      ['Offset X Bangunan', (building.offsetX / 100).toFixed(2), 'm'],
      ['Offset Y Bangunan', (building.offsetY / 100).toFixed(2), 'm'],
    ],
    theme: 'striped',
    headStyles: { fillColor: [99, 102, 241], fontSize: 9 },
    bodyStyles: { fontSize: 9 },
    margin: { left: 10, right: 10 },
  });
  y = getFinalY(doc) + 10;

  // Floor heights table
  y = addSectionTitle(doc, y, 'Tinggi Lantai');
  autoTable(doc, {
    startY: y,
    head: [['Lantai', 'Tinggi (cm)', 'Tinggi (m)']],
    body: floors.map(f => [
      f.name,
      String(f.height),
      (f.height / 100).toFixed(2),
    ]),
    theme: 'striped',
    headStyles: { fillColor: [71, 85, 105], fontSize: 9 },
    bodyStyles: { fontSize: 9 },
    margin: { left: 10, right: 10 },
  });

  // =========== FLOOR PLANS ===========
  floors.forEach((floor, idx) => {
    doc.addPage();
    addHeader(doc, 'Dokumen Desain', `Denah ${floor.name}`);
    y = 35;
    y = addSectionTitle(doc, y, `2. DENAH ${floor.name.toUpperCase()}`);

    // Draw simplified floor plan
    drawFloorPlanInPDF(doc, floor, plot, building, margin, y);

    // Room schedule for this floor
    y = 130;
    y = addSectionTitle(doc, y, `3. JADWAL RUANGAN - ${floor.name.toUpperCase()}`);
    const roomData = generateRoomSchedule(floor);
    autoTable(doc, {
      startY: y,
      head: [['No', 'Item', 'Tipe', 'Lebar (cm)', 'Panjang (cm)', 'Kategori']],
      body: roomData,
      theme: 'striped',
      headStyles: { fillColor: [99, 102, 241], fontSize: 8 },
      bodyStyles: { fontSize: 8 },
      margin: { left: 10, right: 10 },
    });
    y = getFinalY(doc) + 10;

    // Wall schedule
    if (floor.walls.length > 0) {
      y = addSectionTitle(doc, y, 'Jadwal Dinding');
      autoTable(doc, {
        startY: y,
        head: [['No', 'X1 (cm)', 'Y1 (cm)', 'X2 (cm)', 'Y2 (cm)', 'Panjang (m)']],
        body: floor.walls.map((w, i) => {
          const len = Math.sqrt((w.x2 - w.x1) ** 2 + (w.y2 - w.y1) ** 2) / 100;
          return [i + 1, w.x1, w.y1, w.x2, w.y2, len.toFixed(2)];
        }),
        theme: 'striped',
        headStyles: { fillColor: [71, 85, 105], fontSize: 8 },
        bodyStyles: { fontSize: 8 },
        margin: { left: 10, right: 10 },
      });
    }

    // Column schedule
    if (floor.columns.length > 0 && y > pageHeight - 40) {
      doc.addPage();
      addHeader(doc, 'Dokumen Desain', `Kolom ${floor.name}`);
      y = 35;
    }
    if (floor.columns.length > 0) {
      y = addSectionTitle(doc, y, 'Jadwal Kolom');
      autoTable(doc, {
        startY: y,
        head: [['No', 'X (cm)', 'Y (cm)', 'Ukuran (cm)', 'Ukuran (mm)']],
        body: floor.columns.map((c, i) => [i + 1, c.x, c.y, `${c.size}x${c.size}`, `${c.size * 10}x${c.size * 10}`]),
        theme: 'striped',
        headStyles: { fillColor: [220, 38, 38], fontSize: 8 },
        bodyStyles: { fontSize: 8 },
        margin: { left: 10, right: 10 },
      });
    }
  });

  // =========== DOOR/WINDOW SCHEDULE ===========
  doc.addPage();
  addHeader(doc, 'Dokumen Desain', 'Jadwal Pintu & Jendela');
  y = 35;
  y = addSectionTitle(doc, y, '4. JADWAL PINTU & JENDELA');
  const doorWindowData = generateDoorWindowSchedule(floors);
  autoTable(doc, {
    startY: y,
    head: [['No', 'Tipe', 'Nama', 'Lebar (cm)', 'Tinggi (cm)', 'Lantai', 'Jumlah']],
    body: doorWindowData,
    theme: 'striped',
    headStyles: { fillColor: [99, 102, 241], fontSize: 8 },
    bodyStyles: { fontSize: 8 },
    margin: { left: 10, right: 10 },
  });

  // =========== FURNITURE SCHEDULE ===========
  if (y > pageHeight - 40) { doc.addPage(); addHeader(doc, 'Dokumen Desain', 'Jadwal Material'); y = 35; }
  else { y = getFinalY(doc) + 10; }
  y = addSectionTitle(doc, y, '5. JADWAL MATERIAL FURNITUR');
  const furnitureData = generateFurnitureSchedule(floors);
  autoTable(doc, {
    startY: y,
    head: [['No', 'Tipe', 'Nama', 'Lebar (cm)', 'Panjang (cm)', 'Kategori', 'Total']],
    body: furnitureData,
    theme: 'striped',
    headStyles: { fillColor: [22, 163, 74], fontSize: 8 },
    bodyStyles: { fontSize: 8 },
    margin: { left: 10, right: 10 },
  });

  // =========== FOOTERS ===========
  const totalPages = doc.internal.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    if (i > 1) addFooter(doc, i, totalPages);
  }

  doc.save(`Desain-Bangunan-${new Date().toISOString().slice(0, 10)}.pdf`);
}

// ============= STRUCTURAL DOCUMENT =============
export function exportStructuralDocument({ floors, plot, building, structuralSettings, seismicSettings, liveLoadType }) {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  let y = 35;

  // =========== COVER ===========
  doc.setFillColor(30, 41, 59);
  doc.rect(0, 0, pageWidth, pageHeight, 'F');
  doc.setFillColor(220, 38, 38);
  doc.rect(0, 60, pageWidth, 80, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(28);
  doc.setFont('helvetica', 'bold');
  doc.text('DOKUMEN STRUKTUR', pageWidth / 2, 90, { align: 'center' });
  doc.setFontSize(14);
  doc.setFont('helvetica', 'normal');
  doc.text('Analisis & Perhitungan Struktur Beton Bertulang', pageWidth / 2, 100, { align: 'center' });
  doc.setFontSize(10);
  doc.text('SNI 03-2847-2002 | SNI 1726-2012 | SNI 1727-2013', pageWidth / 2, 115, { align: 'center' });
  doc.setFontSize(9);
  doc.text(`Tanggal: ${formatDate()}`, pageWidth / 2, pageHeight - 30, { align: 'center' });

  // Run analysis
  const results = analyzeBuilding({
    floors, plot, building,
    settings: structuralSettings,
    seismic: seismicSettings,
    liveLoadType,
  });

  // =========== PAGE 2: MATERIAL SPECIFICATIONS ===========
  doc.addPage();
  addHeader(doc, 'Dokumen Struktur', 'Spesifikasi Material');
  y = 35;
  y = addSectionTitle(doc, y, '1. SPESIFIKASI MATERIAL');

  const fcGrade = concreteGrades[structuralSettings.concreteGrade] || concreteGrades['K-250'];
  const fyGrade = steelGrades[structuralSettings.steelGrade] || steelGrades['BJTD400'];

  autoTable(doc, {
    startY: y,
    head: [['Material', 'Spesifikasi', 'Nilai']],
    body: [
      ['Beton', fcGrade.name, `f'c = ${fcGrade.fc} MPa`],
      ['Baja Tulangan Utama', fyGrade.name, `fy = ${fyGrade.fy} MPa`],
      ['Baja Sengkang', 'BJTP-240 (Polos)', 'fy = 240 MPa'],
      ['Tulangan Utama', `D${structuralSettings.mainBarDiameter}`, `Ø${structuralSettings.mainBarDiameter}mm`],
      ['Sengkang', `D${structuralSettings.stirrupDiameter}`, `Ø${structuralSettings.stirrupDiameter}mm`],
      ['Spasi Sengkang', `${structuralSettings.stirrupSpacing}mm`, '—'],
      ['Selimut Beton', `${structuralSettings.cover}mm`, '—'],
      ['Tebal Plat', `${structuralSettings.slabThickness}mm`, '—'],
      ['Tebal Dinding', `${structuralSettings.wallThickness}mm`, '—'],
      ['Jumlah Tulangan Utama/Kolom', `${structuralSettings.numMainBars} batang`, '—'],
    ],
    theme: 'striped',
    headStyles: { fillColor: [220, 38, 38], fontSize: 9 },
    bodyStyles: { fontSize: 9 },
    margin: { left: 10, right: 10 },
  });
  y = getFinalY(doc) + 10;

  // =========== LOAD ANALYSIS ===========
  y = addSectionTitle(doc, y, '2. ANALISIS BEBAN');
  autoTable(doc, {
    startY: y,
    head: [['Lantai', 'Dead Load (kN)', 'Live Load (kN)', 'Factored Load (kN)', 'Berat Seismik (kN)'],
  ],
    body: results.floors.map(f => [
      f.name,
      f.loads.totalDL.toFixed(1),
      f.loads.totalLL.toFixed(1),
      f.loads.factoredLoad.toFixed(1),
      (f.loads.totalDL + 0.25 * f.loads.totalLL).toFixed(1),
    ]),
    foot: [['TOTAL', results.totals.totalWeight_kN.toFixed(1), '—', '—', results.totals.totalSeismicWeight_kN.toFixed(1)]],
    theme: 'striped',
    headStyles: { fillColor: [71, 85, 105], fontSize: 8 },
    bodyStyles: { fontSize: 8 },
    footStyles: { fillColor: [30, 41, 59], fontSize: 8, textColor: [255, 255, 255] },
    margin: { left: 10, right: 10 },
  });
  y = getFinalY(doc) + 10;

  // =========== SEISMIC ANALYSIS ===========
  if (results.seismic) {
    if (y > pageHeight - 60) { doc.addPage(); addHeader(doc, 'Dokumen Struktur', 'Analisis Gempa'); y = 35; }
    else { y = getFinalY(doc) + 10; }

    y = addSectionTitle(doc, y, '3. ANALISIS BEBAN GEMPA (SNI 1726-2012)');
    const s = results.seismic;
    autoTable(doc, {
      startY: y,
      head: [['Parameter', 'Simbol', 'Nilai', 'Satuan']],
      body: [
        ['Kota', '—', s.city, '—'],
        ['Zona Gempa', '—', String(s.zone), '—'],
        ['Spektrum Pendek (Mapped)', 'Ss', s.Ss.toFixed(3), 'g'],
        ['Spektrum 1-detik (Mapped)', 'S1', s.S1.toFixed(3), 'g'],
        ['Koefisien Situ (Pendek)', 'Fa', s.Fa.toFixed(2), '—'],
        ['Koefisien Situ (1-detik)', 'Fv', s.Fv.toFixed(2), '—'],
        ['Spektrum Max Pendek', 'SMS', s.SMS.toFixed(3), 'g'],
        ['Spektrum Max 1-detik', 'SM1', s.SM1.toFixed(3), 'g'],
        ['Spektrum Desain Pendek', 'SDS', s.SDS.toFixed(3), 'g'],
        ['Spektrum Desain 1-detik', 'SD1', s.SD1.toFixed(3), 'g'],
        ['Faktor Modifikasi Respon', 'R', String(s.R), '—'],
        ['Faktor Kepentingan', 'Ie', String(s.Ie), '—'],
        ['Periode Getar', 'T', s.periodT.toFixed(2), 'detik'],
        ['Koefisien Respon Seismik', 'Cs', s.Cs.toFixed(4), '—'],
        ['Gaya Gempa Dasar (Base Shear)', 'V', s.V.toFixed(1), 'kN'],
      ],
      theme: 'striped',
      headStyles: { fillColor: [220, 38, 38], fontSize: 8 },
      bodyStyles: { fontSize: 8 },
      margin: { left: 10, right: 10 },
    });
  }

  // =========== COLUMN CAPACITY ===========
  doc.addPage();
  addHeader(doc, 'Dokumen Struktur', 'Kapasitas Kolom');
  y = 35;
  y = addSectionTitle(doc, y, '4. KAPASITAS KOLOM (SNI 03-2847-2002)');

  const columnData = [];
  results.floors.forEach(floor => {
    floor.columns.forEach(col => {
      const util = (col.utilization * 100).toFixed(1);
      columnData.push([
        floor.name,
        `#${col.id}`,
        `${col.size_mm}x${col.size_mm}`,
        col.capacity_kN.toFixed(1),
        col.load_kN.toFixed(1),
        `${util}%`,
        col.safe ? 'AMAN' : 'KRITIS',
      ]);
    });
  });

  autoTable(doc, {
    startY: y,
    head: [['Lantai', 'ID Kolom', 'Ukuran (mm)', 'φPn (kN)', 'Beban (kN)', 'Utilisasi', 'Status']],
    body: columnData,
    theme: 'striped',
    headStyles: { fillColor: [220, 38, 38], fontSize: 8 },
    bodyStyles: { fontSize: 8 },
    margin: { left: 10, right: 10 },
    didParseCell: (data) => {
      if (data.section === 'body' && data.column.index === 6) {
        const val = data.cell.raw;
        if (val === 'AMAN') {
          data.cell.styles.textColor = [22, 163, 74];
          data.cell.styles.fontStyle = 'bold';
        } else {
          data.cell.styles.textColor = [220, 38, 38];
          data.cell.styles.fontStyle = 'bold';
        }
      }
    },
  });
  y = getFinalY(doc) + 10;

  // =========== WALL/BEAM CAPACITY ===========
  if (y > pageHeight - 60) { doc.addPage(); addHeader(doc, 'Dokumen Struktur', 'Kapasitas Dinding'); y = 35; }
  y = addSectionTitle(doc, y, '5. KAPASITAS DINDING SEBAGAI BALOK');
  const wallData = [];
  results.floors.forEach(floor => {
    floor.walls.forEach(w => {
      wallData.push([
        floor.name,
        `#${w.id}`,
        w.length_m.toFixed(2),
        w.capacity_Mn_kNm.toFixed(2),
        w.load_moment_kNm.toFixed(2),
        (w.momentUtilization * 100).toFixed(1) + '%',
        w.capacity_Vc_kN.toFixed(1),
        w.load_shear_kN.toFixed(1),
        (w.shearUtilization * 100).toFixed(1) + '%',
        w.safe ? 'AMAN' : 'KRITIS',
      ]);
    });
  });

  if (wallData.length > 0) {
    autoTable(doc, {
      startY: y,
      head: [['Lantai', 'ID', 'Panjang (m)', 'φMn (kNm)', 'M Beban', 'Util M', 'φVc (kN)', 'V Beban', 'Util V', 'Status']],
      body: wallData,
      theme: 'striped',
      headStyles: { fillColor: [71, 85, 105], fontSize: 7 },
      bodyStyles: { fontSize: 7 },
      margin: { left: 10, right: 10 },
    });
  }

  // =========== SAFETY SUMMARY ===========
  doc.addPage();
  addHeader(doc, 'Dokumen Struktur', 'Ringkasan Keamanan');
  y = 35;
  y = addSectionTitle(doc, y, '6. RINGKASAN KEAMANAN STRUKTUR');

  const score = results.totals.safetyScore;
  const scoreColor = score >= 80 ? [22, 163, 74] : score >= 50 ? [245, 158, 11] : [220, 38, 38];

  // Score box
  doc.setFillColor(scoreColor[0], scoreColor[1], scoreColor[2]);
  doc.roundedRect(10, y, 60, 25, 3, 3, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text(String(score), 25, y + 15);
  doc.setFontSize(8);
  doc.text('/ 100', 45, y + 15);
  doc.setFontSize(7);
  doc.text('Safety Score', 25, y + 22);

  // Status text
  doc.setTextColor(30, 41, 59);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text(score >= 80 ? 'STRUKTUR MEMENUHI STANDAR SNI' :
    score >= 50 ? 'STRUKTUR PERLU PERHATIAN' : 'STRUKTUR TIDAK AMAN', 80, y + 10);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.text(`Critical: ${results.safetyChecks.critical.length}`, 80, y + 18);
  doc.text(`Warning: ${results.safetyChecks.warnings.length}`, 80, y + 24);
  y += 35;

  // Critical issues
  if (results.safetyChecks.critical.length > 0) {
    y = addSectionTitle(doc, y, 'MASALAH KRITIS', [220, 38, 38]);
    autoTable(doc, {
      startY: y,
      head: [['No', 'Deskripsi Masalah']],
      body: results.safetyChecks.critical.map((c, i) => [i + 1, c]),
      theme: 'striped',
      headStyles: { fillColor: [220, 38, 38], fontSize: 8 },
      bodyStyles: { fontSize: 8, textColor: [220, 38, 38] },
      margin: { left: 10, right: 10 },
    });
    y = getFinalY(doc) + 10;
  }

  // Warnings
  if (results.safetyChecks.warnings.length > 0) {
    if (y > pageHeight - 40) { doc.addPage(); addHeader(doc, 'Dokumen Struktur', 'Warnings'); y = 35; }
    y = addSectionTitle(doc, y, 'PERINGATAN', [245, 158, 11]);
    autoTable(doc, {
      startY: y,
      head: [['No', 'Deskripsi Peringatan']],
      body: results.safetyChecks.warnings.map((w, i) => [i + 1, w]),
      theme: 'striped',
      headStyles: { fillColor: [245, 158, 11], fontSize: 8 },
      bodyStyles: { fontSize: 8, textColor: [120, 80, 0] },
      margin: { left: 10, right: 10 },
    });
  }

  // SNI Standards reference
  doc.addPage();
  addHeader(doc, 'Dokumen Struktur', 'Referensi Standar');
  y = 35;
  y = addSectionTitle(doc, y, '7. REFERENSI STANDAR SNI');
  autoTable(doc, {
    startY: y,
    head: [['Standar', 'Judul', 'Penggunaan']],
    body: [
      ['SNI 03-2847-2002', 'Tata Cara Perhitungan Struktur Beton Bertulang', 'Kapasitas kolom, balok, plat'],
      ['SNI 1726-2012', 'Beban Minimum untuk Desain Bangunan terhadap Gempa', 'Analisis gaya gempa dasar'],
      ['SNI 1727-2013', 'Beban Minimum untuk Desain Bangunan dan Struktur Lain', 'Beban mati & beban hidup'],
      ['SNI 03-1729-2002', 'Baja Bukan Profil untuk Struktur', 'Mutu baja tulangan (fy)'],
    ],
    theme: 'striped',
    headStyles: { fillColor: [30, 41, 59], fontSize: 8 },
    bodyStyles: { fontSize: 8 },
    margin: { left: 10, right: 10 },
  });

  // Footers
  const totalPages = doc.internal.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    if (i > 1) addFooter(doc, i, totalPages);
  }

  doc.save(`Struktur-Bangunan-${new Date().toISOString().slice(0, 10)}.pdf`);
}

// ============= REBAR DOCUMENT =============
export function exportRebarDocument({ floors, plot, building, structuralSettings }) {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  let y = 35;

  // =========== COVER ===========
  doc.setFillColor(30, 41, 59);
  doc.rect(0, 0, pageWidth, pageHeight, 'F');
  doc.setFillColor(71, 85, 105);
  doc.rect(0, 60, pageWidth, 80, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(26);
  doc.setFont('helvetica', 'bold');
  doc.text('DOKUMEN PEMBESIAN', pageWidth / 2, 90, { align: 'center' });
  doc.setFontSize(14);
  doc.setFont('helvetica', 'normal');
  doc.text('Detail Penulangan & Bar Bending Schedule', pageWidth / 2, 100, { align: 'center' });
  doc.setFontSize(10);
  doc.text('SNI 03-2847-2002 Section 7.7, 7.10, 10.5, 10.9', pageWidth / 2, 115, { align: 'center' });
  doc.setFontSize(9);
  doc.text(`Tanggal: ${formatDate()}`, pageWidth / 2, pageHeight - 30, { align: 'center' });

  // =========== REBAR SPECIFICATIONS ===========
  doc.addPage();
  addHeader(doc, 'Dokumen Pembesian', 'Spesifikasi Penulangan');
  y = 35;
  y = addSectionTitle(doc, y, '1. SPESIFIKASI PENULANGAN');

  const fcGrade = concreteGrades[structuralSettings.concreteGrade] || concreteGrades['K-250'];
  const fyGrade = steelGrades[structuralSettings.steelGrade] || steelGrades['BJTD400'];
  const mainD = structuralSettings.mainBarDiameter;
  const stirrupD = structuralSettings.stirrupDiameter;
  const mainBar = Object.values(rebarProperties).find(r => r.diameter === mainD) || rebarProperties.D16;
  const stirrupBar = Object.values(rebarProperties).find(r => r.diameter === stirrupD) || rebarProperties.D8;

  autoTable(doc, {
    startY: y,
    head: [['Item', 'Spesifikasi', 'Detail']],
    body: [
      ['Tulangan Utama', `D${mainD} (${mainBar.name})`, `Ø${mainD}mm, As=${mainBar.area}mm², Berat=${mainBar.weight}kg/m`],
      ['Mutu Baja Utama', fyGrade.name, `fy = ${fyGrade.fy} MPa, fu = ${fyGrade.fu} MPa`],
      ['Sengkang', `D${stirrupD} (${stirrupBar.name})`, `Ø${stirrupD}mm, As=${stirrupBar.area}mm², Berat=${stirrupBar.weight}kg/m`],
      ['Mutu Baja Sengkang', 'BJTP-240 (Polos)', 'fy = 240 MPa'],
      ['Mutu Beton', fcGrade.name, `f'c = ${fcGrade.fc} MPa`],
      ['Selimut Beton', `${structuralSettings.cover}mm`, 'SNI 7.7.1 - Interior'],
      ['Spasi Sengkang', `${structuralSettings.stirrupSpacing}mm`, `SNI 7.10.5 (max ${Math.min(300, mainD * 16)}mm)`],
      ['Jumlah Tulangan Utama', `${structuralSettings.numMainBars} batang`, 'SNI 10.9.2 (min 4 batang)'],
    ],
    theme: 'striped',
    headStyles: { fillColor: [71, 85, 105], fontSize: 9 },
    bodyStyles: { fontSize: 9 },
    margin: { left: 10, right: 10 },
  });
  y = getFinalY(doc) + 10;

  // =========== SNI COMPLIANCE CHECK ===========
  y = addSectionTitle(doc, y, '2. PEMERIKSAAN KEPATUHAN SNI');
  autoTable(doc, {
    startY: y,
    head: [['Parameter', 'Persyaratan SNI', 'Aktual', 'Status']],
    body: [
      ['Rasio Tulangan Min (ρmin)', '1.0%', '—', 'Lihat detail kolom'],
      ['Rasio Tulangan Max (ρmax)', '8.0%', '—', 'Lihat detail kolom'],
      ['Min Tulangan Utama', '4 batang', `${structuralSettings.numMainBars} batang`,
        structuralSettings.numMainBars >= 4 ? '✓ PATUH' : '✗ TIDAK PATUH'],
      ['Selimut Beton Min', '40mm (interior)', `${structuralSettings.cover}mm`,
        structuralSettings.cover >= 40 ? '✓ PATUH' : '✗ TIDAK PATUH'],
      ['Spasi Sengkang Min', '75mm', `${structuralSettings.stirrupSpacing}mm`,
        structuralSettings.stirrupSpacing >= 75 ? '✓ PATUH' : '✗ TIDAK PATUH'],
      ['Spasi Sengkang Max', '300mm', `${structuralSettings.stirrupSpacing}mm`,
        structuralSettings.stirrupSpacing <= 300 ? '✓ PATUH' : '✗ TIDAK PATUH'],
    ],
    theme: 'striped',
    headStyles: { fillColor: [22, 163, 74], fontSize: 8 },
    bodyStyles: { fontSize: 8 },
    margin: { left: 10, right: 10 },
    didParseCell: (data) => {
      if (data.section === 'body' && data.column.index === 3) {
        const val = data.cell.raw;
        if (val && val.includes('✓')) {
          data.cell.styles.textColor = [22, 163, 74];
          data.cell.styles.fontStyle = 'bold';
        } else if (val && val.includes('✗')) {
          data.cell.styles.textColor = [220, 38, 38];
          data.cell.styles.fontStyle = 'bold';
        }
      }
    },
  });

  // =========== REBAR DETAILING PER FLOOR ===========
  floors.forEach((floor, fIdx) => {
    doc.addPage();
    addHeader(doc, 'Dokumen Pembesian', `Detail ${floor.name}`);
    y = 35;
    y = addSectionTitle(doc, y, `3. DETAIL PEMBESIAN ${floor.name.toUpperCase()}`);

    // Generate rebar layout for each column
    floor.columns.forEach((col, cIdx) => {
      const colSize_mm = col.size * 10;
      const rebarLayout = generateSNIRebarLayout({
        columnSize_mm: colSize_mm,
        fc_grade: structuralSettings.concreteGrade,
        steel_grade: structuralSettings.steelGrade,
        numMainBars: structuralSettings.numMainBars,
        mainBarDiameter: mainD,
        stirrupDiameter: stirrupD,
        stirrupSpacing: structuralSettings.stirrupSpacing,
        cover: structuralSettings.cover,
        floorHeight_mm: floor.height,
      });

      const cap = rebarLayout.capacity;

      // Column detail header
      doc.setFillColor(241, 245, 249);
      doc.rect(10, y - 2, pageWidth - 20, 8, 'F');
      doc.setTextColor(30, 41, 59);
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.text(`Kolom #${col.id} - ${col.size}x${col.size} cm (${colSize_mm}x${colSize_mm} mm)`, 12, y + 3);
      y += 10;

      // Detail table
      autoTable(doc, {
        startY: y,
        head: [['Parameter', 'Nilai', 'Satuan']],
        body: [
          ['Ukuran Kolom', `${colSize_mm}x${colSize_mm}`, 'mm'],
          ['Tinggi Kolom', String(floor.height), 'mm'],
          ['Tulangan Utama', `${structuralSettings.numMainBars} x D${mainD}`, 'batang'],
          ['Luas Tulangan Utama (As)', cap.As.toFixed(0), 'mm²'],
          ['Luas Penampang (Ag)', cap.Ag.toFixed(0), 'mm²'],
          ['Rasio Tulangan (ρ)', (cap.rho * 100).toFixed(2), '%'],
          ['Sengkang', `D${stirrupD} @ ${structuralSettings.stirrupSpacing}mm`, '—'],
          ['Selimut Beton', String(structuralSettings.cover), 'mm'],
          ['Kapasitas Nominal (Pn)', (cap.Pn / 1000).toFixed(1), 'kN'],
          ['Kapasitas Desain (φPn)', (cap.phiPn / 1000).toFixed(1), 'kN'],
          ['Slenderness Ratio (kl/r)', cap.slenderness.toFixed(1), '—'],
          ['Jenis Kolom', cap.isShort ? 'Kolom Pendek' : 'Kolom Langsing', '—'],
          ['Cek ρ (1%-8%)', cap.rhoCheck.passed ? '✓ PATUH' : '✗ TIDAK PATUH', '—'],
          ['Cek Min Bar (≥4)', cap.minBarsCheck.passed ? '✓ PATUH' : '✗ TIDAK PATUH', '—'],
        ],
        theme: 'grid',
        headStyles: { fillColor: [71, 85, 105], fontSize: 7 },
        bodyStyles: { fontSize: 7 },
        margin: { left: 10, right: 10 },
        didParseCell: (data) => {
          if (data.section === 'body' && data.column.index === 1) {
            const val = String(data.cell.raw);
            if (val.includes('✓')) { data.cell.styles.textColor = [22, 163, 74]; data.cell.styles.fontStyle = 'bold'; }
            if (val.includes('✗')) { data.cell.styles.textColor = [220, 38, 38]; data.cell.styles.fontStyle = 'bold'; }
          }
        },
      });
      y = getFinalY(doc) + 8;

      // Check if we need new page
      if (y > pageHeight - 50 && cIdx < floor.columns.length - 1) {
        doc.addPage();
        addHeader(doc, 'Dokumen Pembesian', `Detail ${floor.name} (lanjutan)`);
        y = 35;
      }
    });

    // Bar Bending Schedule for this floor
    if (y > pageHeight - 60) { doc.addPage(); addHeader(doc, 'Dokumen Pembesian', `BBS ${floor.name}`); y = 35; }
    else { y += 5; }

    y = addSectionTitle(doc, y, `BAR BENDING SCHEDULE - ${floor.name.toUpperCase()}`);
    const bbsData = generateBBS(floor, structuralSettings);
    autoTable(doc, {
      startY: y,
      head: [['No', 'Lokasi', 'Tipe Bar', 'Dia. (mm)', 'Panjang (m)', 'Jumlah', 'Total (m)', 'Berat (kg)']],
      body: bbsData,
      foot: [['', '', '', '', '', '', 'TOTAL', (bbsData.length > 0 ? bbsData.reduce((s, r) => s + parseFloat(r[7]) || 0, 0) : 0).toFixed(1) + ' kg']],
      theme: 'striped',
      headStyles: { fillColor: [30, 41, 59], fontSize: 7 },
      bodyStyles: { fontSize: 7 },
      footStyles: { fillColor: [99, 102, 241], fontSize: 8, textColor: [255, 255, 255] },
      margin: { left: 10, right: 10 },
    });
  });

  // =========== REBAR STANDARDS REFERENCE ===========
  doc.addPage();
  addHeader(doc, 'Dokumen Pembesian', 'Referensi SNI');
  y = 35;
  y = addSectionTitle(doc, y, '4. REFERENSI STANDAR PEMBESIAN');
  autoTable(doc, {
    startY: y,
    head: [['Klausa SNI', 'Deskripsi', 'Penerapan']],
    body: [
      ['SNI 7.7.1', 'Selimut Beton Minimum', 'Cover 40mm interior, 50mm eksterior, 75mm tanah'],
      ['SNI 7.10.5', 'Spasi Sengkang Maksimum', 'Max 16xdia utama, 48xdia sengkang, atau dimensi terkecil'],
      ['SNI 10.5.1', 'Rasio Tulangan Minimum', 'ρmin = max(0.25√f\'c/fy x b x d, 1.4 x b x d / fy)'],
      ['SNI 10.9.1', 'Rasio Tulangan Maksimum', 'ρmax = 8% dari Ag'],
      ['SNI 10.9.2', 'Minimum Tulangan Utama', 'Minimal 4 batang untuk kolom persegi'],
      ['SNI 10.10', 'Rasio Slenderness', 'Kolom pendek jika kl/r ≤ 40/√(Pn/Agxf\'c)'],
    ],
    theme: 'striped',
    headStyles: { fillColor: [30, 41, 59], fontSize: 8 },
    bodyStyles: { fontSize: 8 },
    margin: { left: 10, right: 10 },
  });

  // Footers
  const totalPages = doc.internal.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    if (i > 1) addFooter(doc, i, totalPages);
  }

  doc.save(`Pembesian-Bangunan-${new Date().toISOString().slice(0, 10)}.pdf`);
}

// ============= HELPER: Draw floor plan in PDF =============
function drawFloorPlanInPDF(doc, floor, plot, building, margin, startY) {
  try {
    const drawWidth = doc.internal.pageSize.getWidth() - margin * 2;
    const drawHeight = 70; // mm
    const safePlotW = Math.max(1, plot.width);
    const safePlotD = Math.max(1, plot.depth);
    const scale = Math.min(drawWidth / safePlotW, drawHeight / safePlotD);
    const offsetX = margin + (drawWidth - safePlotW * scale) / 2;
    const offsetY = startY;

    // Plot boundary (solid, no dash to avoid jsPDF issues)
    doc.setDrawColor(22, 101, 52); // green-800
    doc.setLineWidth(0.5);
    doc.rect(offsetX, offsetY, safePlotW * scale, safePlotD * scale);

    // Building footprint
    const bldgX = offsetX + building.offsetX * scale;
    const bldgY = offsetY + building.offsetY * scale;
    doc.setFillColor(241, 245, 249); // slate-100
    doc.setDrawColor(67, 56, 202); // indigo-700
    doc.setLineWidth(0.3);
    doc.rect(bldgX, bldgY, building.width * scale, building.depth * scale, 'FD');

    // Walls (limit to 50 to prevent stack overflow)
    doc.setDrawColor(30, 41, 59); // slate-800
    doc.setLineWidth(0.8);
    const maxWalls = Math.min(floor.walls.length, 50);
    for (let i = 0; i < maxWalls; i++) {
      const w = floor.walls[i];
      doc.line(
        offsetX + (w.x1 + safePlotW / 2) * scale,
        offsetY + (w.y1 + safePlotD / 2) * scale,
        offsetX + (w.x2 + safePlotW / 2) * scale,
        offsetY + (w.y2 + safePlotD / 2) * scale
      );
    }

    // Columns (limit to 30)
    doc.setFillColor(220, 38, 38); // red-600
    const maxCols = Math.min(floor.columns.length, 30);
    for (let i = 0; i < maxCols; i++) {
      const c = floor.columns[i];
      const cx = offsetX + (c.x + safePlotW / 2) * scale - 1;
      const cy = offsetY + (c.y + safePlotD / 2) * scale - 1;
      doc.rect(cx, cy, 2, 2, 'F');
    }

    // Items (limit to 50, use small rects instead of circles)
    doc.setFillColor(99, 102, 241); // indigo-600
    const maxItems = Math.min(floor.items.length, 50);
    for (let i = 0; i < maxItems; i++) {
      const item = floor.items[i];
      const cx = offsetX + (item.x + safePlotW / 2) * scale - 0.5;
      const cy = offsetY + (item.y + safePlotD / 2) * scale - 0.5;
      doc.rect(cx, cy, 1, 1, 'F');
    }

    // Labels
    doc.setFontSize(6);
    doc.setTextColor(71, 85, 105); // slate-600
    doc.text(`${floor.name} - ${floor.items.length} item, ${floor.walls.length} dinding, ${floor.columns.length} kolom`, margin, offsetY + safePlotD * scale + 5);
  } catch (e) {
    console.warn('drawFloorPlanInPDF error:', e.message);
  }
}

// ============= HELPER: Generate room schedule =============
function generateRoomSchedule(floor) {
  const data = [];
  floor.items.forEach((item, i) => {
    const def = getItemDef(item.type);
    const cat = def ? getCategoryLabel(getItemCategory(item.type)) : { label: '-' };
    data.push([
      i + 1,
      def?.name || item.type,
      item.type,
      item.w,
      item.h,
      cat.label,
    ]);
  });
  return data;
}

// ============= HELPER: Generate door/window schedule =============
function generateDoorWindowSchedule(floors) {
  const data = [];
  let no = 1;
  floors.forEach(floor => {
    floor.items.forEach(item => {
      if (item.type.startsWith('door') || item.type.startsWith('window') || item.type.startsWith('sliding') || item.type.startsWith('folding') || item.type.startsWith('french') || item.type.startsWith('skylight') || item.type.startsWith('louver')) {
        const def = getItemDef(item.type);
        data.push([
          no++,
          item.type,
          def?.name || item.type,
          item.w,
          def?.height3d || 210,
          floor.name,
          '1',
        ]);
      }
    });
  });
  return data;
}

// ============= HELPER: Generate furniture schedule =============
function generateFurnitureSchedule(floors) {
  const counts = {};
  floors.forEach(floor => {
    floor.items.forEach(item => {
      if (!counts[item.type]) {
        const def = getItemDef(item.type);
        const cat = def ? getCategoryLabel(getItemCategory(item.type)) : { label: '-' };
        counts[item.type] = { name: def?.name || item.type, w: item.w, h: item.h, cat: cat.label, count: 0 };
      }
      counts[item.type].count++;
    });
  });
  return Object.entries(counts).map(([type, info], i) => [
    i + 1, type, info.name, info.w, info.h, info.cat, info.count
  ]);
}

// ============= HELPER: Generate Bar Bending Schedule =============
function generateBBS(floor, settings) {
  const bbs = [];
  let no = 1;
  const mainD = settings.mainBarDiameter;
  const stirrupD = settings.stirrupDiameter;
  const mainBar = Object.values(rebarProperties).find(r => r.diameter === mainD) || rebarProperties.D16;
  const stirrupBar = Object.values(rebarProperties).find(r => r.diameter === stirrupD) || rebarProperties.D8;

  // Main bars for each column
  floor.columns.forEach(col => {
    const colSize_mm = col.size * 10;
    const barLength = (floor.height + 2 * settings.cover) / 100; // meters (including hooks)
    const totalLength = barLength * settings.numMainBars;
    const weight = totalLength * mainBar.weight;

    bbs.push([
      no++,
      `Kolom #${col.id}`,
      `D${mainD} (Utama)`,
      mainD,
      barLength.toFixed(2),
      settings.numMainBars,
      totalLength.toFixed(2),
      weight.toFixed(1),
    ]);

    // Stirrups
    const stirrupPerimeter = 4 * (colSize_mm - 2 * settings.cover) / 10; // meters
    const numStirrups = Math.floor(floor.height / settings.stirrupSpacing);
    const totalStirrupLen = stirrupPerimeter * numStirrups;
    const stirrupWeight = totalStirrupLen * stirrupBar.weight;

    bbs.push([
      no++,
      `Kolom #${col.id}`,
      `D${stirrupD} (Sengkang)`,
      stirrupD,
      stirrupPerimeter.toFixed(2),
      numStirrups,
      totalStirrupLen.toFixed(2),
      stirrupWeight.toFixed(1),
    ]);
  });

  return bbs;
}
