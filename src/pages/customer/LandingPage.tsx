import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMockApp } from '../../lib/MockAppContext';
import { Wine, Users, User } from 'lucide-react';

export function LandingPage() {
  const { currentUser, isAuthReady, isProfileLoading, hasSeenOpening } = useMockApp();
  const navigate = useNavigate();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 100);
    return () => clearTimeout(t);
  }, []);

  // Auto-redirect if already logged in
  useEffect(() => {
    if (!isAuthReady || isProfileLoading) return;
    if (!currentUser) return;
    if (currentUser.role === 'customer') {
      navigate('/guest', { replace: true });
    } else {
      if (!hasSeenOpening) {
        navigate('/opening', { replace: true });
      } else {
        navigate('/app', { replace: true });
      }
    }
  }, [currentUser, isAuthReady, isProfileLoading, hasSeenOpening, navigate]);

  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen overflow-hidden bg-[#050505]">
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(5,5,5,0.58),rgba(5,5,5,0.9)),url('https://images.unsplash.com/photo-1514933651103-005eec06c04b?auto=format&fit=crop&w=1800&q=80')] bg-cover bg-center" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_42%,rgba(212,175,55,0.12),transparent_38%),linear-gradient(180deg,rgba(0,0,0,0.2),rgba(0,0,0,0.85))]" />

      {/* Horizontal decorative lines */}
      <div className="pointer-events-none absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#d4af37]/30 to-transparent" />
      <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#d4af37]/30 to-transparent" />

      <div
        className="relative z-10 w-full max-w-sm mx-auto px-6 flex flex-col items-center"
        style={{
          opacity: visible ? 1 : 0,
          transform: visible ? 'translateY(0)' : 'translateY(20px)',
          transition: 'opacity 0.8s ease, transform 0.8s ease',
        }}
      >
        {/* Logo */}
        <div className="mb-10 flex flex-col items-center gap-3">
          <div className="relative">
            <Wine size={52} className="text-[#d4af37] drop-shadow-[0_0_20px_rgba(212,175,55,0.4)]" />
          </div>
          <h1 className="font-lux text-4xl tracking-[0.25em] gold-gradient-text uppercase font-light text-center">
            Nakiya_Bar
          </h1>
          <div className="flex items-center gap-3 w-32">
            <div className="flex-1 h-px bg-[#d4af37]/40" />
            <div className="w-1 h-1 rounded-full bg-[#d4af37]/60" />
            <div className="flex-1 h-px bg-[#d4af37]/40" />
          </div>
          <p className="text-[10px] text-gray-500 tracking-[0.4em] uppercase">VRC Bar Management</p>
        </div>

        {/* Buttons */}
        <div className="w-full space-y-4">
          {/* Staff / Cast Login */}
          <button
            onClick={() => navigate('/login')}
            className="w-full group relative overflow-hidden btn-gold py-4 rounded-2xl flex items-center justify-center gap-3 text-sm font-bold tracking-widest uppercase shadow-[0_0_30px_rgba(212,175,55,0.15)] transition-all hover:shadow-[0_0_40px_rgba(212,175,55,0.3)]"
          >
            <User size={18} />
            <span>Staff / Cast Login</span>
          </button>

          <div className="relative flex items-center justify-center">
            <div className="flex-1 h-px bg-white/10" />
            <span className="mx-4 text-[10px] tracking-widest text-gray-600 uppercase">または</span>
            <div className="flex-1 h-px bg-white/10" />
          </div>

          {/* Guest / Member Login */}
          <button
            onClick={() => navigate('/guest-login')}
            className="w-full btn-outline-gold py-4 rounded-2xl flex items-center justify-center gap-3 text-sm font-bold tracking-widest uppercase transition-all hover:shadow-[0_0_20px_rgba(212,175,55,0.15)]"
          >
            <Users size={18} />
            <span>会員様ログイン</span>
          </button>
        </div>

        <p className="mt-12 text-[10px] text-gray-600 tracking-widest text-center uppercase">
          Exclusive VRC Members Bar
        </p>
      </div>
    </div>
  );
}
