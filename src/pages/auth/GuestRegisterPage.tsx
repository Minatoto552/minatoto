import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useVrcBarApp } from '../../lib/VrcBarAppContext';
import { Wine, ArrowLeft, Loader2 } from 'lucide-react';

export function GuestRegisterPage() {
  const { register, isAuthReady } = useVrcBarApp();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    loginId: '',
    password: '',
    displayName: '',
    iconUrl: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.loginId || !formData.displayName || !formData.password) return;
    
    setIsSubmitting(true);
    try {
      await register({
        loginId: formData.loginId,
        password: formData.password,
        displayName: formData.displayName,
        vrcName: '',
        iconUrl: formData.iconUrl,
        requestedRole: null, 
      }, 'customer');
      
      navigate('/guest', { replace: true });
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isAuthReady) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-gray-400 gap-4">
        <Loader2 className="animate-spin text-[#d4af37]" size={32} />
        <div className="text-sm font-lux tracking-widest uppercase">認証サービスを準備中...</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[90vh] p-4 py-12">
      <div className="w-full max-w-md animate-in fade-in duration-500">
        
        <button onClick={() => window.history.back()} className="inline-flex items-center gap-2 text-gray-500 hover:text-white mb-8 transition-colors">
          <ArrowLeft size={16} /> <span className="text-sm">Back</span>
        </button>
        
        <div className="text-center mb-8 space-y-2">
          <Wine className="mx-auto text-[#d4af37] mb-4" size={32} />
          <h1 className="font-lux text-3xl tracking-widest gold-gradient-text uppercase font-light">
            Member Registration
          </h1>
          <p className="text-xs text-gray-500">Nakiya_Bar 会員登録</p>
        </div>

        <form onSubmit={handleSubmit} className="glass-panel p-6 sm:p-8 rounded-2xl border border-[#d4af37]/20 space-y-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-full h-1 bg-gradient-to-l from-transparent via-[#d4af37]/50 to-transparent"></div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-xs text-gray-400 mb-1">会員ID（半角英数字3〜20文字） <span className="text-red-500">*</span></label>
              <input type="text" name="loginId" value={formData.loginId} required minLength={3} maxLength={20} pattern="[a-zA-Z0-9_\-]+" title="半角英数字、アンダーバー、ハイフンのみ" onChange={handleChange} placeholder="例: guest_001" className="w-full bg-black/50 border border-white/10 rounded-lg p-3 text-sm focus:border-[#d4af37] outline-none" />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">パスワード <span className="text-red-500">*</span></label>
              <input type="password" name="password" value={formData.password} required onChange={handleChange} className="w-full bg-black/50 border border-white/10 rounded-lg p-3 text-sm focus:border-[#d4af37] outline-none" />
            </div>
          </div>

          <div className="border-t border-white/10 pt-4 space-y-4">
            <div>
              <label className="block text-xs text-gray-400 mb-1">表示名 <span className="text-red-500">*</span></label>
              <input type="text" name="displayName" required onChange={handleChange} placeholder="例: 太郎" className="w-full bg-black/50 border border-white/10 rounded-lg p-3 text-sm focus:border-[#d4af37] outline-none" />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">アイコン画像URL（任意）</label>
              <input type="url" name="iconUrl" onChange={handleChange} placeholder="https://..." className="w-full bg-black/50 border border-white/10 rounded-lg p-3 text-sm focus:border-[#d4af37] outline-none" />
            </div>
          </div>

          <button type="submit" disabled={isSubmitting} className="w-full btn-gold py-4 rounded-xl text-sm tracking-widest mt-6 font-bold text-black uppercase disabled:opacity-60 disabled:cursor-not-allowed">
            {isSubmitting ? '登録中...' : '登録して入場する'}
          </button>
        </form>

        <div className="mt-8 text-center flex flex-col items-center gap-4">
          <Link to="/guest-login" className="text-sm text-gray-400 hover:text-[#d4af37] transition-colors">
            すでに会員の方はこちら（ログイン）
          </Link>
        </div>
      </div>
    </div>
  );
}
