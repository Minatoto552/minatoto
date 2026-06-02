import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useMockApp } from '../../lib/MockAppContext';
import { Wine, ArrowLeft } from 'lucide-react';
import { cn } from '../../lib/utils';

export function RegisterPage() {
  const { register } = useMockApp();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    loginId: '',
    password: '',
    displayName: '',
    vrcName: '',
    iconUrl: '',
    requestedRole: 'staff' as 'staff' | 'cast' | 'admin'
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
        vrcName: formData.vrcName,
        iconUrl: formData.iconUrl,
        requestedRole: formData.requestedRole
      });
      
      navigate('/opening', { replace: true });
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[90vh] p-4 py-12">
      <div className="w-full max-w-md animate-in fade-in duration-500">
        
        <Link to="/login" className="inline-flex items-center gap-2 text-gray-500 hover:text-white mb-8 transition-colors">
          <ArrowLeft size={16} /> <span className="text-sm">Back to Login</span>
        </Link>
        
        <div className="text-center mb-8 space-y-2">
          <Wine className="mx-auto text-[#d4af37] mb-4" size={32} />
          <h1 className="font-lux text-3xl tracking-widest gold-gradient-text uppercase font-light">
            Registration
          </h1>
          <p className="text-xs text-gray-500">Nakiya_Barへようこそ。アカウント情報を入力してください。</p>
        </div>

        <form onSubmit={handleSubmit} className="glass-panel p-6 sm:p-8 rounded-2xl border border-[#d4af37]/20 space-y-6">
          
          <div className="space-y-4">
            <div>
              <label className="block text-xs text-gray-400 mb-1">ログインID <span className="text-red-500">*</span></label>
              <input type="text" name="loginId" value={formData.loginId} required onChange={handleChange} placeholder="半角英数字" className="w-full bg-black/50 border border-white/10 rounded-lg p-3 text-sm focus:border-[#d4af37] outline-none" />
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
              <label className="block text-xs text-gray-400 mb-1">VRChat表示名</label>
              <input type="text" name="vrcName" onChange={handleChange} placeholder="VRChatでの名前" className="w-full bg-black/50 border border-white/10 rounded-lg p-3 text-sm focus:border-[#d4af37] outline-none" />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">アイコン画像URL</label>
              <input type="url" name="iconUrl" onChange={handleChange} placeholder="https://..." className="w-full bg-black/50 border border-white/10 rounded-lg p-3 text-sm focus:border-[#d4af37] outline-none" />
            </div>
          </div>

          <div className="pt-2">
            <label className="block text-xs text-gray-400 mb-3">希望役割</label>
            <div className="grid grid-cols-3 gap-3">
              {[
                { id: 'staff', label: 'スタッフ' },
                { id: 'cast', label: 'キャスト' },
                { id: 'admin', label: '運営' },
              ].map(role => (
                <button
                  key={role.id}
                  type="button"
                  onClick={() => setFormData({ ...formData, requestedRole: role.id as any })}
                  className={cn(
                    "py-3 rounded-lg text-xs font-medium border flex items-center justify-center transition-all",
                    formData.requestedRole === role.id 
                      ? "bg-[#2a080a] border-[#d4af37] text-[#d4af37] shadow-[0_0_10px_rgba(212,175,55,0.2)]" 
                      : "bg-black/30 border-white/10 text-gray-500 hover:border-gray-500"
                  )}
                >
                  {role.label}
                </button>
              ))}
            </div>
            <p className="text-[10px] text-gray-500 mt-3 leading-relaxed">
              ※運営権限および注文作成権限は、登録後に既存の運営ユーザーによる承認が必要です。<br/>
              ※承認までは「承認待ち」となり、各機能にアクセスできません。
            </p>
          </div>

          <button type="submit" disabled={isSubmitting} className="w-full btn-gold py-4 rounded-xl text-sm tracking-widest mt-6 disabled:opacity-60 disabled:cursor-not-allowed">
            {isSubmitting ? '送信中...' : '登録申請を送信'}
          </button>
        </form>
      </div>
    </div>
  );
}
