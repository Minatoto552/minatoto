import React from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { AlertTriangle, BellRing, LogOut, User, Wine } from 'lucide-react';
import { cn } from '../../lib/utils';
import { useMockApp, type EventStatus } from '../../lib/MockAppContext';
import { getEmployeeNavigation } from '../../hooks/useRoleNavigation';
import { getRotationLabel } from '../../hooks/usePlacements';
import { EmergencyCallNotification } from '../ui/EmergencyCallNotification';
import { EmergencyHelpButton } from '../ui/EmergencyHelpButton';
import { CollapsibleBottomNav } from './CollapsibleBottomNav';

const EVENT_STATUS_LABELS: Record<EventStatus, string> = {
  before_open: '営業前',
  rotation_1: '第1ローテ',
  rotation_2: '第2ローテ',
  rotation_3: '第3ローテ',
  rotation_4: '第4ローテ',
  closed: '営業終了',
};

export function AppLayout() {
  const {
    currentUser,
    logout,
    isAuthReady,
    isProfileLoading,
    currentRotationNumber,
    eventStatus,
    announcements,
    emergencyCalls,
  } = useMockApp();
  const navigate = useNavigate();
  const location = useLocation();

  const isAuthScreen = location.pathname === '/login' || location.pathname === '/register' || location.pathname === '/opening';
  const navItems = getEmployeeNavigation(currentUser?.role);
  const activeEmergencyCount = emergencyCalls.filter(call => call.status === 'active').length;
  const topAnnouncement = announcements
    .filter(announcement => {
      if (!announcement.isActive) return false;
      if (announcement.targetRole === 'all') return true;
      if (currentUser?.role === 'admin') return true;
      return announcement.targetRole === currentUser?.role;
    })
    .sort((a, b) => {
      const priority = { emergency: 3, important: 2, normal: 1 };
      return priority[b.type] - priority[a.type];
    })[0];

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  if (isAuthScreen) {
    return (
      <div className="min-h-screen bg-[#050505] text-[#e0e0e0] font-sans overflow-x-hidden">
        <Outlet />
      </div>
    );
  }

  if (!isAuthReady || isProfileLoading) {
    return (
      <div className="min-h-screen bg-[#050505] text-[#e0e0e0] font-sans flex items-center justify-center p-6">
        <div className="iphone-card p-8 text-center">
          <Wine className="mx-auto mb-4 text-[#d4af37] animate-glow-pulse" size={38} />
          <p className="text-sm text-gray-300 tracking-widest">ログイン情報を確認中...</p>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-[#050505] text-[#e0e0e0] font-sans flex items-center justify-center p-6">
        <div className="iphone-card p-8 text-center space-y-4">
          <Wine className="mx-auto text-[#d4af37]" size={40} />
          <p className="text-sm text-gray-300">ログイン情報を確認できませんでした。</p>
          <Link to="/login" className="btn-gold inline-flex items-center justify-center rounded-2xl px-6 py-3 text-sm font-bold">
            ログインへ
          </Link>
        </div>
      </div>
    );
  }

  if (currentUser.isDeleted) {
    return (
      <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-black p-6 text-center">
        <div className="neon-alert mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-red-500/20 text-red-300">
          <AlertTriangle size={40} />
        </div>
        <h2 className="gold-gradient-text mb-4 text-2xl font-black tracking-[0.22em]">ACCOUNT DISABLED</h2>
        <p className="max-w-sm text-sm leading-6 text-gray-300">
          このアカウントは管理者により停止されています。
        </p>
        {currentUser.deleteReason && (
          <p className="mt-4 rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-xs text-red-200">
            理由: {currentUser.deleteReason}
          </p>
        )}
        <button onClick={handleLogout} className="btn-gold mt-6 rounded-2xl px-8 py-3 text-sm font-bold">
          ログアウト
        </button>
      </div>
    );
  }

  return (
    <div className="app-shell min-h-screen text-[#e0e0e0] font-sans">
      <EmergencyCallNotification />
      <EmergencyHelpButton />

      {topAnnouncement && (
        <div
          className={cn(
            'sticky top-0 z-50 flex items-center gap-2 px-4 py-2 text-sm font-bold text-white shadow-[0_0_30px_rgba(0,0,0,0.4)]',
            topAnnouncement.type === 'emergency'
              ? 'bg-red-700 neon-alert'
              : topAnnouncement.type === 'important'
                ? 'bg-[#8a5f09]'
                : 'bg-[linear-gradient(90deg,#4e070c,#7b1113,#4e070c)]',
          )}
        >
          <BellRing size={16} className="shrink-0 text-[#f8e7a2]" />
          <span className="min-w-0 flex-1 truncate text-center">{topAnnouncement.title}</span>
        </div>
      )}

      <header className="sticky top-0 z-40 border-b border-white/10 bg-[#05070c]/78 px-4 py-3 backdrop-blur-2xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3">
          <button type="button" onClick={() => navigate('/app')} className="flex min-w-0 items-center gap-3 text-left">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-[#d4af37]/40 bg-[#d4af37]/10 text-[#d4af37]">
              <Wine size={22} />
            </div>
            <div className="min-w-0">
              <p className="gold-gradient-text truncate text-lg font-black tracking-[0.16em]">NAKIYA_BAR</p>
              <p className="truncate text-[11px] text-gray-500">
                {EVENT_STATUS_LABELS[eventStatus]} / {getRotationLabel(currentRotationNumber)}
              </p>
            </div>
          </button>

          <div className="flex items-center gap-2">
            {activeEmergencyCount > 0 && (
              <Link to="/app/staff" className="neon-alert flex h-11 items-center gap-2 rounded-2xl bg-red-600/20 px-3 text-sm font-black text-red-100">
                <AlertTriangle size={17} />
                {activeEmergencyCount}
              </Link>
            )}
            <Link to="/app/profile" className="flex h-11 items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.04] px-2.5">
              {currentUser.iconUrl ? (
                <img src={currentUser.iconUrl} alt="" className="h-8 w-8 rounded-xl object-cover" />
              ) : (
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/10 text-[#d4af37]">
                  <User size={16} />
                </div>
              )}
              <span className="hidden max-w-[120px] truncate text-xs font-bold text-white sm:block">{currentUser.displayName}</span>
            </Link>
            <button type="button" onClick={handleLogout} className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] text-gray-400">
              <LogOut size={20} />
            </button>
          </div>
        </div>
      </header>

      <main className="relative z-10 mx-auto w-full max-w-md px-4 py-4 pb-32 sm:max-w-5xl sm:px-6 lg:px-8">
        <Outlet />
      </main>

      {currentUser.approvalStatus === 'approved' && <CollapsibleBottomNav items={navItems} rootPath="/app" />}
    </div>
  );
}
