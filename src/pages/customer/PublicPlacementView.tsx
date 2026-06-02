import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Edit3, LayoutGrid, ListFilter, MapPin, RefreshCw, Shield, Users } from 'lucide-react';
import { cn } from '../../lib/utils';
import { TABLES, type RotationNumber, useMockApp } from '../../lib/MockAppContext';
import { getRotationLabel, usePlacements, type UnifiedPlacement } from '../../hooks/usePlacements';

const ROTATIONS: RotationNumber[] = [0, 1, 2, 3, 4];

export function PublicPlacementView() {
  const { currentUser, currentRotationNumber, eventStatus } = useMockApp();
  const [selectedRotation, setSelectedRotation] = useState<RotationNumber>(currentRotationNumber ?? 0);
  const [viewMode, setViewMode] = useState<'table' | 'role'>('table');
  const {
    tableSummaries,
    currentCastPlacements,
    currentStaffPlacements,
    staffUsers,
    castUsers,
  } = usePlacements(selectedRotation);

  const canEdit = currentUser?.role === 'admin';
  const activeCount = currentCastPlacements.length + currentStaffPlacements.filter(p => p.status === 'active').length;

  return (
    <div className="app-home-space animate-in fade-in duration-300">
      <section className="iphone-card p-5 relative overflow-hidden">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#d4af37]/70 to-transparent" />
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[11px] uppercase tracking-[0.3em] text-[#d4af37]">Placement Board</p>
            <h1 className="mt-2 text-2xl font-black text-white">配置一覧</h1>
            <p className="mt-2 text-sm leading-6 text-gray-400">
              キャスト配置とスタッフ配置を同じ画面で確認できます。
            </p>
          </div>
          <div className="metric-icon metric-icon-gold">
            <LayoutGrid size={20} />
          </div>
        </div>

        <div className="mt-5 grid grid-cols-3 gap-2">
          <BoardStat label="表示中" value={getRotationLabel(selectedRotation)} />
          <BoardStat label="営業状態" value={eventStatus === 'closed' ? '営業終了' : 'Live'} tone={eventStatus === 'closed' ? 'muted' : 'green'} />
          <BoardStat label="担当者" value={`${activeCount}名`} tone="gold" />
        </div>
      </section>

      <div className="flex gap-2 overflow-x-auto scrollbar-none">
        {ROTATIONS.map(rotation => (
          <button
            key={rotation}
            type="button"
            onClick={() => setSelectedRotation(rotation)}
            className={cn(
              'min-h-[44px] shrink-0 rounded-2xl border px-4 text-sm font-bold transition',
              selectedRotation === rotation
                ? 'border-[#d4af37] bg-[#d4af37]/20 text-[#f8e7a2] shadow-[0_0_24px_rgba(212,175,55,0.16)]'
                : 'border-white/10 bg-white/[0.04] text-gray-400',
            )}
          >
            {getRotationLabel(rotation)}
          </button>
        ))}
      </div>

      <div className="iphone-card p-2">
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => setViewMode('table')}
            className={cn('mobile-segment', viewMode === 'table' && 'mobile-segment-active')}
          >
            <MapPin size={16} />
            テーブル別
          </button>
          <button
            type="button"
            onClick={() => setViewMode('role')}
            className={cn('mobile-segment', viewMode === 'role' && 'mobile-segment-active')}
          >
            <ListFilter size={16} />
            役割別
          </button>
        </div>
      </div>

      {canEdit && (
        <div className="grid grid-cols-2 gap-3">
          <Link to="/app/admin" className="iphone-card p-4 flex items-center gap-3">
            <div className="metric-icon metric-icon-gold"><Edit3 size={18} /></div>
            <div>
              <p className="text-sm font-bold text-white">配置編集</p>
              <p className="text-xs text-gray-500">管理メニューから変更</p>
            </div>
          </Link>
          <Link to="/app/admin" className="iphone-card p-4 flex items-center gap-3">
            <div className="metric-icon metric-icon-blue"><RefreshCw size={18} /></div>
            <div>
              <p className="text-sm font-bold text-white">ローテ変更</p>
              <p className="text-xs text-gray-500">営業状態を反映</p>
            </div>
          </Link>
        </div>
      )}

      {viewMode === 'table' ? (
        <section className="space-y-3">
          <SectionTitle title="テーブル別配置" count={TABLES.length} />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {tableSummaries.map(summary => (
              <div
                key={summary.tableNumber}
                className={cn(
                  'iphone-card p-4 min-h-[168px]',
                  summary.isCurrentUserTable && 'ring-1 ring-[#d4af37]/70',
                )}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.26em] text-gray-500">Table</p>
                    <p className="text-4xl font-black text-white">{summary.tableNumber}</p>
                  </div>
                  <span className={cn('status-pill', summary.castPlacements.length ? 'status-pill-gold' : 'status-pill-muted')}>
                    {summary.castPlacements.length ? `${summary.castPlacements.length}名` : '空席'}
                  </span>
                </div>

                <div className="mt-4 space-y-3">
                  <PlacementGroup title="キャスト" placements={summary.castPlacements} empty="キャスト未配置" />
                  <PlacementGroup title="スタッフ" placements={summary.staffPlacements} empty="スタッフ卓指定なし" />
                </div>
              </div>
            ))}
          </div>
        </section>
      ) : (
        <section className="space-y-4">
          <SectionTitle title="役割別配置" count={currentCastPlacements.length + currentStaffPlacements.length} />
          <RoleSection title="キャスト配置" placements={currentCastPlacements} fallbackCount={castUsers.length} empty="キャスト配置はまだ登録されていません。" />
          <RoleSection title="スタッフ配置" placements={currentStaffPlacements} fallbackCount={staffUsers.length} empty="スタッフ配置はまだ登録されていません。" />
        </section>
      )}

      {!canEdit && (
        <div className="iphone-card p-4 flex items-center gap-3 text-sm text-gray-400">
          <Shield size={18} className="text-[#d4af37]" />
          配置編集は管理者のみ可能です。スタッフ・キャストは閲覧専用です。
        </div>
      )}
    </div>
  );
}

