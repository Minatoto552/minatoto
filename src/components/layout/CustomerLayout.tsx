import React from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { BellRing, LogOut, Wine } from 'lucide-react';
import { cn } from '../../lib/utils';
import { useMockApp } from '../../lib/MockAppContext';
import { getCustomerNavigation } from '../../hooks/useRoleNavigation';
import { getRotationLabel } from '../../hooks/usePlacements';
import { EmergencyCallNotification } from '../ui/EmergencyCallNotification';
import { EmergencyHelpButton } from '../ui/EmergencyHelpButton';
import { CollapsibleBottomNav } from './CollapsibleBottomNav';
import { ProfileAvatar } from '../ui/ProfileAvatar';
import { AppleBarScene } from '../visual/AppleBarScene';

export function CustomerLayout() {
  const { currentUser, logout, currentRotationNumber, announcements } = useMockApp();
  const navigate = useNavigate();
  const navItems = getCustomerNavigation();

  const topAnnouncement = announcements
    .filter(announcement => announcement.isActive && (announcement.targetRole === 'all' || announcement.targetRole === 'customer'))
    .sort((a, b) => {
      const priority = { emergency: 3, important: 2, normal: 1 };
      return priority[b.type] - priority[a.type];
    })[0];

  const handleLogout = () => {
    logout();
    navigate('/guest-login', { replace: true });
  };

  return (
    <div className="app-shell min-h-screen text-[#e0e0e0] font-sans">
      <AppleBarScene />
      <EmergencyCallNotification />
      <EmergencyHelpButton />

      {topAnnouncement && (
        <div
          className={cn(
            'sticky top-0 z-50 flex items-center gap-2 px-4 py-2 text-sm font-bold text-white',
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
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-3">
          <button type="button" onClick={() => navigate('/guest')} className="flex min-w-0 items-center gap-3 text-left">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-[#d4af37]/40 bg-[#d4af37]/10 text-[#d4af37]">
              <Wine size={22} />
            </div>
            <div className="min-w-0">
              <p className="gold-gradient-text truncate text-lg font-black tracking-[0.16em]">NAKIYA_BAR</p>
              <p className="truncate text-[11px] text-gray-500">{getRotationLabel(currentRotationNumber)}</p>
            </div>
            </button>

          <div className="flex items-center gap-2">
            <Link to="/guest/profile" className="flex h-11 items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.04] px-2.5">
              <ProfileAvatar
                src={currentUser?.iconUrl}
                name={currentUser?.displayName}
                version={currentUser?.profileImageUpdatedAt}
                className="h-8 w-8 rounded-xl"
              />
              <span className="hidden max-w-[120px] truncate text-xs font-bold text-white sm:block">{currentUser?.displayName}</span>
            </Link>
            <button type="button" onClick={handleLogout} className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] text-gray-400">
              <LogOut size={20} />
            </button>
          </div>
        </div>
      </header>

      <main className="relative z-10 mx-auto w-full max-w-md px-4 py-4 pb-20 sm:max-w-4xl sm:px-6">
        <Outlet />
      </main>

      <CollapsibleBottomNav items={navItems} rootPath="/guest" />
    </div>
  );
}
