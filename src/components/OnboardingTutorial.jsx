import React from 'react';
import { useStore } from '../lib/store';
import { X, Check, ArrowRight, ArrowLeft, MousePointer2, Square, Box, Ruler, Save } from 'lucide-react';

export default function OnboardingTutorial() {
  const { hasSeenOnboarding, onboardingStep, setOnboarded, setOnboardingStep } = useStore();
  const [open, setOpen] = React.useState(!hasSeenOnboarding);

  if (!open) return null;

  const steps = [
    {
      icon: MousePointer2,
      title: 'Selamat Datang!',
      desc: 'Home Designer Pro - Aplikasi desain rumah 2D/3D. Klik item di sidebar kiri untuk menambahkan ke canvas.',
      highlight: 'sidebar',
    },
    {
      icon: Square,
      title: 'Gambar Dinding & Ruangan',
      desc: 'Pilih tool "Dinding" di toolbar untuk menggambar dinding. Klik 2 titik untuk membuat satu dinding. Tool "Ruangan" membuat 4 dinding sekaligus.',
      highlight: 'toolbar',
    },
    {
      icon: Box,
      title: 'Lihat dalam 3D',
      desc: 'Klik tombol "3D" untuk melihat rumah dalam 3D. Seret untuk memutar, scroll untuk zoom. Klik "2D" untuk kembali ke denah.',
      highlight: '2d3d',
    },
    {
      icon: Ruler,
      title: 'Analisis Struktur SNI',
      desc: 'Klik tombol "SNI" untuk menganalisis keamanan struktur sesuai standar SNI 03-2847-2002 & SNI 1726-2012.',
      highlight: 'sni',
    },
    {
      icon: Save,
      title: 'Simpan & Export',
      desc: 'Simpan desain ke browser (Ctrl+S), atau export ke PDF, DXF, glTF, dan format lainnya via tombol Export.',
      highlight: 'export',
    },
  ];

  const step = steps[onboardingStep];
  const isLast = onboardingStep === steps.length - 1;
  const Icon = step.icon;

  const handleNext = () => {
    if (isLast) {
      setOnboarded();
      setOpen(false);
    } else {
      setOnboardingStep(onboardingStep + 1);
    }
  };

  return (
    <div className="fixed inset-0 z-[500] bg-black/40 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl max-w-sm w-full p-6 animate-fade-in">
        <div className="flex items-center justify-between mb-4">
          <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg flex items-center justify-center">
            <Icon className="text-indigo-600" size={24} />
          </div>
          <span className="text-xs text-slate-400">{onboardingStep + 1} / {steps.length}</span>
        </div>

        <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-2">{step.title}</h2>
        <p className="text-sm text-slate-600 dark:text-slate-300 mb-4 leading-relaxed">{step.desc}</p>

        {/* Progress dots */}
        <div className="flex gap-1.5 mb-4">
          {steps.map((_, i) => (
            <div
              key={i}
              className={`h-1.5 rounded-full transition-all ${i === onboardingStep ? 'w-6 bg-indigo-600' : i < onboardingStep ? 'w-1.5 bg-indigo-400' : 'w-1.5 bg-slate-200 dark:bg-slate-600'}`}
            />
          ))}
        </div>

        <div className="flex justify-between items-center">
          <button
            onClick={() => { setOnboarded(); setOpen(false); }}
            className="text-xs text-slate-400 hover:text-slate-600"
          >
            Lewati
          </button>
          <div className="flex gap-2">
            {onboardingStep > 0 && (
              <button
                onClick={() => setOnboardingStep(onboardingStep - 1)}
                className="px-3 py-1.5 text-xs font-medium text-slate-600 dark:text-slate-300 border border-slate-300 dark:border-slate-600 rounded-md hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center gap-1"
              >
                <ArrowLeft size={12} />
                Kembali
              </button>
            )}
            <button
              onClick={handleNext}
              className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md text-xs font-medium flex items-center gap-1"
            >
              {isLast ? (
                <>
                  <Check size={12} />
                  Mulai
                </>
              ) : (
                <>
                  Lanjut
                  <ArrowRight size={12} />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
