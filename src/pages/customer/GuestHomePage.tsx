import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, BellRing, BookOpen, Star, Ticket, UserCircle, Users, Wine, type LucideIcon } from 'lucide-react';
import { ProfileAvatar } from '../../components/ui/ProfileAvatar';
import { cn } from '../../lib/utils';
import { useMockApp } from '../../lib/MockAppContext';
import { getRotationLabel, usePlacements } from '../../hooks/usePlacements';

export function GuestHomePage() {
  const {
    currentUser,
    currentRotationNumber,
    announcements,
    products,
    customerStamps,
  } = useMockApp();
  const { currentCastPlacements } = usePlacements();

  const activeAnnouncements = announcements.filter(announcement =>
    announcement.isActive && (announcement.targetRole === 'all' || announcement.targetRole === 'customer')
  );
  const pointTotal = customerStamps
    .filter(point => point.customerMemberId === currentUser?.id)
    .reduce((sum, point) => sum + (point.points ?? 0), 0);
  const recommendedProducts = products.filter(product => product.isAvailable && product.isRecommended && !product.isDeleted);
  const visibleCasts = currentCastPlacements.slice(0, 4);

  return (
    <div className="app-home-space">
      <section className="iphone-card relative overflow-hidden p-5">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#d4af37]/70 to-transparent" />
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[11px] uppercase tracking-[0.3em] text-[#d4af37]">Welcome</p>
            <h1 className="mt-2 text-2xl font-black text-white">
              {currentUser?.displayName || 'Guest'} 様
            </h1>
            <p className="mt-2 text-sm leading-6 text-gray-400">
              メニュー閲覧、ポイント、抽選、ゲームをここからすぐに使えます。
            </p>
          </div>
          <div className="home-hero-icon">
            <Wine size={26} />
          </div>
        </div>

        <div className="mt-5 grid grid-cols-3 gap-2">
          <MiniStat label="現在" value={getRotationLabel(currentRotationNumber)} />
          <MiniStat label="ポイント" value={`${pointTotal} pt`} tone="green" />
          <MiniStat label="キャスト" value={`${currentCastPlacements.length}名`} />
        </div>
      </section>

      {activeAnnouncements.length > 0 && (
        <div className="space-y-3">
          {activeAnnouncements.slice(0, 2).map(announcement => (
            <div
              key={announcement.id}
              className={cn(
                'iphone-card p-4',
                announcement.type === 'emergency' && 'neon-alert bg-red-500/10',
              )}
            >
              <div className="flex items-start gap-3">
                <BellRing className={announcement.type === 'emergency' ? 'text-red-300' : 'text-[#d4af37]'} size={18} />
                <div className="min-w-0">
                  <p className="text-sm font-bold text-white">{announcement.title}</p>
                  <p className="mt-1 line-clamp-2 text-xs leading-5 text-gray-400">{announcement.body}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
        <ActionCard to="/guest/menu" icon={BookOpen} title="メニューを見る" description="ご注文はスタッフへ" highlight />
        <ActionCard to="/guest/point" icon={UserCircle} title="ポイント" description={`${pointTotal} pt`} />
        <ActionCard to="/guest/lottery" icon={Ticket} title="抽選" description="ポイントで応募" />
        <ActionCard to="/guest/game" icon={Star} title="ゲーム" description="チンチロ" />
      </div>

      <SectionHeader title="本日のキャスト" to="/guest/casts" />
      <div className="iphone-card p-4">
        {visibleCasts.length === 0 ? (
          <EmptyLine icon={Users} text="本日のキャスト配置はまだ公開されていません。" />
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {visibleCasts.map(cast => (
              <div key={cast.id} className="rounded-3xl border border-white/10 bg-white/[0.04] p-3">
                <div className="flex items-center gap-3">
                  <ProfileAvatar
                    src={cast.iconUrl}
                    name={cast.displayName}
                    version={cast.profileImageUpdatedAt}
                    className="h-11 w-11 shrink-0 rounded-2xl border border-[#d4af37]/40 bg-[#d4af37]/10"
                  />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold text-white">{cast.displayName}</p>
                    <p className="text-xs text-gray-500">{cast.tableNumber}卓</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <SectionHeader title="おすすめメニュー" to="/guest/menu" />
      <div className="iphone-card p-4">
        {recommendedProducts.length === 0 ? (
          <EmptyLine icon={BookOpen} text="おすすめメニューはまだ登録されていません。" />
        ) : (
          <div className="space-y-3">
            {recommendedProducts.slice(0, 3).map(product => (
              <div key={product.id} className="flex items-center gap-3 rounded-3xl border border-white/10 bg-white/[0.04] p-3">
                <img src={product.imageUrl} alt="" className="h-12 w-12 rounded-2xl object-cover" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-bold text-white">{product.name}</p>
                  <p className="truncate text-xs text-gray-500">{product.description}</p>
                </div>
                <p className="text-sm font-black text-[#d4af37]">{product.price}pt</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function MiniStat({ label, value, tone = 'gold' }: { label: string; value: string; tone?: 'gold' | 'green' }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.06] p-3">
      <p className="text-[10px] tracking-widest text-gray-500">{label}</p>
      <p className={cn('mt-1 truncate text-sm font-black', tone === 'green' ? 'text-emerald-300' : 'text-[#d4af37]')}>
        {value}
      </p>
    </div>
  );
}

function ActionCard({
  to,
  icon: Icon,
  title,
  description,
  highlight,
}: {
  to: string;
  icon: LucideIcon;
  title: string;
  description: string;
  highlight?: boolean;
}) {
  return (
    <Link
      to={to}
      className={cn(
        'iphone-card min-h-[132px] p-4 flex flex-col justify-between active:scale-[0.98] transition',
        highlight && 'ring-1 ring-[#d4af37]/55 shadow-[0_0_30px_rgba(212,175,55,0.16)]',
      )}
    >
      <div className="flex items-center justify-between">
        <div className="metric-icon metric-icon-gold">
          <Icon size={18} />
        </div>
        <ArrowRight size={16} className="text-gray-500" />
      </div>
      <div>
        <p className="text-sm font-bold text-white">{title}</p>
        <p className="mt-1 text-xs text-gray-500">{description}</p>
      </div>
    </Link>
  );
}

function SectionHeader({ title, to }: { title: string; to: string }) {
  return (
    <div className="flex items-center justify-between pt-1">
      <div>
        <p className="text-[11px] uppercase tracking-[0.28em] text-[#d4af37]">Guest</p>
        <h2 className="mt-1 text-lg font-black text-white">{title}</h2>
      </div>
      <Link to={to} className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs font-bold text-gray-200">
        詳細
        <ArrowRight size={14} />
      </Link>
    </div>
  );
}

function EmptyLine({ icon: Icon, text }: { icon: LucideIcon; text: string }) {
  return (
    <div className="flex items-center gap-3 rounded-3xl border border-white/10 bg-white/[0.03] p-4 text-sm text-gray-500">
      <Icon size={18} className="text-[#d4af37]" />
      {text}
    </div>
  );
}
