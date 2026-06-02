import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useMockApp } from '../../lib/MockAppContext';
import { Wine, Lock, User } from 'lucide-react';

export function LoginPage() {
  const [loginId, setLoginId] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login, hasSeenOpening } = useMockApp();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    if (!loginId || !password) {
      setErrorMsg('ログインIDとパスワードを入力してください。');
      return;
    }
    
    setIsSubmitting(true);
    try {
      const user = await login(loginId, password);
      if (!user) {
        setErrorMsg('ログインIDまたはパスワードが間違っています。');
        return;
      }
      if (user.role === 'customer') {
        setErrorMsg('このアカウントは会員様アカウントです。会員様ログインをご利用ください。');
        return;
      }
      if (hasSeenOpening) {
        navigate(user.role === 'admin' ? '/app/admin' : '/app/staff', { replace: true });
      } else {
        navigate('/opening', { replace: true });
      }
    } catch (e: any) {
      setErrorMsg(e?.message || 'ログイン処理に失敗しました。');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] p-4">
      <div className="w-full max-w-md animate-in fade-in zoom-in-95 duration-700">
        <div className="text-center mb-8 space-y-4">
          <Wine className="mx-auto text-[#d4af37]" size={48} />
          <h1 className="font-lux text-4xl tracking-[0.2em] gold-gradient-text uppercase font-light">
            Enter Nakiya_Bar
          </h1>
          <p className="text-gray-500 text-sm tracking-widest uppercase">Staff & Cast Portal</p>
        </div>

        <form onSubmit={handleSubmit} className="glass-panel p-8 rounded-2xl shadow-[0_0_40px_rgba(0,0,0,0.8)] border border-[#d4af37]/20 relative overflow-hidden">
          {/* Subtle glow effect */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#d4af37] opacity-5 rounded-full blur-[80px] pointer-events-none"></div>

          <div className="space-y-6 relative z-10">
            {errorMsg && (
              <div className="bg-red-500/10 border border-red-500/50 text-red-500 text-xs p-3 rounded-lg text-center">
                {errorMsg}
              </div>
            )}
            <div>
              <label className="block text-xs text-gray-400 mb-2 tracking-wider uppercase">Login ID</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                <input
                  type="text"
                  required
                  value={loginId}
                  onChange={(e) => setLoginId(e.target.value)}
                  className="w-full bg-black/50 border border-white/10 rounded-lg py-3 pl-10 pr-4 text-white placeholder-gray-600 focus:outline-none focus:border-[#d4af37] transition-colors"
                  placeholder="admin / staff / cast"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs text-gray-400 mb-2 tracking-wider uppercase">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-black/50 border border-white/10 rounded-lg py-3 pl-10 pr-4 text-white placeholder-gray-600 focus:outline-none focus:border-[#d4af37] transition-colors"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button type="submit" disabled={isSubmitting} className="w-full btn-gold py-4 rounded-xl text-sm tracking-widest uppercase mt-4 disabled:opacity-60 disabled:cursor-not-allowed">
              {isSubmitting ? 'Checking...' : 'Enter'}
            </button>
          </div>
        </form>

        <div className="mt-8 text-center flex flex-col items-center gap-4">
          <Link to="/register" className="text-sm text-gray-400 hover:text-[#d4af37] transition-colors">
            従業員アカウント作成はこちら
          </Link>
          <div className="w-12 h-px bg-white/10"></div>
          <Link to="/guest-login" className="text-sm text-[#d4af37] hover:text-white transition-colors">
            会員様（お客様）ログインはこちら
          </Link>
        </div>
      </div>
    </div>
  );
}
