import React from 'react';
import { useMockApp } from '../../lib/MockAppContext';
import { Clock, LogOut } from 'lucide-react';

export function PendingPage() {
  const { currentUser, logout } = useMockApp();

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] p-4 text-center animate-in fade-in duration-500">
      <div className="w-24 h-24 rounded-full bg-[#111] border border-[#d4af37]/30 flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(212,175,55,0.1)]">
        <Clock className="text-[#d4af37]" size={40} />
      </div>
      
      <h2 className="font-lux text-3xl gold-gradient-text tracking-widest mb-4">Approval Pending</h2>
      
      <div className="glass-panel p-6 rounded-2xl max-w-sm w-full mx-auto space-y-4">
        <p className="text-sm text-gray-300 leading-relaxed">
          {currentUser?.displayName}様の登録申請を受け付けました。<br/>
          現在は運営の承認待ち状態です。
        </p>
        
        <div className="bg-black/50 rounded-lg p-4 flex flex-col gap-2 text-xs text-left">
          <div className="flex justify-between border-b border-white/10 pb-2">
            <span className="text-gray-500">希望役割</span>
            <span className="text-white uppercase">{currentUser?.requestedRole}</span>
          </div>
          <div className="flex justify-between pt-1">
            <span className="text-gray-500">現在のステータス</span>
            <span className="text-yellow-500">審査中</span>
          </div>
        </div>
        
        <p className="text-xs text-gray-500 mt-4">
          承認されると各機能にアクセスできるようになります。しばらくお待ちください。
        </p>
      </div>

      <button onClick={logout} className="mt-8 flex items-center gap-2 text-sm text-gray-400 hover:text-white transition">
        <LogOut size={16} />
        ログアウト
      </button>
    </div>
  );
}
