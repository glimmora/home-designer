import React from 'react';
import { useStore } from '../lib/store';
import { X, Link, Copy, Check } from 'lucide-react';

export default function ShareModal() {
  const { isShareModalOpen, closeShareModal, shareViaURL } = useStore();
  const [url, setUrl] = React.useState('');
  const [copied, setCopied] = React.useState(false);

  React.useEffect(() => {
    if (isShareModalOpen) {
      const u = shareViaURL();
      setUrl(u || '');
      setCopied(false);
    }
  }, [isShareModalOpen, shareViaURL]);

  if (!isShareModalOpen) return null;

  const handleCopy = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="modal-overlay fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4"
      onMouseDown={(e) => e.target === e.currentTarget && closeShareModal()}>
      <div className="modal-content bg-white dark:bg-slate-800 dark:text-slate-100 rounded-xl shadow-2xl w-full max-w-md overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700">
          <h2 className="text-lg font-bold flex items-center gap-2">
            <Link size={20} className="text-indigo-600" />
            Share via URL
          </h2>
          <button onClick={closeShareModal} className="text-slate-400 hover:text-slate-600 p-1 rounded">
            <X size={20} />
          </button>
        </div>
        <div className="p-4 space-y-3">
          <p className="text-sm text-slate-600 dark:text-slate-300">
            Salin URL di bawah untuk share desain Anda. Penerima cukup membuka URL untuk memuat desain secara otomatis.
          </p>
          <div className="flex gap-2">
            <input
              type="text"
              readOnly
              value={url}
              className="flex-1 px-3 py-2 text-xs bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-md text-slate-600 dark:text-slate-300 font-mono"
            />
            <button
              onClick={handleCopy}
              className={`px-3 py-2 rounded-md text-xs font-medium flex items-center gap-1 ${
                copied ? 'bg-green-600 text-white' : 'bg-indigo-600 hover:bg-indigo-700 text-white'
              }`}
            >
              {copied ? <Check size={13} /> : <Copy size={13} />}
              {copied ? 'Copied!' : 'Copy'}
            </button>
          </div>
          <p className="text-[11px] text-amber-600 dark:text-amber-400">
            ⚠️ URL bisa sangat panjang. Untuk desain besar, gunakan Export JSON.
          </p>
        </div>
        <div className="p-4 border-t border-slate-200 dark:border-slate-700 flex justify-end">
          <button onClick={closeShareModal} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md text-sm font-medium">
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
}
