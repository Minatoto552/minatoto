import React from 'react';
import { Link } from 'react-router-dom';
import {
  AlertTriangle,
  ArrowRight,
  BellRing,
  BookOpen,
  CalendarDays,
  Crown,
  LayoutGrid,
  Radio,
  RefreshCw,
  Settings,
  Shield,
  ShoppingBag,
  Sparkles,
  Star,
  Ticket,
  UserRound,
  Users,
  Wine,
  type LucideIcon,
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { useVrcBarApp, type EventStatus } from '../../lib/VrcBarAppContext';
import { getRotationLabel, type TablePlacementSummary, type UnifiedPlacement, usePlacements } from '../../hooks/usePlacements';
import { ProfileAvatar } from '../../components/ui/ProfileAvatar';

const EVENT_STATUS_LABELS: Record<EventStatus, string> = {
  before_open: '営業前',
  rotation_1: '第1ローテ',
  rotation_2: '第2ローテ',
  rotation_3: '第3ローテ',
  rotation_4: '第4ローテ',
  closed: '営業終了',
};

const ROLE_LABELS = {
  admin: '管理者',
  staff: 'スタッフ',
  cast: 'キャスト',
  customer: 'お客様',
  pending: '承認待ち',
};

export function RoleDashboardPage() {
  const { currentUser } = useVrcBarApp();

  if (currentUser?.role === 'admin') return <AdminHome />;
  if (currentUser?.role === 'staff') return <StaffHome />;
  if (currentUser?.role === 'cast') return <CastHome />;

  return (
    <div className="iphone-card p-6 text-center">
      <Wine className="mx-auto mb-4 text-[#d4af37]" size={36} />
      <h2 className="text-xl font-bold text-white">ホームを準備中です</h2>
      <p className="mt-2 text-sm text-gray-400">ログイン状態を確認しています。</p>
    </div>
  );
}

function AdminHome() {
  const {
    orders,
    emergencyCalls,
    eventStatus,
    currentRotationNumber,
    announcements,
    attendanceRequests,
    shiftRequests,
  } = useVrcBarApp();
  const { activeRotation, currentCastPlacements, currentStaffPlacements, tableSummaries } = usePlacements();

  const pendingOrders = orders.filter(order => !order.isDeleted && order.status === 'pending');
  const processingOrders = orders.filter(order => !order.isDeleted && order.status === 'processing');
  const activeEmergency = emergencyCalls.filter(call => call.status === 'active');
  const activeAnnouncements = announcements.filter(announcement => announcement.isActive);
  const workingToday = attendanceRequests.filter(request => request.status === 'present' || request.status === 'late');
  const openShifts = shiftRequests.filter(shift => shift.status === 'open' && !shift.isDeleted);

  return (
    <div className="app-home-space">
      <HeroPanel
        eyebrow="Admin Control"
        title="店舗全体ダッシュボード"
        description="配置、注文、緊急ヘルプ、営業状態をホームで一括確認できます。"
        icon={Crown}
        accent="gold"
        stats={[
          { label: '現在', value: getRotationLabel(currentRotationNumber), tone: 'gold' },
          { label: '営業状態', value: EVENT_STATUS_LABELS[eventStatus], tone: eventStatus === 'closed' ? 'muted' : 'green' },
          { label: '未対応', value: `${pendingOrders.length}件`, tone: pendingOrders.length ? 'red' : 'muted' },
        ]}
      />

      <div className="grid grid-cols-2 gap-3">
        <MetricCard icon={ShoppingBag} label="注文対応" value={`${pendingOrders.length + processingOrders.length}`} hint="未対応 / 対応中" tone={pendingOrders.length ? 'red' : 'gold'} />
        <MetricCard icon={AlertTriangle} label="緊急ヘルプ" value={`${activeEmergency.length}`} hint="全卓通知" tone={activeEmergency.length ? 'red' : 'green'} />
        <MetricCard icon={CalendarDays} label="本日の出勤" value={`${workingToday.length}`} hint="提出済み" tone="blue" />
        <MetricCard icon={BellRing} label="お知らせ" value={`${activeAnnouncements.length}`} hint={`募集中シフト ${openShifts.length}`} tone="purple" />
      </div>

      <SectionHeader title="全員の配置" actionLabel="配置一覧" to="/app/placement" />
      <PlacementOverview
        tableSummaries={tableSummaries}
        staffPlacements={currentStaffPlacements}
        emptyMessage={`${getRotationLabel(activeRotation)} の配置はまだ登録されていません。`}
        emphasizeAll
      />

      <SectionHeader title="管理ショートカット" />
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <ShortcutCard to="/app/admin" icon={Shield} title="管理メニュー" description="権限・履歴・抽選" />
        <ShortcutCard to="/app/admin" icon={RefreshCw} title="ローテ変更" description="営業状態を変更" />
        <ShortcutCard to="/app/admin" icon={LayoutGrid} title="配置編集" description="キャスト/スタッフ" />
        <ShortcutCard to="/app/order" icon={ShoppingBag} title="注文登録" description="卓番号から登録" />
        <ShortcutCard to="/app/admin" icon={CalendarDays} title="シフト管理" description="出勤と公開" />
        <ShortcutCard to="/app/admin" icon={Ticket} title="抽選/ポイント" description="会員施策" />
      </div>
    </div>
  );
}

function StaffHome() {
  const { currentUser, orders, emergencyCalls, eventStatus, currentRotationNumber } = useVrcBarApp();
  const {
    currentCastPlacements,
    currentStaffPlacements,
    tableSummaries,
    getUserCurrentPlacements,
  } = usePlacements();

  const myPlacements = currentUser ? getUserCurrentPlacements(currentUser.id) : [];
  const myStaffPlacement = currentStaffPlacements.find(placement => placement.userId === currentUser?.id);
  const pendingOrders = orders.filter(order => !order.isDeleted && order.status === 'pending');
  const processingOrders = orders.filter(order => !order.isDeleted && order.status === 'processing');
  const activeEmergency = emergencyCalls.filter(call => call.status === 'active');

  return (
    <div className="app-home-space">
      <HeroPanel
        eyebrow="Staff Station"
        title="スタッフ配置ホーム"
        description="誰がどこを見るか、今すぐ対応すべき注文とヘルプをまとめています。"
        icon={Radio}
        accent={activeEmergency.length ? 'red' : 'blue'}
        stats={[
          { label: '現在', value: getRotationLabel(currentRotationNumber), tone: 'gold' },
          { label: '自分の担当', value: myStaffPlacement?.area || myPlacements[0]?.area || '未割当', tone: myStaffPlacement ? 'green' : 'muted' },
          { label: '営業状態', value: EVENT_STATUS_LABELS[eventStatus], tone: 'blue' },
        ]}
      />

      <div className="grid grid-cols-2 gap-3">
        <MetricCard icon={ShoppingBag} label="未対応注文" value={`${pendingOrders.length}`} hint={`対応中 ${processingOrders.length}`} tone={pendingOrders.length ? 'red' : 'gold'} to="/app/staff" />
        <MetricCard icon={AlertTriangle} label="緊急ヘルプ" value={`${activeEmergency.length}`} hint="確認して対応" tone={activeEmergency.length ? 'red' : 'green'} />
      </div>

      <SectionHeader title="自分の担当配置" />
      <div className="iphone-card p-4">
        {myStaffPlacement ? (
          <PlacementPerson placement={myStaffPlacement} large />
        ) : (
          <EmptyState icon={UserRound} title="担当は未割当です" body="管理者がスタッフ配置を保存するとここに表示されます。" />
        )}
      </div>

      <SectionHeader title="スタッフ全体の配置" />
      <div className="space-y-3">
        {currentStaffPlacements.length === 0 ? (
          <EmptyState icon={Users} title="スタッフ配置なし" body="まだ登録されていません。" />
        ) : (
          currentStaffPlacements.map(placement => (
            <div key={placement.id} className={cn('iphone-card p-4', placement.userId === currentUser?.id && 'ring-1 ring-[#d4af37]/60')}>
              <PlacementPerson placement={placement} />
            </div>
          ))
        )}
      </div>

      <SectionHeader title="キャスト配置" actionLabel="配置一覧" to="/app/placement" />
      <PlacementOverview
        tableSummaries={tableSummaries}
        staffPlacements={[]}
        emptyMessage="現在のキャスト配置は未登録です。"
        compact
      />

      <div className="grid grid-cols-2 gap-3">
        <ShortcutCard to="/app/order" icon={ShoppingBag} title="注文登録" description="聞いた注文を登録" />
        <ShortcutCard to="/app/recipes" icon={BookOpen} title="レシピ確認" description="提供前に確認" />
      </div>
    </div>
  );
}

function CastHome() {
  const { currentUser, currentRotationNumber, eventStatus, announcements } = useVrcBarApp();
  const { getUserCurrentPlacements, tableSummaries, currentStaffPlacements } = usePlacements();
  const myPlacements = currentUser ? getUserCurrentPlacements(currentUser.id) : [];
  const mainPlacement = myPlacements.find(placement => placement.positionType === 'cast') || myPlacements[0];
  const sameTable = mainPlacement
    ? tableSummaries.find(summary => summary.tableNumber === mainPlacement.tableNumber)
    : undefined;
  const activeAnnouncements = announcements.filter(announcement => announcement.isActive);

  return (
    <div className="app-home-space">
      <HeroPanel
        eyebrow="Cast Focus"
        title="自分の担当と現在ローテ"
        description="担当卓、同卓キャスト、スタッフ担当をすぐ確認できます。"
        icon={Sparkles}
        accent="gold"
        stats={[
          { label: '現在', value: getRotationLabel(currentRotationNumber), tone: 'gold' },
          { label: '担当卓', value: mainPlacement?.tableNumber || '未割当', tone: mainPlacement ? 'green' : 'muted' },
          { label: '営業状態', value: EVENT_STATUS_LABELS[eventStatus], tone: 'blue' },
        ]}
      />

      <SectionHeader title="自分の配置" />
      <div className="iphone-card p-4">
        {mainPlacement ? (
          <PlacementPerson placement={mainPlacement} large />
        ) : (
          <EmptyState icon={Star} title="現在の担当は未割当です" body="配置が公開されると、担当卓がここに表示されます。" />
        )}
      </div>

      {sameTable && (
        <>
          <SectionHeader title={`${sameTable.tableNumber}卓のメンバー`} actionLabel="配置一覧" to="/app/placement" />
          <div className="iphone-card p-4 space-y-3">
            {sameTable.castPlacements.length === 0 ? (
              <EmptyState icon={Users} title="同卓キャストなし" body="この卓の配置はまだ登録されていません。" />
            ) : (
              sameTable.castPlacements.map(placement => (
                <PlacementPerson key={placement.id} placement={placement} muted={placement.userId !== currentUser?.id} />
              ))
            )}
          </div>
        </>
      )}

      <SectionHeader title="スタッフ担当" />
      <div className="space-y-3">
        {currentStaffPlacements.slice(0, 4).map(placement => (
          <div key={placement.id} className="iphone-card p-4">
            <PlacementPerson placement={placement} />
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <ShortcutCard to="/app/order" icon={ShoppingBag} title="注文登録" description="キャストも登録可能" />
        <ShortcutCard to="/app/recipes" icon={BookOpen} title="レシピ確認" description="提供内容を見る" />
        <ShortcutCard to="/app/attendance" icon={CalendarDays} title="シフト" description="提出・確認" />
      </div>

      {activeAnnouncements.length > 0 && (
        <>
          <SectionHeader title="お知らせ" />
          <div className="space-y-3">
            {activeAnnouncements.slice(0, 2).map(announcement => (
              <div key={announcement.id} className="iphone-card p-4">
                <p className="text-sm font-bold text-white">{announcement.title}</p>
                <p className="mt-1 text-xs text-gray-400 line-clamp-2">{announcement.body}</p>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function PlacementOverview({
  tableSummaries,
  staffPlacements,
  emptyMessage,
  compact,
  emphasizeAll,
}: {
  tableSummaries: TablePlacementSummary[];
  staffPlacements: UnifiedPlacement[];
  emptyMessage: string;
  compact?: boolean;
  emphasizeAll?: boolean;
}) {
  const activeTables = tableSummaries.filter(summary => summary.castPlacements.length > 0 || summary.staffPlacements.length > 0);
  const visibleTables = compact ? activeTables.slice(0, 6) : tableSummaries;

  return (
    <div className="space-y-3">
      {visibleTables.length === 0 ? (
        <EmptyState icon={LayoutGrid} title="配置なし" body={emptyMessage} />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {visibleTables.map(summary => (
            <TablePlacementCard key={summary.tableNumber} summary={summary} emphasize={emphasizeAll || summary.isCurrentUserTable} />
          ))}
        </div>
      )}

      {staffPlacements.length > 0 && (
        <div className="iphone-card p-4 space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-bold text-white">スタッフ配置</p>
            <span className="status-pill">{staffPlacements.length}名</span>
          </div>
          <div className="space-y-3">
            {staffPlacements.map(placement => (
              <PlacementPerson key={placement.id} placement={placement} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function TablePlacementCard({ summary, emphasize }: { summary: TablePlacementSummary; emphasize?: boolean }) {
  const hasPlacement = summary.castPlacements.length > 0 || summary.staffPlacements.length > 0;

  return (
    <div
      className={cn(
        'iphone-card p-4 min-h-[152px]',
        emphasize && 'ring-1 ring-[#d4af37]/70 shadow-[0_0_32px_rgba(212,175,55,0.18)]',
        !hasPlacement && 'opacity-70',
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[11px] uppercase tracking-[0.22em] text-gray-500">Table</p>
          <p className="text-3xl font-black text-white leading-tight">{summary.tableNumber}</p>
        </div>
        <span className={cn('status-pill', hasPlacement ? 'status-pill-gold' : 'status-pill-muted')}>
          {hasPlacement ? '配置あり' : '未配置'}
        </span>
      </div>

      <div className="mt-4 space-y-2">
        {summary.castPlacements.length > 0 ? (
          summary.castPlacements.map(placement => (
            <PlacementPerson key={placement.id} placement={placement} compact />
          ))
        ) : (
          <p className="text-xs text-gray-500">キャスト未配置</p>
        )}
        {summary.staffPlacements.map(placement => (
          <PlacementPerson key={placement.id} placement={placement} compact />
        ))}
      </div>
    </div>
  );
}

function PlacementPerson({
  placement,
  compact,
  large,
  muted,
}: {
  placement: UnifiedPlacement;
  compact?: boolean;
  large?: boolean;
  muted?: boolean;
}) {
  const isStaff = placement.positionType === 'staff';

  return (
    <div className={cn('flex items-center gap-3 min-w-0', muted && 'opacity-65')}>
      <div className={cn(
        'rounded-2xl border flex items-center justify-center overflow-hidden shrink-0',
        large ? 'w-14 h-14' : 'w-10 h-10',
        isStaff ? 'border-sky-300/40 bg-sky-400/10' : 'border-[#d4af37]/45 bg-[#d4af37]/10',
      )}>
        <ProfileAvatar
          src={placement.iconUrl}
          name={placement.displayName}
          version={placement.profileImageUpdatedAt}
          className="h-full w-full"
          fallbackClassName={cn('font-black', isStaff ? 'text-sky-200' : 'text-[#d4af37]')}
        />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2 min-w-0">
          <p className={cn('font-bold text-white truncate', large ? 'text-base' : 'text-sm')}>{placement.displayName}</p>
          <span className={cn('status-pill shrink-0', isStaff ? 'status-pill-blue' : 'status-pill-gold')}>
            {isStaff ? 'STAFF' : 'CAST'}
          </span>
        </div>
        {!compact && (
          <p className="mt-1 text-xs text-gray-400 truncate">
            {placement.tableNumber} / {placement.area}
          </p>
        )}
        {compact && (
          <p className="text-[11px] text-gray-500 truncate">
            {placement.area}
          </p>
        )}
      </div>
      {!compact && (
        <span className="text-[11px] text-gray-500">{ROLE_LABELS[placement.role]}</span>
      )}
    </div>
  );
}

function HeroPanel({
  eyebrow,
  title,
  description,
  icon: Icon,
  stats,
  accent,
}: {
  eyebrow: string;
  title: string;
  description: string;
  icon: LucideIcon;
  stats: { label: string; value: string; tone?: 'gold' | 'red' | 'green' | 'blue' | 'purple' | 'muted' }[];
  accent: 'gold' | 'red' | 'blue';
}) {
  return (
    <section className={cn('iphone-card relative overflow-hidden p-5 sm:p-6', `home-hero-${accent}`)}>
      <div className="relative z-10">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[11px] uppercase tracking-[0.28em] text-[#d4af37]">{eyebrow}</p>
            <h1 className="mt-2 text-2xl sm:text-3xl font-black text-white tracking-wide">{title}</h1>
            <p className="mt-2 max-w-xl text-sm leading-6 text-gray-300">{description}</p>
          </div>
          <div className="home-hero-icon">
            <Icon size={26} />
          </div>
        </div>

        <div className="mt-5 grid grid-cols-3 gap-2">
          {stats.map(stat => (
            <div key={stat.label} className="rounded-2xl bg-white/[0.06] border border-white/10 p-3">
              <p className="text-[10px] text-gray-500 tracking-widest">{stat.label}</p>
              <p className={cn('mt-1 text-sm font-black truncate', toneClass(stat.tone))}>{stat.value}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function MetricCard({
  icon: Icon,
  label,
  value,
  hint,
  tone,
  to,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  hint: string;
  tone: 'gold' | 'red' | 'green' | 'blue' | 'purple';
  to?: string;
}) {
  const content = (
    <div className={cn('iphone-card p-4 min-h-[128px] flex flex-col justify-between', tone === 'red' && 'neon-alert')}>
      <div className="flex items-center justify-between">
        <div className={cn('metric-icon', `metric-icon-${tone}`)}>
          <Icon size={18} />
        </div>
        {to && <ArrowRight size={16} className="text-gray-500" />}
      </div>
      <div>
        <p className="text-[11px] text-gray-500 tracking-widest">{label}</p>
        <p className={cn('mt-1 text-3xl font-black', toneClass(tone))}>{value}</p>
        <p className="mt-1 text-xs text-gray-400">{hint}</p>
      </div>
    </div>
  );

  if (to) return <Link to={to}>{content}</Link>;
  return content;
}

function ShortcutCard({
  to,
  icon: Icon,
  title,
  description,
}: {
  to: string;
  icon: LucideIcon;
  title: string;
  description: string;
}) {
  return (
    <Link to={to} className="iphone-card p-4 min-h-[126px] flex flex-col justify-between active:scale-[0.98] transition">
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

function SectionHeader({ title, actionLabel, to }: { title: string; actionLabel?: string; to?: string }) {
  return (
    <div className="flex items-center justify-between gap-3 pt-2">
      <div>
        <p className="text-[11px] uppercase tracking-[0.28em] text-[#d4af37]">Section</p>
        <h2 className="mt-1 text-lg font-black text-white">{title}</h2>
      </div>
      {to && actionLabel && (
        <Link to={to} className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs font-bold text-gray-200">
          {actionLabel}
          <ArrowRight size={14} />
        </Link>
      )}
    </div>
  );
}

function EmptyState({ icon: Icon, title, body }: { icon: LucideIcon; title: string; body: string }) {
  return (
    <div className="iphone-card p-6 text-center">
      <Icon className="mx-auto text-gray-500" size={28} />
      <p className="mt-3 text-sm font-bold text-white">{title}</p>
      <p className="mt-1 text-xs text-gray-500">{body}</p>
    </div>
  );
}

function toneClass(tone: 'gold' | 'red' | 'green' | 'blue' | 'purple' | 'muted' = 'gold') {
  return {
    gold: 'text-[#d4af37]',
    red: 'text-red-300',
    green: 'text-emerald-300',
    blue: 'text-sky-300',
    purple: 'text-fuchsia-300',
    muted: 'text-gray-300',
  }[tone];
}
