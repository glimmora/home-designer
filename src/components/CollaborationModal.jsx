import React, { useState, useEffect, useRef } from 'react';
import { useStore } from '../lib/store';
import { Users, X, Send, Wifi, WifiOff, User, MessageSquare, Upload, Radio } from 'lucide-react';

export default function CollaborationModal() {
  const {
    isCollabModalOpen,
    closeCollabModal,
    collabActive,
    collabInfo,
    collabPeers,
    collabMessages,
    joinCollab,
    leaveCollab,
    sendCollabMessage,
    sendCollabProject,
  } = useStore();

  const [name, setName] = useState('');
  const [message, setMessage] = useState('');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [collabMessages]);

  if (!isCollabModalOpen) return null;

  const handleJoin = () => {
    joinCollab(name.trim() || undefined);
  };

  const handleLeave = () => {
    leaveCollab();
  };

  const handleSend = () => {
    if (message.trim()) {
      sendCollabMessage(message.trim());
      setMessage('');
    }
  };

  return (
    <div
      className="modal-overlay fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4"
      onMouseDown={(e) => e.target === e.currentTarget && closeCollabModal()}
    >
      <div className="modal-content bg-white dark:bg-slate-800 dark:text-slate-100 rounded-xl shadow-2xl w-full max-w-2xl max-h-[92vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700">
          <h2 className="text-lg font-bold flex items-center gap-2">
            <Users className="text-green-600" size={20} />
            Kolaborasi Real-time
            {collabActive && (
              <span className="flex items-center gap-1 text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 px-2 py-0.5 rounded-full">
                <Radio size={10} className="animate-pulse" />
                Aktif
              </span>
            )}
          </h2>
          <button
            onClick={closeCollabModal}
            className="text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700 p-1 rounded"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-4 flex-1 overflow-y-auto">
          {!collabActive ? (
            // ===== Join Form =====
            <div className="text-center py-6">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-3">
                <Users size={28} className="text-green-600" />
              </div>
              <h3 className="font-bold text-lg mb-2">Mulai Kolaborasi</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-4 max-w-md mx-auto">
                Buka tab/browser baru di browser yang sama untuk berkolaborasi real-time.
                Bagikan perubahan project, kirim pesan, dan lihat kursor peer lain.
              </p>

              <div className="max-w-sm mx-auto space-y-3">
                <div>
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1 block">
                    Nama Anda (opsional)
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="contoh: Arsitek Andi"
                    className="prop-input"
                    maxLength={20}
                  />
                  <p className="text-[11px] text-slate-400 mt-1">
                    Kosongkan untuk generate nama acak
                  </p>
                </div>

                <button
                  onClick={handleJoin}
                  className="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded-md text-sm font-medium flex items-center justify-center gap-1.5"
                >
                  <Wifi size={14} />
                  Gabung Sesi
                </button>
              </div>

              <div className="mt-6 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-lg p-3 text-left max-w-md mx-auto">
                <h4 className="text-xs font-semibold text-blue-800 dark:text-blue-300 mb-1.5">
                  💡 Cara Kerja
                </h4>
                <ul className="text-xs text-blue-700 dark:text-blue-300 space-y-1 list-disc list-inside">
                  <li>Buka app di tab baru (Ctrl+N atau klik link dengan middle-click)</li>
                  <li>Klik "Gabung Sesi" di kedua tab</li>
                  <li>Kirim project, pesan, dan lihat kursor peer real-time</li>
                  <li>Menggunakan BroadcastChannel API (tanpa server)</li>
                </ul>
              </div>
            </div>
          ) : (
            // ===== Active Session =====
            <div className="space-y-4">
              {/* User info */}
              <div className="bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 rounded-lg p-3">
                <div className="flex items-center gap-2">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm"
                    style={{ background: collabInfo.userColor }}
                  >
                    {collabInfo.userName.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-semibold">{collabInfo.userName}</div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400">
                      ID: {collabInfo.userId} · {collabPeers.length} peer online
                    </div>
                  </div>
                  <button
                    onClick={handleLeave}
                    className="bg-red-500 hover:bg-red-600 text-white px-2.5 py-1 rounded text-xs font-medium flex items-center gap-1"
                  >
                    <WifiOff size={11} />
                    Keluar
                  </button>
                </div>
              </div>

              {/* Peers list */}
              {collabPeers.length > 0 && (
                <div>
                  <h4 className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-1.5">
                    <Users size={12} />
                    Peer Online ({collabPeers.length})
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {collabPeers.map((peer) => (
                      <div
                        key={peer.id}
                        className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded-full"
                      >
                        <div
                          className="w-5 h-5 rounded-full flex items-center justify-center text-white text-[10px] font-bold"
                          style={{ background: peer.color }}
                        >
                          {peer.name.charAt(0).toUpperCase()}
                        </div>
                        <span className="text-xs">{peer.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Sync project button */}
              <button
                onClick={sendCollabProject}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded-md text-sm font-medium flex items-center justify-center gap-1.5"
              >
                <Upload size={14} />
                Kirim Project ke Semua Peer
              </button>

              {/* Messages */}
              <div>
                <h4 className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-1.5">
                  <MessageSquare size={12} />
                  Chat
                </h4>
                <div className="border border-slate-200 dark:border-slate-700 rounded-lg h-64 overflow-y-auto bg-slate-50 dark:bg-slate-900/50 p-3 space-y-2">
                  {collabMessages.length === 0 ? (
                    <div className="text-center text-slate-400 text-sm py-8">
                      <MessageSquare size={24} className="mx-auto mb-1" />
                      Belum ada pesan. Mulai chat!
                    </div>
                  ) : (
                    collabMessages.map((msg, i) => (
                      <div
                        key={i}
                        className={`flex gap-2 ${
                          msg.self ? 'flex-row-reverse' : 'flex-row'
                        }`}
                      >
                        <div
                          className="w-6 h-6 rounded-full flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0"
                          style={{ background: msg.userColor || '#64748b' }}
                        >
                          {(msg.userName || '?').charAt(0).toUpperCase()}
                        </div>
                        <div
                          className={`max-w-[70%] ${
                            msg.self ? 'items-end text-right' : 'items-start'
                          }`}
                        >
                          <div className="text-[10px] text-slate-500 dark:text-slate-400 mb-0.5">
                            {msg.self ? 'Anda' : msg.userName}
                            {msg.system && ' · sistem'}
                          </div>
                          <div
                            className={`inline-block px-2.5 py-1.5 rounded-lg text-sm ${
                              msg.self
                                ? 'bg-indigo-600 text-white'
                                : msg.system
                                ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300'
                                : 'bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200'
                            }`}
                          >
                            {msg.text}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Message input */}
                <div className="flex gap-2 mt-2">
                  <input
                    type="text"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSend();
                      }
                    }}
                    placeholder="Ketik pesan..."
                    className="prop-input flex-1"
                    maxLength={200}
                  />
                  <button
                    onClick={handleSend}
                    disabled={!message.trim()}
                    className="bg-green-600 hover:bg-green-700 disabled:opacity-40 text-white px-3 rounded-md flex items-center gap-1"
                  >
                    <Send size={14} />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