function BoardStat({ label, value, tone = 'gold' }: { label: string; value: string; tone?: 'gold' | 'green' | 'muted' }) {
  return (
    <div className="rounded-2xl bg-white/[0.06] border border-white/10 p-3">
      <p className="text-[10px] text-gray-500 tracking-widest">{label}</p>
      <p className={cn('mt-1 text-sm font-black truncate', tone === 'green' ? 'text-emerald-300' : tone === 'muted' ? 'text-gray-300' : 'text-[#d4af37]')}>
        {value}
      </p>
    </div>
  );
}

function SectionTitle({ title, count }: { title: string; count: number }) {
  return (
    <div className="flex items-end justify-between gap-3">
      <div>
        <p className="text-[11px] uppercase tracking-[0.28em] text-[#d4af37]">Live Board</p>
        <h2 className="mt-1 text-lg font-black text-white">{title}</h2>
      </div>
      <span className="status-pill">{count}</span>
    </div>
  );
}

function PlacementGroup({ title, placements, empty }: { title: string; placements: UnifiedPlacement[]; empty: string }) {
  return (
    <div>
      <p className="mb-2 text-[11px] font-bold tracking-[0.18em] text-gray-500">{title}</p>
      {placements.length === 0 ? (
        <p className="text-xs text-gray-600">{empty}</p>
      ) : (
        <div className="space-y-2">
          {placements.map(placement => <PlacementRow key={placement.id} placement={placement} compact />)}
        </div>
      )}
    </div>
  );
}

function RoleSection({
  title,
  placements,
  fallbackCount,
  empty,
}: {
  title: string;
  placements: UnifiedPlacement[];
  fallbackCount: number;
  empty: string;
}) {
  return (
    <div className="iphone-card p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users size={18} className="text-[#d4af37]" />
          <p className="text-sm font-bold text-white">{title}</p>
        </div>
        <span className="status-pill">{placements.length}/{fallbackCount}</span>
      </div>
      {placements.length === 0 ? (
        <p className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-center text-xs text-gray-500">{empty}</p>
      ) : (
        <div className="space-y-3">
          {placements.map(placement => <PlacementRow key={placement.id} placement={placement} />)}
        </div>
      )}
    </div>
  );
}

function PlacementRow({ placement, compact }: { placement: UnifiedPlacement; compact?: boolean }) {
  return (
    <div className="flex items-center gap-3 min-w-0">
      <div className={cn(
        'w-10 h-10 rounded-2xl border flex items-center justify-center overflow-hidden shrink-0',
        placement.positionType === 'staff' ? 'border-sky-300/40 bg-sky-400/10' : 'border-[#d4af37]/40 bg-[#d4af37]/10',
      )}>
        {placement.iconUrl ? (
          <img src={placement.iconUrl} alt="" className="w-full h-full object-cover" />
        ) : (
          <span className="text-sm font-black text-white">{placement.displayName.slice(0, 1)}</span>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="truncate text-sm font-bold text-white">{placement.displayName}</p>
          <span className={cn('status-pill shrink-0', placement.positionType === 'staff' ? 'status-pill-blue' : 'status-pill-gold')}>
            {placement.positionType === 'staff' ? 'STAFF' : 'CAST'}
          </span>
        </div>
        <p className="mt-0.5 truncate text-xs text-gray-500">
          {placement.tableNumber} / {placement.area}
        </p>
      </div>
      {!compact && (
        <span className="text-xs font-bold text-[#d4af37]">{placement.rotationLabel}</span>
      )}
    </div>
  );
}
