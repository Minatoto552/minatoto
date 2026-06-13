import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
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
    const timer = window.setTimeout(collapse, 5000);
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

  return (
    <footer className="fixed inset-x-0 bottom-0 z-50 px-3 pb-safe pointer-events-none">
      <div className={cn('mx-auto flex max-w-md sm:max-w-xl', isExpanded ? 'justify-center' : 'justify-start')}>
        <div
          className={cn(
            'pointer-events-auto overflow-hidden border border-white/10 bg-[#080b12]/88 shadow-[0_20px_60px_rgba(0,0,0,0.65)] backdrop-blur-2xl transition-all duration-300',
            isExpanded ? 'w-full rounded-[28px] p-2' : 'w-auto rounded-full p-1',
          )}
        >
          {!isExpanded ? (
            <button
              type="button"
              onClick={() => setIsExpanded(true)}
              className="flex h-12 w-12 items-center justify-center rounded-full border border-[#d4af37]/25 bg-[#d4af37]/10 text-[#d4af37] opacity-70 transition hover:opacity-100 active:scale-[0.94]"
              aria-label="ナビゲーションを開く"
              title={activeItem.label}
            >
              <Menu size={20} />
              <span className="sr-only">{activeItem.label}</span>
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
