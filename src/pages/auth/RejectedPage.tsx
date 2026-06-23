import React from 'react';
import { useVrcBarApp } from '../../lib/VrcBarAppContext';
import { ShieldAlert, LogOut } from 'lucide-react';

export function RejectedPage() {
  const { logout } = useVrcBarApp();

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] p-4 text-center animate-in fade-in duration-500">
      <div className="w-24 h-24 rounded-full bg-red-950/20 border border-red-500/30 flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(239,68,68,0.1)]">
        <ShieldAlert className="text-red-500" size={40} />
      </div>
      
      <h2 className="font-lux text-3xl text-red-500 tracking-widest mb-4 uppercase">Rejected</h2>
      
      <div className="glass-panel p-6 rounded-2xl max-w-sm w-full mx-auto space-y-4">
        <p className="text-sm text-gray-300 leading-relaxed">
          申し訳ありません。あなたのアカウントの承認は拒否されました。<br/>
          詳細については管理者にお問い合わせください。
        </p>
      </div>

      <button onClick={logout} className="mt-8 flex items-center gap-2 text-sm text-gray-400 hover:text-white transition">
        <LogOut size={16} />
        ログアウトして終了
      </button>
    </div>
  );
}
