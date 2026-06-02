import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useMockApp } from '../../lib/MockAppContext';
import { Wine, ArrowLeft, Loader2 } from 'lucide-react';

export function GuestLoginPage() {
  const { login, isAuthReady } = useMockApp();
  const navigate = useNavigate();
  const [loginId, setLoginId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    setIsSubmitting(true);
    try {
      const user = await login(loginId, password);
      if (!user) {
        setError('会員IDまたはパスワードが間違っています。');
        return;
      }

      if (user.role !== 'customer') {
         setError('このアカウントは会員様アカウントではありません。従業員ログインをご利用ください。');
         return;
      }

      if (user.approvalStatus === 'approved') {
        navigate('/guest', { replace: true });
      } else {
        setError('アカウントが利用できません。');
      }
    } catch (e: any) {
      setError(e?.message || 'ログイン処理に失敗しました。');
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
    <div className="flex flex-col items-center justify-center min-h-[80vh] p-4">
      <div className="w-full max-w-md animate-in fade-in duration-500">
        <button onClick={() => window.history.back()} className="inline-flex items-center gap-2 text-gray-500 hover:text-white mb-8 transition-colors">
          <ArrowLeft size={16} /> <span className="text-sm">Back</span>
        </button>
        <div className="text-center mb-8 space-y-2">
          <Wine className="mx-auto text-[#d4af37] mb-4" size={32} />
          <h1 className="font-lux text-3xl tracking-widest gold-gradient-text uppercase font-light">
            Member Login
          </h1>
          <p className="text-xs text-gray-400">会員様向けのログイン画面です</p>
        </div>

        <form onSubmit={handleSubmit} className="glass-panel p-6 sm:p-8 rounded-2xl border border-[#d4af37]/20 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#d4af37]/50 to-transparent"></div>
          
          {error && (
            <div className="mb-6 p-3 bg-red-900/30 border border-red-500/30 text-red-400 text-xs rounded-lg text-center">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div>
               <label className="block text-xs text-gray-400 mb-1">会員ID</label>
               <input
                 type="text"
                 value={loginId}
                 onChange={(e) => setLoginId(e.target.value)}
                 className="w-full bg-black/50 border border-white/10 rounded-lg p-3 text-sm focus:border-[#d4af37] outline-none text-white tracking-wider placeholder-gray-600"
                 placeholder="IDを入力"
                 required
               />
            </div>
            <div>
               <label className="block text-xs text-gray-400 mb-1">パスワード</label>
               <input
                 type="password"
                 value={password}
                 onChange={(e) => setPassword(e.target.value)}
                 className="w-full bg-black/50 border border-white/10 rounded-lg p-3 text-sm focus:border-[#d4af37] outline-none text-white tracking-wider placeholder-gray-600"
                 placeholder="パスワードを入力"
                 required
               />
            </div>
            
            <button type="submit" disabled={isSubmitting} className="w-full btn-gold py-4 rounded-xl text-sm font-bold tracking-widest mt-6 uppercase disabled:opacity-60 disabled:cursor-not-allowed">
              {isSubmitting ? '確認中...' : 'ログイン'}
            </button>
          </div>
        </form>

        <div className="mt-8 text-center flex flex-col items-center gap-4">
          <Link to="/guest-register" className="text-sm text-[#d4af37] hover:text-white transition-colors">
            はじめての方はこちら（新規登録）
          </Link>
          <div className="w-12 h-px bg-white/10"></div>
          <Link to="/login" className="text-sm text-gray-500 hover:text-gray-300 transition-colors">
            従業員ログインはこちら
          </Link>
        </div>
      </div>
    </div>
  );
}
