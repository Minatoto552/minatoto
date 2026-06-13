import React, { useState } from 'react';
import { useMockApp, TABLES } from '../../lib/MockAppContext';
import { AlertTriangle, Send, X } from 'lucide-react';
import { cn } from '../../lib/utils';

export function EmergencyHelpButton() {
  const { currentUser, currentRotationNumber, triggerEmergencyCall, getCastCurrentTable, emergencyCalls } = useMockApp();
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [selectedTable, setSelectedTable] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  if (!currentUser || !['customer', 'cast', 'admin', 'staff'].includes(currentUser.role)) return null;

  // Check if there is already an active call from this user
  const hasActiveCall = emergencyCalls.some(c => c.castUserId === currentUser.id && c.status === 'active');
  
  const handleOpen = () => {
    if (hasActiveCall) {
        alert('既に送信済みのヘルプがあります。解決されるまでお待ちください。');
        return;
    }
    const tableId = currentUser.role === 'customer'
      ? currentUser.assignedTableId
      : getCastCurrentTable(currentUser.id);
    setSelectedTable(tableId || '');
    setSubmitError('');
    setIsOpen(true);
  };

  const handleSubmit = async () => {
    if (!selectedTable) {
      alert('卓番号を選択してください。');
      return;
    }
    
    setIsSubmitting(true);
    setSubmitError('');
    try {
      await triggerEmergencyCall({
        tableId: selectedTable,
        tableNameSnapshot: selectedTable,
        castUserId: currentUser.id,
        castNameSnapshot: currentUser.displayName,
        castIconSnapshot: currentUser.iconUrl,
        rotationNumberSnapshot: currentRotationNumber || 0,
        message: message.trim() || null
      });
      setIsOpen(false);
      setMessage('');
    } catch (error) {
      const message = error instanceof Error ? error.message : '緊急ヘルプの送信に失敗しました。';
      setSubmitError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <button 
        onClick={handleOpen}
        disabled={hasActiveCall}
        className={cn(
            "fixed bottom-24 right-6 w-16 h-16 rounded-full shadow-[0_0_30px_rgba(220,38,38,0.4)] flex items-center justify-center text-white z-40 transition-all active:scale-90",
            hasActiveCall 
                ? "bg-gray-700 opacity-50 cursor-not-allowed" 
                : "bg-red-600 animate-pulse hover:bg-red-500"
        )}
        title="緊急ヘルプ"
      >
        <AlertTriangle size={32} />
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-[1001] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
          <div className="glass-panel w-full max-w-sm rounded-[2rem] border border-red-500/40 overflow-hidden shadow-[0_0_100px_rgba(220,38,38,0.4)] animate-in fade-in zoom-in duration-300">
            <div className="bg-red-600 p-5 flex items-center justify-between text-white border-b border-white/20">
              <h3 className="font-sans font-black tracking-widest uppercase flex items-center gap-2 text-lg">
                <AlertTriangle size={24} /> Emergency Help
              </h3>
              <button 
                onClick={() => setIsOpen(false)} 
                className="bg-white/10 hover:bg-white/20 p-2 rounded-full transition"
              >
                <X size={20}/>
              </button>
            </div>
            
            <div className="p-6 space-y-5">
              <div className="space-y-2">
                <label className="text-[11px] text-gray-400 font-black uppercase tracking-widest ml-1">卓番号を選択 (Table)</label>
                <div className="grid grid-cols-4 gap-2">
                  {TABLES.map(t => (
                    <button 
                      key={t}
                      onClick={() => setSelectedTable(t)}
                      className={cn(
                        "py-3 rounded-xl text-sm font-black transition border-2 flex items-center justify-center",
                        selectedTable === t 
                          ? "bg-red-600 border-red-400 text-white shadow-lg" 
                          : "bg-white/5 border-white/10 text-gray-500 hover:border-white/30"
                      )}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[11px] text-gray-400 font-black uppercase tracking-widest ml-1">メッセージ (Detail Optional)</label>
                <textarea 
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                  placeholder="例: トラブル、ミス、要応援など"
                  className="w-full bg-black/60 border-2 border-white/10 rounded-2xl px-4 py-3 text-sm text-white focus:border-red-500/50 outline-none h-28 resize-none transition"
                />
              </div>

              <div className="pt-2">
                {submitError && (
                  <div className="mb-3 rounded-2xl border border-red-300/40 bg-red-950/60 p-3 text-xs font-bold leading-5 text-red-100">
                    {submitError}
                  </div>
                )}
                <button 
                  onClick={handleSubmit}
                  disabled={isSubmitting || !selectedTable}
                  className="w-full bg-red-600 text-white font-black py-4 rounded-2xl flex items-center justify-center gap-3 hover:bg-red-700 transition active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_10px_20px_rgba(220,38,38,0.3)] text-base uppercase tracking-wider"
                >
                  <Send size={20} /> ヘルプを送信する
                </button>
                <p className="text-[10px] text-gray-500 text-center mt-3 font-bold uppercase tracking-tight">
                  ※送信後、スタッフ全員に即時通知されます
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
