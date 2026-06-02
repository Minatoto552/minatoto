import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronUp, X } from 'lucide-react';
import { cn } from '../../lib/utils';
import type { RoleNavItem } from '../../hooks/useRoleNavigation';

interface CollapsibleBottomNavProps {
  items: RoleNavItem[];
  rootPath: '/app' | '/guest';
}

export function CollapsibleBottomNav({ items, rootPath }: CollapsibleBottomNavProps) {
  const location = useLocation();
  const [isExpanded, setIsExpanded] = React.useState(false);

  React.useEffect(() => {
    setIsExpanded(false);
  }, [location.pathname, location.search]);

  React.useEffect(() => {
    if (!isExpanded) return undefined;

    const collapse = () => setIsExpanded(false);
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') collapse();
    };
    const timer = window.setTimeout(collapse, 7000);
    window.addEventListener('scroll', collapse, { passive: true });
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.clearTimeout(timer);
      window.removeEventListener('scroll', collapse);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isExpanded]);

  if (items.length === 0) return null;

  const isItemActive = (item: RoleNavItem) => {
    if (location.pathname === '/app/order' && (item.path === '/app/order' || item.path === '/app/staff')) return true;
    return location.pathname === item.path || (item.path !== rootPath && location.pathname.startsWith(item.path));
  };

  const activeItem = items.find(isItemActive) || items[0];
  const ActiveIcon = activeItem.icon;

  return (
    <footer className="fixed inset-x-0 bottom-0 z-50 px-3 pb-safe pointer-events-none">
      <div className="mx-auto flex max-w-md justify-center sm:max-w-xl">
        <div
          className={cn(
            'pointer-events-auto w-full overflow-hidden border border-white/10 bg-[#080b12]/88 shadow-[0_20px_60px_rgba(0,0,0,0.65)] backdrop-blur-2xl transition-all duration-300',
            isExpanded ? 'rounded-[28px] p-2' : 'max-w-[260px] rounded-[24px] p-1.5',
          )}
        >
          {!isExpanded ? (
            <button
              type="button"
              onClick={() => setIsExpanded(true)}
              className="flex min-h-[54px] w-full items-center justify-between gap-3 rounded-[20px] border border-[#d4af37]/25 bg-[#d4af37]/10 px-3 text-left text-white active:scale-[0.98]"
              aria-label="ナビゲーションを開く"
            >
              <span className="flex min-w-0 items-center gap-2">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[#d4af37] text-black">
                  <ActiveIcon size={20} />
                </span>
                <span className="min-w-0">
                  <span className="block truncate text-[10px] font-black uppercase tracking-[0.18em] text-[#d4af37]">NAV</span>
                  <span className="block truncate text-sm font-black">{activeItem.label}</span>
                </span>
              </span>
              <ChevronUp size={19} className="shrink-0 text-[#d4af37]" />
            </button>
          ) : (
            <div className="space-y-2">
              <div className="flex items-center justify-between px-2">
                <span className="text-[10px] font-black uppercase tracking-[0.28em] text-[#d4af37]">Quick Navigation</span>
                <button
                  type="button"
                  onClick={() => setIsExpanded(false)}
                  className="flex h-9 w-9 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] text-gray-300"
                  aria-label="ナビゲーションを閉じる"
                >
                  <X size={16} />
                </button>
              </div>
              <nav className="grid grid-cols-5 gap-1">
                {items.map(item => {
                  const isActive = isItemActive(item);
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      className={cn(
                        'relative flex min-h-[62px] flex-col items-center justify-center gap-1 rounded-[22px] px-1 text-center transition active:scale-[0.97]',
                        isActive
                          ? 'bg-[#d4af37] text-black shadow-[0_10px_26px_rgba(212,175,55,0.22)]'
                          : 'text-gray-500 hover:bg-white/[0.06] hover:text-gray-200',
                      )}
                    >
                      <item.icon size={22} />
                      <span className="text-[10px] font-black leading-none tracking-wide">{item.shortLabel}</span>
                    </Link>
                  );
                })}
              </nav>
            </div>
          )}
        </div>
      </div>
    </footer>
  );
}
