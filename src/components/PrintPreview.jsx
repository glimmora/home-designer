import React from 'react';
import { useStore } from '../lib/store';
import { X, Printer, FileText } from 'lucide-react';

export default function PrintPreview() {
  const {
    isPrintPreviewOpen,
    closePrintPreview,
    floors,
    plot,
    building,
    unit,
  } = useStore();

  if (!isPrintPreviewOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const plotArea = (plot.width * plot.depth) / 10000;
  const buildingArea = (building.width * building.depth) / 10000;
  const kdb = (buildingArea / plotArea * 100).toFixed(1);

  return (
    <div
      className="modal-overlay fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-2 sm:p-4"
      onMouseDown={(e) => e.target === e.currentTarget && closePrintPreview()}
    >
      <div className="modal-content bg-white dark:bg-slate-800 dark:text-slate-100 rounded-xl shadow-2xl w-full max-w-2xl max-h-[92vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700 no-print">
          <h2 className="text-lg font-bold flex items-center gap-2">
            <Printer size={20} className="text-indigo-600" />
            Print Preview
          </h2>
          <div className="flex gap-2">
            <button
              onClick={handlePrint}
              className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md text-sm font-medium flex items-center gap-1.5"
            >
              <Printer size={14} />
              Print
            </button>
            <button onClick={closePrintPreview} className="text-slate-400 hover:text-slate-600 p-1.5 rounded">
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Print content */}
        <div className="flex-1 overflow-y-auto p-6 bg-white text-slate-900" style={{ fontFamily: 'Inter, sans-serif' }}>
          {/* Print header */}
          <div className="border-b-2 border-slate-800 pb-3 mb-4">
            <h1 className="text-2xl font-bold">Dokumen Desain Rumah</h1>
            <p className="text-sm text-slate-500">Home Designer Pro · {new Date().toLocaleDateString('id-ID')}</p>
          </div>

          {/* Info table */}
          <table className="w-full text-sm mb-4">
            <tbody>
              <tr className="border-b border-slate-200">
                <td className="py-1.5 font-semibold w-1/3">Luas Tanah</td>
                <td className="py-1.5">{plotArea.toFixed(2)} m² ({plot.width} x {plot.depth} cm)</td>
              </tr>
              <tr className="border-b border-slate-200">
                <td className="py-1.5 font-semibold">Luas Bangunan</td>
                <td className="py-1.5">{buildingArea.toFixed(2)} m² ({building.width} x {building.depth} cm)</td>
              </tr>
              <tr className="border-b border-slate-200">
                <td className="py-1.5 font-semibold">KDB</td>
                <td className="py-1.5">{kdb}%</td>
              </tr>
              <tr className="border-b border-slate-200">
                <td className="py-1.5 font-semibold">Jumlah Lantai</td>
                <td className="py-1.5">{floors.length}</td>
              </tr>
            </tbody>
          </table>

          {/* Floor details */}
          {floors.map((floor, idx) => (
            <div key={idx} className="mb-4 page-break">
              <h2 className="text-lg font-bold border-b border-slate-300 pb-1 mb-2">{floor.name}</h2>
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-slate-100">
                    <th className="text-left p-1.5 border border-slate-200">No</th>
                    <th className="text-left p-1.5 border border-slate-200">Item</th>
                    <th className="text-right p-1.5 border border-slate-200">Lebar (cm)</th>
                    <th className="text-right p-1.5 border border-slate-200">Panjang (cm)</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td colSpan="4" className="p-1.5 border border-slate-200 font-semibold bg-slate-50">Dinding: {floor.walls.length}</td>
                  </tr>
                  <tr>
                    <td colSpan="4" className="p-1.5 border border-slate-200 font-semibold bg-slate-50">Kolom: {floor.columns.length}</td>
                  </tr>
                  {floor.items.map((item, i) => (
                    <tr key={i} className="border border-slate-200">
                      <td className="p-1.5">{i + 1}</td>
                      <td className="p-1.5">{item.type}</td>
                      <td className="p-1.5 text-right">{item.w}</td>
                      <td className="p-1.5 text-right">{item.h}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="text-xs text-slate-500 mt-1">
                Tinggi Lantai: {floor.height} cm · Total Item: {floor.items.length}
              </div>
            </div>
          ))}

          <div className="text-xs text-slate-400 mt-6 text-center border-t border-slate-200 pt-2">
            Dokumen dibuat oleh Home Designer Pro · {new Date().toLocaleString('id-ID')}
          </div>
        </div>
      </div>

      {/* Print styles */}
      <style>{`
        @media print {
          .no-print { display: none !important; }
          .modal-overlay { position: static !important; background: white !important; }
          .modal-content { box-shadow: none !important; max-height: none !important; overflow: visible !important; }
          body { overflow: visible !important; }
          .page-break { page-break-before: always; }
        }
      `}</style>
    </div>
  );
}
