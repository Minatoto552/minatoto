import React, { useState, useEffect } from 'react';
import { useMockApp } from '../../lib/MockAppContext';
import { User, Image as ImageIcon, Save, CheckCircle2 } from 'lucide-react';

export function ProfilePage() {
  const { currentUser, updateProfile } = useMockApp();
  
  const [displayName, setDisplayName] = useState('');
  const [iconUrl, setIconUrl] = useState('');
  const [userCode, setUserCode] = useState('');
  
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (currentUser) {
      setDisplayName(currentUser.displayName || '');
      setIconUrl(currentUser.iconUrl || '');
      setUserCode(currentUser.userCode || '');
    }
  }, [currentUser]);

  if (!currentUser) {
    return <div className="text-center p-8 text-gray-400">ログインが必要です</div>;
  }

  const canRegisterOrders = ['admin', 'staff', 'cast'].includes(currentUser.role) || currentUser.canCreateOrder;

  const handleSave = () => {
    setError(null);
    if (!displayName.trim() || !userCode.trim()) {
      setError('名前とID (user_code) は必須です');
      return;
    }
    
    // userCode validation alphanumeric, underscore, hyphen
    if (!/^[a-zA-Z0-9_-]+$/.test(userCode)) {
      setError('IDは英数字、アンダーバー、ハイフンのみ使用可能です');
      return;
    }

    if (userCode.length < 3 || userCode.length > 20) {
      setError('IDは3文字以上、20文字以下にしてください');
      return;
    }

    try {
      updateProfile(currentUser.id, {
        displayName: displayName.trim(),
        iconUrl: iconUrl.trim(),
        userCode: userCode.trim()
      });
      setToastMessage('プロフィールを更新しました');
      setTimeout(() => setToastMessage(null), 3000);
    } catch (err: any) {
      setError(err.message || '更新に失敗しました');
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 relative max-w-2xl mx-auto">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-black/80 border border-[#d4af37]/30 text-white px-6 py-3 rounded-full text-sm font-medium shadow-lg flex items-center gap-2 animate-in slide-in-from-top-4">
          <CheckCircle2 size={16} className="text-[#d4af37]" />
          {toastMessage}
        </div>
      )}

      <div className="flex items-center justify-between border-b border-[#d4af37]/20 pb-4">
        <h2 className="font-lux text-2xl text-white flex items-center gap-2">
          <User className="text-[#d4af37]" />
          My Profile
        </h2>
      </div>

      <div className="glass-panel p-6 sm:p-8 rounded-xl border-[#d4af37]/30">
        
        {error && (
           <div className="bg-red-500/10 text-red-500 p-3 rounded mb-6 border border-red-500/30 text-sm">
             {error}
           </div>
        )}

        <div className="space-y-6">
           <div className="flex flex-col sm:flex-row gap-6 items-start">
              <div className="flex flex-col items-center gap-3">
                 <div className="w-24 h-24 rounded-full border-2 border-[#d4af37]/50 overflow-hidden bg-black flex items-center justify-center flex-shrink-0">
                    {iconUrl ? (
                      <img src={iconUrl} alt="Profile Icon" className="w-full h-full object-cover" onError={(e) => {
                         (e.target as HTMLImageElement).src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 24 24" fill="none" stroke="gray" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>';
                      }} />
                    ) : (
                      <User size={40} className="text-gray-500" />
                    )}
                 </div>
                 <span className="text-xs text-gray-500">アイコンプレビュー</span>
              </div>
              
              <div className="flex-1 space-y-4 w-full">
                 <div>
                    <label className="text-xs text-gray-400 block mb-1">名前 (表示名)</label>
                    <input 
                      type="text" 
                      value={displayName} 
                      onChange={e => setDisplayName(e.target.value)} 
                      className="w-full bg-black/50 border border-[#d4af37]/30 rounded-lg p-3 text-sm outline-none focus:border-[#d4af37]" 
                    />
                 </div>
                 <div>
                    <label className="text-xs text-gray-400 block mb-1">表示用ID (user_code)</label>
                    <div className="flex items-center">
                       <span className="bg-black/80 border border-r-0 border-[#d4af37]/30 rounded-l-lg p-3 text-sm text-gray-500">@</span>
                       <input 
                         type="text" 
                         value={userCode} 
                         onChange={e => setUserCode(e.target.value)} 
                         className="w-full bg-black/50 border border-[#d4af37]/30 rounded-r-lg p-3 text-sm outline-none focus:border-[#d4af37]"
                         placeholder="英数字、アンダーバー、ハイフンのみ"
                       />
                    </div>
                 </div>
                 <div>
                    <label className="text-xs text-gray-400 block mb-1 flex items-center gap-1"><ImageIcon size={12}/> アイコン画像URL</label>
                    <input 
                      type="text" 
                      value={iconUrl} 
                      onChange={e => setIconUrl(e.target.value)} 
                      className="w-full bg-black/50 border border-[#d4af37]/30 rounded-lg p-3 text-sm outline-none focus:border-[#d4af37]" 
                      placeholder="https://..."
                    />
                 </div>
              </div>
           </div>

           <div className="pt-6 mt-6 border-t border-white/10 space-y-4">
              <h3 className="text-sm font-medium text-gray-300">システム情報 (編集不可)</h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                 <div className="bg-black/30 p-3 rounded border border-white/5">
                    <span className="text-[10px] text-gray-500 block">現在の役割</span>
                    <span className="text-sm font-medium">{currentUser.role}</span>
                 </div>
                 <div className="bg-black/30 p-3 rounded border border-white/5">
                    <span className="text-[10px] text-gray-500 block">承認状態</span>
                    <span className="text-sm font-medium">{currentUser.approvalStatus}</span>
                 </div>
                 <div className="bg-black/30 p-3 rounded border border-white/5">
                    <span className="text-[10px] text-gray-500 block">注文権限</span>
                    <span className="text-sm font-medium">{canRegisterOrders ? 'あり' : 'なし'}</span>
                 </div>
                 <div className="bg-black/30 p-3 rounded border border-white/5">
                    <span className="text-[10px] text-gray-500 block">担当卓</span>
                    <span className="text-sm font-medium">{currentUser.assignedTableId || '未配属'}</span>
                 </div>
              </div>
           </div>

           <div className="pt-6 flex gap-3">
              <button 
                onClick={handleSave} 
                className="flex-1 btn-gold py-3 rounded-xl flex items-center justify-center gap-2"
              >
                 <Save size={18} />
                 保存する
              </button>
           </div>
        </div>
      </div>
    </div>
  );
}
